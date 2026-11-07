# 更新日志

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
