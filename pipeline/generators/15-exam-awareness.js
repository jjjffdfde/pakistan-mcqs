/* ============================================================
   Generator file 15 — Exam-awareness content for the 44
   exam-preparation subjects. Authored original facts.
   Each exam: [fullName, conductingBody, sections, note]
   ============================================================ */
"use strict";
const L = require("../lib.js");

const EXAMS = {
  "css-exam": ["Central Superior Services", "FPSC", "compulsory and optional written papers", "CSS is the federal elite civil service exam"],
  pms: ["Provincial Management Services", "the respective Provincial Public Service Commission", "compulsory and optional written papers", "PMS mirrors CSS at the provincial level"],
  ppsc: ["Punjab Public Service Commission exams", "PPSC", "subject and general knowledge papers", "PPSC recruits Punjab government officers"],
  fpsc: ["Federal Public Service Commission exams", "FPSC", "subject and general knowledge papers", "FPSC recruits federal government officers"],
  kppsc: ["KP Public Service Commission exams", "KPPSC", "subject and general knowledge papers", "KPPSC recruits KP government officers"],
  spsc: ["Sindh Public Service Commission exams", "SPSC", "subject and general knowledge papers", "SPSC recruits Sindh government officers"],
  bpsc: ["Balochistan Public Service Commission exams", "BPSC", "subject and general knowledge papers", "BPSC recruits Balochistan government officers"],
  ajkpsc: ["Azad Kashmir Public Service Commission exams", "AJKPSC", "subject and general knowledge papers", "AJKPSC recruits AJK government officers"],
  nts: ["National Testing Service exams", "NTS", "verbal, quantitative and analytical sections", "NTS conducts recruitment and admission tests"],
  ots: ["Open Testing Service recruitment tests", "OTS", "subject and general knowledge papers", "OTS screens candidates for public-sector jobs"],
  cts: ["Common Testing Service recruitment tests", "CTS", "subject and general knowledge papers", "CTS conducts tests for public-sector jobs"],
  pts: ["Pakistan Testing Service recruitment tests", "PTS", "subject and general knowledge papers", "PTS conducts tests across the country"],
  educators: ["Educators recruitment tests", "provincial testing agencies", "professional and subject papers", "Educator tests screen school teachers"],
  lecturer: ["Lecturer recruitment tests", "the provincial public service commissions", "subject-specific papers", "Lecturer tests recruit college teachers"],
  "election-officer": ["Election Officer recruitment tests", "provincial public service commissions", "general and law papers", "Election officers serve the Election Commission"],
  army: ["Pakistan Army initial tests", "GHQ recruitment centres", "academic and intelligence tests", "Army tests precede ISSB selection"],
  navy: ["Pakistan Navy initial tests", "Navy recruitment centres", "academic and aptitude tests", "Navy tests include GKT and academics"],
  paf: ["Pakistan Air Force initial tests", "PAF recruitment centres", "academic and intelligence tests", "PAF tests include GKT and IQ items"],
  pma: ["PMA Long Course initial tests", "Army selection centres", "academic and physical tests", "PMA candidates pass initial and ISSB stages"],
  issb: ["ISSB selection tests", "the Inter Services Selection Board", "written, psychometric and interview stages", "ISSB runs a multi-stage officer selection process"],
  police: ["Police recruitment tests", "provincial police departments", "physical and written tests", "Police tests include physical and written MCQs"],
  "punjab-police": ["Punjab Police recruitment tests", "Punjab Police", "physical and written tests", "Punjab Police hires through physical and written stages"],
  "motorway-police": ["NH&MP Motorway Police recruitment", "the National Highways & Motorway Police", "physical and written tests", "NH&MP tests include written MCQs and physical checks"],
  fia: ["FIA recruitment tests", "the Federal Investigation Agency", "subject and general papers", "FIA recruits via written tests and interviews"],
  "fia-inspector": ["FIA Inspector recruitment tests", "the Federal Investigation Agency", "subject papers and interview", "FIA Inspector posts require written tests"],
  asf: ["ASF recruitment tests", "the Airport Security Force", "physical and written tests", "ASF hires through physical and written stages"],
  anf: ["ANF recruitment tests", "the Anti-Narcotics Force", "physical and written tests", "ANF recruitment includes written MCQs"],
  ib: ["IB recruitment tests", "the Intelligence Bureau", "aptitude and general papers", "IB tests are confidential in nature"],
  mod: ["MOD department recruitment tests", "the Ministry of Defence", "subject papers", "MOD hires through departmental tests"],
  nab: ["NAB recruitment tests", "the National Accountability Bureau", "subject and general papers", "NAB recruits via NTS-style tests"],
  railway: ["Pakistan Railways recruitment tests", "Pakistan Railways", "technical and general papers", "Railways hires drivers, staff and engineers"],
  wapda: ["WAPDA recruitment tests", "WAPDA", "technical and general papers", "WAPDA recruits engineers and staff"],
  nadra: ["NADRA recruitment tests", "NADRA", "IT and general papers", "NADRA recruits IT and clerical staff"],
  fbr: ["FBR recruitment tests", "the Federal Board of Revenue", "subject and taxation papers", "FBR hires customs and inland revenue staff"],
  sbp: ["SBP recruitment tests", "the State Bank of Pakistan", "quantitative, verbal and analytical papers", "SBP hires through its annual BPS-grade exams"],
  banking: ["Commercial bank recruitment tests", "individual banks through IBPs-style testing", "quantitative, verbal and general papers", "Banking tests follow IBPS-style patterns"],
  "rescue-1122": ["Rescue 1122 recruitment tests", "the Emergency Rescue Service 1122", "general and aptitude papers", "Rescue 1122 hires rescuers and emergency staff"],
  lesco: ["LESCO recruitment tests", "the Lahore Electric Supply Company", "technical and general papers", "LESCO hires for electric and administrative posts"],
  mepco: ["MEPCO recruitment tests", "the Multan Electric Power Company", "technical and general papers", "MEPCO hires for electric and administrative posts"],
  hesco: ["HESCO recruitment tests", "the Hyderabad Electric Supply Company", "technical and general papers", "HESCO hires for electric and administrative posts"],
  sepco: ["SEPCO recruitment tests", "the Sukkur Electric Power Company", "technical and general papers", "SEPCO hires for electric and administrative posts"],
  ssgc: ["SSGC recruitment tests", "the Sui Southern Gas Company", "technical and general papers", "SSGC hires for gas sector posts"],
  sngpl: ["SNGPL recruitment tests", "Sui Northern Gas Pipelines Limited", "technical and general papers", "SNGPL hires for gas sector posts"],
  "pakistan-post": ["Pakistan Post recruitment tests", "Pakistan Post (GPO)", "general and clerical papers", "Pakistan Post hires clerks and departmental staff"],
  teaching: ["Teaching jobs recruitment tests", "provincial education departments", "professional and subject papers", "Teaching tests screen school and college teachers"],
  sst: ["SST recruitment tests", "provincial education departments", "subject and professional papers", "SST posts teach at secondary level"],
  est: ["EST recruitment tests", "provincial education departments", "subject and professional papers", "EST posts teach at elementary level"],
  headmaster: ["Headmaster recruitment tests", "provincial education departments", "administration and pedagogy papers", "Headmasters lead school administration"],
  inspector: ["Inspector recruitment tests", "the hiring department", "subject and general papers", "Inspector posts are filled through written tests"],
  "sub-inspector": ["Sub Inspector recruitment tests", "the hiring department", "subject and general papers", "Sub Inspector posts are filled through written tests"],
  "custom-inspector": ["Custom Inspector recruitment tests", "Pakistan Customs (FBR)", "subject, taxation and general papers", "Custom Inspectors clear and audit imports"],
  "income-tax-inspector": ["Income Tax Inspector recruitment tests", "FBR Inland Revenue", "subject, taxation and general papers", "Income Tax Inspectors assess and collect taxes"],
  "assistant-director": ["Assistant Director recruitment tests", "the hiring department", "subject and general papers", "Assistant Director posts follow departmental testing"]
};

