/**
 * E2E — Meet entries: a family enters events, a coach confirms them, and the
 * deadline / USA-ID / standards rules behave the way the 2026-10-28 decisions
 * say they should.
 *
 * What is actually being protected here
 * -------------------------------------
 * 1. The entry form lives in a body-level modal, so the dashboard's
 *    rebuild-on-every-snapshot behaviour cannot eat it mid-edit.
 * 2. A qualifying time is shown as ✅, a slower one as ⚠️ — and a slower one is
 *    still submittable (our results snapshot can lag the pool by days).
 * 3. "No time on record" is NOT treated as "too slow": the family must type a
 *    seed time, because the meet refuses NT.
 * 4. A swimmer without a USA Swimming ID cannot be entered at all.
 * 5. Past the deadline the family sees a read-only form.
 *
 * Fixtures are planted through the emulator REST API (owner credential); the
 * writes under test always go through the UI.
 *
 * Every fixture id is unique per test — the suite shares one emulator and runs
 * worker processes in parallel, so a fixed USA Swimming ID would let one test
 * delete another's `swimResults` document mid-run.
 *
 * Run with `npm test` (emulators + dev server pointed at them).
 */

import { test, expect } from "@playwright/test";
import {
  assertEmulatorReady, seedDocument, readDocument, deleteDocument, seedAuthUser,
} from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `entries-${tag}-${Date.now()}-${rand()}@example.com`;
const uniqueId = (tag) => `entries-${tag}-${Date.now()}-${rand()}`;
/** A USA Swimming ID shaped fixture: 14 uppercase alphanumerics, unique per call. */
const newUsaId = () => `T${Date.now().toString(36)}${rand()}`.toUpperCase().slice(0, 14);

/** Dashboard season rule: a season starts on September 1. */
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** A date that is inside the current season but comfortably in the future. */
function dateInCurrentSeason(daysAhead = 30) {
  const season = currentSeason();
  const startYear = Number(season.slice(0, 4));
  const seasonStart = new Date(startYear, 8, 1);
  const seasonEnd = new Date(startYear + 1, 7, 31);
  let d = new Date();
  d.setDate(d.getDate() + daysAhead);
  if (d < seasonStart) d = new Date(seasonStart.getTime() + 40 * 864e5);
  if (d > seasonEnd) d = new Date(seasonEnd.getTime() - 10 * 864e5);
  return d;
}

const isoDate = (d) => d.toISOString().slice(0, 10);

/** One meet with three 11-12 girls events: qualified / slower / no time on record. */
async function seedMeet(name, { deadlinePast = false, familyEntry = true } = {}) {
  const meetId = uniqueId("m");
  const start = dateInCurrentSeason(30);
  const deadline = new Date(Date.now() + (deadlinePast ? -86_400_000 : 20 * 86_400_000));
  await seedDocument("meets", meetId, {
    name,
    startDate: isoDate(start),
    endDate: isoDate(start),
    location: "Germantown Indoor Swim Center",
    season: currentSeason(),
    status: "Open",
    createdAt: new Date(),
    ageDeterminedOn: isoDate(start),
    qualifyingPeriodStart: "2024-10-01",
    entryDeadline: deadline.toISOString(),
    limits: { maxEvents: 6, maxPerDay: 3 },
    // Family self-service is off by default in production; seedMeet opens it for
    // the family tests so the whole family path stays covered.
    entriesOpenToFamilies: familyEntry,
    sessions: [{ id: "fri-pm", date: isoDate(start), day: "Fri", start: "1:35 PM" }],
    events: [
      { eventNo: 25, gender: "F", ageGroup: "11-12", distance: 50, stroke: "BR", relay: false, sessionId: "fri-pm", standards: { SCY: 37.79, LCM: 41.29 } },
      { eventNo: 46, gender: "F", ageGroup: "11-12", distance: 50, stroke: "FL", relay: false, sessionId: "fri-pm", standards: { SCY: 32.19, LCM: 35.19 } },
      { eventNo: 34, gender: "F", ageGroup: "11-12", distance: 100, stroke: "FR", relay: false, sessionId: "fri-pm", standards: { SCY: 63.09, LCM: 69.09 } },
      // Open event: legal for a 12-year-old, but it must live in the collapsed
      // "optional" section and never be preselected (decision 2026-10-28).
      { eventNo: 21, gender: "F", ageGroup: "Open", distance: 100, stroke: "BR", relay: false, sessionId: "fri-pm", standards: { SCY: 72.49, LCM: 79.49 } },
    ],
  });
  return { meetId, start };
}

/** Auth user + users/{uid}.role=swimmer + registrations/{uid} with one swimmer. */
async function seedFamilyWithSwimmer({ usaId, withId = true } = {}) {
  const email = unique("family");
  const uid = await seedAuthUser(email, PASSWORD);
  await seedDocument("users", uid, { email, role: "swimmer", createdAt: new Date() });
  const swimmer = {
    firstName: "Test",
    lastName: `Kid${rand().slice(0, 4)}`,
    gender: "female",
    dob: `${new Date().getFullYear() - 12}-06-01`,
    usaSwimmingId: withId ? usaId : "",
  };
  await seedDocument("registrations", uid, {
    parent: { firstName: "Test", lastName: "Parent", email },
    parentEmails: [email],
    editors: [],
    swimmers: [swimmer],
    createdAt: new Date(),
  });
  return { email, uid, swimmer };
}

