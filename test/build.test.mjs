/**
 * Build regression, following the model-price-plugin harness: `pnpm run
 * build` must load tsdown.config.mjs with nothing installed beyond this
 * package's own dependencies, and the client artifact must load the way the
 * browser loads it — in a jsdom window through a module-table loader, with
 * `apply` run against a stub context. That covers the risks the source tests
 * cannot: that bundling produced an artifact the module loader accepts and
 * that it resolves nothing the module table cannot answer.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'

/** The package root: this file lives in its test/ directory. */
const root = dirname(dirname(fileURLToPath(import.meta.url)))

/** Options that disable Node's own TypeScript execution for the build under test. */
const noTypeStripping = {
  ...process.env,
  NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-experimental-strip-types'].filter(Boolean).join(' '),
}

/** The one build both tests judge, so no assertion reads artifacts of another run. */
let result
function buildOnce() {
  result ??= spawnSync('pnpm run build', { cwd: root, env: noTypeStripping, shell: true, encoding: 'utf8' })
  return result
}

test('builds with type stripping off, so no optional config-loader peer is needed', () => {
  const run = buildOnce()
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`
  assert.equal(run.status, 0, `pnpm run build exited ${run.status}\n${output}`)
  assert.doesNotMatch(output, /Failed to import module/u)
})

test('emits the ESM host entry and the module-loader client factory', async () => {
  const run = buildOnce()
  assert.equal(run.status, 0, 'the artifacts are only judged from a successful build')

  const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)
  assert.equal(host.name, 'dsh-rich-render')
  assert.equal(typeof host.apply, 'function')

  const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
  const opening = client.slice(0, 400).replace(/\s+/gu, ' ')
  assert.ok(
    opening.startsWith('window.__ModuleLoader__.load({ id: "dsh-rich-render", factory: (require) => { var module = { exports: {} }; var exports = module.exports;'),
    `lib/client.js opens with something other than the module-loader factory:\n${opening}`,
  )
  assert.match(client, /return module\.exports;\s*\}\s*\}\);/u, 'the factory must close with the module exports')
  assert.doesNotMatch(client, /^\s*(?:import|export)\s/mu, 'the client artifact is a CJS factory, not a module')
})

/** The specifiers the browser half may ask the loader's module table for. */
const MODULE_TABLE = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/dsh-client-ui-primitives',
]

/** The react face the compiled components need at module scope and render time. */
function stubReact() {
  class Component {
    constructor(props) { this.props = props }
  }
  Component.prototype.isReactComponent = {}
  const react = {
    Component,
    memo: component => component,
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    Fragment: 'Fragment',
    useCallback: callback => callback,
    useEffect: () => {},
    useLayoutEffect: () => {},
    useMemo: factory => factory(),
    useRef: value => ({ current: value }),
    useId: () => 'r0',
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
  }
  return {
    react,
    jsxRuntime: {
      Fragment: 'Fragment',
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
    },
  }
}

/** The primitives face the components reference at module scope. */
const PRIMITIVES = {
  CodeBlock: () => null,
  DisclosureRow: () => null,
  IconCheckOutlineRegular: () => null,
  IconCopyOutlineRegular: () => null,
  IconThinkOutlineRegular: () => null,
  IconWarningOutlineRegular: () => null,
  JsonBlock: () => null,
  MarkdownText: () => null,
  Tooltip: ({ children }) => children,
}

/**
 * Load the built client factory into a jsdom window through a stub module
 * table, the way the harness loads a client bundle.
 * @param table - the module table the bundle resolves through.
 * @returns the window and the exports one `load` call captured.
 */
function loadClient(table) {
  const { react, jsxRuntime } = stubReact()
  const modules = table ?? {
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': PRIMITIVES,
  }
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
  })
  const asked = []
  let loaded
  dom.window.__ModuleLoader__ = {
    load: entry => {
      loaded = { id: entry.id, exports: entry.factory(specifier => {
        asked.push(specifier)
        return modules[specifier]
      }) }
    },
  }
  dom.window.eval(readFileSync(join(root, 'lib/client.js'), 'utf8'))
  return { dom, loaded, asked }
}

/** A stub client context recording what the bundle registers. */
function stubContext() {
  const registrations = []
  const declared = []
  const localeNames = []
  const slots = {
    inject(name, factory) {
      declared.push(name)
      factory()
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  }
  const themeCalls = []
  const ctx = {
    slots,
    effect(factory) {
      factory()
      return () => {}
    },
    locale: { register: ns => { localeNames.push(ns); return () => {} } },
    connection: { rpc: {} },
    theme: { overrideTokens: (source, tokens) => { themeCalls.push([source, tokens]); return () => {} } },
  }
  return { ctx, registrations, declared, localeNames, themeCalls }
}

test('the client artifact loads through the module table and replaces the assistant-step seat', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { dom, loaded, asked } = loadClient()
  assert.equal(loaded.id, 'dsh-rich-render')
  assert.equal(typeof loaded.exports.apply, 'function')
  assert.deepEqual([...loaded.exports.inject], ['slots', 'locale', 'connection', 'theme'])
  assert.deepEqual(
    [...new Set(asked)].sort(),
    [...MODULE_TABLE].sort(),
    'the bundle must resolve nothing beyond the declared module-table keys',
  )

  const { ctx, registrations, declared, localeNames, themeCalls } = stubContext()
  loaded.exports.apply(ctx)

  assert.equal(themeCalls.length, 1)
  assert.equal(themeCalls[0][0], 'dsh-rich-render:font')
  const fonts = themeCalls[0][1]
  assert.match(fonts['--dsw-font-family'].light, /^'Segoe UI', ui-sans-serif/u)
  assert.match(fonts['--dsw-font-family'].light, /'Microsoft YaHei'/u)
  assert.match(fonts['--dsw-font-family-brand'].light, /^'Segoe UI'/u)
  assert.equal(fonts['--dsw-font-family'].light, fonts['--dsw-font-family'].dark)
  assert.match(fonts['--ds-font-family-code'].light, /^Consolas, 'Fira Code'/u)
  assert.equal(fonts['--ds-font-family-code'].light, fonts['--ds-font-family-code'].dark)
  assert.deepEqual(localeNames, ['richRender'])
  assert.deepEqual(declared, ['conversation.chat.node', 'shell.overlay'])
  assert.equal(registrations.length, 2)
  const [node, overlay] = registrations
  assert.equal(node.options.name, 'conversation.chat.node')
  assert.equal(node.options.key, 'assistant-step')
  assert.equal(node.options.locale, 'richRender')
  assert.equal(typeof node.component, 'function', 'the assistant-step renderer is a React component')
  assert.equal(overlay.options.name, 'shell.overlay')
  assert.equal(overlay.options.id, 'rich-render-watermark')
  assert.equal(typeof overlay.component, 'function', 'the watermark layer is a React component')

  const style = dom.window.document.querySelector('style[data-plugin-css="dsh-rich-render/styles"]')
  assert.notEqual(style, null, 'apply installs the plugin stylesheet')
  assert.match(style.textContent, /\.dshr-flow-root/u, 'the stylesheet carries the flow shell')
  assert.match(style.textContent, /\.dshr-wm-img/u, 'the stylesheet carries the watermark layer')
})

/**
 * Expand one stub-element tree by executing function components (the stub jsx
 * only creates descriptors, so components run when the walker reaches them).
 * @param node - stub element, array of them, or scalar.
 * @param depth - recursion cap.
 * @returns the expanded tree.
 */
function renderStub(node, depth = 0) {
  if (depth > 64 || node === null || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(child => renderStub(child, depth + 1))
  const { type, props } = node
  if (typeof type === 'function') {
    if (type.prototype?.isReactComponent) {
      return renderStub(new type(props).render(), depth + 1)
    }
    return renderStub(type(props), depth + 1)
  }
  if (props !== undefined && props.children !== undefined) {
    return { ...node, props: { ...props, children: renderStub(props.children, depth + 1) } }
  }
  return node
}

/**
 * Collect stub elements matching one predicate.
 * @param node - expanded stub tree.
 * @param predicate - element test.
 * @param found - accumulator.
 * @returns matching elements in tree order.
 */
function collectStub(node, predicate, found = []) {
  if (node === null || typeof node !== 'object') return found
  if (Array.isArray(node)) {
    for (const child of node) collectStub(child, predicate, found)
    return found
  }
  if (predicate(node)) found.push(node)
  const children = node.props?.children
  if (children !== undefined) collectStub(children, predicate, found)
  return found
}

test('the assistant-step renderer renders one settled text block natively', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const markdownTexts = []
  const primitives = {
    ...PRIMITIVES,
    MarkdownText: props => { markdownTexts.push(props); return { markdown: true } },
  }
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  // One settled text block: the upgrade engine returns it whole, so the view
  // must delegate to exactly one platform MarkdownText with the same text.
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text: '# Hello\n\nWorld' }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  renderStub(element)
  assert.ok(markdownTexts.length >= 1, 'the settled text block reaches MarkdownText')
  assert.equal(markdownTexts.at(-1).text, '# Hello\n\nWorld')
})

test('upgraded titles and table cells render their inline source through MarkdownText', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const markdownTexts = []
  const primitives = {
    ...PRIMITIVES,
    MarkdownText: props => { markdownTexts.push(props); return { markdown: true } },
  }
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  // A timeline fence whose entry titles carry TeX, then a table whose header,
  // cell, and adopted title carry TeX — the exact fields the live report
  // showed as literal source. Every one must reach the platform renderer.
  const text = [
    '```timeline',
    '### 求解',
    '- 第一步：求 $a$',
    '  先归一化。',
    '- 第二步：验算 $n=0$',
    '  代入数值。',
    '- 第三步：结论 $b\\to a^+$',
    '  完成。',
    '```',
    '',
    '## 结论',
    '',
    '| 量 | 结果 |',
    '| --- | --- |',
    '| $a$ | $x^2$ |',
  ].join('\n')
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  renderStub(element)
  const texts = markdownTexts.map(props => props.text)
  for (const expected of ['$a$', '$n=0$', '$b\\to a^+$', '$x^2$']) {
    assert.ok(texts.includes(expected), `"${expected}" did not reach MarkdownText: ${JSON.stringify(texts)}`)
  }
  // Only the TeX spans may reach the document parser. A whole title such as
  // "第一步：求 $a$" starts with an ordered-list marker once parsed alone.
  for (const text of texts) {
    assert.doesNotMatch(text, /第一步|第二步|第三步|结论|量|结果/u,
      `non-TeX prose reached MarkdownText: ${JSON.stringify(text)}`)
  }
})

