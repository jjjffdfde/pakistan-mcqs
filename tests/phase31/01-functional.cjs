const fs = require("fs");
const path = require("path");
const { startServer, runPage, errCount } = require("./_lib.cjs");

const REQUIRED_STEPS = [
  "home_rendered", "theme_toggle", "menu_toggle", "nav_buttons", "qotd_reveal",
  "search_suggestions", "search_constitution", "search_no_result", "search_special_chars",
  "search_case_and_multi", "search_very_long", "browse_filters", "browse_pager",
  "practice_workflow", "practice_quit", "mock_workflow", "quiz_quit", "quick_quiz_workflow",
  "paper_workflow", "dashboard_workflow", "leaderboard_workflow", "bookmarks_workflow",
  "ai_coach_tabs", "click_sweep",
];

(async () => {
  const srv = await startServer();
  try {
    const index = await runPage("index.html", 1366, 900, 1);
    const admin = await runPage("admin.html", 1366, 900, 1);
    const checks = [];
    const stepStatuses = (index && index.interactions ? index.interactions : []).map((i) => i.step + ":" + (i.status || i.result || "?"));
    for (const req of REQUIRED_STEPS) {
      const hit = stepStatuses.find((s) => s.startsWith(req + ":"));
      const passed = !!hit && hit.endsWith(":PASS");
      checks.push({ step: req, status: passed ? "PASS" : "FAIL", detail: hit || "missing" });
    }
    checks.push({ step: "index_zero_js_errors", status: errCount(index) === 0 ? "PASS" : "FAIL", detail: "errors=" + errCount(index) });
    checks.push({ step: "admin_zero_js_errors", status: errCount(admin) === 0 ? "PASS" : "FAIL", detail: "errors=" + errCount(admin) });
    const fails = checks.filter((c) => c.status === "FAIL");
    const result = {
      suite: "01-functional", generated: new Date().toISOString(), checks,
      totals: { pass: checks.length - fails.length, fail: fails.length },
      status: fails.length ? "FAIL" : "PASS",
    };
    fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "results", "01-functional.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.totals));
    process.exit(fails.length ? 1 : 0);
  } finally {
    srv.kill();
  }
})().catch((e) => { console.error("SUITE-FATAL", e); process.exit(2); });
