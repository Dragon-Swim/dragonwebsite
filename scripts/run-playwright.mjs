/**
 * Run the Playwright suite with a project-local temp directory.
 *
 * Why this wrapper exists
 * -----------------------
 * Chromium writes its per-launch profile into the OS temp directory. On this
 * Windows machine the nested `Default\Cache\No_Vary_Search` directory ends up
 * with an ACL that only grants an AppContainer capability SID
 * (`S-1-15-3-1024-...`), so the current user cannot delete it — and the delete
 * does not fail fast, it blocks indefinitely (verified: `fs.rm` > 180s,
 * `rmdir /s /q` exits 0 without removing anything).
 *
 * `browser.close()` waits for Playwright's temp-directory cleanup
 * (playwright-core: `removeFolders` -> `fs.promises.rm`), so every worker hangs
 * at the end of the run: `npm test` prints its results and then sits there until
 * Playwright force-kills the worker after 5 minutes, leaving the Vite dev server
 * and the emulators behind (exit code 1).
 *
 * Pointing TEMP/TMP at a directory inside the repo fixes it — `close()` returns
 * in ~1s and no directories are left behind. The directory lives under `.tmp/`
 * (gitignored) and is safe to delete at any time.
 *
 * Usage: node scripts/run-playwright.mjs [playwright args...]
 * (`npm test` and `npm run test:ui` call this instead of `playwright test`.)
 */

import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = path.join(repoRoot, ".tmp", "pw-tmp");

// Start from a clean temp dir; a killed run can leave a profile behind, and
// Playwright only removes the directories it created itself.
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

const cli = path.join(repoRoot, "node_modules", "@playwright", "test", "cli.js");
const child = spawn(process.execPath, [cli, "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, TEMP: tempDir, TMP: tempDir },
  cwd: repoRoot,
});

child.on("exit", (code, signal) => {
  // Only chromium profile directories matter here — they are the ones that used
  // to survive the run and block close(). Other entries (node-compile-cache,
  // hsperfdata_*, JavaLauncher.log) are harmless byproducts of the toolchain.
  const profiles = readdirSync(tempDir).filter((n) => n.startsWith("playwright_chromium"));
  if (profiles.length > 0) {
    console.log(`[run-playwright] WARNING: ${profiles.length} chromium profile dir(s) left in ${tempDir}`);
  }
  process.exit(signal ? 1 : code ?? 1);
});
