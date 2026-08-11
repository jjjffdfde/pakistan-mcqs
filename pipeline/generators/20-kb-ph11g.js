/* ============================================================
   Phase 11 — KB Oral Pathology, Dental Surgery, Dental Medicine,
   Petroleum, Mining, Architecture.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

/* ---------------- ORAL PATHOLOGY ---------------- */
const oralPathology = {
  subjects: ["oral-pathology"],
  chapter: "Oral Pathology (Phase 11)",
  tags: ["oral-pathology", "deep-kb"],
  topics: {
    "Lesions and Conditions": [
      { kind: "fact", name: "oral pathology facts", note: "Common oral diseases.",
        facts: [
          ["What is dental caries?", "Decay of tooth structure", "Caries is bacterial acid demineralisation of enamel and dentin."],
          ["Which bacterium causes caries?", "Streptococcus mutans", "S. mutans ferments sugar into tooth-dissolving acid."],
          ["What is periodontitis?", "Inflammation of the tooth-supporting tissues", "Periodontitis deepens pockets and loses attachment."],
          ["What are aphthous ulcers?", "Painful benign mouth sores", "Aphthae recur and burn, healing without scars."],
          ["What is oral leukoplakia?", "A white patch that cannot be rubbed off", "Leukoplakia may be premalignant in some cases."],
          ["Which condition shows keratinised white patches on the cheeks?", "Oral lichen planus", "Lichen planus is an immune-mediated white lesion."],
          ["What is a dental cyst in the jaw?", "A fluid-filled sac in the bone", "Odontogenic cysts silently expand the jaw."],
          ["What is pulpitis?", "Inflammation of the dental pulp", "Caries reaching the pulp triggers painful pulpitis never?"]
        ],
        trick: "caries=Streptococcus, leukoplakia=white patch.",
        tip: "White-versus-red lesions is a classic oral pathology discriminator." },

      { kind: "pair", name: "lesion and feature", a: "lesion", b: "key feature",
        pairs: [["Leukoplakia", "White patch"], ["Erythroplakia", "Red patch"], ["Candidiasis", "Curd-like coating"],
          ["Herpes labialis", "Cold sore blisters"], ["Angular cheilitis", "Cracked lip corners"], ["Dental abscess", "Pus accumulation"]],
        outsiders: ["Gregory blue spot"],
        trick: "leuko=white, erythro=red, candida=thrush.",
        tip: "Colour names route the diagnosis." },

      { kind: "numeric", name: "caries demineralisation depth", difficulty: "easy",
        note: "Lost enamel depth = applied rate × duration.",
        q: (v) => `Acids demineralise enamel at ${v.rate} μm per ${v.dur} days. Over ${v.period} days, how many microns in total are lost?`,
        a: (v) => `${(v.rate * v.period / v.dur).toFixed(1)} μm`,
        e: (v) => `Loss = ${v.rate} × ${v.period} ÷ ${v.dur} = ${(v.rate * v.period / v.dur).toFixed(1)} μm, scaling the per-period rate to the whole span.`,
        distract: (v) => { const c = v.rate * v.period / v.dur; return [`${(c * 2).toFixed(1)} μm`, `${(c / 2).toFixed(1)} μm`, `${(v.rate * v.period).toFixed(1)} μm`, `${(c + 5).toFixed(1)} μm`, `${Math.max(0.1, (c - 5)).toFixed(1)} μm`]; },
        vals: (rng) => ({ rate: R(rng, 1, 30) / 10, dur: R(rng, 1, 5), period: R(rng, 30, 180) }),
        whyWrong: (v) => [`Scale the rate by the period ratio; omitting the period denominator overstates the loss.`],
        trick: "loss = rate × period / dur.",
        tip: "Watch unit ratios carefully." }
    ]
  }
};

