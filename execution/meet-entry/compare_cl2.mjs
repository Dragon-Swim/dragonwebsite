#!/usr/bin/env node

// compare_cl2.mjs — 把**同一批报名**的两份 SDIF v3 `.cl2` 逐字段比一遍：
// 一份 Team Manager 导的（参照），一份我们网站导的（待验）。
//
// 为什么要有这个工具
// ------------------
// 我们发给主办方的 entry file 是自建 SDIF writer 生成的，而 Meet Manager 能不能吃进去，
// 只有导入那一刻才知道。所以验证方式是：同一场比赛、同一批人、同一批项目，两边各导一份，
// **在发给主办方之前**先比。计划与预期差异见 docs/meet-entry-export-feasibility.md §10.14
// 与 docs/meet-entries.md §7。
//
// 对齐方式：`(项目码, USA ID)` —— **不是行号**。TM 的泳手顺序和我们的不一样，按行比
// 会把整份文件报成差异。接力按 `(项目码, 队字母)` 对齐，棒次按出现顺序（E0 后面的 F0 顺序）。
//
// 什么算"预期差异"（列出来但不失败）
// ----------------------------------
//   A0  软件名 / 版本 / 联系人 / 文件日期 —— 我们不是 TM
//   Z0  备注、批次号、各类计数             —— 各自元数据
//   D3  民族 / 学校 / 参与标记             —— 我们没有这些数据，留空
//   E0  f0Count                           —— 我们填 4，TM 留空（规范要求填，见 §6.7）
//   F0  prelimLeg / swimOffLeg / finalsLeg —— 我们填 1..4，TM 全填 0（0 在规范里是"没上场"）
//   C1  队名 / 地址 / 缩写（团队代码除外）  —— 俱乐部档案，两边各存一份
//   C2  各类计数                           —— 派生值
// 其余任何差异都是**真问题**，退出码 1。
//
// 用法
//   node execution/meet-entry/compare_cl2.mjs --tm <TM.CL2> --ours <ours.CL2>
//        [--json .tmp/meet-entry/compare-report.json] [--verbose] [--max 60]
//   node execution/meet-entry/compare_cl2.mjs --self-test
//
// ⚠ 输入必须是解包后的 `.cl2` / `.sd3`。TM 导的是 zip，先解开：
//   Expand-Archive 'DRAG-PV-Entries-....zip' -DestinationPath .tmp/meet-entry
//
// 退出码：0 = 只有预期差异或完全一致；1 = 有实质差异；2 = 用法/读取错误。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { parseSdif, SDIF_LAYOUTS } from '../../src/utils/sdif.js';

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const TM_PATH = flag('tm');
const OURS_PATH = flag('ours');
const JSON_PATH = flag('json');
const VERBOSE = has('verbose');
const MAX_LIST = Number(flag('max', 60));

// ── 记录 → 可比结构 ────────────────────────────────────────────────────────

const D0_FIELDS = ['name', 'uss', 'attach', 'citizen', 'dob', 'age', 'sex', 'eventSex',
  'distance', 'stroke', 'eventNo', 'eventAge', 'swimDate', 'seedTime', 'seedCourse'];
const D3_FIELDS = ['uss14', 'preferredName'];
const E0_FIELDS = ['relayLetter', 'teamCode', 'f0Count', 'eventSex', 'distance', 'stroke',
  'eventNo', 'eventAge', 'totalAge', 'swimDate', 'seedTime', 'seedCourse'];
const F0_FIELDS = ['teamCode', 'relayLetter', 'name', 'uss', 'citizen', 'dob', 'age', 'sex',
  'prelimLeg', 'swimOffLeg', 'finalsLeg', 'legTime', 'legCourse'];
const B1_FIELDS = ['meetName', 'city', 'state', 'meetCode', 'startDate', 'endDate', 'course'];
const C1_FIELDS = ['teamCode', 'teamName', 'abbrev', 'city', 'state', 'postal', 'region'];

/**
 * Split a parsed file into the things worth comparing.
 * @returns {{header: object, individuals: Map, relays: Map, counts: {records: number, byType: object}}}
 */
