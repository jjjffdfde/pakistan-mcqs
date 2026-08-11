# Phase 1 — Complete Project Audit Report

Project: Pakistan MCQs Hub (E:\pAK MCQS) · Date: 2026-08-01 · Auditor: automated deep audit

---

## 1. Database

**Tables & row counts (SQLite, WAL):**

| Table | Rows | Notes |
|---|---|---|
| subjects | 183 | |
| chapters | 595 | 7 have 0 MCQs |
| topics | 1054 | 93 have 0 MCQs |
| subtopics | 1991 | **0 MCQs linked (all 240,716 MCQs have `subtopic_id = NULL`)** |
| categories | 17 | |
| mcqs | 240,716 | FTS mirror `mcqs_fts` 240,716 |
| options | 962,864 | exactly 4 per MCQ, 0 orphans |
| quizzes | 21 | mocktests 6 · pastpapers 40 · references_tbl 66 |
| bookmarks | 0 | history 4 · leaderboard 1 · analytics 0 · pipeline_state 3 |

**Schema:** `mcqs` (id, question, correct_answer, difficulty, subject_id, chapter_id, topic_id, subtopic_id, exam_ids, year, tags, references_json, explanation, source, status, qhash, created_at, updated_at); `options` (id, mcq_id, label, text). 11 secondary indexes present (subject/chapter/topic/diff/year/mcq).

**Integrity:** 0 orphan MCQs (subject/chapter/topic), 0 NULL subject/chapter/topic, 0 duplicate qhash, 0 MCQs missing options, 0 options without MCQ, 0 missing explanations, 0 missing difficulty. All rows `status='active'`.

**Quality skew:**
- Difficulty: **easy 800 (0.3%), medium 239,860 (99.6%), hard 56 (0.02%)** — effectively single-difficulty corpus.
- Source: 239,378 generated + 1,338 existing.
- Explanation avg length: 66 chars (short).
- Subtopic hierarchy level completely unused.

**Issues:**
- DB-01 (High) — Subtopic level dead: 1991 subtopics exist, zero MCQs reference them.
- DB-02 (Med) — Difficulty distribution unusable for adaptive/weak-topic logic.
- DB-03 (Med) — `bookmarks`/`analytics` empty; `history`/`leaderboard` trivially small (device_id hardcoded `"default"`).

## 2. Subjects

183 subjects. Extreme imbalance:

| Tier | Subjects | MCQs |
|---|---|---|
| Major | mathematics 115,323 · statistics 42,458 | ~158K |
| Mid | rust 9,461 · go 7,991 · csharp 6,676 · physics 6,210 · cpp 5,973 · c 5,418 · analytical-reasoning 5,529 · data-interpretation 5,327 · iq 5,246 · python 5,107 · java 5,094 · javascript 5,094 · php 5,082 | ~77K |
| Small | aptitude-tests 427 · verbal-reasoning 325 · … dozens of subjects 10–100 | ~4K |
| Placeholder | **42 exam-pattern subjects at exactly 4 MCQs each** (ppsc, fpsc, nts, css-exam, pms, kppsc, spsc, bpsc, ajkpsc, ots, cts, pts, mdcat, ecat, lat, gat, gre, ielts, toefl, sat, pma, issb, army, navy, paf, police, punjab-police, motorway-police, fia, asf, anf, ib, mod, nab, wapda, fbr, sbp, banking, educators, lecturer, election-officer, nadra, railway) | 168 |

**Missing entirely (0 MCQs):** current-affairs content minimal (49), no: AI (24), ML (22), Cyber Security (23), Cloud (18), Networking (28) — all far below targets; no Law depth (31), no Medical depth (MBBS 15, MDCAT 14), no Commerce depth, no Forestry (17), no Agriculture (22), no Education (17), no Psychology (20).

**Issues:** SUB-01 (High) — 42 exam subjects are 4-MCQ placeholders. SUB-02 (High) — 163/183 subjects below 100 MCQs. SUB-03 (Med) — subject names/ids mismatch display names in several cases (e.g. `history` label "World History" duplicates `world-history`).

