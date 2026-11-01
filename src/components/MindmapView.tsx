/**
 * Mindmap: the explicit `mindmap` fence, one left-to-right tree per root,
 * stacked vertically. Nodes are bare text over a branch-colored underline
 * (only the root keeps a box, a solid pill); each child has one connector,
 * an inline SVG cubic bump from the parent's exit to the child's center.
 * Path geometry is measured after layout into each path's `d`; zoom
 * (50%~200%) is a transform and never needs a re-measure. Horizontal scroll
 * wraps wide trees; both controls are component-local state and never write
 * back.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { MindmapNodeSpec, MindmapSegment } from '../rules/segments.ts'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import { InlineMarkdown } from './InlineMarkdown.tsx'

/** Branch palette cycle: level-1 branches take these classes in order. */
const BRANCH_CLASSES = ['dshr-mm-b1', 'dshr-mm-b2', 'dshr-mm-b3', 'dshr-mm-b4'] as const

/** Connector span; must match `.dshr-mm-child`'s left padding and the edge width. */
const EDGE_GAP = 40

/** How far the stroke reaches into each node, so its round cap meets the glyph. */
const EDGE_OVERLAP = 2

/** Slack around the connector box so the stroke and its caps never clip. */
const EDGE_PAD = 2

/**
 * One connector. The SVG is positioned and its path written by
 * {@link useMindmapEdges}; until then the path has no path data and paints
 * nothing, so a missing fit never leaves a half-drawn line.
 */
function Edge() {
  return (
    <svg className="dshr-mm-edge" aria-hidden="true">
      <path className="dshr-mm-edge-path" />
    </svg>
  )
}

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
              <Edge />
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
            <Edge />
            <Branch node={child} level={1} labels={labels} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Fit every connector: per children column, run one cubic bump from the
 * column's centerline (where the parent's exit sits) to each child's center.
 * Each path lives in its own SVG box spanning just the vertical extent of the
 * curve, so no drawing can be clipped. Only layout metrics are read, so the
 * zoom transform never invalidates them; a ResizeObserver re-fits when
 * wrapping or inline math changes heights.
 * @param rootRef - the fence root whose connectors are being fitted.
 * @param segment - the fence's trees; a new spec re-runs the pass.
 */
function useMindmapEdges(rootRef: RefObject<HTMLDivElement | null>, segment: MindmapSegment) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const fit = () => {
      for (const column of Array.from(root.querySelectorAll<HTMLElement>('.dshr-mm-children'))) {
        const centerline = column.offsetHeight / 2
        for (const child of Array.from(column.children)) {
          const edge = child.firstElementChild
          if (!(child instanceof HTMLElement) || !(edge instanceof SVGElement)) continue
          const path = edge.querySelector('path')
          if (path === null) continue
          const exit = centerline - child.offsetTop
          const entry = child.offsetHeight / 2
          const top = Math.min(exit, entry) - EDGE_PAD
          const y0 = exit - top
          const y1 = entry - top
          edge.style.top = `${top}px`
          edge.style.height = `${Math.abs(y1 - y0) + EDGE_PAD * 2}px`
          path.setAttribute('d', `M${-EDGE_OVERLAP} ${y0} C${EDGE_GAP / 2} ${y0}, ${EDGE_GAP / 2} ${y1}, ${EDGE_GAP + EDGE_OVERLAP} ${y1}`)
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
