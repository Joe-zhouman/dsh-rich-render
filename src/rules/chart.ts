/**
 * Chart decision tree v2 over one parsed table (spec 2026-10-23): form-driven,
 * no intent guessing. All data cells must be present and plain numbers
 * (sign/decimal/scientific; units, percents, separators are parse failures).
 *
 * 1. every column numeric, >=2 columns, >=2 rows -> multi-line (X = col 0)
 * 2. exactly 2 columns, first text, second numeric:
 *    all values >= 0 and 0 < sum <= 1 -> pie (sub-1 sum gains "other");
 *    otherwise -> bar
 * 3. anything else -> no chart (silently stays a table)
 *
 * Row tolerance is 550 (persona promises 500); >8 Y columns or >2000 data
 * cells skip the chart as render-freeze guards, not readability caps.
 * Pie classification sums exactly via scaled BigInt integers; |sum - 1| <=
 * 1e-9 counts as 1. Pure functions only; the render layer stays decision-free.
 */

import type { TableSpec } from './segments.ts'

/** Minimum/maximum data rows a chartable table may carry (tolerance above the persona's 500). */
const MIN_ROWS = 2
const MAX_ROWS = 550
/** Render-freeze guards (not readability caps; the table tab always stays reachable). */
const MAX_Y_COLUMNS = 8
const MAX_DATA_CELLS = 2000

/** The chart kinds this renderer can draw. */
export type ChartKind = 'line' | 'bar' | 'pie'

/** One named numeric series aligned to the label axis. */
export interface ChartSeries {
  readonly name: string
  readonly values: readonly number[]
}

/** The pie supplement slice: remainder topping a sub-1 sum up to a whole. */
export interface ChartSupplement {
  readonly value: number
}

/** Decided chart view of one table. */
export interface ChartSpec {
  readonly kind: ChartKind
  /** Category labels (text first column) or x values (numeric first column). */
  readonly labels: readonly string[]
  /** Numeric x values when the first column is numeric (line charts). */
  readonly xValues: readonly number[] | undefined
  readonly series: readonly ChartSeries[]
  /** Pie only: the topping-up slice for a sum below 1. */
  readonly supplement: ChartSupplement | undefined
}

/** Plain decimal literal: optional sign, digits with optional fraction, optional exponent. */
const NUMBER_RE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

/**
 * Parse one data cell as a plain number. Units, percent signs, thousands
 * separators, and currency symbols are parse failures (v2 removed the
 * percent scaling).
 * @param cell - cell text as extracted from the table.
 * @returns the numeric value, or undefined when the cell is not numeric.
 */
export function parseNumber(cell: string): number | undefined {
  const trimmed = cell.trim()
  if (!NUMBER_RE.test(trimmed)) return undefined
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : undefined
}

/** A decimal literal as exact scaled integer: value = digits / 10^scale. */
interface ScaledDecimal {
  readonly digits: bigint
  readonly scale: number
}

/**
 * Parse one plain-number cell into an exact scaled decimal.
 * @param cell - cell text already covered by parseNumber's grammar.
 * @returns the scaled decimal, or undefined when the cell is malformed.
 */
function scaled(cell: string): ScaledDecimal | undefined {
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(cell.trim())
  if (match === null || (match[2] === '' && match[3] === undefined)) return undefined
  const exponent = Number(match[4] ?? '0')
  // |exponent| > 400 can pass parseNumber (0e100000000 is a finite 0) but
  // makes the scaled-integer math a billion-digit freeze; treat as non-plain.
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 400) return undefined
  const digits = (match[2] ?? '') + (match[3] ?? '')
  const negative = match[1] === '-'
  return {
    digits: (negative ? -1n : 1n) * BigInt(digits === '' ? '0' : digits),
    scale: (match[3] ?? '').length - exponent,
  }
}

/**
 * Exact sum of plain-number cells, normalized to one common scale.
 * @param cells - data-cell texts of the value column.
 * @returns the sum, or undefined when any cell is not a plain number.
 */
