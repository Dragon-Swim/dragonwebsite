#!/usr/bin/env node

/**
 * 教练跟进名单生成器 —— 一次跑出「该给谁发什么信」的全套清单。
 *
 *   node execution/meet-entry/coach-followup-report.mjs .tmp/meet-entry/legacy/pv-oct-entries.json \
 *        -o .tmp/meet-entry/legacy/coach-followup-2026-10-03.md
 *
 * 产出（按「教练能直接发信」组织，每组一个名单 + 一封英文模板）：
 *
 *   A  报名了比赛、家庭还没注册     → 催注册（比赛版），最急
 *   B  建了账号、但没提交注册表     → 催交表（账号已存在 → 提示用忘记密码）
 *   C  白名单上没注册、也没报名比赛 → 催注册（普通版）
 *   D  欠费（已注册家庭）           → 逐封发（家长在网站上看不到余额，信里要写金额）
 *   E  报名了比赛、孩子缺 USA-S ID  → 补 ID 信（本场直接受影响）
 *   F  没报名比赛、孩子缺 USA-S ID  → 补 ID 信（可选，下次比赛前补）
 *   人工看：孤儿 fee/deposit 名字、白名单重复条目、配偶已注册、
 *           报名了但费用表没有、有费用但不在报名报告里……
 *
 * ── 三个关键判据（都是线上数据逼出来的，改代码前先读这一段）────────────────
 *
 * 1. 「家庭已注册」不等于「family 白名单条目的 registeredUid 有值」。
 *    配偶用另一个邮箱注册时，这个邮箱可能仍是 pending；反过来，家长建了 Auth 账号
 *    （registeredUid 有值）却没提交注册表，也会显示 registered。
 *    所以判定顺序是：自己文档存在 → 邮箱出现在某份注册表里（配偶）→ 才是真未注册。
 *
 * 2. 白名单里存在「已注册家庭的重复条目」（实例：Anthony Wang 挂在 Julia Yan 名下，
 *    白名单里另有一条 helensongzima@gmail.com "Anthony wang parent" 仍是 pending）。
 *    只按「邮箱有没有被注册表覆盖」判会去催一个已经注册的家庭，所以额外做一层
 *    「条目名里包含已注册泳手全名」的识别，命中的不放进发信名单，单列请人工确认。
 *
 * 3. 余额只在教练端可见（Fee Summary 是 coach tab）。家长看不到，所以 D 组不能 BCC
 *    一封通用信，必须逐户写清金额 —— 本脚本直接把每户的邮件正文拼好。
 *
 * 余额口径与仪表盘一致：balance = (deposits.balance + deposit1..3) − 该赛季 meets.feeData 合计。
 * 负数 = 还欠队里钱。姓名比对用 src/utils/feeImport.js 的 normalizeName（忽略标点），
 * 与 dashboard 的 `buildFeeSummaryData` 同一套，避免「Luo-han Chen / Luohan Chen」被拆成两行。
 *
 * 只读：只 get，不写 Firestore。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { normalizeName, depositTotal } from '../../src/utils/feeImport.js';
import { normalizeSortKey } from '../../src/utils/swimmerSort.js';
import { auditRegistration, activeSwimmers } from '../../src/utils/registrationCompleteness.js';

// ── 参数 ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const entriesPath = args.find((a) => !a.startsWith('-') && a !== flag('-o') && a !== flag('--key') && a !== flag('--season'));
if (!entriesPath) {
  console.error('用法: node execution/meet-entry/coach-followup-report.mjs <entries.json> [-o out.md] [--season 2026-2027] [--key path]');
  process.exit(2);
}
const KEY_PATH = resolve(flag('--key', 'serviceAccountKey.json'));
const SEASON_FLAG = flag('--season', null);

// ── 小工具 ──────────────────────────────────────────────────────────────────
const ne = (e) => String(e ?? '').trim().toLowerCase();
const money = (n) => (Number(n) < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toFixed(2);
const owed = (n) => money(Math.abs(Number(n) || 0));
const bcc = (list) => list.join('; ');
const bccLines = (list) => list.join('\n');
const uniq = (a) => [...new Set(a)];
const pname = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim();
const familyLabel = (r) => [pname(r.parent), pname(r.spouse)].filter(Boolean).join(' & ') || '(no name)';
const kidName = (s) => [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim();
const seasonFromDate = (s) => {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const mo = d.getMonth() + 1;
  return mo >= 9 ? `${d.getFullYear()}-${d.getFullYear() + 1}` : `${d.getFullYear() - 1}-${d.getFullYear()}`;
};

// ── 报名报告（第一场比赛的报名表）──────────────────────────────────────────
const entries = JSON.parse(readFileSync(resolve(entriesPath), 'utf8'));
const athletes = entries.athletes || [];
const counts = entries.counts || {};
const meetMeta = entries.meet || {};
const SEASON = SEASON_FLAG || seasonFromDate(meetMeta.startDate) || (() => {
  const d = new Date();
  const y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${y + 1}`;
})();

// ── 读线上数据 ──────────────────────────────────────────────────────────────
const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
initializeApp({ credential: cert(key) });
const db = getFirestore();

const [famSnap, regSnap, depSnap, meetSnap, coachSnap] = await Promise.all([
  db.collection('families').get(),
  db.collection('registrations').get(),
  db.collection('deposits').where('season', '==', SEASON).get(),
  db.collection('meets').get(),
  db.collection('coaches').get(),
]);
const families = famSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const regs = regSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const deps = depSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const meets = meetSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const coachEmails = new Set(coachSnap.docs.map((d) => ne(d.data().email)).filter(Boolean));

const regById = new Map(regs.map((r) => [r.id, r]));
const emailsOf = (r) => uniq([r.parent?.email, r.spouse?.email, ...(r.parentEmails || [])].map(ne).filter(Boolean));
const coveredEmails = new Set();
for (const r of regs) for (const e of emailsOf(r)) coveredEmails.add(e);
const famEmails = new Set(families.map((f) => ne(f.email)).filter(Boolean));

// ── 本赛季费用 / 押金（口径同 dashboard 的 Fee Summary）──────────────────────
const meetOfSeason = meets.filter((m) => (m.season || seasonFromDate(m.startDate || m.date)) === SEASON);
const feeByKey = new Map();
for (const m of meetOfSeason) {
  for (const sw of (m.feeData?.swimmers || [])) {
    const k = normalizeName(sw.name);
    if (!k) continue;
    const cur = feeByKey.get(k) || { name: String(sw.name).trim(), total: 0, meets: [] };
    cur.total += Number(sw.total) || 0;
    cur.meets.push(`${m.name} ${money(sw.total)}`);
    feeByKey.set(k, cur);
  }
}
const depByKey = new Map();
for (const d of deps) {
  const k = normalizeName(d.swimmerName);
  if (k) depByKey.set(k, d);
}

// ── 名册（在册泳手）+ 每人余额 ──────────────────────────────────────────────
const roster = [];
for (const r of regs) {
  for (const s of activeSwimmers(r)) {
    const k = normalizeName(kidName(s));
    roster.push({ regId: r.id, swimmer: s, key: k, name: kidName(s) });
  }
}
const rosterByKey = new Map();
for (const row of roster) {
  if (!rosterByKey.has(row.key)) rosterByKey.set(row.key, []);
  rosterByKey.get(row.key).push(row);
}

// 每个在册泳手一行的金额（余额 = 押金/结转 − 本季费用）
const swimmerMoney = new Map(); // regId → { kids:[…], fee, carry, paid, balance }
for (const r of regs) {
  const kids = activeSwimmers(r);
  const rows = [];
  let fee = 0, carry = 0, paid = 0;
  for (const s of kids) {
    const k = normalizeName(kidName(s));
    const f = feeByKey.get(k);
    const d = depByKey.get(k);
    const kidFee = f ? f.total : 0;
    const kidCarry = d ? Number(d.balance) || 0 : 0;
    const kidPaid = d ? (Number(d.deposit1Amount) || 0) + (Number(d.deposit2Amount) || 0) + (Number(d.deposit3Amount) || 0) : 0;
    fee += kidFee; carry += kidCarry; paid += kidPaid;
    rows.push({ name: kidName(s), key: k, fee: kidFee, carry: kidCarry, paid: kidPaid, meets: f ? f.meets : [] });
  }
  swimmerMoney.set(r.id, { kids: rows, fee, carry, paid, balance: carry + paid - fee });
}

// 被在册泳手消费掉的 key（剩下的就是「孤儿」名字）
const consumedKeys = new Set(roster.map((x) => x.key));

// ── 白名单分类 ──────────────────────────────────────────────────────────────
// 已注册名册的名字索引（用于识别「重复条目」）：泳手全名 + 家长/配偶全名
const registeredSwimmerNames = new Set(roster.map((x) => normalizeSortKey(x.name)).filter(Boolean));
const registeredParentNames = new Set();
for (const r of regs) for (const p of [r.parent, r.spouse]) {
  const n = normalizeSortKey(pname(p));
  if (n) registeredParentNames.add(n);
}
const STRIP_ROLE = /\b(parent|mom|dad|mother|father|guardian)\b/g;
const entryBare = (s) => normalizeSortKey(s).replace(STRIP_ROLE, ' ').replace(/\s+/g, ' ').trim();

const whitelist = families.map((f) => {
  const email = ne(f.email);
  const normName = normalizeSortKey(f.parentName || '');
  const ownReg = Boolean(f.registeredUid) && regById.has(f.registeredUid);
  const inReg = coveredEmails.has(email);
  // 「条目名里包含某个已注册泳手的全名」→ 是已注册家庭的重复条目
  let dupOf = null;
  for (const s of registeredSwimmerNames) if (s && normName.includes(s)) { dupOf = s; break; }
  if (!dupOf && registeredParentNames.has(entryBare(f.parentName || ''))) dupOf = entryBare(f.parentName || '');
  return { ...f, email, normName, ownReg, inReg, dupOf };
});

const wlNoForm = whitelist.filter((w) => !w.ownReg && !w.inReg && w.registeredUid && !w.dupOf);
const wlPendingSend = whitelist.filter((w) => !w.ownReg && !w.inReg && !w.registeredUid && !w.dupOf);
const wlSpouse = whitelist.filter((w) => !w.ownReg && w.inReg);
const wlDup = whitelist.filter((w) => !w.ownReg && !w.inReg && w.dupOf);

// ── 报名报告 × 名册 匹配 ────────────────────────────────────────────────────
const squash = (v) => normalizeSortKey(v).replace(/\s+/g, '');
const rosterIndex = roster.map((x) => {
  const parts = normalizeSortKey(x.name).split(' ').filter(Boolean);
  return {
    ...x,
    first: parts[0] || '',
    last: parts[parts.length - 1] || '',
    full: normalizeSortKey(x.name),
    rev: parts.slice().reverse().join(' '),
    sq: squash(x.name),
  };
});
const enteredByReg = new Map(); // regId → Set(swimmer key)
const entryUnmatched = [];
const entryMatched = [];
for (const a of athletes) {
  const parts = normalizeSortKey(a.name).split(' ').filter(Boolean);
  const first = parts[0] || '';
  const last = parts[parts.length - 1] || '';
  const tail = parts.slice(1).join(' ');
  const eFull = normalizeSortKey(a.name);
  let hit = rosterIndex.filter((r) => r.full === eFull || r.rev === eFull);
  let rule = 'exact';
  if (!hit.length) { hit = rosterIndex.filter((r) => r.sq === squash(a.name)); rule = 'squash'; }
  if (!hit.length) { hit = rosterIndex.filter((r) => r.first === first && (r.last === last || r.last === tail)); rule = 'last+first'; }
  if (hit.length) {
    const rows = uniq(hit.map((h) => h.regId)).map((id) => ({ regId: id, key: hit.find((h) => h.regId === id).key }));
    for (const { regId, key } of rows) {
      if (!enteredByReg.has(regId)) enteredByReg.set(regId, new Map());
      enteredByReg.get(regId).set(key, a.name);
    }
    entryMatched.push({ entry: a, rule, regIds: rows.map((x) => x.regId) });
  } else {
    entryUnmatched.push({ entry: a, first, last, tail, parts });
  }
}

// ── 报名了比赛、但家庭没注册 → A 组候选（按旧脚本的候选规则找家长邮箱）──────
const candidateFor = (first, last, tail) => {
  const cands = whitelist
    .filter((w) => !coachEmails.has(w.email))
    .map((w) => {
      const toks = new Set(w.normName.split(' ').filter(Boolean));
      const rules = [];
      if (toks.has(first) && (toks.has(last) || (tail && toks.has(tail)))) rules.push('first+last');
      else if (toks.has(last) || (tail && toks.has(tail))) rules.push('last-only');
      else if (toks.has(first)) rules.push('first-only');
      return { w, rules };
    })
    .filter((c) => c.rules.length);
  const strong = cands.filter((c) => c.rules[0] === 'first+last');
  return { cands, pick: strong.length ? strong : (cands.length === 1 ? cands : []) };
};

// 联系人表：key → { kind, email, label, kids, money, entered… }
const contacts = new Map();
const ensure = (key, init) => {
  if (!contacts.has(key)) contacts.set(key, init);
  return contacts.get(key);
};

// (1) 已注册家庭
for (const r of regs) {
  const m = swimmerMoney.get(r.id);
  const c = ensure(`reg:${r.id}`, {
    kind: 'registered', key: `reg:${r.id}`, regId: r.id,
    label: familyLabel(r), email: emailsOf(r)[0] || '', altEmails: emailsOf(r).slice(1),
    kids: [], fee: m.fee, carry: m.carry, paid: m.paid, balance: m.balance,
    enteredMissing: [], enteredWithId: [], otherMissing: [],
  });
  c.kids = m.kids.map((k) => k.name);
}
// (2) 白名单未注册（pending / 建了账号没交表）→ 各自一个联系人
for (const w of [...wlPendingSend, ...wlNoForm]) {
  ensure(`wl:${w.id}`, {
    kind: w.ownReg ? 'registered' : (w.registeredUid ? 'whitelist-noform' : 'whitelist-pending'),
    key: `wl:${w.id}`, whitelistId: w.id, whitelistEmail: w.email,
    label: w.parentName || w.email, email: w.email, altEmails: [],
    kids: [], fee: 0, carry: 0, paid: 0, balance: 0,
    enteredMissing: [], enteredWithId: [], otherMissing: [], alsoOwes: 0,
  });
}
// (3) 孤儿 fee/deposit 名字 → 尽量挂到某个白名单联系人上
const orphanNames = [];
for (const [k, f] of feeByKey) if (!consumedKeys.has(k)) orphanNames.push({ key: k, name: f.name, fee: f.total, carry: 0, paid: 0, source: 'fee' });
for (const [k, d] of depByKey) {
  if (consumedKeys.has(k)) continue;
  const cur = orphanNames.find((o) => o.key === k);
  if (cur) { cur.carry = Number(d.balance) || 0; cur.paid = depositTotal(d) - (Number(d.balance) || 0); cur.source = 'both'; cur.dep = d; }
  else orphanNames.push({ key: k, name: d.swimmerName, fee: 0, carry: Number(d.balance) || 0, paid: depositTotal(d) - (Number(d.balance) || 0), source: 'dep', dep: d });
}
const orphanNoContact = [];
for (const o of orphanNames) {
  const parts = o.key.split(' ').filter(Boolean);
  const first = parts[0] || '';
  const last = parts[parts.length - 1] || '';
  const tail = parts.slice(1).join(' ');
  const { cands, pick } = candidateFor(first, last, tail);
  const usable = pick.filter((c) => !coachEmails.has(c.w.email));
  let target = null;
  if (usable.length) {
    const w = usable[0].w;
    target = [...contacts.values()].find((c) => c.whitelistId === w.id) || null;
    if (!target && w.inReg) target = [...contacts.values()].find((c) => c.kind === 'registered' && c.altEmails.concat([c.email]).includes(w.email));
  }
  o.balance = o.carry + o.paid - o.fee;
  o.match = usable.length ? { email: usable[0].w.email, name: usable[0].w.parentName, rules: usable[0].rules, status: usable[0].w.registeredUid ? 'registered' : 'pending' } : null;
  o.candidates = cands.map((c) => `${c.w.email} [${c.w.parentName}]`);
  if (target) {
    target.kids.push(o.name);
    target.fee += o.fee; target.carry += o.carry; target.paid += o.paid; target.balance += o.balance;
    target.orphanNames = [...(target.orphanNames || []), o.name];
  } else {
    orphanNoContact.push(o);
  }
}

// (4) 比赛报名：标记每个联系人的参赛情况 + 缺 ID 情况
for (const [regId, map] of enteredByReg) {
  const c = contacts.get(`reg:${regId}`);
  if (!c) continue; // 已注册家庭一定有联系人
  for (const [k, enteredName] of map) {
    const hasId = rosterIndex.find((x) => x.regId === regId && x.key === k)?.swimmer?.usaSwimmingId;
    if (String(hasId || '').trim()) c.enteredWithId.push(enteredName);
    else c.enteredMissing.push(enteredName);
  }
}
// 未报名、且缺 ID 的孩子
for (const r of regs) {
  const c = contacts.get(`reg:${r.id}`);
  const entered = enteredByReg.get(r.id) || new Map();
  for (const s of activeSwimmers(r)) {
    const k = normalizeName(kidName(s));
    if (String(s.usaSwimmingId || '').trim()) continue;
    if (entered.has(k)) continue;
    c.otherMissing.push(kidName(s));
  }
}
// 家长信息完整度（与教练端 Needs Attention 同口径）
for (const r of regs) {
  const c = contacts.get(`reg:${r.id}`);
  const a = auditRegistration(r);
  c.requiredMissing = a.required;
  c.conflicts = a.conflicts;
}

// ── 名单分组 ────────────────────────────────────────────────────────────────
const groupA = []; // 报名了比赛、家庭没注册（含比赛版正文）
const groupAextra = []; // 报了名但匹配不到白名单邮箱
for (const u of entryUnmatched) {
  const { cands, pick } = candidateFor(u.first, u.last, u.tail);
  const usable = pick.filter((c) => !coachEmails.has(c.w.email) && !c.w.inReg && !c.w.dupOf);
  const covered = pick.filter((c) => c.w.inReg);
  if (covered.length) {
    // 家庭其实注册了 —— 是「孩子不在名册上」，不是「没注册」
    groupAextra.push({ name: u.entry.name, age: u.entry.age, reason: `白名单候选 ${covered[0].w.email} 已被注册覆盖（家庭已注册），但该选手不在任何注册名册里`, cands: cands.map((c) => `${c.w.email} [${c.w.parentName}]`) });
    continue;
  }
  if (usable.length) {
    const w = usable[0].w;
    const c = contacts.get(`wl:${w.id}`);
    if (!c) { groupAextra.push({ name: u.entry.name, age: u.entry.age, reason: '候选家庭的分类与预期不符（可能是白名单重复条目）', cands: cands.map((x) => `${x.w.email} [${x.w.parentName}]`) }); continue; }
    c.kids = uniq([...c.kids, u.entry.name]);
    c.meetEntered = [...(c.meetEntered || []), `${u.entry.name} (${u.entry.age})`];
    c.entryEvidence = [...(c.entryEvidence || []), `${u.entry.name} → ${usable[0].rules.join('+')} → ${JSON.stringify(w.parentName)}`];
    groupA.push(c);
  } else {
    groupAextra.push({ name: u.entry.name, age: u.entry.age, reason: cands.length ? '候选不唯一或证据太弱（点名会误伤别的家庭）' : '白名单里没有任何名字能对上', cands: cands.map((x) => `${x.w.email} [${x.w.parentName}]`) });
  }
}
const groupAKeys = new Set(groupA.map((c) => c.key));

// 两个未匹配选手可能指向同一户 → 去重
const groupADedup = [...new Map(groupA.map((c) => [c.key, c])).values()];
groupA.splice(0, groupA.length, ...groupADedup);

const groupB = wlNoForm.map((w) => contacts.get(`wl:${w.id}`)).filter((c) => !groupAKeys.has(c.key));
const groupC = [...wlPendingSend].filter((w) => !groupAKeys.has(`wl:${w.id}`)).map((w) => contacts.get(`wl:${w.id}`));

const registered = [...contacts.values()].filter((c) => c.kind === 'registered');
const owes = registered.filter((c) => c.balance < 0);                      // D 组
const groupE = registered.filter((c) => c.balance >= 0 && c.enteredMissing.length > 0);   // 已报名缺 ID（不欠费的）
const groupF = registered.filter((c) => c.balance >= 0 && c.enteredMissing.length === 0 && c.otherMissing.length > 0);
const needVerify = registered.filter((c) => c.requiredMissing?.length || c.conflicts?.length);

// 未注册但欠费（写进 A/B/C 的附加段）
const unregisteredOwes = [...groupA, ...groupB, ...groupC].filter((c) => c.balance < 0);

// 待注册条目里「同姓」的成对出现 —— 白名单名字很脏，同姓未必同一家，交给教练确认
const surnameOf = (label) => {
  const bare = normalizeSortKey(label)
    .replace(/\b(parent|mom|dad|mother|father|guardian)\b/g, ' ')
    .replace(/[()/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = bare.split(' ').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
};
const pendingSendable = [...groupA, ...groupB, ...groupC];
const sameSurnamePairs = [];
for (let i = 0; i < pendingSendable.length; i++) {
  for (let j = i + 1; j < pendingSendable.length; j++) {
    const a = surnameOf(pendingSendable[i].label);
    const b = surnameOf(pendingSendable[j].label);
    if (a && a === b && a.length >= 2) sameSurnamePairs.push([pendingSendable[i], pendingSendable[j], a]);
  }
}

// ── 自校验 ──────────────────────────────────────────────────────────────────
// 费用/押金里的每个名字都必须归到某户（在册泳手 / 白名单联系人 / 无联系人孤儿），
// 否则说明有人被漏掉或多算 —— 余额总额两边算出来必须一致。
const balanceOfKey = (k) => ((depByKey.has(k) ? depositTotal(depByKey.get(k)) : 0) - (feeByKey.has(k) ? feeByKey.get(k).total : 0));
const allMoneyKeys = new Set([...feeByKey.keys(), ...depByKey.keys()]);
const accountedKeys = new Set();
for (const r of regs) for (const k of swimmerMoney.get(r.id).kids) accountedKeys.add(k.key);
for (const c of contacts.values()) for (const n of (c.orphanNames || [])) accountedKeys.add(normalizeName(n));
for (const o of orphanNoContact) accountedKeys.add(o.key);
const unaccounted = [...allMoneyKeys].filter((k) => !accountedKeys.has(k));
const owedByKey = [...allMoneyKeys].reduce((n, k) => n + Math.max(0, -balanceOfKey(k)), 0);
const owedByFamily = [...owes, ...unregisteredOwes, ...orphanNoContact].reduce((n, c) => n + Math.abs(c.balance < 0 ? c.balance : 0), 0);

const checks = [];
checks.push([`报名表 ${athletes.length} 人 = 报告 Total Athletes ${counts.reportTotalAthletes}`,
  counts.reportTotalAthletes == null || counts.reportTotalAthletes === athletes.length]);
checks.push([`报名表匹配：名册内 ${entryMatched.length} + 未匹配 ${entryUnmatched.length} = ${athletes.length}`,
  entryMatched.length + entryUnmatched.length === athletes.length]);
checks.push([`白名单分类完备：本人已注册 ${whitelist.filter((w) => w.ownReg).length} + 待注册 ${wlPendingSend.length} + 建号未交表 ${wlNoForm.length} + 配偶已注册 ${wlSpouse.length} + 重复条目 ${wlDup.length} = ${families.length}`,
  whitelist.filter((w) => w.ownReg).length + wlPendingSend.length + wlNoForm.length + wlSpouse.length + wlDup.length === families.length]);
checks.push([`费用/押金里的名字全部归户（未归 ${unaccounted.length} 个）`, unaccounted.length === 0]);
checks.push([`欠费总额两边一致：逐个泳手 ${money(owedByKey)} = 按户汇总 ${money(owedByFamily)}`,
  Math.abs(owedByKey - owedByFamily) < 0.005]);
checks.push([`未注册但欠费的 ${[...contacts.values()].filter((c) => c.kind !== 'registered' && c.balance < 0).length} 户全部在 A/B/C 名单里`,
  [...contacts.values()].filter((c) => c.kind !== 'registered' && c.balance < 0)
    .every((c) => [...groupA, ...groupB, ...groupC].some((g) => g.key === c.key))]);
checks.push([`D+E+F 只覆盖已注册家庭，不重不漏：${owes.length} + ${groupE.length} + ${groupF.length} ≤ ${registered.length}`,
  owes.length + groupE.length + groupF.length <= registered.length]);
checks.push([`E+F = 不欠费且有孩子缺 ID 的已注册家庭 ${groupE.length + groupF.length} 家`,
  groupE.length + groupF.length === registered.filter((c) => c.balance >= 0 && (c.enteredMissing.length || c.otherMissing.length)).length]);
const allSend = [...groupA, ...groupB, ...groupC, ...groupE, ...groupF].map((c) => c.email);
checks.push([`可发信名单无重复邮箱（${allSend.length} 条）`, new Set(allSend).size === allSend.length]);
checks.push([`可发信名单不含教练邮箱`, allSend.every((e) => !coachEmails.has(e))]);
checks.push([`可发信名单地址格式正常`, allSend.every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))]);
checks.push([`赛道 meet 已在 Firestore 且属于 ${SEASON}`,
  meetOfSeason.some((m) => m.startDate === meetMeta.startDate)]);

// ── meet 名（用线上名，家长在 Meet Management 看到的是它）───────────────────
const dbMeet = meets.find((m) => (m.startDate || m.date) === meetMeta.startDate) || null;
const MEET = dbMeet?.name || meetMeta.name || '(meet)';
const MEET_DATE = meetMeta.startDate || dbMeet?.startDate || '';
const MEET_END = meetMeta.endDate || dbMeet?.endDate || '';
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
const OUT_PATH = flag('-o', `.tmp/meet-entry/legacy/coach-followup-${new Date().toISOString().slice(0, 10)}.md`);

// ── 邮件模板 ────────────────────────────────────────────────────────────────
const prevSeason = SEASON.replace(/^(\d{4})-(\d{4})$/, (_, a, b) => `${Number(a) - 1}-${a}`);
const owesBlock = (c) => `    Swimmer(s): ${c.kids.join(', ') || c.label}
    Amount due: ${owed(c.balance)}`;
const REG_SUBJECT_MEET = `Action needed before the ${MEET}: please complete your Dragon Swim registration`;
const REG_SUBJECT_PLAIN = 'Action needed: please complete your Dragon Swim registration';
const regBody = (withMeet, c) => `Hello,

${withMeet
  ? `Your swimmer is entered in the ${MEET} (${MEET_DATE}${MEET_END ? ` to ${MEET_END}` : ''}), but your family's online registration has not been submitted yet. Please complete it before the meet.`
  : `Our records show that your family's online registration has not been submitted yet. Please complete it when you have a moment.`}

${withMeet ? 'Two things to do, and the second one matters for this meet:' : 'Two things to do:'}

  1. Complete the registration form:

         https://dragonswim.org/registration.html

     Sign in (or create an account) using the email address this message was sent
     to — it is already on our approved list, so please do not use a different one.
     You will need your swimmer's date of birth and gender, plus your address and
     phone number.

  2. Add your swimmer's USA Swimming ID on the form. It is optional, but it is what
     lets us match a swimmer to official meet results and to the entry fees for each
     meet. If you do not have it handy, submit the form first and add the ID later
     from your dashboard.
${c && c.balance < 0 ? `
Separately, our records show an outstanding meet-fee balance for your family:

${owesBlock(c)}

Please reply to this message and we will arrange the payment with you.
` : ''}
If the form gives you any trouble, just reply to this message and we will sort it
out with you.

Thank you,
Dragon Swim`;

const NOFORM_BODY = (c) => `Hello,

You created a Dragon Swim account with this email address, but the family
registration form has not been submitted yet, so your swimmers are not on our
roster.

Please sign in and finish the form:

    https://dragonswim.org/dashboard.html

  - If you have forgotten your password, click "Forgot password" on the sign-in
    page and set a new one.
  - The "Family Profile" tab is where the registration form lives. It may take a
    few minutes; please have your swimmers' dates of birth and genders handy.
${c && c.balance < 0 ? `
Also, our records show an outstanding meet-fee balance for your family:

${owesBlock(c)}

Please reply to this message and we will arrange the payment with you.
` : ''}
If anything gives you trouble, just reply to this message.

Thank you,
Dragon Swim`;

const PAY_SUBJECT = `Dragon Swim — balance due for the ${SEASON} season`;
const payBody = (c) => {
  const rows = [];
  if (c.carry) rows.push([`${prevSeason} carry-over:`, c.carry < 0 ? `${owed(c.carry)} owed` : `${money(c.carry)} credit`]);
  rows.push([`${SEASON} payments received:`, money(c.paid)]);
  rows.push([`${SEASON} meet fees:`, money(c.fee)]);
  const w = Math.max(...rows.map((r) => r[0].length), 'Amount due:'.length);
  const block = rows.map(([k, v]) => `    ${k.padEnd(w)}  ${v.padStart(10)}`).join('\n');
  const why = c.carry
    ? "This is this season's meet entry fees plus the carry-over balance from last season."
    : "This is this season's meet entry fees.";
  return `Hello,

Our season records show an outstanding balance for your family:

${block}
    ${'-'.repeat(w + 12)}
    ${'Amount due:'.padEnd(w)}  ${owed(c.balance).padStart(10)}

${why}

Could you please bring this balance up to date? If you have already paid, or if
the amount does not look right, reply to this message and we will go over it with
you.

Thank you,
Dragon Swim`;
};

const ID_BODY = `Hello,

Thank you for completing your registration. One item is still missing for one or
more of your swimmers: their USA Swimming ID.

If your swimmer is registered with USA Swimming, please add their ID. We use it
to pull official meet results and to track each swimmer's progress across the
season.

It takes about a minute:

  1. Sign in at https://dragonswim.org/dashboard.html
  2. Open the "Family Profile" tab
  3. Under "Swimmers", find your swimmer and click "+ Add ID" next to "USA ID:"
  4. Type or paste the ID and click "Save"

If your swimmer does not have a USA Swimming ID yet — for example, if they are
not competing in meets — you can ignore this message. Nothing else is needed.

Thank you,
Dragon Swim`;
const ID_SUBJECT = "Optional: add your swimmer's USA Swimming ID";

// ── 拼 md ───────────────────────────────────────────────────────────────────
const table = (head, rows) => rows.length
  ? `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`
  : `（空）`;

const sendBlock = (list) => `**Addresses — 整行复制进 BCC（分号分隔）**

\`\`\`
${bcc(list.map((c) => c.email))}
\`\`\`

备选格式 —— 一行一个（排查非法收件人时最直观）：

\`\`\`
${bccLines(list.map((c) => c.email))}
\`\`\`

> **用分号，不要用逗号**（2026-09-22 教练实测：逗号版粘进 Gmail 会被整串拒绝）。
> **用 BCC，别用 To/Cc** —— 这些是别人家的邮箱地址，放 To 会把所有家长暴露给彼此。`;

/** 逐封发的邮件块（付款 / 有金额的注册信）。 */
const perFamily = (list, subject, bodyFor) => list
  .map((c) => `\`\`\`
To: ${c.email}    （${c.label} — ${owed(c.balance)}）
Subject: ${subject}

${bodyFor(c)}
\`\`\``).join('\n\n');

