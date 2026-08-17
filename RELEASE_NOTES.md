# Release Notes — Pakistan MCQs v1.0

## Status
Release **1.0** is ready for GitHub. Nothing has been committed or pushed — this release requires the user to create the repository and push.

## What's included
- **Full MCQ website** — 1,338 validated MCQ questions, 13 subjects, 884 chapters, browsable + searchable
- **Dual runtime**:
  - SQLite server (`server.js`) — full feature set for admin, AI recommendations, import/restore/backup
  - SQLite-free NDJSON runtime (`runtime-v2/`) — fast, deterministic learner path (API, search, browse, MCQ, knowledge graph, bookmarks, history, leaderboard, analytics); 384 MB memory contract, LRU 20/30,000, 32 MB search cache
- **Static SEO site** — 243 subject pages, 884 chapter pages, sitemap, robots.txt
- **PWA** — manifest, service worker with offline shell, works offline
- **Zero runtime dependencies** — Node.js >= 22 only
- **Knowledge graph** — 820+ concepts, prerequisites, learning paths, objectives, micro topics
- **Assistant & admin surfaces** — question-review, MCQ creation, import/export, backup/restore (SQLite-backed)

## Verification (phase 39)
- Tests: 34/34 unit+API+integration+performance; 30/30 DB integration
- API parity NDJSON vs SQLite: 55 PASS + 8 PASS_SET + 7 EXPECTED divergences, 0 FAIL
- Regression 51/51 (NDJSON runtime), sqlite-disabled gate 82/82
- Smoke: 43/43 (static + PWA + offline + all API groups); topic listings served via chapter pages + `/api/topics` (static topic pages not generated — documented)
- Builds deterministic: 1338 MCQs, 1123 SEO pages, PWA assets, OG image
- Security scan: 0 findings; no secrets, no `.map` files
- Database integrity: production SQLite **unchanged** (main+wal byte-identical) throughout phase 39
- Lint: 0 errors

## Database note
The production SQLite database (`db/pakistan-mcqs.sqlite`, ~2.2 GB) is **not** in the repository (excluded). Clone-and-run flow: `npm install` (no deps), `npm run build`, then `npm start` — a fresh database is created from `database/data` source files via `database/scripts/init-db.js` when needed.

## Not in this release / notes
- AI recommendation, import/restore/backup routes return 501/404 on the NDJSON learner runtime by design (admin/AI functionality lives on the SQLite server)
- Static topic pages not generated (topics covered by chapter pages + API)
- 5879 lint warnings: legacy style baseline (printWidth/eqeqeq), non-blocking

## Phases
Phases 26–39 execution reports in `docs/` (`PHASE26_EXECUTION_REPORT.md` … `PHASE39_EXECUTION_REPORT.md`).