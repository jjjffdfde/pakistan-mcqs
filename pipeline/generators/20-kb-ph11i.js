/* ============================================================
   Phase 11 — KB Database, DevOps, Front-End, Mobile:
   sql, nosql, mongodb, postgresql, sqlite, bash, git, github,
   typescript, web-development, mobile-development.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

/* ---------------- SQL ---------------- */
const sqlKb = {
  subjects: ["sql"],
  chapter: "SQL — Relational Queries (Phase 11)",
  tags: ["sql", "deep-kb", "database"],
  topics: {
    "Queries and Joins": [
      { kind: "fact", name: "SQL facts", facts: [
        ["What does SELECT do?", "Retrieves rows from a table", "SELECT is the most used SQL command."],
        ["What does WHERE filter?", "Rows matching a condition", "WHERE restricts which rows the query returns."],
        ["What does JOIN combine?", "Rows from two tables on a key", "JOINs link related tables together."],
        ["What is a primary key?", "A unique identifier for each row", "Primary keys enforce entity integrity."],
        ["What is a foreign key?", "A column referencing another table's key", "Foreign keys enforce referential integrity."],
        ["What does GROUP BY do?", "Groups rows for aggregate functions", "GROUP BY collapses rows sharing the same group value."],
        ["What does ORDER BY do?", "Sorts the result set", "ORDER BY arranges output by one or more columns."],
        ["What is an index?", "A structure to speed up row lookup", "Indexes reduce full table scans."]
      ],
        trick: "SELECT=fetch, WHERE=filter, JOIN=link.",
        tip: "SQL keywords map directly to relational operations." },

      { kind: "numeric", name: "join result count", difficulty: "easy",
        note: "Cartesian join size = rows A × rows B.",
        q: (v) => `Table A has ${v.a} rows and B has ${v.b} rows. A cross join returns how many rows?`,
        a: (v) => `${v.a * v.b}`,
        e: (v) => `Cross join = ${v.a} × ${v.b} = ${v.a * v.b}, multiplying all rows from both tables.`,
        distract: (v) => { const c = v.a * v.b; return [`${v.a + v.b}`, `${Math.max(v.a, v.b)}`, `${c / 2}`, `${c * 2}`, `${c + 1}`]; },
        vals: (rng) => ({ a: R(rng, 3, 20), b: R(rng, 3, 20) }),
        whyWrong: (v) => [`Cross join multiplies both table sizes; adding or subtracting counts a different operation.`],
        trick: "cross = rows A × rows B.",
        tip: "Inner joins usually return fewer rows than the cross product." }
    ]
  }
};

/* ---------------- NOSQL ---------------- */
const nosql = {
  subjects: ["nosql"],
  chapter: "NoSQL Databases (Phase 11)",
  tags: ["nosql", "deep-kb"],
  topics: {
    "Document and Key-Value": [
      { kind: "fact", name: "NoSQL facts", facts: [
        ["What is a document store?", "A database storing JSON/BSON documents", "Document stores allow flexible schemas."],
        ["What is a key-value store?", "A simple map of keys to values", "Key-value stores give O(1) lookups."],
        ["What is a column-family store?", "Data organised by columns, not rows", "Column stores optimise for analytic queries."],
        ["What is eventual consistency?", "Replicas converge after writes", "Eventual consistency improves availability."],
        ["What is horizontal scaling?", "Adding more machines to the cluster", "NoSQL databases scale out across commodity hardware."],
        ["What is sharding?", "Splitting data across multiple servers", "Sharding distributes load and data volume."],
        ["What is a graph database?", "Stores nodes and edges natively", "Graph databases optimise relationship queries."]
      ],
        trick: "doc=flexible, KV=simple, column=analytics.",
        tip: "NoSQL types match different data access patterns." },

      { kind: "numeric", name: "shard distribution", difficulty: "easy",
        note: "Records per shard = total records ÷ shard count.",
        q: (v) => `${v.rec} records are sharded evenly across ${v.sh} shards. How many records per shard?`,
        a: (v) => `${Math.round(v.rec / v.sh)}`,
        e: (v) => `Per shard = ${v.rec} ÷ ${v.sh} = ${Math.round(v.rec / v.sh)}, dividing total records by the shard count.`,
        distract: (v) => { const c = Math.round(v.rec / v.sh); return [`${v.rec + v.sh}`, `${c * 2}`, `${Math.round(v.sh / v.rec)}`, `${c * 3}`, `${Math.max(1, c - 1)}`]; },
        vals: (rng) => ({ rec: R(rng, 10000, 500000), sh: R(rng, 2, 64) }),
        whyWrong: (v) => [`Divide records by shards for the even distribution; multiplying or reversing gives nonsense.`],
        trick: "per shard = records / shards.",
        tip: "Even shard keys balance the load across nodes." }
    ]
  }
};

