#!/usr/bin/env node

// add_meet.mjs — 新增一场 swim meet 到 Firestore `meets` 集合(可按名称+赛季去重)。
//
// 为什么需要它:dashboard 教练端「Add Meet」表单会写同一份 schema,
// 但当 meet 信息来自 PDF(如 PVS 赛程单)时,由 agent 抽取字段后用本脚本写入,
// 避免手工录入出错,也保证重复运行是安全的(幂等)。
//
// 用法:
//   node execution/add_meet.mjs --name "..." --start 2026-10-24 --end 2026-10-25 \
//        --location "..." --season 2026-2027 --source "https://..." [--status Open] \
//        [--dry-run] [--key serviceAccountKey.json] [--allow-duplicate]
//
// 行为:
//   - 校验必填字段与日期格式(YYYY-MM-DD),end >= start
//   - 默认按 name + season 去重;命中则打印已存在文档并退出(退出码 2),不写入
//   - --update <docId>  改为更新指定文档(仅覆盖传入字段)
//   - --dry-run         只打印将要写入的内容,不写库
//
// schema 与 src/pages/dashboard.js 的 meetSaveBtn 保持一致:
//   name, startDate, endDate, location, season, status, sourceUrl, createdAt

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ── 参数解析 ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const NAME = flag('name');
const START = flag('start');
const END = flag('end');
const LOCATION = flag('location');
const SEASON = flag('season');
const SOURCE = flag('source');
const STATUS = flag('status', 'Open');
const UPDATE_ID = flag('update');
const KEY_PATH = resolve(flag('key', 'serviceAccountKey.json'));
const DRY_RUN = has('dry-run');
const ALLOW_DUP = has('allow-duplicate');

// ── 校验 ─────────────────────────────────────────────────────────
const errors = [];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
if (!NAME) errors.push('缺少 --name');
if (!START || !DATE_RE.test(START)) errors.push('--start 必须是 YYYY-MM-DD');
if (!END || !DATE_RE.test(END)) errors.push('--end 必须是 YYYY-MM-DD');
if (!LOCATION) errors.push('缺少 --location');
if (!SEASON || !/^\d{4}-\d{4}$/.test(SEASON)) errors.push('--season 必须是 YYYY-YYYY,例如 2026-2027');
if (START && END && DATE_RE.test(START) && DATE_RE.test(END) && END < START) errors.push('--end 不能早于 --start');
if (SOURCE && !/^https?:\/\//.test(SOURCE)) errors.push('--source 必须是 http(s) URL');
if (errors.length) {
  console.error('❌ 参数错误:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

const meet = { name: NAME, startDate: START, endDate: END, location: LOCATION, season: SEASON, status: STATUS, sourceUrl: SOURCE || null };

// ── 连接 Firestore ───────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${KEY_PATH}\n   ${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();

// ── 去重(同名 + 同赛季) ─────────────────────────────────────────
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const snap = await db.collection('meets').where('season', '==', SEASON).get();
const existing = snap.docs.find((d) => norm(d.data().name) === norm(NAME));

if (existing && !UPDATE_ID && !ALLOW_DUP) {
  const d = existing.data();
  console.error(`⚠ 已存在相同 meet(未写入):docId=${existing.id}`);
  console.error(`   ${d.name} | ${d.startDate} → ${d.endDate} | ${d.location}`);
  console.error('   如需强制新增,加 --allow-duplicate;如需更新,用 --update ' + existing.id);
  process.exit(2);
}

if (DRY_RUN) {
  console.log('🔎 DRY RUN — 将写入以下内容(未写库):');
  console.log(JSON.stringify({ ...meet, createdAt: '<serverTimestamp>' }, null, 2));
  process.exit(0);
}

// ── 写入 ─────────────────────────────────────────────────────────
if (UPDATE_ID) {
  await db.collection('meets').doc(UPDATE_ID).update({ ...meet, updatedAt: FieldValue.serverTimestamp() });
  console.log(`✅ 已更新 meet:docId=${UPDATE_ID}`);
} else {
  const ref = await db.collection('meets').add({ ...meet, createdAt: FieldValue.serverTimestamp() });
  console.log(`✅ 已新增 meet:docId=${ref.id}`);
  console.log(`   ${meet.name} | ${meet.startDate} → ${meet.endDate} | ${meet.location} | season ${meet.season}`);
  if (meet.sourceUrl) console.log(`   source: ${meet.sourceUrl}`);
}
