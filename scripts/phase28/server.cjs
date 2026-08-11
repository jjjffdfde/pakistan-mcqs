/* ============================================================
   Phase 28 - local static test server with probe injection
   Serves the repo root (same layout as production nginx).
   When a page is requested with ?p28=1 the audit capture script
   is injected before any app script runs.
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PORT = parseInt(process.env.P28_PORT || "8799", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

const INJECT_TAG = `<!--p28-inject--><script src="/p28-inject.js"></script>`;

function serve(req, res) {
  const u = new URL(req.url, "http://" + req.headers.host);
  let pathname = decodeURIComponent(u.pathname);
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/p28-inject.js") {
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(fs.readFileSync(path.join(__dirname, "inject.js")));
  }
  const full = path.join(ROOT, pathname);
  if (!full.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    const nf = path.join(ROOT, "404.html");
    if (fs.existsSync(nf)) {
      let body = fs.readFileSync(nf);
      if (u.searchParams.has("p28")) {
        const idx = body.indexOf("</head>");
        if (idx >= 0) body = Buffer.concat([body.slice(0, idx), Buffer.from(INJECT_TAG), body.slice(idx)]);
      }
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(body);
    }
    res.writeHead(404); return res.end("not found");
  }
  const ext = path.extname(full).toLowerCase();
  let body = fs.readFileSync(full);
  if ((ext === ".html") && u.searchParams.has("p28")) {
    const idx = body.indexOf("</head>");
    if (idx >= 0) body = Buffer.concat([body.slice(0, idx), Buffer.from(INJECT_TAG), body.slice(idx)]);
  }
  const stat = fs.statSync(full);
  const etag = '"' + stat.size.toString(16) + "-" + stat.mtimeMs.toString(16) + '"';
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "ETag": etag,
    "Cache-Control": ext === ".html"
      ? "no-cache"
      : /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot)$/i.test(ext)
        ? "public, max-age=604800, immutable"
        : "public, max-age=86400",
  };
  if (req.headers["if-none-match"] === etag && !u.searchParams.has("p28")) {
    res.writeHead(304, headers);
    return res.end();
  }
  res.writeHead(200, headers);
  res.end(body);
}

const server = http.createServer(serve);
server.listen(PORT, () => console.log("[p28-static] http://127.0.0.1:" + PORT + " (root: " + ROOT + ")"));
module.exports = { server, port: PORT };
