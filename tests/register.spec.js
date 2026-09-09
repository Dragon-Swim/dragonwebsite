/**
 * E2E tests — Full registration flow (signup → family registration)
 *
 * Run with `npm test`. The npm script starts the Firebase emulators and the
 * Playwright config points the dev server at them, so these tests never touch
 * the real Firebase project. Every signup needs a pre-authorized email, so each
 * test seeds its own `families` whitelist entry first.
 *
 * Notes on what changed (the old version of this file no longer matched the app):
 *   - paths are root-relative — `base: '/'` in vite.config.js, not `/dragonwebsite/`
 *   - the password must satisfy the 5-rule strength check in signin.js
 *   - `#parent-email` is readonly (tied to the sign-in account) and must not be filled
 *   - a successful submit redirects to dashboard.html; `#reg-success` is never shown
 */

import { test, expect } from "@playwright/test";
import { assertEmulatorReady, seedFamily } from "./helpers/emulator.js";

const SIGNUP_URL = "/signin.html?mode=signup";
const TEST_PASSWORD = "Test1234!";

let seq = 0;
const uniqueEmail = (tag) => `test-${tag}-${Date.now()}-${seq++}@example.com`;

/** Authorize the email, create the account, and land on the family form. */
async function signUp(page, email) {
  await seedFamily(email);
  await page.goto(SIGNUP_URL);
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", TEST_PASSWORD);
  await page.fill("#auth-confirm", TEST_PASSWORD);
  await page.click("#submit-btn");
  await expect(page).toHaveURL(/registration\.html/);
}

/** Fill every required field: parent, one swimmer, emergency contact. */
async function fillRequiredFields(page) {
  await page.fill("#parent-first", "Michael");
  await page.fill("#parent-last", "Johnson");
  await page.selectOption("#parent-gender", "male");
  await page.fill("#parent-phone", "555-111-2222");
  await page.fill("#parent-address", "123 Main St, Portland, OR 97201");
  await page.fill("#swimmer-1-first", "Emma");
  await page.fill("#swimmer-1-last", "Johnson");
  await page.selectOption("#swimmer-1-gender", "female");
  await page.fill("#swimmer-1-dob", "2014-06-15");
  await page.fill("#emergency-name", "Sarah Johnson");
  await page.fill("#emergency-phone", "555-999-8888");
}

const REQUIRED_LABELS = [
  "parent-first", "parent-last", "parent-gender", "parent-phone",
  "parent-email", "parent-address",
  "swimmer-1-first", "swimmer-1-last", "swimmer-1-gender", "swimmer-1-dob",
  "emergency-name", "emergency-phone",
];

const OPTIONAL_LABELS = [
  "parent-middle", "swimmer-1-middle", "swimmer-1-usaId", "swimmer-1-joinDate",
];

