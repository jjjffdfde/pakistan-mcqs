# Phase 12 — AI-Powered Personalized Learning Engine (Implementation Plan)

> Scope: upgrade the EXISTING static-first site + localhost API (port 8765, SQLite)
> into an AI learning ecosystem. **No UI redesign, no URL/SEO changes, no DB
> replacement.** All existing views/endpoints keep working. Target: production-ready
> at 1M+ MCQ scale with zero placeholders.

## Architecture Principles
1. **Server-side AI core** — all intelligence (profile, weak-topic detection, spaced
   repetition, planning, predictions, recommendations, analytics, leaderboards)
   lives in a new `ai/` module directory behind `/api/ai/*` endpoints on the existing
   server.js router. Nothing AI is hard-coded in the browser.
2. **DB via existing migrate()** — every Phase 12 table is created idempotently in
   `db/engine.js` `migrate()` (following the proven `CREATE TABLE IF NOT EXISTS` /
   `ALTER TABLE ADD COLUMN` pattern) and mirrored in `db/schema.sqlite.sql`.
3. **device_id "default"** — the frontend already posts `device_id: "default"`.
   AI endpoints default to it, keeping all existing history/leaderboard data aligned.
4. **Surgical app.js patches only** — 3 tiny edits to measure per-question time and
   skip state in `trackAnswer`; everything else in a NEW `assets/js/ai.js` + a new
   `view-ai` section and one nav link in `index.html`.
5. **Idempotent seeding** — `scripts/seed-ai.cjs` backfills current-affairs digest,
   flashcards, plans, predictions; safe to re-run.

## Step 1 — Audit (DONE)
DB inventory, API endpoint inventory, frontend view/function inventory, app.js
internals (state closure, trackAnswer, weakTopics, renderDashboard/renderPlanner,
DB helper, showView), server.js router tail, migration pattern. See summary below.

### Audit Findings (ground truth)
- **DB**: mcqs 869,487 active (243 subjects / 884 chapters / 1,597 topics /
  4,436 subtopics / 110 pastpapers / 95 mocktests / 21 quizzes). mcqs carry
  `learning_objective`, `bloom_taxonomy`, `confidence_score`, `estimated_time_sec`,
  `memory_trick`, `exam_tip`, `explanation_why_wrong` — rich seed data for AI.
- **history** (49 rows): `device_id, mcq_id, correct, points, mode, answered_at`.
  MISSING: time_taken_sec, skipped, session_id, denormalized subject/topic.
- **leaderboard**: points + week_key/month_key only. No daily/city/province/period.
- **analytics**: generic event log, empty.
- **Missing tables**: user_profiles, weak/strong_topics, study_plans,
  revision_schedule, flashcards, recommendations, predictions, notifications,
  current_affairs, concepts/knowledge graph, leaderboard_periods, ai_state.
- **Frontend**: app.js single IIFE (closure state), 8 views, per-answer
  `dbPost("/api/history")`, client-side weakTopics() (total≥3 && acc<60),
  client-side streak/achievements/points; renderDashboard & renderPlanner exist.

## Step 2 — DB Schema (migrate() + schema.sqlite.sql)
New tables (all idempotent, sqlite-flavored to match existing migrate()):
1. `user_profiles` — PK device_id; name, daily_hours, target_exam, target_date,
   skill_level (novice/intermediate/advanced/expert), readiness_score,
   avg_accuracy, avg_speed_sec, consistency, total_sessions, last_active.
2. `learning_sessions` — id PK; device_id, session_type (practice/quiz/mock/
   adaptive/flashcard/pastpaper), mode, mcqs_answered, correct, skipped,
   accuracy, duration_sec, started_at, ended_at.
3. `history` EXTEND — ADD COLUMN time_taken_sec INTEGER DEFAULT 0,
   skipped INTEGER DEFAULT 0, session_id INTEGER.
4. `weak_topics` — PK(device_id, topic_id); subject_id, weakness_score,
   incorrect, total, skipped, slow_avg_sec, priority, updated_at.
