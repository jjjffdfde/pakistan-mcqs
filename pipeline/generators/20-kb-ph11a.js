/* ============================================================
   Phase 11 — KB Anatomical & Basic Sciences (volume via numerics)
   anatomy, physiology, biochemistry, pathology
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const ml = (v) => v.toLocaleString("en-US");

/* ---------------- ANATOMY ---------------- */
const anatomy = {
  subjects: ["anatomy"],
  chapter: "Anatomy — Human Structure (Phase 11)",
  tags: ["anatomy", "deep-kb", "skeleton", "muscle", "nerve"],
  topics: {
    "Bones and Skeleton": [
      { kind: "fact", name: "bone facts", note: "Skeletal essentials.",
        facts: [
          ["How many bones does an adult human have?", "206 bones", "The adult skeleton ordinarily has 206 bones, though individual variation occurs."],
          ["Which is the longest bone in the body?", "Femur", "The femur runs from the hip to the knee and is both longest and strongest."],
          ["Which is the smallest bone in the body?", "Stapes", "The stapes is the middle-ear ossicle and the tiniest bone at about 3 mm."],
          ["How many pairs of ribs are present in a normal human?", "12 pairs", "There are 12 rib pairs: 7 true, 3 false and 2 floating."],
          ["Which bone protects the brain?", "Skull", "The cranium encases and shields the brain."],
          ["How many cervical vertebrae are there?", "7 vertebrae", "Seven cervical vertebrae form the neck."],
          ["How many lumbar vertebrae are there?", "5 vertebrae", "Five lumbar vertebrae sit below the thoracic spine and bear the trunk weight."],
          ["Which bone forms the lower jaw?", "Mandible", "The mandible is the only moveable skull bone."],
          ["Which bone forms the upper jaw?", "Maxilla", "The maxilla holds the upper teeth and part of the orbit."],
          ["Which bone is the kneecap?", "Patella", "The patella is a sesamoid bone inside the quadriceps tendon."],
          ["How many vertebrae form the mobile spinal column?", "26 vertebrae", "Seven cervical, twelve thoracic and five lumbar plus the fused sacrum give the mobile column."],
          ["Which bones protect the heart and lungs?", "Sternum and ribs", "The sternum and rib cage form the thoracic cage."],
          ["Which part of the spine has 12 vertebrae?", "Thoracic spine", "Twelve thoracic vertebrae, T1-T12, also anchor the ribs."],
          ["What is a sesamoid bone?", "A bone embedded in a tendon", "Sesamoid bones develop within tendons, the patella being the largest."],
          ["Which bone articulates with the axis of the neck?", "Atlas (C1)", "The atlas carries the skull and pivots on the axis' dens."]
        ],
        trick: "206 bones, femur longest, stapes smallest, 12 rib pairs, mandible movable, C1 atlas.",
        tip: "Pair 'longest/smallest/only' with the classic answer." },

      { kind: "list", name: "cranial bones", group: "cranial bones", a: "cranial bone",
        b: "member",
        items: ["Frontal bone", "Parietal bone (pair)", "Temporal bone (pair)", "Occipital bone", "Sphenoid bone", "Ethmoid bone"],
        outsiders: ["Mandible", "Maxilla", "Vomer", "Zygomatic bone"],
        trick: "Cranium has 8 bones: frontal, 2 parietal, 2 temporal, occipital, sphenoid, ethmoid.",
        tip: "Facial bones are separate from the cranial case." },

      { kind: "numeric", name: "bone counting sets", difficulty: "easy",
        note: "Counting bone sets given region sizes.",
        q: (v) => `The body has ${v.r} skeletal regions, each contributing ${v.n} paired bones, plus 5 fused vertebrae. How many individual bones are counted?`,
        a: (v) => `${v.r * v.n + 5} bones`,
        e: (v) => `${v.r} regions × ${v.n} bones = ${v.r * v.n} bones, plus ${5} fused = ${v.r * v.n + 5} bones in total.`,
        distract: (v) => [`${v.r * v.n} bones`, `${v.r * v.n + 4} bones`, `${v.r * v.n * 5} bones`, `${(v.r + v.n) * 5} bones`, `${v.r * v.n - 5} bones`],
        vals: (rng) => ({ r: R(rng, 2, 5), n: R(rng, 10, 20) }),
        whyWrong: (v) => [`Multiply regions by bones per region, then add the fused bones; failing to add the fused segment undercounts.`],
        trick: "total = regions × per + fused.",
        tip: "Add fused segments explicitly." }
    ],

    "Muscles and Joints": [
      { kind: "fact", name: "muscle facts", note: "Major muscles and actions.",
        facts: [
          ["Which muscle initiates inspiration?", "Diaphragm", "The diaphragm flattens on inspiration to draw air into the lungs."],
          ["Which muscle forms the calf?", "Gastrocnemius", "The gastrocnemius lies two-headed in the calf and plantarflexes the foot."],
          ["Which muscle flexes the elbow?", "Biceps brachii", "The biceps brachii is the prime elbow flexor."],
          ["Which muscle extends the knee?", "Quadriceps femoris", "The quadriceps, four heads, extends the knee."],
          ["Which muscle raises the eyebrows?", "Frontalis", "The frantalis lifts the brow."],
          ["Which muscle is the strongest chewing muscle?", "Masseter", "The masseter lifts the mandible with the greatest bite force."],
          ["Which muscle shrugs the shoulders?", "Trapezius", "The trapezius raises and retracts the scapulae."],
          ["Which muscle abducts the arm?", "Deltoid", "The deltoid lifts the arm away from the body."],
          ["Which muscle extends and rotates the hip?", "Gluteus maximus", "The gluteus maximus extends and laterally rotates the hip."],
          ["Which group extends the trunk?", "Erector spinae", "The erector spinae runs the length of the back to straighten the spine."],
          ["Which muscle flexes the hip?", "Iliopsoas", "The iliopsoas is the main hip flexor."],
          ["Which muscle rotates the forearm palm-down?", "Pronator teres", "Pronation turns the palm downward."]
        ],
        trick: "biceps=elbow flexor, quadriceps=knee extensor, deltoid=abductor, masseter=chew strong.",
        tip: "Pair muscle names with their primary action in both directions." },

      { kind: "pair", name: "muscle and nerve", a: "muscle", b: "innervating nerve",
        pairs: [["Biceps brachii", "Musculocutaneous nerve"], ["Quadriceps femoris", "Femoral nerve"],
          ["Tibialis anterior", "Deep peroneal nerve"], ["Gastrocnemius", "Tibial nerve"],
          ["Deltoid", "Axillary nerve"], ["Diaphragm", "Phrenic nerve (C3-C5)"]],
        trick: "Deltoid→axillary, biceps→musculocutaneous, diaphragm→phrenic.",
        tip: "Nerve-for-muscle is a top-of-board favourite." }
    ],

    "Nerves and Vessels": [
      { kind: "fact", name: "cranial nerves", note: "Cranial nerve numbers and roles.",
        facts: [
          ["Which cranial nerve carries smell?", "CN I (olfactory)", "Olfactory nerve CN I carries smell to the brain."],
          ["Which cranial nerve drives lateral eye movement?", "CN VI (abducens)", "The abducens turns the eyeball outward."],
          ["Which cranial nerve serves posterior tongue taste and swallowing?", "CN IX (glossopharyngeal)", "Glossopharyngeal CN IX serves posterior tongue taste and swallowing."],
          ["Which is the wandering nerve to heart and gut?", "CN X (vagus)", "The vagus branches to heart, lung, gut and larynx."],
          ["Which cranial nerve moves the neck and shoulders?", "CN XI (accessory)", "Spinal accessory CN XI innervates sternocleidomastoid and upper aims."],
          ["Which cranial nerve moves the tongue?", "CN XII (hypoglossal)", "Hypoglossal CN XII controls the tongue muscles."],
          ["Which cranial nerve divides into three facial branches?", "CN V (trigeminal)", "Trigeminal CN V splits into ophthalmic, maxillary, mandibular."],
          ["How many pairs of spinal nerves exit the spine?", "31 pairs", "8 cervical, 12 thoracic, 5 lumbar, 5 sacral and 1 coccygeal give 31 pairs."],
          ["Which spinal nerve exits below the C7 vertebra?", "C8", "Cervical nerves C1-C7 exit above their vertebra while C8 exits below C7."],
          ["Which cranial nerve is the optic nerve?", "CN II", "The optic nerve CN II transmits vision from the retina."]
        ],
        hack: "CN I smell, CN II vision, CN X vagus, CN XII tongue.",
        tip: "Remember cranial nerves by number: I smell, II see, III move eye." },

      { kind: "pair", name: "artery to organ", a: "artery", b: "supplied organ",
        pairs: [["Renal artery", "Kidney"], ["Hepatic artery", "Liver"], ["Coronary arteries", "Heart muscle"],
          ["Carotid artery", "Brain and head"], ["Pulmonary artery", "Lung (deoxygenated)"]],
        outsiders: ["Femur", "Spleen"],
        trick: "renal=kidney, hepatic=liver, coronary=heart, carotid=brain.",
        tip: "Ocean artery-to-organ pairs are a classic." }
    ]
  }
};

