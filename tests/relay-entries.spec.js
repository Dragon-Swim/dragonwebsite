/**
 * E2E — relay line-ups (coach only).
 *
 * What this protects
 * ------------------
 * 1. The relay editor is reachable from the entries modal and lists the meet's
 *    relay events (not the individual ones).
 * 2. A saved squad lands in `meets/{id}/relayEntries/{eventCode}__{letter}` with
 *    **legs in the order the coach picked** — that order is the only thing a CL2
 *    can carry, so losing it silently would make the file wrong in a way nobody
 *    notices until the relay is swum.
 * 3. An incomplete or duplicate squad cannot be saved (hard validation), and the
 *    error is explained in the panel rather than thrown away.
 * 4. A family never sees the Relays button: relays belong to the club.
 *
 * Fixtures are planted through the emulator REST API; the writes under test go
 * through the UI. Every id is unique per test (shared emulator, parallel workers).
 */

import { test, expect } from "@playwright/test";
import {
  assertEmulatorReady, seedDocument, readDocument, seedAuthUser, seedStaffUser,
} from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `relay-${tag}-${Date.now()}-${rand()}@example.com`;
const uniqueId = (tag) => `relay-${tag}-${Date.now()}-${rand()}`;
const newUsaId = () => `R${Date.now().toString(36)}${rand()}`.toUpperCase().slice(0, 14);

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

/** A meet with one boys 13-14 medley relay, capped at two squads. */
async function seedMeet(name, { openToFamilies = false } = {}) {
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
    relayLimitPerClub: 2,
    entriesOpenToFamilies: openToFamilies,
    limits: { maxEvents: 6, maxPerDay: 3 },
    sessions: [{ id: "fri-am", date: isoDate(start), day: "Fri", start: "8:05 AM" }],
    events: [
      { eventNo: 9, eventCode: "9A", gender: "M", ageGroup: "13-14", ageMin: 13, ageMax: 14,
        distance: 200, stroke: "MED", relay: true, sessionId: "fri-am", standards: { SCY: 120.99, LCM: null } },
      { eventNo: 19, eventCode: "19A", gender: "M", ageGroup: "13-14", ageMin: 13, ageMax: 14,
        distance: 100, stroke: "BR", relay: false, sessionId: "fri-am", standards: { SCY: 76.69, LCM: 82.99 } },
    ],
  });
  return { meetId, start };
}

/** One family registration holding `count` boys aged 13-14. */
async function seedFamilyWithBoys({ count = 4 } = {}) {
  const email = unique("family");
  const uid = await seedAuthUser(email, PASSWORD);
  await seedDocument("users", uid, { email, role: "swimmer", createdAt: new Date() });
  const boys = [];
  for (let i = 0; i < count; i += 1) {
    const tag = `${i}${rand().slice(0, 3)}`;
    boys.push({
      firstName: `Boy${i}`,
      lastName: `Alpha${tag}`,
      gender: "male",
      dob: `${new Date().getFullYear() - 13}-06-01`,
      usaSwimmingId: newUsaId(),
    });
  }
  await seedDocument("registrations", uid, {
    parent: { firstName: "Relay", lastName: "Parent", email },
    parentEmails: [email],
    editors: [],
    swimmers: boys,
    createdAt: new Date(),
  });
  return { email, uid, boys };
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

/** Meets tab → the meet's Entries modal (coach view is the list). */
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

test("a coach builds a relay squad and the leg order is stored", async ({ page }) => {
  const { meetId } = await seedMeet("Relay Test Invitational");
  const { boys } = await seedFamilyWithBoys({ count: 4 });

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);

  await openEntriesModal(page, "Relay Test Invitational");

  // The relay panel only lists relay events.
  await page.click('#meet-entries-container [data-action="relays"]');
  const panel = page.locator("#relay-entries-container");
  await expect(panel.locator(".meet-entries-modal")).toBeVisible({ timeout: 15000 });
  await expect(panel.locator('tr[data-relay-row="9A"]')).toBeVisible();
  await expect(panel.locator("tbody tr")).toHaveCount(1);

  // Start squad A and fill all four legs, deliberately not in surname order —
  // the running order is the coach's call, not alphabetical.
  await page.click('#relay-entries-container [data-action="add"][data-code="9A"][data-letter="A"]');
  const order = [2, 0, 3, 1].map((i) => boys[i]);
  for (let leg = 0; leg < 4; leg += 1) {
    await page.selectOption(`#relay-entries-container select[data-leg="${leg}"]`, order[leg].usaSwimmingId);
  }
  await page.fill("#relay-seed", "2:05.40");
  await expect(page.locator("#relay-errors .mr-ok")).toBeVisible();
  await page.click('#relay-entries-container [data-action="save"]');

  // Back to the list, with the squad shown by surname.
  await expect(page.locator('#relay-entries-container [data-action="edit"][data-letter="A"]')).toBeVisible({ timeout: 15000 });

  const doc = await readDocument(`meets/${meetId}/relayEntries`, "9A__A");
  expect(doc).not.toBeNull();
  expect(doc.eventCode).toBe("9A");
  expect(doc.letter).toBe("A");
  expect(doc.seedSeconds).toBeCloseTo(125.4, 2);
  expect(doc.legs).toHaveLength(4);
  expect(doc.legs.map((l) => l.usaSwimmingId)).toEqual(order.map((b) => b.usaSwimmingId));
  expect(doc.legs[0].lastName).toBe(order[0].lastName);
});

