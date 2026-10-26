/**
 * Assistant reasoning disclosure, replica of ui-chat's ReasoningRow over the
 * public primitives (DisclosureRow, MarkdownText, the think icon). One
 * deliberate deviation from upstream: the live presentation policy
 * (settledReasoningPreview) is not reachable from a third-party registration,
 * so a collapsed row always keeps its summary preview instead of gating it
 * on the work-details mode.
 */

import { memo, useMemo } from 'react'
import { DisclosureRow, IconThinkOutlineRegular, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import { markdownLabels, pathImages } from '../markdown-fallback.ts'
import type { DisclosureState, Translate } from '../chat-contract.ts'

const THINK_ICON = <IconThinkOutlineRegular size={14} />

function firstLine(text: string): string {
  const newline = text.indexOf('\n')
  return newline === -1 ? text : text.slice(0, newline)
}

function latestCompletedParagraphFirstLine(text: string): string {
  let summary = ''
  let paragraphStart = 0
  const separator = /\r?\n(?:[\t ]*\r?\n)+/g
  while (true) {
    const nextParagraph = separator.exec(text)
    const paragraphEnd = nextParagraph === null ? text.length
      : nextParagraph.index + nextParagraph[0].indexOf('\n')
    const newline = text.indexOf('\n', paragraphStart)
    if (newline !== -1 && newline <= paragraphEnd) {
      const candidate = text.slice(paragraphStart, newline).trim()
      if (candidate !== '') summary = candidate
    }
    if (nextParagraph === null) return summary
    paragraphStart = nextParagraph.index + nextParagraph[0].length
  }
}

export interface ReasoningRowProps {
  readonly text: string
  readonly running: boolean
  readonly useDisclosure: () => DisclosureState
  readonly t: Translate
}

/** Render one assistant reasoning block collapsed until the reader opens it. */
export const ReasoningRow = memo(function ReasoningRow({ text, running, useDisclosure, t }: ReasoningRowProps) {
  const { expanded, toggle } = useDisclosure()
  const labels = useMemo(() => markdownLabels(t), [t])
  const summaryText = running ? latestCompletedParagraphFirstLine(text) : firstLine(text)
  const summary = useMemo(() => summaryText.replaceAll('**', ''), [summaryText])
  // Deviation from upstream: no presentation policy is available, so every
  // collapsed row with a summary keeps its preview (upstream shows it while
  // running and after settle only under settledReasoningPreview).
  const preview = !expanded && summary !== ''
  const collapsedContent = useMemo(() => (
    <>
      <span className="dshr-think-separator" aria-hidden />
      <span className="dshr-think-summary" data-streaming={running || undefined}>
        <span className="dshr-think-summary-text">{summary}</span>
      </span>
    </>
  ), [running, summary])
  const content = useMemo(() => expanded ? (
    <div className="dshr-think-body">
      <MarkdownText text={text} streaming={running} labels={labels} pathImages={pathImages} variant="compact" />
    </div>
  ) : undefined, [expanded, labels, running, text])

  return (
    <div
      className="dshr-think-root"
      data-variant="think"
      data-state={running ? 'running' : 'ok'}
      data-expanded={expanded || undefined}
      data-preview={preview || undefined}
    >
      {running && <span className="dshr-visually-hidden">{t('running')}</span>}
      <DisclosureRow
        rowClassName="dshr-think-row"
        leadingClassName="dshr-think-leading"
        titleClassName="dshr-think-title"
        chevronClassName="dshr-think-chevron"
        icon={THINK_ICON}
        title={t('think')}
        open={expanded}
        expandable
        expandOnRowClick
        onToggle={toggle}
        collapsedContent={collapsedContent}
      >
        {content}
      </DisclosureRow>
    </div>
  )
})