/* ---------------- DENTAL SURGERY ---------------- */
const dentalSurgery = {
  subjects: ["dental-surgery"],
  chapter: "Dental Surgery (Phase 11)",
  tags: ["dental-surgery", "deep-kb", "oral-surgery"],
  topics: {
    "Extraction and Restoration": [
      { kind: "fact", name: "dental surgery facts", facts: [
        ["What is an extraction?", "Removing a tooth from the alveolus", "Forceps remove teeth by controlled luxation."],
        ["Which tooth is hardest to extract?", "The impacted lower third molar", "Deep impaction needs surgical sectioning."],
        ["What is a dental implant made of?", "Titanium", "Titanium osseointegrates with jaw bone."],
        ["What is osseointegration?", "The bond of implant to living bone", "Bone grows firmly around the titanium surface."],
        ["What is a dry socket?", "A painful complication after tooth removal", "Dry socket follows loss of the protective clot."],
        ["Which nerve can be damaged in lower molar surgery?", "The inferior alveolar nerve", "Temporary/lasting lip numbness may result."]
      ]
      },
      { kind: "pair", name: "instrument and use", a: "instrument", b: "role",
        pairs: [["Forceps", "Extract the tooth"], ["Elevator", "Loose the tooth"], ["Scalpel", "Incis surgery"],
          ["Bone rongeurs", "Trim bone"], ["Burs", "Cut tooth or bone"], ["Retractor", "Expose the field"]],
        outsiders: ["Oscilloscope"],
        trick: "elevator=loose tos, forceps=out.",
        tip: "Surgical latino prefix links tool to action." },

      { kind: "numeric", name: "implant torque ratio", difficulty: "easy",
        note: "Torque ratio = insertion torque ÷ target torque.",
        q: (v) => `An implant achieved ${v.ins} Ncm insertion torque against a target of ${v.target} Ncm. What is the insertion as a fraction of target?`,
        a: (v) => `${(v.ins / v.target).toFixed(2)}`,
        e: (v) => `Fraction = ${v.ins} ÷ ${v.target} = ${(v.ins / v.target).toFixed(2)}, measuring primary stability against target.`,
        distract: (v) => { const c = v.ins / v.target; return [`${(v.target / v.ins).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(c + 0.5).toFixed(2)}`, `${(c * 1.25).toFixed(2)}`]; },
        vals: (rng) => ({ ins: R(rng, 15, 50), target: R(rng, 30, 45) }),
        whyWrong: (v) => [`Divide insertion torque by target torque; reversing gives target per unit insertion.`],
        trick: "ratio = insertion / target.",
        tip: "Primary stability above 35 Ncm supports immediate loading." }
    ]
  }
};

/* ---------------- DENTAL MEDICINE ---------------- */
const dentalMedicine = {
  subjects: ["dental-medicine"],
  chapter: "Dental Medicine (Phase 11)",
  tags: ["dental-medicine", "deep-kb"],
  topics: {
    "Preventive and Therapeutic": [
      { kind: "fact", name: "dental medicine facts", facts: [
        ["Which element strengthens enamel?", "Fluoride", "Fluoride hardens enamel and inhibits caries."],
        ["What is dental plaque?", "A sticky microbial film on teeth", "Plaque biofilms begin decay without removal."],
        ["What is scaling?", "Removal of calculus above and below gums", "Scaling cleans deposits the brush cannot reach."],
        ["What is a cavity?", "A decayed hole in the tooth", "Cavities develop from untreated plaque acid."],
        ["Which condition is gum bleeding on probing?", "Gingivitis", "Gingivitis is reversible gum inflammation."],
        ["What is root canal therapy?", "Removing the infected pulp", "The root canal is cleaned and sealed."]
      ]
      },
      { kind: "numeric", name: "caries risk score", difficulty: "easy",
        note: "Sum commission-based risk points.",
        q: (v) => `A patient scores ${v.a} for plaque and ${v.b} for sugar intake. What is the combined factor score?`,
        a: (v) => `${v.a + v.b}`,
        e: (v) => `Combined = ${v.a} + ${v.b} = ${v.a + v.b}, summing the two risk contributors.`,
        distract: (v) => { const c = v.a + v.b; return [`${Math.abs(v.a - v.b)}`, `${c * 2}`, `${v.a * v.b}`, `${c + 5}`, `${c / 2}`]; },
        vals: (rng) => ({ a: R(rng, 1, 5), b: R(rng, 1, 5) }),
        whyWrong: (v) => [`Add the two risk components; multiplying or subtracting misstates the joint score.`],
        trick: "add both marks.",
        tip: "Caries risk = plaque + sugar share." },

      { kind: "numeric", name: "fluoride ppm calculation", difficulty: "easy",
        note: "ppm = (mg fluoride ÷ volume mL) × 1000.",
        q: (v) => `A mouthwash contains ${v.mg} mg fluoride in ${v.ml} mL. What is the concentration in ppm?`,
        a: (v) => `${(v.mg * 1000 / v.ml).toFixed(1)} ppm`,
        e: (v) => `ppm = ${v.mg} × 1000 ÷ ${v.ml} = ${(v.mg * 1000 / v.ml).toFixed(1)} ppm, converting mg/mL to parts per million.`,
        distract: (v) => { const c = v.mg * 1000 / v.ml; return [`${(v.mg / v.ml).toFixed(1)} ppm`, `${(c / 1000).toFixed(1)} ppm`, `${(c * 2).toFixed(1)} ppm`, `${(v.ml / v.mg).toFixed(1)} ppm`, `${(c + 100).toFixed(1)} ppm`]; },
        vals: (rng) => ({ mg: R(rng, 1, 10), ml: R(rng, 10, 100) }),
        whyWrong: (v) => [`Multiply mg by 1000 then divide by mL; omitting the 1000 factor gives mg/mL, not ppm.`],
        trick: "ppm = mg × 1000 / mL.",
        tip: "Standard fluoride mouthwash ≈ 225 ppm." },

      { kind: "numeric", name: "pit and fissure sealant coverage", difficulty: "easy",
        note: "Coverage % = sealed surfaces ÷ eligible surfaces × 100.",
        q: (v) => `A child has ${v.el} eligible molar surfaces and ${v.sl} are sealed. What is the sealant coverage percentage?`,
        a: (v) => `${(v.sl / v.el * 100).toFixed(1)}%`,
        e: (v) => `Coverage = ${v.sl} ÷ ${v.el} × 100 = ${(v.sl / v.el * 100).toFixed(1)}%, dividing sealed by eligible surfaces.`,
        distract: (v) => { const c = v.sl / v.el * 100; return [`${(v.el / v.sl * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 20).toFixed(1)}%`, `${(c - 15).toFixed(1)}%`]; },
        vals: (rng) => ({ el: R(rng, 8, 24), sl: R(rng, 0, 24) }),
        whyWrong: (v) => [`Divide sealed by eligible surfaces and multiply by 100; reversing gives ineligible rate.`],
        trick: "coverage = sealed / eligible × 100.",
        tip: "Target >80% sealant coverage in high-risk children." }
    ]
  }
};

