# dsh-rich-render（富渲染插件）

## 仓库信息

本目录是 `dsh-rich-render` 的源码仓库（git，`main` 分支，初始提交 v0.9.1，2026-10-26）。

安装到别人的部署、验证是否生效、卸载与常见问题：[INSTALL.md](INSTALL.md)。本文件是开发与规则手册，装机细节不再重复。

| 项 | 值 |
|---|---|
| 包名 | `dsh-rich-render` |
| 版本 | `0.9.33`（`private`，不发布） |
| 类型 | host + client bundle（`dsh.client.platform: web`，自带 `dsh.bundle.patch`） |
| 宿主半区入口 | `lib/index.js`（由 `index.mjs` 构建；预构建产物随仓库提交） |
| 浏览器半区入口 | `lib/client.js`（CJS factory，预构建产物随仓库提交） |
| 运行时资产 | `persona.md`（宿主启动时读一次；宿主人格段落由它生成） |
| 部署机工作副本 | `L:\dsh\.local-deploy\rich-render-plugin\`；`web`/`desktop` 两 profile 以 `file:` 依赖安装 |
| 构建依赖 | dsh 检出的 `node_modules/tsdown` 与 `vendor/schemastery`（`package.json` 脚本与 devDependencies 里的 `../../`），因此本仓库必须位于 dsh 检出内才能构建 |

`lib/` 与 `src/` 必须同一次提交：profile 安装后只运行 `lib/`，不读 `src/`（与 `dsh-soul-presets` 同一约定）。`node_modules/`、`.cache/`（matplotlib 探测缓存）忽略。

- 位置：`L:\dsh\.local-deploy\rich-render-plugin\`（包名 `dsh-rich-render`，私有，不发布）
- 日期：2026-10-15 首版（v0.1.0）
- 需求：`L:\works\news\docs\reports\dsh富渲染插件需求-v1-2026-10-14.md`（规则集与其 v2 修订：三图表决策树/饼图补充片/表格图标列/思维导图）
- 调研依据：`L:\dsh\docs\superpowers\findings\dsh-client-render-pipeline-seam.md`、`findings-external.md` 的 anyblock 节

## 它做什么

接管助手消息渲染（keyed 槽 `conversation.chat.node` / `assistant-step`），对 settle 后的 markdown 做纯规则升格；流式期间与未命中内容走平台原生 `MarkdownText`。另加 `shell.overlay` 水印层。

同时通过 `ctx.theme.overrideTokens('dsh-rich-render:font', …)` 覆盖三个字体 token（插件启用期间全局生效，禁用即恢复平台默认）：`--dsw-font-family` / `--dsw-font-family-brand` 用系统 UI 字体栈（Windows 命中 Segoe UI + 微软雅黑，macOS 命中系统 sans + 苹方），`--ds-font-family-code` 用 Consolas 打头、Fira Code 与平台等宽字体跟在后面（代码里的中文由栈内的「微软雅黑 UI」承接）。

升格组件里的模型原文（阶段/卡片标题、表头与单元格、思维导图节点标签）会把其中的 `$...$`、`$$...$$`、`\(...\)`、`\[...\]` 公式段交给平台 `MarkdownText` 排版，其余文字保持字面量；标题开头的 `2. ` 因此不会被误解析成有序列表。

升格规则（自动判定，未命中即原生；显式围栏见下节）：

| 输入 | 升格 |
|---|---|
| H2/H3 + 紧跟有序列表（≥2 项、项首句 ≤30 字） | 卡片组（标题 + 说明，无图标位——入口图标系统 v0.8.0 退役） |
| 表格 | 样式化表格 + 图表切换（可图时默认图表；右上角图标工具条：表格 / 图表 / 复制 / 下载 PNG） |
| GFM 任务列表（`- [ ]` / `- [x]`，无序或有序，≥2 项且每项都是任务项） | 清单卡片：标题右侧实时 `x/y 项完成` + 进度条；点复选框即时改状态；紧邻上一块（任意级别标题、普通段落或独立列表）去掉标记后作标题，无上一块时用「检查清单」 |
| 引用块 | callout；首行单独写 GitHub 标注标记（`> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`，大小写不敏感）则渲染分型提示框：GitHub 配色 + 图标 + 本地化标题（注意/提示/重要/警告/危险），标记行不进正文 |
| 水印 | 右下角齿轮进设置：图片（URL/本地文件转 dataURL）、透明度（默认 0.12）、四角、大小；存 localStorage |

已退役的自动判定：多层级无序列表 → 思维导图（v0.2.0，改 `mindmap` 围栏）、阶段/Step/第X步/Phase 序列 → 时间线（v0.3.0，改 `timeline` 围栏）。相位标题有序列表不再让位时间线，随普通规则进卡片组。

本地路径图片兜底与图片卡（v0.9.8 起，v0.9.9 成型，v0.9.26 尺寸重做，v0.9.28 改比例上限）：正文段落里的裸绝对路径（`L:\out\pic.png`、`/home/u/pic.png`）与反引号包裹的同样路径，在 settle 后重写为标准图片语法；顶层段落里的图片（模型写的标准图片含在内）一律用空行拆成独立段落，永不与文字同行。每个独立图片段升格为**图片卡**：与其他围栏同款外框（1px border-l2 + 10px 圆角）、右上角「复制」按钮把图片光栅化为 PNG 写入系统剪贴板（跨域图或超大图复制失败时按钮显示失败）；目标不可解析或文件加载失败时卡片显示「图片无法预览 · 作者写的目标」，alt 只在悬停提示里。卡片宽度随图片（`width: fit-content`），图片按正文列宽显示，高度上限取所在列宽的 1.5 倍（A4 竖版是 297/210≈1.41，1.5 就是「比 A4 大一点」）——比例不超过 1.5 的竖图占满正文宽度，超过的才算超长、等比缩小，卡片跟着收窄。路径重写仅限图片扩展名（png/jpg/jpeg/gif/webp/bmp/svg/ico/avif）与绝对路径；列表项与表格内不拆段不重写（拆开会破坏容器），引用块内重写但不拆段；链接内、代码围栏、标题中的路径不动。

清单（GFM 任务列表）的字段与交互：

- 标题取清单紧邻的上一块，不限标题级别：任意 H1~H6、普通段落、独立列表都可以；普通段落压成一行并去掉行尾冒号，独立列表用「；」压成一行。清单不会平白出现，上一块就是它的引子，所以该块会被并进卡片、不再单独渲染。
- 已被其他升格规则消费的上一块不会二次认领（例如紧邻的表格或前一个清单）。
- 每项第一行是标题，续行或空行后的段落是灰色说明；单行 `标题：说明` 按第一个全角冒号拆一次（左半 ≤30 字才拆）。
- 勾选状态从 `[x]` 初始化，点击按钮只改组件本地状态，不写回会话日志；重新加载页面按原文标记恢复。
- 混合列表、单项、嵌套任务列表不升格（保持原生）；任务列表不会被卡片/时间线/思维导图规则抢走，显式任务语法优先。注意 markdown 语义：同一种列表符号、只隔一个空行的两个列表会合并成一个 loose list，因此不会被当成“独立的前置列表”；不同类型（有序/无序）或不同符号才会解析成两个列表。
- 标题与说明里的 `$...$` 继续走平台 MarkdownText 排版，其余文字保持字面量。

表格→图表决策树（行数 2~30 才可图；可图时默认显示图表，右上角是图标工具条（表格 / 图表 / 复制 / 下载）；下载把当前图表以 2x PNG 导出，复制写同一张 PNG 到剪贴板，计算样式内联、背景取页面不透明底色，并绘制图例——饼图右侧带数值与百分比，柱/线下方为序列名，柱状序列附总和）：

- 列数 >2：第 2..N 列全数值？第 1 列数值 ⇒ 折线；第 1 列文字 ⇒ 分组柱状；否则表格
- 列数 =2：第 2 列全数值？第 1 列数值 ⇒ 折线；第 1 列文字且总和 ≤1 ⇒ 饼图（**总和 <1 自动补一片「其他」凑满整圆**，弱化样式）；总和 >1 ⇒ 柱状；第 2 列非数值 ⇒ 表格
- 百分号单元格按 1/100 折算（`30%` → 0.3）

## 构建 / 测试 / 安装

```sh
cd L:/dsh/.local-deploy/rich-render-plugin
pnpm install        # 依赖：mdast 解析层 + react 类型（构建期）
pnpm run build      # tsdown 双 pass：lib/index.js（host 空 apply）+ lib/client.js（CJS factory）
pnpm test           # node --test + 类型剥离：161 项（规则/清单/图表决策/路径图片兜底/golden set/水印配置/构建产物）
```

装机见 [INSTALL.md](INSTALL.md)：桌面端应用内安装、web 的 `dsh plugin add`、file: 依赖、matplotlib 配置、验证与卸载都在那里。本机 web/desktop 两个 profile 已用 file: 依赖装好。

**改版刷新**：file: 依赖按 spec 判等，改完必须 `pnpm remove dsh-rich-render && pnpm add dsh-rich-render@file:L:/dsh/.local-deploy/rich-render-plugin`，再重启 web/桌面端。

## 降级承诺（mermaid 反面）

1. 流式期间纯原生；settle 才升格。
2. 规则引擎纯函数且全 catch：任何异常整段回原生。
3. 每个升格段带精确 source 切片，组件崩溃（局部 ErrorBoundary）只回退该段。
4. 组件级崩溃由槽位退位机制兜底回内置 AssistantNodeView。
5. 水印失败=不可见（grayscale+multiply、pointer-events none）。

## dsh 升级检查点

- diff `packages/client/ui-chat/src/client/chat/AssistantNodeView.tsx`、`AssistantMarkdown.tsx`、`ReasoningRow.tsx`、`contract/slots.ts`、`chat-nodes.ts`，同步 `src/chat-contract.ts` 与复刻组件。输入面同样来自这套契约：标准会话座位属性里 `ui-session` 提供 `sessionId`/`useSession`，`ui-conversation` 提供 `useInput`/`inputActions`（`packages/client/ui-conversation/src/client/apply.ts` 的 `ctx.uiSession.provide`），`ui-slots` 的 `ScopeStandardProps` 把它们投给每个会话作用域槽位；面板选择写入输入框依赖的正是这三个成员。
- seed externals 白名单（`packages/client/web/src/platform.ts`）若变动，检查 tsdown.config.mjs 的 MODULE_TABLE_KEYS。
- 已知偏差：`usePresentation` 不可达，折叠思考行恒显摘要预览（内置受工作细节模式门控）。

## 未做 / 观察项（按需求文档禁入清单与 P2）

- 决策模型槽位已留（`upgradeText` 即 decide 面），v1 纯规则。
- 思维导图无拖拽/折叠（缩放已有）；有序多级列表不升格。
- 图表轴标签仍是 SVG 纯文本（超长截断），公式不在轴标签上排版；图表决策树的数值判定也不剥离 `$...$`，因此数值被 LaTeX 包裹的表格暂不生成图表。
- anyblock 未来规则池观察项：list2table/list2tab/list2card（显式 opt-in 的形态，自动版需另行评估误报代价）。
- 深色模式依赖 `--dsw-alias-*` token 自动跟随，未单独调校。

## 图表决策 v2（2026-10-24 已实现并实机验收；取代上面的 v1）

v2 已上线：行数 2~550（实现容差）、纯数字正则（含科学计数法，拒绝单位/百分号/千分位/货币）、>2 列首列文字直接回表格、饼图 BigInt 精确求和 + `1e-9` 容差 + 全部 ≥0、百分比最大余数法凑满 100。上面 v1 小节的决策树描述仅作历史记录。

### 表格自动图

- 只看表格形式，不看模型意图；第一行只作标签，不参与数据。
- 前置：所有数据单元格非空；数字仅接受纯数字（正负号、小数、科学计数法）；单位写在表头，单元格带单位、百分号、千分位、货币符号都算解析失败，静默回表格。**v1 的百分号折算取消。**
- 行数：persona 告知模型数据行 ≤500；实现容差 550，超过 550 不出图（表头/分隔行不计），表格照常显示。
- 规则优先级：
  1. 所有列纯数字，≥2 列、≥2 行 → 多折线；第一列 X，其余列 Y。
  2. 恰好 2 列、第一列文本、第二列数字，全部 ≥0 且 `0 < sum ≤ 1` → 饼图；`sum < 1` 补一片「其他」，`sum == 1` 不补。
  3. 恰好 2 列、第一列文本、第二列数字，其他情况 → 柱状。
  4. 其余、空值、解析失败 → 表格，静默回退，不提示原因。
- **v1 的“>2 列且首列文字 → 分组柱状”取消**；这种情况直接回表格。
- 浮点：用缩放整数/Decimal 精确求和；`|sum-1| ≤ 1e-9` 视为 1；百分比展示用最大余数法凑满 100%，Other 同样处理。
- 不设 Y 列数、类别数、重复标签上限；图标工具条可切回表格。现有 README v1 写作「图表/表格/下载图片」，讨论中表述为「表格/图表/下载」；实现时以现有 UI 为准并对齐。
- 性能护栏：>550 数据行跳过图表（不是图表规则，是渲染保护）。
- 可图时默认图表页；表格始终可切回（沿用现有设计）。

### matplotlib（新增第二层）

- 仅支持 `matplotlib` 围栏，不支持 seaborn；persona 仅在检测到 Python + matplotlib + numpy 时注入，并注入三者版本。
- 必须内嵌数据；不读工作区文件、不联网；不要假设 pandas/seaborn；一个 cell 一张图。
- 首次渲染自动执行；缓存 key = 代码 + backend + 主题 + 库版本 + 字体 + DPI；失败结果也缓存，**不设手动重试按钮**；超时/失败显示代码与错误，不重复自动执行。
- UI：右上角图标工具条 `代码 / 图表` + `复制 / 下载`；代码页用平台 `CodeBlock`（`lang="python"`，shiki 高亮、语言标题、复制/换行动作与正文代码块一致）；成功默认图表页，失败默认代码页；功能关闭或环境缺失时退化为普通 Python 代码块。
- 复杂图、交互图、artifacts、Plotly、kernel、文件交付提示都不在 rich-render 范围；这里是终点。

### persona

- 表格映射规则始终注入：三种形态、全部有值、纯数字、单位写表头、数据行 ≤500、不要承诺一定有图、失败静默回表格。
- matplotlib 段按环境条件注入：只承接表格图表达不了的静态图；内嵌数据同样建议 ≤500 行。
- 不注入文件交付/artifacts/Plotly/kernel 相关提示。

### v2 暂缓

- 主题、配色、日间/夜间适配、字体匹配、图表视觉调优；均留到下一步优化。

## mindmap / stack / tree / todo / timeline / tab / prototype-choices 决策（2026-10-24 已实现并实机验收；timeline 2026-10-25；tab 2026-10-26；prototype-choices 2026-10-26）

### 围栏统一外框（v0.9.5）

- 所有显式围栏（mindmap / stack / tree / todo / timeline / tab / prototype-choices / matplotlib）根节点共用 `.dshr-fence`：1px `border-l2` + 10px 圆角，即 stack 原先那个不明显的整体轮廓。
- 各组件保留自己的内边距与内部结构；原先自带的 `border-l1` 边框与 8–12px 圆角移除，改由共享类统一。mindmap 的内层滚动框边框并入外框；timeline / tab / prototype-choices 补内边距，避免内容贴边。

### 围栏正文换行（v0.9.6）

- 所有围栏的 Markdown 正文（stack box、tab 页内容、timeline/todo 说明、prototype-choices 展示区）在渲染前经过 `strictLines`：单个换行直接渲染成换行，不需要空一行；空行仍然是段落分隔。
- 代码围栏、缩进代码、表格行、标题/列表/引用等块边界不处理；已经是硬换行（行尾两空格或反斜杠）的行不重复标记，转换幂等。
- 结构型围栏的条目本身（mindmap 节点、tree 名称）仍是一行一个条目，不走这条规则。

### mindmap（显式环境，取代自动升格）

- 围栏 `mindmap`，不提供 `flow` 别名；内容只接受嵌套无序列表；根在围栏内。
- 多个顶层项 = 多个 mindmap（多个根），各自渲染为一棵左→右树，纵向堆叠；这不是错误，不回落。
- persona 里给模型一段左→右 CLI 树预览，例如：

  ```text
       |- CVAE 生成候选
  确定目标热阻区间 --|
       |_ 结构筛选
  ```

  实际组件画的是每边一条 SVG 三次贝塞尔曲线（分支色、根粗叶细）；预览只表达方向和层级。


- 横向 scrollbar + 缩放控件（`−` / `100%` / `+`，范围 50%~200%）；缩放是组件本地状态，不写回会话。
- 视觉（v0.9.25，选型与参数出处见 `docs/mindmap-redesign-report.md`）：盒预算随深度递减——根是唯一实心胶囊（999px 圆角、`label-primary` 底 / `label-primary-inverted` 字、15px/600），一级与更深是裸文本（14px/500 主色、13px/400 次级色，max-width 240px），锚点是分支色下划线（底部渐变条：一级 2px、更深 1.5px，距文字底 3px，不切行内公式下伸，换行取整块宽）。分支色 4 色循环挂每个根的一级子树容器（`dshr-mm-b1..b4` 定义 `--dshr-mm-branch`，后代经 CSS 变量继承；根不参与循环；浅色 #3b82f6/#0d9488/#d97706/#7c3aed，`body[data-ds-dark-theme]` 下提亮为 #60a5fa/#2dd4bf/#fbbf24/#a78bfa，插件自带、不走 dsw token）。连线每边一条内联 SVG 三次贝塞尔（`M3 y0 C20 y0, 20 y1, 37 y1`，从父节点出口即子列中线到子节点中心；两端各缩进 3px，圆形端帽再收 1px，所以线与胶囊、与首字之间留出约 2px 空隙，不重合；水平 gap 40px，根→一级 2px、更深 1.5px，颜色随子分支，dy=0 时退化为直线）；几何由组件在布局后测量，给每个 SVG 写 top/height、给 path 写 d（只用 offsetTop/offsetHeight 布局量，缩放 transform 不影响；ResizeObserver 在换行/行内公式改行高时重算；未测量前 path 无 d，不画半截线）。
- 节点上限 200（总数）；不设最小条目数（至少根 + 1 子节点）。超限、解析失败或内容不是列表时，把围栏内容按普通 Markdown 渲染（列表就显示为 list），静默；插件未启用时仍是代码块。
- 现有自动 mindmap 升格规则退役：普通嵌套 list 不再自动变 mindmap，只有显式 `mindmap` fence 才渲染。
- 实现提示：复用 `MindmapView` 的布局；新增多根渲染、横向滚动、缩放；`upgrade.ts` 的 `matchMindmap` 及对应测试/golden 需同步调整。

### stack（纵向层叠）

- 围栏 `stack`，仅纵向；每个 box 以 `层号.` 或 `层号.层内序号.` 开头，可选颜色；box 头后可直接跟第一行内容，其余内容写在缩进 Markdown 里，下一个 box 头结束当前 box。分支/合并靠层数变化，不画逐节点连线。
- 不画层间箭头：层叠本身表达方向；单层、单方块都不特判。
- 颜色语法：写在编号后，如 `1.[#e8f0fe]`、`2.1.[red]`；方括号内是一个填充色（不是 fill/border 两个值），只控制填充，文字颜色按亮度自动取黑/白；省略用主题 surface。支持命名色、hex、`tab:*`；配色优化后置。
- box 内容按 Markdown 渲染；单个换行即另起一行（v0.9.6 起，不需要空行），空行仍分段；渲染器只做视觉容器（外框/底色/圆角/内边距/等高），不做“第一行标签、第二行标题”这类语义角色推断；模型自行使用粗体、斜体、引用、列表。
- 视觉（v0.9.3）：整块 stack 只画 1px `border-l2` 外框（10px 内边距、10px 圆角），**容器本身透明**；每个 box 默认浅灰底 `--dsw-static-neutral-100`（rgb(245,245,245)）、8px 圆角、**无边框**，层与层之间 10px 间隙；`[颜色]` 显式填充优先于默认灰。深色主题下方块改用 `bg-layer-2` 暗色面。不用 `bg-base`：平台把消息区底色设为半透明白（实测 `rgba(255,255,255,0.5)`），方块跟随它会与页面同色。
- 对齐（v0.9.4，自动规则，不扩展 `[]` 语法）：box 内可见文字（`stripInline` 去掉 inline Markdown 标记、忽略空白）少于 10 个字符时整体居中，否则左对齐；`[颜色]` 仍只控制填充。阈值与实现见 `src/rules/stack-align.ts`。
- 上限与回退：不设硬上限；编号无效或解析失败时整块回退为代码块，静默。

### tree（文件/目录树）

- 围栏 `tree`，内容只接受嵌套无序列表；多个顶层项 = 多个根，按森林渲染，不要求单一根。
- 文件夹判定：名称以 `/` 结尾，或该节点有子节点；空文件夹也允许。文件按扩展名和特殊文件名取图标。
- 渲染：纵向缩进树 + 层级引导线；文件夹可折叠，默认展开；折叠状态是组件本地状态，不写回会话。
- 图标：对齐 VS Code Material Icon Theme（material-extensions/vscode-material-icon-theme，MIT）——关联规则取自其 fileIcons/folderIcons 清单，图标以 16×16 填充路径内联（策展子集：120 扩展名 + 58 特殊文件名 + 54 文件夹名，167 枚图标 ≈ 89KB，含默认 file/folder/folder-open 与每个特殊文件夹的 open 变体——open 变体按其构建管线同款做法，把 folder 体的 d 换成规范 open 路径合成）。渐变图标（kotlin/graphql 等 14 枚）与其关联一并跳过，回落相邻规则或通用图标。数据由 `extract-material-icons.mjs` 从浅克隆 `material-icon-theme-src/`（保留在盘，供再生）生成到 `src/rules/material-icons.generated.ts`；未覆盖的名字走通用文档图标。v0.7.0 起生效，取代 v0.1 的小集合单色徽章。
- 长名称/深层级：横向 scroll，不换行；悬停显示完整名称。
- 上限：500 节点、12 层；超限或解析失败静默回退为普通 Markdown list；插件未启用时仍是代码块。
- persona 决策：文件/目录结构用 `tree`，概念层级用 `mindmap`，纵向层叠/合并用 `stack`，图表用表格或 matplotlib。

### todo（计划/清单）

- 围栏 `todo`，不提供别名；内容只接受扁平的 GFM 任务列表（`- [ ]` / `- [x]`）。
- 标题取围栏内第一个非任务块（标题或普通段落），沿用现有“去尾冒号、压成一行”的规则；没有就用 locale 的「检查清单」兜底。围栏自包含，不吞围栏外的上一块。
- 复用 `ChecklistView`：`x/y 项完成`、进度条、点击切换；勾选是组件本地状态，不写回会话。
- 混合列表、嵌套任务、空内容、没有任务项、解析失败 → 把围栏内容按普通 Markdown 渲染（列表就显示为 list），静默；插件未启用时仍是代码块。
- 上限 100 项，超过回退 list；不做嵌套。
- 现有 GFM 任务列表的自动升格保留；`todo` fence 是显式推荐入口。
- persona：计划/行程/清单用 `todo`；明确勾选状态模型看不到，不要根据勾选状态继续对话；普通列表仍用 Markdown。

### timeline（阶段历程，2026-10-25）

- 围栏 `timeline`，不提供别名；内容 = 可选标题块（围栏内第一个标题或段落，沿用去尾冒号、压成一行）+ 一个扁平列表（有序或无序均可）；不嵌套、不用任务勾选语法。
- 每项首行是阶段名，其余缩进行/块是说明；单行「阶段名：说明」按全角冒号拆一次——条目拆分与 `todo` 围栏共用 `entryTitleBody`。编号由渲染器给出，不看列表标记。
- 复用 `TimelineView`（竖轨 + 圆点序号 + 阶段名 + 缩进说明），组件零改动。
- 条目数 2..100；嵌套列表、任务项、单项、超限、解析失败 → 把围栏内容按普通 Markdown 渲染（列表就显示为 list），静默；插件未启用时仍是代码块。
- 隐式时间线升格退役（v0.3.0）：阶段标题连排与相位标题列表不再自动变时间线；相位标题有序列表随 H2/H3 进卡片组。
- persona：单线推进、每阶段展开说明的阶段/步骤/里程碑/经历用 `timeline`；同阶段并列方向用 `stack`；纯罗列步骤用有序列表。

### tab（多页标签，2026-10-26）

- 围栏 `tab`，不提供别名；每个标签一行 `@标签名`（非缩进行；```/~~~ 内层围栏内的 `@` 视为内容，不切页），其后到下一个 `@` 的所有行是该标签的 Markdown（空行含在内，内层代码围栏保持原样）。
- 2–30 个标签；标签纯文本（stripInline 剥行内标记）、≤60 字；首标签之前只允许空行，出现非空内容整体回退为围栏正文（不静默丢弃）。
- 视图：经典线型 tab（Ant Design line / Material underline tabs）——标签按内容宽度排布，`flex: 1 0 auto` 把剩余宽度均分、整行铺满（两端对齐；标签过多或过长时横向滚动，不截断）；底部一条 `border-l1` 浅分隔线；标签 13px/20px、文字居中，未选中 `label-secondary`，选中 `label-primary` + 600 字重 + 2px 主色下划线（左右各留 9px，压在分隔线上）。页内容用默认 `MarkdownText`（与普通段落同字号同色，v0.9.5 起不再 `compact`）。`role=tablist/tab/tabpanel`；仅渲染选中页；选中态是组件本地 state（默认第一页），不写回会话。
- persona：按标签分组、点选切换的并列条目用 `tab`，优先于无序列表堆叠（「标签 + 对应内容」型：表达框架、命令速查、参数说明）。

### prototype-choices（方案示意，2026-10-26）

- 围栏 `prototype-choices`，不提供别名；语法 = tab 文法（非缩进 `@选项名` 行开选项，```/~~~ 内层围栏里的 `@` 视为内容；2–30 项、标签纯文本 ≤60 字）+ 可选标题块（首个 `@` 之前恰好一个标题/段落，去尾冒号、≤120 字，多块或代码块整体回退）。
- 视图分两区：选择区为竖排单选项（`label` 里放一个原生 `<input type="radio">`，每个围栏一组 `name`（`useId()`）；16px、`accent-color: var(--dsw-alias-brand-primary)`，与平台 `Checkbox`、插件管理页的 registry 选择同一套写法，环与圆点由浏览器绘制；选中行 `label-primary` + 600、hover 有底，`:focus-visible` 2px `link` 描边，方向键切换原生可用）；展示区为描边圆角面板。选中项内容走**完整升格管线**（`ChoicesView` 嵌 `RichMarkdownText`）——示意可以是真实渲染的富围栏、代码块或纯文字；仅渲染选中项；选中态组件本地（默认第一项）。
- 每个围栏自动带一个「其他」选项（v0.9.31）：渲染器在作者写的选项之后补一项 locale 文案「其他」/「Other」，不需要模型自己写、也不显示说明文字；模型若已经写了 `@其他`（或 `@其它`/`@Other`，大小写与首尾空格不敏感）就不再重复追加。选中「其他」写的是 `已选择：其他`，用户接着把自己的想法补在后面。附带调整：展示区只在选中项有正文时渲染，选中「其他」不再留一个空描边框。
- 选择即写入输入框（v0.9.30）：点某个选项，输入框顶部自动多出一行 `已选择：<选项名>`（zh `已选择：方案二`、en `Selected: …`），用户在这行下面补充要求后自己发送——围栏**从不发送**。写入走会话座位投递的输入面（`inputActions.setDraft`，配合 `useInput` 读当前草稿），整段重写而不是插入光标处，这样选择行永远在最前，换选项时替换的是本围栏上一次写的那一行而不是再叠一条（`src/choice-fill.ts` 的 `composeChoiceDraft`）。草稿里已有引用 chip 时不整段重写（那会毁掉 chip），改用带 revision 守卫的 `insertText` 在最前面插入。写入成功不额外提示（用户直接在输入框里看到结果）；只有被编辑器拒绝时在展示区下方显示失败文案。座位上没有输入面（非会话座位）时保持纯预览。
- 与 tab 的分工：tab 是内容分组页（正文级紧凑排版），prototype-choices 是方案对比示意（选项 + 直观预览 + 把选择带进输入框）。

## persona 注入（2026-10-24 已实现并实机验收）

- 宿主入口 `index.mjs` 从 no-op 改为真实实现，`inject` 加 `systemPrompt`；只对主会话注册（普通 API 会话 id 为 `session-<uuid>`，子代理子会话为裸 UUID，不注册），避免给子代理浪费 token。
- 合并段：表格映射规则 + `mindmap` / `stack` / `tree` / `todo` / `timeline` 的围栏说明与 CLI 预览，作为一段注入。
- `matplotlib` 单独一段：只在配置开启且启动检查通过时注入，并附带 Python / matplotlib / numpy 版本。
- 配置先只走 cordis.yml，不做设置 UI：`matplotlib.enabled`（拟默认 false，显式开启）、`matplotlib.python`（默认 `python`）。默认值待确认。
- 检查在插件宿主入口加载时做一次（等价于 dsh 启动时检查）：用 `importlib.util.find_spec` + `importlib.metadata.version` 判断可用性并取版本，不 import matplotlib 重库；缺失则**不注入并记日志**，不做每轮运行时检测，环境变化需重启。
- 提示词保持短：每个环境一句规则 + 一个 CLI 预览；明确“能用普通 Markdown 就不要用显式环境”。


## 实现记录（2026-10-24，v0.2.0）

测试基线 69 → **101 项**全绿（新增 percent/fence/tree-icons/persona/matplotlib-host + 宿主接线并入 build.test.mjs）。两 profile 已按 remove+add 刷新并启用 matplotlib。

### matplotlib 执行与缓存（实现偏离记录）

spec 原文写“用 ctx.fs 读写脚本/缓存”。实际部署（win32）的 `ctx.shell` 是 pwsh-sandbox、`ctx.fs` 是 fs-sandbox（workspace-write、root=`process.cwd()`），任何插件自选缓存目录都会被写闸拦住；pwsh-sandbox 还会丢 `stdin` 字段。最终实现：

- **程序以脚本文件方式落盘**到插件包自身 `.cache/`（宿主进程用 node:fs 写，不受沙箱限制；受限 python 只需读），命令为 `python "<脚本>"`；脚本按缓存 key 命名（`mpl-<sha256>.py`），已有即复用。
- **结果缓存只在宿主进程内存**（key = 代码 + backend + 三库版本 + DPI + 字体名）；失败同样缓存，无重试按钮。宿主重启后首个请求会重跑一次。清缓存 = 重启 web/桌面端（顺带可删 `.cache/`）。
- **执行策略显式 `read-only`**：比部署默认 workspace-write 更严（cell 全程无任何可写路径），且绕开了本机 ACL runner 的故障（workspace-write 需要对 workspace 根 `SetNamedSecurityInfoW`，`L:\dsh` 根非当前用户所有而拒绝，Win32 5）。
- 启动检测同样走脚本文件（`.cache/detect.py`，find_spec + metadata.version，不 import matplotlib）。

### 浏览器↔宿主 RPC（实现偏离记录）

spec 设想独立 channel `/rich-render`。实际：自定义 channel 的 `rpc.handle` 在本组合下要求 connection 服务上下文直取 `webServer`（同层兄弟服务，取不到，激活即抛错）；改试 `/api` 的 `rpc.intercept` 又会顶掉 API gateway 的唯一拦截槽（会话创建全 404）。最终用 **`ctx.connection.fetch.register` 精确路由**（file-upload 同款先例）：`POST /api/rich-render/status` 与 `/api/rich-render/exec` 两条 buffered 路由，自带 client-request/server-response 信封处理，走与其它 /api 请求相同的 Host/Origin 围栏 + 浏览器鉴权。浏览器半边 `ctx.connection.rpc.call('/api', 'rich-render/<endpoint>', …)` 不变。

### persona 注入与本部署预设的交互（重要）

- 段以 `interpolate: false` 注册（`rich-render:environments` order 9000；`rich-render:matplotlib` order 9001，仅 `matplotlib.enabled` 开启时注册、检测成功后填入版本文本——空段在装配中自动消失）。
- 子代理过滤按 `assembleContext.agent?.session?.header?.origin === 'subagent'` 返回空串。
- **本部署的 qa/chat 两个 soul 预设都以 `complete: true` 注册系统提示词**——预设会话的提示词被整体替换（连 harness identity 都不进），富渲染段只在**标准模式**会话生效。这解释了“问答/对话模式里模型不用围栏”的现象；要用富渲染请开标准模式会话（或给预设补注入）。
- 实机验收（标准模式、单条自然请求）：模型自发使用 `tree`（2 处）与 `todo`（6 处清单）围栏——spec 使用验收（3 场景 ≥2）通过；stack 本次未自发使用（persona 已收录，观察项）。
- 配置只走 cordis.yml：`matplotlib.enabled`（默认 false）、`matplotlib.python`。两 profile 已显式开启并指向 `D:/softwares/conda-old/envs/plotting/python.exe`（matplotlib 3.11.2 / numpy 2.5.3）。改动经 dsh-hmr 热生效；环境变化需重启（检测仅启动时一次）。

### 实机验证摘要（2026-10-24，web 测试台）

- mindmap：多根渲染、缩放 −/100%/+（125% → scale(1.25)，重置回 100%）、横向滚动容器正常。
- tree：森林渲染、按扩展名/特殊名取图标、文件夹折叠（5 行 → 2 行 → 还原）、悬停全名。
- stack：层升序、同层等高（43px/43px）、`[#e8f0fe]` 填充 + 亮度自动黑字、粗体/斜体按 Markdown 原样、无箭头。
- todo：标题取围栏内标题块、全角冒号拆分与自动升格一致、`[x]` 初始态正确、点选改本地状态、**刷新后按原文恢复**（用户实测点选 + 刷新往返）。
- 表格 v2：和=1.0 两列表格 → 饼图无补片，图例 50%/30%/20%（和恰 100）。
- matplotlib：成功默认图表页出 PNG；失败默认代码页 + traceback、无重试；页面刷新后图从缓存恢复、无重跑；host 侧真实 RPC（status/exec）与只读沙箱执行均实测。
- 截图存档：`C:\Users\joe\.zcode\cli\artifacts\`（会话 ba764362…，2026-10-24）。

### 评审补记（scorpio 终审后）

- **围栏失败回退形态修正**：mindmap/tree/todo 解析失败时按 spec 回退为**围栏正文**的普通 Markdown（列表就显示为 list）；stack/matplotlib 维持围栏代码块形态（spec 原文即如此）。此前实现误把三种列表型围栏也留在代码块里。
- **缓存 key 主题维度**：key 显式包含 `theme=default` 常量维度；主题功能被 spec 冻结暂缓，值恒定，待主题落地时替换。
- **表格图例的序列开关**（点图例隐藏/恢复序列）为 v1 既有行为，spec 回归条款（"现有表格行为保持不变"）明确保留，非本次新增。

### 观察项

- `.cache/` 会随 file: 安装复制进 profile（内容寻址，无害）；源插件目录的 `.cache/` 是 build.test.mjs 宿主接线的自然产物，可随手删。
- 标准模式实机验收里 stack 未被自发使用；后续观察 persona 的 stack 说明是否需要更强触发示例。
- 桌面端 profile 已刷新 + 配置已启用，**下次启动桌面端生效**（本会话未重启桌面端）。
- **对抗测试（aries，2026-10-24）**：三个渲染冻结 DoS 已修——BigInt 指数炸弹（scaled() 拒绝 |指数|>400）、围栏体 100KB 上限、规则走查 192KB 上限（超出整段 native；插件叠加的解析开销归零）。鉴权/只读沙箱/程序拼接/超时/stdout 上限等 12 项攻击全部存活（含实测：越界写全部 PermissionError、60.25s 超时、50MB stdout 无 OOM）。**残余**：setext（`x
===
` 型）在 192KB 内仍是平台共享 micromark 的二次方（48KB≈23s、96KB≈99s），无插件时同样慢——插件层开销已归零，属平台基线，报告在 reviews/rich-render-environments-adversarial-runtime.md（含可选加固：上限降到 48KB 或 O(n) 行形预扫）。

## 修订记录（2026-10-25，v0.2.1）

persona.md 措辞修订（用户编辑，无代码改动，测试 108/108 仍绿）：富渲染总则改为「解释论证默认连贯段落」，收紧原生无序列表与有序列表的使用条件；stack 用途扩展为「同一阶段内多个方向或方案的分组说明」并写明与多级列表的取舍（回应上面"stack 未被自发使用"观察项）；「选择」节从条目列表改为连贯段落。persona 为运行时资产，宿主启动时一次性读入。desktop profile 已 remove+add 刷新至 0.2.1（运行中的桌面端重启后生效）；web profile 仍装 0.2.0（persona 为旧版），需要时同法刷新。

## 修订记录（2026-11-06，v0.9.33）

用户把全局内容字号调到 16px 后指出行内代码的胶囊不对：在 callout、stack 盒这类块里比周围文字还大，把行距衬得很紧。根因是这些块的正文走 `MarkdownText variant="compact"`（16px 设置下 14px/21px），而平台的 `.compact :not(pre) > code` 显式写 `1em`，块内代码于是与块内文字同号；同一段话在正文段落里却是 `0.875em`（16px 正文配 12.25px 代码）。两处比例不一致，块里的胶囊才显得突兀。改法：在插件那条作用域规则里补字号 `font-size: clamp(0.875em, 12px, 1em) !important`——所有面统一 0.875em 比例；12px 下限让小字号设置下的等宽字仍可读；1em 上限保证下限不会在极小的内容字号（10–13px）下反超它所在的文字。框不跟着缩：`1px 6px` 内边距、`4px` 圆角、6% 底色保持 px，药丸高度本由行盒与字号决定，字变小药丸自然变矮、行距随之松开。16px 设置下正文段落代码仍是 14px，callout、stack 盒、卡片正文、时间线、清单里的代码从 14px 降到 12.25px。`build.test.mjs` 补一条样式断言。测试 173 项全绿。两 profile 已刷，桌面端重启、web 刷新生效。

## 修订记录（2026-11-03，v0.9.31）

两处按用户反馈修正。其一，去掉填入成功后的说明行「已填入输入框，可补充后发送」——用户直接在输入框里看到结果，不需要围栏再解释一遍；只有写入被编辑器拒绝（发送中锁定 / revision 竞态）时才显示错误文案，chip 草稿的插入还会先重试一次。其二，每个 `prototype-choices` 围栏默认带一个「其他」选项：渲染器在作者写的选项之后补一项 locale 文案（zh 其他 / en Other），选中写 `已选择：其他`，用户在消息里补自己的想法；这个选项由渲染器提供，模型不需要写，persona 也明确不要自己写 `@其他` 或解释它。去重规则：作者已写 `@其他`、`@其它` 或 `@Other`（大小写、首尾空格不敏感）时不再追加。附带调整：展示区只在选中项有正文时渲染，选中「其他」不再留一个空描边框。测试 170 → 173（新增 withOtherChoice 追加/去重两条、chip 路径重试一条；build 测试的选项断言改为一共三项含 `choicesOther`）。实机验收：滚回上一条回复里的围栏，选项变为「选完自动聚焦输入框 / 正文可选附上 / 就这样 / 其他」四项，下方不再有说明行；点「其他」后输入框顶部出现 `已选择：其他`，没有发出任何消息，随后清空输入框复原。两 profile 已同步 0.9.31（客户端刷新即生效；persona 那句要重启宿主）。

## 修订记录（2026-11-03，v0.9.30）

用户否掉 v0.9.29 的按钮式交互（「这种交互不好」）：要的是**点选项就把 `已选择xxx` 附带在消息前面**——用户可能还要补充内容，绝不能直接发送。于是删掉整条提交行与直发通道（`conversation.send`、`sessions` inject、`choice-send.ts` 全部移除），改为写输入框：`ChoicesView` 从会话座位拿 `useInput`（读 `draft` 与 chip 数）和 `inputActions`，选中时调 `writeChoiceDraft` → `composeChoiceDraft(previous, line, draft)` 生成「选择行 + 空行邀请 + 用户已有文字」，再 `setDraft` 整段写入（光标落在末尾，用户接着在下一条补充即可）。为什么整段重写而不是 `insertText` 插到光标处：只有整段重写才能保证行在最前，并且能用本围栏上次写的 `previous` 行做替换——换选项时替换而不是叠加（用户在那一行后面直接接着打字的情况也按前缀剥离，补充文字被挪到新行下面）。草稿里已有引用 chip 时（`occurrences.length > 0`）整段重写会毁掉 chip，退回带 revision 守卫的 `insertText(…, {start:0,end:0,draftRev})` 在最前面插入且不重复插同一行。反馈：写入成功显示「已填入输入框，可补充后发送」，编辑器锁定或插入被拒时显示「填入输入框失败，请重试」；没有输入面的座位不渲染反馈，围栏保持纯预览。persona 相应改为「用户点选后输入框会自动多出一行 `已选择：<选项名>`，用户可能补充后再发送」。已在选中的选项再点一次也会重写（原生 radio 对同值不再触发 change，`label` 的 onClick 补上这一路径），便于用户清空输入框后重新取用。测试 161 → 170：新增 `test/choice-fill.test.mjs`（空草稿、已有文字、替换本围栏行、用户改过的行回退为前置、前缀相似不误判、chip 草稿走插入且不重写、插入被拒报失败）；build 测试改为断言「无发送行、点第二个选项把 `choicesAnswerPrefix方案二\n请用中文` 写进草稿、无输入面时不显示反馈」。实机验收：刷新页面后点选项，输入框出现 `已选择：…`，未发送任何消息，用户可继续输入。两 profile 已同步 0.9.30（客户端部分刷新即生效；persona 需重启宿主）。

## 修订记录（2026-11-03，v0.9.29）

用户需求：`prototype-choices` 选中的内容要真的进入下一轮对话，而不只是高亮预览。做法：展示区下方加提交行，「发送选择」把当前选项作为一条用户消息发进本会话（文本 = locale 前缀 + 选项名，zh `已选择：方案二` / en `Selected: …`），消息经会话座位的 `sessionId`、用 `ctx.sessions.scope(id).get('conversation').send(text)` 入队——这正是 composer 自己发消息走的作用域服务（`ui-conversation` 的 `send()`），所以选择会作为真正的用户轮次进入上下文。跨模块传递沿用 matplotlib 桥的模式：`src/choice-send.ts` 存一个模块级 sender，`client.ts` 在 `ctx.effect` 里安装/清理，`RichAssistantNodeView` 由 `sessionId` 造出 `(text) => sendChoice(sessionId, text)` 并沿 `RichMarkdownText → ChoicesView` 传下去（没有 `sessionId` 时不渲染提交行，围栏保持纯预览）。交互状态：发送中禁用、成功后固定「已发送」、换选项回到可发送、失败在按钮旁显示 retry 文案；显示语言随 locale。persona 补一句：用户点「发送选择」后模型会收到 `已选择：<选项名>`，按该选择继续、不要再问选哪个。测试补：提交行存在、点击把 `choicesAnswerPrefix方案一` 送进 `session-1`、无会话座位时整行不渲染（161 项全绿）。实机验收（运行中的桌面端，经 HMR 已加载新 bundle）：新建通用助手会话 → 让它原样输出一段 `prototype-choices` → 围栏渲染两选项 → 点「发送选择」→ 转写里出现用户消息 `已选择：双栏`、按钮变「已发送」并禁用，随后模型开新一轮。截图 `rich-choice-send-before.png` / `rich-choice-send-after.png`（部署目录）。两 profile（desktop、web）的 `lib/` 已同步到 0.9.29；客户端半区下次刷新即生效，persona 新增的那句要等宿主重启（桌面端完全退出重开）。**该直发交互当天被用户否决，v0.9.30 改为一律写入输入框、绝不发送；此条保留作版本史。**

## 修订记录（2026-11-02，v0.9.28）

用户要求图片的默认比例按「比 A4 竖版大一点」定，超过这个比例才算超长。0.9.26 用的是绝对值 `max-height: 1200px`，列宽一变就不对（窄窗口放得过高，宽窗口反而压扁）。改成按列宽算比例：`ImageView` 量出图片所在列的宽度（ResizeObserver 跟窗口和侧栏变化），给图片写 `max-height = 列宽 × 1.5` 的行内上限——A4 竖版是 297/210 ≈ 1.41，1.5 即「比 A4 大一点」；比例不超过 1.5 的图仍占满正文宽度，超过的才等比缩小、卡片随之收窄。测量完成前，CSS 里的 `max-height: 1200px` 作兜底，量到列宽后由行内样式接管。预览验证（列宽 860）：1640×2500（1.52）满宽 838×1277；940×1112（1.18）满宽 838×991；800×2400（1:3）缩到 430×1290（正好 1.5×860），卡片 452 宽、两侧无留白。测试 161 项全绿。两 profile 已刷，桌面端完全退出重开、web 刷新生效。

## 修订记录（2026-11-02，v0.9.27）

用户问「图片为什么无法渲染」：那条图的 Markdown 指向 `.preview-choices\img-new.html`（我贴错文件，是网页不是图片），卡片按设计走了失败分支。顺手把失败分支的信息改准：原来显示 `alt || 原路径`，作者写了 alt 时路径就被吃掉（这次显示成「图片无法预览 · 改后同一张图」，看不出是哪个文件错了）；现在固定显示作者写的目标（原路径/URL），alt 移到 `title` 悬停提示，长路径断行（`overflow-wrap: anywhere`），错误一眼可查。测试 161 项仍全绿。两 profile 已刷，桌面端完全退出重开、web 刷新生效。

## 修订记录（2026-11-02，v0.9.26）

用户反馈图片看不清、卡片两边空很多（当前 session 的截图被压成约 236×360 的窄条）。原因是图片卡沿用了平台正文图片的 `max-height: 360px`，卡片本身却是满宽 block：竖版截图缩到 360px 高、宽只剩 236px，左右全是卡片的空白。改法：`.dshr-image` 改 `width: fit-content`（卡片包住图片，两侧空白消失），`.dshr-image-img` 去掉 360px 上限、改 `max-height: 1200px`，图片按正文列宽显示——同一张 1640×2500 截图从 236×360 变成 787×1200，图内文字回到约 12–13px 可读；特别长的图仍被 1200px 截住并等比缩小，卡片随之收窄，不会再回到满宽空框。`build.test.mjs` 补了样式断言（`width: fit-content`、`max-height: 1200px`，以及 360px 不再出现的负断言）。测试 161 项全绿。两 profile 已刷，桌面端完全退出重开、web 刷新生效。

## 修订记录（2026-11-02，v0.9.25）

用户反馈 v0.9.24 的连线「和方框及文字部分重合了」，要求两边留一点距离。原因是 0.9.24 为了让圆端帽贴住字形，把路径两端各向节点内伸了 2px，叠加圆形端帽半径 1px，实际压进胶囊与首字 3px。改法：两端改为各缩进 3px（`M3 y0 C20 y0, 20 y1, 37 y1`），扣掉端帽半径后线端离节点约 2px，胶囊边缘与第一个字都不再被压到；曲线形状、线宽、gap、颜色、测量与重算逻辑一律不动。预览 `mm4.mjs` 的「改前」页固定读 `313a38d` 的样式表（原先读 `HEAD`，0.9.24 提交后 HEAD 已是 SVG 版，改前页会画不出线），`mm4-shot.mjs` 的几何校验增加两端 x 坐标（3 / 37）一项，13 条连线仍全部命中。测试 161 项全绿。两 profile 已刷（哈希与源一致），桌面端完全退出重开、web 刷新页面生效。

## 修订记录（2026-11-02，v0.9.24）

用户反馈 v0.9.23 的连线「中间是断的」。根因在双伪元素弧线的画法：每半条弧都是一个带 1.5px/2px 边框的伪元素，`content-box` 下它的边框盒比理想半格（20px × |dy|/2）多出上下、左右各一个边框宽，两个圆弧的端点因此在接缝处错开一个「边框宽」（2px 时 2px×2px，1.5px 时 1.5px×1.5px）；dy=0 时（单子列的常态，一棵树里总有一半分支属于这种）伪元素高度塌成 0、边框仍占位，错开量最大，正是用户看到的断口。v0.9.23 记下的「dy→0 时双弧自然退化为水平线」不成立，报告的「dy<12px 回退」才是对的。修法：每条连线改为一个内联 `<svg>` 加一条三次贝塞尔 `path`（`M-2 y0 C20 y0, 20 y1, 42 y1`，从父节点出口即子列中线到子节点中心），接缝从存在变成不存在，dy=0 时就是一条直线；路径两端各向节点内伸 2px，圆形端帽贴住字形，不再出现线到文字前就停住的观感。几何仍由 `useMindmapEdges` 在布局后测量，改为给每个 SVG 写 top/height、给 path 写 d，只用 offsetTop/offsetHeight 布局量，缩放与 ResizeObserver 行为不变；未测量前 path 没有 d，不会画半截线。顺带修正一级加粗的越界：`.dshr-mm-child-l1 .dshr-mm-edge::before` 是后代选择器，把一级子树内所有深层连线也加粗成了 2px，现在 SVG 规则用直接子选择器，只有根→一级是 2px。预览换成 `mm4.mjs` + `mm4-shot.mjs`（`L:\dsh\.local-deploy\.preview-choices\`，截图 `mm4-{light,dark}.png`）：13 条连线两端点数值校验全部命中，含 dy=0 的两条（起止等高、无接缝），另有 4x 特写核对平坦线与曲线。`build.test.mjs` 的 mindmap 断言从伪元素弧线改为 SVG/path（含不再存在 `::before/::after` 的负断言），测试 161 项仍全绿。两 profile 已刷（`lib/client.js`、`package.json` 哈希与源一致），桌面端完全退出重开、web 刷新页面生效。

## 修订记录（2026-11-02，v0.9.23）

mindmap 冻结解除，按选型报告（`docs/mindmap-redesign-report.md` 路线 B；调研与参数出处见 `L:\dsh\docs\superpowers\findings\2026-11-01-mindmap-visual-design.md`）重做节点与连线：节点从「每个 1px 描边胶囊」改为随深度递减的盒预算——根是唯一实心胶囊（999px 圆角、`padding 5px 16px`、`label-primary` 底 + `label-primary-inverted` 字、15px/600，与清单选中态同款 token 对），一级与更深是裸文本（14px/500 主色、13px/400 次级色，max-width 220→240px），锚点是分支色下划线（底部 `linear-gradient` 条：一级 2px、更深 1.5px，`padding-bottom` 3px 避开行内公式与 descender，换行取整块宽）。分支色 4 色循环挂每个根的一级子树容器（`dshr-mm-b1..b4` 定义 `--dshr-mm-branch`，下划线与连线经 CSS 变量继承，根不参与循环）：浅色 #3b82f6/#0d9488/#d97706/#7c3aed，`body[data-ds-dark-theme]` 下换提亮版 #60a5fa/#2dd4bf/#fbbf24/#a78bfa——dsw 无分类色 token，色板插件自带。连接线从「尾横杠 + 竖轨 + 直角折线」改为每边一条的双弧 S 曲线（两个只圆一角的伪元素拼成连续 bump，两端水平切线、中点竖直切线，逼近 markmap `curveBumpX`）：水平 gap 14→40px，根→一级 2px、更深 1.5px，颜色随子分支；曲线几何（每边相对子行的 top/height/flip）由 `useMindmapEdges` 布局后测量写入 CSS 变量——只用 offsetTop/offsetHeight 布局量，缩放 transform 不影响，ResizeObserver 在换行或行内公式改行高时重算，变量缺失退化为水平线；`dshr-mm-tail`、竖轨伪元素与 `dshr-mm-chip` 类退役。报告 2.3 的「dy<12px 回退单弧圆角折线」未单独实现：兄弟中心距恒为行高+6px（≥约 25px）触发不了相邻兄弟分支，父子 dy→0 时双弧自然退化为水平线（预览页 13 条边数值校验两端点全部命中，含 dy=0/-9/-14/-65）。外框、多根、缩放（50%~200%）、横向滚动、树间距 20px、兄弟 gap 6px、200 节点上限与解析层零改动；`build.test.mjs` 新增 mindmap DOM 断言（裸节点类、无 chip、根胶囊、一级分支色循环与更深不重挂、每边 edge 钩子、样式表含双弧/色板/深色覆盖），测试 160 → 161 项全绿。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-11-01，v0.9.22）

用户澄清：所有 fence 的外框是他本人的设计，要保留；0.9.21 把外框删掉是误读——他说的「无外框线」是指 mindmap 内部不该给每个节点套框。mindmap 的重做也先冻结，他会找一份现成实现来抄。因此本轮只做回滚：`.dshr-fence` 恢复 1px `border-l2` + 10px 圆角；`.dshr-mm-*` 整体回到 0.9.20 的胶囊节点样式；README 现状描述同步还原。等参考实现到位后再重做 mindmap。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.21）

用户要求 mindmap 换成好看的极简样式，并说明整体偏好「无外框线」。两件事一起做：1) `.dshr-fence` 不再画边框（`border: 0`、`border-radius: 0`，类名保留作钩子），所有显式围栏变成无框排布，靠各自内边距与内部结构成形；2) mindmap 从「每个节点一个描边胶囊 + 外层边框」改为**无框轮廓树**——节点只剩文字，层级由字号与字重区分（根 14px/600 主色、一级 13px/500 主色、更深 13px 次级色），连接线保持 1px 细引导线（尾段与 sibling 竖轨由 14px 收到 12px，间距 6→4px），缩放控件从带框按钮改为右上角无框文字按钮（22px 高、`radius-sm`、hover 才有底、`:focus-visible` 2px `link` 描边）。`styles.ts` 的 `.dshr-mm-*` 全部重写；组件结构、多根渲染、缩放范围都没动。160 项测试全绿。两 profile 已刷，桌面端重启生效。**该版误读了「无外框线」：fence 外框是用户本人的设计，mindmap 重做也先冻结，0.9.22 已整体回滚。**
## 修订记录（2026-11-01，v0.9.20）

用户要求 matplotlib 的代码页按 Python 渲染。原来代码页把 `segment.source`（整段围栏文本）交给 `MarkdownText`，语言标成 `matplotlib`、没有对应文法，于是只有一块无高亮的纯文本。现在改为平台的 `CodeBlock`：`code={segment.code}`（围栏内的 Python 源码）、`lang="python"`、`streaming={false}`，标签直接用 `labels.code`（`copyLabel` / `copiedLabel` / `toolbarLabels`），因此拿到 shiki 语法高亮、语言标题、复制与换行动作，和正文里的 python 代码块完全同款。功能关闭或环境不可用时仍按原围栏文本退化（`MarkdownText`）。`build.test.mjs` 的 primitives 桩补了 `CodeBlock`。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.19）

图标集到了（`L:\works\news\icons-minimal-svg`，Lucide/Feather 两套原始 SVG，推荐 Lucide）。工具条一次做完：新增 `FenceToolbar`（`.dshr-toolbar`），两个图表单元共用——左半是视图 tab（表格/图表、代码/图表），中间一条 `border-l2` 竖发丝线，右半是动作（复制、下载），整条 `justify-content: flex-end` 靠右；按钮 26×26、16px 图标、`--dsw-radius-sm` 圆角，hover/激活都是 `interactive-bg-hover` 底 + 主色图标，`:focus-visible` 2px `link` 描边，全部 `Tooltip`（`side=bottom`、`portal`）+ `aria-label`，界面上不再出现按钮文字。图标路径内联进插件自己的 Lucide 集合（`src/rules/icons.ts` 新增 table / chart / download / copy，`code` 原本就有；表格与复制里的圆角 `rect` 改写成等价 path，保持 `IconPaths` 只有 path 的形状）。复制：`chart-download.ts` 拆出 `chartPngBlob`（原 `downloadChartPng` 的光栅化部分），新增 `copyChartPng` 写 `ClipboardItem` 到剪贴板；matplotlib 侧直接把 dataURL 取 blob 写入。`FenceToolbar` 自己管复制反馈（成功换 check、失败换 alert-triangle 并染 `state-error-primary`，1.5s 后回到 idle，卸载时清定时器）；图表未就绪时复制与下载按钮 `disabled`。文案收敛：新增 locale `copyFailed`，图片卡与图表工具条共用 `copy`/`copied`/`copyFailed`，删掉重复的 `imageCopy`/`imageCopied`/`imageCopyFailed`。`build.test.mjs` 的表格工具条断言改成「四个 `dshr-toolbar-btn`，`aria-label` 依次 viewTable/viewChart/copy/downloadChart，图表默认激活，复制与导出都接上 onClick」，图片卡断言里的 label 改为 `copy`。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.18）

用户提出 matplotlib 单元与「表格→图表」单元的工具条应当一致：1) matplotlib 的 tab 原来靠左、表格单元靠右，现统一靠右（`.dshr-mpl-tabs` 加 `justify-content: flex-end`）；2) matplotlib 的「下载」原本是第三个 tab、点开后才给一个 `<a download>` 链接，现改成与表格单元同样的即时动作——`dshr-mpl-tab-action` 按钮直接把 dataURL 触发下载并停在当前页，图片未就绪时按钮 `disabled`；下载页与 `.dshr-mpl-dl` 样式一并删掉。第 3、4 点（复制按钮、五个图标）暂缓：平台图标集里只有 code / download / copy 三个现成 glyph，table / chart 没有对得上的，等用户给图或另选图标集后再一次性替换成图标工具条。
## 修订记录（2026-11-01，v0.9.17）

用户要求图片卡右上角的复制按钮别再写「复制」两个字，改用 DSH 原生的复制图标。改成平台 `CodeToolbar` 的同一套做法：`Tooltip`（`side=top`、`align=end`、`portal`）+ `aria-label`，图标用 `IconCopyOutlineRegular`（16px），复制成功换 `IconCheckOutlineRegular`，失败换 `IconWarningOutlineRegular` 并染 `--dsw-alias-state-error-primary`；按钮从文字条改成 26×26 的图标按钮（`--dsw-radius-sm`、`color-mix(bg-base 82%)` 磨砂底 + 0.5px `border-l2` 发丝线），压在任意图片上都读得清，hover 提高不透明度并提亮图标，`:focus-visible` 2px `link` 描边。行为不变：点击仍把图片光栅化为 PNG 写剪贴板，失败态保留到下次点击。`build.test.mjs` 的 primitives 桩补了 `Tooltip` 与三个图标，并新增断言「图片卡有一个 `dshr-image-copy` 动作、带 `aria-label`、子节点是图标元素而不是文字」。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.16）

用户反馈 0.9.15 的底色偏深，要「前后两者之间」：权重从 10% 降到 6%（浅色下合成约 241 灰，落在平台 250 与上一版 231 之间）。深色下 6% 反而比平台色更深（深色底本身已接近文字色），所以补一条 `body[data-ds-dark-theme]` 作用域把深色权重提到 9%（合成约 42，介于平台的 41 与 10% 的 44 之间）。4px 圆角、无描边、`inline` + `1px 6px` 不变。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.15）

用户对行内代码提了四点：圆角太大、浅色模式太浅、有多余外框、轮廓比周围文字高，并给了一份 zcode 的参考实现。平台 `MarkdownText.module.css` 的 `.markdown :not(pre) > code` 是 `inline-flex` + `8px` 圆角 + `0.5px` `border-l1` 描边 + `--dsw-alias-markdown-inline-code`（浅色下是 250 的灰）。插件样式表里加了一条作用域覆盖：`.dshr-flow-body.dshr-flow-body :not(pre) > code { display: inline; padding: 1px 6px; border: 0; border-radius: 4px; background: color-mix(in srgb, currentColor 10%, transparent); box-decoration-break: clone; }`——圆角 4px、去掉描边、底色改成当前文字色的 10%（浅色约 #e6e6e6，深色自动变成 10% 白），`inline` + 1px 内边距让药丸高度跟着文字走，而不是撑成更高的 flex 盒。双写容器类名是为了压过平台那条同特异性的 `.markdown …` 规则（否则胜负只取决于样式表加载顺序）；作用域限定在富渲染的 `.dshr-flow-body`，工具块与界面其它部分保持平台样式。字号沿用平台的 `0.875em`（约 12px）。160 项测试全绿。两 profile 已刷，桌面端重启生效。
## 修订记录（2026-11-01，v0.9.14）

用户看完渲染效果后改口：Fira Code 作为**展示面**不如 Consolas 好看（Fira Code 的 `calt` 连字让 `=>`、`!=`、`!==` 变形成箭头和 ≠，整体也偏宽；Consolas 在 Windows 上更紧凑、字形更规矩）。`--ds-font-family-code` 改为 `Consolas, 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Liberation Mono', 'Courier New', 'Microsoft YaHei UI', 'PingFang SC', 'Noto Sans CJK SC'`——Windows 上命中 Consolas，没有 Consolas 的机器（macOS）仍落到 Fira Code，再往后是平台等宽与中文字体。UI 字体栈不动。`build.test.mjs` 的等宽断言改为校验 `Consolas` 打头。160 项测试全绿。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-11-01，v0.9.13）

用户同样要求清单的勾选框照成熟实现重画（「自实现的不好看」），做法比照上一版围栏：把 24px 自绘圆环 + SVG 勾（`button[role=checkbox]` + `aria-checked`）换成平台 `Checkbox` 同一套写法——`<label>` 里一个 16px 原生 `<input type="checkbox">`，`accent-color: var(--dsw-alias-brand-primary)`，`:focus-visible` 2px `link` 描边，勾、焦点框、暗色底都由浏览器绘制。外部几何不变：`label` 仍是 24×22 的点击区（22 = 标题行高，勾选框与标题第一行居中对齐），标题列起始位置与原来一致；标题与说明文字不参与点击，避免框选正文时误勾。组件删掉 `CheckGlyph` 与 `aria-checked`，`aria-label` 留在 input 上；`build.test.mjs` 的断言从「role=checkbox 的 button」改为「`type=checkbox` 的原生 input + `checked`」。160 项测试全绿。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-11-01，v0.9.12）

用户给了一份字体栈参考，要求照它改富渲染的字体设置：界面用系统字体栈，代码用 **Fira Code**（他本人的偏好）。`--dsw-font-family` / `--dsw-font-family-brand` 从 v0.9.7 的「Noto Sans SC 打头」换成 `'Segoe UI', ui-sans-serif, system-ui, -apple-system, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`；`--ds-font-family-code` 首次纳入覆盖层：`'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', 'Microsoft YaHei UI', 'PingFang SC', 'Noto Sans CJK SC'`。两处都把 Segoe UI 放在 `ui-sans-serif` 之前：本机 Chromium 在 `lang=zh-CN` 的文档里把 `ui-sans-serif` 解析成 Microsoft YaHei UI，Latin 也一起变成雅黑，前置 Segoe UI 才能得到参考里「Segoe UI + 中文雅黑」的观感（CDP `CSS.getPlatformFontsForNode` 实测：UI Latin=Segoe UI、UI 中文=Microsoft YaHei UI、代码=Fira Code、代码内中文=Microsoft YaHei UI）。等宽栈不加裸 `monospace` 尾巴，与平台 `--ds-font-family-code` 保持一致，避免 Windows 中文回退到宋体；Fira Code 没有中文字形，代码里的中文由栈内的「微软雅黑 UI」承接。Fira Code 的 `calt` 连字随字体默认生效（`!=`、`=>` 会连写）。本机已装 Fira Code（Regular/Retina/Bold 等），未装的机器自动落到后面的等宽字体。`build.test.mjs` 的字体断言改为校验两条栈及 light/dark 同值。160 项测试全绿。两 profile 已刷，桌面端重启生效。**0.9.14 起展示面改用 Consolas，Fira Code 退居其后。**

## 修订记录（2026-11-01，v0.9.11）

用户纠正 v0.9.10 的方向：布局和交互都不该动（竖排单选项、展示面板、选中加粗都保持原样），丑的只是那个自绘圆点——「中间的点太大，看上去又不在中间」，做法应当是照成熟实现重画这个小控件。于是恢复 v0.9.9 的选择区 DOM 与样式，只把指示器换成**原生 `<input type="radio">`**：`label` 行里一个 16px 单选，`accent-color: var(--dsw-alias-brand-primary)`，`:focus-visible` 2px `link` 描边——与平台 `Checkbox`（`ui-primitives/Checkbox.module.css`）和插件管理页的 registry 选择（`PluginManagerPage.module.css`）同一套写法，圆环、圆点、焦点框全部由浏览器绘制，因此圆点必然居中，不再有旧实现 1.5px 边框 + `inset: 2.5px` 在 1x 下的亚像素偏移。同一 `name`（`useId()` 生成，每个围栏一组）让方向键切换与组语义原生可用。删掉 `dshr-choices-dot` 圆环与 `::after` 圆点，以及 `dshr-choices-list` 的 `role=radiogroup`、按钮上的 `role=radio`/`aria-checked`（原生控件自带）。`build.test.mjs` 的选项断言改为「每项是 `type=radio` 的原生 input、同组同名」，`stubReact` 补 `useId`。160 项测试全绿。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-11-01，v0.9.10）

用户反馈 prototype-choices 的「checkbox」太丑（截图：粗描边圆环 + 实心黑点，竖排三行像表单）。选择区改成**一排可换行的 chip**：删掉 `dshr-choices-dot` 圆点标记与竖排列表，选中态只由 chip 自身的填充表达——未选中 `interactive-bg-hover` 灰底 + `label-secondary` 13px，选中 `label-primary` 实底 + `label-primary-inverted` 反色 + 500 字重；hover 用 `interactive-bg-hover-accent` 加深并提亮文字，`:focus-visible` 用 2px `link` 描边，背景/文字过渡 120ms（`prefers-reduced-motion` 关掉）。`flex-wrap` + `flex: 0 1 auto` + `max-width: 100%` 让 2–30 个选项按内容宽度排布、放不下就换行，超长标签在 chip 内折行不溢出。展示区去掉原先套在 `.dshr-choices-panel` 上的 1px 边框、圆角与内边距——外框已由共享 `.dshr-fence` 提供，两层描边去掉后画面只剩一个外框；标题/选择区/展示区统一由 `.dshr-choices` 的 10px `gap` 分隔。暗色不另写样式，全部跟随 `--dsw-alias-*`（选中 chip 自动变成浅底深字）。`build.test.mjs` 的选项标签断言随 DOM 调整（chip 文本是按钮直接子节点，不再包在第二个 span 里）。160 项测试全绿。两 profile 已刷，桌面端重启生效。**该改版被用户否决：布局与交互本不该动，v0.9.11 恢复原结构，只换掉自绘圆点。此条保留作版本史。**

## 修订记录（2026-11-01，v0.9.9）

用户三点要求：图片不得与文字同行（混排要拆出来前后空行）、图片渲染成与其他围栏同款外框、右上角加「复制」按钮把图片放进剪贴板。实现：`rewritePathImages` 升级为拆段语义——重写移到 `upgradeText` 之前对整文本执行；顶层段落内裸/code 路径重写为标准图片语法并用空行拆成独立段落（拆段只 blank 仍有内容的一侧，幂等），**模型写的标准正文图片同样拆段**；list/table 子树跳过（拆开会破坏容器）、blockquote 内重写不拆段。新增 `matchImage` matcher：纯图片段落（可选前后空白 text + 单 image）升格为 `ImageSegment { url, alt, source }`，`ImageView` 渲染——`.dshr-fence` 同款外框、图片 max-height 360 居中、右上角「复制」按钮（`img` + canvas 光栅化为 PNG 经 `navigator.clipboard.write` 写剪贴板，跨域污染/超大图/宿主拒绝时按钮显示「复制失败」）、目标不可解析或 onError 时显示「图片无法预览 · 原路径」；错误边界回退仍是 source 原文走平台 MarkdownText。locale 新增 imageCopy/imageCopied/imageCopyFailed/imagePreviewFailed（zh/en），RichChrome 透传。行为变更：顶层标准图片不再走平台 MarkdownText 的 pathImages（改由 ImageView 自行 resolve，HTTP(S) 直用、绝对本地路径走 file 路由）；列表项内图片仍走平台渲染。build.test 的图片词汇断言随行为更新（列表项 body 保留 pathImages 断言，顶层图片断言升级为「不再经过 MarkdownText」）。测试 154 → 160 项全绿。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-11-01，v0.9.8）

用户需求：模型引用本地生图文件时不一定写标准 `![alt](path)`（persona 教过），常见写偏是**裸路径**与**反引号包裹的路径**两种形态，渲染层要兜底。新增 `src/rules/path-images.ts` 的 `rewritePathImages`：native 段落文本先经 mdast 解析，对每个 paragraph 的直接 text/inlineCode 子节点做匹配——inlineCode 整值是绝对路径 + 图片扩展名（png/jpg/jpeg/gif/webp/bmp/svg/ico/avif）即整节点重写；text 内用带前后断言的正则匹配裸路径（绝对路径、无空白、扩展名收尾，`x.pngx`/`y.png.tar`/URL/相对路径均不命中）；替换为 `![路径](<路径>)`（反斜杠双写防 CommonMark 消耗，尖括号 dest 容忍空格，alt 即原路径）。重写只发生在 native 段的 `text`，段 `source` 保持原文（错误边界回退仍显示原始形态）。落点复用平台两级回退：resolve 失败 → alt 纯文本；文件 404 → onError → alt 纯文本——"图片不存在 fallback 到原始显示"由平台既有行为直接给出。标题、表格、代码围栏、链接与图片语法内的路径不重写（避免二次包裹与语法破坏）；无图片后缀的文本经预检直接原样返回，零解析开销。接入 `RichMarkdownText` 的 upgradeText 后 map（含 catch 分支）。测试 138 → 154 项全绿（新增 `test/path-images.test.mjs` 16 项）。两 profile 已刷。

## 修订记录（2026-10-27，v0.9.7）

用户偏好 Google Noto Sans CJK（手机同款）：client 半边通过 `ctx.theme.overrideTokens('dsh-rich-render:font', ...)` 把 `--dsw-font-family` 与 `--dsw-font-family-brand` 覆盖为 `'Noto Sans SC', 'Noto Sans CJK SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`（light/dark 同值）；只改 UI 正文字体，`--ds-font-family-code` 不动。本机已装有 Noto Sans SC（Regular/Medium/Bold）与 Noto Sans CJK SC，无需下载或安装。字体随富渲染插件启用/停用；禁用插件即回系统字体。build.test 的 client stub 补 `theme` 并断言覆盖层。138 项测试仍绿。两 profile 已刷，桌面端重启生效。（0.9.12 已改为系统 UI 字体栈 + Fira Code，见上。）

## 修订记录（2026-10-27，v0.9.6）

用户要求所有围栏的分行严格解析、不必空一行：新增 `src/rules/strict-lines.ts`，在围栏正文交给 `MarkdownText` 前，把代码围栏、缩进代码、表格行、标题/列表/引用等块边界之外的软换行转成行尾双空格硬换行（幂等，已有硬换行不重复）；接入 stack box、tab 页、timeline/todo 说明、prototype-choices 展示区。空行仍是段落分隔；mindmap 节点与 tree 名称仍是一行一条。persona 总则与 stack 节同步改为「单个换行即另起一行，不需要空行」；该规则取代 v0.5.1 的「连续行同段」。新增 `test/strict-lines.test.mjs`（128 → 138 项）。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-10-27，v0.9.5）

用户反馈 tab 控件观感差：标签 12px 过小、页内容用 `compact` 变淡变小、整体挤在一起且没有切换感；并要求所有围栏环境有统一的不明显外框。参照经典线型 tab（Ant Design line / Material underline tabs）重做：标签按内容宽度排布、`flex: 1 0 auto` 均分剩余宽度铺满整行（两端对齐；标签过长/过多时横向滚动，不截断，13px/20px）、底部一条 `border-l1` 浅分隔线 + 选中项 2px 主色下划线（左右各留 9px）、未选中 `label-secondary`/选中 `label-primary`+600；页内容恢复默认 `MarkdownText`（与普通段落同字号同色）。新增共享 `.dshr-fence`（1px `border-l2` + 10px 圆角）套在全部显式围栏根节点上：stack 原外框迁入该类，checklist/tree/mpl 的 `border-l1` 与旧圆角移除，mindmap 内层滚动框边框并入外框，timeline/tab/prototype-choices 补内边距。128 项测试仍绿；两 profile 已刷，桌面端重启生效。

## 修订记录（2026-10-27，v0.9.4）

用户要求的 stack 排版规则（明确不扩展 `[]` 语法）：自动按内容长度对齐——box 内可见文字（`stripInline` 去 inline 标记、忽略空白）少于 10 个字符整体居中，否则左对齐。实现为纯函数 `src/rules/stack-align.ts` 的 `stackAlign`，`StackView` 把结果写进 box 的 inline `text-align`；不解析任何新标记，persona 不变。新增 `test/stack-align.test.mjs` 覆盖 9/10 边界、粗体/代码/链接/图片语法不计数、空白不计数、空框居中。两 profile 已刷，桌面端重启生效。

## 修订记录（2026-10-27，v0.9.3）

用户纠正 v0.9.2 方向反了：246 级浅灰是**内部每个方块**的默认色，整块 stack 应为透明。改为：`.dshr-stack` 去掉底色，只留 1px `border-l2` 外框 + 10px padding/圆角；`.dshr-stack-box` 默认 `--dsw-static-neutral-100`（rgb(245,245,245)）、无边框、8px 圆角，层间 10px 间隙；`[颜色]` 显式填充仍优先。深色主题方块用 `bg-layer-2`。124 项测试仍绿。web profile 已刷新并实测：容器背景 `rgba(0, 0, 0, 0)`、外框 `1px rgba(0,0,0,0.1)`、方块 `rgb(245,245,245)` 且 `border-width: 0`。desktop 副本已同步，重启桌面端生效。

## 修订记录（2026-10-27，v0.9.2）

用户反馈 stack 在亮色主题下看不出结构：每个方块各自 1px `border-l1`（≈4% 黑）几乎不可见，且方块与页面同为白色。本次先按「灰底画布 + 白卡片」改了一版（容器加浅灰底、方块改白底）——**方向反了**，用户随即纠正，最终形态见 v0.9.3。保留此条仅作版本史；其中「不用 `bg-base`」的实测依据仍有效：平台把消息区底色设为半透明白 `rgba(255,255,255,0.5)`，方块若跟随它会与页面同色。

## 修订记录（2026-10-26，v0.9.1）

persona 追加用户定制的收尾规则（富渲染段落末尾）：不要以「需要的话，我可以……」这类收尾结束对话；确实想提供后续帮助时，用 `prototype-choices` 列出至少两项可以做的事、每项写清会做什么，而不是空泛的一句话承诺。仅 persona 改动，persona 测试 4/4 仍绿。两 profile 已刷 0.9.1（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.9.0）

用户提出的新围栏：`prototype-choices` 方案示意——选择区（竖排单选项，radio 语义 `role=radio`，选中=主色圆点+加粗，参考用户给的单选+预览设计图）+ 展示区（描边圆角面板）。语法复用 tab 文法（`@选项名` 行开选项、内层围栏保持字面、2–30 项、标签 ≤60 字），外加可选标题块（首个 @ 前允许单个标题/段落，多块回退）。关键设计：展示区内容走**完整升格管线**（`ChoicesView` 内嵌 `RichMarkdownText`，组件循环引用仅渲染期解引用）——示意里的围栏渲染成真实组件、代码块就是代码、文字就是文字，「任意形式示意」由此成立；非选中项不渲染。失败回退围栏正文。persona 新增节 + 总则/「选择」路由。测试 121 → 124 全绿（解析/走查/渲染三层，渲染断言含内层 stack 真渲染与非选中项不渲染）。两 profile 已刷 0.9.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.8.1）

用户给定目标图，表格改极简样式：去外边框/圆角容器、去表头底色、去竖线，只保留水平分隔线（表头下 + 行间，最浅 border-l1，末行无底线），表头无背景 700 字重，单元格垂直居中、内边距放宽（th 12/16/10、td 11/16）。全部颜色走 dsw 令牌（亮色下即目标图的白底浅灰线）。列对齐仍尊重 GFM 声明（`---:` 右对齐等）。样式改动无行为变化，121 项测试仍绿。两 profile 已刷 0.8.1（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.8.0）

用户定案：入口图标系统整体退役——关键词命中极少，绝大多数条目落在编号兜底上，系统不产生价值（v0.7.2 彩色被否决、v0.7.3 中性版仍觉得怪）。移除范围：卡片组的图标位（卡片变为标题+正文）、文字为主表格的前置图标列（表格不再有图标列）、`EntryIcon`/关键词表 `iconFor`/`wantsIconColumn`/`CardSpec.icon`/`TableSegment.iconColumn` 及对应样式与测试。保留：`icons.ts` 的 Lucide 路径集（callout 分型图标仍在用）、tree 围栏的 Material 图标（独立体系）。测试 122 → 121 全绿。两 profile 已刷 0.8.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.7.3）

用户否决 v0.7.2 的 bold-pop 五色轮换（太花哨）。改为中性令牌版：保留满铺圆底头像形态，颜色全部走应用 dsw 主题令牌——圆底 `--dsw-alias-interactive-bg-hover`、数字 `--dsw-alias-label-secondary`、字重 600（Zendesk Garden 中性头像同款思路：token 驱动、主题自适应），样式移入 stylesheet 的 `.dshr-ordinal-icon` 规则。亮暗主题下都是安静的灰底灰字，与周边 UI 同质感。122 项测试仍绿，两 profile 已刷 0.7.3。

## 修订记录（2026-10-26，v0.7.2）

用户反馈编号徽章太丑，要求换社区公认设计、不自行绘制。调研结论：编号/首字母占位徽章的主流设计语言是**实色圆底 + 白色居中粗体字**的初始头像（DiceBear Initials（CC0 1.0）、MUI Avatar、shadcn Avatar fallback、Zendesk Garden 全用同一套）。采纳 DiceBear Initials 设计 + 其官方预置调色板 **bold-pop**（`#ff5d8f` / `#ffb703` / `#43aa8b` / `#4d96ff` / `#b57bff` 五色按序号轮换，预置出自 dicebear 仓库 `apps/docs/.vitepress/theme/presets/initials.json`），`EntryIcon` 的 `OrdinalIcon` 从描边圆圈改为满铺实色圆 + 白色粗体数字（700），与 tree 的 Material 彩色图标观感一致。行为不变（仍按 index 编号，`data-ordinal` 保留，测试无需改）。122 项测试仍绿。两 profile 已刷 0.7.2（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.7.1）

围栏嵌套定案：需要支持，且大部分本就支持——`tab` 页内容是完整 Markdown（解析器本就跟踪内层 ```/~~~，@ 不被切页），`timeline`/`todo`/`stack` 的说明区也照常渲染缩进代码块；唯一前提是 **CommonMark 规则：内容含 ``` 围栏时外层必须用四个反引号**（````tab），三个反引号会被 micromark 在内层围栏处截断（平台层行为，实测确认，碎成 native 残段）。补齐两处：persona 总则加一句「围栏内容里包含代码围栏时，外层围栏用四个反引号书写」（标准语法教学，非错误形态）；`parseStackFence` 加内层围栏容忍——顶格 ```/~~~ 内的所有行视为 box 内容（此前顶格内层围栏会炸整个 stack，缩进的本来就支持），与 tab 同款跟踪。测试 121 → 122 全绿（4 反引号 tab 嵌套 + stack 顶格内层围栏两用例）。两 profile 已刷 0.7.1（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.7.0）

用户需求：tree 环境图标对齐 vscode-material-icon-theme。做法：浅克隆其仓库（留在 `.local-deploy/material-icon-theme-src/`，11MB），用 dsh 检出的 tsx 直接运行其 fileIcons/folderIcons 清单源码拿解析后的关联；`extract-material-icons.mjs` 策展常用目标（120 扩展名 / 58 特殊名 / 54 文件夹名），读 icons/*.svg 内联为填充路径，合成默认 file/folder/folder-open（其仓库不含这三个文件，path 与默认色 #90a4ae 取自其生成器源码），特殊文件夹的 open 变体按其 build 管线同款方式合成（换 folder 体 d 为规范 open 路径）；渐变图标（14 枚）与其关联一并剔除。产出 `src/rules/material-icons.generated.ts`（生成文件头注明来源与 commit），`tree-icons.ts` 重写为 material 解析器（全名 → 去扩展名 → 扩展名 → 通用文档；文件夹表 + open 变体 + 默认对兜底），TreeView 换 16×16 彩色填充渲染。测试 119 → 121 全绿（tree-icons 测试重写为 material 断言）。client bundle 618KB（+90KB 图标数据）。两 profile 已刷 0.7.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.6.0）

用户提出的新围栏：`tab` 多页标签——每个标签一行 `@标签名`（非缩进、内层代码围栏里的 `@` 不算），其后到下一个 `@` 的内容是该标签的 Markdown；2–30 个标签、标签纯文本 ≤60 字（stripInline 后）；首标签前出现非空行整体回退（不静默丢内容），失败回退形态为围栏正文。视图复用 dual 页签的按钮语法（`dshr-tabs-*` 新类，左对齐 + 横向滚动），仅渲染选中页，选中态组件本地、默认第一页。动机：收纳「标签 + 对应内容」型条目（表达框架/命令速查/参数说明——即那次口语训练会话里 8 项粗体标签无序列表的形态），进一步减少无序列表使用；persona 新增 `### tab` 节、总则枚举与「选择」路由。测试 116 → 119 全绿（解析/走查/渲染三层，含内层 `@property` 不切页断言）。两 profile 已刷 0.6.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-26，v0.5.1）

用户定案：stack 框内内容按标准 Markdown 解析（连续行同段、空行分段），渲染器不做换行保留——此前 persona 里「换行保留」的说法与实际渲染不符，已改为「连续行同段、空行分段」；stack 示例改为「标题行、空行、正文段」的形态（旧示例三行连写，教出的形状会把粗体标题并进正文段落）。仅 persona 改动，无代码变更，116 项测试仍绿。两 profile 已刷 0.5.1（运行中的桌面端重启后生效）。

## 围栏解析兜底原则（v0.5.0 起）

用户定策（2026-10-25）：解析层尽可能为模型的写偏兜底——模型会犯的错、理解不一样的地方，静默纳入解析；**persona 只教标准形态，不告诉模型错误形态长什么样**。用户负责收集真实会话里围栏写偏的案例，逐版本增量加容忍。原则约束：容忍不得静默丢弃内容（拍平、折入、剥标记可以，删字不行）；修 `normalizeFill` 这类工具时警惕基准串变化（0.5.0 曾因去 `#` 后索引未平移引入 off-by-one，测试当场拦下）。

v0.5.0 一次纳入的高置信度容忍（README 记给维护者，模型不可见）：

| 围栏 | 容忍的写偏 |
|---|---|
| timeline | 标题连排形态（0.4.1 已有）；更深的标题折入当前阶段正文而不是整栏失败；标题 run 深度取「≥2 个标题的最浅深度」 |
| stack | 层间连接线（`-->`、`→`、`↓`、`|`、纯横线等）整行忽略；box 头尾点可省（`1` / `1.1` 等价 `1.` / `1.1.`，且修正了旧正则把 `1.1 内容` 误读成第 1 层内容「1 内容」的隐患）；hex 填充色可省 `#` |
| mindmap | 有序列表等价无序列表；任务勾选标记剥除当普通节点；单个前置段落收作根（「主题」+ 分支列表 → 一棵树） |
| tree | 有序列表等价；任务勾选剥除 |
| todo | 嵌套任务列表按文档序拍平（父项后跟子项）；混入非任务项仍整体回退 |

测试 115 → 116 全绿。两 profile 已刷 0.5.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-25，v0.4.1）

实测驱动（标准模式会话 session-278538f0）：模型在 `timeline` 围栏里自发写了「同深度标题连排」形态（`### 阶段名` + 说明段落，persona 已注入仍写偏），v0.3.0 只接受列表形态导致整栏静默回退成普通标题。修复：`parseTimelineFence` 接受两种形态——列表形态不变；标题形态为围栏内 ≥2 个同深度标题（标题=阶段名、句尾标点剥除，其后到下一个标题的块=说明），紧邻 run 之前的一个段落或更浅标题收养为时间线标题，混合深度/多块前导/单项仍整栏回退，条目 2..100 与列表形态同界。persona timeline 节补「同深度标题连排」一句和对应示例。测试 113 → 115 全绿（真实会话语料回归 + 标题收养/拒绝用例；真实消息 16 段中该围栏现解析为 timeline）。两 profile 已刷 0.4.1（运行中的桌面端重启后生效）。分析副产品 `tmp-analysis/` 已清理。

## 修订记录（2026-10-25，v0.4.0）

用户需求：新增 callout 语法，参考 GitHub 标准。实现 GitHub Alerts：引用块首行单独写 `[!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`（大小写不敏感，标准写法为大写）即分型；标记行从正文剔除。分型渲染：GitHub 配色（note #0969da / tip #1a7f37 / important #8250df / warning #9a6700 / caution #cf222e）做左边框 + `color-mix` 8% 底色，图标用 Lucide 描边集新增的 info / message-circle / triangle-alert / octagon-alert（tip 复用既有 lightbulb），标题走 locale（zh：注意/提示/重要/警告/危险；en：GitHub 原词），经 RichChrome 新增 `calloutTitles` 传递。普通引用（无标记/标记不在首行/标记不独占一行）维持原灰色引用框，`type` 为 undefined。顺带修正一个既有瑕疵：引用多行时 mdast 段落切片的续行带 `> ` 前缀，此前会漏进 body 渲染成嵌套引用——`matchCallout` 现统一逐行去标记（嵌套引用子块被拍平为正文，属可接受边缘行为）。persona 新增 `### callout 标注` 节并更新「选择」路由。测试 110 → 113 全绿（标记解析正/反用例 + 渲染桩断言分型 class/标题/图标位）。两 profile 已刷 0.4.0（运行中的桌面端重启后生效）。

## 修订记录（2026-10-25，v0.3.1）

用户需求：markdown 语法显示图片。现状澄清与补齐：平台 `MarkdownText` 本就渲染 `![alt](url)`——绝对 HTTP(S) 直渲，绝对本地路径经 `pathImages` 改写为 `/api/file` 鉴权路由（v0.1.0 起原生正文段落即生效；相对路径不支持，与平台行为一致，解析失败回退 alt 文本）。缺口在升格组件的 body：卡片正文、时间线阶段说明、callout、stack 框内容、清单项说明、思考行调 `MarkdownText` 时没传 `pathImages`，本地路径图片退化为 alt 文本。v0.3.1 把模块级 `pathImages` 常量传入这六处（`markdown-fallback.ts` 既有导出，恒定身份不破 memo）；标题类字段（卡片标题、表头、阶段名、清单项标题等 InlineMarkdown 字段）仍只出 alt 文本，属设计。persona 总则补一句：现成图片用标准图片语法（本地写绝对路径）、现算图用表格自动图或 matplotlib。测试 109 → 110 全绿（新增 native + card body 的 pathImages 传递断言，含 resolver 实测）。两 profile 已刷 0.3.1（运行中的桌面端重启后生效）。

## 修订记录（2026-10-25，v0.3.0）

用户决定：删除隐式 timeline 检测，改为显式 `timeline` 围栏。实现：`upgrade.ts` 删除 `matchTimelineHeadings`（≥3 相位标题连排）与 `matchTimelineList`（≥3 相位标题列表项）及 `isPhaseLabel`，`matchCards` 不再为时间线让位（相位标题有序列表随 H2/H3 进卡片组）；`fence.ts` 新增 `parseTimelineFence`（可选标题块 + 扁平有序/无序列表，条目拆分与 `todo` 围栏共用新抽的 `entryTitleBody`，2..100 项，嵌套/任务项/失败回退围栏正文）；`TimelineView` 与客户端零改动。persona 新增 `### timeline` 节并更新总则、「选择」路由。测试 108 → 109 全绿（flow 的隐式形态测试改为退役断言 + 围栏正向/回退用例，golden 与 build 的 TeX 语料改用围栏）。测试期间 build.test 已执行真实构建，lib/ 与源同步；web、desktop 两 profile 已 remove+add 刷新至 0.3.0（运行中的桌面端重启后生效）。
