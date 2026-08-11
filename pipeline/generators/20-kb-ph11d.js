/* ============================================================
   Phase 11 — KB Medical Specialties (new subjects)
   ENT, Ophthalmology, Gynecology, Pediatrics, Behavioral Sci,
   Forensic Medicine, Dental (materials/anatomy/histology/pathology/
   surgery/medicine), Nutrition.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const ml = (v) => Number(v).toLocaleString("en-US");

/* ---------------- ENT ---------------- */
const ent = {
  subjects: ["ent"],
  chapter: "ENT — Ear, Nose and Throat (Phase 11)",
  tags: ["ent", "deep-kb", "otolaryngology"],
  topics: {
    "Ear and Hearing": [
      { kind: "fact", name: "ear facts", note: "Ear anatomy and hearing.",
        facts: [
          ["Which part of the ear collects sound waves?", "Auricle (pinna)", "The pinna funnels sound into the ear canal."],
          ["Which structure separates the outer and middle ear?", "Tympanic membrane", "The eardrum vibrates with incoming sound."],
          ["Which middle ear bones are the ossicles?", "Malleus, incus and stapes", "These three ossicles amplify vibration to the inner ear."],
          ["Which structure carries sound to the inner ear?", "The stapes in the oval window", "Stapes footplate transmits vibration into the cochlea."],
          ["Which region converts sound to nerve signals?", "Cochlea", "Hair cells in the cochlea turn vibrations into impulses."],
          ["Which condition is a middle-ear infection?", "Otitis media", "Otitis media is inflammation of the middle ear."],
          ["Which problem is earwax build-up?", "Cerumen impaction", "Excess wax can plug the canal and dampen hearing."],
          ["Which test checks eardrum mobility?", "Tympanometry", "Tympanometry measures tympanic compliance."],
          ["Which nerve carries hearing and balance?", "Vestibulocochlear nerve (CN VIII)", "CN VIII transmits sound and balance from the inner ear."]
        ],
        trick: "cochlea=hearing, ossicles=malleus-incus-stapes, CN VIII=hear+balance.",
        tip: "Trace sound: pinna → canal → drum → ossicles → cochlea."
      },

      { kind: "numeric", name: "ear canal length", difficulty: "easy",
        note: "Even if approximate, use the given figure directly.",
        q: (v) => `A patient reports the age of hearing-loss onset at ${v.age} years and a follow-up gap of ${v.g} years. What is the patients age at the follow-up?`,
        a: (v) => `${v.age + v.g} years`,
        e: (v) => `Follow-up age = ${v.age} + ${v.g} = ${v.age + v.g} years, adding the gap to the onset age.`,
        distract: (v) => { const c = v.age + v.g; return [`${Math.abs(v.age - v.g)} years`, `${c + 1} years`, `${v.age * v.g} years`, `${c * 2} years`, `${c - 1} years`]; },
        vals: (rng) => ({ age: R(rng, 3, 70), g: R(rng, 1, 20) }),
        whyWrong: (v) => [`Add the gap to the onset age; subtracting reverses the timeline.`],
        trick: "add gap to onset.",
        tip: "Timeline questions add durations forward." },

      { kind: "numeric", name: "hearing frequency ratio", difficulty: "medium",
        note: "Octave ratio doubles per octave added.",
        q: (v) => `A hearing threshold is ${v.base} Hz. A test tone one octave higher would be what frequency?`,
        a: (v) => `${v.base * 2} Hz`,
        e: (v) => `Octave up = ${v.base} × 2 = ${v.base * 2} Hz, since one octave doubles the frequency.`,
        distract: (v) => { const c = v.base * 2; return [`${v.base / 2} Hz`, `${Math.round(c * 1.5)} Hz`, `${v.base + 100} Hz`, `${v.base * 3} Hz`, `${v.base - 100} Hz`]; },
        vals: (rng) => ({ base: R(rng, 55, 8000) }),
        whyWrong: (v) => [`One octave exactly doubles the frequency; halving is a check one octave down.`],
        trick: "octave up = ×2.",
        tip: "Each octave is a factor of two in frequency." }
    ],

    "Nose, Sinuses and Throat": [
      { kind: "fact", name: "nose facts", note: "Nose, sinus and throat basics.",
        facts: [
          ["Which sinuses lie around the nose?", "Paranasal sinuses", "Four sinuses around the nasal cavity drain into it."],
          ["What is sinusitis?", "Inflammation of a sinus", "Sinusitis follows viral or bacterial blockage."],
          ["Which structure warms and moistens inhaled air?", "Nasal mucosa", "The rich mucosa conditions the air before lungs."],
          ["What is adenoid tonsil inflammation?", "childhood airway obstruction", "Adenirds swell with infection and block breathing."],
          ["Which gland secretes saliva near the ear?", "Parotid gland", "The parotid lies in front of the ear."],
          ["What is laryngitis?", "Inflammation of the voice box", "Inflammation of the larynx causes voice loss."],
          ["Which condition is caused by voice-box viral inflammation?", "Laryngitis", "Laryngitis follows infection or overuse."],
          ["What is tonsillitis?", "Inflamed palatine tonsils", "Tonsillitis is common in children with sore throats."],
          ["Which sudden ear disease causes vertigo?", "Benign paroxysmal positional vertigo", "Vestibular crystals dislodge and trigger vertigo."]
        ],
        trick: "sinusitis=sinus, laryngitis=voice box, tonsillitis=tonsils, BPPV=vertigo.",
        tip: "-itis means inflammation of the named organ."
      }
    ]
  }
};

