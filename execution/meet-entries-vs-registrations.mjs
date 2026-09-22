#!/usr/bin/env node

/**
 * 报名表 × 线上注册数据 → 可直接发信的名单 + 英文草稿。
 *
 *   node execution/meet-entries-vs-registrations.mjs .tmp/pv-oct-entries.json \
 *        -o .tmp/meet-entry-unregistered.md
 *
 * 输入是 execution/extract_hytek_entries.py 抽出来的 JSON(那个脚本负责 PDF 和自校验),
 * 本脚本只做业务匹配,所以两边可以各自重跑、各自调试。
 *
 * ── 产出三类人 ──────────────────────────────────────────────────────────────
 *
 *   A  在比赛、但家庭完全没注册        → 发催注册信(并让他们把 USA-S ID 一起填了)
 *   B  已注册、但孩子缺 USA Swimming ID → 发补 ID 信
 *   ⚠  匹配不上、或家庭已注册但孩子不在名册 → 不猜,单列一栏请人工确认
 *
 * ── 匹配规则(顺序即优先级) ─────────────────────────────────────────────────
 *
 * 1. 报名名字 → 现役注册名册: 全名精确(两种顺序) → 去连字符/空格的连写变体 →
 *    姓+名 token 相同。命中即算「已注册」,不再做任何白名单猜测。
 * 2. 只有第 1 步没命中的选手,才去白名单找候选家庭(白名单的 parentName 很脏:
 *    可能是选手名、家长名、被截断的姓、两个孩子挤一条,甚至写着别人的名字)。
 *    候选规则 first+last > last-only > first-only,并把命中的规则写进产出,便于复核。
 * 3. 候选邮箱如果已经被某个 registration 覆盖 → 这个家庭其实注册了,所以不进 A,
 *    而是进「⚠ 需确认」(典型: 家庭注册了,但报名表里这个孩子不在他们的名册上)。
 * 4. 没有候选、或候选互相矛盾 → 也进「⚠ 需确认」,绝不硬猜。
 *
 * 为什么规则 2 必须排在 1 后面: 白名单里存在「已注册家庭的重复条目」
 * (实例: 白名单有一条 "Anthony wang parent" 用另一个邮箱,而 Anthony Wang 其实挂在
 * Julia Yan 的注册下)。只按名字找白名单会误伤已注册家庭。
 *
 * ── 时效性 ─────────────────────────────────────────────────────────────────
 * 每次都现场读 Firestore。历史教训: 2026-09-21 生成的 outreach-emails.md 里
 * List 1 有 42 家、List 2 只有 5 家,到 9-22 已经变成 3 家和 18 家 —— 名单类文件
 * 放一天就过期,永远重算,不要复用旧 md。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { normalizeSortKey } from '../src/utils/swimmerSort.js';

// ── 参数 ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const entriesPath = args.find((a) => !a.startsWith('-') && a !== flag('-o') && a !== flag('--key'));
if (!entriesPath) {
  console.error('用法: node execution/meet-entries-vs-registrations.mjs <entries.json> [-o out.md] [--key path]');
  process.exit(2);
}
const OUT_PATH = flag('-o', '.tmp/meet-entry-unregistered.md');
const KEY_PATH = resolve(flag('--key', 'serviceAccountKey.json'));

// ── 名字工具(与 src/utils/swimmerSort.js 同一套归一化,避免两处口径漂移) ──
const norm = (v) => normalizeSortKey(v);
const squash = (v) => norm(v).replace(/\s+/g, '');
const toks = (v) => norm(v).split(' ').filter(Boolean);
const join2 = (a, b) => norm(`${a || ''} ${b || ''}`);
const pname = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim();
const familyLabel = (r) => [pname(r.parent), pname(r.spouse)].filter(Boolean).join(' & ') || '(no name)';
const emailsOf = (r) => [...new Set([r.parent?.email, r.spouse?.email, ...(r.parentEmails || [])]
  .map((e) => String(e || '').toLowerCase().trim()).filter(Boolean))];

/**
 * 本场参赛、且恰好缺 USA-S ID 的孩子。
 *
 * 这是 B 类分档的依据: 只有「参赛的孩子本人没 ID」才是本场真正会出问题的
 * (成绩和队费匹配不上)。家里另一个没参赛的孩子缺 ID,不算本场急事 ——
 * 例如 George Tao 家: Charlene Tao 参赛且有 ID,Patrick Tao 没参赛也没 ID。
 */
