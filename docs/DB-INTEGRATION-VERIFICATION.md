# DB Integration Verification

Date: 2026-08-18T08:53:47.614Z  ·  API: http://127.0.0.1:8766  ·  Engine: runtime-v2 (NDJSON.GZ + JSON indexes)

## Result: ALL PASS (30/30)

## STEP 10 — File-data counts vs Dashboard counters

| Check | FILE | API | Status |
| --- | --- | --- | --- |
| dashboard:mcqs | 872624 | 872624 | ✅ PASS |
| dashboard:mcqs_total | 872624 | 872624 | ✅ PASS |
| dashboard:options | 3490496 | 3490496 | ✅ PASS |
| dashboard:subjects | 243 | 243 | ✅ PASS |
| dashboard:chapters | 884 | 884 | ✅ PASS |
| dashboard:topics | 1597 | 1597 | ✅ PASS |
| dashboard:subtopics | 4436 | 4436 | ✅ PASS |
| dashboard:papers | 110 | 110 | ✅ PASS |
| dashboard:mocktests | 95 | 95 | ✅ PASS |
| dashboard:quizzes | 21 | 21 | ✅ PASS |
| dashboard:exams | 55 | 55 | ✅ PASS |
| dashboard:categories | 17 | 17 | ✅ PASS |
| dashboard:bookmarks | 50 | 50 | ✅ PASS |
| dashboard:attempts | 219 | 219 | ✅ PASS |
| search | results with options | 200 | ✅ PASS |
| search no-match | total=0 | 200 | ✅ PASS |
| browse page1 | 10 rows paginated | 200 | ✅ PASS |
| browse filtered subject | all physics | 200 | ✅ PASS |
| single mcq | question + 4 options | 200 | ✅ PASS |
| random sampler | 20 random rows | 200 | ✅ PASS |
| subjects list | count = FILE | 200 | ✅ PASS |
| chapters list | count = FILE | 200 | ✅ PASS |
| topics list | count = FILE | 200 | ✅ PASS |
| quizzes list | count = FILE | 200 | ✅ PASS |
| mocktests list | count = FILE | 200 | ✅ PASS |
| pastpapers list | count = FILE | 200 | ✅ PASS |
| categories list | count = FILE | 200 | ✅ PASS |
| bookmarks list | array | 200 | ✅ PASS |
| leaderboard list | array | 200 | ✅ PASS |
| related filter | <=5 rows | 200 | ✅ PASS |

## STEP 11 — Feature smoke tests

Every endpoint above was queried over HTTP and validated against live file-data counts and/or row shape. The frontend consumes these exact endpoints for search, browse, practice, quiz, mock tests, past papers, weekly/monthly challenges, bookmarks, leaderboard and dashboard.

## Notes

- Counts are computed read-only from the NDJSON.GZ exports (`database/data`) and JSON indexes (`runtime-v2/indexes`) at test time. No SQLite is involved.
- The dashboard reads `/api/stats` (and `/api/health`) from the runtime-v2 API server.