## 3. Chapters & Topics

- 595 chapters (7 empty), 1054 topics (93 empty), 1991 subtopics (all empty of MCQs).
- Chapter distribution mirrors subject imbalance (math chapters huge, most subjects 1–5 chapters).
- Topics per chapter often flat (no meaningful hierarchy); subtopics table appears auto-generated from topic names.

**Issues:** CH-01 (Med) — 7 empty chapters, 93 empty topics to fill or prune. CH-02 (Med) — syllabus-driven chapters missing for most small subjects.

## 4. MCQs

- 240,716 total. Per-MCQ: 4 options ✅, explanation ✅, difficulty ✅, tags/exam_ids present, references_json present.
- Duplicate check by qhash: **0 duplicates** (fuzzy/abbreviated dupes not checked — e.g. same question reworded).
- Quality skew: 99.6% "medium"; avg explanation 66 chars; `source='generated'` for 99.4% (template-generated, requires sampling for quality).
- Static frontend bank (`data/mcqs.json`) holds only **1,338** MCQs — 239K live in SQLite via local API.

**Issues:** MCQ-01 (Med) — reworded-duplicate detection absent (qhash covers exact only). MCQ-02 (Med) — explanation quality/thoroughness. MCQ-03 (Low) — `year` largely NULL for generated rows.

## 5. SEO

- Title/description/robots/canonical/OG/Twitter present and well-formed (index.html:6–22).
- **Number inflation:** meta/OG/FAQ claim "183 subjects, 595 chapters, 1054 topics" (index.html:16,21,79) — actual static data: 147 subjects / 400 chapters / 719 topics (DB: 183/595/1054). Trust risk.
- **SearchAction JSON-LD is dead**: target `#search=QUERY` (index.html:33) — fragment, not `?q=`; no `search` view exists in app.js.
- BreadcrumbList points at hash URLs (index.html:49–60) — no crawl value.
- Missing: ItemList/CollectionPage for subjects, LearningResource, Geo/areaServed, og:image dims/alt, og:locale, twitter handles, GSC/Bing verification, 404.html.
- Organization `sameAs: []` empty.

**Issues:** SEO-01 (High) — zero crawlable content pages. SEO-02 (High) — stale numbers. SEO-03 (Med) — dead SearchAction. SEO-04 (Med) — missing schema types. SEO-05 (Low) — no 404.html.

## 6. Internal Links

- **No crawlable internal links.** SPA hash routes only (`#home,#browse,#practice,#quiz,#papers,#dashboard,#leaderboard,#bookmarks`); subject/exam cards are `<button>`s, not `<a>`s (app.js:425–450). No per-subject/chapter/topic/MCQ URLs. Deep-linking impossible.

**Issues:** IL-01 (High) — need URL-driven routing (`?subject=&chapter=&topic=` or `#/subject/…`) + real links.

## 7. Schema / Structured Data

Present: WebSite+SearchAction, Organization, BreadcrumbList, FAQPage (6 Qs), custom Quiz. Broken/weak: SearchAction (dead), Breadcrumb (hashes), sameAs empty, no LearningResource/ItemList/Geo, no Question-level data.

**Issues:** see SEO-03/04.

## 8. Accessibility

- ✅ lang, skip-link, form labels, aria-label on search, aria-live regions.
- ❌ No focus-visible styling beyond skip-link; no focus trap/Escape/aria-modal/aria-labelledby on cert modal (index.html:446, app.js:1526); suggestion dropdown not keyboard-navigable (no role=option/aria-activedescendant); focus not moved on view change; `prompt()` used (app.js:1367) — poor SR UX.
- **Contrast failures:** `.chip-red` #d64545 on #fdecec ≈ 3.9:1 (AA fail); `.chip-gold` #c99600 on #fdf3d0 ≈ 2.4:1 (fail). `--muted` 5.4:1 pass but used tiny.
- 8 `<h1>`s in DOM (hidden views).