/* ---------------- PETROLEUM ENGINEERING ---------------- */
const petroleum = {
  subjects: ["petroleum-engineering"],
  chapter: "Petroleum Engineering (Phase 11)",
  tags: ["petroleum-engineering", "deep-kb", "oil-gas"],
  topics: {
    "Reservoir and Drilling": [
      { kind: "fact", name: "petroleum facts", facts: [
        ["What is a reservoir?", "Porouus rock that holds hydrocarbons", "Oil and gas accumulate in porous caps."],
        ["Which formation holds oil at the top?", "The cap rock", "Impermeable cap rock traps the hydrocarbons."],
        ["What is crude oil refined to?", "Petrol, diesel, kerosene and fuels", "Distillation splits crude into fractions."],
        ["Which fossil fuel is natural gas dominantly made of?", "Methane", "Natural gas is mostly methane CH₄."],
        ["What is drilling mud for?", "Cooling and clearing the borehole", "Mud stabilises the hole while drilling."],
        ["What is an offshore platform?", "A rig that drills on the sea", "Offshore structures reach submarine fields."]
      ]
      },
      { kind: "numeric", name: "reservoir volume", difficulty: "medium",
        note: "Volume = area × thickness × porosity.",
        q: (v) => `A reservoir bed is ${v.w} m wide, ${v.h} m thick with porosity ${v.p}. If length is ${v.L} m, what is the pore volume in cubic metres?`,
        a: (v) => `${(v.w * v.L * v.h * v.p).toLocaleString("en-US")} m³`,
        e: (v) => `Pore volume = ${v.w} × ${v.L} × ${v.h} × ${v.p} = ${(v.w * v.L * v.h * v.p).toLocaleString("en-US")} m³, multiplying the three dimensions by porosity.`,
        distract: (v) => { const c = v.w * v.L * v.h * v.p; return [`${(v.w * v.L * v.h).toLocaleString("en-US")} m³`, `${(c * 0.5).toLocaleString("en-US")} m³`, `${(v.w + v.L + v.h).toLocaleString("en-US")} m³`, `${(c * 2).toLocaleString("en-US")} m³`, `${(c / v.p).toLocaleString("en-US")} m³`]; },
        vals: (rng) => ({ w: R(rng, 100, 400), L: R(rng, 200, 800), h: R(rng, 5, 30), p: R(rng, 15, 35) / 100 }),
        whyWrong: (v) => [`Multiply width × length × height × porosity for pore volume; omitting porosity gives bulk volume.`],
        trick: "pore Vol = dims × porosity.",
        tip: "Remember to include the decimal porosity." }
    ]
  }
};

