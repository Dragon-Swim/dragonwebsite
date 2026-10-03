#!/usr/bin/env node
/**
 * Import the coaches' fee sheets into `deposits`, using the name mapping that
 * execution/match_fee_names.mjs produced (and a human confirmed).
 *
 * Why a separate tool: applying the mapping is a data write with real money
 * behind it, so it must be reviewable — this prints every row it would write and
 * touches Firestore only with --commit. The matching/planning logic itself is the
 * same pure module the dashboard uses (src/utils/feeImport.js), so a row that
 * shows up here writes exactly what the coach-side importer would write.
 *
 * Usage:
 *   node execution/import_fee_sheet.mjs --plan .tmp/name-match-report.plan.json \
 *        --overrides .tmp/fee-name-overrides.json            # dry run
 *   … --commit --by dragonswim@outlook.com                   # write
 *
 * Inputs:
 *   plan.balance[]   { raw, name, value }  → deposits.{balance}     (carry-over)
 *   plan.deposits[]  { raw, name, value }  → deposits.{deposit1Amount,…} (next free slot)
 *   overrides: { "balance": { "<raw>": "<name>" }, "deposits": { … } }  ← wins over the plan
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  planCarryOverRows, buildCarryOverWrites,
  planDepositRows, buildDepositWrites,
} from '../src/utils/feeImport.js';

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const COMMIT = args.includes('--commit');
const SKIP_MISSING = args.includes('--skip-missing');
const PLAN_PATH = resolve(flag('--plan', '.tmp/name-match-report.plan.json'));
const OVERRIDES_PATH = flag('--overrides', null);
const BY = flag('--by', 'import_fee_sheet');
const KEY_PATH = resolve(flag('--key', 'serviceAccountKey.json'));

let plan;
try {
  plan = JSON.parse(readFileSync(PLAN_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 读不到计划文件 ${PLAN_PATH}:${e.message}`);
  process.exit(1);
}
const overrides = OVERRIDES_PATH ? JSON.parse(readFileSync(resolve(OVERRIDES_PATH), 'utf8')) : {};
const SEASON = flag('--season', plan.season);
if (!SEASON) {
  console.error('❌ 计划里没有 season,也没有 --season');
  process.exit(1);
}

/**
 * Names in `overrides.unlinked` are money for a child the system does not know
 * yet (family never whitelisted/registered). The record is still written, but
 * stamped so a later session can find it and merge it into the real swimmer:
 *   where('needsLinking', '==', true)
 */
const UNLINKED = new Set((overrides.unlinked || []).map((n) => String(n).toLowerCase().trim()));

/** Apply the human-confirmed overrides on top of the plan. */
function named(rows, kind) {
  const ov = overrides[kind] || {};
  const out = [];
  const missing = [];
  for (const row of rows || []) {
    const key = String(row.raw ?? '').trim();
    const keyLower = Object.keys(ov).find((k) => k.toLowerCase() === key.toLowerCase());
    const name = (keyLower ? ov[keyLower] : null) || row.name;
    if (!name) { missing.push(row); continue; }
    out.push({ ...row, name });
  }
  return { out, missing };
}

const balance = named(plan.balance, 'balance');
const depositRows = named(plan.deposits, 'deposits');
console.log(`计划:${PLAN_PATH}`);
if (OVERRIDES_PATH) console.log(`覆盖:${OVERRIDES_PATH}`);
console.log(`赛季:${SEASON} | 余额 ${balance.out.length} 行,押金 ${depositRows.out.length} 行`);
for (const [kind, res] of [['balance', balance], ['deposits', depositRows]]) {
  if (!res.missing.length) continue;
  console.log(`\n⚠ ${kind} 里 ${res.missing.length} 行还没有名字:`);
  for (const r of res.missing) console.log(`   - 第 ${r.row} 行 “${r.raw}” = ${r.value}${r.note ? `  (${r.note})` : ''}`);
  if (!SKIP_MISSING) {
    console.log('\n先补 --overrides,或加 --skip-missing 跳过这些行。未写入任何数据。');
    process.exit(1);
  }
}

// ── Firestore ────────────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();

const snap = await db.collection('deposits').where('season', '==', SEASON).get();
const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
console.log(`\n线上 ${SEASON} 现有 deposits:${existing.length} 条`);

// ── plan the writes with the same pure logic the dashboard uses ──
const rawBySystemName = new Map();
for (const r of [...balance.out, ...depositRows.out]) rawBySystemName.set(String(r.name).toLowerCase().trim(), r.raw);

