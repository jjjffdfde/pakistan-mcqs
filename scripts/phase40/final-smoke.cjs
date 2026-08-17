/* scripts/phase40/final-smoke.cjs — Phase 40 STEP 20/22 physical test.
   Boots runtime-v2/server.cjs (npm start equivalent) and exercises every
   production feature area: homepage surface, browse (subjects/chapters/
   topics), MCQ, search, random, practice, quiz, mock, past papers,
   bookmarks, history, leaderboard, analytics, KG, news (current affairs),
   admin (import/backup/restore/export), AI POST validation battery, PWA
   shell, offline page, repeated + concurrent requests, RSS measurement.
   Emits docs/phase40_final_feature_parity.json. Exit code = failures. */
"use strict";
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PORT = process.env.MCQS_SMOKE_PORT || 8799;
const BASE = `http://localhost:${PORT}`;
const fails = [], passes = [];

function check(name, cond, extra) {
  (cond ? passes : fails).push(name);
  console.log((cond ? "PASS  " : "FAIL  ") + name + (cond ? "" : "  " + JSON.stringify(extra).slice(0, 200)));
}

async function api(method, p, body) {
  const res = await fetch(BASE + p, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body))
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
}

async function waitHealthy(child, deadlineMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < deadlineMs) {
    if (child.exitCode !== null) throw new Error("server exited early: " + child.exitCode);
    try { const r = await fetch(BASE + "/api/health", { signal: AbortSignal.timeout(2000) }); if (r.ok) return; } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not become healthy in " + deadlineMs + "ms");
}

function rssMb(pid) {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: "utf8" });
    const m = out.match(/"(\d+[,.]?\d*) K"/);
    return m ? Math.round(parseFloat(m[1].replace(",", "")) / 1024) : null;
  } catch (e) { return null; }
}

