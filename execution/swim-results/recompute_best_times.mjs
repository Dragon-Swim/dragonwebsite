#!/usr/bin/env node
/**
 * recompute_best_times.mjs — 用 `swimResults/{id}.meets` 更新同一份文档的 `bestTimes`。
 *
 * 为什么需要(2026-11-18)
 * ----------------------
 * `bestTimes` 一直由 USAS 的 `GetBestTimesForMember` 写入,而 PVS 导入(`import_pvs_results.mjs`)
 * 刻意不动它 —— 当时的顾虑是「整体重算会把 PVS 覆盖不到的历史场次弄丢」。
 * 2026-11-18 实测:全库 32 份有 bestTimes 的文档、696 条记录,**没有任何一条比库里 meet
 * 的最快成绩更快**,也就是说每条 bestTime 都能由 meet 反推出来;反过来却有 91 条已过时
 * (新比赛更快)、13 个新项目没有 bestTime。所以不需要为了 bestTimes 再去调 USAS。
 *
 * 口径
 * ----
 * · **只做增量**:已有条目只有在库里出现更快成绩时才替换;绝不删除条目。
 *   (保留 USAS 给的其他字段;`swimTimeRecognitionId` 指向旧时间,替换时置空。)
 * · 新项目(库里没有的 eventCode)才新增,字段尽量与 USAS 的条目同形。
 * · 只算 `status: 'ok'`、`swimTime` 可解析的成绩;DQ / NS / 接力分段(带 `r`)不算。
 * · `swimDate` 用「比赛开始日」:meetDates 只有月日,年份由 seasonYear 推
 *   (9-12 月属上一自然年)。推不出来就不改原来的日期。
 *
 * 用法:
 *   node execution/swim-results/recompute_best_times.mjs            # dry-run
 *   node execution/swim-results/recompute_best_times.mjs --commit   # 先备份,再写
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const COMMIT = args.includes('--commit');
const VERBOSE = args.includes('--verbose');
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const KEY_PATH = resolve(flag('--key', 'serviceAccountKey.json'));
const BACKUP_DIR = resolve('.tmp/backups');

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STROKE_NAME = { FR: 'Freestyle', BK: 'Backstroke', BR: 'Breaststroke', FL: 'Butterfly', IM: 'Individual Medley' };

/** "1:02.45" / "28.62" / "30.08r"(接力第一棒) → 秒数;其余 → null */
const secondsOf = (v) => {
  if (v == null || v === '') return null;
  const s = String(v).trim().replace(/r$/i, '');   // r = relay leadoff,仍是一条合法成绩
  if (!/^\d{1,2}:\d{2}\.\d{2}$|^\d{1,3}\.\d{2}$/.test(s)) return null;
  const [m, rest] = s.includes(':') ? s.split(':') : ['0', s];
  return Math.round((Number(m) * 60 + Number(rest)) * 100) / 100;
};
const fmt = (sec) => {
  if (sec == null) return null;
  if (sec < 60) return sec.toFixed(2);
  const m = Math.floor(sec / 60);
  return `${m}:${(sec - m * 60).toFixed(2).padStart(5, '0')}`;
};
const codeOf = (e) => String(e || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
const parseEventCode = (e) => {
  const m = /^(\d+)\s*([A-Z]{2})\s*(SCY|LCM|SCM)$/.exec(String(e || '').toUpperCase().trim());
  return m ? { distance: Number(m[1]), stroke: m[2], course: m[3] } : null;
};
/** "Nov 06 - Nov 08" + seasonYear "2027" → "2026-11-06";推不出来 → null */
const meetStartIso = (meet) => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(meet?.meetDates || ''));
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2})/.exec(String(meet?.meetDates || ''));
  const sy = Number(meet?.seasonYear);
  if (!m || !Number.isFinite(sy)) return null;
  const mon = MON.indexOf(m[1]);
  if (mon < 0) return null;
  const year = mon >= 8 ? sy - 1 : sy;      // 9-12 月属于上一自然年
  return `${year}-${String(mon + 1).padStart(2, '0')}-${String(Number(m[2])).padStart(2, '0')}`;
};

initializeApp({ credential: cert(JSON.parse(readFileSync(KEY_PATH, 'utf8'))) });
const db = getFirestore();

const snap = await db.collection('swimResults').get();
const pending = [];
const stat = { docs: 0, replaced: 0, added: 0, unchanged: 0, noDate: 0 };

