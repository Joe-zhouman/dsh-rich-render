/**
 * Explicit-fence parsers. Each takes the raw code-block body and returns its
 * segment payload, or undefined for the silent native fallback (the code block
 * then renders exactly as the model wrote it). Caps are performance/typing
 * guards, not readability judgments.
 */

import type { BlockContent, Heading, List, ListItem } from 'mdast'
import { nodeSource, parseBlocks, plainText } from './parse.ts'
import { entryTitleBody, stripInline } from './checklist-items.ts'
import { normalizeFill } from './stack-colors.ts'
import type {
  ChecklistItem, ChecklistSegment, ChoicesSegment, MindmapNodeSpec, StackLayerSpec, TabSpec, TimelineEntry,
  TimelineSegment, TreeEntrySpec,
} from './segments.ts'

/** Node cap for one mindmap fence. */
const MINDMAP_MAX_NODES = 200
/** Node and depth caps for one tree fence. */
const TREE_MAX_NODES = 500
const TREE_MAX_DEPTH = 12
/** Item cap for one todo fence. */
const TODO_MAX_ITEMS = 100
/** Entry count bounds for one timeline fence. */
const TIMELINE_MIN_ENTRIES = 2
const TIMELINE_MAX_ENTRIES = 100
/** Tab count and label caps for one tab fence. */
const TAB_MIN_TABS = 2
const TAB_MAX_TABS = 30
const TAB_LABEL_MAX = 60
/** Title length cap for a todo/timeline heading/paragraph block. */
const FENCE_TITLE_MAX = 120
/**
 * Body size cap before any fence parse: a legal fence is far smaller (200
 * nodes / 500 entries), and the mdast parse itself is quadratic on hostile
 * inputs, so oversized bodies degrade to native before parsing.
 */
const FENCE_BODY_MAX = 100_000

/**
 * Unordered-list top level of a fence body; undefined when anything else
 * appears. Tolerated model deviations (never taught): ordered lists parse
 * identically, and task checkboxes are stripped instead of declining.
 * @param body - fence body.
 * @param allowOrdered - ordered-list markers may open items (mindmap/tree).
 */
function fenceLists(body: string, allowOrdered = false): List[] | undefined {
  if (body.length > FENCE_BODY_MAX) return undefined
  let root
  try {
    root = parseBlocks(body)
  } catch (error) {
    // A body the shared parser cannot read degrades to native markdown.
    void error
    return undefined
  }
  const lists: List[] = []
  for (const node of root.children as BlockContent[]) {
    if (node.type !== 'list' || (node.ordered === true && !allowOrdered)) return undefined
    lists.push(node)
  }
  return lists.length === 0 ? undefined : lists
}

/** A list item carries a GFM task-list checkbox. */
function isTaskItem(item: ListItem): boolean {
  return item.checked === true || item.checked === false
}

/** One item's first line as a label, with a task checkbox marker dropped. */
function itemLabel(item: ListItem): string {
  const first = item.children.find(child => child.type === 'paragraph')
  const line = first === undefined ? '' : plainText(first).trim().split('\n')[0] ?? ''
  return line.replace(/^\[[ xX]\][ \t]*/u, '')
}

/** One branch per list item: label = first paragraph's first line, children = nested list. */
function itemTrees(list: List): MindmapNodeSpec[] {
  return list.children.map(item => {
    const children: MindmapNodeSpec[] = []
    for (const child of item.children) {
      if (child.type === 'list') children.push(...itemTrees(child))
    }
    return { label: itemLabel(item), children }
  })
}

function countTrees(trees: readonly MindmapNodeSpec[]): number {
  return trees.reduce((sum, tree) => sum + 1 + countTrees(tree.children), 0)
}

/**
 * `mindmap` fence body: nested lists, one tree per top-level item.
 * @param body - code-block content.
 * @returns the trees, or undefined unless every node is list-shaped with a
 * non-empty label, total 2..200 (at least one edge). Tolerated deviations:
 * ordered markers, task checkboxes, and a single leading paragraph that
 * becomes one root over the listed branches.
 */
