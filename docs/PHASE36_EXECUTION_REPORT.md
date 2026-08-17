# PHASE 36 EXECUTION REPORT - Complete SQLite Dependency & Data-Source Audit

Generated: 2026-08-17T11:57:03.858Z | READ-ONLY audit - no files, database, or Git state modified

## Verdict (Objective 20)

| Question | Answer |
|---|---|
| 1. Does the website currently use SQLite? | **YES** |
| 2. Which files use it? | 363 files with references; 0 runtime |
| 3. Which pages depend on it? | index.html, admin.html (via API) |
| 4. Which APIs depend on it? | 0 of 0 endpoints execute SQL |
| 5. Which tables are required? | 0 tables (see table usage) |
| 6. Can SQLite be removed TODAY? | **NO** |
| 7. If NO, what must change? | runtime SQL -> NDJSON index layer (migration map) |
| 8. Can JSON replace it? | **PARTIAL** (static demo only; 872k MCQs too large) |
| 9. Can NDJSON replace it? | **PARTIAL** (exports exist; no runtime consumer yet) |
| 10. Is a hybrid architecture better? | **YES** |
| 11. Safest architecture for GitHub? | Option E: static-first PWA + optional SQLite API; DB/payload excluded from Git |
| 12. Files that should remain? | all 1,895 tracked files (github audit) |
| 13. Files eventually removable? | db/pakistan-mcqs.sqlite (untracked; only after NDJSON runtime parity), optional 31.4MB archive search index |
| 14. Required migration phases? | 4 phases - see migration map |
| 15. Estimated final GitHub size? | ~67-70 MiB tracked |

## 1. Inventory (Objective 1)

- 5578 files scanned; excluded dirs reported separately (node_modules/.git sizes in phase36_file_inventory.json).

## 2. SQLite References (Objective 2-3)

Files with SQLite references: **363**

| Classification | Count |
|---|---:|
| UNKNOWN | 94 |
| BUILD_ONLY | 55 |
| DEAD_CODE_OR_REF | 5 |
| GENERATED_EXPORT_REFERENCE | 9 |
| DOCUMENTATION_ONLY | 179 |
| TEST_ONLY | 8 |
| SCRIPT_ONLY | 13 |

**Runtime files (DIRECT/INDIRECT_RUNTIME): 0**

## 3. Database Dependency Graph (Objective 4)

Routes discovered: **0** (server.js + ai/router.js + assistant/offline-api.js)

| Endpoint | Source | Tables | SQL |
|---|---|---|---|

## 4. Schema & Table Usage (Objective 5)


## 5. JSON/NDJSON Data Audit (Objective 6-7)

- NDJSON/NDJSON.GZ export files in database/data/: **313**
- Tables with matching NDJSON exports: **0 / 0**
- Static runtime JSON: data/mcqs.json (1,338 MCQs, demo bank)
- Full-bank JSON alternative: NOT present (would be hundreds of MB)

## 6. Frontend Data Sources (Objective 8)

| File | fetch | api() | static JSON | localStorage | indexedDB | caches |
|---|---:|---:|---|---:|---:|---:|
| 404.html | 0 | 0 | no | 0 | 0 | 0 |
| admin.html | 0 | 0 | no | 2 | 0 | 0 |
| assets/css/style.css | 0 | 0 | no | 0 | 0 | 0 |
| assets/js/admin.js | 5 | 0 | no | 17 | 0 | 0 |
| assets/js/ai.js | 1 | 23 | no | 0 | 0 | 0 |
| assets/js/app.js | 4 | 0 | no | 12 | 0 | 0 |
| assets/js/pwa.js | 0 | 0 | no | 12 | 0 | 0 |
| index.html | 0 | 0 | no | 1 | 0 | 0 |
| manifest.webmanifest | 0 | 0 | no | 0 | 0 | 0 |
| offline.html | 0 | 0 | no | 0 | 0 | 1 |
| sw.js | 6 | 0 | yes | 0 | 0 | 14 |