**Issues:** A11Y-01 (Med) chips contrast. A11Y-02 (Med) modal a11y. A11Y-03 (Low) focus management, search dropdown keyboard, h1 ×8.

## 9. Performance

- ~16 requests / ~1.35 MB JSON at boot; `data/mcqs.json` (1.06 MB) fetched eagerly (app.js:128); fetch uses `cache: no-store`.
- Split per-subject files exist (`data/mcqs/*.json`, 21–77 KB each) but **never used** — ready-made lazy loading unused.
- Browse paginated (PAGE_SIZE 20) but page-button loop pathological at 240K (app.js:641–647).
- SW precache 1.35 MB; `references.json` missing from DATA list; all-or-nothing `c.addAll`; cache-first staleness risk (bumped v4 today).
- No minification/build; `data/export/` contains up to 173 MB aggregates (repo bloat; not served).
- Shuffle is `sort(() => Math.random()-.5)` (biased) not Fisher–Yates (app.js:24).

**Issues:** PERF-01 (High) — lazy-load split files. PERF-02 (Med) — pagination for large banks. PERF-03 (Med) — SW cache strategy/versioning. PERF-04 (Low) — shuffle, no-store, repo bloat.

## 10. Quiz Engine

- Rich: practice (5 modes), timed quizzes, mocks, past papers, daily quiz/QOTD, weak-topic practice, retry, certificates ≥80%, negative-marking chip.
- **BUG (High): mock/past-paper negative marking advertised but never applied** — `endQuiz` score = `correct/list.length` (app.js:953); `q.negative` unused.
- Scoring inconsistency: quiz denominator = list.length; practice = answered (app.js:953 vs 795).
- DB-mode gaps: related-question nav broken (app.js:626), `relatedQuestions: []` hardcoded (app.js:92), one failed suggestion call disables DB for session (app.js:1569).
- Quiz auto-advance 1.4 s too fast for reading explanations (app.js:940–943).

**Issues:** QZ-01 (High) negative marking. QZ-02 (Med) DB-mode related/nav. QZ-03 (Low) scoring consistency, pacing.

## 11. Search

- Instant search w/ 180 ms debounce, fuzzy scoring, 6-hit suggestions (app.js:1537–1590).
- 8 filter axes; DB mode loses year filter + subtopics (app.js:552,568).
- Query not in URL → not shareable; SearchAction dead.

**Issues:** see IL-01, SEO-03, QZ-02.

## 12. User Dashboard

- Streak, accuracy, answered, points, achievements (11), certificates, history (15), weak topics, AI study planner. All localStorage; sync is fire-and-forget with hardcoded device `"default"` — **no user accounts, no cross-device progress, dashboard shows local-only even in DB mode**.
- Missing: per-subject/topic charts, coverage tracker, goals, progress export.

**Issues:** DASH-01 (Med) — no real user identity/sync. DASH-02 (Low) — visualization coverage.

## 13. Admin Panel

- Tabs: Dashboard, MCQ/Category/Subject/Topic Manager, Explanations, AI Generator, Image Library, Import (CSV/TSV/JSON), Duplicates, Export.
- **No auth** (public site footer link; only robots-excluded). Edits persist to localStorage only — **no server persistence, no backup/restore UI, no analytics, no Excel/SQLite import, no sitemap/SEO generator in UI**.
- CLI tools exist: `scripts/build-mcqs.js`, `db/backup.js`, `db/restore.js`, `db/import-json.js`, `db/export-json.js`, `db/migrate.js`, root `check_ids.js`, `check_admin_ids.js`.

**Issues:** ADM-01 (High) — unauthenticated admin + localStorage-only edits. ADM-02 (Med) — backup/restore not in UI; no Excel/SQLite import; no analytics. ADM-03 (Low) — validation only in CLI.

## 14. Sitemap / robots / Video / Image Sitemaps