export function parseMindmapFence(body: string): MindmapNodeSpec[] | undefined {
  const lists = fenceLists(body, true)
  if (lists !== undefined) {
    const trees = lists.flatMap(list => itemTrees(list))
    const nodes = countTrees(trees)
    if (nodes < 2 || nodes > MINDMAP_MAX_NODES) return undefined
    if (trees.some(tree => tree.label === '')) return undefined
    return trees
  }
  return paragraphRootedMindmap(body)
}

/** A leading paragraph becomes one root whose children are the listed branches. */
function paragraphRootedMindmap(body: string): MindmapNodeSpec[] | undefined {
  if (body.length > FENCE_BODY_MAX) return undefined
  let root
  try {
    root = parseBlocks(body)
  } catch (error) {
    void error
    return undefined
  }
  const children = root.children as BlockContent[]
  const first = children[0]
  if (first?.type !== 'paragraph') return undefined
  const rest = children.slice(1)
  if (rest.length === 0 || rest.some(node => node.type !== 'list')) return undefined
  const trees: MindmapNodeSpec[] = [{
    label: plainText(first).trim().split('\n')[0] ?? '',
    children: rest.flatMap(node => itemTrees(node as List)),
  }]
  const nodes = countTrees(trees)
  if (nodes < 2 || nodes > MINDMAP_MAX_NODES) return undefined
  if (trees[0]!.label === '') return undefined
  if (trees[0]!.children.some(child => child.label === '')) return undefined
  return trees
}

/** Tree entries with node/depth accounting; undefined exceeds a cap or hits a bad shape. */
function treeEntries(list: List, depth: number, budget: { count: number }): TreeEntrySpec[] | undefined {
  if (depth > TREE_MAX_DEPTH) return undefined
  const entries: TreeEntrySpec[] = []
  for (const item of list.children) {
    const name = itemLabel(item)
    const childLists: List[] = []
    for (const child of item.children) {
      if (child.type === 'list') childLists.push(child)
    }
    if (name === '') return undefined
    budget.count += 1
    if (budget.count > TREE_MAX_NODES) return undefined
    let children: TreeEntrySpec[] = []
    if (childLists.length > 0) {
      for (const childList of childLists) {
        const parsed = treeEntries(childList, depth + 1, budget)
        if (parsed === undefined) return undefined
        children = children.concat(parsed)
      }
    }
    entries.push({ name, folder: name.endsWith('/') || children.length > 0, children })
  }
  return entries
}

/**
 * `tree` fence body: nested lists as a file forest (multiple roots).
 * @param body - code-block content.
 * @returns the entries, or undefined outside 500 nodes / 12 levels or on any
 * non-list shape. Tolerated deviations: ordered markers and task checkboxes.
 */
export function parseTreeFence(body: string): TreeEntrySpec[] | undefined {
  const lists = fenceLists(body, true)
  if (lists === undefined) return undefined
  const budget = { count: 0 }
  const trees: TreeEntrySpec[] = []
  for (const list of lists) {
    const parsed = treeEntries(list, 1, budget)
    if (parsed === undefined) return undefined
    trees.push(...parsed)
  }
  return trees.length === 0 ? undefined : trees
}

/** Split one titled-list fence body into its optional title block and list. */
function titledListParts(body: string): { title: string; items: List['children'] } | undefined {
  if (body.length > FENCE_BODY_MAX) return undefined
  let root
  try {
    root = parseBlocks(body)
  } catch (error) {
    // Same degradation as fenceLists: unreadable body stays native.
    void error
    return undefined
  }
  const children = root.children as BlockContent[]
  if (children.length === 0 || children.length > 2) return undefined
  let title = ''
  let listIndex = 0
  const first = children[0]!
  if (first.type === 'heading' || first.type === 'paragraph') {
    title = plainText(first).replace(/\s*\n\s*/gu, ' ').replace(/[：:]\s*$/u, '').trim()
    if (title.length > FENCE_TITLE_MAX) return undefined
    listIndex = 1
  }
  const list = children[listIndex]
  if (list?.type !== 'list' || list.children.length === 0) return undefined
  return { title, items: list.children }
}

