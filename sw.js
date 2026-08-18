/* ============================================================
   Pakistan MCQs Hub - Enterprise Service Worker (Phase 25)
   Versioned offline caches + background sync + notifications.
   Deterministic, no external deps. Scope = site root.
   ============================================================ */
"use strict";

const SW_VERSION = "v1.0.2";
const CACHE_PREFIX = "pmh";
const CACHE_VERSION = "003";

const CACHES = {
  shell: `${CACHE_PREFIX}-shell-${CACHE_VERSION}`,
  data: `${CACHE_PREFIX}-data-${CACHE_VERSION}`,
  api: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
  mcq: `${CACHE_PREFIX}-mcq-${CACHE_VERSION}`,
  search: `${CACHE_PREFIX}-search-${CACHE_VERSION}`,
  img: `${CACHE_PREFIX}-img-${CACHE_VERSION}`
};

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./admin.html",
  "./404.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/js/ai.js",
  "./assets/js/admin.js",
  "./assets/js/pwa.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/icon.svg",
  "./assets/img/og-cover.png",
  "./subjects/index.html"
];

const DATA_ASSETS = [
  "./data/subjects.json",
  "./data/chapters.json",
  "./data/topics.json",
  "./data/mcqs.json",
  "./data/categories.json",
  "./data/exams.json",
  "./data/programs.json",
  "./data/mock_tests.json",
  "./data/papers.json",
  "./data/quizzes.json",
  "./data/references.json",
  "./data/site-config.json"
];

/* ---------- helpers ---------- */
function isData(url) { return /\/data\/[^/]+\.json$/.test(url.pathname) || url.pathname === "/data/mcqs.json" || (url.pathname.indexOf("/data/") === 0 && url.pathname.endsWith(".json")); }
function isApi(url) { return /^\/api\//.test(url.pathname); }
function isMcq(url) { return /\/api\/mcq[s]?\//.test(url.pathname); }
function isSearch(url) { return /\/api\/search/.test(url.pathname); }
function isImg(url) { return /\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i.test(url.pathname); }
function isNav(url) { return url.pathname === "/" || (url.pathname && (url.pathname.endsWith("/") || /\.html$/.test(url.pathname))); }

function cacheFirst(cacheName, request) {
  return caches.open(cacheName).then(function (c) {
    return c.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (res) {
        if (res && res.ok && res.type === "basic") c.put(request, res.clone());
        return res;
      }).catch(function () { return Response.error(); });
    });
  });
}

function networkFirst(cacheName, request) {
  return fetch(request).then(function (res) {
    if (res && res.ok && res.type === "basic") {
      const copy = res.clone();
      caches.open(cacheName).then(function (c) { c.put(request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.open(cacheName).then(function (c) {
      return c.match(request).then(function (hit) { return hit || Response.error(); });
    });
  });
}

function staleWhileRevalidate(cacheName, request) {
  return caches.open(cacheName).then(function (c) {
    return c.match(request).then(function (hit) {
      const refresh = fetch(request).then(function (res) {
        if (res && res.ok && res.type === "basic") c.put(request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || refresh;
    });
  });
}

/* ---------- install: build shell + data caches ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHES.shell).then((c) => c.addAll(SHELL_ASSETS).catch((err) => console.warn("[SW] shell partial: " + err))),
      caches.open(CACHES.data).then((c) => c.addAll(DATA_ASSETS).catch((err) => console.warn("[SW] data partial: " + err)))
    ]).then(() => self.skipWaiting())
  );
});

/* ---------- activate: prune stale versions ---------- */
self.addEventListener("activate", (event) => {
  const keep = Object.values(CACHES);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.indexOf(CACHE_PREFIX) === 0 && keep.indexOf(k) === -1).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- fetch: routing + cache strategies ---------- */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== "GET") return;

  const request = event.request;

  /* navigation requests: network-first, fallback index.html then offline.html */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHES.shell).then((c) => c.put("./index.html", copy));
        }
        return res;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          return hit || caches.match("./index.html").then(function (h2) {
            return h2 || caches.match("./offline.html").then(function (h3) { return h3 || Response.error(); });
          });
        });
      })
    );
    return;
  }

  if (isImg(url)) event.respondWith(cacheFirst(CACHES.img, request));
  else if (isMcq(url)) event.respondWith(cacheFirst(CACHES.mcq, request));
  else if (isSearch(url)) event.respondWith(networkFirst(CACHES.search, request));
  else if (isApi(url)) event.respondWith(networkFirst(CACHES.api, request));
  else if (isData(url) || (url.pathname && /\/data\/[^/]+\.json$/.test(url.pathname))) event.respondWith(staleWhileRevalidate(CACHES.data, request));
  else event.respondWith(staleWhileRevalidate(CACHES.shell, request));
});

/* ---------- notifications (push / local) ---------- */
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) { payload = { title: "Pakistan MCQs Hub", body: "New MCQs are ready!" }; }
  const title = payload.title || "Pakistan MCQs Hub";
  const options = {
    body: payload.body || "Open the app to continue your practice.",
    icon: "./assets/icons/icon-192.png",
    badge: "./assets/icons/icon-96.png",
    data: payload.url ? { url: payload.url } : {},
    tag: payload.tag || "pmh-update",
    vibrate: [100, 50, 100]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) { if ("focus" in client) { client.navigate(url); return client.focus(); } }
      return self.clients.openWindow(url);
    })
  );
});

/* ---------- background sync (offline updates) ---------- */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-updates") {
    event.waitUntil(refreshCaches());
  } else if (event.tag === "sync-search") {
    event.waitUntil(refreshCaches());
  }
});

function refreshCaches() {
  const dataCache = caches.open(CACHES.data).then(function (c) {
    return Promise.all(
      DATA_ASSETS.map(function (u) {
        return fetch(u).then(function (res) {
          if (res && res.ok) c.put(u, res.clone());
        }).catch(function () {});
      })
    );
  });
  const shellCache = caches.open(CACHES.shell).then(function (c) {
    return fetch("./index.html").then(function (res) {
      if (res && res.ok) c.put("./index.html", res.clone());
    }).catch(function () {});
  });
  return Promise.all([dataCache, shellCache]);
}

/* ---------- messages from pages ---------- */
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "CACHE_REFRESH") {
    event.waitUntil(refreshCaches());
  } else if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
