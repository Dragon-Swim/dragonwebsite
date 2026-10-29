#!/usr/bin/env node

// export_cl2.mjs — 把一场比赛的报名导成 SDIF v3 `.cl2`（Hy-Tek Meet Manager 认的报名文件）。
//
// 为什么是命令行而不是网页按钮
// --------------------------
// 这个文件的接收方是主办方的 Meet Manager，我们还没拿到"他们能吃我们生成的文件"
// 的实证（见 docs/meet-entry-export-feasibility.md §7 Gate B）。在拿到之前，
// 让教练跑一条可复查、可 diff 的命令，比在界面上加一个"一键提交"按钮更稳妥：
// 生成的文件留在 .tmp 里，先人工看、再发给主办方试导入。
//
// 用到的数据（全部只读）
//   meets/{meetId}                     项目表 / 场次 / 限额 / 达标期
//   meets/{meetId}/entries/*           谁报了哪些项目（只导 confirmed）
//   registrations/*                    生日 + 结构化姓名（D0 需要生日）
//   swimResults/{usaId}                最新成绩（**导出时重算 seed time**）
//
// 用法
//   node execution/meet-entry/export_cl2.mjs --meet <docId> [--out .tmp/.../x.cl2]
//        [--dry-run] [--include-unconfirmed]
//        [--team-code PVDRAG] [--team-name "Dragon Swim Team"] [--abbrev DRAG]
//        [--city Herndon] [--state VA] [--postal 20171] [--region 1]
//
// 退出码：0 成功；1 有阻断性问题（缺成绩/缺 ID/超限），2 参数或读取失败。
//
// 已知边界
//   - **只导个人项目**。接力需要 E0/F0 + 棒次名单，站点还没有接力数据模型
//     （样本已解码，见备忘 §11）。
//   - CITIZEN / 民族 / 学校这些字段留空 —— 我们没有这些数据，编造比留空更糟。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { buildExportRows, validateExport, summarizeExport } from '../../src/utils/meetEntryExport.js';
import { buildEntrySdif, parseSdif } from '../../src/utils/sdif.js';

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const MEET_ID = flag('meet');
const OUT = flag('out', `.tmp/meet-entry/export/${flag('meet') || 'meet'}.cl2`);
const DRY_RUN = has('dry-run');
const INCLUDE_UNCONFIRMED = has('include-unconfirmed');
const KEY_PATH = resolve(flag('key', 'serviceAccountKey.json'));

if (!MEET_ID) {
  console.error('❌ 缺少 --meet <meetId>');
  process.exit(2);
}

// 队信息：默认值来自 club 的公开资料，可用 flag 覆盖。写进 C1 记录。
const CLUB = {
  teamCode: flag('team-code', 'PVDRAG'),
  name: flag('team-name', 'Dragon Swim Team'),
  abbrev: flag('abbrev', 'DRAG'),
  city: flag('city', 'Herndon'),
  state: flag('state', 'VA'),
  postal: flag('postal', '20171'),
  region: flag('region', '1'),
};

