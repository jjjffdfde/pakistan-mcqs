/* ============================================================
   Phase 12 — AI learning engine: frontend (AI Coach)
   Self-contained: renders the #view-ai section, enhances the
   dashboard (readiness card + smart planner), and talks only to
   the AI API (/api/ai/*). No dependency on app.js.

   Production architecture (data/site-config.json is the source
   of truth):
     - config.api.production  non-empty → API base for public deploys
     - config.api.development            → local runtime-v2 server
     - Public pages WITHOUT a production API base show a clear
       "AI service unavailable" state and never assume localhost.
   ============================================================ */
(function () {
  "use strict";

  let API = "http://localhost:8766";
  let AVAILABLE = false;
  let UNAVAILABLE_REASON = "";
  const DEVICE = "default";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const state = {
    tab: "dashboard",
    adaptive: null,
    notice: ""
  };

  const isLocalHost = () => ["localhost", "127.0.0.1", "::1"].includes(location.hostname) || location.protocol === "file:";

  async function initApi() {
    try {
      const cfg = await fetch("data/site-config.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
      const prod = cfg && cfg.api && cfg.api.production;
      if (prod) { API = prod; AVAILABLE = true; return; }
      if (isLocalHost()) {
        API = (cfg && cfg.api && cfg.api.development) || "http://localhost:8766";
        AVAILABLE = true;
        return;
      }
      AVAILABLE = false;
      UNAVAILABLE_REASON = "AI Coach is not available on this public site yet — the AI backend has not been deployed. The AI features (readiness, planner, adaptive practice, flashcards, mock predictions) require the self-hosted runtime server (node runtime-v2/server.cjs). See the README for deployment instructions.";
    } catch (e) {
      AVAILABLE = isLocalHost();
      if (!AVAILABLE) UNAVAILABLE_REASON = "AI Coach is not available on this public site yet — the AI backend has not been deployed.";
    }
  }

  /* ---------- API helper with graceful offline fallback ----------
     Single network retry (max 1 retry, no loops): transient network
     failures on a local server (port already listening but first packet
     dropped, etc.) get one more chance; persistent failures surface
     immediately to the fallback UI. Retried only for GET; mutating
     POSTs are never retried (would double-record answers). */
  async function api(path, opts) {
    const call = async () => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      try {
        const res = await fetch(API + path, { signal: ctl.signal, ...(opts || {}) });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "HTTP " + res.status);
        }
        return await res.json();
      } finally {
        clearTimeout(t);
      }
    };
    try {
      return await call();
    } catch (err) {
      const method = (opts && opts.method) || "GET";
      if (method !== "GET") throw err;
      return call(); /* single retry for idempotent GETs */
    }
  }
  const post = (path, body) => api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });

  function serverDown(err) {
    if (!AVAILABLE) {
      state.notice = UNAVAILABLE_REASON;
    } else {
      state.notice = "AI Coach needs the runtime server. Start it with: node runtime-v2/server.cjs  (port 8766). " + (err ? "(" + err.message + ")" : "");
    }
    const n = $("aiNotice");
    if (n) { n.hidden = false; n.textContent = state.notice; }
  }

  /* ---------- Tab navigation ---------- */
  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll("#aiTabs .ai-tab").forEach((b) => b.classList.toggle("active", b.dataset.aiTab === tab));
    render();
  }

  /* ---------- Shared renderers ---------- */
  function readinessBar(pct) {
    const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
    return `<div class="progress"><div class="progress-fill" style="width:${p}%"></div></div><p class="muted small">${p}% ready</p>`;
  }

  function optionButtons(mcq) {
    return ["A", "B", "C", "D"].map((k) =>
      `<button class="opt" data-opt="${k}" data-mcq="${esc(mcq.id)}"><span class="opt-key">${k}</span>${esc(mcq["option" + k] || "")}</button>`
    ).join("");
  }

  async function mcqDetails(ids) {
    const out = {};
    await Promise.all(ids.slice(0, 10).map(async (id) => {
      try { out[id] = await api("/api/mcq/" + encodeURIComponent(id)); } catch (e) { out[id] = null; }
    }));
    return out;
  }

  function rankRow(r, i, cols) {
    return `<tr><td>${i + 1}</td>${cols.map((c) => "<td>" + esc(r[c] ?? "-") + "</td>").join("")}</tr>`;
  }

  /* ============================================================
     TABS
     ============================================================ */

  /* ---------- Readiness (dashboard) ---------- */
  async function renderDashboard() {
    const panel = $("aiPanel");
    let prof;
    try {
      prof = await api("/api/ai/profile");
    } catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    const { level, readiness, accuracy, avg_speed_sec, consistency, streak, total_answered, skipped, active_days } = prof;
    const levelChip = { novice: "chip-red", intermediate: "chip-gray", advanced: "chip-green", expert: "chip-gold" }[level] || "chip-gray";
    panel.innerHTML = `
      <div class="dash-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        <div class="card dash-card">
          <h3>Skill Level</h3>
          <div class="dash-big">${esc(level)}</div>
          <p class="muted small"><span class="chip ${levelChip}">${esc(level)}</span> learner profile</p>
        </div>
        <div class="card dash-card">
          <h3>Exam Readiness</h3>
          <div class="dash-big">${readiness}%</div>
          ${readinessBar(readiness)}
        </div>
        <div class="card dash-card">
          <h3>Accuracy</h3>
          <div class="dash-big">${accuracy}%</div>
          <p class="muted small">${total_answered} answered · ${skipped} skipped</p>
        </div>
        <div class="card dash-card">
          <h3>Consistency</h3>
          <div class="dash-big">${consistency}%</div>
          <p class="muted small">${active_days} active days</p>
        </div>
        <div class="card dash-card">
          <h3>Avg Speed</h3>
          <div class="dash-big">${avg_speed_sec}s</div>
          <p class="muted small">per question</p>
        </div>
        <div class="card dash-card">
          <h3>Streak</h3>
          <div class="dash-big">${streak}</div>
          <p class="muted small">consecutive days</p>
        </div>
      </div>
      <div class="card" style="margin-top:18px">
        <h3>My Target</h3>
        <div id="aiTargetForm" class="filter-row" style="flex-wrap:wrap;gap:10px">
          <input id="aiName" class="search-bar" style="max-width:180px" placeholder="Name" value="">
          <input id="aiHours" type="number" min="0.5" max="8" step="0.5" class="search-bar" style="max-width:120px" placeholder="hrs/day" value="">
          <input id="aiExam" class="search-bar" style="max-width:200px" placeholder="Target exam (e.g. CSS, PPSC)" value="">
          <input id="aiDate" type="date" class="search-bar" style="max-width:170px" value="">
          <input id="aiCity" class="search-bar" style="max-width:140px" placeholder="City" value="">
          <input id="aiProvince" class="search-bar" style="max-width:140px" placeholder="Province" value="">
          <button id="aiSaveTarget" class="btn btn-primary btn-sm">Save Target</button>
        </div>
        <p class="muted small" style="margin-top:8px">Your exam target drives the planner, predictions and recommendations. All data stays on this device.</p>
      </div>
      <div class="card" style="margin-top:18px">
        <h3>Predictions</h3>
        <div id="aiPredList"></div>
      </div>`;

    $("aiSaveTarget").onclick = async () => {
      try {
        await post("/api/ai/profile", {
          name: $("aiName").value, daily_hours: parseFloat($("aiHours").value),
          target_exam: $("aiExam").value, target_date: $("aiDate").value,
          city: $("aiCity").value, province: $("aiProvince").value
        });
        renderDashboard();
      } catch (e) { serverDown(e); }
    };
    try {
      const preds = await api("/api/ai/mock/predictions");
      $("aiPredList").innerHTML = preds.length
        ? preds.slice(0, 4).map((p) => `
          <div class="planner-day">
            <div><strong>${esc(p.exam_title)}</strong>
              <span class="muted small">— expected ${p.expected_score} · pass ${p.prob_pass}%</span></div>
            <div class="chip ${p.prob_pass >= 60 ? "chip-green" : p.prob_pass >= 40 ? "chip-gray" : "chip-red"}">${p.prob_pass}%</div>
          </div>`).join("")
        : '<p class="muted">Take a prediction in the Mock Predictor tab to see your exam odds.</p>';
    } catch (e) { $("aiPredList").innerHTML = ""; }
  }

  /* ---------- Planner ---------- */
  async function renderPlanner() {
    const panel = $("aiPanel");
    let data;
    try { data = await api("/api/ai/planner"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    const w = data.weekly || {};
    panel.innerHTML = `
      <div class="dash-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="card dash-card"><h3>Target</h3><div class="dash-big">${w.target_questions || 0}</div><p class="muted small">questions / week</p></div>
        <div class="card dash-card"><h3>Weak Topics</h3><div class="dash-big">${w.weak_topics || 0}</div><p class="muted small">to fix</p></div>
        <div class="card dash-card"><h3>Revision Due</h3><div class="dash-big">${w.revision_due || 0}</div><p class="muted small">spaced items</p></div>
        <div class="card dash-card"><h3>Mocks Planned</h3><div class="dash-big">${w.mock_tests || 0}</div><p class="muted small">${w.final_week ? "final week!" : "this week"}</p></div>
      </div>
      <div id="aiPlanDays" style="margin-top:18px"></div>
      <button id="aiRegenPlan" class="btn btn-outline" style="margin-top:12px">Regenerate Plan</button>`;

    $("aiRegenPlan").onclick = async () => {
      try { await post("/api/ai/planner/regenerate", { days: 7 }); renderPlanner(); }
      catch (e) { serverDown(e); }
    };

    const days = [];
    days.push({ date: data.date, items: data.items });
    try {
      for (let d = 1; d <= 6; d++) {
        const dt = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
        days.push(await api("/api/ai/planner?date=" + dt));
      }
    } catch (e) {}

    $("aiPlanDays").innerHTML = days.map((day, di) => {
      const fmt = new Date(day.date + "T00:00:00").toDateString();
      return `
      <div class="planner-day">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${di === 0 ? "Today" : fmt}</strong>
          <span class="muted small">${(day.items || []).filter((i) => i.done).length}/${(day.items || []).length} done</span>
        </div>
        <div class="planner-list" style="margin-top:6px">
          ${(day.items || []).map((it, ii) => `
            <div class="planner-day ${it.done ? "" : ""}" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div>
                <strong>${esc(it.title)}</strong>
                ${it.q ? `<span class="muted small">· ${it.q} questions</span>` : ""}
              </div>
              <button class="btn btn-sm ${it.done ? "btn-outline" : "btn-primary"}" data-day="${esc(day.date)}" data-idx="${ii}" ${it.done ? "disabled" : ""}>${it.done ? "Done" : "Complete"}</button>
            </div>`).join("")}
        </div>
      </div>`;
    }).join("");

    $("aiPlanDays").querySelectorAll("button[data-day]").forEach((b) => {
      b.onclick = async () => {
        try { await post("/api/ai/planner/complete", { date: b.dataset.day, index: parseInt(b.dataset.idx, 10) }); renderPlanner(); }
        catch (e) { serverDown(e); }
      };
    });
  }

  /* ---------- Adaptive quiz ---------- */
  async function renderAdaptive() {
    const panel = $("aiPanel");
    if (!state.adaptive) {
      panel.innerHTML = `
        <div class="card">
          <h3>Adaptive Quiz</h3>
          <p class="muted">The engine picks questions from your weak topics and due revision items, then shifts difficulty live based on your accuracy.</p>
          <div class="filter-row" style="margin-top:12px;gap:10px">
            <label class="muted small">Questions:
              <select id="aiAdaptCount" class="search-bar" style="max-width:110px">
                ${[5, 10, 15, 20, 30].map((n) => `<option value="${n}" ${n === 10 ? "selected" : ""}>${n}</option>`).join("")}
              </select>
            </label>
            <label class="muted small">Mode:
              <select id="aiAdaptMode" class="search-bar" style="max-width:140px">
                <option value="adaptive">Weak-first</option>
                <option value="mixed">Mixed</option>
                <option value="revision">Revision-heavy</option>
              </select>
            </label>
            <button id="aiAdaptStart" class="btn btn-primary">Start Adaptive Quiz</button>
          </div>
        </div>`;
      $("aiAdaptStart").onclick = async () => {
        try {
          const r = await post("/api/ai/adaptive/start", {
            count: parseInt($("aiAdaptCount").value, 10),
            mode: $("aiAdaptMode").value
          });
          if (r.error) { panel.innerHTML = '<p class="muted">' + esc(r.error) + "</p>"; return; }
          state.adaptive = { session_id: r.session_id, total: r.total, answered: 0, correct: 0, skipped: 0, t0: Date.now() };
          renderAdaptiveQ();
        } catch (e) { serverDown(e); }
      };
      return;
    }

    panel.innerHTML = `
      <div class="card">
        <h3>Adaptive Quiz — ${state.adaptive.answered}/${state.adaptive.total}</h3>
        <div id="aiAdaptBody" class="mcq-card"></div>
        <div id="aiAdaptResult"></div>
      </div>`;
    renderAdaptiveQ();
  }

  async function renderAdaptiveQ() {
    const body = $("aiAdaptBody");
    if (!body) return;
    let q;
    try { q = await api("/api/ai/adaptive/next"); }
    catch (e) { serverDown(e); body.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    if (q.done) { endAdaptive(); return; }
    state.adaptive.t0 = Date.now();
    body.innerHTML = `
      <div class="mcq-question">${esc(q.question.question)}</div>
      ${q.source ? `<p class="muted small">source: ${esc(q.source)} · ${esc(q.question.difficulty)} · remaining ${q.remaining}</p>` : ""}
      <div class="opt-list" style="margin-top:10px">${optionButtons(q.question)}</div>
      <button id="aiAdaptSkip" class="btn btn-outline btn-sm" style="margin-top:10px">Skip</button>`;
    body.querySelectorAll(".opt").forEach((b) => {
      b.onclick = () => submitAdaptive(q.question.id, b.dataset.opt);
    });
    $("aiAdaptSkip").onclick = () => submitAdaptive(q.question.id, null);
  }

  async function submitAdaptive(mcqId, answer) {
    const body = $("aiAdaptBody");
    if (!body) return;
    body.innerHTML = '<p class="muted">Grading…</p>';
    const timeSec = Math.round((Date.now() - state.adaptive.t0) / 1000);
    let r;
    try { r = await post("/api/ai/adaptive/submit", { mcq_id: mcqId, answer, time_sec: timeSec }); }
    catch (e) { serverDown(e); body.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    if (r.error) { body.innerHTML = '<p class="muted">' + esc(r.error) + "</p>"; return; }
    state.adaptive.answered++;
    if (r.skipped) state.adaptive.skipped++;
    else if (r.correct) state.adaptive.correct++;

    const feedback = r.correct
      ? `<div class="mcq-explanation"><span class="ans-key">Correct!</span> ${esc(r.explanation || "")}</div>`
      : `<div class="mcq-explanation"><span class="ans-key">Wrong — correct: ${esc(r.correct_answer)}</span> ${esc(r.why_wrong || r.explanation || "")}</div>`;

    body.innerHTML = `
      ${feedback}
      ${r.memory_trick ? `<p class="muted small">🧠 ${esc(r.memory_trick)}</p>` : ""}
      <p class="muted small" style="margin-top:8px">${state.adaptive.answered}/${state.adaptive.total} · accuracy ${Math.round((state.adaptive.correct / Math.max(1, state.adaptive.answered - state.adaptive.skipped)) * 100)}%</p>
      ${r.done
        ? '<button id="aiAdaptFinish" class="btn btn-primary" style="margin-top:10px">Finish &amp; Update Profile</button>'
        : '<button id="aiAdaptNext" class="btn btn-primary" style="margin-top:10px">Next Question</button>'}
      <div id="aiAdaptPending" style="margin-top:10px"></div>`;
    const nxt = $("aiAdaptNext");
    if (nxt) nxt.onclick = renderAdaptiveQ;
    const fin = $("aiAdaptFinish");
    if (fin) fin.onclick = endAdaptive;
  }

  async function endAdaptive() {
    const res = $("aiAdaptResult");
    if (!res) return;
    let r;
    try { r = await post("/api/ai/adaptive/finish", {}); }
    catch (e) { serverDown(e); return; }
    const summary = state.adaptive;
    res.innerHTML = `
      <div class="result-card" style="margin-top:14px">
        <div class="result-score">${r.accuracy}%</div>
        <div class="result-stats">
          <div><strong>${r.correct}</strong><span>Correct</span></div>
          <div><strong>${r.skipped}</strong><span>Skipped</span></div>
          <div><strong>${Math.round(r.duration_sec / 60)}m ${r.duration_sec % 60}s</strong><span>Time</span></div>
          <div><strong>${r.profile ? r.profile.level : ""}</strong><span>New level</span></div>
          <div><strong>${r.profile ? r.profile.readiness : ""}%</strong><span>Readiness</span></div>
        </div>
        <p class="muted small">${r.weak_topics} weak topics tracked. Wrong answers were added to your spaced-revision queue.</p>
        <button id="aiAdaptAgain" class="btn btn-primary">Start Another</button>
      </div>`;
    $("aiAdaptAgain").onclick = () => { state.adaptive = null; renderAdaptive(); };
    state.adaptive = null;
  }

  /* ---------- Revision (spaced repetition) ---------- */
  async function renderRevision() {
    const panel = $("aiPanel");
    let d;
    try { d = await api("/api/ai/spaced/due?limit=10"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    if (!d.due.length) {
      panel.innerHTML = `
        <div class="card">
          <h3>Spaced Revision</h3>
          <p class="muted">Nothing due right now. Answer questions — every wrong answer is automatically scheduled for revision (1 → 3 → 7 → 14 → 30 → 60 → 90 days).</p>
          <p class="muted small">Queue stats: ${d.stats.total} items scheduled, ${d.stats.due} due now.</p>
        </div>`;
      return;
    }
    const details = await mcqDetails(d.due.map((x) => x.mcq_id));
    panel.innerHTML = `
      <div class="card">
        <h3>Spaced Revision — ${d.count} due now</h3>
        <p class="muted small">${d.stats.total} items scheduled · box ${d.due[0].box} interval ${d.due[0].interval_days}d</p>
        <div id="aiRevList" class="planner-list" style="margin-top:10px"></div>
      </div>`;
    const listEl = $("aiRevList");
    listEl.innerHTML = d.due.map((it) => {
      const m = details[it.mcq_id];
      return `
      <div class="mcq-card" style="margin-bottom:10px">
        <div class="mcq-question">${esc(m ? m.question : it.mcq_id)}</div>
        <p class="muted small">box ${it.box} · interval ${it.interval_days}d · reviews ${it.reviews}</p>
        <div id="rev-a-${esc(it.mcq_id)}" hidden class="mcq-explanation">
          <span class="ans-key">${esc(m ? m.correctAnswer : "")}</span> ${esc(m ? m.explanation : "")}
        </div>
        <div style="margin-top:8px">
          <button class="btn btn-sm btn-outline" data-rev="${esc(it.mcq_id)}" data-q="0">Again</button>
          <button class="btn btn-sm btn-outline" data-rev="${esc(it.mcq_id)}" data-q="3">Hard</button>
          <button class="btn btn-sm btn-primary" data-rev="${esc(it.mcq_id)}" data-q="4">Good</button>
          <button class="btn btn-sm btn-gold" data-rev="${esc(it.mcq_id)}" data-q="5">Easy</button>
          <button class="btn btn-sm btn-outline" data-reveal="${esc(it.mcq_id)}">Reveal</button>
        </div>
      </div>`;
    }).join("");

    listEl.querySelectorAll("[data-reveal]").forEach((b) => {
      b.onclick = () => { const a = document.getElementById("rev-a-" + b.dataset.reveal); if (a) a.hidden = !a.hidden; };
    });
    listEl.querySelectorAll("[data-rev]").forEach((b) => {
      b.onclick = async () => {
        try {
          await post("/api/ai/spaced/review", { mcq_id: b.dataset.rev, quality: parseInt(b.dataset.q, 10) });
          renderRevision();
        } catch (e) { serverDown(e); }
      };
    });
  }

  /* ---------- Flashcards ---------- */
  async function renderCards() {
    const panel = $("aiPanel");
    let d;
    try { d = await api("/api/ai/flashcards/due?limit=12"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    if (!d.cards.length) {
      panel.innerHTML = `
        <div class="card">
          <h3>Flashcards</h3>
          <p class="muted">No cards due. Cards are built from MCQ learning objectives, memory tricks and explanations.</p>
          <button id="aiCardBuild" class="btn btn-primary" style="margin-top:10px">Build ${d.stats.total ? "More" : "First"} Cards (25)</button>
        </div>`;
      $("aiCardBuild").onclick = async () => {
        try { await post("/api/ai/flashcards/build", { limit: 25 }); renderCards(); }
        catch (e) { serverDown(e); }
      };
      return;
    }
    panel.innerHTML = `
      <div class="card">
        <h3>Flashcards — ${d.cards.length} due</h3>
        <p class="muted small">${d.stats.total} cards built. Flip to recall, then rate yourself.</p>
        <div id="aiCardList" class="planner-list" style="margin-top:10px"></div>
      </div>`;
    const listEl = $("aiCardList");
    listEl.innerHTML = d.cards.map((c) => `
      <div class="mcq-card" style="margin-bottom:10px">
        <div class="mcq-question">${esc(c.front)}</div>
        <div id="card-b-${c.id}" hidden class="mcq-explanation">${esc(c.back)}</div>
        <div style="margin-top:8px">
          <button class="btn btn-sm btn-outline" data-flip="${c.id}">Flip</button>
          <span class="muted small"> · box ${c.box} · reviews ${c.reviews}</span>
        </div>
        <div id="card-q-${c.id}" class="filter-row" style="margin-top:8px;gap:6px" hidden>
          <button class="btn btn-sm btn-outline" data-card="${c.id}" data-q="0">Again</button>
          <button class="btn btn-sm btn-outline" data-card="${c.id}" data-q="3">Hard</button>
          <button class="btn btn-sm btn-primary" data-card="${c.id}" data-q="4">Good</button>
          <button class="btn btn-sm btn-gold" data-card="${c.id}" data-q="5">Easy</button>
        </div>
      </div>`).join("");

    listEl.querySelectorAll("[data-flip]").forEach((b) => {
      b.onclick = () => {
        const back = document.getElementById("card-b-" + b.dataset.flip);
        const q = document.getElementById("card-q-" + b.dataset.flip);
        if (back) back.hidden = !back.hidden;
        if (q) q.hidden = back.hidden;
      };
    });
    listEl.querySelectorAll("[data-card]").forEach((b) => {
      b.onclick = async () => {
        try {
          await post("/api/ai/flashcards/review", { card_id: parseInt(b.dataset.card, 10), quality: parseInt(b.dataset.q, 10) });
          renderCards();
        } catch (e) { serverDown(e); }
      };
    });
  }

  /* ---------- Mock predictor ---------- */
  async function renderMock() {
    const panel = $("aiPanel");
    let mocks, preds;
    try {
      mocks = await api("/api/mocktests?limit=30");
      preds = await api("/api/ai/mock/predictions");
    } catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    const list = (mocks.mocks || mocks.results || mocks || []).slice(0, 30);
    panel.innerHTML = `
      <div class="card">
        <h3>Mock &amp; Past Paper Predictor</h3>
        <p class="muted">Estimate your expected score on any mock or past paper from your chapter-level history — before you take it.</p>
        <div class="planner-list" style="margin-top:12px">
          ${list.map((m) => `
            <div class="planner-day" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div><strong>${esc(m.title)}</strong><span class="muted small"> · ${m.total_questions || "?"} questions</span></div>
              <button class="btn btn-sm btn-primary" data-pred="${esc(m.id)}">Predict</button>
            </div>`).join("")}
        </div>
        <div id="aiPredResult" style="margin-top:14px"></div>
      </div>
      <div class="card" style="margin-top:18px">
        <h3>Prediction History</h3>
        <div id="aiPredHistory" class="planner-list">${preds.length
          ? preds.slice(0, 8).map((p) => `
            <div class="planner-day">
              <div><strong>${esc(p.exam_title)}</strong>
                <span class="muted small"> · expected ${p.expected_score} · coverage ${p.coverage}%</span></div>
              <div class="chip ${p.prob_pass >= 60 ? "chip-green" : p.prob_pass >= 40 ? "chip-gray" : "chip-red"}">pass ${p.prob_pass}%</div>
            </div>`).join("")
          : '<p class="muted">No predictions yet.</p>'}</div>
      </div>`;
    panel.querySelectorAll("[data-pred]").forEach((b) => {
      b.onclick = async () => {
        const resEl = $("aiPredResult");
        resEl.innerHTML = '<p class="muted">Computing from your chapter history…</p>';
        try {
          const r = await post("/api/ai/mock/predict", { exam_id: b.dataset.pred });
          if (r.error) { resEl.innerHTML = '<p class="muted">' + esc(r.error) + "</p>"; return; }
          const area = (arr) => arr.length
            ? arr.map((a) => `<span class="chip ${a.accuracy >= 70 ? "chip-green" : "chip-red"}">${esc(a.chapter)} ${a.accuracy}%</span>`).join(" ")
            : '<span class="muted small">—</span>';
          resEl.innerHTML = `
            <div class="result-card">
              <div class="result-score">${r.expected_score}/${r.exam.total_questions}</div>
              <div class="result-stats">
                <div><strong>${r.expected_pct}%</strong><span>Expected</span></div>
                <div><strong>${r.prob_pass}%</strong><span>Pass odds</span></div>
                <div><strong>${r.readiness}%</strong><span>Readiness</span></div>
                <div><strong>${r.coverage}%</strong><span>Known chapters</span></div>
              </div>
              <p class="muted small" style="margin-top:8px">Strong: ${area(r.strong_areas)}</p>
              <p class="muted small">Weak: ${area(r.weak_areas)}</p>
            </div>`;
        } catch (e) { serverDown(e); }
      };
    });
  }

  /* ---------- Recommendations ---------- */
  async function renderRecommend() {
    const panel = $("aiPanel");
    let recs;
    try { recs = await api("/api/ai/recommendations?limit=20"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    const icon = { "weak-topic": "🎯", revision: "🔁", flashcard: "🃏", mock: "📝", "current-affairs": "📰", subject: "📚" };
    panel.innerHTML = `
      <div class="card">
        <h3>Personalized Recommendations</h3>
        <p class="muted">Rebuilt from your accuracy, weak topics, revision queue and target exam.</p>
        <div class="planner-list" style="margin-top:12px">
          ${recs.length ? recs.map((r) => `
            <div class="planner-day" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div>${icon[r.rec_type] || "💡"} <strong>${esc(r.title)}</strong>
                <div class="muted small">${esc(r.reason)}</div></div>
              <button class="btn btn-sm btn-primary" data-goto="${esc(r.rec_type)}">Go</button>
            </div>`).join("")
          : '<p class="muted">Answer more questions and your recommendations will appear here.</p>'}
        </div>
      </div>`;
    panel.querySelectorAll("[data-goto]").forEach((b) => {
      b.onclick = () => {
        const tabMap = { "weak-topic": "adaptive", revision: "revision", flashcard: "cards", mock: "mock", "current-affairs": "news", subject: "adaptive" };
        setTab(tabMap[b.dataset.goto] || "dashboard");
      };
    });
  }

  /* ---------- Current affairs ---------- */
  async function renderNews() {
    const panel = $("aiPanel");
    let data;
    try { data = await api("/api/ai/current-affairs?period=daily&limit=40"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    panel.innerHTML = `
      <div class="card">
        <h3>Current Affairs Digest</h3>
        <div class="filter-row" style="margin-top:8px;gap:8px">
          ${["daily", "weekly", "monthly", "yearly"].map((p) =>
            `<button class="btn btn-sm ${p === "daily" ? "btn-primary" : "btn-outline"}" data-period="${p}">${p}</button>`).join("")}
        </div>
        <div id="aiNewsList" class="planner-list" style="margin-top:10px"></div>
      </div>`;
    const renderList = (items) => {
      $("aiNewsList").innerHTML = items.length ? items.map((n) => `
        <div class="planner-day">
          <div><span class="chip ${n.category === "pakistan" ? "chip-green" : "chip-gold"}">${esc(n.category)}</span>
            <strong>${esc(n.title)}</strong>
            <span class="muted small"> · ${esc(n.period)} ${esc(n.period_date)}</span></div>
          <p class="muted small" style="margin-top:4px">${esc(n.summary)}</p>
        </div>`).join("") : '<p class="muted">No items for this period yet.</p>';
    };
    renderList(data.items);
    panel.querySelectorAll("[data-period]").forEach((b) => {
      b.onclick = async () => {
        panel.querySelectorAll("[data-period]").forEach((x) => x.classList.toggle("btn-primary", x === b));
        panel.querySelectorAll("[data-period]").forEach((x) => x.classList.toggle("btn-outline", x !== b));
        try {
          const d = await api("/api/ai/current-affairs?period=" + b.dataset.period + "&limit=40");
          renderList(d.items);
        } catch (e) { serverDown(e); }
      };
    });
  }

  /* ---------- Analytics ---------- */
  async function renderAnalytics() {
    const panel = $("aiPanel");
    let d;
    try { d = await api("/api/ai/analytics"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    const max = Math.max(1, ...d.daily.map((x) => x.total));
    panel.innerHTML = `
      <div class="card">
        <h3>Last 14 Days</h3>
        <div class="dash-grid" style="grid-template-columns:repeat(auto-fit,minmax(28px,1fr));align-items:end;gap:6px">
          ${d.daily.map((x) => `
            <div style="text-align:center">
              <div class="muted small" style="font-size:10px">${x.d.slice(8)}</div>
              <div class="progress" style="transform:rotate(180deg);height:60px;margin:2px 0">
                <div class="progress-fill" style="width:100%;height:${Math.round((x.total / max) * 100)}%"></div>
              </div>
              <div class="muted small" style="font-size:10px">${x.total}</div>
            </div>`).join("")}
        </div>
      </div>
      <div class="dash-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
        <div class="card" style="margin-top:18px">
          <h3>Subject Mastery</h3>
          <table class="lb-table">
            <thead><tr><th>Subject</th><th>Attempts</th><th>Accuracy</th></tr></thead>
            <tbody>${d.mastery.map((m) => `<tr><td>${esc(m.subject_name || m.subject_id)}</td><td>${m.total}</td><td>${m.accuracy}%</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <div class="card" style="margin-top:18px">
          <h3>Session Mix</h3>
          <table class="lb-table">
            <thead><tr><th>Type</th><th>Sessions</th><th>Answered</th><th>Avg Acc</th></tr></thead>
            <tbody>${d.sessions.length ? d.sessions.map((s) => `<tr><td>${esc(s.session_type)}</td><td>${s.n}</td><td>${s.answered || 0}</td><td>${Math.round(s.avg_acc || 0)}%</td></tr>`).join("") : '<tr><td colspan="4" class="muted">No sessions yet</td></tr>'}</tbody>
          </table>
          <h3 style="margin-top:14px">Prediction Trend</h3>
          ${d.recent_predictions.length ? d.recent_predictions.slice(0, 5).map((p) => `<div class="planner-day"><div><strong>${esc(p.exam_title)}</strong><span class="muted small"> · ${esc(p.created_at)}</span></div><div class="chip ${p.prob_pass >= 60 ? "chip-green" : "chip-red"}">${p.prob_pass}%</div></div>`).join("") : '<p class="muted small">Take mock predictions to see your trend.</p>'}
        </div>
      </div>`;
  }

  /* ---------- Leaderboard ---------- */
  async function renderLeaderboard() {
    const panel = $("aiPanel");
    let d;
    try { d = await api("/api/ai/leaderboard?period=weekly&limit=25"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    panel.innerHTML = `
      <div class="card">
        <h3>Leaderboard — ${esc(d.period)}</h3>
        <div class="filter-row" style="margin-top:8px;gap:8px">
          ${["daily", "weekly", "monthly", "yearly", "overall"].map((p) =>
            `<button class="btn btn-sm ${p === d.period ? "btn-primary" : "btn-outline"}" data-per="${p}">${p}</button>`).join("")}
          <span style="width:12px"></span>
          ${["", "city", "province"].map((r) =>
            `<button class="btn btn-sm btn-outline" data-reg="${r || "none"}">${r ? r : "all regions"}</button>`).join("")}
        </div>
        <p class="muted small">period ${esc(d.key)}</p>
        <table class="lb-table" style="margin-top:8px">
          <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Correct</th><th>Total</th></tr></thead>
          <tbody>${d.rows.map((r, i) => rankRow(r, i, ["name", "points", "correct", "total"])).join("")}</tbody>
        </table>
      </div>`;
    panel.querySelectorAll("[data-per]").forEach((b) => {
      b.onclick = async () => {
        const d2 = await api("/api/ai/leaderboard?period=" + b.dataset.per + "&limit=25");
        renderLB(d2, panel);
      };
    });
    panel.querySelectorAll("[data-reg]").forEach((b) => {
      b.onclick = async () => {
        const reg = b.dataset.reg === "none" ? "" : b.dataset.reg;
        const d2 = await api("/api/ai/leaderboard?period=" + state.tab + "&region=" + reg + "&limit=25");
        renderLB(d2, panel);
      };
    });
    async function renderLB(d2, p) {
      p.querySelector("tbody").innerHTML = d2.rows.map((r, i) => rankRow(r, i, ["name", "points", "correct", "total"])).join("");
      p.querySelector("h3").textContent = "Leaderboard — " + d2.period;
    }
  }

  /* ---------- Notifications ---------- */
  async function renderNotifications() {
    const panel = $("aiPanel");
    let items;
    try { items = await api("/api/ai/notifications?limit=30"); }
    catch (e) { serverDown(e); panel.innerHTML = '<p class="muted">' + esc(state.notice) + "</p>"; return; }
    panel.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>Notifications</h3>
          <button id="aiNotifRead" class="btn btn-sm btn-outline">Mark all read</button>
        </div>
        <div class="planner-list" style="margin-top:10px">
          ${items.length ? items.map((n) => `
            <div class="planner-day" style="${n.read ? "opacity:.55" : ""}">
              <div><span class="chip ${n.type === "achievement" ? "chip-gold" : "chip-gray"}">${esc(n.type)}</span>
                <strong>${esc(n.title)}</strong></div>
              ${n.body ? `<p class="muted small" style="margin-top:4px">${esc(n.body)}</p>` : ""}
              <p class="muted small">${esc(n.created_at)}</p>
            </div>`).join("")
          : '<p class="muted">No notifications yet — achievements and milestones will appear here.</p>'}
        </div>
      </div>`;
    $("aiNotifRead").onclick = async () => {
      try { await post("/api/ai/notifications/read", { id: "all" }); renderNotifications(); }
      catch (e) { serverDown(e); }
    };
  }

  /* ============================================================
     DISPATCH
     ============================================================ */
  async function render() {
    const panel = $("aiPanel");
    if (!panel) return;
    $("aiNotice").hidden = true;
    if (!AVAILABLE) {
      const full = "AI Coach is unavailable on this public deployment. The AI features are powered by the self-hosted runtime server (node runtime-v2/server.cjs, port 8766), which is not deployed for this site. Deploy the server to a public HTTPS endpoint and set the api.production URL in data/site-config.json to enable it.";
      panel.innerHTML = `<div class="card" style="padding:18px">
        <h3>🤖 AI Coach — service unavailable</h3>
        <p class="muted">${esc(full)}</p>
        <p class="muted small">All practice, quiz, mock test, dashboard and leaderboard features keep working without the AI backend.</p>
      </div>`;
      state.notice = UNAVAILABLE_REASON;
      const n = $("aiNotice");
      if (n) { n.hidden = false; n.textContent = state.notice; }
      return;
    }
    const tab = state.tab;
    if (tab === "dashboard") await renderDashboard();
    else if (tab === "planner") await renderPlanner();
    else if (tab === "adaptive") await renderAdaptive();
    else if (tab === "revision") await renderRevision();
    else if (tab === "cards") await renderCards();
    else if (tab === "mock") await renderMock();
    else if (tab === "recommend") await renderRecommend();
    else if (tab === "news") await renderNews();
    else if (tab === "analytics") await renderAnalytics();
    else if (tab === "leaderboard") await renderLeaderboard();
    else if (tab === "notifications") await renderNotifications();
  }

  /* ---------- Dashboard enhancements (existing view) ---------- */
  async function renderDashboardEnhancements() {
    if (!AVAILABLE) return;
    const card = $("aiReadinessCard");
    const upgrade = $("aiPlannerUpgrade");
    if (!card && !upgrade) return;
    try {
      const prof = await api("/api/ai/profile");
      const weak = await api("/api/ai/weak-topics");
      const plan = await api("/api/ai/planner");
      if (card) {
        card.innerHTML = `
          <h3>🤖 AI Readiness — ${esc(prof.level)}</h3>
          <p class="muted small">Readiness ${prof.readiness}% · accuracy ${prof.accuracy}% · speed ${prof.avg_speed_sec}s · consistency ${prof.consistency}% · streak ${prof.streak} days</p>
          ${readinessBar(prof.readiness)}
          <div class="filter-row" style="margin-top:8px;gap:6px">
            ${(weak.weak || []).slice(0, 5).map((w) => `<span class="chip chip-red">${esc(w.topic_name || w.topic_id)} ${Math.round(100 - w.weakness_score * 100)}%</span>`).join("")}
            ${(weak.strong || []).slice(0, 3).map((s) => `<span class="chip chip-green">${esc(s.topic_name || s.topic_id)} ✓</span>`).join("")}
          </div>
          <button id="aiDashCoach" class="btn btn-primary btn-sm" style="margin-top:10px">Open AI Coach</button>`;
        $("aiDashCoach").onclick = () => { location.hash = "ai-coach"; };
      }
      if (upgrade && plan.items && plan.items.length) {
        upgrade.innerHTML = plan.items.map((it, i) => `
          <div class="planner-day" style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <div><strong>${esc(it.title)}</strong>${it.q ? `<span class="muted small"> · ${it.q}q</span>` : ""}</div>
            <button class="btn btn-sm btn-outline" data-done="${i}">${it.done ? "Done ✓" : "Mark done"}</button>
          </div>`).join("") + `
          <button id="aiDashPlanMore" class="btn btn-sm btn-gold" style="margin-top:8px">Full 7-day Plan</button>`;
        upgrade.querySelectorAll("[data-done]").forEach((b) => {
          b.onclick = async () => {
            try { await post("/api/ai/planner/complete", { date: plan.date, index: parseInt(b.dataset.done, 10) }); renderDashboardEnhancements(); }
            catch (e) {}
          };
        });
        $("aiDashPlanMore").onclick = () => { location.hash = "ai-coach"; };
      }
    } catch (e) {
      if (card) card.innerHTML = "";
    }
  }

  /* ---------- Hash routing ---------- */
  function onHash() {
    const hash = location.hash.replace("#", "");
    if (hash === "ai-coach") {
      const av = $("view-ai");
      if (av) av.hidden = false;
      render();
    } else if (hash === "dashboard") {
      renderDashboardEnhancements();
    } else {
      const av = $("view-ai");
      if (av) av.hidden = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#aiTabs .ai-tab").forEach((b) => {
      b.addEventListener("click", () => setTab(b.dataset.aiTab));
    });
    window.addEventListener("hashchange", onHash);
    initApi().then(onHash);
  });
})();
