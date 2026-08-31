/* scripts/phase45/publish-content.cjs — idempotent content publish + content hash index */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { CONTENT_DIR, ROOT, streamGzLines, contentHash, normalizeText, nowUtc, atomicWrite, mkdirp } = require("./common.cjs");

/* ---------- idempotent append: check existing hashes before writing ---------- */

async function loadExistingHashes(subject) {
  const dir = path.join(CONTENT_DIR, subject);
  const hashes = new Set();
  if (!fs.existsSync(dir)) return hashes;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ndjson.gz")).sort()) {
    await streamGzLines(path.join(dir, file), (rec) => {
      const h = rec.content_hash || rec.block_hash || contentHash(rec.text || "");
      const src = rec.pdf || rec.source_file || "";
      const key = h + "|" + src + "|" + (rec.page || 0);
      hashes.add(key);
    });
  }
  return hashes;
}

async function appendIdempotent(subject, newBlocks) {
  const dir = path.join(CONTENT_DIR, subject);
  mkdirp(dir);
  const file = path.join(dir, "part01.ndjson.gz");

  /* load existing hashes */
  const existingHashes = await loadExistingHashes(subject);

  /* filter new blocks */
  const toWrite = [];
  for (const b of newBlocks) {
    const h = b.content_hash || b.block_hash || contentHash(b.text || "");
    const src = b.pdf || b.source_file || "";
    const key = h + "|" + src + "|" + (b.page || 0);
    if (!existingHashes.has(key)) {
      toWrite.push(b);
      existingHashes.add(key); /* prevent intra-batch duplicates */
    }
  }

  if (!toWrite.length) return { written: 0, skipped: newBlocks.length };

  /* append new members */
  const w = fs.createWriteStream(file, { flags: "a" });
  const gz = zlib.createGzip({ level: 6 });
  gz.pipe(w);
  for (const rec of toWrite) {
    if (!rec.content_hash) rec.content_hash = rec.block_hash || contentHash(rec.text || "");
    delete rec.block_hash;
    gz.write(JSON.stringify(rec) + "\n");
  }
  await new Promise((resolve, reject) => {
    gz.on("error", reject);
    w.on("error", reject);
    w.on("finish", resolve);
    gz.end();
  });

  return { written: toWrite.length, skipped: newBlocks.length - toWrite.length };
}

/* ---------- rebuild content hash index ---------- */

async function rebuildHashIndex() {
  const subjects = fs.readdirSync(CONTENT_DIR).filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()).sort();
  const idx = {};

  for (const subj of subjects) {
    const entries = [];
    await streamGzLines(path.join(CONTENT_DIR, subj, "part01.ndjson.gz"), (rec) => {
      const h = rec.content_hash || rec.block_hash || contentHash(rec.text || "");
      const src = rec.pdf || rec.source_file || "";
      entries.push({
        hash: h, source: path.basename(src), page: rec.page || 0,
        content_type: rec.content_type, word_count: rec.word_count
      });
    });
    idx[subj] = entries;
  }

  const outFile = path.join(require("./common.cjs").CONTENT_IDX_DIR, "content_hashes.json");
  atomicWrite(outFile, JSON.stringify(idx, null, 2));
  return idx;
}

/* ---------- main ---------- */

async function main() {
  console.log("Phase 45 — Content Publish (Idempotent)");

  /* Test: re-publish from Phase 44 staging — should write 0 new blocks */
  const { streamGzLines: gzLines } = require("./common.cjs");
  const blocks = [];
  await gzLines("data/pdf-content-staging/20260821040000/content/non-mcq.ndjson.gz", (b) => { blocks.push(b); });
  console.log("Staging blocks:", blocks.length);

  const bySubj = {};
  for (const b of blocks) {
    const subj = require("../phase44/common.cjs").subjectFromFolder(b.pdf) || "general-knowledge";
    if (!bySubj[subj]) bySubj[subj] = [];
    b.indexed_at = nowUtc();
    bySubj[subj].push(b);
  }

  let totalWritten = 0, totalSkipped = 0;
  for (const [subj, arr] of Object.entries(bySubj).sort()) {
    const { written, skipped } = await appendIdempotent(subj, arr);
    console.log(`  ${subj}: written=${written} skipped=${skipped}`);
    totalWritten += written;
    totalSkipped += skipped;
  }

  console.log(`\nTotal: ${totalWritten} written, ${totalSkipped} skipped (expected 0 written)`);

  /* rebuild hash index */
  console.log("\nRebuilding content hash index...");
  const idx = await rebuildHashIndex();
  const totalRecords = Object.values(idx).reduce((a, b) => a + b.length, 0);
  console.log(`Hash index: ${totalRecords} records across ${Object.keys(idx).length} subjects`);

  /* verify idempotency */
  console.log("\nVerifying idempotency (re-publish again — expect 0 written)...");
  let verifyWritten = 0;
  for (const [subj, arr] of Object.entries(bySubj).sort()) {
    const { written } = await appendIdempotent(subj, arr);
    verifyWritten += written;
  }
  console.log(`Second re-publish: ${verifyWritten} written (expected 0) — ${verifyWritten === 0 ? 'IDEMPOTENT' : 'FAILED'}`);

  /* write report */
  const report = {
    generated_at: nowUtc(),
    total_staging_blocks: blocks.length,
    idempotent_publish: { written: totalWritten, skipped: totalSkipped },
    verify_publish: { written: verifyWritten },
    idempotent: verifyWritten === 0,
    hash_index: {
      subjects: Object.keys(idx).length,
      records: totalRecords,
      location: require("./common.cjs").CONTENT_IDX_DIR + "/content_hashes.json"
    }
  };
  atomicWrite(path.join(ROOT, "docs", "phase45_content_idempotency.json"), JSON.stringify(report, null, 2));
  console.log("\nReport -> docs/phase45_content_idempotency.json");
}

main().catch((e) => { console.error(e); process.exit(1); });