test("an incomplete or duplicated squad cannot be saved", async ({ page }) => {
  const { meetId } = await seedMeet("Relay Validation Invitational");
  const { boys } = await seedFamilyWithBoys({ count: 4 });

  const coachEmail = unique("coach");
  await seedStaffUser(coachEmail, PASSWORD, "coach");
  await signIn(page, coachEmail);
  await openEntriesModal(page, "Relay Validation Invitational");
  await page.click('#meet-entries-container [data-action="relays"]');
  await expect(page.locator("#relay-entries-container .meet-entries-modal")).toBeVisible({ timeout: 15000 });

  await page.click('#relay-entries-container [data-action="add"][data-code="9A"][data-letter="A"]');

  // Three legs: the panel says so and the save does not write anything.
  for (let leg = 0; leg < 3; leg += 1) {
    await page.selectOption(`#relay-entries-container select[data-leg="${leg}"]`, boys[leg].usaSwimmingId);
  }
  await expect(page.locator("#relay-errors .me-error")).toContainText("four swimmers");
  await page.click('#relay-entries-container [data-action="save"]');
  await expect(page.locator("#relay-entries-container .me-error").first()).toBeVisible();
  expect(await readDocument(`meets/${meetId}/relayEntries`, "9A__A")).toBeNull();

  // The same swimmer twice is rejected as well.
  await page.selectOption('#relay-entries-container select[data-leg="3"]', boys[0].usaSwimmingId);
  await expect(page.locator("#relay-errors .me-error")).toContainText("two legs");
  await page.click('#relay-entries-container [data-action="save"]');
  expect(await readDocument(`meets/${meetId}/relayEntries`, "9A__A")).toBeNull();

  // Fixing the fourth leg lets it through.
  await page.selectOption('#relay-entries-container select[data-leg="3"]', boys[3].usaSwimmingId);
  await expect(page.locator("#relay-errors .mr-ok")).toBeVisible();
  await page.click('#relay-entries-container [data-action="save"]');
  await expect(page.locator('#relay-entries-container [data-action="edit"][data-letter="A"]')).toBeVisible({ timeout: 15000 });
  expect((await readDocument(`meets/${meetId}/relayEntries`, "9A__A"))?.legs).toHaveLength(4);
});

test("a family never sees the relay editor", async ({ page }) => {
  // The family flow is only reachable when the meet opens self-service entries.
  await seedMeet("Relay Family Invitational", { openToFamilies: true });
  // Two swimmers so the modal opens on its picker (coach list view) rather than
  // jumping straight into one child's editor.
  const { email } = await seedFamilyWithBoys({ count: 2 });

  await signIn(page, email);
  await openEntriesModal(page, "Relay Family Invitational");

  await expect(page.locator("#meet-entries-container .meet-entries-modal")).toBeVisible();
  await expect(page.locator('#meet-entries-container [data-action="relays"]')).toHaveCount(0);
});
