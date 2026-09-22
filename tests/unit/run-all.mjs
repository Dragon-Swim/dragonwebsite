#!/usr/bin/env node

/**
 * Runs every pure-logic check in tests/unit and fails if any of them fails.
 *
 *   npm run test:unit
 *
 * Why these checks live here instead of in .tmp
 * ---------------------------------------------
 * They were written as throwaway `.tmp/*.mjs` verification scripts during past
 * sessions. `.tmp/` is gitignored, so they were invisible to every run and one
 * `rm` away from being gone forever — while `docs/volunteer-hours.md` already
 * pointed at one of them. Versioned here, they run with one command.
 *
 * Why a plain runner instead of `node --test`
 * -------------------------------------------
 * Each check script is self-contained: it prints its own `ok` / `FAIL` lines and
 * exits non-zero on failure. Wrapping that as-is keeps the diff to a `mv` plus an
 * import-path fix, so the assertions that were already trusted stay untouched.
 *
 * Why the FILENAMES matter
 * ------------------------
 * Playwright's default `testMatch` collects `*.spec.*` / `*.test.*` under
 * `testDir` (./tests). These files are named `verify-*.mjs`, so `npm test` (the
 * emulator + browser E2E suite) never sees them — keep it that way. Renaming one
 * to `verify-*.test.mjs` would silently pull a Node script into Playwright.
 *
 * Adding a new check: drop a `verify-<module>.mjs` in this directory that imports
 * from `../../src/...`, prints its results and exits non-zero on failure. It is
 * picked up automatically.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');

const scripts = readdirSync(here)
  .filter((name) => name.startsWith('verify-') && name.endsWith('.mjs'))
  .sort();

if (scripts.length === 0) {
  console.error('[test:unit] No verify-*.mjs files found in tests/unit — nothing to run.');
  process.exit(1);
}

const failed = [];
for (const script of scripts) {
  console.log(`\n── ${script} ${'─'.repeat(Math.max(0, 60 - script.length))}`);
  const res = spawnSync(process.execPath, [path.join(here, script)], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (res.error) {
    console.error(`[test:unit] ${script} could not start: ${res.error.message}`);
    failed.push(script);
  } else if (res.status !== 0) {
    failed.push(script);
  }
}

console.log(`\n${'═'.repeat(64)}`);
if (failed.length === 0) {
  console.log(`[test:unit] ${scripts.length}/${scripts.length} check scripts passed.`);
  process.exit(0);
}
console.log(`[test:unit] ${failed.length}/${scripts.length} check script(s) FAILED:`);
for (const f of failed) console.log(`  ✗ ${f}`);
process.exit(1);
