/* ============================================================
   SEO Static Pages Generator — Pakistan MCQs Hub
   Reads the local SQLite DB (read-only) and emits crawlable
   static pages + sitemap for search engines:
     subjects/index.html          (subject index)
     subjects/<slug>.html         (per-subject, chapter links)
     chapters/<slug>.html         (per-chapter, topic links)
     subjects/topics/<slug>.html  (per-topic, sample MCQs) [on subjects page]
   404.html, sitemap.xml
   Usage: node scripts/gen-seo-pages.cjs
   ============================================================ */
"use strict";
const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const SITE = "https://pakistanmcqshub.github.io";

const db = new DatabaseSync(DB_PATH, { readOnly: true });

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const css = (rel) => `<link rel="stylesheet" href="${rel}">`;

const HEAD = (title, desc, canonical, extraJsonLd, cssRel) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pakistan MCQs Hub">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/img/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
${css(cssRel)}
<script type="application/ld+json">${JSON.stringify(extraJsonLd)}</script>
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${SITE}/">🎓 Pakistan MCQs Hub</a>
    <nav class="main-nav" aria-label="Main">
      <a href="${SITE}/#browse">Browse</a>
      <a href="${SITE}/#practice">Practice</a>
      <a href="${SITE}/#quiz">Quizzes</a>
      <a href="${SITE}/#papers">Past Papers</a>
      <a href="${SITE}/subjects/index.html">All Subjects</a>
    </nav>
  </div>
</header>
<main class="container">
`;

const FOOT = `</main>
<footer class="site-footer"><div class="container">
  <p>© 2026 Pakistan MCQs Hub — free original MCQs for Pakistani competitive exams.</p>
</div></footer>
</body>
</html>
`;

function pageJsonLd(breadcrumb, items) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": breadcrumb[breadcrumb.length - 1].name,
    "url": breadcrumb[breadcrumb.length - 1].item,
    "isPartOf": { "@type": "WebSite", "name": "Pakistan MCQs Hub", "url": SITE + "/" },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumb.map((b, i) => ({ "@type": "ListItem", "position": i + 1, "name": b.name, "item": b.item }))
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": items.map((it, i) => ({ "@type": "ListItem", "position": i + 1, "name": it.name, "url": it.url }))
    }
  };
}

const sitemapUrls = [];
const sitemapSeen = new Set();

function addUrl(loc, priority, changefreq) {
  if (sitemapSeen.has(loc)) return;
  sitemapSeen.add(loc);
  sitemapUrls.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-08-01</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
}

function sampleMcqs(subjectId, chapterId, topicId, n) {
  const where = [];
  const params = [];
  if (subjectId) { where.push("subject_id=?"); params.push(subjectId); }
  if (chapterId) { where.push("chapter_id=?"); params.push(chapterId); }
  if (topicId) { where.push("topic_id=?"); params.push(topicId); }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const total = db.prepare(`SELECT COUNT(*) n FROM mcqs ${w}`).get(...params).n;
  if (!total) return [];
  const offset = Math.abs(subjectId ? subjectId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 0) % Math.max(1, total - n);
  const rows = db.prepare(`SELECT id,question FROM mcqs ${w} ORDER BY rowid LIMIT ? OFFSET ?`).all(...params, n, offset);
  return rows.map((m) => {
    const opts = db.prepare("SELECT label, text FROM options WHERE mcq_id=? ORDER BY label").all(m.id);
    return { id: m.id, question: m.question, opts };
  });
}

function mcqHtml(m) {
  return `<div class="seo-mcq">
  <p class="seo-q">Q: ${esc(m.question)}</p>
  <ol class="seo-opts">
    ${m.opts.map((o) => `<li>${esc(o.label)}. ${esc(o.text)}</li>`).join("\n")}
  </ol>
  <p class="muted small">Answer revealed in practice mode.</p>