/**
 * Flatten nested task items into document order (parent, then its children).
 * @param items - one list level's items.
 * @returns the depth-first item sequence, or undefined on a nested non-task item.
 */
function flattenTaskItems(items: readonly ListItem[]): ListItem[] | undefined {
  const out: ListItem[] = []
  for (const item of items) {
    out.push(item)
    for (const child of item.children) {
      if (child.type === 'list') {
        const nested = flattenTaskItems(child.children)
        if (nested === undefined) return undefined
        out.push(...nested)
      }
    }
  }
  return out
}

/**
 * `todo` fence body: optional leading heading/paragraph title, then one flat
 * GFM task list. Item extraction is the shared auto-upgrade rule (colon split
 * included), run against the FULL body so item offsets stay valid.
 * @param body - code-block content.
 * @returns the checklist payload (source = the full fence body; the upgrade
 * walk overwrites it with the fence's own source slice), or undefined on
 * non-task items or > 100 items. Tolerated deviation: nested task lists
 * flatten into the document-order item sequence.
 */
export function parseTodoFence(body: string): ChecklistSegment | undefined {
  const parts = titledListParts(body)
  if (parts === undefined) return undefined
  const nested = flattenTaskItems(parts.items)
  if (nested === undefined) return undefined
  if (nested.length > TODO_MAX_ITEMS) return undefined
  if (!nested.every(isTaskItem)) return undefined
  const items: ChecklistItem[] = []
  for (const item of nested) {
    // Same extraction as checklistEntry, but nested lists (already flattened
    // above) are skipped instead of declining the parent item.
    const entry = entryTitleBody(body, item, /^\[[ xX]\][ \t]*/u, true)
    if (entry === undefined) return undefined
    items.push({ title: entry.title, body: entry.body, checked: item.checked === true })
  }
  return { kind: 'checklist', source: body, title: parts.title, items }
}

/**
 * `timeline` fence body in either form: a flat list whose items title
 * stages, or a same-depth heading run. Both take an optional leading
 * heading/paragraph title; stage numbering comes from the view, not the
 * markers.
 * @param body - code-block content.
 * @returns the timeline payload (source = the full fence body; the upgrade
 * walk overwrites it with the fence's own source slice), or undefined when
 * neither form parses or entries fall outside 2..100.
 */
export function parseTimelineFence(body: string): TimelineSegment | undefined {
  const parts = titledListParts(body)
  if (parts === undefined) return headingTimeline(body)
  if (parts.items.length < TIMELINE_MIN_ENTRIES || parts.items.length > TIMELINE_MAX_ENTRIES) {
    return headingTimeline(body)
  }
  if (parts.items.some(isTaskItem)) return headingTimeline(body)
  const entries: TimelineEntry[] = []
  for (const item of parts.items) {
    const entry = entryTitleBody(body, item)
    if (entry === undefined) return headingTimeline(body)
    entries.push(entry)
  }
  return { kind: 'timeline', source: body, title: parts.title, entries }
}

/**
 * `timeline` fence body, heading form: >=2 same-depth headings each opening
 * one stage (its title, trailing sentence enders dropped), with the blocks
 * until the next heading as its body. The run is the shallowest depth
 * carrying >=2 headings; deeper headings fold into the stage body, and a
 * paragraph or shallower heading directly above the run is adopted as the
 * timeline title. Any other shape declines the whole fence.
 * @param body - code-block content.
 * @returns the timeline payload, or undefined outside 2..100 entries.
 */
