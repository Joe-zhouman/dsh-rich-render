/**
 * Stylesheet lifecycle: install this plugin's one <style> element on the
 * plugin fiber's effect, remove it on unload. Idempotent against double
 * activation (reload keeps a single tag), mirroring the repository preset's
 * styleInjectionModule contract without its CSS Modules machinery.
 */

import { STYLESHEET } from './styles.ts'

/** The tag identity: package id plus one fixed sheet name. */
const TAG_ID = 'dsh-local-rich-render/styles'

/**
 * Install the stylesheet once; the returned disposer removes exactly this
 * plugin's tag, so disabling the entry drops every style it added.
 * @returns the removal disposer for ctx.effect.
 */
export function injectStylesheet(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (document.querySelector(`style[data-plugin-css="${TAG_ID}"]`) !== null) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-local-rich-render'
  tag.dataset.pluginCss = TAG_ID
  tag.textContent = STYLESHEET
  document.head.appendChild(tag)
  return () => { tag.remove() }
}
