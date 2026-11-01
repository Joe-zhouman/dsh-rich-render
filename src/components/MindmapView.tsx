/**
 * Mindmap: the explicit `mindmap` fence, one left-to-right tree per root,
 * stacked vertically. Nodes are bare text over a branch-colored underline
 * (only the root keeps a box, a solid pill); connectors are one bump curve
 * per child, two elliptical quarter-arcs meeting mid-gap. Curve geometry is
 * measured after layout into per-edge CSS variables; zoom (50%~200%) is a
 * transform and never needs a re-measure. Horizontal scroll wraps wide trees;
 * both controls are component-local state and never write back.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { MindmapNodeSpec, MindmapSegment } from '../rules/segments.ts'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import { InlineMarkdown } from './InlineMarkdown.tsx'

/** Branch palette cycle: level-1 branches take these classes in order. */
const BRANCH_CLASSES = ['dshr-mm-b1', 'dshr-mm-b2', 'dshr-mm-b3', 'dshr-mm-b4'] as const

/** One branch: its label, then its children column. */
function Branch({ node, level, labels }: { node: MindmapNodeSpec; level: number; labels: MarkdownLabels }) {
  return (
    <div className="dshr-mm-item">
      <div className={`dshr-mm-node dshr-mm-level-${Math.min(level, 3)}`}>
        <InlineMarkdown text={node.label} labels={labels} />
      </div>
      {node.children.length > 0 && (
        <div className="dshr-mm-children">
          {node.children.map((child, index) => (
            <div key={index} className={`dshr-mm-child dshr-mm-child-l${Math.min(level + 1, 2)}`}>
              <div className="dshr-mm-edge" aria-hidden />
              <Branch node={child} level={level + 1} labels={labels} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** One root tree: root pill plus its branches in a right-hand column. */
function RootTree({ tree, labels }: { tree: MindmapNodeSpec; labels: MarkdownLabels }) {
  return (
    <div className="dshr-mm-tree">
      <div className="dshr-mm-node dshr-mm-root">
        <InlineMarkdown text={tree.label} labels={labels} />
      </div>
      <div className="dshr-mm-children">
        {tree.children.map((child, index) => (
          <div key={index} className={`dshr-mm-child dshr-mm-child-l1 ${BRANCH_CLASSES[index % BRANCH_CLASSES.length]}`}>
            <div className="dshr-mm-edge" aria-hidden />
            <Branch node={child} level={1} labels={labels} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Fit each edge's curve variables: per children column, the signed offset
 * from the column's centerline (where the parent's exit sits) to each child's
 * center. Only layout metrics are read, so the zoom transform never invalidates
 * them; a ResizeObserver re-fits when wrapping or inline math changes heights.
 * @param rootRef - the fence root whose edges are being fitted.
 * @param segment - the fence's trees; a new spec re-runs the pass.
 */
function useMindmapEdges(rootRef: RefObject<HTMLDivElement | null>, segment: MindmapSegment) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const fit = () => {
      for (const column of Array.from(root.querySelectorAll<HTMLElement>('.dshr-mm-children'))) {
        const center = column.offsetHeight / 2
        for (const child of Array.from(column.children)) {
          const edge = child.firstElementChild
          if (!(edge instanceof HTMLElement) || !edge.classList.contains('dshr-mm-edge')) continue
          const dy = child.offsetTop + child.offsetHeight / 2 - center
          edge.style.setProperty('--dshr-mm-edge-top', `${child.offsetHeight / 2 - Math.max(dy, 0)}px`)
          edge.style.setProperty('--dshr-mm-edge-height', `${Math.abs(dy)}px`)
          edge.style.setProperty('--dshr-mm-edge-flip', dy >= 0 ? '1' : '-1')
        }
      }
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    for (const column of Array.from(root.querySelectorAll('.dshr-mm-children'))) observer.observe(column)
    return () => observer.disconnect()
  }, [rootRef, segment])
}

export interface MindmapViewProps {
  readonly segment: MindmapSegment
  readonly labels: MarkdownLabels
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.25

/** Draw the fence's trees with scroll, zoom, and fitted edge curves. */
export function MindmapView({ segment, labels }: MindmapViewProps) {
  const [zoom, setZoom] = useState(1)
  const rootRef = useRef<HTMLDivElement | null>(null)
  useMindmapEdges(rootRef, segment)
  return (
    <div ref={rootRef} className="dshr-mm dshr-fence">
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
