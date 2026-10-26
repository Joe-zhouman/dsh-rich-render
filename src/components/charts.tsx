/**
 * Hand-drawn SVG charts (zero dependencies): grouped bars, multi-series
 * lines, and a donut pie with the topping-up supplement slice. Fixed
 * geometry in a viewBox keeps text crisp while the container scales;
 * series colors come from one restrained categorical palette.
 */

import { memo, useMemo, useState } from 'react'
import { seriesColor } from '../rules/chart-palette.ts'
import type { ChartSpec, ChartSeries } from '../rules/chart.ts'
import { largestRemainderPercentages } from '../rules/percent.ts'

/** Chart geometry: viewBox size everything below is laid out against. */
const WIDTH = 560
const HEIGHT = 260
const PAD = { top: 16, right: 16, bottom: 34, left: 48 }

/** Compact value formatting for axis ticks and legend totals. */
function fmt(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(Math.abs(value) >= 1 ? 1 : 2).replace(/\.?0+$/u, '')
}

/** Nice round y domain from 0 (or the min when values go negative). */
function yDomain(values: readonly number[]): { min: number; max: number } {
  let min = 0
  let max = 0
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  if (max === min) max = min + 1
  const pad = (max - min) * 0.08
  return { min: min === 0 ? 0 : min - pad, max: max + pad }
}

export interface ChartLabels {
  /** Legend name for the pie supplement slice. */
  readonly otherSlice: string
}

export interface ChartViewProps {
  readonly chart: ChartSpec
  readonly labels: ChartLabels
}

interface SeriesToggleState {
  readonly hidden: ReadonlySet<number>
}

/** One legend row: color dot, name, value; a click toggles the series. */
function Legend({ entries, hidden, onToggle }: {
  entries: readonly { color: string; name: string; value: string }[]
  hidden: ReadonlySet<number>
  onToggle: (index: number) => void
}) {
  return (
    <div className="dshr-chart-legend">
      {entries.map((entry, index) => (
        <button
          key={index}
          type="button"
          className="dshr-chart-legend-item"
          data-off={hidden.has(index) || undefined}
          onClick={() => onToggle(index)}
        >
          <span className="dshr-chart-dot" style={{ background: entry.color }} />
          <span className="dshr-chart-legend-name">{entry.name}</span>
          <span className="dshr-chart-legend-value">{entry.value}</span>
        </button>
      ))}
    </div>
  )
}

/** Grouped bar chart with toggleable series. */
const BarChart = memo(function BarChart({ chart, labels }: ChartViewProps) {
  const [hidden, setHidden] = useState<SeriesToggleState>({ hidden: new Set() })
  const visible = chart.series.filter((_series, index) => !hidden.hidden.has(index))
  const all = chart.series.flatMap(series => series.values)
  const domain = useMemo(() => yDomain(all), [chart])
  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const scale = (value: number): number => PAD.top + plotH * (1 - (value - domain.min) / (domain.max - domain.min))
  const groupW = plotW / Math.max(1, chart.labels.length)
  const barW = Math.max(3, groupW * 0.62 / Math.max(1, visible.length))
  const ticks = 4
  return (
    <div className="dshr-chart">
      <svg className="dshr-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
        {Array.from({ length: ticks + 1 }, (_unused, tick) => {
          const value = domain.min + (domain.max - domain.min) * tick / ticks
          const y = scale(value)
          return (
            <g key={tick}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className="dshr-chart-grid" />
              <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" className="dshr-chart-tick">{fmt(value)}</text>
            </g>
          )
        })}
        {chart.labels.map((label, group) => {
          const groupX = PAD.left + groupW * group
          return (
            <g key={group}>
              {visible.map((series, seriesIndex) => {
                const value = series.values[group] ?? 0
                const y = scale(Math.max(value, 0))
                const height = Math.abs(scale(value) - scale(0))
                const color = seriesColor(chart.series.indexOf(series) === -1 ? seriesIndex : chart.series.indexOf(series))
                return (
                  <rect
                    key={seriesIndex}
                    x={groupX + groupW / 2 - barW * visible.length / 2 + barW * seriesIndex}
                    y={y}
                    width={barW - 1}
                    height={Math.max(1, height)}
                    rx={Math.min(3, barW / 3)}
                    fill={color}
                    className="dshr-chart-bar"
                  >
                    <title>{`${label} · ${series.name}: ${fmt(value)}`}</title>
                  </rect>
                )
              })}
              <text x={groupX + groupW / 2} y={HEIGHT - PAD.bottom + 16} textAnchor="middle" className="dshr-chart-tick">
                {label.length > 8 ? `${label.slice(0, 7)}…` : label}
              </text>
            </g>
          )
        })}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={scale(0)} y2={scale(0)} className="dshr-chart-axis" />
      </svg>
      <Legend
        entries={chart.series.map((series, index) => ({
          color: seriesColor(index),
          name: series.name,
          value: fmt(series.values.reduce((total, value) => total + value, 0)),
        }))}
        hidden={hidden.hidden}
        onToggle={index => setHidden(prev => {
          const next = new Set(prev.hidden)
          if (next.has(index)) next.delete(index)
          else if (next.size < chart.series.length - 1) next.add(index)
          return { hidden: next }
        })}
      />
    </div>
  )
})

