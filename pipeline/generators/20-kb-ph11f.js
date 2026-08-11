/* ============================================================
   Phase 11 — KB Forensic Medicine, Dental (materials/anatomy/
   histology), Nutrition, Public Health.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

/* ---------------- FORENSIC MEDICINE ---------------- */
const forensic = {
  subjects: ["forensic-medicine"],
  chapter: "Forensic Medicine and Toxicology (Phase 11)",
  tags: ["forensic-medicine", "deep-kb", "toxicology", "medico-legal"],
  topics: {
    "Medico-Legal Basics": [
      { kind: "fact", name: "forensic facts", note: "Core medico-legal doctrine.",
        facts: [
          ["What is forensic medicine?", "The application of medical knowledge to legal questions", "Forensic medicine aids the courts through evidence."],
          ["Who performs a medicolegal autopsy?", "A forensic pathologist", "The forensic pathologist determines cause and manner of death."],
          ["What is rigor mortis?", "Post-mortem stiffening of muscles", "Rigor starts within hours of death and peaks by 12 hours."],
          ["What is livor mortis?", "Purple settling of blood after death", "Livor develops as blood pools in dependent areas."],
          ["What is algor mortis?", "Falling of body temperature after death", "Body cools at a fairly regular rate after death."],
          ["What is the coroner system?", "A legal officer who investigates deaths", "Coroners hold inquests into unexpected deaths."],
          ["What is a post-mortem interval?", "The time elapsed since death", "It is estimated from rigor, livor, algor and stomach contents."],
          ["What is an exhumation?", "The lawful removal of a buried body", "Exhumation reopens a case on court order."]
        ],
        trick: "rigor then livor then algor.",
        tip: "Time-since-death markers anchor forensic questions." },

      { kind: "pair", name: "poison and antidote", a: "poison", b: "antidote",
        pairs: [["Organophosphates", "Atropine"], ["Paracetamol", "N-acetylcysteine"], ["Iron", "Deferoxamine"],
          ["Methanol", "Ethanol"], ["Cyanide", "Sodium nitrite"], ["Warfarin", "Vitamin K"]],
        outsiders: ["Plain water"],
        trick: "organo=atropine, paracetamol=NAC, methanol=ethanol.",
        tip: "Antidote pairings are favourite bank questions." },

      { kind: "pair", name: "injury and type", a: "wound", b: "mechanism",
        pairs: [["Abrasion", "Grazing friction"], ["Laceration", "Tearing blunt force"], ["Incision", "Cut from a sharp edge"],
          ["Contusion", "Blunt force bruising"], ["Stab wound", "Penetration by a sharp weapon"], ["Gunshot wound", "Projectile passage"]],
        outsiders: ["Chemical swelling"],
        trick: "abrasion=friction, lac=tear, stab=pen.",
        tip: "Wound naming follows the weapon and mechanism." },

      { kind: "numeric", name: "estimated time since death (cooling)", difficulty: "medium",
        note: "Hours = (normal − measured) ÷ cooling rate.",
        q: (v) => `A corpse has a rectal temperature of ${v.t} °C, normal is 37 °C and cooling is ${v.c} °C/hour. What is the estimated time since death?`,
        a: (v) => `${((37 - v.t) / v.c).toFixed(1)} h`,
        e: (v) => `Time = (37 − ${v.t}) ÷ ${v.c} = ${((37 - v.t) / v.c).toFixed(1)} hours, dividing the cooling fall by the hourly rate.`,
        distract: (v) => { const c = (37 - v.t) / v.c; return [`${(37 - v.t).toFixed(1)} h`, `${(c * 2).toFixed(1)} h`, `${(t0 => (t0 / v.c).toFixed(1))(v.t)} h`, `${(c / 2).toFixed(1)} h`, `${(c + 3).toFixed(1)} h`]; },
        vals: (rng) => ({ t: R(rng, 15, 35), c: R(rng, 8, 20) / 10 }),
        whyWrong: (v) => [`Divide the temperature gap by the rate; leaving the gap undivided misstates the hour estimate.`],
        trick: "hours = (37 − T) / rate.",
        tip: "Cooling assumes the ambient temperature is lower than the body." }
    ]
  }
};

