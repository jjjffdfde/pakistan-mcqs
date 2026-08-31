/* Pakistan MCQs Hub - frontend app (Phase 2: PRO platform) */
(function () {
  "use strict";

  const DATA_BASE = "data";
  const PAGE_SIZE = 20;
  /* Authoritative site configuration (data/site-config.json) — single
     source of truth for counts and API endpoints. Loaded best-effort. */
  const CONFIG = { site: { name: "Pakistan MCQs Hub", baseUrl: "" }, dataset: { staticBank: {}, fullDatabase: {} }, api: { development: "http://localhost:8766", production: "" } };
  async function loadConfig() {
    try { Object.assign(CONFIG, await loadJSON(`${DATA_BASE}/site-config.json`)); } catch (e) { /* config optional at runtime */ }
    return CONFIG;
  }
  const STAT_FALLBACKS = { statMcqs: "mcqs", statSubjects: "subjects", statChapters: "chapters", statTopics: "topics", statPapers: "papers", statMocks: "mockTests", statQuizzes: "quizzes", statExams: "exams" };
  function applyStatFallbacks() {
    const st = CONFIG.dataset.staticBank || {};
    for (const [id, key] of Object.entries(STAT_FALLBACKS)) {
      const el = $(id);
      const v = st[key];
      if (el && v && (el.textContent === "0" || el.textContent === "")) el.textContent = v.toLocaleString();
    }
  }
  const state = {
    subjects: [], chapters: [], topics: [], mcqs: [], papers: [], quizzes: [],
    exams: [], programs: [], mockTests: [], categories: [],
    loaded: false,
    bookmarks: JSON.parse(localStorage.getItem("pmh_bookmarks") || "[]"),
    theme: localStorage.getItem("pmh_theme") || "light",
    user: JSON.parse(localStorage.getItem("pmh_user") || "null") || { name: "Student", createdAt: Date.now() },
    analytics: JSON.parse(localStorage.getItem("pmh_analytics") || "{}"),
    browse: { subject: "", chapter: "", topic: "", subtopic: "", difficulty: "", exam: "", year: "", type: "", page: 1, search: "", related: null },
    practice: null,
    quiz: null,
    exam: null,
    week: JSON.parse(localStorage.getItem("pmh_week") || "null"),
    month: JSON.parse(localStorage.getItem("pmh_month") || "null")
  };

  const $ = (id) => document.getElementById(id);
  const shuffled = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffled(arr).slice(0, n);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sanitize = (s) => esc(String(s ?? "")).slice(0, 500);
  const keyOf = (opt) => opt.slice(-1); // optionA -> A
  const now = () => new Date().toISOString().slice(0, 10);
  const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10); };
  const monthKey = () => now().slice(0, 7);

  /* ---------- Persistence ---------- */
  const saveUser = () => localStorage.setItem("pmh_user", JSON.stringify(state.user));
  const saveAnalytics = () => localStorage.setItem("pmh_analytics", JSON.stringify(state.analytics));
  const saveWeek = () => localStorage.setItem("pmh_week", JSON.stringify(state.week));
  const saveMonth = () => localStorage.setItem("pmh_month", JSON.stringify(state.month));

  /* ---------- Data loading ---------- */
  async function loadJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  /* ---------- DB mode (localhost API server, optional) ----------
     Static-first: the site works fully from data/*.json without any
     server. When the localhost API (runtime-v2/server.cjs, port 8766) is
     reachable, browse/search/practice/quiz/leaderboard use the full 240K+ DB. */
  const DB = {
    api: "http://localhost:8766",
    enabled: false,
    total: 0,
    stats: null,
    async probe() {
      const hosts = ["http://localhost:8766", "http://127.0.0.1:8766", "http://localhost:8765", "http://127.0.0.1:8765"];
      for (const host of hosts) {
        try {
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 2500);
          const res = await fetch(host + "/api/health", { signal: ctl.signal });
          clearTimeout(t);
          if (!res.ok) continue;
          const h = await res.json();
          if (!h || !h.ok || !h.mcqs) continue;
          this.api = host;
          this.total = h.mcqs;
          this.enabled = true;
          try { this.stats = await this.get("/api/stats"); } catch (e) {}
          return true;
        } catch (e) { /* try next host */ }
      }
      this.enabled = false;
      return false;
    },
    async get(path) {
      const res = await fetch(this.api + path, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status + " " + path);
      return res.json();
    },
    qs(params) {
      const p = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") p.set(k, v); });
      const s = p.toString();
      return s ? "?" + s : "";
    },
    mapMcq(m) {
      let tags = [], refs = [];
      try { tags = JSON.parse(m.tags || "[]"); } catch (e) {}
      try { refs = JSON.parse(m.references_json || "[]"); } catch (e) {}
      return {
        id: m.id, question: m.question,
        optionA: m.optionA, optionB: m.optionB, optionC: m.optionC, optionD: m.optionD,
        correctAnswer: m.correct_answer,
        detailedExplanation: m.explanation || "",
        difficulty: m.difficulty || "medium",
        subject: m.subject_id, chapter: m.chapter_id || "", topic: m.topic_id || "",
        exam: (m.exam_ids || "").split(",").filter(Boolean),
        year: m.year || null, tags, references: refs, subtopic: m.subtopic_id || "",
        relatedQuestions: m.relatedQuestions || [], source: m.source || "generated"
      };
    },
    async contentSearch(q, filters = {}) {
      if (!this.enabled) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };
      const params = { q: q || "", ...filters, limit: filters.limit || 20, page: filters.page || 1 };
      return this.get("/api/content/search" + this.qs(params));
    },
    async contentSubjects() {
      if (!this.enabled) return [];
      return this.get("/api/content/subjects");
    },
    async contentTypes() {
      if (!this.enabled) return [];
      return this.get("/api/content/types");
    },
    async contentDetail(id) {
      if (!this.enabled) return null;
      return this.get("/api/content/" + id);
    }
  };

  async function loadAll() {
    let subjects, chapters, topics, papers, quizzes, exams, programs, mockTests, categories;
    let staticMcqsP = null;
    if (await DB.probe()) {
      const [s2, c2, t2, qz, mt, pp, ex, ca] = await Promise.all([
        DB.get("/api/subjects"), DB.get("/api/chapters"), DB.get("/api/topics"),
        DB.get("/api/quizzes"), DB.get("/api/mocktests"), DB.get("/api/pastpapers"),
        DB.get("/api/exams"), DB.get("/api/categories")
      ]);
      subjects = s2.map((s) => ({ id: s.id, name: s.name, slug: s.slug || s.id, icon: s.icon || s.name.slice(0, 2).toUpperCase(), category: s.category_id, description: s.description || "", mcqsCount: s.mcqs_count || 0, exams: (s.exam_ids || "").split(",").filter(Boolean) }));
      chapters = c2.map((c) => ({ id: c.id, subject: c.subject_id, name: c.name, description: "", order: c.sort_order || 0 }));
      topics = t2.map((t) => ({ id: t.id, chapter: t.chapter_id, name: t.name, order: t.sort_order || 0 }));
      quizzes = qz.map((x) => ({ id: x.id, title: x.title, description: x.description || "", totalQuestions: x.total_questions, durationMins: x.duration_mins, difficulty: x.difficulty || "mixed", subjects: (x.subject_ids || "").split(",").filter(Boolean) }));
      mockTests = mt.map((x) => ({ id: x.id, title: x.title, description: x.description || "", totalQuestions: x.total_questions, durationMins: x.duration_mins, difficulty: x.difficulty || "mixed", negativeMarking: !!x.negative_marking, subjects: (x.subject_ids || "").split(",").filter(Boolean) }));
      papers = pp.map((x) => ({ id: x.id, title: x.title, description: x.description || "", exam: x.exam_id || "", year: x.year, pattern: !!x.pattern, durationMins: x.duration_mins || 60, totalQuestions: x.total_questions || 15, difficulty: x.difficulty || "medium", subjects: (x.subject_ids || "").split(",").filter(Boolean) }));
      exams = ex.map((e) => ({ id: e.id, name: e.name, fullName: e.full_name || e.name, category: e.category, description: e.description || "", order: e.sort_order || 0 }));
      categories = ca.map((c) => ({ id: c.id, name: c.name, icon: c.icon || "📚", description: c.description || "" }));
      programs = [];
    } else {
      /* kick off the big static fetch in parallel with taxonomy loads */
      staticMcqsP = loadJSON(`${DATA_BASE}/mcqs.json`);
      [subjects, chapters, topics, papers, quizzes, exams, programs, mockTests, categories] = await Promise.all([
        loadJSON(`${DATA_BASE}/subjects.json`),
        loadJSON(`${DATA_BASE}/chapters.json`),
        loadJSON(`${DATA_BASE}/topics.json`),
        loadJSON(`${DATA_BASE}/papers.json`),
        loadJSON(`${DATA_BASE}/quizzes.json`),
        loadJSON(`${DATA_BASE}/exams.json`),
        loadJSON(`${DATA_BASE}/programs.json`),
        loadJSON(`${DATA_BASE}/mock_tests.json`),
        loadJSON(`${DATA_BASE}/categories.json`)
      ]);
    }
    Object.assign(state, { subjects, chapters, topics, papers, quizzes, exams, programs, mockTests, categories, loaded: true });
    if (DB.enabled) {
      /* DB mode: never load the demo bank — every feature reads SQLite via the API */
      state.mcqs = [];
      state.staticMcqs = [];
    } else {
      const mcqs = await staticMcqsP;
      state.mcqs = mcqs;
      state.staticMcqs = mcqs;
    }
    route();
    if (!location.hash || location.hash === "#home") renderHome();
  }

  /* ---------- Helpers ---------- */
  const chaptersOf = (subjectId) => state.chapters.filter((c) => c.subject === subjectId);
  const topicsOf = (chapterId) => state.topics.filter((t) => t.chapter === chapterId);
  const subjectOf = (id) => state.subjects.find((s) => s.id === id);
  const chapterOf = (id) => state.chapters.find((c) => c.id === id);
  const topicOf = (id) => state.topics.find((t) => t.id === id);
  const mcqsForSubject = (id) => state.mcqs.filter((m) => m.subject === id);
  const categoryOf = (id) => state.categories.find((c) => c.id === id);

  function qotd() {
    if (!state.mcqs || !state.mcqs.length) return null;
    const day = Math.floor(Date.now() / 86400000);
    return state.mcqs[day % state.mcqs.length];
  }

  /* ---------- Analytics ---------- */
  function trackAnswer(m, correct, timeSec, skipped) {
    dbPost("/api/history", { mcq_id: m.id, correct: !!correct, device_id: "default", time_taken_sec: Math.max(0, Math.min(3600, parseInt(timeSec, 10) || 0)), skipped: !!skipped });
    const a = state.analytics;
    a.total = (a.total || 0) + 1;
    a.correct = (a.correct || 0) + (correct ? 1 : 0);
    a.bySubject = a.bySubject || {};
    a.bySubject[m.subject] = { total: (a.bySubject[m.subject]?.total || 0) + 1, correct: (a.bySubject[m.subject]?.correct || 0) + (correct ? 1 : 0) };
    a.byTopic = a.byTopic || {};
    a.byTopic[m.topic] = { total: (a.byTopic[m.topic]?.total || 0) + 1, correct: (a.byTopic[m.topic]?.correct || 0) + (correct ? 1 : 0) };
    a.byDifficulty = a.byDifficulty || {};
    a.byDifficulty[m.difficulty] = (a.byDifficulty[m.difficulty] || 0) + 1;
    a.wrong = a.wrong || [];
    if (!correct) { a.wrong.push({ id: m.id, ts: Date.now() }); a.wrong = a.wrong.slice(-200); }
    a.lastDate = now();
    saveAnalytics();
    const wk = weekKey();
    if (!state.week || state.week.week !== wk) state.week = { week: wk, total: 0, correct: 0, claimed: false };
    state.week.total++;
    if (correct) state.week.correct++;
    saveWeek();
    const mk = monthKey();
    if (!state.month || state.month.month !== mk) state.month = { month: mk, total: 0, correct: 0, claimed: false };
    state.month.total++;
    if (correct) state.month.correct++;
    saveMonth();
  }

  const accuracyOf = (t) => t ? Math.round((t.correct / t.total) * 100) : 0;
  function weakTopics() {
    const a = state.analytics.byTopic || {};
    const out = [];
    Object.entries(a).forEach(([tid, t]) => {
      if (t.total >= 3 && accuracyOf(t) < 60) out.push({ topic: tid, ...t, acc: accuracyOf(t) });
    });
    return out.sort((x, y) => x.acc - y.acc);
  }
  function topSubjects() {
    const a = state.analytics.bySubject || {};
    return Object.entries(a).map(([id, t]) => ({ id, ...t, acc: accuracyOf(t) })).sort((x, y) => y.total - x.total);
  }

  /* ---------- Achievements & streak ---------- */
  function checkAchievements(extra = {}) {
    const u = state.user;
    u.achievements = u.achievements || {};
    const today = now();
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const last = u.lastPracticeDate;
    if (last !== today) {
      const prev = new Date(last + "T00:00:00");
      const diff = Math.round((dayStart - prev) / 86400000);
      if (last && diff === 1) u.streak = (u.streak || 0) + 1; else if (last && diff > 1) u.streak = 1; else u.streak = (u.streak || 0) + 1;
      u.lastPracticeDate = today;
      u.streak = Math.max(u.streak || 1, 1);
    }
    const a = state.analytics;
    const set = (k, v) => { if (!u.achievements[k]) { u.achievements[k] = { unlocked: true, date: today, value: v }; toast("🏅 Achievement unlocked: " + k); } };
    if ((a.total || 0) >= 10) set("First Steps", a.total);
    if ((a.total || 0) >= 100) set("Century Club", a.total);
    if ((a.total || 0) >= 500) set("MCQ Veteran", a.total);
    if ((u.streak || 0) >= 3) set("3-Day Streak", u.streak);
    if ((u.streak || 0) >= 7) set("Week Warrior", u.streak);
    if (accuracyOf(a) >= 80 && (a.total || 0) >= 20) set("Sharpshooter (80%+ accuracy)", a.total);
    if (extra.pct >= 80) set("Quiz Ace (80%+ in a quiz)", extra.pct);
    if (extra.mockPct >= 80) set("Mock Master (80%+ in a mock)", extra.mockPct);
    if ((u.certificates || []).length >= 3) set("Certified Collector", u.certificates.length);
    saveUser();
  }

  function addHistory(entry) {
    state.user.history = state.user.history || [];
    state.user.history.unshift({ ...entry, ts: Date.now() });
    state.user.history = state.user.history.slice(0, 50);
    saveUser();
  }

  function earnCertificate(kind, title, pct) {
    state.user.certificates = state.user.certificates || [];
    const id = kind + "-" + Date.now();
    state.user.certificates.unshift({ id, kind, title, pct, date: now() });
    saveUser();
    checkAchievements({ pct });
    return state.user.certificates[0];
  }

  function awardPoints(n) {
    state.user.points = (state.user.points || 0) + n;
    state.user.entries = state.user.entries || [];
    state.user.entries.unshift({ n, ts: Date.now() });
    state.user.entries = state.user.entries.slice(0, 100);
    saveUser();
  }

  /* ---------- Routing ---------- */
  const VIEWS = ["home", "browse", "study", "practice", "quiz", "papers", "dashboard", "leaderboard", "bookmarks"];
  const BROWSE_KEYS = ["subject", "chapter", "topic", "subtopic", "difficulty", "exam", "year", "type", "page"];

  function browseParams() {
    const p = new URLSearchParams();
    BROWSE_KEYS.forEach((k) => { if (state.browse[k]) p.set(k, state.browse[k]); });
    if (state.browse.search) p.set("q", state.browse.search);
    return p.toString();
  }

  /* keep the URL in sync without re-rendering (deep-linkable, shareable) */
  function syncUrl() {
    const p = browseParams();
    history.replaceState(null, "", p ? "#browse?" + p : "#browse");
  }

  function route() {
    const raw = location.hash.replace("#", "");
    const m = raw.match(/^([^?=]*)(?:=([^]*))?(?:\?(.*))?$/);
    const viewPart = m[1];
    const legacySearch = m[2] ? decodeURIComponent(m[2]) : "";
    const qsPart = m[3] || "";
    let view = VIEWS.includes(viewPart) ? viewPart : (viewPart === "ai-coach" ? "ai-coach" : "home");
    if (viewPart === "search") view = "browse";
    if (viewPart === "study") view = "study";
    const p = new URLSearchParams(qsPart);
    if (view === "ai-coach") {
      const av = document.getElementById("view-ai");
      if (av) { VIEWS.forEach((v) => { $("view-" + v).hidden = true; }); av.hidden = false; }
      document.querySelectorAll(".nav-link[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === "ai-coach"));
      document.querySelector(".main-nav").classList.remove("open");
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (view === "browse") {
      const q = p.get("q") || legacySearch;
      if (q !== null) state.browse.search = q;
      BROWSE_KEYS.forEach((k) => { const v = p.get(k); if (v) state.browse[k] = v; });
      state.browse.related = null;
    }
    showView(view);
  }

  function showView(view) {
    if (state.timerInt) {
      clearInterval(state.timerInt);
      state.timerInt = null;
    }
    VIEWS.forEach((v) => { $("view-" + v).hidden = v !== view; });
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    document.querySelector(".main-nav").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "instant" });
    if (view === "home") renderHome();
    if (view === "browse") renderBrowse();
    if (view === "study") renderStudy();
    if (view === "practice") renderPracticeSetup();
    if (view === "quiz") renderQuizList();
    if (view === "papers") renderPapers();
    if (view === "dashboard") renderDashboard();
    if (view === "leaderboard") renderLeaderboard();
    if (view === "bookmarks") renderBookmarks();
  }

  function goto(view) {
    location.hash = view === "browse" ? (browseParams() ? "browse?" + browseParams() : "browse") : view;
  }

  /* ---------- Quiz scroll & view helpers ---------- */
  function scrollToQuizTop() {
    /* Immediately scroll to top so pageYOffset resets and DOM reflow calculates correct offsets */
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ids = ["quizArea", "practiceArea", "examArea", "quizResult", "examResult", "practiceResult"];
        let target = null;
        for (const id of ids) {
          const el = $(id);
          const parentView = el?.closest(".view");
          if (el && !el.hidden && parentView && !parentView.hidden) {
            target = el;
            break;
          }
        }
        if (target) {
          const headerH = document.querySelector(".site-header")?.offsetHeight || 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 4;
          window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      });
    });
  }

  /* Hide all list-mode chrome (headings, descriptions) inside a view section */
  function hideListChrome(sectionId) {
    const sec = $(sectionId);
    if (!sec) return;
    sec.querySelectorAll(":scope > h1, :scope > h2, :scope > p.muted, :scope > .filter-row").forEach((el) => { el.dataset.wasHidden = el.hidden; el.hidden = true; });
  }
  function showListChrome(sectionId) {
    const sec = $(sectionId);
    if (!sec) return;
    sec.querySelectorAll(":scope > h1, :scope > h2, :scope > p.muted, :scope > .filter-row").forEach((el) => { el.hidden = el.dataset.wasHidden === "true"; delete el.dataset.wasHidden; });
  }

  function switchToQuizMode() {
    if (state.timerInt) { clearInterval(state.timerInt); state.timerInt = null; }
    history.replaceState(null, "", "#quiz");
    VIEWS.forEach((v) => { $("view-" + v).hidden = v !== "quiz"; });
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === "quiz"));
    document.querySelector(".main-nav").classList.remove("open");
    $("quizList").hidden = true;
    $("mockList").hidden = true;
    $("paperQuizSection").hidden = true;
    $("quizArea").hidden = false;
    $("quizResult").hidden = true;
    hideListChrome("view-quiz");
  }

  function switchToPracticeMode() {
    if (state.timerInt) { clearInterval(state.timerInt); state.timerInt = null; }
    history.replaceState(null, "", "#practice");
    VIEWS.forEach((v) => { $("view-" + v).hidden = v !== "practice"; });
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === "practice"));
    document.querySelector(".main-nav").classList.remove("open");
    $("practiceSetup").hidden = true;
    $("practiceResult").hidden = true;
    $("practiceArea").hidden = false;
    hideListChrome("view-practice");
  }

  /* ---------- DB sync (bookmarks + results) ---------- */
  const dbPost = (path, body) => { if (!DB.enabled) return; fetch(DB.api + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {}); };

  /* ---------- Bookmark helpers ---------- */
  const isBookmarked = (id) => state.bookmarks.includes(id);
  function toggleBookmark(id) {
    const i = state.bookmarks.indexOf(id);
    i >= 0 ? state.bookmarks.splice(i, 1) : state.bookmarks.push(id);
    localStorage.setItem("pmh_bookmarks", JSON.stringify(state.bookmarks));
    dbPost("/api/bookmarks", { mcq_id: id, device_id: "default" });
    document.querySelectorAll(`[data-bm="${id}"]`).forEach((b) => {
      b.textContent = i >= 0 ? "🔖 Bookmark" : "🔖 Bookmarked";
      b.classList.toggle("btn-gold", i >= 0);
    });
    toast(i >= 0 ? "Removed from bookmarks" : "Added to bookmarks");
  }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._tm);
    t._tm = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------- AI: fuzzy search scoring ---------- */
  const STOP = new Set(["the", "a", "an", "of", "in", "on", "for", "to", "is", "was", "are", "and", "or", "by", "with", "from", "who", "what", "which", "how", "did", "does", "do"]);
  function tokenize(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)); }

  function searchScore(m, tokens) {
    const text = tokenize(m.question + " " + (m.tags || []).join(" ") + " " + (subjectOf(m.subject)?.name || "")).join(" ");
    let score = 0;
    for (const t of tokens) {
      const idx = text.indexOf(t);
      if (idx === 0) score += 3;
      else if (idx > 0) score += 2;
      else if (text.includes(t.slice(0, Math.max(3, t.length - 1)))) score += 1;
      else { score = -1; break; }
    }
    return score;
  }

  function aiSearch(query) {
    const tokens = tokenize(query);
    if (!tokens.length) return [];
    return state.mcqs.map((m) => ({ m, s: searchScore(m, tokens) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 50)
      .map((x) => x.m);
  }

  /* ---------- AI: question generation & explanation enhancement ---------- */
  const AI_TEMPLATES = [
    { t: "t-1", q: "Which city is the capital of Pakistan?", a: "Islamabad", e: "Islamabad became the capital of Pakistan in the 1960s, replacing Karachi." },
    { t: "t-10", q: "The national anthem of Pakistan was written by:", a: "Hafeez Jalandhari", e: "Hafeez Jalandhari wrote the national anthem; Ahmed G. Chagla composed its music." }
  ];
  function aiExplain(m) {
    let ex = m.detailedExplanation;
    const subj = subjectOf(m.subject)?.name || "this subject";
    if (ex.length < 60) ex = ex + " This topic is frequently tested in " + subj + " papers for PPSC, FPSC, NTS and related exams.";
    return ex + " Tip: revise the chapter '" + (chapterOf(m.chapter)?.name || "this chapter") + "' for related questions.";
  }

  /* ---------- MCQ card rendering ---------- */
  function mcqCard(m, opts = {}) {
    const reveal = !!opts.reveal;
    const div = document.createElement("div");
    div.className = "mcq-card";
    div.dataset.ts = String(Date.now());
    div.innerHTML = `
      <div class="mcq-head">
        <span class="chip">${esc(subjectOf(m.subject)?.name || m.subject)}</span>
        ${m.difficulty ? `<span class="chip chip-${m.difficulty === "hard" ? "red" : m.difficulty === "medium" ? "gold" : "gray"}">${m.difficulty}</span>` : ""}
        <span class="chip chip-gray">${esc(chapterOf(m.chapter)?.name || "")}</span>
        ${m.year ? `<span class="chip chip-gray">${m.year}</span>` : ""}
      </div>
      <p class="mcq-question">${esc(m.question)}</p>
      <div class="opt-list">
        ${["A", "B", "C", "D"].map((k) => `
          <button class="opt ${reveal ? (k === m.correctAnswer ? "correct" : "") : ""}" data-opt="${k}" ${reveal ? "disabled" : ""}>
            <span class="opt-key">${k}</span><span>${esc(m["option" + k])}</span>
          </button>`).join("")}
      </div>
      ${reveal ? `<div class="mcq-explanation"><span class="ans-key">Correct: ${m.correctAnswer}</span> — ${esc(aiExplain(m))}</div>` : ""}
      <div class="mcq-actions">
        <button class="btn btn-sm btn-outline" data-bm="${m.id}">${isBookmarked(m.id) ? "🔖 Bookmarked" : "🔖 Bookmark"}</button>
      </div>`;
    if (!reveal) {
      div.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
        const chosen = b.dataset.opt;
        div.querySelectorAll(".opt").forEach((o) => { o.disabled = true; });
        b.classList.add(chosen === m.correctAnswer ? "correct" : "wrong");
        if (chosen !== m.correctAnswer) div.querySelector(`.opt[data-opt="${m.correctAnswer}"]`).classList.add("correct");
        const ex = document.createElement("div");
        ex.className = "mcq-explanation";
        ex.innerHTML = `<span class="ans-key">Correct: ${m.correctAnswer}</span> — ${esc(aiExplain(m))}`;
        div.querySelector(".mcq-actions").before(ex);
        const rw = relatedRow(m);
        if (rw) ex.after(rw);
        trackAnswer(m, chosen === m.correctAnswer, Math.round((Date.now() - parseInt(div.dataset.ts, 10)) / 1000));
        opts.onAnswer && opts.onAnswer(chosen === m.correctAnswer);
      }));
    }
    if (reveal) {
      const rw = relatedRow(m);
      if (rw) div.querySelector(".mcq-actions").before(rw);
    }
    div.querySelector("[data-bm]").addEventListener("click", () => toggleBookmark(m.id));
    return div;
  }

  function addRelatedButtons(wrap, ms) {
    ms.forEach((r) => {
      const b = document.createElement("button");
      b.className = "btn btn-sm btn-outline";
      b.textContent = r.question.length > 44 ? r.question.slice(0, 44) + "…" : r.question;
      b.setAttribute("title", r.question);
      b.addEventListener("click", () => {
        state.browse.related = (r.relatedQuestions || []).filter((id) => id !== r.id).slice(0, 5);
        state.browse.subject = "";
        state.browse.chapter = "";
        state.browse.topic = "";
        state.browse.subtopic = "";
        state.browse.search = "";
        goto("browse");
      });
      wrap.appendChild(b);
    });
  }

  function relatedRow(m) {
    const ids = (m.relatedQuestions || []).filter((id) => id !== m.id).slice(0, 5);
    if (!ids.length) return null;
    const wrap = document.createElement("div");
    wrap.className = "mcq-related";
    wrap.innerHTML = "<strong>Related questions:</strong>";
    if (DB.enabled) {
      DB.get("/api/mcqs" + DB.qs({ ids: ids.join(",") })).then((rows) => {
        const byId = {};
        rows.forEach((r) => { byId[r.id] = DB.mapMcq(r); });
        addRelatedButtons(wrap, ids.map((id) => byId[id]).filter(Boolean));
      }).catch(() => {});
      return wrap;
    }
    addRelatedButtons(wrap, ids.map((id) => state.mcqs.find((x) => x.id === id)).filter(Boolean));
    return wrap;
  }

  /* ---------- Home ---------- */
  function renderDbStatus() {
    const el = $("dbStatus");
    const s = DB.enabled && DB.stats;
    if (s) {
      el.className = "db-status ok";
      el.innerHTML = `
        <div class="db-status-head"><span class="dot"></span><strong>SQLite connected</strong><span class="muted">(${esc(DB.api.replace("http://", ""))})</span></div>
        <div class="db-status-grid">
          <span><b>${s.mcqs.toLocaleString()}</b> MCQs</span>
          <span><b>${s.subjects.toLocaleString()}</b> subjects</span>
          <span><b>${s.chapters.toLocaleString()}</b> chapters</span>
          <span><b>${s.topics.toLocaleString()}</b> topics</span>
          <span><b>${s.papers.toLocaleString()}</b> papers</span>
          <span><b>${s.mocktests.toLocaleString()}</b> mock tests</span>
          <span><b>${s.quizzes.toLocaleString()}</b> quizzes</span>
          <span><b>${s.exams.toLocaleString()}</b> exams</span>
          <span><b>${s.bookmarks.toLocaleString()}</b> bookmarks</span>
          <span><b>${s.attempts.toLocaleString()}</b> attempts</span>
        </div>
        <div class="db-status-meta muted">SQLite ${esc(s.sqlite_version)} · last updated ${esc(s.last_updated ? s.last_updated.slice(0, 10) : "n/a")}</div>`;
      return;
    }
    el.className = "db-status";
    const src = DB.enabled ? "Full database" : "Static bank";
    const n = DB.enabled ? DB.total : state.mcqs.length;
    const full = CONFIG.dataset.fullDatabase || {};
    const fullN = full.questions || 872624;
    el.innerHTML = `
      <div class="db-status-head"><span class="dot dot-off"></span><strong>${src}</strong><span class="muted">${n.toLocaleString()} MCQs</span></div>
      <p class="muted">The static practice bank (${n.toLocaleString()} MCQs, ${(CONFIG.dataset.staticBank || {}).subjects || 147} subjects) works instantly. Self-host the runtime server (<code>node runtime-v2/server.cjs</code>, port 8766) to unlock the full database of ${fullN.toLocaleString()} MCQs across ${full.subjects || 243} subjects, then reload.</p>`;
  }

  function renderHome() {
    const st = DB.enabled && DB.stats;
    $("statMcqs").textContent = st ? st.mcqs.toLocaleString() : (DB.enabled ? DB.total.toLocaleString() : state.mcqs.length.toLocaleString());
    $("statSubjects").textContent = st ? st.subjects.toLocaleString() : state.subjects.length.toLocaleString();
    $("statChapters").textContent = st ? st.chapters.toLocaleString() : state.chapters.length.toLocaleString();
    $("statTopics").textContent = st ? st.topics.toLocaleString() : state.topics.length.toLocaleString();
    $("statPapers").textContent = st ? st.papers.toLocaleString() : state.papers.length.toLocaleString();
    $("statMocks").textContent = st ? st.mocktests.toLocaleString() : state.mockTests.length.toLocaleString();
    $("statQuizzes").textContent = st ? st.quizzes.toLocaleString() : state.quizzes.length.toLocaleString();
    $("statExams").textContent = st ? st.exams.toLocaleString() : state.exams.length.toLocaleString();
    renderDbStatus();
    if (st) {
      $("heroTagline").textContent = `Live from the local database: ${st.mcqs.toLocaleString()} original MCQs across ${st.subjects.toLocaleString()} subjects, ${st.chapters.toLocaleString()} chapters and ${st.topics.toLocaleString()} topics — search, practice, quiz and track progress with zero demo data.`;
      $("globalSearch").setAttribute("placeholder", `Instant search ${st.mcqs.toLocaleString()} MCQs - try 'Ohm', 'constitution', 'treaty'...`);
    } else {
      $("globalSearch").setAttribute("placeholder", "Instant search 1,338 MCQs (872,624 with full database) - try 'Ohm', 'constitution', 'treaty'...");
    }

    const ecg = $("examCatGrid");
    ecg.innerHTML = "";
    state.categories.forEach((c) => {
      const exs = state.exams.filter((e) => e.category === c.id);
      if (!exs.length) return;
      const card = document.createElement("button");
      card.className = "exam-cat-card";
      card.innerHTML = `<div class="subject-icon">${esc(c.icon)}</div><div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><span class="count">${exs.length} exams</span></div>`;
      card.addEventListener("click", () => {
        state.browse = { ...state.browse, subject: "", chapter: "", topic: "", page: 1, exam: exs[0] ? (state.browse.exam === exs[0].id ? "" : exs[0].id) : "" };
        goto("browse");
      });
      ecg.appendChild(card);
    });

    const sg = $("subjectGrid");
    sg.innerHTML = "";
    state.subjects.forEach((s) => {
      const count = DB.enabled ? (s.mcqsCount || 0) : mcqsForSubject(s.id).length;
      const slug = (s.slug || s.id).replace(/[^a-z0-9-]/gi, "").toLowerCase();
      const card = document.createElement("a");
      card.className = "subject-card";
      card.href = `subjects/${encodeURIComponent(slug)}.html`;
      card.innerHTML = `
        <div class="subject-icon">${esc(s.icon)}</div>
        <div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><span class="count">${count} MCQs</span></div>`;
      card.addEventListener("click", (ev) => {
        ev.preventDefault();
        state.browse.subject = s.id;
        state.browse.chapter = "";
        state.browse.topic = "";
        goto("browse");
      });
      sg.appendChild(card);
    });

    renderQuizGrid($("quizGrid"), state.quizzes.slice(0, 8));

    if (DB.enabled) { loadDbQotd(); return; }
    if (!state.mcqs.length) { $("qotdQuestion").textContent = "Loading questions..."; return; }
    const q = qotd();
    $("qotdQuestion").textContent = q.question;
    const wrap = $("qotdOptions");
    wrap.innerHTML = "";
    ["A", "B", "C", "D"].forEach((k) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = `<span class="opt-key">${k}</span><span>${esc(q["option" + k])}</span>`;
      b.addEventListener("click", () => {
        wrap.querySelectorAll(".opt").forEach((o) => (o.disabled = true));
        b.classList.add(k === q.correctAnswer ? "correct" : "wrong");
        if (k !== q.correctAnswer) wrap.querySelector(`.opt:nth-child(${["A", "B", "C", "D"].indexOf(q.correctAnswer) + 1})`).classList.add("correct");
        trackAnswer(q, k === q.correctAnswer);
        checkAchievements({});
        showQotdAnswer(q);
      });
      wrap.appendChild(b);
    });
    $("qotdReveal").onclick = () => { $("qotdReveal").hidden = true; showQotdAnswer(q); };
    $("qotdAnswer").hidden = true;
  }

  async function loadDbQotd() {
    try {
      const day = Math.floor(Date.now() / 86400000);
      const r = await DB.get("/api/random" + DB.qs({ limit: 1, seed: day }));
      const q = DB.mapMcq(r.results[0]);
      const wrap = $("qotdOptions");
      wrap.innerHTML = "";
      ["A", "B", "C", "D"].forEach((k) => {
        const b = document.createElement("button");
        b.className = "opt";
        b.innerHTML = `<span class="opt-key">${k}</span><span>${esc(q["option" + k])}</span>`;
        b.addEventListener("click", () => {
          wrap.querySelectorAll(".opt").forEach((o) => (o.disabled = true));
          b.classList.add(k === q.correctAnswer ? "correct" : "wrong");
          if (k !== q.correctAnswer) wrap.querySelector(`.opt:nth-child(${["A", "B", "C", "D"].indexOf(q.correctAnswer) + 1})`).classList.add("correct");
          trackAnswer(q, k === q.correctAnswer);
          checkAchievements({});
          showQotdAnswer(q);
        });
        wrap.appendChild(b);
      });
      $("qotdQuestion").textContent = q.question;
      $("qotdReveal").onclick = () => { $("qotdReveal").hidden = true; showQotdAnswer(q); };
      $("qotdAnswer").hidden = true;
    } catch (e) { DB.enabled = false; renderHome(); }
  }

  function showQotdAnswer(q) {
    const a = $("qotdAnswer");
    a.hidden = false;
    a.innerHTML = `<span class="ans-key">Correct: ${q.correctAnswer}</span> — ${esc(aiExplain(q))}`;
  }

  function renderQuizGrid(el, quizzes) {
    el.innerHTML = "";
    quizzes.forEach((qz) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.innerHTML = `
        <h3>${esc(qz.title)}</h3>
        <p>${esc(qz.description)}</p>
        <div class="card-meta">
          <span class="chip">${qz.totalQuestions} questions</span>
          <span class="chip chip-gold">${qz.durationMins} min</span>
          <span class="chip chip-gray">${qz.difficulty}</span>
        </div>
        <button class="btn btn-primary btn-sm start-quiz" data-id="${qz.id}">Start Quiz</button>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".start-quiz").forEach((b) => b.addEventListener("click", () => startQuiz(b.dataset.id)));
  }

  /* ---------- Browse ---------- */
  function fillSelect(sel, options, placeholder) {
    sel.innerHTML = `<option value="">${esc(placeholder)}</option>` + options.map((o) => `<option value="${esc(o.id)}">${esc(o.name)}</option>`).join("");
  }

  function renderBrowse() {
    const exams = DB.enabled ? state.exams.map((e) => e.id) : [...new Set(state.mcqs.flatMap((m) => m.exam || []))].sort();
    fillSelect($("fSubject"), state.subjects, "All subjects");
    fillSelect($("fExam"), exams.map((e) => ({ id: e, name: (state.exams.find((x) => x.id === e)?.name || e).toUpperCase() })), "All exams");
    $("fSubject").value = state.browse.subject;
    $("fChapter").value = state.browse.chapter;
    $("fTopic").value = state.browse.topic;
    if (state.browse.subject) {
      fillSelect($("fChapter"), chaptersOf(state.browse.subject), "All chapters");
      $("fChapter").disabled = false;
    }
    if (state.browse.chapter) {
      fillSelect($("fTopic"), topicsOf(state.browse.chapter), "All topics");
      $("fTopic").disabled = false;
    }
    updateSubtopicUI();
    const years = [...new Set(state.mcqs.map((m) => m.year).filter(Boolean))].sort().reverse();
    $("fYear").innerHTML = '<option value="">Any year</option>' + years.map((y) => `<option>${y}</option>`).join("");
    $("fYear").value = state.browse.year;
    $("fDifficulty").value = state.browse.difficulty;
    $("fExam").value = state.browse.exam;
    $("fType").value = state.browse.type;
    applyBrowse();
  }

  function fillSubtopicSelect(sel, mcqs) {
    const opts = [...new Set(mcqs.map((m) => m.subtopic).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All subtopics</option>' + opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
  }

  function updateSubtopicUI() {
    const sel = $("fSubtopic");
    if (DB.enabled) { sel.innerHTML = '<option value="">Subtopics not available in DB mode</option>'; sel.disabled = true; sel.value = ""; return; }
    if (state.browse.topic) {
      fillSubtopicSelect(sel, state.mcqs.filter((m) => m.topic === state.browse.topic));
      sel.disabled = false;
    } else if (state.browse.chapter) {
      fillSubtopicSelect(sel, state.mcqs.filter((m) => m.chapter === state.browse.chapter));
      sel.disabled = false;
    } else {
      sel.innerHTML = '<option value="">Select chapter first</option>';
      sel.disabled = true;
    }
    sel.value = state.browse.subtopic;
  }

  function questionType(m) {
    const q = m.question.toLowerCase();
    if (/^according to|^calculate|^what is the (si|value|formula|unit)|^how (many|much) (calories|watts|bytes|bones|players|cranial)/.test(q)) return "formula";
    if (/^which of the following|^who|^what|^where|^when|^how/.test(q)) return "fact";
    if (/^the .* is defined|^a .* is best defined|^is best described|^refers to/.test(q)) return "definition";
    return "fact";
  }

  function filteredMcqs() {
    let list = state.mcqs;
    const q = (state.browse.search || "").toLowerCase().trim();
    if (q) {
      const tokens = tokenize(q);
      if (tokens.length >= 2) list = aiSearch(q);
      else {
        list = list.filter((m) =>
          m.question.toLowerCase().includes(q) ||
          (subjectOf(m.subject)?.name || "").toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }
    }
    if (state.browse.related && state.browse.related.length) {
      const ids = state.browse.related;
      return state.mcqs.filter((m) => ids.includes(m.id));
    }
    if (state.browse.subject) list = list.filter((m) => m.subject === state.browse.subject);
    if (state.browse.chapter) list = list.filter((m) => m.chapter === state.browse.chapter);
    if (state.browse.topic) list = list.filter((m) => m.topic === state.browse.topic);
    if (state.browse.subtopic) list = list.filter((m) => m.subtopic === state.browse.subtopic);
    if (state.browse.difficulty) list = list.filter((m) => m.difficulty === state.browse.difficulty);
    if (state.browse.exam) list = list.filter((m) => (m.exam || []).includes(state.browse.exam));
    if (state.browse.year) list = list.filter((m) => m.year == state.browse.year);
    if (state.browse.type) list = list.filter((m) => questionType(m) === state.browse.type);
    return list;
  }

  /* windowed pager: « 1 … n-1 n n+1 … last » — never renders all pages */
  function buildPager(el, page, pages, onGo) {
    el.innerHTML = "";
    if (pages <= 1) return;
    const mk = (label, p, cls, dis) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.disabled = !!dis;
      if (cls) b.className = cls;
      b.onclick = () => onGo(p);
      el.appendChild(b);
    };
    const addPage = (p) => mk(String(p), p, p === page ? "active" : "");
    const addGap = () => { const s = document.createElement("span"); s.className = "pager-gap"; s.textContent = "…"; el.appendChild(s); };
    mk("‹", page - 1, "", page === 1);
    const want = new Set([1, pages, page - 1, page, page + 1]);
    let prev = 0;
    for (let p = 1; p <= pages; p++) {
      if (!want.has(p)) continue;
      if (p - prev > 1) addGap();
      addPage(p);
      prev = p;
    }
    mk("›", page + 1, "", page === pages);
  }

  async function applyBrowse() {
    if (DB.enabled) {
      const b = state.browse;
      const el = $("browseList");
      const pager = $("browsePager");
      const q = (b.search || "").trim();
      const rel = b.related && b.related.length ? b.related.join(",") : "";
      try {
        const res = q
          ? await DB.get("/api/search" + DB.qs({ q, subject: b.subject, chapter: b.chapter, topic: b.topic, difficulty: b.difficulty, exam: b.exam, year: b.year, related: rel, page: b.page, limit: PAGE_SIZE }))
          : await DB.get("/api/browse" + DB.qs({ subject: b.subject, chapter: b.chapter, topic: b.topic, difficulty: b.difficulty, exam: b.exam, year: b.year, related: rel, page: b.page, limit: PAGE_SIZE }));
        const list = (res.results || []).map(DB.mapMcq);
        const pages = Math.max(1, res.pages || 1);
        if (state.browse.page > pages) state.browse.page = pages;
        el.innerHTML = `<p class="muted">${res.total || 0} MCQs found${q ? ` for "${esc(q)}"` : ""}</p>`;
        list.forEach((m) => el.appendChild(mcqCard(m, { reveal: false })));
        buildPager(pager, state.browse.page, pages, (p) => { state.browse.page = p; applyBrowse(); });
      } catch (e) {
        el.innerHTML = `<p class="muted">DB lookup failed (${esc(e.message)}) — falling back to the static bank.</p>`;
        DB.enabled = false;
        renderBrowse();
      }
      syncUrl();
      return;
    }
    const list = filteredMcqs();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.browse.page > pages) state.browse.page = pages;
    const start = (state.browse.page - 1) * PAGE_SIZE;
    const page = list.slice(start, start + PAGE_SIZE);

    const el = $("browseList");
    el.innerHTML = `<p class="muted">${list.length} MCQs found${state.browse.search ? ` for "${esc(state.browse.search)}"` : ""}</p>`;
    page.forEach((m) => el.appendChild(mcqCard(m, { reveal: false })));
    buildPager($("browsePager"), state.browse.page, pages, (p) => { state.browse.page = p; applyBrowse(); });
    syncUrl();
  }

  /* ---------- Study (source content) ---------- */
  const ST_PAGE_SIZE = 20;
  let stState = { subject: "", content_type: "", search: "", page: 1 };

  async function loadStudyOverview() {
    const overview = $("stOverview");
    overview.innerHTML = "";
    if (DB.enabled) {
      try {
        const [subjects, types] = await Promise.all([DB.contentSubjects(), DB.contentTypes()]);
        subjects.forEach((s) => {
          const card = document.createElement("a");
          card.className = "subject-card";
          card.href = "#study?subject=" + encodeURIComponent(s.subject);
          card.innerHTML = `<div class="subject-icon">📖</div><div><h3>${esc(s.subject)}</h3><p class="muted">${s.count} blocks</p></div>`;
          card.addEventListener("click", (ev) => {
            ev.preventDefault();
            stState.subject = s.subject;
            stState.content_type = "";
            stState.search = "";
            stState.page = 1;
            $("stSubject").value = s.subject;
            $("stType").value = "";
            $("stSearch").value = "";
            renderStudyResults();
          });
          overview.appendChild(card);
        });
        if (types.length) {
          const typeCard = document.createElement("div");
          typeCard.className = "subject-card";
          typeCard.innerHTML = `<div class="subject-icon">🏷️</div><div><h3>By Type</h3><p class="muted">${types.map(t => `${t.type}: ${t.count}`).join(", ")}</p></div>`;
          overview.appendChild(typeCard);
        }
      } catch (e) {
        overview.innerHTML = `<p class="muted">Failed to load study overview: ${esc(e.message)}</p>`;
      }
      return;
    }
    overview.innerHTML = `<p class="muted">Study content requires the self-hosted runtime server (node runtime-v2/server.cjs).</p>`;
  }

  function studyCard(c) {
    const div = document.createElement("div");
    div.className = "mcq-card";
    const subj = c._subject || c.subject || "general";
    const type = c.content_type || "NON_MCQ";
    const wordCount = c.word_count || 0;
    const src = c.pdf || c.source_file || "";
    const page = c.page ? `p. ${c.page}` : "";
    div.innerHTML = `
      <div class="mcq-head">
        <span class="chip">${esc(subj.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()))}</span>
        <span class="chip chip-gray">${esc(type)}</span>
        <span class="chip chip-gray">${wordCount} words</span>
        ${page ? `<span class="chip chip-gray">${esc(page)}</span>` : ""}
      </div>
      <p class="mcq-question">${esc(c.text ? c.text.slice(0, 300) : "")}${c.text && c.text.length > 300 ? "…" : ""}</p>
      <div class="mcq-actions">
        <button class="btn btn-sm btn-primary" data-id="${c.id}">Read Full</button>
        <span class="muted small">${esc(src)}</span>
      </div>`;
    div.querySelector("button[data-id]").addEventListener("click", () => openStudyDetail(c.id));
    return div;
  }

  async function renderStudyResults() {
    const resultsEl = $("stResults");
    const pagerEl = $("stPager");
    const overviewEl = $("stOverview");
    overviewEl.hidden = true;
    resultsEl.hidden = false;

    if (DB.enabled) {
      try {
        const res = await DB.contentSearch(stState.search, {
          subject: stState.subject, content_type: stState.content_type,
          page: stState.page, limit: ST_PAGE_SIZE
        });
        const list = res.results || [];
        const total = res.total || 0;
        const pages = Math.max(1, res.pages || 1);
        if (stState.page > pages) { stState.page = pages; return renderStudyResults(); }

        resultsEl.innerHTML = `<p class="muted">${total} blocks found${stState.search ? ` for "${esc(stState.search)}"` : ""}${stState.subject ? ` in ${esc(stState.subject)}` : ""}${stState.content_type ? ` (${esc(stState.content_type)})` : ""}</p>`;
        if (!list.length) { resultsEl.innerHTML += `<p class="muted">No content matches your filters.</p>`; }
        list.forEach((c) => resultsEl.appendChild(studyCard(c)));
        buildPager(pagerEl, stState.page, pages, (p) => { stState.page = p; renderStudyResults(); });
      } catch (e) {
        resultsEl.innerHTML = `<p class="muted">Search failed: ${esc(e.message)}</p>`;
      }
      return;
    }
    resultsEl.innerHTML = `<p class="muted">Study search requires the self-hosted runtime server.</p>`;
  }

  async function openStudyDetail(id) {
    if (!DB.enabled) { toast("Content detail requires the runtime server"); return; }
    try {
      const c = await DB.contentDetail(id);
      if (!c) { toast("Content not found"); return; }
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="modal-content study-detail">
          <button class="modal-close" aria-label="Close">&times;</button>
          <div class="study-detail-head">
            <span class="chip">${esc(c._subject || c.subject || "general").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="chip chip-gray">${esc(c.content_type || "NON_MCQ")}</span>
            ${c.word_count ? `<span class="chip chip-gray">${c.word_count} words</span>` : ""}
            ${c.page ? `<span class="chip chip-gray">p. ${c.page}</span>` : ""}
          </div>
          <h2>${esc(c.pdf || c.source_file || "Source")}</h2>
          <div class="study-text">${esc(c.text || "").replace(/\n/g, "<br>")}</div>
          <div class="study-meta muted small">
            ${c.content_hash ? `Hash: ${c.content_hash.slice(0,16)}…` : ""} ${c.indexed_at ? `• Indexed: ${c.indexed_at.slice(0,10)}` : ""}
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector(".modal-close").onclick = () => modal.remove();
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
      document.addEventListener("keydown", function escHandler(ev) { if (ev.key === "Escape") { modal.remove(); document.removeEventListener("keydown", escHandler); } });
    } catch (e) { toast("Failed to load content: " + e.message); }
  }

  function renderStudy() {
    stState = { subject: "", content_type: "", search: "", page: 1 };
    const overviewEl = $("stOverview");
    const resultsEl = $("stResults");
    const pagerEl = $("stPager");
    overviewEl.hidden = false;
    resultsEl.hidden = true;
    pagerEl.innerHTML = "";
    loadStudyOverview();

    /* Wire up filters */
    const subjSel = $("stSubject");
    const typeSel = $("stType");
    const searchInp = $("stSearch");
    const searchBtn = $("stSearchBtn");
    const resetBtn = $("stReset");

    /* populate subject/type selects from DB if enabled, or from static config */
    if (DB.enabled) {
      DB.contentSubjects().then((arr) => {
        arr.forEach((s) => { const opt = document.createElement("option"); opt.value = s.subject; opt.textContent = `${s.subject} (${s.count})`; subjSel.appendChild(opt); });
      }).catch(() => {});
      DB.contentTypes().then((arr) => {
        arr.forEach((t) => { const opt = document.createElement("option"); opt.value = t.type; opt.textContent = `${t.type} (${t.count})`; typeSel.appendChild(opt); });
      }).catch(() => {});
    }

    const doSearch = () => {
      stState.subject = subjSel.value;
      stState.content_type = typeSel.value;
      stState.search = searchInp.value.trim();
      stState.page = 1;
      renderStudyResults();
    };
    searchBtn.onclick = doSearch;
    searchInp.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    subjSel.onchange = doSearch;
    typeSel.onchange = doSearch;
    resetBtn.onclick = () => {
      stState = { subject: "", content_type: "", search: "", page: 1 };
      subjSel.value = ""; typeSel.value = ""; searchInp.value = "";
      overviewEl.hidden = false;
      resultsEl.hidden = true;
      pagerEl.innerHTML = "";
      loadStudyOverview();
    };
  }

  /* ---------- Practice ---------- */
  function renderPracticeSetup() {
    showListChrome("view-practice");
    fillSelect($("pSubject"), state.subjects, "All subjects");
    $("practiceArea").hidden = true;
    $("practiceResult").hidden = true;
    $("practiceSetup").hidden = false;
  }

  async function startPractice() {
    const mode = $("pMode").value;
    const subject = $("pSubject").value;
    const difficulty = $("pDifficulty").value;
    const count = parseInt($("pCount").value, 10);
    const negative = $("pNegative").checked;
    let pool = [];

    if (DB.enabled) {
      let pool = [];
      if (mode === "bookmarks") {
        const ids = state.bookmarks.slice(0, 200);
        if (ids.length) {
          const rows = await DB.get("/api/mcqs" + DB.qs({ ids: ids.join(",") }));
          pool = (rows || []).map(DB.mapMcq);
          if (subject) pool = pool.filter((m) => m.subject === subject);
        }
        if (!pool.length) { toast("No bookmarked questions yet - bookmark some MCQs first"); return; }
      } else if (mode === "revision") {
        const rows = await DB.get("/api/history");
        const ids = (rows || []).slice(0, 200).map((h) => h.mcq_id);
        if (ids.length) {
          const mcqs = await DB.get("/api/mcqs" + DB.qs({ ids: ids.join(",") }));
          pool = (mcqs || []).map(DB.mapMcq);
          if (subject) pool = pool.filter((m) => m.subject === subject);
        }
        if (!pool.length) { toast("Answer a few questions first to build your revision set"); return; }
      } else if (mode === "weak") {
        const weak = weakTopics();
        if (!weak.length) { toast("No weak topics yet - answer a few questions first"); return; }
        const per = Math.max(1, Math.ceil(count / Math.min(weak.length, 8)));
        for (const w of weak.slice(0, 8)) {
          try { const r = await DB.get("/api/random" + DB.qs({ topic: w.topic, limit: per })); pool = pool.concat((r.results || []).map(DB.mapMcq)); } catch (e) {}
        }
        if (subject) pool = pool.filter((m) => m.subject === subject);
        if (!pool.length) { toast("No weak-topic questions available yet"); return; }
      } else {
        const r = await DB.get("/api/random" + DB.qs({ subject, difficulty, limit: count }));
        pool = (r.results || []).map(DB.mapMcq);
        if (!pool.length) { toast("No MCQs match those filters"); return; }
      }
      const list = sample(pool, Math.min(count, pool.length));
      state.practice = { list, i: 0, correct: 0, answered: 0, wrong: 0, negative, mode, start: Date.now() };
      $("practiceSetup").hidden = true;
      $("practiceResult").hidden = true;
      $("practiceArea").hidden = false;
      hideListChrome("view-practice");
      renderPracticeQ();
      scrollToQuizTop();
      return;
    }

    if (mode === "bookmarks") {
      pool = state.mcqs.filter((m) => state.bookmarks.includes(m.id));
      if (subject) pool = pool.filter((m) => m.subject === subject);
    } else if (mode === "revision") {
      const seen = new Set(Object.keys(state.analytics.byTopic || {}));
      pool = state.mcqs.filter((m) => seen.has(m.topic));
      if (subject) pool = pool.filter((m) => m.subject === subject);
    } else if (mode === "weak") {
      const weak = new Set(weakTopics().map((w) => w.topic));
      pool = state.mcqs.filter((m) => weak.has(m.topic));
      if (subject) pool = pool.filter((m) => m.subject === subject);
      if (!pool.length) { toast("No weak topics yet - answer a few questions first"); return; }
    } else if (mode === "adaptive") {
      pool = state.mcqs.filter((m) => (!subject || m.subject === subject));
    } else {
      pool = state.mcqs.filter((m) => (!subject || m.subject === subject) && (!difficulty || m.difficulty === difficulty));
    }

    if (mode !== "adaptive" && difficulty) pool = pool.filter((m) => m.difficulty === difficulty);
    if (!pool.length) { toast("No MCQs match those filters"); return; }

    if (mode === "adaptive") {
      const sorted = pool.slice().sort((a, b) => { const wa = accuracyOf(state.analytics.byTopic?.[a.topic] || {}) || 50; const wb = accuracyOf(state.analytics.byTopic?.[b.topic] || {}) || 50; return wa - wb; });
      pool = sorted.slice(0, Math.min(count * 2, sorted.length));
    }
    const list = sample(pool, Math.min(count, pool.length));
    state.practice = { list, i: 0, correct: 0, answered: 0, wrong: 0, negative, mode, start: Date.now() };
    $("practiceSetup").hidden = true;
    $("practiceResult").hidden = true;
    $("practiceArea").hidden = false;
    hideListChrome("view-practice");
    renderPracticeQ();
    scrollToQuizTop();
  }

  function renderPracticeQ() {
    const p = state.practice;
    const m = p.list[p.i];
    const scoreVal = p.negative ? (p.correct - p.wrong * 0.25).toFixed(2) : p.correct;
    $("pProgress").textContent = `Question ${p.i + 1} of ${p.list.length}`;
    $("pScore").textContent = `Score: ${scoreVal}`;
    const card = $("pCard");
    card.innerHTML = "";
    scrollToQuizTop();
    const mcqEl = mcqCard(m, {
      onAnswer: (ok) => {
        p.answered++;
        if (ok) p.correct++; else p.wrong++;
        const newScore = p.negative ? (p.correct - p.wrong * 0.25).toFixed(2) : p.correct;
        $("pScore").textContent = `Score: ${newScore}`;
        checkAchievements({});

        // Add manual next button to action bar so user isn't rushed while reading explanation
        const actions = mcqEl.querySelector(".mcq-actions");
        if (actions) {
          const nextBtn = document.createElement("button");
          nextBtn.className = "btn btn-primary btn-sm";
          nextBtn.textContent = p.i + 1 < p.list.length ? "Next Question →" : "View Results →";
          nextBtn.addEventListener("click", () => advancePractice());
          actions.appendChild(nextBtn);
        }
      }
    });
    card.appendChild(mcqEl);
  }

  function advancePractice() {
    const p = state.practice;
    if (p.i + 1 < p.list.length) {
      p.i++;
      renderPracticeQ();
    } else {
      $("practiceArea").hidden = true;
      const netScore = p.negative ? p.correct - p.wrong * 0.25 : p.correct;
      const pts = Math.max(0, Math.round(netScore * 5));
      if (pts > 0) awardPoints(pts);
      const pct = p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : 0;
      addHistory({ kind: "practice", mode: p.mode, title: `Practice (${p.mode})`, correct: p.correct, total: p.list.length, pct });
      const body = $("practiceResultBody");
      body.innerHTML = `
        <div class="result-score">${pct}%</div>
        <div class="result-stats">
          <div><strong>${p.correct}</strong><span>Correct</span></div>
          <div><strong>${p.wrong}</strong><span>Wrong</span></div>
          <div><strong>${p.answered}</strong><span>Answered</span></div>
          <div><strong>${p.list.length}</strong><span>Total</span></div>
        </div>
        <p class="muted small">+${pts} leaderboard points</p>`;
      $("practiceResult").hidden = false;
      scrollToQuizTop();
    }
  }

  /* ---------- Quiz & mock ---------- */
  function renderQuizList() {
    showListChrome("view-quiz");
    $("quizArea").hidden = true;
    $("quizResult").hidden = true;
    $("quizList").hidden = false;
    $("mockList").hidden = false;
    $("paperQuizSection").hidden = false;
    renderQuizGrid($("quizList"), state.quizzes);
    renderPaperQuizGrid();
    const mg = $("mockGrid");
    mg.innerHTML = "";
    state.mockTests.forEach((mt) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.innerHTML = `
        <h3>${esc(mt.title)}</h3>
        <p>${esc(mt.description)}</p>
        <div class="card-meta">
          <span class="chip">${mt.totalQuestions} questions</span>
          <span class="chip chip-gold">${mt.durationMins} min</span>
          <span class="chip chip-gray">${mt.difficulty}</span>
          ${mt.negativeMarking ? '<span class="chip chip-red">−ve marking</span>' : ""}
        </div>
        <button class="btn btn-gold btn-sm start-mock" data-id="${mt.id}">Start Mock Test</button>`;
      mg.appendChild(card);
    });
    mg.querySelectorAll(".start-mock").forEach((b) => b.addEventListener("click", () => startMock(b.dataset.id)));
  }

  function renderPaperQuizGrid() {
    const el = $("paperQuizList");
    el.innerHTML = "";
    state.papers.slice(0, 10).forEach((p) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.innerHTML = `
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="card-meta">
          <span class="chip">15 questions</span>
          <span class="chip chip-gold">15 min</span>
          <span class="chip chip-gray">${esc((state.exams.find((x) => x.id === p.exam)?.name || p.exam).toUpperCase())}</span>
        </div>
        <button class="btn btn-primary btn-sm start-paperquiz" data-id="${p.id}">Practice as Quiz</button>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".start-paperquiz").forEach((b) => b.addEventListener("click", () => startPaperQuiz(b.dataset.id)));
  }

  async function startPaperQuiz(id) {
    const paper = state.papers.find((p) => p.id == id);
    if (!paper) return;
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ subject: paper.subjects.join(","), limit: Math.min(15, paper.totalQuestions || 15) }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      const pool = paper.subjects.length ? state.mcqs.filter((m) => paper.subjects.includes(m.subject)) : state.mcqs;
      list = sample(pool, Math.min(15, pool.length));
    }
    if (!list.length) { toast("No MCQs available for this paper"); return; }
    state.quiz = { meta: { id: paper.id, title: "Quick Quiz: " + paper.title, durationMins: 15 }, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: false, mock: false, weekly: false, paperQuiz: true, recommended: false };
    switchToQuizMode();
    $("qNegChip").hidden = true;
    startTimer("qTimer", 15 * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  async function startMock(id) {
    const mt = state.mockTests.find((m) => m.id == id);
    if (!mt) return;
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ subject: mt.subjects.join(","), limit: Math.min(mt.totalQuestions || 10, 50) }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      let pool = mt.subjects.length ? state.mcqs.filter((m) => mt.subjects.includes(m.subject)) : state.mcqs;
      list = sample(pool, Math.min(mt.totalQuestions, pool.length));
    }
    if (!list.length) { toast("No MCQs available for this mock"); return; }
    state.quiz = { meta: mt, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: !!mt.negativeMarking, mock: true };
    switchToQuizMode();
    $("qNegChip").hidden = !state.quiz.negative;
    startTimer("qTimer", mt.durationMins * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  async function startQuiz(id) {
    const qz = state.quizzes.find((q) => q.id == id);
    if (!qz) return;
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ subject: qz.subjects.join(","), limit: Math.min(qz.totalQuestions || 10, 50) }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      let pool = qz.subjects.length ? state.mcqs.filter((m) => qz.subjects.includes(m.subject)) : state.mcqs;
      list = sample(pool, Math.min(qz.totalQuestions, pool.length));
    }
    if (!list.length) { toast("No MCQs available for this quiz"); return; }
    state.quiz = { meta: qz, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: false, mock: false };
    switchToQuizMode();
    $("qNegChip").hidden = true;
    startTimer("qTimer", qz.durationMins * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  function renderQuizQ() {
    const q = state.quiz;
    const m = q.list[q.i];
    $("qProgressChip").textContent = `Question ${q.i + 1} of ${q.list.length}`;
    $("qScoreChip").textContent = `Score: ${q.correct}`;
    const card = $("qCard");
    card.innerHTML = "";
    scrollToQuizTop();
    card.appendChild(mcqCard(m, {
      onAnswer: (ok) => {
        q.answered++;
        if (ok) q.correct++; else q.wrong++;
        $("qScoreChip").textContent = `Score: ${q.correct}`;
        checkAchievements({});
        setTimeout(() => {
          if (q.i + 1 < q.list.length) { q.i++; renderQuizQ(); }
          else endQuiz(false);
        }, 1400);
      }
    }));
  }

  function endQuiz(timedOut) {
    const q = state.quiz;
    clearInterval(q.timer);
    if (timedOut) toast("Time is up!");
    $("quizArea").hidden = true;
    const net = q.negative ? q.correct - q.wrong * 0.25 : q.correct;
    const pct = Math.round((Math.max(0, net) / q.list.length) * 100);
    const cert = pct >= 80 && !q.mock ? earnCertificate("quiz", q.meta.title, pct) : (pct >= 80 && q.mock ? earnCertificate("mock", q.meta.title, pct) : null);
    const pts = q.mock ? Math.round(pct * 2) : Math.round(pct);
    awardPoints(pts);
    addHistory({ kind: q.mock ? "mock" : "quiz", title: q.meta.title, correct: q.correct, total: q.list.length, pct, negative: q.negative });
    checkAchievements({ pct, mockPct: q.mock ? pct : 0 });
    if (cert) setTimeout(() => showCert(cert), 800);
    showResult("quizResult", q.meta.title, q.correct, q.answered, q.list.length, pct, pts, cert);
    scrollToQuizTop();
  }

  function showResult(containerId, title, correct, answered, total, pct, pts, cert) {
    const el = $(containerId);
    $("quizResultTitle").textContent = title;
    const body = $("quizResultBody");
    const verdict = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep practicing" : "Needs more study";
    body.innerHTML = `
      <div class="result-score">${pct}%</div>
      <p>${verdict}</p>
      ${cert ? '<p><span class="chip chip-gold">🎓 Certificate earned!</span></p>' : ""}
      <div class="result-stats">
        <div><strong>${correct}</strong><span>Correct</span></div>
        <div><strong>${answered - correct}</strong><span>Wrong</span></div>
        <div><strong>${total - answered}</strong><span>Unanswered</span></div>
        <div><strong>${total}</strong><span>Total</span></div>
      </div>
      <p class="muted small">+${pts} leaderboard points</p>`;
    el.hidden = false;
  }

  function startTimer(elId, seconds, onDone) {
    const el = $(elId);
    el.dataset.seconds = seconds;
    const tick = () => {
      const s = parseInt(el.dataset.seconds, 10);
      const m = String(Math.floor(s / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      el.textContent = `${m}:${sec}`;
      if (s <= 0) { clearInterval(state.timerInt); onDone(); return; }
      el.dataset.seconds = s - 1;
    };
    clearInterval(state.timerInt);
    tick();
    state.timerInt = setInterval(tick, 1000);
    (state.quiz && (state.quiz.timer = state.timerInt));
    (state.exam && (state.exam.timer = state.timerInt));
  }

  /* ---------- Papers / Exam ---------- */
  function renderPapers() {
    showListChrome("view-papers");
    $("examArea").hidden = true;
    $("examResult").hidden = true;
    $("paperList").hidden = false;
    const exams = [...new Set(state.papers.map((p) => p.exam))].sort();
    fillSelect($("paperExamFilter"), exams.map((e) => ({ id: e, name: (state.exams.find((x) => x.id === e)?.name || e).toUpperCase() })), "All exams");
    applyPaperFilter();
  }

  function applyPaperFilter() {
    const f = $("paperExamFilter").value;
    const list = f ? state.papers.filter((p) => p.exam === f) : state.papers;
    const el = $("paperList");
    el.innerHTML = "";
    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "paper-card";
      card.innerHTML = `
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="card-meta">
          <span class="chip">${p.totalQuestions} questions</span>
          <span class="chip chip-gold">${p.durationMins} min</span>
          <span class="chip chip-${p.difficulty === "hard" ? "red" : p.difficulty === "medium" ? "gold" : "gray"}">${p.difficulty}</span>
          <span class="chip chip-gray">${p.pattern ? "Pattern Paper" : (p.year || "—")}</span>
          <span class="chip chip-gray">${(state.exams.find((x) => x.id === p.exam)?.name || p.exam).toUpperCase()}</span>
        </div>
        <button class="btn btn-primary btn-sm start-exam" data-id="${p.id}">Take Paper</button>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".start-exam").forEach((b) => b.addEventListener("click", () => startExam(b.dataset.id)));
  }

  async function startExam(id) {
    const paper = state.papers.find((p) => p.id == id);
    if (!paper) return;
    let pool = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ subject: paper.subjects.join(","), limit: paper.totalQuestions || 15 }));
        pool = (r.results || []).map(DB.mapMcq);
      } catch (e) { pool = []; }
    }
    if (!pool.length) {
      pool = paper.subjects.length ? state.mcqs.filter((m) => paper.subjects.includes(m.subject)) : state.mcqs;
      if (pool.length < paper.totalQuestions) pool = sample(pool, pool.length);
      else pool = sample(pool, paper.totalQuestions);
    }
    if (!pool.length) { toast("No MCQs available for this paper"); return; }
    state.exam = {
      meta: paper,
      list: pool,
      answers: new Array(pool.length).fill(null),
      i: 0,
      timer: null,
      start: Date.now()
    };
    $("paperList").hidden = true;
    $("examResult").hidden = true;
    $("examArea").hidden = false;
    hideListChrome("view-papers");
    startTimer("eTimer", paper.durationMins * 60, () => submitExam(true));
    renderExamQ();
    renderPalette();
    scrollToQuizTop();
  }

  function renderPalette() {
    const e = state.exam;
    const pal = $("ePalette");
    pal.innerHTML = "";
    e.list.forEach((m, i) => {
      const b = document.createElement("button");
      b.textContent = i + 1;
      b.setAttribute("aria-label", "Go to question " + (i + 1));
      b.className = (e.answers[i] ? "answered " : "") + (i === e.i ? "current" : "");
      b.onclick = () => { e.i = i; renderExamQ(); renderPalette(); };
      pal.appendChild(b);
    });
  }

  function renderExamQ() {
    const e = state.exam;
    const m = e.list[e.i];
    $("eProgressChip").textContent = `Question ${e.i + 1} of ${e.list.length}`;
    const card = $("eCard");
    card.innerHTML = "";
    scrollToQuizTop();
    const mc = mcqCard(m);
    mc.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      mc.querySelectorAll(".opt").forEach((o) => { o.disabled = true; o.classList.remove("selected"); });
      b.classList.add("selected");
      e.answers[e.i] = b.dataset.opt;
      renderPalette();
    }));
    if (e.answers[e.i]) {
      const idx = ["A", "B", "C", "D"].indexOf(e.answers[e.i]);
      mc.querySelectorAll(".opt")[idx].classList.add("selected");
    }
    card.appendChild(mc);
  }

  function submitExam(timedOut) {
    const e = state.exam;
    clearInterval(e.timer);
    if (timedOut) toast("Time is up - paper submitted");
    let correct = 0;
    e.list.forEach((m, i) => { if (e.answers[i] === m.correctAnswer) correct++; });
    $("examArea").hidden = true;
    const pct = Math.round((correct / e.list.length) * 100);
    const cert = pct >= 80 ? earnCertificate("paper", e.meta.title, pct) : null;
    awardPoints(Math.round(pct * 3));
    addHistory({ kind: "paper", title: e.meta.title, correct, total: e.list.length, pct });
    checkAchievements({ pct, mockPct: 0 });
    if (cert) setTimeout(() => showCert(cert), 800);
    const body = $("examResultBody");
    const verdict = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep practicing" : "Needs more study";
    body.innerHTML = `
      <div class="result-score">${correct}/${e.list.length} (${pct}%)</div>
      <p>${verdict} ${cert ? '<span class="chip chip-gold">🎓 Certificate earned!</span>' : ""}</p>
      <div class="result-stats">
        <div><strong>${correct}</strong><span>Correct</span></div>
        <div><strong>${e.answers.filter(Boolean).length - correct}</strong><span>Wrong</span></div>
        <div><strong>${e.answers.filter((a) => a === null).length}</strong><span>Unanswered</span></div>
        <div><strong>${e.list.length}</strong><span>Total</span></div>
      </div>
      <p class="muted small">+${Math.round(pct * 3)} leaderboard points</p>
      <button id="examReviewBtn" class="btn btn-outline btn-sm" style="margin-top:12px">Review All Answers & Explanations</button>
      <div id="examReviewArea" class="mcq-list" style="margin-top:16px;text-align:left" hidden></div>`;
    $("examResultTitle").textContent = `${e.meta.title} - Result`;
    $("examResult").hidden = false;
    scrollToQuizTop();

    const revBtn = $("examReviewBtn");
    const revArea = $("examReviewArea");
    if (revBtn && revArea) {
      revBtn.onclick = () => {
        if (revArea.hidden) {
          revArea.innerHTML = "";
          e.list.forEach((m, idx) => {
            const card = mcqCard(m, { reveal: true });
            const userAns = e.answers[idx];
            const badge = document.createElement("div");
            badge.style.marginBottom = "8px";
            if (!userAns) badge.innerHTML = `<span class="chip chip-gray">Unanswered</span>`;
            else if (userAns === m.correctAnswer) badge.innerHTML = `<span class="chip chip-green">Your Answer: ${userAns} (Correct)</span>`;
            else badge.innerHTML = `<span class="chip chip-red">Your Answer: ${userAns} (Incorrect)</span>`;
            card.prepend(badge);
            revArea.appendChild(card);
          });
          revArea.hidden = false;
          revBtn.textContent = "Hide Review";
        } else {
          revArea.hidden = true;
          revBtn.textContent = "Review All Answers & Explanations";
        }
      };
    }
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const u = state.user;
    const a = state.analytics;
    const acc = accuracyOf(a);
    $("dashStreak").textContent = (u.streak || 0) + " days";
    $("dashAccuracy").textContent = acc + "%";
    $("dashAnswered").textContent = a.total || 0;
    $("dashPoints").textContent = u.points || 0;

    const ach = $("achList");
    ach.innerHTML = "";
    const defs = ["First Steps", "Century Club", "MCQ Veteran", "3-Day Streak", "Week Warrior", "Sharpshooter (80%+ accuracy)", "Quiz Ace (80%+ in a quiz)", "Mock Master (80%+ in a mock)", "Certified Collector", "Weekly Challenge", "Monthly Champion"];
    defs.forEach((d) => {
      const x = u.achievements?.[d];
      const el = document.createElement("div");
      el.className = "ach-item" + (x ? "" : " locked");
      el.innerHTML = `<span>${x ? "🏅" : "🔒"}</span><div><strong>${esc(d)}</strong><small>${x ? "Unlocked " + esc(x.date) : "Not yet unlocked"}</small></div>`;
      ach.appendChild(el);
    });

    const certs = $("certList");
    certs.innerHTML = "";
    const cl = u.certificates || [];
    if (!cl.length) certs.innerHTML = '<p class="muted">No certificates yet. Score 80%+ in a quiz, mock or paper to earn one.</p>';
    cl.forEach((c) => {
      const b = document.createElement("button");
      b.className = "btn btn-sm btn-outline";
      b.textContent = `🎓 ${esc(c.title)} — ${c.pct}% (${c.date})`;
      b.addEventListener("click", () => showCert(c));
      certs.appendChild(b);
    });

    const hist = $("historyList");
    hist.innerHTML = "";
    const h = u.history || [];
    if (!h.length) hist.innerHTML = '<p class="muted">No history yet - take a quiz or practice session.</p>';
    else {
      const ul = document.createElement("ul");
      ul.className = "hist-list";
      h.slice(0, 15).forEach((x) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="chip chip-${x.kind === "quiz" ? "gold" : x.kind === "mock" ? "red" : "green"}">${esc(x.kind)}</span> <strong>${esc(x.title)}</strong> — ${x.correct}/${x.total} (${x.pct}%) <small class="muted">${new Date(x.ts).toLocaleString()}</small>`;
        ul.appendChild(li);
      });
      hist.appendChild(ul);
    }

    const wt = $("weakTopicList");
    wt.innerHTML = "";
    const weak = weakTopics();
    if (!weak.length) wt.innerHTML = '<p class="muted">No weak topics detected yet - answer at least 3 questions per topic. Keep going!</p>';
    else {
      const ul = document.createElement("ul");
      ul.className = "hist-list";
      weak.slice(0, 10).forEach((w) => {
        const li = document.createElement("li");
        const t = topicOf(w.topic);
        li.innerHTML = `<span class="chip chip-red">${w.acc}%</span> ${esc(t?.name || w.topic)} <small class="muted">(${w.total} answered)</small>`;
        ul.appendChild(li);
      });
      wt.appendChild(ul);
    }
    renderPlanner();
  }

  /* ---------- AI Study Planner ---------- */
  const PLAN_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  function renderPlanner() {
    const el = $("plannerList");
    el.innerHTML = "";
    const slots = [];
    const todayIdx = new Date().getDay();
    const weak = weakTopics().slice(0, 4);
    weak.forEach((w) => {
      const t = topicOf(w.topic);
      slots.push({
        label: `Revise & drill: ${t?.name || w.topic}`,
        sub: `Currently ${w.acc}% accuracy on ${w.total} answers - complete 10 targeted questions today.`,
        btn: "Practice Topic",
        action: () => startPresetPractice("topic", w.topic)
      });
    });
    while (slots.length < 4) {
      slots.push({
        label: "Build a baseline",
        sub: "Answer 20+ questions in any subject to unlock AI weakness detection and sharper planning.",
        btn: "Start Mixed Practice",
        action: () => startPresetPractice("mixed")
      });
    }
    slots.push({
      label: "Revisit your mistakes",
      sub: "Practice previously answered questions to lock in corrections and stop repeat errors.",
      btn: "Revision Session",
      action: () => startPresetPractice("revision")
    });
    slots.push({
      label: "Full mock test",
      sub: "Simulate a real exam with a timer and no instant feedback to build exam stamina.",
      btn: "Open Mocks",
      action: () => goto("quiz")
    });
    slots.push({
      label: "Endurance run",
      sub: "30-question mixed practice across all subjects. Aim for 70%+ to keep your form sharp.",
      btn: "30-Question Run",
      action: () => startPresetPractice("mixed30")
    });
    slots.forEach((s, i) => {
      const day = PLAN_DAYS[(todayIdx + i) % 7];
      const row = document.createElement("div");
      row.className = "planner-day";
      row.innerHTML = `<span class="chip chip-gray">${esc(day)}</span><p><strong>${esc(s.label)}</strong><br><span class="muted small">${esc(s.sub)}</span></p>`;
      const b = document.createElement("button");
      b.className = "btn btn-outline btn-sm";
      b.textContent = s.btn;
      b.addEventListener("click", s.action);
      row.appendChild(b);
      el.appendChild(row);
    });
  }

  async function startPresetPractice(kind, topicId) {
    let pool = [], count = 20, mode = "normal";
    if (kind === "topic") {
      if (DB.enabled) {
        try {
          const r = await DB.get("/api/random" + DB.qs({ topic: topicId, limit: 10 }));
          pool = (r.results || []).map(DB.mapMcq);
        } catch (e) { pool = []; }
      } else pool = state.mcqs.filter((m) => m.topic === topicId);
      count = Math.min(10, pool.length);
      mode = "topic";
    } else if (kind === "revision") {
      if (DB.enabled) {
        try {
          const r = await DB.get("/api/random" + DB.qs({ limit: 20 }));
          pool = (r.results || []).map(DB.mapMcq);
        } catch (e) { pool = []; }
      } else {
        const seen = new Set(Object.keys(state.analytics.byTopic || {}));
        pool = state.mcqs.filter((m) => seen.has(m.topic));
      }
      mode = "revision";
    } else {
      count = kind === "mixed30" ? 30 : 20;
      if (DB.enabled) {
        try {
          const r = await DB.get("/api/random" + DB.qs({ limit: count }));
          pool = (r.results || []).map(DB.mapMcq);
        } catch (e) { pool = []; }
      }
      if (!pool.length) pool = state.mcqs;
    }
    if (!pool.length) { toast("Not enough questions available yet"); return; }
    state.practice = { list: sample(pool, Math.min(count, pool.length)), i: 0, correct: 0, answered: 0, wrong: 0, negative: false, mode, start: Date.now() };
    switchToPracticeMode();
    renderPracticeQ();
    scrollToQuizTop();
  }

  async function startRecommendedQuiz() {
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ limit: 10 }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      const weak = weakTopics().map((w) => w.topic);
      let pool = weak.length ? state.mcqs.filter((m) => weak.includes(m.topic)) : state.mcqs;
      list = sample(pool, Math.min(10, pool.length));
    }
    if (!list.length) { toast("No questions available yet"); return; }
    state.quiz = { meta: { title: "AI Recommended Quiz", durationMins: 15 }, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: false, mock: false, weekly: false, paperQuiz: false, recommended: true };
    switchToQuizMode();
    $("qNegChip").hidden = true;
    startTimer("qTimer", 15 * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  /* ---------- Leaderboard & weekly / monthly challenges ---------- */
  function editLeaderboardName(onSaved) {
    const box = document.createElement("div");
    box.className = "modal";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    const titleId = "lbNameTitle" + Date.now();
    box.innerHTML = `
      <div class="modal-card" style="max-width:340px;text-align:left">
        <h2 id="${titleId}" style="margin-top:0">Your leaderboard name</h2>
        <label for="lbNameInput" style="display:block;font-size:0.85rem;color:var(--muted);margin-bottom:6px">Name (max 30 characters)</label>
        <input id="lbNameInput" type="text" maxlength="30" value="${esc(state.user.name || "")}" style="width:100%;box-sizing:border-box;padding:11px 16px;border-radius:10px;border:1px solid var(--gold);font-size:0.95rem;background:var(--card-bg);color:var(--ink)">
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
          <button class="btn btn-outline" data-act="cancel">Cancel</button>
          <button class="btn btn-primary" data-act="save">Save</button>
        </div>
      </div>`;
    document.body.appendChild(box);
    box.setAttribute("aria-labelledby", titleId);
    const input = box.querySelector("#lbNameInput");
    const done = (ok) => {
      const v = ok ? input.value.trim().slice(0, 30) : "";
      box.remove();
      if (ok && v) { state.user.name = v; saveUser(); onSaved && onSaved(v); }
      const t = $("lbNewEntry");
      if (t) t.focus();
    };
    box.querySelector('[data-act="save"]').addEventListener("click", () => done(true));
    box.querySelector('[data-act="cancel"]').addEventListener("click", () => done(false));
    box.addEventListener("click", (e) => { if (e.target === box) done(false); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") done(true);
      if (e.key === "Escape") done(false);
    });
    input.focus();
    input.select();
  }
  function renderLeaderboard() {
    const tbody = $("lbTable").querySelector("tbody");
    tbody.innerHTML = "";
    if (DB.enabled) {
      DB.get("/api/leaderboard").then((rows) => {
        if (!rows || !rows.length) { tbody.innerHTML = '<tr><td colspan="6" class="muted">No ranked players yet — answer questions to earn points!</td></tr>'; return; }
        rows.forEach((r, i) => {
          const tr = document.createElement("tr");
          const isYou = r.device_id === "default" || r.name === state.user.name;
          tr.innerHTML = `<td>${i + 1}</td><td>${esc(r.name || "Student")}${isYou ? " (you)" : ""}</td><td>${r.total || 0}</td><td>${r.total ? Math.round((r.correct / r.total) * 100) + "%" : "0%"}</td><td>${r.correct || 0}</td><td>${r.points || 0}</td>`;
          tbody.appendChild(tr);
        });
      }).catch(() => { DB.enabled = false; renderLeaderboard(); });
      $("lbNewEntry").onclick = () => editLeaderboardName(() => toast("Leaderboard updated (name syncs to the local server)"));
    } else {
      const entries = state.user.entries || [];
      const pts = state.user.points || 0;
      const hist = (state.user.history || []).filter((h) => h.kind === "quiz" || h.kind === "mock" || h.kind === "paper");
      const best = hist.length ? Math.max(...hist.map((h) => h.pct)) : 0;
      const avg = hist.length ? Math.round(hist.reduce((s, h) => s + h.pct, 0) / hist.length) : 0;

      const row = document.createElement("tr");
      row.innerHTML = `<td>1</td><td>${esc(state.user.name)} (you)</td><td>${hist.length}</td><td>${best}%</td><td>${avg}%</td><td>${pts}</td>`;
      tbody.appendChild(row);
      $("lbNewEntry").onclick = () => editLeaderboardName(() => { renderLeaderboard(); toast("Leaderboard updated"); });
    }

    const wk = $("weekChip");
    const wStart = weekKey();
    if (!state.week || state.week.week !== wStart) state.week = { week: wStart, total: 0, correct: 0, claimed: false };
    saveWeek();
    wk.textContent = `This week: ${state.week.total} answered, ${state.week.correct} correct (${state.week.total ? Math.round((state.week.correct / state.week.total) * 100) : 0}%) - reset every Monday.`;
    const wt = $("weekTop");
    wt.innerHTML = "";
    const frac = state.week.total ? state.week.correct / state.week.total : 0;
    const goal = 20;
    wt.innerHTML = `<p>Progress to 20 correct answers: <strong>${state.week.correct}/${goal}</strong></p><div class="progress"><div class="progress-fill" style="width:${Math.min(100, (state.week.correct / goal) * 100)}%"></div></div>`;
    if (state.week.correct >= goal && !state.week.claimed) {
      $("weekClaim").hidden = false;
      $("weekClaim").onclick = () => {
        state.week.claimed = true;
        saveWeek();
        state.user.achievements = state.user.achievements || {};
        state.user.achievements["Weekly Challenge"] = { unlocked: true, date: now(), value: state.week.correct };
        awardPoints(50);
        saveUser();
        $("weekClaim").hidden = true;
        toast("🏅 Weekly Challenge achievement unlocked! +50 points");
      };
    } else $("weekClaim").hidden = true;
    $("weekStart").onclick = () => startWeekly();

    const mk = monthKey();
    if (!state.month || state.month.month !== mk) state.month = { month: mk, total: 0, correct: 0, claimed: false };
    saveMonth();
    $("monthChip").textContent = `This month: ${state.month.total} answered, ${state.month.correct} correct (${state.month.total ? Math.round((state.month.correct / state.month.total) * 100) : 0}%) - resets on the 1st of each month.`;
    const mtop = $("monthTop");
    mtop.innerHTML = "";
    const mGoal = 80;
    mtop.innerHTML = `<p>Progress to 80 correct answers: <strong>${state.month.correct}/${mGoal}</strong></p><div class="progress"><div class="progress-fill" style="width:${Math.min(100, (state.month.correct / mGoal) * 100)}%"></div></div>`;
    if (state.month.correct >= mGoal && !state.month.claimed) {
      $("monthClaim").hidden = false;
      $("monthClaim").onclick = () => {
        state.month.claimed = true;
        saveMonth();
        state.user.achievements = state.user.achievements || {};
        state.user.achievements["Monthly Champion"] = { unlocked: true, date: now(), value: state.month.correct };
        awardPoints(150);
        saveUser();
        $("monthClaim").hidden = true;
        toast("🏅 Monthly Champion achievement unlocked! +150 points");
      };
    } else $("monthClaim").hidden = true;
    $("monthStart").onclick = () => startMonthly();
  }

  async function startWeekly() {
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ limit: 20 }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      const pool = state.mcqs;
      list = sample(pool, Math.min(20, pool.length));
    }
    if (!list.length) { toast("No questions available yet"); return; }
    state.quiz = { meta: { title: "Weekly Challenge", durationMins: 25 }, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: false, mock: false, weekly: true, paperQuiz: false, recommended: false };
    switchToQuizMode();
    $("qNegChip").hidden = true;
    startTimer("qTimer", 25 * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  async function startMonthly() {
    let list = [];
    if (DB.enabled) {
      try {
        const r = await DB.get("/api/random" + DB.qs({ limit: 25 }));
        list = (r.results || []).map(DB.mapMcq);
      } catch (e) { list = []; }
    }
    if (!list.length) {
      const pool = state.mcqs;
      list = sample(pool, Math.min(25, pool.length));
    }
    if (!list.length) { toast("No questions available yet"); return; }
    state.quiz = { meta: { title: "Monthly Challenge", durationMins: 30 }, list, i: 0, correct: 0, answered: 0, wrong: 0, start: Date.now(), timer: null, negative: false, mock: false, weekly: false, paperQuiz: false, recommended: false, monthly: true };
    switchToQuizMode();
    $("qNegChip").hidden = true;
    startTimer("qTimer", 30 * 60, () => endQuiz(true));
    renderQuizQ();
    scrollToQuizTop();
  }

  /* ---------- Bookmarks ---------- */
  function renderBookmarks() {
    const el = $("bookmarkList");
    el.innerHTML = "";
    const list = state.mcqs.filter((m) => state.bookmarks.includes(m.id));
    if (DB.enabled && list.length !== state.bookmarks.length) {
      const missing = state.bookmarks.filter((id) => !list.find((m) => m.id === id));
      if (missing.length) {
        DB.get("/api/mcqs" + DB.qs({ ids: missing.slice(0, 200).join(",") })).then((rows) => {
          if (!rows || !rows.length) return;
          rows.map(DB.mapMcq).forEach((m) => list.push(m));
          if (!list.length) { el.innerHTML = '<p class="muted">No bookmarks yet. Use the 🔖 button on any MCQ to save it here.</p>'; return; }
          el.innerHTML = "";
          list.forEach((m) => el.appendChild(mcqCard(m)));
        });
        return;
      }
    }
    if (!list.length) { el.innerHTML = '<p class="muted">No bookmarks yet. Use the 🔖 button on any MCQ to save it here.</p>'; return; }
    list.forEach((m) => el.appendChild(mcqCard(m)));
  }

  /* ---------- Certificate modal ---------- */
  let certLastFocus = null;
  function showCert(c) {
    const m = $("certModal");
    $("certBody").textContent = `This certifies that ${state.user.name} scored ${c.pct}% in "${c.title}" on Pakistan MCQs Hub (${c.date}).`;
    $("certMeta").textContent = `Certificate ID: ${c.id} • Pakistan MCQs Hub • Free practice platform`;
    certLastFocus = document.activeElement;
    m.hidden = false;
    $("certClose").focus();
    const close = () => { m.hidden = true; if (certLastFocus) certLastFocus.focus(); };
    $("certClose").onclick = close;
    $("certPrint").onclick = () => window.print();
    m.onkeydown = (ev) => { if (ev.key === "Escape") close(); };
    const tabbable = m.querySelectorAll("button");
    m.onkeydown = (ev) => {
      if (ev.key !== "Tab") return;
      const first = tabbable[0], last = tabbable[tabbable.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    };
  }

  /* ---------- Global search ---------- */
  let searchTimer = null;
  function doSearch() {
    const q = $("globalSearch").value;
    state.browse.search = q;
    state.browse.page = 1;
    $("searchSuggest").hidden = true;
    goto("browse");
  }
  function suggestSearch() {
    clearTimeout(searchTimer);
    const q = $("globalSearch").value.trim();
    const sug = $("searchSuggest");
    if (q.length < 2) { sug.hidden = true; return; }
    searchTimer = setTimeout(() => {
      if (DB.enabled) {
        DB.get("/api/search" + DB.qs({ q, limit: 6 })).then((res) => {
          const hits = (res.results || []).map(DB.mapMcq);
          sug.innerHTML = "";
          if (!hits.length) { sug.innerHTML = '<div class="sug-item muted">No matches - try a shorter word</div>'; }
          hits.forEach((m) => {
            const d = document.createElement("button");
            d.className = "sug-item";
            d.textContent = m.question.slice(0, 70);
            d.addEventListener("click", () => {
              $("globalSearch").value = m.question.slice(0, 60);
              state.browse.search = m.question.slice(0, 60);
              state.browse.page = 1;
              sug.hidden = true;
              goto("browse");
            });
            sug.appendChild(d);
          });
          sug.hidden = false;
        }).catch(() => { sug.hidden = true; });
        return;
      }
      const hits = aiSearch(q).slice(0, 6);
      sug.innerHTML = "";
      if (!hits.length) { sug.innerHTML = '<div class="sug-item muted">No matches - try a shorter word</div>'; }
      hits.forEach((m) => {
        const d = document.createElement("button");
        d.className = "sug-item";
        d.textContent = m.question.slice(0, 70);
        d.addEventListener("click", () => {
          $("globalSearch").value = m.question.slice(0, 60);
          state.browse.search = m.question.slice(0, 60);
          state.browse.page = 1;
          sug.hidden = true;
          goto("browse");
        });
        sug.appendChild(d);
      });
      sug.hidden = false;
    }, 180);
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => b.addEventListener("click", () => goto(b.dataset.view)));
    $("menuToggle").addEventListener("click", () => document.querySelector(".main-nav").classList.toggle("open"));
    $("darkToggle").addEventListener("click", toggleTheme);
    $("searchBtn").addEventListener("click", doSearch);
    $("globalSearch").addEventListener("keydown", (ev) => {
      const sug = $("searchSuggest");
      const items = [...sug.querySelectorAll("button")];
      if (ev.key === "Enter") doSearch();
      else if (ev.key === "ArrowDown" && !sug.hidden && items.length) { ev.preventDefault(); items[0].focus(); }
      else if (ev.key === "ArrowUp" && !sug.hidden && items.length) { ev.preventDefault(); items[items.length - 1].focus(); }
      else if (ev.key === "Escape") sug.hidden = true;
    });
    $("searchSuggest").addEventListener("keydown", (ev) => {
      const sug = $("searchSuggest");
      if (ev.key === "Escape") { sug.hidden = true; $("globalSearch").focus(); return; }
      if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
      const items = [...sug.querySelectorAll("button")];
      if (!items.length) return;
      const i = items.indexOf(document.activeElement);
      const next = ev.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      ev.preventDefault();
      items[next].focus();
    });
    $("globalSearch").addEventListener("input", suggestSearch);
    document.addEventListener("click", (e) => { if (!$("searchSuggest").contains(e.target) && e.target !== $("globalSearch")) $("searchSuggest").hidden = true; });

    $("fSubject").addEventListener("change", (e) => {
      state.browse.subject = e.target.value;
      state.browse.chapter = "";
      state.browse.topic = "";
      state.browse.subtopic = "";
      state.browse.related = null;
      state.browse.page = 1;
      if (e.target.value) {
        fillSelect($("fChapter"), chaptersOf(e.target.value), "All chapters");
        $("fChapter").disabled = false;
        $("fTopic").innerHTML = '<option value="">Select chapter first</option>';
        $("fTopic").disabled = true;
      } else {
        $("fChapter").innerHTML = '<option value="">Select subject first</option>';
        $("fChapter").disabled = true;
        $("fTopic").innerHTML = '<option value="">Select chapter first</option>';
        $("fTopic").disabled = true;
      }
      updateSubtopicUI();
      applyBrowse();
    });
    $("fChapter").addEventListener("change", (e) => {
      state.browse.chapter = e.target.value;
      state.browse.topic = "";
      state.browse.subtopic = "";
      state.browse.related = null;
      state.browse.page = 1;
      if (e.target.value) {
        fillSelect($("fTopic"), topicsOf(e.target.value), "All topics");
        $("fTopic").disabled = false;
      } else {
        $("fTopic").innerHTML = '<option value="">Select chapter first</option>';
        $("fTopic").disabled = true;
      }
      updateSubtopicUI();
      applyBrowse();
    });
    $("fTopic").addEventListener("change", (e) => { state.browse.topic = e.target.value; state.browse.subtopic = ""; state.browse.related = null; state.browse.page = 1; updateSubtopicUI(); applyBrowse(); });
    $("fSubtopic").addEventListener("change", (e) => { state.browse.subtopic = e.target.value; state.browse.page = 1; applyBrowse(); });
    $("fDifficulty").addEventListener("change", (e) => { state.browse.difficulty = e.target.value; state.browse.page = 1; applyBrowse(); });
    $("fExam").addEventListener("change", (e) => { state.browse.exam = e.target.value; state.browse.page = 1; applyBrowse(); });
    $("fYear").addEventListener("change", (e) => { state.browse.year = e.target.value; state.browse.page = 1; applyBrowse(); });
    $("fType").addEventListener("change", (e) => { state.browse.type = e.target.value; state.browse.page = 1; applyBrowse(); });
    $("fReset").addEventListener("click", () => {
      state.browse = { subject: "", chapter: "", topic: "", subtopic: "", difficulty: "", exam: "", year: "", type: "", page: 1, search: "", related: null };
      $("globalSearch").value = "";
      $("fChapter").innerHTML = '<option value="">Select subject first</option>';
      $("fChapter").disabled = true;
      $("fTopic").innerHTML = '<option value="">Select chapter first</option>';
      $("fTopic").disabled = true;
      $("fSubtopic").innerHTML = '<option value="">Select chapter first</option>';
      $("fSubtopic").disabled = true;
      renderBrowse();
    });

    $("pStart").addEventListener("click", startPractice);
    $("pQuit").addEventListener("click", () => { state.practice = null; $("practiceArea").hidden = true; $("practiceSetup").hidden = false; });
    $("pAgain").addEventListener("click", renderPracticeSetup);

    $("qQuit").addEventListener("click", () => { clearInterval(state.timerInt); state.quiz = null; renderQuizList(); });
    $("quizRetry").addEventListener("click", () => {
      if (!state.quiz) return;
      if (state.quiz.mock) startMock(state.quiz.meta.id);
      else if (state.quiz.paperQuiz) startPaperQuiz(state.quiz.meta.id);
      else if (state.quiz.recommended) startRecommendedQuiz();
      else if (state.quiz.monthly) startMonthly();
      else if (state.quiz.weekly) startWeekly();
      else startQuiz(state.quiz.meta.id);
    });
    $("quizBack").addEventListener("click", renderQuizList);

    $("paperExamFilter").addEventListener("change", applyPaperFilter);
    $("ePrev").addEventListener("click", () => { if (state.exam.i > 0) { state.exam.i--; renderExamQ(); renderPalette(); } });
    $("eNext").addEventListener("click", () => { if (state.exam.i < state.exam.list.length - 1) { state.exam.i++; renderExamQ(); renderPalette(); } });
    $("eSubmit").addEventListener("click", () => submitExam(false));
    $("examRetry").addEventListener("click", () => state.exam && startExam(state.exam.meta.id));
    $("examBack").addEventListener("click", renderPapers);

    $("bmPractice").addEventListener("click", () => {
      const go = (list) => {
        if (!list.length) { toast("No bookmarked questions yet"); return; }
        state.practice = { list: sample(list, Math.min(20, list.length)), i: 0, correct: 0, answered: 0, wrong: 0, negative: false, mode: "bookmarks" };
        switchToPracticeMode();
        renderPracticeQ();
        scrollToQuizTop();
      };
      if (DB.enabled) {
        const ids = state.bookmarks.slice(0, 200).join(",");
        if (!ids) { toast("No bookmarked questions yet"); return; }
        DB.get("/api/mcqs" + DB.qs({ ids })).then((rows) => go((rows || []).map(DB.mapMcq))).catch(() => go([]));
        return;
      }
      go(state.mcqs.filter((m) => state.bookmarks.includes(m.id)));
    });

    $("planRecommended").addEventListener("click", startRecommendedQuiz);

    window.addEventListener("hashchange", route);
  }

  function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("pmh_theme", state.theme);
    document.documentElement.dataset.theme = state.theme;
    $("darkToggle").textContent = state.theme === "light" ? "🌙" : "☀️";
  }

  /* ---------- Init ---------- */
  (async function init() {
    document.documentElement.dataset.theme = state.theme;
    $("darkToggle").textContent = state.theme === "light" ? "🌙" : "☀️";
    $("certModal").hidden = true;
    bindEvents();
    await loadConfig();
    applyStatFallbacks();
    try {
      await loadAll();
      if (DB.enabled) {
        const b = $("dbBadge");
        b.hidden = false;
        b.textContent = "SQLite " + (DB.stats ? DB.stats.mcqs.toLocaleString() : (DB.total ? (DB.total / 1000).toFixed(0) + "K" : ""));
      }
      if ($("dbStatus")) renderDbStatus();
    } catch (err) {
      document.body.innerHTML = `
        <div class="container" style="padding:60px 0;text-align:center">
          <h1>Could not load data</h1>
          <p class="muted">${esc(err.message)}</p>
          <p class="muted">Please serve this site over HTTP (e.g. <code>npx serve</code> or GitHub Pages) - opening index.html directly may block data files.</p>
        </div>`;
    }
  })();
})();