export function digest(records) {
  const header = {};
  const individuals = new Map();
  const relays = new Map();
  const counts = { records: records.length, byType: {} };
  let lastD0Key = null;
  let lastE0 = null;

  for (const rec of records) {
    counts.byType[rec.type] = (counts.byType[rec.type] || 0) + 1;

    if (['A0', 'B1', 'B2', 'C1', 'C2', 'Z0'].includes(rec.type)) {
      if (!header[rec.type]) header[rec.type] = rec;
      continue;
    }
    if (rec.type === 'D0') {
      const key = `${String(rec.eventNo).trim()}|${String(rec.uss).trim().toUpperCase()}`;
      lastD0Key = key;
      individuals.set(key, { key, d0: rec, d3: null });
      continue;
    }
    if (rec.type === 'D3') {
      const slot = lastD0Key ? individuals.get(lastD0Key) : null;
      if (slot) slot.d3 = rec;
      continue;
    }
    if (rec.type === 'E0') {
      const key = `${String(rec.eventNo).trim()}|${String(rec.relayLetter).trim()}`;
      const slot = { key, e0: rec, legs: [] };
      relays.set(key, slot);
      lastE0 = slot;
      continue;
    }
    if (rec.type === 'F0' && lastE0) {
      lastE0.legs.push(rec);
      continue;
    }
  }
  return { header, individuals, relays, counts };
}

// ── 差异分类 ───────────────────────────────────────────────────────────────

/** `true` = 预期差异（列出来但不判失败）。 */
const isExpected = (path) => (
  /^A0\./.test(path)
  || /^Z0\./.test(path)
  || /^C2\./.test(path)
  || /^B2\./.test(path)
  || /^D3\./.test(path)                                  // 只比 uss14/preferredName；D3 其它字段本来就没有
  || path === 'E0.f0Count'
  || path === 'F0.prelimLeg' || path === 'F0.swimOffLeg' || path === 'F0.finalsLeg'
  || (path.startsWith('C1.') && path !== 'C1.teamCode')
);

const kindOf = (path) => (isExpected(path) ? 'expected' : 'real');

function diffFields(scope, a, b, fields) {
  const out = [];
  for (const f of fields) {
    const rawA = String(a?.[f] ?? '');
    const rawB = String(b?.[f] ?? '');
    if (rawA === rawB) continue;
    const ta = rawA.trim();
    const tb = rawB.trim();
    if (ta === tb) {
      out.push({ path: `${scope}.${f}`, kind: 'padding', tm: ta, ours: tb });
      continue;
    }
    out.push({ path: `${scope}.${f}`, kind: kindOf(`${scope}.${f}`), tm: ta, ours: tb });
  }
  return out;
}

/**
 * Compare two digested files.
 * @returns {{diffs: Array, missing: Array, counts: object}}
 */
export function compareDigests(tm, ours) {
  const diffs = [];
  const missing = [];

  for (const type of ['A0', 'B1', 'C1', 'C2', 'Z0']) {
    const a = tm.header[type];
    const b = ours.header[type];
    if (!a && !b) continue;
    if (!a || !b) { missing.push({ path: type, side: a ? 'ours' : 'tm' }); continue; }
    const fields = type === 'B1' ? B1_FIELDS : type === 'C1' ? C1_FIELDS : null;
    if (!fields) continue; // A0 / C2 / Z0：有没有就够，逐字段比只会是噪音
    diffs.push(...diffFields(type, a, b, fields));
  }

  for (const [key, a] of tm.individuals) {
    const b = ours.individuals.get(key);
    if (!b) { missing.push({ path: `D0 ${key}`, side: 'ours' }); continue; }
    diffs.push(...diffFields('D0', a.d0, b.d0, D0_FIELDS).map((d) => ({ ...d, key })));
    if (a.d3 && b.d3) diffs.push(...diffFields('D3', a.d3, b.d3, D3_FIELDS).map((d) => ({ ...d, key })));
    else if (a.d3 && !b.d3) missing.push({ path: `D3 ${key}`, side: 'ours' });
    else if (!a.d3 && b.d3) missing.push({ path: `D3 ${key}`, side: 'tm' });
  }
  for (const [key] of ours.individuals) {
    if (!tm.individuals.has(key)) missing.push({ path: `D0 ${key}`, side: 'tm' });
  }

  for (const [key, a] of tm.relays) {
    const b = ours.relays.get(key);
    if (!b) { missing.push({ path: `E0 ${key}`, side: 'ours' }); continue; }
    diffs.push(...diffFields('E0', a.e0, b.e0, E0_FIELDS).map((d) => ({ ...d, key })));
    if (a.legs.length !== b.legs.length) {
      diffs.push({ path: 'E0.legs', kind: 'real', key, tm: String(a.legs.length), ours: String(b.legs.length) });
    }
    const n = Math.min(a.legs.length, b.legs.length);
    for (let i = 0; i < n; i += 1) {
      diffs.push(...diffFields(`F0[棒次${i + 1}]`, a.legs[i], b.legs[i], F0_FIELDS).map((d) => ({ ...d, key })));
    }
  }
  for (const [key] of ours.relays) {
    if (!tm.relays.has(key)) missing.push({ path: `E0 ${key}`, side: 'tm' });
  }

  return { diffs, missing, counts: { tm: tm.counts, ours: ours.counts } };
}

