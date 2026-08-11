# CI/CD Guide — Pakistan MCQS Hub (Phase 26)

Enterprise continuous integration & delivery for the static-first MCQ platform.

## Pipeline overview

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/build.yml` | push, PR | Static build verification, sitemap/robots checks, artifact upload |
| `.github/workflows/test.yml` | push, PR | Unit/API/UI/performance/integration tests on a synthetic SQLite fixture |
| `.github/workflows/lint.yml` | push, PR | Deterministic in-repo lint (no npm), repo audit, size guard |
| `.github/workflows/security.yml` | push, PR | Deterministic secrets scan, `npm audit` when a lockfile exists, mixed-content check |
| `.github/workflows/release.yml` | `workflow_dispatch` or `v*` tag | SHA256SUMS manifest + GitHub Release |
| `.github/workflows/database-verify.yml` | push, PR | Schema/constraint audit of `db/schema.sqlite.sql` in `:memory:` |

## Local equivalents (no network, no npm)

| CI job | Local command |
| --- | --- |
| Lint | `node scripts/lint.cjs` |
| Format fix | `node scripts/fix-format.cjs` |
| Tests | `node scripts/test.cjs` |
| Benchmark | `node scripts/benchmark.cjs` |
| Repo audit | `node scripts/phase26-repo-audit.cjs` |
| Security audit | `node scripts/security-audit.cjs` |
| DB/backup verify | `node backup/verify-backup.js` |
| Monitoring | `node scripts/monitor.cjs` |

## Exit codes (scripts/lint.cjs)

- `0` — clean
- `1` — errors (blocking)
- `2` — warnings only (`CLEAN_WITH_WARNINGS`)

Always run `node scripts/fix-format.cjs` before `node scripts/lint.cjs`; the
fixer normalizes trailing whitespace and final newlines deterministically.

## Test environment

The production SQLite DB (`db/pakistan-mcqs.sqlite`, ~2.1 GB) is **not**
committed to CI. `tests/database/sqlite.test.cjs` synthesizes a small fixture
under `.phase26-db-test` and runs against it via `MCQS_TEST_DB`.
The API tests boot `server.js` on an ephemeral port (`MCQS_PORT=8800..9199`).

## Release flow

1. Bump `CHANGELOG.md`.
2. Trigger `release.yml` manually with a version, or push a `vX.Y.Z` tag.
3. The workflow writes `release/SHA256SUMS.txt` and attaches it to the GitHub Release.