/** Multi-series line chart; x by index or by the numeric first column. */
const LineChart = memo(function LineChart({ chart }: ChartViewProps) {
  const [hidden, setHidden] = useState<SeriesToggleState>({ hidden: new Set() })
  const visible = chart.series.filter((_series, index) => !hidden.hidden.has(index))
  const all = chart.series.flatMap(series => series.values).concat(chart.xValues ?? [])
  const domain = useMemo(() => yDomain(all), [chart])
  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const xAt = (index: number): number => {
    if (chart.xValues === undefined || chart.xValues.length < 2) return PAD.left + plotW * index / Math.max(1, chart.labels.length - 1)
    const xs = chart.xValues
    const min = Math.min(...xs)
    const max = Math.max(...xs)
    const x = xs[index] ?? 0
    return PAD.left + plotW * (max === min ? 0.5 : (x - min) / (max - min))
  }
  const scale = (value: number): number => PAD.top + plotH * (1 - (value - domain.min) / (domain.max - domain.min))
  const ticks = 4
  return (
    <div className="dshr-chart">
      <svg className="dshr-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
        {Array.from({ length: ticks + 1 }, (_unused, tick) => {
          const value = domain.min + (domain.max - domain.min) * tick / ticks
          const y = scale(value)
          return (
            <g key={tick}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className="dshr-chart-grid" />
              <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" className="dshr-chart-tick">{fmt(value)}</text>
            </g>
          )
        })}
        {visible.map(series => {
          const seriesIndex = chart.series.indexOf(series)
          const color = seriesColor(seriesIndex)
          const points = series.values.map((value, index) => `${xAt(index)},${scale(value)}`).join(' ')
          return (
            <g key={seriesIndex}>
              <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {series.values.map((value, index) => (
                <circle key={index} cx={xAt(index)} cy={scale(value)} r={3} fill={color} className="dshr-chart-point">
                  <title>{`${chart.labels[index] ?? ''} · ${series.name}: ${fmt(value)}`}</title>
                </circle>
              ))}
            </g>
          )
        })}
        {chart.labels.map((label, index) => (index % Math.ceil(chart.labels.length / 8) === 0
          ? <text key={index} x={xAt(index)} y={HEIGHT - PAD.bottom + 16} textAnchor="middle" className="dshr-chart-tick">
              {label.length > 8 ? `${label.slice(0, 7)}…` : label}
            </text>
          : null))}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} className="dshr-chart-axis" />
      </svg>
      <Legend
        entries={chart.series.map((series, index) => ({
          color: seriesColor(index),
          name: series.name,
          value: '',
        }))}
        hidden={hidden.hidden}
        onToggle={index => setHidden(prev => {
          const next = new Set(prev.hidden)
          if (next.has(index)) next.delete(index)
          else if (next.size < chart.series.length - 1) next.add(index)
          return { hidden: next }
        })}
      />
    </div>
  )
})

