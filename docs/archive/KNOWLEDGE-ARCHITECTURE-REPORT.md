# Knowledge Architecture Report — Phase 14 (STEP 0)

Generated: 2026-08-04 · DB: SQLite `db/pakistan-mcqs.sqlite` (engine: `db/engine.js`, node:sqlite, zero-dep)

## 1. Platform Inventory
- **Site:** static-first `index.html` + `assets/js/app.js` (8 views) + `assets/js/admin.js` + `assets/js/ai.js` (Phase 12 AI Coach). Localhost API `server.js` (port 8765) with `db/engine.js` open-layer (SQLite default; MySQL/MariaDB/PostgreSQL adapters present but SQLite-only migrations).
- **Pipeline:** `pipeline/run.js` + 517 generators (`.js`), `pipeline/quality.js` gates (jaccard 0.75/0.9/0.95, 95-target), `db/validate.js --fix` (0.01% legacy issues), `pipeline/reports.js`, `scripts/gen-seo-pages.cjs` (1,129 URLs), `scripts/seed-ai.cjs`, `scripts/ai-selfcheck.cjs`.
- **Search:** FTS5 `mcqs_fts` (question, explanation, tags) + `/api/search`.
- **Learning engine (Phase 12):** `ai/` 14 modules, `/api/ai/*` (19 endpoints), user_profiles, weak/strong topics, spaced repetition, adaptive quiz, mock predictions, flashcards, analytics, leaderboards, achievements.

## 2. Knowledge-Relevant Data (audited 2026-08-04)
| Source | Rows / Coverage |
|---|---|
| subjects → chapters → topics → subtopics | 243 → 884 → 1,597 → 4,436 (hierarchy intact, chapters carry subject_id) |
| mcqs | **872,603** (all with `status='active'` counts) |
| mcqs.learning_objective | **872,603 (100%)**, **216,929 distinct** real objectives |
| mcqs.tags | **872,603 (100%)** JSON tag arrays |
| mcqs.memory_trick | **871,752 (100%)** |
| mcqs.exam_tip | **871,752 (100%)** |
| mcqs.explanation_why_wrong | **872,603 (100%)** (misconception evidence) |
| mcqs.exam_ids | 651,812 (75%) — exam attribution for mappings |
| mcqs.references_json | 3,116 (physics template) — sparse, needs authored metadata |
| concepts + mcq_concepts (Phase 12) | 2,950 concepts, 330,210 links (avg 4.6/topic) |
| exams registry | `data/exams.json` (60+ slugs, Phase 10) |
| difficulty / bloom | easy/medium/hard + Bloom taxonomy on 100% of MCQs |

**Coverage verdict:** every MCQ carries learning_objective + tags + memory_trick + exam_tip + explanation_why_wrong → the MCQ corpus itself is a **real, validated knowledge source** (216,929 distinct objectives, ~2M explanation sentences). The knowledge graph can be built by extraction + authored packs — zero fabrication required.

## 3. Knowledge Graph Architecture (Phase 14 target)

```
subject (knowledge_pack, syllabus_units)
 └─ chapter
    └─ topic
       └─ subtopic
          └─ concept            (tag/objective-level units, mined + authored)
             └─ micro_concept   (distinct learning objectives, mined)
                └─ learning_objective (knowledge statements + exam mapping)
                   └─ question blueprints (18 pattern types, classified from real MCQs)
concept_relations   : parent/child/related/prerequisite/depends_on (hierarchy + shared-MCQ strength)
exam_mappings       : (objective, exam, weight) from mcqs.exam_ids + exam frequency
difficulty_profiles : per concept — difficulty mix, avg time, bloom mix
distractor pools    : per subject/concept — same-domain terms (real, in-domain only)
reference_sources   : authored metadata (type/title/authors/edition/year/publisher/syllabus)
knowledge_packs     : per-subject composed pack (overview, domains, glossary, facts, formulas,
                      misconceptions, memory techniques, exam tips, frequently-tested, difficulty)
learning_paths      : authored + chapter-order derived paths for major subjects
concept_statistics  : exam frequency, attempt stats, revision priority
concept_history     : versioned build snapshots
```

## 4. Decisions & Rules
- **No fake data:** every concept/micro-concept/objective/pattern/distractor is either (a) mined from the 872K-MCQ corpus (real), or (b) authored by the pack author (real domain knowledge, metadata-only references). Subjects too small to reach targets keep their honest counts; reports surface the gap.
- **No external APIs / no paid AI** — fully offline.
- **Idempotent builds** with `ai_state`-style markers; incremental re-runs supported.
- **Scale:** indexes on every graph table; FTS5 on concepts + objectives; paged APIs; builds run as background scripts (not per-request), API layer reads only.
- **PostgreSQL compatibility:** schema uses portable types (TEXT/INTEGER/REAL), no SQLite-only syntax in the API layer; `kg/` modules go through the engine's `db.*` abstraction.

## 5. Deliverables Checklist (Phase 14)
1. Schema: 17 tables (extend existing subjects/concepts; add micro_concepts, learning_objectives, exam_mappings, concept_relations, difficulty_profiles, knowledge_packs, reference_sources, syllabus_units, learning_paths, concept_statistics, concept_history, distractor_pools, question_blueprints, blueprint_types, pack_sections).
2. `kg/` engine: extract, pack, relate, map, blueprint, distract, refs, validate, stats, router.
3. `scripts/seed-kg.cjs` idempotent build. 4. Admin KG dashboard. 5. Reports (STEP 9 + STEP 12) + CHANGELOG.
