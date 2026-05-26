import { test, expect } from "@playwright/test";

test("full diagnostic — sign up fresh, register, then check dashboard", async ({ page }) => {
  test.setTimeout(60000);
  const testEmail = `diag-${Date.now()}@example.com`;

  page.on("console", msg => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text().substring(0, 200));
  });

  // Step 1 — Sign up new account
  await page.goto("https://dragon-swim.github.io/dragonwebsite/signin.html?mode=signup", { waitUntil: "networkidle" });
  await page.fill("#auth-email", testEmail);
  await page.fill("#auth-password", "test1234");
  await page.fill("#auth-confirm", "test1234");
  await page.click("#submit-btn");

  // Signup redirects to registration.html
  await expect(page).toHaveURL(/registration\.html/, { timeout: 15000 });

  // Step 2 — Submit family registration (minimal)
  await page.fill("#parent-first", "Diag");
  await page.fill("#parent-last", "User");
  await page.selectOption("#parent-gender", "male");
  await page.fill("#parent-phone", "555-000-0000");
  await page.fill("#parent-email", testEmail);
  await page.fill("#parent-address", "123 Test St");

  await page.fill("#swimmer-1-first", "Test");
  await page.fill("#swimmer-1-last", "Kid");
  await page.selectOption("#swimmer-1-gender", "male");
  await page.fill("#swimmer-1-dob", "2015-01-01");

  await page.fill("#emergency-name", "Emergency");
  await page.fill("#emergency-phone", "555-111-1111");

  await page.click("#reg-submit");
  await expect(page.locator("#reg-success")).toBeVisible({ timeout: 15000 });
  console.log("Registration submitted.");

  // Step 3 — Navigate to dashboard
  await page.goto("https://dragon-swim.github.io/dragonwebsite/dashboard.html");
  await page.waitForTimeout(5000);

  // Step 4 — Click Profile
  await page.click('[data-tab="profile"]');
  await page.waitForTimeout(2000);

  const bodyText = await page.locator("body").innerText();
  console.log("PROFILE:", bodyText.substring(bodyText.indexOf("Family Profile"), bodyText.indexOf("Family Profile") + 500));

  // Check for key indicators
  const hasNotFound = bodyText.includes("No family registration found");
  const hasDiagUser = bodyText.includes("Diag User");
  const hasParentPhone = bodyText.includes("555-000-0000");

  console.log("No family registration found:", hasNotFound);
  console.log("Parent name visible:", hasDiagUser);
  console.log("Parent phone visible:", hasParentPhone);
});
