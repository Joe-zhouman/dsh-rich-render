/**
 * The rule engine: cut one settled text block into upgrade segments.
 *
 * Pure, synchronous, total. The walk keeps a cursor over the top-level mdast
 * nodes; at each position the matchers try in a fixed order (explicit fences
 * first, then checklist, cards, table, callout) and a match
 * consumes the nodes it owns. Unclaimed nodes accumulate
 * into a native run whose exact source slice becomes a native segment — the
 * degradation guarantee. Any matcher that throws or returns an inconsistent
 * span simply does not match (the caller also wraps the whole call).
 */

import type { BlockContent, Blockquote, Heading, Image, List, ListItem, Paragraph, Table } from 'mdast'
import type { Root } from 'mdast'
import { nodeSource, parseBlocks, plainText } from './parse.ts'
import { CARD_TITLE_MAX, checklistEntry, stripInline } from './checklist-items.ts'
import { decideChart } from './chart.ts'
import type {
  CalloutSegment, CalloutType, CardSpec, CardsSegment, ChecklistItem, ChecklistSegment, ColumnAlign,
  ChoicesSegment, ImageSegment, MatplotlibSegment, MindmapSegment, StackSegment, TabSegment, TableSegment,
  TableSpec, TimelineSegment, TreeSegment, UpgradeSegment,
} from './segments.ts'
import {
  parseChoicesFence, parseMindmapFence, parseStackFence, parseTabFence, parseTimelineFence, parseTodoFence,
  parseTreeFence,
} from './fence.ts'

/** Sentence enders that split a card entry's heading from its body. */
const SENTENCE_ENDERS = '。．！？!?'

/** Index of the first sentence ender standing alone (a `.` counts only before whitespace or end). */
function sentenceEndIndex(src: string): number {
  for (let i = 0; i < src.length; i++) {
    const char = src[i]
    if (char === undefined) continue
    if (SENTENCE_ENDERS.includes(char)) return i
    if (char === '.') {
      const next = src[i + 1]
      if (next === undefined || next === ' ' || next === '\n' || next === '\t') return i
    }
  }
  return -1
}

/** Offset span of one top-level node; empty span when positions are missing. */
function span(text: string, index: number, nodes: readonly BlockContent[]): { start: number; end: number } {
  const node = nodes[index]
  const start = node?.position?.start.offset
  const end = node?.position?.end.offset
  if (node === undefined || start === undefined || end === undefined || start > end || end > text.length) {
    return { start: -1, end: -1 }
  }
  return { start, end }
}

/** Whether one list item carries a GFM task-list checkbox. */
function isTaskItem(item: ListItem): boolean {
  return item.checked === true || item.checked === false
}

/** Whether any item of one list carries a task checkbox (mixed lists included). */
function hasTaskItems(list: List): boolean {
  return list.children.some(isTaskItem)
}

/**
 * Flatten one block's text into the checklist's single title line: line
 * breaks collapse to spaces and a trailing colon is dropped, because the
 * block reads as a lead-in sentence rather than a heading.
 * @param source - plain text of one block.
 * @returns the title line, or undefined when nothing remains.
 */
function flattenChecklistTitle(source: string): string | undefined {
  const line = source.replace(/\s*\n\s*/gu, ' ').replace(/[：:]\s*$/u, '').trim()
  return line === '' ? undefined : line
}

/**
 * Text of the block immediately above a checklist. A checklist never appears
 * without a lead-in, so any of these block forms supplies the title: a
 * heading at any depth, a paragraph, or a list (flattened with `；`). Task
 * lists and non-text blocks cannot introduce one.
 * @param node - the top-level block preceding the task list.
 * @returns the marker-free title line, or undefined when the block cannot lead.
 */
function checklistLeadTitle(node: BlockContent): string | undefined {
  if (node.type === 'heading' || node.type === 'paragraph') {
    return flattenChecklistTitle(plainText(node))
  }
  if (node.type !== 'list' || hasTaskItems(node)) return undefined
  const parts = node.children.map(item => plainText(item).trim()).filter(part => part !== '')
  if (parts.length === 0) return undefined
  return flattenChecklistTitle(parts.join('；'))
}

/** Fence languages whose blocks the paired-tag form also accepts. */
const TAG_ENV_NAMES: ReadonlySet<string> = new Set([
  'mindmap', 'stack', 'tab', 'timeline', 'tree', 'todo', 'prototype-choices', 'matplotlib',
])