test('markdown image syntax keeps the local-path vocabulary in native bodies; standalone images upgrade', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const markdownTexts = []
  const { loaded, dom } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': {
      ...PRIMITIVES,
      MarkdownText: props => { markdownTexts.push(props); return { markdown: true } },
    },
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  // A list-item image stays native (list bodies never split), a top-level
  // image splits off into the image card, and the prose tail stays native:
  // both native runs must reach MarkdownText with the pathImages resolver.
  const text = [
    '## 能力',
    '',
    '1. 甲。图如下：',
    '   ![结果](C:/tmp/out.png)',
    '',
    '第二段 ![现场](https://example.com/shot.png)',
  ].join('\n')
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  const tree = renderStub(element)
  const listBody = markdownTexts.find(props => props.text?.includes('![结果]'))
  const tailPara = markdownTexts.find(props => props.text?.includes('第二段'))
  for (const found of [listBody, tailPara]) {
    assert.notEqual(found, undefined, `native text never reached MarkdownText: ${JSON.stringify(markdownTexts.map(p => p.text))}`)
    assert.equal(typeof found.pathImages?.resolve, 'function', 'pathImages vocabulary is missing')
  }
  const upgradedAway = markdownTexts.find(props => props.text?.includes('![现场]'))
  assert.equal(upgradedAway, undefined, 'a standalone body image now upgrades to the image card')
  // The card's action is the platform clipboard icon, not a text label.
  const copyAction = collectStub(tree, node =>
    String(node.props?.className ?? '').includes('dshr-image-copy'))
  assert.equal(copyAction.length, 1, 'the image card carries one copy action')
  assert.equal(copyAction[0].props['aria-label'], 'copy')
  assert.equal(typeof copyAction[0].props.children, 'object',
    'the copy action renders an icon element rather than the word')
  assert.equal(listBody.pathImages.resolve('C:/tmp/out.png'), 'http://localhost/api/file?path=C%3A%2Ftmp%2Fout.png')
  assert.equal(listBody.pathImages.resolve('https://example.com/x.png'), undefined, 'remote URLs stay direct, not rewritten')
  // The card hugs the picture and lets it keep the column width, so a portrait
  // screenshot is neither shrunk into a narrow strip nor framed by empty sides.
  const sheet = dom.window.document.querySelector('style[data-plugin-css="dsh-rich-render/styles"]').textContent
  assert.match(sheet, /\.dshr-image \{[\s\S]*?width: fit-content;[\s\S]*?max-width: 100%;/u)
  assert.match(sheet, /\.dshr-image-img \{[\s\S]*?max-width: 100%;[\s\S]*?max-height: 1200px;/u)
  assert.doesNotMatch(sheet, /max-height: 360px/u, 'the old height cap shrank every screenshot into a strip')
})

