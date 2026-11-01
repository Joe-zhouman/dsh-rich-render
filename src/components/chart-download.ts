/**
 * Chart image export: rasterize one of the hand-drawn SVG charts to a PNG,
 * with a legend drawn beside (pie) or below (bar/line) the plot.
 *
 * The chart is a static SVG vocabulary, but its paint and text styles come
 * from the page stylesheet, so those computed values are copied onto a clone
 * before serialization. The clone is loaded as an image and drawn to a 2x
 * canvas over the page's opaque background. Any failure leaves the click
 * inert — the transcript must never throw or show an error for an export.
 */

import { seriesColor } from '../rules/chart-palette.ts'
import type { ChartSpec } from '../rules/chart.ts'
import { largestRemainderPercentages } from '../rules/percent.ts'

/** Computed style properties the chart stylesheet applies outside attributes. */
const PAINTED = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity',
  'font-family', 'font-size', 'font-weight', 'letter-spacing',
  'text-anchor', 'dominant-baseline', 'paint-order',
] as const

/** Rasterization scale: 2x keeps axis text crisp on high-density displays. */
const SCALE = 2

/** Fallback dimensions when the SVG carries no viewBox (charts always do). */
const FALLBACK_WIDTH = 560
const FALLBACK_HEIGHT = 260

/** Width reserved for the pie legend column. */
const PIE_LEGEND_WIDTH = 220

/** Height reserved for the bar/line legend strip. */
const SERIES_LEGEND_HEIGHT = 28

/** Fallback color for the muted pie supplement slice. */
const SUPPLEMENT_COLOR = '#9aa0a6'

/** Locale copy the export legend needs. */
export interface ChartExportLabels {
  /** Legend name for the pie supplement slice. */
  readonly otherSlice: string
}

/** One rendered legend row or horizontal entry. */
interface LegendEntry {
  readonly color: string
  readonly text: string
}

/**
 * Filename stamped in the viewer's local time, filesystem-safe.
 * @param now - injection point for tests; defaults to the current time.
 * @returns `dsh-chart-YYYYMMDD-HHmmss.png`.
 */
