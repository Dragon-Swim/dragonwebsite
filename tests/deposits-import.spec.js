/**
 * E2E — Meet Fee Deposits importers (coach dashboard → 🏦 Meet Fee Deposits).
 *
 * Run with `npm test` (Firebase emulators + dev server pointed at them).
 *
 * Why these tests exist (2026-10-02 incident): both spreadsheets the coaches
 * uploaded landed in Firestore wrong —
 *   1. the carry-over balance sheet's negative balances (a family that still
 *      owes money) arrived sign-stripped, because the parser treated `bal < 0`
 *      as invalid;
 *   2. the deposit sheet's amount column was headed "depoist", matched nothing,
 *      and the importer still created 13 name-only records.
 * So each test below asserts the fix through the real UI + real rules:
 *   • the preview shows the column mapping (which column each field came from),
 *   • a negative balance is written as negative and rendered as -$182.00,
 *   • a single "depoist" column goes into Deposit 1 (not an empty record),
 *   • re-uploading the same sheet does not double-count,
 *   • a sheet with no writable amount column writes nothing at all.
 *
 * Fixtures go in through the emulator REST API (tests/helpers/emulator.js);
 * spreadsheets are generated on the fly into .tmp/pw-tmp (wiped by the runner).
 */

import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertEmulatorReady, seedDocument, seedStaffUser, readDocument, listDocuments } from "./helpers/emulator.js";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASSWORD = "Test1234!";
let seq = 0;
const unique = (tag) => `dep-${tag}-${Date.now()}-${seq++}@example.com`;

/** The app's own season rule (dashboard.js getDefaultSeason): seasons start in September. */
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** Write an array-of-arrays workbook into .tmp/pw-tmp and return its path. */
function writeWorkbook(rows, name) {
  const dir = path.join(repoRoot, ".tmp", "pw-tmp");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Sheet1");
  XLSX.writeFile(wb, file);
  return file;
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
  // The Firebase SDK pins a "Running in emulator mode" banner over the page; in
  // this viewport it sits on top of the preview modal's buttons and swallows the
  // click. It exists only under the emulator, so hide it from the tests.
  await page.addStyleTag({ content: ".firebase-emulator-warning { display: none !important; }" });
}

async function openDepositsTab(page, season) {
  await page.click('.dash-nav-item[data-tab="deposits"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Meet Fee Deposits");
  await page.selectOption("#deposits-season-select", season);
}

/** Click an upload button, feed it `file`, and return the preview modal. */
async function uploadVia(page, buttonId, file) {
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click(buttonId),
  ]);
  await chooser.setFiles(file);
  const modal = page.locator(".confirm-modal.csv-import-modal");
  await expect(modal).toBeVisible({ timeout: 15000 });
  return modal;
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("carry-over balance import keeps the sign and shows the column mapping", async ({ page }) => {
  const season = currentSeason();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  // One swimmer already has a record (update path), one does not (create path).
  await seedDocument("deposits", "dep-existing", {
    swimmerName: "ada gai",
    season,
    balance: 600,
    deposit1Amount: null, deposit1Date: null,
    deposit2Amount: null, deposit2Date: null,
    deposit3Amount: null, deposit3Date: null,
    updatedAt: new Date(),
    updatedBy: "fixture@example.com",
  });

  await signIn(page, email);
  await openDepositsTab(page, season);

  const newKid = `new kid ${Date.now()}`;
  const file = writeWorkbook([
    [`meet balance for ${season}`], // a title row above the header, as in the real sheet
    ["name ", "amount", "deposit", "balance"],
    ["ada gai", 482, 300, -182], // negative = still owes money
    [newKid, 100, 350, 250],
  ], `balance-${Date.now()}.xlsx`);

  const modal = await uploadVia(page, "#deposits-upload-balance-btn", file);

  // The preview says which spreadsheet column each written field came from…
  await expect(modal).toContainText("Columns detected");
  await expect(modal).toContainText('balance ← D ("balance")');
  // …which rows are new vs updated…
  await expect(modal).toContainText("1 new record(s) · 1 existing record(s) will be updated");
  // …and the signed value, minus in front.
  await expect(modal).toContainText("-$182.00");
  await page.locator("#carryover-import-confirm").click();
  await expect(modal).toBeHidden();

  // The existing record was updated in place and kept the negative sign.
  await expect
    .poll(async () => (await readDocument("deposits", "dep-existing"))?.balance ?? null, { timeout: 15000 })
    .toBe(-182);

  // The other row created a new record for the selected season.
  const created = (await listDocuments("deposits")).find((d) => d.season === season && d.swimmerName === newKid);
  expect(created).toBeTruthy();
  expect(created.balance).toBe(250);
  expect(created.updatedBy).toBe(email);

  // The table renders it as -$182.00 (not "$-182.00").
  await expect(page.locator("#dep-row-dep-existing .deposits-balance .dep-view")).toHaveText("-$182.00");
});

