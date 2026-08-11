const fs = require("fs");
const path = require("path");

const read = (f) => JSON.parse(fs.readFileSync(path.join("data", f), "utf8"));
const write = (f, d) => fs.writeFileSync(path.join("data", f), JSON.stringify(d, null, 2));

const log = (m) => console.log(m);
const warn = (m) => console.log("[WARN]", m);
const fail = (m) => { console.error("[FATAL]", m); process.exit(1); };

const subjects = read("subjects.json");
const chapters = read("chapters.json");
const topics = read("topics.json");
const categories = read("categories.json");
const exams = read("exams.json");

const existingIds = (arr, field) => new Set(arr.map((x) => x[field]));
const subjIds = existingIds(subjects, "id");
const chapIds = existingIds(chapters, "id");
const catIds = existingIds(categories, "id");
const examIds = existingIds(exams, "id");

/* ---------- new exams ---------- */
const NEW_EXAMS = [
  { id: "pma", name: "PMA", fullName: "Pakistan Military Academy (PMA)", category: "defence", description: "Initial test and interview for entry into the Pakistan Military Academy Long Course.", site: "", order: 30 },
  { id: "issb", name: "ISSB", fullName: "Inter Services Selection Board (ISSB)", category: "defence", description: "Psychological and aptitude testing for selection into Pakistan's armed forces.", site: "", order: 31 },
  { id: "punjab-police", name: "Punjab Police", fullName: "Punjab Police Recruitment", category: "provincial", description: "Recruitment tests for Punjab Police constable, ASI and SI posts.", site: "", order: 32 },
  { id: "fia-inspector", name: "FIA Inspector", fullName: "FIA Inspector Recruitment", category: "federal", description: "FIA departmental test for inspector-level posts.", site: "", order: 33 },
  { id: "anf", name: "ANF", fullName: "Anti-Narcotics Force (ANF)", category: "federal", description: "Recruitment tests for the Anti-Narcotics Force.", site: "", order: 34 },
  { id: "wapda", name: "WAPDA", fullName: "Water & Power Development Authority", category: "corporate", description: "WAPDA recruitment tests for technical and administrative posts.", site: "", order: 35 },
  { id: "fbr", name: "FBR", fullName: "Federal Board of Revenue", category: "federal", description: "Tests for revenue, taxation and customs posts in FBR.", site: "", order: 36 },
  { id: "sbp", name: "SBP", fullName: "State Bank of Pakistan", category: "corporate", description: "SBP recruitment tests for banking and research positions.", site: "", order: 37 },
  { id: "banking", name: "Banking Jobs", fullName: "Banking Sector Recruitment", category: "corporate", description: "Entry tests for commercial banks and financial institutions (IBP etc.).", site: "", order: 38 }
];

/* ---------- new category ---------- */
const NEW_CATEGORY = {
  id: "entry-tests",
  name: "Entry Tests",
  description: "Standardized entry tests for professional and international admissions: MDCAT, ECAT, LAT, GAT, GRE, IELTS, TOEFL and SAT.",
  icon: "ET",
  subjects: [],
  order: 16
};