const balanceParsed = balance.out.map((r) => ({ swimmerName: r.name, balance: Number(r.value) || 0 }));
const balancePlan = planCarryOverRows(balanceParsed, existing, SEASON);
const balanceWrites = buildCarryOverWrites(balancePlan);

const simpleParsed = { mode: 'simple', valid: depositRows.out.map((r) => ({ swimmerName: r.name, amount: Number(r.value) || 0, date: null })) };
const depositPlan = planDepositRows(simpleParsed, existing, SEASON);
const depositWrites = buildDepositWrites(simpleParsed, depositPlan.rows);

// One record per swimmer: a name that appears in BOTH sheets must end up as a
// single deposits doc holding the carry-over balance AND the new deposit. (The
// dashboard's own importers get this for free — its snapshot refreshes between
// uploads — but a bulk tool reads the collection once.)
const merged = new Map();
for (const w of [...balanceWrites, ...depositWrites]) {
  const k = String(w.swimmerName).toLowerCase().trim();
  const cur = merged.get(k);
  if (!cur) {
    merged.set(k, { ...w, fields: { ...w.fields } });
    continue;
  }
  cur.fields = { ...cur.fields, ...w.fields };
  cur.existingId = cur.existingId || w.existingId;
}
const writes = [...merged.values()];
const mergedCount = balanceWrites.length + depositWrites.length - writes.length;
if (mergedCount > 0) console.log(`\nℹ️ 两张表里同名的人合并成同一条记录:${mergedCount} 人`);

// stamp the rows whose family is not in the system yet
for (const w of writes) {
  const key = String(w.swimmerName).toLowerCase().trim();
  if (UNLINKED.has(key)) {
    w.fields.needsLinking = true;
    w.fields.sourceName = rawBySystemName.get(key) ?? w.swimmerName;
  }
}

const money = (n) => (Number(n) < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toFixed(2);
const show = (title, writes, extra = () => '') => {
  console.log(`\n=== ${title} (${writes.length} 行) ===`);
  for (const w of writes) {
    console.log(`  ${w.existingId ? 'update' : 'new   '} ${String(w.swimmerName).padEnd(24)} ${JSON.stringify(w.fields)}${extra(w)}`);
  }
};
show('结转余额 → deposits.balance', balanceWrites, (w) => `   ${money(w.fields.balance)}`);
show('押金 → 下一个空槽', depositWrites);
for (const s of depositPlan.skipped) console.log(`  SKIP ${s.reason}`);
for (const s of depositPlan.slotErrors) console.log(`  ERR  ${s.reason}`);

const balanceSum = writes.reduce((s, w) => s + (Number(w.fields.balance) || 0), 0);
const depositSum = writes.reduce((s, w) => s + (Number(w.fields.deposit1Amount) || 0) + (Number(w.fields.deposit2Amount) || 0) + (Number(w.fields.deposit3Amount) || 0), 0);
console.log(`\n合计:余额 ${money(balanceSum)};押金 ${money(depositSum)};将写入 ${writes.length} 条记录`);

if (!COMMIT) {
  console.log('\nℹ️  dry-run:未写入任何数据。确认上面每一行后加 --commit 执行。');
  process.exit(0);
}

// ── write ────────────────────────────────────────────────────────
const meta = { updatedAt: new Date(), updatedBy: `${BY} (bulk import ${SEASON})` };
console.log(`\n🗑  写入 ${writes.length} 条 deposits...`);
for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  for (const w of writes.slice(i, i + 400)) {
    if (w.existingId) {
      batch.update(db.collection('deposits').doc(w.existingId), { ...w.fields, ...meta });
    } else {
      batch.set(db.collection('deposits').doc(), {
        swimmerName: w.swimmerName,
        season: SEASON,
        balance: 0,
        deposit1Amount: null, deposit1Date: null,
        deposit2Amount: null, deposit2Date: null,
        deposit3Amount: null, deposit3Date: null,
        ...w.fields,
        ...meta,
      });
    }
  }
  await batch.commit();
  console.log(`   ✅ ${Math.min(i + 400, writes.length)}/${writes.length}`);
}

const after = await db.collection('deposits').where('season', '==', SEASON).get();
const sum = (field) => after.docs.reduce((s, d) => s + (Number(d.data()[field]) || 0), 0);
console.log(`\n✅ 复查:${SEASON} 现有 ${after.size} 条;balance 合计 ${money(sum('balance'))};deposit1 合计 ${money(sum('deposit1Amount'))}`);
process.exit(0);
