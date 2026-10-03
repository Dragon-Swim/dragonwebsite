#!/usr/bin/env node
/**
 * Match the coaches' spreadsheet names against the system — and say who each
 * row really is.
 *
 * Why: the coaches build their sheets by hand, so a name can arrive
 *   • misspelled           "ridihi seelan"        = Ridhi Seelam
 *   • shortened            "liam", "trisha"       = Liam Norcross, Trisha Musni
 *   • by the English name  "eric chen"            = Haoran Chen (middleName Eric)
 *   • for a family that has not registered yet     (whitelist-only families)
 *
 * Pools, merged per person:
 *   1. `registrations` swimmers — canonical "First Last" **plus the middleName
 *      alias** ("eric chen" → Haoran Chen, "kayden chen" → Luo-han Chen) and
 *      the bare first name;
 *   2. `meets.feeData.swimmers[]` — the CURRENT season first (this is the join
 *      key the Meet Fee Summary uses), then earlier seasons;
 *   3. `families` — the coach's own whitelist of expected families, including
 *      the ones that never registered ("Gabriel Campo parent", "Kaiwen Liu
 *      parent", "Wendy (shoshana/celina feng parent)"). A whitelist label that
 *      is a subset/superset of a known swimmer is folded into that person.
 *
 * Never a guess: scoring is deterministic (exact / token-set / subset / edit
 * distance), ties are reported as ambiguous, a tie can be settled by another row
 * of the same sheet, and anything below the strict threshold is only listed as a
 * *hypothesis* for the coach to confirm.
 *
 * Usage:
 *   node execution/match_fee_names.mjs --balance ".tmp/meet balance.xlsx" --deposits ".tmp/meet deposit.xlsx"
 *   … [--season 2026-2027] [--out .tmp/name-match-report]
 *
 * Output: prints the table and writes <out>.md / <out>.csv / <out>.xlsx.
 * Reads Firestore only — it never writes.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// ── args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BALANCE_FILE = flag('--balance');
const DEPOSIT_FILE = flag('--deposits');
const OUT = flag('--out', '.tmp/name-match-report');
const SEASON = flag('--season', (() => {
  const d = new Date();
  const y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${y + 1}`;
})());

if (!BALANCE_FILE && !DEPOSIT_FILE) {
  console.error('用法: node execution/match_fee_names.mjs --balance <xlsx> --deposits <xlsx> [--season 2026-2027] [--out .tmp/name-match-report]');
  process.exit(1);
}

// ── name plumbing ────────────────────────────────────────────────
const strip = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = (s) => strip(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => norm(s).split(' ').filter(Boolean);
const reorderComma = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s.includes(',')) return s;
  const [last, first] = s.split(',').map((p) => p.trim());
  return `${first || ''} ${last || ''}`.trim();
};

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length; const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
const sim = (a, b) => (a === b ? 1 : 1 - levenshtein(a, b) / Math.max(a.length, b.length));
const isSubset = (small, big) => small.every((t) => big.includes(t));

/** Name similarity for reporting hypotheses (looser than matching). */
function looseSim(rawTokens, candTokens) {
  if (!rawTokens.length || !candTokens.length) return 0;
  const fwd = rawTokens.map((t) => Math.max(...candTokens.map((c) => sim(t, c))));
  const avg = fwd.reduce((s, x) => s + x, 0) / fwd.length;
  const coverage = rawTokens.filter((t) => candTokens.some((c) => sim(t, c) >= 0.7)).length / rawTokens.length;
  return avg * 0.6 + coverage * 0.4;
}

/**
 * Strict matcher: returns { score, kind } or null.
 * A weak match is worse than none — a wrong name silently splits one swimmer
 * into two Fee Summary rows.
 */
