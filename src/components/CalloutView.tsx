/**
 * Callout: one blockquote restyled as a quiet side-marked box; a GitHub
 * alert marker (`[!NOTE]` family) types it with the marker's color, icon,
 * and localized title. The quote's inner markdown still renders through the
 * platform renderer.
 */

import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CalloutSegment, CalloutType } from '../rules/segments.ts'
import { pathImages } from '../markdown-fallback.ts'
import { Icon } from './Icon.tsx'

/** Icon key per alert flavor (GitHub's alert pairing). */
const CALLOUT_ICONS: Readonly<Record<CalloutType, string>> = {
  note: 'info',
  tip: 'lightbulb',
  important: 'message-circle',
  warning: 'triangle-alert',
  caution: 'octagon-alert',
}

export interface CalloutViewProps {
  readonly segment: CalloutSegment
  readonly labels: MarkdownLabels
  /** Localized alert titles keyed by flavor. */
  readonly titles: Readonly<Record<CalloutType, string>>
}

/** Draw the upgraded callout box. */
export function CalloutView({ segment, labels, titles }: CalloutViewProps) {
  if (segment.type === undefined) {
    return (
      <aside className="dshr-callout">
        <MarkdownText text={segment.body} labels={labels} pathImages={pathImages} variant="compact" />
      </aside>
    )
  }
  return (
    <aside className={`dshr-callout-alert dshr-callout-${segment.type}`}>
      <span className="dshr-callout-alert-icon"><Icon name={CALLOUT_ICONS[segment.type]} size={16} /></span>
      <div className="dshr-callout-alert-main">
        <div className="dshr-callout-alert-title">{titles[segment.type]}</div>
        <MarkdownText text={segment.body} labels={labels} pathImages={pathImages} variant="compact" />
      </div>
    </aside>
  )
}
