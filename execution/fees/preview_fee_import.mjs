#!/usr/bin/env node
// 干跑(不写 Firestore):用真实的 xlsx 打印两个导入器**会写入什么**。
//
// 为什么需要它:教练端导入是「预览弹窗 + 一次 batch」,预览里的列映射、new/update
// 数量、符号、目标槽位都来自 src/utils/feeImport.js。这个脚本把同一套纯逻辑套在
// 真实文件上,读一次线上 deposits 现状,逐行打印计划 —— 上线前、排查投诉时用。
//
// 用法:
//   node execution/fees/preview_fee_import.mjs --balance ".tmp/coach-in/meet balance.xlsx" --season 2025-2026
//   node execution/fees/preview_fee_import.mjs --deposits ".tmp/coach-in/meet deposit.xlsx" --season 2026-2027
//   node execution/fees/preview_fee_import.mjs --balance a.xlsx --deposits b.xlsx --season 2026-2027
//   可选:--key <service account 路径>,--no-db(不连 Firestore,一律按“新建”预览)
//
// 读表用 xlsx 包(与前端同一个),逻辑 import 自 src/utils/feeImport.js —— 不做二次实现。

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  parseCarryOverRows, planCarryOverRows, buildCarryOverWrites,
  parseDepositDetailRows, planDepositRows, buildDepositWrites,
} from '../../src/utils/feeImport.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// ── 参数 ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const BALANCE_FILE = flag('--balance');
const DEPOSIT_FILE = flag('--deposits');
const SEASON = flag('--season');
const KEY_PATH = resolve(flag('--key') || 'serviceAccountKey.json');
const NO_DB = args.includes('--no-db');

if (!SEASON || (!BALANCE_FILE && !DEPOSIT_FILE)) {
  console.error('用法: node execution/fees/preview_fee_import.mjs (--balance <xlsx> | --deposits <xlsx>) --season <例如 2025-2026> [--key <路径>] [--no-db]');
  process.exit(1);
}

const sheetRows = (file) => {
  const wb = XLSX.readFile(resolve(file));
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
};
const money = (n) => (Number(n) < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toFixed(2);
const mapping = (cols) => (cols || []).map((c) => `${c.field} <- ${c.letter} ("${c.label}")`).join(' · ') || '(无)';

// ── 线上现状(只读) ───────────────────────────────────────────────
let deposits = [];
if (!NO_DB) {
  let key;
  try {
    key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  } catch (e) {
    console.error(`❌ 无法读取 service account key:${KEY_PATH}\n   ${e.message}\n   用 --no-db 可跳过数据库(一律按新建预览)`);
    process.exit(1);
  }
  initializeApp({ credential: cert(key) });
  const snap = await getFirestore().collection('deposits').where('season', '==', SEASON).get();
  deposits = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`赛季 ${SEASON}:线上已有 ${deposits.length} 条 deposits 记录(只读)`);
} else {
  console.log('--no-db:不读 Firestore,所有行都按“新建”预览');
}

// ── carry-over balance ──────────────────────────────────────────
if (BALANCE_FILE) {
  console.log(`\n## ${BALANCE_FILE} → Upload Carry-over Balance`);
  const parsed = parseCarryOverRows(sheetRows(BALANCE_FILE));
  console.log(`列映射: ${mapping(parsed.columns)}  | 表头行: ${parsed.headerRow} | fatal: ${parsed.fatal}`);
  if (parsed.fatal) process.exit(1);
  console.log(`有效 ${parsed.valid.length} 行,错误 ${parsed.errors.length} 行`);
  parsed.errors.forEach((e) => console.log(`  ERR  row ${e.rowNum}: ${e.reason}`));

  const plan = planCarryOverRows(parsed.valid, deposits, SEASON);
  for (const w of buildCarryOverWrites(plan)) {
    const before = plan.find((p) => p.swimmerName === w.swimmerName)?.previousBalance;
    console.log(`  ${w.willCreate ? 'new   ' : 'update'} ${String(w.swimmerName).padEnd(22)} ${before === undefined || before === null ? '' : money(before) + ' -> '}${money(w.fields.balance)}`);
  }
  const negatives = plan.filter((p) => p.balance < 0).length;
  console.log(`=> 写入 ${plan.length} 行(${plan.filter((p) => p.willCreate).length} 新建 / ${plan.filter((p) => !p.willCreate).length} 更新),负数(欠费)${negatives} 行,合计 ${money(plan.reduce((s, p) => s + p.balance, 0))}`);
}

// ── deposits ────────────────────────────────────────────────────
if (DEPOSIT_FILE) {
  console.log(`\n## ${DEPOSIT_FILE} → Upload Deposits`);
  const parsed = parseDepositDetailRows(sheetRows(DEPOSIT_FILE));
  console.log(`列映射: ${mapping(parsed.columns)}  | 模式: ${parsed.mode} | fatal: ${parsed.fatal}`);
  if (parsed.fatal) process.exit(1);
  console.log(`有效 ${parsed.valid.length} 行,错误 ${parsed.errors.length} 行`);
  parsed.errors.forEach((e) => console.log(`  ERR  row ${e.rowNum}: ${e.reason}`));

  const { rows: plan, skipped, slotErrors } = planDepositRows(parsed, deposits, SEASON);
  skipped.forEach((s) => console.log(`  SKIP ${s.reason}`));
  slotErrors.forEach((s) => console.log(`  ERR  ${s.reason}`));
  for (const w of buildDepositWrites(parsed, plan)) {
    console.log(`  ${w.willCreate ? 'new   ' : 'update'} ${String(w.swimmerName).padEnd(18)} ${JSON.stringify(w.fields)}`);
  }
  console.log(`=> 写入 ${plan.length} 行(${plan.filter((p) => p.willCreate).length} 新建 / ${plan.filter((p) => !p.willCreate).length} 更新),跳过 ${skipped.length} 行`);
}

console.log('\n(本次没有写入任何数据 —— 这是干跑)');
process.exit(0);
