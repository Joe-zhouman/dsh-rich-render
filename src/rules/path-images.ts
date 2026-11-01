/**
 * Fallback image syntax for authored local paths, and standalone-image
 * layout for every body image.
 *
 * The persona teaches the standard Markdown image form, but a model that
 * ignores it still names real picture files: a bare absolute path in prose,
 * or the same path wrapped in inline code. This pass rewrites both shapes
 * into the standard form before the rule walk sees them, so the platform's
 * fallback display (the alt text) carries the original path string.
 *
 * An image never shares a line with prose: in top-level paragraphs every
 * rewritten path — and every authored image — is fenced off with blank
 * lines, so the rule walk meets each image as its own paragraph and upgrades
 * it to the framed image card. Lists and tables keep their paths literal
 * (splitting there would break the container), and blockquote paragraphs
 * rewrite in place without splitting.
 */

import type { InlineCode, Nodes, Paragraph, Root, Text } from 'mdast'
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

/** Node offsets as an editable span, or undefined when positions are unusable. */
function nodeSpan(text: string, node: Nodes): { start: number; end: number } | undefined {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined || start > end || end > text.length) return undefined
  return { start, end }
}

/**
 * One paragraph's direct phrasing children: inline-code whose whole value
 * names an image file, bare image paths inside text, and (top level only)
 * authored image nodes splitting off into their own paragraph. A split
 * blanks the side that still carries content, so re-running the pass on its
 * own output adds nothing (the image already sits at a block boundary).
 * @param text - complete document source.
 * @param paragraph - one paragraph node.
 * @param standalone - true in a top-level paragraph: replacements may split into their own blocks.
 * @param edits - collected source edits.
 */
function collectEdits(text: string, paragraph: Paragraph, standalone: boolean, edits: Edit[]): void {
  const paraSpan = nodeSpan(text, paragraph)
  const split = (start: number, end: number, replacement: string): string => {
    if (!standalone || paraSpan === undefined) return replacement
    const lead = text.slice(paraSpan.start, start).trim() === '' ? '' : '\n\n'
    const trail = text.slice(end, paraSpan.end).trim() === '' ? '' : '\n\n'
    return `${lead}${replacement}${trail}`
  }
  for (const child of paragraph.children) {
    if (child.type === 'inlineCode') {
      const value = child.value.trim()
      const span = nodeSpan(text, child)
      if (span === undefined || !isLocalImagePath(value)) continue
      edits.push({ ...span, replacement: split(span.start, span.end, markdownImage(value)) })
    } else if (child.type === 'text') {
      const span = nodeSpan(text, child)
      if (span === undefined) continue
      const slice = text.slice(span.start, span.end)
      for (const match of slice.matchAll(BARE_PATH)) {
        const found = match[0]
        const at = match.index ?? -1
        if (found === undefined || at < 0 || !isLocalImagePath(found)) continue
        const start = span.start + at
        edits.push({ start, end: start + found.length, replacement: split(start, start + found.length, markdownImage(found)) })
      }
    } else if (child.type === 'image' && standalone) {
      const span = nodeSpan(text, child)
      const source = span === undefined ? '' : text.slice(span.start, span.end)
      if (source === '') continue
      edits.push({ ...span, replacement: split(span.start, span.end, source) })
    }
  }
}

/**
 * Walk the tree collecting paragraph edits: root and blockquote children
 * contribute, list and table subtrees stay literal (splitting inside a list
 * item or a quote breaks the container).
 * @param node - subtree root.
 * @param text - complete document source.
 * @param standalone - whether paragraphs at this depth may split into their own blocks.
 * @param edits - collected source edits.
 */
function walkTree(node: Nodes, text: string, standalone: boolean, edits: Edit[]): void {
  if (node.type === 'paragraph') {
    collectEdits(text, node, standalone, edits)
    return
  }
  if (node.type === 'list' || node.type === 'table' || !('children' in node)) return
  // Only the document root's own paragraphs split; anything deeper (inside a
  // quote, or a list item the list guard already excluded) rewrites in place.
  for (const child of node.children) walkTree(child, text, standalone && node.type === 'root', edits)
}

/**
 * Rewrite bare and code-wrapped local image paths into standard Markdown
 * images, and split top-level body images (authored or rewritten) into their
 * own paragraphs. Pure and total: any input returns text at least as
 * displayable as it came in — an empty edit set, a parse throw, or a
 * position miss simply keeps the source untouched.
 * @param text - Markdown source of one text block.
 * @returns Source with paths rewritten and images fenced off as paragraphs.
 */
export function rewritePathImages(text: string): string {
  if (!MENTIONS_IMAGE.test(text)) return text
  let root: Root
  try {
    root = parseBlocks(text)
  } catch {
    return text
  }
  const edits: Edit[] = []
  try {
    walkTree(root, text, true, edits)
  } catch {
    return text
  }
  if (edits.length === 0) return text
  edits.sort((a, b) => b.start - a.start)
  let out = text
  for (const edit of edits) out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end)
  return out
}
