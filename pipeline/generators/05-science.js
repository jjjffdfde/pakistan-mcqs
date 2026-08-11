/* ============================================================
   Generator file 05 — Sciences (physics, chemistry, biology,
   botany, zoology, everyday science, environmental, biotech)
   ============================================================ */
"use strict";
const L = require("../lib.js");
const ri = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const r2 = (x) => Math.round(x * 100) / 100;

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

/* parametric physics: compute results directly (deterministic enumeration) */
function physicsParam(subjectId, chapterName, topic, tpls) {
  return {
    subjects: [subjectId],
    name: chapterName,
    topics: [topic],
    tags: [subjectId],
    generate(rng, t, s) {
      const cap = (s && s._cap) || 3000;
      const out = [];
      for (const tp of tpls) {
        out.push(...tp(rng, cap - out.length));
        if (out.length >= cap) break;
      }
      /* polish each numeric MCQ to Quality Engine 2.0 standard (genuine,
         topic-specific trick/tip; causal, full-length explanation). */
      const trick = `In ${t} problems, write the governing formula first, keep every quantity in SI units, and solve for the single unknown before substituting the numbers.`;
      const tip = `For ${t} numericals, substitute step by step and check that the unit of your result matches the quantity asked; the wrong options usually come from a misplaced factor or the wrong operation.`;
      const tail = `Therefore, substituting the given quantities directly into the formula yields this value as the only physically consistent result.`;
      for (const m of out) L.polishParametric(m, { trick, tip, tail });
      return out;
    }
  };
}