async function seedBestTimes(usaId) {
  await seedDocument("swimResults", usaId, {
    memberId: usaId,
    swimmerName: "Test Kid",
    lastFetchSuccessAt: new Date(),
    lastUpdated: new Date(),
    bestTimes: [
      // 36.60 <= 37.79 -> qualifies for the 50 breast
      { eventCode: "50 BR SCY", swimTime: "36.60", swimDate: "2026-10-24T00:00:00" },
      // 33.10 > 32.19 -> slower than the 50 fly line
      { eventCode: "50 FL SCY", swimTime: "33.10", swimDate: "2026-10-11T00:00:00" },
    ],
  });
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

async function openEntriesFromCard(page, meetName) {
  await page.click('.dash-nav-item[data-tab="meets"]');
  const card = page.locator(".dash-card", { hasText: meetName }).first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.locator(".meet-entries-btn").click();
  await expect(page.locator(".meet-entries-modal")).toBeVisible();
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("[console.error]", msg.text());
  });
});

test("a family submits two events; the qualified one is marked and the slow one only warns", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton Test #${tag}`;
  const usaId = newUsaId();
  const { meetId } = await seedMeet(meetName);
  const { email, uid, swimmer } = await seedFamilyWithSwimmer({ usaId });
  await seedBestTimes(usaId);

  await signIn(page, email);
  await openEntriesFromCard(page, meetName);

  // One swimmer with an ID => the editor opens straight away.
  const breast = page.locator('[data-event-row="25|11-12"]');
  const fly = page.locator('[data-event-row="46|11-12"]');
  const free = page.locator('[data-event-row="34|11-12"]');
  await expect(breast.locator(".me-state--ok")).toBeVisible();
  await expect(fly.locator(".me-state--warn")).toBeVisible();
  await expect(free.locator(".me-state--none")).toBeVisible();

  await breast.locator('input[type="checkbox"]').check();
  await fly.locator('input[type="checkbox"]').check();

  // The Open 100 breast is offered (any age may enter Open events) but parked in
  // a collapsed section and NOT ticked.
  const openSection = page.locator("details.me-open");
  await expect(openSection).toHaveCount(1);
  await expect(openSection).not.toHaveAttribute("open", "");
  await expect(page.locator('[data-event-row="21|Open"] input[type="checkbox"]')).not.toBeChecked();

  // The slow event produces a warning but must NOT block submission.
  await expect(page.locator(".me-problem--warn")).toContainText("slower");
  await expect(page.locator('[data-action="submit"]')).toBeEnabled();
  await page.click('[data-action="submit"]');

  const entryId = `${uid}__${usaId}`;
  await expect.poll(async () => (await readDocument(`meets/${meetId}/entries`, entryId))?.status)
    .toBe("submitted");

  const entry = await readDocument(`meets/${meetId}/entries`, entryId);
  expect(entry.events).toHaveLength(2);
  expect(entry.swimmerName).toContain(swimmer.lastName);
  const breastEntry = entry.events.find((e) => e.eventNo === 25);
  expect(breastEntry.seedTime).toBe("36.60");
  expect(breastEntry.source).toBe("db");
  expect(breastEntry.qualifies).toBe(true);
  const flyEntry = entry.events.find((e) => e.eventNo === 46);
  expect(flyEntry.qualifies).toBe(false);
  expect(flyEntry.seedTime).toBe("33.10");

  await deleteDocument("meets", meetId);
  await deleteDocument("swimResults", usaId);
  await deleteDocument("registrations", uid);
  await deleteDocument("users", uid);
});

test("an event with no time on record requires a typed seed time before submitting", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton Seed #${tag}`;
  const usaId = newUsaId();
  const { meetId } = await seedMeet(meetName);
  const { email, uid } = await seedFamilyWithSwimmer({ usaId });
  await seedBestTimes(usaId);

  await signIn(page, email);
  await openEntriesFromCard(page, meetName);

  // 100 free has no recorded time -> typing nothing must block the submit.
  const free = page.locator('[data-event-row="34|11-12"]');
  await free.locator('input[type="checkbox"]').check();
  await expect(page.locator(".me-problem--error")).toContainText("100 Free");
  await expect(page.locator('[data-action="submit"]')).toBeDisabled();

  await free.locator('input[data-manual]').fill("1:01.20");
  await expect(page.locator('[data-action="submit"]')).toBeEnabled();
  await page.click('[data-action="submit"]');

  const entryId = `${uid}__${usaId}`;
  await expect.poll(async () => (await readDocument(`meets/${meetId}/entries`, entryId))?.status)
    .toBe("submitted");
  const entry = await readDocument(`meets/${meetId}/entries`, entryId);
  expect(entry.events[0].source).toBe("manual");
  expect(entry.events[0].seedTime).toBe("1:01.20");

  await deleteDocument("meets", meetId);
  await deleteDocument("swimResults", usaId);
  await deleteDocument("registrations", uid);
  await deleteDocument("users", uid);
});