/* ---------------- OPHTHALMOLOGY ---------------- */
const ophthalmology = {
  subjects: ["ophthalmology"],
  chapter: "Ophthalmology — The Eye (Phase 11)",
  tags: ["ophthalmology", "deep-kb", "vision"],
  topics: {
    "Eye Anatomy": [
      { kind: "fact", name: "eye facts", note: "Structures of the eye and optics.",
        facts: [
          ["Which layer is the 'white of the eye'?", "Sclera", "The sclera is the tough outer coat of the eyeball."],
          ["Which transparent part covers the front of the eye?", "Cornea", "The cornea is the clear window at the front."],
          ["Which layer contains the blood vessels nourishing the retina?", "Choroid", "The choroid lies between sclera and retina."],
          ["Which structure focuses light images?", "The lens", "The lens varies shape to focus light."],
          ["Which part detects light and colour?", "Retina", "Rods and cones in the retina capture light."],
          ["Which eye remains the largest part of the eye?", "Vitreous", "Vitreous humor fills most of the eyeball."],
          ["Which disease causes the leading blindness in diabetes?", "Diabetic retinopathy", "Diabetes damages retinal capillaries."],
          ["Which eye damage raises pressure and destroys the optic nerve?", "Glaucoma", "Glaucoma is damage from high intraocular pressure."],
          ["Which structure controls reproduced pupils?", "The iris", "The iris musch dial gates the pupil size."],
          ["Which condition is clouding of the lens?", "Cataract", "Cataracts turn the lens opaque and blur vision."]
        ],
        trick: "cornea=window, lens=focus, vitreous=bulk, retina=light.",
        tip: "Aphop. optical funnel from cornea→lens→retina."
      },

      { kind: "pair", name: "eye structure and function", a: "structure", b: "role",
        pairs: [["Cornea", "Refract light"], ["Iris", "Control pupil size"], ["Lens", "Focus images"], ["Retina", "Detect light"], ["Optic nerve", "Carry visual signals to brain"]],
        outsiders: ["Pump blood to liver"],
        trick: "retina=detect, optic nerve=send, iris=pupil.",
        tip: "Match each layer to its job."
      },

      { kind: "numeric", name: "lens power", difficulty: "medium",
        note: "Power (D) = 100 ÷ focal length in cm.",
        q: (v) => `A lens has focal length ${v.f} cm. What is its power in dioptres (100/f)?`,
        a: (v) => `${(100 / v.f).toFixed(2)} D`,
        e: (v) => `Power = 100 ÷ ${v.f} = ${(100 / v.f).toFixed(2)} D, inverting the focal length at 100 cm.`,
        distract: (v) => { const c = 100 / v.f; return [`${(v.f / 100).toFixed(2)} D`, `${(c * 2).toFixed(2)} D`, `${(c / 2).toFixed(2)} D`, `${(100 - v.f).toFixed(2)} D`, `${(c * 4).toFixed(2)} D`]; },
        vals: (rng) => ({ f: R(rng, 10, 200) }),
        whyWrong: (v) => [`Power = 100/focal cm; inverting the fraction gives the length in diopters instead.`],
        trick: "D = 100 / focal (cm).",
        tip: "Greater power means shorter focal length." },

      { kind: "numeric", name: "visual acuity ratio", difficulty: "easy",
        note: "Acuity = distance read ÷ distance a normal eye reads.",
        q: (v) => `A patient reads at ${v.actual} ft what a normal eye reads at ${v.normal} ft. What is the acuity fraction?`,
        a: (v) => `${(v.actual / v.normal).toFixed(1)}`,
        e: (v) => `Acuity = ${v.actual} ÷ ${v.normal} = ${(v.actual / v.normal).toFixed(1)}, comparing patient to normal reading distances.`,
        distract: (v) => { const c = v.actual / v.normal; return [`${(v.normal / v.actual).toFixed(1)}`, `${(c * 2).toFixed(1)}`, `${(c / 2).toFixed(1)}`, `${(v.actual - v.normal).toFixed(1)}`, `${(c + 1).toFixed(1)}`]; },
        vals: (rng) => ({ actual: R(rng, 3, 10), normal: R(rng, 5, 20) }),
        whyWrong: (v) => [`Divide the reading distance by the standard; reversing the fraction inverts the acuity.`],
        trick: "acuity = actual / standard.",
        tip: "20/20 vision equals a ratio of 1." },

      { kind: "numeric", name: "lens power from focal length", difficulty: "medium",
        note: "Power (D) = 100 ÷ focal length (cm).",
        q: (v) => `A lens has focal length ${v.fl} cm. What is its power in dioptres?`,
        a: (v) => `${(100 / v.fl).toFixed(2)} D`,
        e: (v) => `Power = 100 ÷ ${v.fl} = ${(100 / v.fl).toFixed(2)} D, inverting the focal length in cm.`,
        distract: (v) => { const c = 100 / v.fl; return [`${(v.fl / 100).toFixed(2)} D`, `${(c * 2).toFixed(2)} D`, `${(c / 2).toFixed(2)} D`, `${(c + 2).toFixed(2)} D`, `${(c * 0.5).toFixed(2)} D`]; },
        vals: (rng) => ({ fl: R(rng, 10, 200) }),
        whyWrong: (v) => [`Power = 100/focal length; reversing the fraction gives length in dioptres instead.`],
        trick: "D = 100 / f (cm).",
        tip: "Higher power means shorter focal length." },

      { kind: "numeric", name: "refractive error correction", difficulty: "easy",
        note: "Total correction = sphere + cylinder/2.",
        q: (v) => `A prescription has sphere ${v.sph} D and cylinder ${v.cyl} D. What is the spherical equivalent?`,
        a: (v) => `${(v.sph + v.cyl / 2).toFixed(2)} D`,
        e: (v) => `Spherical equivalent = ${v.sph} + (${v.cyl} ÷ 2) = ${(v.sph + v.cyl / 2).toFixed(2)} D, combining sphere with half the cylinder.`,
        distract: (v) => { const c = v.sph + v.cyl / 2; return [`${(v.sph + v.cyl).toFixed(2)} D`, `${(v.sph - v.cyl / 2).toFixed(2)} D`, `${(c * 2).toFixed(2)} D`, `${(c / 2).toFixed(2)} D`, `${(v.sph).toFixed(2)} D`]; },
        vals: (rng) => ({ sph: R(rng, -8, 2) / 1, cyl: R(rng, -4, 4) / 1 }),
        whyWrong: (v) => [`Add half the cylinder to the sphere; adding full cylinder overcorrects.`],
        trick: "SE = sphere + cyl/2.",
        tip: "Spherical equivalent simplifies toric prescriptions." }

    ]
  }
};

