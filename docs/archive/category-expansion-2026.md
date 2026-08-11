# Category Expansion Report 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4*

## 1. Summary

Phase 4 grew the taxonomy from **16 categories / 147 subjects** to **17
categories / 183 subjects**, and — critically — gave **every subject** a
working MCQ bank in the database (183/183 have ≥ 1 MCQ).

## 2. Category board (DB live counts, 2026-08-01)

| Category | Subjects | MCQs | Growth driver |
|---|---|---|---|
| Mathematics & Reasoning | 9 | 132,773 | parametric enumeration (01-math, 02-reasoning) |
| Computer & IT | 49 | 56,752 | 03-programming parametrics + 04-computer facts |
| Social Sciences | 9 | 42,650 | 01-math stats suite + 15-exam-awareness |
| Everyday & Basic Sciences | 8 | 6,474 | 05-science parametrics + facts |
| Medical & Health | 23 | 383 | 09-medical facts |
| English & Urdu | 11 | 363 | 13-english + 16-urdu (new) |
| General Knowledge | 3 | 320 | facts |
| Engineering | 9 | 208 | 10-engineering facts |
| Management Sciences | 8 | 162 | 11-mgmt facts |
| Exam Preparation | 36 | 144 | 15-exam-awareness (new) |
| Islamic Studies | 1 | 96 | facts |
| Entry Tests | 8 | 92 | 14-entry-tests (new) |
| Pakistan Studies | 1 | 83 | facts |
| Current Affairs | 2 | 71 | facts |
| Education & Psychology | 3 | 68 | facts |
| Law & Judiciary | 2 | 60 | facts |
| Agriculture & Forestry | 1 | 17 | facts |

**Totals: 17 categories · 183 subjects · 240,716 MCQs.**

## 3. What was added in Phase 4

### 3.1 New generator files
- **14-entry-tests.js** — mdcat, ecat, lat, gat, gre, ielts, toefl, sat
  (pattern-aware entry-test content, tag sets per exam pattern).
- **15-exam-awareness.js** — 33 exam-pattern subjects under the new
  `exam-preparation` category (ppsc, fpsc, nts, ots, cts, pts, spsc, kppsc,
  ajkpsc, bpsc, css-exam, pms, ib, mod, nab, fia, fia-inspector, asf, army,
  navy, paf, police, punjab-police, motorway-police, railway, wapda, fbr,
  sbp, banking, educators, lecturer, issb, pma, election-officer, anf,
  nadra).
- **16-urdu.js** — Urdu Grammar (20 facts) + Urdu Literature (30 facts);
  first Unicode-native content in the bank.
- **17-essay-nextjs.js** — essay (structure/types) + next-js (routing/
  rendering) closing the last uncovered subjects.

### 3.2 Naming fix
- The exam-prep subject `css` was renamed **`css-exam`** ("CSS Exam (Central
  Superior Services)") because `css` collided with the web-CSS subject under
  Computer & IT. Both coexist; verification confirmed the exam subject is in
  `exam-preparation` and web CSS keeps its MCQs.

### 3.3 Parametric scale-up
- 01-math: deterministic enumeration across 22 topics (~179,600 capacity).
- 02-reasoning: 8 topics (~11,700). 03-programming: operator/loop templates
  (~45,100). 05-science: motion/force + electricity/waves (~6,100).

## 4. Coverage verification

| Check | Result |
|---|---|
| Subjects with 0 MCQs (DB) | **0** — all 183 subjects have MCQs |
| Categories with subjects | 17/17 |
| Uncovered-subject warnings in pipeline STEP 1 | 0 (was 2 pre-Phase-4: essay, next-js) |
| Static bank intact | 1338 curated MCQs untouched |

## 5. Intentional imbalance note

MCQ volume is deliberately concentrated in Mathematics (132K), Computer & IT
(56K) and Social Sciences (42K) because those templates are enumerable at
scale. Fact-driven subjects (law, agriculture, current affairs) stay lean by
design — quality over quantity — and the site surfaces them through the same
browse/practice flows. Future runs can rebalance with
`--subjects law,agriculture,...`.
