# Category Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3 (Enterprise Expansion)*

## The 16 categories

| # | Category | Subjects | MCQs (approx) |
|---|---|---|---|
| 1 | General Knowledge | 3 | ~95 |
| 2 | Current Affairs | 2 | ~35 |
| 3 | Pakistan Studies | 1 | ~50 |
| 4 | Islamic Studies | 1 | ~45 |
| 5 | English & Urdu | 11 | ~210 |
| 6 | Everyday & Basic Sciences | 8 | ~185 |
| 7 | Computer & IT | 26 | ~265 |
| 8 | Education & Psychology | 3 | ~50 |
| 9 | Social Sciences | 11 | ~115 |
| 10 | Management Sciences | 10 | ~90 |
| 11 | Law & Judiciary | 2 | ~25 |
| 12 | Medical & Health | 24 | ~150 |
| 13 | Engineering | 12 | ~130 |
| 14 | Mathematics & Reasoning | 9 | ~110 |
| 15 | Agriculture & Forestry | 1 | ~15 |
| 16 | Entry Tests | 12 | ~60 |

*(MCQ counts approximate; exact per-subject counts live in `data/mcqs.json`.)*

## Subject distribution

- 147 subjects across 16 categories; every category has ≥1 subject with MCQs (0 empty categories, audited).
- Exam-category cards on the home page group the 38 exams by category, so users reach "PPSC", "NTS", "PMA", "MDCAT", etc. through their field.

## Phase 3 changes

- Categories 15 → **16**: added **Entry Tests** (gat, gre, ielts, toefl, sat, lat, mdx, ect, iq, logical-reasoning, analytical-reasoning, aptitude-tests, verbal/non-verbal reasoning, comprehension, vocabulary…).
- **English & Urdu** grew 4 → **11** (vocabulary, grammar, synonyms, antonyms, idioms, sentence-correction, comprehension, essay…).
- **Computer & IT** grew 10 → **26** (machine-learning, deep-learning, ethical-hacking, devops, big-data, database, sql, windows, linux, html, css, javascript, typescript, react, next, vue, angular, node, express, php, laravel, python, django, flask, java, spring, cpp, csharp, dotnet, golang, rust, git, docker, kubernetes, rapid, graphql…).
- **Mathematics & Reasoning** grew 2 → **9** (IQ & aptitude, logical, analytical, verbal, non-verbal reasoning, data interpretation…).
- **Medical & Health** grew 15 → **24** (mbbs, bds, dpt, pharmacology, general anatomy, oral anatomy/histology/pathology…).
- **Management Sciences** grew 6 → **10** (hrm, marketing…).
- **Engineering** grew 8 → **12** (computer-engineering…).
- **Social Sciences** grew 7 → **11** (world-history, pakistan-history…).

## Admin support

- `admin.html` → **Category Manager** tab: edit name/icon/description/order, add or remove subjects via chips, save or delete a category.
- **New in Phase 3:** **Subject Manager** tab (edit name/icon/category/order/status/exams, add/delete subjects) and **Topic Manager** tab (add topics to a chapter, edit name + subtopics, delete). All persist locally (`pmh_admin_subjects`, `pmh_admin_topics`) and export via **Export → subjects.json / topics.json**.

## Observations

- Balance improved: the largest category (Computer & IT, 26) now has deep, structured topic coverage; Entry Tests spans the whole GAT/GRE/SAT family.
- Every exam links to ≥1 category via `exams.json`; the home exam grid renders category cards dynamically — adding a category is UI-neutral.

## Verdict

Category taxonomy is complete, balanced for navigation, fully editable from the admin panel, and every one of the 16 categories has live content.