/* ---------------- MONGODB ---------------- */
const mongodb = {
  subjects: ["mongodb"],
  chapter: "MongoDB (Phase 11)",
  tags: ["mongodb", "deep-kb", "document-store"],
  topics: {
    "CRUD and Aggregation": [
      { kind: "fact", name: "MongoDB facts", facts: [
        ["What is a document in MongoDB?", "A JSON-like record in a collection", "Documents are stored as BSON internally."],
        ["What is insertOne used for?", "Adding a single document to a collection", "insertOne returns an acknowledgment."],
        ["What does find() return?", "A cursor over matching documents", "find() queries without modifying data."],
        ["What is updateOne?", "Modifying the first matching document", "updateOne applies changes to one document."],
        ["What is a MongoDB collection?", "A group of related documents", "Collections are the equivalent of tables."],
        ["What is aggregation pipeline?", "A sequence of data processing stages", "Pipelines transform documents step by step."],
        ["What is an index in MongoDB?", "A data structure to speed up queries", "MongoDB supports single-field and compound indexes."],
        ["What is replica set?", "A group of identical copies", "Replica sets provide redundancy and failover."]
      ],
        trick: "insert=add, find=read, update=modify, remove=delete.",
        tip: "MongoDB CRUD operations mirror relational SQL but use JSON." },

      { kind: "numeric", name: "collection count", difficulty: "easy",
        note: "Sum documents across collections.",
        q: (v) => `A database has ${v.c} collections with ${v.n} documents each. Total documents?`,
        a: (v) => `${v.c * v.n}`,
        e: (v) => `Total = ${v.c} × ${v.n} = ${v.c * v.n}, multiplying collections by average size.`,
        distract: (v) => { const c = v.c * v.n; return [`${v.c + v.n}`, `${c / 2}`, `${c * 2}`, `${v.c - v.n}`, `${c + 10}`]; },
        vals: (rng) => ({ c: R(rng, 3, 10), n: R(rng, 100, 500) }),
        whyWrong: (v) => [`Multiply collections by documents each; adding mixes counts with no meaning.`],
        trick: "total = collections × docs each.",
        tip: "MongoDB stores data in collections, not tables." }
    ]
  }
};

