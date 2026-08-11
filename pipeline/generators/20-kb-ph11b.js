/* ============================================================
   Phase 11 — KB Biochemistry & Pathology & Microbiology
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const ml = (v) => Number(v).toLocaleString("en-US");

/* ---------------- BIOCHEMISTRY ---------------- */
const biochemistry = {
  subjects: ["biochemistry"],
  chapter: "Biochemistry — Molecules of Life (Phase 11)",
  tags: ["biochemistry", "deep-kb", "enzymes", "metabolism"],
  topics: {
    "Biomolecules": [
      { kind: "fact", name: "biomolecule facts", note: "Macromolecules and monomers.",
        facts: [
          ["What is the monomer of proteins?", "Amino acids", "Proteins are chains of amino acids joined by peptide bonds."],
          ["What is the monomer of starch and glycogen?", "Glucose", "Starch, glycogen and cellulose are polymers of glucose."],
          ["What are the two types of nucleic acids?", "DNA and RNA", "DNA stores heredity; RNA carries and executes genetic instructions."],
          ["Which cell structure is the site of protein synthesis?", "Ribosome", "Ribosomes translate messenger RNA into proteins."],
          ["What is an enzyme?", "A biological catalyst", "Enzymes accelerate reactions without being consumed."],
          ["Which enzyme property means they act on one substrate?", "Specificity", "Enzymes are specific to substrates matching their active site."],
          ["Which enzyme digests starch in the mouth?", "Salivary amylase", "Salivary amylase breaks starch into maltose."],
          ["Which enzyme digests protein in the stomach?", "Pepsin", "Pepsin cleaves proteins in the acidic stomach."],
          ["What does ATP stand for?", "Adenosine triphosphate", "ATP stores and transfers chemical energy in cells."],
          ["Which vitamins serve as coenzymes for metabolism?", "B vitamins", "B vitamins like B1 and B3 build coenzymes for metabolic reactions."]
        ],
        trick: "amino acid=protein monomer, glucose=starch monomer, ribosome=protein site.",
        tip: "Monomer-polymer and site-of-synthesis pairs are top items." },

      { kind: "pair", name: "vitamin deficiency pairs", a: "vitamin", b: "deficiency disease",
        pairs: [["Vitamin D", "Rickets"], ["Vitamin C", "Scurvy"], ["Vitamin A", "Night blindness"],
          ["Vitamin B3", "Pellagra"], ["Vitamin B12", "Pernicious anaemia"], ["Vitamin K", "Bleeding tendency"]],
        trick: "D=rickets, C=scurvy, A=night blindness, B3=pellagra.",
        tip: "Vitamin-deficiency pairs are classic board items." },

      { kind: "numeric", name: "pH from hydrogen ion concentration", difficulty: "medium",
        note: "pH = -log10[H+] in moles per litre.",
        q: (v) => `A solution has a hydrogen ion concentration of 1e-${v.n} M. What is its pH?`,
        a: (v) => `${v.n}`,
        e: (v) => `pH = -log(1e-${v.n}) = ${v.n}, because the negative logarithm cancels the exponent of the proton concentration.`,
        distract: (v) => [`${v.n + 1}`, `${v.n - 1}`, `${14 - v.n}`, `${v.n + 2}`, `${v.n * 2}`],
        vals: (rng) => ({ n: R(rng, 1, 6) }),
        whyWrong: (v) => [`The exponent directly equals the pH for a 1e-n M solution of hydrogen ions.`],
        trick: "pH = exponent of 10 raised to a negative.",
        tip: "Neutral pH is 7, below is acidic." },

      { kind: "numeric", name: "food energy 4-4-9", difficulty: "easy",
        note: "Protein and carbohydrate give 4 kcal/g, fat 9 kcal/g.",
        q: (v) => `A meal contains ${v.p} g protein, ${v.c} g carbohydrate and ${v.f} g fat. What is the total energy in kcal?`,
        a: (v) => `${v.p * 4 + v.c * 4 + v.f * 9} kcal`,
        e: (v) => `${v.p}×4 + ${v.c}×4 + ${v.f}×9 = ${v.p * 4} + ${v.c * 4} + ${v.f * 9} = ${v.p * 4 + v.c * 4 + v.f * 9} kcal, applying the 4-4-9 rule.`,
        distract: (v) => {
          const c = v.p * 4 + v.c * 4 + v.f * 9;
          return [`${c + 45} kcal`, `${c * 0.5} kcal`, `${v.p + v.c + v.f} kcal`, `${c * 1.5} kcal`, `${c - 50} kcal`];
        },
        vals: (rng) => ({ p: R(rng, 10, 60), c: R(rng, 20, 90), f: R(rng, 10, 60) }),
        whyWrong: (v) => [`Use 4 kcal/g for protein and carbohydrate and 9 kcal/g for fat; applying 9 to every nutrient overestimates the total.`],
        trick: "4-4-9 kcal per gram.",
        tip: "Fat is the energy-dense macronutrient." }
    ],

    "Metabolism and Genetics": [
      { kind: "fact", name: "metabolism facts", note: "Central pathways and energy.",
        facts: [
          ["Where does glycolysis occur in the cell?", "Cytoplasm", "Glycolysis splits glucose in the cytosol without needing oxygen."],
          ["What is the net ATP yield of glycolysis per glucose?", "2 ATP", "Glycolysis yields 2 ATP and 2 NADH per glucose molecule."],
          ["Where does the Krebs cycle occur?", "Mitochondrial matrix", "The citric acid cycle runs in the mitochondrial matrix."],
          ["Which molecule is the energy currency of the cell?", "ATP", "ATP stores and releases the chemical energy cells need."],
          ["Which organs store glycogen?", "Liver and muscle", "Glycogen is stored mainly in the liver and skeletal muscle."],
          ["What is gluconeogenesis?", "Making glucose from non-carbohydrates", "The liver builds glucose from lactate, glycerol and amino acids."],
          ["Which pathway breaks fatty acids into acetyl-CoA?", "Beta-oxidation", "Beta-oxidation feeds acetyl-CoA into the citric acid cycle."],
          ["What is a codon?", "A three-base sequence coding one amino acid", "Codons on mRNA specify the amino acid order."],
          ["What does the central dogma state?", "DNA is transcribed to RNA, then translated to protein", "Genetic flow passes DNA to RNA to protein."]
        ],
        trick: "glycolysis=cytoplasm 2 ATP, Krebs=mitochondria, central dogma=DNA→RNA→protein.",
        tip: "Knowing where each pathway runs is a high-yield exam item." },

      { kind: "numeric", name: "dna bases counting", difficulty: "medium",
        note: "Chargaff: A pairs with T, G pairs with C in double-stranded DNA.",
        q: (v) => `A double-stranded DNA sample has ${ml(v.a)} adenine bases and ${ml(v.g)} guanine bases. How many total bases are present (A+T+G+C)?`,
        a: (v) => `${ml(v.a * 2 + v.g * 2)}`,
        e: (v) => `T = A = ${ml(v.a)} and C = G = ${ml(v.g)}, so total = 2×${ml(v.a)} + 2×${ml(v.g)} = ${ml(v.a * 2 + v.g * 2)} bases.`,
        distract: (v) => {
          const c = v.a * 2 + v.g * 2;
          return [`${ml(c - 2)}`, `${ml(v.a + v.g)}`, `${ml(c * 2)}`, `${ml(v.a * 2 + v.g)}`, `${ml(c / 2)}`];
        },
        vals: (rng) => {
          const a = R(rng, 200, 2000);
          const g = R(rng, 200, 2000);
          return { a, g };
        },
        whyWrong: (v) => [`Remember A=T and G=C, so double each base type; summing once forgets the complementary strands.`],
        trick: "A=T, G=C always in dsDNA.",
        tip: "Work out the complement before adding." }
    ]
  }
};

