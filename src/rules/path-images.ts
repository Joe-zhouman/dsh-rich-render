/**
 * Fallback image syntax for authored local paths.
 *
 * The persona teaches the standard Markdown image form, but a model that
 * ignores it still names real picture files: a bare absolute path in prose,
 * or the same path wrapped in inline code. This pass rewrites both shapes
 * into the standard form before the platform renderer sees them, so its
 * existing two-level fallback applies verbatim — a path the vocabulary
 * cannot resolve, or a file that fails to load, degrades to alt text that
 * carries the original path string, i.e. exactly the authored display.
 *
 * Only a paragraph's direct text and inline-code children are rewritten:
 * link and image children, headings, tables, and fenced or indented code
 * never enter the match, so no authored image syntax is rewritten twice.
 */

import type { InlineCode, Nodes, Paragraph, Text } from 'mdast'
import { nodeSource, parseBlocks } from './parse.ts'

/** Drawable extensions the file route can serve and browsers display. */
const EXT = 'png|jpe?g|gif|webp|bmp|svg|ico|avif'
/** Suffix guard: another letter/digit, or a dot starting one (`.png.tar`), is not the file's end. */
const NOT_SUFFIX = String.raw`(?![a-z0-9]|\.[a-z0-9])`

/** Quick pre-check: no image suffix anywhere means no rewrite work at all. */
const MENTIONS_IMAGE = new RegExp(`\\.(?:${EXT})(?![a-z0-9]|\\.[a-z0-9])`, 'iu')

/** Path shape that names one image file: absolute, no spaces, image suffix. */
const BARE_PATH = new RegExp(
  String.raw`(?<![\w:\\/.-])(?:[a-z]:[\\/]|\/)[^\s` + '`' + String.raw`*<>[\]|]+[\\/][^\s` + '`' + String.raw`*<>[\]|]*\.(?:${EXT})${NOT_SUFFIX}`,
  'giu',
)

/** Characters that would break the generated image alt or destination. */
const UNSAFE_IN_IMAGE = /[\u0000-\u001f\u007f<>\[\]]/u

/**
 * Whether one string is an absolute local path naming an image file.
 * @param value - candidate path, whitespace-trimmed by the caller.
 * @returns true for `C:\dir\pic.png` and `/home/u/pic.png` shapes with a drawable suffix.
 */
function isLocalImagePath(value: string): boolean {
  if (UNSAFE_IN_IMAGE.test(value)) return false
  const absolute = /^[a-z]:[\\/]/iu.test(value) || /^\/(?!\/)/u.test(value)
  return absolute && new RegExp(`\\.(?:${EXT})$`, 'iu').test(value)
}

/**
 * Standard Markdown image for one local path. The alt text carries the
 * original path so a missing file degrades to exactly the authored string;
 * backslashes double because CommonMark consumes `\` + punctuation escapes
 * inside both link text and destinations.
 * @param path - absolute local path to an image file.
 * @returns `![path](<path>)` with backslashes escaped.
 */
function markdownImage(path: string): string {
  const escaped = path.replace(/\\/gu, '\\\\')
  return `![${escaped}](<${escaped}>)`
}

/** One source replacement: replace [start, end) with the given text. */
interface Edit {
  readonly start: number
  readonly end: number
  readonly replacement: string
}

/** Rewrite one inline-code child whose whole value names an image file. */
function inlineCodeEdit(text: string, node: InlineCode, edits: Edit[]): void {
  const value = node.value.trim()
  if (!isLocalImagePath(value)) return
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined || start > end || end > text.length) return
  if (nodeSource(text, node) === '') return
  edits.push({ start, end, replacement: markdownImage(value) })
}

/** Rewrite every bare image path inside one text child. */
function textEdits(text: string, node: Text, edits: Edit[]): void {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined || start > end || end > text.length) return
  const slice = text.slice(start, end)
  for (const match of slice.matchAll(BARE_PATH)) {
    const found = match[0]
    const at = match.index ?? -1
    if (found === undefined || at < 0 || !isLocalImagePath(found)) continue
    edits.push({ start: start + at, end: start + at + found.length, replacement: markdownImage(found) })
  }
}

/** Collect every paragraph below one node; tables stay out (cells are plain). */
function collectParagraphs(node: Nodes, out: Paragraph[]): void {
  if (node.type === 'paragraph') {
    out.push(node)
    return
  }
  if (node.type !== 'table' && 'children' in node) {
    for (const child of node.children) collectParagraphs(child, out)
  }
}

/**
 * Rewrite bare and code-wrapped local image paths into standard Markdown
 * images. Pure and total: any input returns text at least as displayable as
 * it came in — an empty edit set, a parse throw, or a position miss simply
 * keeps the source untouched.
 * @param text - Markdown source of one native segment.
 * @returns Source with matching paths rewritten to `![path](<path>)`.
 */
export function rewritePathImages(text: string): string {
  if (!MENTIONS_IMAGE.test(text)) return text
  let paragraphs: Paragraph[]
  try {
    paragraphs = []
    collectParagraphs(parseBlocks(text), paragraphs)
  } catch {
    return text
  }
  const edits: Edit[] = []
  for (const paragraph of paragraphs) {
    for (const child of paragraph.children) {
      if (child.type === 'inlineCode') inlineCodeEdit(text, child, edits)
      else if (child.type === 'text') textEdits(text, child, edits)
    }
  }
  if (edits.length === 0) return text
  edits.sort((a, b) => b.start - a.start)
  let out = text
  for (const edit of edits) out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end)
  return out
}
