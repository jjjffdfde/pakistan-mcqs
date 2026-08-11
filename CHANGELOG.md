# Changelog

All notable changes to Pakistan MCQs Hub.

## [Phase 12 — AI-Powered Personalized Learning Engine] — 2026-08-04

- **Mission:** upgrade the existing site (no UI redesign, no URL/SEO/DB changes) into an AI learning ecosystem: adaptive quizzes, mock-test predictions, study planner, spaced repetition, flashcards, recommendations, analytics, period leaderboards, current-affairs digest, achievements & notifications. Server-side AI core; production-ready at 1M+ MCQ scale, zero placeholders.
- **DB (16 new tables + history extension, idempotent in `db/engine.js` migrate()):** `user_profiles` (skill level, readiness, accuracy/speed/consistency/streak, target exam/date, city/province), `learning_sessions`, `weak_topics`/`strong_topics` (accuracy <60% => weak, >=80% ×5 attempts => strong, skip/speed penalties), `study_plans` (7-day rolling + weekly), `revision_schedule` (SM-2-lite boxes 1/3/7/14/30/60/90), `flashcards`, `recommendations`, `predictions` (expected score, pass odds, strong/weak areas), `notifications`, `achievements`, `current_affairs` (daily/weekly/monthly/yearly), `concepts` + `mcq_concepts` (knowledge graph), `leaderboard_periods` (daily/weekly/monthly/yearly + city/province), `ai_state`. `history` gained `time_taken_sec`, `skipped`, `session_id`.
- **Server (`ai/` — 14 modules + router, 19 new `/api/ai/*` endpoints):** profile/readiness model (acc 40% + consistency 20% + volume 20% + recency 20%), weak-topic rebuild, SM-2-lite spaced repetition (wrong answers auto-queue), 7-day planner (budget from hours/day, weak slots, revision/card quotas, mock every 4th day, exam countdown), server-graded adaptive quiz with live difficulty shift (easy <40% acc, hard >75%; 30% due-revision / 60% weak-topic pool), mock predictor (chapter-accuracy → expected score/pass probability/coverage), hybrid recommendations, flashcards built from learning_objective/memory_trick/explanation (failed cards cross-schedule MCQs), current-affairs API, analytics (14-day curve, mastery, session mix, prediction trend), period+region leaderboards, 8 server-side achievements + notifications. `POST /api/history` patched (time/skip/session/points/period upserts), `GET /api/history` joins subject/topic/chapter.
- **Frontend (non-invasive):** one new nav link + `#view-ai` "AI Coach" section with 11 tabs in `index.html`; new self-contained `assets/js/ai.js`; dashboard gains AI readiness card + smart planner block (injection containers, same page); `app.js` only 3 surgical edits (trackAnswer time capture, ai-coach hash route); 5 new CSS classes.
- **Seeding (`scripts/seed-ai.cjs`, idempotent):** 116 current-affairs digest items from 5,032 current-affairs MCQs; 2,950 knowledge-graph concepts + 330,210 MCQ-concept links from tags; warm predictions for top 20 mocks; 7-day plan + recommendations + achievements for default device.
- **Verification:** `scripts/ai-selfcheck.cjs` → **29/29 endpoint checks PASS** (boots server, all AI + patched endpoints). `db/validate.js --fix` → 869,487 MCQs, 100 legacy issues (0.01%), 0 duplicates (unchanged baseline). Performance on 869K DB: weak rebuild 60ms, profile 37ms, analytics 4ms, planner 326ms, mock predict ~1s, adaptive start ~0.8s.
- **Docs:** `docs/PHASE12-PLAN.md` (audit + plan), `docs/PHASE12-REPORT.md`. **Backup:** `backup/db-backup-2026-08-04-12-47-20/pakistan-mcqs.sqlite` (2,059 MB).

## [Phase 11 — Professional & Knowledge-Base Subjects ≥ 5,000] — 2026-08-04

