# dsh-local-rich-render（富渲染插件）

## 仓库信息

本目录是 `dsh-local-rich-render` 的源码仓库（git，`main` 分支，初始提交 v0.9.1，2026-10-26）。

| 项 | 值 |
|---|---|
| 包名 | `dsh-local-rich-render` |
| 版本 | `0.9.3`（`private`，不发布） |
| 类型 | host + client bundle（`dsh.client.platform: web`，自带 `dsh.bundle.patch`） |
| 宿主半区入口 | `lib/index.js`（由 `index.mjs` 构建；预构建产物随仓库提交） |
| 浏览器半区入口 | `lib/client.js`（CJS factory，预构建产物随仓库提交） |
| 运行时资产 | `persona.md`（宿主启动时读一次；宿主人格段落由它生成） |
| 部署机工作副本 | `L:\dsh\.local-deploy\rich-render-plugin\`；`web`/`desktop` 两 profile 以 `file:` 依赖安装 |
| 构建依赖 | dsh 检出的 `node_modules/tsdown` 与 `vendor/schemastery`（`package.json` 脚本与 devDependencies 里的 `../../`），因此本仓库必须位于 dsh 检出内才能构建 |

`lib/` 与 `src/` 必须同一次提交：profile 安装后只运行 `lib/`，不读 `src/`（与 `dsh-local-soul-presets` 同一约定）。`node_modules/`、`.cache/`（matplotlib 探测缓存）忽略。

- 位置：`L:\dsh\.local-deploy\rich-render-plugin\`（包名 `dsh-local-rich-render`，私有，不发布）
- 日期：2026-10-15 首版（v0.1.0）
- 需求：`L:\works\news\docs\reports\dsh富渲染插件需求-v1-2026-10-14.md`（规则集与其 v2 修订：三图表决策树/饼图补充片/表格图标列/思维导图）
- 调研依据：`L:\dsh\docs\superpowers\findings\dsh-client-render-pipeline-seam.md`、`findings-external.md` 的 anyblock 节

## 它做什么

接管助手消息渲染（keyed 槽 `conversation.chat.node` / `assistant-step`），对 settle 后的 markdown 做纯规则升格；流式期间与未命中内容走平台原生 `MarkdownText`。另加 `shell.overlay` 水印层。

升格组件里的模型原文（阶段/卡片标题、表头与单元格、思维导图节点标签）会把其中的 `$...$`、`$$...$$`、`\(...\)`、`\[...\]` 公式段交给平台 `MarkdownText` 排版，其余文字保持字面量；标题开头的 `2. ` 因此不会被误解析成有序列表。

升格规则（自动判定，未命中即原生；显式围栏见下节）：

| 输入 | 升格 |
|---|---|
| H2/H3 + 紧跟有序列表（≥2 项、项首句 ≤30 字） | 卡片组（标题 + 说明，无图标位——入口图标系统 v0.8.0 退役） |
| 表格 | 样式化表格 + 图表切换（可图时默认图表，三栏：图表/表格/下载图片） |
| GFM 任务列表（`- [ ]` / `- [x]`，无序或有序，≥2 项且每项都是任务项） | 清单卡片：标题右侧实时 `x/y 项完成` + 进度条；点复选框即时改状态；紧邻上一块（任意级别标题、普通段落或独立列表）去掉标记后作标题，无上一块时用「检查清单」 |
| 引用块 | callout；首行单独写 GitHub 标注标记（`> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`，大小写不敏感）则渲染分型提示框：GitHub 配色 + 图标 + 本地化标题（注意/提示/重要/警告/危险），标记行不进正文 |
| 水印 | 右下角齿轮进设置：图片（URL/本地文件转 dataURL）、透明度（默认 0.12）、四角、大小；存 localStorage |

已退役的自动判定：多层级无序列表 → 思维导图（v0.2.0，改 `mindmap` 围栏）、阶段/Step/第X步/Phase 序列 → 时间线（v0.3.0，改 `timeline` 围栏）。相位标题有序列表不再让位时间线，随普通规则进卡片组。

清单（GFM 任务列表）的字段与交互：

- 标题取清单紧邻的上一块，不限标题级别：任意 H1~H6、普通段落、独立列表都可以；普通段落压成一行并去掉行尾冒号，独立列表用「；」压成一行。清单不会平白出现，上一块就是它的引子，所以该块会被并进卡片、不再单独渲染。
- 已被其他升格规则消费的上一块不会二次认领（例如紧邻的表格或前一个清单）。
- 每项第一行是标题，续行或空行后的段落是灰色说明；单行 `标题：说明` 按第一个全角冒号拆一次（左半 ≤30 字才拆）。
- 勾选状态从 `[x]` 初始化，点击按钮只改组件本地状态，不写回会话日志；重新加载页面按原文标记恢复。
- 混合列表、单项、嵌套任务列表不升格（保持原生）；任务列表不会被卡片/时间线/思维导图规则抢走，显式任务语法优先。注意 markdown 语义：同一种列表符号、只隔一个空行的两个列表会合并成一个 loose list，因此不会被当成“独立的前置列表”；不同类型（有序/无序）或不同符号才会解析成两个列表。
- 标题与说明里的 `$...$` 继续走平台 MarkdownText 排版，其余文字保持字面量。

表格→图表决策树（行数 2~30 才可图；可图时默认显示图表，tab 为 图表/表格/下载图片；下载把当前图表以 2x PNG 导出，计算样式内联、背景取页面不透明底色，并绘制图例——饼图右侧带数值与百分比，柱/线下方为序列名，柱状序列附总和）：

- 列数 >2：第 2..N 列全数值？第 1 列数值 ⇒ 折线；第 1 列文字 ⇒ 分组柱状；否则表格
- 列数 =2：第 2 列全数值？第 1 列数值 ⇒ 折线；第 1 列文字且总和 ≤1 ⇒ 饼图（**总和 <1 自动补一片「其他」凑满整圆**，弱化样式）；总和 >1 ⇒ 柱状；第 2 列非数值 ⇒ 表格
- 百分号单元格按 1/100 折算（`30%` → 0.3）

## 构建 / 测试 / 安装

```sh
cd L:/dsh/.local-deploy/rich-render-plugin
pnpm install        # 依赖：mdast 解析层 + react 类型（构建期）
pnpm run build      # tsdown 双 pass：lib/index.js（host 空 apply）+ lib/client.js（CJS factory）
pnpm test           # node --test + 类型剥离：124 项（规则/清单/图表决策/golden set/水印配置/构建产物）
```

装机（web/desktop 两 profile 均已装）：profile `package.json` 的 dependencies 写 `dsh-local-rich-render: file:L:/dsh/.local-deploy/rich-render-plugin`，`dsh.profile.bundles` 追加 `dsh-local-rich-render`，profile 目录直跑 `pnpm install`（desktop 拒 `dsh plugin add` CLI）。

**改版刷新**：file: 依赖按 spec 判等，改完必须 `pnpm remove dsh-local-rich-render && pnpm add dsh-local-rich-render@file:L:/dsh/.local-deploy/rich-render-plugin`，再重启 web/桌面端。

## 降级承诺（mermaid 反面）

1. 流式期间纯原生；settle 才升格。
2. 规则引擎纯函数且全 catch：任何异常整段回原生。
3. 每个升格段带精确 source 切片，组件崩溃（局部 ErrorBoundary）只回退该段。
4. 组件级崩溃由槽位退位机制兜底回内置 AssistantNodeView。
5. 水印失败=不可见（grayscale+multiply、pointer-events none）。

## dsh 升级检查点

- diff `packages/client/ui-chat/src/client/chat/AssistantNodeView.tsx`、`AssistantMarkdown.tsx`、`ReasoningRow.tsx`、`contract/slots.ts`、`chat-nodes.ts`，同步 `src/chat-contract.ts` 与复刻组件。
- seed externals 白名单（`packages/client/web/src/platform.ts`）若变动，检查 tsdown.config.mjs 的 MODULE_TABLE_KEYS。
- 已知偏差：`usePresentation` 不可达，折叠思考行恒显摘要预览（内置受工作细节模式门控）。

## 未做 / 观察项（按需求文档禁入清单与 P2）

- 决策模型槽位已留（`upgradeText` 即 decide 面），v1 纯规则。
- 思维导图无缩放/拖拽/折叠（与 anyblock nodes 一致）；有序多级列表不升格。
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
- 不设 Y 列数、类别数、重复标签上限；三栏 tab 可切回表格。现有 README v1 写作「图表/表格/下载图片」，讨论中表述为「表格/图表/下载」；实现时以现有 UI 为准并对齐。
- 性能护栏：>550 数据行跳过图表（不是图表规则，是渲染保护）。
- 可图时默认图表页；表格始终可切回（沿用现有设计）。

### matplotlib（新增第二层）

- 仅支持 `matplotlib` 围栏，不支持 seaborn；persona 仅在检测到 Python + matplotlib + numpy 时注入，并注入三者版本。
- 必须内嵌数据；不读工作区文件、不联网；不要假设 pandas/seaborn；一个 cell 一张图。
- 首次渲染自动执行；缓存 key = 代码 + backend + 主题 + 库版本 + 字体 + DPI；失败结果也缓存，**不设手动重试按钮**；超时/失败显示代码与错误，不重复自动执行。
- UI：三栏 tab `代码 / 图表 / 下载`；成功默认图表页，失败默认代码页；功能关闭或环境缺失时退化为普通 Python 代码块。
- 复杂图、交互图、artifacts、Plotly、kernel、文件交付提示都不在 rich-render 范围；这里是终点。

### persona

- 表格映射规则始终注入：三种形态、全部有值、纯数字、单位写表头、数据行 ≤500、不要承诺一定有图、失败静默回表格。
- matplotlib 段按环境条件注入：只承接表格图表达不了的静态图；内嵌数据同样建议 ≤500 行。
- 不注入文件交付/artifacts/Plotly/kernel 相关提示。

### v2 暂缓

- 主题、配色、日间/夜间适配、字体匹配、图表视觉调优；均留到下一步优化。

## mindmap / stack / tree / todo / timeline / tab / prototype-choices 决策（2026-10-24 已实现并实机验收；timeline 2026-10-25；tab 2026-10-26；prototype-choices 2026-10-26）

### mindmap（显式环境，取代自动升格）

- 围栏 `mindmap`，不提供 `flow` 别名；内容只接受嵌套无序列表；根在围栏内。
- 多个顶层项 = 多个 mindmap（多个根），各自渲染为一棵左→右树，纵向堆叠；这不是错误，不回落。
- persona 里给模型一段左→右 CLI 树预览，例如：

  ```text
       |- CVAE 生成候选
  确定目标热阻区间 --|
       |_ 结构筛选
  ```

  实际组件沿用现有括号连接线；预览只表达方向和层级。

- 横向 scrollbar + 缩放控件（`−` / `100%` / `+`，范围 50%~200%）；缩放是组件本地状态，不写回会话。
- 节点上限 200（总数）；不设最小条目数（至少根 + 1 子节点）。超限、解析失败或内容不是列表时，把围栏内容按普通 Markdown 渲染（列表就显示为 list），静默；插件未启用时仍是代码块。
- 现有自动 mindmap 升格规则退役：普通嵌套 list 不再自动变 mindmap，只有显式 `mindmap` fence 才渲染。
- 实现提示：复用 `MindmapView` 的布局与括号连接线；新增多根渲染、横向滚动、缩放；`upgrade.ts` 的 `matchMindmap` 及对应测试/golden 需同步调整。

### stack（纵向层叠）

- 围栏 `stack`，仅纵向；每个 box 以 `层号.` 或 `层号.层内序号.` 开头，可选颜色；box 头后可直接跟第一行内容，其余内容写在缩进 Markdown 里，下一个 box 头结束当前 box。分支/合并靠层数变化，不画逐节点连线。
- 不画层间箭头：层叠本身表达方向；单层、单方块都不特判。
- 颜色语法：写在编号后，如 `1.[#e8f0fe]`、`2.1.[red]`；方括号内是一个填充色（不是 fill/border 两个值），只控制填充，文字颜色按亮度自动取黑/白；省略用主题 surface。支持命名色、hex、`tab:*`；配色优化后置。
- box 内容按标准 Markdown 渲染（连续行同段、空行分段）；渲染器只做视觉容器（外框/底色/圆角/内边距/等高），不做“第一行标签、第二行标题”这类语义角色推断；模型自行使用粗体、斜体、引用、列表。
- 视觉（v0.9.3）：整块 stack 只画 1px `border-l2` 外框（10px 内边距、10px 圆角），**容器本身透明**；每个 box 默认浅灰底 `--dsw-static-neutral-100`（rgb(245,245,245)）、8px 圆角、**无边框**，层与层之间 10px 间隙；`[颜色]` 显式填充优先于默认灰。深色主题下方块改用 `bg-layer-2` 暗色面。不用 `bg-base`：平台把消息区底色设为半透明白（实测 `rgba(255,255,255,0.5)`），方块跟随它会与页面同色。
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
- 视图：复用 dual 页签按钮语法（`dshr-tabs-bar/-tab/-pane`，样式同 `dshr-dual-tab`、左对齐、横向滚动），`role=tablist/tab/tabpanel`；仅渲染选中页；选中态是组件本地 state（默认第一页），不写回会话。
- persona：按标签分组、点选切换的并列条目用 `tab`，优先于无序列表堆叠（「标签 + 对应内容」型：表达框架、命令速查、参数说明）。

### prototype-choices（方案示意，2026-10-26）

- 围栏 `prototype-choices`，不提供别名；语法 = tab 文法（非缩进 `@选项名` 行开选项，```/~~~ 内层围栏里的 `@` 视为内容；2–30 项、标签纯文本 ≤60 字）+ 可选标题块（首个 `@` 之前恰好一个标题/段落，去尾冒号、≤120 字，多块或代码块整体回退）。
- 视图分两区：选择区为竖排单选项（`role=radiogroup/radio`，选中态 = 主色圆点 + 加粗，hover 有底）；展示区为描边圆角面板。选中项内容走**完整升格管线**（`ChoicesView` 嵌 `RichMarkdownText`）——示意可以是真实渲染的富围栏、代码块或纯文字；仅渲染选中项；选中态组件本地（默认第一项），不写回会话。
- 与 tab 的分工：tab 是内容分组页（正文级紧凑排版），prototype-choices 是方案对比示意（选项 + 直观预览）。

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
