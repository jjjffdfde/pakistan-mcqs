/* ============================================================
   Deep Knowledge KB — Chemistry
   Elements, periodic table, reactions, acids/bases, plus
   numeric stoichiometry for unbounded expansion.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["chemistry"],
  chapter: "Chemistry — Deep Knowledge Bank",
  tags: ["chemistry", "deep-kb", "periodic-table", "reactions", "acids", "moles"],
  topics: {

    "Elements and Symbols": [
      {
        kind: "pair", a: "element", b: "chemical symbol",
        note: "Element-symbol pairs are the most fundamental chemistry facts.",
        pairs: [
          ["Hydrogen", "H"], ["Oxygen", "O"], ["Carbon", "C"], ["Nitrogen", "N"], ["Sodium", "Na"], ["Potassium", "K"],
          ["Iron", "Fe"], ["Gold", "Au"], ["Silver", "Ag"], ["Copper", "Cu"], ["Calcium", "Ca"], ["Chlorine", "Cl"],
          ["Magnesium", "Mg"], ["Zinc", "Zn"], ["Lead", "Pb"], ["Mercury", "Hg"], ["Aluminium", "Al"], ["Sulphur", "S"]
        ],
        trick: "Latin-based symbols: Na(sodium), K(potassium), Fe(iron), Au(gold), Ag(silver), Cu(copper), Pb(lead), Hg(mercury).",
        tip: "The Latin symbols (Na, K, Fe, Au, Ag, Cu, Pb, Hg) are the highest-yield pair."
      },
      {
        kind: "fact", name: "chemical symbols",
        note: "Element facts about symbols and names are standard exam items.",
        facts: [
          ["What is the chemical symbol of sodium?", "Na", "Sodium's symbol Na comes from its Latin name natrium, which is why the symbol differs from the English name."],
          ["What is the chemical symbol of potassium?", "K", "Potassium's symbol K derives from the Latin kalium, a fact that confuses many students."],
          ["What is the chemical symbol of iron?", "Fe", "Iron's symbol Fe comes from the Latin ferrum, the source of the name of the ferrous state."],
          ["What is the chemical symbol of gold?", "Au", "Gold's symbol Au comes from the Latin aurum, used in the term auric compounds."],
          ["What is the chemical symbol of silver?", "Ag", "Silver's symbol Ag comes from the Latin argentum, the root of argentine terms."],
          ["What is the chemical symbol of copper?", "Cu", "Copper's symbol Cu comes from the Latin cuprum, named after the island of Cyprus."],
          ["What is the chemical symbol of lead?", "Pb", "Lead's symbol Pb comes from the Latin plumbum, the root of plumber and plumbing."],
          ["What is the chemical symbol of mercury?", "Hg", "Mercury's symbol Hg comes from the Greek hydrargyrum, meaning liquid silver."],
          ["How many elements are there in the modern periodic table?", "118", "The periodic table currently contains 118 confirmed elements, from hydrogen to oganesson."],
          ["Which is the lightest element?", "Hydrogen", "Hydrogen, atomic number 1, is the lightest element and the most abundant in the universe."],
          ["Which element is the most abundant in the Earth's atmosphere?", "Nitrogen", "Nitrogen makes up about 78% of the atmosphere, the most abundant atmospheric element."]
        ],
        trick: "Na=natrium, K=kalium, Fe=ferrum, Au=aurum, Ag=argentum, Cu=cuprum, Pb=plumbum, Hg=hydrargyrum.",
        tip: "Latin-derived symbols are the single most tested element fact."
      },
      {
        kind: "tf", name: "elements and symbols",
        note: "True/false stems on element symbols.",
        statements: [
          ["Sodium's symbol is Na.", "Sodium's symbol is So."],
          ["Gold's symbol is Au.", "Gold's symbol is Go."],
          ["Iron's symbol is Fe.", "Iron's symbol is Ir."],
          ["Mercury is a liquid metal at room temperature.", "Mercury is a gas at room temperature."],
          ["Hydrogen is the lightest element.", "Oxygen is the lightest element."]
        ],
        trick: "Symbol traps use English-first letters (So, Go, Ir); Latin symbols are correct.",
        tip: "If the symbol matches the English name, double-check — most common ones differ."
      }
    ],

    "Periodic Table": [
      {
        kind: "pair", a: "group of elements", b: "defining property",
        note: "Periodic groups share defining properties that pair questions test.",
        pairs: [
          ["Alkali metals", "highly reactive, one outer electron"], ["Alkaline earth metals", "two outer electrons, reactive"], ["Halogens", "seven outer electrons, form salts"],
          ["Noble gases", "stable, eight outer electrons"], ["Transition metals", "variable oxidation states and colour"]
        ],
        trick: "Alkali=1 electron, alkaline earth=2, halogens=7, noble gases=8.",
        tip: "Halogens↔salts and noble gases↔stable are the two anchor pairs."
      },
      {
        kind: "fact", name: "periodic table facts",
        note: "Key facts about the periodic table's structure and famous elements.",
        facts: [
          ["Who is known as the father of the periodic table?", "Dmitri Mendeleev", "Mendeleev arranged elements by atomic mass and predicted undiscovered elements, earning the title father of the periodic table."],
          ["In which year did Mendeleev publish his periodic table?", "1869", "Mendeleev published his periodic table in 1869, arranging elements into groups with gaps for undiscovered ones."],
          ["Which group contains the most reactive metals?", "Group 1 (alkali metals)", "Alkali metals have one outer electron that is easily lost, making them the most reactive metals."],
          ["Which group of elements is completely unreactive?", "Group 18 (noble gases)", "Noble gases have full outer shells, so they do not readily form compounds."],
          ["Which element has atomic number 1?", "Hydrogen", "Hydrogen, with a single proton, is the first element of the periodic table."],
          ["Which element has atomic number 6?", "Carbon", "Carbon, atomic number 6, is the basis of organic chemistry because it forms four bonds and long chains."],
          ["Which element has atomic number 8?", "Oxygen", "Oxygen, atomic number 8, is essential for respiration and combustion."],
          ["Which is the most electronegative element?", "Fluorine", "Fluorine attracts electrons more strongly than any other element, making it the most electronegative."],
          ["Which element is a gas at room temperature and essential for breathing?", "Oxygen", "Oxygen is a colourless odourless gas essential for aerobic respiration."],
          ["Which metal is the best conductor of electricity?", "Silver", "Silver has the highest electrical conductivity of all metals, followed closely by copper."]
        ],
        trick: "Mendeleev 1869, fluorine most electronegative, silver best conductor, noble gases inert.",
        tip: "Fluorine (electronegativity) and silver (conductivity) are the two 'most' facts."
      },
      {
        kind: "numeric", name: "atomic mass calculations", difficulty: "medium",
        note: "Average atomic mass is the weighted mean of an element's isotopes by their abundance.",
        q: (v) => `An element has two isotopes of mass ${v.m1} and ${v.m2}. If the first has ${v.p1}% abundance, what is the approximate average atomic mass?`,
        a: (v) => `${(v.m1 * v.p1 / 100 + v.m2 * (100 - v.p1) / 100).toFixed(1)}`,
        e: (v) => `Average = (${v.m1}×${v.p1} + ${v.m2}×${100 - v.p1}) / 100 = ${(v.m1 * v.p1 / 100 + v.m2 * (100 - v.p1) / 100).toFixed(1)}, because each isotope contributes its mass weighted by abundance.`,
        distract: (v) => {
          const c = v.m1 * v.p1 / 100 + v.m2 * (100 - v.p1) / 100;
          return [`${(c + 1).toFixed(1)}`, `${(c - 1).toFixed(1)}`, `${(v.m1 + v.m2) / 2}`, `${(v.m1).toFixed(1)}`, `${(c * 1.02).toFixed(1)}`];
        },
        vals: (rng) => {
          const p1 = 50 + Math.floor(rng() * 45);
          const m1 = 10 + Math.floor(rng() * 30), m2 = m1 + 1 + Math.floor(rng() * 3);
          return { m1, m2, p1 };
        },
        whyWrong: (v) => [`Weighted average must use both abundances; a plain midpoint ignores the ${v.p1}% abundance.`],
        trick: "Multiply each mass by its percentage, add, divide by 100.",
        tip: "If two options are the midpoint, one is the trap for weighted problems."
      },
      {
        kind: "numeric", name: "moles and mass", difficulty: "medium",
        note: "One mole of a substance weighs its molar mass in grams; n = mass ÷ molar mass.",
        q: (v) => `How many moles are present in ${v.m} g of a substance with molar mass ${v.M} g/mol?`,
        a: (v) => `${(v.m / v.M).toFixed(2)} moles`,
        e: (v) => `Moles = mass ÷ molar mass, so ${v.m} g ÷ ${v.M} g/mol = ${(v.m / v.M).toFixed(2)} moles, because each mole weighs the molar mass.`,
        distract: (v) => {
          const c = v.m / v.M;
          return [`${(c * v.M).toFixed(2)} moles`, `${(c + 0.5).toFixed(2)} moles`, `${(c * 2).toFixed(2)} moles`, `${(c / 2).toFixed(2)} moles`, `${(c * 6.02).toFixed(2)} moles`];
        },
        vals: (rng) => {
          const M = [18, 40, 44, 56, 32, 58.5, 23, 100][Math.floor(rng() * 8)];
          const m = M * (0.5 + rng() * 3);
          return { m: Math.round(m * 10) / 10, M };
        },
        whyWrong: (v) => [`n = mass ÷ molar mass; multiplying gives the mass, and 6.02 is the Avogadro factor, not molar mass.`],
        trick: "n = m/M — moles equal mass over molar mass.",
        tip: "Avogadro's number 6.02×10²³ counts particles per mole, not moles."
      },
      {
        kind: "numeric", name: "concentration calculations", difficulty: "hard",
        note: "Concentration in mol/dm³ equals moles of solute divided by volume in dm³.",
        q: (v) => `${v.n} moles of a salt are dissolved in ${v.vol} dm³ of water. What is the concentration?`,
        a: (v) => `${(v.n / v.vol).toFixed(2)} mol/dm³`,
        e: (v) => `Concentration = moles ÷ volume, so ${v.n} ÷ ${v.vol} = ${(v.n / v.vol).toFixed(2)} mol/dm³, because molarity counts solute per cubic decimetre.`,
        distract: (v) => {
          const c = v.n / v.vol;
          return [`${(c * 2).toFixed(2)} mol/dm³`, `${(c / 2).toFixed(2)} mol/dm³`, `${(v.n * v.vol).toFixed(2)} mol/dm³`, `${(c + 0.5).toFixed(2)} mol/dm³`, `${(c * 1.5).toFixed(2)} mol/dm³`];
        },
        vals: (rng) => {
          const vol = Math.round((0.2 + rng() * 1.8) * 10) / 10;
          const n = Math.round((0.1 + rng() * 1.5) * 10) / 10;
          return { n, vol };
        },
        whyWrong: (v) => [`Molarity = moles ÷ volume; multiplying yields total moles over dm³ and is the classic error.`],
        trick: "M = n/V — concentration equals moles over litres (dm³).",
        tip: "Ensure volume is in dm³ (1 dm³ = 1 L) before dividing."
      },
      {
        kind: "numeric", name: "pH calculations", difficulty: "hard",
        note: "pH = -log[H⁺]; a hydrogen ion concentration of 10⁻ⁿ mol/dm³ gives pH n.",
        q: (v) => `A solution has a hydrogen ion concentration of 1 × 10⁻${v.p} mol/dm³. What is its pH?`,
        a: (v) => `${v.p}`,
        e: (v) => `pH = -log₁₀[H⁺] = -log(10⁻${v.p}) = ${v.p}, because the negative logarithm of a power of ten is its exponent.`,
        distract: (v) => [`${v.p + 1}`, `${v.p - 1}`, `${v.p * 10}`, `${Math.round(v.p / 2)}`, `${v.p + 7}`],
        vals: (rng) => ({ p: 1 + Math.floor(rng() * 12) }),
        whyWrong: (v) => [`pH equals the negative exponent of the H⁺ concentration, so 10⁻${v.p} gives pH ${v.p}.`],
        trick: "pH = exponent of 10 with the minus sign removed.",
        tip: "pH 7 neutral, <7 acidic, >7 basic — anchor the scale."
      }
    ],

    "Chemical Reactions": [
      {
        kind: "fact", name: "types of reactions",
        note: "Reaction types and their definitions are core chemistry facts.",
        facts: [
          ["What is the reaction between an acid and a base called?", "Neutralisation", "Neutralisation produces a salt and water, with the acid's H⁺ and base's OH⁻ forming water."],
          ["What type of reaction releases heat?", "Exothermic", "Exothermic reactions release energy as heat, such as combustion and neutralisation."],
          ["What type of reaction absorbs heat?", "Endothermic", "Endothermic reactions absorb energy, such as photosynthesis and thermal decomposition."],
          ["Which reaction produces salt and water?", "Neutralisation", "Acid-base neutralisation always yields a salt and water, the defining outcome of the reaction."],
          ["What is the process of rusting?", "Oxidation of iron", "Rusting is the slow oxidation of iron by oxygen and moisture, forming hydrated iron(III) oxide."],
          ["Which gas is produced when zinc reacts with hydrochloric acid?", "Hydrogen", "Zinc plus hydrochloric acid gives zinc chloride and hydrogen gas, a classic metal-acid reaction."],
          ["What is the general equation of combustion?", "Substance + oxygen → oxides + energy", "Combustion is the rapid reaction of a substance with oxygen, releasing heat and light."],
          ["Which element burns with a characteristic squeaky pop test?", "Hydrogen", "Hydrogen gives a squeaky pop when a lit splint is applied, the standard test for the gas."],
          ["What is the test for carbon dioxide gas?", "It turns limewater milky", "CO₂ turns limewater milky, the standard confirmation test for the gas."],
          ["What is the test for oxygen gas?", "It relights a glowing splint", "Oxygen relights a glowing wooden splint, the classic confirmation test."]
        ],
        trick: "Acid+base=neutralisation, exo=releases heat, endo=absorbs, CO₂=limewater, O₂=relights splint.",
        tip: "Gas tests (O₂, CO₂, H₂) are guaranteed exam content."
      },
      {
        kind: "pair", a: "gas", b: "test",
        note: "Gas-test pairs are the most repeated practical chemistry questions.",
        pairs: [
          ["Oxygen", "relights a glowing splint"], ["Carbon dioxide", "turns limewater milky"], ["Hydrogen", "squeaky pop with a lit splint"],
          ["Chlorine", "bleaches damp litmus paper"], ["Ammonia", "turns damp red litmus blue"]
        ],
        trick: "O₂=relights, CO₂=limewater milky, H₂=squeaky pop, NH₃=red litmus blue.",
        tip: "Hydrogen (pop) and CO₂ (milky) are the two anchors; ammonia↔litmus is the subtle one."
      },
      {
        kind: "tf", name: "chemical reactions",
        note: "True/false stems on reaction types and tests.",
        statements: [
          ["Neutralisation produces salt and water.", "Neutralisation produces carbon dioxide and ash."],
          ["Exothermic reactions release heat.", "Exothermic reactions absorb heat."],
          ["Oxygen relights a glowing splint.", "Carbon dioxide relights a glowing splint."],
          ["Rusting is the oxidation of iron.", "Rusting is the reduction of iron."],
          ["Hydrogen gives a squeaky pop test.", "Nitrogen gives a squeaky pop test."]
        ],
        trick: "Salt+water, release heat, O₂=relights, H₂=pop.",
        tip: "Swap the gas tests or reaction outcomes and the statement is false."
      }
    ],

    "Acids, Bases and Salts": [
      {
        kind: "fact", name: "acids and bases",
        note: "The properties of acids, bases and salts are fundamental to chemistry.",
        facts: [
          ["What is the pH of a strong acid?", "Below 3", "Strong acids like hydrochloric acid have pH values well below 3 on the scale."],
          ["What is the pH range of bases?", "Above 7", "Bases have pH above 7, with strong bases like sodium hydroxide near 14."],
          ["What does litmus paper turn in acid?", "Red", "Blue litmus turns red in acidic solutions, the classic indicator test."],
          ["What does litmus paper turn in alkali?", "Blue", "Red litmus turns blue in alkaline solutions, the reverse of the acid test."],
          ["What is a substance that changes colour with pH called?", "An indicator", "Indicators such as litmus and universal indicator change colour with acidity."],
          ["Which salt is common table salt?", "Sodium chloride", "Sodium chloride (NaCl) is common salt, formed by neutralising hydrochloric acid with sodium hydroxide."],
          ["Which acid is found in the stomach and aids digestion?", "Hydrochloric acid", "Hydrochloric acid in gastric juice activates enzymes and kills bacteria in the stomach."],
          ["What is the pH of neutral water?", "7", "Pure water is neutral at pH 7, exactly between acid and base."],
          ["Which gas is given off when carbonates react with acids?", "Carbon dioxide", "Carbonates react with acids to produce carbon dioxide, water and a salt."],
          ["What happens to blue litmus in a neutral solution?", "It stays blue", "In neutral solutions blue litmus remains blue because neither acid nor alkali conditions exist."]
        ],
        trick: "Acid<7, base>7, neutral=7; blue→red acid, red→blue alkali.",
        tip: "Litmus direction (blue→red in acid) is the most-asked indicator fact."
      },
      {
        kind: "numeric", name: "salt formation masses", difficulty: "hard",
        note: "Neutralisation of HCl with NaOH produces NaCl and water; mass is conserved in the reaction.",
        q: (v) => `${v.g} g of sodium hydroxide reacts completely with excess hydrochloric acid. Using molar masses (NaOH 40, NaCl 58.5), what mass of sodium chloride forms?`,
        a: (v) => `${(v.g * 58.5 / 40).toFixed(1)} g`,
        e: (v) => `The mole ratio NaOH:NaCl is 1:1, so ${v.g} g ÷ 40 × 58.5 = ${(v.g * 58.5 / 40).toFixed(1)} g of NaCl, because each mole of hydroxide yields one mole of salt.`,
        distract: (v) => {
          const c = v.g * 58.5 / 40;
          return [`${(c * 40 / 58.5).toFixed(1)} g`, `${(c + 20).toFixed(1)} g`, `${(c * 1.2).toFixed(1)} g`, `${(c * 0.8).toFixed(1)} g`, `${(c / 58.5 * 40).toFixed(1)} g`];
        },
        vals: (rng) => ({ g: Math.round((20 + rng() * 60)) }),
        whyWrong: (v) => [`Scale the salt mass by the molar-mass ratio 58.5/40; the reverse ratio gives the wrong mass.`],
        trick: "mass(NaCl) = mass(NaOH) × 58.5/40 for the 1:1 mole ratio.",
        tip: "Write the balanced equation first; the ratio between reactants and products decides."
      }
    ],

    "Organic Chemistry": [
      {
        kind: "pair", a: "hydrocarbon", b: "general formula",
        note: "The alkane, alkene and alkyne families have fixed general formulas.",
        pairs: [
          ["Alkanes", "CₙH₂ₙ₊₂"], ["Alkenes", "CₙH₂ₙ"], ["Alkynes", "CₙH₂ₙ₋₂"]
        ],
        trick: "Alkane +2, alkene ±0, alkyne −2 hydrogens.",
        tip: "The hydrogen count pattern (+2, 0, −2) is the memorisation key."
      },
      {
        kind: "fact", name: "organic chemistry",
        note: "The basics of carbon compounds are standard exam material.",
        facts: [
          ["Which element is the basis of organic chemistry?", "Carbon", "Organic chemistry studies carbon compounds, which can form long chains and rings."],
          ["What is the simplest alkane?", "Methane", "Methane (CH₄) is the simplest alkane, with one carbon atom and four hydrogens."],
          ["What is the chemical formula of methane?", "CH₄", "Methane has one carbon and four hydrogen atoms, the simplest hydrocarbon."],
          ["What is the formula of ethanol?", "C₂H₅OH", "Ethanol is C₂H₅OH, the alcohol in beverages and a common fuel."],
          ["What is the process of converting sugar to alcohol called?", "Fermentation", "Fermentation uses yeast to convert glucose into ethanol and carbon dioxide."],
          ["Which gas is known as marsh gas?", "Methane", "Methane, produced in swamps and marshes, is known as marsh gas."],
          ["What is the main component of natural gas?", "Methane", "Natural gas is about 85-90% methane, used for heating and power."],
          ["What is the main component of biogas?", "Methane", "Biogas from organic waste is mostly methane, with some carbon dioxide."],
          ["Which polymer is polythene made from?", "Ethene (ethylene)", "Polythene is polymerised ethene, the simplest alkene used in plastics."],
          ["What is the monomer of polythene?", "Ethene", "Ethene molecules join end-to-end to form the polymer polythene."]
        ],
        trick: "Methane=CH₄ + marsh gas + natural gas; ethanol=C₂H₅OH; polythene from ethene.",
        tip: "Methane's triple identity (CH₄, marsh gas, natural gas) is high-yield."
      },
      {
        kind: "tf", name: "organic chemistry facts",
        note: "True/false stems on hydrocarbons.",
        statements: [
          ["Methane is the simplest alkane.", "Ethane is the simplest alkane."],
          ["Natural gas is mainly methane.", "Natural gas is mainly hydrogen."],
          ["Fermentation produces ethanol and carbon dioxide.", "Fermentation produces oxygen and nitrogen."],
          ["Polythene is made from ethene.", "Polythene is made from methane."],
          ["Alkanes have the general formula CₙH₂ₙ₊₂.", "Alkenes have the general formula CₙH₂ₙ₊₂."]
        ],
        trick: "Methane simplest, natural gas = methane, polythene = ethene, alkane = +2.",
        tip: "Formula-family swaps (alkane vs alkene) are the classic trap."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
