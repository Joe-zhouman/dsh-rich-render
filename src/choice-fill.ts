/**
 * Composer draft writes for a `prototype-choices` fence.
 *
 * The fence never sends: selecting an option writes one `已选择：<选项名>` line
 * above whatever the user already typed, so their supplement travels in the
 * same message they send themselves. Writing the whole draft (rather than
 * inserting at the caret) is what puts the line first and lets a later
 * selection replace it instead of stacking.
 */

/** One editor span plus the draft revision it was captured at. */
export interface ChoiceSpan {
  readonly start: number
  readonly end: number
  readonly draftRev: number
}

/** The platform input actions a fence writes through (`ctx.conversation.input`). */
export interface ChoiceInputActions {
  /** Replace the whole draft with plain text. */
  setDraft(text: string): void
  /** Capture the caret span and revision that `insertText` validates against. */
  captureInsertion(): ChoiceSpan
  /**
   * Insert text over one span without replacing later edits or reference chips.
   * @returns false when the draft changed or submission locked the editor.
   */
  insertText(text: string, span: ChoiceSpan): boolean
}

/** The part of the Session input state the fence reads. */
export interface ChoiceDraftState {
  /** Clipboard-text projection of the draft. */
  readonly draft: string
  /** Reference chips in the draft; any chip forbids a whole-draft write. */
  readonly occurrences: readonly unknown[]
}

/** The same state reduced to what one write needs. */
export interface ChoiceWrite {
  readonly draft: string
  /** Reference chips currently in the draft. */
  readonly chips: number
}

/** Selector hook over the Session input state, delivered by the slot seat. */
export type UseChoiceDraft = <T>(selector: (state: ChoiceDraftState) => T) => T

/** Composer write face a fence receives from its slot seat. */
export interface ChoiceInput {
  readonly useDraft: UseChoiceDraft
  readonly actions: ChoiceInputActions
}

/**
 * Keep one choice line above the user's own text.
 * @param previous - the line this fence wrote last; anything the user typed
 * after it — on that line or the next — moves below the new line.
 * @param line - the line for the newly selected option.
 * @param draft - current draft text.
 * @returns the draft with the choice line first; the caret ends after it, so a
 * supplement starts on the next line.
 */
export function composeChoiceDraft(previous: string | undefined, line: string, draft: string): string {
  let rest = draft
  if (previous !== undefined && draft.startsWith(previous)) {
    rest = draft.slice(previous.length)
    if (rest.startsWith('\n')) rest = rest.slice(1)
  }
  return rest === '' ? `${line}\n` : `${line}\n${rest}`
}

/**
 * Write one choice line into the composer, replacing this fence's previous line.
 * Reference chips make a whole-draft write destructive, so a draft that holds
 * one is prefixed through the revision-guarded insertion instead.
 * @param actions - platform input actions for the Session.
 * @param state - current draft text and its reference chips.
 * @param line - the line for the selected option.
 * @param previous - the line this fence wrote last, if any.
 * @returns true when the composer accepted the write.
 */
export function writeChoiceDraft(
  actions: ChoiceInputActions,
  state: ChoiceWrite,
  line: string,
  previous: string | undefined,
): boolean {
  if (state.chips === 0) {
    actions.setDraft(composeChoiceDraft(previous, line, state.draft))
    return true
  }
  // A chip draft keeps its chips: the line lands above them unless it is there already.
  if (state.draft === line || state.draft.startsWith(`${line}\n`)) return true
  // A concurrent edit between render and click invalidates the first span; one retry
  // covers a keystroke landing in that window.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const span = actions.captureInsertion()
    if (actions.insertText(`${line}\n`, { start: 0, end: 0, draftRev: span.draftRev })) return true
  }
  return false
}

/** Spellings an authored fence may already use for the built-in "other" choice. */
const OTHER_LABELS = /^(?:其他|其它|other)$/iu

/**
 * Append the built-in "other" choice unless the fence already offers one.
 *
 * Every fence ends with a way out of its own options: the reader writes the
 * choice the model did not think of, and the composer still receives the same
 * `已选择：其他` line.
 * @param choices - options authored in the fence.
 * @param other - the built-in option to append.
 * @returns the options to render.
 */
export function withOtherChoice<T extends { readonly label: string }>(choices: readonly T[], other: T): readonly T[] {
  return choices.some(choice => OTHER_LABELS.test(choice.label.trim()))
    ? choices
    : [...choices, other]
}
