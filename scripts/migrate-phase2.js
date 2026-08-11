/* Phase 2 migration - expands taxonomy without removing existing data.
   Run: node scripts/migrate-phase2.js   (safe to run once) */
const fs = require("fs");
const path = require("path");
const D = (f) => path.join(__dirname, "..", "data", f);
const read = (f) => JSON.parse(fs.readFileSync(D(f), "utf8"));
const write = (f, a) => fs.writeFileSync(D(f), JSON.stringify(a, null, 1), "utf8");

/* ---------- 1. exams.json (professional hierarchy) ---------- */
const exams = [
  { id: "css", name: "CSS", fullName: "Central Superior Services (CSS)", category: "central", description: "Central superior services exam conducted by FPSC for federal bureaucracy.", site: "https://fpsc.gov.pk", order: 1 },
  { id: "pms", name: "PMS", fullName: "Provincial Management Services (PMS)", category: "provincial", description: "Provincial management services exam for provincial civil servants.", site: "", order: 2 },
  { id: "fpsc", name: "FPSC", fullName: "Federal Public Service Commission", category: "central", description: "Federal recruitment body for civil services and federal posts.", site: "https://fpsc.gov.pk", order: 3 },
  { id: "ppsc", name: "PPSC", fullName: "Punjab Public Service Commission", category: "provincial", description: "Punjab's recruitment body for provincial government posts.", site: "https://ppsc.gop.pk", order: 4 },
  { id: "spsc", name: "SPSC", fullName: "Sindh Public Service Commission", category: "provincial", description: "Sindh's recruitment body for provincial government posts.", site: "https://spsc.gov.pk", order: 5 },
  { id: "kppsc", name: "KPPSC", fullName: "Khyber Pakhtunkhwa Public Service Commission", category: "provincial", description: "Khyber Pakhtunkhwa's recruitment body for provincial posts.", site: "https://kppsc.gov.pk", order: 6 },
  { id: "bpsc", name: "BPSC", fullName: "Balochistan Public Service Commission", category: "provincial", description: "Balochistan's recruitment body for provincial government posts.", site: "https://bpsc.gob.pk", order: 7 },
  { id: "ajkpsc", name: "AJKPSC", fullName: "Azad Jammu & Kashmir Public Service Commission", category: "provincial", description: "AJK's public service commission for provincial posts.", site: "https://ajkpsc.gkp.pk", order: 8 },
  { id: "nts", name: "NTS", fullName: "National Testing Service", category: "testing-agencies", description: "Nationwide testing agency for recruitment and admission tests.", site: "https://nts.org.pk", order: 9 },
  { id: "ots", name: "OTS", fullName: "Open Testing Service", category: "testing-agencies", description: "Open testing service for recruitment tests across Pakistan.", site: "https://ots.org.pk", order: 10 },
  { id: "cts", name: "CTS", fullName: "Combined Testing Service", category: "testing-agencies", description: "Combined testing service for provincial recruitment tests.", site: "", order: 11 },
  { id: "pts", name: "PTS", fullName: "Pakistan Testing Service", category: "testing-agencies", description: "Pakistan testing service for government recruitment tests.", site: "https://pts.org.pk", order: 12 },
  { id: "etea", name: "ETEA", fullName: "Educational Testing and Evaluation Agency", category: "education", description: "Khyber Pakhtunkhwa's testing agency for educators and engineering admissions.", site: "https://etea.edu.pk", order: 13 },
  { id: "educators", name: "Educators", fullName: "Educators (Teachers Recruitment)", category: "education", description: "Recruitment tests for teachers, lecturers and education department posts.", site: "", order: 14 },
  { id: "lecturer", name: "Lecturer", fullName: "Lecturer & Subject Specialist", category: "education", description: "College and university lecturer recruitment with subject specialization.", site: "", order: 15 },
  { id: "police", name: "Police", fullName: "Police Recruitment (ASI / SI / Constable)", category: "law-enforcement", description: "Provincial police recruitment including constables, ASI and SI.", site: "", order: 16 },
  { id: "fia", name: "FIA", fullName: "Federal Investigation Agency", category: "law-enforcement", description: "Federal investigation agency recruitment for inspectors and sub-inspectors.", site: "https://fia.gov.pk", order: 17 },
  { id: "asf", name: "ASF", fullName: "Airports Security Force", category: "law-enforcement", description: "Airport security force recruitment for ASI and corporals.", site: "https://asf.gov.pk", order: 18 },
  { id: "nab", name: "NAB", fullName: "National Accountability Bureau", category: "law-enforcement", description: "Anti-corruption bureau recruitment for inspectors and officers.", site: "https://nab.gov.pk", order: 19 },
  { id: "ib", name: "IB", fullName: "Intelligence Bureau", category: "law-enforcement", description: "Intelligence bureau recruitment for assistant directors and staff.", site: "", order: 20 },
  { id: "army", name: "Army", fullName: "Pakistan Army (PA)", category: "forces", description: "Pakistan Army recruitment and ISSB selection tests.", site: "https://joinpakarmy.gov.pk", order: 21 },
  { id: "navy", name: "Navy", fullName: "Pakistan Navy (PN)", category: "forces", description: "Pakistan Navy recruitment for sailors, cadets and branches.", site: "https://joinpaknavy.gov.pk", order: 22 },
  { id: "paf", name: "PAF", fullName: "Pakistan Air Force", category: "forces", description: "Pakistan Air Force recruitment for airmen, officers and technical branches.", site: "https://joinpaf.gov.pk", order: 23 },
  { id: "motorway", name: "Motorway", fullName: "Motorway Police (NH&MP)", category: "law-enforcement", description: "National Highways and Motorway Police recruitment for MPOs.", site: "", order: 24 },
  { id: "railways", name: "Railways", fullName: "Pakistan Railways", category: "central", description: "Pakistan Railways recruitment for clerks, assistants and technical staff.", site: "https://railways.gov.pk", order: 25 },
  { id: "nadra", name: "NADRA", fullName: "NADRA", category: "central", description: "National Database & Registration Authority recruitment for junior executives and officers.", site: "https://nadra.gov.pk", order: 26 },
  { id: "mod", name: "MOD", fullName: "Ministry of Defence", category: "central", description: "Ministry of Defence and its civilian wings recruitment.", site: "https://mod.gov.pk", order: 27 },
  { id: "election-officer", name: "Election Officer", fullName: "Election Officer / RO / ARO", category: "central", description: "Election Commission of Pakistan posts including ROs and AROs.", site: "https://ecp.gov.pk", order: 28 },
  { id: "custom-exams", name: "Custom Exams", fullName: "Custom Exams", category: "custom", description: "User-created custom exam patterns stored locally in the browser.", site: "", order: 29 }
];
write("exams.json", exams);
console.log("exams.json:", exams.length, "exams");

