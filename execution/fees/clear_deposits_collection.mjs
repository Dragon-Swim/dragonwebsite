#!/usr/bin/env node
// 清空生产环境 deposits 集合(默认 dry-run,只统计)。
//
// 背景(2026-10-02):教练端「Upload Carry-over Balance」「Upload Deposits」两个导入
// 把未经处理的数据写进了 deposits —— 2025-2026 赛季的 31 条余额被取正(负数=欠费的
// 语义丢失)且把兄弟姐妹合并成一行,2026-2027 赛季另有 13 条只有名字、没有任何金额的
// 空壳记录。2025-2026 赛季已结束,建站期(2026-06-26)还有 28 条 balance=600 的占位
// 数据。以上都不是真实账目,真实数据只在 meets 的 feeData 里。
//
// 用法:
//   node execution/clear_deposits_collection.mjs                 # dry-run:只统计
//   node execution/clear_deposits_collection.mjs --delete        # 备份后真正删除
//   node execution/clear_deposits_collection.mjs --delete --season 2026-2027
//   node execution/clear_deposits_collection.mjs --key <路径>     # 指定 service account key
//
// 安全设计:
//   - 默认 dry-run,必须显式 --delete
//   - 删除前先把整份集合写成本地 JSON 备份(.tmp/backups/deposits-backup-<时间戳>.json,.tmp 已 gitignore)
//   - 删除后复查集合文档数,并打印结果

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const DELETE = args.includes('--delete');
const seasonFlag = args.indexOf('--season');
const SEASON = seasonFlag >= 0 ? args[seasonFlag + 1] : null;
const keyFlag = args.indexOf('--key');
const KEY_PATH = keyFlag >= 0 && args[keyFlag + 1] ? resolve(args[keyFlag + 1]) : resolve('serviceAccountKey.json');

// ── 凭据 ─────────────────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${KEY_PATH}\n   ${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();
console.log(`连接到项目:${key.project_id}${SEASON ? ` | 仅 season=${SEASON}` : ' | 整个 deposits 集合'}\n`);

// ── 收集 ─────────────────────────────────────────────────────────
const snap = SEASON
  ? await db.collection('deposits').where('season', '==', SEASON).get()
  : await db.collection('deposits').get();

const iso = (v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : '(无)');
const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

const groups = new Map();
for (const r of rows) {
  const day = (iso(r.updatedAt) || '').slice(0, 10);
  const k = `${r.season} | ${day} | ${r.updatedBy || '-'}`;
  const g = groups.get(k) || { n: 0, zero: 0, noAmount: 0 };
  g.n += 1;
  if (!Number(r.balance)) g.zero += 1;
  if (!Number(r.deposit1Amount) && !Number(r.deposit2Amount) && !Number(r.deposit3Amount)) g.noAmount += 1;
  groups.set(k, g);
}

console.log(`待处理文档:${rows.length} 条`);
for (const [k, g] of [...groups.entries()].sort()) {
  console.log(`  ${k}  -> ${g.n} 条(零余额 ${g.zero};无任何 deposit 金额 ${g.noAmount})`);
}

if (rows.length === 0) {
  console.log('\n✅ 没有匹配的文档,无需清理');
  process.exit(0);
}

if (!DELETE) {
  console.log(`\nℹ️  dry-run:未删除任何数据。确认后加 --delete 运行。`);
  process.exit(0);
}

// ── 备份 ─────────────────────────────────────────────────────────
mkdirSync('.tmp/backups', { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
const backupPath = resolve('.tmp/backups', `deposits-backup-${stamp}.json`);
writeFileSync(
  backupPath,
  JSON.stringify(rows.map((r) => ({ ...r, updatedAt: iso(r.updatedAt) })), null, 2)
);
console.log(`\n💾 备份:${backupPath}(${rows.length} 条)`);

// ── 执行 ─────────────────────────────────────────────────────────
console.log(`\n🗑  正在删除 ${rows.length} 条 deposits...`);
let deleted = 0;
const CHUNK = 400; // Firestore 单批上限 500
for (let i = 0; i < snap.docs.length; i += CHUNK) {
  const batch = db.batch();
  for (const doc of snap.docs.slice(i, i + CHUNK)) batch.delete(doc.ref);
  await batch.commit();
  deleted += Math.min(CHUNK, snap.docs.length - i);
  console.log(`   ✅ 已提交 ${deleted}/${snap.docs.length}`);
}

// ── 复查 ─────────────────────────────────────────────────────────
const after = SEASON
  ? await db.collection('deposits').where('season', '==', SEASON).get()
  : await db.collection('deposits').get();
console.log(
  after.size === 0
    ? `\n✅ 复查:已删除 ${deleted} 条,集合已清空`
    : `\n⚠ 复查:仍剩 ${after.size} 条:${after.docs.slice(0, 10).map((d) => d.id).join(', ')}${after.size > 10 ? ' …' : ''}`
);
console.log(`   备份保留在 ${backupPath}(需要恢复时用它写回)`);