5. `strong_topics` — PK(device_id, topic_id); strength_score, correct, total,
   streak, updated_at.
6. `study_plans` — id PK; device_id, plan_date, plan_type (daily/weekly/monthly),
   items_json, created_at.
7. `revision_schedule` — id PK; device_id, mcq_id, topic_id, box, ease,
   interval_days, due_date, last_review, next_review, reviews, status.
   UNIQUE(device_id, mcq_id).
8. `flashcards` — id PK; device_id, mcq_id, front, back, card_type
   (fact/definition/date/trick/formula), box, ease, due_date, next_review,
   reviews, created_at.
9. `recommendations` — id PK; device_id, rec_type (weak-topic/mock/pastpaper/
   flashcard/revision/current-affairs), target_id, title, reason, priority,
   created_at, seen.
10. `predictions` — id PK; device_id, exam_id, exam_title, prob_pass,
    expected_score, readiness, strong_areas, weak_areas, created_at.
11. `notifications` — id PK; device_id, type, title, body, link, read, created_at.
12. `achievements` — id PK; device_id, code, name, unlocked_at, value.
13. `current_affairs` — id PK; period (daily/weekly/monthly/yearly), category,
    title, summary, source_subject, period_date, created_at.
14. `concepts` + `mcq_concepts` — knowledge-graph nodes derived from
    tags/learning_objective/topic; backfilled by seed script.
15. `leaderboard_periods` — PK(device_id, period, period_key); points, correct,
    total, updated_at. Enables daily/weekly/monthly/yearly + city/province dims.
16. `ai_state` — key/value cache for computed stats (readiness, mastery maps,
    digest builds) with refresh timestamps.
Indexes on: revision_schedule(device_id,status,due_date),
flashcards(device_id,due_date), weak_topics(device_id,priority),
leaderboard_periods(period,period_key,points).

## Step 3 — Server AI Modules (`ai/`)
- `ai/profile.js` — profile computation from history (accuracy, speed, volume,
  recency, skill level, readiness).
- `ai/weak.js` — weak/strong topic rebuild: per-topic accuracy (<60% = weak,
  >=80% with >=5 attempts = strong), attempt floor, speed penalty, recency weight.
- `ai/spaced.js` — SM-2-lite scheduler (box 1/3/7/14/30/60/90, ease factor),
  due-now retrieval with topic bias.
- `ai/planner.js` — daily/weekly plan: target questions from daily_hours and
  readiness; slots = weak topics + revision + mock + flashcards; persisted.
- `ai/adaptive.js` — adaptive quiz: seeds weak topics, difficulty progression
  based on live accuracy, injects due revision items, one question at a time.
- `ai/mock.js` — mock builder (reuses existing 95 mocktests) + **prediction
  engine**: per-chapter expected score from history, prob of passing target exam,
  readiness %, strong/weak area map.
- `ai/recommend.js` — hybrid recommendations: weak topics → adaptive/practice,
  due items → revision, low-scoring chapters → mocks/pastpapers, trends →
  current affairs.
- `ai/flashcards.js` — card builder from mcqs (front: question/learning_objective;
  back: answer + memory_trick + explanation).
- `ai/current.js` — current-affairs digest API from seeded table.
- `ai/analytics.js` — daily activity curve, accuracy trend, mastery heatmap,
  predicted-score trend, consistency metric.
- `ai/leaderboard.js` — daily/weekly/monthly/overall + city/province boards from
  leaderboard_periods.
- `ai/achievements.js` — server-side achievement + points engine (mirrors and
  extends client), notifications writer.
- `ai/router.js` — endpoint registry mounted in server.js (single require + mount).

