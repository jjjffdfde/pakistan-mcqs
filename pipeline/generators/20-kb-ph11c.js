/* ============================================================
   Phase 11 — KB Pharmacology, Medicine, Surgery, Community
   Medicine, Public Health + new medical specialties.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const ml = (v) => Number(v).toLocaleString("en-US");

/* ---------------- PHARMACOLOGY ---------------- */
const pharmacology = {
  subjects: ["pharmacology"],
  chapter: "Pharmacology — Drugs and Actions (Phase 11)",
  tags: ["pharmacology", "deep-kb", "drug-classes", "adverse-effect"],
  topics: {
    "Drug Classes": [
      { kind: "fact", name: "drug class facts", note: "What each class does.",
        facts: [
          ["Which drug class relieves pain?", "Analgesics", "Analgesics like paracetamol and opioids reduce pain."],
          ["Which drug class lowers fever?", "Antipyretics", "Antipyretics lower raised body temperature."],
          ["Which drug class kills or inhibits bacteria?", "Antibiotics", "Antibiotics act only on bacteria, not viruses."],
          ["Which drug class blocks allergy reactions?", "Antihistamines", "Antihistamines block histamine H1 receptors."],
          ["Which drug class dilates airways?", "Bronchodilators", "Beta-agonists relax bronchial muscle in asthma."],
          ["Which drug class lowers blood pressure?", "Antihypertensives", "ACE inhibitors and beta-blockers lower pressure by different cuts."],
          ["Which drug class thins the blood?", "Anticoagulants", "Anticoagulants prevent clot formation."],
          ["Which drug class treats diabetes by lowering sugar?", "Hypoglycaemic agents", "Oral agents and insulin lower blood glucose."],
          ["Which drug relieves severe allergic shock?", "Adrenaline", "Adrenaline reverses anaphylaxis quickly."],
          ["Which drug is the antidote for paracetamol overdose?", "N-acetylcysteine", "NAC restores glutathione and prevents liver damage."]
        ],
        trick: "result: analgesic=pain, antipyretic=fever, antihistamine=allergy.",
        tip: "Class-to-action is the anchor pair in pharmacology." },

      { kind: "pair", name: "drug and adverse effect", a: "drug", b: "key adverse effect",
        pairs: [["Aspirin", "Gastric bleeding"], ["Warfarin", "Bleeding risk"], ["Paracetamol", "Hepatotoxicity in overdose"],
          ["Amiodarone", "Thyroid dysfunction"], ["Aminoglycosides", "Nephrotoxicity and ototoxicity"], ["Prednisolone", "Weight gain and osteoporosis"]],
        outsiders: ["Viral clearance"],
        trick: "warnings: warfarin=bleed, amino=kidney+ear, paracetamol=liver.",
        tip: "Know the classic side effect of each anchor drug." },

      { kind: "numeric", name: "dose to body weight", difficulty: "easy",
        note: "Total dose = dose per kg × body weight.",
        q: (v) => `A child weighing ${v.kg} kg is prescribed ${v.mg} mg/kg of a medicine. What is the total dose in mg?`,
        a: (v) => `${v.kg * v.mg} mg`,
        e: (v) => `Total = ${v.mg} mg/kg × ${v.kg} kg = ${v.kg * v.mg} mg, multiplying the per-kilogram dose by the weight.`,
        distract: (v) => {
          const c = v.kg * v.mg;
          return [`${c * 2} mg`, `${c * 0.5} mg`, `${v.kg + v.mg} mg`, `${c * 1.5} mg`, `${c - 10} mg`];
        },
        vals: (rng) => ({ kg: R(rng, 5, 80), mg: R(rng, 1, 40) }),
        whyWrong: (v) => [`Multiply dose per kg by the weight; dividing or adding the two numbers misapplies the dosing rule.`],
        trick: "total = mg/kg × kg.",
        tip: "Weight-based dosing dominates paediatric questions." },

      { kind: "numeric", name: "half-life decay", difficulty: "medium",
        note: "Remaining fraction = (1/2)^n after n half-lives.",
        q: (v) => `A drug has been given ${v.n} half-lives ago. What fraction of the dose remains?`,
        a: (v) => `1/${2 ** v.n}`,
        e: (v) => `After ${v.n} half-lives the fraction = (1/2)^${v.n} = 1/${2 ** v.n}, because each half-life halves the amount.`,
        distract: (v) => [`1/${2 ** (v.n + 1)}`, `1/${2 ** (v.n - 1)}`, `${2 ** v.n}/${2 ** v.n + 1}`, `1/${v.n * 2}`, `${(2 ** v.n - 1)}/${2 ** v.n}`],
        vals: (rng) => ({ n: R(rng, 1, 4) }),
        whyWrong: (v) => [`The remaining fraction is a power of one half, not a multiple; 1/(2n) reflects addition, not doubling.`],
        trick: "after n half-lives: 1/2^n remains.",
        tip: "Five half-lives clear nearly all of most drugs." }
    ]
  }
};

