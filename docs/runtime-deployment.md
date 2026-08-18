# Runtime API Deployment Guide

The runtime API (`runtime-v2/server.cjs`) is a self-hostable, zero-dependency
Node 22+ service that serves the full 872,624-MCQ database plus the AI Coach
engine. It is currently **NOT deployed publicly** — `api.production` in
`data/site-config.json` stays empty until you deploy it.

This guide covers everything needed to run it in production.

---

## 1. What you are deploying

| Component | Path | Notes |
|---|---|---|
| Server | `runtime-v2/server.cjs` | Node 22+, zero npm dependencies |
| Payload | `database/data/` | NDJSON.GZ question bank (~643 MB on disk, 872,624 MCQs) |
| Indexes | `runtime-v2/indexes/` | Built by `npm run postbuild` (gitignored, regenerable) |
| User data | `runtime-v2/userdata/` | Writable: answer history, AI coach state (gitignored, **persist it**) |
| Config | `data/site-config.json` | Frontend source of truth; `api.production` switches the public site to your backend |

Pre-flight checks (run before and after deploying):

```bash
npm run runtime:check   # payload + indexes integrity (no server needed)
npm run test:api        # boots the server, ~25 black-box checks (health, CORS, errors, AI)
npm test                # full regression suite
```

## 2. Storage requirements (IMPORTANT)

- The payload directory must be on a **persistent disk**. The unpacked bank is
  ~2.2 GB including the full dataset history used by the AI engine
  (872,624 questions, 243 subjects, 884 chapters, 1,597 topics).
- **Free-tier platforms without persistent storage (e.g. Render free
  instances, some Fly machines) cannot host it** — files vanish on redeploy.
- Budget: at least 3–4 GB disk (payload + indexes + user data headroom).
- `MCQS_JSON_USER_DIR` must also be persistent so users keep their progress
  (profiles, planner, spaced-repetition state, achievements).

## 3. Environment variables

Full list in `.env.example`. Production-relevant subset:

| Variable | Default | Production recommendation |
|---|---|---|
| `PORT` or `MCQS_JSON_PORT` | `8766` | set by platform (or keep 8766) |
| `HOST` / `MCQS_JSON_HOST` | `127.0.0.1` (dev) / `0.0.0.0` (prod) | `0.0.0.0` so the reverse proxy can reach it |
| `NODE_ENV` | `development` | **`production`** (sanitizes error messages, binds 0.0.0.0) |
| `DATABASE_PATH` / `MCQS_JSON_DATA_DIR` | `database/data` | absolute path to persistent payload |
| `MCQS_JSON_INDEX_DIR` | `runtime-v2/indexes` | same disk as payload |
| `MCQS_JSON_USER_DIR` | `runtime-v2/userdata` | absolute path to persistent user dir |
| `CORS_ORIGIN` | GitHub Pages + localhost dev origins | your frontend origin(s), comma-separated |
| `MCQS_ADMIN_TOKEN` | empty (admin open, local dev only) | **strong random token — required** |
| `MCQS_BODY_LIMIT` | 2 MB | raise only if importing very large batches |
| `MCQS_API_RATE_LIMIT` | 600/min/IP | tighten if abused |
| `MCQS_AI_RATE_LIMIT` | 120/min/IP | tighten if abused |
| `AI_PROVIDER`, `AI_API_URL`, `AI_API_KEY` | unset | optional future external-AI seam; **not** used by the current file-backed AI engine |

Secrets policy: all of these are **server-side only**. Nothing is embedded in
the frontend or in `data/site-config.json`. Never commit a real `.env`.

## 4. Health checks

| Endpoint | Meaning | Use |
|---|---|---|
| `GET /health` | process + database + AI status | platform health check (`{server,database,ai,version}`) |
| `GET /ready` | database ready to serve | load-balancer readiness (`{ready:true}`) |
| `GET /api/health` | backward-compatible engine health | tooling/tests (`{ok,mcqs,data_source}`) |

Point your platform's health check at `/health` or `/ready` — both return
HTTP 503 while the database is unavailable (e.g. payload mount not ready).

## 5. Platform notes

### Render (web service)

- Build: `npm install && npm run postbuild` (or commit built indexes).
- Start: `npm start` (already sets `--max-old-space-size=384`).
- **Use a paid plan with persistent disk**; mount it at `database/data` (or set
  `DATABASE_PATH` to the mount) and at your `MCQS_JSON_USER_DIR` path.
- Health check path: `/health`.
- Set `NODE_ENV=production`, `HOST=0.0.0.0`, `CORS_ORIGIN=https://jjjffdfde.github.io`,
  and a strong `MCQS_ADMIN_TOKEN`.

### Railway

- Same as Render; attach a volume for `database/data` + `MCQS_JSON_USER_DIR`.
- Start command: `npm start`; health check: `/health`.

### Fly.io

- Use `fly volumes create` for the payload + user dir; `fly.toml`
  `[mounts]` entries; `[http_service.checks]` → `path = "/health"`.
- Machine memory ≥ 1 GB (engine heap is capped at 384 MB).

### Any Docker host

`docker-compose.yml` in the repo already wires: `api` (runtime-v2) + `web`
(nginx static + `/api` proxy). Replace the anonymous `mcqs-userdata` volume
with a persistent one and mount the payload into `database/data`.

## 6. Switching the frontend to your backend

```bash
SITE_CONFIG_API_PRODUCTION=https://api.your-host.com node scripts/update-site-config.cjs
npm run build:pages   # regenerate static pages (if you deploy them from this repo)
```

- Only `https://` values are accepted; anything else keeps `api.production` empty.
- The frontend (`assets/js/ai.js` + `assets/js/app.js`) uses `api.production`
  when non-empty, **regardless of page origin**. It never falls back to
  `localhost` from the public site.
- The frontend retries a GET once (max 1 retry, never loops) and disables
  server-backed features cleanly when the backend is unreachable — the static
  1,338-MCQ practice bank keeps working regardless.

## 7. Operations checklist

1. `npm run runtime:check` passes against the deployed payload.
2. `npm run test:api` passes (all 25 checks, including sanitized-error paths).
3. `NODE_ENV=production` set; error messages do not leak paths/stack traces.
4. `CORS_ORIGIN` contains exactly your frontend origin(s); `*` only if intended.
5. `MCQS_ADMIN_TOKEN` set; `/api/import`, `/api/backup`, `/api/restore`,
   `/api/export` return 401 without it.
6. `/health` and `/ready` respond 200 and the platform uses them.
7. User data dir is persistent and backed up (`/api/backup` creates
   `backup/db-backup-<stamp>/` with `userdata/` — store off-box).
8. Rate limits are enforced per IP; monitor for 429s.
9. TLS terminates at your reverse proxy (the server itself is plain HTTP,
   bound to `0.0.0.0` only behind a proxy/firewall).