/* ---------- 2. New subjects ---------- */
const EX_STD = ["ppsc", "fpsc", "nts", "ots", "cts", "pts", "spsc", "kppsc", "ajkpsc", "bpsc", "css", "pms", "educators", "police", "fia", "asf", "motorway", "railways", "nadra", "etea"];
const newSubjects = [
  { id: "environmental-science", name: "Environmental Science", icon: "EV", category: "science", description: "Ecosystems, pollution, climate change, conservation and environmental policy.", exams: ["ppsc", "fpsc", "nts", "css", "pms", "educators", "etea", "police", "fia", "nab"], order: 51, status: "active" },
  { id: "biotechnology", name: "Biotechnology", icon: "BT", category: "science", description: "DNA technology, genetic engineering, medical and agricultural biotechnology.", exams: ["ppsc", "fpsc", "nts", "educators", "etea", "css"], order: 52, status: "active" },
  { id: "electronics", name: "Electronics", icon: "EL", category: "engineering", description: "Semiconductors, digital electronics, logic gates and communication electronics.", exams: ["ppsc", "fpsc", "nts", "etea", "railways", "army", "navy", "paf"], order: 53, status: "active" },
  { id: "chemical-eng", name: "Chemical Engineering", icon: "CE", category: "engineering", description: "Process calculations, thermodynamics, unit operations and process industries.", exams: ["ppsc", "fpsc", "nts", "etea", "railways", "army", "navy", "paf"], order: 54, status: "active" },
  { id: "industrial-eng", name: "Industrial Engineering", icon: "IE", category: "engineering", description: "Operations management, quality control, work study and industrial safety.", exams: ["ppsc", "fpsc", "nts", "etea"], order: 55, status: "active" },
  { id: "environmental-eng", name: "Environmental Engineering", icon: "ENV", category: "engineering", description: "Water and wastewater treatment, air quality and solid waste management.", exams: ["ppsc", "fpsc", "nts", "etea", "css"], order: 56, status: "active" },
  { id: "mechatronics", name: "Mechatronics", icon: "MX", category: "engineering", description: "Sensors, actuators, control systems, robotics and industrial automation.", exams: ["ppsc", "fpsc", "nts", "etea", "army", "navy", "paf"], order: 57, status: "active" },
  { id: "anatomy", name: "Anatomy", icon: "AN", category: "medical", description: "Skeletal, muscular, nervous and organ system anatomy for medical entry tests.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 58, status: "active" },
  { id: "physiology", name: "Physiology", icon: "PHY", category: "medical", description: "Cardiovascular, respiratory, renal, endocrine and nerve-muscle physiology.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 59, status: "active" },
  { id: "pathology", name: "Pathology", icon: "PA", category: "medical", description: "Cell injury, inflammation, neoplasia and systemic pathology.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 60, status: "active" },
  { id: "microbiology", name: "Microbiology", icon: "MB", category: "medical", description: "Bacteriology, virology, mycology, parasitology and infectious diseases.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 61, status: "active" },
  { id: "biochemistry", name: "Biochemistry", icon: "BC", category: "medical", description: "Biomolecules, enzymes, metabolism and nucleic acids.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 62, status: "active" },
  { id: "histology", name: "Histology", icon: "HT", category: "medical", description: "Microscopic structure of basic tissues and organs.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 63, status: "active" },
  { id: "dental-materials", name: "Dental Materials", icon: "DM", category: "medical", description: "Restorative materials, cements, impressions and material properties.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 64, status: "active" },
  { id: "medicine", name: "Medicine", icon: "MD", category: "medical", description: "Internal medicine, cardiology, infectious and endocrine disorders.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 65, status: "active" },
  { id: "surgery", name: "Surgery", icon: "SU", category: "medical", description: "General surgery, acute abdomen, trauma care and burns.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 66, status: "active" },
  { id: "community-medicine", name: "Community Medicine", icon: "CM", category: "medical", description: "Epidemiology, biostatistics, primary health care and public health.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 67, status: "active" },
  { id: "auditing", name: "Auditing", icon: "AU", category: "management", description: "Audit concepts, process, standards, internal control and sampling.", exams: ["ppsc", "fpsc", "nts", "ots", "cts", "pts", "nab"], order: 68, status: "active" },
  { id: "supply-chain", name: "Supply Chain", icon: "SC", category: "management", description: "Logistics, inventory management, chain design and performance.", exams: ["ppsc", "fpsc", "nts", "ots", "cts", "pts"], order: 69, status: "active" },
  { id: "physical-education", name: "Physical Education", icon: "PE", category: "social-sciences", description: "Sports science, fitness, athletics, Olympics and sports institutions.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 70, status: "active" },
  { id: "forestry", name: "Forestry", icon: "FO", category: "agriculture", description: "Forest types, silviculture, conservation, wildlife and forest products.", exams: ["ppsc", "fpsc", "nts", "educators", "etea"], order: 71, status: "active" },
  { id: "essay", name: "Essay Writing", icon: "ES", category: "english-urdu", description: "Essay structure, planning, CSS and PMS essay themes (descriptive preparation).", exams: ["css", "pms"], order: 72, status: "reference" }
];
let subjects = read("subjects.json");
const existingIds = new Set(subjects.map((s) => s.id));
for (const s of newSubjects) if (!existingIds.has(s.id)) subjects.push(s);
console.log("subjects.json:", subjects.length, "subjects (was 50)");

/* ---------- 3. Add new exams to existing subjects ---------- */
const addExams = {
  nab_ib_mod: ["law", "constitution", "accounting", "finance", "commerce", "business-admin", "economics", "statistics", "english", "urdu", "general-knowledge", "current-affairs", "pakistan-affairs", "computer-science", "ms-office", "cyber-security", "reasoning", "programming", "software-eng", "networking", "operating-systems", "ai", "data-science", "cloud-computing", "mathematics"],
  election_officer: ["general-knowledge", "current-affairs", "pakistan-affairs", "constitution", "english", "urdu", "mathematics", "reasoning", "islamic-studies"]
};
for (const s of subjects) {
  if (!Array.isArray(s.exams)) s.exams = [];
  const add = [];
  if (addExams.nab_ib_mod.includes(s.id)) add.push("nab", "ib", "mod");
  if (addExams.election_officer.includes(s.id)) add.push("election-officer");
  for (const e of add) if (!s.exams.includes(e)) s.exams.push(e);
}
write("subjects.json", subjects);

/* ---------- 4. New chapters ---------- */
const newChapters = [
  { id: "env-ecosystems", subject: "environmental-science", name: "Ecosystems & Ecology", description: "Ecosystem structure, energy flow, biomes and biodiversity.", order: 1 },
  { id: "env-pollution", subject: "environmental-science", name: "Pollution & Climate", description: "Air and water pollution, climate change and ozone depletion.", order: 2 },
  { id: "env-conservation", subject: "environmental-science", name: "Conservation & Sustainability", description: "Renewable energy, conservation practices and environmental law.", order: 3 },
  { id: "bt-basics", subject: "biotechnology", name: "Biotechnology Fundamentals", description: "Recombinant DNA, PCR and genetic engineering tools.", order: 1 },
  { id: "bt-applications", subject: "biotechnology", name: "Biotechnology Applications", description: "Medical and agricultural applications of biotechnology.", order: 2 },
  { id: "elx-components", subject: "electronics", name: "Components & Circuits", description: "Semiconductors, transistors, op-amps and logic gates.", order: 1 },
  { id: "elx-systems", subject: "electronics", name: "Electronic Systems", description: "Digital electronics and communication electronics.", order: 2 },
  { id: "che-basics", subject: "chemical-eng", name: "Process Fundamentals", description: "Material and energy balance, reaction kinetics and thermodynamics.", order: 1 },
  { id: "che-processes", subject: "chemical-eng", name: "Unit Operations & Industries", description: "Distillation, absorption and major process industries.", order: 2 },
  { id: "ind-production", subject: "industrial-eng", name: "Production & Operations", description: "Operations management, quality and productivity.", order: 1 },
  { id: "ind-ergonomics", subject: "industrial-eng", name: "Ergonomics & Safety", description: "Work study, ergonomics and industrial safety.", order: 2 },
  { id: "enve-water", subject: "environmental-eng", name: "Water & Wastewater", description: "Drinking water treatment and wastewater treatment systems.", order: 1 },
  { id: "enve-air", subject: "environmental-eng", name: "Air & Solid Waste", description: "Air quality control and solid waste management.", order: 2 },
  { id: "mecx-intro", subject: "mechatronics", name: "Mechatronics Foundations", description: "Sensors, actuators and control systems.", order: 1 },
  { id: "mecx-robotics", subject: "mechatronics", name: "Robotics & Automation", description: "Robot anatomy, automation and industrial control.", order: 2 },
  { id: "ana-basics", subject: "anatomy", name: "Anatomy Basics", description: "Skeletal and muscular systems.", order: 1 },
  { id: "ana-organs", subject: "anatomy", name: "Organ Systems", description: "Thoracic, abdominal and nervous system anatomy.", order: 2 },
  { id: "phy-systems", subject: "physiology", name: "Body Systems Physiology", description: "Cardiovascular, respiratory, renal and endocrine function.", order: 1 },
  { id: "phy-nerve", subject: "physiology", name: "Nerve & Muscle Physiology", description: "Nerve conduction, synapses and muscle contraction.", order: 2 },
  { id: "pat-general", subject: "pathology", name: "General Pathology", description: "Cell injury, inflammation and neoplasia.", order: 1 },
  { id: "pat-systemic", subject: "pathology", name: "Systemic Pathology", description: "Cardiovascular, respiratory and infectious pathology.", order: 2 },
  { id: "mic-bacteria", subject: "microbiology", name: "Bacteriology", description: "Bacterial structure and bacterial diseases.", order: 1 },
  { id: "mic-viruses", subject: "microbiology", name: "Virology & Parasitology", description: "Viruses, fungi, protozoa and helminths.", order: 2 },
  { id: "bic-molecules", subject: "biochemistry", name: "Biomolecules & Enzymes", description: "Proteins, enzymes, carbohydrates and lipids.", order: 1 },
  { id: "bic-metabolism", subject: "biochemistry", name: "Metabolism & Genetics", description: "Energy metabolism and nucleic acids.", order: 2 },
  { id: "his-tissues", subject: "histology", name: "Basic Tissues", description: "Epithelial, connective, muscle and nerve tissue.", order: 1 },
  { id: "his-organs", subject: "histology", name: "Organ Histology", description: "GI, respiratory, renal and reproductive histology.", order: 2 },
  { id: "den-restorative", subject: "dental-materials", name: "Restorative Materials", description: "Amalgam, composites, cements and bonding.", order: 1 },
  { id: "den-properties", subject: "dental-materials", name: "Material Properties", description: "Physical properties and impression materials.", order: 2 },
  { id: "med-internal", subject: "medicine", name: "Internal Medicine", description: "Cardiology, respirology, gastroenterology and nephrology.", order: 1 },
  { id: "med-infectious", subject: "medicine", name: "Infectious & Endocrine", description: "Infectious diseases and endocrine disorders.", order: 2 },
  { id: "sur-general", subject: "surgery", name: "General Surgery", description: "Surgical principles and acute abdomen.", order: 1 },
  { id: "sur-trauma", subject: "surgery", name: "Trauma & Burns", description: "Trauma care and burn management.", order: 2 },
  { id: "com-epidemiology", subject: "community-medicine", name: "Epidemiology & Biostatistics", description: "Disease measurement and screening.", order: 1 },
  { id: "com-health", subject: "community-medicine", name: "Public Health", description: "Primary health care, immunization and environmental health.", order: 2 },
  { id: "aud-fundamentals", subject: "auditing", name: "Auditing Fundamentals", description: "Audit objectives, types, evidence and process.", order: 1 },
  { id: "aud-standards", subject: "auditing", name: "Standards & Internal Control", description: "Audit standards, ethics and internal control.", order: 2 },
  { id: "scm-logistics", subject: "supply-chain", name: "Logistics & Inventory", description: "Transportation, warehousing and inventory models.", order: 1 },
  { id: "scm-strategy", subject: "supply-chain", name: "Chain Strategy & Performance", description: "Network design, sourcing and performance measures.", order: 2 },
  { id: "ped-sports", subject: "physical-education", name: "Sports & Fitness", description: "Athletics, games and fitness components.", order: 1 },
  { id: "ped-olympics", subject: "physical-education", name: "Olympics & Institutions", description: "Olympic history and Pakistani sports institutions.", order: 2 },
  { id: "for-forests", subject: "forestry", name: "Forest Science", description: "Forest types, ecology and silviculture.", order: 1 },
  { id: "for-management", subject: "forestry", name: "Forest Management", description: "Conservation, wildlife and forest products.", order: 2 },
  { id: "ess-writing", subject: "essay", name: "Essay Writing Skills", description: "Structure, planning and presentation of essays.", order: 1 },
  { id: "ess-css", subject: "essay", name: "CSS & PMS Essays", description: "Past themes and strategies for descriptive papers.", order: 2 }
];
let chapters = read("chapters.json");
const chapterIds = new Set(chapters.map((c) => c.id));
for (const c of newChapters) if (!chapterIds.has(c.id)) chapters.push(c);
write("chapters.json", chapters);
console.log("chapters.json:", chapters.length, "chapters (was 150)");

/* ---------- 5. New topics with subtopics (t-272+) ---------- */
const T = (id, chapter, name, subtopics) => ({ id, chapter, name, subtopics, order: 1 });
let next = 272;
const newTopics = [
  T(`t-${next++}`, "env-ecosystems", "Ecosystem Structure & Energy Flow", ["food chains & webs", "trophic levels", "energy pyramids"]),
  T(`t-${next++}`, "env-ecosystems", "Biomes & Biodiversity", ["terrestrial biomes", "aquatic biomes", "biodiversity hotspots"]),
  T(`t-${next++}`, "env-pollution", "Air & Water Pollution", ["smog & particulates", "water contaminants", "acid rain"]),
  T(`t-${next++}`, "env-pollution", "Climate Change & Ozone", ["greenhouse effect", "ozone depletion", "carbon footprint"]),
  T(`t-${next++}`, "env-conservation", "Renewable Energy & Conservation", ["solar & wind", "hydel & biomass", "energy efficiency"]),
  T(`t-${next++}`, "env-conservation", "Environmental Law & SDGs", ["EPA Pakistan", "sustainable development goals", "EIA"]),
  T(`t-${next++}`, "bt-basics", "DNA Technology", ["recombinant DNA", "PCR", "gel electrophoresis"]),
  T(`t-${next++}`, "bt-basics", "Genetic Engineering", ["GMOs", "gene editing", "CRISPR"]),
  T(`t-${next++}`, "bt-applications", "Medical Biotechnology", ["recombinant vaccines", "insulin production", "gene therapy"]),
  T(`t-${next++}`, "bt-applications", "Agricultural Biotechnology", ["BT crops", "tissue culture", "golden rice"]),
  T(`t-${next++}`, "elx-components", "Semiconductors", ["p-n junction", "doping", "transistors"]),
  T(`t-${next++}`, "elx-components", "Op-Amps & Logic Gates", ["operational amplifiers", "basic gates", "combinational logic"]),
  T(`t-${next++}`, "elx-systems", "Digital Electronics", ["flip-flops", "counters", "registers"]),
  T(`t-${next++}`, "elx-systems", "Communication Electronics", ["modulation", "antennas", "radar"]),
  T(`t-${next++}`, "che-basics", "Material & Energy Balance", ["units & conversion", "material balance", "energy balance"]),
  T(`t-${next++}`, "che-basics", "Kinetics & Reactors", ["reaction order", "reactor types", "catalysts"]),
  T(`t-${next++}`, "che-processes", "Unit Operations", ["distillation", "absorption", "drying"]),
  T(`t-${next++}`, "che-processes", "Process Industries", ["fertilizer", "cement", "petroleum refining"]),
  T(`t-${next++}`, "ind-production", "Operations Management", ["capacity planning", "scheduling", "inventory"]),
  T(`t-${next++}`, "ind-production", "Quality Management", ["TQM", "six sigma", "ISO 9000"]),
  T(`t-${next++}`, "ind-ergonomics", "Work Study", ["time study", "motion study", "productivity"]),
  T(`t-${next++}`, "ind-ergonomics", "Industrial Safety", ["hazard identification", "PPE", "fire safety"]),
  T(`t-${next++}`, "enve-water", "Water Treatment", ["sedimentation", "filtration", "disinfection"]),
  T(`t-${next++}`, "enve-water", "Wastewater Treatment", ["primary treatment", "secondary treatment", "tertiary treatment"]),
  T(`t-${next++}`, "enve-air", "Air Quality Control", ["pollutants", "control devices", "air quality standards"]),
  T(`t-${next++}`, "enve-air", "Solid Waste Management", ["landfilling", "recycling", "composting"]),
  T(`t-${next++}`, "mecx-intro", "Sensors & Actuators", ["transducers", "electric motors", "servos"]),
  T(`t-${next++}`, "mecx-intro", "Control Systems", ["open & closed loop", "PID control", "PLC"]),
  T(`t-${next++}`, "mecx-robotics", "Robotics", ["robot anatomy", "degrees of freedom", "grippers"]),
  T(`t-${next++}`, "mecx-robotics", "Automation", ["CNC machines", "SCADA", "industry 4.0"]),
  T(`t-${next++}`, "ana-basics", "Skeletal System", ["bones & classification", "joints", "skull"]),
  T(`t-${next++}`, "ana-basics", "Muscular System", ["muscle types", "major muscles", "tendons"]),
  T(`t-${next++}`, "ana-organs", "Thoracic & Abdominal Organs", ["heart & lungs", "liver & gallbladder", "kidney & spleen"]),
  T(`t-${next++}`, "ana-organs", "Nervous System", ["brain", "spinal cord", "cranial nerves"]),
  T(`t-${next++}`, "phy-systems", "Cardiovascular & Respiratory", ["cardiac cycle", "blood pressure", "breathing mechanics"]),
  T(`t-${next++}`, "phy-systems", "Renal & Endocrine", ["nephron function", "hormones", "homeostasis"]),
  T(`t-${next++}`, "phy-nerve", "Nerve Conduction", ["action potential", "synapses", "neurotransmitters"]),
  T(`t-${next++}`, "phy-nerve", "Muscle Physiology", ["contraction", "muscle types", "fatigue"]),
  T(`t-${next++}`, "pat-general", "Cell Injury & Inflammation", ["reversible injury", "acute inflammation", "chronic inflammation"]),
  T(`t-${next++}`, "pat-general", "Neoplasia", ["benign tumours", "malignancy", "metastasis"]),
  T(`t-${next++}`, "pat-systemic", "Cardiovascular & Respiratory Pathology", ["atherosclerosis", "myocardial infarction", "pneumonia"]),
  T(`t-${next++}`, "pat-systemic", "Infectious Pathology", ["bacterial infections", "viral infections", "fungal infections"]),
  T(`t-${next++}`, "mic-bacteria", "Bacterial Structure", ["cell wall", "gram staining", "capsules"]),
  T(`t-${next++}`, "mic-bacteria", "Bacterial Diseases", ["tuberculosis", "typhoid", "cholera"]),
  T(`t-${next++}`, "mic-viruses", "Virology", ["virus structure", "viral replication", "viral diseases"]),
  T(`t-${next++}`, "mic-viruses", "Fungi & Parasites", ["mycoses", "protozoa", "helminths"]),
  T(`t-${next++}`, "bic-molecules", "Proteins & Enzymes", ["amino acids", "enzyme kinetics", "enzyme inhibition"]),
  T(`t-${next++}`, "bic-molecules", "Carbohydrates & Lipids", ["monosaccharides", "fatty acids", "cholesterol"]),
  T(`t-${next++}`, "bic-metabolism", "Energy Metabolism", ["glycolysis", "Krebs cycle", "oxidative phosphorylation"]),
  T(`t-${next++}`, "bic-metabolism", "Nucleic Acids", ["DNA replication", "transcription", "translation"]),
  T(`t-${next++}`, "his-tissues", "Epithelial & Connective Tissue", ["epithelium types", "collagen", "cartilage"]),
  T(`t-${next++}`, "his-tissues", "Muscle & Nerve Tissue", ["muscle histology", "neurons", "neuroglia"]),
  T(`t-${next++}`, "his-organs", "GI & Respiratory Histology", ["stomach", "liver", "alveoli"]),
  T(`t-${next++}`, "his-organs", "Renal & Reproductive Histology", ["nephron histology", "testis", "ovary"]),
  T(`t-${next++}`, "den-restorative", "Amalgam & Composites", ["dental amalgam", "composite resins", "bonding agents"]),
  T(`t-${next++}`, "den-restorative", "Cements & Liners", ["glass ionomer", "zinc oxide eugenol", "cavity liners"]),
  T(`t-${next++}`, "den-properties", "Physical Properties", ["hardness", "strength", "thermal expansion"]),
  T(`t-${next++}`, "den-properties", "Impression Materials", ["alginate", "silicones", "impression wax"]),
  T(`t-${next++}`, "med-internal", "Cardiology & Respirology", ["hypertension", "ischaemic heart disease", "asthma"]),
  T(`t-${next++}`, "med-internal", "Gastro & Nephrology", ["peptic ulcer", "hepatitis", "chronic kidney disease"]),
  T(`t-${next++}`, "med-infectious", "Infectious Diseases", ["dengue", "malaria", "typhoid"]),
  T(`t-${next++}`, "med-infectious", "Endocrine Disorders", ["diabetes", "thyroid disorders", "adrenal disorders"]),
  T(`t-${next++}`, "sur-general", "Surgical Principles", ["asepsis", "wound healing", "sutures"]),
  T(`t-${next++}`, "sur-general", "Acute Abdomen", ["appendicitis", "cholecystitis", "bowel obstruction"]),
  T(`t-${next++}`, "sur-trauma", "Trauma Care", ["ATLS approach", "fractures", "head injury"]),
  T(`t-${next++}`, "sur-trauma", "Burns", ["burn classification", "fluid resuscitation", "grafting"]),
  T(`t-${next++}`, "com-epidemiology", "Epidemiology", ["incidence & prevalence", "outbreak investigation", "study designs"]),
  T(`t-${next++}`, "com-epidemiology", "Biostatistics & Screening", ["rates & ratios", "sensitivity & specificity", "screening tests"]),
  T(`t-${next++}`, "com-health", "Primary Health Care", ["PHC elements", "immunization", "maternal & child health"]),
  T(`t-${next++}`, "com-health", "Environmental & Occupational Health", ["occupational hazards", "safe water", "sanitation"]),
  T(`t-${next++}`, "aud-fundamentals", "Audit Concepts", ["audit objectives", "audit types", "audit evidence"]),
  T(`t-${next++}`, "aud-fundamentals", "Audit Process", ["planning", "fieldwork", "reporting"]),
  T(`t-${next++}`, "aud-standards", "Audit Standards & Ethics", ["ISA", "auditor independence", "code of ethics"]),
  T(`t-${next++}`, "aud-standards", "Internal Control", ["control environment", "tests of control", "audit sampling"]),
  T(`t-${next++}`, "scm-logistics", "Logistics", ["transportation", "warehousing", "distribution"]),
  T(`t-${next++}`, "scm-logistics", "Inventory Management", ["EOQ", "safety stock", "JIT"]),
  T(`t-${next++}`, "scm-strategy", "Chain Design & Sourcing", ["network design", "make or buy", "supplier selection"]),
  T(`t-${next++}`, "scm-strategy", "Performance & Trends", ["supply chain KPIs", "bullwhip effect", "reverse logistics"]),
  T(`t-${next++}`, "ped-sports", "Athletics & Games", ["track events", "field events", "team games"]),
  T(`t-${next++}`, "ped-sports", "Fitness Components", ["strength", "endurance", "flexibility"]),
  T(`t-${next++}`, "ped-olympics", "Olympics", ["modern games", "Olympic records", "Pakistan at Olympics"]),
  T(`t-${next++}`, "ped-olympics", "Sports Institutions", ["Pakistan Sports Board", "POA", "sports federations"]),
  T(`t-${next++}`, "for-forests", "Forest Types & Ecology", ["coniferous forests", "tropical forests", "mangroves"]),
  T(`t-${next++}`, "for-forests", "Silviculture", ["planting", "thinning", "harvesting"]),
  T(`t-${next++}`, "for-management", "Conservation & Wildlife", ["national parks", "wildlife protection", "deforestation"]),
  T(`t-${next++}`, "for-management", "Forest Products", ["timber", "non-timber products", "agroforestry"]),
  T(`t-${next++}`, "ess-writing", "Essay Structure", ["introduction", "body paragraphs", "conclusion"]),
  T(`t-${next++}`, "ess-writing", "Planning & Outlining", ["thesis statement", "brainstorming", "outlining"]),
  T(`t-${next++}`, "ess-css", "CSS Essay Paper", ["past essay topics", "presentation", "time management"]),
  T(`t-${next++}`, "ess-css", "Common Essay Themes", ["governance", "economy", "society & science"])
];
let topics = read("topics.json");
const topicIds = new Set(topics.map((t) => t.id));
const added = [];
for (const t of newTopics) if (!topicIds.has(t.id)) { topics.push(t); added.push(t.id); }
write("topics.json", topics);
console.log("topics.json:", topics.length, "topics (was 271), added", added.length);

/* ---------- 6. Categories update ---------- */
let categories = read("categories.json");
const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
if (!catById["agriculture"]) {
  categories.push({ id: "agriculture", name: "Agriculture & Forestry", description: "Agriculture, forestry and veterinary sciences.", icon: "AG", subjects: ["agriculture", "veterinary", "forestry"], order: 15 });
} else {
  catById["agriculture"].subjects = [...new Set([...catById["agriculture"].subjects, "forestry"])];
}
catById["medical"].subjects = [...new Set([...catById["medical"].subjects, "anatomy", "physiology", "pathology", "microbiology", "biochemistry", "histology", "dental-materials", "medicine", "surgery", "community-medicine"].filter((s) => s !== "agriculture" && s !== "veterinary"))];
catById["science"].subjects = [...new Set([...catById["science"].subjects, "environmental-science", "biotechnology"])];
catById["engineering"].subjects = [...new Set([...catById["engineering"].subjects, "electronics", "chemical-eng", "industrial-eng", "environmental-eng", "mechatronics"])];
catById["management"].subjects = [...new Set([...catById["management"].subjects, "auditing", "supply-chain"])];
catById["social-sciences"].subjects = [...new Set([...catById["social-sciences"].subjects, "physical-education"])];
catById["english-urdu"].subjects = [...new Set([...catById["english-urdu"].subjects, "essay"])];
write("categories.json", categories);
console.log("categories.json:", categories.length, "categories");

/* ---------- 7. programs.json (degree -> subjects) ---------- */
const programs = [
  { id: "mbbs", name: "MBBS", duration: "5 years", category: "medical", description: "Bachelor of Medicine & Bachelor of Surgery.", subjects: ["medicine", "surgery", "anatomy", "physiology", "pathology", "microbiology", "biochemistry", "community-medicine", "pharmacology"] },
  { id: "bds", name: "BDS", duration: "4 years", category: "medical", description: "Bachelor of Dental Surgery.", subjects: ["dental-materials", "anatomy", "physiology", "biochemistry", "histology", "pathology", "microbiology"] },
  { id: "dpt", name: "DPT", duration: "5 years", category: "medical", description: "Doctor of Physical Therapy.", subjects: ["physiology", "anatomy", "pathology", "physical-education"] },
  { id: "bs-nursing", name: "BS Nursing", duration: "4 years", category: "medical", description: "Bachelor of Science in Nursing.", subjects: ["nursing", "anatomy", "physiology", "pharmacology", "community-medicine", "microbiology"] },
  { id: "pharm-d", name: "Pharm-D", duration: "5 years", category: "medical", description: "Doctor of Pharmacy.", subjects: ["pharmacy", "biochemistry", "microbiology", "pathology", "medicine"] },
  { id: "bs-eng", name: "B.Sc Engineering", duration: "4 years", category: "engineering", description: "Bachelor of Engineering (all disciplines).", subjects: ["electrical-eng", "mechanical-eng", "civil-eng", "chemical-eng", "industrial-eng", "environmental-eng", "mechatronics", "electronics"] },
  { id: "bscs", name: "BSCS / BSIT", duration: "4 years", category: "computer-it", description: "Computer Science and Information Technology.", subjects: ["computer-science", "programming", "software-eng", "data-science", "ai", "networking", "operating-systems", "cyber-security", "cloud-computing"] },
  { id: "mba", name: "MBA / BBA", duration: "2-4 years", category: "management", description: "Business administration degrees.", subjects: ["business-admin", "finance", "accounting", "commerce", "supply-chain", "economics"] },
  { id: "llb", name: "LLB", duration: "5 years", category: "law", description: "Bachelor of Laws.", subjects: ["law", "constitution", "islamic-studies"] },
  { id: "b-ed", name: "B.Ed / M.Ed", duration: "1.5-4 years", category: "education", description: "Teaching qualifications.", subjects: ["pedagogy", "education", "psychology", "english-literature"] },
  { id: "bs-agriculture", name: "B.Sc Agriculture", duration: "4 years", category: "agriculture", description: "Agricultural sciences.", subjects: ["agriculture", "forestry", "environmental-science"] },
  { id: "dvm", name: "DVM", duration: "5 years", category: "agriculture", description: "Doctor of Veterinary Medicine.", subjects: ["veterinary", "anatomy", "physiology", "microbiology", "pathology"] }
];
write("programs.json", programs);
console.log("programs.json:", programs.length, "programs");

/* ---------- 8. mock_tests.json ---------- */
const mocks = [
  { id: "mock-ppsc-assistant-1", title: "PPSC Assistant - Mock Test 1", description: "Full-length simulated mock for PPSC Assistant following the official paper pattern with negative marking practice.", exam: "ppsc", subjects: ["general-knowledge", "current-affairs", "english", "urdu", "mathematics", "computer-science", "pakistan-affairs"], difficulty: "medium", totalQuestions: 50, durationMins: 45, negativeMarking: true, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mock-fpsc-css-1", title: "FPSC CSS PT - Mock Test 1", description: "Preliminary test mock covering General Science & Ability with current affairs.", exam: "css", subjects: ["everyday-science", "current-affairs", "general-knowledge", "pakistan-affairs", "islamic-studies", "constitution"], difficulty: "hard", totalQuestions: 60, durationMins: 60, negativeMarking: false, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mock-nts-gat-1", title: "NTS GAT - Mock Test 1", description: "Graduate Assessment Test mock - verbal, quantitative and analytical reasoning.", exam: "nts", subjects: ["english", "mathematics", "reasoning"], difficulty: "medium", totalQuestions: 40, durationMins: 40, negativeMarking: false, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mock-educators-1", title: "Educators - Mock Test 1", description: "Pedagogy plus subject knowledge mock for teaching posts.", exam: "educators", subjects: ["pedagogy", "education", "psychology", "english", "everyday-science"], difficulty: "medium", totalQuestions: 40, durationMins: 40, negativeMarking: true, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mock-computer-1", title: "Computer & IT - Mock Test 1", description: "IT fundamentals mock for computer operator and IT posts.", exam: "nts", subjects: ["computer-science", "ms-office", "programming", "networking", "operating-systems"], difficulty: "medium", totalQuestions: 40, durationMins: 35, negativeMarking: true, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mock-mixed-1", title: "Mixed General - Mock Test 1", description: "All-subject random challenge for a complete syllabus check.", exam: "custom-exams", subjects: [], difficulty: "hard", totalQuestions: 50, durationMins: 45, negativeMarking: true, status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" }
];
write("mock_tests.json", mocks);
console.log("mock_tests.json:", mocks.length, "mock tests");

/* ---------- 9. New papers ---------- */
let papers = read("papers.json");
const newPapers = [
  { id: "css-essay", exam: "css", title: "CSS Written - Essay Paper", description: "Descriptive essay paper - structure, argumentation and presentation (reference pattern).", subjects: ["essay", "english"], totalQuestions: 1, durationMins: 180, difficulty: "hard", status: "reference", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "css-precis", exam: "css", title: "CSS Written - Precis & Composition", description: "Descriptive paper on precis writing, composition and comprehension (reference pattern).", subjects: ["english", "essay"], totalQuestions: 1, durationMins: 180, difficulty: "hard", status: "reference", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "nab-inspector", exam: "nab", title: "NAB Inspector Test", description: "General knowledge, law, English and IT paper for NAB inspectors and officers.", subjects: ["general-knowledge", "current-affairs", "law", "constitution", "english", "computer-science", "accounting"], totalQuestions: 100, durationMins: 90, difficulty: "hard", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "ib-assistant", exam: "ib", title: "Intelligence Bureau (IB) Test", description: "General knowledge, current affairs, mental ability and English for IB staff.", subjects: ["general-knowledge", "current-affairs", "english", "reasoning", "pakistan-affairs", "islamic-studies"], totalQuestions: 100, durationMins: 90, difficulty: "hard", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "mod-general", exam: "mod", title: "MOD (Ministry of Defence) Test", description: "General ability and GK paper for MOD civilian posts.", subjects: ["general-knowledge", "current-affairs", "english", "mathematics", "pakistan-affairs"], totalQuestions: 100, durationMins: 90, difficulty: "medium", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "election-officer", exam: "election-officer", title: "Election Officer / RO / ARO Test", description: "Constitution, electoral laws, general knowledge and English for ECP posts.", subjects: ["constitution", "law", "general-knowledge", "current-affairs", "english", "pakistan-affairs"], totalQuestions: 100, durationMins: 90, difficulty: "medium", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "police-constable", exam: "police", title: "Punjab Police Constable Test", description: "General knowledge, Pakistan studies, Urdu and reasoning for constables.", subjects: ["pakistan-affairs", "general-knowledge", "islamic-studies", "urdu", "reasoning", "current-affairs"], totalQuestions: 100, durationMins: 90, difficulty: "easy", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "kppsc-junior-clerk", exam: "kppsc", title: "KPPSC Junior Clerk Test", description: "English, Urdu, math and computer basics for Khyber Pakhtunkhwa clerks.", subjects: ["english", "urdu", "mathematics", "computer-science", "ms-office"], totalQuestions: 100, durationMins: 90, difficulty: "easy", status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" }
];
const paperIds = new Set(papers.map((p) => p.id));
for (const p of newPapers) if (!paperIds.has(p.id)) papers.push(p);
write("papers.json", papers);
console.log("papers.json:", papers.length, "papers (was 32)");

/* ---------- 10. New quizzes ---------- */
let quizzes = read("quizzes.json");
const newQuizzes = [
  { id: "quiz-vocabulary-sprint", title: "Vocabulary Sprint", description: "60-second brain workout on synonyms, antonyms and word meanings.", subjects: ["english"], difficulty: "easy", totalQuestions: 10, durationMins: 5, tags: ["vocabulary", "synonyms", "antonyms"], status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "quiz-grammar-refresher", title: "Grammar Refresher", description: "Tenses, prepositions, articles and common errors to polish your English.", subjects: ["english"], difficulty: "medium", totalQuestions: 12, durationMins: 10, tags: ["grammar", "english"], status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "quiz-world-affairs", title: "World Current Affairs", description: "Global events, summits and international developments.", subjects: ["current-affairs"], difficulty: "medium", totalQuestions: 10, durationMins: 10, tags: ["world", "current affairs"], status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "quiz-analytical-reasoning", title: "Analytical Reasoning", description: "Syllogisms, puzzles and logical deductions for IQ tests.", subjects: ["reasoning"], difficulty: "hard", totalQuestions: 10, durationMins: 12, tags: ["reasoning", "analytical", "puzzles"], status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" },
  { id: "quiz-environmental", title: "Environmental Science", description: "Ecosystems, pollution, climate and conservation questions.", subjects: ["environmental-science"], difficulty: "medium", totalQuestions: 10, durationMins: 10, tags: ["environment", "climate", "ecology"], status: "active", createdDate: "2026-07-31", updatedDate: "2026-07-31" }
];
const quizIds = new Set(quizzes.map((z) => z.id));
for (const z of newQuizzes) if (!quizIds.has(z.id)) quizzes.push(z);
write("quizzes.json", quizzes);
console.log("quizzes.json:", quizzes.length, "quizzes (was 16)");

console.log("\nMigration complete.");