function enteredMissingId(reg, enteredNames) {
  const set = new Set(enteredNames);
  return (reg.swimmers || [])
    .filter((s) => s && !s.deleted && !String(s.usaSwimmingId || '').trim())
    .filter((s) => set.has(join2(s.firstName, s.lastName)) || set.has(squash(join2(s.firstName, s.lastName))))
    .map((s) => `${s.firstName || ''} ${s.lastName || ''}`.trim());
}

// ── 读输入 ──────────────────────────────────────────────────────────────────
const entries = JSON.parse(readFileSync(resolve(entriesPath), 'utf8'));
const athletes = entries.athletes || [];
const counts = entries.counts || {};
const meet = entries.meet || {};

// ── 读线上数据 ──────────────────────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch {
  console.error(`无法读取 service account key: ${KEY_PATH}(或用 --key 指定)`);
  process.exit(2);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();

const [famSnap, regSnap, coachSnap, meetSnap] = await Promise.all([
  db.collection('families').get(),
  db.collection('registrations').get(),
  db.collection('coaches').get(),
  db.collection('meets').get(),
]);
const families = famSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const regs = regSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const coachEmails = new Set(coachSnap.docs.map((d) => String(d.data().email || '').toLowerCase().trim()));
const meets = meetSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ── 覆盖判定(与 dashboard/outreach 口径一致) ────────────────────────────────
const regIds = new Set(regs.map((r) => r.id));
const covered = new Set();
for (const f of families) {
  const e = String(f.email || '').toLowerCase().trim();
  if (!e) continue;
  if (f.registeredUid && regIds.has(f.registeredUid)) covered.add(e);
  for (const r of regs) if (emailsOf(r).includes(e)) covered.add(e);
}
const whitelist = families.map((f) => {
  const email = String(f.email || '').toLowerCase().trim();
  return {
    id: f.id, email, parentName: f.parentName || '', status: f.status || '',
    registeredUid: f.registeredUid || null, tokens: new Set(toks(f.parentName)),
    covered: covered.has(email),
  };
});

// ── 现役名册索引 ────────────────────────────────────────────────────────────
const roster = [];
for (const r of regs) {
  for (const s of (r.swimmers || [])) {
    if (!s || s.deleted) continue;
    roster.push({
      regId: r.id, label: familyLabel(r),
      first: norm(s.firstName), last: norm(s.lastName),
      full: join2(s.firstName, s.lastName), rev: join2(s.lastName, s.firstName),
      sq: squash(join2(s.firstName, s.lastName)),
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
    });
  }
}

// ── 逐个选手匹配 ────────────────────────────────────────────────────────────
const matched = [];
const unmatched = [];
for (const a of athletes) {
  const t = toks(a.name);
  const first = t[0] || '';
  const last = t[t.length - 1] || '';
  const tail = t.slice(1).join(' ');
  const eFull = norm(a.name);
  const eSq = squash(a.name);

  let hit = roster.filter((r) => r.full === eFull || r.rev === eFull);
  let rule = 'exact';
  if (!hit.length) { hit = roster.filter((r) => r.sq === eSq); rule = 'squash'; }
  if (!hit.length) {
    hit = roster.filter((r) => (r.last === last || r.last === tail) && r.first === first);
    rule = 'last+first';
  }
  if (hit.length) {
    matched.push({ entry: a, rule, family: hit[0].label, regId: hit[0].regId });
  } else {
    unmatched.push({ entry: a, first, last, tail });
  }
}

// ── 未匹配者 → 白名单候选 → 分类 ────────────────────────────────────────────
const caseA = new Map();   // email → { email, parentName, kids:[], evidence:[] }
const needReview = [];     // { name, age, reason, candidates:[] }

