/**
 * Right-aligned icon toolbar shared by the two chart-bearing fences: the view
 * tabs sit together at the left of the cluster, then a hairline, then the
 * actions that work on the rendered chart (copy, export). Every control is
 * icon-only and carries its localized name as tooltip and accessible name, so
 * neither fence needs visible button text.
 */

import { useEffect, useRef, useState } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { Icon } from './Icon.tsx'

/** One view tab: the view id it selects, its localized name, and its glyph. */
export interface ToolbarTab {
  readonly id: string
  readonly label: string
  readonly icon: string
}

/** Localized copy feedback for the clipboard action. */
export interface ToolbarCopyLabels {
  readonly copy: string
  readonly copied: string
  readonly failed: string
}

export interface FenceToolbarProps {
  readonly tabs: readonly ToolbarTab[]
  readonly active: string
  readonly onSelect: (id: string) => void
  /** Clipboard action: resolves true when the write landed. */
  readonly onCopy: () => Promise<boolean>
  readonly copyLabels: ToolbarCopyLabels
  /** Export action and its localized name. */
  readonly onDownload: () => void
  readonly downloadLabel: string
  /** Whether the chart is missing, making both actions inert. */
  readonly disabled?: boolean
}

/** Copy confirmation window before the button returns to its idle glyph. */
const COPIED_MS = 1500

/** Draw the toolbar and own the clipboard confirmation state. */
export function FenceToolbar({ tabs, active, onSelect, onCopy, copyLabels, onDownload, downloadLabel, disabled = false }: FenceToolbarProps) {
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current)
  }, [])
  const copy = (): void => {
    if (timer.current !== null) clearTimeout(timer.current)
    void onCopy().then(ok => {
      setState(ok ? 'done' : 'error')
      timer.current = setTimeout(() => { setState('idle') }, COPIED_MS)
    })
  }
  const copyLabel = state === 'done' ? copyLabels.copied : state === 'error' ? copyLabels.failed : copyLabels.copy
  const copyIcon = state === 'done' ? 'check' : state === 'error' ? 'alert-triangle' : 'copy'
  return (
    <div className="dshr-toolbar">
      <div className="dshr-toolbar-views" role="tablist">
        {tabs.map(tab => (
          <Tooltip key={tab.id} label={tab.label} side="bottom" portal>
            <button
              type="button"
              role="tab"
              aria-selected={tab.id === active}
              aria-label={tab.label}
              className="dshr-toolbar-btn"
              data-active={tab.id === active || undefined}
              onClick={() => { onSelect(tab.id) }}
            >
              <Icon name={tab.icon} size={16} />
            </button>
          </Tooltip>
        ))}
      </div>
      <span className="dshr-toolbar-sep" aria-hidden />
      <Tooltip label={copyLabel} side="bottom" portal>
        <button
          type="button"
          className="dshr-toolbar-btn"
          aria-label={copyLabel}
          data-state={state === 'idle' ? undefined : state}
          disabled={disabled}
          onClick={copy}
        >
          <Icon name={copyIcon} size={16} />
        </button>
      </Tooltip>
      <Tooltip label={downloadLabel} side="bottom" portal>
        <button
          type="button"
          className="dshr-toolbar-btn"
          aria-label={downloadLabel}
          disabled={disabled}
          onClick={onDownload}
        >
          <Icon name="download" size={16} />
        </button>
      </Tooltip>
    </div>
  )
}
