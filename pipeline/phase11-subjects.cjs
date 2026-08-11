#!/usr/bin/env node
/* Phase 11 — register missing Professional/KB subjects (medical/engineering/CS/business). */
"use strict";
const { open } = require("E:/pAK MCQS/db/engine.js");
const db = open();

const DESCR = {
  "ent": "Ear, Nose and Throat — anatomy, disorders, diagnosis and treatment of otolaryngology.",
  "ophthalmology": "Eye: anatomy, refraction, ocular disorders, surgery and vision sciences.",
  "gynecology": "Female reproductive health, obstetrics basics, menstrual and gynaecological disorders.",
  "pediatrics": "Child health: growth, development, neonatology, childhood diseases and nutrition.",
  "behavioral-sciences": "Behavioural sciences for medical exams: psychology, sociology, communication, ethics and doctor-patient relations.",
  "forensic-medicine": "Forensic and legal medicine: medico-legal autopsy, toxicology, wounds, and ethics.",
  "dental-surgery": "Oral and maxillofacial surgery, extractions, trauma, and surgical management.",
  "dental-medicine": "Therapeutic dentistry: caries, endodontics, oral medicine and patient management.",
  "nutrition": "Nutrition science: macronutrients, micronutrients, deficiencies, and diet therapy.",
  "public-health": "Public health: epidemiology, health systems, disease prevention, and health policy.",
  "textile-engineering": "Textile engineering: fibres, yarns, spinning, weaving, and knitting.",
  "petroleum-engineering": "Petroleum engineering: drilling, reservoirs, production, and reservoirs.",
  "mining-engineering": "Mining engineering: exploration, extraction, mine safety, and mineral processing.",
  "telecommunication": "Telecommunication: signals, modulation, transmission media, and networking.",
  "architecture": "Architecture: design principles, building materials, structures, and urban planning.",
  "programming-fundamentals": "Programming fundamentals: syntax, data types, control flow, functions, and program design.",
  "algorithms": "Algorithms: sorting, searching, complexity and graph and algorithm design.",
  "data-structures": "Data structures: arrays, lists, stacks, queues, trees, graphs, and hash tables.",
  "artificial-intelligence": "Artificial intelligence: search, knowledge representation, planning, and expert systems.",
  "web-development": "Web development: HTML/CSS/JS, frontend, backend, HTTP, and modern web architecture.",
  "mobile-development": "Mobile development: Android, iOS, mobile UI, and cross-platform frameworks.",
  "computer-graphics": "Computer graphics: rendering, transforms, shaders, and image processing.",
  "compiler-design": "Compiler design: lexical analysis, parsing, code generation, and optimisation.",
  "digital-logic": "Digital logic: gates, boolean algebra, flip-flops, and combinational/sequential circuits.",
  "distributed-systems": "Distributed systems: consistency, replication, consensus, and fault tolerance.",
  "system-design": "System design: scalability, load balancing, caching, and architecture tradeoffs.",
  "nosql": "NoSQL databases: key-value, document, column, graph stores, and CAP theorem.",
  "mongodb": "MongoDB: documents, collections, aggregation, and indexing.",
  "postgresql": "PostgreSQL: SQL, functions, constraints, transactions, and MVCC.",
  "sqlite": "SQLite: lightweight SQL, transactions, types, and embeddable databases.",
  "bash": "Bash shell scripting: commands, variables, control flow, and process automation.",
  "git": "Git: version control, branches, merges, and workflows.",
  "github": "GitHub: repositories, PRs, actions, and collaboration workflows.",
  "express": "Express.js: middleware, routing, APIs, and Node.js web apps.",
  "taxation": "Taxation: direct tax, indirect tax, GST/sales tax, and tax compliance.",
  "business-administration": "Business administration: planning, management, operations, and strategy.",
  "management": "Management: functions, leadership, decision making, and organisational behaviour.",
  "project-management": "Project management: scope, schedule, PMBOK, risk, and agile.",
  "entrepreneurship": "Entrepreneurship: startup, funding, business plans, and business models.",
  "business-law": "Business law: contracts, companies, court law, and commercial regulations.",
  "management-accounting": "Management accounting: budgets, costing, variance analysis, and decision making.",
  "organization-behavior": "Organization behaviour: culture, motivation, individual behaviour, and leadership.",
  "audit-standards": "Auditing standards: ISA/GAAS, audit planning and evidence."
};