/* ---------------- PATHOLOGY ---------------- */
const pathology = {
  subjects: ["pathology"],
  chapter: "Pathology — Cell Injury and Disease (Phase 11)",
  tags: ["pathology", "deep-kb", "inflammation", "neoplasia"],
  topics: {
    "Cell Injury and Death": [
      { kind: "fact", name: "injury facts", note: "Mechanisms of damage and death.",
        facts: [
          ["What is necrosis?", "Unplanned cell death following injury", "Necrosis is cell death triggered by injury or infection."],
          ["What is apoptosis?", "Programmed, orderly cell death", "Apoptosis removes unneeded cells without inflammation."],
          ["Which is the hallmark of apoptosis distinguishing it from necrosis?", "Cell shrinkage without inflammation", "Apoptotics shrinks cells and avoids an inflammatory response."],
          ["What is coagulative necrosis?", "Death with preserved tissue outline", "Coagulative necrosis keeps the architecture intact, typical of infarction."],
          ["What causes cells to die in a heart attack?", "Ischaemia", "Myocardial infarction follows blocked blood flow and oxygen starvation."],
          ["What is ischaemia?", "Reduced blood supply to tissues", "Ischaemia starves cells of oxygen and nutrients."],
          ["What is oedema?", "Fluid collecting in the interstitial space", "Oedema swells tissues with excess fluid."],
          ["What is hypertrophy?", "An increase in cell size with workload", "The heart enlarges by hypertrophy under chronic pressure."],
          ["What is hyperplasia?", "An increase in the number of cells", "Hyperplasia is an adaptive increase in cell number."],
          ["What is an infarct?", "Local dead tissue from sudden loss of blood", "An infarct forms when an artery is blocked."],
          ["What is atrophy?", "A decrease in cell size and organ mass", "Atropy follows disuse, denervation or reduced blood flow."]
        ],
        trick: "apoptosis=programmed, necrosis=unplanned; hypertrophy=size, hyperplasia=number.",
        tip: "Contrast adaptive growth with damage death." },

      { kind: "tf", name: "injury true-false", statements: [
        ["Apoptosis is programmed cell death.", "Apoptosis always causes severe inflammation."],
        ["Ischaemia is reduced blood supply.", "Ischaemia is excess blood supply."],
        ["Hypertrophy increases the size of cells.", "Hypertrophy increases the number of cells."],
        ["Infarcts follow blocked arteries.", "Infarcts follow excessive calcium intake."],
        ["Oedema is fluid accumulation in tissues.", "Oedema is loss of body water."],
        ["Atrophy means the organ shrinks.", "Atrophy means the organ enlarges permanently."]
      ] }
    ],

    "Neoplasia and Inflammation": [
      { kind: "fact", name: "tumour facts", note: "Neoplasia vocabulary.",
        facts: [
          ["What describes a benign tumour?", "Localised and usually non-invasive", "Benign growths stay local and grow slowly with a capsule."],
          ["What describes a malignant tumour?", "Invasive and able to spread", "Malignant tumours invade tissues and metastasise."],
          ["What is metastasis?", "Cancer spread to distant organs", "Metastatic cells travel in blood or lymph."],
          ["Which tumour arises from epithelial tissue?", "Carcinoma", "Carcinomas come from skin and lining epithelia."],
          ["Which tumour arises from connective tissue?", "Sarcoma", "Sarcomas come from bone, muscle, fat and fibrous tissue."],
          ["What is a biopsy?", "Tissue sampling for microscopic diagnosis", "Biopsy gives the ground-truth diagnosis of a growth."],
          ["Which suffix usually denotes a benign tumour?", "-oma", "Terms like fibroma and lipoma are usually benign neoplasms."],
          ["What is inflammation's classic quartet?", "Redness, heat, swelling and pain", "Calor, rubor, tumour and dolor mark inflammation."]
        ],
        trick: "carcinoma=epithelial, sarcoma=connective, metastasis=spread.",
        tip: "Suffix -oma is usually benign." }
    ]
  }
};