/**
 * Result of parsing one environment body: the upgraded segment carrying the
 * caller's source slice, `'body'` when the fence form degrades to its body as
 * native markdown, or undefined when the block stays native.
 */
type EnvironmentParse = UpgradeSegment | 'body' | undefined

/**
 * Parse one environment body under its fence language. Both the fence path and
 * the paired-tag alias path route through here, so a tag block produces the
 * same segment a fence would.
 * @param lang - lowercased fence language of the block.
 * @param body - raw markdown inside the fence or between the tags.
 * @param source - exact source slice the segment owns.
 * @returns the upgraded segment, the body-degradation marker, or undefined.
 */
function parseEnvironment(lang: string, body: string, source: string): EnvironmentParse {
  if (lang === 'mindmap') {
    const trees = parseMindmapFence(body)
    if (trees === undefined) return 'body'
    const segment: MindmapSegment = { kind: 'mindmap', source, trees }
    return segment
  }
  if (lang === 'tree') {
    const trees = parseTreeFence(body)
    if (trees === undefined) return 'body'
    const segment: TreeSegment = { kind: 'tree', source, trees }
    return segment
  }
  if (lang === 'todo') {
    const parsed = parseTodoFence(body)
    if (parsed === undefined) return 'body'
    const segment: ChecklistSegment = { ...parsed, source }
    return segment
  }
  if (lang === 'timeline') {
    const parsed = parseTimelineFence(body)
    if (parsed === undefined) return 'body'
    const segment: TimelineSegment = { ...parsed, source }
    return segment
  }
  if (lang === 'stack') {
    const layers = parseStackFence(body)
    if (layers === undefined) return undefined
    const segment: StackSegment = { kind: 'stack', source, layers }
    return segment
  }
  if (lang === 'tab') {
    const tabs = parseTabFence(body)
    if (tabs === undefined) return 'body'
    const segment: TabSegment = { kind: 'tab', source, tabs }
    return segment
  }
  if (lang === 'prototype-choices') {
    const parsed = parseChoicesFence(body)
    if (parsed === undefined) return 'body'
    const segment: ChoicesSegment = { ...parsed, source }
    return segment
  }
  if (lang === 'matplotlib') {
    if (body.trim() === '') return undefined
    const segment: MatplotlibSegment = { kind: 'matplotlib', source, code: body }
    return segment
  }
  return undefined
}

/** Explicit fences first: the model chose the structure, so they outrank every heuristic. */
function matchFence(text: string, nodes: readonly BlockContent[], i: number): RuleMatch | undefined {
  const code = nodes[i]
  if (code?.type !== 'code') return undefined
  const codeSpan = span(text, i, nodes)
  if (codeSpan.start === -1) return undefined
  const source = text.slice(codeSpan.start, codeSpan.end)
  const parsed = parseEnvironment((code.lang ?? '').trim().toLowerCase(), code.value, source)
  if (parsed === undefined) return undefined
  // mindmap/tree/todo/timeline/tab/choices degrade to their BODY as plain markdown
  // (a list reads as a list); stack and matplotlib degrade to the fenced code
  // block itself.
  const segment: UpgradeSegment = parsed === 'body' ? { kind: 'native', text: code.value, source } : parsed
  return { segment, start: i, consume: 1 }
}

/** Opening tag of a paired-tag block: the tag alone on its line. */
const TAG_OPEN = /^<([A-Za-z][A-Za-z0-9-]*)>[ \t]*$/u
/** Closing tag of a paired-tag block: the tag alone on its line. */
const TAG_CLOSE = /^<\/([A-Za-z][A-Za-z0-9-]*)>[ \t]*$/u
/** Fence opener while scanning a body: 3+ backticks or tildes, indented up to 3 spaces. */
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/u
/** Fence closer: same character as its opener, at least as long, nothing else after. */
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/u

/** One paired-tag environment block located in a text block. */
interface TagBlock {
  /** Offset of the opening tag line's first character. */
  readonly start: number
  /** Offset just past the closing tag line's last character. */
  readonly end: number
  /** Lowercased environment name shared by both tags. */
  readonly name: string
  /** Source lines strictly between the tags, without their newlines. */
  readonly body: string
}

/**
 * Locate paired-tag environment blocks (`<stack>…</stack>`) at line starts,
 * outside any fenced code block. The tag form is a tolerated alias the persona
 * never teaches: the tags are markup to this renderer, so the block's exact
 * source slice is kept for the native fallback while its body feeds the same
 * parser as a fence. Unclosed tags and names outside the alias set are ignored,
 * leaving the text untouched. Closing lines are indexed once, so the walk stays
 * linear on hostile input instead of rescanning the tail per opening tag.
 * @param text - complete markdown source of one text block.
 * @returns non-overlapping blocks in source order.
 */
