/**
 * Local-path image fallback and standalone-image layout: bare and
 * code-wrapped absolute image paths in top-level prose become standard
 * Markdown images fenced off as their own paragraphs; authored body images
 * split the same way; lists, tables, quotes, fenced code, URLs, and authored
 * image syntax stay structurally untouched.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { rewritePathImages } from '../src/rules/path-images.ts'
import { upgradeText } from '../src/rules/upgrade.ts'

const PIC = 'L:\\dsh\\outputs\\gpt-image\\gpt-20261101-151141-zjmzn7.png'
const PIC_ESC = PIC.replace(/\\/gu, '\\\\')
const PIC_MD = `![${PIC_ESC}](<${PIC_ESC}>)`

test('a code-wrapped image path becomes a standalone standard image', () => {
  assert.equal(rewritePathImages(`我生成了图片 \`${PIC}\` 请查收`),
    `我生成了图片 \n\n${PIC_MD}\n\n 请查收`)
})

test('a bare image path inside a sentence splits off with blank lines', () => {
  assert.equal(rewritePathImages(`图片已保存到${PIC}。`), `图片已保存到\n\n${PIC_MD}\n\n。`)
  assert.equal(rewritePathImages(`看${PIC}好了`), `看\n\n${PIC_MD}\n\n好了`)
})

test('a path alone in its paragraph already sits at block boundaries and stays put', () => {
  assert.equal(rewritePathImages(PIC), PIC_MD)
})

test('an authored body image splits off like a rewritten one', () => {
  const authored = `![说明图](${PIC})`
  assert.equal(rewritePathImages(`效果 ${authored} 如下`), `效果 \n\n${authored}\n\n 如下`)
})

test('a code-wrapped path with spaces still resolves through an angle destination', () => {
  const spaced = 'C:\\Users\\joe\\My Documents\\result pic.png'
  const spacedEscaped = spaced.replace(/\\/gu, '\\\\')
  assert.equal(rewritePathImages(`图 \`${spaced}\` 好`), `图 \n\n![${spacedEscaped}](<${spacedEscaped}>)\n\n 好`)
})

test('a POSIX absolute path is rewritten too', () => {
  assert.equal(rewritePathImages('saved to /home/u/out/pic.webp now'),
    'saved to \n\n![/home/u/out/pic.webp](</home/u/out/pic.webp>)\n\n now')
})

test('paths inside a blockquote rewrite in place without splitting', () => {
  assert.equal(rewritePathImages(`> 结果 ${PIC}`), `> 结果 ${PIC_MD}`)
})

test('paths inside list items and tables stay literal', () => {
  const list = `- 结果 ${PIC}\n- 另一条`
  assert.equal(rewritePathImages(list), list)
  const table = ['| 文件 |', '| --- |', `| ${PIC} |`].join('\n')
  assert.equal(rewritePathImages(table), table)
})

test('only image extensions rewrite; other suffixes stay literal', () => {
  assert.equal(rewritePathImages(`日志在 \`L:\\logs\\run.txt\`，配置 L:\\etc\\app.yaml 已改`), `日志在 \`L:\\logs\\run.txt\`，配置 L:\\etc\\app.yaml 已改`)
})

test('a longer non-image extension is not cut into an image suffix', () => {
  assert.equal(rewritePathImages('备份 L:\\b\\x.pngx 与 L:\\b\\y.png.tar'), '备份 L:\\b\\x.pngx 与 L:\\b\\y.png.tar')
})

test('relative paths and URLs stay untouched', () => {
  assert.equal(rewritePathImages('相对路径 outputs/pic.png 与 https://a.com/x.png 及 a.com/x.png 都不动'),
    '相对路径 outputs/pic.png 与 https://a.com/x.png 及 a.com/x.png 都不动')
})

test('a bare path glued into a longer token is not matched', () => {
  assert.equal(rewritePathImages('xxC:\\a\\b.png'), 'xxC:\\a\\b.png')
})

test('fenced and indented code keep their paths verbatim', () => {
  const fenced = ['```', PIC, '```'].join('\n')
  assert.equal(rewritePathImages(`说明\n${fenced}\n结束`), `说明\n${fenced}\n结束`)
  assert.equal(rewritePathImages(`    ${PIC}`), `    ${PIC}`)
})

test('authored image syntax is never rewritten twice', () => {
  const standalone = `![标题图](${PIC})`
  assert.equal(rewritePathImages(standalone), standalone)
  const once = rewritePathImages(`图 \`${PIC}\``)
  assert.equal(rewritePathImages(once), once)
})

/** The full pipeline: rewrite splits, then the walk upgrades each standalone image. */
test('a rewritten body path reaches the walk as its own image segment', () => {
  const segments = upgradeText(rewritePathImages(`第三张已保存到 ${PIC} 请查看`))
  assert.deepEqual(segments.map(s => s.kind), ['native', 'image', 'native'])
  const image = segments[1]
  assert.equal(image.kind, 'image')
  assert.equal(image.alt, PIC)
  assert.equal(image.url, PIC)
})

test('an authored standalone image paragraph upgrades to an image segment', () => {
  const segments = upgradeText(`![结果](https://a.com/x.png)`)
  assert.deepEqual(segments.map(s => s.kind), ['image'])
  assert.equal(segments[0].kind === 'image' && segments[0].url, 'https://a.com/x.png')
})

test('a paragraph mixing an image with prose stays native', () => {
  assert.deepEqual(upgradeText('看 ![x](https://a.com/x.png) 效果').map(s => s.kind), ['native'])
})

test('link-wrapped code paths stay untouched', () => {
  const linked = `[\`${PIC}\`](file)`
  assert.equal(rewritePathImages(linked), linked)
})

test('paths with brackets stay literal instead of breaking the image syntax', () => {
  const bracketed = '`L:\\out\\pic [1].png`'
  assert.equal(rewritePathImages(`图 ${bracketed}`), `图 ${bracketed}`)
})

test('headings keep their paths literal', () => {
  assert.equal(rewritePathImages(`## 输出 ${PIC}`), `## 输出 ${PIC}`)
})

test('several paths in one message each split into their own block', () => {
  const a = 'D:\\pics\\a.jpg'
  const b = 'D:\\pics\\b.jpeg'
  const aEsc = a.replace(/\\/gu, '\\\\')
  const bEsc = b.replace(/\\/gu, '\\\\')
  assert.equal(rewritePathImages(`两图：\`${a}\` 与 ${b}。`),
    `两图：\n\n![${aEsc}](<${aEsc}>)\n\n 与 \n\n![${bEsc}](<${bEsc}>)\n\n。`)
})

test('text without any image suffix returns unchanged', () => {
  const text = '今天天气不错，没有图片。'
  assert.equal(rewritePathImages(text), text)
})