test("a swimmer without a USA Swimming ID cannot be entered", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton NoId #${tag}`;
  const { meetId } = await seedMeet(meetName);
  const { email, uid } = await seedFamilyWithSwimmer({ usaId: newUsaId(), withId: false });

  await signIn(page, email);
  await openEntriesFromCard(page, meetName);

  await expect(page.locator(".me-family-card--blocked")).toContainText("USA Swimming ID");
  await expect(page.locator(".me-family-card--blocked button")).toHaveCount(0);

  await deleteDocument("meets", meetId);
  await deleteDocument("registrations", uid);
  await deleteDocument("users", uid);
});

test("after the deadline the family form is read-only", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton Closed #${tag}`;
  const usaId = newUsaId();
  const { meetId } = await seedMeet(meetName, { deadlinePast: true });
  const { email, uid } = await seedFamilyWithSwimmer({ usaId });
  await seedBestTimes(usaId);

  await signIn(page, email);
  await openEntriesFromCard(page, meetName);

  await expect(page.locator(".me-alert")).toContainText("deadline");
  await expect(page.locator('[data-event-row="25|11-12"] input[type="checkbox"]')).toBeDisabled();
  // The buttons stay on screen (so the reason is next to them) but are disabled.
  await expect(page.locator('[data-action="submit"]')).toBeDisabled();
  await expect(page.locator('[data-action="draft"]')).toBeDisabled();

  await deleteDocument("meets", meetId);
  await deleteDocument("swimResults", usaId);
  await deleteDocument("registrations", uid);
  await deleteDocument("users", uid);
});

test("a coach sees a submitted entry and confirms it", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton Coach #${tag}`;
  const usaId = newUsaId();
  // Production default: families are locked out, the coach is not.
  const { meetId } = await seedMeet(meetName, { familyEntry: false });
  await seedBestTimes(usaId);

  const coachEmail = unique("coach");
  const coachUid = await seedAuthUser(coachEmail, PASSWORD);
  await seedDocument("users", coachUid, { email: coachEmail, role: "admin", createdAt: new Date() });

  const { uid: familyUid, swimmer } = await seedFamilyWithSwimmer({ usaId });
  const entryId = `${familyUid}__${usaId}`;
  await seedDocument(`meets/${meetId}/entries`, entryId, {
    meetId,
    familyId: familyUid,
    usaSwimmingId: usaId,
    swimmerName: `${swimmer.firstName} ${swimmer.lastName}`,
    ageAtMeet: 12,
    ageGroup: "11-12",
    gender: "F",
    status: "submitted",
    events: [{
      eventNo: 25, ageGroup: "11-12", distance: 50, stroke: "BR", sessionId: "fri-pm",
      course: "SCY", seedTime: "36.60", seedSeconds: 36.6, source: "db",
      proofDate: "2026-10-24", standard: 37.79, qualifies: true,
    }],
    updatedAt: new Date(),
  });

  await signIn(page, coachEmail);
  await openEntriesFromCard(page, meetName);

  const row = page.locator(".me-table tbody tr", { hasText: swimmer.lastName }).first();
  await expect(row).toContainText("Submitted");
  await row.locator('[data-action="edit"]').click();

  // The coach's editor shows the family's picks already ticked.
  await expect(page.locator('[data-event-row="25|11-12"] input[type="checkbox"]')).toBeChecked();
  await page.click('[data-action="confirm"]');

  await expect.poll(async () => (await readDocument(`meets/${meetId}/entries`, entryId))?.status)
    .toBe("confirmed");

  await deleteDocument("meets", meetId);
  await deleteDocument("swimResults", usaId);
  await deleteDocument("registrations", familyUid);
  await deleteDocument("users", familyUid);
  await deleteDocument("users", coachUid);
});

/**
 * Rollout guard (decision 2026-10-28): family self-service ships dark. A meet
 * without `entriesOpenToFamilies` must show no entry button to a family, while
 * the coach still gets one — that is the whole point of the switch.
 */
test("a family sees no entry button until the coach opens the meet to families", async ({ page }) => {
  const tag = rand();
  const meetName = `Riley Eaton Dark #${tag}`;
  const usaId = newUsaId();
  const { meetId } = await seedMeet(meetName, { familyEntry: false });
  const { email, uid } = await seedFamilyWithSwimmer({ usaId });
  await seedBestTimes(usaId);

  await signIn(page, email);
  await page.click('.dash-nav-item[data-tab="meets"]');
  const card = page.locator(".dash-card", { hasText: meetName }).first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await expect(card.locator(".meet-entries-btn")).toHaveCount(0);

  await deleteDocument("meets", meetId);
  await deleteDocument("swimResults", usaId);
  await deleteDocument("registrations", uid);
  await deleteDocument("users", uid);
});
