/**
 * Prototype choices: the explicit `prototype-choices` fence as a vertical
 * radio list over a showcase panel. Each option is a native radio input — the
 * same control the platform's Checkbox and plugin manager use — so the group
 * keeps the browser's keyboard behavior, focus ring, and accent color instead
 * of a drawn glyph. The selected option's body renders through the full
 * upgrade pipeline, so a prototype can be a live rich fence, a code block, or
 * plain prose.
 *
 * Selecting an option previews it only. The commit row sends the selected
 * label into the Session as one user turn through the seat's sender, so the
 * choice enters the next round instead of staying on screen; a fence without
 * a Session seat (no sender) stays preview-only.
 */

import { useCallback, useId, useState } from 'react'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChoicesSegment } from '../rules/segments.ts'
import type { ChoiceSend } from '../choice-send.ts'
import { strictLines } from '../rules/strict-lines.ts'
import type { Mentions } from '../markdown-fallback.ts'
import { InlineMarkdown } from './InlineMarkdown.tsx'
import { RichMarkdownText } from './RichMarkdownText.tsx'
import type { RichChrome } from './RichMarkdownText.tsx'

export interface ChoicesViewProps {
  readonly segment: ChoicesSegment
  readonly labels: MarkdownLabels
  readonly mentions: Mentions
  /** Full rich chrome: the showcase renders inner fences with their own. */
  readonly chrome: RichChrome
  /** Commit the selected option into the Session; absent for a preview-only seat. */
  readonly choiceSend?: ChoiceSend | undefined
}

/** Delivery state of the commit row; a new selection returns it to idle. */
type SendStatus = 'idle' | 'sending' | 'sent' | 'failed'

/** Draw the radio option list, the selected option's showcase, and the commit row. */
export function ChoicesView({ segment, labels, mentions, chrome, choiceSend }: ChoicesViewProps) {
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState<SendStatus>('idle')
  const group = useId()
  const index = Math.min(active, segment.choices.length - 1)
  const current = segment.choices[index]
  const select = useCallback((choiceIndex: number) => {
    setActive(choiceIndex)
    setStatus('idle')
  }, [])
  const submit = useCallback(async (): Promise<void> => {
    if (choiceSend === undefined || current === undefined) return
    setStatus('sending')
    try {
      await choiceSend(`${chrome.choicesAnswerPrefix}${current.label}`)
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }, [choiceSend, chrome.choicesAnswerPrefix, current])
  return (
    <div className="dshr-choices dshr-fence">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <div className="dshr-choices-list">
        {segment.choices.map((choice, choiceIndex) => (
          <label
            key={choiceIndex}
            className="dshr-choices-option"
            data-active={choiceIndex === index || undefined}
          >
            <input
              type="radio"
              className="dshr-choices-input"
              name={group}
              checked={choiceIndex === index}
              onChange={() => { select(choiceIndex) }}
            />
            <span className="dshr-choices-label">{choice.label}</span>
          </label>
        ))}
      </div>
      <div className="dshr-choices-panel">
        {current !== undefined && current.body !== '' && (
          <RichMarkdownText
            text={strictLines(current.body)}
            streaming={false}
            labels={labels}
            mentions={mentions}
            chrome={chrome}
            choiceSend={choiceSend}
          />
        )}
      </div>
      {choiceSend !== undefined && (
        <div className="dshr-choices-actions">
          <button
            type="button"
            className="dshr-choices-send"
            disabled={status === 'sending' || status === 'sent'}
            onClick={submit}
          >
            {status === 'sent'
              ? chrome.choicesSent
              : status === 'sending' ? chrome.choicesSending : chrome.choicesSend}
          </button>
          {status === 'failed' && (
            <span className="dshr-choices-error" role="status">{chrome.choicesSendFailed}</span>
          )}
        </div>
      )}
    </div>
  )
}
