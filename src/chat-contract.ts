/**
 * Local mirror of the assistant-step seat contract this renderer replaces.
 *
 * The shipped faces live in packages/client/ui-chat/src/client/contract
 * (slots.ts, chat-nodes.ts, snapshot.ts); this package cannot import them
 * (ui-chat is not a browser module-table key), so the fields actually read
 * are restated here. When diffing after a dsh upgrade, compare this file
 * against ChatNodeOwnerProps / AssistantChatData / TurnProcessOwnerProps in
 * that package plus AssistantNodeView.tsx and AssistantMarkdown.tsx.
 */

import type { MarkdownFileMentions } from '@deepseek-ai/dsh-client-ui-primitives'

/** Locale seat shape the slot renderer synthesizes for registrations. */
export type Translate = (key: string, params?: Readonly<Record<string, string | number>>) => string

/** One assistant block as the chat snapshot projects it (records.ts union). */
export type AssistantBlock =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'reasoning'; readonly text: string }
  | { readonly kind: 'image'; readonly attachment: unknown }
  | { readonly kind: string; readonly block?: unknown }

/** Assistant row payload shared by streaming and settled states. */
export interface AssistantChatData {
  readonly status: 'running' | 'settled' | 'interrupted'
  readonly turn: number
  readonly step: number
  readonly blocks: readonly AssistantBlock[]
  readonly time: number
  /** Durable presentation node of the closing assistant message. */
  readonly finalNode?: { readonly seq: number } | undefined
}

/** Turn location fields the closing-turn owner reads. */
export interface TurnLocationLike {
  readonly turn: number
  readonly status: string
}

/** The `useTurnData('turn-tail')` record fields the owner reads. */
export interface TurnTailRecord {
  readonly closing?: { readonly finalNode: { readonly seq: number } } | undefined
}

/** Turn-process state fields the reasoning fold conclusion reads. */
export interface TurnProcessLike {
  readonly spec: { readonly answerStep: number | null; readonly inlineReasoning: boolean }
  readonly foldable: boolean
  readonly open: boolean
  setOpen(open: boolean): void
}

/** One disclosure's open state as the seat's keyed hook returns it. */
export interface DisclosureState {
  readonly expanded: boolean
  readonly setExpanded: (open: boolean) => void
  readonly toggle: () => void
}

/** Full props the assistant-step seat delivers to this keyed renderer. */
export interface RichAssistantNodeViewProps {
  /** Session seat identity; the session-scoped slot always supplies it. */
  readonly sessionId?: string | undefined
  readonly node: {
    readonly kind: 'assistant-step'
    readonly data: AssistantChatData
    readonly location: {
      readonly kind: string
      readonly turn: TurnLocationLike
    }
  }
  /** Renderer-owned Node portion selected by the grouping Definition. */
  readonly groupPart?: string | undefined
  /** Initially-collapsed disclosure hook shared per reasoning block. */
  readonly useDisclosure: () => DisclosureState
  /** Selector over Turn-published data; only 'turn-tail' is read. */
  readonly useTurnData: (key: 'turn-tail') => TurnTailRecord | undefined
  readonly turnProcess?: TurnProcessLike | undefined
  readonly openFile: (path: string, options?: { readonly line?: number }) => void
  readonly renderMessageImages: (args: {
    readonly images: ReadonlyArray<{ readonly attachment: unknown }>
    readonly align: 'start'
  }) => unknown
  readonly fileMentions: (owner: {
    readonly turn: TurnLocationLike
    readonly seq: number
    readonly openFile: (path: string) => void
  }) => MarkdownFileMentions | undefined
  readonly t: Translate
}
