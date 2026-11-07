# 更新日志

## 3.0.0

### 新增
- **「原英文名 · 中文意思」并列标题**：标题显示为 `dsh-jev-decision-model · Jev 决策评估模型` 这种形态，同时保留英文原名与中文意思；可通过 `client.js` 顶部 `BILINGUAL` 开关切换为「仅中文」。
- **覆盖「无 locale / 无 meta」的纯 package.json 插件**（如 dsh-jev-decision-model）：这类插件的标题由宿主 `readPluginMeta` 回退为包名（纯字符串），简介回退为英文原文；本版对其做纯字符串级翻译，标题并列、简介译中文。

### 修复
- `bySource`（英文原文 → 中文）此前会被误判为「标题译文」而命中，导致简介被当成标题并列；现仅在查询 `description` 时用 `bySource`。

### 说明
- 简介始终只显示中文（较长，不并列）；仅标题并列。

## 2.0.0

**正式开源版**，相对 1.x 的重构与增强：

### 新增
- **优先级解析器**：官方 `locale/zh.json` 中文 > 本地词典（按包名）> 本地词典（按原文）> 英文原文。
- **外部词典数据源** `dictionary.json` + 构建脚本 `build.cjs`：翻译与代码分离，社区可只改 JSON 提交 PR。
- **英文标题别名 `aliases`**：修正「官方中文 title 其实还是英文」的插件（如 Better Sidebar）标题不翻译的问题。
- **语言对象反查缓存**：`{en, zh}` 里官方无中文/等于英文时，凭 `en` 值反查到本地中文。
- **离线端到端测试** `test/e2e.cjs`（14 用例）与 **GitHub Actions CI**（多 Node 版本 + 词典一致性校验）。
- **文档**：面向小白的 README、CONTRIBUTING（如何贡献翻译）、MIT LICENSE、.gitignore。

### 修复
- `resolveText(null/undefined)` 不再抛错（原逻辑读 `.en` 会崩）。
- 官方中文存在但等于英文时，正确回退到本地词典。

### 安全 / 稳定性
- 全程 `try/catch` 兜底，异常时退回原始逻辑，绝不破坏渲染。
- 词典键做原型污染防护（禁 `__proto__`/`constructor`/`prototype`），`build.cjs` 校验 JSON 结构。
- 不联网、不写文件、不改任何插件包；`ctx.effect` cleanup 保证可逆还原。

## 1.0.0

- 首个可用版本：拦截 `ctx.locale.resolveText`，内置词典把插件名/简介显示为中文。