for (const u of unmatched) {
  const cands = whitelist
    .map((w) => {
      const rules = [];
      if (w.tokens.has(u.first) && (w.tokens.has(u.last) || w.tokens.has(u.tail))) rules.push('first+last');
      else if (w.tokens.has(u.last) || w.tokens.has(u.tail)) rules.push('last-only');
      else if (w.tokens.has(u.first)) rules.push('first-only');
      return { ...w, rules };
    })
    .filter((w) => w.rules.length)
    .sort((a, b) => a.rules[0].localeCompare(b.rules[0]));

  const strong = cands.filter((c) => c.rules.includes('first+last'));
  const weak = cands.filter((c) => !c.rules.includes('first+last'));

  // 有强证据(名+姓都对上)时只信强的;否则退回弱证据,但必须唯一,
  // 否则同名会误伤别的家庭(实例: Liam Norcross 也会命中 "Liam TONER2 parent")
  const pick = strong.length ? strong : (weak.length === 1 ? weak : []);
  const usable = pick.filter((c) => !coachEmails.has(c.email));

  if (usable.length === 0) {
    needReview.push({
      name: u.entry.name, age: u.entry.age,
      reason: cands.length ? '候选不唯一或证据太弱(点名会误伤)' : '白名单里没有任何名字能对上',
      candidates: cands.map((c) => `${c.email} [${c.parentName}]`),
    });
    continue;
  }

  for (const c of usable) {
    if (c.covered) {
      // 家庭其实注册了 —— 那这个孩子是「不在名册上」,不是「没注册」
      needReview.push({
        name: u.entry.name, age: u.entry.age,
        reason: `候选邮箱 ${c.email} 已被注册覆盖(家庭已注册),但该选手不在任何注册名册里 —— 可能是漏填了孩子,或同名不同人`,
        candidates: [`${c.email} [${c.parentName}] status=${c.status}`],
      });
      continue;
    }
    if (!caseA.has(c.email)) {
      caseA.set(c.email, { email: c.email, parentName: c.parentName, status: c.status, kids: [], evidence: [] });
    }
    const row = caseA.get(c.email);
    row.kids.push(`${u.entry.name} (${u.entry.age})`);
    row.evidence.push(`${u.entry.name} → ${c.rules.join('+')} → ${JSON.stringify(c.parentName)}`);
  }
}

// ── B 类: 已注册但缺 USA-S ID ───────────────────────────────────────────────
const enteredNames = athletes.flatMap((a) => [norm(a.name), squash(a.name)]);
const caseB = [];
for (const r of regs) {
  const kids = (r.swimmers || []).filter((s) => s && !s.deleted);
  const missing = kids.filter((s) => !String(s.usaSwimmingId || '').trim());
  if (!missing.length) continue;
  caseB.push({
    email: emailsOf(r)[0] || '(no email)',
    allEmails: emailsOf(r),
    label: familyLabel(r),
    missing: missing.map((s) => `${s.firstName || ''} ${s.lastName || ''}`.trim()),
    total: kids.length,
    enteredMissing: enteredMissingId(r, enteredNames),
  });
}
caseB.sort((a, b) => b.enteredMissing.length - a.enteredMissing.length || a.label.localeCompare(b.label));
const bMeet = caseB.filter((r) => r.enteredMissing.length > 0);
const bRest = caseB.filter((r) => r.enteredMissing.length === 0);

// ── 与 Firestore 里的 meet 对上号(方便接着用志愿者小时功能) ────────────────
const dbMeet = meets.find((m) => (m.startDate || m.date) === meet.startDate) || null;

// ── 自校验 ──────────────────────────────────────────────────────────────────
const checks = [];
checks.push([`报名表 ${athletes.length} 人 = 报告 Total Athletes ${counts.reportTotalAthletes}`,
  counts.reportTotalAthletes == null || counts.reportTotalAthletes === athletes.length]);
// 比赛名会进邮件主题,解析不出来必须拦下来(曾出现过空名字)。
checks.push([`解析出比赛名与日期: ${meet.name || '(空!)'} ${meet.startDate || ''}`,
  Boolean(meet.name && meet.startDate)]);
checks.push([`已注册 ${matched.length} + 未匹配 ${unmatched.length} = ${athletes.length}`,
  matched.length + unmatched.length === athletes.length]);
const aEmails = [...caseA.keys()];
checks.push([`A 类邮箱全部属于未覆盖的白名单条目(${aEmails.length} 个)`,
  aEmails.every((e) => !covered.has(e))]);
const overlap = aEmails.filter((e) => caseB.some((b) => b.email === e));
checks.push([`A 类与 B 类不重叠`, overlap.length === 0]);

// ── 产出 md ─────────────────────────────────────────────────────────────────
const bcc = (list) => list.join(', ');
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

