# PHASE 23 — ENTERPRISE DATABASE SOURCE REPOSITORY & STORAGE OPTIMIZATION PLATFORM

## Execution Report

**Date:** 2026-08-06
**Target:** `db/pakistan-mcqs.sqlite` (2.06 GB, SQLite 3.51.2, Node v25.6.1)
**Result:** `database/` source repository — complete, verified, rebuildable, 100% reproducible.

---

## 1. Mission Summary

Convert the production SQLite database into a modular, compressed, version-controlled
source repository under `database/`, with the SQLite database remaining the only
production database and the repository being fully rebuildable and reproducible.

**Rules honored:** No AI, no APIs, no internet, no scraping. Database untouched
(read-only; zero schema/ID/data changes). Streaming only — peak RSS 226 MB
(full export) / 54 MB (resume runs), well under the 512 MB ceiling.

---

## 2. Repository Layout

```
database/
├── .gitignore            Git exclusions (checkpoints, rebuilt DBs, snapshots/releases)
├── .gitattributes        Git LFS for *.gz/*.ndjson/*.sqlite
├── schema/
│   ├── tables.sql        All 59 CREATE TABLE + CREATE VIRTUAL TABLE statements
│   ├── indexes.sql       64 CREATE INDEX statements
│   ├── triggers.sql      0 triggers
│   └── views.sql         0 views
├── data/                 310 .ndjson.gz files (one per table; MCQs + FTS split into parts)
├── manifests/
│   ├── manifest.json     Export metadata
│   ├── row_counts.json   Per-table row counts (63 tables, 6,629,995 rows)
│   ├── files.json        310 file entries with row/size/checksum
│   ├── checksums.json    669 SHA-256 checksums
│   ├── repo.sha256       Text checksum list
│   └── .export-checkpoint.json  Resume state (gitignored)
├── snapshots/            v1 (manifests snapshots)  [regenerable, gitignored]
├── releases/             source-v1 (hard-linked release package) [regenerable, gitignored]
├── reports/              10 JSON reports (also mirrored to docs/phase23_*.json)
└── scripts/              12 tools (see §8)
```

---

## 3. Data Exported

| Metric | Value |
|---|---|
| Tables exported | 63 (incl. 5 FTS5 shadow tables) |
| Total rows | 6,629,995 |
| MCQs | 872,621 (split by subject_id into 243 subjects + unassigned) |
| Options | 3,490,484 |
| mcq_concepts | 330,228 |
| kg_learning_objectives | 71,501 |
| kg_distractor_items | 33,662 |
| Data files | 310 `.ndjson.gz` |
| Schema statements | 59 tables + 64 indexes (FTS virtual table included) |

## 4. Storage Optimization

| Metric | Value |
|---|---|
| Original SQLite | 2,205,887,936 B (2.06 GB) |
| Uncompressed NDJSON total | 2,997,232,025 B (2.79 GB) |
| Compressed repo (`data/` + schema + manifests) | 426,173,668 B (406 MB) |
| Compression ratio (gz vs plain NDJSON) | 0.1422 (7.0x) |
| Repo vs original DB ratio | 0.1931 (5.2x smaller) |
| Space saved vs plain NDJSON | 2,571,058,357 B (2.39 GB) |

### GitHub limits compliance
- **>100 MB hard limit:** 0 files (FTS `mcqs_fts_data` 307 MB file auto-split into
  `-part01..05` of 52.6–60.5 MB each)
- **>50 MB warning:** 5 files (all `mcqs_fts_data-part*`) → covered by
  `.gitattributes` Git LFS tracking
- **LFS candidates (>10 MB):** 7 files

## 5. Reproducibility (Build → Validate → Diff)

Pipeline proved the repo can rebuild an identical database:

1. `build-db.js` rebuilt `db/pakistan-mcqs.rebuilt.sqlite` from repo only
   (schema SQL + streamed NDJSON.gz import, batched transactions, FTS rebuild,
   VACUUM + ANALYZE). 4,847,339 data rows imported in 71.6 min, integrity ok.
