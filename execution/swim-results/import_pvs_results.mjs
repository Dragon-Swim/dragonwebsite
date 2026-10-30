#!/usr/bin/env node
/**
 * import_pvs_results.mjs — 把 `sync_pvs_results.py` 解析出的 PVS 官方成绩包**写进 Firestore**。
 *
 * 与同目录另外两个工具的分工:
 *   sync_pvs_results.py     只读,PVS zip → .tmp/swim-results/pvs/meets/*.json
 *   verify_pvs_vs_usas.mjs  只读,解析结果 ↔ 库里 USAS 成绩逐条对账
 *   import_pvs_results.mjs  唯一会写库的那个(默认 dry-run,`--commit` 才落盘)
 *
 * 用法(从仓库根跑):
 *   node execution/swim-results/import_pvs_results.mjs                  # dry-run,打印计划写入的内容
 *   node execution/swim-results/import_pvs_results.mjs --only 27-26     # 单场
 *   node execution/swim-results/import_pvs_results.mjs --splits         # 顺带把分段补进已有成绩
 *   node execution/swim-results/import_pvs_results.mjs --commit         # 真的写(先自动备份)
 *
 * 写库口径(2026-10-30 与教练确认 + docs/swim-results-fetch.md §13.6)
 * ------------------------------------------------------------------
 * · 只有能确定「这个人是谁」的才写;写库的键永远是**注册表里的 USA Swimming ID**。
 *     - reg       PVS 文件里的 ID == 注册 ID                     → 写
 *     - mapped    PVS 文件里的 ID 不是有效会员号(TM 名册残留),但姓名唯一对上
 *                 一个已填 ID 的注册 → 写到注册 ID 下,PVS 原值存进 `sourceId`
 *     - no-id     姓名对上的人注册了但 usaSwimmingId 是空的        → **不写**,等家长补
 *     - unknown   名册里没有这个人                                  → **不写**
 *     - ambiguous 同名多人 / 性别或年龄对不上 / 同场成绩验不过       → **不写**
 *   所以「没注册」「没填 ID」的孩子永远不会被写进来,补好之后重跑本脚本即可。
 *
 * · PVS 独有的内容才入:USAS 的 `GetSwimmerMeetTimes` 从不返回 DQ / 弃赛。DQ 入
 *   (`swimTime: null` + `status: 'dq'` + `dqCode`);弃赛 / NS(报名未游)**不入**,
 *   否则会出现一场「0 条有效成绩」的空 meet(§13.5)。
 *
 * · 已有的 ok 成绩**不覆盖**,只补 PVS 多出来的东西(默认只补 DQ;`--splits` 才补分段)。
 *
 * · meet 的键:库里若已有一场「同开始日期 + 赛事名有共同词」的场次,就复用它原来的键
 *   (例:USAS 的 `289349` / `288848`),这样家长端不会出现两遍;没有才用 `pvs-<PVS key>`
 *   (例 `pvs-27-27`)。用 `pvs-` 前缀是为了和 USAS 的纯数字 ID 一眼分开。
 *
 * 安全 / 可重跑
 * ------------
 * · 默认 dry-run;`--commit` 前先把受影响的整份文档备份到 `.tmp/backups/swimResults-<时间>.json`。
 * · 幂等:第二次跑会认出已经写过的成绩(同项目 + 同时间 / 同 DQ),不会重复插入。
 * · 不触碰 `bestTimes`(库里还有 PVS 覆盖不到的历史场次,重算会丢;等专门做)。
 * · 只写 `status: ok` 的场次;失败的 meet(USAS 侧 `status: failed/empty`)不会被这里「洗白」。
 *
 * 退出码:0 = 正常;1 = 有运动员被跳过(仅在 --commit 时不影响退出码)或运行出错。
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { normalizeSortKey } from '../../src/utils/swimmerSort.js';
import { activeSwimmers } from '../../src/utils/registrationCompleteness.js';
import { getTimeStandardLevels } from '../../src/data/timeStandards.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../..');

// ── 参数 ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const PVS_DIR = resolve(REPO_ROOT, flag('--pvs', '.tmp/swim-results/pvs'));
const KEY_PATH = resolve(REPO_ROOT, flag('--key', 'serviceAccountKey.json'));
const REPORT_PATH = resolve(REPO_ROOT, flag('-o', '.tmp/swim-results/import-report.json'));
const BACKUP_DIR = resolve(REPO_ROOT, '.tmp/backups');
const ONLY = flag('--only');
const COMMIT = args.includes('--commit');
const WITH_SPLITS = args.includes('--splits');
const VERBOSE = args.includes('--verbose');

// ── 小工具 ──────────────────────────────────────────────────────────────────
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const normCode = (c) => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
const csOf = (v) => {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v * 100) : null;
  const s = String(v).trim();
  if (!s || /^(0\.00|DQ|NS|DNF|NT|—)$/i.test(s)) return null;
  const p = s.split(':').map(Number);
  const sec = p.length === 2 ? p[0] * 60 + p[1] : p[0];
  return Number.isFinite(sec) ? Math.round(sec * 100) : null;
};
const fmtTime = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  if (seconds < 60) return seconds.toFixed(2);
  const m = Math.floor(seconds / 60);
  return `${m}:${(seconds - m * 60).toFixed(2).padStart(5, '0')}`;
};
/** "2026-10-24" → { mon: 'Oct', day: 24, year: 2026 } */
const parseIso = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return null;
  return { year: +m[1], mon: MON[+m[2] - 1], day: +m[3] };
};
/** 与 USAS 落库一致的 "Oct 24 - Oct 25"(同一天只写一个日期) */
const datesLabel = (start, end) => {
  const s = parseIso(start); const e = parseIso(end || start);
  if (!s) return '';
  if (!e || (e.mon === s.mon && e.day === s.day)) return `${s.mon} ${String(s.day).padStart(2, '0')}`;
  return `${s.mon} ${String(s.day).padStart(2, '0')} - ${e.mon} ${String(e.day).padStart(2, '0')}`;
};
/** 赛季约定与站内一致:9 月–次年 8 月,`season` 用 USAS 的 "2026/2027" 写法 */
const seasonOf = (iso) => {
  const p = parseIso(iso);
  if (!p) return { season: null, seasonYear: null };
  const startYear = +(iso.slice(5, 7)) >= 9 ? p.year : p.year - 1;
  return { season: `${startYear}/${startYear + 1}`, seasonYear: String(startYear + 1) };
};
const STOP = new Set(['2026', '2027', 'meet', 'invitational', 'open', 'annual', 'site', 'copied', 'the', 'pv', 'pvs']);
const tokens = (s) => String(s || '').toLowerCase().match(/[a-z]{3,}/g)?.filter((t) => !STOP.has(t)) || [];
const nameOf = (a) => [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
const ageOn = (dob, iso) => {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dob || ''));
  const p = parseIso(iso);
  if (!d || !p) return null;
  let age = p.year - +d[1];
  if (+d[2] > MON.indexOf(p.mon) + 1 || (+d[2] === MON.indexOf(p.mon) + 1 && +d[3] > p.day)) age--;
  return age;
};

