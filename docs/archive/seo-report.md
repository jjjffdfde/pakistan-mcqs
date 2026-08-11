# SEO Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3 (Enterprise Expansion)*

## On-page checks

| Check | Status |
|---|---|
| `<title>` tag | OK |
| Meta description | OK |
| `<html lang="en">` | OK |
| OpenGraph (title, type, url, image, description, site_name) | OK |
| Twitter cards (summary_large_image) | OK |
| Canonical URL | OK |
| JSON-LD structured data (WebSite + SearchAction + Organization) | OK |
| PWA manifest link + theme-color | OK |
| Favicon + Apple touch icon | OK |
| robots.txt (allows crawl, disallows admin.html) | OK |
| sitemap.xml with image:image entry | OK |
| og-cover.png (1200×630 real PNG, generated) | OK |

## Phase 3 additions

| Item | Status |
|---|---|
| **BreadcrumbList JSON-LD** (Home → Browse → Quizzes → Papers) | Added |
| **FAQPage JSON-LD** (6 FAQs: free use, exams covered, bank size, explanations, offline PWA, papers-as-quiz) | Added |
| **Quiz JSON-LD** (practice quizzes with numberOfQuestions + timeRequired) | Added |
| **image-sitemap.xml** (og-cover with caption, geo, license) + referenced in robots.txt | Added |
| **video-sitemap.xml** (og-cover as thumbnail + content_loc) + referenced in robots.txt | Added |
| `<link rel="preload">` for app.js, subjects.json, chapters.json, topics.json | Added |
| Meta description / OG / Twitter updated to 1300+ MCQs, 147 subjects, 38 exams | Updated |
| sitemap.xml gains video:video entry on the home URL | Updated |

All 5 JSON-LD blocks parse as valid JSON; all 3 XML sitemaps are well-formed (verified).

## Sitemap

- 8 URLs listed: `/` + hash views (hash anchors kept per prior recommendation — not indexable, harmless).
- Home URL is the priority entry with weekly change frequency; dedicated image and video sitemaps referenced from robots.txt.

## Structured data

Five `application/ld+json` blocks: `WebSite` (+SearchAction), `Organization`, `BreadcrumbList`, `FAQPage`, `Quiz`. The FAQ answers mirror real product facts (38 exams, 147 subjects, offline PWA, papers-as-quiz) so rich results match site behavior.

## Content signals

- 1338 MCQs with original questions + explanations (avg 135 chars) — strong topical depth for long-tail queries ("PPSC Assistant MCQs", "NTS GAT reasoning questions", "CSS essay topics", "MDCAT anatomy MCQs", etc.).
- 147 subjects / 400 chapters / 719 topics / 16 categories provide semantic coverage of the full Pakistani exam syllabus (incl. IT, programming, engineering, medical, management, entry tests).
- Internal linking: exam-category cards on home → browse filtered by exam; subject cards → subject browse; footer links; MCQ-level **related questions** now link between same-chapter questions (new internal link graph).

## Accessibility as SEO

- Skip link present; 4 aria-live regions; all buttons have accessible names; semantic landmarks (header/nav/main/footer); system font stack.

## Recommendations

1. **Sitemap auto-sync** — keep `sitemap.xml`, `image-sitemap.xml`, `video-sitemap.xml` and robots.txt in sync when views change.
2. **Per-topic pages** — the biggest remaining SEO win: generate static HTML pages per subject/chapter (`/subject/pakistan-affairs.html`) with curated question lists; SPA hash views are not indexable.
3. **Serving + compression** — enable Brotli/gzip for JSON (see performance report) to improve Core Web Vitals.
4. **SearchAction target** — align the JSON-LD SearchAction target with the on-site search flow (`/#browse` + in-page search box).
5. **Video schema** — only becomes truly eligible once an actual video asset exists; the video-sitemap is a placeholder shell.

## Verdict

All programmatic SEO checks pass with **0 failures**; structured-data coverage tripled in Phase 3 (5 schema types). The main missing piece remains static per-subject pages, recommended as a follow-up phase.
