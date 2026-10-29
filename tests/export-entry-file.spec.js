/**
 * E2E — the coach's "📦 Entry file (.cl2)" button.
 *
 * What this protects
 * ------------------
 * 1. One click produces the zip a meet director expects: a filename in the Team
 *    Manager convention, non-empty, containing the .cl2 **and** the README.
 * 2. The button refuses to hand out a file that is missing something — a seed
 *    time, a USA Swimming ID, a relay leg — and says why in the footer instead of
 *    downloading something broken.
 * 3. A family never sees the button (the entry file is the coach's to send).
 *
 * The zip's *contents* are covered by tests/unit/verify-meet-entry-package.mjs;
 * here we only prove the browser path end to end.
 */

import { test, expect } from "@playwright/test";
import {
  assertEmulatorReady, seedDocument, seedAuthUser, seedStaffUser,
} from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `export-${tag}-${Date.now()}-${rand()}@example.com`;
const uniqueId = (tag) => `export-${tag}-${Date.now()}-${rand()}`;
const newUsaId = () => `X${Date.now().toString(36)}${rand()}`.toUpperCase().slice(0, 14);

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

/** One meet: a boys 13-14 100 breast (individual) + a 200 medley relay. */
async function seedMeet(name, { openToFamilies = false } = {}) {
  const meetId = uniqueId("m");
  const start = dateInCurrentSeason(30);
  await seedDocument("meets", meetId, {
    name,
    startDate: isoDate(start),
    endDate: isoDate(start),
    location: "Germantown Indoor Swim Center, Boyds, MD 20841",
    season: currentSeason(),
    status: "Open",
    createdAt: new Date(),
    ageDeterminedOn: isoDate(start),
    qualifyingPeriodStart: "2024-10-01",
    entryDeadline: new Date(Date.now() + 20 * 86_400_000).toISOString(),
    sanction: "PVI-TEST-9",
    courses: ["SCY"],
    relayLimitPerClub: 2,
    limits: { maxEvents: 6, maxPerDay: 3 },
    entriesOpenToFamilies: openToFamilies,
    sessions: [{ id: "fri-am", date: isoDate(start), day: "Fri", start: "8:05 AM" }],
    events: [
      { eventNo: 19, eventCode: "19A", gender: "M", ageGroup: "13-14", ageMin: 13, ageMax: 14,
        distance: 100, stroke: "BR", relay: false, sessionId: "fri-am", standards: { SCY: 76.69, LCM: 82.99 } },
      { eventNo: 9, eventCode: "9A", gender: "M", ageGroup: "13-14", ageMin: 13, ageMax: 14,
        distance: 200, stroke: "MED", relay: true, sessionId: "fri-am", standards: { SCY: 120.99, LCM: null } },
    ],
  });
  return { meetId };
}

/** One family holding `count` boys who are 13-14 on the meet date. */
async function seedFamily({ count = 1 } = {}) {
  const email = unique("family");
  const uid = await seedAuthUser(email, PASSWORD);
  await seedDocument("users", uid, { email, role: "swimmer", createdAt: new Date() });
  const boys = [];
  for (let i = 0; i < count; i += 1) {
    boys.push({
      firstName: `Ex${i}`,
      lastName: `Port${rand().slice(0, 4)}`,
      gender: "male",
      dob: `${new Date().getFullYear() - 13}-06-01`,
      usaSwimmingId: newUsaId(),
    });
  }
  await seedDocument("registrations", uid, {
    parent: { firstName: "Export", lastName: "Parent", email },
    parentEmails: [email],
    editors: [],
    swimmers: boys,
    createdAt: new Date(),
  });
  return { email, uid, boys };
}

