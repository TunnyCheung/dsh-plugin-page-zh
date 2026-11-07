# 更新日志

## 3.1.0

### 兼容性强化（DSH 升级后仍可用）
- **不锁 DSH 版本**：package.json 只声明宽松的 `engines.node: ">=18"`，**不声明 `engines.dsh`、也不写任何 `@deepseek-ai/dsh*` 的 peerDependencies**。按宿主的兼容评估规则，这样 `unmetRequirements` 恒为空，**任何 DSH 版本都不会把本插件判为「不兼容」而禁用**（对比：某些插件把 peer 锁在 `^0.2.x`，DSH 升到 0.3+ 就会失效）。
- **运行时自愈**：`apply` 整体包 `try/catch`，宿主内部 API 变动时插件静默失效但**绝不拖垮插件页**。
- **locale 服务多路探测**：兼容宿主把 locale 服务改名（如 `i18n`/`intl`）或移到 `ctx.services.locale` / `ctx.get('locale')`。
- **幂等保护**：重复 apply（热更新/重载）不会叠加拦截。
- **inject 精简**：移除用不到的 `slots`，只声明 `locale`，减少对宿主契约的依赖。
- **语法保守**：生产代码不使用可选链 `?.`、空值合并 `??`，最大兼容旧渲染器与 Node。

### 测试
- 端到端测试增至 **24 条**，新增 8 条兼容性/健壮性专项：幂等、缺 locale、null ctx、locale 改名、resolveText 缺失、effect 缺失、内部异常吞掉等。

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