test('tab fence renders the tab bar and the first page only', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const markdownTexts = []
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': {
      ...PRIMITIVES,
      MarkdownText: props => { markdownTexts.push(props); return { markdown: true } },
    },
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text: '```tab\n@表达观点\n`I think ... because ...`\n\n@补充说明\n`For example, ...`\n```' }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  const tree = renderStub(element)
  const buttons = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-tabs-tab'))
  assert.deepEqual(buttons.map(button => button.props.children), ['表达观点', '补充说明'])
  assert.equal(buttons.filter(button => button.props['data-active'] !== undefined).length, 1)
  const texts = markdownTexts.map(props => props.text)
  assert.ok(texts.some(t => t?.includes('I think')), `first page body reached MarkdownText: ${JSON.stringify(texts)}`)
  assert.ok(!texts.some(t => t?.includes('For example')), 'inactive page stays unrendered')
})

test('mindmap renders bare nodes, a root pill, branch colors, and bump-edge hooks', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const { loaded, dom } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': PRIMITIVES,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text: '```mindmap\n- 主题\n  - 分支 A\n    - 子项 A1\n  - 分支 B\n    - 子项 B1\n```\n' }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  const tree = renderStub(element)
  // Nodes are bare text: the outlined-chip class is gone, the root is the
  // only boxed node, and level tiers stay addressable per node.
  const nodes = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-mm-node'))
  assert.equal(nodes.length, 5, `expected root + 2 branches + 2 leaves, got ${nodes.length}`)
  assert.equal(collectStub(tree, node => String(node.props?.className ?? '').includes('dshr-mm-chip')).length, 0,
    'no node may carry the retired outlined-chip class')
  assert.match(nodes[0].props.className, /(?:^| )dshr-mm-root(?: |$)/u, 'the first node is the root pill')
  assert.match(nodes[1].props.className, /(?:^| )dshr-mm-level-1(?: |$)/u)
  assert.match(nodes[2].props.className, /(?:^| )dshr-mm-level-2(?: |$)/u)
  // Branch colors cycle over each root's level-1 wrappers only; deeper
  // wrappers inherit the variable instead of reassigning it.
  const topLevel = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-mm-child-l1'))
  assert.equal(topLevel.length, 2)
  assert.match(topLevel[0].props.className, /(?:^| )dshr-mm-b1(?: |$)/u)
  assert.match(topLevel[1].props.className, /(?:^| )dshr-mm-b2(?: |$)/u)
  const deeper = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-mm-child-l2'))
  assert.equal(deeper.length, 2)
  for (const wrapper of deeper) assert.doesNotMatch(wrapper.props.className, /dshr-mm-b\d/u)
  // Every child wrapper opens with its connector: an inline SVG whose path the
  // fit pass writes, so the curve is one continuous stroke instead of two
  // half-arcs that could drift apart at the seam.
  for (const wrapper of [...topLevel, ...deeper]) {
    const edge = wrapper.props.children[0]
    assert.equal(edge?.type, 'svg')
    assert.equal(edge.props.className, 'dshr-mm-edge')
    assert.equal(edge.props['aria-hidden'], 'true')
    assert.equal(edge.props.children?.props?.className, 'dshr-mm-edge-path')
  }
  // The stylesheet carries the connector stroke and the palette, and no
  // pseudo-element half-arcs survive.
  const style = dom.window.document.querySelector('style[data-plugin-css="dsh-rich-render/styles"]')
  const sheet = style.textContent
  assert.match(sheet, /\.dshr-mm-edge-path \{[\s\S]*?fill: none;[\s\S]*?stroke-width: 1\.5px;/u)
  assert.match(sheet, /\.dshr-mm-child-l1 > \.dshr-mm-edge \.dshr-mm-edge-path \{[\s\S]*?stroke-width: 2px;/u)
  assert.doesNotMatch(sheet, /\.dshr-mm-edge::(?:before|after)/u)
  assert.match(sheet, /\.dshr-mm-b1 \{ --dshr-mm-branch: #3b82f6; \}/u)
  assert.match(sheet, /body\[data-ds-dark-theme\] \.dshr-mm-b1 \{ --dshr-mm-branch: #60a5fa; \}/u)
  assert.match(sheet, /\.dshr-mm-root[\s\S]*?border-radius: 999px;/u)
})

test('prototype choices render radio options and a live showcase', async () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const markdownTexts = []
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': {
      ...PRIMITIVES,
      MarkdownText: props => { markdownTexts.push(props); return { markdown: true } },
    },
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  const text = '````prototype-choices\n@方案一\n```stack\n1. 甲\n2. 乙\n```\n\n@方案二\n普通说明。\n````'
  const writes = []
  const seat = {
    useInput: selector => selector({ draft: '请用中文', occurrences: [] }),
    inputActions: {
      setDraft: draft => { writes.push(draft) },
      captureInsertion: () => ({ start: 0, end: 0, draftRev: 1 }),
      insertText: () => false,
    },
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }
  const tree = renderStub(View(seat, react))
  const options = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-choices-option'))
  // The renderer appends the built-in way out of the enumerated designs.
  assert.deepEqual(options.map(node => node.props.children[1]?.props?.children), ['方案一', '方案二', 'choicesOther'])
  assert.equal(options.filter(node => node.props['data-active'] !== undefined).length, 1)
  // Options are native radio inputs sharing one name, so the group keeps the
  // browser's own keyboard and focus behavior.
  const inputs = options.map(node => node.props.children[0]?.props)
  assert.ok(inputs.every(input => input?.type === 'radio'), 'every option is a native radio')
  assert.equal(new Set(inputs.map(input => input?.name)).size, 1, 'one native radio group')
  // The selected showcase renders its inner stack fence as a real component.
  assert.ok(collectStub(tree, node =>
    String(node.props?.className ?? '').includes('dshr-stack-box')).length > 0,
    'the inner stack fence renders live inside the showcase')
  // The inactive option's prose stays unrendered.
  assert.ok(!markdownTexts.some(props => props.text?.includes('普通说明')),
    'inactive option content stays unrendered')
  // Selecting an option writes one prefixed line above the user's own text and
  // never sends: the composer belongs to the user.
  assert.equal(collectStub(tree, node =>
    String(node.props?.className ?? '').includes('dshr-choices-send')).length, 0,
    'the fence offers no send action of its own')
  inputs[1].onChange()
  assert.deepEqual(writes, ['choicesAnswerPrefix方案二\n请用中文'],
    'the selected label is written above the draft, not sent')
  // Without an input seat the fence stays preview-only.
  const previewOnly = renderStub(View({ ...seat, useInput: undefined, inputActions: undefined }, react))
  assert.equal(collectStub(previewOnly, node =>
    String(node.props?.className ?? '').includes('dshr-choices-hint')).length, 0,
    'no write feedback without a composer seat')
})

test('typed callouts render the alert flavor, title, and icon', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': PRIMITIVES,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text: '> [!WARNING]\n> 别在生产环境直接跑。' }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  const tree = renderStub(element)
  const alert = collectStub(tree, node =>
    typeof node.type === 'string' && String(node.props?.className ?? '').includes('dshr-callout-alert'))[0]
  assert.notEqual(alert, undefined, 'the typed callout aside never rendered')
  assert.match(alert.props.className, /(^| )dshr-callout-warning( |$)/)
  const title = collectStub(tree, node => node.props?.children === 'calloutWarning')[0]
  assert.notEqual(title, undefined, 'the localized alert title never rendered')
  assert.ok(collectStub(tree, node => String(node.props?.className ?? '').includes('dshr-callout-alert-icon')).length > 0,
    'the alert icon slot never rendered')
})

test('chartable tables open on the chart with an export tab', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': PRIMITIVES,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  // Four card titles that miss the keyword table (the live session's
  // "核心能力" group), then a category/number table the decision tree charts.
  const text = [
    '## 核心能力',
    '',
    '1. 语义解析。系统能够将自然语言输入准确解析为结构化表示。',
    '2. 动态渲染。解析结果可实时渲染为多平台适配的可视化输出。',
    '3. 规则引擎。内置校验规则可自动检测并修正输出中的常见错误。',
    '4. 模块协同。各模块之间通过统一接口协作，保证处理流程的连贯性。',
    '',
    '## 城市销量',
    '',
    '| 城市 | 销量 |',
    '| --- | --- |',
    '| 北京 | 120 |',
    '| 上海 | 200 |',
    '| 广州 | 150 |',
    '| 深圳 | 180 |',
  ].join('\n')
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key,
  }, react)
  const tree = renderStub(element)


  const buttons = collectStub(tree, node =>
    node.type === 'button' && String(node.props?.className ?? '').includes('dshr-toolbar-btn'))
  assert.deepEqual(buttons.map(node => node.props['aria-label']),
    ['viewTable', 'viewChart', 'copy', 'downloadChart'])
  assert.equal(buttons[0]?.props['data-active'], undefined)
  assert.ok(buttons[1]?.props['data-active'], 'the chart is the default view')
  assert.equal(typeof buttons[2]?.props.onClick, 'function', 'the copy action is wired')
  assert.equal(typeof buttons[3]?.props.onClick, 'function', 'the export action is wired')

  const panes = collectStub(tree, node => node.type === 'div' && node.props?.className === 'dshr-dual-pane')
  assert.equal(panes.length, 2, 'chart and table panes both stay mounted')
  assert.ok(panes[0]?.props['data-active'], 'the chart pane is active')
  assert.equal(panes[1]?.props['data-active'], undefined)

  const svgs = collectStub(tree, node => node.type === 'svg')
  assert.ok(svgs.length >= 1, 'the default chart renders an SVG')
})