export function exactSum(cells: readonly string[]): ScaledDecimal | undefined {
  const parts: ScaledDecimal[] = []
  for (const cell of cells) {
    const part = scaled(cell)
    if (part === undefined) return undefined
    parts.push(part)
  }
  const scale = Math.max(...parts.map(part => part.scale))
  if (!Number.isSafeInteger(scale) || Math.abs(scale) > 400) return undefined
  let digits = 0n
  for (const part of parts) {
    if (part.scale === scale) digits += part.digits
    else if (part.scale < scale) digits += part.digits * 10n ** BigInt(scale - part.scale)
    else digits += part.digits / 10n ** BigInt(part.scale - scale)
  }
  // Normalize to a nonnegative scale (scientific notation can drive it
  // negative), so every consumer can exponentiate with a nonnegative BigInt.
  if (scale < 0) return { digits: digits * 10n ** BigInt(-scale), scale: 0 }
  return { digits, scale }
}

/** `1e-9` tolerance at one sum scale, as an exact integer ulp count (0 when one ulp already exceeds it). */
function epsilonAt(scale: number): bigint {
  return scale >= 9 ? 10n ** BigInt(scale - 9) : 0n
}

/** Numerical value of a scaled decimal (display only; classification stays exact). */
function toNumber(value: ScaledDecimal): number {
  return Number(value.digits) / 10 ** value.scale
}

/** Column cell values of every data row (headers excluded), missing cells skipped. */
function columnValues(table: TableSpec, column: number): readonly string[] {
  const values: string[] = []
  for (const row of table.rows) {
    const cell = row[column]
    if (cell !== undefined) values.push(cell)
  }
  return values
}

/** Whether every data-row cell of one column parses as a number. */
function columnNumeric(table: TableSpec, column: number): boolean {
  const values = columnValues(table, column)
  return values.length === table.rows.length && values.every(cell => parseNumber(cell) !== undefined)
}

/** Whether no data-row cell of one column parses as a number (text column). */
function columnText(table: TableSpec, column: number): boolean {
  return columnValues(table, column).every(cell => parseNumber(cell) === undefined)
}

/**
 * Run the v2 decision tree over one table.
 * @param table - parsed GFM grid.
 * @returns the chart spec to render, or undefined to stay a table.
 */
export function decideChart(table: TableSpec): ChartSpec | undefined {
  const rows = table.rows.length
  if (rows < MIN_ROWS || rows > MAX_ROWS) return undefined
  const columns = table.headers.length
  if (columns < 2 || columns - 1 > MAX_Y_COLUMNS) return undefined
  if (rows * columns > MAX_DATA_CELLS) return undefined
  for (const row of table.rows) {
    if (row.length !== columns) return undefined
    for (const cell of row) {
      if (cell.trim() === '') return undefined
    }
  }
  const seriesOf = (from: number): ChartSeries[] => {
    const series: ChartSeries[] = []
    for (let column = from; column < columns; column++) {
      series.push({
        name: table.headers[column] ?? String(column + 1),
        values: table.rows.map(row => parseNumber(row[column] ?? '') ?? 0),
      })
    }
    return series
  }
  let allNumeric = true
  for (let column = 0; column < columns; column++) {
    if (!columnNumeric(table, column)) { allNumeric = false; break }
  }
  if (allNumeric) {
    return {
      kind: 'line',
      labels: table.rows.map(row => row[0] ?? ''),
      xValues: table.rows.map(row => parseNumber(row[0] ?? '') ?? 0),
      series: seriesOf(1),
      supplement: undefined,
    }
  }
  if (columns !== 2 || !columnText(table, 0) || !columnNumeric(table, 1)) return undefined
  const valueCells = table.rows.map(row => row[1] ?? '')
  const values = valueCells.map(cell => parseNumber(cell) ?? 0)
  const sum = exactSum(valueCells)
  if (sum !== undefined && values.every(value => value >= 0) && sum.digits > 0n) {
    const one = 10n ** BigInt(sum.scale)
    const epsilon = epsilonAt(sum.scale)
    if (sum.digits <= one + epsilon) {
      const exactlyOne = sum.digits >= one - epsilon
      return {
        kind: 'pie',
        labels: table.rows.map(row => row[0] ?? ''),
        xValues: undefined,
        series: [{ name: table.headers[1] ?? '2', values }],
        supplement: exactlyOne ? undefined : { value: 1 - toNumber(sum) },
      }
    }
  }
  return {
    kind: 'bar',
    labels: table.rows.map(row => row[0] ?? ''),
    xValues: undefined,
    series: [{ name: table.headers[1] ?? '2', values }],
    supplement: undefined,
  }
}
