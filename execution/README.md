# Execution — the deterministic tools

One folder per job. All commands are run **from the repo root**.

| Folder | Tools | What they do |
|---|---|---|
| `fees/` | `match_fee_names.mjs`, `import_fee_sheet.mjs`, `export_correct_fee_sheets.mjs`, `preview_fee_import.mjs`, `verify_fee_summary.mjs`, `clear_deposits_collection.mjs` | 教练端费用/押金：把手写表格的名字对到系统里的人 → 批量导入 → 导出给教练确认的正确格式 → 只读复算 Fee Summary → 必要时清空集合 |
| `meet-entry/` | `extract_hytek_entries.py`, `meet-entries-vs-registrations.mjs` | Hy-Tek 报名表 PDF → JSON（自带 Total Athletes 校验）→ 未注册 / 缺 USA-S ID 的名单 + 英文草稿 |
| `standards/` | `extract_standards_text.py`, `parse_usas_standards.py` | USAS 激励标准 PDF → 逐页文本 → `src/data/timeStandards.data.js` |
| `data-admin/` | `add_meet.mjs`, `seed_fall_2026_slots.mjs`, `audit_registration_completeness.mjs`, `audit_volunteer_hours.mjs`, `cleanup_orphan_auth_users.mjs`, `cleanup_test_accounts.mjs` | Firestore / Auth 的增删查：加 meet、按赛季播时段、注册完整性与志愿小时审计、清理孤儿账号 |
| (root) | `hello.py` | 3 层脚手架的冒烟示例，见 `directives/hello_world.md` |

## Conventions

- **Dry-run first.** Anything that touches production takes `--delete` (or `--commit`, `--apply`) to
  actually write; without the flag the script only prints what it would do. Destructive tools write a
  JSON backup into `.tmp/backups/` before they change anything.
- **Credentials**: `serviceAccountKey.json` in the repo root (Firebase Admin SDK). Never hardcode keys.
- **Paths**: scripts use either the repo root (CWD) or their own location (`import.meta.url` /
  `Path(__file__)`), so keep the `../../src/...` hop in mind when moving a script between folders.
- **Intermediates**: write into the matching bucket under `.tmp/` — see `.tmp/README.md` and the layout
  table in `CLAUDE.md`. Tool defaults already point there.
- **Tests**: pure logic lives in `src/utils/*` and is covered by `tests/unit/verify-*.mjs`
  (`npm run test:unit`); browser flows live in `tests/*.spec.js` (`npm test`, emulators required).
- **Docs**: `docs/meet-fees.md` (费用/押金), `docs/volunteer-hours.md`, `docs/swim-results-fetch.md`.

## Adding a tool

Check this folder first (Operating Principle 1). If nothing fits, create a folder named after the job
(`fees/`, `meet-entry/`, …) rather than dropping another script in the root, and add a row here.
