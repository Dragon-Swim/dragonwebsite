// Unit checks for src/utils/meetKey.js — deciding whether the meet USA Swimming
// just returned is the one already on file under a PVS key, and merging without
// losing what USAS cannot express (DQ).
//
// The case that motivated it: `import_pvs_results.mjs` stores a meet it has never
// seen as `pvs-27-27`; a later `Fetch All` sees an unknown numeric meetId, fetches
// it, and would store a second copy. The family would then see the meet twice.
//
// Part of `npm run test:unit`. Deliberately not named *.spec.js so Playwright
// cannot collect it.
import {
  meetNameTokens, parseMeetDay, resolveMeetKey, mergeSwimLists,
} from '../../src/utils/meetKey.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

// ── 1. the stored date shapes ─────────────────────────────────────────────
console.log('1. parsing "which day does this meet start"');
check('USAS range', JSON.stringify(parseMeetDay('Oct 24 - Oct 25')) === '{"month":10,"day":24}', parseMeetDay('Oct 24 - Oct 25'));
check('USAS single day, zero-padded', JSON.stringify(parseMeetDay('Oct 09')) === '{"month":10,"day":9}', parseMeetDay('Oct 09'));
check('ISO from the PVS importer', JSON.stringify(parseMeetDay('2026-10-24')) === '{"month":10,"day":24}', parseMeetDay('2026-10-24'));
check('nothing → null', parseMeetDay('') === null && parseMeetDay(null) === null);
check('junk → null', parseMeetDay('sometime in the fall') === null, parseMeetDay('sometime in the fall'));
check('an unknown month name → null', parseMeetDay('Xyz 24') === null, parseMeetDay('Xyz 24'));

// ── 2. which words identify a meet ────────────────────────────────────────
console.log('2. name tokens');
check('drops boilerplate and the year', meetNameTokens('2026 PV MAKO Pink Ribbon Invitational').join() === 'mako,pink,ribbon', meetNameTokens('2026 PV MAKO Pink Ribbon Invitational'));
check('keeps the venue words', meetNameTokens('PV October Open- CLAUDE MOORE SITE').join() === 'october,claude,moore', meetNameTokens('PV October Open- CLAUDE MOORE SITE'));
check('two records of the same meet share two words', meetNameTokens('2026 PV MAKO Pink Ribbon Invitational').filter((t) => meetNameTokens('MAKO PINK RIBBON INVITATIONAL').includes(t)).length === 3);

// ── 3. resolving the key ──────────────────────────────────────────────────
console.log('3. resolving a meet key');
const PVS_MAKO = {
  meetName: 'MAKO PINK RIBBON INVITATIONAL', meetDates: 'Oct 24 - Oct 25',
  courseCode: 'SCY', season: '2026/2027', status: 'ok',
  source: 'pvs', fetchedAt: '2026-10-30T17:37:34.948Z',
  swims: [
    { eventCode: '100 FR SCY', swimTime: '1:15.64', finishPosition: 130 },
    { eventCode: '200 BK SCY', swimTime: null, status: 'dq', dqCode: '2C', source: 'pvs' },
  ],
};
const stored = { 'pvs-27-26': PVS_MAKO, '289349': { meetName: '2026 PV October Open - Claude Moore', meetDates: 'Oct 09 - Oct 11', status: 'ok', swims: [] } };
const usasMako = { meetId: '288848', meetName: '2026 PV MAKO Pink Ribbon Invitational', meetDates: 'Oct 24 - Oct 25' };

const hit = resolveMeetKey(usasMako, stored);
check('the same meet under two keys is found', hit.existing === PVS_MAKO, Boolean(hit.existing));
check('the record keeps the canonical USAS key', hit.key === '288848', hit.key);
check('the PVS key is queued for deletion', hit.dropKey === 'pvs-27-26', hit.dropKey);

check('a different meet on the same day is not merged', resolveMeetKey(
  { meetId: '999', meetName: '2026 PV MAKO Pink Ribbon Invitational', meetDates: 'Oct 26 - Oct 27' }, stored,
).existing === null);
check('the same words on different days are not merged', resolveMeetKey(
  { meetId: '999', meetName: '2026 PV October Open - Claude Moore', meetDates: 'Oct 24 - Oct 25' }, stored,
).existing === null);
check('an unknown meet creates its own key', resolveMeetKey(
  { meetId: '777', meetName: '2027 PV January Open', meetDates: 'Jan 17 - Jan 18' }, stored,
)?.key === '777');

const exact = resolveMeetKey({ meetId: '289349', meetName: '2026 PV October Open - Claude Moore', meetDates: 'Oct 09 - Oct 11' }, stored);
check('a key that is already right is left alone', exact.key === '289349' && exact.dropKey === null && exact.existing === stored['289349'], exact.dropKey);
check('no stored meets → nothing to merge', resolveMeetKey(usasMako, undefined).existing === null);

// ── 4. merging the swims ──────────────────────────────────────────────────
console.log('4. merging fetched and stored swims');
const fetched = [
  { eventCode: '100 FR SCY', swimTime: '1:15.64', finishPosition: 130 },
  { eventCode: '50 FL SCY', swimTime: '40.26', finishPosition: 154 },
];
const merged = mergeSwimLists(fetched, PVS_MAKO.swims);
check('the USAS rows come through', merged.length === 3, merged.length);
check('the PVS-only DQ survives', merged.some((s) => s.status === 'dq' && s.dqCode === '2C'), merged);
check('a stored row that USAS also returned is not duplicated', merged.filter((s) => s.eventCode === '100 FR SCY').length === 1, merged);
check('the stored DQ keeps its source tag', merged.find((s) => s.status === 'dq')?.source === 'pvs');

const staleUsas = [{ eventCode: '50 FL SCY', swimTime: '41.00' }];
check('stored non-PVS rows are replaced, not kept', mergeSwimLists([], staleUsas).length === 0, mergeSwimLists([], staleUsas));
check('an empty fetch still keeps the DQ', mergeSwimLists([], PVS_MAKO.swims).length === 1, mergeSwimLists([], PVS_MAKO.swims));
check('no stored swims -> the fetched rows, unchanged', JSON.stringify(mergeSwimLists(fetched, undefined)) === JSON.stringify(fetched), mergeSwimLists(fetched, undefined));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

