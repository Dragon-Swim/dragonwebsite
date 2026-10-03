#!/usr/bin/env node
// 清理生产环境里的测试账号(默认 dry-run,只列出)。
//
// 背景:scripts/seed-admin.mjs 曾用硬编码密码 test1234 在生产创建过测试家庭
// (john.chen@example.com 等),这些账号在公开仓库里密码已知,应当清除。
//
// 用法:
//   node execution/cleanup_test_accounts.mjs                 # dry-run:只列出
//   node execution/cleanup_test_accounts.mjs --delete        # 确认后真正删除
//   node execution/cleanup_test_accounts.mjs --key <路径>     # 指定 service account key
//
// 每个候选账号会一并清理:
//   - Auth 账户
//   - users/{uid}
//   - registrations/{uid}
//   - families/ 中 email 匹配的白名单条目
//
// 安全设计:
//   - 默认 dry-run,必须显式 --delete
//   - 只匹配 RFC 2606 保留域名(@example.com/.org/.net)——不可能是真实用户
//   - 删除前打印关联数据摘要(家长姓名、队员数),便于人工确认没有真实数据

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const DELETE = args.includes('--delete');
const keyFlag = args.indexOf('--key');
const KEY_PATH = keyFlag >= 0 && args[keyFlag + 1]
  ? resolve(args[keyFlag + 1])
  : resolve('serviceAccountKey.json');

const TEST_DOMAINS = ['@example.com', '@example.org', '@example.net'];
const isTestEmail = (email) => !!email && TEST_DOMAINS.some((d) => email.toLowerCase().endsWith(d));

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

// ── 收集 ─────────────────────────────────────────────────────────
async function listAllAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const res = await getAuth().listUsers(1000, pageToken);
    users.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken);
  return users;
}

const all = await listAllAuthUsers();
const candidates = all.filter((u) => isTestEmail(u.email));
console.log(`生产 Auth 账户总数:${all.length} | 测试域名账户:${candidates.length}\n`);

if (candidates.length === 0) {
  console.log('✅ 没有测试账号,无需清理');
  process.exit(0);
}

// ── 关联数据 ─────────────────────────────────────────────────────
const plan = [];
for (const u of candidates) {
  const userDoc = await db.collection('users').doc(u.uid).get();
  const regDoc = await db.collection('registrations').doc(u.uid).get();
  const famSnap = await db.collection('families').where('email', '==', u.email).get();
  const reg = regDoc.exists ? regDoc.data() : null;

  plan.push({ user: u, hasUserDoc: userDoc.exists, hasReg: regDoc.exists, famDocs: famSnap.docs.map((d) => d.id), reg });

  console.log(`• ${u.email}  (uid ${u.uid})`);
  console.log(`    Auth 创建于   : ${u.metadata.creationTime || '?'}`);
  console.log(`    users/{uid}   : ${userDoc.exists ? '存在' : '无'}`);
  console.log(`    registrations : ${regDoc.exists ? '存在' : '无'}`);
  if (reg) {
    const swimmers = Array.isArray(reg.swimmers) ? reg.swimmers.filter((s) => !s?.deleted).length : 0;
    console.log(`      家长        : ${reg.parent?.firstName || '?'} ${reg.parent?.lastName || ''} <${reg.parent?.email || '?'}>`);
    console.log(`      在册队员    : ${swimmers}`);
  }
  console.log(`    families 白名单: ${famSnap.size ? famSnap.docs.map((d) => `${d.id}(${d.data().status})`).join(', ') : '无'}`);
}

// ── 执行 ─────────────────────────────────────────────────────────
if (!DELETE) {
  console.log(`\nℹ️  dry-run:未删除任何数据。确认上方 ${candidates.length} 个账号都是测试数据后,加 --delete 运行。`);
  process.exit(0);
}

console.log(`\n🗑  正在删除 ${candidates.length} 个测试账号...`);
let deleted = 0;
for (const p of plan) {
  try {
    for (const id of p.famDocs) await db.collection('families').doc(id).delete();
    if (p.hasReg) await db.collection('registrations').doc(p.user.uid).delete();
    if (p.hasUserDoc) await db.collection('users').doc(p.user.uid).delete();
    await getAuth().deleteUser(p.user.uid);
    console.log(`   ✅ ${p.user.email}`);
    deleted += 1;
  } catch (e) {
    console.error(`   ❌ ${p.user.email}: ${e.message}`);
  }
}

// ── 复查 ─────────────────────────────────────────────────────────
const remaining = (await listAllAuthUsers()).filter((u) => isTestEmail(u.email));
console.log(remaining.length === 0
  ? `\n✅ 复查:已删除 ${deleted} 个,测试账号清零`
  : `\n⚠ 复查:仍有 ${remaining.length} 个测试账号:${remaining.map((u) => u.email).join(', ')}`);