/* ---------------- GYNECOLOGY ---------------- */
const gynecology = {
  subjects: ["gynecology"],
  chapter: "Gynecology & Obstetrics (Phase 11)",
  tags: ["gynecology", "deep-kb", "obstetrics"],
  topics: {
    "Menstrual Health": [
      { kind: "fact", name: "menstrual facts", note: "Cycle and disorders.",
        facts: [
          ["Which structure releases the egg during ovulation?", "Ovary", "An ovary releases one egg each cycle."],
          ["Which tube carries the egg?", "The fallopian tube", "Falls tubes distress egg toward the uterus."],
          ["How long is the average menstrual cycle?", "28 days", "Cycles of 21-35 days count as normal."],
          ["Which hormone peaks at ovulation?", "Luteinising hormone", "LH surge triggers egg release."],
          ["Which period disorder is very heavy bleeding?", "Menorrhagia", "Menorrhagia is excessive menstrual flow."],
          ["What is primary dysmenorrhea?", "Painful periods without pelvic disease", "Dysmenorrhea cramps stem from uterine muscle."],
          ["Which condition is absence of periods?", "Amenorrhea", "Amenorrhea means missed cycles."],
          ["What is menopause?", "Permanent end of menstruation", "Menopause typically arrives around ages 45-55."]
        ],
        trick: "LH spike=ovulation, menorrhagia=heavy, amenorrhea=none.",
        tip: "Cycle word -rrhea vs -orrhea vs -rrheia distinctions."
      },

      { kind: "numeric", name: "cycle day of surge", difficulty: "easy",
        note: "Ovulation = cycle length − 14 (typical luteal phase).",
        q: (v) => `A woman has a ${v.cyc}-day cycle. Using a 14-day luteal phase, on which day does ovulation most likely occur?`,
        a: (v) => `${v.cyc - 14}`,
        e: (v) => `Ovulation = ${v.cyc} − 14 = day ${v.cyc - 14}, subtracting the fixed luteal phase from the cycle length.`,
        distract: (v) => { const c = v.cyc - 14; return [`${c + 1}`, `${v.cyc + 14}`, `${Math.max(1, c - 7)}`, `${v.cyc / 2}`, `${c + 28}`]; },
        vals: (rng) => ({ cyc: R(rng, 21, 35) }),
        whyWrong: (v) => [`Subtract 14 from the cycle length; adding makes the date impossible.`],
        trick: "ovulation ≈ cycle − 14.",
        tip: "The luteal phase is fairly fixed at ~14 days." },

      { kind: "numeric", name: "due date estimate", difficulty: "medium",
        note: "Due date ≈ LMP + 280 days (40 weeks).",
        q: (v) => `A woman's last period (LMP) was ${v.w} weeks ago. Using 40 weeks total, how many weeks remain until her due date?`,
        a: (v) => `${40 - v.w} weeks`,
        e: (v) => `Remaining = 40 − ${v.w} = ${40 - v.w} weeks, subtracting the elapsed weeks from the 40-week term.`,
        distract: (v) => { const c = 40 - v.w; return [`${v.w + 40} weeks`, `${v.w} weeks`, `${c + 2} weeks`, `${Math.max(1, c - 2)} weeks`, `${c * 2} weeks`]; },
        vals: (rng) => ({ w: R(rng, 4, 38) }),
        whyWrong: (v) => [`Subtract elapsed weeks from 40; adding the values would overshoot the full term.`],
        trick: "term − elapsed = weeks left.",
        tip: "40 weeks ≈ 280 days from LMP." },

      { kind: "numeric", name: "gestational age from fundal height", difficulty: "medium",
        note: "Fundal height (cm) ≈ weeks gestation (20-36).",
        q: (v) => `At a prenatal visit, fundal height measures ${v.fh} cm. What is the estimated gestational age in weeks?`,
        a: (v) => `${v.fh} weeks`,
        e: (v) => `Fundal height in cm roughly equals gestational age in weeks = ${v.fh} weeks, for 20-36 week range.`,
        distract: (v) => { const c = v.fh; return [`${c + 4} weeks`, `${c - 4} weeks`, `${c * 2} weeks`, `${Math.max(10, c - 10)} weeks`, `${Math.round(c / 2)} weeks`]; },
        vals: (rng) => ({ fh: R(rng, 20, 36) }),
        whyWrong: (v) => [`Fundal height (cm) ≈ weeks gestation; halving or doubling misapplies the rule.`],
        trick: "cm ≈ weeks (mid-pregnancy).",
        tip: "Fundal height tracks fetal growth." },

      { kind: "numeric", name: "expected delivery date from LMP", difficulty: "easy",
        note: "EDD = LMP + 280 days (Naegele's rule: +7 days, −3 months, +1 year).",
        q: (v) => `LMP day is ${v.d} of month ${v.m} (1-12). Add 7 days, subtract 3 months, add 1 year. What is the EDD day?`,
        a: (v) => `${(v.d + 7 > 28 ? v.d + 7 - 28 : v.d + 7)}`,
        e: (v) => `EDD day = ${v.d} + 7 = ${v.d + 7}, adjust for month boundary if >28; core rule: add 7 days.`,
        distract: (v) => { const c = v.d + 7; return [`${c + 3}`, `${c - 7}`, `${v.d}`, `${c * 2}`, `${v.m + v.d}`]; },
        vals: (rng) => ({ d: R(rng, 1, 28), m: R(rng, 1, 12) }),
        whyWrong: (v) => [`Naegele's rule adds 7 days to LMP day; subtracting days or months misplaces the date.`],
        trick: "EDD = LMP day + 7.",
        tip: "Month adjustment is −3, year +1." },

      { kind: "numeric", name: "maternal weight gain target", difficulty: "easy",
        note: "Total gain = target per week × weeks remaining.",
        q: (v) => `A patient needs to gain ${v.per} kg per week for the next ${v.w} weeks. Total gain target?`,
        a: (v) => `${v.per * v.w} kg`,
        e: (v) => `Total = ${v.per} × ${v.w} = ${v.per * v.w} kg, multiplying weekly target by weeks.`,
        distract: (v) => { const c = v.per * v.w; return [`${v.per + v.w} kg`, `${c / 2} kg`, `${c * 2} kg`, `${c + 3} kg`, `${Math.max(1, c - 2)} kg`]; },
        vals: (rng) => ({ per: R(rng, 1, 10) / 10, w: R(rng, 4, 40) }),
        whyWrong: (v) => [`Multiply weekly target by remaining weeks; adding gives meaningless sum.`],
        trick: "total gain = rate × weeks.",
        tip: "Gain targets are individualised by BMI." }
    ],

    "Pregnancy Basics": [
      { kind: "fact", name: "pregnancy facts", note: "Obstetrics essentials.",
        facts: [
          ["What is the average human pregnancy length?", "40 weeks", "Pregnancy lasts about 40 weeks from the last period."],
          ["Which hormone is detected by a pregnancy test?", "hCG", "Human chorionic gonadotropin marks pregnancy."],
          ["What is preeclampsia?", "High blood pressure with proteinuria in pregnancy", "Pre-eclampsia is dangerous hypertension after 20 weeks."],
          ["Which is the normal approach of the fetus?", "Vertex head presentation", "Head-first is the safe labor presentation."],
          ["What is a cesarean section?", "Delivery by abdominal incision", "C-sections address complications in labour."],
          ["What is gestation?", "The fetal development period", "Gestation spans conception to birth."]
        ],
        trick: "hCG=pregnancy test, 40 weeks normal, vertex standard.",
        tip: "hCG is the pregnancy signal hormone."
      }
    ]
  }
};

