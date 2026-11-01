# mindmap 极简重做方案报告（定案：路线 B）

**日期**：2026-11-02
**状态**：已实施（v0.9.23）；预览校验与实施偏差见 README 修订记录对应条目
**决策链**：v0.9.21 极简改版误删 fence 外框 → v0.9.22 整体回滚、mindmap 重做冻结等参考实现 → 2026-11-01 社区方案调研（markmap / simple-mind-map / XMind 等，参数级结论见 `L:\dsh\docs\superpowers\findings\2026-11-01-mindmap-visual-design.md`）→ 三风格对比图 → 用户选定路线 B
**参考图**：`L:\dsh\docs\superpowers\findings\assets\mindmap-refs\`（XMind 官方 ×2、simple-mind-map ×2、style-comparison.svg 三风格对比）

## 1. 现状问题（为什么难看）

当前 `.dshr-mm-*`（styles.ts:896 起）：每个节点都是 1px 边框 + 8px 圆角的胶囊 chip；连接线是 14px 横杠 + 1px 竖轨的**直角折线**；全灰 token，层级只靠字重。三宗罪与社区共识一一对应：

| 现状 | 社区共识（多实现交叉验证） |
|---|---|
| 每个节点一圈边框 | 盒子数量应随深度**递减**至零——极简感来自整图盒子少，不是盒子素（XMind/simple-mind-map/markmap 一致） |
| 直角折线 | 有机曲线 > 圆角折线 > 直角折线（5 个主流实现无一用直角） |
| 全灰无色阶 | 一级分支一色、后代继承；色板收敛 4 色左右 + 中性灰 |

## 2. 定案视觉规格

### 2.1 节点：三段式盒预算（simple-mind-map 结构 + markmap 参数）

| 层级 | 处理 | 字号/字重 | 颜色 | 下划线 |
|---|---|---|---|---|
| 根 | **实心胶囊**（radius 999px，padding 5px 16px），底 `var(--dsw-alias-label-primary)`，字 `var(--dsw-alias-label-primary-inverted)`（与清单选中态同款 token 对，亮暗自适应） | 15px / 600 | — | 无 |
| 一级 | 裸文本 | 14px / 500 | `--dsw-alias-label-primary` | 2px 分支色 |
| 二级及更深 | 裸文本 | 13px / 400 | `--dsw-alias-label-secondary` | 1.5px 分支色 |

- 多根：所有根同款主色胶囊，**根不参与分支色循环**；树间距 20px 不变。
- 节点文本 max-width 220px → **240px**（对齐 XMind `Length 240`），换行保留 `overflow-wrap: anywhere`。
- 下划线**不用 `border-bottom`**（会切行内 KaTeX 分式/下标与中文 descender）：绝对定位伪元素或 `linear-gradient` 背景，距文字底 2~3px，宽度随块宽（换行节点取整块宽，markmap 同款 `width+2` 语义）。

### 2.2 分支色：4 色循环、后代继承（XMind/Mermaid `colorBy: branch` 语义）

- 按每个根下的**一级分支序号**取 4 色循环，CSS 变量 `--dshr-mm-branch` 挂在 L1 子树容器上，后代（下划线 + 连接线）继承。
- 色板（插件自带，dsw 无分类色 token；实施时在真实明暗主题下目检微调饱和度）：
  - 浅色：`#3b82f6`（蓝）/ `#0d9488`（青）/ `#d97706`（琥珀）/ `#7c3aed`（紫）
  - 深色提亮：`#60a5fa` / `#2dd4bf` / `#fbbf24` / `#a78bfa`
- 主题切换挂载点实施前确认（grep ui-primitives 的主题属性名，`html[data-*]` 或类名选择器）。

### 2.3 连接线：双弧 S 曲线（markmap `curveBumpX` 的纯 CSS 逼近）

