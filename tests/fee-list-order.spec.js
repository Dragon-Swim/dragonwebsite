/**
 * E2E — row order of the coach dashboard's "Meet Fee Summary" and
 * "Meet Fee Deposits" tabs.
 *
 * 2026-10-03: both lists were ordered by accident. The Fee Summary pinned every
 * negative balance (families that still owe money) above everything else and
 * sorted the rest by the raw name string; Deposits used `localeCompare` on the
 * raw string, so "Luo-han Chen" sorted away from "Luohan Chen". Both now share
 * the Roster / Swim Times order (src/utils/swimmerSort.js): surname first, given
 * name as the tiebreak — and a negative balance is styled, not re-ordered.
 *
 * Pinned here because a unit test cannot reach the rendered table:
 *   1. the negative-balance swimmer does NOT jump to the top;
 *   2. with no registration the surname is the LAST word ("Anjka"-style
 *      single-token names sort under their own letter);
 *   3. when the registration knows the child, its name parts win — the compound
 *      surname "Martin del Campo" sorts under M, not under C ("campo").
 *
 * Fixtures go in through the emulator REST API (tests/helpers/emulator.js).
 * The surnames are deliberately odd (Aardvark / Dune / Quill / Quokka / Zephyr)
 * so no other spec's rows can land between them: every page listens to the whole
 * collection, and the assertions are relative between our own rows.
 */

import { test, expect } from "@playwright/test";
import { assertEmulatorReady, seedDocument, seedStaffUser } from "./helpers/emulator.js";

const PASSWORD = "Test1234!";
const rand = () => Math.random().toString(36).slice(2, 8);
const unique = (tag) => `order-${tag}-${Date.now()}-${rand()}@example.com`;

/** The app's own season rule (dashboard.js getDefaultSeason): seasons start in September. */
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

const AARDVARK = "Aaa Aardvark";   // fee only  → balance   0
const QUILL = "Cee Quill";         // fee only  → balance -35 (the "owes money" row)
const DEL_CAMPO = "Gabriel Martin del Campo"; // fee + a registration with the compound surname
const DUNE = "Bee Dune";           // deposit only
const QUOKKA = "Quokka";           // deposit only, one word
const ZEPHYR = "Dee Zephyr";       // deposit only

const depositDoc = (name, amount, season) => ({
  swimmerName: name,
  season,
  balance: 0,
  deposit1Amount: amount, deposit1Date: todayISO(),
  deposit2Amount: null, deposit2Date: null,
  deposit3Amount: null, deposit3Date: null,
  updatedAt: new Date(),
  updatedBy: "playwright-seed",
});

async function seedFeeOrderFixtures(season) {
  // `createdAt` is REQUIRED: the dashboard reads meets and registrations with
  // `orderBy(createdAt)`, and Firestore silently omits documents lacking it.
  await seedDocument("meets", `order-meet-${rand()}`, {
    name: `Fee Order Test Meet #${rand()}`,
    startDate: todayISO(),
    endDate: todayISO(),
    location: "Test Pool",
    season,
    status: "Open",
    sourceUrl: null,
    createdAt: new Date(),
    feeData: {
      swimmers: [
        { name: AARDVARK, total: 0 },
        { name: QUILL, total: 35 },
        { name: DEL_CAMPO, total: 25 },
      ],
    },
  });

  // The registration is what makes "Martin del Campo" sort under M: the
  // Dashboard resolves the real firstName/lastName through it (swimmerSort.js).
  await seedDocument("registrations", `order-reg-${rand()}`, {
    parent: { firstName: "Gabriel", lastName: "Martin del Campo", email: "campo@example.com" },
    spouse: null,
    swimmers: [{ firstName: "Gabriel", lastName: "Martin del Campo", gender: "male", dob: "2014-04-04" }],
    parentEmails: ["campo@example.com"],
    editors: [],
    createdAt: new Date(),
  });

  await seedDocument("deposits", `order-dep-dune-${rand()}`, depositDoc(DUNE, 100, season));
  await seedDocument("deposits", `order-dep-quokka-${rand()}`, depositDoc(QUOKKA, 10, season));
  await seedDocument("deposits", `order-dep-zephyr-${rand()}`, depositDoc(ZEPHYR, 50, season));
}

async function signIn(page, email) {
  await page.goto("/signin.html");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 20000 });
  await expect(page.locator(".dash-nav")).toBeVisible({ timeout: 15000 });
}

/** Position of each name in the rendered list, or -1 when it is missing. */
function positions(rendered, names) {
  return names.map((n) => rendered.indexOf(n));
}

test.beforeAll(async () => {
  await assertEmulatorReady();
});

test("Fee Summary and Deposits list swimmers by last name", async ({ page }) => {
  const season = currentSeason();
  const email = unique("admin");
  await seedStaffUser(email, PASSWORD, "admin");
  await seedFeeOrderFixtures(season);

  await signIn(page, email);

  // ── Fee Summary ──
  await page.click('.dash-nav-item[data-tab="feesummary"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Meet Fee Summary");
  await page.selectOption("#season-select", season);
  // The join needs the meets listener; wait until every fixture row is on screen.
  for (const name of [AARDVARK, QUILL, DEL_CAMPO, DUNE, QUOKKA, ZEPHYR]) {
    await expect(page.locator(".fee-summary-main-row .fee-summary-name").filter({ hasText: name }))
      .toHaveCount(1, { timeout: 15000 });
  }

  const feeNames = await page.locator(".fee-summary-main-row .fee-summary-name").allInnerTexts();
  const [aardvark, quill, delCampo, dune, quokka, zephyr] =
    positions(feeNames, [AARDVARK, QUILL, DEL_CAMPO, DUNE, QUOKKA, ZEPHYR]);
  expect(feeNames.length, `rendered: ${feeNames.join(" | ")}`).toBeGreaterThan(0);

  // Surname order end to end: Aardvark, Dune, Martin del Campo, Quill, Quokka, Zephyr.
  expect(aardvark, `rendered: ${feeNames.join(" | ")}`).toBeGreaterThanOrEqual(0);
  expect(dune).toBeGreaterThan(aardvark);
  expect(delCampo).toBeGreaterThan(dune);
  expect(quill).toBeGreaterThan(delCampo);
  expect(quokka).toBeGreaterThan(quill);
  expect(zephyr).toBeGreaterThan(quokka);

  // The regression this test exists for: $35 of fees against no deposit makes
  // Quill's balance negative, which used to move the whole row to the top.
  expect(quill, "a negative balance must not be pinned above the A's").toBeGreaterThan(0);
  await expect(page.locator(".fee-summary-main-row").filter({ hasText: QUILL }))
    .toHaveClass(/fee-summary-negative/); // …it is still called out, just not re-ordered

  // ── Deposits ──
  await page.click('.dash-nav-item[data-tab="deposits"]');
  await expect(page.locator(".dash-page-title")).toHaveText("Meet Fee Deposits");
  await page.selectOption("#deposits-season-select", season);
  for (const name of [DUNE, QUOKKA, ZEPHYR]) {
    await expect(page.locator(".deposits-row .deposits-name").filter({ hasText: name }))
      .toHaveCount(1, { timeout: 15000 });
  }

  const depNames = await page.locator(".deposits-row .deposits-name").allInnerTexts();
  const [depDune, depQuokka, depZephyr] = positions(depNames, [DUNE, QUOKKA, ZEPHYR]);
  expect(depDune, `rendered: ${depNames.join(" | ")}`).toBeGreaterThanOrEqual(0);
  expect(depQuokka).toBeGreaterThan(depDune);
  expect(depZephyr).toBeGreaterThan(depQuokka);
});