/* ---------------- PHYSIOLOGY ---------------- */
const physiology = {
  subjects: ["physiology"],
  chapter: "Physiology — Body Function (Phase 11)",
  tags: ["physiology", "deep-kb", "homeostasis"],
  topics: {
    "Homeostasis and Endocrine": [
      { kind: "fact", name: "homeostasis facts", note: "Control systems and hormones.",
        facts: [
          ["What is homeostasis?", "Maintaining stable internal conditions", "Homeostatic loops keep variables like pH, glucose and temperature in a narrow range."],
          ["Which hormone raises blood glucose?", "Glucagon", "Glucagon mobilises liver glycogen to raise blood sugar."],
          ["Which hormone lowers blood glucose?", "Insulin", "Insulin promotes glucose uptake, lowering blood glucose."],
          ["Which gland is called the 'master gland'?", "Pituitary gland", "The pituitary coordinates other endocrine glands."],
          ["What is the normal resting adult heart rate?", "60-100 beats per minute", "Normal adult sinus rhythm is 60-100 beats a minute."],
          ["Which part of the brain regulates body temperature?", "Hypothalamus", "The hypothalamus thermostat drives sweating, shivering and blood flow."],
          ["What carries nerve signals between neurons?", "Neurotransmitters", "Nerve impulses cross the synapse using chemical transmitters."],
          ["What is cardiac output?", "Heart rate multiplied by stroke volume", "Cardiac output (L/min) = heart rate × stroke volume."],
          ["What is the pacemaker region of the heart?", "Sinoatrial (SA) node", "The SA node sets the heart's pace, then the AV node and bundles conduct."],
          ["What is the functional unit of the kidney?", "Nephron", "Each nephron filters blood and reabsorbs needed nutrients."]
        ],
        trick: "Insulin=down, glucagon=up, SA node=pacemaker, hypothalamus=temperature.",
        tip: "Opposing hormone pairs are exam staples." },

      { kind: "pair", name: "endocrine glands", a: "endocrine gland", b: "main hormone",
        pairs: [["Pituitary", "Growth hormone"], ["Thyroid", "Thyroxine (T4)"], ["Adrenal medulla", "Adrenaline"],
          ["Pancreas", "Insulin"], ["Ovary", "Oestrogen"], ["Testis", "Testosterone"]],
        trick: "Adrenal→adrenaline, pancreas→insulin, thyroid→thyroid.",
        tip: "Gland-hormone pairing is a high-yield area." }
    ],

    "Circulatory and Nervous": [
      { kind: "fact", name: "circulatory facts", note: "Cardiac and blood details.",
        facts: [
          ["Which heart chamber pumps oxygenated blood to the body?", "Left ventricle", "The left ventricle's thick wall ejects blood into the aorta."],
          ["Which chamber receives oxygenated blood from the lungs?", "Left atrium", "Pulmonary veins bring blood to the left atrium."],
          ["Which blood vessel returns deoxygenated blood to the right atrium?", "Vena cavae", "Superior and inferior vena cavae drain into the right atrium."],
          ["What is the haematocrit?", "The volume percent of red cells in blood", "Haematocrit is the percentage of packed red cells."],
          ["Where does gas exchange occur in the lungs?", "Alveoli", "Tiny alveoli exchange oxygen and carbon dioxide."],
          ["Which molecule carries oxygen in red cells?", "Haemoglobin", "Haemoglobin binds four O ankles in each red blood cell."],
          ["What is blood plasma?", "The liquid portion of blood", "Plasma is ~92% water plus proteins, salts and hormones."]
        ],
        trick: "left ventricle=eject, vena cava=return, alveoli=gas exchange, Hb carries O2.",
        tip: "Small direction questions; remember flow enters right, leaves left." },

      { kind: "fact", name: "nervous facts", note: "Nervous system localisation.",
        facts: [
          ["Which part of the brain coordinates movement?", "Cerebellum", "The cerebellum governs coordination and balance."],
          ["Which lobe processes vision?", "Occipital lobe", "Occipital cortex interprets visual input."],
          ["Which lobe is responsible for speech production (Broca's area)?", "Frontal lobe", "Broca's area sits in the left frontal lobe."],
          ["Which lobe processes touch and spatial sense?", "Parietal lobe", "The parietal lobe handles touch, pressure and spatial relations."],
          ["Which part governs memory consolidation?", "Hippocampus", "Hippocampus converts short-term memories into long-term."],
          ["What is the autonomic nervous system?", "The involuntary control system", "The autonomic system governs heart, gut and glands without conscious effort."]
        ],
        trick: "Occipital=vision, frontal=Broca, parietal=sensory, cerebellum=coordination.",
        tip: "Localisation pairs are classic neuroscience items." }
    ]
  }
};

module.exports = [makeKbGen(anatomy), makeKbGen(physiology)];
