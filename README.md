# Pakistan MCQs Hub 🎓

A free, open-source MCQ preparation platform for all Pakistani competitive exams — **PPSC, FPSC, NTS, OTS, CTS, PTS, SPSC, KPPSC, AJKPSC, BPSC, CSS, PMS, Educators, Police, PMA, ISSB, FIA, NAB, WAPDA, FBR, SBP, Banking, IB, MOD, ETEA, MDCAT, ECAT, GAT, GRE, SAT, L.A.T.** and more.

All questions are **original, self-written content** with detailed explanations — no copyrighted material is copied from other MCQ websites.

## Features

- **1300+ original MCQs** across **147 subjects** and **38 exams** (Pakistan Affairs, Current Affairs, Islamic Studies, English, Math, Reasoning, Science, Computer, IT, Programming, Engineering, Medical, Management, Social Sciences, Entry Tests and more)
- **Practice engine** — normal / revision (retry wrong answers) / weak topics / bookmarks / adaptive difficulty, with optional negative marking
- **Timed quizzes & mock tests** — 21 quizzes + 6 full mocks with countdown timers and negative-marking chips
- **Exam simulation** — 40 paper patterns (PPSC Assistant, Junior Clerk, Tehsildar, ASI/SI, PMS, CSS PT, NTS GAT, ETEA, etc.) with question palette and auto-grading; any paper also runs as a **15-question quick quiz**
- **Smart filters** — by subject, chapter, **subtopic**, difficulty, exam, year and type
- **Related questions** — every question links to same-chapter related MCQs after answering
- **Fuzzy global search** — find MCQs by question text, subject or tags, with live suggestions
- **Dashboard** — daily streak, accuracy, points, weak-topic analysis, **7-day AI study planner**, **AI recommended quiz**, achievements and printable certificates
- **Weekly + Monthly challenges** — leaderboard goals with bonus points and achievements
- **Question of the Day**, bookmarks, dark mode (all saved in localStorage)
- **Admin panel** (`admin.html`) — MCQ/subject/topic/explanation managers, CSV/TSV/JSON import (Excel copy-paste works), AI question generator (template drafts), duplicate detection, image library, category manager and export
- **Offline-ready PWA** — service worker caching, installable manifest
- **SEO ready** — sitemap.xml + image/video sitemaps, robots.txt, OpenGraph/Twitter cards, 5 schema.org blocks (WebSite, Organization, Breadcrumb, FAQ, Quiz), auto-generated OG image
- **Mobile responsive** — works on phones, tablets and desktops

## Project Structure

```
├── index.html              # Main single-page app
├── admin.html              # Admin panel (managers / import / generator / export)
├── sw.js                   # Service worker (offline cache)
├── manifest.webmanifest    # PWA manifest
├── robots.txt / sitemap.xml / image-sitemap.xml / video-sitemap.xml / .nojekyll
├── assets/
│   ├── css/style.css       # All styles (light + dark theme)
│   ├── js/app.js           # Frontend application
│   ├── js/admin.js         # Admin panel logic
│   └── img/og-cover.png    # Generated 1200x630 social image
├── data/
│   ├── categories.json     # 16 categories
│   ├── subjects.json       # 147 subjects
│   ├── chapters.json       # 400 chapters
│   ├── topics.json         # 719 topics
│   ├── exams.json          # 38 exams
│   ├── programs.json       # 12 programs
│   ├── mock_tests.json     # 6 mock tests
│   ├── papers.json         # 40 exam paper patterns
│   ├── quizzes.json        # 21 featured quizzes
│   ├── references.json     # 8 cited sources for new MCQs
│   ├── mcqs.json           # Master MCQ bank (generated, 1338 MCQs)
│   └── mcqs/               # MCQ bank by section (34 files)
├── scripts/
│   ├── migrate-phase3.js   # Idempotent taxonomy migration (subjects/chapters/topics/exams/references)
│   ├── phase3/             # Content generators (gen-helper + data25–34)
│   ├── build-mcqs.js       # Validates + enriches + merges mcqs/*.json → mcqs.json
│   ├── audit.js            # Full audit (data, HTML, JS, SEO, a11y) → docs/audit-report.md
│   └── make-og.js          # Regenerates assets/img/og-cover.png
├── docs/                   # Phase evidence & reports → docs/current/, docs/archive/
└── CHANGELOG.md
```

## MCQ Schema

```json
{
  "id": "pak-001",
  "question": "...",
  "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...",
  "correctAnswer": "A",
  "detailedExplanation": "...",
  "difficulty": "easy | medium | hard",
  "subject": "pakistan-affairs",
  "chapter": "pa-movement",
  "topic": "t-1",
  "subtopic": "fundamentals",
  "exam": ["ppsc", "fpsc", "nts"],
  "year": null,
  "tags": ["keyword1", "keyword2"],
  "references": [],
  "relatedQuestions": ["pak-002", "pak-003"],
  "createdDate": "2026-07-31",
  "updatedDate": "2026-07-31"
}
```

## Development

Requires Node.js (only for build/audit scripts — the site itself is pure HTML/CSS/JS).

```bash
# Validate all JSON files and regenerate data/mcqs.json
node scripts/build-mcqs.js

# Run the full audit (data integrity, HTML refs, JS syntax, SEO, a11y)
node scripts/audit.js
```