function findTagBlocks(text: string): readonly TagBlock[] {
  const lines = text.split('\n')
  const starts: number[] = []
  let offset = 0
  for (const line of lines) {
    starts.push(offset)
    offset += line.length + 1
  }
  const hidden = fenceLines(lines)
  const closes = new Map<string, number[]>()
  for (let i = 0; i < lines.length; i++) {
    if (hidden[i] === true) continue
    const close = TAG_CLOSE.exec(lines[i] ?? '')
    if (close === null) continue
    const name = close[1]!.toLowerCase()
    if (!TAG_ENV_NAMES.has(name)) continue
    const list = closes.get(name)
    if (list === undefined) closes.set(name, [i])
    else list.push(i)
  }
  const blocks: TagBlock[] = []
  let i = 0
  while (i < lines.length) {
    if (hidden[i] === true) { i++; continue }
    const open = TAG_OPEN.exec(lines[i] ?? '')
    const name = open?.[1]?.toLowerCase()
    if (open === null || name === undefined || !TAG_ENV_NAMES.has(name)) { i++; continue }
    const close = nextIndex(closes.get(name), i)
    if (close === undefined) { i++; continue }
    blocks.push({
      start: starts[i]!,
      end: starts[close]! + (lines[close] ?? '').length,
      name,
      body: lines.slice(i + 1, close).join('\n'),
    })
    i = close + 1
  }
  return blocks
}

/**
 * Mark the lines a fenced code block owns (its opener, body, and closer) so a
 * tag-looking line inside an example fence is never read as a block delimiter.
 * @param lines - the text block's lines.
 * @returns one flag per line, true when the line belongs to a fence.
 */
function fenceLines(lines: readonly string[]): boolean[] {
  const hidden = lines.map(() => false)
  let fence: { readonly char: string; readonly length: number } | undefined
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (fence !== undefined) {
      hidden[i] = true
      if (closesFence(line, fence)) fence = undefined
      continue
    }
    const open = FENCE_OPEN.exec(line)
    if (open !== null) {
      hidden[i] = true
      fence = { char: open[1]![0]!, length: open[1]!.length }
    }
  }
  return hidden
}

/** Whether one line closes the currently open fenced code block. */
function closesFence(line: string, fence: { readonly char: string; readonly length: number }): boolean {
  const close = FENCE_CLOSE.exec(line)
  return close !== null && close[1]![0] === fence.char && close[1]!.length >= fence.length
}

/**
 * First index in a sorted line list greater than the opening tag's line.
 * @param list - sorted closing-line indices for one environment name.
 * @param after - opening tag's line index.
 * @returns that index, or undefined when the block is unclosed.
 */
function nextIndex(list: readonly number[] | undefined, after: number): number | undefined {
  if (list === undefined) return undefined
  let low = 0
  let high = list.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (list[middle]! <= after) low = middle + 1
    else high = middle
  }
  return low < list.length ? list[low] : undefined
}

/**
 * Render one paired-tag block through its environment parser, producing the
 * exact segment a fence with the same body would produce. The span stays the
 * original tag slice, so a component failure shows the text the model wrote.
 * @param text - complete markdown source of one text block.
 * @param block - one located tag block.
 * @returns the upgraded segment, or undefined to leave the block native.
 */
function upgradeTagBlock(text: string, block: TagBlock): UpgradeSegment | undefined {
  const parsed = parseEnvironment(block.name, block.body, text.slice(block.start, block.end))
  return parsed === 'body' ? undefined : parsed
}

/**
 * A flat GFM task list (>=2 items, every item checked or unchecked) upgrades
 * to an interactive checklist. The block immediately above it introduces the
 * card and is consumed with the list; a block already claimed by an earlier
 * upgrade is never adopted a second time.
 */
