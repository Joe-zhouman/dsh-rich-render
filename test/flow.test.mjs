/**
 * Timeline regression and the explicit-fence walk: the retired implicit
 * phase forms, the explicit `timeline` fence, the guards, and the retired
 * mindmap auto-upgrade.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { upgradeText } from '../src/rules/upgrade.ts'

test('implicit phase forms no longer upgrade (retired rule)', () => {
  const headings = [
    '## 实施计划',
    '',
    '### 第一步 准备环境。',
    '',
    '安装依赖并配置工作区。',
    '',
    '### 第二步 编写规则。',
    '',
    '实现解析与分段。',
    '',
    '### 第三步 接入渲染。',
    '',
    '替换 assistant-step 渲染器。',
  ].join('\n')
  assert.deepEqual(upgradeText(headings).map(s => s.kind), ['native'])

  const list = [
    '1. 第一步：初始化。加载配置。',
    '2. 第二步：解析。切分文档。',
    '3. 第三步：渲染。生成组件。',
  ].join('\n')
  assert.deepEqual(upgradeText(list).map(s => s.kind), ['native'])
})

test('phase-labeled ordered list after a heading now rides the cards rule', () => {
  const text = [
    '## 步骤说明',
    '',
    '1. 第一步 准备。装依赖。',
    '2. 第二步 构建。跑构建。',
    '3. 第三步 验证。跑测试。',
  ].join('\n')
  assert.deepEqual(upgradeText(text).map(s => s.kind), ['cards'])
})

test('explicit timeline fence upgrades with title, bodies, and view numbering', () => {
  const text = [
    '```timeline',
    '### 实施计划',
    '- 第一步 准备环境',
    '  安装依赖并配置工作区。',
    '- 第二步 编写规则',
    '  实现解析与分段。',
    '- 第三步 接入渲染',
    '  替换渲染器。',
    '- 第四步 回归验收',
    '  跑 golden set。',
    '```',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['timeline'])
  const timeline = segments[0]
  assert.equal(timeline.title, '实施计划')
  assert.equal(timeline.entries.length, 4)
  assert.deepEqual(timeline.entries.map(e => e.title), ['第一步 准备环境', '第二步 编写规则', '第三步 接入渲染', '第四步 回归验收'])
  assert.equal(timeline.entries[0].body, '安装依赖并配置工作区。')
})

test('timeline fence takes ordered lists, title-less bodies, and colon one-liners', () => {
  const ordered = upgradeText('```timeline\n1. 准备：安装依赖。\n2. 构建：跑构建。\n```')
  assert.equal(ordered[0].kind, 'timeline')
  assert.equal(ordered[0].title, '')
  assert.deepEqual(ordered[0].entries.map(e => [e.title, e.body]), [['准备', '安装依赖。'], ['构建', '跑构建。']])

  const bare = upgradeText('```timeline\n- 甲\n- 乙\n```')
  assert.equal(bare[0].kind, 'timeline')
  assert.deepEqual(bare[0].entries.map(e => e.body), ['', ''])
})

test('timeline fence failures degrade to the fence body as markdown', () => {
  const taskItems = upgradeText('```timeline\n- [ ] a\n- [ ] b\n```')
  assert.equal(taskItems[0].kind, 'native')
  assert.equal(taskItems[0].text, '- [ ] a\n- [ ] b')

  const nested = upgradeText('```timeline\n- 甲\n  - 子\n- 乙\n```')
  assert.equal(nested[0].kind, 'native')
  assert.equal(nested[0].text, '- 甲\n  - 子\n- 乙')

  const single = upgradeText('```timeline\n- 甲\n```')
  assert.equal(single[0].kind, 'native')
  assert.equal(single[0].text, '- 甲')

  const overLimit = upgradeText(`\`\`\`timeline\n${'- 甲\n'.repeat(101)}\`\`\``)
  assert.equal(overLimit[0].kind, 'native')
})

test('timeline fence accepts a same-depth heading run (session 278538f0 shape)', () => {
  const text = [
    '```timeline',
    '### 热身：5分钟',
    '朗读或复习前一天的5—8个高频表达，让口腔和大脑进入英语状态。',
    '',
    '### 精听：10—15分钟',
    '选择一段1—3分钟、难度略低于当前水平的英语材料。先不看字幕听一遍。',
    '',
    '### 跟读与影子训练：10分钟',
    '逐句模仿材料中的语音、重音、连读和停顿。',
    '',
    '### 自由表达：5—10分钟',
    '围绕当天主题连续说1—3分钟，可以录音。',
    '',
    '### 复盘：5分钟',
    '记下三个问题。',
    '```',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['timeline'])
  const timeline = segments[0]
  assert.equal(timeline.title, '')
  assert.equal(timeline.entries.length, 5)
  assert.deepEqual(timeline.entries.map(e => e.title),
    ['热身：5分钟', '精听：10—15分钟', '跟读与影子训练：10分钟', '自由表达：5—10分钟', '复盘：5分钟'])
  assert.equal(timeline.entries[0].body, '朗读或复习前一天的5—8个高频表达，让口腔和大脑进入英语状态。')
})

test('timeline heading run adopts a leading title and rejects broken shapes', () => {
  const titled = upgradeText('```timeline\n## 训练结构\n\n### 热身\n甲。\n\n### 精听\n乙。\n```')
  assert.equal(titled[0].kind, 'timeline')
  assert.equal(titled[0].title, '训练结构')
  assert.deepEqual(titled[0].entries.map(e => [e.title, e.body]), [['热身', '甲。'], ['精听', '乙。']])

  const paraTitle = upgradeText('```timeline\n训练结构：\n\n### 热身\n甲。\n\n### 精听\n乙。\n```')
  assert.equal(paraTitle[0].kind, 'timeline')
  assert.equal(paraTitle[0].title, '训练结构')

  const mixedDepths = upgradeText('```timeline\n### 热身\n甲。\n\n## 混入浅层标题\n乙。\n```')
  assert.equal(mixedDepths[0].kind, 'native')

  const singleHeading = upgradeText('```timeline\n### 热身\n甲。\n```')
  assert.equal(singleHeading[0].kind, 'native')

  const preamble = upgradeText('```timeline\n第一段。\n\n第二段。\n\n### 热身\n甲。\n\n### 精听\n乙。\n```')
  assert.equal(preamble[0].kind, 'native')
})

test('GitHub alert markers type the callout and drop the marker line', () => {
  const typed = upgradeText('> [!NOTE]\n> 先读我。')
  assert.equal(typed[0].kind, 'callout')
  assert.equal(typed[0].type, 'note')
  assert.equal(typed[0].body, '先读我。')

  const lower = upgradeText('> [!warning]\n> 小心。\n> 第二行。')
  assert.equal(lower[0].type, 'warning')
  assert.equal(lower[0].body, '小心。\n第二行。')

  const multi = upgradeText('> [!CAUTION]\n> 甲。\n>\n> 乙。')
  assert.equal(multi[0].type, 'caution')
  assert.equal(multi[0].body, '甲。\n\n乙。')
})

test('plain and malformed alert markers stay untyped callouts', () => {
  const plain = upgradeText('> 普通引用。')
  assert.equal(plain[0].kind, 'callout')
  assert.equal(plain[0].type, undefined)
  assert.equal(plain[0].body, '普通引用。')

  const inline = upgradeText('> [!NOTE] 同一行还有字。')
  assert.equal(inline[0].type, undefined)
  assert.ok(inline[0].body.includes('[!NOTE]'))

  const later = upgradeText('> 第一段。\n>\n> [!NOTE]\n> 后面才出现。')
  assert.equal(later[0].type, undefined)
})

test('non-phase titled list after heading still becomes cards', () => {
  const text = [
    '## 能力清单',
    '',
    '1. 代码生成。直接出实现。',
    '2. 文档梳理。整理笔记。',
  ].join('\n')
  assert.deepEqual(upgradeText(text).map(s => s.kind), ['cards'])
})

test('a message past the walk ceiling degrades whole-native without parsing', () => {
  const text = '- item\n'.repeat(40000) + 'x'.repeat(60000) // ~340KB, past the 192KB cap
  const t0 = Date.now()
  const segments = upgradeText(text)
  const ms = Date.now() - t0
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'native')
  assert.equal(segments[0].text, text)
  assert.ok(ms < 500, `whole-native shortcut must be instant, took ${ms}ms`)
})

test('nested unordered list no longer auto-upgrades to mindmap', () => {
  const text = '## 知识结构\n\n- 工程\n  - 构建\n    - vite\n  - 测试\n- 理论\n  - 数学'
  const segments = upgradeText(text)
  assert.ok(segments.every(s => s.kind === 'native'))
})

test('explicit mindmap fence upgrades; prose fence stays native', () => {
  const fenced = '```mindmap\n- 根\n  - A\n    - a1\n  - B\n```\n'
  const segments = upgradeText(fenced)
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'mindmap')
  assert.equal(segments[0].trees.length, 1)

  const prose = '```mindmap\n说明文字\n```\n'
  assert.equal(upgradeText(prose)[0].kind, 'native')
})

test('tree, todo, stack, matplotlib fences upgrade; failures fall back native', () => {
  const tree = upgradeText('```tree\n- src/\n  - index.ts\n```\n')
  assert.equal(tree[0].kind, 'tree')

  const todo = upgradeText('```todo\n### 计划\n- [ ] a\n- [ ] b\n```\n')
  assert.equal(todo[0].kind, 'checklist')
  assert.equal(todo[0].title, '计划')

  const stack = upgradeText('```stack\n1. A\n   内容\n2. B\n```\n')
  assert.equal(stack[0].kind, 'stack')
  assert.equal(stack[0].layers.length, 2)

  const mpl = upgradeText('```matplotlib\nimport matplotlib.pyplot as plt\n```\n')
  assert.equal(mpl[0].kind, 'matplotlib')

  assert.equal(upgradeText('```stack\n裸行\n```\n')[0].kind, 'native')
  assert.equal(upgradeText('```tree\n不是列表\n```\n')[0].kind, 'native')
})

test('explicit tab fence upgrades; failures fall back to the body', () => {
  const fenced = upgradeText('```tab\n@甲\n内容一\n\n@乙\n内容二\n```')
  assert.equal(fenced[0].kind, 'tab')
  assert.equal(fenced[0].tabs.length, 2)
  assert.deepEqual(fenced[0].tabs.map(t => t.label), ['甲', '乙'])

  const failed = upgradeText('```tab\n没有标记\n```\n')
  assert.equal(failed[0].kind, 'native')
  assert.equal(failed[0].text, '没有标记')
})

test('explicit prototype-choices fence upgrades and carries live inner fences', () => {
  const text = [
    '````prototype-choices',
    '### 布局方案',
    '@方案一',
    '```stack',
    '1. 甲',
    '2. 乙',
    '```',
    '',
    '@方案二',
    '单栏连续。',
    '````',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['choices'])
  assert.equal(segments[0].title, '布局方案')
  assert.equal(segments[0].choices.length, 2)
  assert.ok(segments[0].choices[0].body.includes('```stack'))

  const failed = upgradeText('```prototype-choices\n没有标记\n```\n')
  assert.equal(failed[0].kind, 'native')
  assert.equal(failed[0].text, '没有标记')
})

test('fences nest: inner code fences stay content with a 4-backtick outer', () => {
  const tab = [
    '````tab',
    '@示例',
    '```python',
    'print(1)',
    '```',
    '',
    '@说明',
    '普通文字。',
    '````',
  ].join('\n')
  const segments = upgradeText(tab)
  assert.deepEqual(segments.map(s => s.kind), ['tab'])
  assert.ok(segments[0].tabs[0].body.includes('print(1)'))

  // Tolerated deviation (never taught): flush-left inner fences inside stack
  // boxes stay box content instead of failing the whole fence.
  const stack = [
    '````stack',
    '1. 示例',
    '```python',
    'print(1)',
    '```',
    '2. 收尾',
    '````',
  ].join('\n')
  const stacked = upgradeText(stack)
  assert.equal(stacked[0].kind, 'stack')
  assert.ok(stacked[0].layers[0].boxes[0].content.includes('print(1)'))
})

test('fence parsers tolerate common model deviations silently', () => {
  // mindmap: ordered markers, task checkboxes, and a leading paragraph root
  const ordered = upgradeText('```mindmap\n1. 根\n   1. A\n   2. B\n```')
  assert.equal(ordered[0].kind, 'mindmap')
  assert.deepEqual(ordered[0].trees[0].children.map(c => c.label), ['A', 'B'])

  const tasks = upgradeText('```mindmap\n- 根\n  - [ ] A\n  - [x] B\n```')
  assert.equal(tasks[0].kind, 'mindmap')
  assert.deepEqual(tasks[0].trees[0].children.map(c => c.label), ['A', 'B'])

  const proseRoot = upgradeText('```mindmap\n知识结构\n- 工程\n- 理论\n```')
  assert.equal(proseRoot[0].kind, 'mindmap')
  assert.equal(proseRoot[0].trees[0].label, '知识结构')
  assert.deepEqual(proseRoot[0].trees[0].children.map(c => c.label), ['工程', '理论'])

  // tree: ordered markers and task checkboxes parse like plain names
  const orderedTree = upgradeText('```tree\n1. src/\n   1. index.ts\n2. package.json\n```')
  assert.equal(orderedTree[0].kind, 'tree')
  assert.equal(orderedTree[0].trees[0].name, 'src/')
  assert.equal(orderedTree[0].trees[0].children[0].name, 'index.ts')
  assert.equal(orderedTree[0].trees[1].name, 'package.json')

  // todo: nested task lists flatten into document order
  const nested = upgradeText('```todo\n### 计划\n- [ ] 总项\n  - [ ] 子项甲\n  - [ ] 子项乙\n- [ ] 另一项\n```')
  assert.equal(nested[0].kind, 'checklist')
  assert.deepEqual(nested[0].items.map(i => i.title), ['总项', '子项甲', '子项乙', '另一项'])

  // stack: connector lines ignored, trailing dot optional, bare hex fill
  const stacked = upgradeText('```stack\n1 甲\n  说明\n-->\n2.[e8f1ff]\n  更多\n```')
  assert.equal(stacked[0].kind, 'stack')
  assert.equal(stacked[0].layers.length, 2)
  assert.equal(stacked[0].layers[1].boxes[0].fill, '#e8f1ff')

  // timeline: deeper headings fold into the current stage's body
  const folded = upgradeText('```timeline\n### 热身\n甲。\n\n#### 细节\n逐字。\n\n### 精听\n乙。\n```')
  assert.equal(folded[0].kind, 'timeline')
  assert.equal(folded[0].entries.length, 2)
  assert.ok(folded[0].entries[0].body.includes('#### 细节'), folded[0].entries[0].body)
})

test('mindmap/tree/todo parse failures degrade to the fence BODY as markdown, not a code block', () => {
  const prose = upgradeText('```mindmap\n说明文字\n```\n')
  assert.equal(prose[0].kind, 'native')
  assert.equal(prose[0].text, '说明文字')

  const overLimit = upgradeText('```todo\n- a\n- 普通项\n```\n')
  assert.equal(overLimit[0].kind, 'native')
  assert.equal(overLimit[0].text, '- a\n- 普通项')

  // stack and matplotlib keep the fenced code block as their degraded shape
  const stackMiss = upgradeText('```stack\n裸行\n```\n')
  assert.equal(stackMiss[0].kind, 'native')
  assert.ok(stackMiss[0].text.includes('```stack'))
  const mplEmpty = upgradeText('```matplotlib\n```\n')
  assert.equal(mplEmpty[0].kind, 'native')
})

test('flat unordered list stays native', () => {
  const text = '- 甲\n- 乙\n- 丙\n- 丁\n- 戊'
  assert.deepEqual(upgradeText(text).map(s => s.kind), ['native'])
})

test('small multi-level unordered list stays native', () => {
  const text = '- 甲\n  - 乙\n  - 丙'
  assert.deepEqual(upgradeText(text).map(s => s.kind), ['native'])
})

test('multi-level ordered list stays native (fences are unordered-only)', () => {
  const text = ['1. 甲', '   1. 乙', '   2. 丙', '2. 丁', '3. 戊'].join('\n')
  assert.deepEqual(upgradeText(text).map(s => s.kind), ['native'])
})
