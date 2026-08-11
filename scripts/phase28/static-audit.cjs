/* ============================================================
   Phase 28 - Static site audit (no browser required)
   Steps: 1 inventory, 2 links, 3 buttons(static), 4 forms(static),
   10 navigation, 13 accessibility, 14 assets, 15 storage(static),
   18 security(static).
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const S = require("./shared.cjs");

const ROOT = path.join(__dirname, "..", "..");
const DOCS = path.join(ROOT, "docs");
const CHROME_LS_RE = /(?:localStorage|sessionStorage)\.(get|set|remove)Item\(\s*["']([^"']+)["']/g;
const LS_KEYS = new Set();
const INNER_HTML_RE = /(\w+)(?:\.innerHTML\s*=\s*)/g;

function read(p) { return fs.readFileSync(p, "utf8"); }

/* ---------------------------------------------------------- */
/* JS global analysis per page (scripts + inline)             */
/* ---------------------------------------------------------- */
function jsFor(pageSrc, pagePath) {
  const srcs = [];
  let inline = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(pageSrc)) !== null) {
    const attrs = m[1] || "";
    const srcM = /src\s*=\s*["']([^"']+)["']/.exec(attrs);
    if (srcM) srcs.push(srcM[1]);
    else if (m[2].trim()) inline.push(m[2]);
  }
  const globals = new Set();
  const handlers = [];
  const files = [];
  for (const s of srcs) {
    const local = S.resolveLocal(decodeURIComponent(s.replace(/^\.\//, "")), ROOT);
    if (!local) { files.push({ file: s, exists: false }); continue; }
    files.push({ file: s, exists: true });
    const js = read(local);
    const g = S.extractGlobals(js);
    g.globals.forEach((x) => globals.add(x));
    g.handlerCalls.forEach((h) => handlers.push(h));
    let lm;
    while ((lm = CHROME_LS_RE.exec(js)) !== null) LS_KEYS.add(lm[2]);
  }
  for (const js of inline) {
    const g = S.extractGlobals(js);
    g.globals.forEach((x) => globals.add(x));
    g.handlerCalls.forEach((h) => handlers.push(h));
  }
  return { srcs: files, inlineCount: inline.length, globals, handlers };
}

/* ---------------------------------------------------------- */
/* STEP 2 - link audit                                          */
/* ---------------------------------------------------------- */
function auditLinks() {
  const report = { step: 2, generated_at: "", totals: {}, links: [], by_status: {} };
  const pages = S.htmlFiles(ROOT);
  let status = {};
  for (const page of pages) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    const pageDir = page.includes("/") ? page.slice(0, page.lastIndexOf("/")) : "";
    const base = pageDir ? pageDir + "/" : "";
    const seen = new Set();
    for (const t of tags) {
      if (t.name !== "a" || t.isClose || t.isComment) continue;
      const href = t.attrs.href;
      const text = inlineText(src, t, "button");
      const key = href + "|" + t.line;
      if (seen.has(key)) continue;
      seen.add(key);
      const u = S.resolveUrl(href, base + page.replace(/^.*\//, ""), base);
      let cls = "PASS", note = "";
      if (u.kind === "internal") {
        const [filePart] = u.path.split("#");
        const exists = S.resolveLocal(filePart, ROOT);
        if (!exists) { cls = "BROKEN"; note = "target file missing: " + filePart; }
        else if (u.hash && !/^(browse|practice|quiz|papers|dashboard|leaderboard|bookmarks|home|ai-coach|search|main)$/.test(u.hash.split("?")[0])) {
          const pageSrc = read(path.join(ROOT, filePart));
          const hasId = pageSrc.includes('id="' + u.hash.split("?")[0] + '"');
          if (!hasId && !/^browse\?/.test(u.hash)) { cls = "REVIEW"; note = "anchor #" + u.hash.split("?")[0] + " not found as element id on target page (may be SPA route)"; }
          else note = "hash/target ok";
        } else { cls = "PASS"; note = "target exists"; }
        if (/^browse\?/.test(u.hash) || /^(browse|practice|quiz|papers|dashboard|leaderboard|bookmarks|home|ai-coach)$/.test(u.hash.split("?")[0])) note = "SPA route target";
      } else if (u.kind === "external") {
        cls = "EXTERNAL";
        if (u.host === S.SITE_HOST) {
          const [filePart] = u.path.split("#");
          if (S.resolveLocal(filePart, ROOT)) { cls = "PASS"; note = "external-to-self path exists locally"; }
          else { cls = "BROKEN"; note = "self-hosted external path missing locally: " + filePart; }
        } else {
          note = "off-site link to " + u.host + " (not fetched - offline audit)";
        }
      } else if (u.kind === "anchor") {
        cls = "REVIEW"; note = "in-page anchor #" + u.target + " checked by runtime";
      } else if (u.kind === "empty" || u.kind === "missing") { cls = "REVIEW"; note = "empty href"; }
      else if (u.kind === "javascript" && /void\(?0?\)?/.test(u.raw || "")) { cls = "REVIEW"; note = "javascript:void(0) placeholder"; }
      else if (u.kind === "hash-only") { cls = "REVIEW"; note = "href=# (self link)"; }
      else { cls = "REVIEW"; note = u.kind; }
      status[cls] = (status[cls] || 0) + 1;
      report.links.push({
        page, line: t.line, href: String(href || "").slice(0, 160), text: text.slice(0, 60),
        kind: u.kind, target: u.kind === "internal" || (u.kind === "external" && u.host === S.SITE_HOST) ? u.path : "", host: u.host || "",
        status: cls, note: note.slice(0, 140)
      });
    }
  }
  report.totals = status;
  report.total_links = report.links.length;
  return report;
}

/* ---------- inline text of element (between open and matching close) ---------- */
function inlineText(src, openTag, closeTag) {
  const after = src.slice(openTag.end);
  const m = after.match(new RegExp("</" + (closeTag || openTag.name) + "\\s*>", "i"));
  if (!m) return "";
  return after.slice(0, m.index).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/* ---------------------------------------------------------- */
/* STEP 1+3 - buttons & interactive inventory                  */
/* ---------------------------------------------------------- */
function auditInteractive() {
  const pages = S.htmlFiles(ROOT);
  const interactive = [];
  const perPage = [];
  const tot = { pages: pages.length, buttons: 0, links: 0, forms: 0, inputs: 0, selects: 0 };
  for (const page of pathsForDetail()) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    const js = jsFor(src, page);
    const counts = { buttons: 0, links: 0, forms: 0, inputs: 0, selects: 0, modals: 0, tabs: 0, accordions: 0 };
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "button") {
        counts.buttons++;
        const id = t.attrs.id;
        const onclick = t.attrs.onclick;
        const dataView = t.attrs["data-view"];
        const cls = (t.attrs.class || "").split(/\s+/).filter(Boolean);
        const text = inlineText(src, t, "button").slice(0, 50);
        let handler = "", hStatus = "", hNote = "";
        if (onclick) {
          handler = "inline:" + onclick.slice(0, 80);
          const names = S.extractInlineHandlerNames(onclick);
          const missing = names.filter((n) => !js.globals.has(n) && !/^(this|event|window|document|void|return|false|true)$/.test(n));
          if (missing.length) { hStatus = "BROKEN_HANDLER"; hNote = "undefined: " + missing.join(","); }
          else { hStatus = "BOUND"; hNote = "inline handler"; }
        } else if (id && js.handlers.some((h) => h.handler === "()" )) {
          hStatus = "UNKNOWN"; hNote = "";
        } else if (id && jsSrcOf(page).includes('"' + id + '"')) {
          hStatus = "BOUND"; hNote = "id referenced in JS";
        } else if (dataView) {
          const path1 = String(dataView).split("?")[0];
          const routes = ["home", "browse", "practice", "quiz", "papers", "dashboard", "leaderboard", "bookmarks", "ai-coach", "search"];
          if (routes.includes(path1)) {
            const coveredByDelegation =
              (cls.includes("nav-link")) ||
              /querySelector(?:All)?\(["'][^"']*\[data-view\]/.test(jsSrcOf(page)) ||
              /document\.addEventListener\(["']click["'][^;]*data-view/.test(jsSrcOf(page));
            if (coveredByDelegation) { hStatus = "BOUND"; hNote = "data-view delegation"; }
            else { hStatus = "UNBOUND"; hNote = "data-view=" + dataView + " but no generic [data-view] delegation found (only .nav-link[data-view])"; }
          } else { hStatus = "UNKNOWN"; hNote = "data-view route not recognized"; }
        } else if (cls.some((c) => jsSrcOf(page).includes("." + c))) {
          hStatus = "PROBABLE"; hNote = "class referenced in JS";
        } else if (t.parents.some((p) => p.classes.some((c) => jsSrcOf(page).includes("." + c)))) {
          hStatus = "BOUND"; hNote = "container-based delegation (.admin-tabs etc.)";
        } else if (cls.includes("install-btn") || id === "installBtn" || cls.includes("chip")) {
          hStatus = "BOUND"; hNote = "pwa dynamic control";
        } else {
          hStatus = "UNBOUND"; hNote = "no handler reference found";
        }
        interactive.push({ element_id: id || "", page, type: "button", text, href: "", onclick: onclick || "",
          event_handler: handler || "addEventListener", target: "", source_file: page, line_number: t.line,
          expected_function: "", status: hStatus, note: hNote.slice(0, 120) });
      } else if (t.name === "a") {
        counts.links++;
      } else if (t.name === "form") { counts.forms++; }
      else if (t.name === "input") { counts.inputs++; }
      else if (t.name === "select") { counts.selects++; }
      else if (t.name === "textarea") { counts.inputs++; }
      else if (t.name === "connect") { counts.inputs++; }
      if (t.attrs && /(^|\s)modal($|\s)/.test(t.attrs.class || "")) counts.modals++;
      if (t.attrs && /(^|\s)ai-tab($|\s)/.test(t.attrs.class || "")) counts.tabs++;
      if (t.name === "details") counts.accordions++;
    }
    for (const k of Object.keys(counts)) tot[k] = (tot[k] || 0) + counts[k];
    perPage.push({ page, ...counts });
  }
  return { interactive, perPage, tot };
}

/* pages inventoried element-by-element (core + sample) */
function pathsForDetail() {
  const core = ["index.html", "admin.html", "404.html", "offline.html", "subjects/index.html"];
  const all = S.htmlFiles(ROOT);
  const rest = all.filter((p) => !core.includes(p) && !/^android\//.test(p) && !/^desktop\//.test(p));
  const step = Math.max(1, Math.floor(rest.length / 40));
  return core.concat(rest.filter((_, i) => i % step === 0));
}

const jsCache = {};
function jsSrcOf(page) {
  if (jsCache[page]) return jsCache[page];
  const src = read(path.join(ROOT, page));
  let js = "";
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const attrs = m[1] || "";
    const srcM = /src\s*=\s*["']([^"']+)["']/.exec(attrs);
    if (srcM) { const p = S.resolveLocal(decodeURIComponent(srcM[1]).replace(/^\.\//, ""), ROOT); if (p) js += "\n" + read(p); }
    else js += "\n" + m[2];
  }
  jsCache[page] = js;
  return js;
}

/* ---------------------------------------------------------- */
/* STEP 4 static - forms                                      */
/* ---------------------------------------------------------- */
function auditFormsStatic() {
  const report = { step: 4, total_forms: 0, forms: [] };
  for (const page of pathsForDetail()) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    let inForm = null;
    const inputs = [];
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "form") {
        if (inForm) { report.forms.push({ page, ...inputs, form: inForm }); inputs.length = 0; }
        inForm = { action: t.attrs.action || "", method: (t.attrs.method || "get").toLowerCase(), has_id: !!t.attrs.id, id: t.attrs.id || "" };
        report.total_forms++;
        continue;
      }
      if (!inForm && ["input", "select", "textarea", "button", "label"].includes(t.name)) {
        report.forms.push({ page, form: null, control: { tag: t.name, id: t.attrs.id || "", type: t.attrs.type || "", required: t.attrs.required !== undefined, name: t.attrs.name || "" } });
        continue;
      }
      evidence: if (inForm && ["input", "select", "textarea", "button"].includes(t.name)) {
        inputs.push({ tag: t.name, id: t.attrs.id || "", name: t.attrs.name || "", type: t.attrs.type || "",
          required: t.attrs.required !== undefined, minlength: t.attrs.minlength || null, maxlength: t.attrs.maxlength || null });
        break evidence;
      } else if (t.name === "form" && t.isClose === false) {
        inForm = null;
      }
    }
    if (inForm) report.forms.push({ page, ...Object.assign({}, ...inputs.map((x) => ({ [x.tag + ":" + x.id]: x }))), form: inForm });
  }
  return report;
}

/* ---------------------------------------------------------- */
/* STEP 13 accessibility (static)                             */
/* ---------------------------------------------------------- */
function auditAccessibility() {
  const report = { step: 13, pages_checked: 0, checks: [], totals: {} };
  const all = S.htmlFiles(ROOT);
  const core = ["index.html", "admin.html", "404.html", "offline.html", "subjects/index.html"];
  const rest = all.filter((p) => !core.includes(p) && !/^android\//.test(p) && !/^desktop\//.test(p));
  const step = Math.max(1, Math.floor(rest.length / 60));
  const pages = core.concat(rest.filter((_, i) => i % step === 0));
  report.pages_checked = pages.length;
  const tot = { imgs_no_alt: 0, inputs_no_label: 0, buttons_no_name: 0, heading_jumps: 0, missing_skip_link: 0 };
  for (const page of pages) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    const issues = [];
    let lastH = 1;
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "img" && !t.attrs.alt && src.slice(Math.max(0, t.col - 20), t.col).match(/<img/)) {
        issues.push({ type: "img_no_alt", line: t.line, detail: "src=" + (t.attrs.src || "").slice(0, 60) });
      }
      if (t.name === "input" && !/^(hidden|submit|button|reset|image)$/.test(t.attrs.type || "text")) {
        const id = t.attrs.id;
        const wrapped = src.slice(Math.max(0, t.index - 400), t.index).lastIndexOf("<label", Math.max(0, t.index - 400) + 400) >= 0 &&
          src.slice(Math.max(0, t.index - 400), t.index).lastIndexOf("</label>", Math.max(0, t.index - 400) + 400) < src.slice(Math.max(0, t.index - 400), t.index).lastIndexOf("<label", Math.max(0, t.index - 400) + 400);
        const labeled = t.attrs["aria-label"] || t.attrs["aria-labelledby"] || t.attrs.title || t.attrs.placeholder || wrapped;
        if (!labeled && id && !src.includes('for="' + id + '"')) {
          issues.push({ type: "input_no_label", line: t.line, detail: "id=" + id + " has no label/aria" });
        } else if (!labeled && !id && !t.attrs.type) {
          issues.push({ type: "input_no_label", line: t.line, detail: "unnamed input" });
        }
      }
      if (t.name === "button") {
        const text = inlineText(src, t, "button");
        if (!text && !t.attrs["aria-label"] && !t.attrs.title && !t.attrs["data-icon"]) {
          issues.push({ type: "button_no_name", line: t.line, detail: "button has no accessible name" });
        }
      }
      if (/^h[1-6]$/.test(t.name)) {
        const level = parseInt(t.name[1], 10);
        if (level - lastH > 1) issues.push({ type: "heading_jump", line: t.line, detail: "h" + level + " after h" + lastH });
        lastH = Math.max(lastH, level);
      }
    }
    if (!tags.some((t) => !t.isClose && t.attrs.class === "skip-link" && t.attrs.href === "#main" || t.attrs.id === "main")) {
      const hasMain = tags.some((t) => !t.isClose && t.name === "main");
      if (hasMain) issues.push({ type: "missing_skip_link", line: 0, detail: "no skip-link to #main" });
    }
    tot.imgs_no_alt += issues.filter((i) => i.type === "img_no_alt").length;
    tot.inputs_no_label += issues.filter((i) => i.type === "input_no_label").length;
    tot.buttons_no_name += issues.filter((i) => i.type === "button_no_name").length;
    tot.heading_jumps += issues.filter((i) => i.type === "heading_jump").length;
    tot.missing_skip_link += issues.filter((i) => i.type === "missing_skip_link").length;
    report.checks.push({ page, issues_total: issues.length, issues });
  }
  report.totals = tot;
  return report;
}

/* ---------------------------------------------------------- */
/* STEP 14 assets                                             */
/* ---------------------------------------------------------- */
function auditAssets() {
  const report = { step: 14, checked: [], totals: { pass: 0, missing: 0 } };
  const known = S.assetSet(ROOT);
  const refs = new Set();
  const add = (label, rel) => {
    if (!rel || /^(https?:|data:|blob:)/.test(rel)) return;
    const clean = decodeURIComponent(rel).replace(/^\.\//, "").split("?")[0].split("#")[0];
    if (refs.has(label + "|" + clean)) return;
    refs.add(label + "|" + clean);
    const ok = known.has(clean) || (clean.endsWith("/") && known.has(clean + "index.html"));
    const status = ok ? "PASS" : "MISSING";
    report.checked.push({ ref_type: label, path: clean, status, note: status === "PASS" ? "exists" : "asset not found on disk" });
    report.totals[status === "PASS" ? "pass" : "missing"]++;
  };
  const pages = S.htmlFiles(ROOT);
  for (const page of pages) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    const pageDir = page.includes("/") ? page.slice(0, page.lastIndexOf("/")) : "";
    const base = pageDir ? pageDir + "/" : "";
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "script" && t.attrs.src) { const u = S.resolveUrl(t.attrs.src, base + page.replace(/^.*\//, ""), base); if (u.kind === "internal") add("script", u.path); }
      if (t.name === "link" && t.attrs.href) {
        if (/stylesheet/i.test(t.attrs.rel || "")) { const u = S.resolveUrl(t.attrs.href, base + page.replace(/^.*\//, ""), base); if (u.kind === "internal") add("css", u.path); }
        if (/icon/i.test(t.attrs.rel || "")) { const u = S.resolveUrl(t.attrs.href, base + page.replace(/^.*\//, ""), base); if (u.kind === "internal") add("icon", u.path); }
        if (/preload|prefetch/i.test(t.attrs.rel || "")) { const u = S.resolveUrl(t.attrs.href, base + page.replace(/^.*\//, ""), base); if (u.kind === "internal") add("preload", u.path); }
      }
      if (t.name === "img") { const u = S.resolveUrl(t.attrs.src, base + page.replace(/^.*\//, ""), base); if (u.kind === "internal") add("image", u.path); }
    }
  }
  /* app.js static data refs */
  const appJs = read(path.join(ROOT, "assets/js/app.js"));
  for (const m of appJs.matchAll(/(?:loadJSON|fetch)\(["']([^"']+\.json)["']/g)) add("data", m[1].replace(/^\.\//, ""));
  /* manifest icons + screenshots + shortcuts */
  const manifest = JSON.parse(read(path.join(ROOT, "manifest.webmanifest")));
  for (const ic of manifest.icons || []) add("manifest-icon", ic.src);
  for (const sh of manifest.screenshots || []) add("manifest-screenshot", sh.src);
  /* service worker shell + data lists */
  const sw = read(path.join(ROOT, "sw.js"));
  for (const m of sw.matchAll(/["']\.\/([^"']+)["']/g)) add("sw-asset", m[1].replace(/^\.\//, "").split("?")[0]);
  return report;
}

/* ---------------------------------------------------------- */
/* STEP 15 storage (static usage map)                         */
/* ---------------------------------------------------------- */
function auditStorageStatic() {
  const files = ["assets/js/app.js", "assets/js/admin.js", "assets/js/pwa.js", "assets/js/ai.js", "sw.js"];
  const report = { step: 15, keys: [], localStorage_guards: {}, sessionStorage_agg: "none found", db_writes: false };
  const agg = {};
  for (const f of files) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const js = read(path.join(ROOT, f));
    let m;
    while ((m = CHROME_LS_RE.exec(js)) !== null) {
      agg[m[2]] = agg[m[2]] || { reads: 0, writes: 0, removes: 0, files: new Set() };
      const op = m[1] === "get" ? "reads" : m[1] === "set" ? "writes" : "removes";
      agg[m[2]][op]++;
      agg[m[2]].files.add(f);
    }
    if (js.includes("localStorage")) report.localStorage_guards[f] =
      /try\s*\{[\s\S]*?JSON\.parse|localStorage\.getItem\([^)]*\)\.split\(/.test(js) ? "guarded" : "some unguarded reads";
  }
  for (const [k, v] of Object.entries(agg)) {
    report.keys.push({ key: k, reads: v.reads, writes: v.writes, removes: v.removes, files: [...v.files] });
  }
  /* service worker cache versioning */
  const sw = read(path.join(ROOT, "sw.js"));
  report.broken_cache_invalidation = !/skipWaiting|activate|keys\(\)/.test(sw) ? "suspect (no prune code)" : "none (versioned prune in activate)";
  report.sw_cache_prefix = (sw.match(/CACHE_PREFIX\s*=\s*"([^"]+)"/) || [])[1] || "";
  report.sw_cache_version = (sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/) || [])[1] || "";
  return report;
}

/* ---------------------------------------------------------- */
/* STEP 18 security (static, non-destructive)                 */
/* ---------------------------------------------------------- */
function auditSecurityStatic() {
  const report = { step: 18, findings: [], totals: {} };
  const files = ["assets/js/app.js", "assets/js/admin.js", "assets/js/ai.js", "assets/js/pwa.js", "sw.js", "server.js", "index.html", "admin.html"];
  let counts = { unsafe_innerhtml: 0, eval_usage: 0, document_write: 0, exposed_secrets: 0, unsafe_url: 0 };
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const src = read(p);
    const innerHtmlUses = [...src.matchAll(/([\w.$\[\]'"`]+)\.innerHTML\s*=\s*([^;]+)/g)];
    for (const m of innerHtmlUses) {
      const expr = m[2].trim().slice(0, 90);
      const userInput = /(esc|sanitize)\(/.test(expr) ? "SANITIZED" : /search|query|textContent|map\(|join\(/.test(expr) ? "DERIVED" : "RAW";
      if (userInput === "RAW") { counts.unsafe_innerhtml++; report.findings.push({ file: f, type: "innerhtml_raw", expr }); }
    }
    if (/eval\s*\(|new Function\s*\(/.test(src)) { counts.eval_usage++; report.findings.push({ file: f, type: "eval_or_function_ctor", detail: "review non-destructive" }); }
    if (/document\.write\s*\(/.test(src)) { counts.document_write++; report.findings.push({ file: f, type: "document_write" }); }
    if (/(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i.test(src)) { counts.exposed_secrets++; report.findings.push({ file: f, type: "possible_secret_hardcode" }); }
  }
  report.totals = counts;
  return report;
}

/* ---------------------------------------------------------- */
/* main                                                        */
/* ---------------------------------------------------------- */
async function main() {
  const [,, which] = process.argv;

  const inventory = auditInteractive();
  const out = {
    step: 1,
    generated_at: "",
    pages_total: inventory.tot.pages,
    detail_pages: inventory.perPage.length,
    per_page_counts: inventory.perPage,
    interactive_elements: inventory.interactive,
    totals: inventory.tot
  };
  fs.writeFileSync(path.join(DOCS, "phase28_site_inventory.json"), JSON.stringify(out, null, 2));

  const links = auditLinks();
  fs.writeFileSync(path.join(DOCS, "phase28_link_audit.json"), JSON.stringify(links, null, 2));

  const buttons = { step: 3, static: { total_buttons: inventory.interactive.length, by_status: {} }, entries: inventory.interactive };
  for (const b of inventory.interactive) buttons.static.by_status[b.status] = (buttons.static.by_status[b.status] || 0) + 1;
  fs.writeFileSync(path.join(DOCS, "phase28_button_audit.json"), JSON.stringify(buttons, null, 2));

  const forms = auditFormsStatic();
  fs.writeFileSync(path.join(DOCS, "phase28_form_audit.json"), JSON.stringify(forms, null, 2));

  const a11y = auditAccessibility();
  fs.writeFileSync(path.join(DOCS, "phase28_accessibility.json"), JSON.stringify(a11y, null, 2));

  const assets = auditAssets();
  fs.writeFileSync(path.join(DOCS, "phase28_assets.json"), JSON.stringify(assets, null, 2));

  const storage = auditStorageStatic();
  fs.writeFileSync(path.join(DOCS, "phase28_storage.json"), JSON.stringify(storage, null, 2));

  const sec = auditSecurityStatic();
  fs.writeFileSync(path.join(DOCS, "phase28_security_functional.json"), JSON.stringify(sec, null, 2));

  console.log(JSON.stringify({
    pages: out.pages_total,
    links: links.total_links,
    links_status: links.totals,
    buttons: buttons.static.total_buttons,
    buttons_status: buttons.static.by_status,
    forms: forms.total_forms,
    a11y: a11y.totals,
    assets: assets.totals,
    storage_keys: storage.keys.length,
    security: sec.totals
  }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
