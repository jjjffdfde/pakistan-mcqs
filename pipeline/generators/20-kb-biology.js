/* ============================================================
   Deep Knowledge KB — Biology
   Cells, genetics, human body, plants + numeric biology topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["biology"],
  chapter: "Biology — Deep Knowledge Bank",
  tags: ["biology", "deep-kb", "cells", "genetics", "human-body", "plants"],
  topics: {

    "Cell Biology": [
      {
        kind: "pair", a: "cell structure", b: "its function",
        note: "Cell organelle-function pairs are fundamental biology.",
        pairs: [
          ["Nucleus", "controls the cell and stores DNA"], ["Mitochondria", "release energy through respiration"], ["Ribosomes", "make proteins"],
          ["Cell membrane", "controls what enters and leaves the cell"], ["Chloroplast", "carries out photosynthesis"], ["Vacuole", "stores water and nutrients"]
        ],
        trick: "Mitochondria=powerhouse, ribosomes=protein factory, chloroplast=photosynthesis.",
        tip: "The mitochondrion and chloroplast pair anchor most cell questions."
      },
      {
        kind: "fact", name: "cell biology facts",
        note: "Key cell biology facts from O/A-level and GK exam pools.",
        facts: [
          ["What is the powerhouse of the cell?", "Mitochondria", "Mitochondria produce ATP through cellular respiration, earning the nickname powerhouse of the cell."],
          ["Which organelle performs photosynthesis?", "Chloroplast", "Chloroplasts contain chlorophyll and convert light energy into chemical energy during photosynthesis."],
          ["What is the basic unit of life?", "The cell", "The cell is the structural and functional unit of all living organisms, as stated by cell theory."],
          ["Who discovered the cell?", "Robert Hooke", "Robert Hooke first described cells in 1665 while examining cork under a microscope."],
          ["Who proposed the cell theory?", "Schleiden and Schwann", "Schleiden and Schwann proposed the cell theory, stating all living things are made of cells."],
          ["What is the fluid inside the cell called?", "Cytoplasm", "Cytoplasm is the jelly-like fluid that fills the cell and holds its organelles."],
          ["Which structure controls what enters the cell?", "Cell membrane", "The cell membrane is selectively permeable, controlling entry and exit of substances."],
          ["Which organelle stores genetic material?", "The nucleus", "The nucleus contains chromosomes made of DNA, the genetic blueprint of the cell."],
          ["Which cell structure carries out protein synthesis?", "Ribosomes", "Ribosomes, found free or on rough ER, assemble proteins from amino acids."],
          ["Which part of the cell is the site of cellular respiration?", "Mitochondria", "Mitochondria carry out aerobic respiration, releasing energy stored in glucose."],
          ["What is the jelly-like substance in plant cells that maintains turgor?", "Vacuole (cell sap)", "The large central vacuole holds cell sap and creates turgor pressure that keeps plants firm."],
          ["Which organelle is found only in plant cells?", "Chloroplast", "Chloroplasts, along with cell wall and large vacuole, distinguish plant from animal cells."]
        ],
        trick: "Hooke 1665 cork; Schleiden+Schwann theory; mitochondria=powerhouse; chloroplast=only in plants.",
        tip: "Scientist-date pairs (Hooke 1665) are classic recall items."
      },
      {
        kind: "tf", name: "cell biology statements",
        note: "True/false stems on cell structure.",
        statements: [
          ["Mitochondria release energy for the cell.", "Chloroplasts release energy in animal cells."],
          ["The cell membrane is selectively permeable.", "The cell membrane blocks all substances completely."],
          ["Plant cells have a cell wall, animal cells do not.", "Animal cells have a thicker cell wall than plant cells."],
          ["Ribosomes make proteins.", "Ribosomes store genetic information."],
          ["Robert Hooke first described cells.", "Charles Darwin first described cells."]
        ],
        trick: "Energy=mitochondria, proteins=ribosomes, plants=cell wall+chloroplast.",
        tip: "Swap structure↔function and the statement becomes false."
      },
      {
        kind: "numeric", name: "magnification calculations", difficulty: "easy",
        note: "Magnification = observed size ÷ actual size, or eyepiece × objective lens powers.",
        q: (v) => `A microscope has an eyepiece lens of ×${v.e} and an objective lens of ×${v.o}. What is the total magnification?`,
        a: (v) => `${v.e * v.o}×`,
        e: (v) => `Total magnification = eyepiece × objective, so ${v.e} × ${v.o} = ${v.e * v.o}×, because the two lenses multiply their powers.`,
        distract: (v) => [`${v.e + v.o}×`, `${v.e * v.o * 2}×`, `${Math.round(v.e * v.o / 2)}×`, `${v.o * 10}×`, `${v.e * v.o + 5}×`],
        vals: (rng) => {
          const e = [5, 10, 15][Math.floor(rng() * 3)];
          const o = [4, 10, 40, 100][Math.floor(rng() * 4)];
          return { e, o };
        },
        whyWrong: (v) => [`Lenses multiply, not add; ${v.e}×${v.o} gives ${v.e * v.o}, and summing the powers is the classic trap.`],
        trick: "Total = eyepiece × objective (multiply, never add).",
        tip: "10×40 = 400× is the standard combination seen in exams."
      }
    ],

    "Human Body Systems": [
      {
        kind: "pair", a: "body system", b: "its function",
        note: "Organ-system function pairs are guaranteed exam content.",
        pairs: [
          ["Circulatory system", "transports blood, oxygen and nutrients"], ["Respiratory system", "exchanges oxygen and carbon dioxide"],
          ["Digestive system", "breaks down food into absorbable nutrients"], ["Nervous system", "transmits signals and controls the body"],
          ["Excretory system", "removes waste products from the blood"], ["Endocrine system", "releases hormones into the blood"]
        ],
        trick: "Circulate=transport, respire=gas exchange, digest=breakdown, endocrine=hormones.",
        tip: "Endocrine↔hormones is the most commonly missed pair."
      },
      {
        kind: "fact", name: "human body facts",
        note: "The most repeated human anatomy and physiology facts.",
        facts: [
          ["Which organ pumps blood around the body?", "The heart", "The heart is a muscular pump with four chambers that drives blood through arteries and veins."],
          ["What is the largest organ of the human body?", "The skin", "The skin, about 1.5-2 m², is the body's largest organ and first defence against infection."],
          ["What is the smallest bone in the human body?", "The stapes (stirrup)", "The stapes in the middle ear is the smallest bone, about 3 mm long."],
          ["Which organ filters waste from the blood?", "The kidney", "Kidneys filter blood, remove urea and excess water, and produce urine."],
          ["Which blood cells fight infection?", "White blood cells", "White blood cells (leucocytes) defend the body by engulfing or producing antibodies against pathogens."],
          ["Which blood cells carry oxygen?", "Red blood cells", "Red blood cells carry oxygen using haemoglobin, which contains iron."],
          ["What is the normal resting heart rate of an adult?", "60-100 beats per minute", "A healthy adult resting heart rate is 60-100 bpm, varying with fitness and age."],
          ["What is the normal human body temperature?", "37°C", "Normal body temperature is about 37°C (98.6°F), maintained by the hypothalamus."],
          ["Which part of the brain controls balance and coordination?", "The cerebellum", "The cerebellum coordinates voluntary movement and balance, sitting at the rear of the brain beneath the cerebrum."],
          ["Which part of the brain controls breathing and heartbeat?", "The medulla oblongata", "The medulla oblongata in the brainstem regulates involuntary vital functions like breathing."],
          ["Which gas is absorbed by blood in the lungs?", "Oxygen", "Alveoli in the lungs exchange oxygen into the blood and carbon dioxide out of it."],
          ["How many bones are in the adult human body?", "206", "An adult has 206 bones; infants have about 300 which fuse during growth."]
        ],
        trick: "Skin largest, stapes smallest, 206 bones, 37°C, medulla=vital reflexes, cerebellum=balance.",
        tip: "The 'most' facts (largest/smallest organs, 206 bones) are top-yield items."
      },
      {
        kind: "numeric", name: "heart rate calculations", difficulty: "easy",
        note: "Pulse-based calculations: cardiac output = heart rate × stroke volume.",
        q: (v) => `A patient's heart beats at ${v.hr} beats per minute and each beat pumps ${v.sv} mL of blood. What is the cardiac output per minute?`,
        a: (v) => `${v.hr * v.sv} mL/min`,
        e: (v) => `Cardiac output = heart rate × stroke volume, so ${v.hr} × ${v.sv} = ${v.hr * v.sv} mL/min, because each minute the heart pumps the stroke volume for every beat.`,
        distract: (v) => [`${Math.round(v.hr * v.sv / 1000)} L/min`, `${v.hr + v.sv} mL/min`, `${Math.round(v.hr * v.sv * 0.9)} mL/min`, `${Math.round(v.hr * v.sv / 2)} mL/min`, `${v.hr * v.sv + 500} mL/min`],
        vals: (rng) => {
          const hr = 60 + Math.floor(rng() * 40);
          const sv = 50 + Math.floor(rng() * 30);
          return { hr, sv };
        },
        whyWrong: (v) => [`Cardiac output multiplies rate and stroke volume; adding them or halving the product are the standard traps.`],
        trick: "CO = HR × SV — beats per minute times mL per beat.",
        tip: "1 L = 1000 mL; the L/min option is the unit-conversion trap."
      },
      {
        kind: "numeric", name: "BMI calculations", difficulty: "easy",
        note: "BMI = mass (kg) ÷ height² (m²).",
        q: (v) => `A person has a mass of ${v.m} kg and height of ${v.h} m. What is their BMI to one decimal place?`,
        a: (v) => `${(v.m / (v.h * v.h)).toFixed(1)}`,
        e: (v) => `BMI = mass ÷ height², so ${v.m} ÷ ${(v.h * v.h).toFixed(2)} = ${(v.m / (v.h * v.h)).toFixed(1)}, because height is squared before dividing the mass.`,
        distract: (v) => {
          const c = v.m / (v.h * v.h);
          return [`${(v.m / v.h).toFixed(1)}`, `${(c * 2).toFixed(1)}`, `${(c + 3).toFixed(1)}`, `${(v.m - v.h * 100).toFixed(1)}`, `${(c * 10).toFixed(1)}`];
        },
        vals: (rng) => {
          const m = 45 + Math.floor(rng() * 50);
          const h = Math.round((1.45 + rng() * 0.35) * 100) / 100;
          return { m, h };
        },
        whyWrong: (v) => [`Squaring the height is essential; dividing by height alone (or mis-squaring) gives the wrong BMI.`],
        trick: "BMI = kg ÷ m² — square the height first.",
        tip: "18.5-24.9 is the healthy BMI range for adults."
      },
      {
        kind: "numeric", name: "gene probability", difficulty: "hard",
        note: "Mendelian monohybrid crosses: a Tt × Tt cross gives 25% TT, 50% Tt, 25% tt.",
        q: (v) => `In a monohybrid cross between two heterozygous (Tt) parents, what fraction of offspring are expected to be heterozygous (Tt)?`,
        a: (v) => `1/2 (50%)`,
        e: (v) => `The Punnett square of Tt × Tt gives TT, Tt, Tt, tt, so 2 of 4 boxes are Tt, which is 1/2 or 50%, because each parent contributes one allele randomly.`,
        distract: (v) => ["1/4 (25%)", "3/4 (75%)", "1/1 (100%)", "1/8 (12.5%)", "2/3 (67%)"],
        vals: (rng) => ({}),
        whyWrong: (v) => [`TT and tt each fill one box while Tt fills two, so the heterozygous fraction is 1/2, not 1/4.`],
        trick: "Heterozygous × heterozygous → 1:2:1 genotype ratio; 2/4 are hybrids.",
        tip: "The 3:1 phenotype ratio and 1:2:1 genotype ratio are the two anchors of monohybrid crosses."
      }
    ],

    "Plants and Environment": [
      {
        kind: "fact", name: "plant biology facts",
        note: "Photosynthesis, transport and plant structure facts.",
        facts: [
          ["What is the green pigment in plants?", "Chlorophyll", "Chlorophyll in chloroplasts absorbs light energy and gives plants their green colour."],
          ["What is the process of making food in plants called?", "Photosynthesis", "Photosynthesis converts carbon dioxide and water into glucose and oxygen using light energy."],
          ["What is the word equation of photosynthesis?", "Carbon dioxide + water → glucose + oxygen", "Photosynthesis uses sunlight energy to turn CO₂ and water into glucose, releasing oxygen."],
          ["Which gas do plants take in during photosynthesis?", "Carbon dioxide", "Plants absorb CO₂ through stomata for photosynthesis during the day."],
          ["Which gas do plants release during photosynthesis?", "Oxygen", "Oxygen is released as a by-product when plants photosynthesise."],
          ["Which tubes carry water up a plant?", "Xylem", "Xylem vessels transport water and minerals from roots to leaves."],
          ["Which tubes carry food made in the leaves?", "Phloem", "Phloem transports sugars from leaves to the rest of the plant, in both directions."],
          ["Which plant hormone causes phototropism?", "Auxin", "Auxin accumulates on the shaded side and bends the shoot towards light."],
          ["What is the movement of a plant towards light called?", "Phototropism", "Phototropism is directional growth in response to light, controlled by auxin."],
          ["What is the movement of roots towards water called?", "Hydrotropism", "Hydrotropism is root growth towards moisture, helping plants find water."]
        ],
        trick: "Xylem=water up, phloem=food both ways, auxin=phototropism, chlorophyll=green pigment.",
        tip: "Xylem vs phloem is the single most asked plant question."
      },
      {
        kind: "tf", name: "plant biology statements",
        note: "True/false stems on plant processes.",
        statements: [
          ["Photosynthesis releases oxygen.", "Photosynthesis consumes oxygen in the dark."],
          ["Xylem carries water upwards from the roots.", "Xylem carries sugars from leaves to roots."],
          ["Chlorophyll absorbs light energy.", "Chlorophyll absorbs carbon dioxide directly."],
          ["Auxin is responsible for phototropism.", "Auxin is responsible for blood clotting."],
          ["Plants release oxygen only during daylight photosynthesis.", "Plants release oxygen continuously, day and night."]
        ],
        trick: "Oxygen=daytime photosynthesis, xylem=water up, auxin=light bending.",
        tip: "Respiration happens day AND night — oxygen release is photosynthesis-only."
      }
    ],

    "Genetics and Evolution": [
      {
        kind: "fact", name: "genetics facts",
        note: "The core genetics facts across exam levels.",
        facts: [
          ["Who discovered the laws of inheritance?", "Gregor Mendel", "Mendel's pea-plant experiments in the 1860s established the laws of segregation and independent assortment."],
          ["Who discovered the structure of DNA?", "Watson and Crick", "Watson and Crick published the double-helix model of DNA in 1953, based on Franklin's X-ray data."],
          ["In which year was the DNA double helix discovered?", "1953", "Watson, Crick and Franklin's work in 1953 revealed the double-helix structure of DNA."],
          ["What is the basic unit of heredity?", "The gene", "A gene is a segment of DNA that codes for a trait and is passed from parents to offspring."],
          ["How many chromosomes does a normal human cell have?", "46 (23 pairs)", "Humans have 46 chromosomes in 23 pairs; 22 pairs are autosomes and one pair is sex chromosomes."],
          ["Which type of cell has half the chromosome number?", "Gametes (sex cells)", "Gametes are haploid with 23 chromosomes, so fertilisation restores the diploid 46."],
          ["What is the molecule that carries genetic information?", "DNA", "Deoxyribonucleic acid stores and transmits hereditary information in its base sequence."],
          ["What is the process of copying DNA called?", "Replication", "DNA replication copies the molecule before cell division, using each strand as a template."],
          ["Who is known as the father of genetics?", "Gregor Mendel", "Mendel's experiments with pea plants made him the father of genetics."],
          ["What is the shape of the DNA molecule?", "Double helix", "DNA is a double helix — two strands twisted around each other, like a spiral staircase."]
        ],
        trick: "Mendel=peas/father of genetics, Watson+Crick 1953 double helix, 46 chromosomes, 23 in gametes.",
        tip: "Scientist-discovery pairs (Mendel-genetics, Watson/Crick-DNA) are the highest-yield genetics items."
      },
      {
        kind: "pair", a: "genetic term", b: "meaning",
        note: "Genetics terminology pairs.",
        pairs: [
          ["Genotype", "the genetic make-up of an organism"], ["Phenotype", "the observable characteristics"], ["Dominant allele", "expressed even when one copy is present"],
          ["Recessive allele", "expressed only when two copies are present"], ["Homozygous", "two identical alleles for a trait"], ["Heterozygous", "two different alleles for a trait"]
        ],
        trick: "Pheno=visible, geno=genes; homo=same alleles, hetero=different.",
        tip: "Phenotype vs genotype is the most common terminology question."
      },
      {
        kind: "tf", name: "genetics statements",
        note: "True/false stems on genetics.",
        statements: [
          ["Humans have 46 chromosomes in body cells.", "Humans have 46 chromosomes in gametes."],
          ["The phenotype is the observable trait.", "The phenotype is the genetic make-up only."],
          ["DNA has a double helix structure.", "DNA has a single straight strand structure."],
          ["A recessive allele needs two copies to be expressed.", "A recessive allele needs one copy to be expressed."],
          ["Mendel studied pea plants.", "Mendel studied fruit flies."]
        ],
        trick: "46 body / 23 gametes; double helix; recessive needs two copies; Mendel=peas.",
        tip: "Haploid vs diploid numbers and dominant vs recessive are the traps."
      }
    ],

    "Biological Calculations": [
      {
        kind: "numeric", name: "energy transfer in food chains", difficulty: "medium",
        note: "Only about 10% of energy passes from one trophic level to the next.",
        q: (v) => `A grassland ecosystem receives ${v.j} kJ of energy in the producers. Assuming 10% transfer between trophic levels, how much energy reaches the tertiary consumers?`,
        a: (v) => `${(v.j * 0.001).toFixed(1)} kJ`,
        e: (v) => `Each level retains 10%: producers → primary (10%) → secondary (10%) → tertiary (10%). So ${v.j} × 0.1³ = ${(v.j * 0.001).toFixed(1)} kJ, because three transfers reduce the energy by a factor of 1000.`,
        distract: (v) => {
          const c = v.j * 0.001;
          return [`${(v.j * 0.1).toFixed(1)} kJ`, `${(c * 10).toFixed(1)} kJ`, `${(c * 100).toFixed(1)} kJ`, `${(v.j / 5).toFixed(1)} kJ`, `${(c * 2).toFixed(1)} kJ`];
        },
        vals: (rng) => ({ j: 1000 + Math.floor(rng() * 90) * 1000 }),
        whyWrong: (v) => [`Three transfers mean three 10% steps: ×0.1³ = ×0.001; forgetting one step gives ten times too much.`],
        trick: "Each arrow = ×10%; count the arrows, then apply 0.1ⁿ.",
        tip: "Count trophic transfers carefully — producers to tertiary is three steps."
      },
      {
        kind: "numeric", name: "pulse pressure calculations", difficulty: "easy",
        note: "Pulse pressure = systolic − diastolic blood pressure.",
        q: (v) => `A patient's blood pressure reads ${v.sys}/${v.dia} mmHg. What is the pulse pressure?`,
        a: (v) => `${v.sys - v.dia} mmHg`,
        e: (v) => `Pulse pressure = systolic − diastolic = ${v.sys} − ${v.dia} = ${v.sys - v.dia} mmHg, because it measures the pressure difference between beats and relaxation.`,
        distract: (v) => [`${v.sys + v.dia} mmHg`, `${Math.round((v.sys + v.dia) / 2)} mmHg`, `${v.sys - v.dia + 10} mmHg`, `${v.sys} mmHg`, `${Math.round((v.sys - v.dia) / 2)} mmHg`],
        vals: (rng) => {
          const sys = 110 + Math.floor(rng() * 40);
          const dia = 60 + Math.floor(rng() * 25);
          return { sys, dia };
        },
        whyWrong: (v) => [`Pulse pressure is the difference, not the sum or mean, of systolic and diastolic values.`],
        trick: "Pulse pressure = systolic − diastolic.",
        tip: "Normal pulse pressure is about 40 mmHg."
      },
      {
        kind: "numeric", name: "population estimates", difficulty: "medium",
        note: "Population estimates multiply a sample count by a scaling factor.",
        q: (v) => `Ecologists catch and mark ${v.m} fish, then recapture ${v.c} fish of which ${v.r} are marked. What is the estimated population?`,
        a: (v) => `${Math.round(v.m * v.c / v.r)}`,
        e: (v) => `Estimated population = (marked × recaptured) ÷ marked recaptured = ${v.m} × ${v.c} ÷ ${v.r} ≈ ${Math.round(v.m * v.c / v.r)}, because the mark-recapture method assumes the marked fraction stays constant.`,
        distract: (v) => {
          const c = v.m * v.c / v.r;
          return [`${Math.round(c * 2)}`, `${Math.round(c * 0.5)}`, `${v.m + v.c}`, `${v.c * v.r}`, `${Math.round(c * 1.5)}`];
        },
        vals: (rng) => {
          const m = 40 + Math.floor(rng() * 30);
          const r = 5 + Math.floor(rng() * 10);
          const c = r + 10 + Math.floor(rng() * 30);
          return { m, c, r };
        },
        whyWrong: (v) => [`Mark-recapture multiplies the marked sample by the recapture ratio; adding the samples or multiplying c × r misuses the ratio.`],
        trick: "N = m × c ÷ r — marked times recaptured over marked-recaptured.",
        tip: "The estimate assumes marked fish mix evenly with the population."
      },
      {
        kind: "numeric", name: "oxygen consumption rates", difficulty: "hard",
        note: "Oxygen consumption is volume per minute; scaling to an hour multiplies by 60.",
        q: (v) => `A resting person consumes ${v.r} mL of oxygen per minute. What is the hourly oxygen consumption in litres?`,
        a: (v) => `${(v.r * 60 / 1000).toFixed(1)} L`,
        e: (v) => `One hour has 60 minutes: ${v.r} mL/min × 60 = ${v.r * 60} mL = ${(v.r * 60 / 1000).toFixed(1)} L, because 1000 mL equals 1 litre.`,
        distract: (v) => {
          const c = v.r * 60 / 1000;
          return [`${(v.r / 1000).toFixed(1)} L`, `${(c * 2).toFixed(1)} L`, `${(c * 0.5).toFixed(1)} L`, `${(v.r * 60).toFixed(0)} L`, `${(c + 2).toFixed(1)} L`];
        },
        vals: (rng) => ({ r: 200 + Math.floor(rng() * 200) }),
        whyWrong: (v) => [`Multiply by 60 for the hour and divide by 1000 for litres; skipping either conversion gives the wrong magnitude.`],
        trick: "mL/min × 60 = mL/hour; ÷ 1000 to reach litres.",
        tip: "Watch both unit conversions — minutes-to-hours and mL-to-L."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
