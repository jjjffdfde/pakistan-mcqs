# PHASE 38 EXECUTION REPORT — SQLite → NDJSON Static-First Runtime Migration

**Date:** 2026-08-12
**Status:** ✅ COMPLETE — all steps executed, all gates PASS
**Master database:** `db/pakistan-mcqs.sqlite` — **untouched** (read-only re-export; git-ignored; mtime preserved by design; 6,630,018 rows)

---

## 1. Objectives (from phase plan)

| # | Objective | Status |
|---|---|---|
| A | Map every SQLite dependency (routes, queries, tables) | ✅ `docs/phase38_sqlite_dependency_map.json` |
| B | Classify features: migrated / admin / AI / user-data / import-export | ✅ `docs/phase38_feature_classification.json` |
| C | Build NDJSON runtime `runtime-v2/` with 0 API parity FAIL | ✅ PASS=55 PASS_SET=8 EXPECTED=7 FAIL=0 |
| D | Prove determinism: integrity + regression + sqlite-disabled gate | ✅ 27/27 · 51/51 · 82/82 |
| E | Memory ≤ 512MB, documented security posture | ✅ RSS 465.7MB peak, 42 static + 13 dynamic security checks |
| F | Full documentation set + execution report | ✅ this report |

## 2. Architecture delivered

```
runtime-v2/
  server.cjs         node:http server; NDJSON read paths; NOT_MIGRATED 501s; SQLITE_DISABLED gate
  query-engine.cjs   parity engine (ordering/options/related/search/random/meta)
  data-loader.cjs    gzip line streaming (StringDecoder), bounded caches, meta/recent, options
  kg-store.cjs       streaming KG store (18 tables) + kg-query.cjs query layer
  user-store.cjs     server-side JSON user data (bookmarks/history/leaderboard/periods)
  index-builder.cjs  5-pass deterministic index builder (rebuild 80s, build-time only)
  indexes/           632.7MB of deterministic JSON indexes (gitignored)
database/data/       643MB of fresh NDJSON.GZ exports (244 subjects, 872,621 mcqs, KG)
```

Run: `npm run start:ndjson` → `node --max-old-space-size=384 runtime-v2/server.cjs`
Disabled mode: `SQLITE_DISABLED=true node --max-old-space-size=384 runtime-v2/server.cjs` (41 routes → 501 `data_source:"sqlite_disabled"`; migrated routes serve normally)

## 3. Verification results (all re-run on final code)

| Suite | Tool | Result | Doc |
|---|---|---|---|
| Integrity (order-independent sha256) | `scripts/phase38/integrity.cjs` | **27/27 PASS** | `phase38_integrity.json` |
| API parity (live vs SQLite) | `scripts/phase38/parity.cjs` | **PASS=55 SET=8 EXPECTED=7 FAIL=0** | `phase38_api_parity.json` |
| Regression (memory-cap'd process) | `scripts/phase38/regression.cjs` | **51/51 PASS** | `phase38_regression.json` |
| SQLite-disabled gate | `scripts/phase38/sqlite-disabled-test.cjs` | **82/82 PASS** | `phase38_sqlite_disabled.json` |
| Security (static + dynamic) | `scripts/phase38/security-audit.cjs` | **42/42 static, 13/13 dynamic PASS** | `phase38_security.json` |
| Performance | `scripts/phase38/bench.cjs` | **PASS — RSS 465.7MB ≤ 512MB** | `phase38_performance.json` |
| GitHub audit | — | PASS — no secrets/DB in repo | `phase38_github_audit.json` |

Bench highlights (cold medians): ndjson browse_p3 **407.8ms vs sqlite 4505.5ms** (9× faster); kg_concept_search 4.4ms vs 6.1ms (ndjson wins); slower reads remain where sqlite's B-tree wins (random_seeded 671ms vs 0.3ms, mcq_lookup 599ms vs 2.5ms, search_warm 1379ms vs 3.1ms) — all bounded, deterministic, documented.

## 4. Notable fixes during the phase

1. **Export staleness** — old exports (8/7) lacked later DB edits; re-exported 244 subjects + options + kg_knowledge_packs via checkpoint (`database/manifests/.export-checkpoint.json`).
2. **UTF-8 corruption (U+FFFD)** — `streamGzLines` decoded gzip chunks with `toString("utf8")`, corrupting multi-byte chars (U+2212 −) at chunk boundaries → fixed with `StringDecoder` + `dec.end()`.
3. **Subject index 0 (accounting) falsy bug** — `if (!m) continue;` dropped ALL accounting rows → 5 sites fixed to `m == null` in query-engine.
4. **pass3 orphaned options** — meta decoded as array `[subIdx]` instead of plain int → 3.49M options orphaned → `Array.isArray` fallback, rerun 0 orphans.
5. **OOM under memory cap** (deterministic at `/api/random` when a mathematics row was picked) — `loadSubjectPart` materialized the 115,332-row part (~265MB transient). Fixed via: LRU 80k→30k rows, search cache 64→32MB, oversized parts never materialized (streamed + Set-filtered), options loaded via dedicated `loadSubjectOptions`. Post-fix: heap peak 297MB, RSS peak 465.7MB at 384MB cap.
6. **server.js crash under SQLITE_DISABLED** — module-level `db.prepare` guarded.

## 5. Documented, intentional divergences

- AI engine, import, backup, restore → **501 NOT_MIGRATED** (still SQLite; admin/SQLite-only per classification).
- Oversized-subject export (`/api/export` NDJSON mode) streams in natural row order (sort only for cached subjects ≤30k rows).
- Cold search/browse/random slower than SQLite (bounded, cached after first use).

## 6. Removal candidates (documented, NOT executed — out of scope)

`docs/phase38_removal_candidates.json`: dead exports (`clearKeyIdxCache`, `userFile`, `clearCaches`, kg/user `stats`/`reset`, `streamCandidatesTopN`+`makeTopNHeap`, `needed`/`opts`/`keyIdxCache`, pass5 `qhash.idx`/`concept.idx`), internal-only exports, and ~26 legacy `server.js` route blocks superseded by runtime-v2.

## 7. Artifacts

- Harnesses: `scripts/phase38/{integrity,parity,regression,security-audit,sqlite-disabled-test,bench,audit-deps,classify}.cjs` (28 scratch `tmp-*.cjs` files removed)
- Docs (17 JSON + this report): `docs/phase38_*.json` + `docs/PHASE38_EXECUTION_REPORT.md`
- DB integrity preserved; nothing committed to git (working tree uncommitted as before)