function scoreName(rawTokens, candTokens) {
  if (!rawTokens.length || !candTokens.length) return null;
  const raw = rawTokens.join(' ');
  const cand = candTokens.join(' ');
  if (raw === cand) return { score: 100, kind: 'exact' };
  if (rawTokens.length === candTokens.length && [...rawTokens].sort().join(' ') === [...candTokens].sort().join(' ')) {
    return { score: 96, kind: 'token-set' };
  }
  if (isSubset(rawTokens, candTokens)) return { score: 88 - Math.min(6, candTokens.length - rawTokens.length), kind: 'subset' };
  if (isSubset(candTokens, rawTokens)) return { score: 86 - Math.min(6, rawTokens.length - candTokens.length), kind: 'superset' };
  const pairs = rawTokens.map((rt) => Math.max(...candTokens.map((ct) => sim(rt, ct))));
  if (rawTokens.length === candTokens.length) {
    const back = candTokens.map((ct) => Math.max(...rawTokens.map((rt) => sim(rt, ct))));
    const avg = [...pairs, ...back].reduce((s, x) => s + x, 0) / (pairs.length + back.length);
    if (avg >= 0.78) return { score: Math.round(60 + 30 * avg), kind: 'fuzzy' };
    return null;
  }
  const avg = pairs.reduce((s, x) => s + x, 0) / pairs.length;
  if (avg >= 0.82 && Math.abs(rawTokens.length - candTokens.length) <= 1) {
    return { score: Math.round(55 + 25 * avg), kind: 'fuzzy-partial' };
  }
  return null;
}