/* ---------------- POSTGRESQL ---------------- */
const postgresql = {
  subjects: ["postgresql"],
  chapter: "PostgreSQL (Phase 11)",
  tags: ["postgresql", "deep-kb", "relational"],
  topics: {
    "Advanced SQL": [
      { kind: "fact", name: "PostgreSQL facts", facts: [
        ["What is a PostgreSQL schema?", "A namespace for database objects", "Schemas organise tables, views and functions."],
        ["What is a materialised view?", "A stored result of a query", "Materialised views cache expensive query results."],
        ["What are window functions?", "Functions that compute across rows", "ROW_NUMBER, RANK and LAG are common window functions."],
        ["What is a CTE?", "A Common Table Expression with WITH", "CTEs make complex queries readable and modular."],
        ["What is an EXPLAIN plan?", "The query execution strategy", "EXPLAIN shows how PostgreSQL processes a query."],
        ["What is MVCC?", "Multi-Version Concurrency Control", "MVCC allows concurrent reads and writes without locks."],
        ["What is pg_dump?", "A backup utility for PostgreSQL", "pg_dump exports database schema and data."]
      ],
        trick: "schema=namespace, CTE=with, MVCC=no locks.",
        tip: "PostgreSQL extensions and features distinguish it from MySQL." },

      { kind: "numeric", name: "connection pool size", difficulty: "easy",
        note: "Max connections = pools × connections_per_pool.",
        q: (v) => `A PostgreSQL cluster has ${v.p} application instances each holding a pool of ${v.c} connections. What is the total connection load?`,
        a: (v) => `${v.p * v.c}`,
        e: (v) => `Total load = ${v.p} × ${v.c} = ${v.p * v.c} connections, multiplying pool count by connections per pool.`,
        distract: (v) => { const c = v.p * v.c; return [`${v.p + v.c}`, `${c / 2}`, `${c * 2}`, `${c + 10}`, `${Math.abs(v.p - v.c)}`]; },
        vals: (rng) => ({ p: R(rng, 2, 50), c: R(rng, 5, 100) }),
        whyWrong: (v) => [`Multiply instances by pool size; adding gives an arbitrary sum.`],
        trick: "total = instances × pool size.",
        tip: "Connection poolers like PgBouncer manage large connection loads." }
    ]
  }
};

/* ---------------- SQLITE ---------------- */
const sqlite = {
  subjects: ["sqlite"],
  chapter: "SQLite (Phase 11)",
  tags: ["sqlite", "deep-kb", "embedded-db"],
  topics: {
    "Embedded Database": [
      { kind: "fact", name: "SQLite facts", facts: [
        ["What is SQLite?", "A serverless embedded database engine", "SQLite runs in-process with zero configuration."],
        ["Where is the database stored?", "In a single file", "SQLite stores everything in one portable file."],
        ["What is WAL mode?", "Write-Ahead Logging for concurrency", "WAL allows concurrent readers during writes."],
        ["What is the maximum database size?", "Up to 140 terabytes", "SQLite supports very large databases in theory."],
        ["What is a virtual table?", "A table backed by a module", "Virtual tables extend SQLite with custom logic."],
        ["What is FTS?", "Full-Text Search extension", "FTS enables efficient text search queries."],
        ["What is the sqlite3 command?", "The CLI shell for SQLite", "sqlite3 opens and interacts with SQLite databases."]
      ],
        trick: "SQLite=single file, WAL=write-ahead log.",
        tip: "SQLite is the most deployed database in the world." },

      { kind: "numeric", name: "database page size count", difficulty: "easy",
        note: "File size = page_size × page_count.",
        q: (v) => `An SQLite database uses a page size of ${v.ps} KB and holds ${v.pc} pages. What is the file size in KB?`,
        a: (v) => `${v.ps * v.pc}`,
        e: (v) => `File size = ${v.ps} × ${v.pc} = ${v.ps * v.pc} KB, multiplying page size by total page count.`,
        distract: (v) => { const c = v.ps * v.pc; return [`${v.ps + v.pc}`, `${c / 2}`, `${c * 2}`, `${c + 1024}`, `${v.pc}`]; },
        vals: (rng) => ({ ps: R(rng, 1, 64), pc: R(rng, 100, 50000) }),
        whyWrong: (v) => [`Multiply page size by number of pages; adding does not convert to file size.`],
        trick: "size = page_size × pages.",
        tip: "PRAGMA page_size configures SQLite page dimensions." }
    ]
  }
};

