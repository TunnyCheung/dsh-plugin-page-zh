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
const PLUGIN_ID = 'dsh-plugin-page-zh';

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

// 独立的 locale 工厂（复刻官方 resolveText 语义），供兼容性专项用例使用单独实例
function mkLocale() {
  return {
    snapshot: { active: 'zh' },
    fallbackChain() { return ['zh', 'en']; },
    resolveText(text) {
      if (typeof text === 'string') return text;
      if (text == null) return text;
      return this.fallbackChain().reduceRight((r, l) => text[localeKey(l)] != null ? text[localeKey(l)] : r, text.en);
    }
  };
}

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
// 纯字符串（包名 → 「英文原名 · 中文」并列标题）
t('包名 dsh-purge 并列', R('dsh-purge'), 'dsh-purge · 提示词权威性清洗');
t('包名 @deepseek-ai/dsh-base 并列', R('@deepseek-ai/dsh-base'), '@deepseek-ai/dsh-base · DSH 基础（核心运行时）');
t('包名 dsh-jev-decision-model 并列', R('dsh-jev-decision-model'), 'dsh-jev-decision-model · Jev 决策评估模型');
t('包名 dsh-memory-evolve 含中文', R('dsh-memory-evolve'), contains('记忆与待办演进'));
// 纯字符串（英文原文简介 → 中文简介，简介只显示中文不并列）
t('原文 superpowers 简介', R('Superpowers for the DeepSeek Harness: TDD, debugging, planning, and collaboration skills adapted from obra/superpowers'), contains('超能力'));
t('原文 jev 简介只中文', R('Jev Decision Engine for Agent Harnesses: native DeepSeek Harness, plus OpenCode and Codex Harness through iPolloWork'), (s) => typeof s === 'string' && s.indexOf('Jev Decision Engine') < 0 && s.indexOf('Jev 决策引擎') >= 0);
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

// ---- 4b. 兼容性 / 健壮性专项 ----
// 4b-1 幂等：对同一个 ctx 再次 apply，不应叠加拦截、不应报错
{
  const loc = mkLocale();
  const c2 = { locale: loc, effect(fn) { fn(); } };
  plugin.apply(c2);
  const once = loc.resolveText('dsh-purge');
  plugin.apply(c2); // 二次
  t('幂等：二次 apply 结果一致', loc.resolveText('dsh-purge'), once);
}
// 4b-2 缺 locale 服务：apply 静默跳过、不抛错
{
  let threw = false;
  try { plugin.apply({ effect() {} }); } catch (e) { threw = true; }
  t('缺 locale 不抛错', threw, false);
}
// 4b-3 非法 ctx（null）：apply 静默、不抛错
{
  let threw = false;
  try { plugin.apply(null); } catch (e) { threw = true; }
  t('null ctx 不抛错', threw, false);
}
// 4b-4 宿主改名为 i18n：仍能探测到并生效
{
  const loc = mkLocale();
  const ctx2 = { i18n: loc, effect(fn) { fn(); } };
  plugin.apply(ctx2);
  t('locale 改名 i18n 仍生效', loc.resolveText('dsh-purge'), 'dsh-purge · 提示词权威性清洗');
}
// 4b-5 locale 存在但 resolveText 非函数：不抛错、原样
{
  let threw = false;
  try { plugin.apply({ locale: {}, effect() {} }); } catch (e) { threw = true; }
  t('resolveText 缺失不抛错', threw, false);
}
// 4b-6 effect 缺失：仍拦截，并靠 pagehide 兜底还原（不抛错）
{
  const loc = mkLocale();
  let threw = false;
  try { plugin.apply({ locale: loc }); } catch (e) { threw = true; }
  t('effect 缺失不抛错', threw, false);
  t('effect 缺失仍生效', loc.resolveText('dsh-purge'), 'dsh-purge · 提示词权威性清洗');
}
// 4b-7 resolveText 抛错的极端宿主：wrapper 必须吞掉异常并回退原文
{
  const loc = mkLocale();
  const ctx3 = { locale: loc, effect(fn) { fn(); } };
  plugin.apply(ctx3);
  // 构造一个内部原始实现会抛的输入
  const r = loc.resolveText({ get en() { throw new Error('boom'); } });
  t('内部异常被吞掉不崩', typeof r, 'object');
}
// ---- 5. 结果 ----
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  fails.forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log('ALL PASS ✔');