/* ---------------- MEDICINE ---------------- */
const medicine = {
  subjects: ["medicine"],
  chapter: "Medicine — Clinical Medicine (Phase 11)",
  tags: ["medicine", "deep-kb", "clinical", "disorder"],
  topics: {
    "Common Diseases": [
      { kind: "fact", name: "disease presentation", note: "Recognising key diseases.",
        facts: [
          ["Which disease is classically treated with insulin?", "Type 1 diabetes mellitus", "Type 1 diabetes needs lifelong insulin because beta cells fail."],
          ["Which vitamin deficiency causes rickets in children?", "Vitamin D deficiency", "Rickets causes soft, bowed bones from vitamin D lack."],
          ["Which condition is chronic obstruction of airways with wheeze?", "Asthma", "Asthma is reversible airway inflammation and bronchospasm."],
          ["Which condition is high blood pressure above 140/90?", "Hypertension", "Hypertension strains the heart, brain and kidneys."],
          ["Which lung infection is caused by Mycobacterium tuberculosis?", "Tuberculosis", "Tuberculosis forms pulmonary granulomas; symptoms include cough and fever."],
          ["Which organ is affected in hepatitis?", "Liver", "Hepatitis is liver inflammation from viral or toxic causes."],
          ["Which is the most common cause of iron deficiency anaemia?", "Chronic blood loss", "Menstrual and GI bleeding drain iron stores."],
          ["Which condition is a heart attack from blocked coronary flow?", "Myocardial infarction", "A blocked coronary artery starves the myocardium of blood, causing infarction."],
          ["Which disease is high blood sugar with ketones?", "Diabetic ketoacidosis", "DKA follows insulin deficiency with fat metabolism."],
          ["Which virus causes chickenpox?", "Varicella-zoster virus", "VZV causes varicella then shingles on reactivation."]
        ],
        trick: "DKA=ketones, TB=mycobacteria, MI=heart attack, rickets=D.",
        tip: "Pathogen-disease and deficiency-disease pairs are exam staples." },

      { kind: "tf", name: "disease true-false", statements: [
        ["Asthma causes reversible airway narrowing.", "Asthma causes permanent airway bone growth."],
        ["Insulin deficiency causes diabetes.", "Vitamin C excess causes diabetes."],
        ["MI follows coronary artery blockage.", "MI follows a bone fracture."],
        ["Rickets is a vitamin D deficiency.", "Rickets is caused by excess iron."],
        ["Hepatitis is liver inflammation.", "Hepatitis is kidney muscle inflammation."]
      ] }
    ],

    "Investigations": [
      { kind: "fact", name: "investigation facts", note: "What common tests measure.",
        facts: [
          ["Which test records the heart's electrical activity?", "ECG/EKG", "The ECG detects rhythm, ischaemia and infarction."],
          ["Which imaging shows fractures best?", "X-ray", "Plain radiographs are first-line for fractures."],
          ["Which scan gives cross-sections using X-rays?", "CT scan", "Computed tomography builds detailed cross-sections."],
          ["Which imaging uses magnetic fields and gives soft-tissue detail?", "MRI", "Magnetic resonance images brain and soft tissues without radiation."],
          ["Which test checks haemoglobin and cell counts?", "Complete blood count", "CBC counts red cells, white cells and platelets."],
          ["Which test measures kidney function?", "Serum creatinine and eGFR", "Rising creatinine indicates falling kidney filtration."]
        ],
        pharmacy_note: "ECG=electrical, CT=X-ray slices, MRI=magnetic.",
        tip: "Match imaging modality to best tissue." }
    ]
  }
};

