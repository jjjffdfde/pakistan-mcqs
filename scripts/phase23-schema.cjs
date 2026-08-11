"use strict";
const { open } = require("../db/engine.js");
const db = open();
const tables = db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
const views = db.all("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name");
const triggers = db.all("SELECT name, sql FROM sqlite_master WHERE type='trigger' AND sql IS NOT NULL ORDER BY name");
const indices = db.all("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY tbl_name, name");
console.log("Tables:");
for (const t of tables) {
  const cols = db.all("PRAGMA table_info(" + JSON.stringify(t.name) + ")");
  const cnt = db.get("SELECT COUNT(*) n FROM " + JSON.stringify(t.name)).n;
  console.log("  " + t.name + " (" + cols.length + " cols, " + cnt + " rows)");
}
console.log("Views: " + views.map(v=>v.name).join(", "));
console.log("Triggers: " + triggers.length);
console.log("Indices: " + indices.length);
console.log("SQLite version: " + (db.get("SELECT sqlite_version() v").v));
db.close();
