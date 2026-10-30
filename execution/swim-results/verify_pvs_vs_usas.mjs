/**
 * verify_pvs_vs_usas.mjs — 把 `sync_pvs_results.py` 解析出的 PVS 成绩,和 Firestore 里
 * 已经由 USA Swimming 抓来的成绩**逐条对账**。只读,绝不写 Firestore。
 *
 * 用法:
 *   node execution/swim-results/verify_pvs_vs_usas.mjs                # 全部有本队的场次
 *   node execution/swim-results/verify_pvs_vs_usas.mjs --only 27-26   # 单场
 *   node execution/swim-results/verify_pvs_vs_usas.mjs --verbose      # 逐条打印差异
 *
 * 输入:
 *   .tmp/swim-results/pvs/meets/*.json   (sync_pvs_results.py 的产物)
 *   Firestore `swimResults/{memberId}.meets`  (USAS 抓取管线写的东西)
 *
 * 判定口径:
 *   - PVS `status: ok` 的每一条,必须在 USAS 里找到**同项目、同时间、同名次**的记录 → 否则算错。
 *   - PVS `DQ` / `NS` / `DNF`:USAS 的 `GetSwimmerMeetTimes` 根本不返回这些,所以它们
 *     **天生只会出现在 PVS 一侧**,单独统计,不算错(这正是改用 PVS 的一个收益)。
 *   - USAS 有、PVS 没有的 `ok` 成绩 → 算"缺口",必须解释(接力?别的泳池?).
 *
 * 退出码:0 = 完全对得上;1 = 有差异。
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolvePath(HERE, '../..');
const MEETS_DIR = resolvePath(REPO_ROOT, '.tmp/swim-results/pvs/meets');
const REPORT_PATH = resolvePath(REPO_ROOT, '.tmp/swim-results/verify-report.json');

const args = process.argv.slice(2);
const argOf = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const ONLY = argOf('--only');
const VERBOSE = args.includes('--verbose');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STOP = new Set(['2026', '2027', 'meet', 'invitational', 'open', 'annual', 'site', 'copied', 'the']);

/** "100 FR SCY" -> "100FRSCY" */
const normCode = (c) => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '');

/** "1:15.64" | 75.64 | "33.20" -> 百分秒整数 */
function toCs(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Math.round(v * 100);
  const s = String(v).trim();
  if (!s || /^(0\.00|DQ|NS|DNF|NT|—)$/i.test(s)) return null;
  const parts = s.split(':').map(Number);
  const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  return Number.isFinite(secs) ? Math.round(secs * 100) : null;
}

const fmt = (cs) => (cs == null ? '—' : cs >= 6000
  ? `${Math.floor(cs / 6000)}:${((cs % 6000) / 100).toFixed(2).padStart(5, '0')}`
  : (cs / 100).toFixed(2));

function tokens(s) {
  return String(s || '').toLowerCase().match(/[a-z]{3,}/g)?.filter((t) => !STOP.has(t)) || [];
}

/** 在某个队员的 meets 里找到与这份 PVS 文件对应的那一场。
 *  只靠名字会误配历史同名场次(我们有 4 场 "October Open"),所以月份+日必须对上。 */
