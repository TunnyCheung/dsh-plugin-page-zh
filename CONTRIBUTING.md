# 贡献指南（Contributing）

> 仓库：<https://github.com/Tunny1985/dsh-plugin-page-zh>　·　问题反馈：<https://github.com/Tunny1985/dsh-plugin-page-zh/issues>

欢迎一起把这套本地汉化词典做得更好！最常见、最有价值的贡献就是**补充/修正翻译**。

## 一、只改翻译（最常见）

**所有翻译都在 [`dictionary.json`](dictionary.json) 里**，不要手改 `client.js` 里的 `DICT` 段（那段由构建脚本生成）。

1. 打开 `dictionary.json`，结构如下：

```jsonc
{
  "byName": {
    // key = 插件包名（最稳定，优先命中）
    "some-plugin-name": {
      "title": "中文名称",
      "description": "中文简介",
      "aliases": ["Official English Title"],   // 可选：官方英文标题，用于覆盖“官方中文仍是英文”的情况
      "style": "bilingual"                     // 可选：zh-only 只中文 / bilingual 英文·中文并列
    }
  },
  "bySource": {
    // key = 插件 package.json 里的英文 description 原文（包名没命中时兜底）
    "English description text ...": "对应的中文简介"
  }
}
```

> 词典带 [`dictionary.schema.json`](dictionary.schema.json) JSON Schema，编辑器（VS Code 等）会自动提示并校验字段。

2. 改完运行 `.cjs` 构建脚本把词典注入 `client.js`：

```bash
node build.cjs          # 校验并注入
node build.cjs --check  # 仅校验 JSON 结构（CI 用）
node test/e2e.cjs       # 跑离线测试
```

或者一键增词（自动补格式并校验，无需手改 JSON）：

```bash
node build.cjs --add <包名> <中文名> [中文简介] [--style=zh-only|bilingual]
```

3. 提交 PR。请一并说明是哪个插件、中文名称/简介来自哪里。

### 怎么拿到某插件的包名和英文原文

在 DSH 的 profile `node_modules` 下打开对应插件的 `package.json`：

- 包名 = `name`
- 英文原文 = `description`

```bash
# Windows 示例
type %USERPROFILE%\.dsh\profiles\desktop\node_modules\<插件>\package.json
```

## 二、翻译优先级（解析规则）

本插件在渲染出口拦截 `ctx.locale.resolveText(text)`，按以下顺序解析：

1. **用户覆盖层**：`overrides.json` 里的自定义译名（最高优先级，个人译名不随词典升级丢失）。
2. **官方中文**：插件自带 `locale/zh.json` 且其中确有中文 → 直接用官方（尊重原作者）。
3. **本地词典·按包名**：`byName[包名].title / .description`。
4. **本地词典·按原文**：`bySource[英文原文]`，或用 `aliases` 覆盖官方英文标题。
5. **英文原文**：以上都没有则原样显示。

> 因此：官方已经提供中文的插件，你无需重复翻译；只有当官方中文缺失或仍为英文时，本地词典才生效。

> 提示：启动时插件会在控制台打印「未覆盖的插件（可考虑补译）」，可据此补齐词典。

## 三、代码贡献

- `client.js` 是运行在**浏览器渲染进程**里的客户端半（`window.__ModuleLoader__.load`）。
- `index.js` 是 Host 半，本插件为空实现（翻译全在前端）。
- 不要在 `client.js` 里 `require` 任何 `@deepseek-ai/dsh-client-*` 包（除 inject 排序），不要访问网络，不要写文件。
- 改动后务必：`node build.cjs --check && node --check client.js && node test/e2e.cjs && node test/e2e-overrides.cjs` 全绿。

## 四、提交规范

- 提交信息建议：`feat(dict): 新增 xxx 插件中文`、`fix(dict): 修正 xxx 简介`、`chore: ...`
- 一个 PR 尽量聚焦一件事。
