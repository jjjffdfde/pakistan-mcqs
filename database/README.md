# database/ — Pakistan MCQs Source Repository

Version-controlled, compressed source repository for the production SQLite
database (`../db/pakistan-mcqs.sqlite`). Fully rebuildable and reproducible.

## Layout

- `schema/` — DDL (tables, indexes, views, triggers) as SQL files
- `data/` — one `.ndjson.gz` per table, streamed line-per-row JSON
  - `mcqs/` — MCQs split by subject (243 subjects + unassigned), parts when >100 MB
- `manifests/` — manifest.json, row_counts.json, files.json, checksums.json, repo.sha256
- `snapshots/`, `releases/` — regenerable packages (gitignored)
- `reports/` — JSON audit reports
- `scripts/` — pipeline tools

## Pipeline

```sh
# Export DB → repo (resume-safe, checkpointed)
node scripts/export-db.js                    # full
node scripts/export-db.js --incremental      # changed tables only
node scripts/export-db.js --snapshot --release

# Rebuild + prove reproducibility
node scripts/build-db.js                     # → ../db/pakistan-mcqs.rebuilt.sqlite
node scripts/validate-db.js                  # original vs rebuilt (12 checks)
node scripts/diff-db.js --a <db1> --b <db2>  # per-table hash diff

# Verify / audit
node scripts/verify-db.js                    # DB vs repo (10 checks)
node scripts/checksum-db.js                  # write checksums
node scripts/checksum-db.js --verify         # verify all
node scripts/storage-report.js               # sizes, GitHub limits, LFS candidates
node scripts/compress-db.js / decompress-db.js
```

## Rules

- The production SQLite is read-only; nothing here modifies it.
- Streaming only; peak RSS stays below 512 MB.
- Compression: zlib gzip level 6, lossless (zstd fallback if available).
- Commits are incremental: only changed files are updated.
