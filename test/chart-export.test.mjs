/** Chart export naming: filesystem-safe local timestamp with a stable prefix. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { chartPngName } from '../src/components/chart-download.ts'

test('chartPngName stamps local time without filesystem-hostile characters', () => {
  assert.equal(chartPngName(new Date(2026, 9, 20, 15, 4, 5)), 'dsh-chart-20261020-150405.png')
  assert.equal(chartPngName(new Date(2027, 0, 2, 3, 4, 5)), 'dsh-chart-20270102-030405.png')
})
