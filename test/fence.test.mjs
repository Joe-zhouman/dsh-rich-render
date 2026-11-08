/**
 * Explicit-fence parser regression: each fence's accept shape, caps, and the
 * silent native fallback on every failure mode.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMindmapFence, parseTreeFence, parseTodoFence, parseStackFence, parseTabFence, parseChoicesFence } from '../src/rules/fence.ts'

test('mindmap: nested unordered list parses to trees, one per top-level item', () => {
  const trees = parseMindmapFence('- 主题\n  - 分支 A\n    - 子项\n  - 分支 B\n- 第二主题\n  - 子')
  assert.equal(trees?.length, 2)
  assert.equal(trees[0].label, '主题')
  assert.equal(trees[0].children.length, 2)
  assert.equal(trees[0].children[0].children[0].label, '子项')
  assert.equal(trees[1].label, '第二主题')
})

test('mindmap: exactly 200 nodes accepted, 201 rejected', () => {
  const lines = []
  for (let i = 0; i < 100; i++) {
    lines.push(`- 根${i}`, `  - 叶${i}`)
  }
  const at200 = parseMindmapFence(lines.join('\n'))
  assert.ok(at200)
  assert.equal(parseMindmapFence(`${lines.join('\n')}\n- 多一个`), undefined)
})

test('mindmap: prose and childless chips rejected; ordered/task tolerated', () => {
  assert.equal(parseMindmapFence('一段说明文字'), undefined)
  assert.equal(parseMindmapFence('- 孤根'), undefined)
  // Tolerated deviations (never taught): ordered markers, task checkboxes.
  assert.deepEqual(parseMindmapFence('1. a\n2. b'), [{ label: 'a', children: [] }, { label: 'b', children: [] }])
  assert.deepEqual(parseMindmapFence('- [ ] a\n- [x] b'), [{ label: 'a', children: [] }, { label: 'b', children: [] }])
})

test('tree: folders by trailing slash or children; multiple roots', () => {
  const trees = parseTreeFence('- src/\n  - index.ts\n- package.json\n- empty/\n  - inner.md')
  assert.equal(trees?.length, 3)
  assert.equal(trees[0].name, 'src/')
  assert.equal(trees[0].folder, true)
  assert.equal(trees[0].children[0].name, 'index.ts')
  assert.equal(trees[0].children[0].folder, false)
  assert.equal(trees[1].folder, false)
  assert.equal(trees[2].children.length, 1)
})

test('tree: 12 levels accepted, 13 rejected; 500 nodes accepted, 501 rejected', () => {
  const deep = ['- a/']
  for (let i = 0; i < 11; i++) deep.push(`${'  '.repeat(i + 1)}- d${i}`)
  assert.ok(parseTreeFence(deep.join('\n')))
  assert.equal(parseTreeFence(`${deep.join('\n')}\n${'  '.repeat(12)}- leaf`), undefined)

  const wide = ['- root/'].concat(Array.from({ length: 499 }, (_, i) => `  - f${i}`))
  assert.ok(parseTreeFence(wide.join('\n')))
  const over = Array.from({ length: 501 }, (_, i) => `- f${i}`)
  assert.equal(parseTreeFence(over.join('\n')), undefined)
})

test('tree: prose rejected; task checkboxes tolerated as plain names', () => {
  assert.equal(parseTreeFence('说明'), undefined)
  assert.deepEqual(parseTreeFence('- [ ] a'), [{ name: 'a', folder: false, note: undefined, children: [] }])
})

test('tree: `#` after a name becomes that entry\'s note, not part of the name', () => {
  const trees = parseTreeFence('- src/  # 源码目录\n  - index.ts # 入口\n- package.json\n- empty/')
  assert.equal(trees?.[0].name, 'src/')
  assert.equal(trees?.[0].note, '源码目录')
  assert.equal(trees?.[0].folder, true, 'the trailing slash still decides the folder')
  assert.equal(trees?.[0].children[0].name, 'index.ts')
  assert.equal(trees?.[0].children[0].note, '入口')
  assert.equal(trees?.[1].note, undefined)
  // The marker tolerates full-width `#`, repeated markers, and no space after it.
  assert.equal(parseTreeFence('- a/  ＃ 全角')[0].note, '全角')
  assert.equal(parseTreeFence('- a/ ## 重复')[0].note, '重复')
  assert.equal(parseTreeFence('- a/ #紧贴')[0].note, '紧贴')
  assert.equal(parseTreeFence('- a/# 斜杠后')[0].note, '斜杠后')
  assert.equal(parseTreeFence('- a/# 斜杠后')[0].name, 'a/')
  // A bare marker annotates nothing and leaves the name clean.
  assert.deepEqual(parseTreeFence('- a/ #'), [{ name: 'a/', folder: true, note: undefined, children: [] }])
})

test('tree: `#` inside a name stays in the name', () => {
  assert.equal(parseTreeFence('- C#/')[0].name, 'C#/')
  assert.equal(parseTreeFence('- C#/')[0].note, undefined)
  assert.equal(parseTreeFence('- note#1.md')[0].name, 'note#1.md')
  assert.equal(parseTreeFence('- note#1.md')[0].note, undefined)
})

test('tree: any trailing text is the note; separator symbols are dropped', () => {
  // No marker at all: the first whitespace ends the name.
  const trees = parseTreeFence('- src/ 源码目录\n  - index.ts 入口\n- package.json 依赖与脚本')
  assert.equal(trees?.[0].name, 'src/')
  assert.equal(trees?.[0].note, '源码目录')
  assert.equal(trees?.[0].folder, true)
  assert.equal(trees?.[0].children[0].note, '入口')
  assert.equal(trees?.[1].note, '依赖与脚本')
  // A separator run of any shape is dropped from the note's start; the rest of
  // the note is kept verbatim, including symbols that are content.
  const cases = [
    ['- a/ → 说明', '说明'],
    ['- a/→说明', '说明'],
    ['- a/：说明', '说明'],
    ['- a/ // 说明', '说明'],
    ['- a/ — 说明', '说明'],
    ['- a/ | 说明', '说明'],
    ['- a/ ## 说明', '说明'],
    ['- a/ ★ 重点', '★ 重点'],
    ['- a/ 「说明」', '「说明」'],
    ['- a/ 说明：细节', '说明：细节'],
    ['- a/ （补充）', '（补充）'],
    ['- Button.tsx: 按钮', '按钮'],
  ]
  for (const [line, note] of cases) assert.equal(parseTreeFence(line)[0].note, note, line)
  assert.equal(parseTreeFence('- Button.tsx: 按钮')[0].name, 'Button.tsx')
  // A bare separator annotates nothing and leaves the name clean.
  assert.deepEqual(parseTreeFence('- a/ →'), [{ name: 'a/', folder: true, note: undefined, children: [] }])
  // Drive colons and dotted names never split on their own.
  assert.equal(parseTreeFence('- C:/ 系统盘')[0].name, 'C:/')
  assert.equal(parseTreeFence('- C:/ 系统盘')[0].note, '系统盘')
})

test('todo: heading or paragraph title, flat GFM tasks; colon split matches the auto rule', () => {
  const seg = parseTodoFence('### 行程计划\n- [ ] 订机票：周二前确认\n- [ ] 订酒店\n- [x] 确认签证')
  assert.equal(seg.title, '行程计划')
  assert.equal(seg.items.length, 3)
  assert.equal(seg.items[0].checked, false)
  assert.equal(seg.items[2].checked, true)
  assert.equal(seg.items[0].title, '订机票')
  assert.equal(seg.items[0].body, '周二前确认')

  const para = parseTodoFence('出发前的准备：\n- [ ] a\n- [ ] b')
  assert.equal(para.title, '出发前的准备')
})

test('todo: no title block yields empty title; 100 items cap; mixed content rejected; nesting flattens', () => {
  const bare = parseTodoFence('- [ ] a\n- [ ] b')
  assert.equal(bare.title, '')

  const many = Array.from({ length: 100 }, (_, i) => `- [ ] 项${i}`).join('\n')
  assert.equal(parseTodoFence(many).items.length, 100)
  assert.equal(parseTodoFence(`${many}\n- [ ] 多一项`), undefined)

  assert.equal(parseTodoFence('- [ ] a\n- 普通项'), undefined)
  assert.equal(parseTodoFence('- a\n- b'), undefined)

  // Tolerated deviation (never taught): nested task lists keep document order.
  const nested = parseTodoFence('- [ ] a\n  - [ ] 嵌套')
  assert.deepEqual(nested?.items.map(item => item.title), ['a', '嵌套'])
})

test('stack: numbered boxes with layers, colors, and indented markdown bodies', () => {
  const layers = parseStackFence([
    '1.[#e8f0fe]',
    '  **第一步**',
    '  准备数据。',
    '1.2.[red]',
    '  备选路径。',
    '2.',
    '  收尾。',
  ].join('\n'))
  assert.equal(layers.length, 2)
  assert.equal(layers[0].boxes.length, 2)
  assert.equal(layers[0].boxes[0].fill, '#e8f0fe')
  assert.equal(layers[0].boxes[0].content, '**第一步**\n准备数据。')
  assert.equal(layers[0].boxes[1].fill, '#ff0000')
  assert.equal(layers[1].boxes[0].fill, undefined)
  assert.equal(layers[1].boxes[0].content, '收尾。')
})

test('stack: header-line first content joins the body', () => {
  const layers = parseStackFence('1. 首行内容\n  次行')
  assert.equal(layers[0].boxes[0].content, '首行内容\n次行')
})

test('stack: bad color or empty input rejected', () => {
  assert.equal(parseStackFence('1.[not-a-color]\n  x'), undefined)
  assert.equal(parseStackFence(''), undefined)
  assert.equal(parseStackFence('说明文字'), undefined)
})

test('stack: an unindented line continues the open box', () => {
  const layers = parseStackFence('1. box\n裸行')
  assert.equal(layers[0].boxes[0].content, 'box\n裸行')
  // Only once a header is open; text before the first header still fails.
  assert.equal(parseStackFence('裸行\n1. box'), undefined)
})

test('stack: blank lines under a header do not leave a leading gap', () => {
  const layers = parseStackFence('1.1.[#f7f7f7]\n\n  Branch 1.\n1.2.\n\nBranch 2.')
  assert.equal(layers[0].boxes[0].content, 'Branch 1.')
  assert.equal(layers[0].boxes[1].content, 'Branch 2.')
})

test('oversized fence bodies degrade before parsing', () => {
  const big = '- a\n'.repeat(30000) // 90KB list, pushed past the 100KB cap below
  assert.equal(parseMindmapFence(big + '- ' + 'x'.repeat(60000)), undefined)
  assert.equal(parseTreeFence(big + '- ' + 'x'.repeat(60000)), undefined)
})

test('stack: tab: colors and #rgb accepted; layers sort ascending', () => {
  const layers = parseStackFence('2.\n  b\n1.\n  a')
  assert.deepEqual(layers.map(layer => layer.index), [1, 2])
  assert.equal(parseStackFence('1.[tab:blue]\n  x')[0].boxes[0].fill, '#1f77b4')
  assert.equal(parseStackFence('1.[#fff]\n  x')[0].boxes[0].fill, '#ffffff')
})

test('choices: tab grammar plus an optional leading title block', () => {
  const titled = parseChoicesFence('### 布局\n\n@甲\n说明一\n\n@乙\n说明二')
  assert.equal(titled?.title, '布局')
  assert.deepEqual(titled?.choices.map(c => [c.label, c.body]), [['甲', '说明一'], ['乙', '说明二']])

  assert.equal(parseChoicesFence('@甲\n一\n@乙\n二')?.title, '')
  assert.equal(parseChoicesFence('第一段。\n\n第二段。\n\n@甲\n一\n@乙\n二'), undefined)
  assert.equal(parseChoicesFence('没有标记'), undefined)
})

test('tab: @ headers open labeled pages; inner fences keep @ lines literal', () => {  const tabs = parseTabFence('@甲\n内容一\n\n@乙\n内容二')
  assert.deepEqual(tabs?.map(t => [t.label, t.body]), [['甲', '内容一'], ['乙', '内容二']])

  const spaced = parseTabFence('@ 表达观点\n`I think ...`\n\n@ 补充说明\n`For example, ...`')
  assert.deepEqual(spaced?.map(t => t.label), ['表达观点', '补充说明'])

  const inner = parseTabFence('@装饰器\n```\n@property\ndef x(self): ...\n```\n\n@普通\n说明')
  assert.equal(inner?.length, 2)
  assert.ok(inner?.[0].body.includes('@property'))

  assert.equal(parseTabFence('@唯一\n内容'), undefined)
  assert.equal(parseTabFence('@ \n内容\n@乙\n内容'), undefined)
  assert.equal(parseTabFence('前言\n@甲\n内容\n@乙\n内容'), undefined)
  assert.equal(parseTabFence('没有标记\n两行内容'), undefined)
})