/* ---------------- ORAL ANATOMY ---------------- */
const oralAnatomy = {
  subjects: ["oral-anatomy"],
  chapter: "Oral Anatomy (Phase 11)",
  tags: ["oral-anatomy", "deep-kb", "dental-anatomy"],
  topics: {
    "Teeth and Structure": [
      { kind: "fact", name: "tooth morphology facts", note: "Permanent tooth essentials.",
        facts: [
          ["How many permanent teeth does a human have?", "32", "32 permanent teeth include 8 incisors, 4 canines, 8 premolars and 12 molars."],
          ["How many deciduous (milk) teeth does a child have?", "20", "20 primary teeth are replaced by the permanent set."],
          ["Which is usually the last tooth to erupt?", "The third molar (wisdom tooth)", "Wisdom teeth typically erupt around 17 to 21 years."],
          ["What is occlusion?", "The bite contact between upper and lower teeth", "Occlusion describes how opposing teeth meet."],
          ["Which teeth are specialised for cutting?", "The incisors", "Incisors shear and cut bites of food."],
          ["Which tooth is specialised for tearing?", "The canine", "Canines grip and tear food with one cusp."],
          ["Which teeth are used for grinding?", "The molars", "Molar cusps grind food before swallowing."]
        ],
        trick: "incisors=cut, canine=tear, molar=grind.",
        tip: "Know the function of each tooth type." },

      { kind: "numeric", name: "dental quadrant", difficulty: "easy",
        note: "Total teeth = 2 × sum of one quadrant.",
        q: (v) => `One quadrant holds ${v.i} incisors, ${v.c} canines and ${v.m} molars. What is the total dental count?`,
        a: (v) => `${2 * (v.i + v.c + v.m)}`,
        e: (v) => `Total = 2 × (${v.i} + ${v.c} + ${v.m}) = ${2 * (v.i + v.c + v.m)}, doubling the quadrant count.`,
        distract: (v) => { const c = v.i + v.c + v.m; return [`${c}`, `${c * 3}`, `${c * 4}`, `${c + 8}`, `${c * 2 + 1}`]; },
        vals: (rng) => ({ i: R(rng, 1, 2), c: R(rng, 1, 2), m: R(rng, 1, 3) }),
        whyWrong: (v) => [`Double the quadrant sum for both jaws; using the quadrant only halves the total.`],
        trick: "total = 2 × quadrant.",
        tip: "The adult set is 32; a quadrant holds 8." },

      { kind: "numeric", name: "eruption age estimate", difficulty: "easy",
        note: "Eruption age varies by tooth type.",
        q: (v) => `A tooth typically erupts at ${v.base} months. In this child it erupted ${v.diff} months late. At what age did it appear?`,
        a: (v) => `${v.base + v.diff} months`,
        e: (v) => `Eruption age = ${v.base} + ${v.diff} = ${v.base + v.diff} months, adding the delay to the typical age.`,
        distract: (v) => { const c = v.base + v.diff; return [`${Math.max(1, c - v.diff)} months`, `${c + 6} months`, `${v.base - v.diff} months`, `${c * 2} months`, `${c / 2} months`]; },
        vals: (rng) => ({ base: R(rng, 6, 18), diff: R(rng, -4, 12) }),
        whyWrong: (v) => [`Add the delay to the baseline age; subtracting would give an earlier eruption.`],
        trick: "actual = typical + delay.",
        tip: "Eruption timing varies widely among children." },

      { kind: "numeric", name: "root canal length calc", difficulty: "medium",
        note: "Working length = radiographic length − 1 mm safety.",
        q: (v) => `Radiographic tooth length is ${v.rl} mm. What is the working length (minus 1 mm safety)?`,
        a: (v) => `${v.rl - 1} mm`,
        e: (v) => `Working length = ${v.rl} − 1 = ${v.rl - 1} mm, subtracting the safety margin from the radiographic apex.`,
        distract: (v) => { const c = v.rl - 1; return [`${v.rl + 1} mm`, `${c + 2} mm`, `${v.rl} mm`, `${c - 1} mm`, `${v.rl / 2} mm`]; },
        vals: (rng) => ({ rl: R(rng, 15, 30) }),
        whyWrong: (v) => [`Subtract 1 mm from radiographic length; adding increases the risk of over-instrumentation.`],
        trick: "working = radiographic − 1.",
        tip: "Electronic apex locators confirm working length." }
    ]
  }
};

