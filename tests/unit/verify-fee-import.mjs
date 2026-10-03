// Unit checks for src/utils/feeImport.js — the deterministic half of the
// Deposits tab's two spreadsheet importers (carry-over balance / deposits).
// Pure logic: no DOM, no Firestore, no network.
//
// The cases below are the live 2026-10-02 incident, pinned down:
//   • .tmp/meet balance.xlsx — a title row, then "name | amount | deposit |
//     balance", where a negative balance means the family still owes money.
//     The old importer rejected negatives, so the uploaded numbers arrived
//     with their sign stripped.
//   • .tmp/meet deposit.xlsx — "name | depoist" (typo). The old importer
//     matched no amount column and still created 13 name-only records.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it.
import {
  parseMoney,
  normalizeName,
  colLetter,
  depositTotal,
  nextFreeDepositSlot,
  findDepositForSwimmer,
  parseCarryOverRows,
  planCarryOverRows,
  buildCarryOverWrites,
  parseDepositDetailRows,
  planDepositRows,
  buildDepositWrites,
} from '../../src/utils/feeImport.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};
const reasons = (list) => list.map((e) => e.reason).join(' | ');

// ── fixtures: the coaches' real sheets (array-of-arrays from sheet_to_json) ──
const BALANCE_SHEET = [
  ['meet balance for 2025-26', null, null, null],
  ['name ', 'amount', 'deposit', 'balance'],
  ['eric chen', 624.5, 1000, 375.5],
  ['ada gai', 482, 300, -182],
  ['suleiman', 648.5, 500, -148.5],
  ['', null, null, null],
];
const DEPOSIT_SHEET_TYPO = [
  ['name ', 'depoist'],
  ['nathan zhang', 200],
  ['alex tong', 400],
  ['miranda xu', '\u2014'],
];
const DEPOSIT_SHEET_NUMBERED = [
  ['Name', 'Deposit 1 Amount', 'Deposit 1 Date', 'D2 Amt', 'D2 Date'],
  ['nathan zhang', 200, '2026-09-15', 150, '2026-10-01'],
  ['no amounts here', null, null, null, null],
];

console.log('1. money + column helpers');
check('parseMoney keeps a negative number', parseMoney(-182) === -182);
check('parseMoney strips $ and thousands separators', parseMoney('$1,234.50') === 1234.5, parseMoney('$1,234.50'));
check('parseMoney reads accounting negatives: (182)', parseMoney('(182)') === -182, parseMoney('(182)'));
check('parseMoney rejects blanks and text', Number.isNaN(parseMoney('')) && Number.isNaN(parseMoney(null)) && Number.isNaN(parseMoney('n/a')));
check('colLetter maps 0->A, 25->Z, 26->AA', colLetter(0) === 'A' && colLetter(25) === 'Z' && colLetter(26) === 'AA', [colLetter(0), colLetter(25), colLetter(26)]);
check('normalizeName collapses case and spacing', normalizeName('  Ada   GAI ') === 'ada gai');

console.log('2. carry-over balance sheet (the sign bug)');
const balance = parseCarryOverRows(BALANCE_SHEET);
check('title row is skipped, header row found at index 1', balance.headerRow === 1, balance.headerRow);
check('no fatal error', balance.fatal === null, balance.fatal);
check('blank row is not a record', balance.valid.length === 3, balance.valid.length);
check('negative balance survives as negative (ada gai)',
  balance.valid.find((r) => r.swimmerName === 'ada gai')?.balance === -182,
  balance.valid.find((r) => r.swimmerName === 'ada gai'));
check('positive balance untouched (eric chen)',
  balance.valid.find((r) => r.swimmerName === 'eric chen')?.balance === 375.5);
check('column mapping points at A (name) and D (balance)',
  balance.columns.find((c) => c.field === 'name')?.letter === 'A'
  && balance.columns.find((c) => c.field === 'balance')?.letter === 'D',
  balance.columns);

console.log('3. carry-over sheet that cannot be imported');
const noBalanceCol = parseCarryOverRows([['name', 'amount'], ['ada gai', 482]]);
check('name column without a balance column is refused',
  noBalanceCol.fatal === 'need-name-balance' && noBalanceCol.valid.length === 0, noBalanceCol.fatal);
check('no-data file is refused', parseCarryOverRows([['name', 'balance']]).fatal === 'no-data-rows');
const badBalance = parseCarryOverRows([['name', 'balance'], ['ada gai', 'n/a']]);
check('non-numeric balance becomes a row error, not a record',
  badBalance.valid.length === 0 && badBalance.errors.length === 1, reasons(badBalance.errors));

console.log('4. deposit sheet with a single amount column ("depoist" typo)');
const simple = parseDepositDetailRows(DEPOSIT_SHEET_TYPO);
check('typo header is understood as the amount column', simple.mode === 'simple' && simple.fatal === null, simple.mode);
check('column mapping shows the typo it matched',
  simple.columns.find((c) => c.field === 'amount')?.label === 'depoist'
  && simple.columns.find((c) => c.field === 'amount')?.letter === 'B',
  simple.columns);
check('two amounts parsed, the "—" row errors instead of creating a record',
  simple.valid.length === 2 && simple.errors.length === 1, [simple.valid.length, reasons(simple.errors)]);
check('amount parses to a number', simple.valid[0].amount === 200 && simple.valid[1].amount === 400);

console.log('5. a sheet with no writable amount column is REFUSED (the 13 empty records)');
const bareAmount = parseDepositDetailRows([['Name', 'Amount'], ['ada gai', 482]]);
check('bare "Amount" header is refused, nothing valid',
  bareAmount.fatal === 'need-name-amount' && bareAmount.valid.length === 0, [bareAmount.fatal, bareAmount.valid.length]);
