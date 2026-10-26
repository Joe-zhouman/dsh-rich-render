/**
 * Checklist rule: GFM task lists are explicit user intent, so they upgrade
 * even inside ordered lists, while mixed, nested, and single-item forms stay
 * native. Titles keep TeX and lose other inline markers; descriptions come
 * from continuation lines, later blocks, or a full-width colon split.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { upgradeText } from '../src/rules/upgrade.ts'

/** The live report's shape: heading plus seven two-line task entries. */
const SAMPLE = [
  '## 改稿检查清单',
  '',
  '- [x] 重新阅读原稿和 JAP 审稿意见',
  '  区分真正的拒稿原因与我们推测的论文叙事问题。',
  '- [ ] 重新绘制热阻数据分布',
  '  区分有无碳空位、两个结构族以及中间稀疏区域。',
  '- [x] **按热阻区域重新统计 CVAE 验证结果**',
  '  分别报告 $\\Delta E$、命中率和 MD 波动。',
].join('\n')

test('heading plus task list upgrades to a checklist with marker state', () => {
  const segments = upgradeText(SAMPLE)
  assert.deepEqual(segments.map(s => s.kind), ['checklist'])
  const [checklist] = segments
  assert.equal(checklist.title, '改稿检查清单')
  assert.deepEqual(checklist.items.map(item => item.checked), [true, false, true])
  assert.deepEqual(checklist.items.map(item => item.title), [
    '重新阅读原稿和 JAP 审稿意见',
    '重新绘制热阻数据分布',
    '按热阻区域重新统计 CVAE 验证结果',
  ])
  assert.equal(checklist.items[0].body, '区分真正的拒稿原因与我们推测的论文叙事问题。')
  assert.equal(checklist.items[2].body, '分别报告 $\\Delta E$、命中率和 MD 波动。')
  assert.ok(checklist.source.includes('## 改稿检查清单'))
  assert.ok(checklist.source.includes('- [ ] 重新绘制热阻数据分布'))
})

test('a checklist at the top of the text keeps an empty title and its own slice', () => {
  const text = '- [ ] 检查配置\n- [x] 运行测试'
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['checklist'])
  assert.equal(segments[0].title, '')
  assert.equal(segments[0].source, text)
})

test('the paragraph above the checklist becomes its title and is consumed', () => {
  const text = [
    '根据审稿意见，下面按顺序逐项处理：',
    '',
    '- [ ] 第一项',
    '  说明。',
    '- [x] 第二项',
  ].join('\n')
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['checklist'])
  assert.equal(segments[0].title, '根据审稿意见，下面按顺序逐项处理')
  assert.equal(segments[0].source, text.trim())
})

test('any heading depth above the checklist supplies the title', () => {
  for (const depth of [1, 2, 3, 4, 5, 6]) {
    const marker = '#'.repeat(depth)
    const text = `${marker} 清单标题\n\n- [ ] 甲\n- [x] 乙`
    const [checklist] = upgradeText(text)
    assert.equal(checklist.kind, 'checklist', `depth ${depth}`)
    assert.equal(checklist.title, '清单标题', `depth ${depth}`)
  }
})

test('a list above the checklist is flattened into the title', () => {
  // A different list marker (ordered here) makes a separate mdast list; a
  // same-marker list separated by a blank line merges into one loose list.
  const single = ['1. 改稿检查清单', '', '- [ ] 甲', '- [x] 乙'].join('\n')
  const [one] = upgradeText(single)
  assert.equal(one.kind, 'checklist')
  assert.equal(one.title, '改稿检查清单')

  const starred = ['* 改稿检查清单', '', '- [ ] 甲', '- [x] 乙'].join('\n')
  const [star] = upgradeText(starred)
  assert.equal(star.kind, 'checklist')
  assert.equal(star.title, '改稿检查清单')

  const multi = ['1. 标题与摘要', '2. 方法与数据', '', '- [ ] 甲', '- [x] 乙'].join('\n')
  const [many] = upgradeText(multi)
  assert.equal(many.kind, 'checklist')
  assert.equal(many.title, '标题与摘要；方法与数据')
})

