# performance report

Performance Report — 2026-08-02
| Asset | Size |
| --- | --- |
| index.html | 24.7 KB |
| assets/js/app.js | 88.3 KB |
| assets/css/style.css | 20.0 KB |
| data/mcqs.json | 1038.8 KB |
| data/subjects.json | 50.3 KB |
| SW cache version | pmh-cache-v9 |
| DB-mode boot payload | taxonomy only (mcqs.json skipped) |
| Static-mode boot | mcqs.json fetched in parallel with taxonomy |
| Pagination | windowed — constant DOM nodes regardless of bank size |
| Indexes for 1M | composite (subject/chapter/topic,status), options(mcq_id,label), history(device_id,answered_at) |
