# Unit checks (pure logic — no emulator, no browser)

```
npm run test:unit
```

Runs every `verify-*.mjs` in this directory (via `run-all.mjs`) and fails if any
of them does. These modules take no DOM, no Firestore and no network, so they run
in about a second and need none of the Playwright/emulator machinery that
`npm test` sets up.

| File | Module under test |
|---|---|
| `verify-attention-rules.mjs` | `src/utils/registrationCompleteness.js` — the coach dashboard's Needs Attention engine |
| `verify-swimmer-sort.mjs` | `src/utils/swimmerSort.js` — last-name ordering in the Roster / Swim Times lists |
| `verify-fetch-health.mjs` | `src/utils/fetchHealth.js` — fetch-failure classification + stop-the-run-early state |
| `verify-volunteer-hours.mjs` | `src/utils/volunteerHours.js` — Volunteer Hours aggregation and CSV output |

`verify-volunteer-hours.mjs` covers what the E2E spec (`tests/volunteer-hours.spec.js`)
cannot cheaply reach: soft-deleted swimmers, families with no active swimmer,
cross-season records, a deleted meet falling back to its stored season snapshot,
malformed records, and CSV escaping.

## Two rules when adding a check

1. **Never name it `*.spec.js` / `*.test.mjs`.** Playwright's `testMatch` scans
   `testDir` (`./tests`), so such a name would pull a plain Node script into
   `npm test` and fail there. `verify-*.mjs` is invisible to it on purpose.
2. **Import from `../../src/...`** — these files sit two levels deep, and
   `new URL('../src/...', import.meta.url)` needs the same extra `../`.

Three of these started life as `.tmp/*.mjs` scratch scripts. `.tmp/` is gitignored,
so they were invisible to every automated run and one `rm` from gone — while a
committed doc already referenced one of them. If a check is worth keeping, it
belongs in version control.