// ── Firestore ────────────────────────────────────────────────────
let key;
try {
  key = JSON.parse(readFileSync(resolve(flag('--key', 'serviceAccountKey.json')), 'utf8'));
} catch (e) {
  console.error(`❌ 无法读取 service account key:${e.message}`);
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();
const [regSnap, meetSnap, famSnap] = await Promise.all([
  db.collection('registrations').get(),
  db.collection('meets').get(),
  db.collection('families').get(),
]);

/** person: everything the system knows about one human */
const persons = new Map();
const personOf = (name) => {
  const k = norm(name);
  if (!k) return null;
  if (!persons.has(k)) {
    persons.set(k, {
      key: k, names: new Set(), aliases: new Map(), sources: new Set(),
      feeSeasons: new Set(), meets: new Set(), families: new Map(),
      dob: null, middle: null, deleted: false,
      whitelist: null, kidsHint: [], rosterEntries: [], stalePlaceholders: false,
    });
  }
  const p = persons.get(k);
  p.names.add(String(name).trim());
  return p;
};
const addAlias = (person, alias, kind) => {
  const a = norm(alias);
  if (!a || a.length < 3) return;
  if (!person.aliases.has(a)) person.aliases.set(a, kind);
};

// pool 1 — registrations
for (const doc of regSnap.docs) {
  const r = doc.data();
  const parent = r.parent ? `${r.parent.firstName ?? ''} ${r.parent.lastName ?? ''}`.trim() : '';
  const spouse = r.spouse ? `${r.spouse.firstName ?? ''} ${r.spouse.lastName ?? ''}`.trim() : '';
  for (const s of Array.isArray(r.swimmers) ? r.swimmers : []) {
    const full = `${s?.firstName ?? ''} ${s?.lastName ?? ''}`.trim() || s?.name;
    const p = personOf(full);
    if (!p) continue;
    p.sources.add('roster');
    p.families.set(doc.id, { parent, spouse, emails: r.parentEmails ?? [] });
    p.rosterEntries.push({ deleted: !!s?.deleted, dob: s?.dob || null, middle: s?.middleName || null });
    if (s?.deleted) p.deleted = true;
    addAlias(p, full, 'roster');
    if (s?.middleName) {
      addAlias(p, `${s.middleName} ${s.lastName ?? ''}`, 'middle+last');
      addAlias(p, s.middleName, 'middle');
    }
    addAlias(p, s?.firstName, 'first');
  }
}

// A swimmer is only really deleted when EVERY entry of that name is deleted.
// Otherwise all we have is a leftover placeholder: the Wu family's first attempt
// at Leo Wu (empty dob) sits next to the real re-entered record.
for (const p of persons.values()) {
  const entries = p.rosterEntries || [];
  if (!entries.length) continue;
  const live = entries.filter((e) => !e.deleted);
  p.deleted = live.length === 0;
  p.stalePlaceholders = live.length > 0 && entries.some((e) => e.deleted);
  p.dob = live.find((e) => e.dob)?.dob ?? p.dob;
  p.middle = live.find((e) => e.middle)?.middle ?? p.middle;
}

// pool 2 — meet fee data
for (const doc of meetSnap.docs) {
  const m = doc.data();
  if (!Array.isArray(m?.feeData?.swimmers)) continue;
  for (const s of m.feeData.swimmers) {
    const p = personOf(s?.name);
    if (!p) continue;
    p.sources.add('fee');
    p.feeSeasons.add(m.season ?? '(none)');
    p.meets.add(m.name ?? '(unnamed)');
    addAlias(p, s?.name, 'fee');
  }
}

// pool 3 — the coach's whitelist; fold it into a known swimmer when it clearly
// names the same person ("Gabriel Campo parent" → Gabriel Martin del Campo)
const whitelistOrphans = [];
const notRegistered = [];
for (const doc of famSnap.docs) {
  const f = doc.data();
  const label = String(f.parentName ?? '').trim();
  if (!label) continue;
  const inner = [...label.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(' / ');
  const cleaned = label.replace(/\([^)]*\)/g, ' ').replace(/\b(parent|dad|mom|mum)\b/gi, ' ').replace(/[\/,]/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = [cleaned, ...inner.split('/')].map((s) => String(s).trim()).filter(Boolean);

  let reg = null;
  if (f.registeredUid) {
    const d = await db.collection('registrations').doc(f.registeredUid).get();
    if (d.exists) reg = d.data();
  }
  if (!reg) notRegistered.push({ label, email: f.email ?? null, status: f.status ?? null, uid: f.registeredUid ?? null });

  let target = null;
  for (const p of persons.values()) {
    const s = scoreName(tokens(cleaned), p.key.split(' '));
    if (s && (!target || s.score > target.score)) target = { p, ...s };
  }
  const wlInfo = { label, email: f.email ?? null, status: f.status ?? null, uid: f.registeredUid ?? null };
  if (target && target.score >= 86) {
    const p = target.p;
    p.whitelist = p.whitelist || [];
    p.whitelist.push(wlInfo);
    addAlias(p, cleaned, 'whitelist');
    for (const part of parts.slice(1)) addAlias(p, part, 'whitelist');
    p.sources.add('whitelist');
    if (reg) p.kidsHint = (reg.swimmers || []).filter((s) => !s?.deleted).map((s) => `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim());
  } else {
    const p = personOf(cleaned);
    if (!p) continue;
    p.sources.add('whitelist');
    p.whitelist = [wlInfo];
    addAlias(p, cleaned, 'whitelist');
    for (const part of parts.slice(1)) addAlias(p, part, 'whitelist');
    if (reg) p.kidsHint = (reg.swimmers || []).filter((s) => !s?.deleted).map((s) => `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim());
    whitelistOrphans.push(p);
  }
}

const allPersons = [...persons.values()];
const currentFeeKeys = new Set(allPersons.filter((p) => p.feeSeasons.has(SEASON)).map((p) => p.key));

/** The name string this person is known by, preferring the given alias kinds. */
function nameByKind(p, kinds) {
  for (const kind of kinds) {
    for (const n of p.names) if (p.aliases.get(norm(n)) === kind) return n;
  }
  return null;
}

/**
 * Name to store in a deposits record.
 * Registered swimmers keep their registration spelling (the Fee Summary joins
 * case-insensitively, so "Fargoer Zhou" still meets the fee data's "Fargoer
 * zhou"); unregistered ones use the spelling the current season's fee data
 * already uses, because that is the only string the join can match.
 */
function proposeName(p) {
  if (p.sources.has('roster')) {
    return nameByKind(p, ['roster', 'middle+last', 'fee', 'whitelist']) ?? [...p.names][0];
  }
  if (p.feeSeasons.has(SEASON)) {
    return nameByKind(p, ['fee']) ?? [...p.names][0];
  }
  return nameByKind(p, ['fee', 'whitelist']) ?? [...p.names][0];
}

const displayName = (p) => nameByKind(p, ['roster', 'middle+last', 'fee', 'whitelist']) ?? [...p.names].sort((a, b) => b.split(' ').length - a.split(' ').length)[0];

const familyLabel = (p) => [...p.families.values()].map((f) => [f.parent, f.spouse].filter(Boolean).join(' & ')).filter(Boolean).join(' / ');
const whitelistLabel = (p) => (p.whitelist || []).map((w) => `${w.label} (${w.email ?? '-'}, ${w.status})`).join(' / ');

// ── the sheets ───────────────────────────────────────────────────
const rowsOf = (file) => {
  const wb = XLSX.readFile(resolve(file));
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
};

function readSheet(file, kind) {
  const rows = rowsOf(file);
  let headerRow = -1; let nameCol = -1; let valueCol = -1;
  const wanted = kind === 'balance' ? /balance/ : /depo|amount/i;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r] || [];
    let nc = -1; let vc = -1;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? '').toLowerCase().trim();
      if (!cell) continue;
      if (nc < 0 && (cell.includes('name') || cell.includes('swimmer'))) nc = c;
      if (vc < 0 && wanted.test(cell)) vc = c;
    }
    if (nc >= 0 && vc >= 0) { headerRow = r; nameCol = nc; valueCol = vc; break; }
  }
  if (headerRow < 0) throw new Error(`${file}: 找不到 name / 金额表头`);
  const out = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const raw = String(row[nameCol] ?? '').trim();
    if (!raw) continue;
    const value = Number(String(row[valueCol] ?? '').replace(/[$,\s]/g, ''));
    out.push({ rowNum: r + 1, raw, value: Number.isFinite(value) ? value : null, amount: kind === 'balance' ? row[1] ?? null : null, deposit: kind === 'balance' ? row[2] ?? null : null });
  }
  return { rows: out };
}

