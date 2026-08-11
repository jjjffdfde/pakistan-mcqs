# Testing Guide — Pakistan MCQS Hub (Phase 26)

Zero-dependency test runner: `node scripts/test.cjs` (no npm, no jest).

## Run everything

```sh
node scripts/test.cjs
```

Exit codes: `0` all passed, `1` any failed. Emits `docs/phase26_testing.json`.

## Suites

| Suite | File | Coverage |
| --- | --- | --- |
| Unit | `tests/unit/utils.test.cjs` | pure helpers (sha256hex, slugify, fmtBytes, isIsoDate, esc, readJson) |
| Database | `tests/database/sqlite.test.cjs` | read-only open, counts, integrity, FK, WAL sidecars |
| API | `tests/api/endpoints.test.cjs` | boots the **real** `server.js` on an ephemeral port; `/api/subjects`, `/api/chapters`, `/api/search`, `/api/health`, unknown-route 404 |
| UI assets | `tests/ui/assets.test.cjs` | static asset existence (html/css/js/sw, favicon, offline) |
| Performance | `tests/performance/bench.test.cjs` | sha256 ops/s, sitemap locs, docs JSON parse, warm COUNT timing |
| Integration | `tests/integration/pages.test.cjs` | sitemap URL sample resolves; index link integrity; docs JSON validity |

34 tests / 6 suites.

## Writing tests

```js
const { runTests, t } = require("../../scripts/test.cjs");
t.test("name", async () => { /* assert */ });
runTests();
```

Important: test bodies are **lazy closures** — the runner executes them
sequentially (`for (const p of pending) await p()`). Do not invoke async
work eagerly at registration time (this previously caused the shutdown
test to SIGTERM the server mid-suite).

## Database access in tests

- Production DB is opened **read-only** (`new DatabaseSync(path, { readOnly: true })`).
- Immediately after killing an API subprocess, SQLite may briefly report a
  transient `disk I/O error` (WAL checkpoint in flight). Use the
  `openReadOnly()` helper (5 attempts × 300 ms) from
  `tests/database/sqlite.test.cjs`.
- CI uses a synthetic fixture under `.phase26-db-test` via `MCQS_TEST_DB`.

## Regression gates

Phase 24/25 audit scripts remain the compatibility baseline — run them
before a release:

```sh
node scripts/phase24-platform.cjs
node scripts/phase25-platform.cjs
```
