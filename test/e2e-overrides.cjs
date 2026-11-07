/**
 * test/e2e-overrides.cjs —— 覆盖层 & style 专项测试（零依赖，纯 Node）。
 *
 * 思路：把 client.js 里的 OVERRIDES 空对象替换成测试用的覆盖层 + 给词典打 style，
 *       再执行，验证「覆盖层最高优先级」和「style 细化双语形态」真正生效。
 *
 * 运行：node test/e2e-overrides.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CLIENT = path.join(__dirname, '..', 'client.js');
const PLUGIN_ID = 'dsh-plugin-page-zh';

// ---- 构造带覆盖层 & style 的 client 代码 ----
let code = fs.readFileSync(CLIENT, 'utf8');

// 注入测试覆盖层：覆盖 dsh-jev-decision-model 的译名 + 一个未知插件 + 一个 style=zh-only 的条目
const fakeOverrides = {
  'dsh-jev-decision-model': { title: '我的 Jev 译名', style: 'zh-only' },
  'some-fake-plugin': '伪造插件译名',
  'Fake English Title': { title: '伪英文标题中文', style: 'bilingual' }
};
const injected = 'const OVERRIDES = ' + JSON.stringify(fakeOverrides, null, 2) + ';';
// 替换内联标记 /* OVERRIDES-BEGIN */ ... /* OVERRIDES-END */ 之间的字面量
const obBegin = code.indexOf('/* OVERRIDES-BEGIN */');
const obEnd = code.indexOf('/* OVERRIDES-END */');
if (obBegin === -1 || obEnd === -1) {
  console.error('FAIL: client.js 里找不到 OVERRIDES 内联标记');
  process.exit(1);
}
code = code.slice(0, obBegin + '/* OVERRIDES-BEGIN */'.length)
  + ' ' + JSON.stringify(fakeOverrides, null, 2) + ' '
  + code.slice(obEnd);

// ---- 模拟环境 ----
const registered = {};
global.window = {
  __ModuleLoader__: { load(def) { registered[def.id] = def; } },
  addEventListener() {}
};
// eslint-disable-next-line no-eval
eval(code);

const def = registered[PLUGIN_ID];
if (!def || typeof def.factory !== 'function') {
  console.error('FAIL: 插件未注册');
  process.exit(1);
}

function localeKey(v) { return v.toLowerCase(); }
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

const loc = mkLocale();
const ctx = { locale: loc, effect(fn) { fn(); } };
const plugin = def.factory(() => { throw new Error('require not stubbed'); });
plugin.apply(ctx);
const R = (t) => loc.resolveText(t);

let pass = 0, fail = 0;
const fails = [];
function t(name, got, want) {
  const ok = typeof want === 'function' ? want(got) : got === want;
  if (ok) pass++;
  else { fail++; fails.push(`${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
const contains = (kw) => (s) => typeof s === 'string' && s.indexOf(kw) >= 0;

// ---- 用例 ----
// 1) 覆盖层覆盖词典译名（最高优先级）
t('覆盖层盖过词典 jev', R('dsh-jev-decision-model'), '我的 Jev 译名');
// 2) 覆盖层 style=zh-only → 只显示中文，不并列
t('覆盖层 zh-only 不并列', R('dsh-jev-decision-model'), (s) => s === '我的 Jev 译名' && s.indexOf('dsh-jev-decision-model') < 0);
// 3) 覆盖层字符串形式 → 中文名（默认 zh-only，不并列）
t('覆盖层字符串形式 zh-only', R('some-fake-plugin'), '伪造插件译名');
// 4) 覆盖层按英文原文命中（语言对象路径），style=bilingual 走并列
t('覆盖层按原文命中（对象，bilingual）', R({ en: 'Fake English Title', zh: 'Fake English Title' }), 'Fake English Title · 伪英文标题中文');
// 5) 未被覆盖的包名仍走词典（双语）
t('未覆盖包名仍双语', R('dsh-better-sidebar'), 'dsh-better-sidebar · 增强侧边栏');

// ---- 结果 ----
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  fails.forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log('ALL PASS ✔');
