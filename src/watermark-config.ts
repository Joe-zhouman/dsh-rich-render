/**
 * Watermark configuration, persisted client-side: the browser half of a dsh
 * client plugin receives no Loader config (the boot wire carries no `config`
 * block), so the four knobs live in localStorage under one JSON key.
 * Malformed stored values fall back to the defaults — decoration never has
 * license to break the page.
 */

/** The four corner anchors. */
export type WatermarkCorner = 'tl' | 'tr' | 'bl' | 'br'

/** The four knobs (requirement doc 2.3), all tokenized downstream. */
export interface WatermarkConfig {
  readonly enabled: boolean
  /** Image source: data URL or remote URL; empty disables painting. */
  readonly image: string
  /** 0..1 painting opacity; default sits below the reading-contrast floor. */
  readonly opacity: number
  readonly corner: WatermarkCorner
  /** Longest edge in vmin; the watermark only shows in corner whitespace. */
  readonly size: number
}

export const DEFAULT_WATERMARK: WatermarkConfig = {
  enabled: false,
  image: '',
  opacity: 0.12,
  corner: 'br',
  size: 42,
}

const STORAGE_KEY = 'dsh-rich-render:watermark'

const CORNERS: readonly WatermarkCorner[] = ['tl', 'tr', 'bl', 'br']

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Read the stored config, validating every field against its contract.
 * @returns the effective config; defaults when nothing (valid) is stored.
 */
export function readWatermark(): WatermarkConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_WATERMARK
    const value = JSON.parse(raw) as Partial<WatermarkConfig>
    return {
      enabled: value.enabled === true,
      image: typeof value.image === 'string' ? value.image : DEFAULT_WATERMARK.image,
      opacity: typeof value.opacity === 'number' && Number.isFinite(value.opacity)
        ? clamp(value.opacity, 0, 1)
        : DEFAULT_WATERMARK.opacity,
      corner: CORNERS.includes(value.corner as WatermarkCorner)
        ? value.corner as WatermarkCorner
        : DEFAULT_WATERMARK.corner,
      size: typeof value.size === 'number' && Number.isFinite(value.size)
        ? clamp(value.size, 10, 80)
        : DEFAULT_WATERMARK.size,
    }
  } catch {
    return DEFAULT_WATERMARK
  }
}

/**
 * Persist one config revision; storage failures are swallowed (the live
 * session keeps working from state).
 * @param config - the config to store.
 */
export function writeWatermark(config: WatermarkConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Private-mode storage or quota: keep this session's state only.
  }
}