2. `validate-db.js` (original vs rebuilt, streamed SHA-256 per table,
   PK-ordered): **12/12 PASSED** — 0 missing, 0 extra, 0 modified rows.
3. `diff-db.js` (per-table streamed hash diff): **58/58 tables identical**,
   0 missing / 0 extra / 0 modified.
4. `verify-db.js` (original vs repo): **10/10 PASSED** —
   integrity_check ok, foreign_key_check 0 violations, FTS5 integrity-check ok,
   schema tables/indexes/views/triggers match, 62/62 row counts match,
   checksums 307/307 verified.

> FTS5 shadow tables (`mcqs_fts*`) are excluded from byte-comparison by design:
> they cannot be INSERTed into; the index is rebuilt from the `mcqs` content
> table (`content='mcqs'`, external content FTS5) and verified via FTS5
> `integrity-check`, which PASSED on the rebuilt database.

## 6. Performance

| Phase | Time | Peak RSS |
|---|---|---|
| Full export (63 tables, 6.63M rows, gz level 6) | 3.6 min | 226 MB |
| Rebuild (schema + import + FTS + VACUUM) | 71.6 min | — |
| Decompress all 310 files | 32 s | — |
| Compress all 310 files | 2.4 min | — |
| Resume export (checkpoint) | seconds | 52 MB |

## 7. Integrity & Verification Tooling

- SHA-256 checksums for every repo file + the SQLite DB (669 entries),
  regenerable via `checksum-db.js` and verifiable via `--verify`.
- Checkpoint/resume: `.export-checkpoint.json` allows interruption-safe exports;
  `--incremental` re-exports only changed tables.
- Snapshot (`snapshots/v1`) + release (`releases/source-v1`) packages.

## 8. Scripts (database/scripts/)

| Script | Purpose |
|---|---|
| `export-db.js` | Full/`--incremental` export, size-based part splitting, manifests, `--snapshot`/`--release` |
| `build-db.js` | Rebuild SQLite from repo (resume, batched, FTS rebuild) |
| `import-db.js` | Wrapper for build-db into a target path |
| `verify-db.js` | Verify DB against repo (schema, counts, checksums, integrity) |
| `validate-db.js` | Original vs rebuilt full comparison |
| `diff-db.js` | Per-table streamed hash diff between two DBs |
| `checksum-db.js` | Generate/verify SHA-256 checksums |
| `compress-db.js` / `decompress-db.js` | Repo gz ↔ plain NDJSON conversion |
| `incremental-export.js` | Plan incremental export (changed tables) |
| `storage-report.js` | Storage analytics, GitHub limits, LFS candidates |
| `lib/db-repo.js` | Shared streaming helpers |

## 9. Known Notes

- Compression is gzip level 6 (lossless); zstd binary was unavailable on the
  host, recorded in the manifest (`compression_type`).
- The plain `.ndjson` intermediates are deleted after gzip; the `.gz` files are
  the source of truth (ratio measured against recorded uncompressed bytes).
- FTS shadow-table data is exported for completeness but is not used in rebuilds.
- `snapshots/`, `releases/`, checkpoints and rebuilt DBs are gitignored
  (regenerable artifacts).

## 10. Reports (docs/phase23_*.json)

`phase23_build`, `phase23_checksums`, `phase23_compress`, `phase23_decompress`,
`phase23_diff`, `phase23_export`, `phase23_files`, `phase23_incremental`,
`phase23_manifest`, `phase23_row_counts`, `phase23_storage`, `phase23_validate`,
`phase23_verify` — plus copies in `database/reports/`.

## 11. Conclusion

The platform is **COMPLETE**: 63 tables / 6.63M rows exported to a 406 MB
compressed, Git-ready source repository; rebuilt database byte-identical on all
58 comparable tables; 10/10 verify, 12/12 validate, 0 diffs; all checksums pass;
no file exceeds GitHub's 100 MB limit; storage reduced 5.2x vs the original DB.
