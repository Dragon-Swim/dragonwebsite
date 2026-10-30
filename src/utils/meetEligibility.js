/**
 * Meet entry eligibility — pure logic, no DOM / no Firestore.
 *
 * A meet document may carry a flat `events` table (one row per
 * eventNo × ageGroup × gender). This module answers, for one swimmer:
 *
 *   1. What age group do they swim as on meet day?      (ageOnMeetDay)
 *   2. Which events may they enter?                     (buildMeetOptions)
 *   3. Does our recorded time meet the published line?  (evaluateEvent)
 *   4. Is the current selection legal?                  (validateSelection)
 *
 * Everything here is deterministic and unit-tested
 * (tests/unit/verify-meet-eligibility.mjs) because the numbers are what parents
 * will act on. Two rules that are easy to get wrong and are encoded below:
 *
 *   - **Age is taken on the first day of the meet**, not today. A swimmer who
 *     turns 13 on Dec 2 swims 13-14 in a Dec 10 meet, and their qualifying
 *     times are judged against that group's lines.
 *   - **"No Slower Than" is an upper bound on seconds.** A time qualifies when
 *     `seconds <= standard`, for the SAME course as the standard. A long-course
 *     time never gets compared to a short-course-yard line.
 *
 * Absent data must never look like a failure:
 *   - meet without `events`            → caller hides the entry UI entirely
 *   - event without a line for a course → that course is simply not considered
 *   - swimmer with no time on record    → state 'no-time', NOT 'too slow'
 */

export const COURSES = ['SCY', 'LCM'];

export const STROKE_NAMES = {
  FR: 'Free',
  BK: 'Back',
  BR: 'Breast',
  FL: 'Fly',
  IM: 'IM',
  MED: 'Medley Relay',
};

/** Parse a Data Hub / Hy-Tek time string ("1:12.49", "57.92") into seconds. */
export function parseSwimTimeText(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const str = String(value).trim();
  const mmss = /^(\d+):(\d{2}(?:\.\d+)?)$/.exec(str);
  if (mmss) return +mmss[1] * 60 + +mmss[2];
  const sec = Number(str);
  return Number.isFinite(sec) ? sec : null;
}