/* ---------- new subjects: id, name, icon, category, description, exams, chapters [[chName, [topic, ...]], ...] ---------- */
const NEW_SUBJECTS = [
  { id: "world-current-affairs", name: "World Current Affairs", icon: "WC", cat: "current-affairs", desc: "Global events, international organizations, world economy and major world developments.", exams: ["css", "pms", "fpsc", "nts", "ots"],
    ch: [["Global Organizations", ["UN System & Agencies", "IMF, WTO, BRICS & Bodies"]], ["World Economy & Trade", ["Trade Blocs & Agreements", "Global Economic Trends"]], ["Conflicts & Peacekeeping", ["Recent Conflicts", "Peace & Diplomacy"]]] },
  { id: "iq", name: "IQ & Aptitude", icon: "IQ", cat: "mathematics", desc: "Intelligence quotient tests: number series, analogies, classification and pattern recognition.", exams: ["nts", "ots", "cts", "pts", "fpsc", "ppsc", "police", "pma"],
    ch: [["Number & Letter Series", ["Number Series", "Letter & Symbol Series"]], ["Classification & Odd One Out", ["Classification", "Odd One Out"]], ["Analogies", ["Word Analogies", "Number Analogies"]]] },
  { id: "logical-reasoning", name: "Logical Reasoning", icon: "LR", cat: "mathematics", desc: "Syllogisms, statements and conclusions, assumptions and logic puzzles.", exams: ["nts", "css", "pms", "gat", "gre"],
    ch: [["Statements & Conclusions", ["Conclusions & Assumptions", "Inferences"]], ["Syllogisms", ["Basic Syllogisms", "Venn Diagram Logic"]], ["Logic Puzzles", ["Seating & Ordering", "Coding-Decoding"]]] },
  { id: "analytical-reasoning", name: "Analytical Reasoning", icon: "AR", cat: "mathematics", desc: "Arrangements, data sufficiency, decision making and coding patterns.", exams: ["nts", "gat", "gre", "css"],
    ch: [["Arrangements", ["Linear Arrangements", "Circular Arrangements"]], ["Data Sufficiency", ["Data Sufficiency", "Decision Making"]], ["Coding-Decoding", ["Letter Coding", "Number Coding"]]] },
  { id: "verbal-reasoning", name: "Verbal Reasoning", icon: "VR", cat: "mathematics", desc: "Word logic, sentence logic, cause and effect and verbal classification.", exams: ["nts", "gat", "gre", "ielts"],
    ch: [["Word Logic", ["Analogies", "Word Relations"]], ["Sentence Logic", ["Statement Analysis", "Cause & Effect"]], ["Classification & Series", ["Verbal Classification", "Verbal Series"]]] },
  { id: "non-verbal-reasoning", name: "Non-Verbal Reasoning", icon: "NV", cat: "mathematics", desc: "Figure series, mirror and water images, cubes and dice problems.", exams: ["nts", "pma", "issb", "police"],
    ch: [["Figure Series", ["Figure Series", "Figure Completion"]], ["Images & Reflections", ["Mirror Images", "Water Images"]], ["Cubes & Dice", ["Cube Problems", "Dice Problems"]]] },
  { id: "data-interpretation", name: "Data Interpretation", icon: "DI", cat: "mathematics", desc: "Tables, charts, graphs and quantitative data analysis.", exams: ["css", "gat", "gre", "ib", "sbp"],
    ch: [["Tables & Charts", ["Tables", "Bar Charts"]], ["Graphs", ["Line Graphs", "Pie Charts"]], ["Quantitative Data", ["Percentages & Ratios", "Averages & Trends"]]] },
  { id: "aptitude-tests", name: "Aptitude Tests", icon: "AP", cat: "mathematics", desc: "Quantitative aptitude: percentages, time & work, speed & distance and arithmetic.", exams: ["nts", "ib", "sbp", "banking", "wapda"],
    ch: [["Quantitative Aptitude", ["Percentages & Ratios", "Profit, Loss & Discount"]], ["Time & Work", ["Work & Wages", "Pipes & Cisterns"]], ["Speed & Distance", ["Time & Distance", "Boats & Streams"]]] },
  { id: "vocabulary", name: "Vocabulary", icon: "VO", cat: "english-urdu", desc: "Word meanings, roots, prefixes, confusable words and contextual usage.", exams: ["css", "ppsc", "fpsc", "nts", "gre", "ielts", "toefl", "sat"],
    ch: [["Word Meanings", ["Common Exam Words", "Roots, Prefixes & Suffixes"]], ["Confusing Words", ["Confusable Pairs", "Contextual Usage"]]] },
  { id: "grammar", name: "Grammar", icon: "GR", cat: "english-urdu", desc: "Parts of speech, sentence structure, agreement and punctuation.", exams: ["css", "ppsc", "fpsc", "nts", "ielts", "toefl", "sat"],
    ch: [["Parts of Speech", ["Nouns & Pronouns", "Verbs & Tenses"]], ["Sentence Structure", ["Subject-Verb Agreement", "Clauses & Phrases"]], ["Punctuation & Style", ["Punctuation", "Common Errors"]]] },
  { id: "synonyms", name: "Synonyms", icon: "SY", cat: "english-urdu", desc: "High-frequency synonyms and context-based synonym questions.", exams: ["css", "ppsc", "fpsc", "nts", "gre", "sat"],
    ch: [["Synonym Sets", ["High-Frequency Synonyms", "Context-Based Synonyms"]], ["Vocabulary Building", ["Word Families", "Intensifiers & Shades"]]] },
  { id: "antonyms", name: "Antonyms", icon: "AN", cat: "english-urdu", desc: "Opposite words: high-frequency antonyms and prefix-based opposites.", exams: ["css", "ppsc", "fpsc", "nts", "gre", "sat"],
    ch: [["Antonym Sets", ["High-Frequency Antonyms", "Prefix-Based Opposites"]], ["Context Antonyms", ["Opposites in Sentences", "Shades of Meaning"]]] },
  { id: "idioms", name: "Idioms & Phrases", icon: "ID", cat: "english-urdu", desc: "Common English idioms, phrases and phrasal verbs.", exams: ["css", "ppsc", "fpsc", "nts", "ielts", "sat"],
    ch: [["Common Idioms", ["Everyday Idioms", "Body-Part Idioms"]], ["Phrasal Verbs", ["Phrasal Verbs", "Idioms in Context"]]] },
  { id: "sentence-correction", name: "Sentence Correction", icon: "SC", cat: "english-urdu", desc: "Error spotting and sentence improvement for English papers.", exams: ["css", "ppsc", "fpsc", "nts", "sat"],
    ch: [["Error Spotting", ["Agreement Errors", "Tense & Mood Errors"]], ["Improvement", ["Sentence Improvement", "Sentence Reconstruction"]]] },
  { id: "comprehension", name: "Comprehension", icon: "CO", cat: "english-urdu", desc: "Reading passages, main idea, inference and cloze tests.", exams: ["css", "ppsc", "fpsc", "nts", "ielts", "toefl", "sat", "gre"],
    ch: [["Reading Passages", ["Main Idea & Tone", "Inference & Detail"]], ["Cloze & Fill-ins", ["Cloze Tests", "Vocabulary in Context"]]] },
  { id: "computer-engineering", name: "Computer Engineering", icon: "CE", cat: "engineering", desc: "Digital logic, computer architecture and embedded systems.", exams: ["nts", "ecat", "fpsc", "ppsc"],
    ch: [["Digital Logic", ["Logic Gates", "Boolean Algebra"]], ["Computer Architecture", ["Processor & Memory", "I/O Systems"]], ["Embedded Systems", ["Microcontrollers", "Embedded Programming"]]] },
  { id: "mbbs", name: "MBBS", icon: "MB", cat: "medical", desc: "Medical entry and professional content for the Bachelor of Medicine & Bachelor of Surgery.", exams: ["mdcat", "fpsc"],
    ch: [["Pre-Clinical Basics", ["Anatomy Essentials", "Physiology Essentials"]], ["Clinical Foundations", ["Medicine Basics", "Surgery Basics"]]] },
  { id: "bds", name: "BDS", icon: "BD", cat: "medical", desc: "Dental curriculum content for the Bachelor of Dental Surgery.", exams: ["mdcat", "fpsc"],
    ch: [["Dental Pre-Clinical", ["Oral Anatomy Basics", "Dental Materials Basics"]], ["Clinical Dentistry", ["Conservative Dentistry", "Oral Surgery Basics"]]] },
  { id: "dpt", name: "DPT", icon: "DP", cat: "medical", desc: "Doctor of Physical Therapy content: anatomy, kinesiology and therapeutics.", exams: ["mdcat"],
    ch: [["PT Fundamentals", ["Anatomy for Physiotherapy", "Kinesiology"]], ["Therapeutic Techniques", ["Exercise Therapy", "Electrotherapy"]]] },
  { id: "pharmacology", name: "Pharmacology", icon: "PH", cat: "medical", desc: "Pharmacokinetics, drug classes and clinical pharmacology.", exams: ["mdcat", "fpsc", "ppsc"],
    ch: [["Pharmacokinetics", ["Absorption & Distribution", "Metabolism & Excretion"]], ["Drug Classes", ["Autonomic Drugs", "Antimicrobials"]], ["Clinical Pharmacology", ["Adverse Effects", "Drug Interactions"]]] },
  { id: "general-anatomy", name: "General Anatomy", icon: "GA", cat: "medical", desc: "Human body systems, organs and their structure and function.", exams: ["mdcat", "fpsc", "ppsc"],
    ch: [["Body Systems", ["Skeletal System", "Muscular System"]], ["Organ Systems", ["Cardiovascular System", "Nervous System"]]] },
  { id: "oral-anatomy", name: "Oral Anatomy", icon: "OA", cat: "medical", desc: "Teeth morphology, oral cavity and head & neck anatomy.", exams: ["mdcat", "fpsc"],
    ch: [["Dental Structures", ["Teeth Morphology", "Oral Cavity"]], ["Head & Neck", ["Muscles & Nerves", "Salivary Glands"]]] },
  { id: "oral-histology", name: "Oral Histology", icon: "OH", cat: "medical", desc: "Microscopic structure of oral tissues and tooth development.", exams: ["mdcat", "fpsc"],
    ch: [["Oral Tissues", ["Enamel & Dentin", "Pulp & Cementum"]], ["Development", ["Tooth Development", "Oral Mucosa"]]] },
  { id: "oral-pathology", name: "Oral Pathology", icon: "OP", cat: "medical", desc: "Oral lesions, dental caries, periodontal disease and oral conditions.", exams: ["mdcat", "fpsc"],
    ch: [["Oral Lesions", ["Dental Caries", "Periodontal Disease"]], ["Oral Conditions", ["Cysts & Tumors", "Oral Infections"]]] },
  { id: "hrm", name: "HRM", icon: "HR", cat: "management", desc: "Human resource management: planning, recruitment, training and employee relations.", exams: ["fpsc", "ppsc", "ib", "banking"],
    ch: [["HRM Fundamentals", ["HR Planning", "Recruitment & Selection"]], ["HR Operations", ["Training & Development", "Performance Appraisal"]], ["Employee Relations", ["Compensation", "Labor Laws"]]] },
  { id: "marketing", name: "Marketing", icon: "MK", cat: "management", desc: "Marketing mix, segmentation, branding, pricing and digital marketing.", exams: ["fpsc", "ppsc", "ib", "banking"],
    ch: [["Marketing Fundamentals", ["Marketing Mix", "Segmentation & Targeting"]], ["Marketing Strategy", ["Branding", "Pricing Strategies"]], ["Digital Marketing", ["Social Media Marketing", "Content & SEO"]]] },
  { id: "world-history", name: "World History", icon: "WH", cat: "social-sciences", desc: "Ancient civilizations, medieval empires, world wars and the modern world.", exams: ["css", "pms", "fpsc", "nts"],
    ch: [["Ancient & Medieval", ["Ancient Civilizations", "Medieval Empires"]], ["Modern World", ["Renaissance & Enlightenment", "World Wars"]], ["Contemporary Era", ["Cold War", "Post-1990 World"]]] },
  { id: "pakistan-history", name: "Pakistan History", icon: "PH", cat: "social-sciences", desc: "Muslim rule in India, the freedom movement and Pakistan's post-1947 history.", exams: ["css", "pms", "ppsc", "fpsc", "nts"],
    ch: [["Pre-Independence", ["Muslim Rule in India", "Freedom Movement"]], ["Post-1947", ["Early Years", "Constitutional Development"]], ["Modern Pakistan", ["Politics & Governance", "Economic History"]]] },
  { id: "machine-learning", name: "Machine Learning", icon: "ML", cat: "computer-it", desc: "Supervised and unsupervised learning, algorithms, evaluation and tuning.", exams: ["ib", "fpsc", "ppsc"],
    ch: [["ML Fundamentals", ["Supervised Learning", "Unsupervised Learning"]], ["Algorithms", ["Regression & Classification", "Clustering"]], ["Evaluation & Tuning", ["Metrics", "Overfitting & Regularization"]]] },
  { id: "deep-learning", name: "Deep Learning", icon: "DL", cat: "computer-it", desc: "Neural networks, CNNs, RNNs, transformers and large language models.", exams: ["ib", "fpsc"],
    ch: [["Neural Networks", ["Perceptron & Layers", "Activation Functions"]], ["CNNs & RNNs", ["Convolutional Networks", "Recurrent Networks"]], ["LLMs & Transformers", ["Transformer Architecture", "Attention & Embeddings"]]] },
  { id: "ethical-hacking", name: "Ethical Hacking", icon: "EH", cat: "computer-it", desc: "Security fundamentals, penetration testing and defensive practices.", exams: ["ib", "fpsc"],
    ch: [["Security Fundamentals", ["Threats & Vulnerabilities", "Security Controls"]], ["Penetration Testing", ["Reconnaissance", "Exploitation & Post-Exploitation"]], ["Defensive Practices", ["Hardening", "Incident Response"]]] },
  { id: "devops", name: "DevOps", icon: "DO", cat: "computer-it", desc: "CI/CD, infrastructure as code and monitoring practices.", exams: ["ib", "fpsc", "banking"],
    ch: [["CI/CD", ["Pipeline Fundamentals", "Build & Release"]], ["Infrastructure as Code", ["Terraform & Ansible", "Configuration Management"]], ["Monitoring", ["Logging & Metrics", "Observability"]]] },
  { id: "big-data", name: "Big Data", icon: "BD", cat: "computer-it", desc: "Big data fundamentals, Hadoop ecosystem and processing frameworks.", exams: ["ib", "fpsc"],
    ch: [["Big Data Fundamentals", ["The 3 V's", "Hadoop Ecosystem"]], ["Processing Frameworks", ["MapReduce", "Spark"]], ["Data Pipelines", ["Streaming", "Batch Processing"]]] },
  { id: "database", name: "Database", icon: "DB", cat: "computer-it", desc: "Relational databases, normalization, design and administration.", exams: ["ib", "fpsc", "nts", "banking"],
    ch: [["Relational Databases", ["Tables & Keys", "Normalization"]], ["Database Design", ["ER Modeling", "Indexes & Constraints"]], ["Administration", ["Transactions & ACID", "Backup & Recovery"]]] },
  { id: "sql", name: "SQL", icon: "SQ", cat: "computer-it", desc: "Structured Query Language: queries, joins, aggregation and optimization.", exams: ["ib", "fpsc", "nts"],
    ch: [["SQL Basics", ["SELECT & Filtering", "Joins"]], ["Advanced SQL", ["Aggregations & Grouping", "Subqueries"]], ["SQL in Practice", ["Indexes & Optimization", "Stored Procedures"]]] },
  { id: "windows", name: "Windows", icon: "WN", cat: "computer-it", desc: "Windows operating system: desktop, files, settings and administration.", exams: ["fpsc", "ppsc", "nts"],
    ch: [["Windows Fundamentals", ["Desktop & Files", "Settings & Control Panel"]], ["Administration", ["User Accounts", "Networking & Sharing"]]] },
  { id: "linux", name: "Linux", icon: "LX", cat: "computer-it", desc: "Linux command line, file system, administration and shell scripting.", exams: ["ib", "fpsc", "nts"],
    ch: [["Linux Fundamentals", ["Command Line Basics", "File System"]], ["Administration", ["Processes & Permissions", "Package Management"]], ["Shell Scripting", ["Scripting Basics", "Automation"]]] },
  { id: "html", name: "HTML", icon: "HT", cat: "computer-it", desc: "HyperText Markup Language: structure, forms, media and semantic markup.", exams: ["ib", "fpsc", "nts"],
    ch: [["HTML Fundamentals", ["Document Structure", "Text & Links"]], ["Forms & Media", ["Forms", "Media Elements"]], ["Semantic HTML", ["Semantic Tags", "Accessibility in HTML"]]] },
  { id: "css", name: "CSS", icon: "CS", cat: "computer-it", desc: "Cascading Style Sheets: selectors, layout, flexbox, grid and responsive design.", exams: ["ib", "fpsc", "nts"],
    ch: [["CSS Fundamentals", ["Selectors & Box Model", "Colors & Typography"]], ["Layout", ["Flexbox", "Grid"]], ["Responsive Design", ["Media Queries", "Responsive Techniques"]]] },
  { id: "javascript", name: "JavaScript", icon: "JS", cat: "computer-it", desc: "JavaScript fundamentals, DOM, events, ES6+ and async programming.", exams: ["ib", "fpsc", "nts"],
    ch: [["JS Fundamentals", ["Variables & Types", "Functions & Scope"]], ["DOM & Events", ["DOM Manipulation", "Events & Handlers"]], ["Modern JS", ["ES6+ Features", "Async & Promises"]]] },
  { id: "typescript", name: "TypeScript", icon: "TS", cat: "computer-it", desc: "TypeScript types, interfaces, generics and compilation.", exams: ["ib", "fpsc"],
    ch: [["TS Fundamentals", ["Types & Interfaces", "Generics"]], ["TS in Practice", ["Compilation & Config", "TypeScript with React"]]] },
  { id: "bootstrap", name: "Bootstrap", icon: "BT", cat: "computer-it", desc: "Bootstrap grid system, components, utilities and theming.", exams: ["ib", "fpsc", "nts"],
    ch: [["Bootstrap Basics", ["Grid System", "Components"]], ["Utilities & Theming", ["Utility Classes", "Customization"]]] },
  { id: "tailwind-css", name: "Tailwind CSS", icon: "TW", cat: "computer-it", desc: "Tailwind utility classes, layout utilities and responsive design.", exams: ["ib", "fpsc"],
    ch: [["Tailwind Basics", ["Utility Classes", "Layout Utilities"]], ["Design & Responsive", ["Responsive Design", "Theming"]]] },
  { id: "react", name: "React", icon: "RE", cat: "computer-it", desc: "React components, props, state, hooks and the React ecosystem.", exams: ["ib", "fpsc", "nts"],
    ch: [["React Fundamentals", ["Components & Props", "State & Hooks"]], ["React in Practice", ["Events & Forms", "Lists & Keys"]], ["Ecosystem", ["React Router", "State Management"]]] },
  { id: "next-js", name: "Next.js", icon: "NX", cat: "computer-it", desc: "Next.js pages, routing, data fetching and production features.", exams: ["ib", "fpsc"],
    ch: [["Next.js Fundamentals", ["Pages & Routing", "Data Fetching"]], ["Production Features", ["SSR & SSG", "API Routes"]]] },
  { id: "vue-js", name: "Vue.js", icon: "VU", cat: "computer-it", desc: "Vue template syntax, components, composition API and router.", exams: ["ib", "fpsc"],
    ch: [["Vue Fundamentals", ["Template Syntax", "Components"]], ["Vue Ecosystem", ["Composition API", "Vue Router"]]] },
  { id: "angular", name: "Angular", icon: "AG", cat: "computer-it", desc: "Angular components, modules, templates, services and dependency injection.", exams: ["ib", "fpsc"],
    ch: [["Angular Fundamentals", ["Components & Modules", "Templates & Directives"]], ["Services & DI", ["Services", "Dependency Injection"]]] },
  { id: "node-js", name: "Node.js", icon: "NO", cat: "computer-it", desc: "Node.js event loop, modules, npm and backend development.", exams: ["ib", "fpsc"],
    ch: [["Node Fundamentals", ["Event Loop", "Modules & NPM"]], ["Backend Development", ["HTTP Servers", "File System"]]] },
  { id: "express-js", name: "Express.js", icon: "EX", cat: "computer-it", desc: "Express routing, middleware, templates and error handling.", exams: ["ib", "fpsc"],
    ch: [["Express Fundamentals", ["Routing", "Middleware"]], ["Express in Practice", ["Templates", "Error Handling"]]] },
  { id: "php", name: "PHP", icon: "PH", cat: "computer-it", desc: "PHP syntax, arrays, strings, forms, sessions and database access.", exams: ["ib", "fpsc", "nts"],
    ch: [["PHP Fundamentals", ["Syntax & Variables", "Arrays & Strings"]], ["PHP Web", ["Forms & Sessions", "Database Access"]]] },
  { id: "laravel", name: "Laravel", icon: "LA", cat: "computer-it", desc: "Laravel routing, controllers, Blade, Eloquent ORM and authentication.", exams: ["ib", "fpsc"],
    ch: [["Laravel Fundamentals", ["Routing & Controllers", "Blade Templates"]], ["Eloquent & Auth", ["Eloquent ORM", "Authentication"]]] },
  { id: "python", name: "Python", icon: "PY", cat: "computer-it", desc: "Python syntax, data structures, functions, modules and libraries.", exams: ["ib", "fpsc", "nts"],
    ch: [["Python Fundamentals", ["Syntax & Data Types", "Control Flow"]], ["Data Structures", ["Lists & Dictionaries", "Functions & Modules"]], ["Python Ecosystem", ["File Handling", "Popular Libraries"]]] },
  { id: "django", name: "Django", icon: "DJ", cat: "computer-it", desc: "Django models, ORM, views, URLs, templates, forms and admin.", exams: ["ib", "fpsc"],
    ch: [["Django Fundamentals", ["Models & ORM", "Views & URLs"]], ["Django Features", ["Templates & Forms", "Admin & Auth"]]] },
  { id: "flask", name: "Flask", icon: "FL", cat: "computer-it", desc: "Flask app structure, routes, templates, forms and REST APIs.", exams: ["ib", "fpsc"],
    ch: [["Flask Fundamentals", ["App & Routes", "Templates"]], ["Flask Features", ["Forms & Validation", "REST with Flask"]]] },
  { id: "java", name: "Java", icon: "JV", cat: "computer-it", desc: "Java syntax, OOP, collections, exceptions and multithreading.", exams: ["ib", "fpsc", "nts"],
    ch: [["Java Fundamentals", ["Syntax & Types", "OOP Concepts"]], ["Java APIs", ["Collections", "Exceptions"]], ["Advanced Java", ["Streams & Lambdas", "Multithreading"]]] },
  { id: "spring-boot", name: "Spring Boot", icon: "SB", cat: "computer-it", desc: "Spring dependency injection, starters, REST controllers and JPA.", exams: ["ib", "fpsc"],
    ch: [["Spring Basics", ["Dependency Injection", "Spring Boot Starters"]], ["Web & Data", ["REST Controllers", "JPA & Data"]]] },
  { id: "c", name: "C Programming", icon: "CP", cat: "computer-it", desc: "C syntax, pointers, arrays, functions and memory management.", exams: ["ib", "fpsc", "ecat"],
    ch: [["C Fundamentals", ["Syntax & Data Types", "Pointers & Arrays"]], ["C in Practice", ["Functions", "Memory Management"]]] },
  { id: "cpp", name: "C++", icon: "C+", cat: "computer-it", desc: "C++ classes, inheritance, templates, STL and memory management.", exams: ["ib", "fpsc", "ecat"],
    ch: [["C++ Fundamentals", ["Classes & Objects", "Inheritance"]], ["C++ Features", ["Templates & STL", "Memory & Pointers"]]] },
  { id: "csharp", name: "C#", icon: "C#", cat: "computer-it", desc: "C# syntax, OOP, LINQ and async programming.", exams: ["ib", "fpsc"],
    ch: [["C# Fundamentals", ["Syntax & Types", "OOP in C#"]], ["C# Ecosystem", ["LINQ", "Async & Tasks"]]] },
  { id: "dotnet", name: ".NET", icon: "DN", cat: "computer-it", desc: ".NET runtime, ASP.NET Core, EF Core and middleware.", exams: ["ib", "fpsc"],
    ch: [["NET Fundamentals", ["NET Runtime", "ASP.NET Core"]], ["NET Features", ["EF Core", "Middleware & Services"]]] },
  { id: "go", name: "Go", icon: "GO", cat: "computer-it", desc: "Go syntax, functions, packages, goroutines and interfaces.", exams: ["ib", "fpsc"],
    ch: [["Go Fundamentals", ["Syntax & Types", "Functions & Packages"]], ["Go Concurrency", ["Goroutines & Channels", "Interfaces"]]] },
  { id: "rust", name: "Rust", icon: "RS", cat: "computer-it", desc: "Rust ownership, borrowing, structs, traits and error handling.", exams: ["ib", "fpsc"],
    ch: [["Rust Fundamentals", ["Ownership & Borrowing", "Syntax & Types"]], ["Rust in Practice", ["Structs & Traits", "Error Handling"]]] },
  { id: "git-github", name: "Git & GitHub", icon: "GT", cat: "computer-it", desc: "Git repositories, branches, merging and GitHub collaboration.", exams: ["ib", "fpsc"],
    ch: [["Git Basics", ["Repositories & Commits", "Branches & Merging"]], ["GitHub Workflow", ["Remotes & Pull Requests", "Collaboration"]]] },
  { id: "docker", name: "Docker", icon: "DK", cat: "computer-it", desc: "Docker images, containers, Dockerfile, volumes and Compose.", exams: ["ib", "fpsc"],
    ch: [["Docker Basics", ["Images & Containers", "Dockerfile"]], ["Docker in Practice", ["Volumes & Networks", "Docker Compose"]]] },
  { id: "kubernetes", name: "Kubernetes", icon: "K8", cat: "computer-it", desc: "Kubernetes pods, deployments, services, config and scaling.", exams: ["ib", "fpsc"],
    ch: [["K8s Fundamentals", ["Pods & Deployments", "Services"]], ["K8s Operations", ["ConfigMaps & Secrets", "Scaling"]]] },
  { id: "rest-api", name: "REST API", icon: "RA", cat: "computer-it", desc: "REST fundamentals, HTTP, API design, versioning and security.", exams: ["ib", "fpsc"],
    ch: [["REST Fundamentals", ["HTTP & Resources", "Status Codes"]], ["API Design", ["Versioning", "API Security"]]] },
  { id: "graphql", name: "GraphQL", icon: "GQ", cat: "computer-it", desc: "GraphQL schema, types, queries, mutations, resolvers and subscriptions.", exams: ["ib", "fpsc"],
    ch: [["GraphQL Fundamentals", ["Schema & Types", "Queries & Mutations"]], ["GraphQL in Practice", ["Resolvers", "Subscriptions"]]] },
  { id: "mdcat", name: "MDCAT", icon: "MD", cat: "entry-tests", desc: "Medical & Dental College Admission Test: biology, chemistry, physics and English.", exams: ["mdcat"],
    ch: [["MDCAT Biology", ["Cell & Molecular Biology", "Human Physiology"]], ["MDCAT Chemistry & Physics", ["Organic Chemistry", "Mechanics & Electricity"]]] },
  { id: "ecat", name: "ECAT", icon: "EC", cat: "entry-tests", desc: "Engineering College Admission Test: mathematics, physics and chemistry.", exams: ["ecat"],
    ch: [["ECAT Mathematics", ["Algebra & Functions", "Calculus Basics"]], ["ECAT Physics & Chemistry", ["Physics Fundamentals", "Chemistry Fundamentals"]]] },
  { id: "lat", name: "LAT", icon: "LT", cat: "entry-tests", desc: "Law Admission Test: English, Islamic studies and general knowledge.", exams: ["lat"],
    ch: [["LAT English", ["Grammar & Vocabulary", "Essay & Comprehension"]], ["LAT Islamic Studies & GK", ["Islamic Studies", "Pakistan GK"]]] },
  { id: "gat", name: "GAT", icon: "GA", cat: "entry-tests", desc: "Graduate Assessment Test: quantitative, verbal and analytical reasoning.", exams: ["gat"],
    ch: [["GAT Quantitative", ["Arithmetic & Algebra", "Data Sufficiency"]], ["GAT Verbal", ["Comprehension", "Critical Thinking"]]] },
  { id: "gre", name: "GRE", icon: "GE", cat: "entry-tests", desc: "Graduate Record Examination: verbal reasoning and quantitative reasoning.", exams: ["gre"],
    ch: [["GRE Verbal", ["Text Completion", "Sentence Equivalence"]], ["GRE Quant", ["Arithmetic", "Algebra & Geometry"]]] },
  { id: "ielts", name: "IELTS", icon: "IL", cat: "entry-tests", desc: "International English Language Testing System: all four skills.", exams: ["ielts"],
    ch: [["IELTS Listening & Speaking", ["Listening Skills", "Speaking Tasks"]], ["IELTS Reading & Writing", ["Reading Strategies", "Task 1 & 2 Writing"]]] },
  { id: "toefl", name: "TOEFL", icon: "TF", cat: "entry-tests", desc: "Test of English as a Foreign Language: reading, listening, speaking and writing.", exams: ["toefl"],
    ch: [["TOEFL Reading & Listening", ["Reading Comprehension", "Listening Skills"]], ["TOEFL Speaking & Writing", ["Speaking Tasks", "Integrated Writing"]]] },
  { id: "sat", name: "SAT", icon: "ST", cat: "entry-tests", desc: "Scholastic Assessment Test: reading, writing & language and math.", exams: ["sat"],
    ch: [["SAT Reading & Writing", ["Reading Passages", "Writing & Language"]], ["SAT Math", ["Algebra", "Problem Solving & Data"]]] }
];