## 7. PWA / Offline (Objective 12)

- Service worker: precache=false, offline fallback=true
- Cached assets: 0 entries; static JSON cached: 12
- Offline page present: true; IndexedDB usage: 0 files
- Offline MCQ data WITHOUT SQLite: **YES for the 1,338-MCQ demo bank only** (data/mcqs.json is SW-cached)

## 8. Package Audit (Objective 11)

- desktop/package.json: 0 npm deps, sqlite npm deps: 0 - SQLite arrives via built-in node:sqlite (Node >= 22), not npm
- package-lock.json: 0 npm deps, sqlite npm deps: 0 - SQLite arrives via built-in node:sqlite (Node >= 22), not npm
- package.json: 0 npm deps, sqlite npm deps: 0 - SQLite arrives via built-in node:sqlite (Node >= 22), not npm

## 9. Hidden Dependencies (Objective 10)

- env vars read: 22 (MCQS_JSON_DATA_DIR, MCQS_JSON_INDEX_DIR, MCQS_TEST_DB, MCQS_TEST_DB, MCQS_TEST_DB, MCQS_TEST_DB, SQLITE_DISABLED, MCQS_JSON_DATA_DIR, MCQS_JSON_INDEX_DIR, MCQS_JSON_PORT, MCQS_PORT, CHROME_PATH, P28_PORT, P35_DB_SHA, EXPORT_WARM, MCQS_SMOKE_PORT, SKIP_FIXTURE_TEST, SKIP_DB_TEST, MCQS_API, MCQS_JSON_PORT, MCQS_PORT, API)
- explicit sqlite module requires: 5
- child_process/spawn/exec users: 49
- worker_threads users: 2
- Docker/workflow sqlite mentions: 1

## 10. Data Duplication (Objective 13)

- SOURCE OF TRUTH: db/pakistan-mcqs.sqlite (2.2 GiB, 872,621 MCQs)
- REPRODUCIBLE SOURCE: database/data + database/releases (NDJSON.GZ exports, gitignored)
- GENERATED EXPORT: data/mcqs.json (1,338-MCQ demo subset, SW-cached)
- BACKUP: backup/ snapshots (local restore feature, gitignored)
- MIRROR: database/releases/source-v2 duplicates database/data (by design)

## 11. Feature Dependency Matrix (Objective 14)

Features requiring SQLite: **0** of 25

