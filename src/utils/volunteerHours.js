/**
 * Volunteer Hours — pure helpers for the coach-side volunteer tracker.
 *
 * ── Model ───────────────────────────────────────────────────────────────────
 * Collection `volunteerHours`, ONE document per (meet, family):
 *
 *   id = `${meetId}_${familyId}`          (deterministic → idempotent setDoc merge)
 *   { meetId, meetName, season,
 *     familyId, familyLabel, parentEmails,
 *     hours, note,
 *     updatedAt, updatedBy, updatedByEmail }
 *
 * One value per family per meet ("the Chens did 4.5 hours at Meet X"), matching
 * how the team actually tracks it — dad and mom are interchangeable on the
 * sign-up sheet, so the hour is the family's.
 *
 * Why this shape:
 *   - deterministic id  → saving is `setDoc(..., {merge:true})`, so re-saving a
 *     row can never double-count, and correcting one family touches one doc;
 *   - one equality query (`where season ==`) reads a whole season, which needs
 *     no composite index;
 *   - `meetName` / `season` / `familyLabel` / `parentEmails` are snapshots so a
 *     renamed meet, a re-seasons meet, or a deleted registration still reads
 *     sensibly. The LIVE meet wins when it still exists (see buildVolunteerSummary).
 *
 * ── Why everything here is pure ─────────────────────────────────────────────
 * The dashboard, the emulator tests and the read-only audit script
 * (execution/audit_volunteer_hours.mjs) must agree on what "this family's season
 * total" means. Keeping the aggregation in one importable module is the same
 * reason src/utils/registrationCompleteness.js exists.
 *
 * NOT done here on purpose: matching a family to a meet's Hy-Tek fee report by
 * swimmer name. Live data has 10+ families sharing a surname, and this repo
 * already learned that fuzzy/surname matching produces false positives (see
 * .tmp/handoff-2026-09-20-needs-attention.md). The entry table is searchable
 * instead.
 */

import { normalizeSortKey } from './swimmerSort.js';

/** Firestore collection holding the per-(meet, family) hour records. */
export const VOLUNTEER_COLLECTION = 'volunteerHours';