/**
 * A/B/C 三组的通用排版：不欠费的走 BCC（一封通用正文），欠费的逐封发（金额写进信里）。
 * 为什么按欠费拆：余额只在教练端可见，BCC 一封就写不了逐户金额。
 */
const mixedSend = (group, subject, genericBody, bodyFor) => {
  const free = group.filter((c) => c.balance >= 0);
  const owing = group.filter((c) => c.balance < 0);
  const out = [];
  if (free.length) {
    out.push(`**① ${free.length} 户不欠费 → BCC 一封**\n\n${sendBlock(free)}\n\n**Subject：**\n\n\`\`\`\n${subject}\n\`\`\`\n\n**Body：**\n\n\`\`\`\n${genericBody}\n\`\`\``);
  }
  if (owing.length) {
    const label = `${free.length ? '② ' : ''}${owing.length} 户同时欠费 → 逐封发`;
    const hint = free.length
      ? '金额写进信里；也可以只用上面那封通用正文，金额由教练另说'
      : '金额写进信里；也可以只发一封去掉金额段的通用信（BCC 用下面的地址）';
    out.push(`**${label}**（${hint}）
${free.length ? '' : `\n\`\`\`\n${bcc(owing.map((c) => c.email))}\n\`\`\`\n`}
${perFamily(owing, subject, bodyFor)}`);
  }
  return out.join('\n\n');
};

const totalOwed = [...owes, ...unregisteredOwes, ...orphanNoContact].reduce((n, c) => n + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

/** 一览表里"怎么发"那一列：欠费的户必须逐封发（金额逐户不同），其余可以 BCC。 */
const sendMode = (g) => {
  const owing = g.filter((c) => c.balance < 0).length;
  if (!owing) return 'BCC 一封';
  if (owing === g.length) return '**逐封发**（都欠费，金额写进信里）';
  return `BCC ${g.length - owing} 户 + **逐封发** ${owing} 户（欠费）`;
};

const md = `# Dragon Swim — 教练跟进名单（自动生成，勿手改）

生成时间：${stamp}　数据源：**线上 Firestore 现场读取**（只读）
赛季：**${SEASON}**　首场比赛：**${MEET}**（${MEET_DATE}${MEET_END ? ` → ${MEET_END}` : ''}）
报名表：\`${entriesPath}\`（Hy-Tek Individual Meet Entries，${counts.reportTotalAthletes ?? '?'} 人；PDF 原件：\`${entries.source || '(未记录)'}\`）
生成命令见文末。**名单放一天就过期，发信前重新跑。**

## 0. 一览

| 组 | 是什么 | 家庭数 | 怎么发 |
|---|---|---|---|
| **A** | 报名了比赛、但家庭还没注册 | **${groupA.length}** | ${sendMode(groupA)} |
| **B** | 建了账号、但没提交注册表 | **${groupB.length}** | ${sendMode(groupB)} |
| **C** | 白名单上没注册、也没报名比赛 | **${groupC.length}** | ${sendMode(groupC)} |
| **D** | **欠费**（已注册家庭，balance 为负） | **${owes.length}** | **逐封发**（金额不同，家长看不到余额） |
| **E** | 报名了比赛、孩子缺 USA-S ID（不欠费） | **${groupE.length}** | BCC 一封 |
| **F** | 没报名比赛、孩子缺 USA-S ID（不欠费） | **${groupF.length}** | BCC 一封（可选） |
| ⚠ | 需人工看（发不了信 / 不该自动发） | ${orphanNoContact.length + wlDup.length + wlSpouse.length + groupAextra.length + needVerify.length} 条 | 见第 3 节 |

- 在册：**${regs.length} 个注册家庭 / ${roster.length} 名泳手**；白名单 **${families.length}** 条。
- 欠费合计：**${money(totalOwed)}**（已注册家庭 ${money(owes.reduce((n, c) => n + Math.abs(c.balance), 0))} + 未注册家庭 ${money(unregisteredOwes.reduce((n, c) => n + Math.abs(c.balance), 0))}）。
- 余额口径 = 押金 + 本年结转 − 本赛季 meet 报名费（与教练端 Fee Summary 完全一致）。
- **A/B/C 三组互不重叠，D/E/F 只覆盖已注册家庭** —— 一个家庭最多出现在一个"发信名单"里；
  跨名单同时有问题（比如又欠费又缺 ID）的 ${(() => {
  const s = new Set();
  for (const c of owes) if (c.enteredMissing.length || c.otherMissing.length || (c.conflicts || []).length || (c.requiredMissing || []).length) s.add(c.key);
  for (const c of needVerify) if (c.otherMissing.length || c.enteredMissing.length) s.add(c.key);
  return s.size;
})()} 家列在第 2 节，按那里的建议合并。

---

## 1. 名单

### A 组 — 报名了比赛、但家庭还没注册（${groupA.length} 户）

孩子**已经报名 ${MEET}**，但网站上没有注册、也没有账号。没有账号就没有队费核算、
收不到成绩通知、教练也无法联系到人 —— 最优先。

${mixedSend(groupA, REG_SUBJECT_MEET, regBody(true, null), (c) => regBody(true, c))}

明细（仅备查）：

${table(['#', 'Email', '白名单上的名字', '报名参赛的孩子', '匹配依据'], groupA.map((c, i) => [
  i + 1, c.email, c.label, (c.meetEntered || []).join('、'), (c.entryEvidence || []).join('；'),
]))}

### B 组 — 建了账号、但没提交注册表（${groupB.length} 户）

这几家**已经用白名单邮箱注册了账号**（Auth 里有人），但注册表一直没提交，
所以名册里没有他们的孩子、也没有队费记录。他们自己很可能以为已经完成了。

${mixedSend(groupB, 'Your Dragon Swim account was created, but the registration form is not submitted',
  NOFORM_BODY(null), (c) => NOFORM_BODY(c))}

明细：

${table(['#', 'Email', '白名单上的名字', '已知孩子（来自费用表）', '欠费'], groupB.map((c, i) => [
  i + 1, c.email, c.label, c.kids.join('、') || '—', c.balance < 0 ? owed(c.balance) : '—',
]))}

### C 组 — 白名单上没注册、也没报名比赛（${groupC.length} 户）

不着急，但注册了才有队费核算和成绩通知。
（如果两条条目的姓看起来是同一家，只发一封 —— 例如白名单里 \`Ibrahim Mourad parent\`
和 \`mouhmoud parent\` 很可能是同一家 Mourad。）

${mixedSend(groupC, REG_SUBJECT_PLAIN, regBody(false, null), (c) => regBody(false, c))}

明细：

${table(['#', 'Email', '白名单上的名字', '线索', '欠费'], groupC.map((c, i) => [
  i + 1, c.email, c.label,
  c.kids.length ? `费用表里有：${c.kids.join('、')}` : '（费用表里没有这个名字）',
  c.balance < 0 ? owed(c.balance) : '—',
]))}

### D 组 — 欠费（已注册家庭，${owes.length} 户）

**这一组不能 BCC。** 家长在网站上**看不到** meet fee 余额（Fee Summary 是教练端 tab），
所以信里必须写清金额 —— 下面每户的正文已经拼好，直接逐封复制发送。

明细：

${table(['#', 'Email', '家庭', '欠费', `${prevSeason} 结转`, '本季已交', '本季 meet 费用', '明细'], owes
  .slice()
  .sort((a, b) => a.balance - b.balance)
  .map((c, i) => [
    i + 1, c.email, c.label, `**${owed(c.balance)}**`, money(c.carry), money(c.paid), money(c.fee),
    c.kids.join('、'),
  ]))}

**Subject（每户都一样）：**

\`\`\`
${PAY_SUBJECT}
\`\`\`

**每户的 Body（复制对应那一块）：**

${perFamily(owes.slice().sort((a, b) => a.balance - b.balance), PAY_SUBJECT, payBody)}

### E 组 — 报名了比赛、孩子缺 USA-S ID（不欠费的 ${groupE.length} 户）

孩子已经报名本场比赛，但没有 USA-S ID → 官方成绩和队费对不上号。

${sendBlock(groupE)}

明细：

${table(['#', 'Email', '家长', '本场参赛且缺 ID', '家里其他缺 ID 的'], groupE.map((c, i) => [
  i + 1, c.email, c.label, c.enteredMissing.join('、'), c.otherMissing.join('、') || '—',
]))}

**Subject / Body：** 同 F 组（下面那一封）。

### F 组 — 没报名比赛、孩子缺 USA-S ID（不欠费的 ${groupF.length} 户）

本次比赛一个孩子都没参加，ID 不急，下次比赛前补上即可。

${sendBlock(groupF)}

明细：

${table(['#', 'Email', '家长', '缺 ID 的孩子', '名册人数'], groupF.map((c, i) => [
  i + 1, c.email, c.label, c.otherMissing.join('、'), `${c.kids.length}`,
]))}

**Subject（E、F 共用）：**

\`\`\`
${ID_SUBJECT}
\`\`\`

**Body（E、F 共用）：**

\`\`\`
${ID_BODY}
\`\`\`

---

## 2. 同一户出现在多个名单 → 合并发送建议

下面这些家庭同时有多个问题。**不要重复发信**，按"发哪封"列发一封，
把"补一句"列的内容加进正文即可。

${(() => {
  const rows = [];
  const seen = new Set();
  const appendLine = (c) => {
    const bits = [];
    if (c.enteredMissing.length) bits.push(`Also please add the USA Swimming ID for ${c.enteredMissing.join(', ')} (Family Profile tab).`);
    if (c.otherMissing.length) bits.push(`Also please add the USA Swimming ID for ${c.otherMissing.join(', ')} (Family Profile tab).`);
    if ((c.conflicts || []).length || (c.requiredMissing || []).length) bits.push('Also ask them to check the details flagged in their Family Profile (see 3.7).');
    return bits.join('<br>') || '—';
  };
  const add = (c, groups) => {
    if (seen.has(c.key)) return;
    seen.add(c.key);
    rows.push([
      c.email, c.label, groups.join(' + '),
      c.balance < 0 ? '**D 付款信**（金额已拼好）' : (c.enteredMissing.length ? 'E 补 ID 信' : 'F 补 ID 信'),
      appendLine(c),
    ]);
  };
  for (const c of owes) {
    const g = ['D'];
    if (c.enteredMissing.length) g.push('E');
    if (c.otherMissing.length) g.push('F');
    if ((c.conflicts || []).length || (c.requiredMissing || []).length) g.push('⚠');
    if (g.length > 1) add(c, g);
  }
  for (const c of needVerify) {
    if (seen.has(c.key)) continue;
    const g = ['⚠'];
    if (c.enteredMissing.length) g.push('E');
    if (c.otherMissing.length) g.push('F');
    if (g.length > 1) add(c, g);
  }
  return table(['Email', '家庭', '出现在', '发哪封', '正文里补一句（英文，可直接粘）'], rows);
})()}

---

## 3. 需要教练人工看（发不了信 / 不该自动发）

### 3.1 单独的孩子：费用/押金里有名字，但对不到任何家庭（${orphanNoContact.length} 个）

这些名字在 fee / deposit 表里**单独存在**，既不在注册名册里，白名单里也找不到能对上的家长
→ 没有邮箱可发。请教练确认这些孩子是谁、是否还在队里。
（**这一类就是"单独的孩子没有白名单"**：孩子只以名字的形式存在于费用表里，没有任何家庭撑着。）

${table(['名字', '欠费', '本赛季费用', '结转', '备注'], orphanNoContact.map((o) => [
  o.name, o.balance < 0 ? `**${owed(o.balance)}**` : money(o.balance), money(o.fee), money(o.carry),
  o.candidates.length ? `白名单候选（都不确定）：${o.candidates.join('<br>')}` : (o.dep?.needsLinking ? 'deposits 里标了 needsLinking（导入时就没链接上）' : '白名单里完全没有这个名字'),
]))}

### 3.2 白名单重复条目 —— 家庭已注册，但白名单里还留着旧邮箱（${wlDup.length} 条）

条目的名字里包含某个**已注册泳手**的全名，说明这家已经注册了，另一条是历史遗留。
**不要发信**，会让已经注册的家长收到"你还没注册"。

${table(['Email', '白名单上的名字', '疑似属于'], wlDup.map((w) => [w.email, w.parentName, `已注册泳手/家长：${w.dupOf}`]))}

建议：核对后在 admin 面板删掉这些条目，否则每次跑都会再冒出来。

### 3.3 配偶已注册 —— 可以忽略（${wlSpouse.length} 条）

这个邮箱出现在某份注册表的 \`parentEmails\` 里（配偶/共同家长），家庭已经注册了。
条目状态是 pending 只是因为这个人自己没再单独建账号 —— 不影响任何事。

${table(['Email', '白名单上的名字'], wlSpouse.map((w) => [w.email, w.parentName || '—']))}

### 3.4 注册了、但邮箱不在白名单上（${regs.filter((r) => !emailsOf(r).some((e) => famEmails.has(e))).length} 户）

${regs.filter((r) => !emailsOf(r).some((e) => famEmails.has(e))).length === 0
  ? '本次没有：每个注册家庭的邮箱都能在白名单里找到。'
  : table(['家庭', '注册邮箱'], regs.filter((r) => !emailsOf(r).some((e) => famEmails.has(e))).map((r) => [familyLabel(r), emailsOf(r).join('、')]))}

### 3.5 报名了比赛、但本场费用表里没有这个孩子（${(() => {
  const feeNames = new Set([...feeByKey.keys()]);
  return athletes.filter((a) => !feeNames.has(normalizeName(a.name))).length;
})()} 个）

报名表里有、本场 fee 表里没有 → **这个孩子不会被收费**。要么费用表漏了，要么人已经退赛。

${table(['选手', '年龄', '报名表里有'], athletes.filter((a) => !new Set([...feeByKey.keys()]).has(normalizeName(a.name))).map((a) => [a.name, a.age, '✅']))}

### 3.6 本场费用表里有、但不在报名报告里（${(() => {
  const entryNames = new Set(athletes.map((a) => normalizeName(a.name)));
  return [...feeByKey.entries()].filter(([k]) => !entryNames.has(k)).length;
})()} 个）

${table(['名字', '本场费用'], [...feeByKey.entries()].filter(([k]) => !new Set(athletes.map((a) => normalizeName(a.name))).has(k)).map(([, f]) => [f.name, money(f.total)]))}

> ⚠ **这意味着报名报告可能不全。** 上面这份是 Hy-Tek 的 *Individual Meet Entries Report*
> （只列个人项目）。费用表里的这几位要么是 9/22 之后补报的，要么是**只游接力**。
> A/E/F 三组的"是否报名本场"都基于这份报告 —— 如果有人只游接力，会被算进 F 组。
> 报名报告更新了要重跑本脚本。

### 3.7 资料需核实的家庭（${needVerify.length} 户）

${needVerify.length === 0 ? '（无）' : table(['家庭', 'Email', '问题'], needVerify.map((c) => [
  c.label, c.email,
  [
    ...(c.requiredMissing || []).map((x) => `必填缺失：${x.scope}${x.scope === 'swimmer' ? `#${x.swimmerIndex + 1}(${x.swimmerName || '?'})` : ''}.${x.field}`),
    ...(c.conflicts || []).map((x) => `需核实：${x.type}`),
  ].join('；'),
]))}

> 本次**没有必填项缺失**，只有上面这些"填了但可能填错"的（与教练端 Needs Attention 同一套规则）。
> 这类不一定需要发信，教练看一眼即可。

### 3.8 报名报告里对不上白名单的孩子（${groupAextra.length} 个）

${groupAextra.length === 0 ? '（无）' : table(['选手', '年龄', '为什么不能自动判定', '候选'], groupAextra.map((x) => [x.name, x.age, x.reason, x.cands.join('<br>') || '—']))}

### 3.9 待注册条目里「同姓」的成对出现（${sameSurnamePairs.length} 对）

白名单的 \`parentName\` 字段是自由文本（可能是家长名、孩子的名字、两个孩子挤一条），
所以同姓**未必**是同一家 —— 请教练确认：**如果确实是同一家，只发一封**。

${sameSurnamePairs.length === 0 ? '（无）' : table(['A', 'B', '共同姓氏'], sameSurnamePairs.map(([a, b, s]) => [
  `${a.email}（${a.label}）`, `${b.email}（${b.label}）`, s,
]))}

> 注意：这条只按「名字最后一个词」比。像 \`Ibrahim Mourad parent\` 与 \`mouhmoud parent\`
> （拼写不同、明显是同一家 Mourad）这种**脚本看不出来**，需要教练自己扫一眼 C 组明细。

---

## 4. 其他值得注意（本次顺手体检出来的）

1. **训练费（Roster tab 的 3 期付款栏）本赛季没有任何数据** —— ${roster.length} 名在册泳手里，
   \`swimmers[].payments["${SEASON}"]\` 有值的：${(() => {
  let n = 0;
  for (const r of regs) for (const s of activeSwimmers(r)) if (s.payments && Object.keys(s.payments).length) n++;
  return n;
})()} 人。如果"催缴训练费"也是本次目标，那这一步在系统里还没有数据可依据：
   得先让教练把 Roster tab 的三期金额/日期录进去，再跑本脚本。
2. **USA Swimming ID**：${roster.filter((r) => String(r.swimmer.usaSwimmingId || '').trim()).length} 人有、${roster.length - roster.filter((r) => String(r.swimmer.usaSwimmingId || '').trim()).length} 人没有；
   格式（14 位十六进制）与重复性检查**全部通过**（没有重复 ID、没有长度异常）。
3. **白名单 ${families.length} 条**：本人已注册 ${whitelist.filter((w) => w.ownReg).length}、待注册 ${wlPendingSend.length}、
   建号未交表 ${wlNoForm.length}、配偶已注册 ${wlSpouse.length}、重复条目 ${wlDup.length}。
4. **Deposits 只有 ${SEASON} 一个赛季**（${deps.length} 条）—— ${prevSeason} 只体现为结转余额，没有单独记录，
   所以"上一季到底该收多少"无法从系统复算，只能信当初导入的结转数。
5. **下一场 ${meets.filter((m) => m.season === SEASON && (m.startDate || m.date) > (dbMeet?.startDate || '')).map((m) => `${m.name}（${m.startDate}，费用表${(m.feeData?.swimmers || []).length ? '已上传' : '还没上传'}）`).join('、') || '（无）'}**。
6. **粒度提醒**：教练端 Fee Summary 是**按泳手一行**（本赛季 ${allMoneyKeys.size} 行），
   本报告 D 组是**按家庭汇总**（${owes.length} 户）—— 金额口径完全一致
   （欠费合计 ${money(owedByKey)}），只是教练在页面上要按户自己加。

---

## 5. 自校验

${checks.map(([label, ok]) => `- ${ok ? '✅' : '❌'} ${label}`).join('\n')}

- 教练邮箱已排除：${[...coachEmails].join(', ') || '无'}

## 6. 怎么重跑

\`\`\`bash
# 报名报告 PDF → JSON（自带 Total Athletes 自校验）
python execution/meet-entry/extract_hytek_entries.py ".tmp/coach-in/dragon name entry.pdf" -o .tmp/meet-entry/legacy/pv-oct-entries.json

# JSON + 线上数据 → 本文件
node execution/meet-entry/coach-followup-report.mjs .tmp/meet-entry/legacy/pv-oct-entries.json \\
     -o ${OUT_PATH} --season ${SEASON}
\`\`\`

只读脚本（不会写 Firestore）。费用余额口径与教练端 Fee Summary 一致，
交叉核对可用：\`node execution/fees/verify_fee_summary.mjs ${SEASON}\`。
`;

writeFileSync(resolve(OUT_PATH), md, 'utf8');

// ── 控制台摘要 ──────────────────────────────────────────────────────────────
console.log(`${MEET} (${MEET_DATE}) — 报名 ${athletes.length} 人 / 赛季 ${SEASON}`);
console.log(`  在册 ${regs.length} 家庭 / ${roster.length} 泳手；白名单 ${families.length} 条`);
console.log(`  A 报名未注册        ${groupA.length} 户 → ${groupA.map((c) => c.email).join(', ') || '(无)'}`);
console.log(`  B 建号未交表        ${groupB.length} 户 → ${groupB.map((c) => c.email).join(', ') || '(无)'}`);
console.log(`  C 白名单待注册      ${groupC.length} 户`);
console.log(`  D 欠费(已注册)      ${owes.length} 户 / ${money(owes.reduce((n, c) => n + Math.abs(c.balance), 0))}`);
console.log(`  E 报名缺ID(不欠费)  ${groupE.length} 户`);
console.log(`  F 未报名缺ID        ${groupF.length} 户`);
console.log(`  ⚠ 无联系人欠费      ${orphanNoContact.length} 个（${orphanNoContact.map((o) => o.name).join(', ') || '无'}）`);
console.log(`  ⚠ 白名单重复条目    ${wlDup.length}；配偶已注册 ${wlSpouse.length}；资料需核实 ${needVerify.length}`);
console.log('');
for (const [label, ok] of checks) console.log(`  ${ok ? '✓' : '✗'} ${label}`);
console.log('');
console.log(`写出: ${OUT_PATH}`);

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('\n✗ 自校验未通过，先别发信。');
  process.exit(1);
}
