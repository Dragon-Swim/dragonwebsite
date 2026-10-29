/**
 * E2E — the meet entry confirmation sheet (`meet-print.html`).
 *
 * What this protects
 * ------------------
 * 1. The sheet is its own page, so it is immune to the dashboard's
 *    rebuild-on-every-snapshot behaviour (the reason it is not a modal panel).
 * 2. It prints **re-resolved** seed times: a swimmer who went faster after the
 *    family submitted gets the new time, and the sheet says so out loud. That
 *    line is the whole point of asking a family to confirm twice.
 * 3. A family only ever sees its own swimmers — even if the URL is edited to
 *    point at another family's id, because the page derives the family from the
 *    signed-in user instead of trusting the query string.
 *
 * Fixtures are planted through the emulator REST API (owner credential); the page
 * only reads. Every fixture id is unique per test: the suite shares one emulator
 * and runs workers in parallel.
 */

import { test, expect } from "@playwright/test";
import {
  assertEmulatorReady, seedDocument, seedAuthUser, seedStaffUser,
} from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `print-${tag}-${Date.now()}-${rand()}@example.com`;
const uniqueId = (tag) => `print-${tag}-${Date.now()}-${rand()}`;
const newUsaId = () => `P${Date.now().toString(36)}${rand()}`.toUpperCase().slice(0, 14);

function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function dateInCurrentSeason(daysAhead = 30) {
  const startYear = Number(currentSeason().slice(0, 4));
  const seasonStart = new Date(startYear, 8, 1);
  const seasonEnd = new Date(startYear + 1, 7, 31);
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  if (d > seasonEnd) return new Date(seasonEnd.getTime() - 10 * 864e5);
  return d < seasonStart ? new Date(seasonStart.getTime() + 40 * 864e5) : d;
}

const isoDate = (d) => d.toISOString().slice(0, 10);

/** A meet with two 11-12 girls events and a per-event fee. */
async function seedMeet(name) {
  const meetId = uniqueId("m");
  const start = dateInCurrentSeason(30);
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
    entryDeadline: new Date(Date.now() + 20 * 86_400_000).toISOString(),
    entryFeePerEvent: 11,
    limits: { maxEvents: 6, maxPerDay: 3 },
    sessions: [{ id: "fri-pm", date: isoDate(start), day: "Fri", start: "1:35 PM" }],
    events: [
      { eventNo: 25, gender: "F", ageGroup: "11-12", distance: 50, stroke: "BR", relay: false, sessionId: "fri-pm", standards: { SCY: 37.79, LCM: 41.29 } },
      { eventNo: 46, gender: "F", ageGroup: "11-12", distance: 50, stroke: "FL", relay: false, sessionId: "fri-pm", standards: { SCY: 32.19, LCM: 35.19 } },
    ],
  });
  return { meetId, start };
}

/** Auth user + users/{uid} role=swimmer + registrations/{uid} with one swimmer. */
async function seedFamily({ firstName = "Test", lastName = "Parent" } = {}) {
  const email = unique("family");
  const uid = await seedAuthUser(email, PASSWORD);
  await seedDocument("users", uid, { email, role: "swimmer", createdAt: new Date() });
  const usaId = newUsaId();
  const swimmer = {
    firstName: "Test",
    lastName: `Kid${rand().slice(0, 4)}`,
    gender: "female",
    dob: `${new Date().getFullYear() - 12}-06-01`,
    usaSwimmingId: usaId,
  };
  await seedDocument("registrations", uid, {
    parent: { firstName, lastName, email },
    parentEmails: [email],
    editors: [],
    swimmers: [swimmer],
    createdAt: new Date(),
  });
  return { email, uid, swimmer, usaId };
}

/**
 * A confirmed entry whose stored seed time is *older* than the records: the 50
 * breast was submitted as 38.50 and the swimResults say 36.60 since.
 */
async function seedEntry({ meetId, uid, usaId, swimmerName }) {
  const docId = `${uid}__${usaId}`;
  await seedDocument(`meets/${meetId}/entries`, docId, {
    meetId,
    familyId: uid,
    usaSwimmingId: usaId,
    swimmerName,
    ageAtMeet: 12,
    ageGroup: "11-12",
    gender: "F",
    status: "confirmed",
    events: [{
      eventNo: 25,
      ageGroup: "11-12",
      distance: 50,
      stroke: "BR",
      sessionId: "fri-pm",
      course: "SCY",
      seedTime: "38.50",
      seedSeconds: 38.5,
      source: "db",
      proofDate: "2026-09-01",
    }],
    confirmedAt: new Date(),
    updatedAt: new Date(),
  });
  return docId;
}

