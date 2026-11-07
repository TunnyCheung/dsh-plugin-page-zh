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

const BEGIN = '    // ===== DICT-BEGIN (generated from dictionary.json, do not edit by hand) =====';
const END = '    // ===== DICT-END =====';

function die(msg) {
  console.error('[build] ERROR:', msg);
  process.exit(1);
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
  }
  for (const [k, v] of Object.entries(bySource)) {
    if (typeof v !== 'string') die('bySource 值必须是字符串 (key=' + k.slice(0, 40) + '...)');
    n++;
  }
  return n;
}

function main() {
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

  if (process.argv.includes('--check')) {
    console.log('[build] dictionary.json OK (' + count + ' 条译文)');
    return;
  }

  const json = JSON.stringify({ byName: dict.byName, bySource: dict.bySource }, null, 2);
  const indented = json
    .split('\n')
    .map((line, i) => (i === 0 ? line : '    ' + line))
    .join('\n');
  const block = BEGIN + '\n    const DICT = ' + indented + ';\n' + END;

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
  const after = client.slice(endIdx + END.length);
  fs.writeFileSync(CLIENT_FILE, before + block + after, 'utf8');
  console.log('[build] 已把 dictionary.json (' + count + ' 条译文) 注入 client.js');
}

main();