/* ---------------- MINING ENGINEERING ---------------- */
const mining = {
  subjects: ["mining-engineering"],
  chapter: "Mining Engineering (Phase 11)",
  tags: ["mining-engineering", "deep-kb"],
  topics: {
    "Ore and Methods": [
      { kind: "fact", name: "mining facts", facts: [
        ["What is an ore?", "Rock with a valuable metal concentrate", "Ore is metal-bearing rock worth extracting."],
        ["Which mineral is the main source of iron?", "Haematite", "Haematite (Fe₂O₃) is the principal iron ore."],
        ["What is open-pit mining?", "Mining near the surface in a bench", "Surface boxes remove ore close to the ground."],
        ["What is shaft mining?", "Digging a vertical shaft to the ore", "Deep ores need shafts and galleries."],
        ["What is tailings?", "The leftover waste after milling", "Tailings are the rock residue after ore recovery."],
        ["Which method uses underground tunnels to ore?", "Drift mining", "Horizontal drifts reach seam deposits."]
      ]
      },
      { kind: "pair", name: "metal and its ore", a: "metal", b: "main ore",
        pairs: [["Iron", "Haematite"], ["Aluminium", "Bauxite"], ["Copper", "Chalcopyrite"], ["Zinc", "Sphalerite"],
          ["Lead", "Galena"], ["Tin", "Cassiterite"]],
        outsiders: ["Calcium powder"],
        trick: "iron=Haem, Al=Baux, Cu=Chalc.",
        tip: "Ore-name dyads come up repeatedly in mining papers." },

      { kind: "numeric", name: "stripping ratio", difficulty: "easy",
        note: "Stripping ratio = waste volume ÷ ore volume.",
        q: (v) => `An open pit removes ${v.w} tonnes of waste rock to extract ${v.o} tonnes of ore. What is the stripping ratio?`,
        a: (v) => `${(v.w / v.o).toFixed(2)}:1`,
        e: (v) => `Stripping ratio = waste/ore = ${v.w} ÷ ${v.o} = ${(v.w / v.o).toFixed(2)}:1, dividing waste tonnes by ore tonnes.`,
        distract: (v) => { const c = v.w / v.o; return [`${(v.o / v.w).toFixed(2)}:1`, `${(c * 2).toFixed(2)}:1`, `${(c / 2).toFixed(2)}:1`, `${(c + 1).toFixed(2)}:1`, `${(c * 1.5).toFixed(2)}:1`]; },
        vals: (rng) => ({ w: R(rng, 1000, 50000), o: R(rng, 500, 10000) }),
        whyWrong: (v) => [`Divide waste by ore tonnes; inverting gives ore per unit waste.`],
        trick: "stripping ratio = waste / ore.",
        tip: "Higher stripping ratios make surface mining less economical." }
    ]
  }
};

/* ---------------- ARCHITECTURE ---------------- */
const architecture = {
  subjects: ["architecture"],
  chapter: "Architecture (Phase 11)",
  tags: ["architecture", "deep-kb"],
  topics: {
    "Design and History": [
      { kind: "fact", name: "architecture facts", facts: [
        ["What does the bathroom's area allow?", "Ventilation and drainage service", "Bathrooms need utilities and air flow."],
        ["Which style has flying buttresses?", "Gothic", "Gothic architecture pioneered the buttress."],
        ["What is a blueprint?", "A technical drawing of a building", "Blueprints specify shape, size and systems."],
        ["Which element carries load beams to the ground?", "The columns and beams", "The structure transfers load through the frame."],
        ["What is a courtyard?", "An outdoor space enclosed by building", "Courtyards open light and air in dense plans."],
        ["Which architect concept uses a five foot square grid?", "The Mc modular grid", "A grid governs column placement and rhythm."],
        ["Which ancient people gave the arch and aqueduct?", "The Romans", "Rome mastered the true arch and aqueduct."]
      ]
      },
      { kind: "numeric", name: "area from footprint", difficulty: "easy",
        note: "Floor area = length × width.",
        q: (v) => `A room is ${v.l} m long and ${v.w} m wide. What is the floor area?`,
        a: (v) => `${v.l * v.w} m²`,
        e: (v) => `Area = ${v.l} × ${v.w} = ${v.l * v.w} m², the length times the width.`,
        distract: (v) => { const c = v.l * v.w; return [`${2 * (v.l + v.w)} m²`, `${c * 2} m²`, `${v.l + v.w} m²`, `${c / 2} m²`, `${v.l - v.w} m²`]; },
        vals: (rng) => ({ l: R(rng, 3, 15), w: R(rng, 3, 15) }),
        whyWrong: (v) => [`Multiply length and width for area; the perimeter sums the four walls instead.`],
        trick: "area = l × w.",
        tip: "Area is squared, perimeter is linear." }
    ]
  }
};

module.exports = [makeKbGen(oralPathology), makeKbGen(dentalSurgery), makeKbGen(dentalMedicine), makeKbGen(petroleum), makeKbGen(mining), makeKbGen(architecture)];
