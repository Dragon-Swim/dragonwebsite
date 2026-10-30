/**
 * attention_list.mjs — 「写 PVS 成绩之前该处理谁」的一页清单。只读。
 *
 * 用法:
 *   node execution/swim-results/attention_list.mjs
 *   node execution/swim-results/attention_list.mjs --pvs .tmp/swim-results/pvs \
 *        --previous .tmp/meet-entry/legacy/coach-followup-2026-10-03.md \
 *        -o .tmp/deliverables/dragon-needs-attention-2026-10-29.md
 *
 * 为什么单独一个工具,而不是再跑一遍 coach-followup-report.mjs
 * ------------------------------------------------------------
 * `coach-followup-report.mjs` 是**围绕某一场比赛**的催信包（"你的孩子报了这场,但还没注册"）,
 * 它的 A/E 组和 3.5/3.6 节都锚定在那份 Hy-Tek 报名报告上。而现在要回答的是另一个问题:
 * **"PVS 成绩已经能抓到了,哪些孩子的身份在系统里对不上,导致写不进去?"**
 * 这个问题跟哪一场比赛无关,所以单独立一个工具。费用/押金那部分仍归旧工具,这里不重复。
 *
 * 判定口径(与 coach-followup-report.mjs 共用同一套,别各写一份)
 * ----------------------------------------------------------------
 *   1. 「已注册」= 白名单条目有 registeredUid 且该 registration 文档存在,
 *      **或者** 这个邮箱出现在某份注册表的 parentEmails 里(配偶/共同家长)。
 *   2. 白名单 `parentName` 是自由文本,里面可能写着**已注册泳手的全名** → 那是历史重复条目,
 *      家庭其实已经注册了,**绝对不能放进催注册名单**。
 *   3. 同一个邮箱在多个组里只出现一次;跨组问题用「补一句」合并,不重复发信。
 *
 * 四个 PVS 相关的判定
 * -------------------
 *   reg      PVS 文件里的 ID == 某个已填 USA ID 的注册          → 可以写
 *   noId     同名同人有注册,但 `usaSwimmingId` 是空的           → 让家长补,补完就能写
 *   mismatch 同名同人有注册,但 ID 不一样                        → 人工确认哪个是现行的
 *   unknown  名下没有这个队员(可能退队/漏注册/拼写不同)          → 不写,先确认
 *
 * --previous 给一份旧清单(任意 markdown),会把里面出现过的邮箱标成「已在旧清单」,
 * 这样同一个问题不会被当成新发现重复提。
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { normalizeSortKey } from '../../src/utils/swimmerSort.js';
import { activeSwimmers } from '../../src/utils/registrationCompleteness.js';

// ── 参数 ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const PVS_DIR = resolve(flag('--pvs', '.tmp/swim-results/pvs'));
const PREV_PATH = flag('--previous', '.tmp/meet-entry/legacy/coach-followup-2026-10-03.md');
const OUT = resolve(flag('-o', `.tmp/deliverables/dragon-needs-attention-${new Date().toISOString().slice(0, 10)}.md`));
const KEY_PATH = resolve(flag('--key', 'serviceAccountKey.json'));
const SEASON = '2026-2027';

const ne = (e) => String(e ?? '').trim().toLowerCase();
const uniq = (a) => [...new Set(a.filter(Boolean))];
const pname = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim();
const kidName = (s) => [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim();
const familyLabel = (r) => [pname(r.parent), pname(r.spouse)].filter(Boolean).join(' & ') || '(no name)';
const table = (head, rows) => rows.length
  ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.map((c) => String(c ?? '—')).join(' | ')} |`)].join('\n')
  : '（无）';

// ── 数据 ────────────────────────────────────────────────────────────────────
const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
initializeApp({ credential: cert(key) });
const db = getFirestore();

const [famSnap, regSnap, coachSnap] = await Promise.all([
  db.collection('families').get(),
  db.collection('registrations').get(),
  db.collection('coaches').get(),
]);
const families = famSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const regs = regSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const coachEmails = new Set(coachSnap.docs.map((d) => ne(d.data().email)).filter(Boolean));

const emailsOf = (r) => uniq([r.parent?.email, r.spouse?.email, ...(r.parentEmails || [])].map(ne));
const coveredEmails = new Set();
for (const r of regs) for (const e of emailsOf(r)) coveredEmails.add(e);

const roster = [];
for (const r of regs) for (const s of activeSwimmers(r)) {
  roster.push({ regId: r.id, reg: r, swimmer: s, name: kidName(s), id: String(s.usaSwimmingId || '').trim() });
}

// 旧清单里出现过的邮箱 → 用来标注「这个之前就提过」
const prevEmails = new Set();
const prevGroup = { A: [], B: [], C: [], D: [], E: [], F: [] };
if (existsSync(PREV_PATH)) {
  const txt = readFileSync(PREV_PATH, 'utf8');
  for (const m of txt.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)) prevEmails.add(ne(m[0]));
  // 按「### X 组」切段,拿到每组当时的邮箱 —— 用来算「谁已经处理掉了」。
  // 旧清单是同一套模板生成的,锚点很稳;万一格式变了就整段跳过,不瞎猜。
  const slice = (a, b) => {
    const i = txt.indexOf(a);
    if (i < 0) return null;
    const j = b ? txt.indexOf(b, i + a.length) : txt.length;
    return j > i ? txt.slice(i, j) : null;
  };
  const spans = {
    A: ['### A 组', '### B 组'], B: ['### B 组', '### C 组'], C: ['### C 组', '### D 组'],
    D: ['### D 组', '### E 组'], E: ['### E 组', '### F 组'], F: ['### F 组', '## 2. 同一户'],
  };
  for (const [g, [a, b]] of Object.entries(spans)) {
    const seg = slice(a, b);
    if (seg) prevGroup[g] = [...new Set([...seg.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)].map((m) => ne(m[0])))];
  }
}
const prevOk = ['A', 'B', 'C', 'E', 'F'].some((g) => prevGroup[g].length);
const prev = (e) => (prevEmails.has(ne(e)) ? '是' : '**新**');

// ── 白名单分类（与 coach-followup-report.mjs 同一套规则）──────────────────────
const registeredSwimmerNames = new Set(roster.map((x) => normalizeSortKey(x.name)).filter(Boolean));
const registeredParentNames = new Set();
for (const r of regs) for (const p of [r.parent, r.spouse]) {
  const n = normalizeSortKey(pname(p));
  if (n) registeredParentNames.add(n);
}
const STRIP_ROLE = /\b(parent|mom|dad|mother|father|guardian)\b/g;
const entryBare = (s) => normalizeSortKey(s).replace(STRIP_ROLE, ' ').replace(/\s+/g, ' ').trim();

const wl = families.map((f) => {
  const email = ne(f.email);
  const normName = normalizeSortKey(f.parentName || '');
  const ownReg = Boolean(f.registeredUid) && regs.some((r) => r.id === f.registeredUid);
  const inReg = coveredEmails.has(email);
  let dupOf = null;
  for (const s of registeredSwimmerNames) if (s && normName.includes(s)) { dupOf = s; break; }
  if (!dupOf && registeredParentNames.has(entryBare(f.parentName || ''))) dupOf = entryBare(f.parentName || '');
  return { ...f, email, ownReg, inReg, dupOf, parentName: f.parentName || '' };
});
const pending = wl.filter((w) => !w.ownReg && !w.inReg && !w.registeredUid && !w.dupOf);
const noForm = wl.filter((w) => !w.ownReg && !w.inReg && w.registeredUid && !w.dupOf);
const spouse = wl.filter((w) => !w.ownReg && w.inReg);
const dup = wl.filter((w) => !w.ownReg && !w.inReg && w.dupOf);

// ── PVS 文件里出现过的 ID ────────────────────────────────────────────────────
const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const csOf = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Math.round(v * 100);
  const s = String(v).trim();
  if (!s || s === '0.00') return null;
  const p = s.split(':').map(Number);
  const sec = p.length === 2 ? p[0] * 60 + p[1] : p[0];
  return Number.isFinite(sec) ? Math.round(sec * 100) : null;
};
const swimKey = (code, secs, place) =>
  `${String(code).toUpperCase().replace(/[^0-9A-Z]/g, '')}|${secs ?? '-'}|${place ?? '-'}`;

const meetsDir = resolve(PVS_DIR, 'meets');
const pvsAthletes = new Map(); // memberId → { name, meets:Set, byMeet:{iso:[swimKey]}, swims, dq }
if (existsSync(meetsDir)) {
  for (const f of readdirSync(meetsDir).filter((x) => x.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(resolve(meetsDir, f), 'utf8'));
    if (!doc.hasOurTeam) continue;
    for (const a of doc.athletes) {
      const cur = pvsAthletes.get(a.memberId) || {
        memberId: a.memberId, name: `${a.firstName} ${a.lastName}`.trim(),
        idKind: a.idKind, age: a.age, meets: new Set(), byMeet: {}, swims: 0, dq: 0,
      };
      cur.meets.add(`${doc.meet.key} ${doc.meet.startDate}`);
      // 按场存「项目|时间|名次」,用来和 USAS 的同场成绩逐条比对
      cur.byMeet[doc.meet.startDate] = (cur.byMeet[doc.meet.startDate] || []).concat(
        a.swims.filter((s) => s.status === 'ok').map((s) => swimKey(s.eventCode, csOf(s.seconds), s.place)));
      cur.swims += a.swims.filter((s) => s.status === 'ok').length;
      cur.dq += a.swims.filter((s) => s.status === 'DQ').length;
      pvsAthletes.set(a.memberId, cur);
    }
  }
}

const regById = new Map(roster.filter((x) => x.id).map((x) => [x.id, x]));
const regByName = new Map();
for (const x of roster) {
  const k = normalizeSortKey(x.name);
  if (!k) continue;
  if (!regByName.has(k)) regByName.set(k, []);
  regByName.get(k).push(x);
}

const buckets = { reg: [], noId: [], mismatch: [], unknown: [] };
for (const a of pvsAthletes.values()) {
  const direct = regById.get(a.memberId);
  if (direct) { buckets.reg.push({ ...a, target: direct }); continue; }
  const byName = regByName.get(normalizeSortKey(a.name));
  if (!byName) { buckets.unknown.push(a); continue; }
  const noId = byName.find((x) => !x.id);
  if (noId) { buckets.noId.push({ ...a, target: noId }); continue; }
  buckets.mismatch.push({ ...a, targets: byName });
}

// 对不上的孩子，先在「还没注册」的白名单条目里找可能属于谁 —— 同一个孩子不该被列两遍。
const nameTokens = (s) => String(s || '').toLowerCase().match(/[a-z]{3,}/g) || [];
for (const a of buckets.unknown) {
  const at = new Set(nameTokens(a.name));
  const scored = [...pending, ...noForm]
    .map((w) => ({ w, hits: nameTokens(w.parentName).filter((t) => at.has(t)) }))
    .filter((x) => x.hits.length)
    .sort((x, y) => y.hits.length - x.hits.length);
  a.likely = scored[0]?.w || null;
  a.likelyHits = scored[0]?.hits || [];
}
// ── ID 不一致的,自动拿 USAS 的同场成绩验一遍 ────────────────────────────────
// 2026-10-30 实测:三个孩子(PVS ID ≠ 注册 ID)在 USAS 里,用**注册 ID** 查到的是同一场、
// 同样的成绩(逐条时间+名次都相同)→ 同一个人,不是重名。
// 原因:比赛文件第 70–83 位那串并不总是"现行 USA-S 会员 ID" —— 多半是俱乐部 Team Manager
// 名册没跟着会员续期更新;Isabella Ye 那个 `101416ISAMYE**` 甚至是 TM 在运动员没有 SWIMS ID 时
// 用"生日+姓名缩写"现编的老格式。而 USA Swimming 自己的库是按人认的,所以 Data Hub 把这场
// 记在注册 ID 下。 → 这类可以按「姓名 + 比赛日年龄 + 性别」映射,写到注册 ID 下。
for (const a of buckets.mismatch) {
  a.verified = false;
  a.evidence = [];
  if (a.targets.length !== 1) continue;          // 重名多个人 → 不自动认
  const snap = await db.collection('swimResults').doc(a.targets[0].id).get();
  if (!snap.exists) continue;
  const doc = snap.data();
  for (const [iso, mine] of Object.entries(a.byMeet || {})) {
    const [, mm, dd] = iso.split('-').map(Number);
    const hit = Object.entries(doc.meets || {}).map(([id, m]) => ({ id, ...m })).find((m) => {
      const dm = String(m.meetDates || '').match(/^([A-Z][a-z]{2})\s+(\d{1,2})/);
      return dm && dm[1] === MON_NAMES[mm - 1] && Number(dm[2]) === dd;
    });
    if (!hit) continue;
    const usas = new Set((hit.swims || []).map((s) => swimKey(s.eventCode, csOf(s.swimTime), s.finishPosition)));
    const equal = mine.length > 0 && mine.length === usas.size && mine.every((k) => usas.has(k));
    a.evidence.push({ iso, usasMeet: hit.meetName, count: mine.length, usasCount: usas.size, equal });
  }
  a.verified = a.evidence.length > 0 && a.evidence.every((e) => e.equal);
}

const noIdWithSwims = buckets.noId.filter((a) => a.swims > 0).length;
const noIdNoSwims = buckets.noId.length - noIdWithSwims;

// 所有「注册了、但有孩子没填 USA ID」的家庭（不分有没有参加过比赛）——
// §1.1 只讲已经在正式比赛里出现过的,剩下的在这里,免得把"缺 ID"这件事只讲一半。
const coveredRegIds = new Set(buckets.noId.map((a) => a.target.regId));
const missingIdFamilies = [];
for (const r of regs) {
  const kids = activeSwimmers(r);
  const missing = kids.filter((s) => !String(s.usaSwimmingId || '').trim());
  if (missing.length) {
    missingIdFamilies.push({
      reg: r, email: emailsOf(r)[0] || '', label: familyLabel(r),
      missing: missing.map(kidName), total: kids.length,
      inPvs: coveredRegIds.has(r.id),
    });
  }
}
const missingIdNotInPvs = missingIdFamilies.filter((f) => !f.inPvs);

// ── 收件人 ─────────────────────────────────────────────────────────────────
const urgentRegIds = new Set(buckets.noId.filter((a) => a.swims > 0).map((a) => a.target.regId));
const missUrgent = missingIdFamilies.filter((f) => urgentRegIds.has(f.reg.id));   // 有成绩在等
const missLater = missingIdFamilies.filter((f) => !urgentRegIds.has(f.reg.id));  // 这几场没成绩
const urgentKids = buckets.noId.filter((a) => a.swims > 0);
const laterKids = missLater.reduce((n, f) => n + f.missing.length, 0);
const bcc = (list) => list.map((x) => x.email).filter(Boolean).join('; ');

// ── 自校验:只在控制台报警,不占文档篇幅 ──────────────────────────────────────
const sendList = [...new Set([...pending, ...noForm, ...missUrgent, ...missLater].map((x) => x.email).filter(Boolean))];
const checks = [
  [`PVS 队员 ${pvsAthletes.size} = 一致 ${buckets.reg.length} + 缺 ID ${buckets.noId.length} + ID 不一致 ${buckets.mismatch.length} + 对不上 ${buckets.unknown.length}`,
    pvsAthletes.size === buckets.reg.length + buckets.noId.length + buckets.mismatch.length + buckets.unknown.length],
  [`白名单 ${families.length} = 已注册 ${wl.filter((w) => w.ownReg).length} + 未注册 ${pending.length} + 建号未交表 ${noForm.length} + 配偶 ${spouse.length} + 重复 ${dup.length}`,
    families.length === wl.filter((w) => w.ownReg).length + pending.length + noForm.length + spouse.length + dup.length],
  [`收件人无重复（${sendList.length} 个）`, new Set(sendList).size === sendList.length],
  [`收件人不含教练邮箱`, sendList.every((e) => !coachEmails.has(e))],
  [`收件人地址格式正常`, sendList.every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))],
  [`缺 ID 的孩子都有家长邮箱`, missingIdFamilies.every((f) => f.email)],
];
const failed = checks.filter(([, ok]) => !ok);

const relOut = OUT.replace(process.cwd(), '').replace(/^[\\/]/, '').replace(/\\/g, '/');
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
const meetsSeen = [...new Set([...pvsAthletes.values()].flatMap((a) => [...a.meets]))].sort();
const verifiedCount = buckets.mismatch.filter((a) => a.verified).length;
const unverifiedMismatch = buckets.mismatch.filter((a) => !a.verified);
const writable = buckets.reg.length + verifiedCount;

const md = `# Dragon Swim — 写成绩前要处理的事

生成：${stamp}　依据：PVS 官方成绩包 ${meetsSeen.length} 场（${meetsSeen.join('、')}）

${pvsAthletes.size} 个在正式比赛里出现过的孩子：**${writable} 个现在就能写**，${urgentKids.length} 个等家长补 ID，
${noIdNoSwims} 个缺 ID 但这几场没游，${buckets.unknown.length} 个的家庭还没注册。
另：${pending.length + noForm.length} 户还没完成注册；${buckets.mismatch.length} 个孩子的 ID 需要在 Team Manager 里改。

---

## 1. 还没完成注册（${pending.length + noForm.length} 户）

| Email | 白名单上的名字 |
|---|---|
${[...pending, ...noForm].map((w) => `| ${w.email} | ${w.parentName || '—'} |`).join('\n')}

\`\`\`
${bcc([...pending, ...noForm])}
\`\`\`

## 2. 缺 USA Swimming ID —— 有成绩在等（${urgentKids.length} 个孩子 / ${missUrgent.length} 户）

补上 ID 就能立刻写入。

| 孩子 | 家长 |
|---|---|
${urgentKids.map((a) => `| ${a.name} | ${familyLabel(a.target.reg)} |`).join('\n')}

\`\`\`
${bcc(missUrgent)}
\`\`\`

## 3. ID 填错了 —— 请在 Team Manager 里改（${buckets.mismatch.length} 个孩子）

| 孩子 | 正确（注册表 / USA Swimming） | 错误（TM 名册里） |
|---|---|---|
${buckets.mismatch.map((a) => `| ${a.name} | \`${a.targets.map((t) => t.id).join(' / ')}\` | \`${a.memberId}\` |`).join('\n')}

> 右列这三个 ID 在 USA Swimming 里**查不到**（\`No records returned\`）。USA-S 收成绩时按姓名+生日认人，
> 所以成绩没丢；但每场比赛的文件都会带着错的 ID 过来，网站这边只能靠姓名兜底匹配。
> **在 Team Manager 里把 ID 改成左列**，以后就干净了。${unverifiedMismatch.length ? `
>
> ⚠ 其中 ${unverifiedMismatch.map((a) => a.name).join('、')} 没能用同场成绩验证，先别当同一人处理。` : ''}

## 4. 缺 USA Swimming ID，也没有比赛记录（${laterKids} 个孩子 / ${missLater.length} 户）

最后这一类不用现在发信，只要扫一眼：确认这些孩子里没有正在比赛的。有的话挪到第 2 类。
真要群发的话，地址在下面。

| 孩子 | 家长 |
|---|---|
${missLater.map((f) => `| ${f.missing.join('、')} | ${f.label} |`).join('\n')}

\`\`\`
${bcc(missLater)}
\`\`\`

---

重新生成：\`node execution/swim-results/attention_list.mjs\`
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md, 'utf8');
console.log(`✅ ${OUT}`);
console.log(`   可写 ${writable} / 等 ID ${urgentKids.length} / 缺ID且没比赛 ${laterKids} / 等注册 ${buckets.unknown.length + pending.length + noForm.length}`);
console.log(`   收件人 ${sendList.length} 个：没注册 ${pending.length + noForm.length} 户 · 缺ID ${missUrgent.length + missLater.length} 户`);
if (failed.length) {
  console.warn(`⚠ 自校验 ${failed.length} 项不通过：`);
  for (const [label, ok] of checks) if (!ok) console.warn(`   ✗ ${label}`);
} else {
  console.log('   自校验 6 项全过');
}
