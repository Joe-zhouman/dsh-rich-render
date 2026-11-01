/**
 * Dual-view table presentation: a chartable grid opens on its chart, with
 * table/chart tabs plus an image-export action. The chart pane stays mounted
 * while the table is shown so the export never depends on the active view.
 */

import { useRef, useState } from 'react'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChartLabels } from './charts.tsx'
import { ChartView } from './charts.tsx'
import { downloadChartPng, copyChartPng } from './chart-download.ts'
import { FenceToolbar } from './FenceToolbar.tsx'
import { InlineMarkdown } from './InlineMarkdown.tsx'
import type { TableSegment } from '../rules/segments.ts'
import type { CSSProperties } from 'react'
import type { TableSpec } from '../rules/segments.ts'

function alignStyle(align: TableSpec['aligns'][number]): CSSProperties | undefined {
  if (align === null || align === undefined) return undefined
  return { textAlign: align }
}

/** The styled grid. */
function Grid({ segment, labels }: { segment: TableSegment; labels: MarkdownLabels }) {
  const { table } = segment
  return (
    <div className="dshr-tableblock">
      {segment.title !== '' && (
        <div className="dshr-cards-title"><InlineMarkdown text={segment.title} labels={labels} /></div>
      )}
      <div className="dshr-table-wrap">
        <table className="dshr-table">
          <thead>
            <tr>
              {table.headers.map((header, column) => (
                <th key={column} style={alignStyle(table.aligns[column])}>
                  <InlineMarkdown text={header} labels={labels} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowNumber) => (
              <tr key={rowNumber}>
                {table.headers.map((_header, column) => {
                  const value = row[column] ?? ''
                  return (
                    <td key={column} style={alignStyle(table.aligns[column])}>
                      {value !== '' && <InlineMarkdown text={value} labels={labels} />}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export interface TableDualViewProps {
  readonly segment: TableSegment
  /** Toggle, export, copy, and supplement-slice copy. */
  readonly chartLabels: ChartLabels & {
    table: string
    chart: string
    downloadChart: string
    copy: string
    copied: string
    copyFailed: string
  }
  /** Platform markdown chrome for header and cell content. */
  readonly labels: MarkdownLabels
}

/** Chart-first dual view with a table fallback, PNG export, and clipboard copy. */
export function TableDualView({ segment, chartLabels, labels }: TableDualViewProps) {
  const [view, setView] = useState<'chart' | 'table'>(segment.chart === undefined ? 'table' : 'chart')
  const chartHost = useRef<HTMLDivElement | null>(null)
  const { chart } = segment
  if (chart === undefined) return <Grid segment={segment} labels={labels} />
  return (
    <div className="dshr-dual" data-view={view}>
      <FenceToolbar
        tabs={[
          { id: 'table', label: chartLabels.table, icon: 'table' },
          { id: 'chart', label: chartLabels.chart, icon: 'chart' },
        ]}
        active={view}
        onSelect={(id) => { setView(id === 'chart' ? 'chart' : 'table') }}
        onCopy={() => copyChartPng(chartHost.current, chart, chartLabels)}
        copyLabels={{ copy: chartLabels.copy, copied: chartLabels.copied, failed: chartLabels.copyFailed }}
        onDownload={() => { void downloadChartPng(chartHost.current, chart, chartLabels) }}
        downloadLabel={chartLabels.downloadChart}
      />
      <div className="dshr-dual-pane" data-active={view === 'chart' || undefined} ref={chartHost}>
        <ChartView chart={chart} labels={chartLabels} />
      </div>
      <div className="dshr-dual-pane" data-active={view === 'table' || undefined}>
        <Grid segment={segment} labels={labels} />
      </div>
    </div>
  )
}
