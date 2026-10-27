/**
 * Stack box alignment: the rule keys on visible text length only — inline
 * markdown syntax and whitespace never count toward the ten-character line.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { stackAlign, STACK_CENTER_MAX } from '../src/rules/stack-align.ts'

test('fewer than ten visible characters center', () => {
  assert.equal(STACK_CENTER_MAX, 10)
  assert.equal(stackAlign('收尾'), 'center')
  assert.equal(stackAlign('备选路径'), 'center')
  assert.equal(stackAlign('第一阶段 说明文字'), 'center')
  assert.equal(stackAlign('一二三四五六七八九'), 'center')
})

test('ten visible characters and up align left', () => {
  assert.equal(stackAlign('一二三四五六七八九十'), 'left')
  assert.equal(stackAlign('1234567890'), 'left')
  assert.equal(stackAlign('一段较长的说明文字在这里'), 'left')
})

test('inline markdown syntax does not count as text', () => {
  assert.equal(stackAlign('**重点**'), 'center')
  assert.equal(stackAlign('`一二三`'), 'center')
  assert.equal(stackAlign('[文档](https://example.com)'), 'center')
  assert.equal(stackAlign('![示意图](a.png)'), 'center')
  assert.equal(stackAlign('**一二三四五六七八九十**'), 'left')
})

test('whitespace does not count as text', () => {
  assert.equal(stackAlign(' 一 二 三 '), 'center')
  assert.equal(stackAlign('1 2 3 4 5 6 7 8 9'), 'center')
  assert.equal(stackAlign(''), 'center')
  assert.equal(stackAlign('   \n\t '), 'center')
})