### Local preview

```bash
npm start                # optional Node server (API + static) → http://localhost:8765
npx serve .              # plain static server → http://localhost:3000
```

Opening `index.html` directly via `file://` will **not** work for the data files due to browser fetch restrictions — always serve over HTTP.

## Testing

Zero-dependency test suites (no test framework required):

```bash
npm run lint             # deterministic lint: JS syntax, JSON validity, markdown, HTML refs
npm run test             # automated test suite (scripts/test.cjs)
npm run test:db          # DB integration tests (uses a temp copy; production DB untouched)
npm run benchmark        # performance smoke benchmark
npm run audit            # full audit (data, HTML refs, JS syntax, SEO, a11y)
npm run audit:repo       # repository audit (structure/size/consistency)
```

Per-phase harnesses under `scripts/phase28`, `scripts/phase30`–`scripts/phase33` and
`tests/phase31` re-run the functional, responsive, network, performance and PWA
verification suites used in the release gates. All regression suites (Phase 31/32/33)
must pass before a release.

## Database Source Repository (Phase 23)

The production SQLite database (`db/pakistan-mcqs.sqlite`, **2.2 GiB, read-only, not
committed to Git**) is fully rebuildable from the compressed NDJSON source repository in
`database/`:

```
database/
├── schema/        # DDL as SQL files
├── data/          # one .ndjson.gz per table (streamed line-per-row JSON) — excluded from Git
├── manifests/     # manifest.json, row_counts.json, files.json, checksums.json
├── reports/       # export/build/validate/diff audit reports
└── scripts/       # export-db.js, build-db.js, validate-db.js, diff-db.js, verify-db.js, ...
```

```bash
# Export the production DB into the source repository (resume-safe, incremental)
node database/scripts/export-db.js            # full
node database/scripts/export-db.js --incremental

# Rebuild a database from source and prove reproducibility
node database/scripts/build-db.js             # → db/pakistan-mcqs.rebuilt.sqlite
node database/scripts/validate-db.js          # original vs rebuilt (12 checks)
node database/scripts/verify-db.js            # DB vs repo (10 checks)
```

The NDJSON payload (`database/data/`) and historical backup snapshots (`backup/`) are
excluded from Git because they exceed GitHub size limits — Git LFS rules are already
prepared in `.gitattributes` if you want to track them. The API server
(`server.js`) reads the production database directly via `db/engine.js`.

## Environment Configuration

The project runs with zero configuration. Optional overrides are documented in
`.env.example` (copy to `.env` locally — never commit the real `.env`):

- `MCQS_PORT` — port for `server.js` (default 8765)
- `MCQS_API` — API base URL used by tooling scripts
- `MCQS_TEST_DB` — alternate SQLite path for tests/monitoring
- `P28_PORT` — phase 28 audit server port
- `CHROME_PATH` — Chrome executable for headless audit runs

## GitHub Usage

```bash
git clone <repo-url>
cd <repo>
npm install        # zero dependencies; creates package-lock.json only
npm run build      # regenerate + validate data/mcqs.json
npm run build:pages  # regenerate static SEO pages + sitemap (deterministic)
npm test
```

- `.github/workflows/` runs build, lint, tests, security scan and database-integrity
  verification on every push to `main`.
- GitHub Pages deploys the static-first site (`build.yml` artifact list). Repo settings →
  Pages → deploy from branch `main` / root.
- Releases are cut with `release.yml` (`v*` tags) and publish `release/SHA256SUMS.txt`.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. Repo settings → Pages → deploy from branch `main` / root.
3. Site goes live at `https://<username>.github.io/<repo>/`.

> If you deploy under a sub-path (not the repo root domain), update the paths in `index.html`, `admin.html`, `sw.js`, `assets/` and `data/` references to match (e.g. add the repo name prefix), and update `sitemap.xml`/`robots.txt` URLs.

### Updating content

- Edit JSON files under `data/mcqs/` (or use `admin.html` → managers/Import → then **Export → Download mcqs.json** and replace `data/mcqs.json`).
- Run `node scripts/migrate-phase3.js` when adding subjects/chapters/topics to keep the taxonomy in sync.
- Run `node scripts/build-mcqs.js` to regenerate and validate the master file.
- Run `node scripts/audit.js` to re-verify everything.

## Content Policy

- 100% original questions and explanations, written specifically for this project.
- Reference sites (e.g. pakmcqs.com, testpoint.pk, mcqsdrive.com) were used **only** to learn the standard subject/paper taxonomy — no questions, text or images were copied.
- Data (categories, subjects, chapters, topics, exams) follows the standard Pakistani competitive-exam syllabus structure.

## Roadmap

- [ ] Grow the bank toward 2000+ MCQs (thin areas: Current Affairs, Agriculture & Forestry, Law)
- [ ] Static per-subject landing pages for SEO
- [ ] Print / PDF practice sheets
- [ ] Bilingual (Urdu/English) interface
- [ ] Cloud sync for bookmarks & leaderboard

## License

**License decision pending** — see `docs/phase34_documentation.json` (Phase 34 report
flags `LICENSE_REQUIRED_DECISION`). The project has not been assigned a license yet;
until a license is chosen, all rights are reserved by the author. All questions and
explanations are original content created for this project.