test("a single-amount deposit sheet fills Deposit 1 and never double-counts", async ({ page }) => {
  const season = currentSeason();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  const stamp = Date.now();
  const kidA = `dep kid a ${stamp}`;
  const kidB = `dep kid b ${stamp}`;

  await signIn(page, email);
  await openDepositsTab(page, season);

  const file = writeWorkbook([
    ["name ", "depoist"], // the coaches' own spelling
    [kidA, 400],
    [kidB, 200],
  ], `deposit-${stamp}.xlsx`);

  const modal = await uploadVia(page, "#deposits-upload-detail-btn", file);
  await expect(modal).toContainText('amount ← B ("depoist")');
  await expect(modal).toContainText("Deposit 1");
  await page.locator("#detail-import-confirm").click();
  await expect(modal).toBeHidden();

  const mine = () => listDocuments("deposits").then((all) =>
    all.filter((d) => d.season === season && (d.swimmerName === kidA || d.swimmerName === kidB)));
  await expect.poll(async () => (await mine()).length, { timeout: 15000 }).toBe(2);
  for (const row of await mine()) {
    expect(Number(row.deposit1Amount)).toBeGreaterThan(0);
    // No empty shells: the amount really landed in the slot.
    expect(Number(row.deposit1Amount)).toBe(row.swimmerName === kidA ? 400 : 200);
  }

  // Re-uploading the same sheet must skip the amounts instead of counting twice.
  const again = await uploadVia(page, "#deposits-upload-detail-btn", file);
  await expect(again).toContainText("Skipped rows");
  await expect(again).toContainText("already recorded as Deposit 1");
  await expect(again.locator("#detail-import-confirm")).toHaveCount(0);
  await again.locator("#detail-import-cancel").click();
  await expect(again).toBeHidden();

  const after = await mine();
  expect(after).toHaveLength(2);
  for (const row of after) {
    expect(Number(row.deposit2Amount) || 0).toBe(0);
    expect(Number(row.deposit3Amount) || 0).toBe(0);
  }
});

test("a sheet with no writable amount column is refused before anything is written", async ({ page }) => {
  const season = currentSeason();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");

  await signIn(page, email);
  await openDepositsTab(page, season);

  // "Amount" alone is refused on purpose (on a balance sheet it is the fees owed,
  // not a payment) — this is the sheet shape that used to create empty records.
  const refusedKid = `refused kid ${Date.now()}`;
  const file = writeWorkbook([["Name", "Amount"], [refusedKid, 482]], `no-amount-${Date.now()}.xlsx`);

  let dialogMessage = null;
  page.on("dialog", async (dialog) => { dialogMessage = dialog.message(); await dialog.accept(); });

  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click("#deposits-upload-detail-btn"),
  ]);
  await chooser.setFiles(file);

  await expect.poll(() => dialogMessage, { timeout: 15000 }).toContain("Could not find a deposit amount column");
  await expect(page.locator(".confirm-modal.csv-import-modal")).toHaveCount(0);
  // Nothing was written — not even a name-only record (the 2026-10-02 regression).
  const written = (await listDocuments("deposits")).filter((d) => d.swimmerName === refusedKid);
  expect(written).toHaveLength(0);
});