// ── 数据 ────────────────────────────────────────────────────────────────────
const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
initializeApp({ credential: cert(key) });
const db = getFirestore();

const meetsDir = resolve(PVS_DIR, 'meets');
if (!existsSync(meetsDir)) {
  console.error(`❌ 没有 ${meetsDir},先跑:python execution/swim-results/sync_pvs_results.py`);
  process.exit(1);
}
const docs = readdirSync(meetsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(resolve(meetsDir, f), 'utf8')))
  .filter((d) => d.hasOurTeam)
  .filter((d) => !ONLY || d.meet.key === ONLY || d.meet.number === ONLY)
  .sort((a, b) => String(a.meet.startDate).localeCompare(String(b.meet.startDate)));
if (!docs.length) {
  console.log('没有可导入的场次(有本队参加的)。检查 --only,或先跑 sync_pvs_results.py。');
  process.exit(0);
}

const regSnap = await db.collection('registrations').get();
const roster = [];
for (const r of regSnap.docs) {
  for (const s of activeSwimmers({ id: r.id, ...r.data() })) {
    roster.push({
      regId: r.id,
      swimmer: s,
      name: [s.firstName, s.lastName].filter(Boolean).join(' ').trim(),
      key: normalizeSortKey([s.firstName, s.lastName].filter(Boolean).join(' ')),
      id: String(s.usaSwimmingId || '').trim(),
      gender: s.gender || null,
      dob: s.dob || null,
    });
  }
}
const regById = new Map(roster.filter((x) => x.id).map((x) => [x.id.toUpperCase(), x]));
const regByName = new Map();
for (const x of roster) {
  if (!x.key) continue;
  if (!regByName.has(x.key)) regByName.set(x.key, []);
  regByName.get(x.key).push(x);
}