// ── 输出 ───────────────────────────────────────────────────────────────────

const pad = (s, n) => String(s ?? '').padEnd(n);

function report(result, { tmName, oursName }) {
  const byKind = { real: [], expected: [], padding: [] };
  for (const d of result.diffs) (byKind[d.kind] || byKind.real).push(d);
  const missing = result.missing;

  console.log(`\nTM   : ${tmName}`);
  console.log(`ours : ${oursName}`);
  console.log(`记录数 TM ${result.counts.tm.records} / ours ${result.counts.ours.records}`);
  console.log(`个人项 TM ${result.counts.tm.byType.D0 || 0} / ours ${result.counts.ours.byType.D0 || 0}  ·  `
    + `接力队 TM ${result.counts.tm.byType.E0 || 0} / ours ${result.counts.ours.byType.E0 || 0}  ·  `
    + `棒次 TM ${result.counts.tm.byType.F0 || 0} / ours ${result.counts.ours.byType.F0 || 0}`);

  const show = (list) => (VERBOSE ? list : list.slice(0, MAX_LIST));
  const totalReal = byKind.real.length + missing.length;

  console.log(`\n== 实质差异 ${totalReal} 处 ==`);
  if (!totalReal) console.log('  （无）');
  for (const d of show(byKind.real)) {
    console.log(`  ❌ ${pad(d.path, 26)} ${d.key ? `[${d.key}] ` : ''}TM=${JSON.stringify(d.tm)} ours=${JSON.stringify(d.ours)}`);
  }
  for (const m of show(missing)) console.log(`  ❌ 只在 ${m.side === 'tm' ? 'TM' : 'ours'} 里有: ${m.path}`);
  const hidden = totalReal - show(byKind.real).length - show(missing).length;
  if (hidden > 0) console.log(`  …还有 ${hidden} 处（--verbose 看全部）`);

  console.log(`\n== 预期差异 ${byKind.expected.length} 处 ==`);
  if (!byKind.expected.length) console.log('  （无）');
  for (const d of show(byKind.expected)) {
    console.log(`  ℹ ${pad(d.path, 26)} ${d.key ? `[${d.key}] ` : ''}TM=${JSON.stringify(d.tm)} ours=${JSON.stringify(d.ours)}`);
  }
  if (byKind.padding.length) console.log(`\n== 只有空格/对齐不同（忽略）${byKind.padding.length} 处 ==`);

  const ok = totalReal === 0;
  console.log(`\n${ok ? '✅ 除了预期差异，两份文件一致' : '⛔ 有实质差异，先修再发'}`);
  return ok;
}

// ── self-test ──────────────────────────────────────────────────────────────

/** Overwrite one fixed-width field in a raw record line. */
function patchField(raw, type, field, value, { left = true } = {}) {
  const line = raw.padEnd(160, ' ').split('');
  const spec = SDIF_LAYOUTS[type].find(([name]) => name === field);
  if (!spec) throw new Error(`no field '${field}' on ${type}`);
  const [, start, len] = spec;
  const text = String(value).slice(0, len);
  const padded = left ? text.padStart(len, ' ') : text.padEnd(len, ' ');
  for (let i = 0; i < len; i += 1) line[start - 1 + i] = padded[i];
  return line.join('');
}