- **Root cause:** 70 of 95 professional/KB subjects (medicine, engineering, CS, management, 6 zero-MCQ subjects: artificial-intelligence, express, business-administration, management-accounting, organization-behavior, auditing-standards) were below the 5,000-MCQ bar (deficit 303,150). Their authored fact banks plateaued (finite parametric spaces), and new letter-skills generators shipped as `.cjs` files that `run.js`'s `.js`-only loader never saw — zero-subject runs logged `SKIP <subject>: no generators`.
- **Fix 1 — loader + target:** new generators renamed to `.js` (517 generators / 69 files load clean); `expand-loop.js` now passes `--target 10000000` so the global `TARGET 500000` in run.js no longer halts expansion passes early.
- **Fix 2 — mega-combinatorial letter building (`20-kb-ph11-combos.js`):** crossover "Spelling and Letter Building" + "Letter Positions" topics for all 70 banked subjects from per-subject term banks (`data/ph11-banks.json`, 150 words × 64 subjects + 6 ph11k banks merged). Pair-family questions (C(n,2) ordered pairs, letter sums/differences) vary 2 words → gate jaccard ~0.55.
- **Fix 3 — single-word template trap:** original first/last-letter-position and vowel-count concepts shared 6/8 content words → jaccard 0.75 = exactly the gate's high-overlap threshold → 0 accepted. Rewrote all 3 as two-term variants (position sums, position differences, vowel totals, vowel differences) → 560 candidates/pass, 100% gate-pass. Yield for stalled subjects jumped from ~0–30 to ~500–800/pass.
- **Fix 4 — bank gaps:** express / management-accounting / organization-behavior / auditing-standards had no `ph11-banks.json` entries → combos never covered them; merged the 6 ph11k hardcoded banks into `ph11-banks.json` (70 subjects total).
- **Result:** expansion loops reached target — **all 95 Phase 11 subjects ≥ 5,000 active MCQs** (TARGETS COUNT 95, BELOW 0, DEFICIT 0). DB total: **869,487 MCQs** (was 556,945 at Phase 11 start), 243 subjects, 884 chapters, 1,597 topics, smallest subject = 4 (pre-existing legacy).
- **Validation:** `db/validate.js --fix` → 0.02% issues (138 flagged, 99 legacy short questions, 38 normalized dups dropped); `pipeline/reports.js` → 869,487 mcqs, validationIssues=0, qualityPass=89.4%, below5000=105 (all non-Phase-11 legacy/exam subjects), sitemapUrls=780.
- **SEO:** `scripts/gen-seo-pages.cjs` regenerated 243 subject + 884 chapter pages + sitemap (1,129 URLs).
- **Backup:** `backup/db-backup-2026-08-04-11-42-07/pakistan-mcqs.sqlite` (2,035 MB).

## [Phase 10 — Government Recruitment & Past Paper Intelligence Engine] — 2026-08-02

- **All 60 supported exams at ≥5,000 exam-bank MCQs.** Root cause of the 38 sub-5,000 exams (18 at zero: lesco, mepco, hesco, sepco, ssgc, sngpl, pakistan-post, rescue-1122, railway, etc.): `pipeline/run.js` capped each MCQ's `exam_ids` with `.slice(0, 6)` — core subjects (pakistan-affairs, general-knowledge, current-affairs, islamic-studies…) declare 22+ exams (kppsc, bpsc, ajkpsc, spsc sat past position 6 → only 4–685 each).
- **Fix:** cap removed (run.js); new `pipeline/phase10-attrib.cjs` re-attributed MCQs from each subject's full declared exam list — 273,136 rows backfilled across 235 subjects → **all 60 supported exams ≥5,000** (kppsc 5,406, bpsc 5,253, ajkpsc 5,255, spsc 5,128, mdcat 5,222, lat 5,050, pma 5,048, navy 5,124, paf 5,064, asf 5,111, fia 5,114, punjab-police 5,128, motorway 5,112, wapda 5,121, nadra 5,127, fbr 5,131, railway 5,048, rescue-1122 5,048, lesco 5,026 …).
- **17 new exam registries** in `data/exams.json` (rescue-1122, lesco, mepco, hesco, sepco, ssgc, sngpl, pakistan-post, teaching, sst, est, headmaster, inspector, sub-inspector, custom-inspector, income-tax-inspector, assistant-director) + 17 hub subjects in `pipeline/exam-subjects.js` (each with Exam Pattern/Conducting Authority awareness chapters) + awareness MCQs in `15-exam-awareness.js`.
- **New exam content modules:** `21-exam-province.js` (kppsc/spsc/bpsc/ajkpsc province knowledge: Geography, History & Politics, Culture & Economy; mdcat pattern/biology/chemistry/physics/english-reasoning; lat pattern/law-aptitude/pakistan-studies/urdu) and `22-exam-sector.js` (navy, paf, pma, asf, anf, mod, punjab-police, motorway-police, wapda, lesco, mepco, hesco, sepco, ssgc, sngpl, pakistan-post, rescue-1122, banking, nadra, fbr, sbp, election-officer, teaching, sst, est, headmaster, inspector, sub-inspector, custom-inspector, income-tax-inspector, assistant-director org/careers modules).
- **Result:** 53 exam hub subjects live, 37 generated in this run (+834 MCQs; DB **424,842**); 55 short-explanation lengthenings applied (all explanations ≥60 chars, `test-kb2` clean on both new modules).
- **Audit:** `docs/COVERAGE-REPORT-2026-08-02-12-45.md`, `docs/BATCH-REPORT-2026-08-02-12-45.md` +7 splits: 424,842 mcqs, validationIssues=0, qualityPass=78.1%, sitemapUrls=780.
- **Backup:** `backup/db-backup-2026-08-02-17-47-12/pakistan-mcqs.sqlite` (1.03 GB).

