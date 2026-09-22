/**
 * E2E — Volunteer Hours tab (coach dashboard).
 *
 * Run with `npm test` (Firebase emulators + dev server pointed at them).
 *
 * What is covered:
 *   1. an admin records a family's hours for a meet → the doc lands in Firestore
 *      with the right shape, the season summary picks the value up, the meet
 *      footer totals it, the CSV export downloads, and clearing the field
 *      removes the record again;
 *   2. a plain coach sees the same numbers read-only (no inputs, admin hint).
 *
 * Fixtures go in through the emulator REST API (tests/helpers/emulator.js);
 * everything the feature actually does is driven through the UI, because the
 * firestore rules are part of what is being tested.
 */

import { test, expect } from "@playwright/test";
import { assertEmulatorReady, seedDocument, seedStaffUser, readDocument } from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
let seq = 0;
const unique = (tag) => `vol-${tag}-${Date.now()}-${seq++}@example.com`;
const uniqueId = (tag) => `vol-${tag}-${Date.now()}-${seq++}`;

/**
 * The app's own season rule (dashboard.js getDefaultSeason): a season starts in
 * September, so the tab defaults to the season the fixtures must belong to.
 */
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** Local YYYY-MM-DD (never toISOString — that would shift the day near midnight). */
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * One meet (today) in the current season + two families.
 * `createdAt` is REQUIRED: the dashboard reads registrations and meets with
 * `orderBy(createdAt)`, and Firestore silently omits documents lacking that field.
 */