/* ---------------- ORAL HISTOLOGY ---------------- */
const oralHistology = {
  subjects: ["oral-histology"],
  chapter: "Oral Histology (Phase 11)",
  tags: ["oral-histology", "deep-kb"],
  topics: {
    "Tissues of the Mouth": [
      { kind: "fact", name: "oral tissue facts", facts: [
        ["Which is the hardest tissue in the body?", "Tooth enamel", "Enamel is acellular and the most mineralised tissue."],
        ["What is dentin made mostly of?", "Hydroxyapatite crystals", "Dentin is mineralised collagen, less dense than enamel."],
        ["What is the pulp?", "The living centre tissue of the tooth", "Pulp holds nerves, vessels and specialised cells."],
        ["What covers the tooth root surface?", "Cementum", "Cementum covers the root below the gum margin."],
        ["What holds the tooth in its socket?", "Periodontal ligament", "The PDL anchors cementum to alveolar bone."],
        ["What is gingiva?", "The gum covering the alveolar bone", "Gingiva lines the visible part of the jaw."],
        ["Which cells make dentin?", "Odontoblasts", "Odontoblasts secrete the dentin matrix."]
      ]
      },
      { kind: "pair", name: "tissue and main cell", a: "tissue", b: "main cell",
        pairs: [["Enamel", "Ameloblasts"], ["Dentin", "Odontoblasts"], ["Cementum", "Cementocytes"],
          ["Pulp", "Fibroblasts"], ["Alveolar bone", "Osteocytes"], ["Periodontal ligament", "Fibroblasts"]],
        outsiders: ["Hepatocytes"],
        trick: "enamel=Amel, dentin=Odont, cement=Cementocyte.",
        tip: "Each hard tissue pairs with one forming cell." },

      { kind: "numeric", name: "enamel thickness ratio", difficulty: "easy",
        note: "Ratio = enamel thickness ÷ dentin thickness.",
        q: (v) => `Enamel measures ${v.e} μm and dentin ${v.d} μm at a section. What is enamel as a fraction of dentin?`,
        a: (v) => `${(v.e / v.d).toFixed(2)}`,
        e: (v) => `Fraction = ${v.e} ÷ ${v.d} = ${(v.e / v.d).toFixed(2)}, comparing the enamel thickness to dentin.`,
        distract: (v) => { const c = v.e / v.d; return [`${(v.d / v.e).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(v.d - v.e).toFixed(2)}`, `${(c * 1.5).toFixed(2)}`]; },
        vals: (rng) => ({ e: R(rng, 100, 2500), d: R(rng, 500, 4000) }),
        whyWrong: (v) => [`Divide enamel by dentin; reversing the values gives the opposite ratio.`],
        trick: "ratio = enamel ÷ dentin.",
        tip: "Enamel is thinner on the cervical portion." }
    ]
  }
};

/* ---------------- DENTAL MATERIALS ---------------- */
const dentalMaterials = {
  subjects: ["dental-materials"],
  chapter: "Dental Materials Science (Phase 11)",
  tags: ["dental-materials", "deep-kb", "biomaterials"],
  topics: {
    "Filling and Cement": [
      { kind: "fact", name: "dental materials facts", none: "Tooth-coloured and metal restoratives.",
        facts: [
          ["Which is a common tooth-coloured filling material?", "Composite resin", "Composite is quartz filler in a resin matrix."],
          ["What metal forms amalgam fillings?", "A silver-mercury alloy", "Amalgam is an alloy of silver and mercury."],
          ["What is glass-ionomer cement used for?", "Cementing and lining", "Glass ionomer bonds to tooth and releases fluoride."],
          ["Which material is used for a crown impression?", "Elastomeric silicone", "Silicone impressions reproduce fine detail."],
          ["What does a crown restore?", "The exposed part of the tooth", "Crowns restore function and appearance."],
          ["Which cement lutes a crown?", "Zinc phosphate or resin cement", "Cements seal and retain the restoration."],
          ["What is a noble metal alloy high in?", "Precision and corrosion resistance", "Gold alloys cast accurately and corrode little."]
        ]
      },
      { kind: "numeric", name: "metal fraction", difficulty: "easy",
        note: "Fraction = metal weight ÷ total weight.",
        q: (v) => `A casting uses ${v.a} g of one metal and ${v.b} g of another. What fraction of the whole is the first metal?`,
        a: (v) => `${(v.a / (v.a + v.b)).toFixed(2)}`,
        e: (v) => `Fraction = ${v.a} ÷ (${v.a} + ${v.b}) = ${(v.a / (v.a + v.b)).toFixed(2)}, the first metal's share of the total.`,
        distract: (v) => { const c = v.a / (v.a + v.b); return [`${(v.b / (v.a + v.b)).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c * 0.5).toFixed(2)}`, `${(v.a / v.b).toFixed(2)}`, `${(1 - c).toFixed(2)}`]; },
        vals: (rng) => ({ a: R(rng, 20, 80), b: R(rng, 20, 80) }),
        whyWrong: (v) => [`Divide the first metal by the total, not by the other metal alone.`],
        trick: "fraction = part / whole.",
        tip: "Alloy numbers are weight fractions." }
    ]
  }
};

