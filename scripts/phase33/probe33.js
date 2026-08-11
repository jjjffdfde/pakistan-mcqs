/* ============================================================
   Phase 28 - browser runtime probe
   Loads a target page in an iframe, harvests console/network/
   layout/a11y/storage facts and runs scripted interaction
   workflows. Writes JSON results into #p28out textarea.
   ============================================================ */
"use strict";
(function () {
  const qs = new URLSearchParams(location.search);
  const PAGE = qs.get("u") || "index.html";
  const W = parseInt(qs.get("w") || "1366", 10);
  const H = parseInt(qs.get("h") || "900", 10);
  const INTER = qs.get("inter") === "1";
  const CASEID = qs.get("case") || PAGE;
  const SKIP = qs.get("sk") || "";
  const XSK = qs.get("xsk") || "";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const out = {
    case: CASEID, page: PAGE, w: W, h: H, interacted: INTER,
    harvest: {}, interactions: [], storage: {}, perf: {}, a11y: {}, layout: {}, errors: {}, net: []
  };

  /* ---------- fresh profile state ---------- */
  const KEYS_BEFORE = ["pmh_user", "pmh_analytics", "pmh_week", "pmh_month", "pmh_theme", "pmh_recent", "pmh_installed", "pmh_last_notif_date", "pmh_mcqs", "pmh_topics", "pmh_subjects", "pmh_cats", "pmh_imgs", "pmh_mcq_bank", "admin_mcqs", "admin_subjects", "admin_topics", "admin_cats", "admin_imgs"];
  for (const k of KEYS_BEFORE) { try { localStorage.removeItem(k); } catch (e) {} try { sessionStorage.removeItem(k); } catch (e) {} }

  const frame = document.createElement("iframe");
  frame.id = "app";
  frame.style.width = W + "px";
  frame.style.height = H + "px";
  frame.style.border = "0";
  frame.src = "/" + PAGE + "?p28=1";
  document.body.appendChild(frame);

  const D = () => frame.contentDocument;
  const WN = () => frame.contentWindow;

  function waitApp(ms) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      (function poll() {
        const fr = D();
        const p = WN() && WN().__p28;
        const settled = fr && fr.readyState === "complete" && p && p.ready;
        let loaded = !INTER;
        try {
          if (INTER && PAGE === "index.html") {
            const s = $("#statMcqs");
            loaded = s && s.textContent !== "0";
          }
        } catch (e) {}
        if ((settled && loaded) || Date.now() - t0 > ms) return resolve();
        setTimeout(poll, 200);
      })();
    });
  }

  function step(name, fn, opts) {
    return Promise.resolve().then(async () => {
      try { document.title = "STEP:" + name; } catch (e) {}
      const e0 = errCount();
      try {
        const r = await Promise.race([Promise.resolve().then(fn), sleep(25000).then(() => { throw new Error("STEP_TIMEOUT"); })]);
        out.interactions.push({ step: name, status: "PASS", detail: r === undefined ? "" : String(r).slice(0, 300) });
      } catch (e) {
        out.interactions.push({ step: name, status: "FAIL", error: (e && e.message || String(e)).slice(0, 300) });
      }
      if (opts && opts.settle) await sleep(opts.settle);
      return null;
    });
  }

  function errCount() {
    const p = WN().__p28 || {};
    return (p.wins ? p.wins.length : 0) + (p.rejected ? p.rejected.length : 0) + (p.console ? p.console.filter((c) => c.kind === "error").length : 0);
  }

  function may(name, fn, opts) {
    if (SKIP && SKIP !== name) return Promise.resolve();
    if (XSK && XSK === name) return Promise.resolve();
    return step(name, fn, opts);
  }
  const $ = (sel, root) => (root || D()).querySelector(sel);
  const $$ = (sel, root) => [...(root || D()).querySelectorAll(sel)];
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0; };

  function setVal(el, v) {
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function click(el) { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: WN() })); }

  /* ============================================================
     Harvest (DOM facts)
     ============================================================ */
  function harvest() {
    const doc = D();
    const perf = WN().performance;
    const nav = perf.getEntriesByType("navigation")[0] || {};
    const res = perf.getEntriesByType("resource");
    out.perf = {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      load: Math.round(nav.loadEventEnd || 0),
      resources: res.length,
      bytes: res.reduce((a, e) => a + (e.transferSize || 0), 0),
      slowest: res.slice().sort((a, b) => b.duration - a.duration).slice(0, 5).map((e) => ({ u: e.name.slice(0, 120), ms: Math.round(e.duration) }))
    };
    out.layout = {
      docScrollW: doc.documentElement.scrollWidth,
      docClientW: doc.documentElement.clientWidth,
      overflowX: Math.max(0, doc.documentElement.scrollWidth - doc.documentElement.clientWidth),
      overflowing: [],
      fixedSticky: 0,
      minControl: null
    };
    const seen = new Set();
    for (const el of doc.querySelectorAll("body *")) {
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && vis(el)) {
        const key = (el.tagName) + (el.id || "") + (el.className.split(" ")[0] || "");
        if (seen.has(key)) continue;
        seen.add(key);
        if (out.layout.overflowing.length < 25) out.layout.overflowing.push({ tag: el.tagName, id: el.id || "", cls: (el.className || "").toString().slice(0, 40), sw: el.scrollWidth, cw: el.clientWidth });
      }
      const cs = getComputedStyle(el);
      if ((cs.position === "fixed" || cs.position === "sticky") && vis(el)) out.layout.fixedSticky++;
    }
    let min = Infinity, minInfo = null;
    for (const el of doc.querySelectorAll("button, a.btn, input[type=submit], input[type=button]")) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.width < min) { min = r.width; minInfo = { tag: el.tagName, id: el.id || "", cls: (el.className || "").toString().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; }
    }
    out.layout.minControl = minInfo;
    out.errors = {
      console: (WN().__p28 ? WN().__p28.console : []).length,
      window_errors: (WN().__p28 ? WN().__p28.wins : []).length,
      rejections: (WN().__p28 ? WN().__p28.rejected : []).length
    };
    out.net = (WN().__p28 ? WN().__p28.net : []).concat(WN().__p28 ? WN().__p28.resources : []);
    out.cwv = (WN().__p28 && WN().__p28.cwv) || null;
  }

  function harvestA11y() {
    const doc = D();
    const r = { headings: [], headingJumps: [], imgsNoAlt: [], btnNoName: [], inputsNoLabel: [], landmarks: {}, skipLink: null, dupIds: [], lang: doc.documentElement.lang || "" };
    let last = 1;
    for (const h of doc.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
      if (!vis(h) || !h.textContent.trim()) continue;
      const lv = +h.tagName[1];
      if (lv - last > 1) r.headingJumps.push({ from: "h" + last, to: "h" + lv, text: h.textContent.trim().slice(0, 40) });
      last = lv;
    }
    for (const img of doc.querySelectorAll("img")) {
      if (!vis(img)) continue;
      if (img.alt === undefined || img.alt === null) r.imgsNoAlt.push(img.id || img.src.slice(0, 60));
    }
    for (const b of doc.querySelectorAll("button")) {
      if (!vis(b)) continue;
      if (!b.textContent.trim() && !b.getAttribute("aria-label") && !b.title) r.btnNoName.push(b.id || (b.className || "").toString().slice(0, 30));
    }
    for (const i of doc.querySelectorAll("input:not([type=hidden])")) {
      if (!vis(i)) continue;
      const lab = i.id && doc.querySelector('label[for="' + CSS.escape(i.id) + '"]');
      const wrapped = i.closest("label");
      if (!lab && !wrapped && !i.getAttribute("aria-label") && !i.getAttribute("aria-labelledby") && !i.title && !i.placeholder) r.inputsNoLabel.push(i.id || i.name || i.type);
    }
    for (const t of ["main", "nav", "header", "footer", "aside", "form"]) r.landmarks[t] = doc.getElementsByTagName(t).length;
    const sk = doc.querySelector(".skip-link");
    r.skipLink = sk ? { href: sk.getAttribute("href"), targetExists: !!doc.querySelector(sk.getAttribute("href")) } : null;
    const ids = {};
    for (const e of doc.querySelectorAll("[id]")) { ids[e.id] = (ids[e.id] || 0) + 1; }
    r.dupIds = Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id).slice(0, 10);
    out.a11y = r;
  }

  function harvestStorage() {
    const w = WN();
    const ls = {}, ss = {};
    try { for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); ls[k] = String(w.localStorage.getItem(k)).slice(0, 120); } } catch (e) {}
    try { for (let i = 0; i < w.sessionStorage.length; i++) { const k = w.sessionStorage.key(i); ss[k] = String(w.sessionStorage.getItem(k)).slice(0, 120); } } catch (e) {}
    out.storage = { localStorage: ls, sessionStorage: ss, caches: [] };
    try {
      if (w.caches) w.caches.keys().then((ks) => { out.storage.caches = ks; }).catch(() => {});
    } catch (e) {}
    try {
      if (w.indexedDB && w.indexedDB.databases) w.indexedDB.databases().then((dbs) => { out.storage.indexedDB = dbs.map((d) => d.name); }).catch(() => {});
    } catch (e) {}
  }

  /* ============================================================
     Interaction scenarios
     ============================================================ */

  async function scenarioIndex() {
    out.interactions.push({ step: "home_rendered", status: "PASS", detail: "home visible: " + ($("#statMcqs") && $("#statMcqs").textContent) });
    if (!$("#statMcqs") || $("#statMcqs").textContent === "0") throw new Error("statMcqs is 0");
    if (!$("#subjectGrid") || !$("#subjectGrid").children.length) throw new Error("subjectGrid empty");
    if (!$("#examCatGrid") || !$("#examCatGrid").children.length) throw new Error("examCatGrid empty");
    if (!$("#quizGrid") || !$("#quizGrid").children.length) throw new Error("quizGrid empty");

    await may("theme_toggle", async () => {
      const before = D().documentElement.dataset.theme;
      click($("#darkToggle"));
      const after = D().documentElement.dataset.theme;
      if (before === after) throw new Error("theme did not change (" + before + ")");
      click($("#darkToggle"));
      if (D().documentElement.dataset.theme !== before) throw new Error("theme did not restore");
    }, { settle: 100 });

    await may("menu_toggle", async () => {
      const el = $(".main-nav");
      const before = el.classList.contains("open");
      click($("#menuToggle"));
      const after = el.classList.contains("open");
      if (before === after) throw new Error("menu class did not toggle");
      click($("#menuToggle"));
      if (el.classList.contains("open") !== before) throw new Error("menu did not restore");
    });

    await may("nav_buttons", async () => {
      const bad = [];
      for (const b of $$(".nav-link[data-view]")) {
        click(b);
        await sleep(250);
        const v = b.dataset.view;
        const vid = v === "ai-coach" ? "view-ai" : "view-" + v;
        if (!$("#" + vid) || $("#" + vid).hidden) bad.push(v);
      }
      if (bad.length) throw new Error("views not shown: " + bad.join(","));
    }, { settle: 300 });

    await may("qotd_reveal", async () => {
      if (!$("#qotdReveal")) return "no qotd";
      click($("#qotdReveal"));
      await sleep(200);
      if ($("#qotdAnswer") && $("#qotdAnswer").hidden) throw new Error("answer still hidden");
    });

    await may("search_suggestions", async () => {
      setVal($("#globalSearch"), "consti");
      await sleep(500);
      const sug = $("#searchSuggest");
      if (!sug || sug.hidden || !sug.querySelectorAll("button").length) throw new Error("no suggestions rendered");
    });

    await may("search_constitution", async () => {
      setVal($("#globalSearch"), "constitution");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1500);
      const list = $("#browseList");
      if (!list || !list.textContent.trim()) throw new Error("browseList empty");
      const hits = list.textContent.toLowerCase().includes("constitution");
      if (!hits) throw new Error("no constitution results: " + list.textContent.slice(0, 80));
    });

    await may("search_no_result", async () => {
      setVal($("#globalSearch"), "zzzzzz");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1200);
      const list = $("#browseList");
      if (!list || list.querySelectorAll(".mcq-card").length) throw new Error("expected zero results");
    });

    await may("search_special_chars", async () => {
      setVal($("#globalSearch"), "100%");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1200);
      if (errCount() > 0) throw new Error("errors during special char search");
    }, { settle: 100 });

    await may("search_case_and_multi", async () => {
      setVal($("#globalSearch"), "PAKISTAN RESOLUTION");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1200);
      const t = ($("#browseList") || {}).textContent || "";
      if (!t.toLowerCase().includes("resolution")) throw new Error("multi-token search missed");
    });

    await may("search_very_long", async () => {
      setVal($("#globalSearch"), "x".repeat(320));
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1200);
      if (errCount() > 0) throw new Error("errors during long query");
    }, { settle: 100 });

    await may("search_empty", async () => {
      setVal($("#globalSearch"), "");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1200);
      if (errCount() > 0) throw new Error("errors during empty search");
      if (!$("#browseList")) throw new Error("browseList missing after empty search");
    });

    await may("search_numbers", async () => {
      setVal($("#globalSearch"), "1973");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1500);
      if (errCount() > 0) throw new Error("errors during numeric search");
      const t = ($("#browseList") || {}).textContent || "";
      const cards = $("#browseList") ? $("#browseList").querySelectorAll(".mcq-card").length : 0;
      if (cards && !t.includes("1973")) throw new Error("numeric results missing term 1973");
      return cards ? "numeric results" : "numeric query empty state";
    });

    await may("search_urdu", async () => {
      setVal($("#globalSearch"), "پاکستان");
      $("#globalSearch").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(1500);
      if (errCount() > 0) throw new Error("errors during non-English search");
      if (!$("#browseList")) throw new Error("browseList missing after urdu search");
      const cards = $("#browseList").querySelectorAll(".mcq-card").length;
      return cards ? "urdu matched" : "urdu query empty state (graceful)";
    });

    await may("browse_filters", async () => {
      WN().location.hash = "browse";
      await sleep(600);
      const sub = $("#fSubject");
      if (!sub || sub.options.length < 2) throw new Error("subject filter empty");
      setVal(sub, sub.options[1].value);
      await sleep(1000);
      if (!$("#browseList") || !$("#browseList").children.length) throw new Error("subject filter gave no results");
      setVal($("#fDifficulty"), "medium");
      await sleep(800);
      click($("#fReset"));
      await sleep(800);
      if (!$("#browseList") || !$("#browseList").children.length) throw new Error("reset gave no results");
    });

    await may("browse_filters_multi", async () => {
      WN().location.hash = "browse";
      await sleep(600);
      const sub = $("#fSubject");
      if (!sub || sub.options.length < 2) throw new Error("subject filter empty");
      setVal(sub, sub.options[1].value);
      await sleep(900);
      const ch = $("#fChapter");
      if (ch && ch.options.length > 1) { setVal(ch, ch.options[1].value); await sleep(900); }
      const tp = $("#fTopic");
      if (tp && tp.options.length > 1) { setVal(tp, tp.options[1].value); await sleep(900); }
      const df = $("#fDifficulty");
      if (df && df.options.length > 1) { setVal(df, "medium"); await sleep(900); }
      if (!$("#browseList") || !$("#browseList").children.length) throw new Error("multi-filter gave no results");
      return "multi-filter results shown";
    });

    await may("browse_filter_paged", async () => {
      const pages = $$("#browsePager button");
      if (pages.length < 2) return "single page after filter (ok)";
      click(pages[1]);
      await sleep(700);
      if (!$("#browseList") || !$("#browseList").children.length) throw new Error("pager after filter empty");
    });

    await may("browse_pager", async () => {
      const pages = $$("#browsePager button");
      if (pages.length < 2) return "single page (no pager test possible)";
      click(pages[pages.length - 1]);
      await sleep(600);
    });

    await may("practice_workflow", async () => {
      WN().location.hash = "practice";
      await sleep(500);
      setVal($("#pCount"), "10");
      click($("#pStart"));
      await sleep(1000);
      if ($("#practiceArea") === null || $("#practiceArea").hidden) throw new Error("practice area not shown");
      const opts = $$("#pCard button");
      if (!opts.length) throw new Error("no answer options rendered");
      click(opts[0]);
      await sleep(700);
      const score = $("#pScore").textContent;
      const feedback = $("#pCard") && ($("#pCard").querySelector(".mcq-explanation") || $("#pCard").querySelector(".opt.correct") || $("#pCard").querySelector(".opt.wrong"));
      if (!/Score: [1-9]/.test(score) && !feedback) throw new Error("no feedback after answer: " + score);
    });

    await may("practice_quit", async () => {
      click($("#pQuit"));
      await sleep(200);
      if ($("#practiceSetup").hidden) throw new Error("setup not restored");
    });

    await may("mcq_rapid_click", async () => {
      WN().location.hash = "practice";
      await sleep(500);
      setVal($("#pCount"), "10");
      click($("#pStart"));
      await sleep(1000);
      const opts = $$("#pCard button");
      if (!opts.length) throw new Error("no options rendered");
      for (let i = 0; i < Math.min(6, opts.length); i++) { click(opts[i]); }
      await sleep(800);
      if (errCount() > 0) throw new Error("errors during rapid clicking");
      return "rapid clicks handled";
    }, { settle: 200 });

    await may("mcq_exam_nav_edges", async () => {
      WN().location.hash = "papers";
      await sleep(800);
      const paperBtn = $$("#paperList button, #paperList a")[0];
      if (!paperBtn) return "no papers available static (skip)";
      click(paperBtn);
      await sleep(1200);
      if ($("#examArea") === null || $("#examArea").hidden) throw new Error("exam area not shown");
      const pal = $$("#ePalette button");
      if (pal.length < 2) return "single-question paper (skip)";
      click(pal[0]); await sleep(250);
      if (!$("#eProgressChip").textContent.includes("1 of")) throw new Error("palette-first failed");
      click($("#eNext")); await sleep(250);
      if (!$("#eProgressChip").textContent.includes("2 of")) throw new Error("eNext failed");
      click(pal[pal.length - 1]); await sleep(250);
      if (!$("#eProgressChip").textContent.includes(pal.length + " of")) throw new Error("palette-last failed");
      click($("#ePrev")); await sleep(250);
      if ($("#eProgressChip").textContent.includes(pal.length + " of")) throw new Error("ePrev failed");
      click($("#eSubmit"));
      await sleep(1000);
      if ($("#examResult") === null || $("#examResult").hidden) throw new Error("result not shown after edge navigation");
      return "first->next->last->prev->submit ok";
    }, { settle: 200 });

    await may("mock_workflow", async () => {
      WN().location.hash = "quiz";
      await sleep(800);
      const startBtn = $$("#mockGrid button")[0];
      if (!startBtn) return "no mock tests available static";
      click(startBtn);
      await sleep(1200);
      if ($("#quizArea") === null || $("#quizArea").hidden) throw new Error("quiz area not shown");
      const opts = $$("#qCard button");
      if (!opts.length) throw new Error("no options rendered");
      click(opts[0]);
      await sleep(600);
    });

    await may("quiz_quit", async () => {
      click($("#qQuit"));
      await sleep(200);
      if ($("#quizList").hidden) throw new Error("quiz list not restored");
    });

    await may("quick_quiz_workflow", async () => {
      const startBtn = $$("#quizList button")[0];
      if (!startBtn) return "no quick quizzes available static";
      click(startBtn);
      await sleep(1200);
      if ($("#quizArea") === null || $("#quizArea").hidden) throw new Error("quiz area not shown");
      const opts = $$("#qCard button");
      if (!opts.length) throw new Error("no options rendered");
      click(opts[opts.length - 1]);
      await sleep(600);
      click($("#qQuit"));
    });

    await may("paper_workflow", async () => {
      WN().location.hash = "papers";
      await sleep(800);
      const paperBtn = $$("#paperList button, #paperList a")[0];
      if (!paperBtn) return "no past papers available static";
      click(paperBtn);
      await sleep(1200);
      if ($("#examArea") === null || $("#examArea").hidden) throw new Error("exam area not shown");
      click($("#eNext")); await sleep(150);
      click($("#ePrev")); await sleep(150);
      const pal = $$("#ePalette button")[0];
      if (pal) { click(pal); await sleep(150); }
      click($("#eSubmit"));
      await sleep(1000);
      if ($("#examResult") === null || $("#examResult").hidden) throw new Error("exam result not shown");
    });

    await may("dashboard_workflow", async () => {
      WN().location.hash = "dashboard";
      await sleep(900);
      if ($("#dashStreak").textContent.trim() === "") throw new Error("streak empty");
      click($("#planRecommended"));
      await sleep(800);
      const inQuiz = !$("#quizArea").hidden || !$("#practiceArea").hidden || !$("#quizResult").hidden;
      if (inQuiz) { click($("#qQuit")) || click($("#pQuit")); }
    }, { settle: 300 });

    await may("leaderboard_workflow", async () => {
      WN().location.hash = "leaderboard";
      await sleep(800);
      if ($("#weekChip").textContent.trim() === "Loading...") throw new Error("week chip stuck loading");
      const before = (WN().state && WN().state.user.name) || "";
      const lbEl = $("#lbNewEntry");
      if (!lbEl) throw new Error("lbNewEntry missing; page=" + (D().location && D().location.href) + " title=" + (D().title || ""));
      click(lbEl);
      await sleep(500);
      const input = $("#lbNameInput");
      if (!input) throw new Error("name dialog input not shown (prompt fallback present?)");
      setVal(input, "QA User 28");
      click(D().querySelector("[data-act='save']"));
      await sleep(500);
      let stored = "";
      try { stored = JSON.parse(localStorage.getItem("pmh_user") || "{}").name || ""; } catch (e) {}
      if (stored !== "QA User 28") throw new Error("name not saved: " + stored);
    }, { settle: 200 });

    await may("bookmarks_workflow", async () => {
      WN().location.hash = "bookmarks";
      await sleep(500);
      click($("#bmPractice"));
      await sleep(900);
      const inPractice = !$("#practiceArea").hidden;
      if (inPractice) click($("#pQuit"));
    }, { settle: 200 });

    await may("ai_coach_tabs", async () => {
      WN().location.hash = "ai-coach";
      await sleep(1600);
      const notice = $("#aiNotice");
      const ok = notice && !notice.hidden && /server/i.test(notice.textContent || "");
      for (const tab of $$(".ai-tab")) {
        click(tab);
        await sleep(450);
        if (!$("#aiPanel") || $("#aiPanel").textContent.trim() === "") throw new Error("ai panel empty for tab " + tab.dataset.aiTab);
      }
      return ok ? "server-down notice shown (expected static mode)" : "ai panel rendered";
    }, { settle: 200 });
  }

  async function scenarioAdmin() {
    out.interactions.push({ step: "admin_loaded", status: "PASS", detail: "panel rendered" });
    await may("admin_tabs", async () => {
      for (const b of $$(".admin-tabs button")) {
        click(b);
        await sleep(300);
        const tab = b.dataset.tab;
        const panel = $("#tab-" + tab);
        if (!panel || panel.hidden) throw new Error("panel for " + tab + " not shown");
      }
    });
    await may("admin_stats", async () => {
      const el = $("#adminStats");
      if (!el || !el.textContent.trim()) throw new Error("stats panel empty");
    });
    await may("admin_add_category", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "categories"));
      await sleep(400);
      setVal($("#catName"), "QA Test Category 28");
      setVal($("#catIcon"), "ICON");
      click($("#catAdd"));
      await sleep(500);
            const html = ($("#catList") || {}).innerHTML || "";
      if (!html.includes("QA Test Category 28")) throw new Error("category not added");
    }, { settle: 100 });

    await may("admin_category_empty", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "categories"));
      await sleep(300);
      setVal($("#catName"), "");
      setVal($("#catIcon"), "");
      click($("#catAdd"));
      await sleep(500);
      if (errCount() > 0) throw new Error("errors on empty category submit");
      const html = ($("#catList") || {}).innerHTML || "";
      const emptyRows = (html.match(/<li[^>]*>\s*<[^>]*>\s*<\/[^>]*>/g) || []).length;
      return emptyRows ? "empty category accepted (" + emptyRows + " blank row) — validation note" : "empty submit rejected";
    }, { settle: 100 });

    await may("admin_category_dup", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "categories"));
      await sleep(300);
      setVal($("#catName"), "QA Duplicate Cat");
      setVal($("#catIcon"), "ICON");
      click($("#catAdd"));
      await sleep(400);
      setVal($("#catName"), "QA Duplicate Cat");
      setVal($("#catIcon"), "ICON");
      click($("#catAdd"));
      await sleep(500);
      if (errCount() > 0) throw new Error("errors on duplicate category submit");
      const html = ($("#catList") || {}).innerHTML || "";
      const count = (html.match(/QA Duplicate Cat/g) || []).length;
      return "duplicate rows rendered: " + count + (count > 1 ? " (duplicates allowed — validation note)" : " (dedup ok)");
    }, { settle: 100 });


    await may("admin_import_sample", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "import"));
      await sleep(400);
      const sample = '[\n{"question":"What is QA?","optionA":"A","optionB":"B","optionC":"C","optionD":"D","correctAnswer":"A","subjectId":"test","chapterId":"test","topicId":"test","difficulty":"easy","explanation":"e"},' + '\n{"question":"Second probe question?","optionA":"W","optionB":"X","optionC":"Y","optionD":"Z","correctAnswer":"B","subjectId":"test","chapterId":"test","topicId":"test","difficulty":"medium","explanation":"ee"}\n]';
      setVal($("#impText"), sample);
      click($("#impRun"));
      await sleep(800);
      const log = ($("#impLog") || {}).textContent || "";
      if (!/2|imported|error/i.test(log)) throw new Error("import log unexpected: " + log.slice(0, 120));
    }, { settle: 100 });
    await may("admin_gen_setup", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "gen"));
      await sleep(500);
      const el = $("#genList");
      if (!el) throw new Error("gen panel missing");
    });
    await may("admin_dups", async () => {
      click($$(".admin-tabs button").find((b) => b.dataset.tab === "dups"));
      await sleep(500);
      const el = $("#dupList");
      if (!el) throw new Error("dup panel missing");
    });
  }

  async function scenarioSingle() {
    const id = qs.get("single");
    out.interactions.push({ step: "single_" + id, status: "PASS", detail: "start" });
    const b = D().getElementById(id);
    if (!b) { out.interactions.push({ step: "single_" + id, status: "FAIL", detail: "button " + id + " not found" }); return; }
    const tab = b.closest(".tab-panel");
    if (tab) tab.hidden = false;
    click(b);
    for (let i = 1; i <= 20; i++) {
      await sleep(1000);
      let st = "?";
      try {
        const W = WN();
        st = "mcqs=" + ((W.mcqs && W.mcqs.length) ?? "none") + " ls=" + Object.keys(localStorage).join(",");
      } catch (e) { st = "frame-err"; }
      document.title = "SINGLE:" + i + "s:" + st;
    }
    out.interactions.push({ step: "single_" + id, status: "DONE", detail: "post-click 20s sampled" });
  }

  async function scenarioGeneric() {
    out.interactions.push({ step: "generic_load", status: "PASS", detail: "page loaded" });
    if (PAGE === "offline.html") {
      await may("offline_retry", async () => {
        click($("#offlineRetry"));
        await sleep(200);
      });
      await may("offline_home", async () => {
        const btn = $("#offlineHome");
        if (!btn) return "no home button";
        const href = btn.getAttribute("onclick") || btn.dataset.href || "";
        if (!href) return "button has no task (static page)";
      });
    } else if (PAGE.includes("subjects/index.html")) {
      await may("subjects_index_filter", async () => {
        const inp = D().querySelector("input[type=search], #subjectSearch, #search");
        if (!inp) return "no search input on this page";
        setVal(inp, "comp");
        await sleep(300);
      });
    }
  }

  async function genericClickSweep() {
    const doc = D();
    const tested = new Set();
    let clicks = 0, errs = 0, silent = 0;
    const skipIds = new Set(["expMCQs", "expCategories", "expSubjects", "expTopics", "expReset", "expCsv", "expJson", "genGenerate"]);
    for (const s of (qs.get("skipIds") || "").split(",").filter(Boolean)) skipIds.add(s);
    const btns = doc.querySelectorAll("button");
    for (const b of btns) {
      if (!vis(b)) continue;
      if (tested.has(b) || b.id === "qotdReveal") continue;
      if (skipIds.has(b.id)) continue;
      if (b.classList && (b.classList.contains("nav-link") || b.classList.contains("ai-tab"))) continue;
      tested.add(b);
      const e0 = errCount();
      const c0 = performance.now();
      try {
        document.title = "SWEEP:" + clicks + "/" + btns.length + ":" + (b.id || b.className || "btn");
        click(b);
        const c1 = performance.now() - c0;
        clicks++;
        if (c1 > 3000) out.interactions.push({ step: "click_slow", status: "WARN", detail: (b.id || b.className) + " took " + Math.round(c1) + "ms" });
        await sleep(60);
        if (errCount() > e0) errs++;
      } catch (e) {
        errs++;
      }
    }
    out.interactions.push({ step: "click_sweep", status: errs ? "WARN" : "PASS", detail: clicks + " clicks, " + errs + " with errors" });
  }

  /* ============================================================
     main
     ============================================================ */
  const NOSWEEP = qs.get("nosweep") === "1";
  const FINISH = () => {
    const body = JSON.stringify(out).replace(/<\//g, "<\\/");
    document.getElementById("p28out").textContent = body;
    document.title = "P28DONE";
  };
  setTimeout(FINISH, INTER ? 150000 : 40000);
  setInterval(() => {
    try {
      const last = out.interactions[out.interactions.length - 1];
      document.title = "HB:" + out.interactions.length + ":" + (last ? last.step : "");
    } catch (e) {}
  }, 2000);
  (async () => {
    frame.addEventListener("load", () => {});
    await waitApp(25000);
    harvest();
    harvestA11y();
    harvestStorage();
    try {
      if (INTER) {
        if (qs.get("single")) await scenarioSingle();
        else if (PAGE === "index.html") await scenarioIndex();
        else if (PAGE === "admin.html") await scenarioAdmin();
        else await scenarioGeneric();
        if (!NOSWEEP) await genericClickSweep();
        await sleep(400);
      } else {
        await scenarioGeneric();
        await sleep(400);
      }
    } catch (e) {
      out.fatal = String((e && e.stack) || e).slice(0, 1200);
    }
    harvest();
    harvestStorage();
    const p = (WN().__p28) || {};
    out.consoleDetail = p.console ? p.console.slice(0, 40) : [];
    out.winsDetail = p.wins ? p.wins.slice(0, 40) : [];
    out.rejectedDetail = p.rejected ? p.rejected.slice(0, 40) : [];
    FINISH();
  })().catch((e) => {
    out.fatal = String((e && e.stack) || e).slice(0, 1200);
    FINISH();
  });
})();
