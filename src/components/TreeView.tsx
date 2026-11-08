/**
 * Tree: the explicit `tree` fence as a vertical indented forest with guide
 * lines, collapsible folders (default expanded, component-local state), and
 * Material Icon Theme file/folder glyphs (curated inline copy). An entry's
 * `#` annotation renders as a note in one shared left-aligned column, so the
 * notes line up across depths instead of trailing each name.
 */

import { useState } from 'react'
import { fileIcon, folderIcon } from '../rules/tree-icons.ts'
import type { TreeIcon } from '../rules/tree-icons.ts'
import type { TreeEntrySpec, TreeSegment } from '../rules/segments.ts'

/** One indent step per level; matches the 23px guide-line period in styles.ts. */
const INDENT = 23

/** One material glyph: 16x16 filled paths at native VS Code size. */
function TreeGlyph({ icon }: { icon: TreeIcon }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="dshr-tree-icon">
      {icon.paths.map((path, index) => <path key={index} fill={path.fill} d={path.d} />)}
    </svg>
  )
}

/** One row: icon plus name plus optional note; folders toggle their children. */
function Row({ entry, path, depth, expanded, toggle }: {
  entry: TreeEntrySpec
  path: string
  depth: number
  expanded: ReadonlySet<string>
  toggle: (path: string): void
}) {
  const key = `${path}/${entry.name}`
  const open = expanded.has(key)
  const name = entry.name.replace(/\/$/u, '')
  return (
    <>
      <div
        className="dshr-tree-row"
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={entry.folder ? open : undefined}
      >
        <div className="dshr-tree-main" style={{ paddingLeft: depth * INDENT }}>
          <span className="dshr-tree-guides" style={{ width: depth * INDENT }} aria-hidden />
          {entry.folder
            ? (
              <button type="button" className="dshr-tree-toggle" onClick={() => toggle(key)}>
                {open ? '▾' : '▸'}
              </button>
            )
            : <span className="dshr-tree-toggle" aria-hidden />}
          <TreeGlyph icon={entry.folder ? folderIcon(name, open) : fileIcon(name)} />
          <span className="dshr-tree-name" title={entry.name}>{entry.name}</span>
        </div>
        {entry.note === undefined
          ? null
          : <span className="dshr-tree-note" title={entry.note}>{entry.note}</span>}
      </div>
      {entry.folder && open && entry.children.length > 0 && (
        <div className="dshr-tree-children" role="group">
          {entry.children.map((child, index) => (
            <Row key={index} entry={child} path={key} depth={depth + 1} expanded={expanded} toggle={toggle} />
          ))}
        </div>
      )}
    </>
  )
}

export interface TreeViewProps {
  readonly segment: TreeSegment
}

/** Collect every folder path (default expanded). */
function allFolderPaths(entries: readonly TreeEntrySpec[], path: string, into: Set<string>): void {
  for (const entry of entries) {
    const key = `${path}/${entry.name}`
    if (entry.folder) {
      into.add(key)
      allFolderPaths(entry.children, key, into)
    }
  }
}

/** Draw the forest. */
export function TreeView({ segment }: TreeViewProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => {
    const initial = new Set<string>()
    allFolderPaths(segment.trees, '', initial)
    return initial
  })
  const toggle = (path: string): void => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }
  return (
    <div className="dshr-tree dshr-fence" role="tree">
      {segment.trees.map((entry, index) => (
        <Row key={index} entry={entry} path="" depth={0} expanded={expanded} toggle={toggle} />
      ))}
    </div>
  )
}
