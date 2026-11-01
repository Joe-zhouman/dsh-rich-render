/**
 * Checklist: a flat GFM task list drawn as one bordered card. Each item's box
 * is a native checkbox — the same control the platform's Checkbox primitive
 * uses — so the browser draws the tick and the focus ring. The checked state
 * starts from the markdown markers and then lives in component state, so
 * clicking a box moves the count and the progress bar immediately without
 * touching the transcript or the session log.
 */

import { useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChecklistSegment } from '../rules/segments.ts'
import { strictLines } from '../rules/strict-lines.ts'
import { pathImages } from '../markdown-fallback.ts'
import { InlineMarkdown } from './InlineMarkdown.tsx'

export interface ChecklistViewProps {
  readonly segment: ChecklistSegment
  readonly labels: MarkdownLabels
  /** Fallback title and the progress template (`{done}`/`{total}`). */
  readonly chrome: { readonly checklistTitle: string; readonly checklistProgress: string }
}

/** Draw one interactive checklist with live progress. */
export function ChecklistView({ segment, labels, chrome }: ChecklistViewProps) {
  const [checked, setChecked] = useState<boolean[]>(() => segment.items.map(item => item.checked))
  const total = segment.items.length
  const done = checked.filter(Boolean).length
  const percent = total === 0 ? 0 : done / total * 100
  const countText = chrome.checklistProgress
    .replaceAll('{done}', String(done))
    .replaceAll('{total}', String(total))
  const toggle = (index: number): void => {
    setChecked(previous => previous.map((value, position) => position === index ? !value : value))
  }
  const title = segment.title === '' ? chrome.checklistTitle : segment.title
  return (
    <section className="dshr-checklist dshr-fence">
      <div className="dshr-checklist-head">
        <div className="dshr-checklist-title"><InlineMarkdown text={title} labels={labels} /></div>
        <div className="dshr-checklist-count">{countText}</div>
      </div>
      <div
        className="dshr-checklist-track"
        role="progressbar"
        aria-label={countText}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={countText}
      >
        <div className="dshr-checklist-fill" style={{ width: `${percent.toFixed(2)}%` }} />
      </div>
      <ul className="dshr-checklist-items">
        {segment.items.map((item, index) => (
          <li key={index} className="dshr-checklist-item">
            <label className="dshr-checklist-check">
              <input
                type="checkbox"
                className="dshr-checklist-input"
                checked={checked[index] === true}
                aria-label={item.title}
                onChange={() => { toggle(index) }}
              />
            </label>
            <div className="dshr-checklist-main">
              <div className="dshr-checklist-item-title"><InlineMarkdown text={item.title} labels={labels} /></div>
              {item.body !== '' && (
                <div className="dshr-checklist-item-body">
                  <MarkdownText text={strictLines(item.body)} labels={labels} pathImages={pathImages} variant="compact" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