/* ---------------- SURGERY ---------------- */
const surgery = {
  subjects: ["surgery"],
  chapter: "Surgery — Principles (Phase 11)",
  tags: ["surgery", "deep-kb", "wound", "aseptic"],
  topics: {
    "Wounds and Healing": [
      { kind: "fact", name: "wound facts", note: "Wound and healing concepts.",
        facts: [
          ["What is a wound?", "A break in body tissue", "Wounds are tears from trauma or surgery."],
          ["What is primary healing?", "Edges brought together heal fastest", "Primary healing closes clean surgical edges."],
          ["What is an abscess?", "A pus-filled walled cavity", "Abscesses need incision and drainage."],
          ["What is a suture?", "A stitch to close tissue", "Sutures hold edges together till healing."],
          ["What is an anastomosis?", "A surgical join between two structures", "Anastomoses join bowel or vessels after resection."],
          ["What is a haematoma?", "A pool of blood under tissue", "Haematomas collect after bleeding and may need drainage."],
          ["What is asepsis?", "Absence of infection-causing organisms", "Aseptic technique prevents surgical infection."],
          ["What is a specimen removed to check cancer?", "Biopsy", "Biopsy tissue confirms the diagnosis."],
          ["What does excision mean?", "Surgical removal of tissue", "Excision removes the lesion with or without margin."],
          ["What is drainage tube for?", "Removing fluid or pus", "Drains allow infection to escape the cavity."]
        ],
        trick: "anastomosis=join, excision=remove, haematoma=blood pool.",
        tip: "Surgical terms map to their definitions." },

      { kind: "tf", name: "surgical true-false", statements: [
        ["Aseptic technique prevents surgical infection.", "Aseptic technique is used only in dental offices."],
        ["An anastomosis joins two structures.", "An anastomosis separates two organs."],
        ["Incision is a surgical cut.", "Incision is a type of painkiller."],
        ["A haematoma is a blood collection.", "A haematoma is a gas bubble."],
        ["Biopsy samples tissue for diagnosis.", "Biopsy is a type of antibiotic."]
      ] },

      { kind: "list", name: "surgical instruments", group: "surgical instruments",
        a: "instrument", b: "purpose",
        items: ["Scalpel", "Scissors", "Forceps", "Retractor", "Clamp"],
        outsiders: ["Stethoscope only"],
        trick: "Scalpel cuts, clamps stop bleeding.",
        tip: "Instrument-purpose matching is a surgical Q." }
    ]
  }
};

