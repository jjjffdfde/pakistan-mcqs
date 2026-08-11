# Development Guide — Pakistan MCQS Hub (Phase 26)

Contribution workflow for the enterprise MCQ platform. Everything runs
with plain Node (v22+), **no npm install required** on locked hosts.

## Repository layout

| Path | Purpose |
| --- | --- |
| `server.js` | Localhost API server (port 8765 via `MCQS_PORT`) |
| `db/` | SQLite production DB + engine + schema + legacy backup/restore |
| `scripts/` | Phase 26 tooling: lint, test, benchmark, audit, monitor, release |
| `tests/` | 6 suites / 34 tests (unit, database, api, ui, performance, integration) |
| `backup/` | Snapshot tooling (`backup-db.js`, `restore-db.js`, `verify-backup.js`) |
| `.github/workflows/` | CI/CD (build, test, lint, security, release, database-verify) |
| `docs/` | Reports, guides, execution reports |

## First-time setup

```sh
node --version        # >= 22 (uses node:sqlite)
node scripts/lint.cjs
node scripts/test.cjs
```

## Development loop

```sh
node scripts/fix-format.cjs   # normalize whitespace/newlines
node scripts/lint.cjs         # 0 errors expected; warnings acceptable
node scripts/test.cjs         # 34/34 before merge
```

## Rules

- **Never mutate** `db/pakistan-mcqs.sqlite` from tooling; open read-only
  (`{ readOnly: true }`). Schema/ID/business logic changes are out of scope
  for Phase 26.
- No external dependencies — new tooling must be zero-dep Node.
- All tooling deterministic: no timestamps in outputs except `generated_at`;
  sort before emitting; stable JSON formatting.
- Every deliverable writes a report to `docs/phase26_*.json`.

## Style

- 2-space indent, LF, final newline (enforced by `lint.cjs`)
- printWidth 120; double quotes; semicolons
- `.editorconfig`, `.eslintrc.json`, `.prettierrc`, `.markdownlint.json`
  declare the expected external-tool configs (CI only)

## Testing notes

- Test bodies are lazy closures; the runner awaits them sequentially.
- API tests boot the real server on ephemeral ports (8800–9199) and
  expect `/api/subjects`, `/api/chapters`, `/api/search`, `/api/health`;
  there is **no** `/api/subjects/:id/chapters` route (404 is correct).
- After killing the server, retry read-only DB opens (transient WAL error).

## Before release

Run the full gate (see `RELEASING_GUIDE.md`): fix-format → lint → test →
security-audit → verify-backup → benchmark → release.
