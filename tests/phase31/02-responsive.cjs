const fs = require("fs");
const path = require("path");
const { startServer, runPage, errCount } = require("./_lib.cjs");

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1440, 1920];
const PAGES = ["index.html", "admin.html", "offline.html"];

(async () => {
  const srv = await startServer();
  try {
    const checks = [];
    for (const page of PAGES) {
      for (const w of WIDTHS) {
        const o = await runPage(page, w, w <= 480 ? 844 : 900, 0);
        const overflow = o && o.layout ? o.layout.overflowX : -1;
        const errs = errCount(o);
        checks.push({
          page, w, overflowX: overflow, errors: errs,
          status: overflow === 0 && errs === 0 ? "PASS" : "FAIL",
        });
      }
    }
    const fails = checks.filter((c) => c.status === "FAIL");
    const result = {
      suite: "02-responsive", generated: new Date().toISOString(), checks,
      totals: { pass: checks.length - fails.length, fail: fails.length },
      status: fails.length ? "FAIL" : "PASS",
    };
    fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "results", "02-responsive.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.totals));
    process.exit(fails.length ? 1 : 0);
  } finally {
    srv.kill();
  }
})().catch((e) => { console.error("SUITE-FATAL", e); process.exit(2); });