async function seedVolunteerFixtures(season) {
  const meetId = uniqueId("meet");
  const familyA = uniqueId("fama");
  const familyB = uniqueId("famb");

  await seedDocument("meets", meetId, {
    name: "Volunteer Test Meet",
    startDate: todayISO(),
    endDate: todayISO(),
    location: "Test Pool",
    season,
    status: "Open",
    sourceUrl: null,
    createdAt: new Date(),
  });

  await seedDocument("registrations", familyA, {
    parent: { firstName: "Keke", lastName: "Chen", email: "chen@example.com", phone: "555-0100" },
    spouse: { firstName: "Fan", lastName: "Luo", email: "luo@example.com" },
    swimmers: [
      { firstName: "Amy", lastName: "Chen", gender: "female", dob: "2014-05-01" },
      { firstName: "Ben", lastName: "Chen", gender: "male", dob: "2016-08-09" },
      { firstName: "Gone", lastName: "Chen", gender: "male", dob: "2012-01-01", deleted: true },
    ],
    parentEmails: ["chen@example.com", "luo@example.com"],
    editors: [],
    createdAt: new Date(),
  });

  await seedDocument("registrations", familyB, {
    parent: { firstName: "Wei", lastName: "Wang", email: "wang@example.com" },
    spouse: null,
    swimmers: [{ firstName: "Cara", lastName: "Wang", gender: "female", dob: "2015-03-03" }],
    parentEmails: ["wang@example.com"],
    editors: [],
    createdAt: new Date(),
  });

  return { meetId, familyA, familyB };
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

async function openVolunteerTab(page) {
  await page.click('.dash-nav-item[data-tab="volunteer"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Volunteer Hours");
  await expect(page.locator(".vol-summary-table")).toBeVisible({ timeout: 15000 });
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("admin records a family's hours for a meet, summary and CSV follow", async ({ page }) => {
  const season = currentSeason();
  const { meetId, familyA, familyB } = await seedVolunteerFixtures(season);
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  await signIn(page, email);
  await openVolunteerTab(page);

  // ── The summary lists both families, with kids from the registration ──
  const summaryA = page.locator(`.vol-summary-row[data-vol-family="${familyA}"]`);
  const summaryB = page.locator(`.vol-summary-row[data-vol-family="${familyB}"]`);
  await expect(summaryA).toContainText("Keke Chen & Fan Luo");
  await expect(summaryA).toContainText("Amy Chen, Ben Chen"); // soft-deleted swimmer excluded
  await expect(summaryB).toContainText("Wei Wang");
  // Everyone starts at 0 hours, so the rows are hidden until asked for.
  await expect(summaryA).toBeHidden();
  await page.check("#volunteer-show-zero");
  await expect(summaryA).toBeVisible();

  // ── The entry table lists the same families for the selected meet ──
  const rowA = page.locator(`.vol-entry-row[data-family-id="${familyA}"]`);
  await expect(rowA).toContainText("Keke Chen & Fan Luo");
  await expect(rowA.locator(".vol-hours-input")).toHaveValue("");

  // ── Record 3.5 hours and let the write settle ──
  await rowA.locator(".vol-hours-input").fill("3.5");
  await rowA.locator(".vol-hours-input").blur();

  await expect
    .poll(async () => (await readDocument("volunteerHours", `${meetId}_${familyA}`))?.hours ?? null, { timeout: 15000 })
    .toBe(3.5);

  const record = await readDocument("volunteerHours", `${meetId}_${familyA}`);
  expect(record.meetId).toBe(meetId);
  expect(record.season).toBe(season);
  expect(record.familyId).toBe(familyA);
  expect(record.familyLabel).toBe("Keke Chen & Fan Luo");
  // Snapshot for the future family-side view (one doc per family, both emails).
  expect(record.parentEmails).toEqual(["chen@example.com", "luo@example.com"]);

  // ── Summary + meet footer reflect it (rebuilt from the snapshot) ──
  await expect(summaryA).toContainText("3.5");
  await expect(page.locator(".vol-entry-footer")).toContainText("3.5");

  // ── The per-meet breakdown names the meet ──
  await summaryA.click();
  await expect(page.locator(`.vol-detail-row[data-vol-detail="${familyA}"]`)).toContainText("Volunteer Test Meet");

  // ── CSV export ──
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#volunteer-export-btn"),
  ]);
  expect(download.suggestedFilename()).toBe(`dragon-volunteer-hours-${season}.csv`);

  // ── Clearing the field removes the record instead of storing a 0 ──
  await rowA.locator(".vol-hours-input").fill("");
  await rowA.locator(".vol-hours-input").blur();
  await expect
    .poll(async () => await readDocument("volunteerHours", `${meetId}_${familyA}`), { timeout: 15000 })
    .toBeNull();
});

test("a plain coach reads the same numbers without being able to edit them", async ({ page }) => {
  const season = currentSeason();
  const { meetId, familyA } = await seedVolunteerFixtures(season);

  // A record already exists (as if an admin had entered it).
  await seedDocument("volunteerHours", `${meetId}_${familyA}`, {
    meetId,
    meetName: "Volunteer Test Meet",
    season,
    familyId: familyA,
    familyLabel: "Keke Chen & Fan Luo",
    parentEmails: ["chen@example.com", "luo@example.com"],
    hours: 2,
    note: "timing",
    updatedAt: new Date(),
    updatedBy: "someone@example.com",
    updatedByEmail: "someone@example.com",
  });

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");

  await signIn(page, coachEmail);
  await openVolunteerTab(page);

  const summaryA = page.locator(`.vol-summary-row[data-vol-family="${familyA}"]`);
  await expect(summaryA).toContainText("Keke Chen & Fan Luo");
  await expect(summaryA).toContainText("2");

  // Read-only: the values are text, not inputs, and the hint says why.
  await expect(page.locator(".vol-intro")).toContainText("Only admins can add or change volunteer hours.");
  await expect(page.locator(".vol-hours-input")).toHaveCount(0);
  await expect(page.locator(".vol-note-input")).toHaveCount(0);
  // The entry table lists every registered family (other spec files add more, so
  // assert on this family rather than on a total count).
  await expect(page.locator(`.vol-entry-row[data-family-id="${familyA}"]`)).toBeVisible();
  await expect(page.locator(`.vol-entry-row[data-family-id="${familyA}"]`)).toContainText("timing");
  await expect(page.locator(`.vol-entry-row[data-family-id="${familyA}"]`)).toContainText("someone@example.com");
});
