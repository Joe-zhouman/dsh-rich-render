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
import { FenceToolbar } from './FenceToolbar.tsx'
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
  const [tab, setTab] = useState<'code' | 'chart'>('chart')
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
  const download = (): void => {
    if (image === undefined) return
    const anchor = document.createElement('a')
    anchor.href = image
    anchor.download = 'matplotlib.png'
    anchor.click()
  }
  const copy = async (): Promise<boolean> => {
    if (image === undefined) return false
    try {
      const blob = await (await fetch(image)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return true
    } catch {
      // A host that refuses image writes reads as a failed copy.
      return false
    }
  }
  return (
    <div className="dshr-mpl dshr-fence">
      <FenceToolbar
        tabs={[
          { id: 'code', label: chrome.mplCode, icon: 'code' },
          { id: 'chart', label: chrome.mplChart, icon: 'chart' },
        ]}
        active={tab}
        onSelect={(id) => { setTab(id === 'chart' ? 'chart' : 'code') }}
        onCopy={copy}
        copyLabels={{ copy: chrome.copy, copied: chrome.copied, failed: chrome.copyFailed }}
        onDownload={download}
        downloadLabel={chrome.mplDownloadPng}
        disabled={image === undefined}
      />
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
    </div>
  )
}