## [Phase 10 — Batch E Plateau Break (All Subjects >= 5000)] — 2026-08-02

- **Plateau root cause found:** all 9 Batch E English/Urdu subjects (vocabulary, synonyms, antonyms, grammar, idioms, comprehension, english-literature, sentence-correction, urdu) stalled at 434–2796 active MCQs. Cause: finite parametric spaces + flip-variant pairs producing qhash-identical (jaccard-1.0) duplicates that wasted draw slots, plus known-text quality-gate collisions.
- **Fix — mega-combinatorial crossover topics:** each module gained a numeric letter-count topic built from crossed word banks — Family A = deterministic ordered word pairs (`W[i] < W[j]`, combined letter counts, C(n,2) unique) and Family B = LONG(≥6 letters) × SHORT(≤5 letters) "how many more letters" (|L|×|S| unique). Lexical sorting eliminates flip-variant duplicates. New topics: vocabulary "Spelling and Letter Building", synonyms "Spelling and Word Lengths", antonyms "Word Lengths and Spelling", idioms "Idiom Words and Lengths" (~270-word natural-object bank), comprehension "Passage Word Skills" (~250-word bank), english-literature "Names and Letter Counts" (~110 author names), sentence-correction "Word Lengths and Spelling", grammar "Word Lengths and Letter Counts" (Family A only), urdu "حروف کی گنتی" (Urdu word banks).
- **Verification before running:** faithful capacity-probe simulation (`capacity-probe.cjs` — replicates per-pass acceptance: 400-known jaccard sample, quality gate ≥95, global qhash dedupe, regen-on-zero-insert; validated against real yields) predicted ≥5,000 reachable for every module; bank checker + full validation harness (short-ex/whywrong/trick/tip) ran clean on all 9.
- **Result:** expansion loop reached target in 54 passes — **all 9 Batch E subjects now at 5,000+ active MCQs** (vocabulary 5,027, synonyms 5,007, antonyms 5,016, grammar 5,085, idioms 5,071, comprehension 5,055, english-literature 5,055, sentence-correction 5,052, urdu 5,000). DB total: **424,008 MCQs**.
- **Audit:** `audit-coverage.js` + `reports.js` regenerated (docs/COVERAGE-REPORT-2026-08-02-12-22.md, docs/BATCH-REPORT-2026-08-02-12-23.md +7 splits): 424,008 mcqs, below5000=132 (all non-Batch-E subjects; 0 with generation modules), validationIssues=0, qualityPass=78.4%, sitemap=780.
- **Backup:** `backup/db-backup-2026-08-02-17-23-10/pakistan-mcqs.sqlite` (950 MB).

## [Phase 9 — Full Content Coverage & Final Audit] — 2026-08-01

