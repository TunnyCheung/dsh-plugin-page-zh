window.__ModuleLoader__.load({
  id: 'dsh-plugin-i18n-local',
  factory(require) {
    // =====================================================================
    // DSH 插件页 名称/简介 本地翻译 v2
    //
    // 设计目标（完全离线、零网络、零付费）：
    //   1) 分级优先级：官方 locale 中文 > 本地词典(包名) > 本地词典(原文) > 英文原文
    //   2) 不修改任何插件包，只在渲染出口 ctx.locale.resolveText 运行时拦截
    //   3) 可逆：卸载/停用即完全还原，无残留；重启即失效，绝不写回任何文件
    //
    // 词典与规则都在 client.js 内置（打包进 bundle），保证纯离线可用；
    // 用户/社区要扩充，直接改下面的 DICT 即可（或由构建脚本从 dictionary.json 注入）。
    // =====================================================================

    // ---------- 1. 词典 ----------
    // byName  : key = 插件包名（稳定），value = { title?, description?, aliases? } 中文
    //           aliases = 该插件官方英文 title 的可能写法，用于覆盖“官方 zh 仍是英文”的标题
    // bySource: key = 英文原文（英文 description），value = 中文，作为兜底
    // 数据源：dictionary.json（由 build.js 注入到下方标记块，勿手改标记块内内容）
    // ===== DICT-BEGIN (generated from dictionary.json, do not edit by hand) =====
    const DICT = {
      "byName": {
        "@deepseek-ai/dsh-base": {
          "title": "DSH 基础（核心运行时）",
          "description": "DSH 的核心运行时与基础能力，其它插件都建立在它之上。"
        },
        "@deepseek-ai/dsh-web-app": {
          "title": "DSH Web 应用界面",
          "description": "DSH 的 Web 图形界面本体（聊天、设置、插件页等前端）。"
        },
        "dsh-purge": {
          "title": "提示词权威性清洗"
        },
        "superpowers-dsh": {
          "title": "超能力方法包",
          "description": "为 DSH 带来超能力方法包：源自 obra/superpowers 的测试驱动开发、调试、规划与协作技能。"
        },
        "dsh-ui-ux-pro-max": {
          "title": "UI/UX 设计智能库",
          "description": "内置 88 种设计风格、192 个调色板、74 组字体搭配、119 条 UX 规范、25 种图表类型与 22 个技术栈；提供 design_recommend / design_review / design_search 三个模型工具，完全内置、离线可用、中文优先。"
        },
        "dsh-plugin-rea": {
          "title": "REA 逆向工程工具集",
          "description": "一体包：自动准备 Node/REA/JDK/Ghidra，并把上游 REA 的 MCP 服务以 mcp__rea__* 工具接入 DSH。"
        },
        "@vectorize-io/hindsight-coding-agents": {
          "title": "Hindsight 编程记忆",
          "description": "为编码智能体提供只做反思的 Hindsight 长期记忆，可接入多种宿主（如 opencode 等），后台自动摄取记忆，无需手动配置命令行。"
        },
        "dsh-context": {
          "title": "上下文洞察与管理",
          "aliases": [
            "Context (dsh-context)"
          ]
        },
        "billion-context": {
          "title": "十亿级上下文压缩",
          "description": "上下文压缩插件：小上下文窗口（100K 即可）、token 用量降低约 5 倍、支持长达一个月（数十亿 token）的单次会话，并保证压缩质量；适用于各类智能体（pi、OpenCode、Codex、Claude Code 等）。"
        },
        "dsh-memory-evolve": {
          "title": "记忆与待办演进",
          "description": "为 DSH 带来分层记忆（全局 / 用户 / 项目 / GIT 分支 / 每日）、自我进化（经验沉淀 + 技能自动创建）、技能管理、待办管理、CLI 调度（统一调度 kimi/codex/grok/hermes 等外部 AI）与临时便签，并带 WebUI 管理界面。"
        },
        "aegis": {
          "title": "Aegis 工程方法包",
          "description": "面向 AI 编码智能体的“方法包”，用一套纪律化的工程方法让编码智能体产出更可靠。"
        },
        "@nanmicoder/dsh-agent-teams": {
          "title": "Agent 多智能体团队",
          "description": "为 DSH 提供 Agent 多智能体团队协作：由自然语言驱动（队长、成员、带依赖的任务、消息传递），并在 Web 界面提供树状监控。"
        },
        "dsh-jev-decision-model": {
          "title": "Jev 决策评估模型",
          "description": "面向智能体宿主的 Jev 决策引擎：原生支持 DSH，并可通过 iPolloWork 支持 OpenCode 与 Codex Harness。"
        },
        "brooks-lint": {
          "title": "Brooks 代码质量体检",
          "description": "基于十二本工程经典著作的 AI 代码质量审查，附带六套可移植的 Agent 技能，供编码智能体使用。"
        },
        "dsh-better-sidebar": {
          "title": "增强侧边栏",
          "aliases": [
            "Better Sidebar"
          ],
          "description": "把文件树、编辑器、变更、任务与侧边聊天集中在同一列，每个对话独立；并对外暴露服务，供其他插件注册侧边栏标签页与文件查看器。"
        },
        "dsh-config-manager": {
          "title": "配置管理器",
          "aliases": [
            "Config Manager"
          ]
        },
        "@deepseek-ai/dsh-experimental-cot-translation-bundle": {
          "title": "思维链翻译（实验）"
        },
        "@deepseek-ai/dsh-personalized-recommendations": {
          "title": "个性化推荐"
        },
        "@deepseek-ai/dsh-experimental-plugin-market-bundle": {
          "title": "插件市场（实验）"
        },
        "dsh-plugin-i18n-local": {
          "title": "插件名称与简介本地翻译"
        }
      },
      "bySource": {
        "DeepSeek Harness 破甲：让所有模型都能破甲，不同模型可换不同提示词；默认提示词面向国模「小码酱」。Jailbreak for every model — swap prompts per model. 求 Star 收藏 ⭐ 如要二开，请查看署名要求部分": "让所有模型都能“破甲”，不同模型可换不同提示词；默认提示词面向国模「小码酱」。欢迎 Star 收藏。",
        "Superpowers for the DeepSeek Harness: TDD, debugging, planning, and collaboration skills adapted from obra/superpowers": "为 DSH 带来超能力方法包：源自 obra/superpowers 的测试驱动开发、调试、规划与协作技能。",
        "One-plugin bundle: provisions Node/REA/JDK/Ghidra for you, then registers the upstream REA MCP server as mcp__rea__* tools. · 一体包：自动准备 Node/REA/JDK/Ghidra，并把上游 REA 的 MCP 服务接入 DeepSeek Harness。": "一体包：自动准备 Node/REA/JDK/Ghidra，并把上游 REA 的 MCP 服务以 mcp__rea__* 工具接入 DSH。",
        "Reflect-only Hindsight long-term memory for coding agents (harness-pluggable: opencode, …), with automatic background ingestion (no setup CLI).": "为编码智能体提供只做反思的 Hindsight 长期记忆，可接入多种宿主（如 opencode 等），后台自动摄取记忆，无需手动配置命令行。",
        "A DeepSeek Harness plugin for context insight and management, with context dashboard and context command, for understanding how the context is made of, and how it evolves.": "DSH 上下文洞察与管理插件，提供上下文仪表盘和 context 命令，帮助理解上下文由什么构成、如何演进。",
        "A context-compression plugin — small context windows (a 100K context is enough), 5x fewer tokens, month-long single sessions (billions of tokens), and compression quality — for all agents: pi, OpenCode, Codex, Claude Code, and more. billion-context is all you need.": "上下文压缩插件：小上下文窗口（100K 即可）、token 用量降低约 5 倍、支持长达一个月（数十亿 token）的单次会话，并保证压缩质量；适用于各类智能体（pi、OpenCode、Codex、Claude Code 等）。",
        "为 DeepSeek Harness 带来分层记忆（全局 / 用户 / 项目 / GIT 分支 / 每日）与自我进化（经验沉淀 + 技能自动创建）和技能管理、待办管理、CLI 调度（kimi/codex/grok/hermes 等外部 AI 统一调度）、临时信息便签，带 WebUI 管理界面。Hermes-style long-term memory, self-evolution, skills, todos and external CLI agent dispatch for DeepSeek Harness.": "为 DSH 带来分层记忆（全局 / 用户 / 项目 / GIT 分支 / 每日）、自我进化（经验沉淀 + 技能自动创建）、技能管理、待办管理、CLI 调度（统一调度 kimi/codex/grok/hermes 等外部 AI）与临时便签，并带 WebUI 管理界面。",
        "AgentTeams for DeepSeek Harness: multi-agent team collaboration (captain, members, tasks with dependencies, messaging) driven by natural language, with a tree monitor in the web GUI": "为 DSH 提供 Agent 多智能体团队协作：由自然语言驱动（队长、成员、带依赖的任务、消息传递），并在 Web 界面提供树状监控。",
        "Jev Decision Engine for Agent Harnesses: native DeepSeek Harness, plus OpenCode and Codex Harness through iPolloWork": "面向智能体宿主的 Jev 决策引擎：原生支持 DSH，并可通过 iPolloWork 支持 OpenCode 与 Codex Harness。",
        "AI code quality reviews grounded in twelve engineering books, with six portable Agent Skills for coding agents.": "基于十二本工程经典著作的 AI 代码质量审查，附带六套可移植的 Agent 技能，供编码智能体使用。",
        "Better Sidebar for DSH — file tree, editor, changes, tasks and side chat in one column, separate for every conversation. Also exposes a service other plugins use to register sidebar tabs and file viewers.": "DSH 增强侧边栏：把文件树、编辑器、变更、任务与侧边聊天集中在同一列，每个对话独立；并对外暴露服务，供其他插件注册侧边栏标签页与文件查看器。",
        "Backup, restore, export, import, migrate and sync your DeepSeek Harness (DSH) configuration: settings, plugins, MCP servers, skills, agent presets and workspaces. One-click migration to another machine. DSH 配置一键备份、恢复、导出、导入、迁移与同步插件。": "一键备份、恢复、导出、导入、迁移与同步 DSH 配置：设置、插件、MCP 服务、技能、Agent 预设与工作区，支持一键迁移到另一台机器。",
        "Local-only plugin name & description translator for the DSH Plugins page.": "仅在本地把「插件」页里每个插件的名称和简介显示为中文，不改动任何插件包，也不影响插件升级。"
      }
    };
    // ===== DICT-END =====

    // ---------- 2. 工具 ----------
    const log = (...a) => { try { console.info('[i18n-local]', ...a); } catch (e) {} };
    const has = (obj, key) => obj != null && Object.prototype.hasOwnProperty.call(obj, key);
    // 判断字符串里是否含中文（用于判断“官方 zh 是否真的有中文”）
    const hasCJK = (s) => typeof s === 'string' && /[\u3400-\u9fff]/.test(s);
    const isPlainString = (v) => typeof v === 'string';

    // 从本地词典解析：优先按包名（标题/简介字段），再按原文兜底
    function fromDict(kind, key, field) {
      // kind: 'name' | 'source'；field: 'title' | 'description'
      if (kind === 'name' && has(DICT.byName, key)) {
        const entry = DICT.byName[key];
        if (has(entry, field)) return entry[field];
      }
      if (has(DICT.bySource, key)) return DICT.bySource[key];
      return undefined;
    }

    // 预建「原文 → 中文」合并反查表：来源 = bySource + byName 各 entry 的 aliases（英文 title 别名）。
    // 用途：语言对象 {en, zh} 里官方 zh 缺失/等于英文时，可凭 en 值反查到本地中文。
    // 注意：只有当“本地中文”本身含中文时才登记，避免把英文当译文、避免自我循环。
    const CACHE = (function buildReverse() {
      const rev = Object.create(null);
      const put = (k, v) => {
        if (typeof k === 'string' && typeof v === 'string' && hasCJK(v)) {
          if (!(k in rev)) rev[k] = v;
        }
      };
      // 1) 英文原文简介 → 中文简介
      for (const k in DICT.bySource) if (has(DICT.bySource, k)) put(k, DICT.bySource[k]);
      // 2) 英文 title 别名 → 中文 title（aliases 只在含中文值时才册入）
      for (const name in DICT.byName) {
        if (!has(DICT.byName, name)) continue;
        const e = DICT.byName[name];
        if (Array.isArray(e.aliases)) {
          for (const alias of e.aliases) {
            if (has(e, 'title')) put(alias, e.title);
          }
        }
      }
      return rev;
    })();

    // ---------- 3. 主逻辑 ----------
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx && ctx.locale;
        if (!locale || typeof locale.resolveText !== 'function') {
          log('locale service unavailable; skip');
          return;
        }

        const original = locale.resolveText;

        // 处理纯字符串：可能是包名(标题) 或 英文原文(简介)
        function resolveString(text) {
          const zh = fromDict('name', text, 'title') || fromDict('source', text, 'title');
          if (zh !== undefined) return zh;
          const dz = fromDict('source', text, 'description');
          if (dz !== undefined) return dz;
          // 也允许包名命中 description（少见）
          const dn = fromDict('name', text, 'description');
          if (dn !== undefined) return dn;
          return text;
        }

        // 处理语言对象：优先官方中文；官方缺失或等于英文时，用本地词典（按 en 原文反查）覆盖
        function resolveObject(obj) {
          // 非对象（含 null）：直接交回原始逻辑，避免空指针
          if (obj === null || typeof obj !== 'object') return original.call(locale, obj);

          const zhVal = obj.zh;
          // 官方 zh 真有中文（且不等于英文）→ 尊重官方
          if (hasCJK(zhVal)) return zhVal;

          // 官方没有中文（或 zh 就是英文）→ 用本地词典按 en 原文反查
          const enVal = obj.en;
          if (isPlainString(enVal)) {
            // 1) 合并反查表（bySource + 含中文的 byName 值）
            if (has(CACHE, enVal)) return CACHE[enVal];
            // 2) 再走一次常规 resolveString（覆盖 bySource/byName 各种字段）
            const t = resolveString(enVal);
            if (t !== enVal) return t;
          }
          // 兜底：交回原始逻辑（按当前语言链取值，通常回退 en）
          return original.call(locale, obj);
        }

        const patched = function (text) {
          try {
            // 非字符串且非对象（null/undefined/数字/布尔…）：原样返回，绝不交给内部逻辑（其读 .en 会崩）
            if (text === null || text === undefined) return text;
            if (typeof text === 'string') return resolveString(text);
            if (typeof text === 'object') return resolveObject(text);
            return text;
          } catch (e) {
            // 任何异常都退化到原始逻辑，绝不破坏正常渲染
            try { return original.apply(this, arguments); } catch (e2) { return text; }
          }
        };
        try { Object.defineProperty(patched, 'name', { value: 'resolveText' }); } catch (e) {}

        locale.resolveText = patched;

        // 可逆：卸载/停用还原；ctx.effect 不可用时退化为 pagehide 还原
        const restore = () => { try { if (locale.resolveText === patched) locale.resolveText = original; } catch (e) {} };
        let registered = false;
        try {
          if (typeof ctx.effect === 'function') { ctx.effect(() => restore, 'i18n-local: restore resolveText'); registered = true; }
        } catch (e) { registered = false; }
        if (!registered) {
          try { window.addEventListener('pagehide', restore, { once: true }); } catch (e) {}
        }

        // 自检探针
        try {
          const probe = ['@deepseek-ai/dsh-base', 'dsh-purge', 'dsh-better-sidebar']
            .map((k) => `${k} => ${locale.resolveText(k)}`);
          log('resolveText patched OK;', probe.join(' | '));
          log('dict names:', Object.keys(DICT.byName).length, '| sources:', Object.keys(DICT.bySource).length);
        } catch (e) {}
      }
    };
  }
});
