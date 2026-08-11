"use strict";
/* ============================================================
   Phase 24 - Enterprise Website Modernization & Production
   Readiness Platform
   Scans EVERY page, asset, route, handler and server directly
   (no network, no external deps, deterministic). Emits the 15
   required docs + PHASE24_EXECUTION_REPORT.md.
   Usage: node scripts/phase24-platform.cjs
   ============================================================ */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "docs");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function writeReport(filename, data) {
  const p = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  console.log("  -> " + filename);
  return p;
}
function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}
function readFile(p) { try { return fs.readFileSync(p, "utf8"); } catch (e) { return null; } }
function fileSize(p) { try { return fs.statSync(p).size; } catch (e) { return 0; } }
function fileHash(p) { try { return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16); } catch (e) { return null; } }
function kb(v) { return Math.round(v / 1024); }

const startTime = Date.now();
console.log("=== Phase 24: Enterprise Website Modernization & Production Readiness Audit ===");
console.log("Started at " + ts());

/* ================================================================
   PRE-SCAN: full filesystem inventory
   ================================================================ */
const allFiles = [];
(function walk(dir, base) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === "backup") continue;
      walk(full, base);
    } else {
      allFiles.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
})(ROOT, ROOT);

const htmlFiles = allFiles.filter(f => f.endsWith(".html"));
const cssFiles = allFiles.filter(f => f.endsWith(".css"));
const jsFiles = allFiles.filter(f => f.endsWith(".js") && !f.includes("node_modules"));
const imgFiles = allFiles.filter(f => /\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i.test(f));
const subjectFiles = htmlFiles.filter(f => /^subjects\/[^/]+\.html$/.test(f));
const chapterFiles = htmlFiles.filter(f => /^chapters\/[^/]+\.html$/.test(f));
const rootHtmlFiles = htmlFiles.filter(f => /^[a-z0-9\-_]+\.html$/i.test(f) && !f.includes("/"));

const htmlContent = {};
for (const f of htmlFiles) htmlContent[f] = readFile(path.join(ROOT, f));
const pageLabels = htmlFiles.slice();

const serverJs = readFile(path.join(ROOT, "server.js")) || "";
const appJs = readFile(path.join(ROOT, "assets/js/app.js")) || "";
const adminJs = readFile(path.join(ROOT, "assets/js/admin.js")) || "";
const aiJs = readFile(path.join(ROOT, "assets/js/ai.js")) || "";
const styleCss = readFile(path.join(ROOT, "assets/css/style.css")) || "";
const swJs = readFile(path.join(ROOT, "sw.js")) || "";
const manifestContent = readFile(path.join(ROOT, "manifest.webmanifest")) || "";
const sitemapContent = readFile(path.join(ROOT, "sitemap.xml")) || "";
const sitemapLocs = [];
{
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(sitemapContent)) !== null) sitemapLocs.push(m[1]);
}
const sitemapMissing = sitemapLocs.filter(l => {
  const rel = l.replace("https://pakistanmcqshub.github.io/", "");
  return rel && !fs.existsSync(path.join(ROOT, rel));
});
const locSeen = new Set();
const sitemapDuplicates = [];
for (const loc of sitemapLocs) {
  if (locSeen.has(loc) && !sitemapDuplicates.includes(loc)) sitemapDuplicates.push(loc);
  locSeen.add(loc);
}
const publicPages = new Set(sitemapLocs.map(l => {
  const rel = l.replace("https://pakistanmcqshub.github.io/", "");
  if (!rel || rel === "index.html") return "index.html";
  return rel;
}));
const robotsContent = readFile(path.join(ROOT, "robots.txt")) || "";
const indexHtml = htmlContent["index.html"] || "";
const allJs = appJs + "\n" + adminJs + "\n" + aiJs;
const adminHtml = htmlContent["admin.html"] || "";

console.log("  Files: " + allFiles.length + " (HTML:" + htmlFiles.length + ", CSS:" + cssFiles.length + ", JS:" + jsFiles.length + ")");

function resolveRef(page, ref) {
  if (/^(https?:|mailto:|tel:|data:|#)/i.test(ref)) return null;
  const clean = ref.split("#")[0].split("?")[0];
  if (!clean) return null;
  const base = path.posix.dirname(page);
  const joined = path.posix.normalize(path.posix.join(base === "." ? "" : base, clean));
  if (joined.startsWith("..")) return null;
  return joined;
}

/* ================================================================
   GLOBAL COUNTERS (used by several steps)
   ================================================================ */
let totalButtons = 0, totalLinks = 0, totalInputs = 0, totalSelects = 0, totalLabels = 0;
let totalViews = 0, totalAiTabs = 0, totalAdminTabs = 0;
const status = {};

/* ================================================================
   STEP 1 - SITE AUDIT
   ================================================================ */
console.log("[Step 1] Site Audit");

const apiRoutes = [];
{
  const re = /pathname === "(\/api\/[^"]+)"/g;
  let m;
  while ((m = re.exec(serverJs)) !== null) apiRoutes.push(m[1]);
}

