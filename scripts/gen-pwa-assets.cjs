/* ============================================================
   Phase 25 - deterministic PWA asset generator (pure Node)
   Emits PNG icons, apple-touch, favicons, maskable + splash.
   No external deps: own PNG encoder using zlib + CRC32.
   Usage: node scripts/gen-pwa-assets.cjs
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "icons");
const ANDOUT = path.join(ROOT, "android");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ANDOUT, { recursive: true });

/* ---------- CRC32 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; /* RGBA */
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/* ---------- SDF helpers ---------- */
function sdRoundRect(px, py, half, r) {
  const qx = Math.abs(px) - half + r;
  const qy = Math.abs(py) - half + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}
function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function makeIcon(size, maskable) {
  const buf = Buffer.alloc(size * size * 4);
  const pad = maskable ? 0 : size * 0.06;
  const half = (size - pad * 2) / 2;
  const radius = maskable ? 0 : size * 0.22;
  const cx = size / 2, cy = size / 2;
  const top = [0x0d, 0x5c, 0x2e, 255];
  const bottom = [0x01, 0x37, 0x10, 255];
  const white = [255, 255, 255, 255];
  const cw = size * 0.07;
  const p1 = [size * 0.34, size * 0.52];
  const p2 = [size * 0.47, size * 0.65];
  const p3 = [size * 0.70, size * 0.36];

  for (let y = 0; y < size; y++) {
    const t = y / size;
    const r0 = Math.round(top[0] + (bottom[0] - top[0]) * t);
    const g0 = Math.round(top[1] + (bottom[1] - top[1]) * t);
    const b0 = Math.round(top[2] + (bottom[2] - top[2]) * t);
    for (let x = 0; x < size; x++) {
      const d = sdRoundRect(x - cx, y - cy, half, radius);
      let a = 0;
      if (maskable) a = 1;
      else if (d <= 0) a = 1;
      else if (d < 1.5) a = Math.max(0, 1 - d / 1.5);

      let r = r0, g = g0, b = b0;
      if (a > 0) {
        const s = Math.min(
          sdSegment(x, y, p1[0], p1[1], p2[0], p2[1]) - cw / 2,
          sdSegment(x, y, p2[0], p2[1], p3[0], p3[1]) - cw / 2
        );
        if (s <= 0) { r = white[0]; g = white[1]; b = white[2]; }
        else if (s < cw) {
          const fa = Math.max(0, 1 - s / cw);
          r = Math.round(r0 + (white[0] - r0) * fa);
          g = Math.round(g0 + (white[1] - g0) * fa);
          b = Math.round(b0 + (white[2] - b0) * fa);
        }
      }
      const off = (y * size + x) * 4;
      buf[off] = r; buf[off + 1] = g; buf[off + 2] = b; buf[off + 3] = Math.round(a * 255);
    }
  }
  return encodePNG(size, size, buf);
}

function makeSplash(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const top = [0x0d, 0x5e, 0x37, 255], bottom = [0x01, 0x37, 0x10, 255];
  const white = [240, 244, 235, 255];
  const cw = Math.min(w, h) * 0.06;
  const cx = w / 2, cy = h / 2;
  const p1 = [cx - w * 0.14, cy + w * 0.01], p2 = [cx - w * 0.02, cy + w * 0.13], p3 = [cx + w * 0.16, cy - w * 0.12];
  for (let y = 0; y < h; y++) {
    const t = y / h;
    const r0 = Math.round(top[0] + (bottom[0] - top[0]) * t);
    const g0 = Math.round(top[1] + (bottom[1] - top[1]) * t);
    const b0 = Math.round(top[2] + (bottom[2] - top[2]) * t);
    for (let x = 0; x < w; x++) {
      const s1 = sdSegment(x, y, p1[0], p1[1], p2[0], p2[1]) - cw / 2;
      const s2 = sdSegment(x, y, p2[0], p2[1], p3[0], p3[1]) - cw / 2;
      const s = Math.min(s1, s2);
      let r = r0, g = g0, b = b0;
      if (s <= 0) { r = white[0]; g = white[1]; b = white[2]; }
      else if (s < cw) {
        const fa = Math.max(0, 1 - s / cw);
        r = Math.round(r0 + (white[0] - r0) * fa);
        g = Math.round(g0 + (white[1] - g0) * fa);
        b = Math.round(b0 + (white[2] - b0) * fa);
      }
      const off = (y * w + x) * 4;
      buf[off] = r; buf[off + 1] = g; buf[off + 2] = b; buf[off + 3] = 255;
    }
  }
  return encodePNG(w, h, buf);
}

/* ---------- output ---------- */
const jobs = [
  ["icon-48.png", makeIcon(48, false)],
  ["icon-72.png", makeIcon(72, false)],
  ["icon-96.png", makeIcon(96, false)],
  ["icon-128.png", makeIcon(128, false)],
  ["icon-192.png", makeIcon(192, false)],
  ["icon-256.png", makeIcon(256, false)],
  ["icon-384.png", makeIcon(384, false)],
  ["icon-512.png", makeIcon(512, false)],
  ["maskable-192.png", makeIcon(192, true)],
  ["maskable-512.png", makeIcon(512, true)],
  ["apple-touch-icon.png", makeIcon(180, true)]
];
for (const [name, buf] of jobs) fs.writeFileSync(path.join(OUT, name), buf);
fs.writeFileSync(path.join(ANDOUT, "splash-512.png"), makeSplash(512, 512));
fs.writeFileSync(path.join(ANDOUT, "splash-1080x1920.png"), makeSplash(1080, 1920));
fs.writeFileSync(path.join(ANDOUT, "ic_launcher-512.png"), makeIcon(512, true));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0d5c2e"/>
    <stop offset="1" stop-color="#013710"/>
  </linearGradient>
</defs>
<rect width="512" height="512" fill="url(#g)"/>
<path d="M174 266 L240 332 L360 184" fill="none" stroke="#ffffff" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
fs.writeFileSync(path.join(OUT, "icon.svg"), svg);
fs.writeFileSync(path.join(OUT, "maskable.svg"), svg);

console.log("Generated " + jobs.length + " icons -> " + OUT);
for (const [name, buf] of jobs) console.log("  " + name + " (" + buf.length + " bytes)");
console.log("Android splash/launcher -> " + ANDOUT);
console.log("SVG source -> " + path.join(OUT, "icon.svg"));
