# PHASE 35 DRY RUN REPORT

Generated: 2026-08-11T12:55:18.648Z | Mode: DRY RUN (no deletions performed)

## 1. Inventory Summary

| Metric | Value |
|---|---|
| Total files (on disk, excluding .git + node_modules) | 2549 |
| Total size on disk | 2991.0 MiB (2.92 GiB) |
| Git-tracked files | 1895 |
| Git-tracked size | 67.0 MiB |
| Database SHA256 (baseline) | `3DF39D335F5F931125168CA26877595B620BD1C9F75701B20AC19A9DFFAFA34E` |

## 2. Classification (Phase 35 A-O)

| Class | Meaning | Files | Size (MiB) |
|---|---|---:|---:|
| A | REQUIRED_PRODUCTION | 1149 | 6.5 |
| B | REQUIRED_RUNTIME | 27 | 0.4 |
| C | REQUIRED_BUILD | 106 | 1.2 |
| D | REQUIRED_CONFIGURATION | 10 | 0.0 |
| E | REQUIRED_DOCUMENTATION | 134 | 11.7 |
| F | REQUIRED_DATA | 845 | 2922.9 |
| N | ARCHIVE | 278 | 48.4 |

## 3. Deletion Candidates

**Deletable candidates (H/I/J/K/L with evidence): 0** (0.0 MiB)

- UNUSED_CONFIRMED (H): 0
- TEMPORARY (I): 0
- SCRATCH (J): 0
- GENERATED_ARTIFACT (L): 0
- DUPLICATE groups (K): 318
- UNKNOWN (O): 0

Conclusion: **the tree is already clean - no evidence-based deletion candidates exist.** Every file is either required production/runtime/build/config/doc/data, a documented backup/archive, or the Phase 23 release mirror (by design).

### Duplicate groups detail

Total identical-content groups where at least one member has zero code references: **318**.
- **309 groups are the documented Phase 23 release mirror** (database/data ↔ database/releases/source-v2) - by design, both local-only and gitignored. No action.
- Remaining: **9** groups (all reference-free copies of gitignored payload files). No action.

## 4. Function Safety

- **Broken internal links: 0** (0 = none)
- **Dead buttons/controls: 0** (0 = all buttons have handlers - inline, external-script, data-tab or container delegation)
- **API endpoint validation: 46 frontend call sites**
  - DYNAMIC_BASE: 3
  - WORKING: 38
  - WORKING_TEST_HARNESS: 4
  - TEST_HARNESS_ONLY: 1

## 5. GitHub Audit

| Check | Result |
|---|---|
| Files tracked | 1895 (67.0 MiB) |
| Files > 25 MiB | 14 (tracked: 1) |
| Files > 50 MiB | 11 (tracked: 0) |
| Files > 100 MiB (GitHub hard limit) | 1 (tracked: 0) |
| .env files (real, not .example) | 0 |
| node_modules files | 0 |
| Secret hits | 0 |

Tracked files above 25 MiB (fine for git CLI; exceed GitHub browser-upload 25 MiB):

- docs/archive/phase17_search_index.json (31.4 MiB)

## 6. Database Integrity

- Path: `db/pakistan-mcqs.sqlite` (2104.7 bytes)
- SHA256 before: `3DF39D335F5F931125168CA26877595B620BD1C9F75701B20AC19A9DFFAFA34E`
- SHA256 after: pending (no changes performed in dry run)
- Modification performed: NONE (database is read-only by policy)

## 7. Largest Files (top 10)

| Path | Size (MiB) | Tracked | Class |
|---|---|---:|---|
| db/pakistan-mcqs.sqlite | 2104.7 | false | F |
| database/data/other/mcqs_fts_data-part03.ndjson.gz | 60.5 | false | F |
| database/releases/source-v2/data/other/mcqs_fts_data-part03.ndjson.gz | 60.5 | false | F |
| database/data/other/mcqs_fts_data-part02.ndjson.gz | 60.4 | false | F |
| database/releases/source-v2/data/other/mcqs_fts_data-part02.ndjson.gz | 60.4 | false | F |
| database/data/other/mcqs_fts_data-part04.ndjson.gz | 58.6 | false | F |
| database/releases/source-v2/data/other/mcqs_fts_data-part04.ndjson.gz | 58.6 | false | F |
| database/data/other/mcqs_fts_data-part01.ndjson.gz | 57.9 | false | F |
| database/releases/source-v2/data/other/mcqs_fts_data-part01.ndjson.gz | 57.9 | false | F |
| database/data/other/mcqs_fts_data-part05.ndjson.gz | 52.6 | false | F |

## 8. Verdict (DRY RUN)

Status: **READY_FOR_GITHUB**

No deletions proposed. Next steps: run regression tests, verify build, re-verify DB SHA256, then finalize.
