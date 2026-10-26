/**
 * Chart decision tree v2 regression: plain-number parsing, the form-driven
 * branches, exact pie sums, row tolerance, performance guards, and the
 * icon-column rule.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { decideChart, parseNumber } from '../src/rules/chart.ts'
import { upgradeText } from '../src/rules/upgrade.ts'

/** Grid helper: N columns, aligns default left. */
function grid(headers, rows) {
  return { headers, rows, aligns: headers.map(() => null) }
}

test('parseNumber v2: plain numbers, signs, decimals, scientific; units and percents rejected', () => {
  assert.equal(parseNumber('3'), 3)
  assert.equal(parseNumber('-2.5'), -2.5)
  assert.equal(parseNumber('+8'), 8)
  assert.equal(parseNumber('1.25e3'), 1250)
  assert.equal(parseNumber('-1.5E-2'), -0.015)
  assert.equal(parseNumber('.5'), 0.5)
  assert.equal(parseNumber(' 1.25 '), 1.25)
  assert.equal(parseNumber('30%'), undefined)
  assert.equal(parseNumber('1,000'), undefined)
  assert.equal(parseNumber('¥3'), undefined)
  assert.equal(parseNumber('3 米'), undefined)
  assert.equal(parseNumber('abc'), undefined)
  assert.equal(parseNumber(''), undefined)
  assert.equal(parseNumber('3..5'), undefined)
})

test('all-numeric columns -> multi-line chart (X = first column)', () => {
  const spec = decideChart(grid(['x', 'a', 'b'], [['1', '10', '20'], ['2', '12', '24'], ['3', '9', '18']]))
  assert.equal(spec.kind, 'line')
  assert.deepEqual(spec.xValues, [1, 2, 3])
  assert.equal(spec.series.length, 2)
  assert.deepEqual(spec.series[0].values, [10, 12, 9])
})

test('two columns, text first, values >= 0 summing to 1 -> pie without supplement', () => {
  const spec = decideChart(grid(['项', '值'], [['甲', '0.1'], ['乙', '0.2'], ['丙', '0.7']]))
  assert.equal(spec.kind, 'pie')
  assert.deepEqual(spec.series[0].values, [0.1, 0.2, 0.7])
  assert.equal(spec.supplement, undefined)
})

test('pie: float dust summing just under 1 counts as 1 (no supplement)', () => {
  const spec = decideChart(grid(['项', '值'], [['a', '0.1'], ['b', '0.2'], ['c', String(0.7 - 5e-12)]]))
  assert.equal(spec.kind, 'pie')
  assert.equal(spec.supplement, undefined)
})

test('pie: sum below 1 gains the supplement slice; exactly 1 does not', () => {
  const under = decideChart(grid(['项', '值'], [['甲', '0.3'], ['乙', '0.4']]))
  assert.equal(under.kind, 'pie')
  assert.ok(under.supplement)
  assert.ok(Math.abs(under.supplement.value - 0.3) < 1e-9)

  const exact = decideChart(grid(['项', '值'], [['甲', '0.5'], ['乙', '0.5']]))
  assert.equal(exact.kind, 'pie')
  assert.equal(exact.supplement, undefined)
})

test('pie: any negative value falls to bar even with a <=1 sum', () => {
  assert.equal(decideChart(grid(['k', 'v'], [['a', '-0.2'], ['b', '0.3']])).kind, 'bar')
  assert.equal(decideChart(grid(['k', 'v'], [['a', '0'], ['b', '0']])).kind, 'bar')
  assert.equal(decideChart(grid(['k', 'v'], [['a', '2'], ['b', '3']])).kind, 'bar')
})

test('two columns, numeric first -> line chart', () => {
  const spec = decideChart(grid(['x', 'y'], [['1', '5'], ['2', '6'], ['3', '7']]))
  assert.equal(spec.kind, 'line')
  assert.equal(spec.series.length, 1)
})

test('more than two columns with text first column stays a table (grouped bar removed)', () => {
  assert.equal(decideChart(grid(['项', '一月', '二月'], [['甲', '10', '20'], ['乙', '12', '24']])), undefined)
})