async function seedBestTimes(usaId) {
  await seedDocument("swimResults", usaId, {
    memberId: usaId,
    bestTimes: [
      { eventCode: "50 BR SCY", swimTime: "36.60", swimDate: "2026-10-24T00:00:00" },
    ],
    lastUpdated: new Date(),
  });
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("a coach prints every family's sheet, with refreshed times called out", async ({ page }) => {
  const { meetId } = await seedMeet("Print Test Invitational");
  const family = await seedFamily({ firstName: "Keke", lastName: "Chen" });
  await seedEntry({
    meetId, uid: family.uid, usaId: family.usaId,
    swimmerName: `Test ${family.swimmer.lastName}`,
  });
  await seedBestTimes(family.usaId);

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);

  await page.goto(`/meet-print.html?meet=${meetId}`);

  const sheet = page.locator(".mp-sheet");
  await expect(sheet).toBeVisible({ timeout: 15000 });
  await expect(sheet).toHaveAttribute("data-meet", meetId);

  // Meet header: name, span, deadline, and the reminder that this is a snapshot.
  await expect(sheet.locator(".mp-meet-name")).toHaveText("Print Test Invitational");
  await expect(sheet.locator(".mp-meet-meta")).toContainText("Entries close");
  await expect(sheet.locator(".mp-meet-meta")).toContainText("Generated");

  // The family block is titled with the parent's name and shows its swimmer.
  await expect(sheet.locator(".mp-family")).toHaveAttribute("data-family", family.uid);
  await expect(sheet.locator(".mp-family-head h2")).toContainText("Keke Chen");
  await expect(sheet.locator(".mp-swimmer-head h3")).toContainText(family.swimmer.lastName);

  // The entry row: event, the *new* seed time, the cut-off and the verdict.
  const row = sheet.locator('.mp-row[data-event="25"]');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("50 Breast");
  await expect(row.locator("td").nth(3)).toContainText("36.60");
  await expect(row.locator("td").nth(4)).toContainText("37.79");
  await expect(row.locator(".mp-badge")).toHaveText("Qualifies");

  // The time moved after submission: 38.50 -> 36.60, and the sheet says so.
  const update = sheet.locator(".mp-note--update");
  await expect(update).toBeVisible();
  await expect(update).toContainText("Times updated since you submitted");
  await expect(update).toContainText("38.50");
  await expect(update).toContainText("36.60");

  // Fees: 1 event x $11.
  await expect(sheet.locator(".mp-fees")).toContainText("1 × $11");
  await expect(sheet.locator(".mp-fees-total")).toHaveText("$11");

  // Signature block (the family replies with this).
  await expect(sheet.locator(".mp-sign")).toContainText("I confirm these entries are correct");

  // Coach-only pre-flight box.
  await expect(sheet.locator(".mp-check")).toBeVisible();
  await expect(sheet.locator(".mp-check")).toContainText("1 swimmer(s)");

  // The print button exists and is hidden on paper by CSS.
  await expect(page.locator(".mp-print-btn")).toBeVisible();
});

test("a family only sees its own swimmers, even with a forged family id", async ({ page }) => {
  const { meetId } = await seedMeet("Print Isolation Invitational");

  const ours = await seedFamily({ firstName: "Our", lastName: "Parent" });
  await seedEntry({ meetId, uid: ours.uid, usaId: ours.usaId, swimmerName: `Our ${ours.swimmer.lastName}` });
  await seedBestTimes(ours.usaId);

  const other = await seedFamily({ firstName: "Other", lastName: "Parent" });
  await seedEntry({ meetId, uid: other.uid, usaId: other.usaId, swimmerName: `Other ${other.swimmer.lastName}` });

  await signIn(page, ours.email);

  // Deliberately point the URL at the other family.
  await page.goto(`/meet-print.html?meet=${meetId}&family=${other.uid}&status=all`);

  const sheet = page.locator(".mp-sheet");
  await expect(sheet).toBeVisible({ timeout: 15000 });

  await expect(sheet.locator(".mp-swimmer-head h3")).toHaveCount(1);
  await expect(sheet.locator(".mp-swimmer-head h3")).toContainText(ours.swimmer.lastName);
  await expect(sheet).not.toContainText(other.swimmer.lastName);
  await expect(sheet.locator(".mp-family")).toHaveAttribute("data-family", ours.uid);

  // The coach pre-flight box is not for families.
  await expect(sheet.locator(".mp-check")).toHaveCount(0);
});

test("a meet with no entries says so instead of showing an empty table", async ({ page }) => {
  const { meetId } = await seedMeet("Print Empty Invitational");

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);

  await page.goto(`/meet-print.html?meet=${meetId}`);

  await expect(page.locator(".mp-sheet")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".mp-sheet")).toContainText("No entries to show for this meet yet.");
  await expect(page.locator(".mp-family")).toHaveCount(0);
});
