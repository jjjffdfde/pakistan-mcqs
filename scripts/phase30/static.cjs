/* ============================================================
   Phase 30 - static audit part 1
   M1 inventory, M2 buttons, M3 links, M4 JS static,
   M12 SEO, M14 security. DB never opened; secrets masked.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const S = require("../phase28/shared.cjs");

const ROOT = path.join(__dirname, "..", "..");
const DOCS = path.join(ROOT, "docs");
const read = (p) => fs.readFileSync(p, "utf8");
const now = () => new Date().toISOString();
const JS_FILES = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/node_modules|\.git|backup|docs|release/.test(full)) continue;
      walk(full);
    } else if (/\.(js|cjs|mjs)$/.test(e.name) && !/phase2[0-9]/.test(full.replace(/\\/g, "/"))) JS_FILES.push(full);
  }
})(ROOT);

function inlineText(src, openTag, closeTag) {
  const after = src.slice(openTag.end);
  const m = new RegExp("<" + closeTag + "[\\s>]", "i").exec(after);
  return m ? after.slice(0, m.index) : after.slice(0, 200);
}

/* ---------- M1 inventory ---------- */
function inventory() {
  const pages = S.htmlFiles(ROOT);
  let forms = 0, buttons = 0, links = 0, inputs = 0;
  const interactive = [];
  for (const p of pages) {
    const src = read(path.join(ROOT, p));
    const tags = S.tokenizeHtml(src);
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "form") forms++;
      if (t.name === "button" || (t.name === "input" && /^(button|submit)$/.test(t.attrs.type || "")) || t.attrs.role === "button") {
        buttons++;
        if (interactive.length < 600) interactive.push({ page: p, line: t.line, id: t.attrs.id || "", cls: (t.attrs.class || "").slice(0, 60), onclick: (t.attrs.onclick || "").slice(0, 60) });
      }
      if (t.name === "a" && t.attrs.href) links++;
      if (t.name === "input") inputs++;
    }
  }
  let css = 0, json = 0, imgs = 0, fonts = 0, vids = 0;
  for (const e of fs.readdirSync(ROOT, { recursive: true, withFileTypes: true })) {
    if (!e.isFile()) continue;
    const rel = path.relative(ROOT, path.join(e.parentPath, e.name)).replace(/\\/g, "/");
    if (/docs|backup|node_modules|release/.test(rel)) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (ext === ".css") css++;
    else if (ext === ".json") json++;
    else if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(ext)) imgs++;
    else if (/\.(woff2?|ttf|otf|eot)$/.test(ext)) fonts++;
    else if (/\.(mp4|webm|ogv)$/.test(ext)) vids++;
  }
  const api = require("./api-map.cjs")();
  return {
    module: "M1", generated_at: now(),
    totals: {
      pages: pages.length, js_files: JS_FILES.length, css_files: css, json_files: json,
      images: imgs, fonts, videos: vids, forms, buttons, links, inputs,
      api_endpoints: api.length, interactive_components: buttons
    },
    api_endpoints: api,
    sample_interactive: interactive
  };
}

