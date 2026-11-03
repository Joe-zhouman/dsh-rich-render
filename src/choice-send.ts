/**
 * Bridge from a rendered `prototype-choices` fence to its Session's
 * Conversation service.
 *
 * The client artifact resolves platform modules only through the browser
 * module table (react, primitives), so it cannot import ui-conversation to
 * send a prompt. The browser half therefore installs one sender here at apply
 * time — the matplotlib bridge's pattern — and a fence calls it with the
 * Session id its slot seat supplies.
 */

/**
 * Deliver one user message into a Session.
 * @param sessionId - Session the choice belongs to (the slot's session seat).
 * @param text - message text, sent verbatim as one user turn.
 * @returns completion; a failure rejects with the delivery error.
 */
export type ChoiceSender = (sessionId: string, text: string) => Promise<void>

/**
 * Send one choice into the fence's Session.
 * @param text - message text built from the selected option.
 * @returns completion; rejects when no sender is installed.
 */
export type ChoiceSend = (text: string) => Promise<void>

let sender: ChoiceSender | undefined

/**
 * Install the Session prompt sender for this page.
 * @param next - sender, or undefined to clear it.
 * @returns disposer that clears the sender only while it is still installed.
 */
export function setChoiceSender(next: ChoiceSender | undefined): () => void {
  sender = next
  return () => {
    if (sender === next) sender = undefined
  }
}

/**
 * Send one fence choice through the installed sender.
 * @param sessionId - Session the choice belongs to.
 * @param text - message text built from the selected option.
 * @returns completion; rejects when the plugin installed no sender.
 */
export async function sendChoice(sessionId: string, text: string): Promise<void> {
  if (sender === undefined) throw new Error('rich-render: no choice sender is installed')
  await sender(sessionId, text)
}