const CAT = {
  medical: "medical", ophthal: "medical", gyne: "medical", pedia: "medical",
  behavior: "medical", forensic: "medical", dental: "medical", nutrit: "medical",
  public: "medical", textile: "engineering", petroleum: "engineering", mining: "engineering",
  telec: "engineering", archi: "engineering", prog: "computer-it", alg: "computer-it",
  ds: "computer-it", ai: "computer-it", web: "computer-it", mobile: "computer-it",
  graphics: "computer-it", comp: "computer-it", digi: "computer-it", distrib: "computer-it",
  sys: "computer-it", nosql: "computer-it", mongo: "computer-it", postgresql: "computer-it",
  sqlite: "computer-it", bash: "computer-it", git: "computer-it", github: "computer-it",
  express: "computer-it", tax: "management", busadmin: "management", mgmt: "management",
  projman: "management", entre: "management", bizlaw: "management", manacc: "management",
  orgbeh: "management", cash: "management"
};

const defs = [
  ["ent", "ENT", "medical"], ["ophthalmology", "Ophthalmology", "medical"],
  ["gynecology", "Gynecology & Obstetrics", "medical"], ["pediatrics", "Pediatrics", "medical"],
  ["behavioral-sciences", "Behavioral Sciences", "medical"], ["forensic-medicine", "Forensic Medicine", "medical"],
  ["dental-surgery", "Dental Surgery", "medical"], ["dental-medicine", "Dental Medicine", "medical"],
  ["nutrition", "Nutrition & Dietetics", "medical"], ["public-health", "Public Health", "medical"],
  ["textile-engineering", "Textile Engineering", "engineering"], ["petroleum-engineering", "Petroleum Engineering", "engineering"],
  ["mining-engineering", "Mining Engineering", "engineering"], ["telecommunication", "Telecommunication", "engineering"],
  ["architecture", "Architecture", "engineering"], ["programming-fundamentals", "Programming Fundamentals", "computer-it"],
  ["algorithms", "Algorithms", "computer-it"], ["data-structures", "Data Structures", "computer-it"],
  ["artificial-intelligence", "Artificial Intelligence (Orig)", "computer-it"], ["web-development", "Web Development", "computer-it"],
  ["mobile-development", "Mobile Development", "computer-it"], ["computer-graphics", "Computer Graphics", "computer-it"],
  ["compiler-design", "Compiler Design", "computer-it"], ["digital-logic", "Digital Logic Design", "computer-it"],
  ["distributed-systems", "Distributed Systems", "computer-it"], ["system-design", "System Design", "computer-it"],
  ["nosql", "NoSQL Databases", "computer-it"], ["mongodb", "MongoDB", "computer-it"],
  ["postgresql", "PostgreSQL", "computer-it"], ["sqlite", "SQLite", "computer-it"],
  ["bash", "Bash Scripting", "computer-it"], ["git", "Git", "computer-it"], ["github", "GitHub", "computer-it"],
  ["express", "Express.js", "computer-it"], ["taxation", "Taxation", "management"],
  ["business-administration", "Business Administration", "management"], ["management", "Management", "management"],
  ["project-management", "Project Management", "management"], ["entrepreneurship", "Entrepreneurship", "management"],
  ["business-law", "Business Law", "management"], ["management-accounting", "Management Accounting", "management"],
  ["organization-behavior", "Organizational Behaviour", "management"], ["auditing-standards", "Auditing Standards", "management"]
];

let added = 0;
const existing = new Set(db.all("SELECT id FROM subjects").map(r => r.id));
for (const [id, name, cat] of defs) {
  if (existing.has(id)) { console.log(`EH exists ${id}`); continue; }
  const desc = DESCR[id] || `${name} — professional knowledge.`;
  const slug = id;
  db.run(`INSERT INTO subjects (id,name,slug,category_id,icon,description,status,exam_ids,sort_order)
    VALUES (?,?,?,?,?,?,'active','',20)`, [id, name, slug, cat, "🎓", desc]);
  added++;
  console.log(`+ subject ${id} (${cat})`);
}
console.log("added:", added);
db.close();
