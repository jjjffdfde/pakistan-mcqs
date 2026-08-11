# Deployment Guide — Pakistan MCQS Hub (Phase 26)

The platform is **static-first**: the site is plain HTML/JS/CSS under
`index.html`, `assets/`, `subjects/`, `chapters/` and needs no runtime.
The Node API server (`server.js`, port 8765) adds DB-backed features
(search, subjects, chapters, health) and is optional for serving pages.

## Option A — Docker Compose (recommended)

```sh
docker compose up -d --build
docker compose ps
curl http://localhost/api/health
```

- `api` — `node:22-alpine`, runs `server.js`, mounts `./db` read-only
- `web` — nginx, serves static files and proxies `/api` → `api:8765`
- `verify` (profile) — `docker compose run --rm verify`

Health checks: `/api/health` on both services (30s interval, 3 retries).

## Option B — PM2 (bare metal)

```sh
npm i -g pm2          # requires npm (not available on locked hosts)
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

`ecosystem.config.js` pins: fork mode, 1 instance (SQLite single writer),
`max_memory_restart: 1G`, logs to `srv-out.log` / `srv-err.log`.

Then serve static files with any web server; a reference nginx config is
provided in `nginx.conf` (root `/usr/share/nginx/html`, `/api` proxied to
`127.0.0.1:8765`).

## Option C — static hosting (no server)

Upload `index.html`, `admin.html`, `404.html`, `offline.html`, `assets/`,
`subjects/`, `chapters/`, `data/`, plus `sitemap.xml`, `robots.txt`,
`manifest.webmanifest`, `sw.js`, `.nojekyll`. The site degrades gracefully:
API features are unavailable but all pages and search remain usable.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `MCQS_PORT` | `8765` | API listen port |
| `MCQS_TEST_DB` | `db/pakistan-mcqs.sqlite` | DB path for tooling/tests |
| `MCQS_READONLY` | — | Recommended in production (read-only DB handle) |

## Production hygiene

- Keep `db/pakistan-mcqs.sqlite` on a volume (Compose `./db:/app/db:ro`),
  not inside the image, so rebuilds don't re-ship 2.1 GB.
- Snapshot before upgrades: `node backup/backup-db.js`.
- Verify after deploy: `node backup/verify-backup.js` and
  `node scripts/monitor.cjs`.