test('a task list renders as a checklist with marker state and live progress', () => {
  assert.equal(buildOnce().status, 0, 'the artifact is only judged from a successful build')
  const { react, jsxRuntime } = stubReact()
  const { loaded } = loadClient({
    'react': react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-ui-primitives': PRIMITIVES,
  })
  const registrations = []
  const ctx = {
    slots: {
      inject(name, factory) { factory() },
      register(options, component) { registrations.push({ options, component }); return () => {} },
    },
    effect(factory) { factory(); return () => {} },
    locale: { register: () => () => {} },
    connection: { rpc: {} },
    theme: { overrideTokens: () => () => {} },
  }
  loaded.exports.apply(ctx)
  const View = registrations[0].component
  const text = [
    '## 改稿检查清单',
    '',
    '- [x] 第一项',
    '  说明一。',
    '- [ ] 第二项',
    '- [ ] 第三项',
  ].join('\n')
  const element = View({
    node: {
      kind: 'assistant-step',
      data: {
        status: 'settled',
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text }],
        time: 0,
      },
      location: { kind: 'turn', turn: { turn: 1, status: 'open' } },
    },
    useDisclosure: () => ({ expanded: false, setExpanded: () => {}, toggle: () => {} }),
    useTurnData: () => undefined,
    openFile: () => {},
    renderMessageImages: () => null,
    fileMentions: () => undefined,
    t: key => key === 'checklistProgress' ? '{done}/{total} 项完成' : key,
  }, react)
  const tree = renderStub(element)

  const boxes = collectStub(tree, node => node.type === 'input' && node.props?.type === 'checkbox')
  assert.equal(boxes.length, 3, 'one native checkbox per task item')
  assert.deepEqual(boxes.map(node => node.props.checked), [true, false, false])
  assert.deepEqual(boxes.map(node => node.props['aria-label']), ['第一项', '第二项', '第三项'])
  assert.equal(typeof boxes[0]?.props.onChange, 'function', 'each box is interactive')

  const bar = collectStub(tree, node => node.props?.role === 'progressbar')[0]
  assert.equal(bar?.props['aria-valuenow'], 1)
  assert.equal(bar?.props['aria-valuemax'], 3)
  const fill = collectStub(tree, node => node.props?.className === 'dshr-checklist-fill')[0]
  assert.equal(fill?.props.style.width, '33.33%')
  const count = collectStub(tree, node => node.props?.className === 'dshr-checklist-count')[0]
  assert.equal(count?.props.children, '1/3 项完成')
})

