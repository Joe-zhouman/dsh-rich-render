/**
 * Prototype choices: the explicit `prototype-choices` fence as a row of
 * selectable chips over a live showcase panel. The selected option's body
 * renders through the full upgrade pipeline, so a prototype can be a live
 * rich fence, a code block, or plain prose. Selection is component-local
 * state (first option by default) and never writes back to the session.
 */

import { useState } from 'react'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChoicesSegment } from '../rules/segments.ts'
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
}

/** Draw the selectable chip row and the selected option's showcase panel. */
export function ChoicesView({ segment, labels, mentions, chrome }: ChoicesViewProps) {
  const [active, setActive] = useState(0)
  const index = Math.min(active, segment.choices.length - 1)
  const current = segment.choices[index]
  return (
    <div className="dshr-choices dshr-fence">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <div className="dshr-choices-list" role="radiogroup">
        {segment.choices.map((choice, choiceIndex) => (
          <button
            key={choiceIndex}
            type="button"
            role="radio"
            aria-checked={choiceIndex === index}
            className="dshr-choices-option"
            data-active={choiceIndex === index || undefined}
            onClick={() => { setActive(choiceIndex) }}
          >
            {choice.label}
          </button>
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
          />
        )}
      </div>
    </div>
  )
}