function headingTimeline(body: string): TimelineSegment | undefined {
  if (body.length > FENCE_BODY_MAX) return undefined
  let root
  try {
    root = parseBlocks(body)
  } catch (error) {
    // Same degradation as fenceLists: unreadable body stays native.
    void error
    return undefined
  }
  const children = root.children as BlockContent[]
  const headings = children.filter(node => node.type === 'heading') as Heading[]
  if (headings.length < 2) return undefined
  const counts = new Map<number, number>()
  for (const heading of headings) counts.set(heading.depth, (counts.get(heading.depth) ?? 0) + 1)
  let runDepth = Number.POSITIVE_INFINITY
  for (const [depth, count] of counts) {
    if (count >= 2 && depth < runDepth) runDepth = depth
  }
  if (!Number.isFinite(runDepth)) return undefined
  const runStart = children.findIndex(
    node => node.type === 'heading' && (node as Heading).depth === runDepth,
  )
  let title = ''
  if (runStart === 1) {
    const lead = children[0]!
    if (lead.type === 'paragraph') {
      title = plainText(lead).replace(/\s*\n\s*/gu, ' ').replace(/[：:]\s*$/u, '').trim()
      if (title.length > FENCE_TITLE_MAX) return undefined
    } else if (lead.type === 'heading' && (lead as Heading).depth < runDepth) {
      title = plainText(lead).trim()
    } else {
      return undefined
    }
  } else if (runStart > 1) {
    return undefined
  }
  const entries: TimelineEntry[] = []
  let stageTitle: string | undefined
  let bodyParts: string[] = []
  const closeStage = (): void => {
    if (stageTitle !== undefined) entries.push({ title: stageTitle, body: bodyParts.join('\n\n') })
  }
  for (let i = runStart; i < children.length; i++) {
    const node = children[i]!
    if (node.type === 'heading') {
      const depth = (node as Heading).depth
      if (depth === runDepth) {
        closeStage()
        const headingTitle = plainText(node).trim().replace(/[。．！？!?\s]+$/u, '')
        if (headingTitle === '') return undefined
        stageTitle = headingTitle
        bodyParts = []
      } else if (depth > runDepth) {
        // A deeper heading stays part of the current stage's body markdown.
        if (stageTitle === undefined) return undefined
        const source = nodeSource(body, node).trim()
        if (source !== '') bodyParts.push(source)
      } else {
        return undefined
      }
    } else if (stageTitle === undefined) {
      return undefined
    } else {
      const source = nodeSource(body, node).trim()
      if (source !== '') bodyParts.push(source)
    }
  }
  closeStage()
  if (entries.length < TIMELINE_MIN_ENTRIES || entries.length > TIMELINE_MAX_ENTRIES) return undefined
  return { kind: 'timeline', source: body, title, entries }
}

/**
 * `prototype-choices` fence body: the tab grammar (`@` header lines opening
 * option pages, inner code fences kept literal) preceded by an optional
 * single heading/paragraph title block.
 * @param body - code-block content.
 * @returns the payload with title and options, or undefined when the preamble
 * is more than one title block or the tab grammar declines.
 */
