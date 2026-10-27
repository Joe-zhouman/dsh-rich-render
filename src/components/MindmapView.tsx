/**
 * Mindmap: the explicit `mindmap` fence, one left-to-right tree per root,
 * stacked vertically. Horizontal scroll wraps wide trees; the zoom control
 * (−/100%/+, 50%~200%) is component-local state and never writes back.
 */

import { useState } from 'react'
import type { MindmapNodeSpec, MindmapSegment } from '../rules/segments.ts'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import { InlineMarkdown } from './InlineMarkdown.tsx'

/** One branch: its chip, then its children column. */
function Branch({ node, level, labels }: { node: MindmapNodeSpec; level: number; labels: MarkdownLabels }) {
  return (
    <div className="dshr-mm-item">
      <div className={`dshr-mm-chip dshr-mm-level-${Math.min(level, 3)}`}>
        <InlineMarkdown text={node.label} labels={labels} />
      </div>
      {node.children.length > 0 && <div className="dshr-mm-tail" aria-hidden />}
      {node.children.length > 0 && (
        <div className="dshr-mm-children">
          {node.children.map((child, index) => (
            <div key={index} className="dshr-mm-child">
              <Branch node={child} level={level + 1} labels={labels} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** One root tree: root chip plus its branches in a right-hand column. */
function RootTree({ tree, labels }: { tree: MindmapNodeSpec; labels: MarkdownLabels }) {
  return (
    <div className="dshr-mm-tree">
      <div className="dshr-mm-chip dshr-mm-root">
        <InlineMarkdown text={tree.label} labels={labels} />
      </div>
      <div className="dshr-mm-tail" aria-hidden />
      <div className="dshr-mm-children">
        {tree.children.map((child, index) => (
          <div key={index} className="dshr-mm-child">
            <Branch node={child} level={1} labels={labels} />
          </div>
        ))}
      </div>
    </div>
  )
}

export interface MindmapViewProps {
  readonly segment: MindmapSegment
  readonly labels: MarkdownLabels
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.25

/** Draw the fence's trees with scroll and zoom. */
export function MindmapView({ segment, labels }: MindmapViewProps) {
  const [zoom, setZoom] = useState(1)
  return (
    <div className="dshr-mm dshr-fence">
      <div className="dshr-mm-scroll" style={{ maxHeight: `${Math.round(480 * zoom)}px` }}>
        <div
          className="dshr-mm-zoompane"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${Math.round((100 / zoom) * 100) / 100}%` }}
        >
          {segment.trees.map((tree, index) => (
            <RootTree key={index} tree={tree} labels={labels} />
          ))}
        </div>
      </div>
      <div className="dshr-mm-zoom" role="group">
        <button type="button" className="dshr-mm-zoombtn" disabled={zoom <= ZOOM_MIN + 1e-9} onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}>−</button>
        <button type="button" className="dshr-mm-zoomreset" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button type="button" className="dshr-mm-zoombtn" disabled={zoom >= ZOOM_MAX - 1e-9} onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}>+</button>
      </div>
    </div>
  )
}
