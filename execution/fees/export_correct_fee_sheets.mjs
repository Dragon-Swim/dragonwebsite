#!/usr/bin/env node
/**
 * Export the corrected, upload-ready spreadsheets to send back to the coach.
 *
 * Two workbooks, both in the exact shape the Deposits tab consumes:
 *   meet-balance-2025-2026-to-2026-2027.xlsx   Name | Balance        (carry-over)
 *   meet-deposit-2026-2027.xlsx                Name | Deposit        (this season)
 *
 * Sheet 1 is the import sheet — only `Name` plus the one money column matter, and
 * every name is already the system spelling. Sheet 2 ("README") explains the
 * format to the coach, lists the names that had to be corrected, and carries the
 * totals (a TOTAL row must never sit inside the import sheet: it would be read as
 * a person called "TOTAL").
 *
 * Input: the plan written by execution/match_fee_names.mjs plus the confirmed
 * overrides file. Usage:
 *   node execution/export_correct_fee_sheets.mjs \
 *        --plan .tmp/fee-import/name-match-report.plan.json \
 *        --overrides .tmp/fee-import/fee-name-overrides.json \
 *        [--out-dir .tmp/deliverables] [--season 2026-2027]
 */

import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const PLAN_PATH = resolve(flag('--plan', '.tmp/fee-import/name-match-report.plan.json'));
const OVERRIDES_PATH = flag('--overrides', '.tmp/fee-import/fee-name-overrides.json');
const OUT_DIR = resolve(flag('--out-dir', '.tmp/deliverables'));

const plan = JSON.parse(readFileSync(PLAN_PATH, 'utf8'));
const overrides = JSON.parse(readFileSync(resolve(OVERRIDES_PATH), 'utf8'));
const SEASON = flag('--season', plan.season);
const UNLINKED = new Set((overrides.unlinked || []).map((n) => String(n).toLowerCase().trim()));

/** Apply the human-confirmed overrides (same rule as execution/import_fee_sheet.mjs). */
function resolveRows(rows, kind) {
  const ov = overrides[kind] || {};
  return (rows || []).map((row) => {
    const raw = String(row.raw ?? '').trim();
    const key = Object.keys(ov).find((k) => k.toLowerCase() === raw.toLowerCase());
    return { ...row, name: (key ? ov[key] : null) || row.name, raw };
  });
}

const CATEGORY_NOTE = {
  'registered+in-fee': '已注册,本赛季 fee 表里已有',
  'registered': '已注册(本赛季还没出现在 fee 表里)',
  'in-fee-only': '家庭未注册,但本赛季 fee 表里已有 → 等家长补注册',
  'last-season-only': '家庭未注册(只有上赛季 fee 记录)',
  'whitelist-only': '家庭未注册(只在白名单里)',
  'deleted': '注册里被标为删除',
  'ambiguous': '有歧义,需要人工确认',
  'unknown': '系统里查不到',
};

function noteFor(row) {
  const bits = [];
  if (row.name && row.raw && row.raw.toLowerCase() !== row.name.toLowerCase()) bits.push(`原表写「${row.raw}」`);
  if (row.matchedBy && /middle/.test(row.matchedBy)) bits.push('英文名存在注册表的 middleName 里');
  if (UNLINKED.has(String(row.name).toLowerCase().trim())) bits.push('系统里还没有这个孩子,按此名先建档;家长注册后再合并');
  const cat = CATEGORY_NOTE[row.category];
  if (cat && !UNLINKED.has(String(row.name).toLowerCase().trim())) bits.push(cat);
  return bits.join('; ');
}

/** Same as noteFor, but for the README list where the original spelling is already the row label. */
function readmeNote(row) {
  const bits = [];
  if (row.matchedBy && /middle/.test(row.matchedBy)) bits.push('英文名存在注册表的 middleName 里');
  if (UNLINKED.has(String(row.name).toLowerCase().trim())) bits.push('系统里还没有这个孩子,先建档,家长注册后再合并');
  const cat = CATEGORY_NOTE[row.category];
  if (cat) bits.push(cat);
  const confirmed = (overrides._confirmed || {})[Object.keys(overrides._confirmed || {}).find((k) => k.toLowerCase() === row.raw.toLowerCase())];
  if (confirmed) bits.push(`已确认:${confirmed}`);
  return bits.join('; ');
}