const dupHash = {};
for (const f of allFiles) {
  if (f.startsWith("database/") || f.startsWith("docs/") || f.startsWith(".claude/")) continue;
  const sz = fileSize(path.join(ROOT, f));
  if (sz > 0 && sz < 3 * 1024 * 1024) {
    const h = fileHash(path.join(ROOT, f));
    if (h) { (dupHash[h] = dupHash[h] || []).push(f); }
  }
}
const dupGroupsInScope = Object.values(dupHash).filter(a => a.length > 1);

const brokenRefs = [];
const refRe = /(?:href|src)=["']([^"']+)["']/g;
for (const page of pageLabels) {
  const html = htmlContent[page];
  if (!html) continue;
  refRe.lastIndex = 0;
  let m;
  while ((m = refRe.exec(html)) !== null) {
    const r = resolveRef(page, m[1]);
    if (!r || r.includes("/api/")) continue;
    if (!fs.existsSync(path.join(ROOT, r))) brokenRefs.push({ page, ref: m[1], resolved: r });
  }
}

const encBadPages = [];
const BAD = Buffer.from([0xef, 0xbf, 0xbd]);
for (const f of htmlFiles) {
  const b = fs.readFileSync(path.join(ROOT, f));
  const idx = b.indexOf(BAD);
  if (idx !== -1) encBadPages.push({ page: f, byteOffset: idx });
}

