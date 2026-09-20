#!/usr/bin/env node

// 审计已注册家庭的信息完整度(只读,不写任何数据)。
//
// 用法:
//   node execution/audit_registration_completeness.mjs              # 人类可读报告
//   node execution/audit_registration_completeness.mjs --json       # 机器可读
//   node execution/audit_registration_completeness.mjs --key <路径>  # 指定 service account key
//
// 判定口径与 Coach Dashboard 的 Needs Attention 共用
// src/utils/registrationCompleteness.js,避免两处规则漂移。
//
// 必填(required):
//   parent           firstName lastName gender phone address
//                    (email 由 Auth/白名单带出,不作为普通必填缺失)
//   swimmers         ≥1 人,每人 firstName lastName gender dob
//   emergencyContact name phone
//   spouse           仅当存在时检查 firstName lastName gender(phone/email 选填)
//
// 需核实(conflicts):
//   - 紧急联系人=本人、配偶与本人同名/同邮箱
//   - parent.email 与 parentEmails / Auth 邮箱不一致
//
// 选填缺失(optional):
//   USA Swimming ID、配偶电话/邮箱等,仅供参考

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { auditRegistration, activeSwimmers } from '../src/utils/registrationCompleteness.js';

const args = process.argv.slice(2);
const AS_JSON = args.includes('--json');
const keyFlag = args.indexOf('--key');
const KEY_PATH = keyFlag >= 0 && args[keyFlag + 1]
  ? resolve(args[keyFlag + 1])
  : resolve('serviceAccountKey.json');

// ── 凭据 ─────────────────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${KEY_PATH}`);
  console.error(`   ${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();
const auth = getAuth();

// ── 输出标签 ─────────────────────────────────────────────────────
const FIELD_LABEL = {
  firstName: '名', lastName: '姓', gender: '性别', phone: '电话',
  email: '邮箱', address: '住址', dob: '出生日期', name: '姓名',
  usaSwimmingId: 'USA Swimming ID',
};
const SCOPE_LABEL = {
  parent: '家长', swimmer: '队员', emergency: '紧急联系人', spouse: '配偶',
  family: '家庭',
};

function formatRequired(item) {
  if (item.scope === 'parent' && item.field === '__missing__') return '整个 parent 对象缺失';
  if (item.scope === 'emergency' && item.field === '__missing__') return '整个 emergencyContact 对象缺失';
  if (item.scope === 'family' && item.field === 'activeSwimmers') {
    return item.removedSwimmers > 0 ? '没有任何在册队员(队员均被删除)' : '没有任何队员';
  }
  const label = FIELD_LABEL[item.field] || item.field;
  if (item.scope === 'swimmer') {
    return `队员#${item.swimmerIndex + 1}(${item.swimmerName || '?'}):${label}`;
  }
  return `${SCOPE_LABEL[item.scope] || item.scope}:${label}`;
}

function formatConflict(item) {
  switch (item.type) {
    case 'emergency_name_same_as_parent':
      return '紧急联系人姓名与账号持有人相同';
    case 'emergency_phone_same_as_parent':
      return '紧急联系人电话与账号持有人相同';
    case 'spouse_name_same_as_parent':
      return '配偶姓名与账号持有人相同';
    case 'spouse_email_same_as_parent':
      return '配偶邮箱与账号持有人相同';
    case 'parent_email_missing':
      return '家长邮箱缺失(旧数据)';
    case 'parent_emails_missing':
      return 'parentEmails 缺失(配偶关联会失效)';
    case 'parent_email_not_in_parent_emails':
      return `家长邮箱不在 parentEmails 中(${item.parentEmail})`;
    case 'parent_email_mismatch_auth':
      return `家长邮箱与登录账号不一致(${item.parentEmail} vs ${item.authEmail})`;
    default:
      return item.type;
  }
}

