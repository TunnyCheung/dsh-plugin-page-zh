/**
 * test/e2e.cjs —— 离线端到端测试（零依赖，纯 Node）。
 *
 * 思路：用最小模拟环境执行第三方 bundle 的 client.js：
 *   - 模拟 window.__ModuleLoader__ 捕获插件定义
 *   - 模拟 LocaleRuntime（active="zh"，复刻官方 resolveText 语义）
 *   - 模拟 cordis ctx（locale + effect）
 * 然后断言：包名/英文原文/语言对象/官方中文优先/null 安全/可逆 等全部符合预期。
 *
 * 运行：node test/e2e.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CLIENT = path.join(__dirname, '..', 'client.js');
const PLUGIN_ID = 'dsh-plugin-i18n-local';

// ---- 1. 模拟运行环境 ----
const registered = {};
global.window = {
  __ModuleLoader__: { load(def) { registered[def.id] = def; } },
  addEventListener() {}
};

const code = fs.readFileSync(CLIENT, 'utf8');
// eslint-disable-next-line no-eval
eval(code);

const def = registered[PLUGIN_ID];
if (!def || typeof def.factory !== 'function') {
  console.error('FAIL: 插件未注册或 factory 无效');
  process.exit(1);
}

// 复刻官方 LocaleRuntime.resolveText 语义（active="zh"，fallback → en）
function localeKey(v) { return v.toLowerCase(); }
const fakeLocale = {
  snapshot: { active: 'zh' },
  fallbackChain() { return ['zh', 'en']; },
  resolveText(text) {
    if (typeof text === 'string') return text;
    if (text == null) return text;
    return this.fallbackChain().reduceRight((r, l) => text[localeKey(l)] != null ? text[localeKey(l)] : r, text.en);
  }
};

const effects = [];
const ctx = { locale: fakeLocale, effect(fn) { effects.push(fn()); } };

const plugin = def.factory(() => { throw new Error('require not stubbed'); });
if (!Array.isArray(plugin.inject) || plugin.inject.indexOf('locale') < 0) {
  console.error('FAIL: inject 未声明 locale');
  process.exit(1);
}
plugin.apply(ctx);

const R = (t) => ctx.locale.resolveText(t);

// ---- 2. 断言框架 ----
let pass = 0, fail = 0;
const fails = [];
function t(name, got, want) {
  const ok = typeof want === 'function' ? want(got) : got === want;
  if (ok) pass++;
  else { fail++; fails.push(`${name}: got ${JSON.stringify(got)}`); }
}
const contains = (kw) => (s) => typeof s === 'string' && s.indexOf(kw) >= 0;

// ---- 3. 用例 ----
// 纯字符串（包名 → 中文标题）
t('包名 dsh-purge', R('dsh-purge'), '提示词权威性清洗');
t('包名 @deepseek-ai/dsh-base', R('@deepseek-ai/dsh-base'), 'DSH 基础（核心运行时）');
t('包名 dsh-memory-evolve', R('dsh-memory-evolve'), '记忆与待办演进');
// 纯字符串（英文原文简介 → 中文简介）
t('原文 superpowers', R('Superpowers for the DeepSeek Harness: TDD, debugging, planning, and collaboration skills adapted from obra/superpowers'), contains('超能力'));
// 语言对象：官方有中文 → 尊重官方
t('对象 官方中文 config-manager', R({ en: 'Config Manager', zh: '配置管理器' }), '配置管理器');
t('对象 官方中文任意', R({ en: 'X', zh: '官方中文标题' }), '官方中文标题');
// 语言对象：官方 zh 等于英文 → 用本地词典覆盖
t('对象 zh=英文 better-sidebar', R({ en: 'Better Sidebar', zh: 'Better Sidebar' }), '增强侧边栏');
t('对象 zh=英文 dsh-context', R({ en: 'Context (dsh-context)', zh: 'Context (dsh-context)' }), contains('上下文'));
// 语言对象：无 zh，按原文命中
t('对象 无zh sidebar-desc', R({ en: 'Better Sidebar for DSH — file tree, editor, changes, tasks and side chat in one column, separate for every conversation. Also exposes a service other plugins use to register sidebar tabs and file viewers.' }), contains('增强侧边栏'));
// 未知 → 原样
t('未知字符串', R('hello world'), 'hello world');
// 安全：null/undefined/数字 原样返回、不抛错
t('null 安全', R(null), null);
t('undefined 安全', R(undefined), undefined);
t('数字原样', R(123), 123);

// ---- 4. 可逆性 ----
effects.forEach((f) => f && f());
t('cleanup 后还原', fakeLocale.resolveText('dsh-purge'), 'dsh-purge');

// ---- 5. 结果 ----
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  fails.forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log('ALL PASS ✔');
