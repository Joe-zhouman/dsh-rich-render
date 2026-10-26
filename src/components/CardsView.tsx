/**
 * Icon-card group: one H2/H3 heading plus its titled ordered list, drawn as
 * a responsive grid of cards (entry heading + markdown body).
 */

import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CardsSegment } from '../rules/segments.ts'
import { pathImages } from '../markdown-fallback.ts'
import { InlineMarkdown } from './InlineMarkdown.tsx'

export interface CardsViewProps {
  readonly segment: CardsSegment
  readonly labels: MarkdownLabels
}

/** Draw the upgraded card group. */
export function CardsView({ segment, labels }: CardsViewProps) {
  return (
    <div className="dshr-cards">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <div className="dshr-cards-grid">
        {segment.cards.map((card, index) => (
          <div key={index} className="dshr-card">
            <div className="dshr-card-main">
              <div className="dshr-card-title"><InlineMarkdown text={card.title} labels={labels} /></div>
              {card.body !== '' && (
                <div className="dshr-card-body">
                  <MarkdownText text={card.body} labels={labels} pathImages={pathImages} variant="compact" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
