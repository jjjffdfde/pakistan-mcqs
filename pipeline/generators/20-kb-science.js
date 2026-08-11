/* ============================================================
   Deep Knowledge KB — Everyday Science
   Physics/Chemistry/Biology basics, human body, units, space,
   earth science — dense, exam-focused, with numeric topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["everyday-science"],
  chapter: "Everyday Science — Deep Knowledge Bank",
  tags: ["everyday-science", "deep-kb", "physics", "chemistry", "biology", "units"],
  topics: {

    "Physical Quantities and Units": [
      {
        kind: "pair", a: "physical quantity", b: "SI unit",
        note: "Every physical quantity has a standard SI unit that exams repeatedly test.",
        pairs: [
          ["Force", "newton (N)"], ["Pressure", "pascal (Pa)"], ["Energy", "joule (J)"], ["Power", "watt (W)"],
          ["Electric current", "ampere (A)"], ["Electric charge", "coulomb (C)"], ["Frequency", "hertz (Hz)"],
          ["Temperature", "kelvin (K)"], ["Luminous intensity", "candela (cd)"], ["Work", "joule (J)"]
        ],
        trick: "Force-N, Pressure-Pa, Energy-J, Power-W, Current-A, Frequency-Hz.",
        tip: "Unit↔quantity matching is the single most repeated Everyday Science question."
      },
      {
        kind: "pair", a: "measuring instrument", b: "quantity it measures",
        note: "Instruments and the quantities they measure are classic paired facts.",
        pairs: [
          ["Barometer", "atmospheric pressure"], ["Thermometer", "temperature"], ["Ammeter", "electric current"],
          ["Voltmeter", "potential difference"], ["Hygrometer", "humidity"], ["Anemometer", "wind speed"],
          ["Stethoscope", "heart and lung sounds"], ["Sphygmomanometer", "blood pressure"], ["Galvanometer", "small electric current"],
          ["Seismograph", "earthquake intensity"]
        ],
        trick: "Barometer=pressure, Hygrometer=humidity, Anemometer=wind, Seismograph=earthquakes.",
        tip: "Barometer↔pressure and Hygrometer↔humidity are the two most asked pairs."
      },
      {
        kind: "numeric", name: "unit conversions", difficulty: "easy",
        note: "Metric conversions are arithmetic staples: 1 km = 1000 m, 1 kg = 1000 g, 1 L = 1000 mL.",
        q: (v) => `How many ${v.u1} are there in ${v.n} ${v.u2}?`,
        a: (v) => `${(v.n * v.m).toLocaleString()} ${v.u1}`,
        e: (v) => `Because 1 ${v.u2} = ${v.m.toLocaleString()} ${v.u1}, multiplying ${v.n} by ${v.m.toLocaleString()} gives ${(v.n * v.m).toLocaleString()} ${v.u1}.`,
        distract: (v) => {
          const c = v.n * v.m;
          return [`${(c * 10).toLocaleString()} ${v.u1}`, `${(c / 10).toLocaleString()} ${v.u1}`, `${(c + v.m).toLocaleString()} ${v.u1}`, `${(c - v.m).toLocaleString()} ${v.u1}`, `${(v.n / v.m).toLocaleString()} ${v.u1}`];
        },
        vals: (rng) => {
          const sets = [
            { m: 1000, u1: "metres", u2: "kilometres" }, { m: 1000, u1: "grams", u2: "kilograms" },
            { m: 1000, u1: "millilitres", u2: "litres" }, { m: 100, u1: "centimetres", u2: "metres" },
            { m: 1000, u1: "milligrams", u2: "grams" }, { m: 1000000, u1: "millimetres", u2: "kilometres" }
          ];
          const s = sets[Math.floor(rng() * sets.length)];
          return { ...s, n: 1 + Math.floor(rng() * 12) };
        },
        whyWrong: (v) => [`The correct multiplier for this conversion is ${v.m.toLocaleString()}; other answers come from wrong multipliers.`],
        trick: "Metric: kilo = ×1000, centi = ÷100, milli = ÷1000 — always check the prefix.",
        tip: "Conversion questions are free marks; memorise the three prefixes."
      },
      {
        kind: "fact", name: "SI base units",
        note: "The seven SI base units define all measurement; their definitions are standard facts.",
        facts: [
          ["What is the SI unit of time?", "Second", "The second, defined by caesium atomic vibrations, is the SI base unit of time."],
          ["What is the SI unit of length?", "Metre", "The metre, defined by the distance light travels in a fixed time, is the SI base unit of length."],
          ["What is the SI unit of mass?", "Kilogram", "The kilogram is the SI base unit of mass, defined by the Planck constant since 2019."],
          ["How many base units does the SI system have?", "Seven", "The SI has seven base units: metre, kilogram, second, ampere, kelvin, mole and candela."],
          ["What is the SI unit of amount of substance?", "Mole", "The mole, containing Avogadro's number of particles, is the SI unit for amount of substance."],
          ["What is the SI unit of electric current?", "Ampere", "The ampere, defined through the elementary charge, is the SI base unit of electric current."],
          ["What is the SI unit of temperature?", "Kelvin", "The kelvin is the SI unit of temperature, with absolute zero at 0 K."],
          ["What is the CGS unit of force?", "Dyne", "The dyne is the force unit of the centimetre-gram-second system, equal to 10⁻⁵ newtons."]
        ],
        trick: "Seven base units; metre=length, second=time, kg=mass, ampere=current, kelvin=temperature, mole=amount.",
        tip: "'Seven SI base units' and 'kelvin is for temperature' are the anchor facts."
      },
      {
        kind: "tf", name: "units and instruments",
        note: "True/false stems on units and measuring instruments.",
        statements: [
          ["Force is measured in newtons.", "Force is measured in joules."],
          ["A barometer measures atmospheric pressure.", "A barometer measures humidity."],
          ["Power is measured in watts.", "Power is measured in volts."],
          ["A hygrometer measures humidity.", "A hygrometer measures wind speed."],
          ["Frequency is measured in hertz.", "Frequency is measured in pascals."]
        ],
        trick: "N=force, Pa=pressure, W=power, Hz=frequency; barometer=pressure, hygrometer=humidity.",
        tip: "Joule↔newton and watt↔volt confusions are the standard traps."
      }
    ],

    "Physics in Daily Life": [
      {
        kind: "fact", name: "everyday physics",
        note: "The physics behind everyday phenomena is a favourite exam theme.",
        facts: [
          ["Why does a balloon stick to a wall after rubbing?", "Static electricity", "Rubbing charges the balloon, and the static charge attracts it to the wall, an effect of static electricity."],
          ["Why do we see lightning before hearing thunder?", "Light travels faster than sound", "Light moves about a million times faster than sound, so the flash reaches us before the thunder."],
          ["Which force pulls objects towards the centre of the Earth?", "Gravity", "Gravity is the attractive force that gives objects weight and pulls them towards the Earth's centre."],
          ["What is the acceleration due to gravity on Earth?", "About 9.8 m/s²", "Near Earth's surface objects accelerate at approximately 9.8 metres per second squared due to gravity."],
          ["Why does ice float on water?", "Ice is less dense than water", "Ice expands when it freezes, so it becomes less dense and floats on liquid water."],
          ["What is the bending of light when it passes from air into water called?", "Refraction", "Refraction bends light at the boundary between media of different density, which is why a straw looks bent in water."],
          ["Which phenomenon explains a rainbow?", "Refraction and dispersion of light", "Rainbows form when sunlight refracts and disperses into colours inside water droplets."],
          ["Which phenomenon is responsible for the blue colour of the sky?", "Scattering of light", "Air molecules scatter shorter blue wavelengths more strongly, giving the sky its blue colour."],
          ["What is the speed of light in vacuum?", "About 300,000 km/s", "Light travels at roughly 300,000 kilometres per second in vacuum, the fastest speed known."],
          ["What is the speed of sound in air at room temperature?", "About 343 m/s", "Sound travels at about 343 metres per second in air at 20°C, far slower than light."],
          ["Why does a bus passenger lurch forward when the bus stops suddenly?", "Inertia", "Inertia keeps the passenger's body moving forward when the bus decelerates, as Newton's first law explains."],
          ["Which law states that every action has an equal and opposite reaction?", "Newton's third law", "Newton's third law pairs every action with an equal and opposite reaction, as seen when a gun recoils."]
        ],
        trick: "9.8 m/s² gravity, 300,000 km/s light, 343 m/s sound; refraction bends, scattering blues.",
        tip: "Speed of light vs speed of sound is the classic comparison one-liner."
      },
      {
        kind: "tf", name: "everyday physics",
        note: "True/false stems on everyday physics phenomena.",
        statements: [
          ["Light travels faster than sound.", "Sound travels faster than light."],
          ["Ice floats on water because it is less dense than water.", "Ice floats on water because it is denser than water."],
          ["The sky appears blue because of the scattering of light.", "The sky appears blue because of the reflection of the sea."],
          ["Gravity accelerates falling objects at about 9.8 m/s².", "Gravity accelerates falling objects at about 98 m/s²."],
          ["Refraction is the bending of light between different media.", "Refraction is the absorption of light by black surfaces."]
        ],
        trick: "Light > sound; ice less dense; blue = scattering; gravity 9.8.",
        tip: "Any statement reversing density or speed comparisons is false."
      }
    ],

    "Human Body": [
      {
        kind: "pair", a: "organ", b: "main function",
        note: "Organ-function pairs are the backbone of everyday science biology questions.",
        pairs: [
          ["Heart", "pumping blood through the body"], ["Lungs", "gas exchange of oxygen and carbon dioxide"], ["Kidneys", "filtering waste from the blood"],
          ["Liver", "detoxification and bile production"], ["Stomach", "digestion with acids and enzymes"], ["Brain", "controlling the nervous system"],
          ["Pancreas", "producing insulin and digestive enzymes"], ["Skin", "protection and temperature regulation"]
        ],
        trick: "Heart=pump, Lungs=gas exchange, Kidneys=filter, Liver=detox/bile, Pancreas=insulin.",
        tip: "Kidneys↔filtering and Pancreas↔insulin are the two most asked organ pairs."
      },
      {
        kind: "fact", name: "body systems",
        note: "Key facts about the human body's structure and systems.",
        facts: [
          ["How many bones does an adult human body have?", "206", "The adult human skeleton has 206 bones, while a newborn has about 300 that fuse during growth."],
          ["How many bones does a newborn baby have approximately?", "300", "A newborn has about 300 bones, many of which fuse to form the 206 adult bones."],
          ["Which is the largest organ of the human body?", "Skin", "The skin is the largest organ, covering about 2 square metres and protecting the entire body."],
          ["Which is the largest internal organ of the human body?", "Liver", "The liver is the largest internal organ and the body's main chemical factory."],
          ["Which is the largest bone of the human body?", "Femur", "The femur, or thigh bone, is the longest and strongest bone of the human body."],
          ["Which is the smallest bone of the human body?", "Stapes", "The stapes in the middle ear is the smallest bone, about 3 millimetres long."],
          ["How many chambers does the human heart have?", "Four", "The heart has four chambers: two atria and two ventricles, driving the double circulation."],
          ["Which blood cells carry oxygen?", "Red blood cells", "Red blood cells contain haemoglobin, which binds oxygen and carries it to body tissues."],
          ["Which blood cells fight infection?", "White blood cells", "White blood cells defend against pathogens, making immunity the body's infection response."],
          ["Which gland is called the 'master gland'?", "Pituitary", "The pituitary gland regulates other endocrine glands, earning the title master gland."],
          ["What is the normal human body temperature?", "About 37°C (98.6°F)", "The normal core body temperature is about 37°C, roughly 98.6°F, varying slightly by person and time."],
          ["Which part of the brain controls balance and coordination?", "Cerebellum", "The cerebellum coordinates movement and balance, while the cerebrum handles thought and sensation."]
        ],
        trick: "206 adult bones, skin largest organ, femur largest bone, stapes smallest, 4 heart chambers.",
        tip: "Largest/smallest (skin, femur, stapes) and the 206-bone count are guaranteed marks."
      },
      {
        kind: "tf", name: "human body",
        note: "True/false stems on the human body.",
        statements: [
          ["An adult human has 206 bones.", "An adult human has 306 bones."],
          ["The skin is the largest organ of the human body.", "The heart is the largest organ of the human body."],
          ["The femur is the largest bone in the human body.", "The tibia is the largest bone in the human body."],
          ["Red blood cells carry oxygen.", "White blood cells carry oxygen."],
          ["The pituitary is called the master gland.", "The thyroid is called the master gland."]
        ],
        trick: "206, skin, femur, RBC=oxygen, pituitary=master gland.",
        tip: "RBC↔oxygen vs WBC↔immunity is the most common swap trap."
      }
    ],

    "Chemistry in Daily Life": [
      {
        kind: "fact", name: "everyday chemistry",
        note: "Chemical facts from daily life are frequently examined.",
        facts: [
          ["What is the chemical formula of water?", "H₂O", "Water consists of two hydrogen atoms bonded to one oxygen atom, hence H₂O."],
          ["What is the chemical formula of common salt?", "NaCl", "Table salt is sodium chloride, one sodium atom and one chlorine atom."],
          ["What is the pH of pure water?", "7", "Pure water is neutral at pH 7, neither acidic nor basic, because hydrogen and hydroxide ion concentrations are equal, so it tests as neither an acid nor a base."],
          ["Which gas do plants absorb for photosynthesis?", "Carbon dioxide", "Plants take in carbon dioxide and release oxygen during photosynthesis, because CO₂ is the carbon source converted into glucose using sunlight energy."],
          ["Which gas is essential for respiration in humans?", "Oxygen", "Oxygen is required for cellular respiration, releasing energy from food."],
          ["Which gas makes up about 78% of the Earth's atmosphere?", "Nitrogen", "Nitrogen dominates the atmosphere at about 78%, followed by oxygen at about 21%."],
          ["What is the most abundant gas in the Earth's atmosphere?", "Nitrogen", "Nitrogen at roughly 78% is the most abundant atmospheric gas."],
          ["What is the chemical name of baking soda?", "Sodium bicarbonate", "Baking soda is sodium bicarbonate (NaHCO₃), used in cooking and as an antacid."],
          ["What is the chemical name of washing soda?", "Sodium carbonate", "Washing soda is sodium carbonate (Na₂CO₃), a common cleaning agent."],
          ["Which acid is found in lemon?", "Citric acid", "Citric acid gives lemons and citrus fruits their sour taste."],
          ["Which acid is present in vinegar?", "Acetic acid", "Vinegar is a dilute solution of acetic acid, about 5% by volume."],
          ["Which metal is liquid at room temperature?", "Mercury", "Mercury is the only metal that is liquid at ordinary room temperature."],
          ["What is the hardest natural substance known?", "Diamond", "Diamond, a form of carbon, is the hardest natural substance known."],
          ["What is the chemical symbol of gold?", "Au", "Gold's symbol Au comes from its Latin name aurum, which is why the symbol does not match the English word, a common exam trap."],
          ["What is the chemical symbol of silver?", "Ag", "Silver's symbol Ag comes from its Latin name argentum, explaining why the symbol differs from the English word silver."],
          ["What is the most abundant element in the Earth's crust?", "Oxygen", "Oxygen, about 46% of the crust by mass, is the most abundant crustal element, because it binds with silicon in the silicate minerals that dominate the crust."]
        ],
        trick: "H₂O water, NaCl salt, N₂ 78% air, citric = lemon, acetic = vinegar, Au = gold, Ag = silver.",
        tip: "Lemon↔citric and vinegar↔acetic are the two acid-source pairs."
      },
      {
        kind: "pair", a: "acid", b: "natural source",
        note: "Acids found in everyday substances are common exam pairs.",
        pairs: [
          ["Citric acid", "lemon and citrus fruits"], ["Acetic acid", "vinegar"], ["Lactic acid", "sour milk and muscles"],
          ["Hydrochloric acid", "stomach juice"], ["Ascorbic acid", "vitamin C in fruits"], ["Tartaric acid", "grapes and baking powder"]
        ],
        trick: "Citric=lemon, acetic=vinegar, lactic=sour milk, ascorbic=vitamin C.",
        tip: "Lactic acid↔sour milk and ascorbic↔vitamin C are the two subtlest pairs."
      },
      {
        kind: "tf", name: "everyday chemistry",
        note: "True/false stems on daily-life chemistry.",
        statements: [
          ["Nitrogen makes up about 78% of the atmosphere.", "Oxygen makes up about 78% of the atmosphere."],
          ["Mercury is a liquid metal at room temperature.", "Iron is a liquid metal at room temperature."],
          ["Baking soda is sodium bicarbonate.", "Baking soda is sodium chloride."],
          ["Diamond is the hardest natural substance.", "Quartz is the hardest natural substance."],
          ["Vinegar contains acetic acid.", "Vinegar contains citric acid."]
        ],
        trick: "N₂ 78%, mercury liquid, NaHCO₃ baking soda, diamond hardest, acetic in vinegar.",
        tip: "Swap acid sources (citric/lemon ↔ acetic/vinegar) and the statement is false."
      }
    ],

    "Earth and Space": [
      {
        kind: "fact", name: "earth and space",
        note: "Basic astronomy and earth science facts appear in most papers.",
        facts: [
          ["Which is the closest star to the Earth?", "The Sun", "The Sun, at about 150 million kilometres away, is the star nearest to Earth."],
          ["Which is the largest planet of the solar system?", "Jupiter", "Jupiter is the largest planet, more than twice as massive as all other planets combined."],
          ["Which is the smallest planet of the solar system?", "Mercury", "Mercury is the smallest planet and the closest to the Sun, because its small mass and tight orbit keep it the innermost world."],
          ["Which planet is known as the Red Planet?", "Mars", "Mars appears red because of iron oxide dust covering its surface."],
          ["Which planet is known as the Morning Star or Evening Star?", "Venus", "Venus shines brightly near the Sun's position and is called the Morning or Evening Star."],
          ["Which planet is called the Blue Planet?", "Earth", "Earth appears blue from space because of its oceans covering about 71% of the surface."],
          ["Which is the hottest planet of the solar system?", "Venus", "Venus, with its dense carbon-dioxide atmosphere, is hotter than Mercury despite being farther from the Sun."],
          ["How many planets are there in our solar system?", "Eight", "The solar system has eight planets: Mercury to Neptune, since Pluto was reclassified in 2006."],
          ["Which planet was reclassified as a dwarf planet in 2006?", "Pluto", "Pluto was reclassified as a dwarf planet by the IAU in 2006 because it fails to clear its orbit."],
          ["Which is the only natural satellite of the Earth?", "The Moon", "The Moon is Earth's only natural satellite, at about 384,000 kilometres away."],
          ["How long does the Earth take to rotate once on its axis?", "24 hours (one day)", "One full rotation of Earth takes about 24 hours, producing the day-night cycle."],
          ["How long does the Earth take to orbit the Sun?", "About 365.25 days", "Earth's orbit takes about 365.25 days, which is why leap years add a day every four years."],
          ["Which layer of the atmosphere protects life from ultraviolet radiation?", "Ozone layer", "The ozone layer in the stratosphere absorbs most harmful ultraviolet radiation."],
          ["Which layer of the Earth's atmosphere do planes usually fly in?", "Troposphere", "Commercial aircraft cruise in the lower stratosphere just above the troposphere, the weather layer."],
          ["What causes the seasons on Earth?", "The tilt of the Earth's axis", "The 23.5° tilt of Earth's axis causes seasons as different hemispheres lean toward the Sun."]
        ],
        trick: "Jupiter largest, Mercury smallest, Mars red, Venus morning star, 8 planets, Pluto dwarf.",
        tip: "Venus = hottest + morning star; Mars = red; the 8-planet count post-2006."
      },
      {
        kind: "pair", a: "planet", b: "distinctive feature",
        note: "Each planet has a signature feature tested in pair questions.",
        pairs: [
          ["Mars", "the Red Planet with iron-oxide soil"], ["Venus", "the hottest planet with a dense CO₂ atmosphere"],
          ["Jupiter", "the largest planet with the Great Red Spot"], ["Saturn", "the planet with the most prominent rings"],
          ["Mercury", "the smallest planet closest to the Sun"], ["Neptune", "the windiest planet at the edge of the system"]
        ],
        trick: "Mars=red, Venus=hottest, Jupiter=largest+Great Red Spot, Saturn=rings, Mercury=smallest.",
        tip: "Saturn↔rings and Jupiter↔Great Red Spot are the two most asked planet pairs."
      },
      {
        kind: "tf", name: "earth and space facts",
        note: "True/false stems on astronomy basics.",
        statements: [
          ["Jupiter is the largest planet of the solar system.", "Earth is the largest planet of the solar system."],
          ["Venus is called the Morning Star.", "Mars is called the Morning Star."],
          ["Pluto was reclassified as a dwarf planet in 2006.", "Pluto is still counted as the ninth planet."],
          ["The solar system has eight planets.", "The solar system has nine planets."],
          ["The ozone layer absorbs ultraviolet radiation.", "The ozone layer absorbs visible light only."]
        ],
        trick: "Jupiter largest, Venus morning star, 8 planets, Pluto dwarf 2006.",
        tip: "'Nine planets' is the out-of-date trap — the answer is eight."
      }
    ],

    "Biological Sciences": [
      {
        kind: "fact", name: "biology basics",
        note: "Core biology facts about cells, plants and classification are standard content.",
        facts: [
          ["What is the basic unit of life?", "The cell", "The cell is the smallest structural and functional unit of all living organisms."],
          ["Which organelle is called the powerhouse of the cell?", "Mitochondria", "Mitochondria produce ATP through cellular respiration, earning the title powerhouse of the cell."],
          ["Which organelle controls the cell and contains DNA?", "The nucleus", "The nucleus houses the genetic material and directs the cell's activities."],
          ["Which pigment gives plants their green colour?", "Chlorophyll", "Chlorophyll in chloroplasts absorbs light for photosynthesis and gives plants their green colour."],
          ["Which process do green plants use to make food?", "Photosynthesis", "Photosynthesis converts light, water and carbon dioxide into glucose and oxygen in chloroplasts."],
          ["What is the scientific study of plants called?", "Botany", "Botany is the branch of biology that studies plants, while zoology studies animals."],
          ["What is the scientific study of animals called?", "Zoology", "Zoology is the branch of biology devoted to the study of animals."],
          ["What is the study of heredity called?", "Genetics", "Genetics studies how traits pass from parents to offspring through genes."],
          ["What is the basic unit of heredity?", "The gene", "Genes are segments of DNA that carry the instructions for inherited traits."],
          ["Which acid is the genetic material of most living things?", "DNA", "Deoxyribonucleic acid (DNA) carries the genetic instructions of almost all organisms."],
          ["How many pairs of chromosomes do humans have?", "23", "Humans have 23 pairs of chromosomes, 46 in total, with one pair determining sex."],
          ["What is the smallest blood vessel in the body called?", "Capillary", "Capillaries connect arteries to veins and allow exchange of gases and nutrients."],
          ["Which vitamin is produced by sunlight on the skin?", "Vitamin D", "Sunlight converts cholesterol in the skin into vitamin D, essential for calcium absorption."],
          ["Which vitamin is found mainly in citrus fruits?", "Vitamin C", "Vitamin C (ascorbic acid) is abundant in citrus fruits and prevents scurvy."],
          ["Deficiency of which vitamin causes night blindness?", "Vitamin A", "Vitamin A deficiency impairs vision in dim light, causing night blindness."],
          ["Deficiency of which vitamin causes rickets?", "Vitamin D", "Vitamin D deficiency weakens bones in children, causing rickets."]
        ],
        trick: "Mitochondria=powerhouse, chlorophyll=green, DNA=heredity, 23 pairs, VitA=night blindness, VitD=rickets.",
        tip: "Vitamin-deficiency pairs (A=night blindness, D=rickets, C=scurvy) are exam gold."
      },
      {
        kind: "pair", a: "vitamin", b: "deficiency disease",
        note: "Vitamin-deficiency pairs are the most repeated biology matching questions.",
        pairs: [
          ["Vitamin A", "night blindness"], ["Vitamin B1", "beriberi"], ["Vitamin B3", "pellagra"],
          ["Vitamin C", "scurvy"], ["Vitamin D", "rickets"], ["Vitamin K", "bleeding disorders"]
        ],
        trick: "A=night blindness, B1=beriberi, C=scurvy, D=rickets, K=bleeding.",
        tip: "C=scurvy and D=rickets are the two anchors; K=bleeding is the subtle one."
      },
      {
        kind: "tf", name: "biology facts",
        note: "True/false stems on cells, plants and heredity.",
        statements: [
          ["Mitochondria are the powerhouse of the cell.", "Ribosomes are the powerhouse of the cell."],
          ["Humans have 23 pairs of chromosomes.", "Humans have 46 pairs of chromosomes."],
          ["Chlorophyll gives plants their green colour.", "Haemoglobin gives plants their green colour."],
          ["DNA carries genetic information.", "Glucose carries genetic information."],
          ["Vitamin C deficiency causes scurvy.", "Vitamin C deficiency causes rickets."]
        ],
        trick: "Mitochondria=powerhouse, 23 pairs, chlorophyll=green, DNA=genes, C=scurvy.",
        tip: "Vitamin-deficiency swaps (C↔D) are the classic false pattern."
      }
    ],

    "Sound and Light": [
      {
        kind: "fact", name: "sound facts",
        note: "Sound physics facts are a compact, high-yield exam section.",
        facts: [
          ["What is the SI unit of frequency?", "Hertz", "Frequency, the number of waves per second, is measured in hertz (Hz)."],
          ["What is the normal audible range of human hearing?", "20 Hz to 20,000 Hz", "Humans hear roughly from 20 hertz to 20 kilohertz, the audible frequency range."],
          ["What are sounds above 20,000 Hz called?", "Ultrasonic", "Frequencies above the human range are called ultrasonic, used in medical imaging."],
          ["What are sounds below 20 Hz called?", "Infrasonic", "Frequencies below 20 hertz are infrasonic, produced by earthquakes and elephants."],
          ["What is the loudness of sound measured in?", "Decibels", "Loudness is measured in decibels (dB), the logarithmic intensity scale."],
          ["What is the pitch of sound determined by?", "Frequency", "Higher frequency produces higher pitch, while amplitude controls loudness."],
          ["In which medium does sound travel fastest?", "Solids", "Sound travels fastest in solids, then liquids, then gases, because particles are closer."],
          ["Which instrument is used to measure sound intensity?", "Sound level meter (decibel meter)", "A sound level meter measures noise intensity in decibels, used for environmental monitoring."]
        ],
        trick: "Hz=frequency, 20-20k human range, dB=loudness, fastest in solids.",
        tip: "20 Hz–20 kHz and 'fastest in solids' are the two anchor sound facts."
      },
      {
        kind: "pair", a: "optical instrument", b: "use",
        note: "Optical instruments and their uses are standard pair questions.",
        pairs: [
          ["Microscope", "viewing tiny objects"], ["Telescope", "viewing distant celestial objects"], ["Periscope", "viewing over obstacles in submarines"],
          ["Spectroscope", "analysing light spectra"], ["Endoscope", "examining internal body cavities"]
        ],
        trick: "Microscope=small, telescope=distant, periscope=obstacles, endoscope=inside body.",
        tip: "Microscope↔tiny and telescope↔distant are the classic pair."
      },
      {
        kind: "tf", name: "sound and light",
        note: "True/false stems on sound and light physics.",
        statements: [
          ["Sound travels fastest in solids.", "Sound travels fastest in gases."],
          ["Loudness is measured in decibels.", "Loudness is measured in hertz."],
          ["The human audible range is 20 Hz to 20,000 Hz.", "The human audible range is 200 Hz to 200,000 Hz."],
          ["Ultrasonic sounds are above 20,000 Hz.", "Ultrasonic sounds are below 20 Hz."],
          ["A telescope is used to view distant objects.", "A microscope is used to view distant objects."]
        ],
        trick: "Solids fastest, dB loudness, 20-20k range, telescope=distant.",
        tip: "Decibel↔hertz swap is the most common trap."
      }
    ],

    "Numerical Physics": [
      {
        kind: "numeric", name: "speed conversions", difficulty: "medium",
        note: "Speed in kilometres per hour converts to metres per second by dividing by 3.6; converting back multiplies by 3.6.",
        q: (v) => `A car travels at ${v.s} km/h. What is its speed in metres per second?`,
        a: (v) => `${(v.s / 3.6).toFixed(1)} m/s`,
        e: (v) => `Because 1 km/h equals 1/3.6 m/s, dividing ${v.s} by 3.6 gives ${(v.s / 3.6).toFixed(1)} m/s, the standard speed conversion.`,
        distract: (v) => {
          const c = v.s / 3.6;
          return [`${(c * 2).toFixed(1)} m/s`, `${(c / 2).toFixed(1)} m/s`, `${(v.s * 3.6).toFixed(1)} m/s`, `${(c + 2).toFixed(1)} m/s`, `${(v.s / 36).toFixed(1)} m/s`];
        },
        vals: (rng) => ({ s: Math.round((36 + rng() * 144)) }),
        whyWrong: (v) => [`Multiplying instead of dividing by 3.6 gives the wrong conversion direction.`],
        trick: "km/h ÷ 3.6 = m/s; m/s × 3.6 = km/h.",
        tip: "The 3.6 factor appears in every speed conversion question."
      },
      {
        kind: "numeric", name: "temperature conversions", difficulty: "medium",
        note: "Celsius to Fahrenheit uses F = (9/5)C + 32, the standard thermal conversion formula.",
        q: (v) => `Convert ${v.c}°C into degrees Fahrenheit.`,
        a: (v) => `${Math.round(v.c * 9 / 5 + 32)}°F`,
        e: (v) => `Using F = (9/5)C + 32, ${v.c} × 9/5 + 32 = ${Math.round(v.c * 9 / 5 + 32)}°F, because each Celsius degree spans 9/5 Fahrenheit degrees above the 32° offset.`,
        distract: (v) => {
          const c = Math.round(v.c * 9 / 5 + 32);
          return [`${Math.round(v.c * 9 / 5)}°F`, `${c + 32}°F`, `${Math.round(v.c * 9 / 5 - 32)}°F`, `${Math.round(v.c * 1.8)}°F`, `${c - 40}°F`];
        },
        vals: (rng) => ({ c: Math.round((10 + rng() * 80)) }),
        whyWrong: (v) => [`The 32° offset is essential; answers without it are the common mistake.`],
        trick: "Multiply by 9/5, then add 32 — the offset is the trap.",
        tip: "F = 1.8C + 32 is the fastest memory form for this formula."
      },
      {
        kind: "numeric", name: "speed distance time", difficulty: "medium",
        note: "Speed = distance ÷ time; the three quantities convert into each other with simple division or multiplication.",
        q: (v) => `A train covers ${v.d} km in ${v.t} hours. What is its average speed?`,
        a: (v) => `${v.d / v.t} km/h`,
        e: (v) => `Average speed is distance divided by time, so ${v.d} ÷ ${v.t} = ${v.d / v.t} km/h, because speed measures distance covered per hour.`,
        distract: (v) => {
          const c = v.d / v.t;
          return [`${c * v.t} km/h`, `${c + 10} km/h`, `${v.d * v.t} km/h`, `${c / 2} km/h`, `${(v.d + v.t)} km/h`];
        },
        vals: (rng) => {
          const t = 2 + Math.floor(rng() * 4);
          const d = t * (50 + Math.floor(rng() * 40));
          return { d, t };
        },
        whyWrong: (v) => [`Speed = distance ÷ time; multiplying the two gives a different quantity.`],
        trick: "Divide distance by time — the units (km/h) confirm the operation.",
        tip: "Always check units: km ÷ hours = km/h tells you the formula."
      },
      {
        kind: "numeric", name: "density calculations", difficulty: "hard",
        note: "Density equals mass divided by volume, expressed in g/cm³ or kg/m³.",
        q: (v) => `A block of mass ${v.m} g occupies a volume of ${v.vol} cm³. What is its density?`,
        a: (v) => `${v.m / v.vol} g/cm³`,
        e: (v) => `Density = mass ÷ volume, so ${v.m} g ÷ ${v.vol} cm³ = ${v.m / v.vol} g/cm³, because density measures how much mass packs into each unit of volume.`,
        distract: (v) => {
          const c = v.m / v.vol;
          return [`${(c * 2).toFixed(2)} g/cm³`, `${(c / 2).toFixed(2)} g/cm³`, `${(v.m * v.vol).toLocaleString()} g/cm³`, `${(c + 0.5).toFixed(2)} g/cm³`, `${(c * 1.5).toFixed(2)} g/cm³`];
        },
        vals: (rng) => {
          const vol = 10 + Math.floor(rng() * 40);
          const m = vol * (0.5 + rng() * 3);
          return { m: Math.round(m), vol };
        },
        whyWrong: (v) => [`Multiplying mass by volume gives a different quantity; density is the quotient.`],
        trick: "d = m/v — density always equals mass over volume.",
        tip: "Water is 1 g/cm³; anything denser sinks, lighter floats."
      },
      {
        kind: "numeric", name: "electrical calculations", difficulty: "hard",
        note: "Ohm's law V = IR and power P = VI link voltage, current, resistance and power.",
        q: (v) => `A bulb draws ${v.i} amperes at ${v.v} volts. What is its power consumption?`,
        a: (v) => `${v.i * v.v} watts`,
        e: (v) => `Power = voltage × current, so ${v.v} V × ${v.i} A = ${v.i * v.v} W, because electrical power is the product of the potential difference and the current.`,
        distract: (v) => {
          const c = v.i * v.v;
          return [`${v.v / v.i} watts`, `${c * 2} watts`, `${c / 2} watts`, `${v.v + v.i} watts`, `${(c * 1.5).toFixed(1)} watts`];
        },
        vals: (rng) => {
          const v = 110 + Math.floor(rng() * 130);
          const i = Math.round((0.2 + rng() * 4) * 10) / 10;
          return { v, i };
        },
        whyWrong: (v) => [`P = V × I; dividing voltage by current gives resistance, not power.`],
        trick: "P = V×I; V = I×R — the two formulas are the power core.",
        tip: "If an option equals V÷I, it is resistance — an instant elimination."
      },
      {
        kind: "numeric", name: "force and pressure", difficulty: "hard",
        note: "Pressure equals force divided by area, measured in pascals (N/m²).",
        q: (v) => `A force of ${v.f} N acts on an area of ${v.a} m². What is the pressure?`,
        a: (v) => `${v.f / v.a} Pa`,
        e: (v) => `Pressure = force ÷ area, so ${v.f} N ÷ ${v.a} m² = ${v.f / v.a} Pa, because pressure spreads the force across the surface it acts on.`,
        distract: (v) => {
          const c = v.f / v.a;
          return [`${c * 2} Pa`, `${v.f * v.a} Pa`, `${c / 2} Pa`, `${c + 20} Pa`, `${(c * 1.25).toFixed(1)} Pa`];
        },
        vals: (rng) => {
          const a = Math.round((0.5 + rng() * 4.5) * 10) / 10;
          const f = a * (20 + Math.floor(rng() * 80));
          return { f, a };
        },
        whyWrong: (v) => [`Pressure = force ÷ area; multiplying them gives a different quantity.`],
        trick: "P = F/A — small area, high pressure (needles, knife edges).",
        tip: "Sharper tools mean smaller area, hence higher pressure."
      }
    ],

    "Important Scientists and Discoveries": [
      {
        kind: "pair", a: "scientist", b: "discovery",
        note: "Scientist-discovery pairs dominate the history of science section.",
        pairs: [
          ["Isaac Newton", "the laws of motion and gravitation"], ["Albert Einstein", "the theory of relativity"], ["Marie Curie", "radioactivity research and polonium"],
          ["Charles Darwin", "the theory of evolution"], ["Louis Pasteur", "pasteurisation and germ theory"], ["Alexander Fleming", "the discovery of penicillin"],
          ["Thomas Edison", "the practical electric light bulb"], ["Galileo Galilei", "improving the telescope and planetary observation"]
        ],
        trick: "Newton=gravity, Einstein=relativity, Curie=radioactivity, Fleming=penicillin, Darwin=evolution.",
        tip: "Fleming↔penicillin and Einstein↔relativity are the two most asked pairs."
      },
      {
        kind: "fact", name: "scientists",
        note: "Facts about the work of history's great scientists.",
        facts: [
          ["Who discovered penicillin?", "Alexander Fleming", "Fleming discovered penicillin in 1928 when he noticed mould killing bacteria in his lab."],
          ["Who proposed the theory of general relativity?", "Albert Einstein", "Einstein's 1915 general relativity explained gravity as the curvature of spacetime."],
          ["Who is known as the father of modern physics?", "Albert Einstein", "Einstein's relativity and quantum contributions earned him the title father of modern physics."],
          ["Who discovered the law of universal gravitation?", "Isaac Newton", "Newton's law of universal gravitation explains the force between all masses."],
          ["Who discovered the radioactive elements polonium and radium?", "Marie Curie", "Marie Curie isolated polonium and radium, and won Nobel Prizes in both physics and chemistry."],
          ["Who developed the theory of evolution by natural selection?", "Charles Darwin", "Darwin's 'On the Origin of Species' (1859) proposed evolution through natural selection."],
          ["Who developed the process of pasteurisation?", "Louis Pasteur", "Pasteur developed pasteurisation to kill microbes in milk and wine, and founded germ theory."],
          ["Who invented the telephone?", "Alexander Graham Bell", "Bell patented the telephone in 1876, revolutionising communication."],
          ["Who invented the light bulb (practical version)?", "Thomas Edison", "Edison's 1879 incandescent bulb made electric light practical for homes."],
          ["Who is called the father of modern chemistry?", "Antoine Lavoisier", "Lavoisier named oxygen and hydrogen and established the law of conservation of mass."],
          ["Who formulated the three laws of planetary motion?", "Johannes Kepler", "Kepler's three laws describe the elliptical orbits of the planets around the Sun."],
          ["Who proposed the heliocentric model of the solar system?", "Nicolaus Copernicus", "Copernicus placed the Sun, not the Earth, at the centre of the solar system."]
        ],
        trick: "Fleming=penicillin, Einstein=relativity, Newton=gravity, Curie=radium, Bell=telephone, Edison=bulb.",
        tip: "Invention/discovery↔scientist matching is the highest-yield science history section."
      },
      {
        kind: "tf", name: "scientists and discoveries",
        note: "True/false stems on scientific discoveries.",
        statements: [
          ["Alexander Fleming discovered penicillin.", "Louis Pasteur discovered penicillin."],
          ["Marie Curie discovered radium and polonium.", "Marie Curie discovered penicillin."],
          ["Newton formulated the laws of motion.", "Einstein formulated the laws of motion in 1687."],
          ["Darwin proposed the theory of evolution.", "Darwin proposed the theory of relativity."],
          ["Alexander Graham Bell invented the telephone.", "Thomas Edison invented the telephone."]
        ],
        trick: "Fleming=penicillin, Curie=radium, Newton=motion, Darwin=evolution, Bell=telephone.",
        tip: "Scientist-swap statements are the whole game; learn one discovery per name."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
