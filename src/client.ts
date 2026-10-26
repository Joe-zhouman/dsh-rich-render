/**
 * Browser half of dsh-local-rich-render: replaces the assistant-step Chat
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
export const inject = ['slots', 'locale', 'connection']

/** Install the stylesheet, dictionary, the matplotlib bridge, the assistant-step replacement, and the watermark overlay. */
export function apply(ctx: ClientCtx): void {
  ctx.effect(() => injectStylesheet(), 'rich-render: stylesheet')
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
