/**
 * GFM parse layer for the rule engine. Mirrors the platform renderer's
 * structural grammar (micromark + mdast-util-from-markdown + GFM, minus the
 * math and CJK extensions a structural decision does not read), so rule
 * matching sees exactly the block shapes the shipped renderer would draw.
 */

import type { Nodes, Root } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'

/** Parse markdown into an mdast root stamped with source positions. */
export function parseBlocks(text: string): Root {
  return fromMarkdown(text, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
}

/**
 * Plain text of one mdast node (inline markup stripped, like mdast toString).
 * @param node - node whose phrasing text is needed.
 * @returns concatenated text content.
 */
export function plainText(node: Nodes): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node) {
    let text = ''
    for (const child of node.children) text += plainText(child)
    return text
  }
  return ''
}

/**
 * Source slice one top-level node owns, whitespace trimmed at both ends.
 * @param text - complete document source.
 * @param node - node with stamped positions.
 * @returns exact source slice covering the node.
 */
export function nodeSource(text: string, node: Nodes): string {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined || start > end || end > text.length) return ''
  return text.slice(start, end)
}
