# Knowledge Architecture Report — Phase 14, Step 0

**Project:** Pakistan Exam Preparation Platform (`E:\pAK MCQS`)
**Date:** 2026-08-04
**Scope:** Full audit prior to building the Enterprise Knowledge Graph & Knowledge Pack Engine.
**Rule honoured:** *Do not duplicate existing data. Extend only where required. Do NOT generate MCQs in this phase.*

---

## 1. System shape (as-built)

Static-first SPA (vanilla JS under `assets/js/`) that runs off static `data/*.json`, progressively enhanced by a zero-dependency Node HTTP API (`server.js`, port 8765) over SQLite (`db/pakistan-mcqs.sqlite`, ~2.16 GB) via the `db/engine.js` `open()` wrapper. The wrapper is **multi-engine** (SQLite / MySQL / Postgres) and runs an **idempotent `migrate(raw)` on every open** — this is the single, correct home for new schema.

Offline content is produced by `pipeline/` (523 generator objects in `pipeline/generators/`), gated by `pipeline/quality.js` (10 dimensions, weighted mean ≥95), referenced by `pipeline/references.js`, deduped by `qhash`, inserted via `db/engine.js`.

## 2. Database inventory (33 tables)

**Taxonomy (the existing knowledge spine — reuse, do not duplicate):**

| Table | Rows | Role |
|---|---|---|
| `categories` | 17 | Top-level domains |
| `subjects` | 243 | `id, name, slug, category_id, exam_ids (CSV), status` |
| `chapters` | 884 | `subject_id → …` |
| `topics` | 1,597 | `chapter_id → …` |
| `subtopics` | 4,436 | `topic_id → …` |

**Content:** `mcqs` (872,603), `options` (3,490,412), `mcqs_fts` (fts5, 872,603). `mcqs` already carries per-question knowledge depth on ~all rows: `learning_objective`, `bloom_taxonomy`, `confidence_score`, `estimated_time_sec`, `memory_trick` (871,752), `exam_tip` (871,752), `explanation_why_wrong`, `references_json`, `exam_ids` (651,812).

**Pre-existing knowledge scaffolding (shallow, and INERT):**

| Table | Rows | Reality |
|---|---|---|
| `concepts` | 2,950 | `id, topic_id, name, freq`. Tag-derived by `scripts/seed-ai.cjs`. Names are keyword fragments (`ratios`, `deep-kb`, `Accounting Principles`). Covers 215/243 subjects; many subjects have only 1–3. **No definitions, no relations, no objectives.** |
| `mcq_concepts` | 330,210 | `mcq_id ↔ concept_id`. Links 65,637 / 872,603 MCQs. |
| `references_tbl` | 66 | `mcq_id, subject_id, title, url, kind` — URL-level only (no edition/publisher/year). |

**Critical finding:** *No application code reads `concepts` / `mcq_concepts`.* Confirmed across `server.js`, `ai/*`, `assets/js/*`. `pipeline/audit.js` explicitly states concepts are "modelled as `learning_objective` on mcqs + subtopics." The de-facto concept model the live app consumes is **`mcqs.learning_objective`** (flashcard fronts in `ai/flashcards.js`; surfaced by `ai/adaptive.js`).

**User/learning-engine tables (Phase-12, untouched by this phase):** `user_profiles, learning_sessions, history, weak_topics, strong_topics, study_plans, revision_schedule, flashcards, recommendations, predictions, notifications, achievements, current_affairs, leaderboard, leaderboard_periods, analytics, bookmarks, quizzes, mocktests, pastpapers, pipeline_state, ai_state`.

## 3. Application layers (13 features — all map to existing tables)

Search → `mcqs_fts`; Dashboard → `/api/stats`; Practice/Quiz/Mock → `/api/random` + `quizzes`/`mocktests`; Past-papers → `pastpapers`; Exam mapping → **CSV in `mcqs.exam_ids` / `subjects.exam_ids`** filtered via `(','||exam_ids||',') LIKE '%,<exam>,%'` (no weighted table today); Taxonomy browse → `subjects/chapters/topics` + 244 static `subjects/*.html` + 876 `chapters/*.html` SEO pages (**must not break**); Admin → `admin.html` + `assets/js/admin.js`; Analytics/Bookmarks/Progress/Leaderboards → their Phase-12 tables + `ai/*` router. **No knowledge-pack / concept-graph UI or API exists.**