test('a multi-line lead-in paragraph flattens to one title line with TeX kept', () => {
  const text = [
    '检查 $x=0$ 的情况，',
    '仍按以下顺序：',
    '',
    '- [ ] 甲',
    '- [x] 乙',
  ].join('\n')
  const [checklist] = upgradeText(text)
  assert.equal(checklist.kind, 'checklist')
  assert.equal(checklist.title, '检查 $x=0$ 的情况， 仍按以下顺序')
})

test('a block already claimed by an earlier upgrade is not adopted again', () => {
  const tableFirst = [
    '| 量 | 结果 |',
    '| --- | --- |',
    '| $a$ | 1 |',
    '| $b$ | 2 |',
    '',
    '- [ ] 甲',
    '- [x] 乙',
  ].join('\n')
  const segments = upgradeText(tableFirst)
  assert.deepEqual(segments.map(s => s.kind), ['table', 'checklist'])
  assert.equal(segments[1].title, '', 'the table is not reused as the checklist title')

  // Different list types stay two mdast lists even across a blank line.
  const twoLists = ['- [ ] 甲', '- [x] 乙', '', '1. [ ] 丙', '2. [x] 丁'].join('\n')
  const lists = upgradeText(twoLists)
  assert.deepEqual(lists.map(s => s.kind), ['checklist', 'checklist'])
  assert.deepEqual(lists.map(s => s.title), ['', ''], 'the first checklist is not reused as the second title')
})

test('colon-separated one-line items split into title and description', () => {
  const text = [
    '## 清单',
    '',
    '- [ ] 建立含碳空位的受控随机基线：检验空间拓扑规律。',
    '- [x] 评估低热阻区域的定向生成实验',
  ].join('\n')
  const [checklist] = upgradeText(text)
  assert.equal(checklist.kind, 'checklist')
  assert.equal(checklist.items[0].title, '建立含碳空位的受控随机基线')
  assert.equal(checklist.items[0].body, '检验空间拓扑规律。')
  assert.equal(checklist.items[1].body, '')
})

test('a blank-line paragraph becomes the item description', () => {
  const text = [
    '## 清单',
    '',
    '- [ ] 任务一',
    '',
    '  第二段说明。',
    '- [x] 任务二',
  ].join('\n')
  const [checklist] = upgradeText(text)
  assert.equal(checklist.kind, 'checklist')
  assert.equal(checklist.items[0].body, '第二段说明。')
})

test('ordered task lists upgrade instead of becoming cards', () => {
  const text = '## 清单\n\n1. [ ] 第一项\n2. [x] 第二项'
  const segments = upgradeText(text)
  assert.deepEqual(segments.map(s => s.kind), ['checklist'])
  assert.equal(segments[0].title, '清单')
  assert.deepEqual(segments[0].items.map(item => item.checked), [false, true])
})

test('single-item, mixed, and nested task lists stay native', () => {
  const cases = [
    '- [ ] 只有一项',
    '## 清单\n\n- [ ] 任务一\n- 普通项',
    '## 清单\n\n- [ ] 任务一\n  - [ ] 子任务\n- [x] 任务二',
  ]
  for (const text of cases) {
    assert.deepEqual(upgradeText(text).map(s => s.kind), ['native'], text)
  }
})

test('titles keep TeX and lose other inline markers', () => {
  const text = '## 清单\n\n- [ ] 验证 `$n=0$` 的情形\n- [x] 检查 **$a^2$**'
  const [checklist] = upgradeText(text)
  assert.deepEqual(checklist.items.map(item => item.title), ['验证 $n=0$ 的情形', '检查 $a^2$'])
})

test('malformed task syntax degrades without throwing', () => {
  const cases = [
    '- [ ]',
    '- [x]   ',
    '## 清单\n- [ ]\n- [ ]',
    '## 清单\n\n- [ ] 一项\n\n  说明\n- [x] 二项',
    '- [x] [链接](https://example.com)\n- [ ] 普通',
  ]
  for (const text of cases) {
    const segments = upgradeText(text)
    assert.ok(segments.length >= 1)
    for (const segment of segments) {
      assert.ok(typeof segment.source === 'string')
    }
  }
})
