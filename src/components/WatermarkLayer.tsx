/**
 * Watermark background layer (shell.overlay list entry): a corner-anchored,
 * bleached (grayscale + multiply), low-opacity image that never carries
 * pointer events, plus a tiny corner gear that opens the settings popover.
 * Pure decoration: any failure leaves nothing painted.
 */

import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { readWatermark, writeWatermark } from '../watermark-config.ts'
import type { WatermarkConfig, WatermarkCorner } from '../watermark-config.ts'
import type { Translate } from '../chat-contract.ts'

const CORNER_OPTIONS: readonly { value: WatermarkCorner; labelKey: string }[] = [
  { value: 'tl', labelKey: 'wmCornerTl' },
  { value: 'tr', labelKey: 'wmCornerTr' },
  { value: 'bl', labelKey: 'wmCornerBl' },
  { value: 'br', labelKey: 'wmCornerBr' },
]

const GEAR_PATH = 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'
  + 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'

/** The settings popover: the four knobs, persisted on change. */
function WatermarkSettings({ config, onChange, onClose, t }: {
  config: WatermarkConfig
  onChange: (next: WatermarkConfig) => void
  onClose: () => void
  t: Translate
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const pickImage = useCallback(() => { fileRef.current?.click() }, [])
  const onFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file === undefined) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange({ ...config, image: reader.result, enabled: true })
    }
    reader.readAsDataURL(file)
  }, [config, onChange])
  return (
    <div className="dshr-wm-panel" role="dialog" aria-label={t('wmTitle')} onPointerDown={event => event.stopPropagation()}>
      <div className="dshr-wm-panel-row dshr-wm-panel-head">
        <span className="dshr-wm-panel-title">{t('wmTitle')}</span>
        <button type="button" className="dshr-wm-close" aria-label={t('wmClose')} onClick={onClose}>×</button>
      </div>
      <label className="dshr-wm-panel-row">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={event => onChange({ ...config, enabled: event.target.checked })}
        />
        <span>{t('wmEnable')}</span>
      </label>
      <div className="dshr-wm-panel-row dshr-wm-panel-col">
        <span>{t('wmImage')}</span>
        <div className="dshr-wm-image-row">
          <input
            type="text"
            className="dshr-wm-input"
            placeholder="https://…"
            value={config.image.startsWith('data:') ? '' : config.image}
            onChange={event => onChange({ ...config, image: event.target.value })}
          />
          <button type="button" className="dshr-wm-button" onClick={pickImage}>{t('wmPick')}</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
      <label className="dshr-wm-panel-row">
        <span>{t('wmOpacity')}</span>
        <input
          type="range"
          min={0.02}
          max={0.5}
          step={0.01}
          value={config.opacity}
          onChange={event => onChange({ ...config, opacity: Number(event.target.value) })}
        />
        <span className="dshr-wm-value">{config.opacity.toFixed(2)}</span>
      </label>
      <div className="dshr-wm-panel-row">
        <span>{t('wmCorner')}</span>
        <div className="dshr-wm-corners" role="radiogroup" aria-label={t('wmCorner')}>
          {CORNER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={config.corner === option.value}
              className="dshr-wm-corner"
              data-active={config.corner === option.value || undefined}
              onClick={() => onChange({ ...config, corner: option.value })}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="dshr-wm-panel-row">
        <span>{t('wmSize')}</span>
        <input
          type="range"
          min={15}
          max={70}
          step={1}
          value={config.size}
          onChange={event => onChange({ ...config, size: Number(event.target.value) })}
        />
        <span className="dshr-wm-value">{config.size}</span>
      </div>
    </div>
  )
}

export interface WatermarkLayerProps {
  readonly t: Translate
}

/** The shell.overlay entry: painted watermark plus its settings gear. */
export function WatermarkLayer({ t }: WatermarkLayerProps) {
  const [config, setConfig] = useState<WatermarkConfig>(readWatermark)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const change = useCallback((next: WatermarkConfig) => {
    setConfig(next)
    setFailed(false)
    writeWatermark(next)
  }, [])
  const showImage = config.enabled && config.image !== '' && !failed
  return (
    <div className="dshr-wm" data-corner={config.corner}>
      {showImage && (
        <img
          className="dshr-wm-img"
          src={config.image}
          alt=""
          style={{ opacity: config.opacity, width: `${config.size}vmin` }}
          onError={() => { setFailed(true) }}
        />
      )}
      <button
        type="button"
        className="dshr-wm-gear"
        aria-label={t('wmTitle')}
        onClick={() => { setOpen(value => !value) }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={GEAR_PATH} />
        </svg>
      </button>
      {open && (
        <>
          <div className="dshr-wm-scrim" onClick={() => { setOpen(false) }} />
          <WatermarkSettings config={config} onChange={change} onClose={() => { setOpen(false) }} t={t} />
        </>
      )}
    </div>
  )
}
