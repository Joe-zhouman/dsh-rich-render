/**
 * Acceptance golden set (requirement doc section 3): the composited sample
 * (cards + timeline + chartable table + mindmap in one reply), the pure-prose
 * zero-upgrade guarantee, and the malformed-input degradation contract.
 * Fixtures are self-authored equivalents of the 2026-10-14 ChatGPT sample;
 * swap in the real transcript by editing the strings below.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { upgradeText } from '../src/rules/upgrade.ts'

/** Golden 1: composited user-profile-analysis reply. */
const GOLDEN_PROFILE = [
  '## 主题分布',
  '',
  '| 主题 | 占比 |',
  '| --- | --: |',
  '| 工程实践 | 0.4 |',
  '| 理论学习 | 0.35 |',
  '| 生活记录 | 0.25 |',
  '',
  '## 四个关注维度',
  '',
  '1. 工程实践。以工具链与自动化为主。',
  '2. 理论学习。偏数学与系统方向。',
  '3. 信息安全。关注权限与输入边界。',
  '4. 生活记录。阅读与观察笔记。',
  '',
  '```timeline',
  '### 探索阶段',
  '- 第一步 工具积累',
  '  搭建本地工作区。',
  '- 第二步 规则沉淀',
  '  整理重复流程。',
  '- 第三步 系统整合',
  '  接入统一入口。',
  '- 第四步 持续回归',
  '  固化验收集。',
  '```',
  '',
  '## 知识结构',
  '',
  '- 工程',
  '  - 构建',
  '  - 测试',
  '- 理论',
  '  - 数学',
  '    - 线性代数',
  '    - 概率统计',
  '  - 系统',
].join('\n')

test('golden 1: the composited sample upgrades into the full set', () => {
  const segments = upgradeText(GOLDEN_PROFILE)
  // The nested knowledge list no longer auto-upgrades (retired rule): it
  // stays native together with its heading.
  assert.deepEqual(segments.map(s => s.kind), ['table', 'cards', 'timeline', 'native'])
  assert.equal(segments[0].chart.kind, 'pie', 'the distribution table becomes a pie')
  assert.equal(segments[0].chart.supplement, undefined, '0.4+0.35+0.25 is exactly a whole')
  assert.equal(segments[1].cards.length, 4)
  assert.equal(segments[1].cards[0].title, '工程实践')
  assert.equal(segments[2].entries.length, 4)
})

/** Golden 2: pure prose never upgrades. */
const GOLDEN_PROSE = [
  '今天的会议开了三个小时。',
  '',
  '讨论集中在两件事上：一是下一季度的目标怎么拆，二是现有系统的维护成本谁来背。前者吵得厉害，后者没人愿意接。',
  '',
  '散会之后我在楼下走了两圈，把争论的几条线重新捋了一遍，发现其实大家争的不是目标，而是顺序。',
].join('\n')

test('golden 2: pure prose renders natively (zero upgrades)', () => {
  const segments = upgradeText(GOLDEN_PROSE)
  assert.deepEqual(segments.map(s => s.kind), ['native'])
  assert.equal(segments[0].text, GOLDEN_PROSE)
})

/** Golden 3: broken or hostile markdown degrades without throwing. */
const GOLDEN_HOSTILE = [
  '| 残缺 | 表 |',
  '| --- |',
  '| 只有 | 一行 |',
  '',
  '> > 嵌套引用没有闭合',
  '',
  '## 孤儿标题',
  '',
  '- 只有一层的列表',
  '- 第二项',
].join('\n')

test('golden 3: broken markdown degrades to native without throwing', () => {
  const segments = upgradeText(GOLDEN_HOSTILE)
  assert.ok(segments.length >= 1)
  for (const segment of segments) {
    assert.ok(typeof segment.source === 'string' && segment.source.length >= 0)
    assert.ok(['native', 'cards', 'callout', 'table', 'timeline', 'mindmap', 'checklist', 'tree', 'stack', 'matplotlib'].includes(segment.kind))
  }
  // The delimiter row does not match the header width, so the "table" is not
  // a GFM table at all: the rule engine must leave it as native markdown.
  assert.equal(segments.find(s => s.kind === 'table'), undefined)
  assert.equal(segments[0].kind, 'native')
})

test('golden 4: every upgrade degrades to its exact source slice', () => {
  const segments = upgradeText(GOLDEN_PROFILE)
  for (const segment of segments) {
    if (segment.kind === 'native') continue
    // The source slice must be recoverable from the original text.
    assert.ok(GOLDEN_PROFILE.includes(segment.source.trim().slice(0, 24)),
      `segment ${segment.kind} source must come from the document`)
  }
  const roundtrip = segments.map(s => s.source).join('\n\n').replace(/\n{2,}/gu, '\n\n')
  const original = GOLDEN_PROFILE.replace(/\n{2,}/gu, '\n\n')
  assert.equal(roundtrip.trim(), original.trim(), 'segments tile the document without gaps')
})