function formatOptional(item) {
  const label = FIELD_LABEL[item.field] || item.field;
  if (item.scope === 'swimmer') {
    return `队员#${item.swimmerIndex + 1}(${item.swimmerName || '?'}) 无 ${label}`;
  }
  return `${SCOPE_LABEL[item.scope] || item.scope}无${label}`;
}

// ── 读取全部 registrations ───────────────────────────────────────
const snap = await db.collection('registrations').get();

// 批量读取 Auth 邮箱,用于 parent.email ↔ 登录账号一致性检查。
const authEmails = new Map();
const docIds = snap.docs.map((doc) => doc.id);
for (let i = 0; i < docIds.length; i += 100) {
  const chunk = docIds.slice(i, i + 100);
  try {
    const result = await auth.getUsers(chunk.map((uid) => ({ uid })));
    for (const user of result.users) {
      authEmails.set(user.uid, user.email || null);
    }
  } catch (e) {
    console.warn(`⚠️  无法读取部分 Auth 用户邮箱:${e.message}`);
  }
}

const rows = [];

for (const doc of snap.docs) {
  const d = doc.data();
  const audit = auditRegistration(d, { authEmail: authEmails.get(doc.id) || null });

  const parent = d.parent || {};
  const parentEmail = parent.email || (Array.isArray(d.parentEmails) ? d.parentEmails[0] : '') || '';
  const swimmers = activeSwimmers(d);
  const allSwimmers = Array.isArray(d.swimmers) ? d.swimmers : [];

  rows.push({
    id: doc.id,
    parentName: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || '(无名)',
    email: parentEmail || '(无邮箱)',
    swimmerCount: swimmers.length,
    removedSwimmers: allSwimmers.length - swimmers.length,
    missing: audit.required.map(formatRequired),
    conflicts: audit.conflicts.map(formatConflict),
    optionalGaps: audit.optionalGaps.map(formatOptional),
  });
}

// ── 汇总 ─────────────────────────────────────────────────────────
const incomplete = rows.filter((r) => r.missing.length > 0);
const conflicted = rows.filter((r) => r.conflicts.length > 0);
const withOptionalGaps = rows.filter((r) => r.optionalGaps.length > 0);

if (AS_JSON) {
  console.log(JSON.stringify({ total: rows.length, incomplete, conflicted, withOptionalGaps }, null, 2));
  process.exit(0);
}

console.log(`\n共 ${rows.length} 个已注册家庭`);
const totalActive = rows.reduce((n, r) => n + r.swimmerCount, 0);
const totalRemoved = rows.reduce((n, r) => n + r.removedSwimmers, 0);
console.log(`在册队员 ${totalActive} 人${totalRemoved ? `（另有 ${totalRemoved} 条软删除记录,未计入）` : ''}\n`);

console.log(`══ 一、必填信息缺失(${incomplete.length})══`);
if (incomplete.length === 0) {
  console.log('  ✅ 全部完整');
} else {
  for (const r of incomplete.sort((a, b) => a.parentName.localeCompare(b.parentName))) {
    console.log(`  • ${r.parentName} <${r.email}> — ${r.missing.join('; ')}`);
  }
}

console.log(`\n══ 二、需核实的数据问题(${conflicted.length})══`);
if (conflicted.length === 0) {
  console.log('  ✅ 无');
} else {
  for (const r of conflicted) {
    console.log(`  • ${r.parentName} <${r.email}> — ${r.conflicts.join('; ')}`);
  }
}

console.log(`\n══ 三、选填字段缺失(${withOptionalGaps.length} 个家庭,仅参考)══`);
for (const r of withOptionalGaps) {
  console.log(`  • ${r.parentName} <${r.email}> — ${r.optionalGaps.join('; ')}`);
}

// 字段缺失频次
const freq = {};
for (const r of rows) {
  for (const item of r.missing) {
    const key = item.split(':')[0];
    freq[key] = (freq[key] || 0) + 1;
  }
}
console.log('\n══ 四、缺失项频次 ══');
Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${v} × ${k}`));