// ── 匹配:PVS 里的一个运动员 → 注册表里的谁(或谁都不是)──────────────────────
function matchAthlete(a) {
  const byId = regById.get(String(a.memberId || '').toUpperCase());
  if (byId) return { kind: 'reg', target: byId };

  const sameName = regByName.get(normalizeSortKey(nameOf(a))) || [];
  if (!sameName.length) return { kind: 'unknown' };
  const noId = sameName.filter((x) => !x.id);
  const withId = sameName.filter((x) => x.id);
  if (noId.length && !withId.length) return { kind: 'no-id', target: noId[0] };
  if (withId.length !== 1) return { kind: 'ambiguous', why: `同名 ${sameName.length} 人` };

  const t = withId[0];
  // 性别必须能对上(两边都有值时);年龄按比赛日算,允许 ±1(TM 里写的是比赛首日年龄)
  if (t.gender && a.sex && String(t.gender)[0].toLowerCase() !== String(a.sex)[0].toLowerCase()) {
    return { kind: 'ambiguous', why: `性别不符:注册 ${t.gender} / 文件 ${a.sex}` };
  }
  if (t.dob && a.age != null) {
    const want = ageOn(t.dob, a.swims?.[0]?.swimDate || '');
    if (want != null && Math.abs(want - a.age) > 1) {
      return { kind: 'ambiguous', why: `年龄不符:比赛日 ${want} / 文件 ${a.age}` };
    }
  }
  return { kind: 'mapped', target: t };
}

/** 同场成绩交叉验证:目标 ID 名下若已有这一场,要求条数 + 每条时间/名次全同。 */
function verifyAgainstUsas(target, pvsDoc, a) {
  const mine = a.swims.filter((s) => s.status === 'ok')
    .map((s) => `${normCode(s.eventCode)}|${csOf(s.seconds) ?? '-'}|${s.place ?? '-'}`);
  if (!mine.length) return { ok: false, why: '同场没有可比的 ok 成绩' };
  const p = parseIso(pvsDoc.meet.startDate);
  const ev = cachedDocs.get(target.id);
  const meets = ev?.meets || {};
  const hit = Object.entries(meets).find(([, m]) => {
    const dm = String(m.meetDates || '').match(/^([A-Z][a-z]{2})\s+(\d{1,2})/);
    return dm && dm[1] === p.mon && Number(dm[2]) === p.day;
  });
  if (!hit) return { ok: null, why: '该场 USAS 侧没有数据,无法交叉验证' };
  const usas = new Set((hit[1].swims || []).map((s) => `${normCode(s.eventCode)}|${csOf(s.swimTime) ?? '-'}|${s.finishPosition ?? '-'}`));
  const equal = mine.length === usas.size && mine.every((k) => usas.has(k));
  return { ok: equal, why: equal ? `与 USAS 同场 ${mine.length} 条全同` : `与 USAS 同场不一致(PVS ${mine.length} / USAS ${usas.size})` };
}