for (const doc of snap.docs) {
  const data = doc.data();
  if (!Array.isArray(data.bestTimes)) continue;

  // 库里最好的成绩:eventCode → { seconds, swim, meet, date }
  const derived = new Map();
  for (const meet of Object.values(data.meets || {})) {
    const date = meetStartIso(meet);
    for (const sw of meet?.swims || []) {
      if (sw?.status && sw.status !== 'ok') continue;
      const sec = secondsOf(sw?.swimTime);
      const parsed = parseEventCode(sw?.eventCode);
      if (sec == null || !parsed) continue;
      const k = codeOf(sw.eventCode);
      const cur = derived.get(k);
      if (!cur || sec < cur.seconds) derived.set(k, { seconds: sec, swim: sw, meet, date });
    }
  }
  if (!derived.size) continue;

  const bestTimes = [...data.bestTimes];
  const index = new Map();               // code → 在 bestTimes 里的下标
  bestTimes.forEach((b, i) => index.set(codeOf(b.eventCode), i));

  const changes = [];
  for (const [k, d] of derived) {
    const at = index.get(k);
    if (at == null) {
      const parsed = parseEventCode(d.swim.eventCode);
      bestTimes.push({
        eventCode: d.swim.eventCode,
        distance: d.swim.distance ?? parsed.distance,
        strokeAbbreviation: d.swim.strokeAbbreviation ?? parsed.stroke,
        strokeName: STROKE_NAME[parsed.stroke] || parsed.stroke,
        courseCode: d.swim.course || parsed.course,
        swimTime: fmt(d.seconds),
        swimDate: d.date || null,
        timeStandardCode: d.swim.timeStandard || null,
      });
      index.set(k, bestTimes.length - 1);
      stat.added++;
      changes.push(`+ ${d.swim.eventCode.padEnd(12)} ${fmt(d.seconds)}  (新)`);
      continue;
    }
    const cur = bestTimes[at];
    const curSec = secondsOf(cur.swimTime ?? cur.bestTime);
    if (curSec != null && d.seconds >= curSec) { stat.unchanged++; continue; }
    stat.replaced++;
    if (!d.date) stat.noDate++;
    bestTimes[at] = {
      ...cur,
      swimTime: fmt(d.seconds),
      swimDate: d.date || cur.swimDate || null,
      swimTimeRecognitionId: null,        // 旧 id 指向旧时间,不再成立
      timeStandardCode: d.swim.timeStandard || cur.timeStandardCode || null,
    };
    changes.push(`~ ${d.swim.eventCode.padEnd(12)} ${cur.swimTime} → ${fmt(d.seconds)}  @${d.meet?.meetDates || '?'}`);
  }

  if (!changes.length) continue;
  stat.docs++;
  pending.push({ id: doc.id, name: data.swimmerName, bestTimes, before: data.bestTimes, changes });
  console.log(`\n## ${data.swimmerName || doc.id}  [${doc.id}]  ${changes.length} 处`);
  for (const c of changes) console.log(`   ${c}`);
}

console.log('\n================ 汇总 ================');
console.log(`更新 ${stat.replaced} 条 · 新增 ${stat.added} 条 · 涉及 ${stat.docs} 份文档`
  + `(无日期 ${stat.noDate} 条,已沿用原日期)`);
console.log(`比较过但无需改动的条目:${stat.unchanged}`);

if (!COMMIT) {
  console.log('\n(dry-run:没有写 Firestore。确认无误后加 --commit)');
  process.exit(0);
}
if (!pending.length) { console.log('没有要写的文档。'); process.exit(0); }

mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = resolve(BACKUP_DIR, `bestTimes-${stamp}.json`);
writeFileSync(backupPath, JSON.stringify(
  Object.fromEntries(pending.map((p) => [p.id, p.before])), null, 2));
console.log(`\n备份:${backupPath}`);

const now = new Date().toISOString();
for (const p of pending) {
  await db.collection('swimResults').doc(p.id).update({ bestTimes: p.bestTimes, lastUpdated: now });
  console.log(`  💾 ${p.id}  ${p.name || ''}  ${p.bestTimes.length} 条`);
}
console.log(`\n✅ 写入完成:${pending.length} 份文档,${stat.replaced} 条更新 + ${stat.added} 条新增。`);