/* ---------------- BASH ---------------- */
const bash = {
  subjects: ["bash"],
  chapter: "Bash Scripting (Phase 11)",
  tags: ["bash", "deep-kb", "shell"],
  topics: {
    "Shell Scripting": [
      { kind: "fact", name: "Bash facts", facts: [
        ["What does #! do in a script?", "The shebang line指定interpreter", "Shebang tells the system which shell to use."],
        ["What does $0 represent?", "The name of the script", "$0 is the script path."],
        ["What does $1 represent?", "The first positional argument", "$1 is the first command-line argument."],
        ["What does echo do?", "Prints output to the terminal", "echo is the most basic output command."],
        ["What does chmod +x do?", "Makes a file executable", "chmod changes file permissions."],
        ["What is a here document?", "A block of input fed to a command", "Here docs use << to pass multi-line input."],
        ["What does $RANDOM return?", "A random integer between 0 and 32767", "RANDOM generates a pseudo-random number."],
        ["What is trap?", "Catches a signal and runs a handler", "trap cleans up on EXIT, INT or TERM."]
      ],
        trick: "$0=self, $1=first arg, $*=all args.",
        tip: "Shell variables start with $ in scripts." },

      { kind: "pair", name: "operator and meaning", a: "operator", b: "action",
        pairs: [["-f", "file exists"], ["-d", "directory exists"], ["-z", "string is empty"], ["-n", "string is not empty"],
          ["-eq", "equal (numbers)"], ["-ne", "not equal (numbers)"], ["-gt", "greater than"], ["-lt", "less than"]],
        outsiders: ["=="],
        trick: "-f=file, -d=dir, -z=empty, -eq=num equal.",
        tip: "Test operators always follow [ or [[ in Bash." },

      { kind: "numeric", name: "exit code check", difficulty: "easy",
        note: "0 = success, non-zero = error.",
        q: (v) => `A command completed with status code ${v.code}. Is this a success status (0) or error?`,
        a: (v) => v.code === 0 ? "Success (0)" : "Error (non-zero)",
        e: (v) => `Status code ${v.code} represents ${v.code === 0 ? "success (0)" : "error (non-zero)"}, per standard Unix convention.`,
        distract: (v) => { const a = v.code === 0 ? "Success (0)" : "Error (non-zero)"; const w = v.code === 0 ? "Error (non-zero)" : "Success (0)"; return [w, "Warning only", "Signal abort", "Segmentation fault", "Timeout"]; },
        vals: (rng) => ({ code: R(rng, 0, 255) }),
        whyWrong: (v) => [`In Unix/Linux, 0 means success and any non-zero value means error.`],
        trick: "0 = success, non-zero = error.",
        tip: "$? holds the exit status of the last executed command." },

      { kind: "numeric", name: "script runtime sum", difficulty: "easy",
        note: "Total = sum of stages.",
        q: (v) => `A script has stages taking ${v.a}s, ${v.b}s and ${v.c}s. Total runtime in seconds?`,
        a: (v) => `${v.a + v.b + v.c}`,
        e: (v) => `Total = ${v.a} + ${v.b} + ${v.c} = ${v.a + v.b + v.c} seconds, adding the three stage durations.`,
        distract: (v) => { const c = v.a + v.b + v.c; return [`${c * 2}`, `${Math.max(v.a, Math.max(v.b, v.c))}`, `${Math.abs(v.a - v.b - v.c)}`, `${c / 2}`, `${c + 5}`]; },
        vals: (rng) => ({ a: R(rng, 1, 60), b: R(rng, 1, 60), c: R(rng, 1, 60) }),
        whyWrong: (v) => [`Add the stage durations; picking the maximum ignores the other stages.`],
        trick: "total = sum of all stages.",
        tip: "Profile scripts to find the slowest stage." },

      { kind: "numeric", name: "file count recursion", difficulty: "easy",
        note: "Count = sum of counts per directory.",
        q: (v) => `A tree has ${v.d} directories with ${v.f} files each. Total files?`,
        a: (v) => `${v.d * v.f}`,
        e: (v) => `Total = ${v.d} × ${v.f} = ${v.d * v.f} files, multiplying directories by files per directory.`,
        distract: (v) => { const c = v.d * v.f; return [`${v.d + v.f}`, `${c / 2}`, `${c * 2}`, `${c + 10}`, `${v.d + v.f * 2}`]; },
        vals: (rng) => ({ d: R(rng, 2, 50), f: R(rng, 5, 200) }),
        whyWrong: (v) => [`Multiply directories by files per directory; adding gives a meaningless sum.`],
        trick: "total = dirs × files per dir.",
        tip: "find -type f | wc -l counts all files recursively." }
    ]
  }
};

