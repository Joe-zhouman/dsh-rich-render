/**
 * TeX span locator: the inline fields shown by rich components keep only TeX
 * markup, so the locator must find every platform-supported delimiter without
 * mistaking currency or escaped dollars for formulas.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { texSpans } from '../src/components/tex-spans.ts'

/** The source slices the locator identifies, in order. */
const slices = text => texSpans(text).map(span => text.slice(span.start, span.end))

test('finds inline dollars inside surrounding prose', () => {
  const text = '2. 当 $n$ 为奇数时，$I_n=0$。'
  assert.deepEqual(slices(text), ['$n$', '$I_n=0$'])
  assert.deepEqual(slices(text).join(''), '$n$$I_n=0$')
})

test('finds same-line display dollars as one span', () => {
  assert.deepEqual(slices('结论：$$\\boxed{A}$$'), ['$$\\boxed{A}$$'])
})

test('finds backslash delimiters', () => {
  assert.deepEqual(slices('行内 \\(a+b\\) 与显示 \\[c+d\\]'), ['\\(a+b\\)', '\\[c+d\\]'])
})

test('leaves currency and escaped dollars literal', () => {
  assert.deepEqual(slices('价格 $100 元'), [])
  assert.deepEqual(slices('$5 and $10'), [])
  assert.deepEqual(slices('escaped \\$a$ stays text'), [])
})

test('accepts formulas whose content has spaces but no edge whitespace', () => {
  assert.deepEqual(slices('$a + b$'), ['$a + b$'])
  assert.deepEqual(slices('$ a + b$'), [])
  assert.deepEqual(slices('$a + b $'), [])
})

test('treats table-cell source with two formulas independently', () => {
  assert.deepEqual(slices('$a$'), ['$a$'])
  assert.deepEqual(slices('$(a)$ 与 $\\dfrac{1}{2}$'), ['$(a)$', '$\\dfrac{1}{2}$'])
})

test('a field without math yields no spans', () => {
  assert.deepEqual(slices('结论'), [])
  assert.deepEqual(slices('1. 讨论被积函数的奇偶性'), [])
})
