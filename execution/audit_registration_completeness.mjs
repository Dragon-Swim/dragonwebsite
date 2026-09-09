#!/usr/bin/env node
// 审计已注册家庭的信息完整度(只读,不写任何数据)。
//
// 用法:
//   node execution/audit_registration_completeness.mjs              # 人类可读报告
//   node execution/audit_registration_completeness.mjs --json       # 机器可读
//   node execution/audit_registration_completeness.mjs --key <路径>  # 指定 service account key
//
// 判定口径 = 当前注册表单(registration.html)的必填规则:
//   parent           firstName lastName gender phone email address
//   swimmers         ≥1 人,每人 firstName lastName gender dob
//   emergencyContact name phone
//   spouse           仅当存在时检查 firstName lastName gender(phone/email 选填)
//
// 另附两类信息:
//   - 新跨字段规则会拦下的存量数据(紧急联系人=本人、配偶与本人同名/同邮箱)
//   - 选填字段缺失统计(USA Swimming ID、配偶电话/邮箱等),仅供参考

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

// ── 归一化(与 src/pages/registration.js 保持一致) ────────────────
const normalizeName = (v) => (v || '')
  .toLowerCase().replace(/[.,'’`\-]/g, ' ').replace(/\s+/g, ' ').trim();
const fullName = (p) => normalizeName(`${p?.firstName || ''} ${p?.lastName || ''}`);
const normalizePhone = (v) => {
  let d = (v || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d;
};
const has = (v) => typeof v === 'string' ? v.trim() !== '' : v !== null && v !== undefined;

const PARENT_REQUIRED = ['firstName', 'lastName', 'gender', 'phone', 'email', 'address'];
const SWIMMER_REQUIRED = ['firstName', 'lastName', 'gender', 'dob'];
const SPOUSE_REQUIRED = ['firstName', 'lastName', 'gender'];
const LABEL = {
  firstName: '名', lastName: '姓', gender: '性别', phone: '电话',
  email: '邮箱', address: '住址', dob: '出生日期', name: '姓名',
};

const missingOf = (obj, fields) => fields.filter((f) => !has(obj?.[f]));

// ── 读取全部 registrations ───────────────────────────────────────
const snap = await db.collection('registrations').get();
const rows = [];

for (const doc of snap.docs) {
  const d = doc.data();
  const missing = [];       // 必填缺失
  const conflicts = [];     // 新规则会拦下的存量数据
  const optionalGaps = [];  // 选填缺失

  const parent = d.parent || {};
  const parentEmail = parent.email || (Array.isArray(d.parentEmails) ? d.parentEmails[0] : '') || '';

  // parent
  if (!d.parent) {
    missing.push('整个 parent 对象缺失');
  } else {
    const m = missingOf(parent, PARENT_REQUIRED);
    if (m.length) missing.push(`家长:${m.map((f) => LABEL[f] || f).join('、')}`);
  }

  // swimmers（软删除的队员不计入,它们保留在文档里但已从家庭中移除）
  const allSwimmers = Array.isArray(d.swimmers) ? d.swimmers : [];
  const swimmers = allSwimmers.filter((s) => s && s.deleted !== true);
  const removedSwimmers = allSwimmers.length - swimmers.length;
  if (swimmers.length === 0) {
    missing.push(allSwimmers.length > 0 ? '没有任何在册队员(队员均被删除)' : '没有任何队员');
  } else {
    swimmers.forEach((s, i) => {
      const m = missingOf(s, SWIMMER_REQUIRED);
      if (m.length) missing.push(`队员#${i + 1}(${s.firstName || '?'} ${s.lastName || ''}):${m.map((f) => LABEL[f] || f).join('、')}`);
      if (!has(s.usaSwimmingId)) optionalGaps.push(`队员#${i + 1} 无 USA Swimming ID`);
    });
  }

  // emergency contact
  const ec = d.emergencyContact || {};
  if (!d.emergencyContact) {
    missing.push('整个 emergencyContact 对象缺失');
  } else {
    const m = missingOf(ec, ['name', 'phone']);
    if (m.length) missing.push(`紧急联系人:${m.map((f) => LABEL[f] || f).join('、')}`);
  }

  // spouse (optional block)
  const spouse = d.spouse || null;
  if (spouse) {
    const m = missingOf(spouse, SPOUSE_REQUIRED);
    if (m.length) missing.push(`配偶:${m.map((f) => LABEL[f] || f).join('、')}`);
    if (!has(spouse.phone)) optionalGaps.push('配偶无电话');
    if (!has(spouse.email)) optionalGaps.push('配偶无邮箱');
  }

  // 跨字段规则(2026-09-09 新增)会拦下的存量数据
  if (has(ec.name) && fullName(parent) && normalizeName(ec.name) === fullName(parent)) {
    conflicts.push('紧急联系人姓名与账号持有人相同');
  }
  if (normalizePhone(ec.phone) && normalizePhone(parent.phone) &&
      normalizePhone(ec.phone) === normalizePhone(parent.phone)) {
    conflicts.push('紧急联系人电话与账号持有人相同');
  }
  if (spouse) {
    if (fullName(spouse) && fullName(spouse) === fullName(parent)) {
      conflicts.push('配偶姓名与账号持有人相同');
    }
    const se = (spouse.email || '').trim().toLowerCase();
    const pe = (parentEmail || '').trim().toLowerCase();
    if (se && pe && se === pe) conflicts.push('配偶邮箱与账号持有人相同');
  }

  rows.push({
    id: doc.id,
    parentName: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || '(无名)',
    email: parentEmail || '(无邮箱)',
    swimmerCount: swimmers.length,
    removedSwimmers,
    missing,
    conflicts,
    optionalGaps,
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

console.log(`══ 一、信息不完整(${incomplete.length})══`);
if (incomplete.length === 0) {
  console.log('  ✅ 全部完整');
} else {
  for (const r of incomplete.sort((a, b) => a.parentName.localeCompare(b.parentName))) {
    console.log(`  • ${r.parentName} <${r.email}> — ${r.missing.join('; ')}`);
  }
}

console.log(`\n══ 二、新跨字段规则会拦下的存量数据(${conflicted.length})══`);
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
