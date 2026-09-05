/**
 * Season Schedule Templates — Dragon Swim Team
 *
 * The coach-side schedule (dashboard Schedule tab) is organized by "period"
 * (e.g. Fall 2026). Period structure mirrors the public homepage schedule;
 * the initial template is Fall 2026 (14 weekly slots). Future periods are
 * added at each season transition by re-seeding from the homepage copy.
 *
 * Time convention: store 12h clock strings like "6:30 PM" / "8:00 AM".
 * Day names are full English names (Monday … Sunday) — same convention as
 * the legacy schedules collection.
 */

export const LOCATION_ORDER = [
  'Claude Moore Recreation Center',
  'Dulles South Recreation Center',
  'Tysons — OneLife Fitness Tysons',
];

export const DAY_ORDER = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

// Academic-year periods. ISO yyyy-mm-dd bounds are inclusive.
export const PERIODS = [
  { id: 'Fall 2026', label: 'Fall 2026', start: '2026-09-08', end: '2026-11-09' },
  { id: 'Winter 2026-27', label: 'Winter 2026–27', start: '2026-11-10', end: '2027-02-17' },
  { id: 'Spring 2027', label: 'Spring 2027', start: '2027-02-18', end: '2027-06-11' },
  { id: 'Summer 2027', label: 'Summer 2027', start: '2027-06-12', end: '2027-09-06' },
];

export function periodLabel(id) {
  return PERIODS.find(per => per.id === id)?.label || id;
}

/** Which period is current for the given date (defaults to today). */
export function getCurrentPeriodId(date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  for (const per of PERIODS) {
    if (iso >= per.start && iso <= per.end) return per.id;
  }
  // Before the first period of the year → the first period (2026 season setup).
  if (iso < PERIODS[0].start) return PERIODS[0].id;
  // After the last period ends → the last known period.
  return PERIODS[PERIODS.length - 1].id;
}

/**
 * Fall 2026 template — copied from the public homepage (Seasons section).
 * Mon/Wed are separate slots. groupLabel is display-only (used for Claude
 * Moore's Advanced / All-levels split); the coach decides placements.
 */
export const FALL_2026_SLOT_TEMPLATES = [
  // Claude Moore Recreation Center
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Monday', startTime: '6:30 PM', endTime: '8:30 PM', groupLabel: 'Advanced (group determined by the Head Coach)' },
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Wednesday', startTime: '6:30 PM', endTime: '8:30 PM', groupLabel: 'Advanced (group determined by the Head Coach)' },
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Monday', startTime: '7:30 PM', endTime: '9:00 PM', groupLabel: 'All levels' },
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Wednesday', startTime: '7:30 PM', endTime: '9:00 PM', groupLabel: 'All levels' },
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Saturday', startTime: '12:00 PM', endTime: '2:00 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Claude Moore Recreation Center', day: 'Sunday', startTime: '12:00 PM', endTime: '2:00 PM', groupLabel: '' },
  // Dulles South Recreation Center
  { period: 'Fall 2026', location: 'Dulles South Recreation Center', day: 'Monday', startTime: '7:30 PM', endTime: '9:00 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Dulles South Recreation Center', day: 'Friday', startTime: '7:30 PM', endTime: '9:00 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Dulles South Recreation Center', day: 'Saturday', startTime: '3:00 PM', endTime: '5:00 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Dulles South Recreation Center', day: 'Sunday', startTime: '3:00 PM', endTime: '5:00 PM', groupLabel: '' },
  // Tysons — OneLife Fitness Tysons (year-round)
  { period: 'Fall 2026', location: 'Tysons — OneLife Fitness Tysons', day: 'Tuesday', startTime: '6:30 PM', endTime: '8:30 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Tysons — OneLife Fitness Tysons', day: 'Wednesday', startTime: '6:30 PM', endTime: '8:30 PM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Tysons — OneLife Fitness Tysons', day: 'Saturday', startTime: '8:00 AM', endTime: '10:00 AM', groupLabel: '' },
  { period: 'Fall 2026', location: 'Tysons — OneLife Fitness Tysons', day: 'Sunday', startTime: '8:00 AM', endTime: '10:00 AM', groupLabel: '' },
];
