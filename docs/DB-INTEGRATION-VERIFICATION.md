# DB Integration Verification

Date: 2026-08-11T12:15:40.624Z  ·  API: http://localhost:8802  ·  DB: db/pakistan-mcqs.sqlite

## Result: ALL PASS (30/30)

## STEP 10 — SQL counts vs Dashboard counters

| Check | SQL | API | Status |
| --- | --- | --- | --- |
| dashboard:mcqs | 872621 | 872621 | ✅ PASS |
| dashboard:mcqs_total | 872621 | 872621 | ✅ PASS |
| dashboard:options | 3490484 | 3490484 | ✅ PASS |
| dashboard:subjects | 243 | 243 | ✅ PASS |
| dashboard:chapters | 884 | 884 | ✅ PASS |
| dashboard:topics | 1597 | 1597 | ✅ PASS |
| dashboard:subtopics | 4436 | 4436 | ✅ PASS |
| dashboard:papers | 110 | 110 | ✅ PASS |
| dashboard:mocktests | 95 | 95 | ✅ PASS |
| dashboard:quizzes | 21 | 21 | ✅ PASS |
| dashboard:exams | 55 | 55 | ✅ PASS |
| dashboard:categories | 17 | 17 | ✅ PASS |
| dashboard:bookmarks | 5 | 5 | ✅ PASS |
| dashboard:attempts | 54 | 54 | ✅ PASS |
| search FTS | results with options | 200 | ✅ PASS |
| search no-match | total=0 | 200 | ✅ PASS |
| browse page1 | 10 rows paginated | 200 | ✅ PASS |
| browse filtered subject | all physics | 200 | ✅ PASS |
| single mcq | question + 4 options | 200 | ✅ PASS |
| random sampler | 20 random rows | 200 | ✅ PASS |
| subjects list | count = SQL | 200 | ✅ PASS |
| chapters list | count = SQL | 200 | ✅ PASS |
| topics list | count = SQL | 200 | ✅ PASS |
| quizzes list | count = SQL | 200 | ✅ PASS |
| mocktests list | count = SQL | 200 | ✅ PASS |
| pastpapers list | count = SQL | 200 | ✅ PASS |
| categories list | count = SQL | 200 | ✅ PASS |
| bookmarks list | array | 200 | ✅ PASS |
| leaderboard list | array | 200 | ✅ PASS |
| related filter | <=5 rows | 200 | ✅ PASS |

## STEP 11 — Feature smoke tests

Every endpoint above was queried over HTTP and validated against live SQL counts and/or row shape. The frontend consumes these exact endpoints for search, browse, practice, quiz, mock tests, past papers, weekly/monthly challenges, bookmarks, leaderboard and dashboard.

## Notes

- SQL counts are computed read-only from `db/pakistan-mcqs.sqlite` at test time.
- The dashboard reads `/api/stats` (and `/api/health`) when `DB.enabled`; demo JSON is only used when the API server is unreachable (status panel then shows "Local Database Offline").
