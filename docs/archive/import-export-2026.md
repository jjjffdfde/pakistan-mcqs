# Import & Export Guide 2026 — Pakistan MCQs Hub

*Generated 2026-08-01 · Phase 4*

## 1. Export (DB → JSON / CSV)

### 1.1 Full static mirror — `db/export-json.js`

```powershell
node db\export-json.js
```

Writes into **`data/export/`** (never touches the live static bank):

| Output | Contents |
|---|---|
| `data/export/mcqs.json` | All 240,716 active MCQs (id, question, optionA–D, correctAnswer, difficulty, subjectId, chapterId, topicId, explanation, tags, examIds, year, references, source, status) |
| `data/export/mcqs-<subject>.json` | One section file per subject (183 files) |
| `data/export/categories.json` / `subjects.json` / `chapters.json` / `topics.json` | Taxonomy |
| `data/export/quizzes.json` / `mocktests.json` / `pastpapers.json` / `exams.json` | Quizzes/mocks/papers/exams (exams copied from static) |

Options are attached from the normalized `options` table at export time
(A–D columns), so the JSON mirror is drop-in compatible with the frontend
schema.

### 1.2 API export — `GET /api/export`

- `GET http://localhost:8765/api/export?format=json` → full JSON array.
- `GET http://localhost:8765/api/export?format=csv` → `mcqs.csv` attachment
  with the same fields (CSV-escaped).

## 2. Import (JSON → DB)

### 2.1 API import — `POST /api/import`

```bash
curl -X POST http://localhost:8765/api/import \
  -H "Content-Type: application/json" \
  --data-binary @questions.json
```

Payload: JSON **array** of MCQ objects:

```json
[{
  "question": "Which is the largest city of Pakistan by population?",
  "optionA": "Karachi", "optionB": "Lahore", "optionC": "Islamabad", "optionD": "Faisalabad",
  "correctAnswer": "A",
  "difficulty": "easy",
  "subjectId": "geography",
  "chapterId": "ch-geog-...", "topicId": "t-ch-geog-...",
  "explanation": "Karachi is the most populous city of Pakistan.",
  "tags": ["geography", "cities"],
  "examIds": "css,ppsc"
}]
```

Behavior:
- **Dedupe:** sha256 of the normalized question is checked against the
  `qhash` UNIQUE index — duplicates are counted in `skipped`, never inserted.
- New MCQs get ids `imp-<timestamp>-<seq>`, `source='imported'`, `status='active'`,
  options written to the `options` table, and the FTS index rebuilt once.
- Response: `{ "inserted": N, "skipped": M }`.

### 2.2 Importing a file via pipeline (alternative)

Static bank files (`data/mcqs/*.json`) can be regenerated through the Phase-3
workflow (`node scripts/build-mcqs.js`), which is how the curated bank feeds
the site; the pipeline itself remains the primary writer of the DB.

## 3. Round-trip example

```powershell
node db\export-json.js                     # DB → data/export/
# edit data/export/mcqs-mybatch.json …
curl -X POST localhost:8765/api/import --data-binary @data/export/mcqs-mybatch.json
curl "localhost:8765/api/export?format=csv" -o mcqs.csv
```

## 4. Notes

- Import does not create chapters/topics automatically — reference existing
  ids from `/api/chapters` / `/api/topics` (or insert taxonomy first).
- The static site never reads `data/export/`; those files are for backup,
  migration and offline distribution.
- Maximum 200 ids per `/api/mcqs?ids=` lookup; batch import accepts any
  array size (streamed by the server loop).