/* ---------------- GIT ---------------- */
const gitKb = {
  subjects: ["git"],
  chapter: "Git Version Control (Phase 11)",
  tags: ["git", "deep-kb", "version-control"],
  topics: {
    "Core Commands": [
      { kind: "fact", name: "Git facts", facts: [
        ["What does git init do?", "Creates a new repository", "git init initialises a .git directory."],
        ["What does git add do?", "Stages files for commit", "git add places changes in the index."],
        ["What does git commit do?", "Records staged changes permanently", "git commit creates a snapshot in history."],
        ["What does git push do?", "Uploads local commits to a remote", "git push shares your work with others."],
        ["What does git pull do?", "Fetches and merges from a remote", "git pull updates the working tree."],
        ["What does git branch do?", "Lists or creates branches", "git branch manages parallel development lines."],
        ["What does git merge do?", "Combines branches into one", "git join merges changes from one branch into another."],
        ["What does git log show?", "The commit history", "git log shows authors, dates and messages."]
      ],
        trick: "add=stage, commit=save, push=share.",
        tip: "Git commands follow a workflow: add → commit → push." },

      { kind: "numeric", name: "commit hash length", difficulty: "easy",
        note: "Full SHA-1 hash is 40 hex characters.",
        q: (v) => `A short Git commit hash has ${v.short} characters out of a full ${v.full}-character SHA-1. How many characters were omitted?`,
        a: (v) => `${v.full - v.short}`,
        e: (v) => `Omitted = ${v.full} − ${v.short} = ${v.full - v.short} characters, subtracting short hash length from 40.`,
        distract: (v) => { const c = v.full - v.short; return [`${v.short}`, `${c + 4}`, `${c - 4}`, `${v.full}`, `${v.full + v.short}`]; },
        vals: (rng) => ({ full: 40, short: R(rng, 7, 12) }),
        whyWrong: (v) => [`Subtract the short hash length from 40; the short hash is typically 7-12 characters long.`],
        trick: "full SHA = 40 hex characters.",
        tip: "Git uses 40-character SHA-1 (or SHA-256) hashes." },

      { kind: "numeric", name: "merge conflict lines", difficulty: "easy",
        note: "Conflicts = our changes + their changes per file.",
        q: (v) => `A merge has ${v.ours} lines from our branch and ${v.theirs} from theirs in one file. Total conflict lines?`,
        a: (v) => `${v.ours + v.theirs}`,
        e: (v) => `Total conflict lines = ${v.ours} + ${v.theirs} = ${v.ours + v.theirs}, summing both sides of the diff.`,
        distract: (v) => { const c = v.ours + v.theirs; return [`${Math.abs(v.ours - v.theirs)}`, `${c * 2}`, `${v.ours * v.theirs}`, `${c / 2}`, `${c + 5}`]; },
        vals: (rng) => ({ ours: R(rng, 1, 50), theirs: R(rng, 1, 50) }),
        whyWrong: (v) => [`Add both sides of the conflict; subtracting gives the net difference, not total.`],
        trick: "total = ours + theirs.",
        tip: "Conflicts show both versions for manual resolution." },

      { kind: "numeric", name: "repository size estimate", difficulty: "medium",
        note: "Size ≈ (commits × avg_commit_size) + objects.",
        q: (v) => `A repo has ${v.commits} commits averaging ${v.avg} KB each. Rough repo size in MB?`,
        a: (v) => `${(v.commits * v.avg / 1024).toFixed(1)} MB`,
        e: (v) => `Size ≈ ${v.commits} × ${v.avg} KB = ${v.commits * v.avg} KB = ${(v.commits * v.avg / 1024).toFixed(1)} MB, converting KB to MB.`,
        distract: (v) => { const c = v.commits * v.avg / 1024; return [`${c * 2} MB`, `${c / 2} MB`, `${v.commits * v.avg} KB`, `${c + 10} MB`, `${v.commits} MB`]; },
        vals: (rng) => ({ commits: R(rng, 100, 5000), avg: R(rng, 10, 500) }),
        whyWrong: (v) => [`Multiply commits by avg size in KB, divide by 1024 for MB; skipping KB→MB conversion overstates size 1024x.`],
        trick: "MB = commits × KB / 1024.",
        tip: "git count-objects -v shows actual size." }
    ]
  }
};