- 形态：两伪元素各圆一角（`border-radius: 100% 100%`）拼成连续 S，两端水平切线、中点竖直切线——1.5px 线宽 + 40px 间距下与真贝塞尔肉眼无差。
- 水平 gap：14px → **40px**（markmap 语义是"横向舒展的列"，现状太挤）。
- 线宽：根→一级 **2px**，更深 **1.5px**（根粗叶细，Buzan/markmap 共识；不低于 1px）。
- 颜色：**随子节点**分支色（markmap/Mermaid 同款）；根→L1 边取该 L1 的分支色。
- 塌陷保护：相邻兄弟 dy < 12px 时双弧退化，该边回退单弧圆角折线（radius 8px）。
- **备选升级**（仅 CSS 验收不满意时启用，需用户点头）：连线层内联一条 `<svg><path>` 真三次贝塞尔，节点仍 DOM、KaTeX 不受影响——这是拿到 markmap 原版曲线的唯一路径。
- 实施结果（2026-11-02）：双弧 CSS 在 v0.9.23 上线后逐条目检即被否决——伪元素的边框盒比理想半格多一个边框宽，两段弧端点必然错开，dy=0（单子列常态）时伪元素高度塌成 0、错开量最大，用户看到的正是「中间断开」。v0.9.24 已按上面这条备选改成每边一个内联 `<svg>` 加一条三次贝塞尔路径（`M3 y0 C20 y0, 20 y1, 37 y1`），几何仍由 `useMindmapEdges` 布局后测量；v0.9.25 把两端从「向节点内伸 2px」改成「各缩进 3px」，线端与胶囊、首字之间留约 2px 空隙（内伸时圆端帽压进了胶囊和文字）。双弧方案连同「dy<12px 回退」一并作废，不要再回到伪元素拼弧。

### 2.4 不动的部分（既定约束）

- `.dshr-fence` 外框（1px `border-l2` + 10px 圆角）——用户本人设计，v0.9.21 教训。
- 缩放控件（−/100%/+，50%~200%）、横向滚动、`maxHeight 480×zoom`。
- 多根纵向堆叠、sibling 垂直 gap 6px。
- 解析层（`mindmap` 围栏 → trees spec）与全部兜底规则零改动。
- 节点文本继续走 `InlineMarkdown`（行内 KaTeX 保留）。

## 3. 实施映射

| 文件 | 改动 |
|---|---|
| `src/styles.ts` | `.dshr-mm-chip*` 系重写为文本节点类；新增 `.dshr-mm-root-pill`、`.dshr-mm-b1..b4`（或变量挂法）+ 深色覆盖；`.dshr-mm-tail` / `.dshr-mm-child::before/::after` 直角折线重写为双弧 S；gap 14→40 |
| `src/components/MindmapView.tsx` | Branch/RootTree div 结构保留（定位钩子不变）；L1 子树容器挂分支 index；根 chip → 胶囊；zoom 逻辑不动 |
| `test/build.test.mjs` | mindmap DOM 断言同步（类名/结构/无 chip 边框） |
| `README.md` | 修订记录 + 手册现状描述同步（含"冻结解除，按本报告实施"） |

刷新纪律照旧：web 先 stop-web 再 remove+add；desktop 运行中走复制法（覆盖 `lib/client.js` + map + package.json），退出后可正常 remove+add。

## 4. 验收清单

1. 全测试绿（160 项 + 断言更新）。
2. web 测试台实测 DOM 断言：节点无 1px 边框 chip；曲线伪元素存在；`--dshr-mm-branch` 在 L1 子树内继承到所有后代；同一分支下划线与连接线同色、不同分支不同色；明暗主题两套色都检查。
3. 含 `$...$` 行内公式的节点：下划线不切公式下伸部分。
4. 长文本节点 240px 换行后下划线随块宽；缩放 50%~200% 下曲线不糊不断。
5. desktop 重启生效，两种主题目检。

## 5. 风险

| 风险 | 缓解 |
|---|---|
| 双弧 CSS 在 dy 极小时塌陷 | dy<12px 回退圆角折线（2.3） |
| 4 色与真实主题对比度（尤其深色底） | 提亮版色板 + 实施时目检微调 |
| 下划线切 KaTeX 下伸 | 渐变/伪元素画法 + 2~3px 间距（2.1） |
| 主题属性选择器猜错 | 实施前 grep 确认 dsw 主题挂载点 |
| CSS 曲线终观感不达标 | 备选 SVG 连线层（需用户点头） |

## 6. 参数出处对照

| 本方案参数 | 出处 |
|---|---|
| 根实心块 / L1 描边或裸文本 / 更深裸文本三段式 | simple-mind-map 默认主题、XMind 官方截图 |
| 裸文本 + 彩色下划线锚点 | markmap（`view.ts` 每节点 `<line>` 下划线） |
| 线宽根粗叶细 2→1.5px、≥1px | markmap `1+3/2^d`、Buzan 原则 |
| 分支一色后代继承、边随子色 | XMind `Colored Branch`、Mermaid `colorBy: branch`、mind-elixir |
| 色板 ≤4 色相 + 中性灰 | XMind 示例 4 色、Tufte data-ink |
| 水平大 gap（40px）/垂直小 gap | markmap 80/5、mind-elixir 65/45 的折中（聊天 UI 宽度有限） |
| max-width 240px | XMind `Length 240 PX` |
| 字号只降 1~2 档 | simple-mind-map 16→16→14 |
