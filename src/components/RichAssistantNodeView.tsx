/**
 * The assistant-step keyed renderer: a high-fidelity replica of ui-chat's
 * AssistantNodeView + AssistantMarkdown that swaps one thing only — settled
 * text blocks go through RichMarkdownText (native MarkdownText while
 * streaming, rule-upgraded segments once settled).
 *
 * Everything else mirrors the shipped behavior: block-kind split, groupPart
 * filtering, hasVisible shell skip, interrupted stopped marker, reasoning
 * disclosure with turn-process folding, image galleries through the seat's
 * renderer, and unknown blocks as JSON cards. Diff upstream when upgrading
 * dsh: AssistantNodeView.tsx, AssistantMarkdown.tsx in
 * packages/client/ui-chat/src/client/chat/.
 */

import { Fragment, memo, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { JsonBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import { ReasoningRow } from './ReasoningRow.tsx'
import { RichMarkdownText } from './RichMarkdownText.tsx'
import { sendChoice } from '../choice-send.ts'
import { markdownLabels } from '../markdown-fallback.ts'
import { useSearchableHidden } from '../use-searchable-hidden.ts'
import type { RichAssistantNodeViewProps } from '../chat-contract.ts'

const NOOP = (): void => {}

/** Streaming, settled, and interrupted Assistant states share one renderer. */
export const RichAssistantNodeView = memo(function RichAssistantNodeView({
  sessionId, node, groupPart, useDisclosure, useTurnData, turnProcess, openFile, renderMessageImages, fileMentions, t,
}: RichAssistantNodeViewProps) {
  const data = node.data
  const turn = node.location.kind === 'turn' || node.location.kind === 'step'
    ? node.location.turn
    : undefined
  const tail = useTurnData('turn-tail')
  const owner = useMemo(() => {
    if (turn?.status !== 'closed' || data.finalNode === undefined) return undefined
    if (tail?.closing?.finalNode.seq !== data.finalNode.seq) return undefined
    return { turn, seq: data.finalNode.seq, openFile }
  }, [data.finalNode, openFile, tail, turn])
  const mentions = useMemo(
    () => owner === undefined ? undefined : fileMentions(owner),
    [fileMentions, owner],
  )
  const reasoningHidden = turnProcess !== undefined
    && turnProcess.foldable
    && turnProcess.spec.answerStep === data.step
    && turnProcess.spec.inlineReasoning
    && !turnProcess.open
  const revealProcess = useCallback(() => { turnProcess?.setOpen(true) }, [turnProcess])

  // Stable per locale revision (t identity changes on switch): a fresh object
  // per render would rebuild MarkdownText's component table every chunk.
  const labels = useMemo(() => markdownLabels(t), [t])
  const chrome = useMemo(() => ({
    table: t('viewTable'),
    chart: t('viewChart'),
    downloadChart: t('downloadChart'),
    otherSlice: t('otherSlice'),
    checklistTitle: t('checklistTitle'),
    checklistProgress: t('checklistProgress'),
    mplCode: t('mplCode'),
    mplChart: t('mplChart'),
    mplDownload: t('mplDownload'),
    mplRunning: t('mplRunning'),
    mplFailed: t('mplFailed'),
    mplDownloadPng: t('mplDownloadPng'),
    copy: t('copy'),
    copied: t('copied'),
    copyFailed: t('copyFailed'),
    imagePreviewFailed: t('imagePreviewFailed'),
    calloutTitles: {
      note: t('calloutNote'),
      tip: t('calloutTip'),
      important: t('calloutImportant'),
      warning: t('calloutWarning'),
      caution: t('calloutCaution'),
    },
    choicesSend: t('choicesSend'),
    choicesSending: t('choicesSending'),
    choicesSent: t('choicesSent'),
    choicesSendFailed: t('choicesSendFailed'),
    choicesAnswerPrefix: t('choicesAnswerPrefix'),
  }), [t])
  // A fence commits its selection through the Session the seat supplies; a
  // renderer without one (no Session seat) keeps the choice preview-only.
  const choiceSend = useMemo(
    () => sessionId === undefined ? undefined : (text: string) => sendChoice(sessionId, text),
    [sessionId],
  )
  const streaming = data.status === 'running'
  const interrupted = data.status === 'interrupted'
  const last = data.blocks.length - 1
  // Tool-call heads render as tool rows in the chat view's grouping pass, so
  // a node that is only those heads (or empty) would paint an empty shell —
  // skip the shell unless something visible remains.
  const hasVisible = streaming
    || interrupted
    || data.blocks.some(block => block.kind !== 'tool-call')
  if (!hasVisible) return null
  const rendered: ReactNode[] = []
  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i]
    if (block === undefined) continue
    if (groupPart === 'reasoning' && block.kind !== 'reasoning') continue
    if (groupPart === 'response' && block.kind === 'reasoning') continue
    switch (block.kind) {
      case 'text':
        rendered.push(
          <RichMarkdownText
            key={i}
            text={block.text}
            streaming={streaming}
            labels={labels}
            mentions={mentions}
            chrome={chrome}
            choiceSend={choiceSend}
          />,
        )
        break
      case 'reasoning':
        rendered.push(
          <ProcessReasoning
            key={i}
            hidden={reasoningHidden}
            reveal={revealProcess}
          >
            <ReasoningRow text={block.text} running={streaming && i === last} useDisclosure={useDisclosure} t={t} />
          </ProcessReasoning>,
        )
        break
      case 'image': {
        // Consecutive image blocks share one gallery; keyed by the group's
        // FIRST block index so a streaming append only grows the group.
        const start = i
        const group = [block]
        while (i + 1 < data.blocks.length) {
          const next = data.blocks[i + 1]
          if (next === undefined || next.kind !== 'image') break
          group.push(next)
          i += 1
        }
        rendered.push(
          <Fragment key={start}>
            {renderMessageImages({
              images: group.map(({ attachment }) => ({ attachment })),
              align: 'start',
            })}
          </Fragment>,
        )
        break
      }
      // Grouped into tool rows by ChatView; hasVisible above skips an empty shell.
      case 'tool-call':
        break
      default:
        rendered.push(
          <JsonBlock
            key={i}
            label={t('unknownBlock')}
            payload={block.block}
            truncatedLabel={total => t('truncated', { total })}
          />,
        )
  }
  }
  return (
    <div className="dshr-flow-root" data-streaming={streaming || undefined}>
      <div className="dshr-flow-body">
        {rendered}
        {interrupted && (groupPart === undefined || groupPart === 'response'
          || !data.blocks.some(block => block.kind !== 'reasoning' && block.kind !== 'tool-call'))
          && <span className="dshr-stopped">{t('stopped')}</span>}
      </div>
    </div>
  )
})

function ProcessReasoning({ hidden, reveal, children }: {
  hidden: boolean
  reveal?: ((() => void) | undefined)
  children: ReactNode
}) {
  const ref = useSearchableHidden(hidden, reveal ?? NOOP)
  return <div ref={ref} data-turn-process-inline={hidden || undefined}>{children}</div>
}