/* ---------- references.json (confident official/official-doc links only) ---------- */
const REFERENCES = {
  "python": [{ title: "Python Documentation", url: "https://docs.python.org/3/" }],
  "javascript": [{ title: "MDN Web Docs - JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }],
  "html": [{ title: "MDN Web Docs - HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }],
  "css": [{ title: "MDN Web Docs - CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" }],
  "react": [{ title: "React Documentation", url: "https://react.dev/" }],
  "node-js": [{ title: "Node.js Documentation", url: "https://nodejs.org/docs/" }],
  "laravel": [{ title: "Laravel Documentation", url: "https://laravel.com/docs/" }],
  "django": [{ title: "Django Documentation", url: "https://docs.djangoproject.com/" }],
  "spring-boot": [{ title: "Spring Boot Reference", url: "https://spring.io/projects/spring-boot" }],
  "rust": [{ title: "The Rust Book", url: "https://doc.rust-lang.org/book/" }],
  "go": [{ title: "Go Documentation", url: "https://go.dev/doc/" }],
  "docker": [{ title: "Docker Documentation", url: "https://docs.docker.com/" }],
  "kubernetes": [{ title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/" }],
  "graphql": [{ title: "GraphQL Learn", url: "https://graphql.org/learn/" }],
  "typescript": [{ title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }],
  "git-github": [{ title: "Git Documentation", url: "https://git-scm.com/doc/" }],
  "gre": [{ title: "ETS - GRE", url: "https://www.ets.org/gre" }],
  "toefl": [{ title: "ETS - TOEFL", url: "https://www.ets.org/toefl" }],
  "ielts": [{ title: "IELTS Official", url: "https://www.ielts.org/" }],
  "sat": [{ title: "College Board - SAT", url: "https://www.collegeboard.org/sat" }],
  "vocabulary": [{ title: "Merriam-Webster", url: "https://www.merriam-webster.com/" }],
  "grammar": [{ title: "English Grammar Guide", url: "https://en.wikipedia.org/wiki/English_grammar" }]
};

/* ---------- exam -> subjects to extend ---------- */
const EXAM_SUBJECTS = {
  "pma": ["iq", "non-verbal-reasoning", "verbal-reasoning", "general-knowledge", "everyday-science"],
  "issb": ["non-verbal-reasoning", "logical-reasoning", "iq", "psychology"],
  "punjab-police": ["general-knowledge", "iq", "logical-reasoning", "everyday-science", "pakistan-affairs"],
  "fia-inspector": ["general-knowledge", "current-affairs", "law", "computer-science", "english"],
  "anf": ["general-knowledge", "chemistry", "computer-science", "islamic-studies"],
  "wapda": ["electrical-eng", "mechanical-eng", "civil-eng", "computer-science", "programming", "mathematics"],
  "fbr": ["accounting", "finance", "economics", "statistics", "law", "computer-science"],
  "sbp": ["economics", "finance", "accounting", "statistics", "business-admin"],
  "banking": ["finance", "accounting", "economics", "business-admin", "commerce", "computer-science"]
};

/* ---------- execute ---------- */

/* 1. exams */
let examOrder = Math.max(...exams.map((e) => e.order || 0));
for (const ne of NEW_EXAMS) {
  if (examIds.has(ne.id)) { warn(`exam ${ne.id} already exists, skipping`); continue; }
  exams.push({ id: ne.id, name: ne.name, fullName: ne.fullName, category: ne.category, description: ne.description, site: ne.site, order: ++examOrder });
}
write("exams.json", exams);
log(`exams: ${exams.length}`);

/* 2. category */
let newCat = null;
if (!catIds.has(NEW_CATEGORY.id)) {
  newCat = { ...NEW_CATEGORY };
  categories.push(newCat);
  log(`category added: ${NEW_CATEGORY.id}`);
} else {
  newCat = categories.find((c) => c.id === NEW_CATEGORY.id);
  log(`category ${NEW_CATEGORY.id} already exists`);
}

/* 3. subjects + chapters + topics */
let topicN = Math.max(...topics.map((t) => { const n = parseInt(String(t.id).replace("t-", ""), 10); return isNaN(n) ? 0 : n; }));
let subjOrder = Math.max(...subjects.map((s) => s.order || 0));
const usedChapterIds = new Set(chapters.map((c) => c.id));
let addedSubj = 0, addedChap = 0, addedTopic = 0;

for (const ns of NEW_SUBJECTS) {
  if (subjIds.has(ns.id)) { warn(`subject ${ns.id} already exists, skipping`); continue; }
  const subj = { id: ns.id, name: ns.name, icon: ns.icon, category: ns.cat, description: ns.desc, exams: ns.exams, order: ++subjOrder, status: "active" };
  subjects.push(subj);
  addedSubj++;
  newCat.subjects.push(ns.id);

  ns.ch.forEach(([chName, topicNames], ci) => {
    let chId = `${ns.id}-${chName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    let n = 0;
    while (usedChapterIds.has(chId)) { n++; chId = chId + "-" + n; }
    usedChapterIds.add(chId);
    chapters.push({ id: chId, subject: ns.id, name: chName, description: "", order: ci + 1 });
    addedChap++;
    topicNames.forEach((tn, ti) => {
      topicN++;
      topics.push({ id: `t-${topicN}`, chapter: chId, name: tn, subtopics: ["fundamentals", "practice questions"], order: ti + 1 });
      addedTopic++;
    });
  });
}
write("subjects.json", subjects);
write("chapters.json", chapters);
write("topics.json", topics);
write("categories.json", categories);

/* 4. extend subject exams */
for (const [ex, subjList] of Object.entries(EXAM_SUBJECTS)) {
  if (!examIds.has(ex) && !exams.some((e) => e.id === ex)) { warn(`exam ${ex} unknown`); continue; }
  for (const sid of subjList) {
    const s = subjects.find((x) => x.id === sid);
    if (s && !s.exams.includes(ex)) { s.exams.push(ex); }
  }
}
write("subjects.json", subjects);

/* 5. references.json */
if (fs.existsSync(path.join("data", "references.json"))) warn("references.json already exists, skipping (did not overwrite)");
else {
  write("references.json", REFERENCES);
  log("references.json created");
}

log(`\nSUMMARY: exams ${29} -> ${exams.length}, categories ${15} -> ${categories.length}, subjects ${72} -> ${subjects.length}, chapters ${221} -> ${chapters.length}, topics ${361} -> ${topics.length}`);
log(`added subjects: ${addedSubj}, chapters: ${addedChap}, topics: ${addedTopic}`);
