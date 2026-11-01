/**
 * Local-path image fallback: bare and code-wrapped absolute image paths in
 * prose become standard Markdown images whose alt text carries the original
 * path (the degradation display); everything else — other extensions, URLs,
 * fenced code, tables, headings, authored image syntax — stays untouched.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { rewritePathImages } from '../src/rules/path-images.ts'

const PIC = 'L:\\dsh\\outputs\\gpt-image\\gpt-20261101-151141-zjmzn7.png'
const PIC_MD = `![${PIC.replace(/\\/gu, '\\\\')}](<${PIC.replace(/\\/gu, '\\\\')}>)`

test('a code-wrapped image path becomes a standard image', () => {
  assert.equal(rewritePathImages(`我生成了图片 \`${PIC}\` 请查收`), `我生成了图片 ${PIC_MD} 请查收`)
})

test('a code-wrapped path with spaces still resolves through an angle destination', () => {
  const spaced = 'C:\\Users\\joe\\My Documents\\result pic.png'
  const spacedEscaped = spaced.replace(/\\/gu, '\\\\')
  assert.equal(rewritePathImages(`图 \`${spaced}\` 好`), `图 ![${spacedEscaped}](<${spacedEscaped}>) 好`)
})

test('a bare image path in prose becomes a standard image', () => {
  assert.equal(rewritePathImages(`图片已保存到${PIC}。`), `图片已保存到${PIC_MD}。`)
})

test('a bare path glued to prose words is matched, but not one glued into a longer token', () => {
  assert.equal(rewritePathImages(`看${PIC}好了`), `看${PIC_MD}好了`)
  assert.equal(rewritePathImages('xxC:\\a\\b.png'), 'xxC:\\a\\b.png')
})

test('a POSIX absolute path is rewritten too', () => {
  assert.equal(rewritePathImages('saved to /home/u/out/pic.webp now'), 'saved to ![/home/u/out/pic.webp](</home/u/out/pic.webp>) now')
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

test('fenced and indented code keep their paths verbatim', () => {
  const fenced = ['```', PIC, '```'].join('\n')
  assert.equal(rewritePathImages(`说明\n${fenced}\n结束`), `说明\n${fenced}\n结束`)
  assert.equal(rewritePathImages(`    ${PIC}`), `    ${PIC}`)
})

test('authored image syntax is never rewritten twice', () => {
  const authored = `![标题图](${PIC})`
  assert.equal(rewritePathImages(authored), authored)
  const once = rewritePathImages(`图 \`${PIC}\``)
  assert.equal(rewritePathImages(once), once)
})

test('link-wrapped code paths stay untouched', () => {
  const linked = `[\`${PIC}\`](file)`
  assert.equal(rewritePathImages(linked), linked)
})

test('paths with brackets stay literal instead of breaking the image syntax', () => {
  const bracketed = '`L:\\out\\pic [1].png`'
  assert.equal(rewritePathImages(`图 ${bracketed}`), `图 ${bracketed}`)
})

test('headings and tables keep their paths literal', () => {
  assert.equal(rewritePathImages(`## 输出 ${PIC}`), `## 输出 ${PIC}`)
  const table = ['| 文件 |', '| --- |', `| ${PIC} |`].join('\n')
  assert.equal(rewritePathImages(table), table)
})

test('several paths in one message all rewrite', () => {
  const a = 'D:\\pics\\a.jpg'
  const b = 'D:\\pics\\b.jpeg'
  const aEsc = a.replace(/\\/gu, '\\\\')
  const bEsc = b.replace(/\\/gu, '\\\\')
  assert.equal(rewritePathImages(`两图：\`${a}\` 与 ${b}。`), `两图：![${aEsc}](<${aEsc}>) 与 ![${bEsc}](<${bEsc}>)。`)
})

test('a quote-line path inside a blockquote paragraph rewrites', () => {
  assert.equal(rewritePathImages(`> 结果 ${PIC}`), `> 结果 ${PIC_MD}`)
})

test('text without any image suffix returns unchanged', () => {
  const text = '今天天气不错，没有图片。'
  assert.equal(rewritePathImages(text), text)
})
