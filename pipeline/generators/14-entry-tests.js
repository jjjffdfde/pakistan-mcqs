/* ============================================================
   Generator file 14 — Entry tests & exam-preparation subjects
   (mdcat, ecat, lat, gat, gre, ielts, toefl, sat + 44 exam subjects)
   Original pattern-awareness content.
   ============================================================ */
"use strict";
const L = require("../lib.js");

function makeGen(subjectId, chapterName, facts, extraTags = []) {
  const topics = Object.keys(facts);
  return {
    subjects: [subjectId],
    name: chapterName,
    topics,
    tags: [subjectId, ...extraTags],
    generate(rng, topicName) {
      const pool = facts[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(pool, [])(rng);
    }
  };
}

module.exports = [
  makeGen("mdcat", "MDCAT — Medical Admission", {
    "MDCAT Pattern": [
      ["Which body conducts MDCAT in Pakistan?", "Provincial medical universities (via UHS in Punjab)", "Each province conducts MDCAT through its medical universities."],
      ["How many sections does MDCAT have?", "Four (Biology, Chemistry, Physics, English + Logical Reasoning)", "MDCAT tests the PMC syllabus with four subject sections."],
      ["What is the total marks of MDCAT?", "200", "MDCAT carries 200 total marks."],
      ["Which subject has the highest weightage in MDCAT?", "Biology", "Biology carries the largest share of MDCAT marks."],
      ["Which test follows MDCAT for MBBS admission?", "merit calculation with FSc marks", "Admission merit combines MDCAT and FSc scores."],
      ["What does PMC stand for?", "Pakistan Medical Commission (now PM&DC)", "The regulator sets the MDCAT syllabus."],
      ["Is MDCAT MCQ-based?", "Yes, all questions are MCQs", "The test is fully multiple-choice."],
      ["Which province uses UHS as MDCAT authority?", "Punjab", "The University of Health Sciences organises Punjab's MDCAT."]
    ]
  }),
  makeGen("ecat", "ECAT — Engineering Admission", {
    "ECAT Pattern": [
      ["Which body conducts ECAT in Punjab?", "UET Lahore", "The University of Engineering and Technology runs Punjab's ECAT."],
      ["Which subjects does ECAT test?", "Mathematics, Physics, Chemistry, English", "ECAT covers the core FSc engineering subjects."],
      ["What is the total marks of ECAT?", "400", "ECAT carries 400 total marks."],
      ["Which section carries the most weight in ECAT?", "Mathematics", "Mathematics has the largest share of ECAT marks."],
      ["Which field is ECAT required for?", "engineering admissions", "ECAT scores admit students to engineering universities."],
      ["Is ECAT computer-based?", "Yes, it is computer-based", "ECAT is conducted on computers in test centres."],
      ["What is the duration of ECAT?", "100 minutes", "ECAT gives 100 minutes for 100 questions."]
    ]
  }),
  makeGen("lat", "L.A.T — Law Admission", {
    "LAT Pattern": [
      ["Which body conducts L.A.T in Pakistan?", "HEC (through universities)", "The Higher Education Commission administers the Law Admission Test."],
      ["What does L.A.T stand for?", "Law Admission Test", "LAT qualifies students for the LL.B (5-year) programme."],
      ["What is the total marks of L.A.T?", "100", "LAT carries 100 marks."],
      ["Which sections does L.A.T include?", "English, General Knowledge, Current Affairs, Islamiat, Pakistan Studies", "LAT tests five paper areas."],
      ["What is the passing score of L.A.T?", "50 out of 100", "Candidates need 50% to qualify."],
      ["Which degree does LAT lead to?", "LL.B (5-year)", "LAT admits students to the five-year law degree."]
    ]
  }),
  makeGen("gat", "GAT — Graduate Assessment", {
    "GAT Pattern": [
      ["Which body conducts GAT?", "NTS (National Testing Service)", "NTS administers the Graduate Assessment Test."],
      ["Which GAT type is for subject admission?", "GAT Subject", "GAT-Subject tests a chosen discipline."],
      ["Which GAT type is for MS/MPhil general?", "GAT General", "GAT-General measures verbal, quantitative and analytical skills."],
      ["How many questions does GAT General have?", "100", "GAT General has 100 MCQs."],
      ["What is the duration of GAT General?", "120 minutes", "Candidates get two hours."],
      ["Which section has the highest weight in GAT General?", "Verbal (English)", "Verbal reasoning carries 50% of GAT General."]
    ]
  }),
  makeGen("gre", "GRE — Graduate Record", {
    "GRE Pattern": [
      ["Who conducts the GRE?", "ETS", "Educational Testing Service runs the GRE."],
      ["Which sections does the GRE General test have?", "Verbal, Quantitative, Analytical Writing", "GRE General has three scored sections."],
      ["What is the GRE Quantitative score range?", "130-170", "Quantitative and Verbal each score 130-170."],
      ["What is the Analytical Writing score range?", "0-6", "Essays are scored in half-point steps."],
      ["Is the GRE computer-adaptive?", "Yes, section-adaptive", "The computer adapts section difficulty by performance."],
      ["Which GRE type tests a discipline?", "GRE Subject Tests", "Subject tests cover fields like physics and psychology."]
    ]
  }),
  makeGen("ielts", "IELTS — English Test", {
    "IELTS Pattern": [
      ["Which organisations own IELTS?", "British Council, IDP and Cambridge", "IELTS is jointly owned by the three bodies."],
      ["Which bands does IELTS score?", "0 to 9", "Overall bands are 0-9 in half-point steps."],
      ["Which four skills does IELTS test?", "Listening, Reading, Writing, Speaking", "IELTS assesses all four language skills."],
      ["Which IELTS version is for academic study?", "Academic", "IELTS Academic suits university entry."],
      ["Which IELTS version is for migration?", "General Training", "General Training suits work and migration."],
      ["How long is the IELTS Speaking test?", "11-14 minutes", "Speaking is a face-to-face interview."],
      ["How long does the IELTS Listening test take?", "30 minutes", "Listening has four parts with 40 questions."]
    ]
  }),
  makeGen("toefl", "TOEFL — English Test", {
    "TOEFL Pattern": [
      ["Who conducts the TOEFL?", "ETS", "Educational Testing Service runs the TOEFL."],
      ["What does TOEFL iBT stand for?", "Internet-Based Test", "The iBT is taken on computers over the internet."],
      ["What is the TOEFL score range?", "0 to 120", "Four sections of 30 points each total 120."],
      ["Which sections does TOEFL iBT have?", "Reading, Listening, Speaking, Writing", "The iBT has four scored sections."],
      ["How long is the TOEFL iBT?", "about 2 hours", "The shortened test runs about 2 hours."],
      ["What is the TOEFL PBT?", "Paper-Based Test", "The PBT is offered where internet testing is unavailable."]
    ]
  }),
  makeGen("sat", "SAT — College Assessment", {
    "SAT Pattern": [
      ["Who conducts the SAT?", "College Board", "The College Board runs the SAT."],
      ["What is the SAT score range?", "400-1600", "Two sections of 200-800 each total 1600."],
      ["Which sections does the digital SAT have?", "Reading & Writing, Math", "The digital SAT has two major sections."],
      ["How long is the digital SAT?", "2 hours 14 minutes", "The digital test is shorter than the paper version."],
      ["Is the SAT adaptive?", "Yes, module-adaptive", "The digital SAT adapts question difficulty per module."],
      ["What does the SAT Math section allow?", "a built-in calculator", "Desmos calculator is built into the app."]
    ]
  })
];
