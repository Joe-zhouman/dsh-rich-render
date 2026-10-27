/**
 * Tab: the explicit `tab` fence as a line-tab bar (equal-width segments, an
 * underline on the active label) over labeled pages. Page bodies render as
 * normal body Markdown; the selected page is component-local state (first page
 * by default), only the active page renders, and clicking never writes back to
 * the session.
 */

import { useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TabSegment } from '../rules/segments.ts'
import { pathImages } from '../markdown-fallback.ts'

export interface TabViewProps {
  readonly segment: TabSegment
  readonly labels: MarkdownLabels
}

/** Draw the tab bar and the selected page's markdown. */
export function TabView({ segment, labels }: TabViewProps) {
  const [active, setActive] = useState(0)
  const index = Math.min(active, segment.tabs.length - 1)
  const current = segment.tabs[index]
  return (
    <div className="dshr-tabs dshr-fence">
      <div className="dshr-tabs-bar" role="tablist">
        {segment.tabs.map((tab, tabIndex) => (
          <button
            key={tabIndex}
            type="button"
            role="tab"
            aria-selected={tabIndex === index}
            className="dshr-tabs-tab"
            data-active={tabIndex === index || undefined}
            title={tab.label}
            onClick={() => { setActive(tabIndex) }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="dshr-tabs-pane" role="tabpanel">
        {current !== undefined && current.body !== '' && (
          <MarkdownText text={current.body} labels={labels} pathImages={pathImages} />
        )}
      </div>
    </div>
  )
}
