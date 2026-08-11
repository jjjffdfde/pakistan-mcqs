# DB Integration Verification

Date: 2026-08-01T11:25:12.210Z  ·  API: http://localhost:8765  ·  DB: db/pakistan-mcqs.sqlite

## Result: ALL PASS (30/30)

## STEP 10 — SQL counts vs Dashboard counters

| Check | SQL | API | Status |
| --- | --- | --- | --- |
| dashboard:mcqs | 241551 | 241551 | ✅ PASS |
| dashboard:mcqs_total | 241551 | 241551 | ✅ PASS |
| dashboard:options | 966204 | 966204 | ✅ PASS |
| dashboard:subjects | 183 | 183 | ✅ PASS |
| dashboard:chapters | 595 | 595 | ✅ PASS |
| dashboard:topics | 1054 | 1054 | ✅ PASS |
| dashboard:subtopics | 2807 | 2807 | ✅ PASS |
| dashboard:papers | 110 | 110 | ✅ PASS |
| dashboard:mocktests | 95 | 95 | ✅ PASS |
| dashboard:quizzes | 21 | 21 | ✅ PASS |
| dashboard:exams | 38 | 38 | ✅ PASS |
| dashboard:categories | 17 | 17 | ✅ PASS |
| dashboard:bookmarks | 5 | 5 | ✅ PASS |
| dashboard:attempts | 49 | 49 | ✅ PASS |
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