function matchChecklist(
  text: string,
  nodes: readonly BlockContent[],
  i: number,
  claimedUntil: number,
): RuleMatch | undefined {
  const list = nodes[i]
  if (list?.type !== 'list' || list.children.length < 2) return undefined
  if (!list.children.every(isTaskItem)) return undefined
  const items: ChecklistItem[] = []
  for (const item of list.children) {
    const entry = checklistEntry(text, item)
    if (entry === undefined) return undefined
    items.push(entry)
  }
  const listSpan = span(text, i, nodes)
  if (listSpan.start === -1) return undefined
  const previousIndex = i - 1
  const previous = previousIndex >= claimedUntil ? nodes[previousIndex] : undefined
  const title = previous === undefined ? undefined : checklistLeadTitle(previous)
  const start = title === undefined ? listSpan.start : span(text, previousIndex, nodes).start
  if (start === -1) return undefined
  const segment: ChecklistSegment = {
    kind: 'checklist',
    source: text.slice(start, listSpan.end),
    title: title ?? '',
    items,
  }
  return { segment, start: title === undefined ? i : previousIndex, consume: 1 }
}

/** H2/H3 heading directly followed by an ordered list of >=2 titled entries. */
function matchCards(text: string, nodes: readonly BlockContent[], i: number): RuleMatch | undefined {
  const heading = nodes[i]
  const list = nodes[i + 1]
  if (heading?.type !== 'heading' || (heading.depth !== 2 && heading.depth !== 3)) return undefined
  if (plainText(heading).trim() === '') return undefined
  if (list?.type !== 'list' || list.ordered !== true || list.children.length < 2) return undefined
  // Task syntax is an explicit checklist request; cards must not swallow it.
  if (hasTaskItems(list)) return undefined
  const cards: CardSpec[] = []
  for (const item of list.children) {
    const first = item.children[0]
    if (first === undefined || first.type !== 'paragraph') return undefined
    const paraSource = nodeSource(text, first)
    const end = sentenceEndIndex(paraSource)
    const titleSource = (end === -1 ? paraSource : paraSource.slice(0, end)).trim()
    const title = stripInline(titleSource).trim()
    if (title === '' || title.length > CARD_TITLE_MAX) return undefined
    const rest = end === -1 ? '' : paraSource.slice(end + 1).trim()
    const later: string[] = []
    for (const child of item.children.slice(1)) {
      const source = nodeSource(text, child).trim()
      if (source !== '') later.push(source)
    }
    const body = [rest, ...later].filter(part => part !== '').join('\n\n')
    cards.push({ title, body })
  }
  const headSpan = span(text, i, nodes)
  const listSpan = span(text, i + 1, nodes)
  if (headSpan.start === -1 || listSpan.start === -1) return undefined
  const segment: CardsSegment = {
    kind: 'cards',
    source: text.slice(headSpan.start, listSpan.end),
    title: plainText(heading).trim(),
    cards,
  }
  return { segment, start: i, consume: 2 }
}

/** GitHub alert marker alone on the quote's first line, case-insensitive. */
const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/iu

/**
 * Drop the blockquote marker each continuation line carries in a raw child
 * slice (mdast paragraph spans keep the later lines' `> ` prefixes).
 * @param source - one child's raw source slice.
 * @returns the same lines without their leading quote markers.
 */
function unquoteLines(source: string): string {
  return source.split('\n').map(line => line.replace(/^>[ \t]?/u, '')).join('\n')
}

/**
 * One blockquote per callout. A GitHub alert marker (`[!NOTE]` family) alone
 * on the quote's first line types the callout and is dropped from its body;
 * anything else keeps the plain untyped box.
 */
function matchCallout(text: string, nodes: readonly BlockContent[], i: number): RuleMatch | undefined {
  const quote = nodes[i]
  if (quote?.type !== 'blockquote') return undefined
  const parts: string[] = []
  let type: CalloutType | undefined
  for (let index = 0; index < quote.children.length; index++) {
    const child = quote.children[index]
    if (child === undefined) continue
    let source = nodeSource(text, child).trim()
    if (source === '') continue
    if (type === undefined && index === 0 && child.type === 'paragraph') {
      const newline = source.indexOf('\n')
      const firstLine = newline === -1 ? source : source.slice(0, newline)
      const marker = ALERT_MARKER.exec(firstLine)
      if (marker !== null) {
        type = marker[1]!.toLowerCase() as CalloutType
        source = (newline === -1 ? '' : source.slice(newline + 1)).trim()
        if (source === '') continue
      }
    }
    parts.push(unquoteLines(source))
  }
  const quoteSpan = span(text, i, nodes)
  if (quoteSpan.start === -1) return undefined
  const segment: CalloutSegment = {
    kind: 'callout',
    source: text.slice(quoteSpan.start, quoteSpan.end),
    type,
    body: parts.join('\n\n'),
  }
  return { segment, start: i, consume: 1 }
}

