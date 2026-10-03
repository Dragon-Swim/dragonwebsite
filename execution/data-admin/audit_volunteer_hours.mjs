#!/usr/bin/env node

// 只读审计线上志愿小时数据(不写任何数据)。
//
// 用法:
//   node execution/audit_volunteer_hours.mjs                 # 当前赛季,人类可读
//   node execution/audit_volunteer_hours.mjs --season 2025-2026
//   node execution/audit_volunteer_hours.mjs --json           # 机器可读
//   node execution/audit_volunteer_hours.mjs --key <路径>      # 指定 service account key
//
// 汇总口径与教练端 Volunteer Hours tab 共用 src/utils/volunteerHours.js,
// 避免两处算法漂移(同 registrationCompleteness 的做法)。
//
// 除了汇总表,还会报数据质量问题:
//   - orphanMeet   : meetId 已不存在(meet 被删但记录残留)
//   - orphanFamily : familyId 已不存在(注册被删,记录只能靠快照显示)
//   - badHours     : hours 缺失/负数/非数字
//   - noSeason     : 既无 meet 又无 season 快照(无法归入任何赛季)

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  VOLUNTEER_COLLECTION,
  buildVolunteerSummary,
  volunteerStats,
} from '../src/utils/volunteerHours.js';

const args = process.argv.slice(2);
const AS_JSON = args.includes('--json');
const keyFlag = args.indexOf('--key');
const KEY_PATH = keyFlag >= 0 && args[keyFlag + 1]
  ? resolve(args[keyFlag + 1])
  : resolve('serviceAccountKey.json');
const seasonFlag = args.indexOf('--season');
const SEASON = seasonFlag >= 0 ? args[seasonFlag + 1] : defaultSeason();

/** 与 dashboard.js getDefaultSeason() 同一规则:9 月切季。 */
function defaultSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** 与 dashboard.js getMeetSeason() 同一规则:显式 season 优先,否则按开始日期推断。 */
function meetSeasonOf(meet) {
  if (meet?.season) return meet.season;
  const s = String(meet?.startDate || meet?.date || '').trim();
  const m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return mo >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`无法读取 service account key: ${KEY_PATH}`);
  console.error('把 Firebase 控制台生成的服务账号密钥放到项目根目录为 serviceAccountKey.json,');
  console.error('或用 --key <路径> 指定。该文件已在 .gitignore 中,切勿提交。');
  process.exit(2);
}

initializeApp({ credential: cert(key) });
const db = getFirestore();

const [meetSnap, regSnap, hourSnap] = await Promise.all([
  db.collection('meets').get(),
  db.collection('registrations').get(),
  db.collection(VOLUNTEER_COLLECTION).get(),
]);

const meets = meetSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const registrations = regSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const hours = hourSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

const meetById = new Map(meets.map((m) => [m.id, m]));
const regById = new Map(registrations.map((r) => [r.id, r]));

// ── 数据质量 ─────────────────────────────────────────────────────
const issues = { orphanMeet: [], orphanFamily: [], badHours: [], noSeason: [] };
for (const rec of hours) {
  const where = `${rec.id} (${rec.familyLabel || rec.familyId || '?'})`;
  if (!rec.familyId) issues.orphanFamily.push(`${where}: 缺 familyId`);
  else if (!regById.has(rec.familyId)) issues.orphanFamily.push(`${where}: registrations/${rec.familyId} 不存在`);

  if (!rec.meetId || !meetById.has(rec.meetId)) {
    issues.orphanMeet.push(`${rec.id}: meetId=${rec.meetId || '(空)'} 已不存在`);
  }

  if (rec.hours != null && (typeof rec.hours !== 'number' || !Number.isFinite(rec.hours) || rec.hours < 0)) {
    issues.badHours.push(`${where}: hours=${JSON.stringify(rec.hours)}`);
  }

  const liveMeet = rec.meetId ? meetById.get(rec.meetId) : null;
  if (!liveMeet && !rec.season) issues.noSeason.push(`${rec.id}: 无 meet 也无 season 快照`);
}

// ── 汇总 ─────────────────────────────────────────────────────────
const rows = buildVolunteerSummary({ meets, registrations, hours, season: SEASON, meetSeasonOf });
const stats = volunteerStats(rows);

if (AS_JSON) {
  console.log(JSON.stringify({
    season: SEASON,
    stats,
    families: rows.map((r) => ({
      familyId: r.familyId,
      parents: r.label,
      kids: r.kidCount,
      kidsNames: r.kids,
      meets: r.meetCount,
      totalHours: r.totalHours,
      perMeet: r.meets.map((m) => ({ meet: m.meetName, date: m.startDate, hours: m.hours, note: m.note })),
    })),
    issues,
    totals: { meets: meets.length, registrations: registrations.length, volunteerRecords: hours.length },
  }, null, 2));
  process.exit(0);
}

const pad = (v, n) => String(v).padEnd(n);
const padNum = (v, n) => String(v).padStart(n);

console.log(`Volunteer Hours 审计 — 赛季 ${SEASON}`);
console.log(`meets ${meets.length} / registrations ${registrations.length} / volunteerHours ${hours.length}`);
console.log(`有小时家庭 ${stats.familiesWithHours} / 无小时家庭 ${stats.familiesWithoutHours} / 覆盖 meet ${stats.meetCount} / 总小时 ${stats.totalHours}`);
console.log('');
console.log(`${pad('父母', 34)}${padNum('孩子', 4)}${padNum('场次', 5)}${padNum('小时', 8)}  孩子姓名`);
console.log('─'.repeat(96));
for (const r of rows) {
  console.log(
    `${pad(r.label.slice(0, 33), 34)}${padNum(r.kidCount, 4)}${padNum(r.meetCount, 5)}${padNum(r.totalHours, 8)}  ${r.kids.join(', ')}`
  );
}

const issueCount = Object.values(issues).reduce((n, list) => n + list.length, 0);
console.log('');
if (issueCount === 0) {
  console.log('数据质量: 无异常。');
} else {
  console.log(`数据质量: ${issueCount} 项待查`);
  for (const [kind, list] of Object.entries(issues)) {
    if (list.length === 0) continue;
    console.log(`  [${kind}] ${list.length} 项`);
    for (const line of list.slice(0, 20)) console.log(`    - ${line}`);
    if (list.length > 20) console.log(`    …还有 ${list.length - 20} 项(用 --json 看全部)`);
  }
}