// ── 找这场在库里对应的键 ────────────────────────────────────────────────────
function findMeetKey(pvsDoc, meets) {
  const p = parseIso(pvsDoc.meet.startDate);
  if (!p) return null;
  const want = new Set(tokens(pvsDoc.meet.name));
  const hits = [];
  for (const [id, m] of Object.entries(meets || {})) {
    const dm = String(m.meetDates || '').match(/^([A-Z][a-z]{2})\s+(\d{1,2})/);
    if (!dm || dm[1] !== p.mon || Number(dm[2]) !== p.day) continue;
    const shared = tokens(m.meetName).filter((t) => want.has(t));
    if (!shared.length) continue;
    hits.push({ id, shared });
  }
  hits.sort((a, b) => b.shared.length - a.shared.length);
  return hits[0]?.id || null;
}

// ── 一条 PVS 成绩 → 与库里同形状的记录 ──────────────────────────────────────
function standardFor(swim, athlete, target) {
  const levels = getTimeStandardLevels({
    age: athlete.age, course: swim.course, eventKey: `${swim.distance} ${swim.stroke}`, gender: target.gender,
  });
  if (!levels || !levels.length) return null;
  // levels 按阈值升序(快→慢):取「最后一个仍然 ≥ 本成绩」的档;全都比不过 → Slower Than B
  let best = null;
  for (const l of levels) if (swim.seconds <= l.thresholdSeconds) best = l.level;
  return best || 'Slower Than B';
}

function toStoredSwim(swim, { athlete, target, meetKey, pvsKey }) {
  const base = {
    eventCode: swim.eventCode,
    distance: swim.distance,
    strokeAbbreviation: swim.stroke,
    sessionName: swim.round === 'F' ? 'Final' : (swim.round || 'Final'),
    timeDrop: Number.isFinite(swim.timeDrop) ? swim.timeDrop : null,
    finishPosition: swim.place ?? null,
    source: 'pvs',
    sourceMeet: pvsKey,
    sourceId: athlete.memberId,       // 文件里那串(可能是 TM 残留的旧号),备查
  };
  if (swim.status === 'DQ') {
    return {
      ...base,
      swimTime: null,
      timeStandard: null,
      status: 'dq',
      dqCode: swim.dqCode || null,
      dqReason: swim.dqReason || null,
      ...(WITH_SPLITS && swim.splits?.length ? { splits: swim.splits } : {}),
    };
  }
  return {
    ...base,
    swimTime: fmtTime(swim.seconds),
    timeStandard: standardFor(swim, athlete, target),
    ...(WITH_SPLITS && swim.splits?.length ? { splits: swim.splits } : {}),
  };
}

// 同一运动员在多场里出现 → 文档只读一次、最后统一写
const cachedDocs = new Map();   // memberId → data | null
const pending = [];             // { memberId, name, target, pvsKey, meetKey, meetObj, patch }
const skipped = [];

async function loadDoc(memberId) {
  if (!cachedDocs.has(memberId)) {
    const snap = await db.collection('swimResults').doc(memberId).get();
    cachedDocs.set(memberId, snap.exists ? snap.data() : null);
  }
  return cachedDocs.get(memberId);
}

// ── 主流程 ──────────────────────────────────────────────────────────────────
let stat = { meets: 0, athletes: 0, matchedReg: 0, matchedMapped: 0, skipped: 0,
  addedSwims: 0, addedDq: 0, splitsAdded: 0, docsToWrite: 0 };