async function seedEntry({ meetId, uid, boy, withSeed = true }) {
  await seedDocument(`meets/${meetId}/entries`, `${uid}__${boy.usaSwimmingId}`, {
    meetId,
    familyId: uid,
    usaSwimmingId: boy.usaSwimmingId,
    swimmerName: `${boy.firstName} ${boy.lastName}`,
    ageAtMeet: 14,
    ageGroup: "13-14",
    gender: "M",
    status: "confirmed",
    events: [withSeed
      ? { eventNo: 19, ageGroup: "13-14", distance: 100, stroke: "BR", sessionId: "fri-am", course: "SCY", seedTime: "1:12.30", seedSeconds: 72.3, source: "db" }
      : { eventNo: 19, ageGroup: "13-14", distance: 100, stroke: "BR", sessionId: "fri-am" }],
    confirmedAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedRelay({ meetId, boys }) {
  await seedDocument(`meets/${meetId}/relayEntries`, "9A__A", {
    meetId,
    eventNo: 9,
    eventCode: "9A",
    ageGroup: "13-14",
    gender: "M",
    distance: 200,
    stroke: "MED",
    letter: "A",
    legs: boys.map((b) => ({
      usaSwimmingId: b.usaSwimmingId, firstName: b.firstName, lastName: b.lastName, gender: "M",
    })),
    seedSeconds: 125.4,
    courseLetter: "Y",
    status: "confirmed",
    updatedAt: new Date(),
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

async function openEntriesModal(page, meetName) {
  await page.click('.dash-nav-item[data-tab="meets"]');
  const card = page.locator(".dash-card", { hasText: meetName }).first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.locator(".meet-entries-btn").click();
  await expect(page.locator("#meet-entries-container .meet-entries-modal")).toBeVisible({ timeout: 15000 });
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("the coach downloads a zip named the way Team Manager names it", async ({ page }) => {
  const { meetId } = await seedMeet("Export Test Invitational");
  const family = await seedFamily({ count: 4 });
  await seedEntry({ meetId, uid: family.uid, boy: family.boys[0] });
  await seedRelay({ meetId, boys: family.boys });

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);
  await openEntriesModal(page, "Export Test Invitational");

  const button = page.locator('#meet-entries-container [data-action="export-zip"]');
  await expect(button).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    button.click(),
  ]);

  const name = download.suggestedFilename();
  expect(name).toMatch(/^DRAG-PV-Entries-Export Test Invitational-\d{2}[A-Za-z]{3}\d{4}-001\.ZIP$/);
  const stream = await download.createReadStream();
  let bytes = 0;
  for await (const chunk of stream) bytes += chunk.length;
  expect(bytes).toBeGreaterThan(400);

  // The footer reports what went in, so the coach can sanity-check before sending.
  await expect(page.locator("#me-export-note")).toContainText("swimmers", { timeout: 15000 });
  await expect(page.locator("#me-export-note")).toContainText("relay squads");
  await expect(button).toBeEnabled();
});

test("a missing seed time blocks the download and says so", async ({ page }) => {
  const { meetId } = await seedMeet("Export Refusal Invitational");
  const family = await seedFamily({ count: 1 });
  await seedEntry({ meetId, uid: family.uid, boy: family.boys[0], withSeed: false });

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);
  await openEntriesModal(page, "Export Refusal Invitational");

  let downloaded = false;
  page.on("download", () => { downloaded = true; });

  await page.click('#meet-entries-container [data-action="export-zip"]');
  await expect(page.locator("#me-export-note")).toContainText("Nothing exported", { timeout: 15000 });
  await expect(page.locator("#me-export-note")).toContainText("missing-seed-time");
  expect(downloaded).toBe(false);
});

test("a family never sees the export button", async ({ page }) => {
  await seedMeet("Export Family Invitational", { openToFamilies: true });
  const family = await seedFamily({ count: 2 });

  await signIn(page, family.email);
  await openEntriesModal(page, "Export Family Invitational");

  await expect(page.locator("#meet-entries-container .meet-entries-modal")).toBeVisible();
  await expect(page.locator('#meet-entries-container [data-action="export-zip"]')).toHaveCount(0);
});
