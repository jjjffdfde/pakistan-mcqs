# Recommendations Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3 (Enterprise Expansion)*

## Status summary

- **Audit:** 0 FAIL / 0 WARN (docs/audit-report.md)
- **Database:** 0 orphan refs, 0 duplicates, all 147 subjects covered (docs/database-report.md)
- **Quality score:** 100.0/100 (docs/quality-score.md)
- **Performance / SEO / accessibility / categories:** see their reports
- **Phase 3 shipped:** +417 MCQs (921 → 1338), +75 subjects, +179 chapters, +358 topics, +9 exams, +1 category, references.json, subtopic filter, related questions, monthly challenge, study planner, recommended quiz, papers-as-quiz, admin subject/topic/explanation managers + AI generator + TSV import, 5 JSON-LD blocks, image/video sitemaps.

The platform is complete and release-ready for Phase 3. The items below are ordered by impact.

## 1. Static per-subject pages (SEO unlock — still #1)

- SPA hash views (`#browse`, `#practice`, ...) are not crawlable. Generate `subject/*.html` landing pages per subject with 10–15 sample MCQs + link to the SPA.
- Update `sitemap.xml` + `image-sitemap.xml` to include them. This is the single biggest organic-traffic lever, now that the bank covers 147 subjects.

## 2. Content growth (ongoing)

- Current: **1338 MCQs / 147 subjects** (~9 per subject). Target **2000+**.
- Priority subjects: Current Affairs (volatile, thin), Agriculture & Forestry (1 subject), Law & Judiciary.
- New AI Generator (admin) produces template drafts for fast, validated additions; the Explanation Manager keeps explanation depth high.

## 3. Host-level compression

- Enable **Brotli/gzip** (Cloudflare or similar): mcqs.json 1039 KB → ~230 KB. GitHub Pages alone does not compress.
- Add `Cache-Control` headers; the service worker already provides cache-first offline behavior client-side.

## 4. Code splitting & lazy bank loading

- Bank is deferred past first paint already. Next step: split `mcqs.json` by category and fetch only the needed slice in Browse/Practice once the bank exceeds ~2 MB.
- Extract dashboard/leaderboard/certificate logic into lazy modules when app.js grows past ~60 KB (currently 60.7 KB).

## 5. Feature backlog (from README roadmap)

- [x] Custom quiz builder → practice modes (normal/revision/weak/adaptive/bookmarks + negative marking)
- [x] AI study planner + AI recommended quiz (weak-topic driven)
- [x] Monthly challenge + fixed weekly tracking
- [x] Papers-as-quiz (15-question timed runs of any paper)
- [x] Admin AI question generator + TSV import (Excel/Sheets paste)
- [ ] Print / PDF practice sheets (print CSS exists for certificates; extend to practice results)
- [ ] Bilingual (Urdu/English) interface
- [ ] Backend sync (Firebase/Supabase) for cross-device bookmarks & leaderboard (currently localStorage-only)

## 6. Governance

- Commit to running `node scripts/migrate-phase3.js` (taxonomy) + `node scripts/build-mcqs.js` + `node scripts/audit.js` before every release; regenerate the 10 docs reports.
- Keep `data/mcqs.json` generated-only (never hand-edit).
- Add a CI workflow (GitHub Actions) that runs build + audit on push — prevents regressions automatically.

## 7. Minor polish

- Add `aria-label` to nav landmarks; ensure `<h1>` visible on every view.
- Focus management for the certificate modal (explicit focus trap).
- Service-worker cache busting: bump `CACHE` name in sw.js on release.

## Verdict

No blocking defects remain. Recommended sequence: CI + compression (hours) → static subject pages (weeks, biggest SEO win) → content growth (ongoing) → per-category bank sharding when scale demands it.
