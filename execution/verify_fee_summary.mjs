#!/usr/bin/env node
/**
 * Reproduce the coach-side "Meet Fee Summary" join for one season, read-only.
 *
 * The dashboard computes: per swimmer, meet fees (from meets.feeData of that
 * season) against the deposits record's total (balance + deposit1..3). This
 * prints exactly that, so a bulk import can be checked before/after it happens,
 * and a coach complaint ("his balance looks wrong") can be traced in one command.
 *
 * Usage:
 *   node execution/verify_fee_summary.mjs 2026-2027
 *   node execution/verify_fee_summary.mjs            # defaults to the current season
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { depositTotal, normalizeName as normalize } from '../src/utils/feeImport.js';

const args = process.argv.slice(2);
const seasonArg = args.find((a) => /^\d{4}-\d{4}$/.test(a));
const currentSeason = (() => {
  const d = new Date();
  const y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${y + 1}`;
})();
const SEASON = seasonArg || currentSeason;

const key = JSON.parse(readFileSync(resolve('serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(key) });
const db = getFirestore();

const [depSnap, meetSnap] = await Promise.all([
  db.collection('deposits').where('season', '==', SEASON).get(),
  db.collection('meets').get(),
]);
const deposits = depSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

// same name rule as dashboard.js (shared module, punctuation-blind)
const seasonFromDate = (s) => {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const mo = d.getMonth() + 1;
  return mo >= 9 ? `${d.getFullYear()}-${d.getFullYear() + 1}` : `${d.getFullYear() - 1}-${d.getFullYear()}`;
};

const feeMap = new Map();
for (const doc of meetSnap.docs) {
  const m = doc.data();
  if ((m.season || seasonFromDate(m.startDate || m.date)) !== SEASON) continue;
  if (!Array.isArray(m.feeData?.swimmers)) continue;
  for (const sw of m.feeData.swimmers) {
    const k = normalize(sw.name);
    if (!k) continue;
    const cur = feeMap.get(k) || { name: String(sw.name).trim(), totalFee: 0, meets: [] };
    cur.totalFee += Number(sw.total) || 0;
    cur.meets.push(`${m.name} $${Number(sw.total) || 0}`);
    feeMap.set(k, cur);
  }
}

const depMap = new Map();
for (const d of deposits) {
  const k = normalize(d.swimmerName);
  if (!k) continue;
  depMap.set(k, d);
}

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toFixed(2);
const rows = [];
for (const [k, f] of feeMap) {
  const dep = depMap.get(k);
  const total = dep ? depositTotal(dep) : 0;
  rows.push({ name: dep ? dep.swimmerName : f.name, fee: f.totalFee, dep: total, balance: total - f.totalFee, needsLinking: !!dep?.needsLinking, hasDep: !!dep });
  depMap.delete(k);
}
for (const dep of depMap.values()) {
  rows.push({ name: dep.swimmerName, fee: 0, dep: depositTotal(dep), balance: depositTotal(dep), needsLinking: !!dep.needsLinking, hasDep: true });
}
rows.sort((a, b) => a.balance - b.balance || String(a.name).localeCompare(String(b.name)));

console.log(`赛季 ${SEASON}:meets 费用人次 ${feeMap.size};deposits 记录 ${deposits.length};Fee Summary ${rows.length} 行\n`);
console.log('swimmer'.padEnd(28) + 'meetFee'.padStart(9) + 'deposit'.padStart(10) + 'balance'.padStart(11) + '  note');
for (const r of rows) {
  console.log(
    String(r.name).padEnd(28)
    + money(r.fee).padStart(9)
    + money(r.dep).padStart(10)
    + money(r.balance).padStart(11)
    + (r.needsLinking ? '  待链接(家庭未注册)' : (r.fee === 0 && r.dep !== 0 ? '  只有押金/结转,本赛季没有费用' : (r.fee !== 0 && r.dep === 0 ? '  有费用,无押金记录' : '')))
  );
}
const totals = rows.reduce((s, r) => ({ fee: s.fee + r.fee, dep: s.dep + r.dep }), { fee: 0, dep: 0 });
const dupes = new Set();
const seen = new Set();
for (const d of deposits) {
  const k = normalize(d.swimmerName);
  if (seen.has(k)) dupes.add(k);
  seen.add(k);
}
console.log(`\n合计:meet fee ${money(totals.fee)} | deposit(含结转) ${money(totals.dep)} | 净 ${money(totals.dep - totals.fee)}`);
console.log(`同名重复记录:${dupes.size ? [...dupes].join(', ') : '无'}`);
console.log(`待链接:${deposits.filter((d) => d.needsLinking).map((d) => d.swimmerName).join(', ') || '无'}`);
process.exit(0);