const sheets = [];
if (BALANCE_FILE) sheets.push({ kind: 'balance', label: '结转余额 (meet balance.xlsx, D 列 balance)', file: BALANCE_FILE, ...readSheet(BALANCE_FILE, 'balance') });
if (DEPOSIT_FILE) sheets.push({ kind: 'deposits', label: '押金 (meet deposit.xlsx)', file: DEPOSIT_FILE, ...readSheet(DEPOSIT_FILE, 'deposits') });

// ── matching ─────────────────────────────────────────────────────
for (const sheet of sheets) {
  for (const row of sheet.rows) {
    const rawTokens = tokens(reorderComma(row.raw));
    const scored = [];
    for (const p of allPersons) {
      let best = null;
      for (const [alias, kind] of p.aliases) {
        const s = scoreName(rawTokens, alias.split(' '));
        if (s && (!best || s.score > best.score)) best = { ...s, alias, aliasKind: kind };
      }
      if (best) scored.push({ p, score: best.score, kind: best.kind, alias: best.alias, aliasKind: best.aliasKind });
    }
    scored.sort((a, b) => b.score - a.score || (a.p.key < b.p.key ? -1 : 1));
    row.rawTokens = rawTokens;
    row.scored = scored;
    row.exact = scored.filter((s) => s.kind === 'exact').map((s) => s.p.key);
    // hypotheses: nearest names anywhere in the system, strict matching ignored
    row.hypotheses = allPersons
      .map((p) => ({ p, loose: looseSim(rawTokens, p.key.split(' ')) }))
      .filter((h) => h.loose >= 0.6)
      .sort((a, b) => b.loose - a.loose)
      .slice(0, 3);
  }

  const exactKeys = new Set(sheet.rows.flatMap((r) => r.exact));
  for (const row of sheet.rows) {
    if (row.exact.length) {
      row.pick = row.scored.find((s) => s.p.key === row.exact[0]);
      row.status = 'exact';
      row.alts = row.scored.filter((s) => s.p.key !== row.exact[0]).slice(0, 3);
      continue;
    }
    if (!row.scored.length) { row.pick = null; row.status = 'none'; row.alts = []; continue; }
    const top = row.scored[0].score;
    const tied = row.scored.filter((s) => s.score === top);
    if (tied.length === 1) {
      row.pick = tied[0]; row.status = tied[0].kind; row.alts = row.scored.slice(1, 4);
      continue;
    }
    const claimed = tied.filter((t) => exactKeys.has(t.p.key));
    const left = tied.filter((t) => !exactKeys.has(t.p.key));
    if (left.length === 1 && claimed.length >= 1) {
      row.pick = left[0];
      row.status = `${left[0].kind}-by-elimination`;
      row.alts = [...claimed, ...row.scored.filter((s) => s.score < top).slice(0, 2)];
      row.note = `同表里另有精确行 ${claimed.map((c) => displayName(c.p)).join(' / ')},故排除`;
      continue;
    }
    row.pick = null; row.status = 'ambiguous'; row.alts = tied;
  }

  // neighbours help: "muhammad" sits between two rows of the Mourad family
  for (const row of sheet.rows) {
    const idx = sheet.rows.indexOf(row);
    const fams = [];
    for (let d = -2; d <= 2; d++) {
      const other = sheet.rows[idx + d];
      if (!other || other === row || !other.pick) continue;
      const p = other.pick.p;
      const who = familyLabel(p) || whitelistLabel(p) || displayName(p);
      if (who) fams.push(`${other.raw} → ${who}`);
    }
    row.neighbourFamilies = [...new Set(fams)];
  }
}

