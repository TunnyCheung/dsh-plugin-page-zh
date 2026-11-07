#!/usr/bin/env node
/**
 * build.cjs —— 把 dictionary.json 注入 client.js 的 DICT 段。
 *
 * 单一数据源：dictionary.json。
 * client.js 中的 DICT 由本脚本从 dictionary.json 生成，避免两处手改不一致。
 *
 * 用法：
 *   node build.cjs           # 用 dictionary.json 重新生成 client.js 的 DICT 段
 *   node build.cjs --check   # 只校验 dictionary.json 结构合法，不写文件（CI 用）
 *
 * 零依赖，纯 Node 标准库。（.cjs 以避开 package.json 的 "type":"module"）
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DICT_FILE = path.join(ROOT, 'dictionary.json');
const CLIENT_FILE = path.join(ROOT, 'client.js');
const OVERRIDES_FILE = path.join(ROOT, 'overrides.json');

const BEGIN = '    // ===== DICT-BEGIN (generated from dictionary.json, do not edit by hand) =====';
const END = '    // ===== DICT-END =====';
// OVERRIDES 的值用内联注释标记包裹，仅替换 {} 字面量，const 声明始终保留在 client.js 里
const OVERRIDES_BEGIN = '/* OVERRIDES-BEGIN */';
const OVERRIDES_END = '/* OVERRIDES-END */';

function die(msg) {
  console.error('[build] ERROR:', msg);
  process.exit(1);
}

// 一键增词：node build.cjs --add <包名> <中文名> [中文简介] [--style=zh-only|bilingual]
// 自动补格式、写回 dictionary.json、跑校验，并重新注入 client.js。
function addEntry() {
  const idx = process.argv.indexOf('--add');
  const args = process.argv.slice(idx + 1);
  const name = args[0];
  const title = args[1];
  if (!name || !title) {
    die('用法: node build.cjs --add <包名> <中文名> [中文简介] [--style=zh-only|bilingual]');
  }
  const desc = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
  const styleArg = args.find((a) => a.startsWith('--style='));
  const style = styleArg ? styleArg.slice('--style='.length) : undefined;
  if (style && style !== 'zh-only' && style !== 'bilingual') {
    die('--style 只能是 zh-only 或 bilingual');
  }

  let dict;
  try {
    dict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf8'));
  } catch (e) {
    die('dictionary.json 读不到或非法: ' + e.message);
  }
  dict.byName = dict.byName || {};
  const entry = { title };
  if (desc) entry.description = desc;
  if (style) entry.style = style;
  dict.byName[name] = entry;

  fs.writeFileSync(DICT_FILE, JSON.stringify(dict, null, 2) + '\n', 'utf8');
  console.log('[build] 已新增 byName["' + name + '"] = ' + JSON.stringify(entry));
  validate(dict);
  // 继续走正常注入流程（复用 main 的剩余逻辑）：直接递归调用一次普通构建
  process.argv = process.argv.filter((a) => a !== '--add' && a !== name && a !== title && a !== desc && a !== styleArg);
  main();
  process.exit(0);
}

// 读取用户本地覆盖层 overrides.json（可选）。格式：{ "包名或英文原文": { title?, description?, style? } 或 字符串 }
// 不存在/非法时返回 {}，绝不因此中断构建。
function readOverrides() {
  let raw;
  try {
    raw = fs.readFileSync(OVERRIDES_FILE, 'utf8');
  } catch (e) {
    return {}; // 无覆盖文件，正常
  }
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    // 过滤非法键，但不清空合法项
    const out = {};
    for (const k of Object.keys(o)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) continue;
      out[k] = o[k];
    }
    return out;
  } catch (e) {
    console.warn('[build] overrides.json 不是合法 JSON，已忽略覆盖层:', e.message);
    return {};
  }
}

