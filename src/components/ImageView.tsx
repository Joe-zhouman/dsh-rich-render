/**
 * The framed image card: one standalone image paragraph rendered with the
 * shared fence chrome (the same outline as every explicit fence), a
 * top-right copy action that writes the picture to the system clipboard as
 * PNG, and the degradation display — the authored path text — when the
 * destination resolves to nothing or the file fails to load.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  IconCheckOutlineRegular, IconCopyOutlineRegular, IconWarningOutlineRegular, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { localPathMediaUrl } from '../markdown-fallback.ts'
import type { ImageSegment } from '../rules/segments.ts'
import type { RichChrome } from './RichMarkdownText.tsx'

/**
 * Displayable URL for one authored destination: HTTP(S) as authored,
 * absolute local paths through the authenticated file route.
 * @param destination - authored Markdown image destination.
 * @returns an absolute URL, or undefined when nothing can display it.
 */
function displayableUrl(destination: string): string | undefined {
  if (/^https?:/iu.test(destination)) return destination
  return localPathMediaUrl(document.baseURI, destination)
}

/**
 * Rasterize one URL to a PNG blob through an img + canvas round-trip, the
 * one clipboard format every host accepts.
 * @param url - displayable image URL (same-origin or CORS-enabled).
 * @returns the PNG blob, or null when drawing is impossible.
 */
async function pngBlob(url: string): Promise<Blob | null> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => { resolve() }
    image.onerror = () => { reject(new Error('image load failed')) }
    image.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  if (context === null || canvas.width === 0 || canvas.height === 0) return null
  context.drawImage(image, 0, 0)
  return await new Promise<Blob | null>(resolve => { canvas.toBlob(resolve, 'image/png') })
}

/** Copy feedback: idle label, success, or the failure label until the next try. */
type CopyState = 'idle' | 'done' | 'error'

/**
 * Tallest display ratio (height / width) an image may use before it counts as
 * over-long and gets scaled down. A4 portrait is 297/210 ≈ 1.41, so 1.5 leaves
 * a full A4 page and a little more at the column width.
 */
const ASPECT_CAP = 1.5

/** One image card with its fence chrome, copy action, and failure display. */
export const ImageView = memo(function ImageView({ segment, chrome }: {
  segment: ImageSegment
  chrome: RichChrome
}) {
  const [failed, setFailed] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [heightCap, setHeightCap] = useState<number>()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const url = displayableUrl(segment.url)
  // The cap follows the column the card sits in, so an A4-ratio picture keeps
  // the full width at any window size; only taller pictures shrink. Measuring
  // the column (not the card) avoids a size that depends on its own result.
  useEffect(() => {
    const column = cardRef.current?.parentElement
    if (column === null || column === undefined) return
    const fit = (): void => {
      const width = column.clientWidth
      if (width > 0) setHeightCap(Math.round(width * ASPECT_CAP))
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(column)
    return () => { observer.disconnect() }
  }, [])
  const copy = useCallback((): void => {
    if (url === undefined) return
    void (async () => {
      try {
        const blob = await pngBlob(url)
        if (blob === null) throw new Error('raster produced nothing')
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopyState('done')
      } catch {
        // A tainted canvas, an oversized picture, or a clipboard the host
        // denies: the label reports it, the card stays interactive.
        setCopyState('error')
      }
    })()
  }, [url])
  if (url === undefined || failed) {
    return (
      <div className="dshr-fence dshr-image dshr-image-failed" title={segment.alt === '' ? undefined : segment.alt}>
        {chrome.imagePreviewFailed} · {segment.url}
      </div>
    )
  }
  const label = copyState === 'done'
    ? chrome.copied
    : copyState === 'error' ? chrome.copyFailed : chrome.copy
  return (
    <div ref={cardRef} className="dshr-fence dshr-image">
      <img className="dshr-image-img" src={url} alt={segment.alt}
        style={heightCap === undefined ? undefined : { maxHeight: `${heightCap}px` }}
        onError={() => { setFailed(true) }} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      <Tooltip label={label} side="top" align="end" portal>
        <button type="button" className="dshr-image-copy" aria-label={label}
          data-state={copyState === 'idle' ? undefined : copyState} onClick={copy}>
          {copyState === 'done'
            ? <IconCheckOutlineRegular size={16} />
            : copyState === 'error'
              ? <IconWarningOutlineRegular size={16} />
              : <IconCopyOutlineRegular size={16} />}
        </button>
      </Tooltip>
    </div>
  )
})