</div>`;
}

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

async function main() {
  const stats = {
    mcqs: db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n,
    subjects: db.prepare("SELECT COUNT(*) n FROM subjects WHERE status='active'").get().n,
    chapters: db.prepare("SELECT COUNT(*) n FROM chapters").get().n,
    topics: db.prepare("SELECT COUNT(*) n FROM topics").get().n
  };
  const subs = db.prepare("SELECT id,name,slug,category_id,description,exam_ids FROM subjects WHERE status='active' ORDER BY sort_order, id").all();
  const chapters = db.prepare("SELECT id,subject_id,name,slug FROM chapters ORDER BY subject_id, sort_order, id").all();
  const topics = db.prepare("SELECT id,chapter_id,name,slug FROM topics ORDER BY chapter_id, sort_order, id").all();
  const cats = db.prepare("SELECT id,name FROM categories ORDER BY sort_order, id").all();
  const bySubject = (sid) => chapters.filter((c) => c.subject_id === sid);
  const byChapter = (cid) => topics.filter((t) => t.chapter_id === cid);
  const countOf = (sql, ...p) => db.prepare(sql).get(...p).n;
  const catOf = (cid) => cats.find((c) => c.id === cid);

  /* ---------- subjects/index.html ---------- */
  const indexItems = subs.map((s) => ({ name: s.name, url: `${SITE}/subjects/${s.slug}.html` }));
  let indexBody = `<h1>All Subjects — Free MCQs for Pakistani Exams</h1>
<p class="muted">${stats.mcqs.toLocaleString()} original MCQs across ${stats.subjects} subjects, ${stats.chapters} chapters and ${stats.topics} topics. Every subject page lists its chapters and topics with practice links.</p>\n`;
  for (const c of cats) {
    const inCat = subs.filter((s) => s.category_id === c.id);
    if (!inCat.length) continue;
    indexBody += `<h2 id="cat-${esc(c.id)}">${esc(c.name)}</h2>\n<ul class="seo-list">\n`;
    for (const s of inCat) {
      const n = countOf("SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'", s.id);
      indexBody += `  <li><a href="${esc(s.slug)}.html">${esc(s.name)}</a> <span class="muted">(${n} MCQs)</span></li>\n`;
    }
    indexBody += "</ul>\n";
  }
  write(path.join(ROOT, "subjects", "index.html"), HEAD("All Subjects - Free MCQs by Subject | Pakistan MCQs Hub",
    `Browse ${stats.subjects} subjects and ${stats.topics} topics of free original MCQs for PPSC, FPSC, NTS, CSS, PMS and all Pakistani exams.`,
    `${SITE}/subjects/index.html`, pageJsonLd([{ name: "Home", item: SITE + "/" }, { name: "All Subjects", item: SITE + "/subjects/index.html" }], indexItems), "../assets/css/style.css") + indexBody + FOOT);
  addUrl(`${SITE}/subjects/index.html`, "0.9", "weekly");

  /* ---------- subjects/<slug>.html ---------- */
  for (const s of subs) {
    const chs = bySubject(s.id);
    const n = countOf("SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'", s.id);
    const title = `${s.name} MCQs - Practice Questions & Answers`;
    const desc = `Practice ${n.toLocaleString()} free original ${s.name} MCQs with explanations${s.exam_ids ? ` - ideal for ${s.exam_ids.split(",").slice(0, 5).join(", ").toUpperCase()} and more` : ""}.`;
    let body = `<h1>${esc(s.name)} MCQs</h1>
