/**
 * Fence bodies are Markdown, but their authors write one thought per line.
 * This turns every soft line break outside code and tables into a CommonMark
 * hard break, so a single newline starts a new line without an empty line
 * between them; a blank line still separates paragraphs.
 */

/** Fence opener; the captured marker decides which close line ends the block. */
const FENCE = /^\s{0,3}(`{3,}|~{3,})/u
const FENCE_CLOSE = /^\s{0,3}(`{3,}|~{3,})\s*$/u
/** GFM table delimiter row, e.g. `| --- | :---: |`. */
const TABLE_DELIMITER = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/u
const THEMATIC = /^\s{0,3}(?:(?:-{3,})|(?:\*{3,})|(?:_{3,}))\s*$/u
const SETEXT = /^\s{0,3}(?:-{2,}|={2,})\s*$/u
const ATX_HEADING = /^\s{0,3}#{1,6}\s/u
const LIST_ITEM = /^\s{0,3}(?:[-*+]|\d{1,9}[.)])\s/u
const BLOCKQUOTE = /^\s{0,3}>/u
/** Four spaces or a tab at line start begins an indented code block. */
const INDENTED_CODE = /^(?: {4}|\t)/u
/** A line that already ends in a CommonMark hard break. */
const HARD_BREAK = /(?: {2,}|\\)$/u

/**
 * Give every soft line break in Markdown prose a hard break.
 * @param text - Markdown source taken from a fence body.
 * @returns Source where single newlines render as line breaks.
 */
export function strictLines(text: string): string {
  if (!text.includes('\n')) return text
  const lines = text.split('\n')
  const out: string[] = []
  let fence: string | undefined
  let table = false
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    if (fence !== undefined) {
      out.push(line)
      const close = FENCE_CLOSE.exec(line)
      if (close !== null && close[1]![0] === fence[0] && close[1]!.length >= fence.length) fence = undefined
      continue
    }
    const open = FENCE.exec(line)
    if (open !== null) {
      fence = open[1]!
      out.push(line)
      continue
    }
    if (table) {
      out.push(line)
      if (line.trim() === '') table = false
      continue
    }
    const next = lines[i + 1]
    if (next !== undefined && line.includes('|') && TABLE_DELIMITER.test(next)) {
      table = true
      out.push(line)
      continue
    }
    out.push(needsBreak(line, next) ? `${line}  ` : line)
  }
  return out.join('\n')
}

/**
 * Decide whether the newline after one line needs a hard-break marker.
 * @param line - current line.
 * @param next - following line, undefined at end of input.
 * @returns true when a rendered line break is needed.
 */
function needsBreak(line: string, next: string | undefined): boolean {
  if (next === undefined || next.trim() === '' || line.trim() === '') return false
  if (INDENTED_CODE.test(line) || INDENTED_CODE.test(next)) return false
  if (HARD_BREAK.test(line)) return false
  if (ATX_HEADING.test(line) || THEMATIC.test(line) || TABLE_DELIMITER.test(line)) return false
  if (/^\s*\|/u.test(line)) return false
  if (FENCE.test(next) || ATX_HEADING.test(next) || SETEXT.test(next) || THEMATIC.test(next)) return false
  if (LIST_ITEM.test(next)) return false
  if (BLOCKQUOTE.test(next) && !BLOCKQUOTE.test(line)) return false
  return true
}
