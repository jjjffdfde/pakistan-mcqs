"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

module.exports = (t) => {
  t.test("sitemap URLs resolve to real files (sample 250)", async () => {
    const src = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    const locs = [...src.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.length >= 900);
    const basePath = new URL(JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site-config.json"), "utf8")).site.baseUrl).pathname.replace(/\/+$/, "");
    const step = Math.max(1, Math.floor(locs.length / 250));
    const missing = [];
    for (let i = 0; i < locs.length; i += step) {
      const u = locs[i];
      const rel = u.replace(/^https?:\/\/[^/]+/, "").replace(basePath, "").replace(/^\//, "");
      if (rel && !fs.existsSync(path.join(ROOT, rel))) missing.push(rel);
    }
    assert.deepStrictEqual(missing, [], `sitemap missing: ${missing.slice(0, 10)}`);
  });

  t.test("subjects/index.html links resolve (sample)", async () => {
    const idx = path.join(ROOT, "subjects", "index.html");
    assert.ok(fs.existsSync(idx));
    const html = fs.readFileSync(idx, "utf8");
    const hrefs = [...html.matchAll(/href=["']([^"']+\.html)["']/g)].map((m) => m[1]).filter((h) => !h.startsWith("http"));
    assert.ok(hrefs.length >= 200, `subject index has ${hrefs.length} links`);
    const step = Math.max(1, Math.floor(hrefs.length / 200));
    const missing = [];
    for (let i = 0; i < hrefs.length; i += step) {
      const rel = hrefs[i].replace(/\.\.\//g, "");
      if (!fs.existsSync(path.join(ROOT, "subjects", rel))) missing.push(hrefs[i]);
    }
    assert.deepStrictEqual(missing, [], `subject links missing: ${missing.slice(0, 10)}`);
  });

  t.test("static pages all parse HTML (phase report pages)", async () => {
    for (const f of ["index.html", "admin.html", "offline.html", "404.html"]) {
      const html = fs.readFileSync(path.join(ROOT, f), "utf8");
      assert.ok(html.trim().length > 500, `${f} too small`);
    }
  });

  t.test("all docs phase reports are valid JSON", async () => {
    const docs = path.join(ROOT, "docs");
    const bad = [];
    for (const f of fs.readdirSync(docs).filter((x) => x.endsWith(".json"))) {
      try { JSON.parse(fs.readFileSync(path.join(docs, f), "utf8")); } catch (e) { bad.push(f); }
    }
    assert.deepStrictEqual(bad, []);
  });
};