/* ---------------- GITHUB ---------------- */
const github = {
  subjects: ["github"],
  chapter: "GitHub (Phase 11)",
  tags: ["github", "deep-kb"],
  topics: {
    "Collaboration Features": [
      { kind: "fact", name: "GitHub facts", facts: [
        ["What is a pull request?", "A proposal to merge changes", "Pull requests enable code review before merging."],
        ["What is an issue?", "A bug report or feature request", "Issues track work in a repository."],
        ["What is a fork?", "A personal copy of someone's repository", "Forks let you experiment without affecting the original."],
        ["What is GitHub Actions?", "A CI/CD automation platform", "Actions run workflows on events like push and PR."],
        ["What is a branch protection rule?", "Restricts who can push to a branch", "Branch protection enforces reviews and checks."],
        ["What is a release?", "A tagged snapshot of code", "Releases distribute packaged versions of the software."],
        ["What is a code review?", "Examining code before merging", "Reviews catch bugs and enforce style standards."]
      ],
        trick: "PR=merge proposal, fork=personal copy, issue=work item.",
        tip: "GitHub collaboration is tested in every CS exam." },

      { kind: "numeric", name: "review approval ratio", difficulty: "easy",
        note: "Approval ratio = approvals ÷ reviewers.",
        q: (v) => `A pull request has ${v.rev} reviewers and ${v.app} approvals. What fraction is approved?`,
        a: (v) => `${(v.app / v.rev).toFixed(2)}`,
        e: (v) => `Fraction = ${v.app} ÷ ${v.rev} = ${(v.app / v.rev).toFixed(2)}, comparing approvals to total reviewers.`,
        distract: (v) => { const c = v.app / v.rev; return [`${(v.rev / v.app).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(v.rev - v.app).toFixed(2)}`, `${(c + 0.5).toFixed(2)}`]; },
        vals: (rng) => ({ rev: R(rng, 1, 8), app: R(rng, 0, 8) }),
        whyWrong: (v) => [`Divide approvals by total reviewers; reversing the numerator gives unhappy logic.`],
        trick: "fraction = approvals / reviewers.",
        tip: "Branch protection can require a minimum approval ratio." },

      { kind: "numeric", name: "workflow duration", difficulty: "easy",
        note: "Total minutes = jobs × avg_minutes_per_job.",
        q: (v) => `A GitHub Actions workflow has ${v.jobs} jobs averaging ${v.mins} minutes each. Total run time?`,
        a: (v) => `${v.jobs * v.mins} minutes`,
        e: (v) => `Total = ${v.jobs} × ${v.mins} = ${v.jobs * v.mins} minutes, multiplying job count by average duration.`,
        distract: (v) => { const c = v.jobs * v.mins; return [`${v.jobs + v.mins} minutes`, `${c * 2} minutes`, `${Math.round(c / 2)} minutes`, `${c + 30} minutes`, `${v.jobs * 2} minutes`]; },
        vals: (rng) => ({ jobs: R(rng, 1, 12), mins: R(rng, 1, 30) }),
        whyWrong: (v) => [`Multiply jobs by average minutes; adding gives meaningless sum.`],
        trick: "total = jobs × avg minutes.",
        tip: "Parallel jobs reduce wall-clock time." },

      { kind: "numeric", name: "issue closure rate", difficulty: "medium",
        note: "Closure rate = closed ÷ opened × 100.",
        q: (v) => `A repo opened ${v.opened} issues this month and closed ${v.closed}. What is the closure rate?`,
        a: (v) => `${(v.closed / v.opened * 100).toFixed(1)}%`,
        e: (v) => `Rate = ${v.closed} ÷ ${v.opened} × 100 = ${(v.closed / v.opened * 100).toFixed(1)}%, dividing closed by opened issues.`,
        distract: (v) => { const c = v.closed / v.opened * 100; return [`${(v.opened / v.closed * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 20).toFixed(1)}%`, `${(c - 10).toFixed(1)}%`]; },
        vals: (rng) => ({ opened: R(rng, 10, 200), closed: R(rng, 0, 200) }),
        whyWrong: (v) => [`Divide closed by opened issues; reversing the ratio inverts the metric.`],
        trick: "closure rate = closed / opened × 100.",
        tip: "High closure rates indicate active triage." }
    ]
  }
};

