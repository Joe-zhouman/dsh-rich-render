/**
 * Watermark config regression: defaults, validation clamps, malformed
 * storage, and persistence — run against a jsdom localStorage.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
globalThis.localStorage = dom.window.localStorage

const { readWatermark, writeWatermark, DEFAULT_WATERMARK } = await import('../src/watermark-config.ts')

test('empty storage yields the defaults (disabled, 0.12, bottom-right)', () => {
  localStorage.clear()
  const config = readWatermark()
  assert.deepEqual(config, { enabled: false, image: '', opacity: 0.12, corner: 'br', size: 42 })
})

test('a written config round-trips', () => {
  localStorage.clear()
  writeWatermark({ enabled: true, image: 'data:image/png;base64,xx', opacity: 0.3, corner: 'tl', size: 30 })
  assert.deepEqual(readWatermark(), { enabled: true, image: 'data:image/png;base64,xx', opacity: 0.3, corner: 'tl', size: 30 })
})

test('malformed or hostile storage falls back field by field', () => {
  localStorage.clear()
  localStorage.setItem('dsh-rich-render:watermark', '{"enabled":"yes","image":5,"opacity":9,"corner":"middle","size":"big"}')
  const config = readWatermark()
  assert.equal(config.enabled, false)
  assert.equal(config.image, '')
  assert.equal(config.opacity, 1)
  assert.equal(config.corner, 'br')
  assert.equal(config.size, 42)
})

test('non-JSON storage degrades to the defaults without throwing', () => {
  localStorage.clear()
  localStorage.setItem('dsh-rich-render:watermark', 'not json at all')
  assert.deepEqual(readWatermark(), DEFAULT_WATERMARK)
})

test('opacity and size clamp into their ranges', () => {
  localStorage.clear()
  writeWatermark({ enabled: true, image: '', opacity: -1, corner: 'tr', size: 500 })
  const config = readWatermark()
  assert.equal(config.opacity, 0)
  assert.equal(config.size, 80)
})
