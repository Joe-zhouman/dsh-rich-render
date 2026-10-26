/**
 * Largest-remainder percentage regression: one pie's percentages always sum
 * to exactly 100, each entry the nearest integer under that constraint.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { largestRemainderPercentages } from '../src/rules/percent.ts'

test('round numbers pass through', () => {
  assert.deepEqual(largestRemainderPercentages([0.25, 0.25, 0.5], 1), [25, 25, 50])
})

test('thirds sum to exactly 100 with the largest remainder taking the extra point', () => {
  const pcts = largestRemainderPercentages([1 / 3, 1 / 3, 1 / 3], 1)
  assert.equal(pcts.reduce((a, b) => a + b, 0), 100)
  assert.deepEqual(pcts, [34, 33, 33])
})

test('with a supplement slice the whole set still sums to 100', () => {
  const pcts = largestRemainderPercentages([0.1, 0.2, 0.3, 0.1], 0.7)
  assert.equal(pcts.reduce((a, b) => a + b, 0), 100)
  assert.deepEqual(pcts, [14, 29, 43, 14])
})

test('zero total yields all zeros', () => {
  assert.deepEqual(largestRemainderPercentages([0, 0], 0), [0, 0])
})