const CATEGORY = (row) => {
  if (!row.pick) return row.status === 'ambiguous' ? 'ambiguous' : 'unknown';
  const p = row.pick.p;
  if (p.sources.has('roster') && p.deleted) return 'deleted';
  if (p.sources.has('roster') && p.feeSeasons.has(SEASON)) return 'registered+in-fee';
  if (p.sources.has('roster')) return 'registered';
  if (p.feeSeasons.has(SEASON)) return 'in-fee-only';
  if (p.feeSeasons.size) return 'last-season-only';
  return 'whitelist-only';
};
const LABEL = {
  'registered+in-fee': '✅ 已注册 + 本赛季 fee 表里有',
  'registered': '✅ 已注册',
  'in-fee-only': '⚠ 本赛季 fee 表里有,未注册',
  'last-season-only': '⚠ 仅上赛季 fee 记录,本赛季未注册',
  'whitelist-only': '⚠ 只在白名单里,未注册',
  'deleted': '⚠ 注册里被标为删除',
  'ambiguous': '❓ 有歧义',
  'unknown': '❌ 查不到',
};

const noteFor = (row) => {
  if (!row.pick) {
    const parts = [];
    if (row.status === 'ambiguous') parts.push(`候选: ${row.alts.map((a) => `${displayName(a.p)}(${a.score})`).join(', ')}`);
    else {
      parts.push('三个来源都没有相近名字');
      if (row.hypotheses.length) parts.push(`最接近: ${row.hypotheses.map((h) => `${h.p.whitelist?.[0]?.label ?? displayName(h.p)}(${(h.loose * 100).toFixed(0)}%)`).join(', ')}`);
    }
    if (row.neighbourFamilies.length) parts.push(`邻近行是: ${row.neighbourFamilies.join('; ')}`);
    return parts.join('; ');
  }
  const p = row.pick.p; const bits = [];
  const display = displayName(p);
  if (norm(row.raw) !== p.key) bits.push(`表里写“${row.raw}”,系统里是“${display}”${p.middle ? `(middle name: ${p.middle})` : ''}`);
  if (row.pick.aliasKind === 'middle' || row.pick.aliasKind === 'middle+last') bits.push(`匹配的是 middleName 别名`);
  if (familyLabel(p)) bits.push(`家长: ${familyLabel(p)}`);
  if (!p.sources.has('roster') && whitelistLabel(p)) bits.push(`白名单: ${whitelistLabel(p)}`);
  if (p.kidsHint.length) bits.push(`该家庭注册表里的孩子: ${p.kidsHint.join(', ')}`);
  const fees = [...p.feeSeasons].sort();
  if (fees.length) bits.push(`fee 数据赛季: ${fees.join(', ')}`);
  if (p.stalePlaceholders) bits.push('注册里有一条被删除的重复占位记录(第一次输入失败留下的),本人正常在册');
  if (row.note) bits.push(row.note);
  if (row.neighbourFamilies.length && row.rawTokens.length === 1) bits.push(`邻近行: ${row.neighbourFamilies.join('; ')}`);
  return bits.filter(Boolean).join('; ');
};

