/**
 * Timeline: the stages of an explicit `timeline` fence drawn as a vertical
 * rail with numbered dots, the stage title, and its markdown body indented
 * beside it.
 */

import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TimelineSegment } from '../rules/segments.ts'
import { strictLines } from '../rules/strict-lines.ts'
import { pathImages } from '../markdown-fallback.ts'
import { InlineMarkdown } from './InlineMarkdown.tsx'

export interface TimelineViewProps {
  readonly segment: TimelineSegment
  readonly labels: MarkdownLabels
}

/** Draw the upgraded timeline. */
export function TimelineView({ segment, labels }: TimelineViewProps) {
  return (
    <div className="dshr-timelinewrap dshr-fence">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <ol className="dshr-timeline">
        {segment.entries.map((entry, index) => (
          <li key={index} className="dshr-timeline-item">
            <span className="dshr-timeline-dot" aria-hidden>{index + 1}</span>
            <div className="dshr-timeline-main">
              <div className="dshr-timeline-title"><InlineMarkdown text={entry.title} labels={labels} /></div>
              {entry.body !== '' && (
                <div className="dshr-timeline-body">
                  <MarkdownText text={strictLines(entry.body)} labels={labels} pathImages={pathImages} variant="compact" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