test('rows: 2 minimum, 550 chartable, 551 not', () => {
  const rows550 = Array.from({ length: 550 }, (_, i) => [String(i), String(i)])
  assert.equal(decideChart(grid(['x', 'y'], rows550)).kind, 'line')
  const rows551 = Array.from({ length: 551 }, (_, i) => [String(i), String(i)])
  assert.equal(decideChart(grid(['x', 'y'], rows551)), undefined)
})

test('performance guards: >8 Y columns or >2000 data cells skip the chart', () => {
  const headers = ['x', ...Array.from({ length: 9 }, (_, i) => `y${i}`)]
  const rows = [['1', ...Array.from({ length: 9 }, () => '1')], ['2', ...Array.from({ length: 9 }, () => '2')]]
  assert.equal(decideChart(grid(headers, rows)), undefined)

  // 5 columns x 401 rows = 2005 cells, rows within the 550 cap
  const over = Array.from({ length: 401 }, (_, i) => [String(i), '1', '2', '3', '4'])
  assert.equal(decideChart(grid(['x', 'a', 'b', 'c', 'd'], over)), undefined)
  // 400 rows = 2000 cells still charts
  const ok = Array.from({ length: 400 }, (_, i) => [String(i), '1', '2', '3', '4'])
  assert.equal(decideChart(grid(['x', 'a', 'b', 'c', 'd'], ok)).kind, 'line')
})

test('empty cell, ragged row, or unit suffix keeps the table', () => {
  assert.equal(decideChart(grid(['x', 'y'], [['1', ''], ['2', '2']])), undefined)
  assert.equal(decideChart(grid(['x', 'y'], [['1'], ['2', '2']])), undefined)
  assert.equal(decideChart(grid(['x', 'y'], [['1', '3kg'], ['2', '2']])), undefined)
})

test('scientific notation keeps the table upgrade alive (negative-scale sum)', () => {
  // 1e2 / 2e1 drive the exact sum's scale negative; the walk must still chart.
  const spec = decideChart(grid(['k', 'v'], [['a', '1e2'], ['b', '2e1']]))
  assert.equal(spec.kind, 'bar')
})

test('pie tolerance holds beyond 12 fractional digits', () => {
  // 0.5 + (0.5 - 1e-15) differs from a whole by 1e-15, within the 1e-9
  // tolerance: no supplement slice.
  const spec = decideChart(grid(['k', 'v'], [['a', '0.5'], ['b', String(0.5 - 1e-15)]]))
  assert.equal(spec.kind, 'pie')
  assert.equal(spec.supplement, undefined)
})

test('a sum above 1 by more than 1e-9 at coarse scale falls to bar', () => {
  // 1.1 at scale 1: one ulp (0.1) far exceeds the tolerance, so compare exactly.
  assert.equal(decideChart(grid(['k', 'v'], [['a', '0.5'], ['b', '0.6']])).kind, 'bar')
})

test('a billion-digit exponent cell stays out of the scaled math (no freeze)', () => {
  // 0e100000000 parses as numeric 0; the exact sum declines it, so the table
  // still charts — as a bar — without ever building a billion-digit integer.
  const spec = decideChart(grid(['k', 'v'], [['a', '0e100000000'], ['b', '0.5']]))
  assert.equal(spec.kind, 'bar')
  assert.deepEqual(spec.series[0].values, [0, 0.5])
})

test('single column never charts', () => {
  assert.equal(decideChart(grid(['x'], [['1'], ['2']])), undefined)
})

test('text-dominant short-header tables stay plain tables', () => {
  const textTable = grid(['名称', '说明'], [['数据库配置', '高'], ['网络设置', '低']])
  assert.equal(decideChart(textTable), undefined)
  const chartable = grid(['城市', '销量'], [['北京', '120'], ['上海', '200']])
  assert.notEqual(decideChart(chartable), undefined)
})

test('the walk attaches the chart decision to table segments', () => {
  const segments = upgradeText('| 模块 | 覆盖率 |\n| --- | --- |\n| 解析 | 0.3 |\n| 渲染 | 0.25 |')
  assert.equal(segments[0].kind, 'table')
  assert.equal(segments[0].chart.kind, 'pie')
  const textSegments = upgradeText('| 名称 | 说明 |\n| --- | --- |\n| 数据库配置 | 高 |\n| 网络设置 | 低 |')
  assert.equal(textSegments[0].chart, undefined)
})