/* ---------- M2 buttons ---------- */
function buttons() {
  const pages = S.htmlFiles(ROOT);
  const refs = new Set();
  const usedClasses = new Set();
  for (const f of JS_FILES) {
    const js = read(f);
    for (const m of js.matchAll(/\$\(["']([^"']+)["']\)|getElementById\(["']([^"']+)["']\)|querySelector(?:All)?\(["']#([a-zA-Z0-9_-]+)["']\)/g)) {
      const sel = m[1] || m[2] || m[3];
      refs.add(sel.replace(/^[#.]/, ""));
    }
    for (const m of js.matchAll(/\$\(["']\.([a-zA-Z][a-zA-Z0-9_-]*)[^"']*["']\)|\$\$\(["']\.([a-zA-Z][a-zA-Z0-9_-]*)[^"']*["']\)|querySelector(?:All)?\(["']\.([a-zA-Z][a-zA-Z0-9_-]*)[^"']*["']\)/g)) {
      usedClasses.add(m[1] || m[2] || m[3]);
    }
  }
  const delegated = new Set();
  for (const c of usedClasses) {
    for (const f of JS_FILES) {
      if (new RegExp("\\\\." + c + "\\\\s+[a-z\\[.#]").test(read(f))) { delegated.add(c); break; }
    }
  }
  const out = { module: "M2", generated_at: now(), totals: { scanned: 0, working: 0, probable: 0, no_action: 0, disabled: 0 }, items: [] };
  for (const p of pages) {
    const src = read(path.join(ROOT, p));
    const tags = S.tokenizeHtml(src);
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      const isBtn = t.name === "button" || (t.name === "input" && /^(button|submit)$/.test(t.attrs.type || "")) || t.attrs.role === "button";
      if (!isBtn) continue;
      out.totals.scanned++;
      const id = t.attrs.id || "";
      const cls = (t.attrs.class || "").split(/\s+/).filter(Boolean);
      const text = inlineText(src, t, "button").replace(/\s+/g, " ").trim().slice(0, 50);
      let status, note;
      if (t.attrs.disabled !== undefined) { status = "DISABLED"; note = "disabled attribute"; }
      else if (t.attrs.onclick) { status = "WORKING"; note = "inline onclick"; }
      else if (id && refs.has(id)) { status = "WORKING"; note = "bound by JS id"; }
      else if (cls.some((c) => usedClasses.has(c))) { status = "PROBABLE"; note = "class-referenced in JS - runtime verify"; }
      else if (cls.some((c) => delegated.has(c)) || /class="[^"]*\badmin-tabs\b/.test(src) && cls.every((c) => !c)) { status = "PROBABLE"; note = "container-delegated binding - runtime verify"; }
      else { status = "NO_ACTION"; note = "no handler found statically"; }
      out.totals[status.toLowerCase()] = (out.totals[status.toLowerCase()] || 0) + 1;
      if (status !== "WORKING" && out.items.length < 400) out.items.push({ page: p, line: t.line, id, class: cls.join(" "), text, status, note });
    }
  }
  return out;
}

/* ---------- M3 links ---------- */
function links() {
  const report = { module: "M3", generated_at: now(), totals: {}, items: [] };
  const status = {};
  for (const page of S.htmlFiles(ROOT)) {
    const src = read(path.join(ROOT, page));
    const tags = S.tokenizeHtml(src);
    const pageDir = page.includes("/") ? page.slice(0, page.lastIndexOf("/")) : "";
    const base = pageDir ? pageDir + "/" : "";
    const seen = new Set();
    for (const t of tags) {
      if (t.name !== "a" || t.isClose || t.isComment) continue;
      const href = t.attrs.href;
      const key = href + "|" + t.line;
      if (seen.has(key)) continue;
      seen.add(key);
      const u = S.resolveUrl(href, base + page.replace(/^.*\//, ""), base);
      let cls = "PASS", note = "target exists";
      if (u.kind === "internal" || (u.kind === "external" && u.host === S.SITE_HOST)) {
        const [filePart] = u.path.split("#");
        if (!S.resolveLocal(filePart, ROOT)) { cls = "BROKEN"; note = "target file missing: " + filePart; }
      } else if (u.kind === "external") { cls = "EXTERNAL"; note = "off-site (not fetched offline): " + u.host; }
      else if (u.kind === "anchor") { cls = "REVIEW"; note = "in-page anchor (runtime check)"; }
      else if (u.kind === "javascript") { cls = "REVIEW"; note = "javascript: link"; }
      else if (u.kind === "hash-only") { cls = "REVIEW"; note = "href=# self link"; }
      else if (u.kind === "empty" || u.kind === "missing") { cls = "REVIEW"; note = "empty href"; }
      else { cls = "REVIEW"; note = u.kind; }
      status[cls] = (status[cls] || 0) + 1;
      if (cls !== "PASS" && report.items.length < 400) report.items.push({ page, line: t.line, href: String(href || "").slice(0, 140), kind: u.kind, status: cls, note: note.slice(0, 110) });
    }
  }
  report.totals = status;
  return report;
}

/* ---------- M4 static JS ---------- */
function jsStatic() {
  const out = { module: "M4", generated_at: now(), totals: { files: 0, syntax_ok: 0, syntax_error: 0, console_debug: 0, TODO_markers: 0 }, files: [] };
  for (const f of JS_FILES) {
    const js = read(f);
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    const chk = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    out.totals.files++;
    if (chk.status === 0) out.totals.syntax_ok++;
    else {
      out.totals.syntax_error++;
      out.files.push({ file: rel, syntax: "ERROR", detail: (chk.stderr || chk.stdout).split("\n")[0].slice(0, 160) });
    }
    const dbg = (js.match(/console\.(log|debug)\(/g) || []).length;
    const todo = (js.match(/TODO|FIXME|HACK/gi) || []).length;
    out.totals.console_debug += dbg;
    out.totals.TODO_markers += todo;
    if (dbg || todo) out.files.push({ file: rel, syntax: "OK", console_debug: dbg, TODO_markers: todo });
  }
  return out;
}

/* ---------- M12 SEO ---------- */
function seo() {
  const targets = ["index.html", "admin.html", "404.html", "offline.html", "subjects/index.html"];
  const pages = S.htmlFiles(ROOT);
  const ch = pages.find((p) => p.startsWith("chapters/") && p.endsWith(".html"));
  if (ch) targets.push(ch);
  const out = { module: "M12", generated_at: now(), files: {} };
  out.files.robots_txt = fs.existsSync(path.join(ROOT, "robots.txt")) ? read(path.join(ROOT, "robots.txt")).split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).slice(0, 10) : "MISSING";
  const sitemap = fs.existsSync(path.join(ROOT, "sitemap.xml")) ? read(path.join(ROOT, "sitemap.xml")) : null;
  out.files.sitemap_xml = sitemap ? { bytes: sitemap.length, urls: (sitemap.match(/<loc>/g) || []).length } : "MISSING";
  for (const p of targets) {
    if (!p || !fs.existsSync(path.join(ROOT, p))) continue;
    const src = read(path.join(ROOT, p));
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(src);
    const desc = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(src);
    const canonical = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(src);
    const h1 = (src.match(/<h1[^>]*>/gi) || []).length;
    const imgs = (src.match(/<img\s/g) || []).length;
    const alt = (src.match(/<img\s[^>]*alt=["'][^"']+["']/gi) || []).length;
    out.files[p] = {
      title: title ? title[1].trim().slice(0, 110) : "MISSING",
      title_len: title ? title[1].trim().length : 0,
      meta_description: desc ? desc[1].slice(0, 160) : "MISSING",
      canonical: canonical ? canonical[1] : "MISSING",
      h1_count: h1,
      og_tags: (src.match(/property=["']og:[a-z:]+["']/gi) || []).length,
      json_ld: (src.match(/application\/ld\+json/gi) || []).length,
      img_alt_ratio: imgs ? Math.round((alt / imgs) * 100) + "%" : "n/a",
      has_viewport: /name=["']viewport["']/.test(src)
    };
  }
  return out;
}

/* ---------- M14 security (masked) ---------- */
const SECRET_RE = /(api[_-]?key|apikey|token|secret|password|passwd|authorization)\s*[:=]\s*["'][^"']{4,}["']/gi;
function security() {
  const out = { module: "M14", generated_at: now(), totals: { eval: 0, document_write: 0, inner_html: 0, inner_html_unescaped: 0, secrets_found: 0 }, findings: [] };
  const files = JS_FILES.filter((f) => !/node_modules|backup|docs|release/.test(f)).concat(path.join(ROOT, "server.js"));
  for (const f of files) {
    const js = read(f);
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    const evals = (js.match(/\beval\(/g) || []).length;
    const dw = (js.match(/document\.write\(/g) || []).length;
    let ih = 0, unesc = 0;
    for (const m of js.matchAll(/([\w$.]+)\.innerHTML\s*=\s*/g)) {
      ih++;
      const seg = js.slice(m.index, m.index + 120);
      if (!/esc\(|textContent|JSON\.stringify/.test(seg)) unesc++;
    }
    const secrets = [...js.matchAll(SECRET_RE)].length;
    out.totals.eval += evals;
    out.totals.document_write += dw;
    out.totals.inner_html += ih;
    out.totals.inner_html_unescaped += unesc;
    out.totals.secrets_found += secrets;
    if (evals || dw || unesc || secrets) {
      out.findings.push({ file: rel, eval: evals, document_write: dw, inner_html_unescaped: unesc, secrets_found: secrets, secrets_masked: secrets ? "[REDACTED]" : "" });
    }
  }
  return out;
}

module.exports = { inventory, buttons, links, jsStatic, seo, security, JS_FILES };
if (require.main === module) {
  const fsx = require("fs");
  const m1 = inventory();
  const m2 = buttons();
  const m3 = links();
  const m4 = jsStatic();
  const m12 = seo();
  const m14 = security();
  for (const [name, data] of [["phase30_site_inventory", m1], ["phase30_button_audit", m2], ["phase30_link_audit", m3], ["phase30_javascript_audit", m4], ["phase30_seo_audit", m12], ["phase30_security_audit", m14]]) {
    fsx.writeFileSync(path.join(DOCS, name + ".json"), JSON.stringify(data, null, 1));
    console.log(name + ":", JSON.stringify(data.totals || data.module));
  }
}
