/**
 * Matplotlib cell: probes readiness once; while off/unreachable the fence
 * renders as the plain code block the model wrote. Live cells auto-execute
 * on mount (the host cache makes re-mounts cheap), open on the chart tab,
 * and a failure reopens on the code tab with the error beside it — no retry
 * button: failed results cache, so a retry would rerun the same fate.
 */

import { useEffect, useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MatplotlibSegment } from '../rules/segments.ts'
import { matplotlibExec, matplotlibStatus, type MatplotlibRunResult } from '../matplotlib-bridge.ts'
import type { RichChrome } from './RichMarkdownText.tsx'

type Phase = 'probe' | 'off' | 'running' | 'done' | 'failed'

export interface MatplotlibViewProps {
  readonly segment: MatplotlibSegment
  readonly labels: MarkdownLabels
  readonly chrome: RichChrome
}

/** Draw one cell. */
export function MatplotlibView({ segment, labels, chrome }: MatplotlibViewProps) {
  const [phase, setPhase] = useState<Phase>('probe')
  const [result, setResult] = useState<MatplotlibRunResult>()
  const [tab, setTab] = useState<'code' | 'chart' | 'download'>('chart')
  useEffect(() => {
    let alive = true
    matplotlibStatus().then(status => {
      if (!alive) return
      if (!status.enabled || !status.ready) {
        setPhase('off')
        return
      }
      setPhase('running')
      matplotlibExec(segment.code).then(run => {
        if (!alive) return
        setResult(run)
        if (run.status === 'success') setPhase('done')
        else {
          setPhase('failed')
          setTab('code')
        }
      })
    })
    return () => { alive = false }
  }, [segment.code])

  if (phase === 'off' || phase === 'probe') {
    return <MarkdownText text={segment.source} labels={labels} />
  }
  const image = result?.status === 'success' ? `data:image/png;base64,${result.image}` : undefined
  return (
    <div className="dshr-mpl">
      <div className="dshr-mpl-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'code'} className={tab === 'code' ? 'dshr-mpl-tab active' : 'dshr-mpl-tab'} onClick={() => setTab('code')}>{chrome.mplCode}</button>
        <button type="button" role="tab" aria-selected={tab === 'chart'} className={tab === 'chart' ? 'dshr-mpl-tab active' : 'dshr-mpl-tab'} onClick={() => setTab('chart')}>{chrome.mplChart}</button>
        <button type="button" role="tab" aria-selected={tab === 'download'} className={tab === 'download' ? 'dshr-mpl-tab active' : 'dshr-mpl-tab'} onClick={() => setTab('download')}>{chrome.mplDownload}</button>
      </div>
      {tab === 'code' && <MarkdownText text={segment.source} labels={labels} />}
      {tab === 'chart' && (
        phase === 'running' || phase === 'done'
          ? (
            <div className="dshr-mpl-chart">
              {image !== undefined
                ? <img src={image} alt={chrome.mplChart} />
                : <span className="dshr-mpl-note">{chrome.mplRunning}</span>}
            </div>
          )
          : (
            <div className="dshr-mpl-chart">
              <span className="dshr-mpl-note dshr-mpl-error">{chrome.mplFailed}</span>
              {result?.status === 'error' && <pre className="dshr-mpl-stderr">{result.message}</pre>}
            </div>
          )
      )}
      {tab === 'download' && (
        <div className="dshr-mpl-chart">
          {image !== undefined
            ? <a className="dshr-mpl-dl" href={image} download="matplotlib.png">{chrome.mplDownloadPng}</a>
            : <span className="dshr-mpl-note">{phase === 'running' ? chrome.mplRunning : chrome.mplFailed}</span>}
        </div>
      )}
    </div>
  )
}