export function chartPngName(now: Date = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    + `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `dsh-chart-${stamp}.png`
}

/**
 * Compact display for legend values.
 * @param value - numeric slice value or series total.
 * @returns An integer as-is, otherwise a trimmed decimal.
 */
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))
}

/**
 * The first opaque background color behind the host, falling back to white.
 * Chart containers are transparent, and a PNG needs a painted background.
 * @param host - element containing the chart.
 * @returns A CSS color usable as a canvas fill.
 */
function pageBackground(host: HTMLElement): string {
  for (let element: HTMLElement | null = host; element !== null; element = element.parentElement) {
    const color = getComputedStyle(element).backgroundColor
    const channels = /^rgba?\(([^)]+)\)$/u.exec(color)?.[1]?.split(',').map(part => Number(part.trim()))
    if (channels === undefined) continue
    const alpha = channels[3] ?? 1
    if (alpha > 0) return color
  }
  return '#ffffff'
}

/**
 * Legend entries for the chart, matching the on-screen legend's content.
 * @param chart - chart spec the SVG was drawn from.
 * @param labels - localized supplement name.
 * @param host - chart host, used to read the supplement slice color.
 * @returns Pie labels with values/percentages, or bar/line series names.
 */
function legendEntries(chart: ChartSpec, labels: ChartExportLabels, host: HTMLElement): LegendEntry[] {
  if (chart.kind !== 'pie') {
    return chart.series.map((series, index) => ({
      color: seriesColor(index),
      text: chart.kind === 'bar'
        ? `${series.name}  ${formatNumber(series.values.reduce((total, value) => total + value, 0))}`
        : series.name,
    }))
  }
  const values = chart.series[0]?.values ?? []
  const total = values.reduce((sum, value) => sum + value, 0) + (chart.supplement?.value ?? 0)
  const pcts = largestRemainderPercentages([...values, chart.supplement?.value ?? 0], total)
  const percent = (index: number): number => pcts[index] ?? 0
  const entries = chart.labels.map((label, index) => {
    const value = values[index] ?? 0
    return { color: seriesColor(index), text: `${label}  ${formatNumber(value)} (${percent(index)}%)` }
  })
  if (chart.supplement !== undefined) {
    const slice = host.querySelector('.dshr-chart-slice-supplement')
    const color = slice === null ? SUPPLEMENT_COLOR : getComputedStyle(slice).stroke
    entries.push({
      color: color === '' || color === 'none' ? SUPPLEMENT_COLOR : color,
      text: `${labels.otherSlice}  ${formatNumber(chart.supplement.value)} (${percent(values.length)}%)`,
    })
  }
  return entries
}

/**
 * Serialize the host's chart with inline computed styles.
 * @param host - element containing the chart SVG.
 * @returns The SVG clone ready for serialization, or undefined without a chart.
 */
function inlineChart(host: HTMLElement): SVGSVGElement | undefined {
  const svg = host.querySelector('svg')
  if (svg === null) return undefined
  const box = svg.viewBox.baseVal
  const width = box.width > 0 ? box.width : FALLBACK_WIDTH
  const height = box.height > 0 ? box.height : FALLBACK_HEIGHT
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  const source = [svg, ...svg.querySelectorAll('*')]
  const target = [clone, ...clone.querySelectorAll('*')]
  for (let index = 0; index < source.length; index++) {
    const from = source[index]
    const to = target[index]
    if (!(from instanceof Element) || !(to instanceof Element)) continue
    const style = getComputedStyle(from)
    for (const property of PAINTED) {
      const value = style.getPropertyValue(property)
      if (value !== '') to.setAttribute(property, value)
    }
  }
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', pageBackground(host))
  clone.insertBefore(background, clone.firstChild)
  return clone
}

/**
 * Load the serialized SVG as an image element.
 * @param source - serialized SVG markup.
 * @returns The decoded image.
 */
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('chart image failed to decode')) }
    image.src = url
  })
}

/**
 * Rasterize one canvas to a PNG blob.
 * @param canvas - painted chart canvas.
 * @returns The PNG blob, or null when the browser cannot encode it.
 */
function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(resolve => { canvas.toBlob(resolve, 'image/png') })
}

/**
 * Draw the legend in page coordinates on the scaled canvas context.
 * @param context - canvas context already scaled to CSS pixels.
 * @param entries - legend rows.
 * @param chart - chart spec deciding the legend placement.
 * @param baseWidth - plotted SVG width.
 * @param baseHeight - plotted SVG height.
 * @param ink - text color inherited from the transcript.
 */
function drawLegend(
  context: CanvasRenderingContext2D,
  entries: readonly LegendEntry[],
  chart: ChartSpec,
  baseWidth: number,
  baseHeight: number,
  ink: string,
): void {
  context.fillStyle = ink
  if (chart.kind === 'pie') {
    for (const [index, entry] of entries.entries()) {
      const y = 24 + index * 24
      context.beginPath()
      context.arc(baseWidth + 18, y, 4, 0, Math.PI * 2)
      context.fillStyle = entry.color
      context.fill()
      context.fillStyle = ink
      context.fillText(entry.text, baseWidth + 30, y)
    }
    return
  }
  let x = 12
  const y = baseHeight + SERIES_LEGEND_HEIGHT / 2
  for (const entry of entries) {
    context.beginPath()
    context.arc(x + 4, y, 4, 0, Math.PI * 2)
    context.fillStyle = entry.color
    context.fill()
    context.fillStyle = ink
    context.fillText(entry.text, x + 14, y)
    x += 28 + context.measureText(entry.text).width
  }
}

/**
 * Rasterize the chart inside `host` to a PNG blob, legend included. Silent on
 * failure: both export and clipboard actions treat a null as "nothing to do".
 * @param host - element containing the chart SVG; null before first paint.
 * @param chart - chart spec the SVG was drawn from.
 * @param labels - localized legend names.
 * @returns the PNG blob, or null when the chart cannot be drawn or encoded.
 */
export async function chartPngBlob(
  host: HTMLElement | null,
  chart: ChartSpec,
  labels: ChartExportLabels,
): Promise<Blob | null> {
  try {
    if (host === null) return null
    const clone = inlineChart(host)
    if (clone === undefined) return null
    const baseWidth = Number(clone.getAttribute('width'))
    const baseHeight = Number(clone.getAttribute('height'))
    const entries = legendEntries(chart, labels, host)
    const pie = chart.kind === 'pie'
    const width = pie ? baseWidth + PIE_LEGEND_WIDTH : baseWidth
    const height = pie ? Math.max(baseHeight, entries.length * 24 + 16) : baseHeight + SERIES_LEGEND_HEIGHT
    const image = await loadImage(new XMLSerializer().serializeToString(clone))
    const background = pageBackground(host)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * SCALE))
    canvas.height = Math.max(1, Math.round(height * SCALE))
    const context = canvas.getContext('2d')
    if (context === null) return null
    context.scale(SCALE, SCALE)
    context.fillStyle = background
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, baseWidth, baseHeight)
    const style = getComputedStyle(host)
    context.font = `12px ${style.fontFamily === '' ? 'sans-serif' : style.fontFamily}`
    context.textBaseline = 'middle'
    context.textAlign = 'start'
    drawLegend(context, entries, chart, baseWidth, baseHeight, style.color === '' ? '#333333' : style.color)
    return await canvasBlob(canvas)
  } catch {
    // Export is a convenience; a failed render leaves the page untouched.
    return null
  }
}

/**
 * Export the chart inside `host` as a downloaded PNG. Silent on failure.
 * @param host - element containing the chart SVG; null before first paint.
 * @param chart - chart spec the SVG was drawn from.
 * @param labels - localized legend names.
 */
export async function downloadChartPng(
  host: HTMLElement | null,
  chart: ChartSpec,
  labels: ChartExportLabels,
): Promise<void> {
  try {
    const blob = await chartPngBlob(host, chart, labels)
    if (blob === null) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = chartPngName()
    anchor.click()
    window.setTimeout(() => { URL.revokeObjectURL(url) }, 0)
  } catch {
    // Export is a convenience; a failed render leaves the page untouched.
  }
}

/**
 * Copy the chart inside `host` to the clipboard as a PNG.
 * @param host - element containing the chart SVG; null before first paint.
 * @param chart - chart spec the SVG was drawn from.
 * @param labels - localized legend names.
 * @returns whether the clipboard accepted the image.
 */
export async function copyChartPng(
  host: HTMLElement | null,
  chart: ChartSpec,
  labels: ChartExportLabels,
): Promise<boolean> {
  try {
    const blob = await chartPngBlob(host, chart, labels)
    if (blob === null) return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    // A host that refuses image writes (or a tainted canvas) reads as failed.
    return false
  }
}
