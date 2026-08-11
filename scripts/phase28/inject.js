/* ============================================================
   Phase 28 - runtime capture script (injected before app scripts)
   Harvests console errors, uncaught exceptions, unhandled
   rejections, failed network requests and resource load failures.
   Exposed on window.__p28. Only active when ?p28=1 is requested.
   ============================================================ */
(function () {
  "use strict";
  if (window.__p28) return;
  const t0 = performance.now();
  const orig = {
    error: console.error, warn: console.warn,
    fetch: window.fetch.bind(window)
  };
  window.__p28 = {
    started: t0, console: [], wins: [], rejected: [], net: [], resources: [], perf: {}, ready: false
  };
  const fmt = (a) => a.map((x) => { try { return typeof x === "string" ? x : (x instanceof Error ? x.message : JSON.stringify(x)); } catch (e) { return String(x); } }).join(" ").slice(0, 500);
  console.error = (...a) => { window.__p28.console.push({ kind: "error", msg: fmt(a), t: Math.round(performance.now() - t0) }); return orig.error(...a); };
  console.warn = (...a) => { window.__p28.console.push({ kind: "warn", msg: fmt(a), t: Math.round(performance.now() - t0) }); return orig.warn(...a); };
  window.addEventListener("error", (e) => {
    window.__p28.wins.push({ kind: "error", msg: (e.message || String(e.error || "")).slice(0, 500), src: e.filename || "", line: e.lineno || 0 });
  }, true);
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    window.__p28.rejected.push({ msg: (r && (r.message || r.toString ? r.toString().slice(0, 300) : "")) || String(r).slice(0, 300) });
  });
  window.fetch = (...a) => {
    const url = typeof a[0] === "string" ? a[0] : (a[0] && a[0].url) || "";
    const t = performance.now();
    return orig.fetch(...a).then((r) => {
      if (r.status >= 400 || !r.ok) window.__p28.net.push({ url: url.slice(0, 200), status: r.status, error: "HTTP " + r.status, ms: Math.round(performance.now() - t) });
      return r;
    }).catch((e) => {
      window.__p28.net.push({ url: url.slice(0, 200), status: 0, error: (e && e.message || "fetch failed").slice(0, 200), ms: Math.round(performance.now() - t) });
      throw e;
    });
  };
  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.initiatorType !== "script" && e.initiatorType !== "css" && e.initiatorType !== "img") continue;
        const failed = e.transferSize === 0 || (e.responseStatus && e.responseStatus >= 400) || e.duration === 0 && e.decodedBodySize === 0 && e.initiatorType === "img" && e.name.startsWith("http");
        if (failed) window.__p28.resources.push({ url: e.name.slice(0, 200), kind: e.initiatorType, status: e.responseStatus || "failed", ms: Math.round(e.duration) });
      }
    });
    po.observe({ type: "resource", buffered: true });
  } catch (e) {}
  try {
    window.__p28.cwv = { lcp: null, lcpEl: null, cls: 0, inp: 0, ttfb: null, fcp: null };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.entryType === "largest-contentful-paint") {
          window.__p28.cwv.lcp = Math.round(e.startTime);
          let el = e.element;
          window.__p28.cwv.lcpEl = el ? (el.tagName + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "")) : null;
        }
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.entryType === "first-contentful-paint") window.__p28.cwv.fcp = Math.round(e.startTime);
      }
    }).observe({ type: "paint", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) window.__p28.cwv.cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.duration > window.__p28.cwv.inp) window.__p28.cwv.inp = Math.round(e.duration);
      }
    }).observe({ type: "event", durationThreshold: 16, buffered: true });
  } catch (e) {}
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav) {
      window.__p28.cwv.ttfb = Math.round(nav.responseStart);
    }
  } catch (e) {}
  window.addEventListener("load", () => {
    window.__p28.ready = true;
  });
})();