let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 读不到 service account key:${KEY_PATH}\n   ${e.message}`);
  process.exit(2);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();

// ── 读数据 ───────────────────────────────────────────────────────────────
const meetSnap = await db.collection('meets').doc(MEET_ID).get();
if (!meetSnap.exists) {
  console.error(`❌ meets/${MEET_ID} 不存在`);
  process.exit(2);
}
const meet = { id: meetSnap.id, ...meetSnap.data() };
if (!Array.isArray(meet.events) || !meet.events.length) {
  console.error('❌ 这场 meet 没有 events 项目表 —— 先用 parse_hytek_events.py + add_meet.mjs 写入');
  process.exit(2);
}

const entriesSnap = await db.collection('meets').doc(MEET_ID).collection('entries').get();
const rawEntries = entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

// 生日与结构化姓名：D0 需要生日，姓名要用 "Last, First MI"
const regsSnap = await db.collection('registrations').get();
const byUsaId = new Map();
for (const doc of regsSnap.docs) {
  for (const s of doc.data().swimmers || []) {
    const id = String(s.usaSwimmingId || '').trim().toUpperCase();
    if (id) byUsaId.set(id, s);
  }
}

const bestTimesById = {};
await Promise.all([...new Set(rawEntries.map((e) => String(e.usaSwimmingId || '').trim()))].filter(Boolean).map(async (id) => {
  const snap = await db.collection('swimResults').doc(id).get();
  bestTimesById[id] = (snap.exists ? snap.data().bestTimes : []) || [];
}));

// ── 组行（导出时重算 seed time）────────────────────────────────────────
const built = buildExportRows({
  meet,
  entries: rawEntries,
  bestTimesById,
  statuses: INCLUDE_UNCONFIRMED ? ['confirmed', 'submitted', 'draft'] : ['confirmed'],
});
const validation = validateExport({ rows: built.rows, meet, excluded: built.excluded, noId: built.noId });
const summary = summarizeExport({ rows: built.rows, excluded: built.excluded, noId: built.noId });

// 把 D0 还需要的字段补上（生日、结构化姓名）——导出行里没有它们
const enriched = built.rows.map((row) => {
  const sw = byUsaId.get(String(row.usaSwimmingId || '').trim().toUpperCase()) || {};
  return {
    ...row,
    dob: row.dob || sw.dob || null,
    lastName: sw.lastName || row.lastName,
    firstName: sw.firstName || row.firstName,
    middleInitial: sw.middleInitial || '',
  };
});

console.log(`\n比赛: ${meet.name || '(未命名)'}  ${meet.startDate || '?'} → ${meet.endDate || '?'}`);
console.log(`队  : ${CLUB.teamCode} / ${CLUB.name}`);
console.log(`报名: ${summary.swimmerCount} 人 / ${summary.rowCount} 项  (达标 ${summary.qualified} · bonus ${summary.bonusOnly} · 手填 ${summary.manual} · 缺成绩 ${summary.missing})`);
console.log(`刷新: ${summary.refreshed} 行的成绩比提交时更新（导出用的是最新成绩）`);
if (summary.notConfirmed) console.log(`未确认: ${summary.notConfirmed} 份未进文件（${built.excluded.map((e) => `${e.swimmerName}: ${e.reason}`).join('; ')}）`);
if (summary.noUsaId) console.log(`缺 USA ID: ${summary.noUsaId} 人`);

if (validation.errors.length) {
  console.error('\n❌ 阻断性问题，未生成文件：');
  for (const err of validation.errors) {
    console.error(`   - ${err.code}: ${err.swimmer || ''} ${err.day || ''} ${err.count ?? ''} ${err.detail || ''}`.trim());
  }
  process.exit(1);
}
if (validation.warnings.length) {
  console.log('\n注意:');
  for (const w of validation.warnings) console.log(`   ! ${w.code}: ${w.detail || ''} ${w.count ?? ''}`.trim());
}

// 生日缺失会让 D0 的 M2 字段为空 —— 提醒但不阻断（主办方多半还能对上人）
const noDob = enriched.filter((r) => !r.dob);
if (noDob.length) console.log(`\n⚠ ${new Set(noDob.map((r) => r.usaSwimmingId)).size} 人的生日缺失，D0 的生日字段会留空`);

// ── 生成 ─────────────────────────────────────────────────────────────────
/**
 * `meets.location` is one free-text line ("Venue, 123 Main St, Boyds, MD 20841").
 * B1 wants address / city / state / postal separately, so parse the tail and
 * blank the rest rather than slicing the whole string into the 20-byte city field
 * (which is what a naive `city: meet.location` does, and it looks like garbage).
 */
function parseLocation(location) {
  const parts = String(location || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { address1: parts[0] || '', city: '', state: '', postal: '' };
  const tail = parts[parts.length - 1];
  const m = /^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/.exec(tail);
  const city = m ? parts[parts.length - 2] : tail;
  return {
    address1: parts.slice(0, m ? parts.length - 2 : parts.length - 1).join(', '),
    city,
    state: m ? m[1] : '',
    postal: m ? m[2] : '',
  };
}

const venue = parseLocation(meet.location);

const text = buildEntrySdif({
  file: { contactName: CLUB.name, contactPhone: '', fileDate: new Date() },
  meet: {
    name: meet.name, startDate: meet.startDate, endDate: meet.endDate,
    address1: venue.address1, city: venue.city, state: venue.state, postal: venue.postal,
    courses: meet.courses || ['SCY'],
  },
  club: CLUB,
  entries: enriched,
});

const records = parseSdif(text);
const counts = {};
for (const r of records) counts[r.type] = (counts[r.type] || 0) + 1;
console.log(`\n生成: ${records.length} 条记录 ${JSON.stringify(counts)}`);
console.log(`      每行 ${records[0].raw.length} 字节, CRLF 结尾`);

if (DRY_RUN) {
  console.log('\n🔎 DRY RUN — 未写文件。前 6 行预览:');
  records.slice(0, 6).forEach((r) => console.log('   ' + r.raw));
  process.exit(0);
}

const outPath = resolve(OUT);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, text, 'latin1');   // SDIF 是单字节格式
console.log(`\n✅ 写出: ${outPath}`);
console.log('   下一步：先自己打开看一眼，再发主办方试导入（说明是试导入，以正式截止前提交的为准）');
