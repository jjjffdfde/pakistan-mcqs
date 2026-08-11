# Backup & Restore Guide — Pakistan MCQS Hub (Phase 26)

All backups target the single production artifact: `db/pakistan-mcqs.sqlite`
(~2.1 GB, 872,621 active MCQs as of Phase 26).

## Create a snapshot

```sh
node backup/backup-db.js
```

Produces:

```
backup/db-backup-<stamp>/
  pakistan-mcqs.sqlite     VACUUM INTO snapshot
  MANIFEST.json            timestamp, sha256, bytes
```

`VACUUM INTO` yields a consistent, compacted copy. Snapshots are stored
under `backup/` (excluded from lint, release manifest, and repo audit
statistics).

## List snapshots

```sh
node backup/restore-db.js --list
```

## Verify integrity (and latest snapshot checksum)

```sh
node backup/verify-backup.js
```

Checks (all read-only):

- `PRAGMA integrity_check` on the live DB
- `PRAGMA foreign_key_check` — 0 violations expected
- SHA-256 of the latest snapshot vs its `MANIFEST.json`
- Active-MCQ count for trend spotting

Emits `docs/phase26_backup.json`.

## Restore

```sh
node backup/restore-db.js --dir db-backup-2026-08-04-12-47-20
```

Restore is **safe by default**:

- verifies the snapshot SHA-256 against its manifest (aborts on mismatch)
- stashes the current DB to `backup/restore-prev-<stamp>/` before overwriting
- removes stale `-wal`/`-shm` sidecars after copy

## Legacy tooling

`db/backup.js` / `db/restore.js` (earlier enterprise scripts) also remain
available; `backup/backup-db.js` is the Phase 26 replacement with manifest
checksums and verify integration.

## Schedule suggestion

- Daily snapshot + `verify-backup.js` (cron/systemd timer)
- Weekly restore-drill from the newest snapshot onto a scratch DB
- Retain 7 daily + 4 weekly snapshots; prune the rest manually
