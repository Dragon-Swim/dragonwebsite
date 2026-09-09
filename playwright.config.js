import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "*-live*",
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    // Never reuse a running dev server: it may have been started without the
    // emulator flag, in which case the app would talk to the real Firebase
    // project. Failing on a busy port is better than silently testing prod.
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      // Read by src/utils/firebase.js — points the app at the local emulators
      // on the demo-dragon-swim project instead of the real one.
      VITE_USE_FIREBASE_EMULATOR: "true",
    },
  },
});