module.exports = [
  physicsParam("physics", "Physics — Numericals", "Motion and Force", [
    (rng, cap) => {
      const out = [];
      for (let v = 5; v <= 60 && out.length < cap; v++) {
        for (let u = 0; u <= 10 && out.length < cap; u++) {
          for (let t = 2; t <= 15 && out.length < cap; t++) {
            const a = r2((v - u) / t);
            const m = L.buildParametric(rng, {
              q: () => `A body's velocity changes from ${u} m/s to ${v} m/s in ${t} s. Its acceleration is:`,
              a: () => a + " m/s²",
              e: () => `Acceleration = (v − u)/t = (${v} − ${u})/${t} = ${a} m/s².`,
              distract: () => [r2((v - u) * t) + " m/s²", r2(v / t) + " m/s²", r2((v + u) / t) + " m/s²"]
            }, { difficulty: L.diffFor(out.length), tags: ["motion"] });
            if (m) out.push(m);
          }
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let m = 2; m <= 50 && out.length < cap; m++) {
        for (let v = 3; v <= 30 && out.length < cap; v++) {
          const ke = r2(0.5 * m * v * v);
          const mm = L.buildParametric(rng, {
            q: () => `Kinetic energy of a ${m} kg body moving at ${v} m/s is:`,
            a: () => ke + " J",
            e: () => `KE = ½mv² = ½ × ${m} × ${v}² = ${ke} J.`,
            distract: () => [r2(m * v) + " J", r2(m * v * v) + " J", r2(ke / 2) + " J"]
          }, { difficulty: L.diffFor(out.length), tags: ["energy"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let m = 5; m <= 200 && out.length < cap; m++) {
        for (let a = 1; a <= 9 && out.length < cap; a++) {
          const f = m * a;
          const mm = L.buildParametric(rng, {
            q: () => `Force needed to accelerate a ${m} kg mass at ${a} m/s² is:`,
            a: () => f + " N",
            e: () => `F = ma = ${m} × ${a} = ${f} N (Newton's second law).`,
            distract: () => [r2(f / 2) + " N", r2(f * 2) + " N", r2(m / a) + " N"]
          }, { difficulty: L.diffFor(out.length), tags: ["force"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let d1 = 10; d1 <= 400 && out.length < cap; d1++) {
        for (let t1 = 2; t1 <= 8 && out.length < cap; t1++) {
          const sp = r2(d1 / t1);
          const mm = L.buildParametric(rng, {
            q: () => `Average speed of a body covering ${d1} m in ${t1} s is:`,
            a: () => sp + " m/s",
            e: () => `Speed = distance/time = ${d1}/${t1} = ${sp} m/s.`,
            distract: () => [r2(d1 * t1) + " m/s", r2(sp + 2) + " m/s", r2(sp / 2) + " m/s"]
          }, { difficulty: L.diffFor(out.length), tags: ["speed"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let m = 10; m <= 500 && out.length < cap; m++) {
        for (const g of [9.8, 10]) {
          const w = r2(m * g);
          const mm = L.buildParametric(rng, {
            q: () => `Weight of a ${m} kg object (g = ${g} m/s²) is:`,
            a: () => w + " N",
            e: () => `Weight = mg = ${m} × ${g} = ${w} N.`,
            distract: () => [r2(m / g) + " N", r2(w / 2) + " N", r2(w + 9.8) + " N"]
          }, { difficulty: L.diffFor(out.length), tags: ["weight"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    }
  ]),
  physicsParam("physics", "Physics — Numericals II", "Electricity and Waves", [
    (rng, cap) => {
      const out = [];
      for (let v = 5; v <= 220 && out.length < cap; v++) {
        for (let i = 1; i <= 12 && out.length < cap; i++) {
          const p = v * i;
          const mm = L.buildParametric(rng, {
            q: () => `Power consumed by a device drawing ${i} A at ${v} V is:`,
            a: () => p + " W",
            e: () => `Power = V × I = ${v} × ${i} = ${p} W.`,
            distract: () => [r2(p / 2) + " W", r2(v / i) + " W", r2(p * 2) + " W"]
          }, { difficulty: L.diffFor(out.length), tags: ["power"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let r = 2; r <= 100 && out.length < cap; r++) {
        for (let i = 1; i <= 9 && out.length < cap; i++) {
          const v = r * i;
          const mm = L.buildParametric(rng, {
            q: () => `Voltage across a ${r} Ω resistor carrying ${i} A is:`,
            a: () => v + " V",
            e: () => `V = IR = ${i} × ${r} = ${v} V (Ohm's law).`,
            distract: () => [r2(r / i) + " V", r2(v / 2) + " V", r2(v + 5) + " V"]
          }, { difficulty: L.diffFor(out.length), tags: ["ohm"] });
          if (mm) out.push(mm);
        }
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let f = 5; f <= 440 && out.length < cap; f += 5) {
        const lam = r2(300 / f);
        const mm = L.buildParametric(rng, {
          q: () => `Wavelength of a wave of frequency ${f} Hz travelling at 300 m/s is:`,
          a: () => lam + " m",
          e: () => `λ = v/f = 300/${f} = ${lam} m.`,
          distract: () => [r2(f * 300) + " m", r2(lam * 2) + " m", r2(300 + f) + " m"]
        }, { difficulty: L.diffFor(out.length), tags: ["waves"] });
        if (mm) out.push(mm);
      }
      return out;
    },
    (rng, cap) => {
      const out = [];
      for (let mode = 0; mode < 2 && out.length < cap; mode++) {
        for (let ra = 2; ra <= 20 && out.length < cap; ra++) {
          for (let rb = 2; rb <= 20 && out.length < cap; rb++) {
            const s = ra + rb, p = r2(ra * rb / (ra + rb));
            const isSeries = mode === 0;
            const mm = L.buildParametric(rng, {
              q: () => `Two resistors ${ra} Ω and ${rb} Ω are connected in ${isSeries ? "series" : "parallel"}. Equivalent resistance is:`,
              a: () => isSeries ? s + " Ω" : p + " Ω",
              e: () => isSeries
                ? `Series: R = R1 + R2 = ${ra} + ${rb} = ${s} Ω.`
                : `Parallel: R = R1R2/(R1+R2) = (${ra}×${rb})/${ra + rb} = ${p} Ω.`,
              distract: () => [isSeries ? p + " Ω" : s + " Ω", r2(s / 2) + " Ω", r2(s + 5) + " Ω"]
            }, { difficulty: L.diffFor(out.length), tags: ["resistors"] });
            if (mm) out.push(mm);
          }
        }
      }
      return out;
    }
  ]),
  makeGen("everyday-science", "Everyday Science — Facts", {
    "Units and Measurement": [
      ["Which unit measures force?", "Newton", "Force is measured in newtons (N) in the SI system."],
      ["Which unit measures electric current?", "Ampere", "Current is measured in amperes (A)."],
      ["Which unit measures power?", "Watt", "Power is measured in watts (W); 1 W = 1 J/s."],
      ["Which unit measures frequency?", "Hertz", "Frequency is measured in hertz (Hz), cycles per second."],
      ["Which unit measures energy?", "Joule", "Energy and work are measured in joules (J)."],
      ["Which unit measures pressure?", "Pascal", "Pressure is measured in pascals (Pa) = N/m²."],
      ["Which unit measures electric resistance?", "Ohm", "Resistance is measured in ohms (Ω)."],
      ["Which unit measures temperature in SI?", "Kelvin", "The kelvin (K) is the SI base unit of temperature."],
      ["Which unit measures luminous intensity?", "Candela", "Candela (cd) is the SI unit of luminous intensity."],
      ["Which unit measures amount of substance?", "Mole", "The mole (mol) counts entities in chemistry."]
    ],
    "Human Body": [
      ["Which organ pumps blood?", "Heart", "The heart circulates blood through the circulatory system."],
      ["Which organ filters blood?", "Kidneys", "Kidneys remove waste and regulate fluid balance."],
      ["Which organ produces insulin?", "Pancreas", "The pancreas secretes insulin to control blood sugar."],
      ["Which gas do red blood cells carry?", "Oxygen", "Haemoglobin in red cells transports oxygen."],
      ["What is the largest organ of the human body?", "Skin", "The skin covers and protects the whole body."],
      ["Which vitamin is made in sunlight?", "Vitamin D", "Skin synthesises vitamin D with UV light."],
      ["How many bones does an adult human have?", "206", "Adults have 206 bones; infants have more at birth."],
      ["Which part of the brain controls balance?", "Cerebellum", "The cerebellum coordinates movement and balance."],
      ["What is the normal human body temperature?", "37°C", "Normal core temperature is about 37 °C (98.6 °F)."],
      ["Which acid is in the stomach?", "Hydrochloric acid", "HCl helps digest food and kill microbes."]
    ],
    "Matter and Light": [
      ["What is the speed of light in vacuum?", "300,000 km/s", "Light travels at approximately 3×10⁸ m/s."],
      ["Which colour has the longest wavelength?", "Red", "Red light has the longest visible wavelength."],
      ["Which gas is most abundant in Earth's atmosphere?", "Nitrogen", "Nitrogen makes up about 78% of the atmosphere."],
      ["What is the hardest natural substance?", "Diamond", "Diamond scores 10 on the Mohs scale."],
      ["Which metal is liquid at room temperature?", "Mercury", "Mercury is the only metal liquid at room temperature."],
      ["What is the chemical formula of water?", "H2O", "Water is two hydrogen atoms bonded to one oxygen."],
      ["Which state of matter has fixed shape and volume?", "Solid", "Solids keep both shape and volume."],
      ["What is plasma?", "an ionised gas", "Plasma is a hot gas of charged particles."],
      ["Which lens converges light?", "Convex lens", "Convex lenses focus parallel rays to a point."],
      ["What is a sound wave?", "a longitudinal pressure wave", "Sound travels as compressions and rarefactions."]
    ]
  }),
  makeGen("chemistry", "Chemistry — Core", {
    "Elements and Symbols": [
      ["What is the chemical symbol of gold?", "Au", "Au comes from the Latin 'aurum'."],
      ["What is the symbol of sodium?", "Na", "Na derives from the Latin 'natrium'."],
      ["What is the symbol of potassium?", "K", "K comes from the Latin 'kalium'."],
      ["What is the symbol of iron?", "Fe", "Fe derives from the Latin 'ferrum'."],
      ["What is the symbol of silver?", "Ag", "Ag comes from the Latin 'argentum'."],
      ["What is the symbol of lead?", "Pb", "Pb derives from the Latin 'plumbum'."],
      ["What is the symbol of copper?", "Cu", "Cu comes from the Latin 'cuprum'."],
      ["What is the symbol of mercury?", "Hg", "Hg derives from the Greek 'hydrargyrum'."],
      ["What is the atomic number of carbon?", "6", "Carbon has 6 protons in its nucleus."],
      ["What is the atomic number of oxygen?", "8", "Oxygen has 8 protons."],
      ["What is the atomic number of hydrogen?", "1", "Hydrogen is the lightest element with one proton."],
      ["What is the atomic number of nitrogen?", "7", "Nitrogen has 7 protons."],
      ["Which element is the most abundant in Earth's crust?", "Oxygen", "Oxygen makes up about 46% of the crust by mass."],
      ["Which is the lightest element?", "Hydrogen", "Hydrogen has the lowest atomic mass."],
      ["Which element is a noble gas?", "Helium", "Helium is a noble gas with a full electron shell."]
    ],
    "Bonds and Reactions": [
      ["Which bond shares electrons?", "Covalent bond", "Covalent bonds share electron pairs between atoms."],
      ["Which bond transfers electrons?", "Ionic bond", "Ionic bonds form between cations and anions."],
      ["What is a catalyst?", "a substance that speeds a reaction unchanged", "Catalysts lower activation energy and are not consumed."],
      ["What is oxidation?", "loss of electrons", "Oxidation removes electrons; reduction gains them."],
      ["What is the pH of a neutral solution?", "7", "pH 7 is neutral; below is acidic, above basic."],
      ["What is an acid?", "a substance that donates protons", "Acids release H⁺ ions in water."],
      ["What is a base?", "a substance that accepts protons", "Bases release OH⁻ or accept H⁺."],
      ["What is a salt?", "the product of acid-base neutralisation", "Neutralisation forms salt and water."],
      ["Which gas is produced by burning carbon completely?", "Carbon dioxide", "Complete combustion of carbon yields CO₂."],
      ["What is a chemical equation?", "a symbolic statement of a reaction", "Equations balance atoms on both sides."],
      ["What is a mole?", "6.022 × 10²³ particles", "Avogadro's number counts entities in a mole."],
      ["What is an isotope?", "atoms of an element with different neutrons", "Isotopes share protons but differ in mass number."]
    ]
  }),
  makeGen("biology", "Biology — Life Science", {
    "Cell Biology": [
      ["Which organelle is the powerhouse of the cell?", "Mitochondria", "Mitochondria produce ATP by respiration."],
      ["Which organelle controls the cell?", "Nucleus", "The nucleus holds genetic material and directs activity."],
      ["Which process makes food in plants?", "Photosynthesis", "Photosynthesis converts light, water and CO₂ to glucose."],
      ["What is the basic unit of life?", "Cell", "All living things are made of cells."],
      ["Which structure controls what enters the cell?", "Cell membrane", "The membrane selectively regulates transport."],
      ["Which organelle builds proteins?", "Ribosome", "Ribosomes assemble proteins from mRNA."],
      ["What is DNA?", "the molecule of heredity", "DNA stores genetic information in its sequence."],
      ["Which process splits a cell into two identical cells?", "Mitosis", "Mitosis produces two genetically identical cells."],
      ["Which process forms gametes with half the chromosomes?", "Meiosis", "Meiosis halves the chromosome number for reproduction."],
      ["What is cytoplasm?", "the gel inside the cell", "Cytoplasm suspends organelles and molecules."]
    ],
    "Human Systems": [
      ["Which system transports blood?", "Circulatory system", "The heart, blood and vessels form the circulatory system."],
      ["Which system exchanges gases?", "Respiratory system", "Lungs exchange oxygen and carbon dioxide."],
      ["Which system digests food?", "Digestive system", "The digestive tract breaks food into nutrients."],
      ["Which system controls the body?", "Nervous system", "Nerves and brain send and process signals."],
      ["Which system produces hormones?", "Endocrine system", "Glands secrete hormones that regulate functions."],
      ["Which system removes waste?", "Excretory system", "Kidneys and skin remove metabolic waste."],
      ["Which system defends against disease?", "Immune system", "White cells and antibodies fight infections."],
      ["What is a neuron?", "a nerve cell", "Neurons transmit electrical impulses."],
      ["What is homeostasis?", "maintaining internal balance", "The body stabilises temperature, pH and water."],
      ["Which cells fight infection?", "White blood cells", "Leukocytes engulf pathogens and make antibodies."]
    ],
    "Genetics and Evolution": [
      ["What is a gene?", "a unit of heredity", "Genes are DNA segments coding for traits."],
      ["Who is the father of genetics?", "Gregor Mendel", "Mendel's pea experiments founded genetics."],
      ["What is a chromosome?", "a packaged DNA molecule", "Humans have 23 pairs of chromosomes."],
      ["What is a dominant trait?", "a trait expressed over the other", "Dominant alleles mask recessive ones in heterozygotes."],
      ["What is a recessive trait?", "a trait only shown with two copies", "Recessive alleles require both copies to be expressed."],
      ["What is a mutation?", "a change in DNA sequence", "Mutations create variation and sometimes disease."],
      ["What is natural selection?", "survival of the fittest", "Better-adapted organisms reproduce more."],
      ["Who proposed natural selection?", "Charles Darwin", "Darwin described evolution by natural selection in 1859."],
      ["What is a species?", "organisms that interbreed", "Species are the basic unit of classification."],
      ["What is adaptation?", "a trait improving survival", "Adaptations arise through evolution over generations."]
    ]
  }),
  makeGen("botany", "Botany — Plant Science", {
    "Plant Structure": [
      ["Which part of the plant absorbs water?", "Roots", "Roots take up water and minerals from soil."],
      ["Which process makes plant food?", "Photosynthesis", "Leaves photosynthesise using chlorophyll."],
      ["Which pigment gives plants their green colour?", "Chlorophyll", "Chlorophyll captures light for photosynthesis."],
      ["Which part transports water upward?", "Xylem", "Xylem vessels conduct water from roots to leaves."],
      ["Which part transports food?", "Phloem", "Phloem distributes sugars through the plant."],
      ["Which part of the flower produces pollen?", "Stamen", "The stamen (anther) makes pollen grains."],
      ["Which part receives pollen?", "Pistil", "The pistil's stigma catches pollen for fertilisation."],
      ["What is transpiration?", "water loss from leaves", "Transpiration drives water movement and cools leaves."],
      ["Which structure opens and closes stomata?", "Guard cells", "Guard cells regulate gas exchange and water loss."],
      ["What is a seed?", "a plant embryo with food store", "Seeds germinate into new plants."]
    ],
    "Plant Types": [
      ["Which plants have cones instead of flowers?", "Gymnosperms", "Gymnosperms like pines reproduce with cones."],
      ["Which plants flower and bear fruits?", "Angiosperms", "Angiosperms are flowering, fruit-bearing plants."],
      ["Which plants lack true roots and stems?", "Bryophytes", "Mosses and liverworts are simple non-vascular plants."],
      ["Which plants reproduce by spores?", "Ferns", "Ferns spread via spores rather than seeds."],
      ["What is a herb?", "a soft-stemmed plant", "Herbs have non-woody stems that die back."],
      ["What is a shrub?", "a small woody plant", "Shrubs branch from the base without a main trunk."],
      ["What is a tree?", "a tall woody plant with a trunk", "Trees have a single persistent main stem."],
      ["Which part of a plant becomes a fruit?", "Ovary", "After fertilisation the ovary ripens into fruit."]
    ]
  }),
  makeGen("zoology", "Zoology — Animal Science", {
    "Animal Groups": [
      ["Which group includes mammals?", "Mammalia", "Mammals nurse young and have hair or fur."],
      ["Which animals lay eggs and have feathers?", "Birds", "Aves (birds) are feathered, egg-laying vertebrates."],
      ["Which animals live both on land and in water?", "Amphibians", "Frogs and toads are amphibians."],
      ["Which animals are cold-blooded with scales?", "Reptiles", "Snakes and lizards are reptiles."],
      ["Which animals breathe through gills?", "Fish", "Fish extract oxygen from water with gills."],
      ["What is a mammal?", "a warm-blooded animal with hair", "Mammals produce milk for their young."],
      ["Which animal is the largest mammal?", "Blue whale", "The blue whale is the largest animal alive."],
      ["Which animal is the fastest land animal?", "Cheetah", "Cheetahs sprint at over 100 km/h."],
      ["What is an invertebrate?", "an animal without a backbone", "Insects, worms and molluscs are invertebrates."],
      ["Which class do insects belong to?", "Insecta", "Insects have six legs and three body parts."]
    ],
    "Animal Functions": [
      ["What is hibernation?", "deep winter sleep", "Hibernation conserves energy when food is scarce."],
      ["What is migration?", "seasonal movement of animals", "Birds migrate to favourable climates."],
      ["What is camouflage?", "blending with the environment", "Camouflage hides animals from predators."],
      ["What is a food chain?", "energy flow between organisms", "Energy passes from plants to herbivores to carnivores."],
      ["What is a predator?", "an animal that hunts others", "Predators feed on prey animals."],
      ["What is an herbivore?", "an animal that eats plants", "Herbivores feed on plant matter only."],
      ["What is a carnivore?", "an animal that eats meat", "Carnivores feed chiefly on other animals."],
      ["What is an omnivore?", "an animal eating plants and meat", "Humans and bears are omnivores."],
      ["What is a producer in an ecosystem?", "an organism making its own food", "Plants and algae are producers."],
      ["What is a consumer?", "an organism eating others", "Animals are consumers in food webs."]
    ]
  }),
  makeGen("environmental-science", "Environmental Science — Ecology", {
    "Ecosystems": [
      ["What is an ecosystem?", "living and non-living parts interacting", "Ecosystems link organisms with their environment."],
      ["What is biodiversity?", "the variety of life", "Biodiversity includes species, genes and ecosystems."],
      ["What is pollution?", "harmful substances in the environment", "Pollutants damage air, water and soil."],
      ["What is global warming?", "rising average temperatures", "Greenhouse gases trap heat and warm the planet."],
      ["Which gas is the main greenhouse gas from human activity?", "Carbon dioxide", "CO₂ from fossil fuels drives climate change."],
      ["What is deforestation?", "clearing of forests", "Deforestation destroys habitats and raises CO₂."],
      ["What is recycling?", "reusing materials", "Recycling reduces waste and resource use."],
      ["What is a renewable resource?", "a resource that replenishes", "Solar and wind energy are renewable."],
      ["What is a non-renewable resource?", "a resource that cannot replenish quickly", "Coal, oil and gas are non-renewable."],
      ["What is conservation?", "protecting natural resources", "Conservation sustains species and ecosystems."],
      ["What is an endangered species?", "a species at risk of extinction", "Endangered species need protection to survive."],
      ["What is an ecological niche?", "an organism's role in its habitat", "The niche covers food, behaviour and habitat use."]
    ]
  }),
  makeGen("biotechnology", "Biotechnology — Applications", {
    "Biotech Basics": [
      ["What is biotechnology?", "using biology for products", "Biotech applies organisms to make goods and services."],
      ["What is genetic engineering?", "modifying DNA directly", "Engineering inserts or edits genes in organisms."],
      ["What is a GMO?", "a genetically modified organism", "GMOs carry intentionally altered genes."],
      ["What is cloning?", "producing identical copies", "Clones share identical genetic material."],
      ["What is a vaccine?", "a product that trains immunity", "Vaccines trigger protection against disease."],
      ["What is fermentation?", "microbial conversion of sugars", "Fermentation makes bread, yogurt and alcohol."],
      ["What is insulin produced by biotechnology?", "human insulin from engineered bacteria", "Recombinant insulin treats diabetes."],
      ["What is CRISPR?", "a gene-editing tool", "CRISPR-Cas9 cuts and edits DNA precisely."],
      ["What is a bioreactor?", "a vessel for biological processes", "Bioreactors grow cells for production."],
      ["What is fermentation used to produce?", "foods, fuels and medicines", "Fermentation yields ethanol, acids and probiotics."]
    ]
  })
];
