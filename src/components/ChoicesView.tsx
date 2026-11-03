/**
 * Prototype choices: the explicit `prototype-choices` fence as a vertical
 * radio list over a showcase panel. Each option is a native radio input — the
 * same control the platform's Checkbox and plugin manager use — so the group
 * keeps the browser's keyboard behavior, focus ring, and accent color instead
 * of a drawn glyph. The selected option's body renders through the full
 * upgrade pipeline, so a prototype can be a live rich fence, a code block, or
 * plain prose.
 *
 * Choosing an option previews it and writes one `已选择：<选项名>` line above
 * whatever the draft already holds; the fence never sends. The user adds their
 * own supplement and sends the message themselves, so a decision always leaves
 * room for instructions that only they know.
 */

import { useCallback, useId, useRef, useState } from 'react'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChoicesSegment } from '../rules/segments.ts'
import { writeChoiceDraft } from '../choice-fill.ts'
import type { ChoiceDraftState, ChoiceInput, UseChoiceDraft } from '../choice-fill.ts'
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
  /** Composer write face; absent for a preview-only seat. */
  readonly choiceInput?: ChoiceInput | undefined
}

/** Draft state of a renderer without a Session seat: empty and unwritable. */
const EMPTY_DRAFT: ChoiceDraftState = { draft: '', occurrences: [] }

/** Stand-in selector for that seat; calling it keeps hook order stable. */
const useNoDraft: UseChoiceDraft = selector => selector(EMPTY_DRAFT)

/** Outcome copy shown under the options after a selection. */
type FillStatus = 'idle' | 'filled' | 'failed'

/** Draw the radio option list, the selected option's showcase, and the write feedback. */
export function ChoicesView({ segment, labels, mentions, chrome, choiceInput }: ChoicesViewProps) {
  const useDraft = choiceInput?.useDraft ?? useNoDraft
  const draft = useDraft(state => state.draft)
  const chips = useDraft(state => state.occurrences.length)
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState<FillStatus>('idle')
  const written = useRef<string | undefined>(undefined)
  const group = useId()
  const index = Math.min(active, segment.choices.length - 1)
  const current = segment.choices[index]
  const select = useCallback((choiceIndex: number) => {
    setActive(choiceIndex)
    const choice = segment.choices[choiceIndex]
    if (choiceInput === undefined || choice === undefined) {
      setStatus('idle')
      return
    }
    const line = `${chrome.choicesAnswerPrefix}${choice.label}`
    const accepted = writeChoiceDraft(choiceInput.actions, { draft, chips }, line, written.current)
    if (!accepted) {
      setStatus('failed')
      return
    }
    written.current = line
    setStatus('filled')
  }, [chips, choiceInput, chrome.choicesAnswerPrefix, draft, segment.choices])
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
            choiceInput={choiceInput}
          />
        )}
      </div>
      {status !== 'idle' && (
        <div className="dshr-choices-hint" data-error={status === 'failed' || undefined} role="status">
          {status === 'failed' ? chrome.choicesFillFailed : chrome.choicesFilled}
        </div>
      )}
    </div>
  )
}