/** One table per styled-table segment (chart decision rides along). */
function matchTable(text: string, nodes: readonly BlockContent[], i: number): RuleMatch | undefined {
  const table = nodes[i]
  if (table?.type !== 'table') return undefined
  const grid = table.children
  if (grid.length === 0) return undefined
  const readRow = (row: typeof grid[number]): string[] | undefined => {
    if (row.type !== 'tableRow') return undefined
    const cells: string[] = []
    for (const cell of row.children) {
      if (cell.type !== 'tableCell') return undefined
      cells.push(plainText(cell).trim())
    }
    return cells
  }
  const headerRow = readRow(grid[0] as typeof grid[number])
  if (headerRow === undefined || headerRow.length === 0) return undefined
  const rows: string[][] = []
  for (const row of grid.slice(1)) {
    const cells = readRow(row)
    if (cells === undefined) return undefined
    rows.push(cells)
  }
  const aligns: ColumnAlign[] = []
  for (const align of table.align ?? []) aligns.push(align ?? null)
  const tableSpan = span(text, i, nodes)
  if (tableSpan.start === -1) return undefined
  // Same container-title adoption as cards/mindmap/timeline: an immediately
  // preceding H2/H3 heading becomes the table's title.
  const previous = nodes[i - 1]
  const container = previous !== undefined && previous.type === 'heading' && (previous.depth === 2 || previous.depth === 3)
    ? previous as Heading
    : undefined
  const firstIndex = container === undefined ? i : i - 1
  const firstSpan = span(text, firstIndex, nodes)
  if (firstSpan.start === -1) return undefined
  const spec: TableSpec = { headers: headerRow, rows, aligns }
  const chart = decideChart(spec)
  const segment: TableSegment = {
    kind: 'table',
    source: text.slice(firstSpan.start, tableSpan.end),
    table: spec,
    title: container === undefined ? '' : plainText(container).trim(),
    chart,
  }
  return { segment, start: firstIndex, consume: 1 }
}

/**
 * One standalone image paragraph upgrades to the framed image card. The
 * paragraph pass above fences body images off as their own paragraphs, so
 * any image that sits alone (authored or rewritten) lands here; a paragraph
 * mixing an image with prose stays native. Resolution is the view's concern:
 * an undisplayable destination degrades inside the card.
 */
function matchImage(text: string, nodes: readonly BlockContent[], i: number): RuleMatch | undefined {
  const paragraph = nodes[i]
  if (paragraph?.type !== 'paragraph') return undefined
  let image: Image | undefined
  for (const child of paragraph.children) {
    if (child.type === 'text') {
      if (child.value.trim() !== '') return undefined
      continue
    }
    if (child.type === 'image') {
      if (image !== undefined) return undefined
      image = child
      continue
    }
    return undefined
  }
  if (image === undefined) return undefined
  const paragraphSpan = span(text, i, nodes)
  if (paragraphSpan.start === -1) return undefined
  const segment: ImageSegment = {
    kind: 'image',
    source: text.slice(paragraphSpan.start, paragraphSpan.end),
    url: image.url,
    alt: image.alt ?? '',
  }
  return { segment, start: i, consume: 1 }
}

/** One rule match: the segment, where it starts, and how many nodes it consumed. */
interface RuleMatch {
  readonly segment: UpgradeSegment
  /** First top-level node index the segment owns (may precede the cursor). */
  readonly start: number
  /** How far the cursor advances; adoption reaches back via `start` only. */
  readonly consume: number
}

/** Try every rule at one cursor position; the winner owns its consumed span. */
function matchAt(
  text: string,
  nodes: readonly BlockContent[],
  i: number,
  claimedUntil: number,
): RuleMatch | undefined {
  return tryMatch(() => matchFence(text, nodes, i))
    ?? tryMatch(() => matchImage(text, nodes, i))
    ?? tryMatch(() => matchChecklist(text, nodes, i, claimedUntil))
    ?? tryMatch(() => matchCards(text, nodes, i))
    ?? tryMatch(() => matchTable(text, nodes, i))
    ?? tryMatch(() => matchCallout(text, nodes, i))
}

/** Run one matcher, converting any throw into a non-match. */
function tryMatch(match: () => RuleMatch | undefined): RuleMatch | undefined {
  try {
    const rule = match()
    if (rule === undefined || rule.segment.source.trim() === '') return undefined
    return rule
  } catch {
    return undefined
  }
}