/* ---------------- COMMUNITY MEDICINE ---------------- */
const communityMed = {
  subjects: ["community-medicine", "public-health"],
  chapter: "Community Medicine & Public Health (Phase 11)",
  tags: ["community-medicine", "public-health", "epidemiology"],
  topics: {
    "Epidemiology": [
      { kind: "fact", name: "epidemiology facts", note: "Measures and concepts.",
        facts: [
          ["What is epidemiology?", "The study of disease distribution and determinants", "Pathology tracks who gets disease, where and why."],
          ["What is incidence?", "New cases arising in a period", "Incidence counts new cases only over time."],
          ["What is prevalence?", "All cases present at a time", "Prevalence counts existing cases at a point."],
          ["What is a pandemic?", "A global epidemic", "Pandemics cross countries; epidemics stay regional."],
          ["What is a vector?", "An organism spreading disease", "Mosquitoes transmit malaria and dengue."],
          ["What is herd immunity?", "Population protection from high vaccination", "Coverage interrupts the chain of transmission."],
          ["What is a case-control study?", "Compare cases with controls", "Retrospective design looks from outcome to exposure."],
          ["What is a cohort study?", "Satisfies exposure then follow outcomes", "Prospective follows groups forward in time."]
        ],
        trick: "incidence=new, prevalence=all; pandemic=global, epidemic=local.",
        tip: "Incidence vs prevalence and epidemic vs pandemic are classic." },

      { kind: "numeric", name: "incidence rate", difficulty: "medium",
        note: "Incidence density = new cases ÷ person-time.",
        q: (v) => `${ml(v.c)} new cases arise among ${ml(v.p)} persons observed for ${v.y} years each. What is the incidence rate per 1000 person-years?`,
        a: (v) => `${((v.c / (v.p * v.y)) * 1000).toFixed(2)} per 1000 person-years`,
        e: (v) => `Rate = ${v.c} ÷ (${v.p} × ${v.y}) × 1000 = ${((v.c / (v.p * v.y)) * 1000).toFixed(2)} per 1000 person-years.`,
        distract: (v) => {
          const c = (v.c / (v.p * v.y)) * 1000;
          return [`${(c * 2).toFixed(2)}`, `${(c * 0.5).toFixed(2)}`, `${(v.c / v.p * 1000).toFixed(2)}`, `${(c + 1).toFixed(2)}`, `${(c * 10).toFixed(2)}`];
        },
        vals: (rng) => ({ c: R(rng, 5, 50), p: R(rng, 500, 2000), y: R(rng, 1, 5) }),
        whyWrong: (v) => [`Divide by the total person-years before scaling to 1000; missing the year leg overestimates incidence greatly.`],
        trick: "rate = cases / person-years × 1000.",
        tip: "Person-years are the denominator in incidence density." },

      { kind: "numeric", name: "attack rate", difficulty: "easy",
        note: "Attack rate = exposed ill ÷ exposed at risk.",
        q: (v) => `Of ${ml(v.e)} people exposed at a dinner, ${v.i} become ill. What is the attack rate as a percentage?`,
        a: (v) => `${(100 * v.i / v.e).toFixed(1)}%`,
        e: (v) => `Rate = ${v.i} ÷ ${v.e} × 100 = ${(100 * v.i / v.e).toFixed(1)}%.`,
        distract: (v) => {
          const c = 100 * v.i / v.e;
          return [`${(c + 5).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(v.e / v.i).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 20).toFixed(1)}%`];
        },
        vals: (rng) => { const e = R(rng, 50, 500); const i = R(rng, 5, Math.floor(e / 2)); return { e, i }; },
        whyWrong: (v) => [`Divide the ill by all those exposed and multiply by 100; an inverted denominator gives the attack rate for the wrong group.`],
        trick: "attack rate = ill / exposed × 100.",
        tip: "The attack rate denominator is the entire set at risk." }
    ],

"Disease Prevention": [
      { kind: "fact", name: "prevention facts", note: "Levels of prevention and immunisation.",
        facts: [
          ["Which level of prevention is vaccination?", "Primary prevention", "Primary prevention prevents disease before it begins."],
          ["What is secondary prevention?", "Early screening and detection", "Screening like Pap smears catches disease early."],
          ["Which level is rehabilitation?", "Tertiary prevention", "Tertiary prevention reduces disability after disease."],
          ["Which disease does Pakistan's EPI programme target?", "Polio and routine EPI diseases", "Expanded Programme on Immunisation covers polio, measles, BCG, DPT and more."],
          ["Which mosquito transmits malaria?", "Female Anopheles mosquito", "Plasmodium parasites pass through female Anopheles bites."],
          ["Which mosquito transmits dengue?", "Aedes aegypti", "The Aedes aegypti mosquito spreads the dengue virus."],
          ["What is health education?", "Teaching people to protect their health", "Health education changes behaviour and prevents disease."],
          ["What is a health survey?", "Collecting health data from a population", "Surveys measure disease burden and risk factors."],
          ["What is sanitation?", "Safe handling of waste and water", "Proper sanitation prevents faecal-oral infections."],
          ["What is maternal child health?", "Care of mothers and children", "MCH reduces maternal and infant deaths."]
        ],
        trick: "primary=prevent, secondary=screen, tertiary=rehab.",
        tip: "Prevention levels map to the disease course."
      }
    ]
  }
};

module.exports = [makeKbGen(pharmacology), makeKbGen(medicine), makeKbGen(surgery), makeKbGen(communityMed)];