<p>${esc(s.description || "")}</p>
<p><span class="chip chip-gold">${n.toLocaleString()} MCQs</span> <span class="chip">${chs.length} chapters</span></p>
<p><a class="btn btn-primary" href="${SITE}/#browse?subject=${encodeURIComponent(s.id)}">Practice ${esc(s.name)} online →</a></p>
<h2>Chapters & Topics</h2>\n`;
    for (const c of chs) {
      const ts = byChapter(c.id);
      body += `<h3 id="ch-${esc(c.slug)}"><a href="${SITE}/chapters/${esc(c.slug)}.html">${esc(c.name)}</a></h3>\n`;
      if (ts.length) {
        body += `<ul class="seo-list">\n`;
        for (const t of ts) body += `  <li><a href="${SITE}/#browse?subject=${encodeURIComponent(s.id)}&chapter=${encodeURIComponent(c.id)}&topic=${encodeURIComponent(t.id)}">${esc(t.name)}</a></li>\n`;
        body += "</ul>\n";
      }
    }
    body += `<h2>Sample Questions</h2>\n` + sampleMcqs(s.id, null, null, 3).map(mcqHtml).join("\n");
    write(path.join(ROOT, "subjects", s.slug + ".html"), HEAD(title, desc, `${SITE}/subjects/${s.slug}.html`,
      pageJsonLd([{ name: "Home", item: SITE + "/" }, { name: "All Subjects", item: SITE + "/subjects/index.html" }, { name: s.name, item: `${SITE}/subjects/${s.slug}.html` }], chs.map((c) => ({ name: c.name, url: `${SITE}/chapters/${c.slug}.html` }))), "../assets/css/style.css") + body + FOOT);
    addUrl(`${SITE}/subjects/${s.slug}.html`, "0.8", "weekly");
  }

  /* ---------- chapters/<slug>.html ---------- */
  for (const c of chapters) {
    const s = subs.find((x) => x.id === c.subject_id);
    const ts = byChapter(c.id);
    const n = countOf("SELECT COUNT(*) n FROM mcqs WHERE chapter_id=? AND status='active'", c.id);
    const title = `${c.name} - ${s ? s.name : ""} MCQs`;
    const desc = `Practice ${n.toLocaleString()} free original MCQs on ${c.name}${s ? ` (${s.name})` : ""} with explanations for PPSC, FPSC, NTS, CSS and more.`;
    let body = `<h1>${esc(c.name)} MCQs</h1>
<p class="muted"><a href="${SITE}/subjects/index.html">All subjects</a> › <a href="${SITE}/subjects/${s ? s.slug : ""}.html">${s ? esc(s.name) : ""}</a></p>
<p><span class="chip chip-gold">${n.toLocaleString()} MCQs</span></p>
<p><a class="btn btn-primary" href="${SITE}/#browse?subject=${encodeURIComponent(c.subject_id)}&chapter=${encodeURIComponent(c.id)}">Practice this chapter online →</a></p>
<h2>Topics</h2>\n<ul class="seo-list">\n`;
    for (const t of ts) body += `  <li><a href="${SITE}/#browse?subject=${encodeURIComponent(c.subject_id)}&chapter=${encodeURIComponent(c.id)}&topic=${encodeURIComponent(t.id)}">${esc(t.name)}</a></li>\n`;
    body += "</ul>\n<h2>Sample Questions</h2>\n" + sampleMcqs(c.subject_id, c.id, null, 3).map(mcqHtml).join("\n");
    write(path.join(ROOT, "chapters", c.slug + ".html"), HEAD(title, desc, `${SITE}/chapters/${c.slug}.html`,
      pageJsonLd([{ name: "Home", item: SITE + "/" }, { name: "All Subjects", item: SITE + "/subjects/index.html" }, { name: s ? s.name : "", item: `${SITE}/subjects/${s ? s.slug : ""}.html` }, { name: c.name, item: `${SITE}/chapters/${c.slug}.html` }], ts.map((t) => ({ name: t.name, url: `${SITE}/#browse?subject=${c.subject_id}&chapter=${c.id}&topic=${t.id}` }))), "../../assets/css/style.css") + body + FOOT);
    addUrl(`${SITE}/chapters/${c.slug}.html`, "0.7", "monthly");
  }

  /* ---------- 404.html ---------- */
  write(path.join(ROOT, "404.html"), HEAD("Page not found - 404 | Pakistan MCQs Hub",
    "The page you are looking for does not exist. Browse free original MCQs for Pakistani exams.",
    SITE + "/404.html", { "@context": "https://schema.org", "@type": "WebPage", "name": "404" }, "assets/css/style.css")
    + `<h1>404 — Page not found</h1><p class="muted">The page you are looking for does not exist.</p>
<p><a class="btn btn-primary" href="${SITE}/">Back to home</a> <a class="btn btn-outline" href="${SITE}/subjects/index.html">All subjects</a></p>` + FOOT);

  /* ---------- sitemap.xml ---------- */
  addUrl(`${SITE}/`, "1.0", "daily");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapUrls.join("\n")}
</urlset>
`;
  write(path.join(ROOT, "sitemap.xml"), xml);

  console.log(`Generated ${subs.length} subject pages, ${chapters.length} chapter pages, index, 404, sitemap (${sitemapUrls.length} URLs).`);
  db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
