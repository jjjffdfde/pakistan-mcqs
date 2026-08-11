# Phase 14 — Knowledge Graph seed report

- Build: `kg-20260805-100821`
- Date: 2026-08-05T05:12:20.469Z
- MCQs in corpus: 872603

## Counts
| Layer | Count |
| --- | --- |
| Knowledge packs | 183 |
| Syllabus units | 882 |
| Concepts | 1744 |
| Micro-concepts | 12406 |
| Learning objectives | 29438 |
| Concept relations | 2275 |
| Exam mappings | 15952 |
| Question blueprints | 1744 |
| Distractor pools | 1744 |
| Distractor items | 33662 |
| Subjects ready | 183 |

## Validation
- Score: **94.9%**
- PASS `kg-schema-tables` — 19 kg_* tables present
- PASS `concept-anchors` — all anchors valid
- FAIL `concept-definition-coverage` — 307/1744 concepts have a mined definition
- PASS `micro-concept-coverage` — 1744/1744 concepts have micro-concepts
- FAIL `lo-coverage` — 8125/12406 micro-concepts have learning objectives
- PASS `packs-complete` — 183/183 packs have authored overviews
- PASS `references-valid` — all references valid
- PASS `blueprint-coverage` — 1744/1744 concepts have a blueprint
- PASS `exam-map-integrity` — exam mappings intact
- PASS `prerequisite-acyclic` — prerequisites acyclic
- PASS `unique-slugs` — slugs unique
- PASS `stats-complete` — 1744/1744 concepts have statistics
- PASS `subject-coverage` — 243/243 active subjects mined
- PASS `history-trail` — 243 history rows