/** Seconds → display text: 57.92 → "57.92", 72.49 → "1:12.49". */
export function formatSwimSeconds(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return '—';
  if (seconds < 60) return seconds.toFixed(2);
  const mins = Math.floor(seconds / 60);
  return `${mins}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;
}

/** "100 BR SCY" → { distance:100, stroke:'BR', course:'SCY' }; unparsable → null. */
export function parseEventCode(eventCode) {
  const m = /^(\d+)\s+([A-Za-z]{2,4})\s+(SCY|LCM|SCM)$/i.exec(String(eventCode || '').trim());
  if (!m) return null;
  const stroke = m[2].toUpperCase();
  return { distance: +m[1], stroke, course: m[3].toUpperCase() };
}

/** Parse a 'YYYY-MM-DD' / Date / timestamp into a Date at local midnight. */
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && typeof value.toDate === 'function') return toDate(value.toDate());
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Whole years between `dob` and `onDate`.
 * Age is decremented until the birthday has passed — the same convention as
 * USA Swimming's "age attained on the first day of the meet".
 */
export function ageOnDate(dob, onDate) {
  const b = toDate(dob);
  const d = toDate(onDate);
  if (!b || !d) return null;
  let age = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) age--;
  return age;
}

/**
 * 本项目自己的年龄组标签约定(仅用于显示与老数据兜底)。
 *
 * 新数据(.ev3 导入)优先用 `groupLabelForAge()` 从**比赛自己的区间**取标签,
 * 因为每场比赛的年龄分区都不一样:
 *   27-41  RMSC        10&U / 11-12 / 12&U / 13-14 / Open(15-109 编码)
 *   27-29  PV Nov Open 9-10 / 11-12 / 13-14 / Open
 *   27-21  Loughmiller 8&U / 9-10 / 11-12 / 13&O(13-109,不分 13-14/Open)
 * 把标签写死会让后两场比赛完全报不了名 —— 所以判断一律走数值区间
 * (`isEventEnterable`),这个函数只在文档缺 `ageMin`/`ageMax` 时生效。
 */
export function ageGroupForMeetAge(age) {
  if (age == null || !Number.isFinite(age)) return null;
  if (age >= 15) return 'Open';
  if (age >= 13) return '13-14';
  if (age >= 11) return '11-12';
  return '10&U';
}

/**
 * 该年龄在本场比赛里属于哪个组 → 用于显示的标签。
 *
 * 取**包含该年龄、最窄的那个非开放区间**的标签(例:27-41 的 10 岁同时落在
 * 10&U(0-10) 与 12&U(0-12) 里,取更窄的 `10&U`)。没有任何区间命中时
 * (例如 15+ 只对上 Open,而 Open 是 open-to-all、不算"本组")回退到旧约定。
 */
export function groupLabelForAge(age, events = []) {
  if (age == null || !Number.isFinite(age)) return null;
  const hits = [];
  for (const e of events || []) {
    if (!Number.isFinite(e?.ageMin) || !Number.isFinite(e?.ageMax)) continue;
    if (e.openToAll === true) continue;
    if (age < e.ageMin || age > e.ageMax) continue;
    hits.push({ label: e.ageGroup, span: e.ageMax - e.ageMin, min: e.ageMin });
  }
  if (!hits.length) return ageGroupForMeetAge(age);
  hits.sort((a, b) => a.span - b.span || b.min - a.min);
  return hits[0].label;
}

/**
 * 这个年龄能不能报这一行项目。
 *
 * 新数据(带 `ageMin`/`ageMax`,来自 `.ev3` 导入)→ **按数值区间判断**:
 *   `ageMin <= age <= ageMax`,或该行标了 `openToAll`(赛程单原文
 *   "open events which are open to all ages")。
 * 老数据(没有区间,只有标签)→ 回退到原来的标签白名单,保证线上已有文档不变。
 */
export function isEventEnterable(event, { age, ageGroup } = {}) {
  const hasRange = Number.isFinite(event?.ageMin) && Number.isFinite(event?.ageMax);
  if (!hasRange) return enterableGroupsForAgeGroup(ageGroup).includes(event?.ageGroup);
  if (event.openToAll === true) return true;
  if (age == null || !Number.isFinite(age)) return false;
  return age >= event.ageMin && age <= event.ageMax;
}

/**
 * 旧标签白名单,**只在文档没有数值区间时使用**(以及单测里保留的约定)。
 * 10&U / 11-12 可报合并的 12&U;任何年龄可报 Open。
 */
export function enterableGroupsForAgeGroup(ageGroup) {
  if (!ageGroup) return [];
  if (ageGroup === 'Open') return ['Open'];
  if (ageGroup === '10&U' || ageGroup === '11-12') return [ageGroup, '12&U', 'Open'];
  return [ageGroup, 'Open'];
}

/**
 * Index an athlete's best times by course → "100 BR" → best entry.
 *
 * Only times inside the meet's qualifying window are indexed; anything older is
 * kept in `outOfWindow` so the UI can say "your 2023 time no longer counts"
 * instead of pretending the swimmer never swam the event.
 */
export function buildBestTimesIndex(bestTimes, { qualifyingPeriodStart = null } = {}) {
  const index = { SCY: new Map(), LCM: new Map(), outOfWindow: new Map() };
  const windowStart = toDate(qualifyingPeriodStart);
  for (const bt of bestTimes || []) {
    const parsed = parseEventCode(bt.eventCode
      || `${bt.distance || ''} ${bt.strokeAbbreviation || ''} ${bt.courseCode || ''}`);
    if (!parsed || !index[parsed.course]) continue;
    const seconds = parseSwimTimeText(bt.swimTime ?? bt.bestTime);
    if (seconds == null) continue;
    const key = `${parsed.distance} ${parsed.stroke}`;
    const swimDate = String(bt.swimDate || '').slice(0, 10);
    const tooOld = windowStart && swimDate && toDate(swimDate) < windowStart;
    const bucket = tooOld ? index.outOfWindow : index[parsed.course];
    const cur = bucket.get(key);
    if (!cur || seconds < cur.seconds) {
      bucket.set(key, { seconds, date: swimDate, course: parsed.course });
    }
  }
  return index;
}

/** Normalise 'female' / 'F' / 'Girls' → 'F'; anything else → 'M'. */
export function genderKeyOf(gender) {
  const g = String(gender || '').trim().toLowerCase();
  if (g.startsWith('f') || g.startsWith('g')) return 'F';
  if (g.startsWith('m') || g.startsWith('b')) return 'M';
  return null;
}

/**
 * Judge one event row against the athlete's indexed best times.
 *
 * Returns:
 *   state          'qualified' | 'slower' | 'no-time'
 *   bestCourse     'SCY' | 'LCM' | null   (the course whose time is shown)
 *   bestSeconds    number | null
 *   bestDate       'YYYY-MM-DD' | ''
 *   standardSeconds number | null          (line for `bestCourse`)
 *   gapSeconds     number | null           (>0 means slower than the line)
 *   noStandard     true when the meet publishes no line for this event
 */
export function evaluateEvent(event, bestIndex) {
  const line = event?.standards || {};
  const key = `${event?.distance} ${event?.stroke}`;
  const candidates = [];

  for (const course of COURSES) {
    const standardSeconds = line[course];
    if (standardSeconds == null) continue;
    const best = bestIndex?.[course]?.get(key);
    if (!best) continue;
    candidates.push({
      course,
      bestSeconds: best.seconds,
      bestDate: best.date || '',
      standardSeconds,
      gapSeconds: +(best.seconds - standardSeconds).toFixed(2),
      qualified: best.seconds <= standardSeconds,
    });
  }

  const noStandard = COURSES.every((c) => line[c] == null);

  if (candidates.length === 0) {
    const stale = COURSES
      .map((c) => bestIndex?.outOfWindow?.get(key))
      .filter(Boolean)
      .sort((a, b) => a.seconds - b.seconds)[0];
    return {
      state: 'no-time',
      bestCourse: null,
      bestSeconds: null,
      bestDate: '',
      standardSeconds: null,
      gapSeconds: null,
      noStandard,
      staleSeconds: stale?.seconds ?? null,
      staleDate: stale?.date || '',
    };
  }

  const qualified = candidates.filter((c) => c.qualified);
  // Prefer a short-course-yard entry: LC times are seeded after every SCY time.
  let pick;
  if (qualified.length) {
    pick = qualified.find((c) => c.course === 'SCY') || qualified[0];
  } else {
    pick = [...candidates].sort((a, b) =>
      a.gapSeconds - b.gapSeconds || (a.course === 'SCY' ? -1 : 1))[0];
  }

  return {
    state: pick.qualified ? 'qualified' : 'slower',
    bestCourse: pick.course,
    bestSeconds: pick.bestSeconds,
    bestDate: pick.bestDate,
    standardSeconds: pick.standardSeconds,
    gapSeconds: pick.gapSeconds,
    noStandard,
    staleSeconds: null,
    staleDate: '',
  };
}

/**
 * The events of this meet one swimmer may enter: their own sex (or a mixed 'X'
 * row) and inside the age limits.
 *
 * Shared by the entry options and by the export's bonus check, so "which events
 * count" cannot drift between what the family was shown and what we submit.
 */
export function enterableMeetEvents(meet, { age, ageGroup, gender } = {}) {
  return (meet?.events || []).filter((e) => (e.gender === gender || e.gender === 'X')
    && isEventEnterable(e, { age, ageGroup }));
}

/**
 * How many of the meet's individual events this swimmer has a qualifying time
 * for — the number the bonus ladder is counted from (1-2 qualifying times → 2
 * bonus events, 3-5 → 1, 6 → none; PVI-27-41, 2026).
 */
export function countQualifiedEvents({ meet, age, ageGroup, gender, bestTimes = [] } = {}) {
  const bestIndex = buildBestTimesIndex(bestTimes, { qualifyingPeriodStart: meet?.qualifyingPeriodStart });
  return enterableMeetEvents(meet, { age, ageGroup, gender })
    .filter((e) => !e.relay)
    .filter((e) => evaluateEvent(e, bestIndex).state === 'qualified')
    .length;
}

/**
 * Build everything the entry UI needs for one swimmer at one meet.
 *
 * `bestTimes` is raw `swimResults/{usaId}.bestTimes`. `swimmer` only needs
 * `dob`, `gender`, `usaSwimmingId`, names. A swimmer without a usable USA
 * Swimming ID or date of birth gets `blocked` set and no options — the caller
 * shows the reason instead of an empty list.
 */
export function buildMeetOptions({ meet, swimmer, bestTimes }) {
  const meetDate = meet?.ageDeterminedOn || meet?.startDate;
  const age = ageOnDate(swimmer?.dob, meetDate);
  const gender = genderKeyOf(swimmer?.gender);
  const meetEvents = meet?.events || [];
  // 标签优先取"本场比赛自己的分区"(见 groupLabelForAge),这三场比赛的
  // 分区各不相同,不能用写死的那套。
  const ageGroup = groupLabelForAge(age, meetEvents);
  const bestIndex = buildBestTimesIndex(bestTimes, { qualifyingPeriodStart: meet?.qualifyingPeriodStart });
  const sessions = new Map((meet?.sessions || []).map((s) => [s.id, s]));

  const blocked = [];
  // Accept either field name: the dashboard normalises swimmers to `usaId`,
  // raw registration docs use `usaSwimmingId`.
  if (!String(swimmer?.usaSwimmingId || swimmer?.usaId || '').trim()) blocked.push('no-usa-id');
  if (age == null) blocked.push('no-dob');
  if (!gender) blocked.push('no-gender');

  const rows = enterableMeetEvents(meet, { age, ageGroup, gender })
    .map((e) => {
      const session = sessions.get(e.sessionId) || null;
      return {
        key: `${e.eventNo}|${e.ageGroup}`,
        eventNo: e.eventNo,
        ageGroup: e.ageGroup,
        distance: e.distance,
        stroke: e.stroke,
        relay: Boolean(e.relay),
        sessionId: e.sessionId,
        day: session?.date || '',
        sessionLabel: session ? `${session.day} ${session.start || ''}`.trim() : '',
        label: `${e.distance} ${STROKE_NAMES[e.stroke] || e.stroke}`,
        standards: e.standards || {},
        // open-to-all 的组(赛程单原文)一律折进折叠区、永不预选
        isOpenGroup: e.openToAll === true || e.ageGroup === 'Open',
        ...evaluateEvent(e, bestIndex),
      };
    });

  rows.sort((a, b) => (a.relay - b.relay)
    || String(a.day).localeCompare(String(b.day))
    || (a.isOpenGroup - b.isOpenGroup)
    || (a.distance - b.distance)
    || String(a.stroke).localeCompare(String(b.stroke)));

  return {
    age,
    ageGroup,
    gender,
    blocked,
    canEnter: blocked.length === 0,
    individual: rows.filter((r) => !r.relay),
    relays: rows.filter((r) => r.relay),
    qualifiedCount: rows.filter((r) => !r.relay && r.state === 'qualified').length,
    meetDate: toDate(meetDate),
  };
}

/** Bonus-event allowance from the number of qualifying times (PVS 27-41 rule). */
export function bonusAllowance(qualifiedCount) {
  if (qualifiedCount >= 6) return 0;
  if (qualifiedCount >= 3) return 1;
  if (qualifiedCount >= 1) return 2;
  return 0;
}

/** True when `now` is past the meet's entry deadline. */
export function isPastDeadline(meet, now = new Date()) {
  const d = toDate(meet?.entryDeadline);
  if (!d) return false;
  // entryDeadline may carry a time ("2026-12-01T20:00:00-05:00"); toDate handles it.
  const deadline = /T\d{2}:\d{2}/.test(String(meet.entryDeadline)) ? new Date(meet.entryDeadline) : d;
  return now.getTime() > deadline.getTime();
}

export function formatDeadline(meet) {
  const raw = meet?.entryDeadline;
  if (!raw) return '';
  const d = /T\d{2}:\d{2}/.test(String(raw)) ? new Date(raw) : toDate(raw);
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/**
 * Validate a selection.
 *
 * `selected` is an array of option `key`s ("34|11-12"). Limits are hard errors
 * because they make the entry invalid at the meet, not because we disagree with
 * the coach; time standards only ever produce warnings (decision 2026-10-28:
 * our records can lag the pool, so never block on them).
 */
export function validateSelection({ meet, context, selected, manualTimes = {} }) {
  const byKey = new Map([...context.individual, ...context.relays].map((o) => [o.key, o]));
  const picks = (selected || []).map((k) => byKey.get(k)).filter(Boolean);
  const errors = [];
  const warnings = [];

  const unknown = (selected || []).filter((k) => !byKey.has(k));
  if (unknown.length) errors.push({ code: 'unknown-event', keys: unknown });

  const relays = picks.filter((o) => o.relay);
  if (relays.length) errors.push({ code: 'relay-coach-only', labels: relays.map((o) => o.label) });

  const dupes = picks.map((o) => o.key).filter((k, i, arr) => arr.indexOf(k) !== i);
  if (dupes.length) errors.push({ code: 'duplicate', labels: dupes });

  const maxEvents = meet?.limits?.maxEvents;
  if (maxEvents && picks.length > maxEvents) {
    errors.push({ code: 'too-many-events', count: picks.length, max: maxEvents });
  }

  const perDay = new Map();
  for (const p of picks) {
    if (!p.day) continue;
    perDay.set(p.day, (perDay.get(p.day) || 0) + 1);
  }
  const maxPerDay = meet?.limits?.maxPerDay;
  if (maxPerDay) {
    for (const [day, count] of perDay) {
      if (count > maxPerDay) errors.push({ code: 'too-many-per-day', day, count, max: maxPerDay });
    }
  }

  for (const p of picks) {
    if (p.relay) continue;
    if (p.state === 'slower') {
      warnings.push({
        code: 'slower-than-line',
        label: p.label,
        gapSeconds: p.gapSeconds,
        eventNo: p.eventNo,
        // A slow time is still enterable as a BONUS event, and how many bonus
        // entries a swimmer gets depends on how many lines they cleared.
        bonusAllowed: bonusAllowance(context.qualifiedCount),
      });
    } else if (p.state === 'no-time') {
      // The meet refuses "NT", so a typed seed time is mandatory here — the
      // swimmer may simply have swum it after our last data fetch.
      const typed = String(manualTimes[p.key] || '').trim();
      if (!typed) {
        errors.push({ code: 'missing-seed-time', label: p.label, eventNo: p.eventNo, key: p.key });
      } else if (parseSwimTimeText(typed) == null) {
        errors.push({ code: 'bad-seed-time', label: p.label, value: typed, key: p.key });
      } else {
        warnings.push({ code: 'manual-time', label: p.label, value: typed, key: p.key });
      }
    }
    if (p.isOpenGroup && context.ageGroup !== 'Open') {
      warnings.push({ code: 'open-event', label: p.label, eventNo: p.eventNo });
    }
  }

  // Same distance+stroke entered twice (e.g. 11-12 200 Free and Open 200 Free).
  const byEvent = new Map();
  for (const p of picks) {
    if (p.relay) continue;
    const k = `${p.distance} ${p.stroke}`;
    if (!byEvent.has(k)) byEvent.set(k, []);
    byEvent.get(k).push(p);
  }
  for (const [, group] of byEvent) {
    if (group.length > 1) {
      warnings.push({ code: 'same-event-twice', labels: group.map((g) => `${g.ageGroup} ${g.label}`) });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      total: picks.length,
      byDay: Object.fromEntries(perDay),
      qualified: picks.filter((p) => p.state === 'qualified').length,
    },
  };
}

/**
 * Stable Firestore document id for one swimmer's entry.
 *
 * Keyed on the USA Swimming ID because (a) entering a meet now requires one
 * (decision 2026-10-28) and (b) it is the only swimmer identifier that does not
 * move when the roster array is reordered. A corrected ID therefore starts a
 * NEW entry document — the coach panel flags the orphan by name mismatch.
 */
export function entryDocId(familyId, usaSwimmingId) {
  const id = String(usaSwimmingId || '').trim().toUpperCase();
  const fam = String(familyId || '').trim();
  if (!fam || !id) return null;
  return `${fam}__${id}`;
}

/** Group option rows by calendar day for rendering, keeping session order. */
export function groupOptionsByDay(options) {
  const days = new Map();
  for (const o of options) {
    const day = o.day || 'unknown';
    if (!days.has(day)) days.set(day, { day, sessions: new Map() });
    const bucket = days.get(day);
    if (!bucket.sessions.has(o.sessionId)) {
      bucket.sessions.set(o.sessionId, { sessionId: o.sessionId, label: o.sessionLabel, options: [] });
    }
    bucket.sessions.get(o.sessionId).options.push(o);
  }
  return [...days.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)));
}
