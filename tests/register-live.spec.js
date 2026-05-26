/**
 * Smoke test — full registration flow on the live site.
 *
 * Writes to PRODUCTION Firestore. Run sparingly.
 *
 * Usage:
 *   npx playwright test tests/register-live.spec.js --config=playwright.live.config.js
 */

import { test, expect } from "@playwright/test";

test("full registration flow on live site", async ({ page, context }) => {
  await context.clearCookies();

  const testEmail = `live-test-${Date.now()}@example.com`;

  // Step 1 — Create account
  await page.goto("/dragonwebsite/signin.html?mode=signup", { waitUntil: "networkidle" });

  await expect(page.locator(".signin-title")).toHaveText("Create Account");

  await page.fill("#auth-email", testEmail);
  await page.fill("#auth-password", "test1234");
  await page.fill("#auth-confirm", "test1234");
  await page.click("#submit-btn");

  // Should redirect to registration.html
  await expect(page).toHaveURL(/registration\.html/, { timeout: 15000 });

  // Step 2 — Fill family registration
  // Parent
  await page.fill("#parent-first", "Wei");
  await page.fill("#parent-last", "Zhang");
  await page.selectOption("#parent-gender", "male");
  await page.fill("#parent-phone", "555-222-3333");
  await page.fill("#parent-email", testEmail);
  await page.fill("#parent-address", "456 Oak Ave, Portland, OR 97202");

  // Spouse
  await page.check("#has-spouse");
  await page.fill("#spouse-first", "Mei");
  await page.fill("#spouse-last", "Li");
  await page.selectOption("#spouse-gender", "female");
  await page.fill("#spouse-phone", "555-222-4444");
  await page.fill("#spouse-email", "mei.li@example.com");

  // Swimmer
  await page.fill("#swimmer-1-first", "Alex");
  await page.fill("#swimmer-1-last", "Zhang");
  await page.selectOption("#swimmer-1-gender", "male");
  await page.fill("#swimmer-1-dob", "2013-03-21");
  await page.fill("#swimmer-1-usaId", "USA-2025-05678");

  // Emergency contact
  await page.fill("#emergency-name", "Li Zhang");
  await page.fill("#emergency-phone", "555-444-5555");

  // Submit family form
  await page.click("#reg-submit");

  // Verify success
  await expect(page.locator("#reg-success")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#reg-success")).toContainText(
    "Registration submitted successfully"
  );

  console.log(`Registration submitted to production Firestore. Email: ${testEmail}`);
});