const md = `# ${meet.name || 'Meet'} — 报名表 vs 注册状态（自动生成，勿手改）

生成时间：${stamp}　数据源：线上 Firestore 现场读取
生成命令见文末。**不要复用旧的名单文件，每次重新跑。**

## 一览

| 项 | 数量 |
|---|---|
| 报名表选手（报告自带 Total Athletes） | ${athletes.length}${counts.reportTotalAthletes != null ? ` (自校验: ${counts.reportTotalAthletes})` : ''} |
| 已在现役注册名册里 | ${matched.length} |
| **A 类：在比赛、家庭没注册** | **${aEmails.length} 个家庭 / ${[...caseA.values()].reduce((n, r) => n + r.kids.length, 0)} 个孩子** |
| 需人工确认 | ${needReview.length} |
| **B 类：已注册、缺 USA Swimming ID** | **${caseB.length} 个家庭 / ${caseB.reduce((n, r) => n + r.missing.length, 0)} 个孩子**（其中本场参赛的孩子本人缺 ID 的 ${bMeet.length} 家） |
| 本场 meet 是否已在 Firestore | ${dbMeet ? `✅ ${dbMeet.name}（${dbMeet.season || 'no season'}）` : '❌ 未找到同日开始日期的 meet'} |

${meet.startDate ? `比赛日期：${meet.startDate} → ${meet.endDate}\n` : ''}
---

## A 类 — 在比赛、但家庭还没注册（发这封）

这些家庭的**孩子已经报名参加比赛**，但网站上还没完成注册。没有账号就没有队费核算、
没有志愿者报名、也收不到成绩通知 —— 属于阻塞项，优先发。

### Addresses — 整行复制进 BCC

\`\`\`
${bcc(aEmails)}
\`\`\`

> **用 BCC，别用 To/Cc。** 这些是别人家的邮箱地址，放在 To/Cc 会把所有家长的地址
> 暴露给彼此（以及任何转发的人）。To 填自己的队邮箱，名单粘贴到 BCC。

### 明细（仅备查，不用于发送）

| # | Email | 白名单上的名字 | 报名参赛的孩子 | 匹配依据 |
|---|---|---|---|---|
${aEmails.map((e, i) => {
  const r = caseA.get(e);
  return `| ${i + 1} | ${e} | ${r.parentName || '—'} | ${r.kids.join('、')} | ${r.evidence.join('；')} |`;
}).join('\n')}

### Subject

\`\`\`
Action needed before the ${meet.name || 'meet'}: please complete your Dragon Swim registration
\`\`\`

### Body

\`\`\`
Hello,

Your swimmer is entered in the ${meet.name || 'upcoming meet'} (${meet.startDate || ''}${meet.endDate ? ` to ${meet.endDate}` : ''}), but your
family's online registration has not been submitted yet.

Please complete it before the meet:

    https://dragonswim.org/registration.html

Two things to do, and the second one matters for this meet:

  1. Complete the registration form. Sign in (or create an account) using the
     email address this message was sent to — it is already on our approved
     list, so please do not use a different one. You will need your swimmer's
     date of birth and gender, plus your address and phone number.

  2. Add your swimmer's USA Swimming ID on the form. It is optional, but for a
     swimmer who is competing it is what lets us match them to official meet
     results and to the entry fees for each meet. If you do not have it handy,
     you can submit the form first and add the ID later from your dashboard.

If the form gives you any trouble, just reply to this message and we will sort
it out with you.

Thank you,
Dragon Swim
\`\`\`

---

## ⚠ 需你确认（我没有猜）

${needReview.length === 0 ? '（本次没有）' : `| 选手 | 年龄 | 为什么不能自动判定 | 候选 |
|---|---|---|---|
${needReview.map((n) => `| ${n.name} | ${n.age} | ${n.reason} | ${n.candidates.join('<br>') || '—'} |`).join('\n')}`}

---

## B 类 — 已注册、但缺 USA Swimming ID（另外单独发一封）

> **为什么和 A 分开发**：收件人几乎不重叠（A 是没注册的，B 是已注册的）。合并成一封
> 会让已注册的家庭收到一封开头就说“你还没注册”的信，徒增困惑和回信。正文 85% 相同，
> 所以用同一个模板、两段变体；真想合并，删掉 A 版里那段即可。
>
> 每个家庭只列**一个**地址（家长的账号邮箱）。配偶邮箱故意不列 —— 同一个家庭发两封
> 只会重复打扰，而且收件人自己会转给对方。

### B-1. 本场参赛的孩子本人缺 ID（优先）

这一档才是本场真正会出问题的：孩子已经报名，但没有 ID 就无法把官方成绩和队费对上。

\`\`\`
${bcc(bMeet.map((r) => r.email))}
\`\`\`

| # | Email | 家长 | 本场参赛且缺 ID | 家里其他缺 ID 的 | 名册人数 |
|---|---|---|---|---|---|
${bMeet.map((r, i) => {
  const other = r.missing.filter((m) => !r.enteredMissing.includes(m));
  return `| ${i + 1} | ${r.email} | ${r.label} | ${r.enteredMissing.join('、')} | ${other.join('、') || '—'} | ${r.total} |`;
}).join('\n') || '| — | — | — | — | — | — |'}

### B-2. 本场没有缺 ID 的孩子参赛（可稍后）

\`\`\`
${bcc(bRest.map((r) => r.email))}
\`\`\`

| # | Email | 家长 | 缺 ID 的孩子 | 名册人数 |
|---|---|---|---|---|
${bRest.map((r, i) => `| ${i + 1} | ${r.email} | ${r.label} | ${r.missing.join('、')} | ${r.total} |`).join('\n') || '| — | — | — | — | — |'}

### Subject

\`\`\`
Optional: add your swimmer's USA Swimming ID
\`\`\`

### Body

\`\`\`
Hello,

Thank you for completing your registration. One optional item is still missing
for one or more of your swimmers.

If your swimmer is registered with USA Swimming, please add their USA Swimming
ID. We use it to pull official meet results and to track each swimmer's progress
across the season.

It takes about a minute:

  1. Sign in at https://dragonswim.org/dashboard.html
  2. Open the "Family Profile" tab
  3. Under "Swimmers", find your swimmer and click "+ Add ID" next to "USA ID:"
  4. Type or paste the ID and click "Save"

If your swimmer does not have a USA Swimming ID yet — for example, if they are
not competing in meets — you can ignore this message. Nothing else is needed.

Thank you,
Dragon Swim
\`\`\`

---

## 自校验

${checks.map(([label, ok]) => `- ${ok ? '✅' : '❌'} ${label}`).join('\n')}

白名单总计 ${whitelist.length} 条，其中被注册覆盖 ${covered.size} 条、未覆盖 ${whitelist.length - covered.size} 条。
教练邮箱已排除（${[...coachEmails].join(', ') || '无'}）。

## 怎么重跑

\`\`\`bash
# 1) PDF → JSON（自带 Total Athletes 自校验，人数不符会报错退出）
python execution/extract_hytek_entries.py ".tmp/dragon name entry.pdf" -o .tmp/pv-oct-entries.json

# 2) JSON + 线上数据 → 本文件
node execution/meet-entries-vs-registrations.mjs .tmp/pv-oct-entries.json -o ${OUT_PATH}
\`\`\`

名单类文件放一天就过期（2026-09-21 那份 outreach 里 List 1 是 42 家、List 2 是 5 家，
到 09-22 已变成 3 家和 ${caseB.length} 家）。**要发信之前重新跑第 2 步。**
`;

