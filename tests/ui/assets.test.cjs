"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

function refsIn(html) {
  const refs = [];
  const re = /(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(ref)) continue;
    refs.push(ref.split("?")[0].split("#")[0]);
  }
  return [...new Set(refs)];
}

function resolve(baseDir, ref) {
  return path.posix.normalize(path.posix.join(baseDir, ref));
}

module.exports = (t) => {
  t.test("index.html script/css/link refs all resolve", async () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const refs = refsIn(html);
    assert.ok(refs.length > 5, "index.html should reference assets");
    const missing = refs.filter((r) => !fs.existsSync(path.join(ROOT, r)));
    assert.deepStrictEqual(missing, [], `missing: ${missing.join(", ")}`);
  });

  t.test("offline.html refs resolve", async () => {
    const html = fs.readFileSync(path.join(ROOT, "offline.html"), "utf8");
    const missing = refsIn(html).filter((r) => !fs.existsSync(path.join(ROOT, r)));
    assert.deepStrictEqual(missing, []);
  });

  t.test("manifest.webmanifest is valid JSON with icons", async () => {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
    assert.ok(Array.isArray(m.icons) && m.icons.length >= 6, "need >=6 icons");
    for (const ic of m.icons) {
      assert.ok(fs.existsSync(path.join(ROOT, ic.src)), `icon ${ic.src} must exist`);
    }
    assert.ok(m.name && m.start_url, "name + start_url required");
  });

  t.test("sw.js cache references resolve", async () => {
    const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    const refs = [];
    const re = /["'](\/?[^"']+\.(?:js|css|html|png|svg|webmanifest|xml))["']/g;
    let m;
    while ((m = re.exec(sw)) !== null) refs.push(m[1].replace(/^\//, ""));
    const missing = refs.filter((r) => !fs.existsSync(path.join(ROOT, r)));
    assert.deepStrictEqual(missing, [], `sw.js missing: ${missing.join(", ")}`);
  });

  t.test("robots.txt + sitemap.xml exist", async () => {
    assert.ok(fs.existsSync(path.join(ROOT, "robots.txt")));
    assert.ok(fs.existsSync(path.join(ROOT, "sitemap.xml")));
    const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    assert.ok(sm.includes("<urlset"), "sitemap must be a urlset");
  });

  t.test("pwa.js exposes window.PMH_PWA API", async () => {
    const pwa = fs.readFileSync(path.join(ROOT, "assets", "js", "pwa.js"), "utf8");
    assert.ok(/PMH_PWA\s*[:=]/.test(pwa), "PMH_PWA must be defined");
  });
};
