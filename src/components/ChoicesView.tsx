/**
 * Prototype choices: the explicit `prototype-choices` fence as a vertical
 * radio list over a showcase panel. Each option is a native radio input — the
 * same control the platform's Checkbox and plugin manager use — so the group
 * keeps the browser's keyboard behavior, focus ring, and accent color instead
 * of a drawn glyph. The selected option's body renders through the full
 * upgrade pipeline, so a prototype can be a live rich fence, a code block, or
 * plain prose.
 *
 * Every fence ends with a built-in 其他 option, added here rather than left to
 * the model, so a reader can always answer outside the enumerated designs.
 * Choosing either kind previews it and writes one `已选择：<选项名>` line above
 * whatever the draft already holds; the fence never sends. The user adds their
 * own supplement and sends the message themselves.
 */

import { useCallback, useId, useRef, useState } from 'react'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChoicesSegment, TabSpec } from '../rules/segments.ts'
import { withOtherChoice, writeChoiceDraft } from '../choice-fill.ts'
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

/** Draw the radio option list, the selected option's showcase, and the write feedback. */
export function ChoicesView({ segment, labels, mentions, chrome, choiceInput }: ChoicesViewProps) {
  const useDraft = choiceInput?.useDraft ?? useNoDraft
  const draft = useDraft(state => state.draft)
  const chips = useDraft(state => state.occurrences.length)
  const [active, setActive] = useState(0)
  const [failed, setFailed] = useState(false)
  const written = useRef<string | undefined>(undefined)
  const group = useId()
  // The way out of the enumerated designs belongs to the renderer, not the
  // model: every fence offers it, and an authored one is left alone.
  const other: TabSpec = { label: chrome.choicesOther, body: '' }
  const options = withOtherChoice(segment.choices, other)
  const index = Math.min(active, options.length - 1)
  const current = options[index]
  const select = useCallback((choiceIndex: number) => {
    setActive(choiceIndex)
    const choice = options[choiceIndex]
    if (choiceInput === undefined || choice === undefined) return
    const line = `${chrome.choicesAnswerPrefix}${choice.label}`
    const accepted = writeChoiceDraft(choiceInput.actions, { draft, chips }, line, written.current)
    if (accepted) written.current = line
    setFailed(!accepted)
  }, [chips, choiceInput, chrome.choicesAnswerPrefix, draft, options])
  return (
    <div className="dshr-choices dshr-fence">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <div className="dshr-choices-list">
        {options.map((choice, choiceIndex) => (
          <label
            key={choiceIndex}
            className="dshr-choices-option"
            data-active={choiceIndex === index || undefined}
            // The checked radio fires no change event, so re-picking the active
            // option still rewrites a draft the user has since cleared.
            onClick={() => { if (choiceIndex === index) select(choiceIndex) }}
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
      {current !== undefined && current.body !== '' && (
        <div className="dshr-choices-panel">
          <RichMarkdownText
            text={strictLines(current.body)}
            streaming={false}
            labels={labels}
            mentions={mentions}
            chrome={chrome}
            choiceInput={choiceInput}
          />
        </div>
      )}
      {failed && <div className="dshr-choices-error" role="status">{chrome.choicesFillFailed}</div>}
    </div>
  )
}