writeFileSync(resolve(OUT_PATH), md, 'utf8');

// ── 控制台摘要 ──────────────────────────────────────────────────────────────
console.log(`${meet.name || 'meet'} — 报名 ${athletes.length} 人（报告 Total Athletes ${counts.reportTotalAthletes}）`);
console.log(`  已注册 ${matched.length} / 未匹配 ${unmatched.length}`);
console.log(`  A 类(在比赛、没注册): ${aEmails.length} 个家庭 → ${aEmails.join(', ') || '(无)'}`);
console.log(`  需人工确认: ${needReview.length}${needReview.length ? ' → ' + needReview.map((n) => n.name).join(', ') : ''}`);
console.log(`  B 类(已注册缺 USA-S ID): ${caseB.length} 个家庭 / ${caseB.reduce((n, r) => n + r.missing.length, 0)} 个孩子（本场参赛的孩子本人缺 ID ${bMeet.length} 家）`);
if (dbMeet) console.log(`  Firestore meet: ${dbMeet.name} (${dbMeet.season || 'no season'})`);
console.log('');
for (const [label, ok] of checks) console.log(`  ${ok ? '✓' : '✗'} ${label}`);
console.log('');
console.log(`写出: ${OUT_PATH}`);

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('\n✗ 自校验未通过,先别发信。');
  process.exit(1);
}