/* ---------------- NUTRITION ---------------- */
const nutrition = {
  subjects: ["nutrition"],
  chapter: "Nutrition and Dietetics (Phase 11)",
  tags: ["nutrition", "deep-kb", "dietetics"],
  topics: {
    "Diet and Requirement": [
      { kind: "fact", name: "nutrition facts", note: "Energy and minerals.",
        facts: [
          ["How many calories per gram of carbohydrate?", "4 kcal/g", "Carbohydrates give 4 calories per gram."],
          ["How many calories per gram of protein?", "4 kcal/g", "Protein gives 4 calories per gram."],
          ["How many calories per gram of fat?", "9 kcal/g", "Fat is the most energy-dense nutrient."],
          ["Which vitamin is synthesised in sunlight?", "Vitamin D", "Skin makes vitamin D on UV exposure."],
          ["Which mineral forms haemoglobin?", "Iron", "Iron is central to the oxygen-carrying protein."],
          ["Which vitamin prevents scurvy?", "Vitamin C", "Ascorbate deficiency causes scurvy gum bleeding."],
          ["Which deficiency causes night blindness?", "Vitamin A", "Retinal needs vitamin A for dark vision."],
          ["Which mineral builds bone with calcium?", "Phosphorus", "Bone is a hydroxyapatite of calcium and phosphate."]
      ]
      },
      { kind: "numeric", name: "energy from meal", difficulty: "easy",
        note: "Energy = P×4 + C×4 + F×9.",
        q: (v) => `A meal has ${v.p} g protein, ${v.c} g carbohydrate and ${v.f} g fat. Total energy in kcal?`,
        a: (v) => `${v.p * 4 + v.c * 4 + v.f * 9}`,
        e: (v) => `Energy = ${v.p}×4 + ${v.c}×4 + ${v.f}×9 = ${v.p * 4 + v.c * 4 + v.f * 9} kcal.`,
        distract: (v) => { const s = v.p * 4 + v.c * 4 + v.f * 9; return [`${v.p + v.c + v.f} kcal`, `${s * 2} kcal`, `${s / 2} kcal`, `${(v.p + v.c) * 4 + v.f * 4} kcal`, `${s + 50} kcal`]; },
        vals: (rng) => ({ p: R(rng, 5, 30), c: R(rng, 20, 90), f: R(rng, 5, 30) }),
        whyWrong: (v) => [`Multiply each macro by its caloric density and sum; adding grams mixed up calories.`],
        trick: "4-4-9 rule.",
        tip: "Fat 9, carbs and protein 4 kcal." }
    ]
  }
};

/* ---------------- PUBLIC HEALTH ---------------- */
const publicHealth = {
  subjects: ["public-health"],
  chapter: "Public Health and Epidemiology (Phase 11)",
  tags: ["public-health", "deep-kb", "epidemiology"],
  topics: {
    "Disease Distribution": [
    { kind: "fact", name: "public health facts", facts: [
      ["What is epidemiology?", "The study of disease distribution in populations", "Epidemiology tracks patterns and risk factors."],
      ["What is incidence?", "New cases in a given period", "Incidence counts newly occurring cases."],
      ["What is prevalence?", "All existing cases at a point in time", "Prevalence includes all carrying cases."],
      ["What is herd immunity?", "Population protection when enough are immunity", "Herd immunity slows the spread."],
      ["What is a vaccine's goal?", "Prevent the disease in the person", "Vaccines train the immunity to attack the organism."],
      ["What is a fomite?", "An inanimate object that spreads infection", "Fomites carry microbes between hosts."],
      ["Which vector spreads malaria?", "The anopheles mosquito", "Malaria is transmitted by the female mosquito."]
    ]
    },
    { kind: "numeric", name: "prevalence proportion", difficulty: "easy",
      note: "Prevalence = cases ÷ population × 100.",
      q: (v) => `${v.cases} cases out of ${v.pop} people. What is the prevalence per 100?`,
      a: (v) => `${(v.cases / v.pop * 100).toFixed(1)}`,
      e: (v) => `Prevalence = ${v.cases} ÷ ${v.pop} × 100 = ${(v.cases / v.pop * 100).toFixed(1)} per 100.`,
      distract: (v) => { const c = v.cases / v.pop; return [`${(c * 1000).toFixed(1)}`, `${(c * 10).toFixed(1)}`, `${(v.pop / v.cases * 100).toFixed(1)}`, `${(c * 100 + 1).toFixed(1)}`, `${(v.cases / v.pop).toFixed(2)}`]; },
      vals: (rng) => ({ cases: R(rng, 5, 50), pop: R(rng, 200, 2000) }),
      whyWrong: (v) => [`Cases divided by population times 100 gives per-cent prevalence; reversing them miscounts.`],
      trick: "cases / pop × 100.",
      tip: "Prevalence is a snapshot, incidence is a rate." }
    ]
  }
};

module.exports = [makeKbGen(forensic), makeKbGen(oralAnatomy), makeKbGen(oralHistology), makeKbGen(dentalMaterials), makeKbGen(nutrition), makeKbGen(publicHealth)];