/* ---------------- TYPESCRIPT ---------------- */
const typescript = {
  subjects: ["typescript"],
  chapter: "TypeScript (Phase 11)",
  tags: ["typescript", "deep-kb"],
  topics: {
    "Types and Features": [
      { kind: "fact", name: "TypeScript facts", facts: [
        ["What is TypeScript?", "A typed superset of JavaScript", "TypeScript compiles to plain JavaScript."],
        ["What does the type keyword do?", "Declares a type alias", "Types improve code clarity and safety."],
        ["What is an interface?", "A contract for object shape", "Interfaces enforce property types on objects."],
        ["What is an enum?", "A set of named constants", "Enums map names to numeric or string values."],
        ["What is a generic?", "A parameterised type", "Generics let functions work with any type."],
        ["What is type inference?", "The compiler deduces the type", "TypeScript infers types when not explicitly annotated."],
        ["What is a union type?", "A variable that can be one of several types", "Union types use the | operator."],
        ["What is a tuple?", "A fixed-length array with typed elements", "Tuples combine arrays with fixed positions."]
      ],
        trick: "TS=JS+types, interface=contract, generic=parameterised type.",
        tip: "TypeScript types and interfaces dominate exam questions." },

      { kind: "numeric", name: "compile output size ratio", difficulty: "easy",
        note: "Output size = input × factor.",
        q: (v) => `A TypeScript file of ${v.in} KB compiles to ${v.out} KB of JavaScript. What is the compiled fraction of the source?`,
        a: (v) => `${(v.out / v.in).toFixed(2)}`,
        e: (v) => `Fraction = ${v.out} ÷ ${v.in} = ${(v.out / v.in).toFixed(2)}, comparing compiled output to source size.`,
        distract: (v) => { const c = v.out / v.in; return [`${(v.in / v.out).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(v.out - v.in).toFixed(2)}`, `${(c * 1.5).toFixed(2)}`]; },
        vals: (rng) => ({ in: R(rng, 10, 200), out: R(rng, 10, 200) }),
        whyWrong: (v) => [`Divide output by input for the ratio; reversing inverts the comparison.`],
        trick: "ratio = output / source.",
        tip: "Compiled JS often expands beyond the source lines." }
    ]
  }
};

