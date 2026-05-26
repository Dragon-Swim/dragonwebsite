/**
 * Re-seed John Chen family on live site with new doc-ID format.
 */

import { test, expect } from "@playwright/test";

test("re-seed John Chen family", async ({ page, context }) => {
  await context.clearCookies();

  // Sign in (account already exists from previous seed)
  await page.goto("/dragonwebsite/signin.html", { waitUntil: "networkidle" });
  await page.fill("#auth-email", "john.chen@example.com");
  await page.fill("#auth-password", "test1234");
  await page.click("#submit-btn");

  // Signin goes to dashboard; we need to go to registration
  await page.waitForTimeout(2000);
  await page.goto("/dragonwebsite/registration.html", { waitUntil: "networkidle" });

  // If registration already exists, the form won't show (user might be redirected)
  // But with the new format (uid as doc ID), the old registration won't match
  // So we should see the form

  // Check if we're on registration page or redirected
  const url = page.url();
  console.log("Current URL:", url);

  if (!url.includes("registration.html")) {
    console.log("Redirected to registration page? URL:", url);
    await page.goto("/dragonwebsite/registration.html", { waitUntil: "networkidle" });
  }

  // Fill family registration
  await page.waitForSelector("#parent-first", { timeout: 5000 }).catch(() => {
    console.log("Parent form not found — might already have registration");
    return;
  });

  await page.fill("#parent-first", "John");
  await page.fill("#parent-last", "Chen");
  await page.selectOption("#parent-gender", "male");
  await page.fill("#parent-phone", "503-555-1001");
  await page.fill("#parent-email", "john.chen@example.com");
  await page.fill("#parent-address", "1420 SW Park Ave, Portland, OR 97201");

  await page.check("#has-spouse");
  await page.fill("#spouse-first", "Mei");
  await page.fill("#spouse-last", "Lin");
  await page.selectOption("#spouse-gender", "female");
  await page.fill("#spouse-phone", "503-555-1002");
  await page.fill("#spouse-email", "mei.lin@example.com");

  await page.fill("#swimmer-1-first", "Jason");
  await page.fill("#swimmer-1-last", "Chen");
  await page.selectOption("#swimmer-1-gender", "male");
  await page.fill("#swimmer-1-dob", "2013-05-12");
  await page.fill("#swimmer-1-usaId", "USA-2024-08123");
  await page.fill("#swimmer-1-joinDate", "2024-09-01");

  await page.click("#btn-add-swimmer");
  await page.fill("#swimmer-2-first", "Emily");
  await page.fill("#swimmer-2-last", "Chen");
  await page.fill("#swimmer-2-middle", "Wei");
  await page.selectOption("#swimmer-2-gender", "female");
  await page.fill("#swimmer-2-dob", "2015-11-03");
  await page.fill("#swimmer-2-usaId", "USA-2025-01456");
  await page.fill("#swimmer-2-joinDate", "2025-01-15");

  await page.fill("#emergency-name", "Grandma Li");
  await page.fill("#emergency-phone", "503-555-1003");
  await page.fill("#reg-notes", "Jason needs goggles with prescription lenses.");

  await page.click("#reg-submit");

  await expect(page.locator("#reg-success")).toBeVisible({ timeout: 15000 });
  console.log("John Chen family re-seeded with new format.");
});
