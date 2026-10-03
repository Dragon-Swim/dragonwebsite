/**
 * E2E — Meet Management: editing a meet's TITLE (coach dashboard).
 *
 * Regression guard for the coach report: "I click Edit on
 * `PVS October Open (Audrey Moore)`, update the details, but the title never
 * changes." The dashboard writes the whole form back with one updateDoc, so a
 * field that silently does not round-trip (empty input, wrong element, form
 * wiped by a re-render) shows up in Firestore only as a stale value.
 *
 * Every fixture carries a unique tag in its NAME, not just in its document id:
 * all pages listen to the whole `meets` collection, so two tests using the same
 * title can click each other's cards.
 *
 * Run with `npm test` (Firebase emulators + dev server pointed at them).
 */

import { test, expect } from "@playwright/test";
import { assertEmulatorReady, seedDocument, seedStaffUser, readDocument, deleteDocument } from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
// `seq` alone is not enough: Playwright runs the tests of one file in separate
// worker processes, and each worker starts its own counter — two tests seeding in
// the same millisecond then share a document id and delete each other's fixtures.
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `meet-${tag}-${Date.now()}-${rand()}@example.com`;
const uniqueId = (tag) => `meet-${tag}-${Date.now()}-${rand()}`;

/** The app's season rule (dashboard.js getDefaultSeason): seasons start in September. */
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

const MEET_DATE = `${currentSeason().slice(0, 4)}-10-09`;

/** One meet, in the current season, with the same shape the dashboard writes. */
async function seedMeet(season, name) {
  const meetId = uniqueId("m");
  await seedDocument("meets", meetId, {
    name,
    startDate: MEET_DATE,
    endDate: MEET_DATE,
    location: "Claude Moore Recreation Center",
    season,
    status: "Open",
    sourceUrl: "https://www.files.pvswim.org/2627meet/27-07-ma.pdf",
    createdAt: new Date(),
  });
  return meetId;
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

/** Sign in as a fresh admin and open the Meet Management tab. */
async function openMeetTab(page, withMeetName) {
  const season = currentSeason();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");
  const meetId = await seedMeet(season, withMeetName);
  await signIn(page, email);
  await page.click('.dash-nav-item[data-tab="meets"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Meet Management");
  const card = page.locator(".dash-card", { hasText: withMeetName }).first();
  await expect(card).toBeVisible({ timeout: 15000 });
  return { season, meetId, card };
}

/**
 * Save the open form and wait for the document to change.
 *
 * The click is retried on purpose: the whole suite shares one emulator, and any
 * other spec's write re-renders this page, so the button can be replaced between
 * Playwright's actionability check and the click dispatch. The assertion (the
 * stored document) is unchanged; only the click repeats.
 */
async function saveMeetAndExpect(page, meetId, expectedName) {
  await expect
    .poll(async () => {
      await page.click("#save-meet-btn", { timeout: 2000 }).catch(() => {});
      return (await readDocument("meets", meetId))?.name ?? null;
    }, { timeout: 20000, intervals: [400, 800, 1500, 2000] })
    .toBe(expectedName);
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("admin renames a meet from the Edit form, the card and Firestore follow", async ({ page }) => {
  const tag = rand();
  const oldTitle = `PVS October Open (Audrey Moore) #${tag}`;
  const newTitle = `PVS October Open #${tag}`;
  const { meetId, card } = await openMeetTab(page, oldTitle);

  // ── Open the edit form and prove the title round-trips INTO it ──
  await card.locator(".edit-meet").click();
  const nameInput = page.locator("#meet-name");
  await expect(nameInput).toBeVisible();
  await expect(nameInput).toHaveValue(oldTitle);

  // ── Retype the title the way a human does: select-all, then type ──
  await nameInput.click();
  await nameInput.press("Control+a");
  await nameInput.press("Delete");
  await expect(nameInput).toHaveValue("");
  await nameInput.type(newTitle, { delay: 20 });
  await expect(nameInput).toHaveValue(newTitle);

  // ── Firestore must carry the new name (the dashboard writes it in one updateDoc) ──
  await saveMeetAndExpect(page, meetId, newTitle);

  // ── And the card re-renders with it ──
  await expect(page.locator(".dash-card", { hasText: newTitle }).first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".dash-card", { hasText: oldTitle })).toHaveCount(0);

  await deleteDocument("meets", meetId);
});

/**
 * The dashboard rebuilds the whole view on EVERY live Firestore snapshot
 * (`onSnapshot(...) => refreshUI()` in initDataListeners). The meet form is part
 * of that view, so a write from anyone else — another admin editing data, a
 * parent enrolling, a volunteer-hours autosave — used to close the form and drop
 * whatever was typed but not yet saved. "The title will not change" is exactly
 * how that feels from the coach's chair.
 */
test("a live update from someone else cannot wipe a half-typed title", async ({ page }) => {
  const tag = rand();
  const oldTitle = `PVS October Open (Audrey Moore) #${tag}`;
  const newTitle = `PVS October Open #${tag}`;
  const { season, meetId, card } = await openMeetTab(page, oldTitle);

  await card.locator(".edit-meet").click();
  const nameInput = page.locator("#meet-name");
  await expect(nameInput).toBeVisible();
  await nameInput.click();
  await nameInput.press("Control+a");
  await nameInput.type(newTitle, { delay: 20 });
  await expect(nameInput).toHaveValue(newTitle);

  // Someone else adds a meet → our page gets a snapshot and rebuilds.
  const decoyId = await seedMeet(season, `Concurrent Update Meet #${tag}`);

  // The half-typed title has to still be there, in an open form.
  await expect(page.locator("#add-meet-form")).toBeVisible({ timeout: 15000 });
  await expect(nameInput).toHaveValue(newTitle);

  await saveMeetAndExpect(page, meetId, newTitle);

  await deleteDocument("meets", meetId);
  await deleteDocument("meets", decoyId);
});

/**
 * The Edit handler scrolls the form into view, and the topbar is sticky (95px).
 * Without the CSS scroll-margin, the form parked with its first row — the meet
 * NAME — under the topbar: the date and location boxes could be clicked, the
 * title could not. The click below is the assertion: Playwright refuses to click
 * an element whose centre is covered by something else.
 */
test("the name field is clickable when the form opens from a scrolled page", async ({ page }) => {
  const season = currentSeason();
  const tag = rand();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  // Enough meets that the page scrolls, so the form starts off-screen above.
  const ids = [];
  for (let i = 0; i < 6; i++) ids.push(await seedMeet(season, `Scroll Filler Meet #${tag} ${i}`));
  const targetId = ids[5];

  await page.setViewportSize({ width: 1280, height: 600 });
  await signIn(page, email);
  await page.click('.dash-nav-item[data-tab="meets"]');

  const card = page.locator(".dash-card", { hasText: `Scroll Filler Meet #${tag} 5` }).first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.scrollIntoViewIfNeeded();
  await card.locator(".edit-meet").click();

  const nameInput = page.locator("#meet-name");
  await expect(nameInput).toBeVisible();
  await nameInput.click({ timeout: 5000 }); // fails when something covers the field

  const renamed = `Renamed From A Scrolled Page #${tag}`;
  await nameInput.fill(renamed);
  await saveMeetAndExpect(page, targetId, renamed);

  for (const id of ids) await deleteDocument("meets", id);
});
