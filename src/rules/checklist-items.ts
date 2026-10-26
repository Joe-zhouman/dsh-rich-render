/**
 * Checklist item extraction shared by the auto-upgrade walk and the explicit
 * `todo` fence: first line is the title (a lone `标题：说明` line splits at its
 * first full-width colon once), later blocks are the description, nested
 * lists decline the item.
 */

import type { ListItem } from 'mdast'
import { nodeSource } from './parse.ts'
import type { ChecklistItem } from './segments.ts'

/** Maximum plain-text length of a card/checklist entry heading. */
export const CARD_TITLE_MAX = 30

/** Strip common inline markers so length checks and display see prose, not syntax. */
export function stripInline(src: string): string {
  return src
    .replace(/`([^`]*)`/gu, '$1')
    .replace(/\*\*([^*]+)\*\*/gu, '$1')
    .replace(/\*([^*]+)\*/gu, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
}

/**
 * Split a single-line task title at its first full-width colon (`标题：说明`).
 * @param source - one-line item source after the task marker.
 * @returns the two sides, or undefined when the line is not a split pair.
 */
export function splitChecklistColon(source: string): { title: string; body: string } | undefined {
  const index = source.indexOf('：')
  if (index <= 0) return undefined
  const title = source.slice(0, index).trim()
  const body = source.slice(index + 1).trim()
  if (title === '' || body === '' || stripInline(title).trim().length > CARD_TITLE_MAX) return undefined
  return { title, body }
}

/**
 * Title/body split of one list item, shared by the checklist walk, the `todo`
 * fence, and the `timeline` fence: the first paragraph's first line titles
 * the entry, the rest of that paragraph plus later blocks become the body, a
 * lone `标题：说明` line splits once, nested lists decline the item.
 * @param text - complete document source the item's positions index into.
 * @param item - one list item.
 * @param dropPrefix - marker stripped from the paragraph source before the
 * split (the task checkbox); absent for none.
 * @param keepNested - nested lists are skipped instead of declining the item
 * (the `todo` fence flattens them separately).
 * @returns the entry, or undefined when the item has no usable title.
 */
export function entryTitleBody(
  text: string,
  item: ListItem,
  dropPrefix?: RegExp,
  keepNested = false,
): { title: string; body: string } | undefined {
  const first = item.children[0]
  if (first === undefined || first.type !== 'paragraph') return undefined
  const raw = nodeSource(text, first)
  const paraSource = dropPrefix === undefined ? raw : raw.replace(dropPrefix, '')
  const [firstLine = '', ...restLines] = paraSource.split('\n')
  const later: string[] = []
  for (const child of item.children.slice(1)) {
    if (child.type === 'list') {
      if (!keepNested) return undefined
      continue
    }
    const source = nodeSource(text, child).trim()
    if (source !== '') later.push(source)
  }
  let body = [restLines.join('\n').trim(), ...later].filter(part => part !== '').join('\n\n')
  let titleSource = firstLine.trim()
  if (body === '') {
    const split = splitChecklistColon(titleSource)
    if (split !== undefined) {
      titleSource = split.title
      body = split.body
    }
  }
  const title = stripInline(titleSource).trim()
  if (title === '') return undefined
  return { title, body }
}

/**
 * Extract one checklist entry from a task-list item.
 * @param text - complete document source the item's positions index into.
 * @param item - one task-list item.
 * @returns the entry, or undefined when the item has no usable title.
 */
export function checklistEntry(text: string, item: ListItem): ChecklistItem | undefined {
  const entry = entryTitleBody(text, item, /^\[[ xX]\][ \t]*/u)
  return entry === undefined ? undefined : { title: entry.title, body: entry.body, checked: item.checked === true }
}