const nameOnly = parseDepositDetailRows([['Swimmer'], ['ada gai'], ['liam toner']]);
check('name-only sheet is refused, nothing valid',
  nameOnly.fatal === 'need-name-amount' && nameOnly.valid.length === 0, [nameOnly.fatal, nameOnly.valid.length]);

console.log('6. numbered deposit columns still work');
const detail = parseDepositDetailRows(DEPOSIT_SHEET_NUMBERED);
check('mode is detail', detail.mode === 'detail', detail.mode);
check('all four numbered fields parsed',
  detail.valid.length === 1
  && detail.valid[0].deposit1Amount === 200 && detail.valid[0].deposit1Date === '2026-09-15'
  && detail.valid[0].deposit2Amount === 150 && detail.valid[0].deposit2Date === '2026-10-01',
  detail.valid);
check('a named row with no amount is an error row, not an empty record',
  detail.errors.length === 1 && /No deposit amount/.test(reasons(detail.errors)), reasons(detail.errors));

console.log('7. write planning — carry-over balance');
const existing = [{ id: 'doc1', season: '2025-2026', swimmerName: 'ada gai', balance: 600, deposit1Amount: null }];
const balancePlan = planCarryOverRows(balance.valid, existing, '2025-2026');
const adaPlan = balancePlan.find((r) => r.swimmerName === 'ada gai');
check('existing doc is targeted for update', adaPlan.existingId === 'doc1' && adaPlan.willCreate === false);
check('previous balance is surfaced for the preview', adaPlan.previousBalance === 600, adaPlan.previousBalance);
check('same name in another season creates a new record',
  planCarryOverRows(balance.valid, existing, '2026-2027').find((r) => r.swimmerName === 'ada gai').willCreate === true);
const balanceWrites = buildCarryOverWrites(balancePlan);
check('write plan carries the signed balance',
  balanceWrites.find((w) => w.swimmerName === 'ada gai').fields.balance === -182,
  balanceWrites.find((w) => w.swimmerName === 'ada gai'));
check('write plan keeps the existing doc id', balanceWrites.find((w) => w.swimmerName === 'ada gai').existingId === 'doc1');

console.log('8. write planning — deposit slots');
const empty = planDepositRows(simple, [], '2026-2027');
check('with no record yet the amount goes to Deposit 1',
  empty.rows.length === 2 && empty.rows[0].targetSlot === 'deposit1Amount' && empty.rows[0].targetLabel === 'Deposit 1',
  empty.rows[0]);
check('simple writes carry the slot field',
  buildDepositWrites(simple, empty.rows)[0].fields.deposit1Amount === 200
  && !('deposit2Amount' in buildDepositWrites(simple, empty.rows)[0].fields),
  buildDepositWrites(simple, empty.rows)[0].fields);

const withD1 = [{ id: 'doc2', season: '2026-2027', swimmerName: 'alex tong', balance: 0, deposit1Amount: 400 }];
const dupPlan = planDepositRows(simple, withD1, '2026-2027');
check('an amount already recorded is skipped, not counted twice (alex tong 400 vs existing 400)',
  dupPlan.rows.every((r) => r.swimmerName !== 'alex tong')
  && dupPlan.skipped.some((s) => /already recorded as Deposit 1/.test(s.reason)),
  dupPlan.skipped);
check('a swimmer with no record fills Deposit 1 (nathan zhang)',
  dupPlan.rows.find((r) => r.swimmerName === 'nathan zhang')?.targetSlot === 'deposit1Amount');

const withD1b = [{ id: 'doc3', season: '2026-2027', swimmerName: 'nathan zhang', balance: 0, deposit1Amount: 100 }];
check('a different amount goes to Deposit 2',
  planDepositRows(simple, withD1b, '2026-2027').rows.find((r) => r.swimmerName === 'nathan zhang')?.targetSlot === 'deposit2Amount');
const full = [{ id: 'doc4', season: '2026-2027', swimmerName: 'nathan zhang', balance: 0, deposit1Amount: 1, deposit2Amount: 2, deposit3Amount: 3 }];
const fullPlan = planDepositRows(simple, full, '2026-2027');
check('all three slots filled -> slot error, no write',
  fullPlan.rows.every((r) => r.swimmerName !== 'nathan zhang')
  && fullPlan.slotErrors.some((e) => /all three deposit slots/.test(e.reason)),
  fullPlan.slotErrors);

const detailPlan = planDepositRows(detail, existing, '2025-2026');
check('detail rows keep their numbered fields for the write plan',
  buildDepositWrites(detail, detailPlan.rows)[0].fields.deposit2Amount === 150,
  buildDepositWrites(detail, detailPlan.rows)[0].fields);
check('detail writes never invent a balance field',
  !('balance' in buildDepositWrites(detail, detailPlan.rows)[0].fields));

console.log('9. slot / total helpers');
check('nextFreeDepositSlot skips filled slots', nextFreeDepositSlot({ deposit1Amount: 10, deposit2Amount: 20 }) === 'deposit3Amount');
check('nextFreeDepositSlot treats 0 as free', nextFreeDepositSlot({ deposit1Amount: 0 }) === 'deposit1Amount');
check('nextFreeDepositSlot returns null when full', nextFreeDepositSlot({ deposit1Amount: 1, deposit2Amount: 2, deposit3Amount: 3 }) === null);
check('depositTotal = balance + d1 + d2 + d3', depositTotal({ balance: -182, deposit1Amount: 100, deposit2Amount: 0, deposit3Amount: 50 }) === -32);
check('findDepositForSwimmer matches on normalized name + season',
  findDepositForSwimmer(existing, '2025-2026', 'Ada  GAI')?.id === 'doc1'
  && findDepositForSwimmer(existing, '2026-2027', 'ada gai') === null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
