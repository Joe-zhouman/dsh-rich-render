# 安装 dsh-rich-render

这是 dsh 的 profile bundle，装进 web 或 desktop profile 后重启生效。预构建的 `lib/` 随仓库提交，从 git 安装不需要自己构建；matplotlib 围栏默认关闭，需要时在 profile 补丁里打开。

## 前置条件

- 可用的 dsh 运行时：源码检出（`pnpm dsh …`）或安装版 DeepSeek Harness 桌面应用，Node `^22.19 || >=24`
- 机器能访问 github.com（git 安装源直连，不经 npm registry）
- 客户端半区按 dsh 0.1.7（2026-10）的客户端契约实现；dsh 大版本升级后若渲染异常，见 README「dsh 升级检查点」

## 桌面端（安装版应用）

1. 打开 设置 → 插件 → 添加插件。
2. 填 git 地址 `https://github.com/Joe-zhouman/dsh-rich-render.git`，确认安装。
3. 装完在插件行点「立即启用」。安装本身默认启用；这一步只用于确认它已出现在 `dsh.profile.bundles` 里。
4. 完全退出应用（含托盘）再重开。profile 补丁只在启动时加载。

桌面 profile 由 Electron 独占，`dsh plugin` CLI 会拒绝它；应用内插件面板是桌面端唯一入口。

## web profile（CLI）

```sh
dsh plugin --profile web add "github:Joe-zhouman/dsh-rich-render"
# 等价写法：git+https://github.com/Joe-zhouman/dsh-rich-render.git
```

安装默认把 bundle 追加到 profile `package.json` 的 `dsh.profile.bundles`。重启 web 服务后生效：

```sh
# 按本机部署方式重启，例如
start-web.cmd        # Windows 部署机
```

不用 `dsh plugin` 而手工装时，改三处再在 profile 目录跑 `pnpm install`：

```json
{
  "dependencies": { "dsh-rich-render": "github:Joe-zhouman/dsh-rich-render" },
  "dsh": { "profile": { "bundles": [ "…", "dsh-rich-render" ] } }
}
```

`bundles` 的顺序决定配置层叠顺序，放在已有插件之后即可。

## 本地开发（file: 依赖）

改源码、看效果时用 `file:` 依赖，源码目录不必复制：

```sh
# profile 目录（web 或 desktop）
pnpm add "dsh-rich-render@file:/path/to/rich-render-plugin"
```

同时把 `dsh-rich-render` 追加到 profile `package.json` 的 `dsh.profile.bundles`。desktop profile 不接受 CLI，需在应用退出后于 profile 目录直跑 pnpm。

构建（须在 dsh 检出内，tsdown 与 schemastery 取自 `../../`）：

```sh
pnpm install
pnpm run build     # tsdown 双 pass：lib/index.js（host）+ lib/client.js（CJS factory）
pnpm test          # 138 项
```

`lib/` 是随仓库提交的产物，profile 只运行 `lib/`、不读 `src/`。file: 依赖按 spec 判等、不比内容，所以改完源码必须重装：

```sh
pnpm remove dsh-rich-render && pnpm add "dsh-rich-render@file:/path/to/rich-render-plugin"
```

然后重启服务或应用。

## 可选：打开 matplotlib 围栏

`Config.matplotlib.enabled` 默认 `false`，此时 matplotlib 围栏（围栏语言标 `matplotlib`）退化成普通代码块，其余渲染不受影响。打开它需要在 profile 的 `cordis.patch.yml` 追加：

```yaml
- id: rich-render
  config:
    matplotlib:
      enabled: true
      python: D:/path/to/python.exe   # 需能 import matplotlib 与 numpy；默认 "python"
```

重启后宿主在启动时探测一次解释器与库版本，并把这些版本写进 persona 的环境段落；换环境要重启。

脚本由宿主执行，落在插件自己的 `.cache/` 目录，以 `read-only` 沙箱运行——cell 全程没有可写路径，也不该读工作区文件或联网；数据必须内嵌在代码里。执行失败或环境缺失时该围栏显示代码页，不会白屏。

## 验证安装

1. 重启后打开 web/桌面页面，DevTools → Network 里应有 `dsh-rich-render/client.js` 请求且为 200。
2. 发一条测试消息。任一情况成立即说明渲染已接管：
   - 表格显示为「图表 / 表格 / 下载图片」三栏；
   - 回复里写一个 mindmap 围栏（围栏语言标 `mindmap`，内容是嵌套列表），渲染成节点树；
   - H2 + 紧跟有序列表渲染成卡片组。
3. 服务日志（web 部署机的 `logs/server.err.log`）没有 `did not activate` 或 entry 报错。

命令行快速确认 bundle 已被服务端加载（需要登录 token，浏览器能打开的页面 URL 即可）：

```sh
curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3080/plugins/??dsh-rich-render/client.js&rev=<页面里的 rev>"
```

## 卸载

- 桌面端：设置 → 插件，停用或移除后重启。
- web：`dsh plugin --profile web remove dsh-rich-render`，然后重启服务。
- 手工安装的：从 profile `package.json` 的 dependencies 与 `dsh.profile.bundles` 删掉 `dsh-rich-render`，profile 目录跑 `pnpm install`。

移除后助手消息回到平台原生 Markdown 渲染，persona 注入同时消失，工作区文件不受影响。

## 常见问题

**安装时出现 `@deepseek-ai/schemastery` 的 peer 警告。** 正常，不要另外安装。dsh 运行时自带这个包，profile 的 `pnpm-workspace.yaml` 设了 `autoInstallPeers: false`，安装器会保留警告但继续完成。

**装完页面没变化。** 依次确认：`dsh-rich-render` 在 `dsh.profile.bundles` 里；服务确实重启过（桌面端要完全退出含托盘）；`node_modules/dsh-rich-render/lib/client.js` 存在；日志无激活错误。

**表格没有变成图表。** 图表按固定决策树判定：含单位、百分号、千分位或货币符号的单元格算解析失败；数据行超过 550 行跳过作图；列数/数值分布不满足条件时就是表格。这是设计行为，不是安装问题。

**matplotlib 围栏还是代码块。** 检查 profile 补丁里的 `- id: rich-render` 配置块是否生效（该 id 与插件自带补丁的插入 id 一致），以及配置的 python 能否 `import matplotlib, numpy`。

**模型从不写围栏，但界面渲染正常。** 插件通过 `ctx.systemPrompt.section()` 注入 persona，只在宿主装配系统提示词时生效。若部署的预设以 `complete: true` 整体替换系统提示词（本项目自用的 qa/chat 预设就是如此），预设会话里模型看不到围栏语法；换标准模式会话即可，或把插件段并入预设。

**dsh 升级后渲染错位或报错。** 客户端半区复刻了 dsh 的内部组件契约，dsh 升级可能使其漂移。对照 README「dsh 升级检查点」逐项核对，或先停用插件回退到原生渲染。