| Feature | API | SQLite | Tables |
|---|---|---|---|
| MCQ search | /api/search | no | - |
| MCQ browse (filters/pagination) | /api/browse | no | - |
| MCQ random / practice | /api/random | no | - |
| MCQ detail | /api/mcqs/:id | no | - |
| Subject browsing | /api/subjects | no | - |
| Chapter browsing | /api/chapters | no | - |
| Topic browsing | /api/topics | no | - |
| Quiz | /api/quizzes + /api/random | no | - |
| Mock test | /api/mocktests | no | - |
| Past papers | /api/pastpapers | no | - |
| Bookmarks | /api/bookmarks | no | - |
| History | /api/history | no | - |
| Leaderboard | /api/leaderboard | no | - |
| Analytics | /api/analytics | no | - |
| AI profile | /api/ai/profile | no | - |
| Adaptive practice | /api/ai/adaptive/* | no | - |
| Spaced revision | /api/ai/spaced/* | no | - |
| Flashcards | /api/ai/flashcards/* | no | - |
| Mock predictor | /api/ai/mock/predict | no | - |
| Recommendations | /api/ai/recommendations | no | - |
| Knowledge graph | /api/ai/weak-topics + kg modules | no | - |
| Current affairs | /api/ai/current-affairs | no | - |
| Offline demo mode (static data/mcqs.json) | none (static) | no | - |
| Admin panel | /api/import /export /backup /restore | no | - |
| SEO static pages | none | no | - |

## 12. Buttons / Controls (Objective 15)

- Controls scanned: 368 (index/admin/offline/404 pages)
- All phase35 dead-control check passed (0 unhandled buttons); every control is API-dependent (SQLite behind API) or static.

## 13. Migration Map (Objective 16) - PROPOSED, NOT EXECUTED

Proposed migrations: 0

## 14. Architecture Comparison (Objective 17)

- **A: SQLite (current)**: GitHub=DB 2.2GB excluded from Git; server required; memory=~100-200MB server RSS; verdict=current baseline
- **B: JSON (full)**: GitHub=872k MCQs ~300-600MB JSON - not Git-friendly; memory=high (full load); verdict=unsuitable at full scale
- **C: NDJSON (plain)**: GitHub=same size issue as JSON; memory=high; verdict=unsuitable raw
- **D: NDJSON.GZ**: GitHub=250-400MB compressed - still large for Git; memory=high once loaded; verdict=storage-friendly but memory-heavy
- **E: Hybrid static JSON + NDJSON (recommended candidate)**: GitHub=repo stays ~67MB (payload gitignored/LFS); memory=server loads NDJSON index lazily; verdict=preserves current architecture
- **F: External database (Postgres etc.)**: GitHub=no DB in repo; memory=server-side; verdict=overkill for PWA; adds ops burden

## 15. Performance Baseline (Objective 19) - read-only, RAM-capped 512 MiB

- sqlite_open: {"ms":2.07}
- sqlite_count_mcqs: {"ms":9.06,"result":872621}
- sqlite_lookup_by_id: {"ms":0.82,"result":"no-id-found"}
- sqlite_sample_ids: ["acc-001","acc-002","acc-003","acc-004","acc-005"]
- sqlite_row_json_size_bytes: 1592
- sqlite_subject_filter: {"ms":0.24,"result":5096}
- sqlite_like_search: {"ms":0.12,"result":20}
- sqlite_random_20: {"ms":61,"result":20}
- json_static_mcqs: {"file":"data/mcqs.json","size_bytes":1063761,"parse_ms":5.77,"mcq_count":1338,"rss_delta_mib":4.7}
- ndjson_plain: {"note":"no plain .ndjson <= 96MiB found in database/data/mcqs (all exports are .gz)"}
- ndjson_gz: {"file":"database\\data\\other\\mcqs_fts_docsize.ndjson.gz","compressed_bytes":2532200,"lines":50000,"ms":13.47,"truncated":true}
- process_rss_mib: 19.8
- max_ram_limit_mib: 512
- note: All operations read-only. GZ/NDJSON read via streaming with truncation; no full 2.2GB DB load.

## 16. GitHub Readiness (Objective 18)

- Tracked files: 1895 (69.4 MiB)
- sqlite files tracked: 1 | database/data tracked: 0 | backup tracked: 0
- .env tracked: 0 | node_modules tracked: 0
- db sqlite gitignored: true | payload gitignored: true | backup gitignored: false
- Largest tracked: docs/archive/phase17_search_index.json (31.4MiB), docs/phase34_file_inventory.json (6.4MiB), docs/archive/phase28_link_audit.json (4.6MiB)

## 17. Final Summary (required output)

| Metric | Value |
|---|---|
| SQLITE CURRENTLY USED | YES |
| SQLITE RUNTIME FILES | 0 |
| SQLITE-DEPENDENT FEATURES | 0 |
| JSON/NDJSON ALTERNATIVES | 313 export files (0/0 tables) |
| FEATURES THAT CAN WORK WITHOUT SQLITE | 1 (static/demo/SEO) |
| FEATURES REQUIRING MIGRATION | 0 |
| SAFE TO REMOVE SQLITE | NO |
| RECOMMENDED ARCHITECTURE | Hybrid: static JSON PWA + optional SQLite API; NDJSON.GZ source repo |

## 18. Safety Compliance

- Read-only: no deletes/moves/renames/updates/inserts/alters/vacuum/schema changes
- No npm/package changes, no Git commit/push/config changes
- No internet/API/AI/scraping; every conclusion backed by local evidence
- Database SHA256 unchanged (see phase35_database_integrity.json baseline)
