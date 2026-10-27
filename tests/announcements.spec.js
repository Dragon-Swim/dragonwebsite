/**
 * E2E — Homepage announcements editor (Dashboard → Announcements).
 *
 * Run with `npm test` (Firebase emulators + dev server pointed at them).
 *
 * What is covered:
 *   1. an admin publishes a notice → the document lands in Firestore with the
 *      shape the public homepage reads, the preview shows it, the list says LIVE
 *      + PINNED, editing keeps the same document id (families who dismissed the
 *      banner are not re-alerted), deleting removes it;
 *   2. pinning a second notice unpins the first — only one banner exists;
 *   3. a plain coach has no Announcements tab (publishing is admin-only, and the
 *      Firestore rules enforce the same thing server-side).
 *
 * The homepage itself cannot be asserted here: in emulator mode it deliberately
 * skips the public REST read (see src/data/announcements.remote.js). The document
 * shape asserted below is exactly what unit tests feed into that mapper
 * (tests/unit/verify-announcements.mjs).
 *
 * Fixtures: none. Everything is driven through the UI, because the rules are part
 * of what is being tested. Created docs are removed afterwards — firebase.json
 * exports the emulator data on exit, so leftovers would leak into the next run.
 */

import { test, expect } from "@playwright/test";
import {
  assertEmulatorReady,
  seedStaffUser,
  listDocuments,
  deleteDocument,
} from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const PREFIX = "Playwright notice";

// Serial: `unpinOthers()` deliberately touches every pinned doc in the
// collection, so two tests running at once would unpin each other's fixtures.
test.describe.configure({ mode: "serial" });

const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `news-${tag}-${Date.now()}-${rand()}@example.com`;
const title = (tag) => `${PREFIX} ${tag} ${Date.now()}${rand()}`;

/** Local YYYY-MM-DD (never toISOString — that shifts the day near midnight). */
function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

async function openAnnouncements(page) {
  await page.click('.dash-nav-item[data-tab="news"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Homepage Announcements");
  await expect(page.locator("#news-form")).toBeVisible({ timeout: 15000 });
  // The list finishes loading asynchronously; "Loading…" must disappear first.
  await expect(page.locator("#news-admin-status")).not.toHaveText("Loading…", { timeout: 15000 });
}

async function fillForm(page, { titleText, body, level = "info", pinned = false, until }) {
  await page.fill("#news-title", titleText);
  await page.fill("#news-body", body);
  await page.selectOption("#news-level", level);
  if (pinned) await page.check("#news-pinned"); else await page.uncheck("#news-pinned");
  await page.fill("#news-date", isoDaysFromNow(0));
  if (until) await page.fill("#news-until", until);
}

async function publish(page) {
  await page.click("#news-save-btn");
  await expect(page.locator("#news-form-msg")).toContainText("Saved", { timeout: 15000 });
}

/** Documents this spec created (by title prefix) — removed in afterEach. */
async function cleanUp() {
  const docs = await listDocuments("announcements");
  for (const doc of docs) {
    if (String(doc.title || "").startsWith(PREFIX)) await deleteDocument("announcements", doc.id);
  }
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test.afterEach(async () => {
  await cleanUp();
});

test("admin publishes a notice the homepage can read, edits it in place, then deletes it", async ({ page }) => {
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  await signIn(page, email);
  await openAnnouncements(page);
  await cleanUp();

  const headline = title("main");
  await fillForm(page, {
    titleText: headline,
    body: "First paragraph, the one the banner shows.\n\nSecond paragraph for the News card.",
    level: "urgent",
    pinned: true,
    until: isoDaysFromNow(3),
  });

  // ── Live preview: banner + card, before saving ──
  await expect(page.locator("#news-preview-banner .news-banner-title")).toHaveText(headline);
  await expect(page.locator("#news-preview-card .news-card-title")).toHaveText(headline);
  await expect(page.locator("#news-preview-banner .news-banner-text")).toContainText("the banner shows");

  await publish(page);

  // ── List row ──
  const row = page.locator(".news-admin-row", { hasText: headline });
  await expect(row).toHaveCount(1, { timeout: 15000 });
  await expect(row).toContainText("LIVE");
  await expect(row).toContainText("PINNED");
  await expect(row).toContainText("URGENT");

  // ── Firestore shape — this is what the public page maps ──
  const docs = (await listDocuments("announcements")).filter((d) => d.title === headline);
  expect(docs).toHaveLength(1);
  const doc = docs[0];
  expect(doc.level).toBe("urgent");
  expect(doc.pinned).toBe(true);
  expect(doc.date).toBe(isoDaysFromNow(0));
  expect(doc.until).toBe(isoDaysFromNow(3));
  expect(doc.body).toContain("Second paragraph");
  expect(doc.updatedByEmail).toBe(email);
  expect(doc.createdByEmail).toBe(email);
  expect(doc.updatedAt).toBeTruthy();

  // ── Edit keeps the same document id (dismissed banners stay dismissed) ──
  await row.locator('[data-action="edit"]').click();
  await expect(page.locator("#news-title")).toHaveValue(headline);
  await expect(page.locator("#news-save-btn")).toHaveText("Save changes");

  const edited = `${headline} (edited)`;
  await page.fill("#news-title", edited);
  await page.uncheck("#news-pinned");
  await publish(page);

  await expect(page.locator(".news-admin-row", { hasText: edited })).toHaveCount(1, { timeout: 15000 });
  const afterEdit = await listDocuments("announcements");
  expect(afterEdit.filter((d) => d.title === headline)).toHaveLength(0);
  const editedDocs = afterEdit.filter((d) => d.title === edited);
  expect(editedDocs).toHaveLength(1);
  expect(editedDocs[0].id).toBe(doc.id);
  expect(editedDocs[0].pinned).toBe(false);

  // ── Delete ──
  page.on("dialog", (dialog) => dialog.accept());
  await page.locator(".news-admin-row", { hasText: edited }).locator('[data-action="delete"]').click();
  await expect(page.locator(".news-admin-row", { hasText: edited })).toHaveCount(0, { timeout: 15000 });
  expect((await listDocuments("announcements")).filter((d) => d.title === edited)).toHaveLength(0);
});

test("pinning a second notice unpins the first", async ({ page }) => {
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  await signIn(page, email);
  await openAnnouncements(page);
  await cleanUp();

  const first = title("first");
  const second = title("second");

  await fillForm(page, { titleText: first, body: "First notice.", pinned: true });
  await publish(page);
  await expect(page.locator(".news-admin-row", { hasText: first })).toContainText("PINNED");

  await fillForm(page, { titleText: second, body: "Second notice.", pinned: true });
  await publish(page);

  await expect(page.locator(".news-admin-row", { hasText: first })).not.toContainText("PINNED", { timeout: 15000 });
  await expect(page.locator(".news-admin-row", { hasText: second })).toContainText("PINNED");

  const docs = (await listDocuments("announcements")).filter(
    (d) => d.title === first || d.title === second
  );
  expect(docs).toHaveLength(2);
  expect(docs.find((d) => d.title === first).pinned).toBe(false);
  expect(docs.find((d) => d.title === second).pinned).toBe(true);
});

test("a plain coach does not get the Announcements tab", async ({ page }) => {
  const email = unique("coach");
  await seedStaffUser(email, PASSWORD, "coach");

  await signIn(page, email);
  // Coach nav: no Announcements entry (it sits in the admin-only block).
  await expect(page.locator('.dash-nav-item[data-tab="volunteer"]')).toBeVisible();
  await expect(page.locator('.dash-nav-item[data-tab="news"]')).toHaveCount(0);
});