export function parseChoicesFence(body: string): ChoicesSegment | undefined {
  const lines = body.split('\n')
  let inInnerFence = false
  let splitAt = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (/^(```|~~~)/u.test(line)) inInnerFence = !inInnerFence
    if (!inInnerFence && /^@/u.test(line)) { splitAt = i; break }
  }
  if (splitAt === -1) return undefined
  const preamble = lines.slice(0, splitAt).join('\n').trim()
  let title = ''
  if (preamble !== '') {
    let root
    try {
      root = parseBlocks(preamble)
    } catch (error) {
      void error
      return undefined
    }
    const children = root.children as BlockContent[]
    const lead = children[0]
    if (children.length !== 1 || (lead.type !== 'heading' && lead.type !== 'paragraph')) return undefined
    title = plainText(lead).replace(/\s*\n\s*/gu, ' ').replace(/[：:]\s*$/u, '').trim()
    if (title.length > FENCE_TITLE_MAX) return undefined
  }
  const choices = parseTabFence(lines.slice(splitAt).join('\n'))
  if (choices === undefined) return undefined
  return { kind: 'choices', source: body, title, choices }
}

/**
 * `tab` fence body: each non-indented `@标签` line outside inner code fences
 * opens one page; everything until the next header is that page's markdown,
 * blank lines included. A non-blank line before the first header declines
 * the whole fence (content is never dropped silently).
 * @param body - code-block content.
 * @returns the pages, or undefined outside 2..30 headers, on an empty or
 * over-long label, or past the body cap.
 */
export function parseTabFence(body: string): TabSpec[] | undefined {
  if (body.length > FENCE_BODY_MAX) return undefined
  const tabs: TabSpec[] = []
  let parts: string[] = []
  let inInnerFence = false
  const closePage = (): void => {
    const current = tabs[tabs.length - 1]
    if (current === undefined) return
    tabs[tabs.length - 1] = {
      label: current.label,
      body: parts.join('\n').replace(/^[ \t]*\n/u, '').replace(/\s+$/u, ''),
    }
  }
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/u.test(line)) inInnerFence = !inInnerFence
    if (!inInnerFence && /^@/u.test(line)) {
      closePage()
      const label = stripInline(line.replace(/^@[ \t]*/u, '')).trim()
      if (label === '' || label.length > TAB_LABEL_MAX) return undefined
      tabs.push({ label, body: '' })
      parts = []
      continue
    }
    if (tabs.length === 0 && line.trim() !== '') return undefined
    parts.push(line)
  }
  closePage()
  if (tabs.length < TAB_MIN_TABS || tabs.length > TAB_MAX_TABS) return undefined
  return tabs
}

/** Box header: `N.`/`N.M.`/`N`/`N.M` (trailing dot optional) + optional `[fill]` + first-line text. */
const STACK_HEADER = /^(\d+)(?:\.(\d+))?\.?[ \t]*(?:\[([^\]]*)\][ \t]*)?(.*)$/

/** A standalone connector/rule line (arrows, bars, dashes) between boxes. */
const STACK_CONNECTOR = /^[ \t]*(?:[-–—=─═>→⇒↓⇓|│]+)[ \t]*$/u

/**
 * `stack` fence body: numbered boxes; same first number shares one layer row.
 * @param body - code-block content.
 * @returns layers sorted ascending, or undefined when any unindented line is
 * not a box header or connector, a fill does not resolve, or no box parses.
 * Tolerated deviations: connector-only lines are ignored, the box header's
 * trailing dot may be missing, hex fills may omit the leading `#`, and lines
 * inside a flush-left inner code fence stay box content.
 */
export function parseStackFence(body: string): StackLayerSpec[] | undefined {
  const lines = body.split('\n')
  interface Draft { layer: number; fill: string | undefined; parts: string[] }
  const drafts: Draft[] = []
  let current: Draft | undefined
  // Lines inside a flush-left inner code fence are box content however they
  // are indented (the same nesting rule the tab fence applies).
  let inInnerFence = false
  for (const line of lines) {
    if (/^(```|~~~)/u.test(line)) {
      if (current === undefined) return undefined
      inInnerFence = !inInnerFence
      current.parts.push(line)
      continue
    }
    if (inInnerFence) {
      current.parts.push(line.replace(/^[ \t]+/u, ''))
      continue
    }
    if (line.trim() === '') {
      current?.parts.push('')
      continue
    }
    if (STACK_CONNECTOR.test(line)) continue
    if (/^[ \t]/u.test(line)) {
      if (current === undefined) return undefined
      current.parts.push(line.replace(/^[ \t]+/u, ''))
      continue
    }
    const match = STACK_HEADER.exec(line)
    if (match === null) return undefined
    const fill = match[3] === undefined ? undefined : normalizeFill(match[3])
    if (match[3] !== undefined && fill === undefined) return undefined
    current = { layer: Number(match[1]), fill, parts: [match[4] ?? ''] }
    drafts.push(current)
  }
  if (drafts.length === 0) return undefined
  const byLayer = new Map<number, { content: string; fill: string | undefined }[]>()
  for (const draft of drafts) {
    let content = draft.parts.join('\n').replace(/^[ \t]*\n/u, '').replace(/\s+$/u, '')
    if (content.trim() === '') content = ''
    const boxes = byLayer.get(draft.layer) ?? []
    boxes.push({ content, fill: draft.fill })
    byLayer.set(draft.layer, boxes)
  }
  return [...byLayer.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, boxes]) => ({ index, boxes }))
}
