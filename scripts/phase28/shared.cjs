/* ============================================================
   Phase 28 - shared static analysis helpers (no external deps)
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const SITE_HOST = "pakistanmcqshub.github.io";
const EXTERNAL_HOSTS = new Set([
  SITE_HOST, "www." + SITE_HOST, "github.com", "www.facebook.com", "facebook.com",
  "x.com", "twitter.com", "youtube.com", "www.youtube.com", "wa.me", "t.me", "linkedin.com"
]);

/* ---------- HTML tag tokenizer: returns tags with line/col ---------- */
function tokenizeHtml(src) {
  const tags = [];
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)\s*\/?>/g;
  let m;
  let line = 1;
  let lastIdx = 0;
  while ((m = re.exec(src)) !== null) {
    const seg = src.slice(lastIdx, m.index);
    line += (seg.match(/\n/g) || []).length;
    lastIdx = m.index;
    const isComment = m[0].startsWith("<!--");
    const isClose = m[0][1] === "/" && !isComment;
    const name = isComment ? "#comment" : m[1].toLowerCase();
    const attrs = {};
    if (!isComment && !isClose) {
      const attRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
      let am;
      while ((am = attRe.exec(m[2])) !== null) {
        let val = am[2];
        if (val !== undefined) {
          const q = val[0];
          if (q === '"' || q === "'") val = val.slice(1, -1);
        } else {
          val = "";
        }
        attrs[am[1].toLowerCase()] = val;
      }
    }
    const col = m.index - src.lastIndexOf("\n", m.index - 1);
    tags.push({ name, isComment, isClose, attrs, line, col, index: m.index, raw: m[0], end: m.index + m[0].length });
    line += (m[0].match(/\n/g) || []).length;
    lastIdx = m.index + m[0].length;
  }
  /* parent chain (class/id context) for each tag */
  const VOID = new Set(["br", "img", "input", "hr", "meta", "link", "source", "wbr", "area", "base", "col", "embed", "param", "track"]);
  const stack = [];
  for (const t of tags) {
    if (t.isComment) { t.parents = stack.slice(); continue; }
    if (t.isClose) {
      const i = stack.lastIndexOf(t.name);
      if (i >= 0) stack.splice(i, 1);
      t.parents = stack.slice();
      continue;
    }
    t.parents = stack.slice();
    const cls = t.attrs && t.attrs.class ? t.attrs.class.split(/\s+/).filter(Boolean) : [];
    if (!VOID.has(t.name)) stack.push({ name: t.name, classes: cls, id: (t.attrs && t.attrs.id) || "" });
  }
  return tags;
}

