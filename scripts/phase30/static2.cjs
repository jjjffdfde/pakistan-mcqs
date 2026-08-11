/* ============================================================
   Phase 30 - static audit part 2
   M5 forms static, M17 dead features, M18 UI consistency.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
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

/* ---------- M5 forms static ---------- */
function forms() {
  const out = { module: "M5", generated_at: now(), totals: { forms: 0, inputs: 0, inputs_no_label: 0 }, forms: [] };
  for (const p of S.htmlFiles(ROOT)) {
    const src = read(path.join(ROOT, p));
    const tags = S.tokenizeHtml(src);
    for (const t of tags) {
      if (t.isClose || t.isComment) continue;
      if (t.name === "form") {
        out.totals.forms++;
        out.forms.push({ page: p, line: t.line, action: t.attrs.action || "", method: t.attrs.method || "" });
      } else if (t.name === "input") {
        out.totals.inputs++;
        const id = t.attrs.id || "";
        const labeled = !!(t.attrs["aria-label"] || t.attrs["aria-labelledby"]) ||
          /^(hidden|button|submit|reset)$/.test(t.attrs.type || "") ||
          tags.some((s) => !s.isClose && s.name === "label" && s.attrs.for && s.attrs.for === id);
        if (!labeled) out.totals.inputs_no_label++;
      }
    }
  }
  return out;
}

/* ---------- M17 dead features ---------- */
function deadFeatures() {
  const out = { module: "M17", generated_at: now(), totals: { coming_soon: 0, placeholder: 0, debug_log: 0, unbound_core_buttons: 0 }, findings: [] };
  const html = ["index.html", "admin.html", "404.html", "offline.html"].map((p) => [p, read(path.join(ROOT, p))]);
  for (const [p, src] of html) {
    for (const m of src.matchAll(/coming\s?[-_]?soon|under\s+construction|placeholder|TODO|lorem\s+ipsum/gi)) {
      out.totals.placeholder++;
      out.findings.push({ page: p, kind: "placeholder_text", text: m[0].slice(0, 40) });
    }
    if (/href="#"/.test(src)) out.findings.push({ page: p, kind: "href_hash_placeholder" });
  }
  for (const f of JS_FILES) {
    const js = read(f);
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    const dbg = (js.match(/console\.log\(/g) || []).length;
    if (dbg) { out.totals.debug_log += dbg; out.findings.push({ file: rel, kind: "console_log", count: dbg }); }
    for (const m of js.matchAll(/feature\s*:?\s*["']?(coming soon|not implemented|TODO)["']?/gi)) {
      out.totals.placeholder++;
      out.findings.push({ file: rel, kind: "feature_placeholder", text: m[0].slice(0, 60) });
    }
  }
  const unbound = [];
  const refs = new Set();
  for (const f of JS_FILES) {
    const js = read(f);
    for (const m of js.matchAll(/\$\(["']([^"']+)["']\)|getElementById\(["']([^"']+)["']\)|querySelector(?:All)?\(["']#([a-zA-Z0-9_-]+)["']\)/g)) {
      refs.add((m[1] || m[2] || m[3]).replace(/^[#.]/, ""));
    }
  }
  for (const p of ["index.html", "admin.html", "offline.html", "404.html"]) {
    const src = read(path.join(ROOT, p));
    const tags = S.tokenizeHtml(src);
    for (const t of tags) {
      if (t.isClose || t.isComment || t.name !== "button") continue;
      const id = t.attrs.id || "";
      const cls = (t.attrs.class || "").split(/\s+/).filter(Boolean);
      const found = id && refs.has(id);
      if (!found && !t.attrs.onclick && !cls.some((c) => c === "nav-link" || c === "ai-tab" || c === "admin-tabs" || c === "btn-cat" || c === "btn-subj" || c === "btn-top")) {
        unbound.push({ page: p, line: t.line, id, class: cls.join(" ") });
      }
    }
  }
  out.totals.unbound_core_buttons = unbound.length;
  out.findings.push({ kind: "buttons_without_static_handler (runtime-verified on core pages)", count: unbound.length, buttons: unbound.slice(0, 60) });
  return out;
}

/* ---------- M18 UI consistency (CSS token audit) ---------- */
function consistency() {
  const cssPath = path.join(ROOT, "assets", "css", "style.css");
  const css = read(cssPath);
  const out = { module: "M18", generated_at: now(), file: "assets/css/style.css", bytes: css.length, css_variables: {}, component_classes: {}, typography: {}, media_queries: [], findings: [] };
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    out.css_variables[m[1]] = m[2].trim();
  }
  const counts = {};
  for (const m of css.matchAll(/\.([a-z][a-z0-9-]*)\b[^{]*\{/gi)) {
    const c = m[1];
    const root = c.split(/[-_]/)[0];
    counts[root] = (counts[root] || 0) + 1;
  }
  out.component_classes = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const fonts = new Set();
  for (const m of css.matchAll(/font-family\s*:\s*([^;]+);/gi)) fonts.add(m[1].trim());
  out.typography.font_families = [...fonts];
  const sizes = {};
  for (const m of css.matchAll(/font-size\s*:\s*([^;]+);/gi)) {
    const v = m[1].trim();
    sizes[v] = (sizes[v] || 0) + 1;
  }
  out.typography.font_sizes = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const m of css.matchAll(/@media\s+([^{]+)\{/gi)) out.media_queries.push(m[1].trim());
  const btnVariants = new Set();
  for (const m of css.matchAll(/\.btn([a-z0-9-]*)\b/g)) btnVariants.add(".btn" + m[1]);
  out.findings.push({ kind: "button_variants", count: btnVariants.size, variants: [...btnVariants] });
  const cardVariants = new Set();
  for (const m of css.matchAll(/\.card([a-z0-9-]*)\b/g)) cardVariants.add(".card" + m[1]);
  out.findings.push({ kind: "card_variants", count: cardVariants.size, variants: [...cardVariants] });
  out.findings.push({ kind: "focus_visible_rule", present: /:focus-visible/.test(css) });
  out.findings.push({ kind: "prefers_reduced_motion", present: /prefers-reduced-motion/.test(css) });
  return out;
}

module.exports = { forms, deadFeatures, consistency };
if (require.main === module) {
  const m5 = forms();
  const m17 = deadFeatures();
  const m18 = consistency();
  const fsx = require("fs");
  for (const [name, data] of [["phase30_form_audit", m5], ["phase30_dead_features", m17], ["phase30_ui_consistency", m18]]) {
    fsx.writeFileSync(path.join(DOCS, name + ".json"), JSON.stringify(data, null, 1));
    console.log(name + ":", JSON.stringify(data.totals || { ok: true }));
  }
}