let noLang = 0, noViewport = 0, noTitle = 0, noDesc = 0, noCanonical = 0;
const noLangList = [], noViewportList = [], noTitleList = [], noDescList = [], noCanonicalList = [];
for (const f of pageLabels) {
  const h = htmlContent[f] || "";
  const isPublic = publicPages.has(f);
  if (!/lang=["'][a-z]{2}(-[a-z]{2})?["']/i.test(h)) { noLang++; noLangList.push(f); }
  if (!/name=["']viewport["']/i.test(h)) { noViewport++; noViewportList.push(f); }
  if (!/<title>[\s\S]*?<\/title>/i.test(h)) { noTitle++; noTitleList.push(f); }
  if (isPublic && !/name=["']description["']/i.test(h)) { noDesc++; noDescList.push(f); }
  if (isPublic && !/rel=["']canonical["']/i.test(h)) { noCanonical++; noCanonicalList.push(f); }
  totalButtons += (h.match(/<button[\s>]/gi) || []).length;
  totalLinks += (h.match(/<a\b/gi) || []).length;
  totalInputs += (h.match(/<input\b/gi) || []).length;
  totalSelects += (h.match(/<select\b/gi) || []).length;
  totalLabels += (h.match(/<label\b/gi) || []).length;
  totalViews += (h.match(/data-view=["']/gi) || []).length;
  totalAiTabs += (h.match(/data-ai-tab=/gi) || []).length;
  totalAdminTabs += (h.match(/data-tab=["']/gi) || []).length;
}

const step1 = {
  step: "site_audit",
  generated_at: ts(),
  summary: {
    total_files: allFiles.length,
    html_pages: htmlFiles.length,
    css_files: cssFiles.length,
    js_files: jsFiles.length,
    image_files: imgFiles.length,
    root_html_pages: rootHtmlFiles.length,
    subject_pages: subjectFiles.length,
    chapter_pages: chapterFiles.length,
    api_routes_defined: apiRoutes.length,
    broken_references: brokenRefs.length,
    duplicate_content_groups: dupGroupsInScope.length,
    utf8_mojibake_pages: encBadPages.length,
    pages_missing_lang: noLang,
    pages_missing_viewport: noViewport,
    pages_missing_title: noTitle,
    pages_missing_description: noDesc,
    pages_missing_canonical: noCanonical
  },
  api_routes: apiRoutes,
  broken_references: brokenRefs.slice(0, 60),
  duplicate_content_groups: dupGroupsInScope.slice(0, 20),
  encoding_issues: encBadPages.slice(0, 30),
  pages_missing_lang: noLangList.slice(0, 30),
  pages_missing_viewport: noViewportList.slice(0, 30),
  pages_missing_title: noTitleList.slice(0, 30),
  pages_missing_description: noDescList.slice(0, 30),
  pages_missing_canonical: noCanonicalList.slice(0, 30)
};
writeReport("phase24_site_audit.json", step1);
console.log("  Pages: " + step1.summary.html_pages + ", Routes: " + apiRoutes.length + ", Broken refs: " + brokenRefs.length + ", Mojibake: " + encBadPages.length);

/* ================================================================
   STEP 2 - BUTTON & FUNCTION AUDIT
   ================================================================ */
console.log("[Step 2] Button & Function Audit");
const orphanBtn = [];
const inlineScriptSrc = (html) => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  return scripts.map((s) => s.replace(/<script[^>]*>/, "").replace(/<\/script>/gi, "")).join("\n");
};
for (const f of pageLabels) {
  const html = htmlContent[f] || "";
  const searchSpace = allJs + "\n" + inlineScriptSrc(html);
  const reBtn = /<button\b([^>]*)>/gi;
  let m;
  while ((m = reBtn.exec(html)) !== null) {
    const attrs = m[1];
    const id = (attrs.match(/id=["']([^"']+)["']/) || [])[1];
    if (id) {
      const escId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const referenced = new RegExp('\\$\\("' + escId + '"\\)').test(searchSpace)
        || new RegExp('getElementById\\("' + escId + '"\\)', "g").test(searchSpace)
        || new RegExp('querySelector\\("#' + escId + '"\\)').test(searchSpace)
        || new RegExp('\\["' + escId + '\\"\\]').test(searchSpace)
        || new RegExp('id === "' + escId + '"').test(searchSpace);
      if (!referenced) orphanBtn.push({ page: f, id });
    }
  }
}
const step2 = {
  step: "buttons",
  generated_at: ts(),
  summary: {
    pages_analyzed: pageLabels.length,
    total_buttons: totalButtons,
    total_links: totalLinks,
    total_inputs: totalInputs,
    total_selects: totalSelects,
    data_view_handlers: totalViews,
    data_ai_tabs: totalAiTabs,
    data_tabs: totalAdminTabs,
    orphan_button_ids: orphanBtn.length,
    js_event_listeners_registered: (allJs.match(/addEventListener/gi) || []).length
  },
  orphan_button_ids: orphanBtn.slice(0, 50)
};
writeReport("phase24_buttons.json", step2);
console.log("  Buttons: " + totalButtons + ", Links: " + totalLinks + ", Orphan button ids: " + orphanBtn.length);

/* ================================================================
   STEP 3 - LINKS AUDIT
   ================================================================ */
console.log("[Step 3] Links Audit");
const linkCounts = { total: 0, external: 0, anchors: 0, mailto: 0, api: 0, fragment_only: 0 };
const brokenLinks = [];
const externalHosts = {};
const linkRe = /<a\b[^>]*href=["']([^"']+)["']/gi;
for (const f of pageLabels) {
  const html = htmlContent[f] || "";
  linkRe.lastIndex = 0;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    if (/^(https?:)?\/\//i.test(href)) {
      linkCounts.external++;
      const h = href.replace(/^https?:\/\//i, "").split("/")[0];
      externalHosts[h] = (externalHosts[h] || 0) + 1;
      continue;
    }
    if (/^mailto:/i.test(href)) { linkCounts.mailto++; continue; }
    if (/^data:/i.test(href)) { continue; }
    if (href === "#") { linkCounts.anchors++; continue; }
    if (href.startsWith("#")) { linkCounts.fragment_only++; continue; }
    if (href.includes("/api/")) { linkCounts.api++; continue; }
    const r = resolveRef(f, href);
    if (r === null) continue;
    linkCounts.total++;
    if (!fs.existsSync(path.join(ROOT, r))) brokenLinks.push({ page: f, href, resolved: r });
  }
}
const step3 = {
  step: "links",
  generated_at: ts(),
  summary: {
    pages_analyzed: pageLabels.length,
    internal_path_links: linkCounts.total,
    external_host_links: linkCounts.external,
    anchor_only_links: linkCounts.anchors,
    fragment_links: linkCounts.fragment_only,
    mailto_links: linkCounts.mailto,
    api_links: linkCounts.api,
    broken_internal_links: brokenLinks.length
  },
  external_hosts: Object.entries(externalHosts).sort((a, b) => b[1] - a[1]),
  broken_links: brokenLinks.slice(0, 60)
};
writeReport("phase24_links.json", step3);
console.log("  Links: " + linkCounts.total + " path + " + linkCounts.external + " external, Broken: " + brokenLinks.length);

/* ================================================================
   STEP 4 - UI DESIGN AUDIT
   ================================================================ */
console.log("[Step 4] UI Audit");
const step4 = {
  step: "ui",
  generated_at: ts(),
  summary: {
    css_variables_defined: (styleCss.match(/-{2}[a-z0-9-]+:/g) || []).length,
    dark_theme_support: /data-theme="dark"/.test(styleCss),
    smooth_scrolling: /scroll-behavior:\s*smooth/.test(styleCss),
    focus_visible_style: /:focus-visible/.test(styleCss),
    radius_tokens: (styleCss.match(/--radius/g) || []).length,
    font_stack_token: /--font:/.test(styleCss),
    shadow_tokens: /--shadow/.test(styleCss),
    gradient_usage: /linear-gradient/.test(styleCss),
    transition_rules: (styleCss.match(/transition:/g) || []).length,
    media_queries: (styleCss.match(/@media/g) || []).length,
    print_media_query: /@media print/.test(styleCss),
    reduced_motion: /prefers-reduced-motion/.test(styleCss),
    modal_component: /\.modal/.test(styleCss),
    card_component: /\.card/.test(styleCss),
    grid_layout: /display:\s*grid/.test(styleCss),
    toast_component: /\.toast/.test(allJs + styleCss),
    skip_link: /skip-link/.test(styleCss),
    dark_toggle_icon: /darkToggle/.test(appJs)
  }
};
writeReport("phase24_ui.json", step4);
console.log("  CSS vars: " + step4.summary.css_variables_defined + ", Dark theme: " + step4.summary.dark_theme_support + ", Media queries: " + step4.summary.media_queries);

/* ================================================================
   STEP 5 - RESPONSIVE AUDIT
   ================================================================ */
console.log("[Step 5] Responsive Audit");
const mediaBreakpoints = [];
{
  const re = /@media[^{]+\(\s*(?:min|max)-width:\s*([0-9.]+)(px|em|rem)/gi;
  let m;
  while ((m = re.exec(styleCss)) !== null) mediaBreakpoints.push({ rule: m[0].trim().slice(0, 40), value: m[1] + m[2] });
}
const step5 = {
  step: "responsive",
  generated_at: ts(),
  summary: {
    pages_with_viewport: htmlFiles.length - noViewport,
    breakpoints_found: mediaBreakpoints.length,
    mobile_menu_toggle: /menu-btn/.test(styleCss) && /\.main-nav\.open/.test(styleCss),
    sticky_header: /position:\s*sticky/.test(styleCss),
    fluid_container: /width:\s*min\(\s*[0-9]+px,\s*[0-9]+%\)/.test(styleCss),
    responsive_auto_fill: (styleCss.match(/repeat\(auto-fill/g) || []).length,
    responsive_auto_fit: (styleCss.match(/repeat\(auto-fit/g) || []).length
  },
  breakpoints: mediaBreakpoints
};
writeReport("phase24_responsive.json", step5);
console.log("  Breakpoints: " + mediaBreakpoints.length);

/* ================================================================
   STEP 6 - PERFORMANCE AUDIT
   ================================================================ */
console.log("[Step 6] Performance Audit");
let deployedBytes = 0;
const sizeMap = { html: 0, css: 0, js: 0, img: 0, json: 0 };
for (const f of allFiles) {
  if (f.startsWith("database/") || f.startsWith("docs/") || f.startsWith(".claude/")) continue;
  if (f.includes(".sqlite")) continue;
  if (f.endsWith(".log")) continue;
  const sz = fileSize(path.join(ROOT, f));
  deployedBytes += sz;
  if (/\.html$/.test(f)) sizeMap.html += sz;
  else if (/\.css$/.test(f)) sizeMap.css += sz;
  else if (/\.js$/.test(f)) sizeMap.js += sz;
  else if (/\.json$/.test(f)) sizeMap.json += sz;
  else if (/\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i.test(f)) sizeMap.img += sz;
}
const step6 = {
  step: "performance",
  generated_at: ts(),
  summary: {
    deployed_site_kb: kb(deployedBytes),
    html_kb: kb(sizeMap.html),
    css_kb: kb(sizeMap.css),
    js_kb: kb(sizeMap.js),
    img_kb: kb(sizeMap.img),
    json_kb: kb(sizeMap.json),
    preload_links_in_index: (indexHtml.match(/<link[^>]*rel="preload"/g) || []).length,
    single_stylesheet: cssFiles.length === 1,
    service_worker_offline: !!swJs,
    manifest_present: !!manifestContent,
    render_blocking_css_in_head: /<link[^>]*rel="stylesheet"/.test(indexHtml.split("</head>")[0]),
    inline_style_blocks_index: (indexHtml.match(/<style[\s>]/g) || []).length,
    index_html_kb: kb(fileSize(path.join(ROOT, "index.html"))),
    app_js_kb: kb(fileSize(path.join(ROOT, "assets/js/app.js"))),
    admin_js_kb: kb(fileSize(path.join(ROOT, "assets/js/admin.js"))),
    ai_js_kb: kb(fileSize(path.join(ROOT, "assets/js/ai.js"))),
    css_kb_total: kb(fileSize(path.join(ROOT, "assets/css/style.css")))
  }
};
writeReport("phase24_performance.json", step6);
console.log("  Site size: " + step6.summary.deployed_site_kb + "KB (html " + step6.summary.html_kb + "KB, js " + step6.summary.js_kb + "KB)");

/* ================================================================
   STEP 7 - ACCESSIBILITY AUDIT
   ================================================================ */
console.log("[Step 7] Accessibility Audit");
let a11yMissingAlt = 0, a11yTotalImg = 0, a11yEmptyBtn = 0;
const a11yIssuePages = [];
for (const f of pageLabels) {
  const h = htmlContent[f] || "";
  a11yTotalImg += (h.match(/<img\b/gi) || []).length;
  const noAlt = (h.match(/<img\b(?![^>]*alt=)/gi) || []).length;
  a11yMissingAlt += noAlt;
  if (noAlt) a11yIssuePages.push({ page: f, img_no_alt: noAlt });
  const emptyBtns = (h.match(/<button[^>]*>\s*<\/button>/gi) || []).length;
  a11yEmptyBtn += emptyBtns;
}
const step7 = {
  step: "accessibility",
  generated_at: ts(),
  summary: {
    pages_with_lang: htmlFiles.length - noLang,
    pages_with_viewport: htmlFiles.length - noViewport,
    skip_links_found: (styleCss.match(/skip-link/g) || []).length + (indexHtml.match(/skip-link/g) || []).length,
    total_images: a11yTotalImg,
    images_missing_alt: a11yMissingAlt,
    empty_buttons: a11yEmptyBtn,
    input_fields: totalInputs,
    label_elements: totalLabels,
    focus_visible_styles: /:focus-visible/.test(styleCss),
    dark_theme_defined: /\[data-theme="dark"\]/.test(styleCss)
  },
  issues: a11yIssuePages.slice(0, 30)
};
writeReport("phase24_accessibility.json", step7);
console.log("  Lang pages: " + step7.summary.pages_with_lang + ", Img missing alt: " + a11yMissingAlt + ", Empty buttons: " + a11yEmptyBtn);

/* ================================================================
   STEP 8 - SEO AUDIT (sitemap duplicate check)
   ================================================================ */
console.log("[Step 8] SEO Audit");
let seoMissingTitle = 0, seoMissingDesc = 0, seoMissingOg = 0, seoMissingCanonical = 0;
let jsonLdCount = 0, jsonLdValid = 0, jsonLdInvalid = 0;
const jsonLdInvalidList = [];
for (const f of pageLabels) {
  if (!publicPages.has(f)) continue;
  const h = htmlContent[f] || "";
  if (!/<title>/i.test(h)) seoMissingTitle++;
  if (!/name="description"/i.test(h)) seoMissingDesc++;
  if (!/property="og:/i.test(h)) seoMissingOg++;
  if (!/rel="canonical"/i.test(h)) seoMissingCanonical++;
  const ldRe = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let lm;
  while ((lm = ldRe.exec(h)) !== null) {
    jsonLdCount++;
    try {
      const parsed = JSON.parse(lm[1]);
      if (parsed && parsed["@type"]) jsonLdValid++;
      else throw new Error("no @type");
    } catch (e) {
      jsonLdInvalid++;
      if (jsonLdInvalidList.length < 30) jsonLdInvalidList.push({ page: f, err: e.message });
    }
  }
}
const step8 = {
  step: "seo",
  generated_at: ts(),
  summary: {
    public_pages_checked: pageLabels.filter(f => publicPages.has(f)).length,
    pages_with_title: pageLabels.filter(f => publicPages.has(f)).length - seoMissingTitle,
    pages_with_description: pageLabels.filter(f => publicPages.has(f)).length - seoMissingDesc,
    pages_with_canonical: pageLabels.filter(f => publicPages.has(f)).length - seoMissingCanonical,
    pages_with_og: pageLabels.filter(f => publicPages.has(f)).length - seoMissingOg,
    json_ld_blocks: jsonLdCount,
    json_ld_valid: jsonLdValid,
    json_ld_invalid: jsonLdInvalid,
    sitemap_urls: sitemapLocs.length,
    sitemap_duplicate_urls: sitemapDuplicates.length,
    sitemap_broken_targets: sitemapMissing.length,
    robots_exists: !!robotsContent,
    robots_has_sitemap: /Sitemap:/i.test(robotsContent),
    admin_noindexed: /noindex/.test(adminHtml)
  },
  sitemap_duplicate_urls: sitemapDuplicates,
  sitemap_broken_targets: sitemapMissing.slice(0, 30),
  json_ld_invalid_blocks: jsonLdInvalidList.slice(0, 20)
};
writeReport("phase24_seo.json", step8);
console.log("  JSON-LD: " + jsonLdValid + "/" + jsonLdCount + " valid, Sitemap URLs: " + sitemapLocs.length + ", Sitemap dupes: " + sitemapDuplicates.length);

/* ================================================================
   STEP 9 - SEARCH AUDIT
   ================================================================ */
console.log("[Step 9] Search Audit");
const step9 = {
  step: "search",
  generated_at: ts(),
  summary: {
    global_search_input: /id="\s?globalSearch"/.test(indexHtml),
    search_button: /id="searchBtn"/.test(indexHtml),
    suggestions_container: /id="searchSuggest"/.test(indexHtml),
    search_wired_click: /"searchBtn"\)\.addEventListener|\$\\("searchBtn"\\)\\.addEventListener/.test(appJs),
    search_wired_keydown: /"globalSearch"\)\.addEventListener|\$\\("globalSearch"\\)\\.addEventListener/.test(appJs),
    search_wired_suggest: /"searchSuggest"\)\.addEventListener|\$\\("searchSuggest"\\)\\.addEventListener/.test(appJs),
    fts_server_search: /\/api\/search/.test(serverJs),
    fts_sanitizer: /sanitizeFts/.test(serverJs),
    static_json_cached: /data\/mcqs\.json/.test(swJs),
    instant_search_hint: /Instant search/.test(indexHtml)
  }
};
writeReport("phase24_search.json", step9);
console.log("  Search wired: " + (step9.summary.search_wired_click && step9.summary.search_wired_keydown));

/* ================================================================
   STEP 10 - UX AUDIT
   ================================================================ */
console.log("[Step 10] UX Audit");
const step10 = {
  step: "ux",
  generated_at: ts(),
  summary: {
    theme_toggle_wired: /darkToggle.*addEventListener/.test(appJs),
    localStorage_persistence: /localStorage/.test(appJs),
    toast_feedback: /toast\(/.test(appJs),
    loading_state_aria: /aria-live="polite"/.test(indexHtml),
    empty_state_messages: (appJs.match(/No MCQs/g) || []).length,
    progress_bar_ui: /progress-fill/.test(styleCss),
    keyboard_focus_visible: /:focus-visible/.test(styleCss),
    skip_to_content: /skip-link/.test(indexHtml),
    qotd_interactive: /qotdReveal|qotdOptions/.test(appJs),
    responsive_menu_toggle: /menuToggle/.test(appJs),
    offline_pwa: !!swJs,
    printable_certificate: /@media print/.test(styleCss),
    ai_coach_tabs: totalAiTabs > 0
  }
};
writeReport("phase24_ux.json", step10);
console.log("  Theme toggle: " + step10.summary.theme_toggle_wired + ", Empty states: " + step10.summary.empty_state_messages);

/* ================================================================
   STEP 11 - ADMIN DASHBOARD AUDIT
   ================================================================ */
console.log("[Step 11] Admin Dashboard Audit");
const adminHooks = {
  stats_dashboard: /adminStats/.test(adminJs),
  search_mcqs: /admSearch/.test(adminJs),
  add_category: /catAdd/.test(adminJs),
  add_subject: /subjAdd/.test(adminJs),
  add_topic: /topAdd/.test(adminJs),
  enrich_explanations: /expEnrich/.test(adminJs),
  generate_drafts: /genRun/.test(adminJs),
  image_library: /imgAdd/.test(adminJs),
  import_run: /impRun/.test(adminJs),
  duplicate_scan: /dupRemoveAll/.test(adminJs),
  export_json: /expJson/.test(adminJs),
  export_csv: /expCsv/.test(adminJs),
  export_categories: /expCategories/.test(adminJs),
  export_subjects: /expSubjects/.test(adminJs),
  export_topics: /expTopics/.test(adminJs),
  reset_data: /expReset/.test(adminJs),
  tabs_wired: /data-tab|tab=/.test(adminJs),
  page_noindex: /noindex/.test(adminHtml)
};
const step11 = {
  step: "admin",
  generated_at: ts(),
  summary: {
    admin_page_exists: !!adminHtml,
    admin_panel_sections: (adminHtml.match(/<section id="tab-[^"]+"/g) || []).length,
    features_wired: Object.values(adminHooks).filter(Boolean).length,
    features_planned: Object.keys(adminHooks).length,
    feature_coverage_pct: Math.round(Object.values(adminHooks).filter(Boolean).length / Object.keys(adminHooks).length * 100),
    page_noindexed: adminHooks.page_noindex
  },
  feature_hooks: adminHooks
};
writeReport("phase24_admin.json", step11);
console.log("  Admin features: " + step11.summary.features_wired + "/" + step11.summary.features_planned);

/* ================================================================
   STEP 12 - SECURITY AUDIT
   ================================================================ */
console.log("[Step 12] Security Audit");
const exposedDb = allFiles.filter(f => /\.sqlite(wal|shm)?$/.test(f));
const logFilesInRoot = allFiles.filter(f => /\.log$/.test(f));
const step12 = {
  step: "security",
  generated_at: ts(),
  summary: {
    prepared_statement_usage: (serverJs.match(/prepare\(/g) || []).length,
    placeholder_params: (serverJs.match(/\?/g) || []).length,
    x_frame_options: /X-Frame-Options|frame-ancestors/.test(serverJs),
    content_security_policy: /Content-Security-Policy/.test(serverJs),
    strict_transport_security: /Strict-Transport-Security/.test(serverJs),
    referrer_policy: /Referrer-Policy/.test(serverJs),
    x_content_type_options: /X-Content-Type-Options/.test(serverJs),
    rate_limiting: /rateLimit|rate_limit/.test(serverJs),
    csrf_protection: /csrf|CSRF/.test(serverJs),
    exposed_database_files: exposedDb.length,
    body_size_guard: /maxBody|MAX_BODY|bodySize/.test(serverJs),
    input_validation_helpers: /sanitize|parseInt|math\.min\(200|slice\(0, 200/.test(serverJs),
    sql_injection_literal_concat: (serverJs.match(/\$\{[^}]+\}/g) || []).length,
    log_files_in_root: logFilesInRoot.length,
    csp_meta_tag: /Content-Security-Policy/.test(indexHtml),
    security_txt_exists: fs.existsSync(path.join(ROOT, ".well-known", "security.txt"))
  },
  exposed_database_files: exposedDb,
  root_log_files: logFilesInRoot,
  recommendations: [
    "Keep production sqlite outside static web root (serve via /api only)",
    "Add security headers (X-Frame-Options, Content-Security-Policy, HSTS) to server responses",
    "Add rate-limiting and input-size guards to configurable endpoints"
  ]
};
writeReport("phase24_security.json", step12);
console.log("  Exposed db files: " + exposedDb.length + ", CSP: " + step12.summary.content_security_policy + ", rate limiting: " + step12.summary.rate_limiting);

/* ================================================================
   STEP 13 - VALIDATION (cross-data integrity vs production sqlite)
   ================================================================ */
console.log("[Step 13] Validation");
let dbStats = {};
{
  const { DatabaseSync } = require("node:sqlite");
  let db = null;
  try {
    db = new DatabaseSync(path.join(ROOT, "db", "pakistan-mcqs.sqlite"), { readOnly: true });
    dbStats = {
      mcqs: db.prepare("SELECT COUNT(*) n FROM mcqs").get().n,
      mcqs_active: db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n,
      subjects: db.prepare("SELECT COUNT(*) n FROM subjects").get().n,
      chapters: db.prepare("SELECT COUNT(*) n FROM chapters").get().n,
      topics: db.prepare("SELECT COUNT(*) n FROM topics").get().n,
      options: db.prepare("SELECT COUNT(*) n FROM options").get().n,
      bookmarks: db.prepare("SELECT COUNT(*) n FROM bookmarks").get().n,
      history: db.prepare("SELECT COUNT(*) n FROM history").get().n,
      categories: db.prepare("SELECT COUNT(*) n FROM categories").get().n
    };
  } catch (e) {
    dbStats = { error: e.message };
  } finally {
    if (db) db.close();
  }
}

let subjectsDb = [], chaptersDb = [];
{
  const { DatabaseSync } = require("node:sqlite");
  let db = null;
  try {
    db = new DatabaseSync(path.join(ROOT, "db", "pakistan-mcqs.sqlite"), { readOnly: true });
    subjectsDb = db.prepare("SELECT slug FROM subjects WHERE status='active'").all().map(r => r.slug);
    chaptersDb = db.prepare("SELECT slug FROM chapters").all().map(r => r.slug);
  } catch (e) {} finally { if (db) db.close(); }
}

let dataJsonParseErrors = [];
let staticMcqCount = 0;
for (const jf of ["data/subjects.json", "data/chapters.json", "data/topics.json", "data/mcqs.json", "data/categories.json", "data/exams.json", "data/papers.json", "data/quizzes.json", "data/mock_tests.json", "data/programs.json", "data/references.json"]) {
  if (!fs.existsSync(path.join(ROOT, jf))) continue;
  const c = readFile(path.join(ROOT, jf));
  try { const parsed = JSON.parse(c); if (jf === "data/mcqs.json") staticMcqCount = Array.isArray(parsed) ? parsed.length : 0; } catch (e) { dataJsonParseErrors.push({ file: jf, err: e.message }); }
}

const subjectPages = subjectFiles.filter(f => !f.endsWith("/index.html")).map(f => f.replace(/^subjects\//, "").replace(/\.html$/, ""));
const chapterPages = chapterFiles.map(f => f.replace(/^chapters\//, "").replace(/\.html$/, ""));
const subjectSlugMiss = subjectsDb.filter(s => !subjectPages.includes(s));
const subjectPageExtra = subjectPages.filter(s => !subjectsDb.includes(s));
const chapterSlugMiss = [...new Set(chaptersDb)].filter(s => !chapterPages.includes(s));
const chapterPageExtra = chapterPages.filter(s => !new Set(chaptersDb).has(s));

const step14 = {
  step: "validation",
  generated_at: ts(),
  summary: {
    db_readable: !!dbStats.mcqs,
    db_mcqs_total: dbStats.mcqs || 0,
    db_mcqs_active: dbStats.mcqs_active || 0,
    static_mcqs_in_data: staticMcqCount,
    subject_pages: subjectPages.length,
    chapter_pages: chapterPages.length,
    subject_pages_missing_from_db: subjectSlugMiss.length,
    subject_db_slugs_without_page: subjectPageExtra.length,
    dup_chapter_slugs_in_db: chaptersDb.length - new Set(chaptersDb).size,
    chapter_db_slugs_without_page: chapterSlugMiss.length,
    chapter_pages_not_in_db: chapterPageExtra.length,
    json_data_parse_errors: dataJsonParseErrors.length,
    sitemap_targets_missing: sitemapMissing.length,
    broken_references: brokenRefs.length,
    broken_internal_links: brokenLinks.length
  },
  db_counts: dbStats,
  json_parse_errors: dataJsonParseErrors.slice(0, 20),
  subject_slug_mismatch: { missing_page: subjectSlugMiss.slice(0, 20), extra_page: subjectPageExtra.slice(0, 20) },
  chapter_slug_mismatch: { missing_page: chapterSlugMiss.slice(0, 20), extra_page: chapterPageExtra.slice(0, 20) },
  sitemap_missing_targets: sitemapMissing.slice(0, 30)
};
writeReport("phase24_validation.json", step14);
console.log("  DB mcqs: " + (dbStats.mcqs || "n/a") + ", JSON data errors: " + dataJsonParseErrors.length
  + ", dup chapter slugs: " + (chaptersDb.length - new Set(chaptersDb).size));

/* ================================================================
   STEP 14 - STATISTICS
   ================================================================ */
console.log("[Step 14] Statistics");
const step15 = {
  step: "statistics",
  generated_at: ts(),
  summary: {
    total_files: allFiles.length,
    html_pages: htmlFiles.length,
    subjects: subjectFiles.length,
    chapters: chapterFiles.length,
    api_routes: apiRoutes.length,
    deployed_site_kb: kb(deployedBytes),
    css_vars: (styleCss.match(/-{2}[a-z0-9-]+:/g) || []).length,
    js_lines_app: appJs.split("\n").length,
    js_lines_admin: adminJs.split("\n").length,
    js_lines_ai: aiJs.split("\n").length,
    css_lines: styleCss.split("\n").length,
    server_lines: serverJs.split("\n").length,
    json_ld_blocks: jsonLdCount,
    total_anchors: linkCounts.total + linkCounts.external + linkCounts.fragment_only + linkCounts.anchors + linkCounts.mailto,
    db_mcqs_active: dbStats.mcqs_active || 0
  },
  db: dbStats
};
writeReport("phase24_statistics.json", step15);
console.log("  Pages/Subjects/Chapters: " + htmlFiles.length + "/" + subjectFiles.length + "/" + chapterFiles.length);

/* ================================================================
   STEP 15 - SUMMARY
   ================================================================ */
console.log("[Step 15] Summary");
const issues = [];
const addIssue = (sev, cat, title, detail) => issues.push({ severity: sev, category: cat, title, detail });

if (encBadPages.length) addIssue("Critical", "Encoding", "UTF-8 replacement char in HTML", encBadPages.length + " page(s) contain U+FFFD");
if (brokenRefs.length) addIssue("Critical", "Integrity", "Broken referenced files", brokenRefs.length + " href/src targets do not exist");
if (brokenLinks.length) addIssue("High", "Navigation", "Broken internal links", brokenLinks.length + " anchors point to missing files");
if (orphanBtn.length) addIssue("High", "Buttons", "Orphan button handler ids", orphanBtn.length + " <button id> not referenced in JS");
if (sitemapDuplicates.length) addIssue("High", "SEO", "Duplicate sitemap URLs", sitemapDuplicates.length + " duplicate <loc> entries");
if (sitemapMissing.length) addIssue("High", "SEO", "Sitemap points to missing files", sitemapMissing.length + " targets");
if (noDesc > 0) addIssue("Medium", "SEO", "Pages missing meta description", noDesc + " pages");
if (jsonLdInvalid > 0) addIssue("Medium", "SEO", "Invalid JSON-LD blocks", jsonLdInvalid + " blocks fail to parse");
if (noCanonical > 0) addIssue("Low", "SEO", "Pages missing canonical", noCanonical + " pages");
if (noLang > 0) addIssue("Low", "Accessibility", "Pages missing lang attribute", noLang + " pages");
if (subjectSlugMiss.length) addIssue("Medium", "Content", "Subject pages missing", subjectSlugMiss.length + " DB subjects have no page");
if (dataJsonParseErrors.length) addIssue("Critical", "Data Integrity", "Invalid JSON in data/", dataJsonParseErrors.length + " files");

const crtIssues = issues.filter(i => i.severity === "Critical").length;
const highIssues = issues.filter(i => i.severity === "High").length;
const medIssues = issues.filter(i => i.severity === "Medium").length;
const lowIssues = issues.filter(i => i.severity === "Low").length;

const step16 = {
  step: "summary",
  generated_at: ts(),
  status: issues.length ? "FixesRequired" : "Clean",
  verdict: {
    clean: issues.length === 0,
    fixes_requested: issues.length,
    summary_score: Math.round(100 - issues.length * 0.5)
  },
  summary: {
    pages_scanned: htmlFiles.length,
    critical: crtIssues,
    high: highIssues,
    medium: medIssues,
    low: lowIssues,
    total_issues: issues.length,
    broken_references: brokenRefs.length,
    broken_links: brokenLinks.length,
    sitemap_duplicates: sitemapDuplicates.length,
    orphan_buttons: orphanBtn.length,
    json_ld_valid_ratio: jsonLdValid + "/" + jsonLdCount,
    mojibake_pages: encBadPages.length
  },
  issues
};
writeReport("phase24_summary.json", step16);
console.log("  Issues: " + crtIssues + "C / " + highIssues + "H / " + medIssues + "M / " + lowIssues + "L");

/* Markdown execution report */
const totalDuration = Date.now() - startTime;
const md = `# Phase 24 - Enterprise Website Modernization & Production Readiness Platform

**Generated:** ${ts()}
**Duration:** ${totalDuration}ms (${Math.round(totalDuration / 1000 * 100) / 100}s)
**Status:** ${step16.status}

## Run Summary

| Metric | Value |
|--------|-------|
| Pages Scanned | ${htmlFiles.length} |
| Subjects / Chapters | ${subjectFiles.length} / ${chapterFiles.length} |
| API Routes Defined | ${apiRoutes.length} |
| Broken References | ${brokenRefs.length} |
| Broken Links | ${brokenLinks.length} |
| Sitemap Duplicates | ${sitemapDuplicates.length} |
| Orphaned Button Handlers | ${orphanBtn.length} |
| JSON-LD Blocks (valid) | ${jsonLdValid}/${jsonLdCount} |
| UTF-8 Mojibake Pages | ${encBadPages.length} |

## Issues

| Severity | Count |
|----------|-------|
| Critical | ${crtIssues} |
| High | ${highIssues} |
| Medium | ${medIssues} |
| Low | ${lowIssues} |

${issues.map(i => "- **" + i.severity + "** · " + i.title + " — " + i.detail).join("\n") || "No issues found."}

## Fixes to apply

${issues.map(i => "- " + i.title + " (" + i.category + ")").join("\n") || "None"}

## Files Generated

1. docs/phase24_site_audit.json
2. docs/phase24_buttons.json
3. docs/phase24_links.json
4. docs/phase24_ui.json
5. docs/phase24_responsive.json
6. docs/phase24_performance.json
7. docs/phase24_accessibility.json
8. docs/phase24_seo.json
9. docs/phase24_search.json
10. docs/phase24_ux.json
11. docs/phase24_admin.json
12. docs/phase24_security.json
13. docs/phase24_validation.json
14. docs/phase24_statistics.json
15. docs/phase24_summary.json
`;

fs.writeFileSync(path.join(REPORTS_DIR, "PHASE24_EXECUTION_REPORT.md"), md, "utf8");
console.log("  -> PHASE24_EXECUTION_REPORT.md");
console.log("\nPhase 24 audit complete. Time: " + totalDuration + "ms");
