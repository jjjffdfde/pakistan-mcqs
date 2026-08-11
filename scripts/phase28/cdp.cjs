/* ============================================================
   Phase 28 - minimal CDP client (no external deps)
   Launches headless Chrome with remote debugging, waits for the
   probe target, evaluates JS to fetch results, closes browser.
   ============================================================ */
"use strict";

const { spawn, execFileSync } = require("child_process");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const net = require("net");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean);

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (fs.existsSync(c)) return c;
  try {
    const out = execFileSync("where.exe", ["chrome"], { encoding: "utf8" });
    const f = out.split(/\r?\n/)[0].trim();
    if (f && fs.existsSync(f)) return f;
  } catch (e) {}
  throw new Error("no chrome/edge found");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => { const p = srv.address().port; srv.close(() => resolve(p)); });
    srv.on("error", reject);
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

/* ---------- minimal WebSocket client (RFC6455) ---------- */
class Ws {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      const u = new URL(this.url);
      this.sock = net.connect(parseInt(u.port, 10), u.hostname);
      this.sock.setNoDelay(true);
      let buf = Buffer.alloc(0);
      this.sock.on("data", (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        const idx = buf.indexOf("\r\n\r\n");
        if (idx >= 0) {
          const head = buf.slice(0, idx).toString();
          this.sock.removeAllListeners("data");
          this.sock.on("data", (c) => this._frame(c));
          const accept = head.match(/Sec-WebSocket-Accept:\s*(.+)/i);
          if (!accept) return reject(new Error("bad handshake"));
          this.dialogAutoAccept = true;
          this.send("Page.enable").catch(() => {});
          this.sock.write(Buffer.from(this._frameBytes(JSON.stringify({ id: 0, method: "Target.setDiscoverTargets", params: { discover: true } }))));
          resolve();
        }
      });
      this.sock.on("error", reject);
      const key = crypto.randomBytes(16).toString("base64");
      this.sock.write(
        "GET " + u.pathname + u.search + " HTTP/1.1\r\n" +
        "Host: " + u.host + "\r\n" +
        "Upgrade: websocket\r\nConnection: Upgrade\r\n" +
        "Sec-WebSocket-Key: " + key + "\r\n" +
        "Sec-WebSocket-Version: 13\r\n\r\n"
      );
    });
  }
  _frame(data) {
    let off = 0;
    while (off + 2 <= data.length) {
      const b0 = data[off];
      const len0 = data[off + 1] & 0x7f;
      let len = len0;
      let hlen = 2;
      if (len0 === 126) { len = data.readUInt16BE(off + 2); hlen = 4; }
      else if (len0 === 127) { len = Number(data.readBigUInt64BE(off + 2)); hlen = 10; }
      let mask = 0;
      if (data[off + 1] & 0x80) mask = 4;
      if (off + hlen + mask + len > data.length) return;
      const key = mask ? data.slice(off + hlen, off + hlen + 4) : null;
      let payload = data.slice(off + hlen + mask, off + hlen + mask + len);
      if (key) { for (let i = 0; i < payload.length; i++) payload[i] ^= key[i % 4]; }
      const op = b0 & 0x0f;
      if (op === 1) this._onMessage(payload.toString());
      else if (op === 8) this.sock.end();
      off += hlen + mask + len;
    }
  }
  _frameBytes(msgStr) {
    const payload = Buffer.from(msgStr);
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
    let head;
    const len = payload.length;
    if (len < 126) { head = Buffer.from([0x81, 0x80 | len]); }
    else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 0x80 | 126; head.writeUInt16BE(len, 2); }
    else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(len), 2); }
    return Buffer.concat([head, mask, masked]);
  }
  _onMessage(str) {
    let msg;
    try { msg = JSON.parse(str); } catch (e) { return; }
    if (msg.method === "Page.javascriptDialogOpening" && this.dialogAutoAccept) {
      this.send("Page.handleJavaScriptDialog", { accept: true, promptText: "QA Tester" }).catch(() => {});
      return;
    }
    if (msg.method && this.onEvent) {
      try { this.onEvent(msg.method, msg.params); } catch (e) {}
    }
    if (msg.id !== undefined && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result || {});
    }
  }
  send(method, params) {
    const id = ++this.id;
    this.sock.write(Buffer.from(this._frameBytes(JSON.stringify({ id, method, params: params || {} }))));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("CDP send timeout: " + method));
      }, 20000);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    });
  }
  close() { try { this.sock.end(); } catch (e) {} }
}

async function waitForTarget(port, urlFrag, timeoutMs) {
  const t0 = Date.now();
  let lastErr = null;
  while (Date.now() - t0 < timeoutMs) {
    try {
      const list = await getJson("http://127.0.0.1:" + port + "/json/list");
      const t = list.find((x) => x.type === "page" && x.url.includes(urlFrag));
      if (t) return t;
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 300)); }
  }
  throw new Error("target not found: " + urlFrag + " (" + lastErr + ")");
}

const SCRATCH = path.join(__dirname, "..", "..", ".audit-tmp");
fs.mkdirSync(path.join(SCRATCH, "chrome-profiles"), { recursive: true });
fs.mkdirSync(path.join(SCRATCH, "downloads"), { recursive: true });

async function launch(entry, opts = {}) {
  const chrome = findChrome();
  const port = await freePort();
  const profile = opts.profile || fs.mkdtempSync(path.join(SCRATCH, "chrome-profiles", "p28cdp-"));
  const args = [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-component-update", "--metrics-recording-only",
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + profile,
    "--download-default-directory=" + path.join(SCRATCH, "downloads"),
    "--window-size=" + (opts.w || 1366) + "," + (opts.h || 900)
  ];
  if (opts.offline) args.push("--offline");
  args.push(entry);
  const child = spawn(chrome, args, { stdio: "ignore" });
  try {
    const target = await waitForTarget(port, entry.split("?")[0], 60000);
    const ws = new Ws(target.webSocketDebuggerUrl.replace("localhost", "127.0.0.1"));
    await ws.connect();
    ws.onEvent = (m, p) => {
      if (opts.onEvent) { try { opts.onEvent(m, p); } catch (e) {} }
      if (opts.onCrash && /crashed|destroyed|detached/i.test(m)) { try { opts.onCrash(m, p); } catch (e) {} }
    };
    await ws.send("Target.setAutoAttach", { autoAttach: true, flatten: true, waitForDebuggerOnStart: false }).catch(() => {});
    const expr = `(() => { const t = document.getElementById("p28out"); return t ? t.textContent : ""; })()`;
    let result = { value: "" };
    let lastTitle = "";
    for (let i = 0; i < 300; i++) {
      try {
        const r = await ws.send("Runtime.evaluate", { expression: expr, returnByValue: true, timeout: 10000 });
        result = r.result || {};
        if (result.value && result.value.startsWith("{")) break;
      } catch (e) {}
      if (opts.onTitle) {
        try {
          const tr = await ws.send("Runtime.evaluate", { expression: "document.title", returnByValue: true, timeout: 4000 });
          const t = (tr.result && tr.result.value) || "";
          if (t !== lastTitle) { lastTitle = t; opts.onTitle(t); }
        } catch (e) {}
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    ws.close();
    try { child.kill(); } catch (e) {}
    return { json: result.value, profile, chrome };
  } catch (e) {
    try { child.kill(); } catch (e2) {}
    throw e;
  }
}

module.exports = { launch, findChrome, Ws };
