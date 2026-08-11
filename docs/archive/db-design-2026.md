# Database Design Report 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4 (Enterprise Database Platform)*

## 1. Executive summary

Phase 4 replaced the single static JSON bank with a real local database
(primary engine: **SQLite 3 via Node's built-in `node:sqlite`**, zero npm
dependencies) while keeping the site **static-first**: every feature still
works from the checked-in JSON files, and a localhost API server (port 8765)
unlocks the full 240,716-MCQ database for search, browse, practice and
analytics when it is running.

| Metric | Value |
|---|---|
| MCQs | **240,716** (all original, qhash-verified unique) |
| Options (A–D per MCQ) | 962,864 |
| Subjects / Chapters / Topics / Subtopics | 183 / 595 / 1,054 / 1,991 |
| Categories / Quizzes / Mocks / Past papers / Exams | 17 / 21 / 6 / 40 / 38 |
| References | 44 |
| DB file size | ~286 MB (WAL mode) |
| FTS5 search index | 240,716 documents (question + subject name + tags) |

## 2. Engine selection and configuration

- Primary: **SQLite** (`db/engine.js` → `open()`), file `db/pakistan-mcqs.sqlite`,
  configured in `db/config.json` (`{ "engine": "sqlite", ... }`).
- Optional drivers kept in the same engine layer for MySQL/MariaDB (`mysql2`)
  and PostgreSQL (`pg`) — `db/schema.mysql.sql` / `db/schema.postgres.sql`
  remain as deployment alternatives; the API surface is identical.
- SQLite pragmas on open: `journal_mode = WAL`, `foreign_keys = ON`.
- Engine layer exposes a uniform prepared-statement API:
  `db.all(sql, params)`, `db.get(sql, params)`, `db.run(sql, params)`,
  `db.exec(sql)`, `db.prepare(sql)`, `db.transaction(fn)`, `db.close()` —
  so pipeline, server, export and admin tools share one code path.

## 3. Schema

Defined in `db/schema.sqlite.sql` (16 tables + FTS index). Full DDL is in that
file; the entity map:

| Table | Purpose | Key columns / notes |
|---|---|---|
| `categories` | Top-level taxonomy | `id`, `name`, `slug`, `icon`, `sort_order` |
| `subjects` | Subjects | `id`, `category_id`, `name`, `slug`, `icon`, `exam_ids` (CSV), `sort_order` |
| `chapters` | Chapters | `id`, `subject_id`, `name`, `slug`, `sort_order` |
| `topics` | Topics | `id`, `chapter_id`, `name`, `slug`, `sort_order` |
| `subtopics` | Subtopics | `id`, `topic_id`, `name`, `sort_order` |
| `mcqs` | Master MCQ table | `id` (PK, `{prefix}-{seq}`), `question`, `correct_answer`, `difficulty`, `subject_id`/`chapter_id`/`topic_id`/`subtopic_id` FKs, `exam_ids` CSV, `tags` JSON, `references_json`, `explanation`, `source`, `status`, `qhash` (sha256 of normalized question, UNIQUE — dedupe key), `year`, `created_at`, `updated_at` |
| `options` | Options table (normalized) | `mcq_id` FK, `label` (A–D), `text`; UNIQUE(mcq_id, label) |
| `references_tbl` | Citation sources | `id`, `title`, `url`, `kind` |
| `quizzes` | Quick quizzes | `title`, `total_questions`, `duration_mins`, `difficulty`, `subject_ids` CSV |
| `mocktests` | Mock tests | same pattern + `negative_marking`, `exam_id` |
| `pastpapers` | Simulated papers | `exam_id`, `year`, `total_questions`, `duration_mins`, `subject_ids` CSV |
| `bookmarks` | User bookmarks | `device_id`, `mcq_id` FK, UNIQUE(device_id, mcq_id) |
| `history` | Answer history | `device_id`, `mcq_id`, `correct`, `points`, `mode`, `answered_at` |
| `leaderboard` | Rankings | `device_id` UNIQUE, `name`, `points`, `week_key`, `month_key`, `correct`, `total` |
| `analytics` | Event log | `device_id`, `event`, `payload`, `created_at` |
| `pipeline_state` | Generation resume state | `key` PK, `value` (JSON) |

### 3.1 ID scheme

`mcqs.id` = sanitized full subject id + zero-padded sequence
(e.g. `pakist-000022`, `mathem-001928`, `c-005418`). The sanitizer keeps the
**entire** alphanumeric subject id — Phase-4 bugfix: earlier 6-character
truncation collided (`computer-science` vs `computer-engineering` → `comput`)
and violated the UNIQUE constraint.

### 3.2 Normalization choices

- **Options are a child table** (`options`), not columns — the legacy JSON
  shape (`optionA`–`optionD`) is produced on read by `attachOptions()` in the
  API layer, so the frontend schema never changed.
