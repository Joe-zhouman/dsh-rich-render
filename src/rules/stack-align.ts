/**
 * Stack box alignment follows how much text the box carries: short labels read
 * as centered captions, longer text stays left-aligned prose. The count uses
 * visible characters (inline markdown stripped, whitespace ignored), so syntax
 * never pushes a short label over the threshold.
 */

import { stripInline } from './checklist-items.ts'

/** Visible-character ceiling for a centered box: fewer than this centers. */
export const STACK_CENTER_MAX = 10

/**
 * Pick one box's text alignment.
 * @param content - the box's Markdown body.
 * @returns `center` below ten visible characters, `left` otherwise.
 */
export function stackAlign(content: string): 'center' | 'left' {
  return stripInline(content).replace(/\s+/gu, '').length < STACK_CENTER_MAX ? 'center' : 'left'
}