/* ---------- JS global symbol extraction ---------- */
function extractGlobals(jsSrc) {
  const globals = new Set();
  let idx = 0;
  const strip = (s) => s.replace(/^\s+|\s+$/g, "");
  /* function name( */
  const fnRe = /(?:^|[;\n}])\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = fnRe.exec(jsSrc)) !== null) globals.add(m[1]);
  /* const/let/var name = ... */
  const varRe = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g;
  while ((m = varRe.exec(jsSrc)) !== null) globals.add(m[1]);
  /* window.name = ... and globals assigned in inline scripts */
  const winRe = /window\.([A-Za-z_$][\w$]*)\s*=/g;
  while ((m = winRe.exec(jsSrc)) !== null) globals.add(m[1]);
  /* class name */
  const clsRe = /\bclass\s+([A-Za-z_$][\w$]*)/g;
  while ((m = clsRe.exec(jsSrc)) !== null) globals.add(m[1]);
  /* element.addEventListener("click", handler) — reference names */
  const handlerCalls = [];
  const evRe = /\.addEventListener\(\s*(['"])([^'"]+)\1\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g;
  while ((m = evRe.exec(jsSrc)) !== null) handlerCalls.push({ event: m[2], handler: m[3] });
  /* querySelectorAll(...).forEach((b) => b.addEventListener(...)) style uses inline fn - covered by fnRe/vars */
  return { globals, handlerCalls };
}

/* ---------- find handler reference names inside onclick/onchange etc ---------- */
function extractInlineHandlerNames(expr) {
  const names = [];
  const re = /([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(expr)) !== null) {
    if (!/^(if|for|while|switch|catch|function|return|typeof|new|delete|in|of)$/.test(m[1])) names.push(m[1]);
  }
  /* plain handler references without call parens (elem.onclick="fn") */
  const bare = expr.match(/^[A-Za-z_$][\w$]*$/);
  if (bare) names.push(bare[0]);
  return [...new Set(names)];
}

/* ---------- URL resolution ---------- */
function resolveUrl(href, basePage, baseDir) {
  if (href === undefined || href === null) return { kind: "missing" };
  const h = String(href).trim();
  if (!h) return { kind: "empty" };
  if (/^#/.test(h)) return { kind: "anchor", target: h.slice(1) };
  if (/^javascript:/i.test(h)) return { kind: "javascript" };
  if (/^mailto:/i.test(h)) return { kind: "mailto" };
  if (/^tel:/i.test(h)) return { kind: "tel" };
  if (/^data:/i.test(h)) return { kind: "data" };
  if (/#/.test(h) && !/^https?:/.test(h) && h.indexOf("#") === h.length - 1) {
    /* trailing hash only - e.g. href="#" */
    if (/^#+$/.test(h)) return { kind: "hash-only" };
  }
  let parsed;
  try { parsed = new URL(h, "http://" + SITE_HOST + "/" + basePage.replace(/\\/g, "/")); }
  catch (e) { return { kind: "invalid", raw: h }; }
  const external = !/^https?:/.test(h) ? false : parsed.host !== SITE_HOST && !parsed.host.endsWith("." + SITE_HOST);
  const hash = parsed.hash ? parsed.hash.slice(1) : "";
  const pathname = decodeURIComponent(parsed.pathname);
  const file = pathname === "/" ? "index.html" : pathname.replace(/\/+$/, "") === "" ? "index.html" : pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return { kind: external ? "external" : "internal", host: external ? parsed.host : SITE_HOST, hash, path: file, query: parsed.search, raw: h };
}

/* ---------- file existence ---------- */
function resolveLocal(relPath, webroot) {
  const p = path.join(webroot, relPath);
  return fs.existsSync(p) ? p : null;
}

/* ---------- classify js asset / css / font / image ---------- */
const isJsExt = (f) => /\.js(\?|$)/i.test(f);
const isCssExt = (f) => /\.css(\?|$)/i.test(f);
const isImgExt = (f) => /\.(png|jpe?g|gif|svg|webp|ico|avif|bmp)(\?|$)/i.test(f);
const isFontExt = (f) => /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(f);

/* ---------- walk html files ---------- */
function htmlFiles(webroot, base = "") {
  const out = [];
  const dir = path.join(webroot, base);
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? base + "/" + e.name : e.name;
    if (e.isDirectory()) {
      if (["docs", "release", "backup", "node_modules", ".git", "tests", "database"].includes(e.name)) continue;
      out.push(...htmlFiles(webroot, rel));
    } else if (/\.html$/i.test(e.name)) {
      out.push(rel);
    }
  }
  return out;
}

/* ---------- all static assets under webroot ---------- */
function assetSet(webroot) {
  const set = new Set();
  const walk = (base) => {
    const dir = path.join(webroot, base);
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? base + "/" + e.name : e.name;
      if (e.isDirectory()) {
        if (["docs", "release", "backup", "node_modules", ".git", "tests", "database"].includes(e.name)) continue;
        walk(rel);
      } else set.add(rel);
    }
  };
  walk("");
  return set;
}

/* ---------- visible text of an element token cluster (simple inline) ---------- */
function textOfRawBetween(src, tagIndex, tags) {
  return "";
}

module.exports = {
  SITE_HOST, EXTERNAL_HOSTS,
  tokenizeHtml, extractGlobals, extractInlineHandlerNames,
  resolveUrl, resolveLocal,
  isJsExt, isCssExt, isImgExt, isFontExt,
  htmlFiles, assetSet
};
