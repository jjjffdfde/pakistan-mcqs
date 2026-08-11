# Performance Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3 (post-migration, 1338 MCQs)*

## Summary

| Metric | Value | Verdict |
|---|---|---|
| Total site weight (data + assets) | ~1.48 MB | Good for a static, offline-capable site |
| First-paint path (light data, no bank) | ~270 KB | Excellent — home renders before mcqs.json arrives |
| Heavy data (mcqs.json) | 1039 KB | Deferred until after first render |
| app.js | 60.7 KB (unminified, uncompressed) | Acceptable; ~15 KB gzipped |
| style.css | 17.6 KB | Acceptable |
| Data files | 13 (incl. references.json) | Split by entity, loaded in parallel |
| Web fonts | 0 (system stack) | No font-fetch blocking |
| Media queries | 3 (mobile/tablet/desktop) | Responsive |

## Payload breakdown (Phase 3)

| File | Size |
|---|---|
| mcqs.json | 1039 KB |
| topics.json | 113.3 KB |
| chapters.json | 66.2 KB |
| subjects.json | 50.3 KB |
| papers.json | 18.2 KB |
| quizzes.json | 8.6 KB |
| exams.json | 9.5 KB |
| categories.json | 7.7 KB |
| references.json | 2.5 KB |
| programs.json | 3.2 KB |
| mock_tests.json | 2.8 KB |
| app.js | 60.7 KB |
| style.css | 17.6 KB |
| og-cover.png | 3.2 KB |

## Optimizations applied

1. **Progressive loading** — `app.js` fetches the light JSON files in parallel, renders the home view immediately, and only then loads the master bank (`loadAll()`). Browse/practice/quiz views re-render once the bank arrives.
2. **Parallel fetches** — all data loaded via a single `Promise.all`; no waterfall.
3. **Preload hints (Phase 3)** — `<link rel="preload" as="fetch">` for `subjects.json`, `chapters.json`, `topics.json` + `preload` of `app.js` shaves a round-trip off the first-paint path.
4. **No web fonts** — system font stack eliminates render-blocking font loads.
5. **Service worker** (`sw.js`) — cache-first strategy for data, HTML and assets; instant second-visit loads and full offline support.
6. **PWA manifest** — installable app; SVG icon kept inline as a data URL (no extra request).
7. **Single shared CSS** — no per-view stylesheet requests.
8. **Deferred service-worker registration** — registered on `window.load` so it never competes with first paint.

## Phase 3 cost analysis

- The bank grew 921 → **1338 MCQs** (+45%): `mcqs.json` grew 703 → **1039 KB**. The lazy-load architecture absorbs this without hurting first paint; browse/practice/quiz interactivity happens after the bank arrives (typically <1s on broadband, cached offline afterwards).
- New related-questions lookup is O(n) over the loaded bank at render time — negligible (1338 items, array indexed per render).

## Further recommendations

- **Gzip/Brotli** — enable compression on the host (GitHub Pages does not); mcqs.json would drop from 1039 KB to ~230 KB.
- **Shard the bank** — split `mcqs.json` by subject/category and lazy-load per view once the bank exceeds ~2 MB.
- **Code splitting** — app.js is a single 60.7 KB file; extract dashboard/leaderboard into lazy modules if it grows further.
- **Brotli-compressed JSON variants** — serve `mcqs.json.br` with a `Content-Encoding` rule for slow devices.

## Verdict

Performance remains **strong**: first paint does not depend on the 1 MB bank, all fetches are parallel, preload hints are in place, and offline caching is intact. No blocking issues; the only meaningful wins left require host-level compression.