### New API endpoints
`GET/POST /api/ai/profile` · `GET /api/ai/weak-topics` · `GET /api/ai/strong-topics`
· `GET /api/ai/planner` · `POST /api/ai/planner/regenerate` ·
`GET /api/ai/spaced/due` · `POST /api/ai/spaced/review` ·
`POST /api/ai/adaptive/start` · `POST /api/ai/adaptive/submit` ·
`POST /api/ai/adaptive/finish` · `GET /api/ai/mock/predictions` ·
`POST /api/ai/mock/predict` · `GET /api/ai/recommendations` ·
`GET /api/ai/flashcards/due` · `POST /api/ai/flashcards/review` ·
`GET /api/ai/current-affairs` · `GET /api/ai/analytics` ·
`GET /api/ai/leaderboard` (period/city/province params) ·
`GET /api/ai/achievements` · `GET /api/ai/notifications` ·
`POST /api/ai/notifications/read` · `POST /api/ai/refresh`
(mount: `ai/router.js` → `server.js` before 404 handler).

### Patched existing endpoints
- `POST /api/history` — accept & store `time_taken_sec`, `skipped`, `session_id`;
  award points; upsert leaderboard_periods; enqueue achievement checks.
- `GET /api/history` — join mcqs to return subject/topic (already partially done).

## Step 4 — Frontend (`index.html` + `assets/js/ai.js` + surgical app.js)
- `index.html`: one nav link "AI Coach" + `<section id="view-ai">` with sub-tabs:
  Dashboard (readiness, prediction, streak, upcoming), Planner, Revision, Adaptive,
  Mock Predictor, Flashcards, Recommendations, Current Affairs, Analytics,
  Leaderboard. Plus dashboard injection points (`#aiReadiness`, `#aiPlannerUpgrade`
  inside existing view-dashboard).
- `assets/js/ai.js` (new IIFE, ~similar style to app.js): hash routing for
  `#ai-coach`, own `fetch` calls to `/api/ai/*` with DB-style fallback messaging,
  renders all sub-tabs, records adaptive/flashcard/revision answers, shows
  notifications. No dependency on app.js closure.
- `app.js` surgical edits: (1) `trackAnswer(m, correct, timeSec, skipped)` signature;
   (2) in practice answer handler capture elapsed; (3) in quiz answer handler
   capture elapsed + skip button. Defaults preserve current behavior.
- Existing dashboard: append AI readiness card + smart planner block rendered by
  ai.js into injected containers (still same page/section).

## Step 5 — Seeding (`scripts/seed-ai.cjs`, idempotent)
1. Current affairs digest: scan `current-affairs` & `world-current-affairs`
   subjects' MCQs → group by topic/year into daily/weekly/monthly/yearly briefs.
2. Concepts backfill: extract concept n-grams from mcqs.tags +
   learning_objective (title-case tokens, length ≥ 3, freq ≥ 5 per topic), link
   via mcq_concepts; cap per topic for 1M+ scale.
3. Flashcards warm-up: batch-build from high-value mcqs (memory_trick present,
   confidence < 0.95, exam-linked) — first 1,000 eligible.
4. Plans: generate 7-day daily plans + weekly plan for "default".
5. Predictions: seed for top 20 mocktests/pastpapers with current readiness.
6. Achievements: import existing client-side unlocked set from localStorage is
   NOT possible server-side; instead initialize from history totals (First Steps,
   Century Club, MCQ Veteran, streak) — deterministic, no placeholders.
7. Write `ai_state` build markers (skip rebuild if fresh).

## Step 6 — QC & Wrap
- `node db\validate.js --fix` must remain 0 issues; all existing endpoints smoke-
  tested via `scripts/ai-selfcheck.cjs` (every /api/ai/* returns 200 + sane JSON).
- Performance: all new hot queries use indexes; adaptive/mock generation capped
  (e.g. 60 q max), planner regen cached in ai_state (TTL 6h).
- Backup DB (like Phase 11), write `docs/PHASE12-REPORT.md`, update CHANGELOG.md,
  update sitemap only if URLs unchanged (they are — no new URLs).
- Final acceptance: run server, walk all views incl. AI Coach end-to-end.

## Deliverables Order
1. ✅ Audit (this doc)
2. Schema (migrate + schema.sqlite.sql + boot test)
3. ai/ modules + router mount + server.js patches
4. index.html + ai.js + app.js surgical edits
5. seed-ai.cjs + run + verify
6. ai-selfcheck.cjs + QC + backup + PHASE12-REPORT.md + CHANGELOG.md
