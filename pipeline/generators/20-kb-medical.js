/* ============================================================
   Deep Knowledge KB — Medical (MBBS / General Medicine)
   Anatomy, physiology, pharmacology basics + numeric dosing.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["medical"],
  chapter: "Medical Sciences — Deep Knowledge Bank",
  tags: ["medical", "deep-kb", "anatomy", "physiology", "pharmacology"],
  topics: {

    "Anatomy and Physiology": [
      {
        kind: "fact", name: "anatomy facts",
        note: "Core anatomical and physiological facts.",
        facts: [
          ["How many bones are in the adult human skeleton?", "206", "The adult skeleton has 206 bones, fused from about 300 at birth."],
          ["What is the largest artery in the body?", "The aorta", "The aorta leaves the left ventricle and distributes oxygenated blood to the body."],
          ["What is the normal heart rate range for an adult?", "60-100 beats per minute", "Normal adult resting heart rate is 60-100 beats per minute, varying with age, fitness and medication."],
          ["Which chamber pumps blood to the body?", "The left ventricle", "The left ventricle's thick wall pumps oxygenated blood through the aorta."],
          ["What is the functional unit of the kidney?", "The nephron", "Each kidney contains about a million nephrons that filter blood and form urine."],
          ["Which structure filters blood in the kidney?", "The glomerulus", "The glomerulus is the capillary tuft where filtration begins in each nephron."],
          ["What is the normal blood glucose range?", "70-99 mg/dL fasting", "Fasting glucose of 70-99 mg/dL is normal; 126+ indicates diabetes."],
          ["Which hormone regulates blood sugar?", "Insulin", "Insulin from pancreatic beta cells lowers blood glucose; glucagon raises it."],
          ["Which organ produces bile?", "The liver", "The liver produces bile, stored in the gallbladder and used to digest fats."],
          ["What is the pacemaker of the heart?", "The sinoatrial (SA) node", "The sinoatrial node initiates each heartbeat from the right atrium, setting the heart's rhythm."]
        ],
        trick: "206 bones, aorta=largest artery, nephron=kidney unit, insulin=lower sugar, SA node=pacemaker.",
        tip: "The 'largest/normal-range' facts are the highest-yield items."
      },
      {
        kind: "tf", name: "anatomy statements",
        note: "True/false stems on anatomy.",
        statements: [
          ["The SA node is the heart's natural pacemaker.", "The kidneys set the heart's rhythm."],
          ["The nephron filters blood in the kidney.", "The nephron pumps blood through the lungs."],
          ["Insulin lowers blood glucose.", "Insulin raises blood glucose."],
          ["The aorta is the largest artery.", "The aorta is the smallest vein."],
          ["The liver produces bile.", "The gallbladder produces bile."]
        ],
        trick: "SA=pacemaker, nephron=kidney, insulin=lower, aorta=largest artery, liver=bile.",
        tip: "Organ-function swaps are the standard traps."
      }
    ],

    "Pharmacology": [
      {
        kind: "fact", name: "pharmacology facts",
        note: "Drug classes and actions.",
        facts: [
          ["Which drug class reduces pain?", "Analgesics", "Analgesics like paracetamol and opioids relieve pain by different mechanisms."],
          ["Which drug class kills bacteria?", "Antibiotics", "Antibiotics like penicillin kill or inhibit bacterial growth."],
          ["What is paracetamol used for?", "Pain and fever", "Paracetamol relieves mild pain and fever but has little anti-inflammatory effect."],
          ["Which drug is an opioid?", "Morphine", "Morphine, from opium, is a strong opioid analgesic acting on mu receptors."],
          ["What is the antidote for paracetamol overdose?", "N-acetylcysteine", "NAC replenishes glutathione and prevents hepatotoxicity in paracetamol poisoning."],
          ["Which drug class treats hypertension?", "Antihypertensives like ACE inhibitors", "ACE inhibitors lower blood pressure by blocking angiotensin II formation."],
          ["What is aspirin's main antiplatelet effect used for?", "Preventing heart attacks and strokes", "Low-dose aspirin inhibits platelets to prevent clot formation."],
          ["Which drug is an anticoagulant?", "Warfarin", "Warfarin inhibits vitamin K-dependent clotting factors, thinning the blood to prevent thrombosis."],
          ["Which drug is used in anaphylaxis?", "Adrenaline (epinephrine)", "Adrenaline reverses anaphylaxis by bronchodilation and vasoconstriction."],
          ["Which drug class relieves allergies?", "Antihistamines", "Antihistamines block histamine H1 receptors, easing allergy symptoms."]
        ],
        trick: "Analgesic=pain, antibiotic=bacteria, NAC=paracetamol antidote, adrenaline=anaphylaxis.",
        tip: "Drug-class pairs (aspirin→platelets, warfarin→clotting) are classic items."
      },
      {
        kind: "numeric", name: "drug dosage calculations", difficulty: "medium",
        note: "Dose = weight × dose per kg.",
        q: (v) => `A drug is prescribed at ${v.mg} mg/kg. A patient weighing ${v.kg} kg receives how many milligrams per dose?`,
        a: (v) => `${(v.mg * v.kg).toLocaleString()} mg`,
        e: (v) => `Dose = ${v.mg} mg/kg × ${v.kg} kg = ${(v.mg * v.kg).toLocaleString()} mg, because mg/kg dosing scales the dose with the patient's weight.`,
        distract: (v) => {
          const c = v.mg * v.kg;
          return [`${(c / 2).toLocaleString()} mg`, `${(c * 2).toLocaleString()} mg`, `${(v.mg + v.kg)} mg`, `${(c * 1.5).toLocaleString()} mg`, `${(c / v.kg).toLocaleString()} mg`];
        },
        vals: (rng) => {
          const kg = 3 + Math.floor(rng() * 98);
          const mg = Math.round((0.5 + Math.floor(rng() * 40) * 0.5) * 10) / 10;
          return { mg, kg };
        },
        whyWrong: (v) => [`Multiply mg/kg by the weight; halving, doubling or adding the numbers misapplies the weight-based dose.`],
        trick: "Dose = weight × mg/kg.",
        tip: "Paediatric doses are nearly always weight-based."
      },
      {
        kind: "numeric", name: "drip rate calculations", difficulty: "hard",
        note: "Drip rate (drops/min) = volume (mL) × drops/mL ÷ time (min).",
        q: (v) => `A patient needs ${v.ml} mL of fluid over ${v.h} hours. The giving set delivers ${v.d} drops/mL. What is the drip rate in drops per minute?`,
        a: (v) => `${Math.round(v.ml * v.d / (v.h * 60))} drops/min`,
        e: (v) => `Rate = volume × drops/mL ÷ minutes = ${v.ml} × ${v.d} ÷ (${v.h} × 60) = ${Math.round(v.ml * v.d / (v.h * 60))} drops/min, because the time in hours must convert to minutes first.`,
        distract: (v) => {
          const c = Math.round(v.ml * v.d / (v.h * 60));
          return [`${Math.round(c * 2)} drops/min`, `${Math.round(c * 0.5)} drops/min`, `${Math.round(v.ml * v.d / v.h)} drops/min`, `${c + 10} drops/min`, `${Math.round(c * 1.5)} drops/min`];
        },
        vals: (rng) => {
          const ml = (100 + Math.floor(rng() * 49) * 100);
          const h = 1 + Math.floor(rng() * 24);
          const d = [10, 15, 20, 60][Math.floor(rng() * 4)];
          return { ml, h, d };
        },
        whyWrong: (v) => [`Convert hours to minutes before dividing; skipping the ×60 conversion gives a drip rate hours-too-small.`],
        trick: "gtt/min = mL × drops/mL ÷ (hours × 60).",
        tip: "60 drops/mL is the paediatric microdrip set."
      },
      {
        kind: "numeric", name: "maintenance fluid calculations", difficulty: "medium",
        note: "4-2-1 rule: 4 mL/kg/h for the first 10 kg, 2 for the next 10, 1 beyond.",
        q: (v) => `Using the 4-2-1 rule, what hourly maintenance fluid rate is needed for a ${v.kg} kg child?`,
        a: (v) => `${(v.ml).toLocaleString()} mL/h`,
        e: (v) => `First 10 kg: 4×10 = 40 mL/h. Next 10 kg: 2×10 = 20 mL/h. Beyond 20 kg: 1×${v.kg - 20} = ${v.kg - 20} mL/h. Total = 40 + 20 + ${v.kg - 20} = ${v.ml} mL/h, because the 4-2-1 rule steps down the rate by weight band.`,
        distract: (v) => {
          const c = v.ml;
          return [`${(c + 40).toLocaleString()} mL/h`, `${(c * 0.5).toLocaleString()} mL/h`, `${(v.kg * 4).toLocaleString()} mL/h`, `${(c * 1.5).toLocaleString()} mL/h`, `${(c - 20).toLocaleString()} mL/h`];
        },
        vals: (rng) => {
          const kg = 21 + Math.floor(rng() * 100);
          const ml = 60 + (kg - 20);
          return { kg, ml };
        },
        whyWrong: (v) => [`Apply the 4-2-1 rule band by band; flat 4 mL/kg for the whole weight overestimates the rate.`],
        trick: "4, 2, 1 per 10 kg bands — never one flat rate.",
        tip: "Above 20 kg the rate is 60 + 1 per extra kg."
      },
      {
        kind: "numeric", name: "mean arterial pressure calculations", difficulty: "easy",
        note: "MAP = (systolic + 2 × diastolic) ÷ 3.",
        q: (v) => `A patient's blood pressure is ${v.sys}/${v.dia} mmHg. What is the mean arterial pressure?`,
        a: (v) => `${Math.round((v.sys + 2 * v.dia) / 3)} mmHg`,
        e: (v) => `MAP = (SBP + 2×DBP) ÷ 3 = (${v.sys} + 2×${v.dia}) ÷ 3 = ${Math.round((v.sys + 2 * v.dia) / 3)} mmHg, because diastole lasts twice as long as systole, weighting DBP double.`,
        distract: (v) => [`${Math.round((v.sys + v.dia) / 2)} mmHg`, `${Math.round((2 * v.sys + v.dia) / 3)} mmHg`, `${v.dia} mmHg`, `${Math.round((v.sys + 2 * v.dia) / 3) + 10} mmHg`, `${Math.round((v.sys + 2 * v.dia) / 6)} mmHg`],
        vals: (rng) => {
          const sys = 90 + Math.floor(rng() * 111);
          const dia = 50 + Math.floor(rng() * 81);
          return { sys, dia };
        },
        whyWrong: (v) => [`Diastolic is weighted ×2 because diastole occupies two thirds of the cycle; the plain average is the trap.`],
        trick: "MAP = (SBP + 2×DBP) ÷ 3.",
        tip: "MAP ≥ 65 mmHg is the critical perfusion threshold."
      }
    ],

    "Common Diseases": [
      {
        kind: "fact", name: "disease facts",
        note: "Common diseases and their features.",
        facts: [
          ["What is hypertension?", "Persistently high blood pressure", "Hypertension is blood pressure of 140/90 mmHg or above sustained over repeated readings."],
          ["What is diabetes mellitus?", "Chronically high blood glucose", "Diabetes results from insulin deficiency or resistance, causing chronically high blood glucose."],
          ["Which infection is caused by the TB bacillus?", "Tuberculosis", "Mycobacterium tuberculosis mainly infects the lungs and spreads by droplets."],
          ["Which mosquito transmits malaria?", "The female Anopheles mosquito", "Plasmodium parasites spread through the bites of female Anopheles mosquitoes."],
          ["Which mosquito transmits dengue?", "Aedes aegypti", "Aedes aegypti, a daytime-biting mosquito, spreads the dengue virus."],
          ["What is anaemia?", "Low haemoglobin or red blood cells", "Anaemia reduces oxygen-carrying capacity, causing fatigue and pallor."],
          ["What is the most common cause of iron deficiency anaemia?", "Blood loss", "Chronic blood loss, especially menstrual, depletes iron stores."],
          ["What is a myocardial infarction?", "A heart attack from blocked coronary flow", "An MI is death of heart muscle from sudden coronary artery blockage."],
          ["Which virus causes COVID-19?", "SARS-CoV-2", "SARS-CoV-2 emerged in late 2019 and spread worldwide as a pandemic."],
          ["What is asthma?", "Reversible airway narrowing and inflammation", "Asthma causes wheeze and breathlessness from bronchial inflammation."]
        ],
        trick: "Anopheles=malaria, Aedes=dengue, MI=heart attack, SARS-CoV-2=COVID.",
        tip: "Vector-disease pairs (mosquito species) are the highest-yield items."
      },
      {
        kind: "tf", name: "disease statements",
        note: "True/false stems on diseases.",
        statements: [
          ["Malaria spreads through Anopheles mosquito bites.", "Malaria spreads through contaminated drinking water."],
          ["Dengue is transmitted by Aedes mosquitoes.", "Dengue is transmitted by houseflies."],
          ["TB is caused by a bacterium.", "TB is caused by a virus."],
          ["An MI is a blockage of coronary blood flow.", "An MI is a fracture of the skull."],
          ["Diabetes involves high blood glucose.", "Diabetes involves low blood oxygen."]
        ],
        trick: "Anopheles=malaria, Aedes=dengue, TB=bacteria, MI=coronary, diabetes=glucose.",
        tip: "Pathogen and vector swaps are the classic traps."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