/* ---------------- WEB DEVELOPMENT ---------------- */
const webDev = {
  subjects: ["web-development"],
  chapter: "Web Development (Phase 11)",
  tags: ["web-development", "deep-kb"],
  topics: {
    "HTTP and Front-End": [
      { kind: "fact", name: "web dev facts", facts: [
        ["What is HTTP?", "The Hypertext Transfer Protocol", "HTTP is the foundation of web communication."],
        ["What is a REST API?", "An API following REST principles", "REST APIs use HTTP verbs on resources."],
        ["What is a cookie?", "A small text file stored in the browser", "Cookies persist state across requests."],
        ["What is a session?", "Server-side state for a user", "Sessions track logged-in users."],
        ["What is the DOM?", "The Document Object Model of a page", "DOM is a tree of elements JavaScript can manipulate."],
        ["What is responsive design?", "Layouts adapting to screen sizes", "Responsive design uses media queries and flexible grids."],
        ["What is CORS?", "Cross-Origin Resource Sharing", "CORS controls which external sites can access resources."]
      ],
        trick: "HTTP=transfer, REST=resource, DOM=page tree.",
        tip: "Web fundamentals bridge front-end and back-end." },

      { kind: "numeric", name: "latency timeline", difficulty: "easy",
        note: "Total time = sum of stage times.",
        q: (v) => `A page stalls ${v.dns} ms on DNS, ${v.srv} ms on server and ${v.net} ms on network. What is the total load time?`,
        a: (v) => `${v.dns + v.srv + v.net} ms`,
        e: (v) => `Total = ${v.dns} + ${v.srv} + ${v.net} = ${v.dns + v.srv + v.net} ms, adding the three stage timings.`,
        distract: (v) => { const c = v.dns + v.srv + v.net; return [`${c * 2} ms`, `${Math.max(v.srv, v.net)} ms`, `${c / 2} ms`, `${v.dns + v.srv} ms`, `${c + 50} ms`]; },
        vals: (rng) => ({ dns: R(rng, 10, 100), srv: R(rng, 20, 300), net: R(rng, 30, 200) }),
        whyWrong: (v) => [`Add the three stage latencies; picking the single largest stage ignores the full timeline.`],
        trick: "total = dns + srv + net.",
        tip: "Web performance counts every network stage." }
    ]
  }
};

/* ---------------- MOBILE DEVELOPMENT ---------------- */
const mobileDev = {
  subjects: ["mobile-development"],
  chapter: "Mobile Development (Phase 11)",
  tags: ["mobile-development", "deep-kb"],
  topics: {
    "Platforms and Frameworks": [
      { kind: "fact", name: "mobile dev facts", facts: [
        ["What is a native app?", "Built for one platform using platform tools", "Native apps use Swift/Kotlin or platform SDKs."],
        ["What is a hybrid app?", "Built with web technologies in a native shell", "Hybrid apps use HTML/CSS/JS in a WebView."],
        ["What is React Native?", "A framework for cross-platform mobile apps", "React Native uses JavaScript and renders native views."],
        ["What is Flutter?", "Google's cross-platform UI toolkit", "Flutter compiles Dart to native ARM code."],
        ["What is an activity?", "A single screen in an Android app", "Activities manage the user interface lifecycle."],
        ["What is a view controller?", "A controller managing a screen in iOS", "View controllers handle layout and user interaction."],
        ["What is a push notification?", "A message sent from a server to a device", "Push notifications wake the device to show alerts."],
        ["What is the app store?", "A marketplace for mobile applications", "App stores distribute and update apps."]
      ],
        trick: "native=platform, hybrid=web-in-shell, Flutter=Dart.",
        tip: "Cross-platform vs native trade-offs are high-yield topics." },

      { kind: "numeric", name: "screen density ratio", difficulty: "easy",
        note: "Pixel count = width × height.",
        q: (v) => `A phone screen is ${v.w} by ${v.h} pixels. What is the total pixel count?`,
        a: (v) => `${v.w * v.h}`,
        e: (v) => `Pixels = ${v.w} × ${v.h} = ${v.w * v.h}, multiplying width and height resolutions.`,
        distract: (v) => { const c = v.w * v.h; return [`${c * 2}`, `${v.w + v.h}`, `${Math.round(c / 2)}`, `${c / 4}`, `${c + 1000}`]; },
        vals: (rng) => ({ w: R(rng, 320, 1440), h: R(rng, 640, 3200) }),
        whyWrong: (v) => [`Multiply width by height; adding the dimensions gives a nonsensical pixel count.`],
        trick: "pixels = width × height.",
        tip: "Resolution names like 1080p derive from pixel counts." }
    ]
  }
};

module.exports = [
  makeKbGen(sqlKb), makeKbGen(nosql), makeKbGen(mongodb), makeKbGen(postgresql),
  makeKbGen(sqlite), makeKbGen(bash), makeKbGen(gitKb), makeKbGen(github),
  makeKbGen(typescript), makeKbGen(webDev), makeKbGen(mobileDev)
];
