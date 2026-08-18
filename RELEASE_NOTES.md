# Release Notes — Pakistan MCQs v1.0

## Status
Release **1.0** is committed locally (`9c1c6f7`, branch `main`, 1,946 tracked files, clean tree).
Push to `github.com/jjjffdfde/pakistan-mcqs.git` is pending GitHub authentication by the user (remote is currently empty).

## What's included
- **Full MCQ website** — 872,624 MCQs across 244 subjects (production payload) plus 1,338 validated bundled demo MCQs; browsable + searchable + exam practice
- **SQLite-free runtime** (`runtime-v2/`) — zero-dependency NDJSON file engine: streaming NDJSON.GZ loader, deterministic JSON indexes, LRU caches, atomic user-data stores. Memory contract: heap capped 384 MB in tests, RSS ≤ 512 MB verified
- **Complete API parity with the retired SQLite reference** — 80 PASS + 15 PASS_SET, 0 FAIL, 0 EXPECTED routes remaining
- **Static SEO site** — 243 subject pages, 884 chapter pages, sitemap, robots.txt
- **PWA** — manifest, service worker with offline shell, offline page, 404 page; verified offline-capable
- **AI + admin surfaces** — file-backed profiles, weak topics, planner, spaced repetition, adaptive tests, mock prediction, recommendations, flashcards, current affairs, analytics, leaderboard, achievements, notifications, import/backup/restore/export
- **Zero runtime dependencies** — Node.js >= 22 only (`npm ci`: 1 package, 0 vulnerabilities)

## What changed since phase 39
- **SQLite runtime removed** — `server.js`, `db/`, `database/` sqlite stack, `ai/*.js`/`kg/*.js` legacy modules and the sqlite-bound tooling/tests deleted (commit `9c1c6f7`)
- **NDJSON runtime** — file-based data layer with deterministic index builder (`index-builder.cjs`), byte-bounded caches
- **Memory fixes** — subject-part LRU tightened (12 entries / 20,000 rows) and `fileCache` byte-bounded (48 MB LRU): fixed reproducible OOM at the 384 MB heap cap (final-smoke now 105/105 twice consecutively)
- **Data integrity fix** — `manifest.optionRows` now counts user-imported MCQs' options (3,490,496 = 4×872,624)
- **Restore contract verified** — 400 (invalid dir) / 404 (missing snapshot) semantics match the retired oracle
- **Reproducibility proven** — index rebuild of unchanged inputs: 2703/2704 files byte-identical (manifest differs only by `builtAt`)
- **API parity** — 80 PASS + 15 PASS_SET, 0 FAIL (live A/B vs frozen oracle pre-deletion, re-verified post-deletion)

## Verification (phase 40 + 41)
- Unit/integration **40/40**, DB integration (real data) **30/30**, phase-40 gate **10/10**, backup **7/7**, import **4/4**, lint 0 errors
- Physical smoke **105/105** (repo ×2 + fresh environment ×1)
- Fresh environment (git candidate source + data payload, no SQLite, no old caches): build PASS, tests PASS, smoke PASS, gate PASS
- Security scan: **0 findings** (2,086+ files); no secrets, no SQLite files anywhere in the tree
- Largest tracked file 10.98 MB (docs) — nothing near the 100 MiB limit; payload and sqlite backups remain gitignored

## Database note
There is no database. Data is the NDJSON.GZ payload (`database/data/`, gitignored) plus built JSON indexes
(`runtime-v2/indexes/`, gitignored, deterministically rebuilt by `runtime-v2/index-builder.cjs` from the payload).
The payload is a required-environment input shipped with the release (it is regenerated from the archived
oracle export kept at `migration-backups/`; zero SQLite files involved).
Clone-and-run: `npm ci` → `npm run build` → (restore data payload + `node runtime-v2/index-builder.cjs`) → `npm start` → http://localhost:8766.

## Known intentional limitations
- 2 pre-existing content gaps reported by validate-buttons (soft warnings, documented, not silently skipped)
- Static topic pages are not generated (topics served via chapter pages + `/api/topics`)
- 1,596 lint warnings: legacy style baseline (printWidth/eqeqeq), non-blocking
- Production data payload is not in the repository by design (643 MB; regenerable); tests run against it in local/CI-with-payload and against the hermetic `.phase40-fixture` in pure-CI runs

## Phases
Phases 26–41 execution reports in `docs/` (`PHASE26_EXECUTION_REPORT.md` … `PHASE41_EXECUTION_REPORT.md`).