const money = (n) => (Number(n) < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toFixed(2);

function buildWorkbook({ kind, dataSheetName, valueHeader, valueKey, file, purpose, uploadButton }) {
  const rows = resolveRows(plan[kind], kind);
  const aoa = [
    ['Name', valueHeader, 'Original (原表写法)', 'Note (说明)'],
    ...rows.map((r) => [r.name, Number(r.value) || 0, r.raw, noteFor(r)]),
  ];
  const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const corrected = rows.filter((r) => r.raw.toLowerCase() !== String(r.name).toLowerCase());

  const readme = [
    ['用途', purpose],
    ['赛季', SEASON],
    ['上传位置', uploadButton],
    [],
    ['第 1 张表就是可以直接上传的格式:'],
    ['  A 列 Name', `必须和系统里的名字一致(本文件已改好,可直接用)`],
    ['  B 列 ' + valueHeader, kind === 'balance'
      ? '上一个赛季的结余:负数 = 家庭还欠队里钱;正数 = 队里还欠家庭'
      : '这一次缴的押金金额(正数)'],
    ['  C 列 / D 列', '只给你核对用,系统会忽略这两列'],
    [],
    ['不需要再填的列:'],
    ['  amount(欠费)', '系统从 meet 的报名费表自动算,见 Meet Fee Summary'],
    ['  deposit(已缴)', kind === 'balance'
      ? '用另一张 meet-deposit-2026-2027.xlsx 上传'
      : '(本文件就是押金表)'],
    [],
    ['合计', `${rows.length} 人,${valueHeader} 合计 ${money(total)}`],
    [],
    ['这次改过的名字(原表 → 系统):'],
    ...(corrected.length
      ? corrected.map((r) => [`  ${r.raw}`, `→ ${r.name}${readmeNote(r) ? `   (${readmeNote(r)})` : ''}`])
      : [['  (无)', '全部与系统一致']]),
    [],
    ['两个孩子的名字系统里还没有(家庭未注册):'],
    ...(rows.filter((r) => UNLINKED.has(String(r.name).toLowerCase().trim())).map((r) => [`  ${r.raw}`, `→ ${r.name}:先按现在这个名字记着,等家长注册后再合并`])),
    [],
    ['以后再发新表时,只要保持 A 列是系统里的名字、B 列是金额即可。'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws, dataSheetName);
  const wsReadme = XLSX.utils.aoa_to_sheet(readme);
  wsReadme['!cols'] = [{ wch: 24 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, wsReadme, 'README-格式说明');

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, file);
  XLSX.writeFile(wb, out);
  console.log(`${file}: ${rows.length} 行,${valueHeader} 合计 ${money(total)}${corrected.length ? `,改了 ${corrected.length} 个名字` : ''}`);
  return { out, rows, total };
}

const balance = buildWorkbook({
  kind: 'balance',
  dataSheetName: 'balance',
  valueHeader: 'Balance',
  file: `meet-balance-2025-2026_to_${SEASON}.xlsx`,
  purpose: '2025-2026 赛季结转余额(carry-over),记入 ' + SEASON + ' 赛季',
  uploadButton: `教练端 → 🏦 Meet Fee Deposits → 赛季选 ${SEASON} → 📤 Upload Carry-over Balance`,
});

const deposits = buildWorkbook({
  kind: 'deposits',
  dataSheetName: 'deposit',
  valueHeader: 'Deposit',
  file: `meet-deposit-${SEASON}.xlsx`,
  purpose: SEASON + ' 赛季押金(deposit)',
  uploadButton: `教练端 → 🏦 Meet Fee Deposits → 赛季选 ${SEASON} → 📤 Upload Deposits`,
});

console.log(`\n合计:结转余额 ${money(balance.total)}(${balance.rows.length} 人);押金 ${money(deposits.total)}(${deposits.rows.length} 人)`);
console.log('提示:第 1 张表就是可直接上传的格式,第 2 张 README 是给教练看的说明。');