## 4. Generator ↔ subject coverage

- 523 generator objects cover **244 distinct subject ids; every catalogued subject has a generator (0 missing).** 44 extra ids are emitted dynamically at insert time.
- Two archetypes: **fact-pool / KB** (plateaus at authored pack size) and **parametric** (scales via numeric loops — only physics/math/stats/reasoning).
- Knowledge is **hardcoded in generator source**, not data files (sole exception: `pipeline/data/ph11-banks.json`, word banks).
- **52 non-hub subjects sit under 500 MCQs** (thin content) — these are the Knowledge-Pack priority set (e.g. `botany` 26, `constitution` 29, `sociology`, `anthropology`, `commerce`, medical/CS long-tail, entry-tests).

## 5. Gap analysis vs Phase-14 Step-1 target tables

| Phase-14 logical table | Exists? | Decision |
|---|---|---|
| subjects / chapters / topics / subtopics | ✅ full | **Reuse as-is** (the spine) |
| concepts | ⚠️ shallow+inert `concepts` | **Do not clobber.** Build rich `kg_concepts` (FK → topic/subtopic), keep legacy for the tag-link app path |
| micro_concepts | ❌ | create `kg_micro_concepts` |
| learning_objectives | ⚠️ only `mcqs.learning_objective` string | create `kg_learning_objectives` (structured), keep column |
| exam_mappings | ⚠️ only CSV strings | create `kg_exam_mappings` (LO/concept ↔ exam + weight) |
| concept_relations | ❌ | create `kg_concept_relations` |
| prerequisites | ❌ | create `kg_prerequisites` |
| difficulty_profiles | ❌ | create `kg_difficulty_profiles` |
| knowledge_packs | ❌ | create `kg_knowledge_packs` (one per subject, 18 sections) |
| reference_sources | ⚠️ URL-only `references_tbl` | create `kg_reference_sources` (edition/publisher/year, metadata only) |
| syllabus_units | ❌ | create `kg_syllabus_units` |
| learning_paths | ❌ | create `kg_learning_paths` |
| concept_statistics | ❌ | create `kg_concept_statistics` |
| concept_history | ❌ | create `kg_concept_history` (audit/incremental) |
| question_blueprints (Step 6) | ❌ | create `kg_question_blueprints` |
| distractor_pools (Step 7) | ❌ | create `kg_distractor_pools` + `kg_distractor_items` |

## 6. Architectural decisions (binding for Steps 1–12)

1. **Namespace `kg_`** for every new table. Zero collision with taxonomy, the inert legacy `concepts`, or the live `learning_objective` path. Phase-14 logical names map 1:1 to physical `kg_*`.
2. **Home = a new `db/kg-migrate.js` module invoked from `db/engine.js migrate()`** (idempotent `CREATE TABLE IF NOT EXISTS`), mirrored into `db/schema.sqlite.sql` / `.pgsql.sql` / `.mysql.sql`. Satisfies Step 11 "future PostgreSQL compatibility" by construction; fully reversible (drop `kg_*`).
3. **FK spine:** `kg_concepts.subject_id/chapter_id/topic_id/subtopic_id` reference the existing taxonomy — no re-modelling of subjects/chapters/topics.
4. **No MCQ generation this phase.** Blueprints and distractor pools are structural rows only. Existing `mcqs` untouched.
5. **No fake data.** Knowledge packs/concepts are authored from real curriculum structure per subject; a subject with insufficient knowledge gets its pack authored first (Step-3 order: pack → concepts → objectives → blueprints).
6. **Performance:** every `kg_*` table indexed on its FK + name; heavy read paths (coverage dashboards) use covering indexes; `kg_concept_statistics` is a denormalised rollup to keep admin dashboards O(subjects) not O(concepts).

## 7. What Step 1 will create (next)

`db/kg-migrate.js` with the 18 `kg_*` tables above + indexes, wired idempotently into `engine.js`, verified by re-open (no-op on second run), and mirrored into the three canonical schema SQL files. No data written yet — Step 2 (Knowledge Pack Engine) populates.

---
*End of Step 0. Proceeding to Step 1 — Knowledge Graph schema.*
