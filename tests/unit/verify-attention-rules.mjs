// Unit checks for src/utils/registrationCompleteness.js — the Needs Attention
// engine behind the coach dashboard. Pure logic: no network, no Firestore, no DOM.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it — `npm test`
// stays the emulator + browser E2E suite.
import { auditRegistration, sortByAttentionSeverity, partitionAttention, attentionCounts, attentionSeverity, ATTENTION_SEVERITY, looksLikeEmail, ageInYears, ADULT_SWIMMER_AGE } from '../../src/utils/registrationCompleteness.js';

let pass = 0;
let fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ` -> ${JSON.stringify(detail)}` : ''}`); }
}

const baseSwimmer = { firstName: 'A', lastName: 'B', gender: 'F', dob: '2015-01-01', usaSwimmingId: '1234' };
const complete = {
  parent: { firstName: 'P', lastName: 'Q', gender: 'F', phone: '5551234567', address: '1 St', email: 'p@q.com' },
  parentEmails: ['p@q.com'],
  swimmers: [baseSwimmer],
  emergencyContact: { name: 'E', phone: '5559998888' },
};

console.log('1. fully complete family');
let a = auditRegistration(complete);
check('no required', a.required.length === 0, a.required);
check('no conflicts', a.conflicts.length === 0, a.conflicts);
check('no optional gaps', a.optionalGaps.length === 0, a.optionalGaps);

console.log('2. USA Swimming ID missing only -> Recommended, not required');
a = auditRegistration({ ...complete, swimmers: [{ ...baseSwimmer, usaSwimmingId: '' }] });
check('required empty', a.required.length === 0, a.required);
check('optional has usaSwimmingId', a.optionalGaps.some((g) => g.field === 'usaSwimmingId'), a.optionalGaps);

console.log('3. soft-deleted swimmers excluded');
a = auditRegistration({ ...complete, swimmers: [{ ...baseSwimmer, deleted: true }] });
check('family activeSwimmers required', a.required.some((r) => r.scope === 'family' && r.field === 'activeSwimmers'), a.required);
check('deleted swimmer not audited', !a.required.some((r) => r.scope === 'swimmer'), a.required);
a = auditRegistration({ ...complete, swimmers: [baseSwimmer, { ...baseSwimmer, deleted: true, dob: '' }] });
check('deleted swimmer dob gap ignored', !a.required.some((r) => r.scope === 'swimmer' && r.field === 'dob'), a.required);

console.log('4. spouse checks only when spouse object exists');
a = auditRegistration(complete);
check('no spouse requirements', !a.required.some((r) => r.scope === 'spouse'), a.required);
a = auditRegistration({ ...complete, spouse: { firstName: 'S', lastName: 'Q', gender: 'M' } });
check('complete spouse ok', !a.required.some((r) => r.scope === 'spouse'), a.required);
a = auditRegistration({ ...complete, spouse: { firstName: 'S', lastName: 'Q', gender: '' } });
check('spouse gender required', a.required.some((r) => r.scope === 'spouse' && r.field === 'gender'), a.required);
check('spouse phone optional', a.optionalGaps.some((g) => g.scope === 'spouse' && g.field === 'phone'), a.optionalGaps);

console.log('5. parent.email is NOT required (option B)');
a = auditRegistration({ ...complete, parent: { ...complete.parent, email: '' } });
check('email not in required', !a.required.some((r) => r.scope === 'parent' && r.field === 'email'), a.required);
check('parent_email_missing conflict', a.conflicts.some((c) => c.type === 'parent_email_missing'), a.conflicts);

console.log('6. parentEmails consistency');
a = auditRegistration({ ...complete, parentEmails: [] });
check('parent_emails_missing conflict', a.conflicts.some((c) => c.type === 'parent_emails_missing'), a.conflicts);
a = auditRegistration({ ...complete, parentEmails: ['other@x.com'] });
check('parent_email_not_in_parent_emails', a.conflicts.some((c) => c.type === 'parent_email_not_in_parent_emails'), a.conflicts);
a = auditRegistration(complete, { authEmail: 'different@x.com' });
check('parent_email_mismatch_auth', a.conflicts.some((c) => c.type === 'parent_email_mismatch_auth'), a.conflicts);
a = auditRegistration(complete, { authEmail: 'P@Q.com' });
check('auth email normalized (no mismatch)', !a.conflicts.some((c) => c.type === 'parent_email_mismatch_auth'), a.conflicts);

console.log('7. conflicts separated from missing');
a = auditRegistration({ ...complete, emergencyContact: { name: 'P Q', phone: '5551234567' } });
check('emergency_name_same_as_parent', a.conflicts.some((c) => c.type === 'emergency_name_same_as_parent'), a.conflicts);
check('emergency_phone_same_as_parent', a.conflicts.some((c) => c.type === 'emergency_phone_same_as_parent'), a.conflicts);
check('nothing marked required', a.required.length === 0, a.required);
a = auditRegistration({ ...complete, spouse: { ...complete.spouse, firstName: 'P', lastName: 'Q', gender: 'M', email: 'p@q.com' } });
check('spouse_name_same_as_parent', a.conflicts.some((c) => c.type === 'spouse_name_same_as_parent'), a.conflicts);
check('spouse_email_same_as_parent', a.conflicts.some((c) => c.type === 'spouse_email_same_as_parent'), a.conflicts);

console.log('8. parent object missing entirely');
a = auditRegistration({ ...complete, parent: null });
check('parent __missing__ required', a.required.some((r) => r.scope === 'parent' && r.field === '__missing__'), a.required);

console.log('9. every emitted field has an i18n label key');
const { readFileSync } = await import('node:fs');
const i18n = readFileSync(new URL('../../src/utils/i18n.js', import.meta.url), 'utf8');
const requiredKeys = [
  'dash_attn_parent_missing', 'dash_attn_emergency_missing',
  'dash_attn_parent_first', 'dash_attn_parent_last', 'dash_attn_parent_gender',
  'dash_attn_parent_phone', 'dash_attn_parent_address',
  'dash_attn_emergency_name', 'dash_attn_emergency_phone',
  'dash_attn_swimmer_first', 'dash_attn_swimmer_last', 'dash_attn_gender',
  'dash_attn_dob', 'dash_attn_usa_id',
  'dash_attn_spouse_first', 'dash_attn_spouse_last', 'dash_attn_spouse_gender',
  'dash_attn_spouse_phone', 'dash_attn_spouse_email',
  'dash_attn_no_active_swimmers', 'dash_attn_scope_parent', 'dash_attn_scope_swimmer',
  'dash_attn_scope_emergency', 'dash_attn_scope_spouse', 'dash_attn_scope_family',
  'dash_attn_scope_other', 'dash_attn_summary', 'dash_attn_required',
  'dash_attn_conflicts', 'dash_attn_optional',
  'dash_attn_conflict_emergency_name_same', 'dash_attn_conflict_emergency_phone_same',
  'dash_attn_conflict_spouse_name_same', 'dash_attn_conflict_spouse_email_same',
  'dash_attn_conflict_parent_email_missing', 'dash_attn_conflict_parent_emails_missing',
  'dash_attn_conflict_parent_email_not_in_parent_emails',
  'dash_attn_conflict_parent_email_mismatch_auth', 'dash_attn_conflict_unknown',
];
const missingKeys = requiredKeys.filter((k) => !new RegExp(`\\b${k}:`).test(i18n));
check('all i18n keys present', missingKeys.length === 0, missingKeys);

console.log('10. severity ordering + never hiding actionable rows');

// Reproduces the production bug: registrations arrive newest-first, and the
// single conflicted family happens to be the OLDEST of the attention set.
const newerOptional = (n) => ({
  regId: `opt-${n}`,
  name: `Optional ${n}`,
  audit: auditRegistration({ ...complete, swimmers: [{ ...baseSwimmer, usaSwimmingId: '' }] }),
});
const conflictFamily = {
  regId: 'conflict',
  name: 'Lisa Zhao',
  audit: auditRegistration({ ...complete, emergencyContact: { name: 'P Q', phone: '5551234567' } }),
};
// newest first: 5 optional-only, then the conflicted family last
const incoming = [...[1, 2, 3, 4, 5].map(newerOptional), conflictFamily];

check('conflict family sorts ahead of all optional-only', (() => {
  const sorted = sortByAttentionSeverity(incoming);
  return sorted[0].regId === 'conflict'
    && sorted.slice(1).every((i) => i.regId !== 'conflict');
})());

const view = partitionAttention(sortByAttentionSeverity(incoming));
check('conflict family is in the visible set', view.visible.some((i) => i.regId === 'conflict'), view.visible.map((i) => i.regId));
check('visible is capped for optional-only tail', view.visible.length === 6, view.visible.length);
check('nothing hidden when optional-only fits the cap', view.hiddenOptionalCount === 0, view.hiddenOptionalCount);
check('actionableCount', view.actionableCount === 1, view.actionableCount);

// The old behaviour: slice(0,5) of the unsorted list dropped the conflict row.
const oldBehaviour = incoming.slice(0, 5);
check('regression guard: unsorted slice WOULD have hidden it',
  !oldBehaviour.some((i) => i.regId === 'conflict'));

// Incoming order preserved inside a bucket (stable, explicit index tiebreak)
const twoOptional = [newerOptional(1), newerOptional(2)];
const stable = sortByAttentionSeverity(twoOptional);
check('equal severity keeps incoming order', stable[0].regId === 'opt-1' && stable[1].regId === 'opt-2');

// Required outranks conflicts
const requiredFamily = { regId: 'req', name: 'Req', audit: auditRegistration({ ...complete, parent: null }) };
const ranked = sortByAttentionSeverity([conflictFamily, requiredFamily, newerOptional(9)]);
check('required > conflicts > optional', ranked.map((i) => i.regId).join(',') === 'req,conflict,opt-9', ranked.map((i) => i.regId));

// Nothing actionable may ever be truncated, even far past the cap
const manyActionable = [
  ...[1, 2, 3, 4, 5, 6, 7].map(newerOptional),
  ...Array.from({ length: 4 }, (_, i) => ({ regId: `conf-${i}`, name: `C${i}`, audit: conflictFamily.audit })),
];
const v2 = partitionAttention(sortByAttentionSeverity(manyActionable));
check('all 4 conflicts visible despite optional cap', v2.visible.filter((i) => i.regId.startsWith('conf-')).length === 4, v2.visible.map((i) => i.regId));
check('hidden are all optional-only', v2.hiddenOptionalCount === 2, v2.hiddenOptionalCount);

console.log('11. summary counts are one bucket per family (no double counting)');
const both = {
  regId: 'both', name: 'Both',
  audit: auditRegistration({ ...complete, parentEmails: [], emergencyContact: { name: 'P Q', phone: '5551234567' }, swimmers: [{ ...baseSwimmer, usaSwimmingId: '' }] }),
};
check('family with conflicts+optional counts once, as conflicts', (() => {
  const c = attentionCounts([both]);
  return c.conflicts === 1 && c.optional === 0 && c.required === 0;
})(), attentionCounts([both]));
const allThree = attentionCounts([
  { audit: auditRegistration({ ...complete, parent: null }) },
  conflictFamily,
  newerOptional(1),
]);
check('counts sum to family total', allThree.required + allThree.conflicts + allThree.optional === 3, allThree);
check('severity constants ordered', ATTENTION_SEVERITY.REQUIRED < ATTENTION_SEVERITY.CONFLICTS && ATTENTION_SEVERITY.CONFLICTS < ATTENTION_SEVERITY.OPTIONAL);

console.log('12. new i18n keys present');
const newKeys = ['dash_attn_more_optional', 'dash_attn_summary'];
const missingNew = newKeys.filter((k) => !new RegExp(`\\b${k}:`).test(i18n));
check('more_optional + summary keys present', missingNew.length === 0, missingNew);

console.log('13. value sanity — email typed into the address field');
const withParent = (patch) => auditRegistration({ ...complete, parent: { ...complete.parent, ...patch } });
check('email in address flagged',
  withParent({ address: 'xuan.kamil@gmail.com' }).conflicts.some((c) => c.type === 'address_looks_like_email'));
check('normal street address not flagged',
  !withParent({ address: '123 Main St, Portland, OR 97201' }).conflicts.some((c) => c.type === 'address_looks_like_email'));
check('"Corner @ Oak Ave" not flagged (no domain)', !looksLikeEmail('Corner @ Oak Ave'));
check('conflict carries the offending value', (() => {
  const c = withParent({ address: 'a@b.com' }).conflicts.find((x) => x.type === 'address_looks_like_email');
  return c && c.address === 'a@b.com';
})());

console.log('14. value sanity — swimmer entered as the account holder');
const HOLDER = { firstName: 'Xuan', lastName: 'Zhou' };
const withHolder = (swimmer, opts = {}, extra = {}) => auditRegistration({
  ...complete,
  parent: { ...complete.parent, ...HOLDER, address: '1 St' },
  swimmers: [swimmer],
  ...extra,
}, opts);
const conv = (t2) => (a) => a.conflicts.some((c) => c.type === t2);
check('exact name match flagged',
  conv('swimmer_is_account_holder')(withHolder({ firstName: 'Xuan', lastName: 'Zhou', gender: 'female', dob: '1983-08-01' })));
check('case/whitespace variant flagged',
  conv('swimmer_is_account_holder')(withHolder({ firstName: '  xuan ', lastName: 'ZHOU', gender: 'female', dob: '1983-08-01' })));
check('punctuation variant flagged',
  conv('swimmer_is_account_holder')(withHolder({ firstName: 'Xuan', lastName: 'Zhou.', gender: 'female', dob: '1983-08-01' })));
check('conflict carries swimmer name + index', (() => {
  const c = withHolder({ firstName: 'Xuan', lastName: 'Zhou', gender: 'female', dob: '1983-08-01' })
    .conflicts.find((x) => x.type === 'swimmer_is_account_holder');
  return c && c.swimmerName === 'Xuan Zhou' && c.swimmerIndex === 0;
})());
check('child sharing ONLY the surname NOT flagged', (() => {
  const a = withHolder({ firstName: 'Nathan', lastName: 'Zhou', gender: 'male', dob: '2015-01-01' });
  return !a.conflicts.some((c) => c.type.startsWith('swimmer_is'));
})());

console.log('15. FP guard — the 10 real same-surname families must never be flagged');
const REAL_SAME_SURNAME = [
  ['Eric Zhang', 'Nathan Zhang'], ['Ram Seelam', 'Ridhi Seelam'],
  ['Keke Chen', 'Haoran Chen'], ['Keke Chen', 'Luo-han Chen'],
  ['Tong Zhang', 'Jake Zhang'], ['George Tao', 'Charlene Tao'],
  ['George Tao', 'Patrick Tao'], ['Mina Kim', 'Aden Kim'],
  ['Grace Wang', 'Evelyn Wang'], ['Grace Wang', 'Damon Wang'],
];
const falsePositives = [];
for (const [parentFull, swimmerFull] of REAL_SAME_SURNAME) {
  const [pf, pl] = parentFull.split(' ');
  const [sf, sl] = swimmerFull.split(' ');
  const a = auditRegistration({
    ...complete,
    parent: { ...complete.parent, firstName: pf, lastName: pl },
    swimmers: [{ firstName: sf, lastName: sl, gender: 'female', dob: '2014-01-01' }],
  });
  if (a.conflicts.some((c) => c.type.startsWith('swimmer_is'))) falsePositives.push(`${parentFull} -> ${swimmerFull}`);
}
check('none of the 10 flagged', falsePositives.length === 0, falsePositives);

console.log('16. value sanity — spouse match, adult swimmers, and the 30-year line');
const NOW = new Date('2026-09-20T12:00:00Z');
check('swimmer matching the spouse flagged', (() => {
  const a = auditRegistration({
    ...complete,
    spouse: { firstName: 'Lisa', lastName: 'Kamil', gender: 'female', email: 'l@k.com' },
    swimmers: [{ firstName: 'Lisa', lastName: 'Kamil', gender: 'female', dob: '1985-01-01' }],
  }, { now: NOW });
  return a.conflicts.some((c) => c.type === 'swimmer_is_spouse');
})());
check('adult with an unrelated name flagged as adult',
  conv('swimmer_is_adult')(withHolder({ firstName: 'Robert', lastName: 'Zhou', gender: 'male', dob: '1990-01-01' }, { now: NOW })));
check('age 29 is not an adult',
  !conv('swimmer_is_adult')(withHolder({ firstName: 'Robert', lastName: 'Zhou', gender: 'male', dob: '1997-01-01' }, { now: NOW })));
check('age 30 exactly is an adult',
  conv('swimmer_is_adult')(withHolder({ firstName: 'Robert', lastName: 'Zhou', gender: 'male', dob: '1996-06-01' }, { now: NOW })));
check('turns 30 later this year -> still 29',
  !conv('swimmer_is_adult')(withHolder({ firstName: 'Robert', lastName: 'Zhou', gender: 'male', dob: '1996-12-01' }, { now: NOW })));
check('threshold constant is 30', ADULT_SWIMMER_AGE === 30, ADULT_SWIMMER_AGE);
check('ageInYears handles empty/invalid dob', ageInYears('') === null && ageInYears('not-a-date') === null);
check('ageInYears birthday not yet reached this year', ageInYears('1996-12-01', NOW) === 29);

console.log('17. holder match is not double-reported as adult (one clear reason per swimmer)');
check('holder + adult reports only the holder conflict', (() => {
  const a = withHolder({ firstName: 'Xuan', lastName: 'Zhou', gender: 'female', dob: '1983-08-01' }, { now: NOW });
  return conv('swimmer_is_account_holder')(a) && !conv('swimmer_is_adult')(a);
})());
check('same-name MINOR is flagged for verification but not as adult', (() => {
  const a = withHolder({ firstName: 'Xuan', lastName: 'Zhou', gender: 'female', dob: '2015-01-01' }, { now: NOW });
  return conv('swimmer_is_account_holder')(a) && !conv('swimmer_is_adult')(a);
})());

console.log('18. the real production record produces both signals');
const XUAN = {
  parent: {
    firstName: 'Xuan', lastName: 'Zhou', middleName: null, gender: 'female',
    phone: '(703) 347-5592', email: 'xuan.kamil@gmail.com', address: 'xuan.kamil@gmail.com',
  },
  parentEmails: ['xuan.kamil@gmail.com'],
  spouse: null,
  emergencyContact: { name: 'Julian Kamil', phone: '7038321255' },
  swimmers: [{
    firstName: 'Xuan', lastName: 'Zhou', middleName: null, gender: 'female',
    dob: '1983-08-01', usaSwimmingId: null, joinDate: null,
  }],
};
const xuanAudit = auditRegistration(XUAN, { now: NOW });
check('address email flagged', conv('address_looks_like_email')(xuanAudit));
check('account-holder swimmer flagged', conv('swimmer_is_account_holder')(xuanAudit));
check('still no required-missing', xuanAudit.required.length === 0, xuanAudit.required);
check('both land in the Needs verification bucket, not Recommended',
  xuanAudit.conflicts.length === 2 && attentionSeverity(xuanAudit) === ATTENTION_SEVERITY.CONFLICTS,
  xuanAudit.conflicts);

console.log('19. every new conflict type has a dashboard label + form message');
const newI18n = [
  'dash_attn_conflict_address_email', 'dash_attn_conflict_swimmer_is_holder',
  'dash_attn_conflict_swimmer_is_spouse', 'dash_attn_conflict_swimmer_is_adult',
  'reg_err_address_email', 'reg_err_swimmer_is_holder', 'reg_err_swimmer_is_spouse',
];
const missingI18n = newI18n.filter((k) => !new RegExp(`\\b${k}:`).test(i18n));
check('all new i18n keys present', missingI18n.length === 0, missingI18n);
check('reg_conflict_error still contains "account holder" (asserted by tests/register.spec.js)',
  /reg_conflict_error: '[^']*account holder/.test(i18n));
const dashSrc = readFileSync(new URL('../../src/pages/dashboard.js', import.meta.url), 'utf8');
const missingLabels = ['address_looks_like_email', 'swimmer_is_account_holder', 'swimmer_is_spouse', 'swimmer_is_adult']
  .filter((ty) => !new RegExp(`\\b${ty}:`).test(dashSrc));
check('dashboard maps every new type to a label key', missingLabels.length === 0, missingLabels);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
