/**
 * Choice-to-composer writes: the fence keeps one `已选择：<选项名>` line above the
 * user's own text, replaces its own previous line instead of stacking, and
 * never sends anything.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { composeChoiceDraft, writeChoiceDraft } from '../src/choice-fill.ts'

const LINE = '已选择：方案二'

test('an empty draft gains the choice line and room for a supplement', () => {
  assert.equal(composeChoiceDraft(undefined, LINE, ''), `${LINE}\n`)
})

test('existing text keeps its place under the choice line', () => {
  assert.equal(composeChoiceDraft(undefined, LINE, '请用中文'), `${LINE}\n请用中文`)
})

test('a later selection replaces this fence line and keeps the supplement', () => {
  assert.equal(
    composeChoiceDraft('已选择：方案一', LINE, '已选择：方案一\n请用中文'),
    `${LINE}\n请用中文`,
  )
  assert.equal(composeChoiceDraft('已选择：方案一', LINE, '已选择：方案一'), `${LINE}\n`)
})

test('a line the user replaced is prepended rather than assumed present', () => {
  assert.equal(composeChoiceDraft('已选择：方案一', LINE, '请用中文'), `${LINE}\n请用中文`)
})

test('a supplement typed on the choice line moves below the new one', () => {
  assert.equal(composeChoiceDraft('已选择：方案一', LINE, '已选择：方案一请用中文'), `${LINE}\n请用中文`)
})

test('a chip-free draft is written whole through setDraft', () => {
  const writes = []
  const accepted = writeChoiceDraft(
    { setDraft: text => { writes.push(text) }, captureInsertion: () => ({ start: 0, end: 0, draftRev: 1 }), insertText: () => false },
    { draft: '请用中文', chips: 0 },
    LINE,
    undefined,
  )
  assert.equal(accepted, true)
  assert.deepEqual(writes, [`${LINE}\n请用中文`])
})

test('a chip draft keeps its chips and is prefixed through the guarded insertion', () => {
  const insertions = []
  const writes = []
  const actions = {
    setDraft: text => { writes.push(text) },
    captureInsertion: () => ({ start: 3, end: 3, draftRev: 7 }),
    insertText: (text, span) => { insertions.push({ text, span }); return true },
  }
  assert.equal(writeChoiceDraft(actions, { draft: '@文件 你好', chips: 1 }, LINE, undefined), true)
  assert.deepEqual(writes, [], 'a chip draft is never rewritten whole')
  assert.deepEqual(insertions, [{ text: `${LINE}\n`, span: { start: 0, end: 0, draftRev: 7 } }])
})

test('a chip draft that already carries the line is left alone', () => {
  let calls = 0
  const actions = {
    setDraft: () => { calls += 1 },
    captureInsertion: () => ({ start: 0, end: 0, draftRev: 1 }),
    insertText: () => { calls += 1; return true },
  }
  assert.equal(writeChoiceDraft(actions, { draft: `${LINE}\n@文件`, chips: 1 }, LINE, undefined), true)
  assert.equal(calls, 0)
})

test('a refused insertion reports failure to the fence', () => {
  const actions = {
    setDraft: () => {},
    captureInsertion: () => ({ start: 0, end: 0, draftRev: 1 }),
    insertText: () => false,
  }
  assert.equal(writeChoiceDraft(actions, { draft: '@文件', chips: 1 }, LINE, undefined), false)
})