function validate(dict) {
  if (!dict || typeof dict !== 'object') die('dictionary.json 不是对象');
  const { byName, bySource } = dict;
  if (!byName || typeof byName !== 'object' || Array.isArray(byName)) die('byName 必须是对象');
  if (!bySource || typeof bySource !== 'object' || Array.isArray(bySource)) die('bySource 必须是对象');
  const bad = ['__proto__', 'constructor', 'prototype'];
  for (const k of [...Object.keys(byName), ...Object.keys(bySource)]) {
    if (bad.includes(k)) die('非法键名: ' + k);
  }
  let n = 0;
  for (const [name, e] of Object.entries(byName)) {
    if (!e || typeof e !== 'object') die('byName["' + name + '"] 必须是对象');
    for (const f of ['title', 'description']) {
      if (e[f] !== undefined && typeof e[f] !== 'string') die('byName["' + name + '"].' + f + ' 必须是字符串');
      if (e[f] !== undefined) n++;
    }
    if (e.aliases !== undefined) {
      if (!Array.isArray(e.aliases) || e.aliases.some((x) => typeof x !== 'string')) {
        die('byName["' + name + '"].aliases 必须是字符串数组');
      }
    }
    if (e.style !== undefined) {
      if (e.style !== 'zh-only' && e.style !== 'bilingual') {
        die('byName["' + name + '"].style 只能是 "zh-only" 或 "bilingual"');
      }
    }
  }
  for (const [k, v] of Object.entries(bySource)) {
    if (typeof v !== 'string') die('bySource 值必须是字符串 (key=' + k.slice(0, 40) + '...)');
    n++;
  }
  return n;
}

function main() {
  // ---- 一键增词：node build.cjs --add <包名> <中文名> [中文简介] [--style=zh-only|bilingual] ----
  if (process.argv.includes('--add')) {
    return addEntry();
  }

  let raw;
  try {
    raw = fs.readFileSync(DICT_FILE, 'utf8');
  } catch (e) {
    die('读不到 dictionary.json: ' + e.message);
  }
  let dict;
  try {
    dict = JSON.parse(raw);
  } catch (e) {
    die('dictionary.json 不是合法 JSON: ' + e.message);
  }
  const count = validate(dict);

  // 读取用户本地覆盖层（可选文件，不存在则用空对象，绝不报错）
  const overrides = readOverrides();

  if (process.argv.includes('--check')) {
    console.log('[build] dictionary.json OK (' + count + ' 条译文)'
      + (Object.keys(overrides).length ? ' + overrides.json (' + Object.keys(overrides).length + ' 条)' : ''));
    return;
  }

  const json = JSON.stringify({ byName: dict.byName, bySource: dict.bySource }, null, 2);
  const indented = json
    .split('\n')
    .map((line, i) => (i === 0 ? line : '    ' + line))
    .join('\n');
  const block = BEGIN + '\n    const DICT = ' + indented + ';\n' + END;

  // 注入用户覆盖层（若存在），替换 OVERRIDES 内联标记之间的 {} 字面量
  const overridesLiteral = JSON.stringify(overrides, null, 2);

  let client;
  try {
    client = fs.readFileSync(CLIENT_FILE, 'utf8');
  } catch (e) {
    die('读不到 client.js: ' + e.message);
  }

  const beginIdx = client.indexOf(BEGIN);
  const endIdx = client.indexOf(END);
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    die('client.js 里找不到 DICT-BEGIN/DICT-END 标记块，请检查标记是否被人为删除');
  }
  const before = client.slice(0, beginIdx);
  let after = client.slice(endIdx + END.length);

  // 替换 OVERRIDES 内联标记之间的字面量（const 声明始终保留）
  const obBegin = after.indexOf(OVERRIDES_BEGIN);
  const obEnd = after.indexOf(OVERRIDES_END);
  if (obBegin === -1 || obEnd === -1 || obEnd < obBegin) {
    die('client.js 里找不到 OVERRIDES 内联标记 /* OVERRIDES-BEGIN */ ... /* OVERRIDES-END */');
  }
  after = after.slice(0, obBegin + OVERRIDES_BEGIN.length) + ' ' + overridesLiteral + ' ' + after.slice(obEnd);

  fs.writeFileSync(CLIENT_FILE, before + block + after, 'utf8');
  console.log('[build] 已把 dictionary.json (' + count + ' 条译文) 注入 client.js'
    + (Object.keys(overrides).length ? '，并注入 overrides.json (' + Object.keys(overrides).length + ' 条覆盖)' : ''));
}

main();