for (const pvsDoc of docs) {
  const pvs = pvsDoc.meet;
  const label = `${pvs.key} ${pvs.startDate}~${pvs.endDate} ${pvs.name}`;
  console.log(`\n########## ${label}`);
  stat.meets++;

  for (const a of pvsDoc.athletes) {
    stat.athletes++;
    const who = `${nameOf(a)} (${a.memberId})`;
    const m = matchAthlete(a);

    if (m.kind === 'no-id' || m.kind === 'unknown' || m.kind === 'ambiguous') {
      const why = m.kind === 'no-id' ? '注册了但没填 USA ID,等家长补'
        : m.kind === 'unknown' ? '名册里没有这个人'
          : `对不上:${m.why}`;
      skipped.push({ pvsKey: pvs.key, athlete: who, age: a.age, reason: m.kind, why });
      stat.skipped++;
      console.log(`  ⏭  ${who.padEnd(28)} ${why}`);
      continue;
    }

    const target = m.target;
    await loadDoc(target.id);

    let mappingNote = '';
    if (m.kind === 'mapped') {
      const v = verifyAgainstUsas(target, pvsDoc, a);
      if (v.ok === false) {
        skipped.push({ pvsKey: pvs.key, athlete: who, age: a.age, reason: 'verify-failed', why: v.why });
        stat.skipped++;
        console.log(`  ⏭  ${who.padEnd(28)} ${v.why} → 不写`);
        continue;
      }
      mappingNote = v.ok === null ? `文件 ID 非会员号,按姓名+年龄映射(${v.why})` : `按姓名+年龄映射,${v.why}`;
      stat.matchedMapped++;
    } else {
      stat.matchedReg++;
    }

    // 库里这场对应的键
    const data = cachedDocs.get(target.id) || {};
    const existingKey = findMeetKey(pvsDoc, data.meets);
    const meetKey = existingKey || `pvs-${pvs.key}`;

    const cur = existingKey ? { ...(data.meets[existingKey] || {}) } : {
      meetName: pvs.name,
      meetDates: datesLabel(pvs.startDate, pvs.endDate),
      meetType: /invitational/i.test(pvs.name) ? 'Invitational' : (/open/i.test(pvs.name) ? 'Open' : 'Invitational'),
      courseCode: pvs.course || (a.swims[0]?.course || 'SCY'),
      ...seasonOf(pvs.startDate),
      status: 'ok',
      swims: [],
    };
    const swims = Array.isArray(cur.swims) ? [...cur.swims] : [];
    const index = new Map();   // "CODE|cs|place" → 下标
    for (let i = 0; i < swims.length; i++) {
      index.set(`${normCode(swims[i].eventCode)}|${csOf(swims[i].swimTime) ?? '-'}|${swims[i].finishPosition ?? '-'}`, i);
    }
    const hasDq = (sw) => swims.some((x) => x.status === 'dq' && normCode(x.eventCode) === normCode(sw.eventCode));

    const added = [];
    let splitsAdded = 0;
    for (const sw of a.swims) {
      if (sw.status === 'NS' || sw.status === 'scratch' || sw.status === 'DNF') continue;  // 不入库
      const k = `${normCode(sw.eventCode)}|${csOf(sw.seconds) ?? '-'}|${sw.place ?? '-'}`;
      const at = index.get(k);
      if (sw.status === 'ok') {
        if (at != null) {
          // 已有同一条:默认一字不动;--splits 时只补缺失的分段
          if (WITH_SPLITS && sw.splits?.length && !(swims[at].splits || []).length) {
            swims[at] = { ...swims[at], splits: sw.splits };
            splitsAdded++;
            stat.splitsAdded++;
          }
          continue;
        }
        const rec = toStoredSwim(sw, { athlete: a, target, meetKey, pvsKey: pvs.key });
        swims.push(rec);
        added.push(rec);
        stat.addedSwims++;
      } else if (sw.status === 'DQ') {
        if (hasDq(sw)) continue;
        const rec = toStoredSwim(sw, { athlete: a, target, meetKey, pvsKey: pvs.key });
        swims.push(rec);
        added.push(rec);
        stat.addedDq++;
      }
    }

    if (!added.length && !splitsAdded) {
      if (VERBOSE) console.log(`  ✓  ${who.padEnd(28)} 已在库里,无新增${mappingNote ? ` · ${mappingNote}` : ''}`);
      continue;
    }

    const meetObj = {
      ...cur,
      meetName: cur.meetName || pvs.name,
      meetDates: cur.meetDates || datesLabel(pvs.startDate, pvs.endDate),
      fetchedAt: new Date().toISOString(),
      status: 'ok',
      swims,
    };
    // 复用 USAS 已有的键时保留它原来的字段;只有新建的键才标 source: 'pvs'
    if (!existingKey) meetObj.source = 'pvs';

    pending.push({
      memberId: target.id, name: target.name || who, pvsKey: pvs.key, meetKey,
      newKey: !existingKey, meetObj, added, note: mappingNote,
    });
    console.log(`  ✅ ${who.padEnd(28)} → ${target.id} [${meetKey}] +${added.length}${splitsAdded ? ` · splits ${splitsAdded}` : ''}${mappingNote ? ` · ${mappingNote}` : ''}`);
    if (VERBOSE) for (const r of added) console.log(`       ${r.eventCode.padEnd(12)} ${r.status === 'dq' ? `DQ ${r.dqCode || ''}` : r.swimTime}  ${r.timeStandard || ''}`);
  }
}