async function main() {
  const child = spawn(process.execPath, ["--max-old-space-size=384", path.join(ROOT, "runtime-v2", "server.cjs")], { cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (d) => { logs += d; });
  child.stderr.on("data", (d) => { logs += d; });
  const dev = "phys-" + Date.now();
  const report = { phase: 40, step: "20+22", run_at: new Date().toISOString(), port: PORT, features: [] };
  const rec = (name, ok, detail) => { check(name, ok, detail); report.features.push({ name, status: ok ? "PASS" : "FAIL", detail: ok ? null : detail }); };

  try {
    await waitHealthy(child, 60000);

    /* ---------- PWA / offline / homepage surface (static files) ---------- */
    for (const f of ["index.html", "sw.js", "manifest.webmanifest", "offline.html", "404.html", "assets/js/app.js", "assets/js/ai.js"]) {
      rec("surface file " + f, fs.existsSync(path.join(ROOT, f)), f);
    }
    rec("sw syntax check", execSync(`"${process.execPath}" --check "${path.join(ROOT, "sw.js")}"`, { stdio: "ignore" }) !== undefined);

    /* ---------- core API ---------- */
    let r = await api("GET", "/api/health");
    rec("health", r.status === 200 && r.data.ok === true && r.data.data_source === "ndjson" && r.data.mcqs > 0, r);
    r = await api("GET", "/api/stats");
    rec("stats", r.status === 200 && r.data && r.data.mcqs > 0 && r.data.subjects > 0 && r.data.mcqs_total > 0, { mcqs: r.data && r.data.mcqs, subjects: r.data && r.data.subjects });
    r = await api("GET", "/api/subjects");
    const subjectId = r.data && r.data[0] && r.data[0].id;
    rec("subjects", r.status === 200 && Array.isArray(r.data) && r.data.length > 0, r);
    r = await api("GET", "/api/browse");
    rec("browse (all)", r.status === 200 && r.data.total > 0 && r.data.results.length > 0, r);
    r = await api("GET", "/api/browse?subject=" + subjectId + "&limit=5");
    rec("browse subject filter", r.status === 200 && r.data.total > 0, r);
    const chapterKey = r.data.results[0] && r.data.results[0].chapter_id;
    r = await api("GET", "/api/browse?chapter=" + chapterKey + "&limit=5");
    rec("browse chapter filter", r.status === 200 && r.data.total > 0 && r.data.results.every((m) => m.chapter_id === chapterKey), r);
    r = await api("GET", "/api/topics");
    const topicId = r.data && r.data[0] && r.data[0].id;
    rec("topics", r.status === 200 && Array.isArray(r.data) && r.data.length > 0, r);
    r = await api("GET", "/api/browse?topic=" + topicId + "&limit=5");
    rec("browse topic filter", r.status === 200 && r.data.total >= 0 && [...new Set(r.data.results.map((m) => m.chapter_id))].length <= 8, r);
    const mcqId = (await api("GET", "/api/random?count=1")).data.results[0].id;
    r = await api("GET", "/api/mcq/" + mcqId);
    rec("mcq by id", r.status === 200 && r.data.id === mcqId && r.data.correct_answer, r);
    rec("mcq 404", (await api("GET", "/api/mcq/does-not-exist")).status === 404);
    r = await api("GET", "/api/mcqs?ids=" + mcqId + "," + mcqId);
    rec("mcqs batch", r.status === 200 && Array.isArray(r.data), r);

    /* ---------- search ---------- */
    r = await api("GET", "/api/search?q=physics&limit=5");
    rec("search", r.status === 200 && r.data.total > 0 && r.data.results.length > 0, r);
    r = await api("GET", "/api/search?q=zzzzzznonexistent");
    rec("search no match (real empty result, no fallback)", r.status === 200 && r.data.total === 0, r);

    /* ---------- random / practice ---------- */
    r = await api("GET", "/api/random?subject=" + subjectId + "&limit=10");
    rec("random subject", r.status === 200 && r.data.results.length >= 1 && r.data.results.length <= 10 && r.data.results.every((m) => m.subject_id === subjectId || m.subject === subjectId), r.data && { n: r.data.results.length, subjects: [...new Set(r.data.results.map((m) => m.subject_id))].slice(0, 4) });
    r = await api("GET", "/api/random?limit=50");
    rec("random large count", r.status === 200 && r.data.results.length === 50 && new Set(r.data.results.map((m) => m.id)).size === 50, r.data && { n: r.data.results && r.data.results.length });

    /* ---------- assessment ---------- */
    r = await api("GET", "/api/quizzes");
    rec("quizzes", r.status === 200 && Array.isArray(r.data), r);
    r = await api("GET", "/api/mocktests");
    rec("mock tests", r.status === 200 && Array.isArray(r.data) && r.data.length > 0, r);
    r = await api("GET", "/api/pastpapers");
    rec("past papers", r.status === 200 && Array.isArray(r.data), r);
    r = await api("GET", "/api/categories");
    rec("categories", r.status === 200 && Array.isArray(r.data), r);
    r = await api("GET", "/api/exams");
    rec("exams", r.status === 200 && Array.isArray(r.data) && r.data.length > 0, r);

    /* ---------- user features ---------- */
    r = await api("POST", "/api/bookmarks", { mcq_id: mcqId, device_id: dev });
    rec("bookmarks POST", r.status === 201, r);
    r = await api("GET", "/api/bookmarks");
    rec("bookmarks GET", r.status === 200 && r.data.some((b) => b.mcq_id === mcqId), r);
    r = await api("POST", "/api/history", { device_id: dev, mcq_id: mcqId, correct: true, time_taken_sec: 9, mode: "practice" });
    rec("history POST", r.status === 201 && r.data.ok === true, r);
    r = await api("GET", "/api/history");
    rec("history GET", r.status === 200 && r.data.some((h) => h.mcq_id === mcqId), r);
    r = await api("GET", "/api/leaderboard");
    rec("leaderboard", r.status === 200 && Array.isArray(r.data), r);
    r = await api("GET", "/api/analytics?device_id=" + dev);
    rec("analytics", r.status === 200 && r.data && (Array.isArray(r.data) || typeof r.data.total === "number"), r.data && JSON.stringify(r.data).slice(0, 120));

    /* ---------- Knowledge Graph ---------- */
    r = await api("GET", "/api/kg/stats");
    rec("kg stats", r.status === 200 && ((r.data.counts && r.data.counts.concepts > 0) || (r.data.concepts > 0)), r.data && { concepts: (r.data.counts && r.data.counts.concepts) || r.data.concepts });
    r = await api("GET", "/api/kg/concepts?q=physics");
    rec("kg concept search", r.status === 200 && Array.isArray(r.data.results), r);
    const cid = r.data.results[0] && r.data.results[0].id;
    if (cid) {
      rec("kg concept by id", (await api("GET", "/api/kg/concepts/" + cid)).status === 200);
      for (const sub of ["relations", "prerequisites", "objectives", "micro", "exams", "distractors"]) {
        rec("kg concept " + sub, (await api("GET", "/api/kg/concepts/" + cid + "/" + sub)).status === 200);
      }
    } else rec("kg concept by id (no concept found)", true, "empty KG search");
    r = await api("GET", "/api/kg/micro-concepts?q=physics");
    rec("kg micro-concepts", r.status === 200, r);
    r = await api("GET", "/api/kg/learning-objectives?q=physics");
    rec("kg learning-objectives", r.status === 200, r);
    r = await api("GET", "/api/kg/learning-paths");
    rec("kg learning-paths", r.status === 200, r);

    /* ---------- admin (file-based) ---------- */
    r = await api("POST", "/api/import", { notAnArray: true });
    rec("import rejects non-array", r.status === 400, r);
    r = await api("POST", "/api/backup");
    rec("backup", r.status === 200 && r.data.ok === true, r);
    r = await api("POST", "/api/restore", {});
    rec("restore rejects no dir", r.status === 400, r);
    r = await api("POST", "/api/restore", { dir: "nope-does-not-exist" });
    rec("restore rejects invalid dir", r.status === 400, r);
    r = await api("POST", "/api/restore", { dir: "backup/db-backup-2099-01-01-00-00-00" });
    rec("restore rejects missing", r.status === 404, r);
    r = await api("GET", "/api/export?format=bad");
    rec("export rejects bad format", r.status === 400, r);

    /* export json/csv stream-drained (a 1.38GB body must not be materialized) */
    const drainExport = async (fmt) => {
      const t0 = Date.now();
      const res = await fetch(BASE + "/api/export?format=" + fmt);
      const bytes = [];
      const reader = res.body.getReader();
      let first = "", last = "";
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const s = Buffer.from(value).toString("latin1");
        total += value.length;
        if (!first && s) first = s[0];
        last = s[s.length - 1];
        if (bytes.length < 2) bytes.push(s.slice(0, 200));
        else bytes[1] = s.slice(-200);
      }
      return { status: res.status, total, first, last, head: (bytes[0] || "").slice(0, 120), ms: Date.now() - t0 };
    };
    const ej = await drainExport("json");
    rec("export json (streamed, all rows)", ej.status === 200 && ej.total > 100000000 && ej.first === "[" && ej.last === "]", { bytes: ej.total, ms: ej.ms });
    const ec = await drainExport("csv");
    rec("export csv (streamed, header)", ec.status === 200 && ec.total > 100000000 && ec.head.startsWith("id,question,"), { bytes: ec.total, ms: ec.ms });

    /* ---------- AI validation battery (POST) ---------- */
    const aiPosts = [
      { p: "/api/ai/profile", bad: {}, good: { device_id: dev, name: "Unit Tester" } },
      { p: "/api/ai/spaced/review", bad: {}, good: { device_id: dev, mcq_id: mcqId, quality: 1 } },
      { p: "/api/ai/adaptive/start", bad: {}, good: { device_id: dev, count: 5 } },
      { p: "/api/ai/mock/predict", bad: {}, good: { device_id: dev, exam_id: 1 } },
      { p: "/api/ai/recommendations/build", bad: {}, good: { device_id: dev } },
      { p: "/api/ai/flashcards/build", bad: {}, good: { device_id: dev, limit: 3 } },
      { p: "/api/ai/flashcards/review", bad: {}, good: { device_id: dev, card_id: -1, quality: 0 } },
      { p: "/api/ai/planner/complete", bad: {}, good: { device_id: dev, date: "2099-01-01", index: 1 } },
      { p: "/api/ai/planner/regenerate", bad: {}, good: { device_id: dev, days: 7 } }
    ];
    for (const t of aiPosts) {
      const rb = await api("POST", t.p, t.bad);
      const rMissing = await api("POST", t.p, undefined);
      const rEmpty = await api("POST", t.p, "");
      const rMal = await api("POST", t.p, "{ not json");
      const rGood = await api("POST", t.p, t.good);
      rec("AI POST " + t.p + " {} handled (2xx/4xx, no crash)", rb.status < 500, rb);
      rec("AI POST " + t.p + " missing body handled", rMissing.status < 500, rMissing);
      rec("AI POST " + t.p + " empty body", rEmpty.status < 500, rEmpty);
      rec("AI POST " + t.p + " malformed json -> 400", rMal.status === 400, rMal);
      rec("AI POST " + t.p + " valid payload", rGood.status === 200 || rGood.status === 201, rGood);
    }
    r = await api("GET", "/api/ai/profile?device_id=" + dev);
    rec("AI GET profile", r.status === 200, r);
    r = await api("GET", "/api/ai/current-affairs?period=daily&limit=3");
    rec("news / current-affairs", r.status === 200 && Array.isArray(r.data.items), r);
    r = await api("GET", "/api/unknown-route");
    rec("unknown route -> 404", r.status === 404, r);

    /* ---------- repeated + concurrent ---------- */
    let okRepeated = true;
    for (let i = 0; i < 20; i++) { const rr = await api("GET", "/api/browse?limit=5"); if (rr.status !== 200) { okRepeated = false; break; } }
    rec("20x repeated browse", okRepeated);
    const conc = await Promise.all(Array.from({ length: 8 }, (_, i) => api("GET", i % 2 ? "/api/search?q=physics&limit=3" : "/api/random?count=3")));
    rec("8x concurrent search/random", conc.every((x) => x.status === 200));

    /* ---------- RSS ---------- */
    const rss = rssMb(child.pid);
    rec("RSS <= 512MB (physical measurement)", rss !== null && rss <= 512, { rss_mb: rss });

    const allOk = fails.length === 0;
    report.verdict = allOk ? "PASS" : "FAIL";
    report.feature_count = report.features.length;
    report.rss_mb = rss;
    fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "docs", "phase40_final_feature_parity.json"), JSON.stringify(report, null, 2));
    console.log("\n===== PHYSICAL SMOKE: " + passes.length + " passed, " + fails.length + " failed =====");
  } catch (e) {
    fails.push("FATAL");
    console.log("FATAL " + e.message + "\n---- server log tail ----\n" + logs.slice(-4000));
  } finally {
    child.kill();
    setTimeout(() => process.exit(fails.length ? 1 : 0), 400);
  }
}

main();