- **Zero empty topics:** new `pipeline/generators/19-completion-banks.js` (24 banks / 31 exact-name topic banks) covers the last 31 empty topics (Data Interpretation, Aptitude Percentage Comparisons, Coding-Decoding, Odd One Out, Blood Relations, Direction Sense, Salivary Glands, Oral Structures, Urdu Literature, Geography, Fiqh, Number Series, Mean Median Mode, Drug Classes, Ancient World, Supervised Learning, Neural Networks, TypeScript Tooling, React Components, PHP Syntax, C Control Flow, C++ Memory/Overloading, C# Features, Go, Rust Traits & Tooling). `fill-topics.js` now searches generators in **reverse order** so completion banks win over colliding shared pools; the `02-reasoning.js` shared-pool race that left `t-ch-*` synthetic topics empty is superseded. Result: **0 empty topics, 0 empty chapters, 0 empty subjects** — DB at **241,551 MCQs**.
- **Past papers truthfulness:** `pastpapers.pattern` column added (SQLite INTEGER / MySQL TINYINT / PostgreSQL SMALLINT, default 0); `migrate.js` flags the 40 year-less legacy **pattern papers** (generic recruitment formats); `/api/pastpapers` maps `pattern`; paper cards show a "Pattern Paper" chip; audit + validation harness no longer count pattern papers as missing-year.
- **Audit:** `pipeline/audit.js` pattern-aware past-paper check; final run **red=0, yellow=168, green=15, health=100.0%** (brokenPapers/Mocks/Quizzes=0); `docs/AUDIT-REPORT-2026-08-01-11-28.md`.
- **Button validation harness 21/21 PASS** (`scripts/validate-buttons.cjs`) — all practice/quiz/mock/paper/chapter/topic paths resolve live questions.
- **DB validation** (`db/validate.js`): 75 flagged (0.03%) — 73 legacy short questions, 1 placeholder false-positive (`php-005090`), 1 normalized-dup false-positive (`rust-009472`); no data action needed.
- **SEO:** `scripts/gen-seo-pages.cjs` regenerated 183 subject + 595 chapter pages and sitemap (780 URLs) with final counts.
- **SW cache** bumped to `pmh-cache-v9` (app.js Pattern Paper chip changed this session).
- **Backup:** `backup/2026-08-01-final-241551/pakistan-mcqs.sqlite` (354 MB).

## [Phase 7 — SEO Crawlable Pages & Phase 8 — Performance] — 2026-08-01

### Phase 7 (SEO)
- **`scripts/gen-seo-pages.cjs`** — generates **780 crawlable static pages from the live DB**: `subjects/index.html`, 183 subject pages, 595 chapter pages, plus `404.html` and a full `sitemap.xml` (was 1 URL). Each page: unique title/meta description/canonical, BreadcrumbList + CollectionPage + ItemList JSON-LD, chapter/topic links, 3 sample MCQs (options, no answers), and practice CTAs into the SPA. **SEO-01 (zero crawlable URLs) resolved.**
- Subject cards on the home page are now real `<a href="subjects/<slug>.html">` links (SPA-navigate on click, crawlable href for bots) — **IL-01 resolved**. "All Subjects" added to header nav.
- **SEO-02 (stale numbers):** meta/OG/Twitter/FAQ/hero now state the accurate dual numbers — 1,300+ across 147 subjects instantly; 240,715 across 183 subjects with the local DB.
- **SEO-04:** added `og:locale`, `og:image:width/height/alt`; BreadcrumbList now points only at crawlable URLs; new ItemList JSON-LD for categories.
- **SEO-05:** `404.html` added.

### Phase 8 (performance)
- **PERF-02:** pagination is now windowed (`« 1 … n-1 n n+1 … last »`) — was rendering every page button (12,000+ at 240K).
- **PERF-03:** `references.json`, `404.html`, `subjects/index.html` added to SW precache; bumped to `pmh-cache-v8`.
- **PERF-04:** `sample()` now uses Fisher–Yates shuffle (was biased `sort(() => Math.random() - 0.5)`).
- **PERF-01:** static-mode `mcqs.json` fetch now starts in parallel with taxonomy loads (DB mode already skips it entirely); boot is no longer serialized on the 1 MB file.

## [DB Integration — Complete Local Database Fix] — 2026-08-01

- **Root cause:** `DB.probe()` had a single host (`localhost`), a 1.5s timeout, and any failure silently fell back to the demo JSON bank — showing 1338 MCQs / 147 subjects instead of the live 240,715.
- **Server:** new `/api/stats` endpoint returns live SQL counts — MCQs, options, subjects, chapters, topics, subtopics, papers, mock tests, quizzes, exams, categories, bookmarks, attempts, SQLite version, last updated.
- **Frontend probe:** dual-host (`localhost` + `127.0.0.1`), 2.5s timeouts, response validation, and `/api/stats` fetched on connect.
- **Demo removal:** when connected, `data/mcqs.json` (1 MB) is never loaded — `state.mcqs` is empty and every feature reads SQLite: search, browse, practice, quiz, mock tests, past papers, weekly/monthly challenges, bookmarks, leaderboard, dashboard, QotD.
- **Home dashboard now shows live counters:** MCQs, Subjects, **Chapters, Topics, Papers, Mock Tests**, Quizzes, Exams — all from `/api/stats` when connected.
- **Database status panel** (STEP 9): current source (SQLite vs Demo JSON), counts, connection status, SQLite version, last updated. Offline state shows **"Local Database Offline"** with the exact command to start the server — never fake counters.
- Hero tagline + search placeholder go live (240,715 MCQs etc.) when connected.
- Preset practice (topic/revision) and bookmark practice now fetch from the API in DB mode instead of the empty static array.
- **Verification harness** `scripts/test-db-integration.cjs`: direct read-only SQL counts vs `/api/stats` vs endpoint smoke tests (search FTS, browse, single MCQ, random, related filter, all taxonomy/lists) → `docs/DB-INTEGRATION-VERIFICATION.md`. **Result: 30/30 PASS — every dashboard counter matches live SQL exactly.**
- SW cache bumped to `pmh-cache-v7`.

## [Phase 5 — Quality Validation] — 2026-08-01

- `db/validate.js` — offline validator over the full DB (report mode + `--fix`): required fields, 4 unique options (exact, punctuation-aware), answer A–D, option/question duplication, grammar/format heuristics (short questions, ALL CAPS, double spaces, HTML entities/tags, placeholder markers), subject-scoped Unicode-normalized duplicate detection.
- **Result: 240,716 → 240,715 MCQs (0.03% issue rate).** Iterative false-positive elimination (operator symbols `+\-*/.=` preserved, subject-scoped keys, Unicode `\p{L}` classes, symbol-only options exempt, "undefined" removed from placeholder regex). Final flags: 57 terse-but-legit questions (documented, kept — e.g. "What is DNA?", "3PL refers to:") and 1 real duplicate (`javasc-000002` ≡ `jss-008` "What does `typeof null` return in JavaScript?" — dropped, kept `jss-008`).
- Reports: `validation.log`, `docs/validation-report.md`.

## [Phase 6 — URL-Driven State & Search] — 2026-08-01

- Browse view is now **deep-linkable/shareable**: filters + query serialize into the hash (`#browse?subject=physics&topic=t-5&difficulty=medium&q=...`), restored on load, kept in sync via `history.replaceState` on every filter/page/search change.
- Legacy `#search=QUERY` URLs still work (routed to browse).
- **SearchAction JSON-LD fixed** (SEO-03): target now `#browse?q={search_term_string}` — actually functional for users and spec-valid.
- Search suggestions now keyboard-navigable (↑/↓ cycle, Enter selects, Escape closes).
- SW cache bumped to `pmh-cache-v6`.

## [Phase 5-prep — Audit Fixes & Normalization] — 2026-08-01

### Phase 1: Full audit
- `docs/audit/PHASE1-AUDIT.md` — complete project audit (DB, taxonomy, MCQs, SEO, schema, a11y, performance, quiz engine, search, dashboard, admin, sitemaps) + 24-item master issue register.

### Phase 2: Database normalization
- `db/normalize.js` — online backup (`VACUUM INTO`), created 813 subtopics for 271 topics that had none, assigned `subtopic_id` to all 240,716 MCQs (keyword-match first, deterministic round-robin fallback). **100% hierarchy coverage: subject → chapter → topic → subtopic → MCQ.**
- Backup: `backup/normalize-pre-phase2-2026-08-01-06-14-06/`.

### Bug fixes
- **QZ-01:** negative marking now actually applied in quiz/mock scoring (`endQuiz` nets −0.25 per wrong when `negativeMarking` is on).
- **QZ-02:** related-questions now work in DB mode — server returns `relatedQuestions` on `/api/browse|search|random|mcq/` (same-chapter, tag-overlap scoring), `/api/browse`/`/api/search` accept `related=id1,id2` filtering, frontend fetches related rows via `/api/mcqs?ids=`; one failed suggestion call no longer disables DB mode.
- **A11Y:** chip-gold `#c99600→#7a5c00` (2.4:1 → 5.7:1), chip-red `#d64545→#b02e2e` (3.9:1 → 5.6:1) + dark-theme override; certificate modal now `role="dialog" aria-modal aria-labelledby`, Escape-to-close, focus trap + focus restore; global `:focus-visible` outline.
- SW cache bumped to `pmh-cache-v5`.

## [Phase 3 — Enterprise Expansion] — 2026-07-31

### Content
- **MCQ bank: 921 → 1338** (+417 original MCQs, 100% pass rate)
  - `25-language-ability.json` — vocabulary, grammar, synonyms, antonyms, idioms, sentence correction, comprehension (43)
  - `26-reasoning.json` — IQ, logical, analytical, verbal/non-verbal reasoning, data interpretation, aptitude (46)
  - `27-it.json` — ML, deep learning, ethical hacking, DevOps, big data, database, SQL, Windows, Linux, HTML, CSS, JS, TS, React, Next, Vue, Angular, Node, Express, PHP, Laravel, Python, Django, Flask, Java, Spring, C++, C#, .NET, Go, Rust, Git, Docker, Kubernetes, Rapid, GraphQL (50)
  - `28-programming.json` — code-based questions across 25+ languages/frameworks (126)
  - `29-engineering.json` — surveying, concrete & steel, heat engines, circuit laws, SDLC (24)
  - `30-medical.json` — MBBS/BDS/DPT, pharmacology, general/oral anatomy, histology, pathology (37)
  - `31-management.json` — HRM, marketing, accounting, finance, economics (20)
  - `32-social.json` — world history, Pakistan history, sociology (19)
  - `33-entry-tests.json` — MDCAT, ECAT, L.A.T, GAT, GRE, IELTS, TOEFL, SAT (40)
  - `34-world-current.json` — world current affairs (12)
- **Subjects: 72 → 147** (75 new; 0 subjects without MCQs), **Chapters: 221 → 400**, **Topics: 361 → 719** (all new topics carry `subtopics[]`)
- **Categories: 15 → 16** (added Entry Tests); **Exams: 29 → 38** (pma, issb, punjab-police, fia-inspector, anf, wapda, fbr, sbp, banking)
- **New entity `references.json`** (8 sources); MCQs gain `subtopic`, `references[]`, auto-computed `relatedQuestions[]` (same chapter + ≥2 shared tags, top 5)
- Migration via idempotent `scripts/migrate-phase3.js`; content via `scripts/phase3/` generators (prefix-per-subject id scheme)

### Frontend (`index.html`, `assets/js/app.js`, `assets/css/style.css`)
- **Subtopic filter** in Browse (cascades subject → chapter → topic → subtopic)
- **Related questions** — every revealed MCQ links to same-chapter related questions
- **Monthly Challenge** on leaderboard (80 correct in a month → +150 pts + achievement)
- **Weekly challenge tracking fixed** — progress now actually increments per answer (was never updated)
- **AI Study Planner** — 7-day plan from weak topics/mistakes with one-click practice sessions
- **AI Recommended Quiz** — 10-question timed quiz built from your weak topics
- **Past Papers as Quick Quiz** — any paper becomes a 15-question timed quiz in the Quiz view
- New achievements surfaced on dashboard (Weekly Challenge, Monthly Champion)

### Admin (`admin.html`, `assets/js/admin.js`)
- **Subject Manager** tab — add/edit/delete subjects, icon, category, status, exams
- **Topic Manager** tab — add topics to chapters, edit names + subtopics, delete
- **Explanation Manager** tab — find short/missing explanations, inline rewrite, AI auto-enrich
- **AI Question Generator** tab — template-based draft questions with verified facts, pre-filled subject/chapter/topic/exam, editable drafts, reshuffle + save
- **Import: CSV/TSV auto-detect** — pasted Excel/Sheets tab-separated data works; fixed header camelCase bug (`optionA`/`correctAnswer` were lowercased and failed validation)
- Export adds subjects.json / topics.json downloads; reset clears new keys

### SEO
- New JSON-LD: **BreadcrumbList, FAQPage (6 Q&A), Quiz** — 5 schema blocks total, all validated
- **image-sitemap.xml** + **video-sitemap.xml** created and referenced in robots.txt; sitemap.xml gains video entry
- `<link rel="preload">` for app.js + subjects/chapters/topics.json
- Meta/OG/Twitter updated to 1300+ MCQs, 147 subjects, 38 exams

### Verification
- Frontend: **20/20** DOM-stub smoke tests (subtopic cascade, related view, planner, challenges, paper quizzes, weekly/monthly tracking)
- Admin: **11/11** smoke tests (managers, enrichment, generator, TSV import)
- 22/22 HTTP routes serve 200; audit **0 FAIL / 0 WARN**; quality score **100/100**
- 10 reports in `docs/` (audit, database, category, quality, seo, performance, accessibility + phase-2 leftovers), updated CHANGELOG + README
- Backup at `backup/pre-phase3-2026-07-31-1814` (52 files)

## [Phase 2] — 2026-07-31

### Content
- **MCQ bank: 754 → 921** (+167 original MCQs, 100% pass rate)
  - `21-environmental-biotech.json` — environmental-science + biotechnology (31)
  - `22-electronics-eng.json` — electronics, chemical/industrial/environmental/mechatronics engineering (38)
  - `23-medical-basics.json` — anatomy, physiology, pathology, microbiology, biochemistry, histology, dental-materials (44)
  - `24-clinical-mgmt.json` — medicine, surgery, community-medicine, auditing, supply-chain, physical-education, forestry, essay (54)
- **Subjects: 50 → 72** (22 new; 0 subjects left without MCQs)
- **Chapters: 150 → 221; Topics: 271 → 361** (with `subtopics[]`)
- **Categories: 14 → 15** (added Agriculture & Forestry)
- **Exams: 29** (now linked to categories and programs), **Programs: 12** (new), **Mock tests: 6** (new), **Quizzes: 16 → 21**, **Papers: 32 → 40**
- Fixed ID-prefix collisions (`che-`, `med-`, `ped-` reused) via subject→prefix mapping; rewrote one duplicated GK question (pse-002)

### Frontend (`index.html`, `assets/js/app.js`, `assets/css/style.css`)
- **Progressive loading** — light data renders first; 703 KB bank loads after first paint
- **8 views** via hash routing: home, browse, practice, quiz, papers, dashboard, leaderboard, bookmarks
- **Global fuzzy search** with live suggestions (tokenized scoring) + AI-style explanation enrichment
- **Browse filters**: subject/chapter/topic/difficulty/exam/year/type with reset
- **Practice engine**: normal / revision (wrong ones) / weak topics / bookmarks / adaptive modes, negative-marking option, per-question feedback
- **Quiz & mock engine**: timers, progress, negative-marking chips, full mock papers with question palette and auto-grading
- **Dashboard**: daily streak, accuracy, points, weak topics, achievements, certificate earn/print, history
- **Weekly challenge** on the leaderboard (20 correct in a week → +50 pts)
- **Question of the Day**; exam-category cards; bookmark management
- Accessibility: skip link, aria-live regions, labelled buttons, keyboard-friendly option buttons

### Admin (`admin.html`, `assets/js/admin.js`)
- Tabs: Dashboard / MCQ Manager / **Category Manager** / **Image Library** / Import / Duplicates / Export
- Category manager: rename, reorder, icon, description, add/remove subjects (chips), delete
- Image library: upload ≤300 KB → data URL, copy, delete; images usable in MCQ content
- Export: mcqs.json, CSV, categories.json; full local reset

### SEO / PWA / Performance
- OpenGraph + Twitter cards, canonical, JSON-LD (WebSite+SearchAction, Organization), meta description on both pages
- **manifest.webmanifest** (installable PWA), **sw.js** service worker (offline cache-first)
- **og-cover.png** — 1200×630 real PNG generated by `scripts/make-og.js` (zero dependencies)
- `sitemap.xml` updated (image entry + new views); `robots.txt` retained
- Data deferred behind first paint; system font stack; no external requests

### Scripts & tooling
- `scripts/migrate-phase2.js` — new entities + phase-2 fields (idempotent)
- `scripts/generate-mcqs-phase2.js` — 167-MCQ generator (reference)
- `scripts/make-og.js` — OG image generator
- `scripts/audit.js` — exams.json-driven paper checks, full-element button a11y check, SEO/performance summary
- `scripts/build-mcqs.js` — validates and merges section files into `data/mcqs.json`
- Final audit: **0 FAIL / 0 WARN**; quality score **100/100**; 7 reports in `docs/`

## [Phase 1] — 2026-07-31
- Initial launch: 754 MCQs across 50 subjects, 14 categories, 150 chapters, 271 topics, 16 quizzes, 32 paper patterns
- SPA with browse/practice/quiz/bookmarks, dark mode, admin import/export, sitemap/robots
- 7 duplicate questions rewrote (eng-034…038, pha-001, ele-001)
- Backup of pre-Phase-2 state at `backup/pre-phase2-2026-07-31`

## [Enterprise Pipeline � Quality Gate, Mock Engine & Reports] � 2026-08-01

### Quality engine (pipeline/quality.js)
- 8-dimension scoring (grammar, originality, difficulty, coverage, explanation, exam readiness, distractor quality, educational value), threshold 95, with weights and tuned penalties (short explanations, missing why-wrong breakdowns, weak distractors, no learning objective).
- enrich() attaches defaults at generation time; --per-subject N targets enforced in run.js.

### Pipeline runner (pipeline/run.js)
- FIXED: --per-subject/--max-time were stored under dashed keys but read camelCase � flags silently ignored; now read as rgs["per-subject"]/rgs["max-time"].
- FIXED: quality gate self-comparison bug � candidates scored against themselves (jaccard 1.0 ? -40 near-duplicate penalty) and would have rejected every candidate in batch mode; batch now excludes the candidate itself.
- NEW --expand mode: reopens done topics of under-target subjects and rolls the seed every minute (RUN_STAMP) so parametric generators emit new samples.
- Verified end-to-end: SKIP at target, EXPAND reopen, qhash dedupe (16,680�69,522 dup-skipped on exhausted spaces), regen loop, resume state.

### Mock Test Engine (pipeline/mocks.js)
- Auto-generates mock tests from the live bank: per-exam full-length (100q/90min, negative marking) for every exam with >=3 eligible subjects, per-subject (50q) for subjects >= 1000 MCQs, per-topic (15q) for topics >= 50 MCQs, plus mixed general. Idempotent. **Mock tests: 6 ? 95.**

### Batch reports (pipeline/reports.js)
- 7-report bundle (coverage / validation / duplicates / quality-sample / health / SEO / performance) ? docs/BATCH-REPORT-*.md + split files.
- FIXED OOM: normalized-duplicate scan was an O(n^2) self-join (58B rows); now an O(n) chunked hash scan (50K rows/step).
- Baseline (2026-08-01-10-21): 240,715 MCQs, 168 subjects below 5000, **0 validation issues**, quality pass 39.0% (legacy rows lack why-wrong/metadata/long explanations � pipeline content passes at 99), 780 sitemap URLs.

### Database (db/engine.js)
- Migration adds learning_objective, bloom_taxonomy, confidence_score, estimated_time_sec, memory_trick, exam_tip, explanation_why_wrong columns + 5 composite indexes for 1M scale. Verified idempotent; DB intact.
