/**
 * Rule-engine regression over the source TS (Node type stripping): the
 * golden-set shapes and the degradation paths. Components themselves are
 * covered by build.test.mjs's artifact harness.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { upgradeText } from '../src/rules/upgrade.ts'

test('pure prose stays one native segment', () => {
  const segments = upgradeText('这是一段普通的散文，没有任何可升格的结构。\n\n第二段也只是文字。')
  assert.deepEqual(segments.map(s => s.kind), ['native'])
  assert.equal(segments[0].text, '这是一段普通的散文，没有任何可升格的结构。\n\n第二段也只是文字。')
})

test('heading plus titled ordered list upgrades to cards', () => {
  const text = [
    '开场白一段。',
    '',
    '## 四个要点',
    '',
    '1. 代码质量。保持函数短小，单一职责。',
    '2. 文档同步。每次改动都要更新 README。',
    '3. 安全边界。输入校验放在解析层。',
    '4. 性能预算。千字渲染低于 50ms。',
    '',
    '结尾一段。',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['native', 'cards', 'native'])
  const cards = segments[1]
  assert.equal(cards.title, '四个要点')
  assert.equal(cards.cards.length, 4)
  assert.deepEqual(cards.cards.map(c => c.title), ['代码质量', '文档同步', '安全边界', '性能预算'])
  assert.equal(cards.cards[0].body, '保持函数短小，单一职责。')
  assert.ok(cards.source.includes('## 四个要点'))
  assert.ok(cards.source.includes('4. 性能预算'))
  // The trailing native run must be exactly the closing paragraph: the list
  // the cards consumed never reappears as native text.
  assert.equal(segments[2].text, '结尾一段。')
})

test('ordered list with an overlong first sentence declines the upgrade', () => {
  const text = [
    '## 要点',
    '',
    '1. 这一条的标题特别长，长得超过三十个字符的上限，因此整条规则都应该放弃升格而退回原生渲染才对。',
    '2. 短标题。正文。',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['native'])
})

test('unordered single-level list stays native', () => {
  const segments = upgradeText('- 苹果\n- 香蕉\n- 樱桃')
  assert.deepEqual(segments.map(s => s.kind), ['native'])
})

test('blockquote upgrades to callout with inner markdown', () => {
  const segments = upgradeText('前文。\n\n> 引用第一段。\n>\n> 引用第二段，含 **加粗**。\n\n后文。')
  assert.deepEqual(segments.map(s => s.kind), ['native', 'callout', 'native'])
  assert.equal(segments[1].body, '引用第一段。\n\n引用第二段，含 **加粗**。')
  assert.equal(segments[0].text, '前文。')
  assert.equal(segments[2].text, '后文。')
})

test('table upgrades with headers, rows, and aligns', () => {
  const segments = upgradeText('| 名称 | 数量 |\n| --- | --: |\n| 苹果 | 3 |\n| 香蕉 | 5 |')
  assert.deepEqual(segments.map(s => s.kind), ['table'])
  const { table } = segments[0]
  assert.deepEqual(table.headers, ['名称', '数量'])
  assert.deepEqual(table.rows, [['苹果', '3'], ['香蕉', '5']])
  assert.deepEqual(table.aligns, [null, 'right'])
})

test('paired-tag block upgrades like the fence form', () => {
  const text = [
    '开场一段。',
    '',
    '<stack>',
    '1.A',
    '2.1.B',
    '2.2.C',
    '</stack>',
    '',
    '收尾一段。',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['native', 'stack', 'native'])
  assert.equal(segments[1].layers.length, 2)
  assert.equal(segments[1].layers[1].boxes.length, 2)
  // The segment keeps the model's own tag slice, not a rewritten fence.
  assert.equal(segments[1].source, '<stack>\n1.A\n2.1.B\n2.2.C\n</stack>')
  assert.equal(segments[2].text, '收尾一段。')
})

test('paired-tag prototype-choices keeps inner fences inside its options', () => {
  const text = [
    '<prototype-choices>',
    '### 要落到哪一层',
    '@只配两个检索代理',
    '```yaml',
    '- id: tool-subagent-sagittarius',
    '```',
    '改动最小，热重载即生效。',
    '',
    '@连预设里的 subagent 一起',
    '```yaml',
    '- id: tool-subagent',
    '```',
    '所有 spawn 子代理默认都换模型。',
    '</prototype-choices>',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['choices'])
  assert.equal(segments[0].title, '要落到哪一层')
  assert.deepEqual(segments[0].choices.map(choice => choice.label), ['只配两个检索代理', '连预设里的 subagent 一起'])
  assert.ok(segments[0].choices[0].body.includes('- id: tool-subagent-sagittarius'))
})

test('unclosed and unknown tag blocks stay native', () => {
  assert.deepEqual(upgradeText('<widget>\n内容\n</widget>').map(s => s.kind), ['native'])
  assert.deepEqual(upgradeText('前文。\n\n<stack>\n1.A\n2.B').map(s => s.kind), ['native'])
})

test('tag-looking lines inside a fenced code block stay code', () => {
  const text = '```md\n<stack>\n1.A\n2.B\n</stack>\n```'
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['native'])
  assert.ok(segments[0].text.includes('<stack>'))
})

test('a paired-tag body the parser declines keeps the original tag text', () => {
  const text = '前文。\n\n<stack>\n这段不是层号\n</stack>\n\n后文。'
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['native', 'native', 'native'])
  assert.equal(segments[1].text, '<stack>\n这段不是层号\n</stack>')
  assert.equal(segments[2].text, '后文。')
})

test('many paired-tag blocks upgrade in source order', () => {
  const text = Array.from({ length: 30 }, () => '<todo>\n- [ ] 一\n- [ ] 二\n</todo>').join('\n\n')
  const segments = upgradeText(text)
  assert.equal(segments.filter(segment => segment.kind === 'checklist').length, 30)
})

test('malformed and hostile inputs degrade to native without throwing', () => {
  const cases = [
    '',
    '   \n\n\t',
    '|||||\n| --- |\n| |',
    '> > > 深嵌套引用\n> > 继续',
    '#'.repeat(200),
    '| a | b |\n| --- |\n| 1 |',
    '1. '.repeat(50),
    '\u0000\u0001\u0002',
  ]
  for (const input of cases) {
    const segments = upgradeText(input)
    assert.ok(segments.length >= 1)
    for (const segment of segments) {
      assert.ok(['native', 'cards', 'callout', 'table', 'checklist'].includes(segment.kind))
    }
  }
})