// ── 汇总 ────────────────────────────────────────────────────────────────────
const byDoc = new Map();
for (const p of pending) {
  if (!byDoc.has(p.memberId)) byDoc.set(p.memberId, { memberId: p.memberId, name: p.name, meets: [] });
  byDoc.get(p.memberId).meets.push(p);
}
stat.docsToWrite = byDoc.size;

console.log(`\n================ 汇总 ================`);
console.log(`场次 ${stat.meets} · 本队运动员 ${stat.athletes} 人次`);
console.log(`可写 ${stat.matchedReg + stat.matchedMapped} 人次(直接 ID ${stat.matchedReg} · 姓名映射 ${stat.matchedMapped})`);
console.log(`跳过 ${stat.skipped} 人次`);
console.log(`新增成绩 ${stat.addedSwims + stat.addedDq} 条(ok ${stat.addedSwims} · DQ ${stat.addedDq})${WITH_SPLITS ? ` · 补分段 ${stat.splitsAdded} 条` : ''}`);
console.log(`涉及文档 ${stat.docsToWrite} 份`);
if (skipped.length) {
  console.log('\n跳过明细:');
  for (const s of skipped) console.log(`  ⏭  ${s.pvsKey.padEnd(12)} ${s.athlete.padEnd(30)} ${s.why}`);
}

// 报告落盘(便于复查/给教练看)
mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(), commit: COMMIT, splits: WITH_SPLITS,
  only: ONLY || null, stat, skipped,
  docs: [...byDoc.values()].map((d) => ({
    memberId: d.memberId, name: d.name,
    meets: d.meets.map((p) => ({ pvsKey: p.pvsKey, meetKey: p.meetKey, newKey: p.newKey, added: p.added, note: p.note })),
  })),
}, null, 2));
console.log(`\n报告: ${REPORT_PATH}`);

if (!COMMIT) {
  console.log('\n(dry-run:没有写 Firestore。确认无误后加 --commit)');
  process.exit(0);
}

// ── 写库(先备份)─────────────────────────────────────────────────────────────
if (!byDoc.size) { console.log('没有需要写的文档。'); process.exit(0); }
mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = resolve(BACKUP_DIR, `swimResults-${stamp}.json`);
const backup = {};
for (const id of byDoc.keys()) backup[id] = cachedDocs.get(id) || null;
writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`\n备份: ${backupPath}(${Object.keys(backup).length} 份)`);

const now = new Date().toISOString();
for (const [memberId, group] of byDoc) {
  const existed = cachedDocs.get(memberId) != null;
  const patch = { lastUpdated: now };
  for (const p of group.meets) patch[`meets.${p.meetKey}`] = p.meetObj;
  if (!existed) {
    // 第一次建文档(注册了、有 ID、但 USAS 从没抓过)
    patch.memberId = memberId;
    patch.swimmerName = group.name;
    patch.bestTimes = [];
    patch.lastFetchSuccessAt = now;
    patch.lastFetchError = null;
  }
  const ref = db.collection('swimResults').doc(memberId);
  if (existed) await ref.update(patch);
  else await ref.set(patch, { merge: true });
  console.log(`  💾 ${memberId}  ${group.meets.map((p) => `${p.meetKey}(+${p.added.length})`).join(' ')}`);
}
console.log(`\n✅ 写入完成:${byDoc.size} 份文档,新增 ${stat.addedSwims + stat.addedDq} 条成绩。`);
