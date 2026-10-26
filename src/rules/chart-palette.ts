/**
 * Categorical chart palette shared by the on-screen SVG and the PNG export.
 * Tableau 10: muted colors readable on both light and dark themes.
 */

const PALETTE = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7']

/**
 * Color for one series or slice index.
 * @param index - zero-based series/slice position.
 * @returns A hex color; the first palette entry on an empty palette.
 */
export function seriesColor(index: number): string {
  return PALETTE[index % PALETTE.length] ?? PALETTE[0] ?? '#4e79a7'
}