/** Donut pie; a sub-1 sum renders one dashed muted supplement slice. */
const PieChart = memo(function PieChart({ chart, labels }: ChartViewProps) {
  const values = chart.series[0]?.values ?? []
  const supplement = chart.supplement
  const total = values.reduce((sum, value) => sum + value, 0) + (supplement?.value ?? 0)
  const radius = 78
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const slices = values.map((value, index) => {
    const fraction = total > 0 ? value / total : 0
    const slice = { value, fraction, color: seriesColor(index), offset }
    offset += fraction
    return slice
  })
  const supplementSlice = supplement === undefined ? undefined
    : { value: supplement.value, fraction: total > 0 ? supplement.value / total : 0, offset }
  const percentOf = largestRemainderPercentages(
    [...values, supplement?.value ?? 0],
    total,
  )
  return (
    <div className="dshr-chart dshr-chart-pie">
      <svg className="dshr-chart-svg dshr-chart-svg-pie" viewBox="0 0 200 200" role="img">
        <circle cx={100} cy={100} r={radius} fill="none" stroke="var(--dsw-alias-border-l1)" strokeWidth={30} />
        {slices.map((slice, index) => (
          <circle
            key={index}
            cx={100}
            cy={100}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={28}
            strokeDasharray={`${slice.fraction * circumference} ${circumference}`}
            strokeDashoffset={-slice.offset * circumference}
            transform="rotate(-90 100 100)"
            className="dshr-chart-slice"
          >
            <title>{`${chart.labels[index] ?? ''}: ${fmt(slice.value)} (${percentOf[index]}%)`}</title>
          </circle>
        ))}
        {supplementSlice !== undefined && (
          <circle
            cx={100}
            cy={100}
            r={radius}
            fill="none"
            stroke="var(--dsw-alias-label-caption)"
            strokeWidth={28}
            strokeDasharray={`${supplementSlice.fraction * circumference} ${circumference}`}
            strokeDashoffset={-supplementSlice.offset * circumference}
            transform="rotate(-90 100 100)"
            className="dshr-chart-slice dshr-chart-slice-supplement"
          >
            <title>{`${labels.otherSlice}: ${fmt(supplementSlice.value)} (${percentOf[values.length]}%)`}</title>
          </circle>
        )}
      </svg>
      <div className="dshr-chart-pie-side">
        <div className="dshr-chart-legend dshr-chart-legend-column">
          {slices.map((slice, index) => (
            <div key={index} className="dshr-chart-legend-item">
              <span className="dshr-chart-dot" style={{ background: slice.color }} />
              <span className="dshr-chart-legend-name">{chart.labels[index]}</span>
              <span className="dshr-chart-legend-value">{fmt(slice.value)} · {percentOf[index]}%</span>
            </div>
          ))}
          {supplementSlice !== undefined && (
            <div className="dshr-chart-legend-item" data-supplement>
              <span className="dshr-chart-dot dshr-chart-dot-supplement" />
              <span className="dshr-chart-legend-name">{labels.otherSlice}</span>
              <span className="dshr-chart-legend-value">{fmt(supplementSlice.value)} · {percentOf[values.length]}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

/** Dispatch one chart spec to its drawing. */
export function ChartView({ chart, labels }: ChartViewProps) {
  switch (chart.kind) {
    case 'bar': return <BarChart chart={chart} labels={labels} />
    case 'line': return <LineChart chart={chart} labels={labels} />
    case 'pie': return <PieChart chart={chart} labels={labels} />
    default: return null
  }
}
