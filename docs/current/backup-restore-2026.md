# Backup & Restore Guide 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4*

## 1. Backup

### 1.1 Snapshot folders

Every post-generation backup is stored under `backup/`:

```
backup/
  pre-phase4-2026-07-31-1858/        # full static site + data before Phase 4
  db-backup-2026-08-01-04-06-13/     # SQLite file + dump.json after the 200K run
```

`db-backup-*/` contains:
- `pakistan-mcqs.sqlite` — exact copy of the database file (WAL checkpointed),
- `dump.json` — full JSON dump of all tables (~227 MB, 240,716 MCQs),
- `meta.json` — timestamp, counts, pipeline state snapshot.

### 1.2 Automatic backup — `POST /api/backup`

```bash
curl -X POST http://localhost:8765/api/backup
# → { "ok": true, "dir": "backup/db-backup-2026-08-01-..." }
```

Creates a new timestamped folder with the same contents. Safe to run while
the server is live (SQLite WAL + a read transaction).

### 1.3 Manual backup

```powershell
# checkpoint WAL first (do this while the server is stopped)
Copy-Item "E:\pAK MCQS\db\pakistan-mcqs.sqlite" "E:\pAK MCQS\backup\db-backup-manual\"
```

## 2. Restore

### 2.1 Automatic restore — `POST /api/restore`

```bash
curl -X POST http://localhost:8765/api/restore `
  -H "Content-Type: application/json" `
  -d '{"dir": "backup/db-backup-2026-08-01-04-06-13"}'
```

The server closes the current connection, replaces
`db/pakistan-mcqs.sqlite` (+ `-wal`/`-shm`) with the snapshot, re-opens the
DB and rebuilds the FTS index. **Stop clients during restore.**

### 2.2 Manual restore

```powershell
Stop-Process -Name node -Force            # stop server + pipeline
Copy-Item "backup\db-backup-2026-08-01-04-06-13\pakistan-mcqs.sqlite" "db\pakistan-mcqs.sqlite" -Force
Remove-Item "db\pakistan-mcqs.sqlite-wal","db\pakistan-mcqs.sqlite-shm" -ErrorAction SilentlyContinue
node server.js                            # start again
```

### 2.3 Restore from JSON dump

```powershell
node -e "const db=require('./db/engine.js').open(); const fs=require('fs');
const data=JSON.parse(fs.readFileSync('backup/db-backup-2026-08-01-04-06-13/dump.json','utf8'));
// tables: categories, subjects, chapters, topics, mcqs, options, ...
db.transaction(()=>{ for (const [t,rows] of Object.entries(data)) for (const r of rows)
  db.run('INSERT OR REPLACE INTO '+t+' ('+Object.keys(r)+') VALUES ('+Object.keys(r).map(()=>'?')+')', Object.values(r)); });
db.exec(\"INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')\"); console.log('restored');"
```

## 3. Verification (performed 2026-08-01)

| Step | Result |
|---|---|
| Backup created after 200K run | OK — 240,716 MCQs in dump |
| `mcqs` / `options` counts match | 240,716 / 962,864 |
| Restore round-trip (fresh file → replace → reopen) | OK |
| FTS integrity after restore | OK (`integrity-check` clean) |
| Static site unaffected | `data/` untouched (export writes to `data/export/`) |

## 4. Recommended schedule

- After every generation run with `--target` increases (pipeline can be
  wrapped: `node pipeline\run.js …; curl -X POST localhost:8765/api/backup`).
- Before any `--fresh` regeneration, so the previous bank stays recoverable.
- Before importing large batches.
