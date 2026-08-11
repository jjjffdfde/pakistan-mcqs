# Monitoring & Observability Guide — Pakistan MCQS Hub (Phase 26)

## Health check

```sh
node scripts/monitor.cjs
```

Read-only, deterministic. Checks:

1. **DB** — opens `db/pakistan-mcqs.sqlite` read-only; counts MCQs
   (total/active), subjects, chapters, topics; `integrity_check`;
   journal mode, page size/count, file size.
2. **API** — probes `GET /api/health`; if the server isn't already
   running it boots `server.js` on `MCQS_PORT` (default 8765),
   waits up to 30 s for health, then shuts it down.

Exit codes: `0` = HEALTHY, `1` = UNHEALTHY. Emits
`docs/phase26_monitoring.json`.

## API health endpoint

```json
GET /api/health
{ "ok": true, "mcqs": 872621, ... }
```

The endpoint is served by `server.js` (port 8765). The Compose stack adds
container-level healthchecks (`/api/health` via `wget`, 30s interval) on
both `api` and `web` services.

## Periodic verification (CI / cron)

| Command | Cadence | Catches |
| --- | --- | --- |
| `node backup/verify-backup.js` | daily | corruption, FK drift, snapshot rot |
| `node scripts/lint.cjs` | per commit | style/format drift |
| `node scripts/test.cjs` | per commit | regressions (34 tests) |
| `node scripts/benchmark.cjs` | per release | query latency regression |
| `node scripts/security-audit.cjs` | per commit | secrets, eval, mixed content |

## Logs

- PM2: `srv-out.log`, `srv-err.log` (root) — see `ecosystem.config.js`
- Docker: `docker compose logs -f api web`

## Alerting thresholds (suggested)

- `monitor.cjs` exit 1 (unhealthy) — page on-call
- active MCQs drop >1% between runs — investigate restore/rollback
- avg COUNT query > 500 ms in benchmark — flag to performance review
