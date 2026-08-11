"use strict";
const assert = require("assert");
const path = require("path");
const { sha256hex, slugify, fmtBytes, isIsoDate, esc } = require(path.join(__dirname, "..", "..", "scripts", "lib", "utils.cjs"));

module.exports = (t) => {
  t.test("sha256 is deterministic", async () => {
    assert.strictEqual(sha256hex("Pakistan MCQs"), sha256hex("Pakistan MCQs"));
    assert.match(sha256hex("x"), /^[0-9a-f]{64}$/);
    assert.strictEqual(sha256hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  t.test("slugify normalizes text", async () => {
    assert.strictEqual(slugify("Pakistan Affairs"), "pakistan-affairs");
    assert.strictEqual(slugify("  General   Knowledge  "), "general-knowledge");
    assert.strictEqual(slugify("--x--"), "x");
    assert.strictEqual(slugify("English (Compulsory)"), "english-compulsory");
  });

  t.test("fmtBytes formats sizes", async () => {
    assert.strictEqual(fmtBytes(1024), "1 KB");
    assert.strictEqual(fmtBytes(1048576), "1 MB");
    assert.strictEqual(fmtBytes(2147483648), "2 GB");
  });

  t.test("isIsoDate accepts ISO strings", async () => {
    assert.ok(isIsoDate("2026-08-07"));
    assert.ok(isIsoDate("2026-08-07T10:00:00Z"));
    assert.ok(!isIsoDate("07/08/2026"));
    assert.ok(!isIsoDate(undefined));
  });

  t.test("esc escapes HTML entities", async () => {
    assert.strictEqual(esc('<a href="x">&amp;</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;amp;&lt;/a&gt;");
    assert.strictEqual(esc("plain"), "plain");
  });
};
