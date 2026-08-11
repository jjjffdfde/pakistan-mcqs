/* ============================================================
   Deep Knowledge KB — Pharmacy
   Pharmacology, dosing forms, kinetics + numeric dispensing.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["pharmacy"],
  chapter: "Pharmacy — Deep Knowledge Bank",
  tags: ["pharmacy", "deep-kb", "pharmacology", "kinetics", "dosing"],
  topics: {

    "Pharmacology Basics": [
      {
        kind: "fact", name: "pharmacology fundamentals",
        note: "Core pharmacological definitions.",
        facts: [
          ["What is pharmacology?", "The study of drugs and their effects on the body", "Pharmacology covers how drugs act, how they move through the body and their uses."],
          ["What is pharmacodynamics?", "What the drug does to the body", "Pharmacodynamics studies drug action at receptors and the effects produced."],
          ["What is pharmacokinetics?", "What the body does to the drug", "Pharmacokinetics covers absorption, distribution, metabolism and excretion (ADME)."],
          ["What does ADME stand for?", "Absorption, distribution, metabolism, excretion", "ADME tracks the drug's journey from intake to elimination through the body."],
          ["What is an agonist?", "A drug that activates a receptor", "Agonists bind receptors and trigger the biological response."],
          ["What is an antagonist?", "A drug that blocks a receptor", "Antagonists occupy receptors without activating them, blocking the response."],
          ["What is a prodrug?", "An inactive compound activated in the body", "Prodrugs convert to the active form after metabolism in the body."],
          ["What is bioavailability?", "The fraction of a dose reaching the circulation", "Oral bioavailability compares the drug reaching blood with an IV dose."],
          ["What is the therapeutic index?", "The margin between effective and toxic doses", "A narrow therapeutic index means the toxic dose is close to the effective one."],
          ["What is a placebo?", "An inactive substance given as a control", "Placebos have no active ingredient but can still produce effects."]
        ],
        trick: "PD=what drug does to body, PK=what body does to drug, ADME, agonist=activates, antagonist=blocks.",
        tip: "PD vs PK and agonist vs antagonist are the most asked pairs."
      },
      {
        kind: "tf", name: "pharmacology statements",
        note: "True/false stems on drug concepts.",
        statements: [
          ["Pharmacokinetics studies what the body does to the drug.", "Pharmacokinetics studies what the drug does to the body."],
          ["An agonist activates its receptor.", "An agonist always blocks its receptor."],
          ["A prodrug becomes active after metabolism.", "A prodrug is active before it enters the body."],
          ["A narrow therapeutic index means a small safety margin.", "A narrow therapeutic index means a huge safety margin."],
          ["Bioavailability is the fraction reaching the circulation.", "Bioavailability is the fraction destroyed in the liver only."],
          ["ADME stands for absorption, distribution, metabolism, excretion.", "ADME stands for absorption, diagnosis, mixing, elimination."]
        ],
        trick: "agonist=on, antagonist=off, TI narrow=risky, ADME=journey.",
        tip: "Definition swaps are the classic traps."
      },
      {
        kind: "numeric", name: "drug half-life levels", difficulty: "medium",
        note: "Steady state is reached after about five half-lives.",
        q: (v) => `A drug has a half-life of ${v.h} hours. After how many hours does it reach approximately 93.75% of steady state (five half-lives)?`,
        a: (v) => `${v.h * 5} hours`,
        e: (v) => `Steady state takes about five half-lives: 5 × ${v.h} = ${v.h * 5} hours, since each half-life halves the gap to the target level.`,
        distract: (v) => [`${v.h * 4} hours`, `${v.h * 6} hours`, `${v.h * 3} hours`, `${v.h * 5 + 2} hours`, `${v.h * 2} hours`],
        vals: (rng) => ({ h: 2 + Math.floor(rng() * 22) }),
        whyWrong: (v) => [`Multiply the half-life by five; four, six or fewer half-lives misstate the steady-state time.`],
        trick: "steady state ≈ 5 × half-life.",
        tip: "93.75% steady state at 4 half-lives; ~97% at 5."
      },
      {
        kind: "numeric", name: "dosage conversions", difficulty: "easy",
        note: "Converting between mg and µg (1 mg = 1000 µg).",
        q: (v) => `A prescription calls for ${v.mg} mg of a drug. How many micrograms is that?`,
        a: (v) => `${v.mg * 1000} µg`,
        e: (v) => `1 mg = 1000 µg, so ${v.mg} × 1000 = ${v.mg * 1000} µg, moving three decimal places.`,
        distract: (v) => [`${v.mg * 100} µg`, `${v.mg * 10} µg`, `${v.mg / 1000} µg`, `${v.mg * 10000} µg`, `${v.mg + 1000} µg`],
        vals: (rng) => ({ mg: 1 + Math.floor(rng() * 999) }),
        whyWrong: (v) => [`Multiply mg by 1000 to get µg; factors of 10 or 100 are the classic unit slips.`],
        trick: "mg → µg = ×1000; g → mg = ×1000.",
        tip: "Memorise the 1000 step for each metric unit."
      },
      {
        kind: "numeric", name: "concentration dilutions", difficulty: "hard",
        note: "C1V1 = C2V2 dilution formula.",
        q: (v) => `How many mL of a ${v.c1}% stock solution are needed to prepare ${v.v2} mL of a ${v.c2}% solution?`,
        a: (v) => `${(v.c2 * v.v2 / v.c1).toFixed(1)} mL`,
        e: (v) => `C1V1 = C2V2, so V1 = ${v.c2}% × ${v.v2} ÷ ${v.c1}% = ${(v.c2 * v.v2 / v.c1).toFixed(1)} mL of stock, topped up with diluent.`,
        distract: (v) => {
          const c = v.c2 * v.v2 / v.c1;
          return [`${(c * 2).toFixed(1)} mL`, `${(c * 0.5).toFixed(1)} mL`, `${(v.v2 - c).toFixed(1)} mL`, `${(c + 10).toFixed(1)} mL`, `${(c * 1.5).toFixed(1)} mL`];
        },
        vals: (rng) => {
          const c1 = 10 + Math.floor(rng() * 8) * 5;
          const c2 = 1 + Math.floor(rng() * 8);
          const v2 = 100 + Math.floor(rng() * 19) * 50;
          return { c1, c2, v2 };
        },
        whyWrong: (v) => [`Use C1V1 = C2V2 with matching concentration units; the remaining diluent volume is the deliberate distractor.`],
        trick: "C1V1 = C2V2 dilution rule.",
        tip: "Check that stock concentration is higher than final."
      }
    ],

    "Dispensing and Kinetics": [
      {
        kind: "fact", name: "dispensing facts",
        note: "Prescriptions, forms and compounding.",
        facts: [
          ["What is a prescription?", "A legal order for a drug from a prescriber", "Prescriptions specify drug, dose, route, frequency and patient details."],
          ["What is a generic drug?", "The non-brand version of a medicine", "Generics contain the same active ingredient as the brand at lower cost."],
          ["What is an enteric coating?", "A coating that protects the drug from stomach acid", "Enteric coatings dissolve in the intestine, not the stomach."],
          ["What is a sustained-release tablet?", "A tablet releasing drug slowly over time", "Sustained-release forms keep levels steady and reduce dosing frequency."],
          ["What is a suppository?", "A solid dose inserted into the rectum", "Suppositories melt at body temperature to release the drug gradually."],
          ["What is a syrup?", "A drug dissolved in a sweetened liquid", "Syrups use sugar solutions that make bitter drugs palatable."],
          ["What is compounding?", "Preparing custom medications", "Compounding mixes ingredients for doses or forms not available commercially."],
          ["What is an expiry date?", "The date after which potency is not guaranteed", "Expired drugs may lose strength or degrade into harmful products."],
          ["What is a side effect?", "An unintended effect at normal doses", "Side effects are expected but unwanted actions at therapeutic doses."],
          ["What is an interaction?", "One drug changing another's effect", "Interactions can raise or lower levels, as with grapefruit and statins."]
        ],
        trick: "generic=same ingredient, enteric=intestine, SR=slow, syrup=sweet liquid.",
        tip: "Form-function pairs are the highest-yield dispensing items."
      },
      {
        kind: "tf", name: "dispensing statements",
        note: "True/false stems on dispensing.",
        statements: [
          ["Enteric coatings dissolve in the intestine.", "Enteric coatings dissolve instantly in the mouth."],
          ["Generic drugs contain the same active ingredient.", "Generic drugs always contain a different ingredient."],
          ["Sustained-release tablets release drug slowly.", "Sustained-release tablets release all drug at once."],
          ["A syrup is a drug in a sweetened liquid.", "A syrup is a solid compressed tablet."],
          ["Compounding prepares custom medications.", "Compounding destroys all active ingredients."],
          ["Drug interactions can change drug levels.", "Interactions never affect drug levels."]
        ],
        trick: "enteric=intestine, SR=slow, syrup=liquid, generic=same.",
        tip: "Form behaviour swaps are the traps."
      },
      {
        kind: "numeric", name: "day supply counts", difficulty: "easy",
        note: "Days of supply = total tablets ÷ tablets per day.",
        q: (v) => `A prescription dispenses ${v.total} tablets taken ${v.perDay} times daily. How many days does the supply last?`,
        a: (v) => `${Math.floor(v.total / v.perDay)} days`,
        e: (v) => `Days = ${v.total} ÷ ${v.perDay} = ${Math.floor(v.total / v.perDay)} days, dividing the dispensed count by the daily use.`,
        distract: (v) => {
          const c = Math.floor(v.total / v.perDay);
          return [`${c + 1} days`, `${c - 1 >= 1 ? c - 1 : c + 2} days`, `${v.total - v.perDay} days`, `${Math.ceil(v.total / v.perDay)} days`, `${c * 2} days`];
        },
        vals: (rng) => ({ total: 10 + Math.floor(rng() * 40) * 5, perDay: 1 + Math.floor(rng() * 3) }),
        whyWrong: (v) => [`Divide total tablets by tablets per day and floor it; rounding up or subtracting misstate the supply.`],
        trick: "days = tablets ÷ tablets/day.",
        tip: "Round DOWN for supply days."
      },
      {
        kind: "numeric", name: "infusion pump rates", difficulty: "medium",
        note: "mL/hour = total volume ÷ hours.",
        q: (v) => `A ${v.vol} mL IV bag must infuse over ${v.h} hours. What pump rate in mL/hour is required?`,
        a: (v) => `${(v.vol / v.h).toFixed(0)} mL/h`,
        e: (v) => `Rate = ${v.vol} ÷ ${v.h} = ${(v.vol / v.h).toFixed(0)} mL/h, dividing the volume by the infusion time.`,
        distract: (v) => {
          const c = v.vol / v.h;
          return [`${(c * 2).toFixed(0)} mL/h`, `${(c * 0.5).toFixed(0)} mL/h`, `${(v.vol / 60).toFixed(0)} mL/h`, `${(c + 10).toFixed(0)} mL/h`, `${(c * 1.5).toFixed(0)} mL/h`];
        },
        vals: (rng) => ({ vol: 100 + Math.floor(rng() * 90) * 50, h: 1 + Math.floor(rng() * 23) }),
        whyWrong: (v) => [`Divide volume by HOURS, not minutes; dividing by 60 (minutes) is the classic unit error.`],
        trick: "mL/h = volume ÷ hours.",
        tip: "Pumps are always set in mL per hour."
      },
      {
        kind: "numeric", name: "clearance calculations", difficulty: "hard",
        note: "Creatinine clearance approximated with the Cockcroft-Gault style formula.",
        q: (v) => `Using the Cockcroft-Gault formula with a serum creatinine of ${v.c} mg/dL, an age of ${v.a} years and weight ${v.w} kg (male), what is the estimated creatinine clearance in mL/min?`,
        a: (v) => `${Math.round((140 - v.a) * v.w / (72 * v.c))}`,
        e: (v) => `Cl = (140 − age) × weight ÷ (72 × creatinine) = (140 − ${v.a}) × ${v.w} ÷ (72 × ${v.c}) = ${(140 - v.a) * v.w} ÷ ${72 * v.c} = ${((140 - v.a) * v.w / (72 * v.c)).toFixed(1)} mL/min, approximating renal function.`,
        distract: (v) => {
          const c = (140 - v.a) * v.w / (72 * v.c);
          return [`${Math.round(c * 0.85)}`, `${Math.round(c * 1.2)}`, `${Math.round(v.w / v.c)}`, `${Math.round(c + 15)}`, `${Math.round(c * 2)}`];
        },
        vals: (rng) => ({
          c: Math.round((0.6 + Math.floor(rng() * 20) / 10) * 10) / 10,
          a: 20 + Math.floor(rng() * 60),
          w: 40 + Math.floor(rng() * 80) * 10
        }),
        whyWrong: (v) => [`Use (140 − age) × weight ÷ (72 × creatinine); forgetting the 72 factor or the age term inflates the estimate.`],
        trick: "ClCr = (140−age) × kg ÷ (72 × Cr).",
        tip: "Multiply by 0.85 for female patients."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
