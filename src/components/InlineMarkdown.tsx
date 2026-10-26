/**
 * Inline rendering for fields the rule engine stores as plain text (stage and
 * card titles, table headers/cells, node labels).
 *
 * Those fields retain model-authored TeX but no other inline markup: the rule
 * engine's `plainText` and `stripInline` already remove emphasis, links, and
 * code syntax. This component routes each TeX span through the platform
 * renderer and leaves the surrounding prose literal, so a leading `2. ` or
 * `- ` never becomes block structure inside a title or table cell. A field
 * without math renders unchanged.
 */

import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReactNode } from 'react'
import { texSpans } from './tex-spans.ts'

export interface InlineMarkdownProps {
  /** Inline source text, typically one line without block structure. */
  readonly text: string
  readonly labels: MarkdownLabels
}

/**
 * Render one inline field with its TeX spans through the platform renderer.
 * @param props - source text and the platform's localized markdown chrome.
 * @returns The text with formulas rendered inline, or the text unchanged.
 */
export function InlineMarkdown({ text, labels }: InlineMarkdownProps) {
  const spans = texSpans(text)
  if (spans.length === 0) return <>{text}</>
  const parts: ReactNode[] = []
  let last = 0
  for (const span of spans) {
    if (span.start > last) parts.push(text.slice(last, span.start))
    parts.push(
      <MarkdownText key={span.start} text={text.slice(span.start, span.end)} labels={labels} variant="compact" />,
    )
    last = span.end
  }
  if (last < text.length) parts.push(text.slice(last))
  return <div className="dshr-inline-md">{parts}</div>
}
