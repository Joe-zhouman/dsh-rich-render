/**
 * Largest-remainder integer percentages: floor every share, then hand the
 * leftover points to the largest fractional remainders (document order breaks
 * ties), so one pie's displayed percentages always sum to exactly 100.
 */

/**
 * @param values - slice values of one pie (supplement included).
 * @param total - their sum; a non-positive total yields zeros.
 * @returns one integer percentage per value.
 */
export function largestRemainderPercentages(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0)
  const shares = values.map(value => (value / total) * 100)
  const floors = shares.map(Math.floor)
  let left = 100 - floors.reduce((sum, floor) => sum + floor, 0)
  const order = shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
  for (let k = 0; left > 0 && k < order.length; k++) {
    floors[order[k]!.index]! += 1
    left -= 1
  }
  return floors
}
