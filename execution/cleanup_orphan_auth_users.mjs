#!/usr/bin/env node
// 删除 Firebase Auth 孤儿账户:有 Auth 账户但无 users/{uid} 文档的 uid。
//
// 背景(2026-07-26 遗留):Google 弹窗签名在**白名单检查之前**创建 Auth 账户;
// 未授权邮箱被登出后账户残留 → 成为孤儿。signin.js 已修(现签名失败即 result.user.delete()),
// 但历史遗留孤儿仍存在,Firebase Console 只能逐个手删,本脚本批量处理。
//
// 用法:
//   node execution/cleanup_orphan_auth_users.mjs                 # dry-run:只列出,不删
//   node execution/cleanup_orphan_auth_users.mjs --delete        # 确认清单后真正删除
//   node execution/cleanup_orphan_auth_users.mjs --key <路径>    # 指定 service account key(默认项目根 serviceAccountKey.json)
//   node execution/cleanup_orphan_auth_users.mjs --exclude <uid或email>  # 排除某账户(可重复),如 --exclude admin@dragonswim.com
//
// 安全设计:
//   - 默认 dry-run;只有显式 --delete 才执行删除(不可逆)
//   - 只删 "无 users/ 文档 且 无 registrations/ 文档" 的 uid
//   - "有 registrations 但无 users 文档" 的 uid → 列为可疑,只展示、绝不自动删
//   - 删除后自动复查一遍确认清零
//
// 注:execution/ 里其余脚本是 Python,但 firebase-admin 是已安装的 Node 依赖,
//     Python 需额外 pip install,故用 Node 实现(零新增依赖)。

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
// --exclude 可重复:按 uid 或 email 排除,永不删除
const EXCLUDE = args.filter((a, i) => args[i - 1] === '--exclude');

// ── 1. 加载凭据 ──────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${KEY_PATH}`);
  console.error(`   ${e.message}`);
  console.error('   生成:Firebase Console → ⚙️ Project Settings → Service accounts → Generate new private key');
  console.error('   下载 JSON 放到项目根目录(已被 .gitignore 保护),或 --key <路径> 指定');
  process.exit(1);
}
initializeApp({ credential: cert(key) });

// ── 2. 收集数据 ──────────────────────────────────────────────
// 所有 Auth 账户(分页,每页 1000)
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
// 集合所有文档 id(只读引用,不拉内容)
async function listAllDocIds(collection) {
  const refs = await getFirestore().collection(collection).listDocuments();
  return new Set(refs.map((r) => r.id));
}

const authUsers = await listAllAuthUsers();
const userUids = await listAllDocIds('users');
const regUids = await listAllDocIds('registrations');
console.log(`Auth 账户:${authUsers.length} | users/ 文档:${userUids.size} | registrations/ 文档:${regUids.size}\n`);

// ── 3. 分类 ──────────────────────────────────────────────────
const orphans = authUsers.filter((u) => !userUids.has(u.uid));            // 无 users 文档
const excluded = orphans.filter((u) => EXCLUDE.includes(u.uid) || EXCLUDE.includes(u.email));
const deleteCandidates = orphans.filter(
  (u) => !regUids.has(u.uid) && !(EXCLUDE.includes(u.uid) || EXCLUDE.includes(u.email))
);                                                                        // 无 registrations 且未被排除 → 安全删除
const suspicious = orphans.filter((u) => regUids.has(u.uid));             // 有 registrations → 可疑,不动

const fmt = (u) => `${u.email || '(无邮箱)'} | 创建于 ${u.metadata.creationTime || '?'} | uid ${u.uid}`;

if (deleteCandidates.length === 0 && suspicious.length === 0) {
  console.log('✅ 没有孤儿账户,无需清理');
  process.exit(0);
}

console.log(`🔴 可删除孤儿(${deleteCandidates.length}):无 users/ 也无 registrations/ 文档`);
deleteCandidates.forEach((u) => console.log(`   - ${fmt(u)}`));

if (excluded.length > 0) {
  console.log(`\n⏭  已排除(${excluded.length}):--exclude 指定,不删`);
  excluded.forEach((u) => console.log(`   - ${fmt(u)}`));
}

if (suspicious.length > 0) {
  console.log(`\n⚠️  可疑(${suspicious.length}):有 registrations/ 但无 users/ 文档 — 只展示,绝不自动删`);
  suspicious.forEach((u) => console.log(`   - ${fmt(u)}`));
}

// ── 4. 执行(仅 --delete)─────────────────────────────────────
if (!DELETE) {
  console.log('\nℹ️  dry-run:未执行删除。确认清单后加 --delete 运行。');
  process.exit(0);
}
if (deleteCandidates.length === 0) {
  console.log('\n没有可删除的孤儿,跳过');
  process.exit(0);
}

console.log(`\n🗑  正在删除 ${deleteCandidates.length} 个孤儿账户...`);
// deleteUsers 每次最多 1000 个;返回每个 uid 的删除结果(含失败)
for (let i = 0; i < deleteCandidates.length; i += 1000) {
  const batch = deleteCandidates.slice(i, i + 1000).map((u) => u.uid);
  const result = await getAuth().deleteUsers(batch);
  console.log(`   批 ${i / 1000 + 1}:成功 ${batch.length - result.errors.length} / ${batch.length}`);
  result.errors.forEach((e) => console.error(`   ⚠ 删除失败 ${e.error.message}:${e.error.code}`));
}

// ── 5. 复查 ──────────────────────────────────────────────────
const remaining = (await listAllAuthUsers()).filter(
  (u) => !userUids.has(u.uid) && !regUids.has(u.uid) && !(EXCLUDE.includes(u.uid) || EXCLUDE.includes(u.email))
);
console.log(remaining.length === 0
  ? '✅ 复查:孤儿已清零'
  : `⚠ 复查:仍有 ${remaining.length} 个孤儿(可能刚创建或删除失败,请重跑本脚本查看)`);
