#!/usr/bin/env node

// add_meet.mjs — 新增一场 swim meet 到 Firestore `meets` 集合(可按名称+赛季去重)。
//
// 为什么需要它:dashboard 教练端「Add Meet」表单会写同一份 schema,
// 但当 meet 信息来自 PDF(如 PVS 赛程单)时,由 agent 抽取字段后用本脚本写入,
// 避免手工录入出错,也保证重复运行是安全的(幂等)。
//
// 用法:
//   # ① 只有基本信息(老用法)
//   node execution/data-admin/add_meet.mjs --name "..." --start 2026-10-24 --end 2026-10-25 \
//        --location "..." --season 2026-2027 --source "https://..." [--status Open] \
//        [--dry-run] [--key serviceAccountKey.json] [--allow-duplicate]
//
//   # ② 从赛程单解析结果整场写入(含项目表 + 达标线,供家长自助报名用)
//   python execution/meet-entry/parse_pvs_meet_pdf.py <pdf> -o .tmp/.../events.json
//   node execution/data-admin/add_meet.mjs --from-json .tmp/.../events.json [--dry-run]
//
// 行为:
//   - 校验必填字段与日期格式(YYYY-MM-DD),end >= start
//   - 默认按 name + season 去重;命中则打印已存在文档并退出(退出码 2),不写入
//   - --update <docId>  改为更新指定文档(仅覆盖传入字段)
//   - --events-only     配合 --update:只写「报名相关」字段(项目表/场次/限额/费用/截止/
//                       年龄口径/course/sanction/host/bonus/接力限报),**不动**
//                       name/location/sourceUrl/status/startDate/endDate/season。
//                       为什么要这个:主办方的 .ev3 里名字和场地常是缩写甚至占位符
//                       (27-29 就是 "add your facility" / "your city"),而人工录入的
//                       那份更准确 —— 补项目表时不该把好数据覆盖成差的。
//   - --dry-run         只打印将要写入的内容,不写库
//
// schema 与 src/pages/dashboard.js 的 meetSaveBtn 保持一致:
//   name, startDate, endDate, location, season, status, sourceUrl, createdAt
// --from-json 额外写(缺省不写,老文档不受影响):
//   sessions[], events[], sanction, host, entryDeadline, entryFeePerEvent,
//   limits{maxEvents,maxPerDay}, qualifyingPeriodStart, noTimeEntries,
//   courses[], relayLimitPerClub, bonusRule, ageGroups[], ageDeterminedOn
//
// ⚠ events 是「项目 × 年龄组 × 性别」的**平铺行**,不是「项目」。
//   同一个 eventNo 可以有多行(1650/1000 的 13-14 与 Open 共用一个号),
//   所以任何按 eventNo 汇总的地方都要先 groupBy。

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

const FROM_JSON = flag('from-json');
const NAME = flag('name');
const START = flag('start');
const END = flag('end');
const LOCATION = flag('location');
const SEASON = flag('season');
const SOURCE = flag('source');
const STATUS = flag('status', 'Open');
const UPDATE_ID = flag('update');
// --events-only:补项目表时只写报名相关字段,别把人工录入的名字/场地覆盖成 .ev3 的缩写值。
// 「比赛是否已结束」不靠 status 判断(dashboard 按日期分桶,见 src/pages/dashboard.js
// 里「不能用 meet.status」那段),所以这里也不需要为过期比赛发明一个 Closed 状态。
const EVENTS_ONLY = has('events-only');
const EVENTS_ONLY_FIELDS = [
  'events', 'sessions', 'ageGroups', 'ageDeterminedOn', 'limits', 'entryDeadline',
  'entryFeePerEvent', 'qualifyingPeriodStart', 'courses', 'sanction', 'host',
  'relayLimitPerClub', 'bonusRule',
];
const KEY_PATH = resolve(flag('key', 'serviceAccountKey.json'));
const DRY_RUN = has('dry-run');
const ALLOW_DUP = has('allow-duplicate');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const errors = [];
let meet;