/** Round to 2 decimals — hour inputs are 0.25/0.5-step values, not floats. */
export function roundHours(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/**
 * Deterministic document id for one family's hours at one meet.
 * Firestore ids may not contain "/", and both halves are Firestore ids already.
 */
export function volunteerDocId(meetId, familyId) {
  return `${meetId}_${familyId}`;
}

/**
 * Normalize an hours input. Returns a rounded number, or null when the value is
 * blank/unusable (which the caller must distinguish from 0 — null means "not
 * recorded", not "zero hours").
 */
export function normalizeHours(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return roundHours(n);
}

/** "Keke Chen" from { firstName, lastName }. Blank when the person is missing. */
export function personName(person) {
  if (!person) return '';
  return [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
}

/**
 * Family label for the tables: both parents when both are registered
 * ("Keke Chen & Fan Luo"), one when the spouse fields were never filled in.
 */
export function familyLabel(registration) {
  const names = [personName(registration?.parent), personName(registration?.spouse)].filter(Boolean);
  // Dedupe: a family that typed the same person into both slots must not read
  // "Keke Chen & Keke Chen".
  return [...new Set(names)].join(' & ');
}

/**
 * Surname sort key for a family. Falls back to the spouse's surname so a family
 * whose `parent.lastName` is empty still lands next to the right neighbours.
 */
export function familySortKey(registration) {
  const last = normalizeSortKey(registration?.parent?.lastName) || normalizeSortKey(registration?.spouse?.lastName);
  const first = normalizeSortKey(registration?.parent?.firstName);
  return `${last}\u0000${first}`;
}

/** Swimmers that count — soft-deleted entries do not. */
export function activeSwimmers(registration) {
  return (registration?.swimmers || []).filter((s) => s && !s.deleted);
}

/** "Keke Chen Jr." from one swimmer entry. */
export function swimmerDisplayName(swimmer) {
  if (!swimmer) return '';
  const full = [swimmer.firstName, swimmer.lastName].filter(Boolean).join(' ').trim();
  return full || String(swimmer.name || '').trim();
}

/**
 * Every email that can reach this registration, lowercased and deduped (the same
 * rule registration.js applies to `parentEmails`: a shared address must never
 * appear twice). Used for the search box and for the snapshot written on save.
 */
export function familyEmails(registration) {
  return [
    ...new Set(
      [registration?.parent?.email, registration?.spouse?.email, ...(registration?.parentEmails || [])]
        .map((e) => String(e || '').toLowerCase().trim())
        .filter(Boolean)
    ),
  ];
}

/** Lowercased blob the entry table's search box matches against. */
export function familySearchBlob(registration) {
  return [
    familyLabel(registration),
    personName(registration?.parent),
    personName(registration?.spouse),
    ...activeSwimmers(registration).map(swimmerDisplayName),
    ...familyEmails(registration),
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * One row per registered family, families without active swimmers included
 * (they still owe volunteer hours, and hiding them is how a family goes missing).
 * @returns {Array<{familyId,label,sortKey,kids,kidCount,emails,search}>}
 */
export function listVolunteerFamilies(registrations) {
  return (registrations || [])
    .filter((reg) => reg && reg.id)
    .map((reg) => {
      const kids = activeSwimmers(reg).map(swimmerDisplayName).filter(Boolean);
      return {
        familyId: reg.id,
        label: familyLabel(reg),
        sortKey: familySortKey(reg),
        kids,
        kidCount: kids.length,
        emails: familyEmails(reg),
        search: familySearchBlob(reg),
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.label.localeCompare(b.label));
}

/**
 * Season summary: one row per family with a `?` season total.
 *
 * A record's season comes from its LIVE meet when that meet still exists (so an
 * admin re-seasons a meet and the hours follow it), and from the stored snapshot
 * when the meet is gone (so a deleted meet does not silently erase history).
 *
 * @param {Object}   params
 * @param {Array}    params.meets          - meet docs ({id, name, season, startDate, …})
 * @param {Array}    params.registrations  - registration docs (id = familyId)
 * @param {Array}    params.hours          - volunteerHours docs
 * @param {string}   params.season
 * @param {Function} params.meetSeasonOf   - (meet) => season, injected so this
 *                                           module does not re-implement getMeetSeason
 * @returns {Array<{familyId,label,sortKey,kidCount,kids,totalHours,meetCount,meets}>}
 */
export function buildVolunteerSummary({ meets, registrations, hours, season, meetSeasonOf }) {
  const meetById = new Map((meets || []).map((m) => [m.id, m]));
  const regById = new Map((registrations || []).map((r) => [r.id, r]));
  const seasonOf = typeof meetSeasonOf === 'function' ? meetSeasonOf : (m) => m?.season || null;

  // ── Aggregate the season's hours per family ──
  const byFamily = new Map();
  for (const rec of hours || []) {
    if (!rec || !rec.familyId) continue;

    const meet = rec.meetId ? meetById.get(rec.meetId) : null;
    const recSeason = meet ? (seasonOf(meet) || rec.season) : rec.season;
    if (recSeason !== season) continue;

    if (!byFamily.has(rec.familyId)) {
      byFamily.set(rec.familyId, { totalHours: 0, meets: [], label: rec.familyLabel || '' });
    }
    const agg = byFamily.get(rec.familyId);
    const h = normalizeHours(rec.hours) ?? 0;
    agg.totalHours += h;
    agg.meets.push({
      meetId: rec.meetId || '',
      meetName: (meet && meet.name) || rec.meetName || 'Unnamed Meet',
      startDate: (meet && (meet.startDate || meet.date)) || rec.startDate || '',
      hours: h,
      note: rec.note || '',
    });
  }

  // ── Rows: every registration (0-hour families included), plus families that
  //    survive only as an hour snapshot because their registration was deleted ──
  const ids = new Set([...(registrations || []).map((r) => r.id), ...byFamily.keys()]);
  const rows = [];

  for (const familyId of ids) {
    const reg = regById.get(familyId);
    const agg = byFamily.get(familyId) || { totalHours: 0, meets: [], label: '' };
    if (!reg && agg.meets.length === 0) continue; // nothing to say about a family that no longer exists

    const kids = reg ? activeSwimmers(reg).map(swimmerDisplayName).filter(Boolean) : [];
    const meets = agg.meets
      .slice()
      .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)) || a.meetName.localeCompare(b.meetName));

    rows.push({
      familyId,
      label: (reg && familyLabel(reg)) || agg.label || '—',
      sortKey: reg ? familySortKey(reg) : '',
      kidCount: kids.length,
      kids,
      totalHours: roundHours(agg.totalHours),
      meetCount: new Set(meets.map((m) => m.meetId)).size,
      meets,
    });
  }

  rows.sort((a, b) => (a.sortKey || a.label).localeCompare(b.sortKey || b.label) || a.label.localeCompare(b.label));
  return rows;
}

/**
 * Entry table rows for ONE meet: every family, with its recorded hours for that
 * meet (null = nothing recorded). Families that only exist as a stale record are
 * still listed so their hours stay editable.
 *
 * @returns {Array<{familyId,label,kids,kidCount,search,hours,note,updatedBy,updatedAt,hasRecord}>}
 */
export function buildMeetEntryRows({ registrations, hours, meetId }) {
  const recordByFamily = new Map();
  for (const rec of hours || []) {
    if (rec && rec.meetId === meetId && rec.familyId) recordByFamily.set(rec.familyId, rec);
  }

  const families = listVolunteerFamilies(registrations);
  const known = new Set(families.map((f) => f.familyId));
  for (const [familyId, rec] of recordByFamily) {
    if (!known.has(familyId)) {
      families.push({
        familyId,
        label: rec.familyLabel || '—',
        sortKey: '',
        kids: [],
        kidCount: 0,
        emails: [],
        search: String(rec.familyLabel || '').toLowerCase(),
      });
    }
  }

  return families
    .map((f) => {
      const rec = recordByFamily.get(f.familyId);
      return {
        ...f,
        hours: rec ? normalizeHours(rec.hours) : null,
        note: (rec && rec.note) || '',
        updatedBy: (rec && (rec.updatedBy || rec.updatedByEmail)) || '',
        updatedAt: (rec && rec.updatedAt) || null,
        // "Has a record" means it carries HOURS — that is what the entry table's
        // "only families with hours" filter promises. A note-only row (e.g. "out
        // of town, no hours") is still stored, just not matched by that filter.
        hasRecord: !!rec && normalizeHours(rec.hours) != null,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.label.localeCompare(b.label));
}

/**
 * Total hours recorded for one meet. Malformed records without a `familyId` are
 * ignored, exactly as buildVolunteerSummary ignores them — otherwise a stray doc
 * would inflate the meet footer without ever appearing in the season summary.
 */
export function meetTotalHours(hours, meetId) {
  return roundHours(
    (hours || [])
      .filter((rec) => rec && rec.meetId === meetId && rec.familyId)
      .reduce((sum, rec) => sum + (normalizeHours(rec.hours) ?? 0), 0)
  );
}

/** Season-wide stats for the tab's stat cards. */
export function volunteerStats(rows) {
  const totals = rows || [];
  const withHours = totals.filter((r) => r.totalHours > 0);
  return {
    familyCount: totals.length,
    familiesWithHours: withHours.length,
    familiesWithoutHours: totals.length - withHours.length,
    totalHours: roundHours(totals.reduce((sum, r) => sum + r.totalHours, 0)),
    meetCount: new Set(totals.flatMap((r) => r.meets.map((m) => m.meetId)).filter(Boolean)).size,
  };
}

// ── CSV ─────────────────────────────────────────────────────────────────────

/** RFC-4180 quoting: wrap every field, double any embedded quote. */
export function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function csvFromRows(header, rows) {
  return [header.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n');
}

/**
 * Family-level season summary — the "final summary table" as a spreadsheet.
 * Zero-hour families are included: "who has not volunteered yet" is the point.
 */
export function volunteerSummaryCSV(rows) {
  return csvFromRows(
    ['Parents', 'Kids', 'Kid Names', 'Meets', 'Total Hours'],
    (rows || []).map((r) => [
      r.label,
      r.kidCount,
      r.kids.join('; '),
      r.meetCount,
      r.totalHours,
    ])
  );
}

/** One row per (family, meet) — the audit trail behind the summary totals. */
export function volunteerDetailCSV(rows) {
  const body = [];
  for (const row of rows || []) {
    for (const m of row.meets) {
      body.push([row.label, m.meetName, m.startDate || '', m.hours, m.note || '', row.totalHours]);
    }
  }
  return csvFromRows(['Parents', 'Meet', 'Date', 'Hours', 'Note', 'Family Season Total'], body);
}