- `sitemap.xml`: 7 URLs — all root/hash → **effectively 1 crawlable URL**; no subject/chapter/topic/MCQ URLs; single lastmod.
- `robots.txt`: valid (Allow /, Disallow /admin.html, 3 sitemap refs) ✅.
- `image-sitemap.xml`: 1 image (og-cover.png exists, 1200×630) — valid.
- `video-sitemap.xml`: **INVALID** — `content_loc` is the homepage HTML, no video file exists anywhere.

**Issues:** SM-01 (High) — sitemap = 1 URL. SM-02 (Med) — video sitemap invalid (remove or add real videos). SM-03 (Low) — single lastmod, no 404.html.

## 15. Content Gaps vs Mission Targets

| Requirement | Current | Gap |
|---|---|---|
| Major subjects 20–50K | only math/stats (2) | physics 6K, chemistry 42, biology 45, english 62, islamic-studies 96, pakistan-affairs 83, current-affairs 49, general-knowledge 68, urdu 65 — all far below |
| Medium 10–20K | 0 | — |
| Small 5–10K | 13 subjects (mostly programming) | 160+ subjects below |
| 42 exam subjects | 4 MCQs each | placeholder |
| Newer tech (AI/ML/Cloud/Security/Networking) | 18–28 each | minimal |
| CSS/PMS/PPSC/FPSC etc. | 4 each | placeholder |

---

## Resolution Status (updated 2026-08-01)

| ID | Severity | Status |
|---|---|---|
| QZ-01 | High | ✅ Fixed — negative marking applied in `endQuiz` |
| QZ-02 | High | ✅ Fixed — `relatedQuestions` served by API; `related=` filter; suggestion failure no longer kills DB mode |
| A11Y-01 | Med | ✅ Fixed — chip-gold 5.7:1, chip-red 5.6:1 (+dark override) |
| A11Y-02 | Med | ✅ Fixed — dialog role, aria-modal, Escape, focus trap/restore, `:focus-visible` |
| DB-01 | High | ✅ Fixed — `db/normalize.js` assigned subtopics to all 240,716 MCQs; 813 subtopics created; backup `normalize-pre-phase2-2026-08-01-06-14-06` |
| CH-01 | Med | 📌 Documented — 7 empty chapters / 93 empty topics listed for Phase 3 content |

---

## Master Issue Register (severity-ordered)

| ID | Severity | Issue |
|---|---|---|
| QZ-01 | High | Mock/paper negative marking advertised, never applied |
| IL-01 | High | No crawlable URLs / internal links; SPA hash-only |
| SEO-01 | High | Sitemap = 1 effective URL; zero content pages indexed |
| SUB-01 | High | 42 exam subjects are 4-MCQ placeholders |
| SUB-02 | High | 163/183 subjects <100 MCQs |
| DB-01 | High | Subtopic level completely unused (NULL on 100% MCQs) |
| PERF-01 | High | 1 MB mcqs.json eager load; split files unused |
| ADM-01 | High | Unauthenticated admin; localStorage-only edits |
| SEO-02 | Med | Stale/mismatched numbers in meta, OG, FAQ |
| SEO-03 | Med | Dead SearchAction schema |
| DB-02 | Med | Difficulty skew 99.6% "medium" |
| A11Y-01 | Med | chip-red 3.9:1, chip-gold 2.4:1 contrast failures |
| A11Y-02 | Med | Modal a11y (no trap/Escape/aria-modal) |
| QZ-02 | Med | DB-mode related-question nav broken; session-kill on one failed call |
| PERF-02 | Med | Pagination button loop at 240K |
| PERF-03 | Med | SW cache-first staleness; references.json missing |
| SM-02 | Med | Invalid video sitemap (no video exists) |
| CH-01 | Med | 7 empty chapters, 93 empty topics |
| MCQ-01 | Med | Only exact qhash dedupe |
| DASH-01 | Med | No user identity/account; all devices share "default" |
| ADM-02 | Med | Backup/restore/analytics/Excel/SQLite import not in UI |
| DB-03 | Med | analytics table empty; bookmarks empty |
| SE-* | Low | Various low-severity: h1 ×8, shuffle bias, pacing, no 404.html, og dims, manifest icons, etc. |
