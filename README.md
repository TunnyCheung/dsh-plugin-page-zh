# dsh-plugin-i18n-local · DSH 插件页中文汉化

> 把 DeepSeek Harness（DSH）**设置 → 插件** 页里每个插件的**名称和简介**显示成中文。
> 完全离线、零网络、零付费；**不改任何插件包、不影响插件升级**；只在本地渲染时替换显示文本，重启即恢复原样。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![tests](https://img.shields.io/badge/tests-14%20passed-brightgreen.svg)](test/e2e.cjs)

---

## 它解决什么问题

DSH 的插件页会列出你装的每个插件，但很多第三方插件的**名称和简介是英文**，看不懂、不知道是干嘛的。
这个插件在**本地**把它们的名称/简介翻成中文，让你一眼看清每个插件的作用。

- ✅ **完全离线**：内置本地词典，不联网、不调用任何翻译 API、不花钱。
- ✅ **不改插件包**：只在渲染出口运行时替换显示文本，别人插件的文件一字未动。
- ✅ **不影响升级**：插件照常升级；翻译只发生在你本机内存里。
- ✅ **可逆无残留**：卸载/停用本插件，立刻恢复英文原文；重启即失效，绝不写回任何文件。
- ✅ **官方中文优先**：插件若自带`locale/zh.json`中文，直接用它；没有才用本地词典。

---

## 安装（小白 3 步）

> 前提：你已经装好并能在本机运行 DeepSeek Harness（DSH）桌面版。

### 方式 A：从本地目录安装（推荐，最简单）

1. 把这个仓库放到一个固定目录（例如 `D:\plugins\dsh-plugin-i18n-local`）。
2. 在 DSH 里打开一个能执行命令的会话，让 Agent 帮你安装（或你自己用 DSH 的插件安装能力）：
   ```
   插件管理 → 安装本地 bundle → 选择这个目录
   ```
   命令等价于（DSH Agent 工具）：`plugin_manager install_bundle target=<该目录绝对路径>`。
3. 安装成功后，**刷新前端**让它生效（见下）。

### 方式 B：让 DSH 的 AI 助手帮你装

把这句话丢给你的 DSH 会话即可：

> 帮我安装本地插件：`D:\plugins\dsh-plugin-i18n-local`，装好后告诉我怎么刷新。

---

## 让它生效（关键一步）

插件是**前端（渲染进程）插件**，在**前端窗口加载时**才载入。如果你是在 DSH 已经开着时才装的，需要重载一次前端（不会丢掉当前对话）：

- **仅刷新前端（推荐）**：按 **F12**（或菜单「开发者工具」）打开控制台，执行 `location.reload()`；或直接按 **Ctrl + R**。
- **或**：菜单「重启应用」。

刷新后打开 **设置 → 插件**，插件的名称/简介就是中文了。

> 想确认生效：F12 控制台里会看到 `[i18n-local] resolveText patched OK; ...` 的日志。

---

## 原理（想了解再看）

DSH 插件页渲染每张卡片的标题/简介时，都会调用前端的 `ctx.locale.resolveText(text)`。
本插件在 `apply(ctx)` 里把 `ctx.locale.resolveText` 包一层，按优先级翻译后返回：

| 优先级 | 来源 | 说明 |
|---|---|---|
| 1 | **官方中文** | 插件自带 `locale/zh.json` 且确有中文 → 直接用 |
| 2 | **本地词典·按包名** | `dictionary.json` 的 `byName` |
| 3 | **本地词典·按原文** | `dictionary.json` 的 `bySource` / `aliases` |
| 4 | **英文原文** | 都没有则原样显示 |

- 纯字符串（大多数第三方插件）→ 查词典。
- 语言对象 `{en, zh, …}`（自带多语言）→ 官方有中文用官方，否则用本地词典覆盖。
- 全程 `try/catch` 兜底，任何异常都退回原始逻辑，**绝不破坏正常渲染**。
- 卸载时通过 `ctx.effect` 的 cleanup 还原原始方法，保证可逆。

---

## 目录结构

```
dsh-plugin-i18n-local/
├─ package.json          # 插件清单（dsh.bundle.patch + dsh.client）
├─ cordis.patch.yml      # 把本 bundle 注册进 DSH loader
├─ index.js              # Host 半：空实现（翻译全在前端）
├─ client.js             # Client 半：拦截 resolveText + 词典（核心逻辑，DICT 段自动生成）
├─ dictionary.json       # ★ 词典数据源（翻译都在这里，改这里！）
├─ build.cjs             # 构建脚本：把 dictionary.json 注入 client.js
├─ locale/{en,zh}.json   # 本插件自己在插件页显示的名称/简介
├─ icon.svg              # 图标
├─ test/e2e.cjs          # 离线端到端测试
├─ CONTRIBUTING.md       # 如何贡献翻译
└─ README.md
```

---

## 自定义 / 扩充翻译

所有翻译都在 **[`dictionary.json`](dictionary.json)**。改完执行：

```bash
node build.cjs      # 注入到 client.js
node test/e2e.cjs   # 跑测试
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 常见问题

**Q：装了没反应？**
A：前端插件需要重载前端窗口才加载。按 F12 后 `location.reload()` 或 Ctrl+R。

**Q：会不会改坏我别的插件？**
A：不会。它只拦截一个渲染函数并在返回时翻译文本，从不写任何文件、不改任何插件包。

**Q：升级 DSH 或插件后会不会失效？**
A：本插件不影响任何插件升级。若 DSH 大版本改了渲染出口，本插件可能需小更新。

**Q：能加我自己的翻译吗？**
A：可以，直接改 `dictionary.json` 再 `node build.cjs`。也欢迎 PR 回馈社区。

---

## 许可证

[MIT](LICENSE)
