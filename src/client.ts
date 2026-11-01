/**
 * Browser half of dsh-rich-render: replaces the assistant-step Chat
 * node renderer with a rule-driven rich renderer (cards, timelines, dual-view
 * tables with charts, callouts, mindmaps) and adds the watermark overlay.
 *
 * Failure contract: unmatched markdown stays on the platform MarkdownText,
 * every upgrade segment degrades to its source slice on error, and a total
 * renderer crash abdicates the keyed cell back to the shipped
 * AssistantNodeView (the slot system retires a crashed shadowing entry).
 */

import { RichAssistantNodeView } from './components/RichAssistantNodeView.tsx'
import { WatermarkLayer } from './components/WatermarkLayer.tsx'
import { NS, en, zh } from './locales.ts'
import { setMatplotlibRpc } from './matplotlib-bridge.ts'
import { injectStylesheet } from './stylesheet.ts'
import type { ClientCtx } from './client-types.ts'

/** Services this client plugin consumes. */
export const inject = ['slots', 'locale', 'connection', 'theme']

/**
 * UI face: the system sans stack from the reference config. Segoe UI leads so
 * Windows Latin resolves to it deterministically — a zh-CN document makes
 * Chromium resolve `ui-sans-serif` to Microsoft YaHei UI for Latin too — and
 * the CJK faces behind it carry the Chinese.
 */
const UI_FONT_STACK = "'Segoe UI', ui-sans-serif, system-ui, -apple-system, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"

/**
 * Code face: Fira Code first, then the platform's monospace stack. The CJK
 * faces behind it draw the characters Fira Code has no glyph for; the bare
 * `monospace` tail stays off so Chinese never falls back to SimSun, matching
 * the platform's own code token.
 */
const CODE_FONT_STACK = "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', 'Microsoft YaHei UI', 'PingFang SC', 'Noto Sans CJK SC'"

/** Install the stylesheet, dictionary, the matplotlib bridge, the assistant-step replacement, and the watermark overlay. */
export function apply(ctx: ClientCtx): void {
  ctx.effect(() => injectStylesheet(), 'rich-render: stylesheet')
  ctx.effect(() => ctx.theme.overrideTokens('dsh-rich-render:font', {
    '--dsw-font-family': { light: UI_FONT_STACK, dark: UI_FONT_STACK },
    '--dsw-font-family-brand': { light: UI_FONT_STACK, dark: UI_FONT_STACK },
    '--ds-font-family-code': { light: CODE_FONT_STACK, dark: CODE_FONT_STACK },
  }), 'rich-render: UI and code typography')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'rich-render: dictionaries')
  ctx.effect(() => {
    setMatplotlibRpc(ctx.connection.rpc)
    return () => setMatplotlibRpc(undefined)
  }, 'rich-render: matplotlib bridge')
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'assistant-step',
    locale: NS,
  }, RichAssistantNodeView))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'rich-render-watermark',
    locale: NS,
  }, WatermarkLayer))
}