/**
 * Message-size ceiling for the rule walk; beyond it the block stays native.
 * 192KB sits far above any legitimate upgradeable shape (a max-size 550x10
 * table is ~85KB) and bounds this layer's added parse against quadratic
 * hostile inputs the platform renderer itself chokes on.
 */
const WALK_TEXT_MAX = 192 * 1024

/**
 * Decide the segment layout of one settled assistant text block. Pure and
 * total: any input returns at least one native segment covering the text.
 * Inputs past WALK_TEXT_MAX degrade whole-native BEFORE the mdast parse —
 * the parse itself is quadratic on hostile shapes, and the platform renderer
 * still draws the text exactly as it would without us.
 *
 * Paired-tag environment blocks are cut out first and rendered through the
 * same environment parser the fences use; the markdown between them keeps the
 * ordinary rule walk. The alias is never taught in the persona, so it only
 * keeps an already-emitted tag block renderable.
 * @param text - complete markdown source of one text block.
 * @returns consecutive segments; native fallback covers the whole text.
 */
export function upgradeText(text: string): UpgradeSegment[] {
  if (text.length > WALK_TEXT_MAX) {
    return [{ kind: 'native', text, source: text }]
  }
  let blocks: readonly TagBlock[]
  try {
    blocks = findTagBlocks(text)
  } catch {
    return [{ kind: 'native', text, source: text }]
  }
  if (blocks.length === 0) return upgradeMarkdown(text)
  const out: UpgradeSegment[] = []
  try {
    let cursor = 0
    for (const block of blocks) {
      if (block.start > cursor) pushSegments(out, upgradeMarkdown(text.slice(cursor, block.start)))
      const source = text.slice(block.start, block.end)
      out.push(upgradeTagBlock(text, block) ?? { kind: 'native', text: source, source })
      cursor = block.end
    }
    if (cursor < text.length) pushSegments(out, upgradeMarkdown(text.slice(cursor)))
  } catch {
    return [{ kind: 'native', text, source: text }]
  }
  return out.length === 0 ? [{ kind: 'native', text, source: text }] : out
}

/**
 * Decide the layout of one markdown run with the ordinary rule walk.
 * @param text - markdown source of one run.
 * @returns consecutive segments; native fallback covers the run.
 */
function upgradeMarkdown(text: string): UpgradeSegment[] {
  let nodes: readonly BlockContent[]
  try {
    nodes = asBlockContent(parseBlocks(text))
  } catch {
    return [{ kind: 'native', text, source: text }]
  }
  const out: UpgradeSegment[] = []
  let nativeFrom = -1
  const flushNative = (toExclusive: number): void => {
    if (nativeFrom === -1 || toExclusive <= nativeFrom) { nativeFrom = -1; return }
    const from = span(text, nativeFrom, nodes)
    const to = span(text, toExclusive - 1, nodes)
    if (from.start === -1 || to.start === -1) {
      // Position bookkeeping failed somewhere in the run: degrade the whole
      // document natively instead of emitting a wrong slice.
      out.length = 0
      out.push({ kind: 'native', text, source: text })
      nativeFrom = -1
      return
    }
    const slice = text.slice(from.start, to.end)
    if (slice.trim() !== '') out.push({ kind: 'native', text: slice, source: slice })
    nativeFrom = -1
  }
  try {
    let i = 0
    // First node not owned by an upgraded segment: a checklist may adopt the
    // block just above it only while that block is still unclaimed.
    let claimedUntil = 0
    while (i < nodes.length) {
      const match = matchAt(text, nodes, i, claimedUntil)
      if (match !== undefined) {
        flushNative(match.start)
        out.push(match.segment)
        i += match.consume
        claimedUntil = i
      } else {
        if (nativeFrom === -1) nativeFrom = i
        i++
      }
    }
    flushNative(nodes.length)
  } catch {
    return [{ kind: 'native', text, source: text }]
  }
  if (out.length === 0) return [{ kind: 'native', text, source: text }]
  return out
}

/** Append the non-empty segments of one markdown run, dropping blank padding. */
function pushSegments(out: UpgradeSegment[], segments: readonly UpgradeSegment[]): void {
  for (const segment of segments) {
    if (segment.kind === 'native' && segment.text.trim() === '') continue
    out.push(segment)
  }
}

/** View of the parser's root children the walk indexes over. */
function asBlockContent(root: Root): readonly BlockContent[] {
  return root.children as BlockContent[]
}

/** Re-exported type shorthands used by tests and later milestones. */
export type { Heading, List, Paragraph, Table, Blockquote }