// ── report ───────────────────────────────────────────────────────
const lines = [];
const csv = [['sheet', 'row', 'raw_name', 'value', 'status', 'category', 'system_name', 'score', 'family', 'dob', 'fee_seasons', 'note']];
lines.push(`# 名单匹配报告 — ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`- 匹配池:registrations ${regSnap.size} 个家庭(${allPersons.filter((p) => p.sources.has('roster')).length} 名队员,含 middleName 别名)、meets.feeData 的 ${SEASON} 与更早赛季、families 白名单 ${famSnap.size} 条`);
lines.push(`- 目标赛季:${SEASON}`);

for (const sheet of sheets) {
  lines.push('');
  lines.push(`## ${sheet.label}`);
  lines.push('');
  lines.push('| 行 | 表里写的 | 值 | 系统里 | 状态 | 家长 / 家庭 | 备注 |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const row of sheet.rows) {
    const cat = CATEGORY(row);
    const p = row.pick?.p;
    const system = p ? proposeName(p) : '—';
    const family = p ? (familyLabel(p) || whitelistLabel(p)) : '';
    lines.push(`| ${row.rowNum} | ${row.raw} | ${row.value ?? ''} | ${system} | ${LABEL[cat]} | ${family} | ${noteFor(row)} |`);
    csv.push([sheet.kind, row.rowNum, row.raw, row.value ?? '', row.status, cat, system, row.pick?.score ?? '', family, p?.dob ?? '', [...(p?.feeSeasons ?? [])].join('/'), noteFor(row)]);
  }
  const counts = {};
  for (const row of sheet.rows) { const c = CATEGORY(row); counts[c] = (counts[c] || 0) + 1; }
  lines.push('');
  lines.push('统计: ' + Object.entries(counts).map(([k, v]) => `${LABEL[k]} × ${v}`).join(' · '));
}

lines.push('');
lines.push('## 白名单里还没有完成注册的家庭(可能是查不到的那几行的家)');
lines.push('');
if (notRegistered.length === 0) lines.push('(无)');
for (const w of notRegistered.sort((a, b) => a.label.localeCompare(b.label))) {
  lines.push(`- **${w.label}** — ${w.email ?? '-'} (${w.status ?? '-'}${w.uid ? ', 有账号但注册表未完成' : ', 从未注册'})`);
}

lines.push('');
lines.push('## 会写进 deposits 的名字(建议)');
lines.push('');
for (const sheet of sheets) {
  lines.push(`### ${sheet.label}`);
  for (const row of sheet.rows) {
    if (!row.pick) { lines.push(`- ❓ ${row.raw} = ${row.value}: 待确认,暂不导入`); continue; }
    const name = proposeName(row.pick.p);
    const joins = row.pick.p.feeSeasons.has(SEASON);
    lines.push(`- ${row.raw} → **${name}** = ${row.value} ${joins ? '(与本赛季 fee 表对得上)' : '(本赛季 fee 表里还没有这个人)'}`);
  }
}

mkdirSync(dirname(resolve(OUT)), { recursive: true });
writeFileSync(`${OUT}.md`, lines.join('\n'));
writeFileSync(`${OUT}.csv`, csv.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(csv), 'name-match');
XLSX.writeFile(wb, `${OUT}.xlsx`);

// Machine-readable import plan: execution/import_fee_sheet.mjs consumes this
// (plus an overrides file for the rows that had to be confirmed by hand).
const planRows = (kind) => (sheets.find((s) => s.kind === kind)?.rows ?? []).map((row) => ({
  row: row.rowNum,
  raw: row.raw,
  name: row.pick ? proposeName(row.pick.p) : null,
  value: row.value,
  matchedBy: row.pick ? `${row.pick.kind}${row.pick.aliasKind ? ` via ${row.pick.aliasKind}` : ''}` : null,
  score: row.pick?.score ?? null,
  category: CATEGORY(row),
  needsReview: !row.pick || row.pick.score < 90,
  note: noteFor(row),
}));
const plan = {
  generatedAt: new Date().toISOString(),
  season: SEASON,
  sources: { balance: BALANCE_FILE, deposits: DEPOSIT_FILE },
  balance: planRows('balance'),
  deposits: planRows('deposits'),
};
writeFileSync(`${OUT}.plan.json`, JSON.stringify(plan, null, 2));

console.log(lines.join('\n'));
console.log(`\n报告已写出: ${OUT}.md / ${OUT}.csv / ${OUT}.xlsx / ${OUT}.plan.json`);
process.exit(0);
