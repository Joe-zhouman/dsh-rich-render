/**
 * Persona assembly regression: persona.md splits into the merged environments
 * section and the conditional matplotlib template; placeholders substitute;
 * subagent assemblies get the empty string.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSections, isMainSession } from '../src/host/persona.ts'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const markdown = readFileSync(join(root, 'persona.md'), 'utf8')

test('persona.md parses into merged + matplotlib sections', () => {
  const sections = buildSections(markdown, { python: '3.12.7', matplotlib: '3.11.2', numpy: '2.5.3' })
  assert.ok(sections.environments.startsWith('## Rich rendering environment'))
  for (const fence of ['mindmap', 'stack', 'tree', 'todo', 'timeline']) {
    assert.ok(sections.environments.includes(fence), `merged section mentions ${fence}`)
  }
  assert.ok(sections.matplotlib !== undefined)
  assert.ok(sections.matplotlib.includes('Python 3.12.7'))
  assert.ok(sections.matplotlib.includes('matplotlib 3.11.2'))
  assert.ok(sections.matplotlib.includes('numpy 2.5.3'))
  assert.ok(!sections.matplotlib.includes('{python}'))
})

test('matplotlib section omitted without versions', () => {
  const sections = buildSections(markdown, undefined)
  assert.ok(sections.environments.length > 0)
  assert.equal(sections.matplotlib, undefined)
})

test('injected text stays inside the spec ban list', () => {
  const sections = buildSections(markdown, { python: 'x', matplotlib: 'y', numpy: 'z' })
  const all = `${sections.environments}\n${sections.matplotlib ?? ''}`
  // Spec bans: file delivery / artifacts / Plotly / kernel mentions in the prompt.
  // "不要调用 plt.show" 一类的负向指引合法；seaborn/pandas 的"不要假设可用"提示也合法。
  for (const banned of ['Plotly', 'plotly', 'kernel', 'artifact', '文件交付']) {
    assert.ok(!all.includes(banned), `persona mentions ${banned}`)
  }
})

test('subagent filter', () => {
  assert.equal(isMainSession('subagent'), false)
  assert.equal(isMainSession(undefined), true)
  assert.equal(isMainSession('other'), true)
})
