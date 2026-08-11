# Install Guide 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4*

## 1. Requirements

| Component | Requirement |
|---|---|
| Node.js | **v25 or newer** (uses built-in `node:sqlite`; no npm install needed) |
| Browser | Any modern browser (Chrome/Edge/Firefox); PWA-capable |
| OS | Windows / macOS / Linux |

There are **zero npm dependencies** for the default SQLite setup. (Optional
MySQL/PostgreSQL engines need `npm install mysql2` / `pg` — not required.)

## 2. Quick start (3 steps)

```powershell
# 1. Serve the static site
node scripts\serve-test.js            # http://127.0.0.1:4173

# 2. Start the local API server (DB mode)
node server.js                        # http://localhost:8765

# 3. Open the site
#    http://127.0.0.1:4173  →  static-first; DB badge appears when the API is up
```

- **Static-only:** skip step 2 — the site works fully from `data/*.json`
  (1338 curated MCQs).
- **DB mode:** with the API running, the same pages search/browse/practice
  against all **240,716** MCQs (FTS search, random samplers, real subject
  counts, server leaderboard). A gold **DB badge** in the header confirms it.
- **Production hosting:** deploy the repo to any static host (GitHub Pages,
  Netlify, etc.) — nothing changes for visitors.

## 3. Building the database from scratch

The SQLite file `db/pakistan-mcqs.sqlite` is checked in / restored from
backups; to regenerate:

```powershell
node pipeline\run.js --fresh --target 200000   # ~20–30 min, resumable
node db\export-json.js                         # optional: mirror to data/export/
curl -X POST http://localhost:8765/api/backup  # snapshot the result
```

Resume an interrupted run: just run `node pipeline\run.js` again (no
`--fresh`).

## 4. Ports & configuration

| Setting | How |
|---|---|
| API port | `$env:MCQS_PORT=9000; node server.js` (default 8765) |
| Static port | edit `scripts/serve-test.js` (default 4173) |
| DB engine | `db/config.json` → `"engine": "sqlite" | "mysql" | "postgres"` |
| DB file | `db/config.json` → `sqlite.file` (default `db/pakistan-mcqs.sqlite`) |
| Generation target | `--target N` (default 500,000) |

## 5. Verification checklist

```powershell
node scripts\audit.js              # static-site audit  → 0 FAIL / 0 WARN
node scripts\serve-test.js         # static site up
node server.js                     # API up
curl http://localhost:8765/api/health   # → {"ok":true,"mcqs":240716}
curl "http://localhost:8765/api/search?q=constitution&limit=2"
```

Browser smoke test (optional):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --virtual-time-budget=8000 `
  --dump-dom "http://127.0.0.1:4173/#home"
# expect: statMcqs=240716, DB badge, 183 subject cards (DB mode)
```

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| "ExperimentalWarning: SQLite…" | Harmless — Node marks `node:sqlite` experimental; API is stable in v25 |
| No DB badge in header | API server not running / port changed / `MCQS_PORT` mismatch — site still works statically |
| `EADDRINUSE` on 8765 | `Stop-Process -Name node -Force` then start again |
| FTS search returns nothing | Rebuild: `node -e "const db=require('./db/engine.js').open(); db.exec(\"INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')\");"` |
| Page says "Could not load data" | Open over HTTP (not `file://`); the test server or any static host works |
