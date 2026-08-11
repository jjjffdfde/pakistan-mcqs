# Database Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3 (Enterprise Expansion)*

## Schema (JSON files under `data/`)

| Entity | File | Records | Key refs |
|---|---|---|---|
| Categories | `categories.json` | 16 | `id`, `subjects[]` |
| Subjects | `subjects.json` | 147 | `category`, `exams[]`, `status` |
| Chapters | `chapters.json` | 400 | `subject` |
| Topics | `topics.json` | 719 | `chapter`, `subtopics[]` |
| Exams | `exams.json` | 38 | `category`, `programs[]` |
| Programs | `programs.json` | 12 | — |
| Mock tests | `mock_tests.json` | 6 | `exam`, `subjects[]` |
| Quizzes | `quizzes.json` | 21 | `subjects[]` |
| Papers | `papers.json` | 40 | `exam`, `subjects[]` |
| References | `references.json` | 8 | `id`, `title`, `url` |
| MCQs (master) | `mcqs.json` | 1338 | `subject`, `chapter`, `topic`, `exam[]`, `subtopic`, `references[]`, `relatedQuestions[]` |
| MCQ sections | `mcqs/*.json` | 34 files | per-file sections |

## Referential integrity (all checked)

| Check | Failures |
|---|---|
| chapters.subject → subjects.id | 0 |
| topics.chapter → chapters.id | 0 |
| mcq.subject / mcq.chapter / mcq.topic refs | 0 / 0 / 0 |
| quiz.subjects[] → subjects.id | 0 |
| mock_test.subjects[] → subjects.id | 0 |
| paper.exam → exams.id, paper.subjects[] → subjects.id | 0 / 0 |
| exam.category → categories.id | 0 |
| subject.category → categories.id | 0 |
| MCQ ids unique / question text unique | 0 / 0 |
| MCQ options present (A–D), valid answer letter | 0 / 0 |
| MCQ with no/very short explanation | 0 |
| relatedQuestions[] all resolve to existing MCQs | 0 |

## Coverage

- Subjects with 0 MCQs: **0** (all 147 subjects covered).
- Categories used: **16/16**.
- Exams referenced in MCQ bank: **38/38** (incl. pma, issb, punjab-police, fia-inspector, anf, wapda, fbr, sbp, banking, entry-test programs).
- Avg explanation length: 135 chars; every MCQ has a detailed explanation.

## Phase 3 data additions

- **Migration script** `scripts/migrate-phase3.js` (idempotent, re-runnable):
  - **Subjects:** 72 → **147** (+75: IQ, reasoning suite, language suite, IT/programming suite, medical entry (mbbs/bds/dpt/pharmacology/anatomy), management (hrm/marketing), world history, machine-learning, deep-learning, ethical-hacking, devops, big-data, database, sql, windows, linux, html, css, js, typescript, react, next, vue, angular, node, express, php, laravel, python, django, flask, java, spring, cpp, csharp, dotnet, golang, rust, git, docker, kubernetes, rapid, graphql, entry-test subjects, world-current-affairs and more).
  - **Chapters:** 221 → **400** (+179). **Topics:** 361 → **719** (+358), each new topic carrying `subtopics[]` (e.g. `["fundamentals", "practice questions"]` or topic-specific subtopic lists).
  - **Exams:** 29 → **38** (+9). **Categories:** 15 → **16** (+entry-tests).
  - **New entity `references.json`** — 8 citation sources referenced by new MCQs via `references[]`.
- **Content generation** (`scripts/phase3/`): 417 new original MCQs across 10 new section files (25–34), total bank **921 → 1338**:
  - 25-language-ability (43), 26-reasoning (46), 27-it (50), 28-programming (126), 29-engineering (24), 30-medical (37), 31-management (20), 32-social (19), 33-entry-tests (40), 34-world-current (12).
- **Schema extension** `scripts/build-mcqs.js`: every MCQ enriched with `subtopic` (string), `references` (array) and auto-computed `relatedQuestions` (same chapter + ≥2 shared tags, top 5).

## Maintenance workflow

1. Edit section files in `data/mcqs/` (or via admin panel).
2. Run `node scripts/migrate-phase3.js` to expand taxonomy (idempotent).
3. Run `node scripts/build-mcqs.js` — validates all JSON + schema, merges into `data/mcqs.json`.
4. Run `node scripts/audit.js` — reference/duplicate/HTML/JS checks → `docs/audit-report.md`.

## Notes

- `data/mcqs.json` is a **generated artifact** — never hand-edit; always rebuild.
- Quiz/mock/paper entities reference **subjects** (not chapters) — keep this convention.
- Papers carry no `year` field by design (pattern-based papers, not dated past papers).
- New sections use prefixed ids per subject (`vcb-`, `gra-`, `mln-`, `htm-`, `mec-`, `acc-`, ...) to avoid collisions with legacy `t-###` ids.

## Verdict

Database layer is consistent: 0 orphan references, 0 duplicates, full subject coverage (147/147), 0 audit failures. Ready for further content growth.
