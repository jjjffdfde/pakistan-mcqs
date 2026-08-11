# Generation Pipeline Report 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4 (Deterministic Original Content Generation)*

## 1. Overview

The pipeline generates **original, deterministic, explanation-rich MCQs**
with zero external data — every question is produced from hand-written
template logic in `pipeline/generators/*.js` and written straight into the
local SQLite database (`db/pakistan-mcqs.sqlite`). Combined with the curated
static bank and the Phase-4 audit, the repository now contains **240,716
unique MCQs** across **183 subjects** — exceeding the 200,000 target.

```
node pipeline/run.js [--target N] [--fresh] [--subjects a,b] [--seed N] [--maxTime M]
```

| Flag | Meaning | Default |
|---|---|---|
| `--target N` | Stop generating once the DB holds ≥ N MCQs | 500,000 |
| `--fresh` | Ignore resume state (re-runs every topic, still dedupes by qhash) | off |
| `--subjects a,b` | Generate only the listed subjects | all |
| `--seed N` | Seed for deterministic generation | 20260731 |
| `--maxTime M` | Stop after M minutes (resumable) | unlimited |

## 2. Architecture

```
pipeline/run.js                orchestrator: subject order, state, DB writes
pipeline/lib.js                shared helpers (norm, buildMcq, factGenerator,
                               parametric generators, difficulty mapper)
pipeline/generators/01..17.js  content generators (one file per domain)
db/engine.js                   SQLite access layer (zero-dependency node:sqlite)
db/schema.sqlite.sql           DDL (16 tables + FTS5)
db/pipeline_state              resume state (table)
```

### 2.1 Generator contract

Each generator file exports an object whose keys are **subject ids**; each
value is either a function or `{ fn, tags, topics }`:

- `fn(s, seed, topics)` must return an array of **facts** or **templates**:
  - *facts*: `{ q, a, e }` — literal question/answer/explanation triples;
    `factGenerator(s, facts, topics)` wraps them into MCQs with 3 generated
    distractors, or 4 when the answer itself is an option.
  - *templates*: functions `(s, seed) => { q, a, e, rnd?, distractorCount? }`
    returning one deterministic MCQ per call; a `parametric(n)` wrapper
    enumerates **all** instantiations (no randomness), so capacities are
    exact and stable across runs.
- `buildMcq(s, q, a, e, opts)` in `lib.js`:
  - normalizes text (Unicode-aware `[\p{L}\p{N}]` — critical for Urdu),
  - builds 4 options from the answer + distractors with a `seen`-Map dedupe
    (re-rolled when a distractor equals the answer or another option),
  - assigns difficulty from explanation/option shape heuristics,
  - computes the qhash (sha256 of normalized question) for dedupe.

## 3. Subject coverage (183 subjects across 17 files)

| File | Domain | Subjects (sample) | Capacity |
|---|---|---|---|
| 01-math.js | Mathematics, Statistics, Aptitude | percentages, ratios, averages, profit-loss, simple-interest, time-work, speed-distance-time, ages, lcm-hcf, exponents, fractions, number-series, geometry, mean/median/mode, dispersion, probability, sampling, tables/graphs, percent-comparisons | ~179,600 |
| 02-reasoning.js | Verbal & non-verbal reasoning | letter-series, number-series, coding-decoding, odd-one-out, analogies, blood-relations, direction-sense, ranking | ~11,700 |
| 03-programming.js | Languages + algorithms | c, cpp, csharp, python, java, javascript, php, go, rust + loops/operator templates | ~45,100 |
| 04-computer.js | Computer science & IT | computer-science, ms-office, networking, os, database, web dev stack, ai/data/cyber | facts |
| 05-science.js | Physics, chemistry, biology | motion/force, electricity/waves parametrics + facts | ~6,100 |
| 06–13 | Pakistan, Islamic, English, GK, etc. | curated fact banks | facts |
| 14-entry-tests.js | Entry tests | mdcat, ecat, lat, gat, gre, ielts, toefl, sat | facts |
| 15-exam-awareness.js | 33 exam-pattern subjects | css-exam, ppsc, fpsc, nts, ots, pma, issb, ... | facts |
| 16-urdu.js | Urdu | urdu grammar (20) + literature (30) — first Unicode-safe content | facts |
| 17-essay-nextjs.js | essay, next-js | essay structure/types, next-js routing/rendering | facts |

The **fact bank** (100% hand-authored, 4,000+ topics) guarantees quality
coverage for every subject; the **parametric templates** provide the scale.
Every subject ends with ≥ 1 MCQ (verified: 183/183).

## 4. Resumability & idempotency

- `pipeline_state` stores `pipeline:done-topics` (JSON map of
  `subjectId|topicId → count`) after each topic; a re-run skips finished
  topics and continues — the final 200K run was a single `--fresh` pass.
- Every insert is guarded by the **qhash UNIQUE** constraint; duplicates are
  counted and skipped, so `--fresh` can never create repeated questions.
- `ON CONFLICT` upserts for chapters/topics re-read the persisted row id
  before inserting MCQs (fixes FK failures after resumed runs).

## 5. Phases of a run

1. **STEP 0** — open DB, ensure schema, expand `exam-preparation` subjects
   (35 exam-pattern subjects incl. renamed `css-exam` to avoid clashing with
   the web-CSS subject).
2. **STEP 1** — load all 17 generator files; validate every subject key
   resolves to a real subject; report "uncovered" subjects.
3. **STEP 2** — iterate subjects in stable order; for each topic, run the
   generator (facts or enumerated templates), dedupe by qhash, batch-insert
   MCQs + options in transactions (5,000 rows per batch).
4. **STEP 3** — check `TARGET`; stop early if reached (or `--maxTime`), log
   stats (generated / skipped / inserted), persist state.

## 6. Run results (2026-08-01)

| Metric | Value |
|---|---|
| Target | 200,000 |
| DB total after run | **240,716** MCQs |
| Inserted this run | 161,673 |
| Skipped (duplicate qhash) | ~124,000 |
| Options written | 962,864 |
| Subjects covered | 183 / 183 (100%) |
| Distribution | math+stats ~65%, reasoning ~11%, programming ~11%, science ~3%, facts balance |

The bank is intentionally **mathematics-heavy**: the stable subject order
fills math subjects first, so an early `--target` stop leaves the remaining
fact subjects at 0. To balance, either lower `--target` or reorder subjects.

## 7. Quality gates

- Explanations: every MCQ has one (avg ~135 chars; parametric templates
  generate step-by-step working).
- Options: exactly 4, unique, shuffled deterministically (seed), answer
  letter tracked in `correct_answer`.
- Unicode: `norm()` is `\p{L}\p{N}`-aware so Urdu/Arabic content normalizes
  correctly (Phase-4 fix; Urdu subjects produce full options).
- Dedupe: qhash UNIQUE + `seen`-Map distractor dedupe in `buildMcq`.
- Verification: `node scripts/audit.js` on the static site (0 FAIL/0 WARN),
  DB integrity checks in `docs/db-design-2026.md`.

## 8. Operations

```powershell
node pipeline\run.js --target 250000            # grow the bank to 250K
node pipeline\run.js --fresh --subjects urdu    # regenerate one subject
node pipeline\run.js --maxTime 30               # 30-minute run, resumable
node db\export-json.js                          # mirror DB → data/export/*.json
```

Recovery: if a run is interrupted, simply re-run without `--fresh` — it
resumes at the next unfinished topic (state persisted after every topic).