function pickMeet(pvsDoc, meetsMap) {
  const start = pvsDoc.meet.startDate;          // "2026-10-24"
  if (!start) return null;
  const [, mm, dd] = start.split('-').map(Number);
  const wantMon = MONTHS[mm - 1];
  const wantDay = dd;
  const wantTokens = new Set(tokens(pvsDoc.meet.name));

  const candidates = [];
  for (const [id, m] of Object.entries(meetsMap || {})) {
    const dm = String(m.meetDates || '').match(/^([A-Za-z]{3})\s+(\d{1,2})/);
    if (!dm || dm[1] !== wantMon || Number(dm[2]) !== wantDay) continue;
    const have = tokens(m.meetName);
    const shared = have.filter((t) => wantTokens.has(t));
    if (!shared.length) continue;
    candidates.push({ id, m, score: shared.length });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

// --------------------------------------------------------------------------- main

let key;
try {
  key = JSON.parse(readFileSync(resolvePath(REPO_ROOT, 'serviceAccountKey.json'), 'utf8'));
} catch (e) {
  console.error(`❌ 读不到 serviceAccountKey.json: ${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();

let files;
try {
  files = readdirSync(MEETS_DIR).filter((f) => f.endsWith('.json'));
} catch {
  console.error(`❌ 没有 ${MEETS_DIR},先跑:python execution/swim-results/sync_pvs_results.py`);
  process.exit(1);
}

const docs = files
  .map((f) => JSON.parse(readFileSync(resolvePath(MEETS_DIR, f), 'utf8')))
  .filter((d) => d.hasOurTeam)
  .filter((d) => !ONLY || d.meet.key === ONLY)
  .sort((a, b) => String(a.meet.startDate).localeCompare(String(b.meet.startDate)));

if (!docs.length) {
  console.log(`没有可对账的场次(有本队参加的)。检查 --only 或先跑 sync_pvs_results.py。`);
  process.exit(0);
}

const rows = [];
const problems = [];
const notes = [];
let stat = { pvsOk: 0, pvsNonOk: 0, matched: 0, usasOnly: 0, pvsOnlyOk: 0, missingMeet: 0, missingDoc: 0 };

for (const doc of docs) {
  const pvs = doc.meet;
  console.log(`\n########## ${pvs.key}  ${pvs.startDate}~${pvs.endDate}  ${pvs.name}`);

  for (const ath of doc.athletes) {
    const ref = db.collection('swimResults').doc(ath.memberId);
    const snap = await ref.get();
    if (!snap.exists) {
      stat.missingDoc++;
      notes.push(`${pvs.key} ${ath.firstName} ${ath.lastName} (${ath.memberId}) 在 Firestore 里没有文档(USAS 从未抓过)`);
      continue;
    }
    const hit = pickMeet(doc, snap.data().meets);
    if (!hit) {
      stat.missingMeet++;
      notes.push(`${pvs.key} ${ath.firstName} ${ath.lastName}:Firestore 里有文档,但没有对应的 USAS 场次`);
      continue;
    }

    const usas = new Map();
    for (const sw of hit.m.swims || []) {
      usas.set(normCode(sw.eventCode), { cs: toCs(sw.swimTime), place: sw.finishPosition ?? null, raw: sw });
    }

    let ok = 0, nonOk = 0, m = 0;
    const seen = new Set();
    for (const sw of ath.swims) {
      const code = normCode(sw.eventCode);
      seen.add(code);
      if (sw.status !== 'ok') { nonOk++; stat.pvsNonOk++; continue; }
      ok++; stat.pvsOk++;
      const u = usas.get(code);
      if (!u) {
        stat.pvsOnlyOk++;
        problems.push(`${pvs.key} ${ath.firstName} ${ath.lastName} ${code}:PVS 有(${sw.timeText})但 USAS 没有`);
        continue;
      }
      m++; stat.matched++;
      const pcs = toCs(sw.seconds);
      if (u.cs !== null && pcs !== null && u.cs !== pcs) {
        problems.push(`${pvs.key} ${ath.lastName} ${code} 时间不符:PVS ${fmt(pcs)} vs USAS ${u.raw.swimTime}`);
      }
      const up = u.place, pp = sw.place;
      if (up !== null && pp !== null && Number(up) !== Number(pp)) {
        problems.push(`${pvs.key} ${ath.lastName} ${code} 名次不符:PVS ${pp} vs USAS ${up}`);
      }
    }
    for (const [code, u] of usas) {
      if (!seen.has(code)) {
        stat.usasOnly++;
        problems.push(`${pvs.key} ${ath.firstName} ${ath.lastName} ${code}:USAS 有(${u.raw.swimTime})但 PVS 没有`);
      }
    }
    rows.push({ meet: pvs.key, athlete: `${ath.firstName} ${ath.lastName}`, id: ath.memberId,
      matched: m, ok, nonOk });
    if (VERBOSE) console.log(`   ${String(ath.lastName).padEnd(22)} 对上 ${m} / PVS ok ${ok} / 非 ok ${nonOk}`);
  }
}

// --------------------------------------------------------------------------- 名册核对
// PVS 文件里的 ID 能不能落到 `registrations` 的人身上,决定将来"写入时该写给谁"。
// 只读一次集合,聊胜于无地给出三类:已登记 / 登记了但没填 USA ID / 完全对不上。
const regSnap = await db.collection('registrations').get();
const regById = new Map();
const regByName = new Map();
for (const d of regSnap.docs) {
  for (const s of d.data().swimmers || []) {
    if (s.deleted) continue;
    const name = `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
    if (s.usaSwimmingId) regById.set(s.usaSwimmingId, name);
    if (!regByName.has(name)) regByName.set(name, []);
    regByName.get(name).push({ id: s.usaSwimmingId || null, dob: s.dob || null });
  }
}
const roster = { registered: [], noId: [], mismatch: [], unknown: [] };
const seenIds = new Map();
for (const doc of docs) {
  for (const a of doc.athletes) {
    if (!seenIds.has(a.memberId)) {
      seenIds.set(a.memberId, {
        name: `${a.firstName} ${a.lastName}`.trim(),
        idKind: a.idKind,
        age: a.age,
      });
    }
  }
}
for (const [id, info] of seenIds) {
  if (regById.has(id)) { roster.registered.push({ id, ...info }); continue; }
  const byName = regByName.get(info.name.toLowerCase());
  if (!byName) { roster.unknown.push({ id, ...info, hint: '名下没有这个队员' }); continue; }
  const withoutId = byName.find((r) => !r.id);
  if (withoutId) { roster.noId.push({ id, ...info, hint: '注册了,但没填 USA ID' }); continue; }
  // 同名同人,但 PVS 文件里的 ID 和注册里的不一样。**不能自动揉合**,列入待确认。
  roster.mismatch.push({
    id, ...info,
    registeredId: byName[0].id,
    hint: info.idKind === 'legacy' ? 'PVS 用的是老格式 ID' : '两边 ID 不同',
  });
}

const bad = problems.length;
console.log('\n' + '='.repeat(78));
console.log(`PVS ok 成绩 ${stat.pvsOk} 条 · 与 USAS 对上 ${stat.matched} 条`);
console.log(`PVS 独有的非 ok 记录(DQ/NS/DNF,USAS 本来就不返回)${stat.pvsNonOk} 条`);
console.log(`PVS 有但 USAS 没有的 ok 成绩 ${stat.pvsOnlyOk} 条 · USAS 有但 PVS 没有 ${stat.usasOnly} 条`);
console.log(`缺 Firestore 文档 ${stat.missingDoc} 人次 · 缺 USAS 场次 ${stat.missingMeet} 人次`);

if (notes.length) {
  console.log(`\n-- 说明性差异(${notes.length},不算失败)`);
  for (const n of notes) console.log('   · ' + n);
}
if (bad) {
  console.log(`\n-- ⛔ 硬差异(${bad})`);
  for (const p of problems) console.log('   ✗ ' + p);
} else {
  console.log('\n✅ 完全对得上:PVS 与 USAS 的每一条 ok 成绩,时间与名次都一致。');
}

console.log(`\n-- 名册核对(PVS 文件里出现的 ${seenIds.size} 个 ID)`);
console.log(`   能对上已填 USA ID 的注册:${roster.registered.length}`);
for (const r of roster.mismatch) {
  console.log(`   ⚠ ID 不一致  ${r.name.padEnd(24)} PVS ${r.id.padEnd(15)} 注册 ${r.registeredId}  (${r.hint})`);
}
for (const r of roster.noId) console.log(`   + 可回填 ID  ${r.id.padEnd(15)} ${r.name}  (${r.hint})`);
for (const r of roster.unknown) console.log(`   ? 对不上人   ${r.id.padEnd(15)} ${r.name}  (${r.hint})`);

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(),
  meets: docs.map((d) => ({ key: d.meet.key, name: d.meet.name, startDate: d.meet.startDate })),
  stat, roster, problems, notes, rows,
}, null, 2));
console.log(`\n报告 → ${REPORT_PATH}`);
process.exit(bad ? 1 : 0);
