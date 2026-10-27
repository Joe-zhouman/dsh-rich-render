/**
 * Strict fence-body line breaks: single newlines become hard breaks, while
 * code, tables, headings, block boundaries, and existing breaks stay alone.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { strictLines } from '../src/rules/strict-lines.ts'

const BR = '  ' + '\n'

test('a single newline becomes a hard break', () => {
  assert.equal(strictLines('第一行\n第二行'), '第一行' + BR + '第二行')
  assert.equal(strictLines('第一行\n第二行\n第三行'), '第一行' + BR + '第二行' + BR + '第三行')
})

test('blank lines still separate paragraphs and stay untouched', () => {
  assert.equal(strictLines('第一段\n\n第二段'), '第一段\n\n第二段')
})

test('fenced code keeps every line verbatim', () => {
  const text = ['说明', '```', '代码一', '代码二', '```', '结尾'].join('\n')
  assert.equal(strictLines(text), text)
  const tilde = ['说明', '~~~', '代码一', '代码二', '~~~'].join('\n')
  assert.equal(strictLines(tilde), tilde)
})

test('table rows are not touched', () => {
  const text = ['| a | b |', '| --- | --- |', '| 1 | 2 |'].join('\n')
  assert.equal(strictLines(text), text)
})

test('headings and block boundaries keep their own line', () => {
  assert.equal(strictLines('## 标题\n正文'), '## 标题\n正文')
  assert.equal(strictLines('正文\n## 标题'), '正文\n## 标题')
  assert.equal(strictLines('标题\n---'), '标题\n---')
  assert.equal(strictLines('说明\n- 一\n- 二'), '说明\n- 一\n- 二')
  assert.equal(strictLines('正文\n> 引用'), '正文\n> 引用')
})

test('list items stay separate; a continuation line breaks', () => {
  assert.equal(strictLines('- 一\n- 二'), '- 一\n- 二')
  assert.equal(strictLines('- 一\n  续行'), '- 一' + BR + '  续行')
})

test('blockquote lines break inside the quote', () => {
  assert.equal(strictLines('> 一\n> 二'), '> 一' + BR + '> 二')
})

test('indented code stays verbatim', () => {
  assert.equal(strictLines('    代码\n    更多'), '    代码\n    更多')
})

test('an existing hard break is not doubled', () => {
  assert.equal(strictLines('一  \n二'), '一  \n二')
  assert.equal(strictLines('一\\\n二'), '一\\\n二')
})

test('applying twice changes nothing', () => {
  const once = strictLines('第一行\n第二行\n\n- 一\n  续行')
  assert.equal(strictLines(once), once)
})
