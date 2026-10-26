/**
 * TeX span locator for model-authored inline text.
 *
 * The rule engine strips inline markup from the fields shown in rich
 * components (stage/card titles, table headers and cells, node labels) and
 * keeps only TeX source. The view layer therefore routes exactly those spans
 * through the platform renderer and leaves everything else literal: feeding a
 * whole title such as `2. 当 $n$ 为奇数时` to the document parser would turn
 * the leading `2. ` into an ordered list.
 *
 * Delimiters mirror the platform grammar: `$$...$$` on one line, `$...$`
 * (content must not start or end with whitespace), `\(...\)`, and `\[...\]`.
 * Escaped opening dollars stay literal.
 */

const TEX_SPAN = /(?<!\\)\$\$[^$\n]+?\$\$|(?<!\\)\$[^\s$](?:[^$\n]*[^\s$])?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/gu

/** Half-open source offsets of one TeX span. */
export interface TexSpan {
  readonly start: number
  readonly end: number
}

/**
 * Locate the TeX spans in one inline field, in source order.
 * @param text - model-authored inline source (heading text or table cell).
 * @returns non-overlapping half-open spans, one per formula.
 */
export function texSpans(text: string): TexSpan[] {
  const spans: TexSpan[] = []
  for (const match of text.matchAll(TEX_SPAN)) {
    const start = match.index
    spans.push({ start, end: start + match[0].length })
  }
  return spans
}
