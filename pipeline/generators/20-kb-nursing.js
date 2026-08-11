/* ============================================================
   Deep Knowledge KB — Nursing
   Fundamentals, vital signs, drug calculations + numeric care.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["nursing"],
  chapter: "Nursing — Deep Knowledge Bank",
  tags: ["nursing", "deep-kb", "vital-signs", "drugs", "care"],
  topics: {

    "Nursing Fundamentals": [
      {
        kind: "fact", name: "nursing basics",
        note: "Core nursing roles and principles.",
        facts: [
          ["What is the first step of the nursing process?", "Assessment", "The nursing process begins with assessment: collecting the patient's data systematically."],
          ["Which organisation issues nurse licenses in the US?", "State boards of nursing", "State boards of nursing license and discipline registered nurses in each state."],
          ["What does HIPAA protect?", "Patient health information privacy", "HIPAA guards the confidentiality of patient records and health data."],
          ["What is a normal adult resting heart rate?", "60-100 beats per minute", "Resting heart rates of 60-100 bpm are normal for most adults."],
          ["What is a normal adult respiratory rate?", "12-20 breaths per minute", "Adults typically breathe 12-20 times per minute at rest, faster in illness."],
          ["What is a normal adult temperature in Celsius?", "36.5-37.5 °C", "Core body temperature normally ranges about 36.5-37.5 °C, averaging 37 °C."],
          ["What is a normal adult systolic blood pressure?", "90-120 mmHg", "Normal adult systolic pressure sits roughly between 90 and 120 mmHg."],
          ["What does 'prn' mean on a medication order?", "As needed", "PRN (pro re nata) orders mean the drug is given only when the patient needs it."],
          ["Which route has the fastest onset of action?", "Intravenous", "IV drugs enter the bloodstream directly, giving the fastest onset."],
          ["What does QID mean in medication orders?", "Four times daily", "QID (quater in die) prescribes the medication four times a day."]
        ],
        trick: "BP 120/80, HR 60-100, RR 12-20, temp 37, QID=4, prn=as needed.",
        tip: "Normal vital-sign ranges are the most asked nursing items."
      },
      {
        kind: "tf", name: "nursing statements",
        note: "True/false stems on nursing practice.",
        statements: [
          ["Assessment is the first step of the nursing process.", "Evaluation comes before assessment."],
          ["IV drugs act faster than oral drugs.", "Oral drugs act faster than IV drugs."],
          ["HIPAA protects patient information privacy.", "HIPAA regulates hospital parking fees."],
          ["PRN medication is given as needed.", "PRN medication is given every hour on the hour."],
          ["QID means four times daily.", "QID means once daily."],
          ["A normal adult pulse is 60-100 bpm.", "A normal adult pulse is 150-200 bpm."]
        ],
        trick: "QID=4×, PRN=as needed, HIPAA=privacy, IV=fastest.",
        tip: "Abbreviation and range swaps are the classic traps."
      },
      {
        kind: "numeric", name: "fahrenheit conversion", difficulty: "easy",
        note: "Temperature conversions between Celsius and Fahrenheit.",
        q: (v) => `A patient's temperature is ${v.c} °C. What is it in Fahrenheit, using °F = °C × 9/5 + 32?`,
        a: (v) => `${(v.c * 9 / 5 + 32).toFixed(1)} °F`,
        e: (v) => `°F = ${v.c} × 9/5 + 32 = ${(v.c * 9 / 5).toFixed(1)} + 32 = ${(v.c * 9 / 5 + 32).toFixed(1)} °F, using the standard conversion.`,
        distract: (v) => {
          const f = v.c * 9 / 5 + 32;
          return [`${(f - 32).toFixed(1)} °F`, `${(v.c + 32).toFixed(1)} °F`, `${(f + 5).toFixed(1)} °F`, `${(f - 5).toFixed(1)} °F`, `${(v.c * 2).toFixed(1)} °F`];
        },
        vals: (rng) => ({ c: 34 + Math.floor(rng() * 90) / 10 }),
        whyWrong: (v) => [`Apply × 9/5 before adding 32; adding 32 first or dropping the +32 are the classic errors.`],
        trick: "°F = °C × 1.8 + 32 always.",
        tip: "Normal body temp is 37 °C = 98.6 °F."
      },
      {
        kind: "numeric", name: "bmi calculations", difficulty: "medium",
        note: "BMI = weight ÷ height² (metric).",
        q: (v) => `A patient weighs ${v.w} kg and is ${v.h / 100} m tall. What is their BMI, rounded to one decimal?`,
        a: (v) => `${(v.w / ((v.h / 100) ** 2)).toFixed(1)}`,
        e: (v) => `BMI = ${v.w} ÷ (${v.h / 100})² = ${v.w} ÷ ${((v.h / 100) ** 2).toFixed(2)} = ${(v.w / ((v.h / 100) ** 2)).toFixed(1)}, where weight is in kg and height in metres.`,
        distract: (v) => {
          const b = v.w / ((v.h / 100) ** 2);
          return [`${(b + 2.5).toFixed(1)}`, `${(b - 2.5).toFixed(1)}`, `${(b * 1.2).toFixed(1)}`, `${(v.w / v.h).toFixed(1)}`, `${(b * 1.5).toFixed(1)}`];
        },
        vals: (rng) => ({
          w: 40 + Math.floor(rng() * 110) * 10,
          h: 150 + Math.floor(rng() * 50)
        }),
        whyWrong: (v) => [`Height must be squared in metres; dividing by height in cm or skipping the square are the classic errors.`],
        trick: "BMI = kg ÷ m², height squared.",
        tip: "18.5-24.9 is normal, 30+ is obese."
      }
    ],

    "Drug Calculations": [
      {
        kind: "fact", name: "drug administration facts",
        note: "Medication administration concepts.",
        facts: [
          ["What is the 'five rights' of medication administration?", "Right patient, drug, dose, route, time", "The five rights check patient, drug, dose, route and time before giving any medication."],
          ["What is a loading dose?", "A large first dose to reach therapeutic levels quickly", "Loading doses saturate the body fast, then maintenance doses keep the level."],
          ["What is a maintenance dose?", "The regular dose that keeps the level steady", "Maintenance doses replace what the body eliminates between doses."],
          ["What is bioavailability?", "The fraction of drug reaching the circulation", "Bioavailability compares the dose that reaches the blood to the amount given."],
          ["What is a drug's half-life?", "The time for its level to fall by half", "Half-life is how long it takes the body to remove half the drug."],
          ["What does 'stat' mean in an order?", "Immediately", "STAT orders are urgent and must be given at once, without delay."],
          ["What is an adverse drug reaction?", "An unintended harmful response to a drug", "Adverse reactions are harmful effects beyond the intended therapeutic action."],
          ["What is a contraindication?", "A condition that makes a drug unsafe", "A contraindication means the drug should not be given in that situation."],
          ["What does 'tid' mean in medication orders?", "Three times daily", "TID (ter in die) prescribes the medication three times a day."],
          ["What is a subcutaneous injection site?", "The fatty layer under the skin", "Subcutaneous injections deposit drug into the tissue beneath the skin."]
        ],
        trick: "5 rights, TID=3×, stat=now, half-life=halving time, SQ=under skin.",
        tip: "Abbreviations and the five rights are the top administration items."
      },
      {
        kind: "tf", name: "drug statements",
        note: "True/false stems on drug basics.",
        statements: [
          ["TID means three times daily.", "TID means once a week."],
          ["A loading dose is a large first dose.", "A loading dose is always smaller than maintenance."],
          ["Half-life is the time for levels to halve.", "Half-life is the time for levels to double."],
          ["STAT orders mean give immediately.", "STAT orders mean give at bedtime."],
          ["Subcutaneous injections go under the skin.", "Subcutaneous injections go into a vein."],
          ["Bioavailability is the fraction reaching the blood.", "Bioavailability is the fraction destroyed by the stomach."]
        ],
        trick: "TID=3, STAT=now, SQ=under skin, half-life=halve.",
        tip: "Timing and route swaps are the traps."
      },
      {
        kind: "numeric", name: "weight-based doses", difficulty: "medium",
        note: "Dose = mg per kg × weight.",
        q: (v) => `A ${v.w} kg child is prescribed ${v.d} mg/kg of a drug. What total dose in mg should be given?`,
        a: (v) => `${v.w * v.d} mg`,
        e: (v) => `Dose = ${v.d} mg/kg × ${v.w} kg = ${v.w * v.d} mg, multiplying the per-kg amount by the child's weight.`,
        distract: (v) => [
          `${(v.w * v.d * 2)} mg`, `${(v.w * v.d * 0.5)} mg`, `${(v.w * v.d + 5)} mg`, `${(v.w + v.d)} mg`, `${(v.w * v.d * 0.25)} mg`
        ],
        vals: (rng) => ({ w: 5 + Math.floor(rng() * 60), d: 5 + Math.floor(rng() * 45) }),
        whyWrong: (v) => [`Multiply mg/kg by the weight; halving, doubling or adding the numbers misapplies the weight-based dose.`],
        trick: "total mg = mg/kg × kg.",
        tip: "Weight in kg is the base — never mix lb and kg."
      },
      {
        kind: "numeric", name: "iv drip rates", difficulty: "hard",
        note: "Drops per minute = volume × drop factor ÷ minutes.",
        q: (v) => `${v.vol} mL of fluid must infuse over ${v.h} hours with a drop factor of ${v.f} gtt/mL. What is the drip rate in drops per minute, rounded up?`,
        a: (v) => `${Math.ceil(v.vol * v.f / (v.h * 60))}`,
        e: (v) => `Rate = ${v.vol} × ${v.f} ÷ (${v.h} × 60 min) = ${v.vol * v.f} ÷ ${v.h * 60} = ${(v.vol * v.f / (v.h * 60)).toFixed(2)}, rounded up to ${Math.ceil(v.vol * v.f / (v.h * 60))} gtt/min.`,
        distract: (v) => {
          const c = v.vol * v.f / (v.h * 60);
          return [`${Math.ceil(c - 5 >= 1 ? c - 5 : c + 5)}`, `${Math.ceil(c * 2)}`, `${Math.floor(c * 0.5)}`, `${Math.ceil(c + 10)}`, `${Math.ceil(c * 1.5)}`];
        },
        vals: (rng) => ({
          vol: 100 + Math.floor(rng() * 40) * 50,
          h: 1 + Math.floor(rng() * 11),
          f: [10, 15, 20, 60][Math.floor(rng() * 4)]
        }),
        whyWrong: (v) => [`Convert hours to minutes first and include the drop factor; skipping ×60 or the factor gives a rate far too small or large.`],
        trick: "gtt/min = mL × factor ÷ minutes.",
        tip: "Always round drip rates UP to whole drops."
      },
      {
        kind: "numeric", name: "intake output balances", difficulty: "easy",
        note: "Fluid balance = intake − output.",
        q: (v) => `A patient takes in ${v.i} mL of fluid and produces ${v.o} mL of urine over 24 hours. What is the fluid balance?`,
        a: (v) => `${v.i - v.o} mL`,
        e: (v) => `Balance = intake − output = ${v.i} − ${v.o} = ${v.i - v.o} mL, so a positive value means net fluid gain.`,
        distract: (v) => [`${v.i + v.o} mL`, `${v.o - v.i} mL`, `${v.i - v.o + 100} mL`, `${v.i - v.o - 100} mL`, `${(v.i + v.o) / 2} mL`],
        vals: (rng) => {
          const i = 1000 + Math.floor(rng() * 200) * 10;
          const o = 800 + Math.floor(rng() * 250) * 10;
          return { i, o };
        },
        whyWrong: (v) => [`Subtract output from intake; adding them or inverting the difference misstate the daily balance.`],
        trick: "balance = intake − output.",
        tip: "Output above intake means a negative (loss) balance."
      },
      {
        kind: "numeric", name: "drug half-lives", difficulty: "medium",
        note: "Level after n half-lives = start ÷ 2ⁿ.",
        q: (v) => `A drug with a ${v.h} hour half-life is given at ${v.d} mg. How much remains after ${v.n} half-lives?`,
        a: (v) => `${v.d / (2 ** v.n)} mg`,
        e: (v) => `Each half-life halves the amount: ${v.d} ÷ 2 = ${v.d / 2}, then ÷ 2 = ${v.d / 4} ... after ${v.n} half-lives: ${v.d} ÷ 2^${v.n} = ${v.d / (2 ** v.n)} mg.`,
        distract: (v) => {
          const c = v.d / (2 ** v.n);
          return [`${(c * 2).toFixed(1)} mg`, `${(c * 3).toFixed(1)} mg`, `${(v.d - v.n * v.h).toFixed(1)} mg`, `${(c * 0.5).toFixed(1)} mg`, `${(c * 4).toFixed(1)} mg`];
        },
        vals: (rng) => ({ h: 2 + Math.floor(rng() * 10), d: 100 + Math.floor(rng() * 20) * 25, n: 1 + Math.floor(rng() * 4) }),
        whyWrong: (v) => [`Halve per half-life as powers of two; subtracting hours or linear decay are the classic traps.`],
        trick: "remaining = dose ÷ 2ⁿ.",
        tip: "Five half-lives clears about 97% of the drug."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