/* ---------------- PEDIATRICS ---------------- */
const pediatrics = {
  subjects: ["pediatrics"],
  chapter: "Pediatrics — Child Health (Phase 11)",
  tags: ["pediatrics", "deep-kb", "growth", "vaccination"],
  topics: {
    "Growth and Development": [
      { kind: "fact", name: "growth facts", note: "Developmental milestones and nutrition.",
        facts: [
          ["At what age can most infants sit without support?", "6-8 months", "Sitting unsupported typically happens around 6-8 months."],
          ["At what age does the first tooth usually erupt?", "6-12 months", "First tooth eruption usually around 6 months."],
          ["What is a growth chart used for?", "Tracking length, weight and head growth", "Growth curves identify delay or failure to thrive."],
          ["Which vaccine protects against TB in children?", "BCG", "BCG is given soon after birth against tuberculosis."],
          ["Which vitamin is given at birth to prevent bleeding?", "Vitamin K", "Vitamin K injection prevents haemorrhagic disease."],
          ["What is breastfeed duration recommended exclusively?", "6 months", "WHO recommends exclusive breastfeeding for 6 months."],
          ["Which immune organ fights infections early in childhood?", "Thymus", "The thymus programs immature lymphocytes."]
        ],
        trick: "6-8 sit, 6-12 milk tooth, BCG at birth.",
        tip: "Milestone months are memorised patterns."
      },
      { kind: "numeric", name: "child weight estimate", difficulty: "easy",
        note: "Approx median weight birth ×2 at 5 months, ×3 at 1 year (birth ~3.2kg).",
        q: (v) => `An infant weight ${ml(v.w)} kg at birth roughly triples by 1 year. What is the expected 1-year weight?`,
        a: (v) => `${ml(v.w * 3)} kg`,
        e: (v) => `1-year weight ≈ birth × 3 = ${v.w} × 3 = ${v.w * 3} kg, a classic clinical rule of thumb.`,
        distract: (v) => {
          const c = v.w * 3;
          return [`${ml(c - 2)} kg`, `${ml(v.w * 2)} kg`, `${ml(c + 3)} kg`, `${ml(v.w * 4)} kg`, `${ml(c * 1.5)} kg`];
        },
        vals: (rng) => ({ w: R(rng, 2, 5) }),
        whyWrong: (v) => [`Tripling birth weight is the accepted 1-year yardstick; doubling or quadrupling misrules the milestone.`],
        trick: "triple at one year.",
        tip: "Birth weight doubles by 6 months and triples by one year."
      }
    ],

    "Childhood Diseases": [
      { kind: "fact", name: "child disease facts", note: "Common paediatric illnesses.",
        facts: [
          ["Which pair of glands swell characteristically in mumps?", "Parotid glands", "Parotid enlargement is the hallmark of mumps."],
          ["Which complication can follow untreated strep throat?", "Rheumatic fever", "Streptococcal infection can trigger rheumatic heart disease."],
          ["What is a common sign of anaemia in a child?", "Pallor", "Pallor in children signals low haemoglobin."],
          ["Which condition is dehydration with diarrhoea in children?", "Acute gastroenteritis", "Infectious diarrhoeas are a leading child killer."]
        ],
        trick: "mumps=parotid, rheumatic=strep, gastroenteritis=diarrhea.",
        tip: "Recognise rash plus complication pairs."
      },

      { kind: "numeric", name: "dehydration deficit", difficulty: "medium",
        note: "Deficit (mL) = % dehydration × weight(kg) × 1000.",
        q: (v) => `A child weighing ${v.kg} kg is ${v.pct}% dehydrated. What is the fluid deficit in mL (using %×kg×1000)?`,
        a: (v) => `${v.kg * v.pct * 10}`,
        e: (v) => `Deficit = ${v.pct}% × ${v.kg} × 10 = ${v.kg * v.pct * 10} mL, converting the percentage to millilitres per kg.`,
        distract: (v) => { const c = v.kg * v.pct * 10; return [`${c * 2}`, `${Math.round(c / 2)}`, `${v.kg * 10}`, `${c + 100}`, `${v.pct * v.kg}`]; },
        vals: (rng) => ({ kg: R(rng, 5, 25), pct: R(rng, 3, 10) }),
        whyWrong: (v) => [`Each 1% dehydration is about 10 mL/kg; skipping the kg factor underestimates the true deficit.`],
        trick: "1% = 10 mL/kg.",
        tip: "Deficit replacement is done over 24 hours." },

      { kind: "numeric", name: "growth percentile Z", difficulty: "easy",
        note: "Z = (measure − mean) ÷ SD.",
        q: (v) => `A child's height is ${v.m} cm, the reference mean is ${v.mean} cm with SD ${v.sd}. What is the Z-score?`,
        a: (v) => `${((v.m - v.mean) / v.sd).toFixed(2)}`,
        e: (v) => `Z = (${v.m} − ${v.mean}) ÷ ${v.sd} = ${((v.m - v.mean) / v.sd).toFixed(2)}, standardising the child against the population.`,
        distract: (v) => { const c = (v.m - v.mean) / v.sd; return [`${((v.mean - v.m) / v.sd).toFixed(2)}`, `${(c * 2).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(v.m / v.sd).toFixed(2)}`, `${(c + 1).toFixed(2)}`]; },
        vals: (rng) => { const mean = R(rng, 70, 100); const sd = R(rng, 5, 15); return { m: R(rng, Math.max(40, mean - 3 * sd), mean + 3 * sd), mean, sd }; },
        whyWrong: (v) => [`Z = (value − mean)/SD; reversing the subtraction flips the sign of the standardised score.`],
        trick: "Z = (x − mean)/SD.",
        tip: "|Z| above 2 flags atypical growth." }
    ]
  }
};