/* ---------------- MICROBIOLOGY ---------------- */
const microbiology = {
  subjects: ["microbiology"],
  chapter: "Microbiology — Microbes and Disease (Phase 11)",
  tags: ["microbiology", "deep-kb", "bacteria", "viruses"],
  topics: {
    "Bacteria and Pathogens": [
      { kind: "fact", name: "bacterial facts", note: "Bacteria, shape and diseases.",
        facts: [
          ["Which organism causes cholera?", "Vibrio cholerae", "Cholera causes severe watery diarrhoea via a toxin."],
          ["Which organism causes tuberculosis?", "Mycobacterium tuberculosis", "The airborne bacillus infects the lung and forms granulomas."],
          ["Which organism causes typhoid?", "Salmonella typhi", "Typhoid spreads by faecal-oral contamination."],
          ["Which organism causes tetanus?", "Clostridium tetani", "Its neurotoxin causes painful muscle spasms."],
          ["Which bacterium is the common cause of urinary tract infection?", "Escherichia coli", "E. coli causes most community-acquired UTIs."],
          ["Which organism causes streptococcal pharyngitis?", "Streptococcus pyogenes", "Group A streptococcus is the common throat pathogen."],
          ["Which organism causes syphyl?", "Treponema pallidum", "Treponema pallidum is a sexeflected spirochaete."],
          ["Which structure do bacteria lack?", "A membrane-bound nucleus", "Prokaryotes have no true nucleus."]
        ],
        trick: "Vibrio→cholera, mycobacterium→TB, salmonella→typhoid.",
        tip: "Who causes disease is the high-yield ask." },

      { kind: "pair", name: "bacterium and characteristics", a: "bacterium", b: "feature",
        pairs: [["Staphylococcus aureus", "Gram-positive cocci in clusters"], ["Streptococcus pyogenes", "Gram-positive cocci in chains"],
          ["Escherichia coli", "Gram-negative bacilli"], ["Vibrio cholerae", "Gram-negative curved rod"],
          ["Clostridium tetani", "Gram-positive anaerobic bacillus"], ["Neisseria meningitidis", "Gram-negative diplococci"]],
        outsiders: ["Viroids", "Prions"],
        trick: "Staph=clusters, strep=chains, clostridia=anaerobic bacillus.",
        tip: "Remember 'staph clusters', 'strep chains'." }
    ],

    "Viruses and Immunity": [
      { kind: "fact", name: "virus facts", note: "Viral families and diseases.",
        facts: [
          ["Which virus causes COVID-19?", "SARS-CoV-2", "SARS-CoV-2 spread worldwide as the COVID-19 pandemic."],
          ["Which virus causes chickenpox and shingles?", "Varicella-zoster virus", "VZV causes varicella then reactivates as zoster."],
          ["Which virus causes polio?", "Poliovirus", "Poliovirus can cause flaccid paralysis."],
          ["Which virus causes hepatitis B?", "The hepatitis B virus", "HBV is a DNA virus spread by blood and body fluids."],
          ["Which virus causes HIV infection?", "Human immunodeficiency virus", "HIV attacks CD4 T-cells and leads to AIDS."],
          ["Which virus is a retrovirus?", "HIV", "Retroviruses reverse-transcribe RNA into DNA."],
          ["Which white cells produce antibodies?", "B lymphocytes", "Plasma cells derived from B cells secrete antibodies."],
          ["Which immunity defends against intracellular pathogens?", "Cell-mediated immunity", "T cells coordinate the cellular immune response."]
        ],
        trick: "HIV→CD4, VZV=chickenpox+shingles, B cells=antibodies.",
        tip: "Match virus, target cell and disease." },

      { kind: "tf", name: "virus true-false", statements: [
        ["Viruses need a host cell to replicate.", "Viruses can reproduce on culture media alone."],
        ["HIV attacks CD4 T lymphocytes.", "HIV attacks red blood cells."],
        ["Retroviruses copy RNA into DNA.", "Retroviruses copy DNA into RNA only."],
        ["B cells make antibodies.", "B cells digest bacteria in the mouth."]
      ] }
    ]
  }
};

module.exports = [makeKbGen(biochemistry), makeKbGen(pathology), makeKbGen(microbiology)];