const allBodies = Object.values(EXAMS).map((e) => e[1]);
const allSections = Object.values(EXAMS).map((e) => e[2]);
const allNotes = Object.values(EXAMS).map((e) => e[3]);

module.exports = Object.entries(EXAMS).map(([id, [fullName, body, sections, note]]) => ({
  subjects: [id],
  name: `${fullName} — Pattern Awareness`,
  topics: ["Exam Pattern", "Conducting Authority"],
  tags: [id, "exam-awareness"],
  generate(rng, topicName) {
    const toFacts = (triples) => triples.map(([q, a, e]) => ({ q, a, e }));
    if (topicName === "Conducting Authority") {
      return L.factGenerator(
        toFacts([[`Which body conducts the ${fullName}?`, body, `${note}. The ${body} is the conducting authority for the ${fullName}.`]]),
        allBodies
      )(rng);
    }
    return L.factGenerator(
      toFacts([
        [`What is the full name of the ${id.toUpperCase()} exam?`, fullName, `${id.toUpperCase()} stands for ${fullName}.`],
        [`Which areas does the ${fullName} typically test?`, sections, `${fullName} commonly covers ${sections}, per the standard syllabus.`],
        [`Which of these describes the ${fullName}?`, note, `${note}, according to the standard pattern.`]
      ]),
      allNotes.concat(allSections).concat(Object.values(EXAMS).map((e) => e[0]))
    )(rng);
  }
}));