if (FROM_JSON) {
  // ── 从解析结果整场写入 ─────────────────────────────────────────
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(resolve(FROM_JSON), 'utf8'));
  } catch (e) {
    console.error(`❌ 读不到 / 解析不了 JSON:${FROM_JSON}\n   ${e.message}`);
    process.exit(1);
  }
  if (!parsed.name) errors.push('JSON 缺少 name');
  if (!DATE_RE.test(String(parsed.startDate || ''))) errors.push('JSON startDate 必须是 YYYY-MM-DD');
  if (!DATE_RE.test(String(parsed.endDate || ''))) errors.push('JSON endDate 必须是 YYYY-MM-DD');
  if (!parsed.location) errors.push('JSON 缺少 location');
  if (!/^\d{4}-\d{4}$/.test(String(parsed.season || ''))) errors.push('JSON season 必须是 YYYY-YYYY');
  if (!Array.isArray(parsed.events) || parsed.events.length === 0) errors.push('JSON events 为空');
  if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) errors.push('JSON sessions 为空');
  if (!parsed.entryDeadline) errors.push('JSON 缺少 entryDeadline');

  // 每条项目行都必须能用来判断"能不能报",缺字段就整批拒绝(不做静默兜底)。
  for (const [i, ev] of (parsed.events || []).entries()) {
    const where = `events[${i}]`;
    if (!Number.isInteger(ev.eventNo)) errors.push(`${where} eventNo 必须是整数`);
    if (!['F', 'M', 'X'].includes(ev.gender)) errors.push(`${where} gender 必须是 F/M/X(X = 混合项目)`);
    if (!ev.ageGroup) errors.push(`${where} 缺少 ageGroup`);
    if (!Number.isFinite(ev.distance)) errors.push(`${where} distance 必须是数字`);
    if (!ev.stroke) errors.push(`${where} 缺少 stroke`);
    if (!ev.sessionId) errors.push(`${where} 缺少 sessionId`);
    if (!ev.standards || typeof ev.standards !== 'object') errors.push(`${where} 缺少 standards`);
    if (errors.length > 20) break;   // 别刷屏
  }

  if (errors.length) {
    console.error('❌ 参数错误:\n  - ' + errors.join('\n  - '));
    process.exit(1);
  }

  meet = {
    name: parsed.name,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    location: parsed.location,
    season: parsed.season,
    status: parsed.status || STATUS,
    sourceUrl: parsed.sourceUrl || null,
    sanction: parsed.sanction || null,
    host: parsed.host || null,
    entryDeadline: parsed.entryDeadline,
    entryFeePerEvent: parsed.entryFeePerEvent ?? null,
    limits: parsed.limits || { maxEvents: parsed.maxIndividualEvents ?? null, maxPerDay: parsed.maxIndividualEventsPerDay ?? null },
    qualifyingPeriodStart: parsed.qualifyingPeriodStart || null,
    noTimeEntries: parsed.noTimeEntries === false ? false : null,
    courses: parsed.courses || ['SCY'],
    relayLimitPerClub: parsed.relayLimitPerClub ?? null,
    bonusRule: parsed.bonusRule || null,
    ageGroups: parsed.ageGroups || [],
    ageDeterminedOn: parsed.ageDeterminedOn || parsed.startDate,
    sessions: parsed.sessions,
    events: parsed.events,
  };
} else {
  // ── 只有基本信息(老用法) ──────────────────────────────────────
  if (!NAME) errors.push('缺少 --name');
  if (!START || !DATE_RE.test(START)) errors.push('--start 必须是 YYYY-MM-DD');
  if (!END || !DATE_RE.test(END)) errors.push('--end 必须是 YYYY-MM-DD');
  if (!LOCATION) errors.push('缺少 --location');
  if (!SEASON || !/^\d{4}-\d{4}$/.test(SEASON)) errors.push('--season 必须是 YYYY-YYYY,例如 2026-2027');
  if (SOURCE && !/^https?:\/\//.test(SOURCE)) errors.push('--source 必须是 http(s) URL');
  if (errors.length) {
    console.error('❌ 参数错误:\n  - ' + errors.join('\n  - '));
    process.exit(1);
  }
  meet = { name: NAME, startDate: START, endDate: END, location: LOCATION, season: SEASON, status: STATUS, sourceUrl: SOURCE || null };
}

if (meet.startDate && meet.endDate && DATE_RE.test(meet.startDate) && DATE_RE.test(meet.endDate) && meet.endDate < meet.startDate) {
  console.error('❌ --end 不能早于 --start');
  process.exit(1);
}
if (meet.sourceUrl && !/^https?:\/\//.test(meet.sourceUrl)) {
  console.error('❌ sourceUrl 必须是 http(s) URL');
  process.exit(1);
}

const { name: MEET_NAME, season: MEET_SEASON } = meet;

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
const snap = await db.collection('meets').where('season', '==', MEET_SEASON).get();
const existing = snap.docs.find((d) => norm(d.data().name) === norm(MEET_NAME));

if (existing && !UPDATE_ID && !ALLOW_DUP) {
  const d = existing.data();
  console.error(`⚠ 已存在相同 meet(未写入):docId=${existing.id}`);
  console.error(`   ${d.name} | ${d.startDate} → ${d.endDate} | ${d.location}`);
  console.error('   如需强制新增,加 --allow-duplicate;如需更新,用 --update ' + existing.id);
  process.exit(2);
}

if (EVENTS_ONLY && !UPDATE_ID && !DRY_RUN) {
  console.error('❌ --events-only 必须配 --update <docId>(它是"给已有文档补项目表",不是新增)');
  process.exit(1);
}

if (DRY_RUN) {
  console.log('🔎 DRY RUN — 将写入以下内容(未写库):');
  const target = EVENTS_ONLY && UPDATE_ID
    ? Object.fromEntries(EVENTS_ONLY_FIELDS.filter((k) => meet[k] !== undefined).map((k) => [k, meet[k]]))
    : meet;
  const shown = FROM_JSON
    ? { ...target, events: `[${(target.events || []).length} 条,已省略]`, sessions: `[${(target.sessions || []).length} 条,已省略]` }
    : target;
  if (EVENTS_ONLY && UPDATE_ID) {
    console.log(`   (--events-only → 只更新 docId=${UPDATE_ID} 的 ${Object.keys(target).length} 个报名字段, created/updatedAt 由服务端补)`);
    console.log(`   保留未动: ${['name', 'location', 'sourceUrl', 'status', 'startDate', 'endDate', 'season'].join(', ')}`);
    console.log(JSON.stringify(shown, null, 2));
    process.exit(0);
  }
  console.log(JSON.stringify({ ...shown, createdAt: '<serverTimestamp>' }, null, 2));
  process.exit(0);
}

// ── 写入 ─────────────────────────────────────────────────────────
if (UPDATE_ID) {
  const patch = EVENTS_ONLY
    ? Object.fromEntries(EVENTS_ONLY_FIELDS.filter((k) => meet[k] !== undefined).map((k) => [k, meet[k]]))
    : meet;
  const before = (await db.collection('meets').doc(UPDATE_ID).get()).data() || {};
  await db.collection('meets').doc(UPDATE_ID).update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  console.log(`✅ 已更新 meet:docId=${UPDATE_ID}` + (EVENTS_ONLY ? '(--events-only)' : ''));
  if (EVENTS_ONLY) {
    for (const k of Object.keys(patch)) {
      const old = before[k];
      const oldText = Array.isArray(old) ? `Array(${old.length})` : JSON.stringify(old) ?? 'undefined';
      const newText = Array.isArray(patch[k]) ? `Array(${patch[k].length})` : JSON.stringify(patch[k]) ?? 'undefined';
      console.log(`   ${k.padEnd(22)} ${oldText} → ${newText}`);
    }
    console.log(`   未动: name / location / sourceUrl / status / startDate / endDate / season`);
  }
} else {
  const ref = await db.collection('meets').add({ ...meet, createdAt: FieldValue.serverTimestamp() });
  console.log(`✅ 已新增 meet:docId=${ref.id}`);
  console.log(`   ${meet.name} | ${meet.startDate} → ${meet.endDate} | ${meet.location} | season ${meet.season}`);
  if (meet.sourceUrl) console.log(`   source: ${meet.sourceUrl}`);
  if (meet.events) {
    console.log(`   events: ${meet.events.length} 行 / ${new Set(meet.events.map((e) => e.eventNo)).size} 个项目号`);
  }
}