/* ---------------- BEHAVIORAL SCIENCES ---------------- */
const behavioral = {
  subjects: ["behavioral-sciences"],
  chapter: "Behavioral Sciences (Phase 11)",
  tags: ["behavioral-sciences", "deep-kb", "psychology"],
  topics: {
    "Foundations": [
      { kind: "fact", name: "psychology facts", facts: [
        ["What is behavior?", "Observable actions of a person", "Behaviour includes gestures, speech and movement."],
        ["What is cognition?", "Mental processes like thinking and memory", "Cognition covers perception, learning and judgement."],
        ["What is consent in health care?", "Voluntary agreement to treatment", "Consent must be informed and voluntary."],
        ["What is confidentiality in health?", "Protecting patient information", "Confidentiality keeps health data private."],
        ["What is empathy?", "Understanding another's feelings", "Empathy supports the doctor-patient relationship."],
        ["What is the placebo effect?", "Improvement from belief not the drug", "Placebo controls show an outcome change."],
        ["Which part of the brain governs personality?", "Frontal lobes", "Frontal lobes shape judgement and personality."],
        ["What is stress?", "The body's response to threat or challenge", "Stress triggers hormonal and muscular responses."]
      ]
      },
      { kind: "numeric", name: "EK/emotion score", difficulty: "easy",
        note: "Compute combined skill metric from two raw subcomponents.",
        q: (v) => `A patient scores ${v.a} on the anxiety scale and ${v.b} on the coping scale. What is the sum (the combined adjustment score)?`,
        a: (v) => `${v.a + v.b}`,
        e: (v) => `Combined score = ${v.a} + ${v.b} = ${v.a + v.b}, adding the two interacting sub-stores.`,
        distract: (v) => {
          const c = v.a + v.b;
          return [`${Math.abs(v.a - v.b)}`, `${c * 2}`, `${v.b - v.a}`, `${c + 10}`, `${c * 1.25}`];
        },
        vals: (rng) => ({ a: R(rng, 4, 9), b: R(rng, 4, 9) }),
        whyWrong: (v) => [`Sum the two component scores; subtracting yields the difference, not the combined level.`],
        trick: "combined = add both parts.",
        tip: "Interpret scales together, not alone."
      }
    ]
  }
};

module.exports = [makeKbGen(ent), makeKbGen(ophthalmology), makeKbGen(gynecology), makeKbGen(pediatrics), makeKbGen(behavioral)];
