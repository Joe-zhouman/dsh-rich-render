/**
 * Upgrade segment model: the rule engine's output contract.
 *
 * A settled assistant text block is cut into consecutive segments; each is
 * either native markdown (rendered by the platform MarkdownText, the
 * degradation guarantee) or one upgraded component spec. Every segment
 * carries its exact source slice so a component failure degrades exactly
 * that segment back to native markdown. The v1 rule set is pure and
 * synchronous; the decide() face is the seam a future decision model
 * implements (requirement doc section 4): same signature, async allowed,
 * one call per message, rules as the fallback.
 */

/** Base every segment shares: the markdown source this segment owns. */
export interface SegmentSource {
  readonly source: string
}

/** A run of markdown no rule claimed; rendered natively. */
export interface NativeSegment extends SegmentSource {
  readonly kind: 'native'
  /** The segment source; identical to `source` for native runs. */
  readonly text: string
}

/** One card of a card group. */
export interface CardSpec {
  /** Extracted entry heading (the item's first sentence). */
  readonly title: string
  /** Markdown body after the title sentence (may be empty). */
  readonly body: string
}

/** H2/H3 heading + immediately following ordered list, upgraded to cards. */
export interface CardsSegment extends SegmentSource {
  readonly kind: 'cards'
  /** The group heading's text, when the heading carried text. */
  readonly title: string
  readonly cards: readonly CardSpec[]
}

/** GitHub alert flavors a typed callout carries (`[!NOTE]` marker family). */
export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

/** Blockquote upgraded to a callout box; a GitHub alert marker types it. */
export interface CalloutSegment extends SegmentSource {
  readonly kind: 'callout'
  /** Alert marker on the quote's first line; undefined for a plain quote. */
  readonly type: CalloutType | undefined
  /** Markdown inside the quote (without the `>` markers and marker line). */
  readonly body: string
}

/** Cell alignment a GFM table column declares. */
export type ColumnAlign = 'left' | 'center' | 'right' | null

/** Parsed GFM table grid. */
export interface TableSpec {
  readonly headers: readonly string[]
  readonly rows: readonly (readonly string[])[]
  readonly aligns: readonly ColumnAlign[]
}

/** Table upgraded to the styled dual-view presentation. */
export interface TableSegment extends SegmentSource {
  readonly kind: 'table'
  readonly table: TableSpec
  /** Container heading adopted above the table; empty for none. */
  readonly title: string
  /** Chart the decision tree picked for this grid; absent stays table-only. */
  readonly chart: import('./chart.ts').ChartSpec | undefined
}

/** One actionable line of a checklist. */
export interface ChecklistItem {
  /** Entry title (inline markup stripped; TeX preserved). */
  readonly title: string
  /** Markdown description below the title (may be empty). */
  readonly body: string
  /** Initial checked state from the task-list marker. */
  readonly checked: boolean
}

/** A flat GFM task list, upgraded to a checklist with live local progress. */
export interface ChecklistSegment extends SegmentSource {
  readonly kind: 'checklist'
  /** Container heading adopted above the list; empty for none. */
  readonly title: string
  readonly items: readonly ChecklistItem[]
}

/** Discriminated union of every upgrade this renderer can emit. */
export type UpgradeSegment =
  | NativeSegment
  | CardsSegment
  | CalloutSegment
  | TableSegment
  | TimelineSegment
  | MindmapSegment
  | ChecklistSegment
  | TreeSegment
  | StackSegment
  | TabSegment
  | ChoicesSegment
  | MatplotlibSegment

/** One stage of an explicit `timeline` fence. */
export interface TimelineEntry {
  /** The stage title (the item's first line). */
  readonly title: string
  /** Markdown body of the stage (the item's remaining lines and blocks). */
  readonly body: string
}

/** The explicit `timeline` fence: a titled sequence of stages on one rail. */
export interface TimelineSegment extends SegmentSource {
  readonly kind: 'timeline'
  /** Title block inside the fence (heading or paragraph); empty for none. */
  readonly title: string
  readonly entries: readonly TimelineEntry[]
}

/** One node of a mindmap tree. */
export interface MindmapNodeSpec {
  readonly label: string
  readonly children: readonly MindmapNodeSpec[]
}

/** A multi-root mindmap fence; the auto-upgrade form is retired. */
export interface MindmapSegment extends SegmentSource {
  readonly kind: 'mindmap'
  /** One left-to-right tree per fence root; stacked vertically. */
  readonly trees: readonly MindmapNodeSpec[]
}

/** One entry of a file/directory tree fence. */
export interface TreeEntrySpec {
  /** Entry name; folders keep their trailing `/`. */
  readonly name: string
  /** A folder ends with `/` or carries children. */
  readonly folder: boolean
  readonly children: readonly TreeEntrySpec[]
}

/** A `tree` fence: nested unordered list rendered as a collapsible file forest. */
export interface TreeSegment extends SegmentSource {
  readonly kind: 'tree'
  readonly trees: readonly TreeEntrySpec[]
}

/** One box of a `stack` fence: layer-local content plus its normalized fill. */
export interface StackBoxSpec {
  /** Box body: header first line (if any) plus indented lines, newline-joined. */
  readonly content: string
  /** Normalized `#rrggbb` fill; undefined uses the theme surface. */
  readonly fill: string | undefined
}

/** One layer of a `stack` fence; boxes share a row with equal heights. */
export interface StackLayerSpec {
  readonly index: number
  readonly boxes: readonly StackBoxSpec[]
}

/** A `stack` fence: numbered boxes stacked by layer, no arrows. */
export interface StackSegment extends SegmentSource {
  readonly kind: 'stack'
  readonly layers: readonly StackLayerSpec[]
}

/** One page of a `tab` fence: a label plus its markdown body. */
export interface TabSpec {
  /** Button text after the `@` marker (plain text). */
  readonly label: string
  /** Markdown between this tab's header line and the next. */
  readonly body: string
}

/** The explicit `tab` fence: labeled pages behind one segmented control. */
export interface TabSegment extends SegmentSource {
  readonly kind: 'tab'
  readonly tabs: readonly TabSpec[]
}

/** The explicit `prototype-choices` fence: options with rich showcases. */
export interface ChoicesSegment extends SegmentSource {
  readonly kind: 'choices'
  /** Optional leading title block inside the fence; empty for none. */
  readonly title: string
  /** Options; each body renders through the full upgrade pipeline. */
  readonly choices: readonly TabSpec[]
}

/** A `matplotlib` fence; execution readiness is a view concern, not a rule one. */
export interface MatplotlibSegment extends SegmentSource {
  readonly kind: 'matplotlib'
  /** Python source inside the fence. */
  readonly code: string
}

/**
 * Decide the segment layout of one settled assistant text block (the rule
 * engine entry; see upgrade.ts). Pure and total: any input returns at least
 * one native segment covering the text.
 * @param text - complete markdown source of one text block.
 * @returns consecutive segments; native fallback covers the whole text.
 */
export { rewritePathImages } from './path-images.ts'
export { upgradeText } from './upgrade.ts'
