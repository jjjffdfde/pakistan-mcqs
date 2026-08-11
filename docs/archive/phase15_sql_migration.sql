-- create_kg_pending_changes: Create approval queue table
-- Reversible: true
CREATE TABLE IF NOT EXISTS kg_pending_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_type TEXT NOT NULL,
      target_table TEXT NOT NULL,
      target_id TEXT,
      subject_id TEXT,
      action TEXT NOT NULL,
      rationale TEXT DEFAULT '',
      proposed_sql TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT DEFAULT '',
      reviewed_at TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

-- create_kg_phase15_reports: Create Phase 15 report storage table
-- Reversible: true
CREATE TABLE IF NOT EXISTS kg_phase15_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      run_at TEXT DEFAULT (datetime('now')),
      score REAL DEFAULT 0,
      issues_json TEXT DEFAULT '{}',
      summary TEXT DEFAULT ''
    );
