#!/usr/bin/env node

// export_cl2.mjs — 把一场比赛的报名导成**主办方要的那个 zip**（内含 `.CL2` + `README.TXT`）。
//
// 和网页上的「📦 Entry file (.cl2)」按钮是**同一套逻辑**
// --------------------------------------------------
// 真正的组装在 `src/utils/meetEntryPackage.js`（纯函数），这里只负责：
// 用 Admin SDK 读 Firestore → 调它 → 把 zip 和裸 `.cl2` 写到磁盘。
// 所以按钮和命令行不会各说一套。
//
// 那为什么还留命令行：
//   1. 没有登录会话的机器（或 CI）也能导出；
//   2. 脚本化 / 对照用 —— 它会同时写出一份裸 `.cl2`，方便和 Team Manager 导出的文件做逐字段比对。
//
// 用到的数据（全部只读）
//   meets/{meetId}                     项目表 / 场次 / 限额 / 达标期
//   meets/{meetId}/entries/*           谁报了哪些项目（默认只导 confirmed）
//   meets/{meetId}/relayEntries/*      接力队（4 棒 + 棒次）
//   registrations/*                    生日 + 结构化姓名（D0/F0 都要）
//   swimResults/{usaId}                最新成绩（**导出时重算 seed time**）
//
// 用法
//   node execution/meet-entry/export_cl2.mjs --meet <docId> [--out <输出目录>] [--dry-run]
//        [--include-unconfirmed]
//        [--team-code PVDRAG] [--team-name "Dragon Swim Team"] [--abbrev DRAG]
//        [--lsc PV] [--city Herndon] [--state VA] [--postal 20171] [--region 1]
//
// 退出码：0 成功；1 有阻断性问题（缺成绩 / 缺 ID / 超限 / 接力队不合格）；2 参数或读取失败。
//
// 已知边界
//   - 只写 SDIF（`.cl2`）。`.hy3` 不做：无公开规范、行尾有校验码。
//   - CITIZEN / 民族 / 学校字段留空 —— 我们没有这些数据，编造比留空更糟。
//   - 接力成绩是教练填的值，尚未按"四棒最快之和"校验（见 docs/meet-entries.md §6.7.1）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { buildEntryPackage, CLUB_DEFAULTS } from '../../src/utils/meetEntryPackage.js';
import { parseSdif } from '../../src/utils/sdif.js';

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const MEET_ID = flag('meet');
const OUT_DIR = resolve(flag('out', '.tmp/meet-entry/export'));
const DRY_RUN = has('dry-run');
const INCLUDE_UNCONFIRMED = has('include-unconfirmed');
const KEY_PATH = resolve(flag('key', 'serviceAccountKey.json'));

if (!MEET_ID) {
  console.error('❌ 缺少 --meet <meetId>');
  process.exit(2);
}

const CLUB = {
  ...CLUB_DEFAULTS,
  teamCode: flag('team-code', CLUB_DEFAULTS.teamCode),
  name: flag('team-name', CLUB_DEFAULTS.name),
  abbrev: flag('abbrev', CLUB_DEFAULTS.abbrev),
  lsc: flag('lsc', CLUB_DEFAULTS.lsc),
  city: flag('city', CLUB_DEFAULTS.city),
  state: flag('state', CLUB_DEFAULTS.state),
  postal: flag('postal', CLUB_DEFAULTS.postal),
  region: flag('region', CLUB_DEFAULTS.region),
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
const entries = entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

const relaySnap = await db.collection('meets').doc(MEET_ID).collection('relayEntries').get();
const relays = relaySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

// 生日与结构化姓名（D0/F0 都要；entries 里只存了姓名快照）
const regsSnap = await db.collection('registrations').get();
const swimmerById = {};
for (const doc of regsSnap.docs) {
  for (const s of doc.data().swimmers || []) {
    const id = String(s.usaSwimmingId || '').trim().toUpperCase();
    if (id) swimmerById[id] = s;
  }
}

const ids = [...new Set(entries.map((e) => String(e.usaSwimmingId || '').trim().toUpperCase()).filter(Boolean))];
const bestTimesById = {};
await Promise.all(ids.map(async (id) => {
  const snap = await db.collection('swimResults').doc(id).get();
  bestTimesById[id] = (snap.exists ? snap.data().bestTimes : []) || [];
}));

// ── 组装（与网页按钮同一套）────────────────────────────────────────────
const pkg = buildEntryPackage({
  meet, entries, relays, swimmerById, bestTimesById,
  club: CLUB, now: new Date(), includeUnconfirmed: INCLUDE_UNCONFIRMED,
});

const s = pkg.summary || {};
console.log(`\n比赛: ${meet.name || '(未命名)'}  ${meet.startDate || '?'} → ${meet.endDate || '?'}`);
console.log(`队  : ${CLUB.teamCode} / ${CLUB.name} / LSC ${CLUB.lsc}`);
console.log(`报名: ${s.swimmerCount ?? 0} 人 / ${s.rowCount ?? 0} 项` +
  `  (达标 ${s.qualified ?? 0} · bonus ${s.bonusOnly ?? 0} · 手填 ${s.manual ?? 0} · 缺成绩 ${s.missing ?? 0})`);
console.log(`刷新: ${s.refreshed ?? 0} 行的成绩比提交时更新（导出用的是最新成绩）`);
if (s.notConfirmed) console.log(`未确认: ${s.notConfirmed} 份未进文件`);
console.log(`接力: ${pkg.relayCount ?? 0} 个队`);

if (!pkg.ok) {
  console.error('\n❌ 有阻断性问题，没有生成文件：');
  for (const err of pkg.errors) {
    const bits = [err.code, err.swimmer, err.eventCode, err.letter, err.day, err.count, err.detail]
      .filter((v) => v !== undefined && v !== null && v !== '').join(' ');
    console.error('   - ' + bits);
  }
  process.exit(1);
}

const records = parseSdif(pkg.cl2Text);
const counts = {};
for (const r of records) counts[r.type] = (counts[r.type] || 0) + 1;
console.log(`\n.cl2 : ${records.length} 条记录 ${JSON.stringify(counts)}  每行 ${records[0].raw.length} 字节`);
console.log(`文件名: ${pkg.fileName}`);

if (DRY_RUN) {
  console.log('\n🔎 DRY RUN — 未写文件。README 预览：');
  console.log(pkg.readme.split('\r\n').slice(0, 12).map((l) => '   ' + l).join('\n'));
  process.exit(0);
}

// ── 写盘：zip（给主办方）+ 裸 .cl2（给 diff / 人工看）───────────────────
mkdirSync(OUT_DIR, { recursive: true });
const zipPath = resolve(OUT_DIR, pkg.fileName);
const cl2Path = resolve(OUT_DIR, pkg.cl2Name);
writeFileSync(zipPath, Buffer.from(pkg.zipBytes));
writeFileSync(cl2Path, pkg.cl2Text, 'latin1');   // SDIF 是单字节格式

console.log(`\n✅ ${zipPath}`);
console.log(`   ${cl2Path}   (裸文件，方便和 Team Manager 的导出做逐字段比对)`);
console.log('   下一步：先把 zip 里的 .cl2 发给懂行的人/主办方**试导入**，说明这是试版，正式版以截止前提交的为准');