/** A stub host context capturing prompt sections and the fetch routes. */
function stubHostCtx() {
  const sections = []
  const routes = []
  return {
    sections, routes,
    effect: fn => { const dispose = fn(); return () => dispose() },
    logger: { warn() {}, info() {}, debug() {} },
    systemPrompt: { section: s => { sections.push(s); return () => {} } },
    connection: { fetch: { register: route => { routes.push(route); return async () => {} } } },
    shell: { resolve: r => r, async execute() { throw new Error('no shell in stub') } },
  }
}

/** Call one registered route the way the /api bridge would. */
async function callRoute(routes, endpoint, payload) {
  const route = routes.find(candidate => candidate.path === `/api/rich-render/${endpoint}`)
  if (route === undefined) throw new Error(`route /api/rich-render/${endpoint} not registered`)
  const response = await route.fetch(new Request(`http://local/api/rich-render/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId: 'probe', method: `rich-render/${endpoint}`, payload }),
  }))
  const envelope = await response.json()
  return envelope.result
}

test('host entry: merged section registers main-session-only; RPC status answers; matplotlib inert while disabled', async () => {
  assert.equal(buildOnce().status, 0, 'judge only a successful build')
  const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)
  assert.deepEqual(host.inject, ['systemPrompt', 'shell', 'connection'])
  assert.equal(typeof host.Config, 'function')

  const ctx = stubHostCtx()
  host.apply(ctx, {})
  assert.equal(ctx.sections.length, 1)
  const [section] = ctx.sections
  assert.equal(section.name, 'rich-render:environments')
  assert.equal(section.interpolate, false)
  assert.ok(Number.isFinite(section.order))
  assert.equal(section.text({ agent: { session: { header: { origin: 'subagent' } } } }), '')
  assert.ok(section.text({ agent: { session: { header: {} } } }).includes('富渲染环境'))

  const status = await callRoute(ctx.routes, 'status', {})
  assert.deepEqual(status, { ok: true, value: { matplotlib: { enabled: false, ready: false } } })
  // A malformed method name on the status route is a failure envelope.
  const route = ctx.routes.find(candidate => candidate.path === '/api/rich-render/status')
  const raw = await route.fetch(new Request('http://local/api/rich-render/status', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId: 'probe', method: 'rich-render/exec', payload: {} }),
  }))
  const miss = (await raw.json()).result
  assert.equal(miss.ok, false)
  assert.ok(miss.error.details && typeof miss.error.details === 'object')
})

test('host entry: enabled registers the matplotlib section synchronously; detection fills it', async () => {
  assert.equal(buildOnce().status, 0)
  const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)
  const ctx = stubHostCtx()
  const outputs = ['{"python":"3.12.7","matplotlib":"3.11.2","numpy":"2.5.3"}', '{"status":"success","image":"QUJD"}']
  let n = 0
  ctx.shell.execute = async () => ({ result: async () => ({ exitCode: 0, signal: null, timedOut: false, aborted: false, timeoutMs: 1, stdout: { text: outputs[Math.min(n++, 1)], truncated: false }, stderr: { text: '', truncated: false } }) })
  host.apply(ctx, { matplotlib: { enabled: true, python: 'python' } })
  // The matplotlib section exists immediately; empty until detection lands.
  assert.equal(ctx.sections.length, 2)
  assert.equal(ctx.sections[1].name, 'rich-render:matplotlib')
  assert.equal(ctx.sections[1].text({ agent: { session: { header: {} } } }), '')

  for (let i = 0; i < 50 && ctx.sections[1].text({ agent: { session: { header: {} } } }) === ''; i++) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  assert.ok(ctx.sections[1].text({ agent: { session: { header: {} } } }).includes('3.11.2'))
  assert.equal(ctx.sections[1].text({ agent: { session: { header: { origin: 'subagent' } } } }), '')

  const exec = await callRoute(ctx.routes, 'exec', { code: 'print(1)' })
  assert.equal(exec.ok, true)
  assert.equal(exec.value.status, 'success')
  assert.equal(exec.value.image, 'QUJD')
  const cached = await callRoute(ctx.routes, 'exec', { code: 'print(1)' })
  assert.equal(cached.value.image, 'QUJD')
})

test('host entry: failed detection leaves the matplotlib section empty and status not ready', async () => {
  assert.equal(buildOnce().status, 0)
  const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)
  const ctx = stubHostCtx()
  ctx.shell.execute = async () => ({ result: async () => ({ exitCode: 1, signal: null, timedOut: false, aborted: false, timeoutMs: 1, stdout: { text: '', truncated: false }, stderr: { text: 'nope' } }) })
  host.apply(ctx, { matplotlib: { enabled: true, python: 'python' } })
  await new Promise(resolve => setTimeout(resolve, 150))
  assert.equal(ctx.sections[1].text({ agent: { session: { header: {} } } }), '')
  const status = await callRoute(ctx.routes, 'status', {})
  assert.deepEqual(status.value, { matplotlib: { enabled: true, ready: false } })
})