- **Foreign keys enforced** (`PRAGMA foreign_keys=ON`) — pipeline inserts
  chapters/topics with `ON CONFLICT` upsert and re-queries the persisted id
  before inserting MCQs, guaranteeing 0 orphans (verified: 0).
- **FTS5 virtual table** `mcqs_fts` is a content-synced index
  (`content='mcqs', content_rowid='rowid'`) over question text + subject name
  + tags; queries must join on `mcqs_fts.rowid = mcqs.rowid` and rank with
  `bm25(mcqs_fts)` (there is no `rank` column).

## 4. Indexes

| Index | Table | Purpose |
|---|---|---|
| `ix_mcqs_subject` / `ix_mcqs_chapter` / `ix_mcqs_topic` | mcqs | Filter-heavy browse/sampler paths |
| `ix_mcqs_diff` / `ix_mcqs_year` | mcqs | Difficulty/year filters |
| `ix_options_mcq` | options | Option lookup by MCQ |
| `ix_history_device` / `ix_history_mcq` | history | History + join to MCQs |
| `ix_bookmarks_device` | bookmarks | Per-device bookmark lists |
| `ix_leaderboard_points` | leaderboard | Rank ordering |
| `ix_analytics_event` | analytics | Event reporting |

## 5. Data pipeline (how the DB is filled)

`pipeline/` generates original MCQs from deterministic templates/parametrics
and upserts them into the DB (see `docs/pipeline-2026.md` for the full
specification):

```
pipeline/generators/*.js  →  pipeline/run.js  →  engine.js  →  pakistan-mcqs.sqlite
                                            ↘  db/export-json.js → data/export/*.json
                                            ↘  server.js        → frontend (DB mode)
```

- Uniqueness: qhash (sha256 of lowercased, whitespace-normalized question) —
  `UNIQUE(qhash)`; the generator skips duplicates, so re-runs are idempotent
  and the bank never contains repeated questions.
- The pipeline tracks `pipeline:done-topics` in `pipeline_state` and resumes
  exactly where it left off; `--fresh` resets per-topic state.

## 6. API layer (localhost server)

`server.js` exposes a JSON REST API (CORS-enabled, port 8765 or `MCQS_PORT`):

| Endpoint | Returns |
|---|---|
| `GET /api/health` | `{ ok, mcqs }` (240,716) |
| `GET /api/search?q=&subject=&...` | FTS5 results + `total/pages` |
| `GET /api/browse?...` | Paginated filtered MCQs |
| `GET /api/mcq/:id` | Single MCQ with options array |
| `GET /api/mcqs?ids=a,b` | Batch lookup (≤200) |
| `GET /api/random?subject=&limit=&seed=` | Random sampler (seed = deterministic) |
| `GET /api/subjects|chapters|topics|categories|exams|quizzes|mocktests|pastpapers` | Taxonomy |
| `GET /api/leaderboard` | Ranked rows |
| `GET/POST /api/bookmarks`, `/api/history` | User sync (device-scoped) |
| `GET /api/analytics` | Event log |
| `POST /api/import` | JSON bulk import (qhash dedupe) |
| `GET /api/export?format=json\|csv` | Full export |
| `POST /api/backup`, `/api/restore` | Snapshot / restore |

Frontend behavior: `assets/js/app.js` probes `/api/health` (1.5 s timeout);
on success it runs in **DB mode** (183 subjects, FTS search, DB random
samplers, real subject counts, DB leaderboard); on failure it falls back to
the static JSON bank (1338 MCQs, unchanged behavior). Verified in headless
Chrome in both modes.

## 7. Integrity verification (Phase 4)

| Check | Result |
|---|---|
| Orphan references (mcqs→chapters→topics→subjects) | 0 |
| Duplicate questions (qhash) | 0 |
| MCQs missing options / invalid answer letter | 0 |
| MCQs with empty explanation | 0 |
| Subjects with 0 MCQs | 0 (183/183 have MCQs) |
| FTS integrity (`'integrity-check'` + rowid join) | OK |
| `scripts/audit.js` (static site) | 0 FAIL / 0 WARN |
| Backup→restore round trip | verified (2026-08-01) |
| `node pipeline/run.js` resume after interruption | verified |

## 8. Operations notes

- **Never edit `db/pakistan-mcqs.sqlite` by hand.** Rebuild via pipeline
  (fresh or resume) or restore from `backup/db-backup-*/`.
- `data/mcqs.json` and `data/mcqs/*.json` remain the hand-curated static bank
  (1338 MCQs) — the DB is the scalable superset.
- `db/export-json.js` writes to `data/export/` only, so static assets are
  never overwritten (Phase-4 safeguard).
- Backups land in `backup/db-backup-YYYY-MM-DD-HH-mm-ss/` (SQLite file copy +
  `dump.json`).
