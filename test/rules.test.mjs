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
