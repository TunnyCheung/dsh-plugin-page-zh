# dsh-plugin-page-zh · the agent harness 插件页中文化（DSH 专用）

> **一句话**：把 the agent harness（DSH）**设置 → 插件** 页里每个插件的**名称和简介**显示成中文，人人一眼看懂每个插件是干什么的。
> 完全离线、零网络、零付费；**不改任何插件包、不影响插件升级**；只在本地渲染时替换显示文本，重启即恢复原样。

**仓库**：<https://github.com/TunnyCheung/dsh-plugin-page-zh>　·　**发布版**：[v3.2.0](https://github.com/TunnyCheung/dsh-plugin-page-zh/releases/tag/v3.2.0)　·　**许可**：MIT

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![tests](https://img.shields.io/badge/tests-32%20passed-brightgreen.svg)](test/e2e.cjs)
[![CI](https://github.com/TunnyCheung/dsh-plugin-page-zh/actions/workflows/ci.yml/badge.svg)](https://github.com/TunnyCheung/dsh-plugin-page-zh/actions/workflows/ci.yml)

---

## 这是什么

DSH（the agent harness）的「设置 → 插件」页会列出你装的每个插件，但很多第三方插件的**名称和简介是英文**，看不懂、不知道是干嘛的。
**dsh-plugin-page-zh** 在**你本机**把这些名称和简介显示成中文，让你一眼看清每个插件的作用——不懂英文也能管理好插件。

- 🎯 **只做一件事**：让 DSH 插件页的名称/简介说中文。
- 🏷️ **「英文名 · 中文」并列**：标题显示为 `dsh-jev-decision-model · Jev 决策评估模型`，一眼看到英文原名又知道中文意思；简介直接显示中文。
- 🧷 **覆盖无自带语言包的插件**：连 `dsh-jev-decision-model` 这种「纯 package.json、没有 locale」的插件，名称/简介也能中文化。
- 🔒 **完全离线**：内置本地词典，不联网、不调用任何翻译 API、不花一分钱。
- 🧩 **不改插件包**：只在渲染出口运行时替换显示文本，别人插件的文件一字未动。
- ⬆️ **不影响升级**：插件照常升级；翻译只发生在你本机内存里。
- ↩️ **可逆无残留**：停用/卸载本插件立刻恢复英文原文；重启即失效，绝不写回任何文件。
- 🥇 **官方中文优先**：插件若自带 `locale/zh.json` 中文，直接用它；没有才用本地词典。

---

## 特性一览

| 特性 | 说明 |
|---|---|
| 离线词典 | 46 条内置译文，覆盖常见插件；可自行扩充 |
| 双语并列标题 | 标题「英文原名 · 中文意思」并列（可按插件 `style` 细化：`zh-only` 只中文 / `bilingual` 并列） |
| 四级优先级 | 用户覆盖层 → 官方 `locale/zh.json` 中文 → 本地词典（按包名/原文/别名）→ 英文原文 |
| 用户本地覆盖层 | `overrides.json` 里写自己的译名，最高优先级，不随词典升级被覆盖 |
| 无语言包插件支持 | 纯 package.json、无 locale 的插件（如 dsh-jev-decision-model）同样中文化 |
| 未覆盖诊断 | 启动时打印「词典没收录的插件名」，提示你哪些还能补译 |
| 一键增词 | `node build.cjs --add 包名 中文名 [简介] [--style=…]` 自动补格式并校验 |
| 多语言对象兼容 | 插件自带 `{en, zh, …}` 时按当前语言取值，官方无中文则本地词典覆盖 |
| 安全兜底 | 全程 `try/catch`；词典键防原型污染；任何异常都退回原始逻辑 |
| 可逆 | 通过 `ctx.effect` cleanup 还原原始方法，停用即恢复 |
| 测试 + CI | 32 条离线端到端测试；GitHub Actions 多 Node 版本 + 词典一致性校验 |

---

## 安装（小白 3 步）

> 前提：已装好并能在本机运行 the agent harness（DSH）桌面版。

### 方式 A：从本地目录安装（推荐）

1. 克隆或下载本仓库到固定目录：
   ```bash
   git clone https://github.com/TunnyCheung/dsh-plugin-page-zh.git
   ```
   （或直接下载 ZIP 解压到例如 `D:\plugins\dsh-plugin-page-zh`）
2. 在 DSH 里安装本地插件（Agent 工具 `plugin_manager install_bundle`）：
   ```
   插件管理 → 安装本地 bundle → 选择这个目录
   ```
   等价命令：`plugin_manager install_bundle target=<该目录绝对路径>`
3. 安装成功后，**刷新前端**让它生效（见下）。

### 方式 B：让 DSH 的 AI 助手帮你装

把这句话丢给你的 DSH 会话：

> 帮我安装本地插件：`D:\plugins\dsh-plugin-page-zh`（仓库 https://github.com/TunnyCheung/dsh-plugin-page-zh），装好后告诉我怎么刷新。

---

## 让它生效（关键一步）

本插件是**前端（渲染进程）插件**，只在**前端窗口加载时**载入。若在 DSH 已开着时安装，需要重载一次前端（**不会丢掉当前对话**）：

- **仅刷新前端（推荐）**：按 **F12**（或菜单「开发者工具」）打开控制台执行 `location.reload()`；或直接 **Ctrl + R**。
- **或**：菜单「重启应用」。

刷新后打开 **设置 → 插件**，名称/简介即为中文。

> 确认生效：F12 控制台会看到 `[i18n-local] resolveText patched OK; ...`。

---

## 原理（想了解再看）

DSH 插件页渲染每张卡片的标题/简介时，都会调用前端的 `ctx.locale.resolveText(text)`。
本插件在 `apply(ctx)` 里把 `ctx.locale.resolveText` 包一层，按优先级翻译后返回：

| 优先级 | 来源 | 说明 |
|---|---|---|
| 1 | **用户覆盖层** | `overrides.json` 里的自定义译名，最高优先级 |
| 2 | **官方中文** | 插件自带 `locale/zh.json` 且确有中文 → 直接用 |
| 3 | **本地词典·按包名** | `dictionary.json` 的 `byName`（含可选 `aliases` 英文标题） |
| 4 | **本地词典·按原文** | `dictionary.json` 的 `bySource` |
| 5 | **英文原文** | 都没有则原样显示 |

- 纯字符串（大多数第三方插件）→ 查词典。
- 语言对象 `{en, zh, …}` → 官方有中文用官方，否则用本地词典覆盖。
- 全程 `try/catch` 兜底，异常退回原始逻辑，**绝不破坏正常渲染**。
- 停用时 `ctx.effect` cleanup 还原，保证可逆。

---

## 兼容性（DSH 升级后仍可用）

插件页这个出口在 DSH 各版本间保持稳定，本插件**只依赖 `ctx.locale.resolveText` 这一个公共接口**，并做了多重防升级设计：

- **不锁 DSH 版本**：只声明宽松的 `engines.node: ">=18"`，**不写 `engines.dsh`、也不写 `@deepseek-ai/dsh*` 的 peerDependencies**。按 DSH 的兼容评估规则，这样任何 DSH 版本都不会把本插件判为「不兼容」而禁用。
- **运行时自愈**：`apply` 整体包 `try/catch`；即便宿主内部 API 变动导致拦截失效，也只会静默退回英文，**绝不拖垮插件页**。
- **服务多路探测**：兼容宿主把 locale 服务改名（`i18n`/`intl`）或搬到 `ctx.services.locale` / `ctx.get('locale')`。
- **幂等 + 精简依赖**：重复加载不叠加；`inject` 只声明 `locale`。
- **语法保守**：不使用可选链 `?.`、空值合并 `??`，兼容旧渲染器与 Node。

> 若未来某次 DSH 大改确实更换了插件页的渲染出口（极少见），最多是「停止翻译、恢复英文」，不会报错、不影响你正常使用插件。

---

## 目录结构

```
dsh-plugin-page-zh/
├─ package.json           # 插件清单（dsh.bundle.patch + dsh.client，含仓库/主页/issue 地址）
├─ cordis.patch.yml       # 把本 bundle 注册进 DSH loader
├─ index.js               # Host 半：空实现（翻译全在前端）
├─ client.js              # Client 半：拦截 resolveText + 词典（DICT/OVERRIDES 段由 build.cjs 自动生成）
├─ dictionary.json        # ★ 词典数据源（翻译都在这里，改这里！）
├─ dictionary.schema.json # 词典 JSON Schema（编辑器自动提示/校验）
├─ overrides.json.example # 用户本地覆盖层示例（复制为 overrides.json 生效）
├─ build.cjs              # 构建脚本：注入词典 + 覆盖层；--add 一键增词；--check 校验
├─ locale/{en,zh}.json    # 本插件自己在插件页显示的名称/简介
├─ icon.svg               # 图标
├─ test/e2e.cjs           # 离线端到端测试（27 条）
├─ test/e2e-overrides.cjs # 覆盖层 & style 专项测试（5 条）
├─ .github/workflows/ci.yml  # GitHub Actions CI
├─ CONTRIBUTING.md        # 如何贡献翻译
├─ CHANGELOG.md           # 更新日志
└─ README.md
```

---

## 自定义 / 扩充翻译

### 方式一：改词典（推荐，可回馈社区）

所有翻译都在 **[`dictionary.json`](dictionary.json)**（带 [`dictionary.schema.json`](dictionary.schema.json) 自动提示）。改完执行：

```bash
node build.cjs      # 注入到 client.js
node test/e2e.cjs   # 跑测试
```

或一键增词（自动补格式并校验）：

```bash
node build.cjs --add 包名 中文名 [中文简介] [--style=zh-only|bilingual]
# 例：node build.cjs --add my-plugin 我的插件 "这是我的插件" --style=bilingual
```

### 方式二：用户本地覆盖层（不碰词典，个人译名不随升级丢失）

复制 [`overrides.json.example`](overrides.json.example) 为 **`overrides.json`**（该文件已被 `.gitignore` 排除，不会进仓库），写你自己的译名：

```json
{
  "dsh-jev-decision-model": { "title": "我的 Jev 译名", "style": "zh-only" },
  "某个英文原文标题": "我的自定义中文名"
}
```

然后 `node build.cjs` 即可生效。覆盖层**优先级最高**，升级词典时你的个人译名也不会被覆盖。

### 双语形态（style）

每个词典条目或覆盖层条目可用 `style` 字段细化标题形态：

- `"bilingual"`（默认）：标题显示 `英文原名 · 中文意思`
- `"zh-only"`：标题只显示中文

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。欢迎 PR 把新插件的中文补进上游，帮到更多人。

---

## 常见问题

**Q：装了没反应？**
A：前端插件需重载前端窗口才加载。按 F12 后 `location.reload()` 或 Ctrl+R。

**Q：会不会改坏我别的插件？**
A：不会。它只拦截一个渲染函数并在返回时翻译文本，从不写任何文件、不改任何插件包。

**Q：升级 DSH 或插件后会不会失效？**
A：不影响任何插件升级。若 DSH 大版本改了渲染出口，本插件可能需小更新。

**Q：能加我自己的翻译吗？**
A：两种方式：① 改 `dictionary.json` 再 `node build.cjs`（可 PR 回馈社区）；② 用 `overrides.json` 写个人译名（优先级最高、不随升级丢失）。也可用 `node build.cjs --add 包名 中文名` 一键增词。

**Q：支持 Windows / macOS / Linux？**
A：插件纯前端 JS，与平台无关，跟随你的 DSH 桌面端运行。

---

## 相关链接

- 仓库：<https://github.com/TunnyCheung/dsh-plugin-page-zh>
- 发布版：<https://github.com/TunnyCheung/dsh-plugin-page-zh/releases>
- 问题反馈：<https://github.com/TunnyCheung/dsh-plugin-page-zh/issues>

## 许可证

[MIT](LICENSE) © 2026 TunnyCheung