function runSelfTest() {
  const file = join('.tmp/meet-entry/samples/exports/rmsc-2025',
    'DRAG-PV-Entries-2025 Riley Eaton Holiday Invitational-11Dec2025-001.CL2');
  let text;
  try {
    text = readFileSync(file, 'latin1');
  } catch (e) {
    console.error(`❌ self-test 读不到去年的样本（${file}）: ${e.message}`);
    process.exit(2);
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const base = digest(parseSdif(text));
  let pass = true;
  const say = (ok, msg) => { if (!ok) pass = false; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

  const same = compareDigests(base, digest(parseSdif(text)));
  say(same.diffs.filter((d) => d.kind === 'real').length === 0 && same.missing.length === 0,
    `同一份文件与自己比 → 0 实质差异（实得 ${same.diffs.filter((d) => d.kind === 'real').length + same.missing.length}）`);

  const d0Index = lines.findIndex((l) => l.startsWith('D0'));
  const seedChanged = [...lines];
  seedChanged[d0Index] = patchField(lines[d0Index], 'D0', 'seedTime', '9:59.99');
  const d1 = compareDigests(base, digest(parseSdif(seedChanged.join('\r\n'))));
  say(d1.diffs.some((d) => d.kind === 'real' && d.path === 'D0.seedTime'), '改一条 seed time → 抓到');

  const dropped = lines.filter((_, i) => i !== d0Index);
  const d2 = compareDigests(base, digest(parseSdif(dropped.join('\r\n'))));
  say(d2.missing.some((m) => m.path.startsWith('D0 ')), '删一条 D0 → 抓到"只在 TM 里有"');

  // 同一个值，只换对齐方式 → 应归到 padding，不算实质差异
  const seedValue = String(base.individuals.values().next().value.d0.seedTime).trim();
  const shifted = [...lines];
  shifted[d0Index] = patchField(lines[d0Index], 'D0', 'seedTime', seedValue, { left: false });
  const d3 = compareDigests(base, digest(parseSdif(shifted.join('\r\n'))));
  const realFromPad = d3.diffs.filter((d) => d.kind === 'real').length + d3.missing.length;
  say(realFromPad === 0 && d3.diffs.some((d) => d.kind === 'padding'), '只改对齐方式 → 归 padding，不判失败');

  // 接力：删一条 F0 → E0.legs 数量不对
  const f0Index = lines.findIndex((l) => l.startsWith('F0'));
  if (f0Index >= 0) {
    const fewerLegs = lines.filter((_, i) => i !== f0Index);
    const d4 = compareDigests(base, digest(parseSdif(fewerLegs.join('\r\n'))));
    say(d4.diffs.some((d) => d.kind === 'real' && d.path === 'E0.legs'), '少一条 F0 → 抓到棒次数不符');
  }

  console.log(`\nself-test ${pass ? '✅ 通过' : '❌ 失败'}`);
  process.exit(pass ? 0 : 1);
}

// ── main ───────────────────────────────────────────────────────────────────

function readFileOrDie(path, label) {
  if (!path) {
    console.error(`❌ 缺少 --${label} <file.cl2>`);
    process.exit(2);
  }
  if (/\.zip$/i.test(path)) {
    console.error(`❌ ${path} 是 zip。TM 导出的 zip 先解开，指向里面的 .CL2：
   Expand-Archive '${path}' -DestinationPath .tmp/meet-entry`);
    process.exit(2);
  }
  try {
    return readFileSync(path, 'latin1');
  } catch (e) {
    console.error(`❌ 读不到 ${path}: ${e.message}`);
    process.exit(2);
  }
}

if (has('self-test')) runSelfTest();

const tmText = readFileOrDie(TM_PATH, 'tm');
const oursText = readFileOrDie(OURS_PATH, 'ours');

const result = compareDigests(digest(parseSdif(tmText)), digest(parseSdif(oursText)));
const ok = report(result, { tmName: basename(TM_PATH), oursName: basename(OURS_PATH) });

if (JSON_PATH) {
  mkdirSync(dirname(resolve(JSON_PATH)), { recursive: true });
  writeFileSync(resolve(JSON_PATH), JSON.stringify({
    generatedAt: new Date().toISOString(), tm: TM_PATH, ours: OURS_PATH, ok, ...result,
  }, null, 2));
  console.log(`报告: ${JSON_PATH}`);
}

process.exit(ok ? 0 : 1);