test.describe("Full registration flow", () => {
  test.beforeAll(async () => {
    await assertEmulatorReady();
  });

  test("signup form is shown by default with ?mode=signup", async ({ page }) => {
    await page.goto(SIGNUP_URL);
    await expect(page.locator(".signin-title")).toHaveText("Create Account");
    await expect(page.locator("#auth-email")).toBeVisible();
  });

  test("redirects to signup when visiting registration unauthenticated", async ({ page }) => {
    await page.goto("/registration.html");

    // Should be redirected to signin?mode=signup
    await expect(page).toHaveURL(/signin\.html\?mode=signup/);
  });

  test("completes full flow — signup then family registration", async ({ page }) => {
    const testEmail = uniqueEmail("full");

    await signUp(page, testEmail);

    // Parent — #parent-email is readonly and pre-filled from the sign-in account
    await fillRequiredFields(page);
    await page.fill("#parent-middle", "David");

    // Spouse
    await page.check("#has-spouse");
    await page.fill("#spouse-first", "Lisa");
    await page.fill("#spouse-last", "Johnson");
    await page.selectOption("#spouse-gender", "female");
    await page.fill("#spouse-phone", "555-111-3333");
    await page.fill("#spouse-email", "lisa@example.com");

    // Swimmer 1 extras + a second swimmer
    await page.fill("#swimmer-1-usaId", "USA-2024-01234");
    await page.click("#btn-add-swimmer");
    await page.fill("#swimmer-2-first", "Ethan");
    await page.fill("#swimmer-2-last", "Johnson");
    await page.selectOption("#swimmer-2-gender", "male");
    await page.fill("#swimmer-2-dob", "2016-09-22");

    await page.fill("#reg-notes", "Emma is allergic to chlorine.");

    // Submit — a complete form saves the registration and goes to the dashboard
    await page.click("#reg-submit");
    await expect(page).toHaveURL(/dashboard\.html/, { timeout: 15000 });
  });

  test("spouse section toggles on checkbox", async ({ page }) => {
    await signUp(page, uniqueEmail("spouse"));

    const spouseSection = page.locator("#spouse-section");
    await expect(spouseSection).toBeHidden();
    // Hidden controls must also be disabled: a display:none control is still
    // constraint-validated by the browser and would block submission.
    await expect(page.locator("#spouse-first")).toBeDisabled();

    await page.check("#has-spouse");
    await expect(spouseSection).toBeVisible();
    await expect(page.locator("#spouse-first")).toBeEnabled();

    await page.uncheck("#has-spouse");
    await expect(spouseSection).toBeHidden();
    await expect(page.locator("#spouse-first")).toBeDisabled();
  });

  test("can add and remove swimmers after signup", async ({ page }) => {
    await signUp(page, uniqueEmail("swimmers"));

    await expect(page.locator(".swimmer-card")).toHaveCount(1);

    await page.click("#btn-add-swimmer");
    await page.click("#btn-add-swimmer");
    await expect(page.locator(".swimmer-card")).toHaveCount(3);

    await page.click('[data-remove="2"]');
    await expect(page.locator(".swimmer-card")).toHaveCount(2);

    const labels = page.locator(".swimmer-label");
    await expect(labels.first()).toHaveText("Swimmer #1");
    await expect(labels.last()).toHaveText("Swimmer #2");
  });

  test("required fields are marked with a red asterisk", async ({ page }) => {
    await signUp(page, uniqueEmail("marks"));

    for (const id of REQUIRED_LABELS) {
      await expect(
        page.locator(`label[for="${id}"] .req-star`),
        `label for #${id} should show an asterisk`
      ).toHaveCount(1);
    }

    for (const id of OPTIONAL_LABELS) {
      await expect(
        page.locator(`label[for="${id}"] .req-star`),
        `label for #${id} is optional and should not show an asterisk`
      ).toHaveCount(0);
    }

    await expect(page.locator('label[for="parent-first"] .req-star')).toHaveCSS(
      "color",
      "rgb(220, 53, 69)"
    );
  });

  test("empty form cannot be submitted", async ({ page }) => {
    await signUp(page, uniqueEmail("empty"));

    await page.click("#reg-submit");

    // Stay on the form, explain why, and flag the offending fields.
    await expect(page).toHaveURL(/registration\.html/);
    await expect(page.locator("#reg-form-error")).toBeVisible();
    await expect(page.locator("#reg-form-error")).toContainText("required fields");
    await expect(page.locator("#parent-first")).toHaveClass(/is-invalid/);
    await expect(page.locator("#emergency-phone")).toHaveClass(/is-invalid/);
  });

  test("hidden spouse block does not block submission", async ({ page }) => {
    await signUp(page, uniqueEmail("nospouse"));

    // Spouse fields are required but collapsed; they must not block the form.
    await fillRequiredFields(page);
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/dashboard\.html/, { timeout: 15000 });
  });

  test("spouse must differ from the account holder", async ({ page }) => {
    await signUp(page, uniqueEmail("spouse-same"));
    await fillRequiredFields(page);

    await page.check("#has-spouse");
    // Same name, different case/spacing — must still be caught.
    await page.fill("#spouse-first", "  michael ");
    await page.fill("#spouse-last", "JOHNSON");
    await page.selectOption("#spouse-gender", "female");
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/registration\.html/);
    await expect(page.locator("#reg-form-error")).toContainText("account holder");
    await expect(page.locator("#spouse-last")).toHaveClass(/is-invalid/);

    // Distinct name, but the account holder's email — still blocked.
    await page.fill("#spouse-first", "Lisa");
    await page.fill("#spouse-email", (await page.inputValue("#parent-email")).toUpperCase());
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/registration\.html/);
    await expect(page.locator("#spouse-email")).toHaveClass(/is-invalid/);

    // Both fixed — the form goes through.
    await page.fill("#spouse-email", "lisa@example.com");
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/dashboard\.html/, { timeout: 15000 });
  });

  test("emergency contact must differ from the account holder", async ({ page }) => {
    await signUp(page, uniqueEmail("emergency-same"));
    await fillRequiredFields(page);

    await page.fill("#emergency-name", "Michael Johnson");
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/registration\.html/);
    await expect(page.locator("#emergency-name")).toHaveClass(/is-invalid/);

    // Same number written a different way must still be caught.
    await page.fill("#emergency-name", "Sarah Johnson");
    await page.fill("#emergency-phone", "(555) 111 2222");
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/registration\.html/);
    await expect(page.locator("#emergency-phone")).toHaveClass(/is-invalid/);

    await page.fill("#emergency-phone", "+1 (555) 999-8888");
    await page.click("#reg-submit");

    await expect(page).toHaveURL(/dashboard\.html/, { timeout: 15000 });
  });
});
