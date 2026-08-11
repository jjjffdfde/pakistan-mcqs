/* ============================================================
   Pakistan MCQs Hub - PWA runtime (Phase 25)
   Install prompt, offline UX, recent searches, notifications,
   background sync. No external deps. Loaded by index.html.
   ============================================================ */
(function () {
  "use strict";

  const LS = {
    recent: "pmh_recent",
    lastNotifiable: "pmh_last_notif_date"
  };

  function $(id) { return document.getElementById(id); }
  function toast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._tm);
    toast._tm = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ============================================================
     STEP 4 - Install experience
     ============================================================ */
  let deferredPrompt = null;
  let installed = localStorage.getItem("pmh_installed") === "1";

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  }

  function ensureInstallButton() {
    if (isStandalone()) return;
    let btn = $("installBtn");
    if (btn) return;
    btn = document.createElement("button");
    btn.id = "installBtn";
    btn.className = "btn btn-gold";
    btn.textContent = "Install App";
    btn.style.margin = ".5rem .5rem 0 0";
    const hero = document.querySelector(".hero-actions");
    if (hero) {
      hero.appendChild(btn);
    } else {
      const actions = document.querySelector(".header-actions");
      if (actions) { btn.style.margin = "0"; actions.appendChild(btn); }
    }
    btn.addEventListener("click", function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
          if (choice.outcome === "accepted") {
            installed = true;
            localStorage.setItem("pmh_installed", "1");
            const b = $("installBtn"); if (b) b.remove();
            toast("App installed ✓");
          }
          deferredPrompt = null;
        });
      } else {
        toast("Install Pakistan MCQs Hub from your browser menu (Add to Home screen / Install).");
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    ensureInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    localStorage.setItem("pmh_installed", "1");
    toast("Thank you for installing Pakistan MCQs Hub!");
    notifyNow("Pakistan MCQs Hub", "Installed. Now practice offline anywhere.");
  });

  /* ============================================================
     Offline / connection indicator
     ============================================================ */
  function setOffline(on) {
    document.documentElement.classList.toggle("is-offline", on);
    const badge = $("connBadge");
    if (badge) {
      badge.textContent = on ? "Offline" : "Online";
      badge.classList.toggle("chip-gold", on);
      badge.hidden = false;
    }
  }
  window.addEventListener("online", () => { setOffline(false); toast("Back online — syncing updates…"); });
  window.addEventListener("offline", () => { setOffline(true); toast("You're offline — saved content still works"); });

  /* ============================================================
     STEP 3 - Offline search & recent searches
     ============================================================ */
  function addRecentSearch(q) {
    if (!q || typeof q !== "string") return;
    q = q.trim().slice(0, 60);
    if (q.length < 2) return;
    let rec = [];
    try { rec = JSON.parse(localStorage.getItem(LS.recent) || "[]"); } catch (e) { rec = []; }
    rec = rec.filter((x) => x.toLowerCase() !== q.toLowerCase());
    rec.unshift(q);
    if (rec.length > 12) rec.length = 12;
    localStorage.setItem(LS.recent, JSON.stringify(rec));
    renderRecent();
  }

  function renderRecent() {
    const box = $("recentSearches");
    if (!box) return;
    let rec = [];
    try { rec = JSON.parse(localStorage.getItem(LS.recent) || "[]"); } catch (e) { rec = []; }
    box.innerHTML = "";
    if (!rec.length) return;
    const label = document.createElement("span");
    label.className = "muted small";
    label.textContent = "Recent: ";
    box.appendChild(label);
    rec.slice(0, 5).forEach(function (q) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = q;
      b.addEventListener("click", function () {
        const g = $("globalSearch");
        if (g) { g.value = q; g.focus(); }
        window.dispatchEvent(new CustomEvent("pmh:searchq", { detail: q }));
      });
      box.appendChild(b);
    });
  }

  function captureSearchOnClick(e) {
    if (e.target && e.target.id === "searchBtn") {
      const inp = $("globalSearch");
      if (inp) addRecentSearch(inp.value);
    }
  }
  function captureSearchOnKey(e) {
    if (e.key === "Enter" && e.target && e.target.id === "globalSearch") addRecentSearch(e.target.value);
  }
  document.addEventListener("click", captureSearchOnClick);
  document.addEventListener("keydown", captureSearchOnKey);
  document.addEventListener("pmh:searchq", function (e) { addRecentSearch(e.detail && e.detail.q); });

  /* ============================================================
     STEP 5 - Notifications (local scheduling, deterministic)
     ============================================================ */
  function notify(title, body, extra) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.showNotification) {
        reg.showNotification(title, Object.assign({
          body: body,
          icon: "assets/icons/icon-192.png",
          badge: "assets/icons/icon-96.png",
          vibrate: [80, 40, 80]
        }, extra || {})).catch(function () {});
      }
    }).catch(function () {});
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) return Promise.reject("unsupported");
    if (Notification.permission === "granted") return Promise.resolve("granted");
    if (Notification.permission === "denied") return Promise.resolve("denied");
    return Notification.requestPermission();
  }

  function fireDailyReminderNow() {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(LS.lastNotifiable) === today) return;
    if ("Notification" in window && Notification.permission === "granted") {
      localStorage.setItem(LS.lastNotifiable, today);
      notify("You're back online", "Content has been refreshed — continue your practice.", { tag: "back-online" });
    }
  }

  window.PMH_PWA_NOTIFY = {
    request: requestNotificationPermission,
    schedule: notify,
    enabled() { return "Notification" in window && Notification.permission === "granted"; }
  };

  /* ============================================================
     STEP 8 - Sync engine (background sync + refresh)
     ============================================================ */
  const Sync = {
    async register() {
      try {
        if (!("serviceWorker" in navigator)) return;
        const reg = await navigator.serviceWorker.ready;
        if (reg.sync) await reg.sync.register("sync-updates");
      } catch (e) { /* background sync unsupported — fall back silently */ }
    },
    refresh() {
      if (!navigator.onLine || !("serviceWorker" in navigator)) return Promise.resolve();
      return Promise.resolve().then(function () {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "CACHE_REFRESH" });
        }
      });
    },
    async checkForUpdates() {
      try {
        if (!("serviceWorker" in navigator)) return;
        const reg = await navigator.serviceWorker.ready;
        reg.update();
      } catch (e) {}
    }
  };

  window.PMH_SYNC = Sync;

  function handleUpdateFound(reg) {
    reg.addEventListener("updatefound", function () {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener("statechange", function () {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          toast("New version available — refresh to update.");
        }
      });
    });
  }

  /* ============================================================
     init
     ============================================================ */
  function init() {
    setOffline(!navigator.onLine);
    ensureInstallButton();
    renderRecent();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        handleUpdateFound(reg);
        Sync.register();
        window.setTimeout(function () { if (navigator.onLine) Sync.refresh(); }, 4000);
      }).catch(function () {});
    }

    /* daily offline reminder (once/day; requires Notification permission) */
    if (isStandalone() || true) {
      window.setTimeout(function () {
        requestNotificationPermission().then(function (per) {
          if (per === "granted") fireScheduledReminders();
        }).catch(function () {});
      }, 3000);
    }
    window.setInterval(function () { if (navigator.onLine) Sync.checkForUpdates(); }, 60 * 60 * 1000);
  }

  function fireScheduledReminders() {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(LS.lastNotifiable) === today) return;
    // remind once per day
    let due = null;
    const entries = [
      ["pmh_notify_daily", "Daily MCQ Challenge", "10 fresh questions are ready — keep your streak!"],
      ["pmh_notify_revision", "Revision Reminder", "Review saved bookmarks to lock them into memory."],
      ["pmh_notify_updates", "Content updated", "New MCQs & explanations are cached offline."],
      ["pmh_notify_exam", "Exam Reminder", "Your target exam is approaching — practice now."]
    ];
    for (const [key, title, body] of entries) {
      let on = true;
      try { on = !localStorage.getItem(key) || JSON.parse(localStorage.getItem(key)); } catch (e) {}
      if (on) { due = { title, body }; break; }
    }
    if (!due) return;
    localStorage.setItem(LS.lastNotifiable, today);
    window.setTimeout(function () { notify(due.title, due.body, { tag: "daily-" + today }); }, 4000);
  }

  /* expose public API */
  window.PMH_PWA = {
    addRecentSearch: addRecentSearch,
    requestInstall: function () { if (deferredPrompt) deferredPrompt.prompt(); },
    syncNow: function () { return Sync.register().then(function () { return Sync.refresh(); }); },
    notify,
    permission: requestNotificationPermission
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
