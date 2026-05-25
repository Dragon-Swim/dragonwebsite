/**
 * E2E tests — Registration page (family-based)
 *
 * Prerequisites: Firebase emulators must be running (firebase emulators:start)
 * for the form submission test to succeed.
 */

import { test, expect } from "@playwright/test";

test.describe("Registration page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dragonwebsite/registration.html");
  });

  test("renders the page title and sections", async ({ page }) => {
    await expect(page.locator(".section-title")).toHaveText("Season Registration");
    await expect(page.locator("#parent-first")).toBeVisible();
    await expect(page.locator("#swimmers-container")).toBeVisible();
    await expect(page.locator("#emergency-name")).toBeVisible();
  });

  test("spouse section toggles on checkbox", async ({ page }) => {
    const spouseSection = page.locator("#spouse-section");
    await expect(spouseSection).toBeHidden();

    await page.check("#has-spouse");
    await expect(spouseSection).toBeVisible();

    await page.uncheck("#has-spouse");
    await expect(spouseSection).toBeHidden();
  });

  test("can add and remove swimmers", async ({ page }) => {
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

  test("completes full registration — parent + 2 swimmers + spouse", async ({ page }) => {
    // Parent
    await page.fill("#parent-first", "Michael");
    await page.fill("#parent-last", "Johnson");
    await page.fill("#parent-middle", "David");
    await page.selectOption("#parent-gender", "male");
    await page.fill("#parent-phone", "555-111-2222");
    await page.fill("#parent-email", "michael@example.com");
    await page.fill("#parent-address", "123 Main St, Portland, OR 97201");

    // Spouse
    await page.check("#has-spouse");
    await page.fill("#spouse-first", "Lisa");
    await page.fill("#spouse-last", "Johnson");
    await page.selectOption("#spouse-gender", "female");
    await page.fill("#spouse-phone", "555-111-3333");
    await page.fill("#spouse-email", "lisa@example.com");

    // Swimmer 1
    await page.fill("#swimmer-1-first", "Emma");
    await page.fill("#swimmer-1-last", "Johnson");
    await page.selectOption("#swimmer-1-gender", "female");
    await page.fill("#swimmer-1-dob", "2014-06-15");
    await page.fill("#swimmer-1-usaId", "USA-2024-01234");

    // Add swimmer 2
    await page.click("#btn-add-swimmer");
    await page.fill("#swimmer-2-first", "Ethan");
    await page.fill("#swimmer-2-last", "Johnson");
    await page.selectOption("#swimmer-2-gender", "male");
    await page.fill("#swimmer-2-dob", "2016-09-22");

    // Emergency contact
    await page.fill("#emergency-name", "Sarah Johnson");
    await page.fill("#emergency-phone", "555-999-8888");

    // Notes
    await page.fill("#reg-notes", "Emma is allergic to chlorine.");

    // Submit
    await page.click("#reg-submit");

    // Verify success
    await expect(page.locator("#reg-success")).toBeVisible();
    await expect(page.locator("#reg-success")).toContainText(
      "Registration submitted successfully"
    );
  });
});
