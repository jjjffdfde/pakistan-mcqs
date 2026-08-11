/* ============================================================
   Generator file 09 — Medical & Health subjects
   ============================================================ */
"use strict";
const L = require("../lib.js");

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

module.exports = [
  makeGen("medical", "Medical — General Medicine", {
    "Diseases and Treatment": [
      ["Which disease is caused by the Plasmodium parasite?", "Malaria", "Anopheles mosquitoes transmit malaria."],
      ["Which disease is caused by the dengue virus?", "Dengue fever", "Aedes mosquitoes transmit dengue."],
      ["Which condition is treated with insulin?", "Diabetes mellitus", "Type 1 diabetes requires insulin therapy."],
      ["Which vitamin deficiency causes rickets?", "Vitamin D", "Vitamin D deficiency weakens bones in children."],
      ["Which vitamin deficiency causes scurvy?", "Vitamin C", "Scurvy features bleeding gums and fatigue."],
      ["Which disease attacks the lungs primarily?", "Tuberculosis", "TB is caused by Mycobacterium tuberculosis."],
      ["What is hypertension?", "chronically high blood pressure", "Hypertension strains the heart and vessels."],
      ["What is anaemia?", "low haemoglobin in blood", "Anaemia causes fatigue from reduced oxygen delivery."],
      ["Which organ is affected by hepatitis?", "Liver", "Hepatitis is inflammation of the liver."],
      ["What is asthma?", "narrowing of the airways", "Asthma causes wheezing and breathlessness."],
      ["What is a stroke?", "interrupted blood flow to the brain", "Strokes cause sudden neurological deficits."],
      ["What is a myocardial infarction?", "a heart attack", "An MI blocks blood flow to the heart muscle."]
    ]
  }),
  makeGen("medicine", "Medicine — Clinical", {
    "Clinical Knowledge": [
      ["What is a fever?", "elevated body temperature", "Fever often signals infection."],
      ["What is a pulse?", "the heartbeat felt at arteries", "The pulse reflects heart rate and rhythm."],
      ["What is blood pressure measured with?", "Sphygmomanometer", "The cuff device reads systolic and diastolic pressure."],
      ["Which drug class reduces pain?", "Analgesics", "Analgesics like paracetamol relieve pain."],
      ["Which drug class fights bacteria?", "Antibiotics", "Antibiotics treat bacterial infections only."],
      ["What is an antibiotic?", "a drug killing or stopping bacteria", "Antibiotics do not work on viruses."],
      ["What is an X-ray used for?", "imaging bones and chest", "X-rays show fractures and lung disease."],
      ["What is an ECG?", "a recording of heart electrical activity", "The ECG detects rhythm and ischaemia."],
      ["What is a biopsy?", "sampling tissue for diagnosis", "Biopsies confirm cancer and other conditions."],
      ["What is a vaccine?", "a preparation that induces immunity", "Vaccines prevent infectious disease."],
      ["What is quarantine?", "isolating possibly exposed people", "Quarantine controls disease spread."],
      ["What is an epidemic?", "a rapid spread in a population", "An epidemic becomes a pandemic when global."]
    ]
  }),
  makeGen("surgery", "Surgery — Principles", {
    "Surgical Basics": [
      ["What is an incision?", "a surgical cut", "Incisions open tissue for access."],
      ["What is a suture?", "a stitch closing a wound", "Sutures hold tissue edges together."],
      ["What is a scalpel?", "a surgical cutting blade", "Scalpels make precise incisions."],
      ["What is anaesthesia?", "loss of sensation for surgery", "Anaesthesia may be general or local."],
      ["What is a suture removal?", "taking out wound stitches", "Stitches are removed once healing begins."],
      ["What is a wound?", "a break in body tissue", "Wounds range from abrasions to deep lacerations."],
      ["What is an abscess?", "a pus-filled cavity", "Abscesses usually require drainage."],
      ["What is a fracture?", "a break in a bone", "Fractures are treated by reduction and fixation."],
      ["What is a graft?", "transplanted tissue", "Grafts replace damaged skin or organs."],
      ["What is a laparotomy?", "an abdominal surgical opening", "Laparotomy gives access to abdominal organs."],
      ["What is asepsis?", "freedom from infection-causing microbes", "Aseptic technique prevents surgical infections."],
      ["What is a bandage?", "a wrap protecting a wound", "Bandages support and protect injuries."]
    ]
  }),
  makeGen("anatomy", "Anatomy — Human Structure", {
    "Systems and Parts": [
      ["How many chambers does the human heart have?", "4", "Two atria and two ventricles."],
      ["Which bone protects the brain?", "Skull", "The skull encloses the brain."],
      ["What is the longest bone in the body?", "Femur", "The thigh bone is the longest and strongest."],
      ["Which muscle pumps blood?", "Cardiac muscle", "The myocardium contracts to circulate blood."],
      ["Which organ is the largest internal organ?", "Liver", "The liver weighs about 1.5 kg in adults."],
      ["How many ribs does a human have?", "24 (12 pairs)", "Ribs protect the chest cavity."],
      ["Which structure connects bones at a joint?", "Ligaments", "Ligaments bind bone to bone; tendons bind muscle to bone."],
      ["Which part of the eye focuses light?", "Lens", "The lens refracts light onto the retina."],
      ["Which part of the ear detects balance?", "Semicircular canals", "Inner-ear canals sense rotation."],
      ["What is the spinal cord?", "the nerve bundle in the spine", "It relays signals between brain and body."],
      ["Which organ filters blood?", "Kidneys", "Nephrons in the kidneys filter blood."],
      ["Which gland is the master endocrine gland?", "Pituitary", "The pituitary regulates other endocrine glands."]
    ]
  }),
  makeGen("general-anatomy", "General Anatomy — Essentials", {
    "Essentials": [
      ["What is anatomy?", "the study of body structure", "Anatomy describes organs, bones and tissues."],
      ["What is physiology?", "the study of body function", "Physiology explains how structures work."],
      ["What is a tissue?", "a group of similar cells", "Four basic tissues exist: epithelial, connective, muscle, nervous."],
      ["What is an organ?", "a structure with a specific function", "Organs combine tissues to perform tasks."],
      ["Which plane divides the body into left and right?", "Sagittal plane", "The midsagittal plane splits the body bilaterally."],
      ["Which plane divides front and back?", "Coronal (frontal) plane", "The coronal plane separates anterior from posterior."],
      ["What does 'superior' mean in anatomy?", "toward the head", "Superior (cranial) points upward in standard position."],
      ["What does 'proximal' mean?", "closer to the trunk", "The elbow is proximal to the wrist."],
      ["What is a joint?", "where bones meet", "Joints allow movement and bear load."],
      ["What is cartilage?", "a flexible connective tissue", "Cartilage cushions joints and shapes parts like the ear."]
    ]
  }),
  makeGen("physiology", "Physiology — Body Function", {
    "Functions": [
      ["What is homeostasis?", "stable internal conditions", "The body balances temperature, pH and fluids."],
      ["What is respiration?", "gas exchange and energy release", "Cells use oxygen to release energy."],
      ["What is metabolism?", "all chemical reactions in the body", "Metabolism includes catabolism and anabolism."],
      ["What is a reflex?", "an automatic rapid response", "Reflex arcs bypass conscious control."],
      ["What is a hormone?", "a chemical messenger", "Hormones travel in blood to target organs."],
      ["What is blood pressure?", "the force of blood on vessel walls", "Pressure peaks in systole and relaxes in diastole."],
      ["What is cardiac output?", "blood pumped per minute", "CO = heart rate × stroke volume."],
      ["What is a synapse?", "the junction between neurons", "Signals cross synapses via neurotransmitters."],
      ["What is urine formation?", "filtration and reabsorption in nephrons", "Nephrons filter blood and concentrate waste."],
      ["What is digestion?", "breaking food into absorbable nutrients", "Digestion begins in the mouth."]
    ]
  }),
  makeGen("biochemistry", "Biochemistry — Molecules", {
    "Biomolecules": [
      ["Which molecule stores genetic information?", "DNA", "DNA encodes instructions for life."],
      ["Which molecule carries energy in cells?", "ATP", "Adenosine triphosphate powers cellular work."],
      ["Which biomolecule is a protein?", "Enzyme", "Enzymes are proteins that catalyse reactions."],
      ["What is an enzyme?", "a biological catalyst", "Enzymes speed reactions without being consumed."],
      ["Which sugar is the main blood sugar?", "Glucose", "Glucose fuels cells and is regulated by insulin."],
      ["What is a lipid?", "a fat or fat-like molecule", "Lipids store energy and form membranes."],
      ["What is an amino acid?", "a protein building block", "Proteins are chains of amino acids."],
      ["What is a nucleotide?", "a DNA/RNA building block", "Nucleotides have a base, sugar and phosphate."],
      ["What is glycogen?", "the stored form of glucose", "The liver and muscles store glycogen."],
      ["What is a vitamin?", "an essential micronutrient", "Vitamins support enzymes and metabolism."],
      ["What is metabolism?", "chemical turnover in cells", "Catabolism releases energy; anabolism builds."],
      ["What is cholesterol?", "a waxy lipid in the body", "Cholesterol builds membranes and hormones."]
    ]
  }),
  makeGen("pathology", "Pathology — Disease Study", {
    "Disease Mechanisms": [
      ["What is pathology?", "the study of disease", "Pathology examines causes and mechanisms of illness."],
      ["What is inflammation?", "the body's response to injury", "Inflammation shows redness, heat, swelling and pain."],
      ["What is a pathogen?", "a disease-causing microbe", "Bacteria, viruses and fungi can be pathogens."],
      ["What is a tumour?", "an abnormal growth of cells", "Tumours may be benign or malignant."],
      ["What is a carcinoma?", "cancer of epithelial tissue", "Carcinomas are the most common cancers."],
      ["What is metastasis?", "cancer spread to other sites", "Metastatic cells travel via blood or lymph."],
      ["What is necrosis?", "cell death in living tissue", "Necrosis follows injury, ischaemia or infection."],
      ["What is oedema?", "fluid accumulation in tissues", "Oedema causes swelling in dependent areas."],
      ["What is ischaemia?", "reduced blood supply", "Ischaemia starves tissues of oxygen."],
      ["What is a biopsy used for?", "diagnosing tissue disease", "Biopsy specimens are examined microscopically."],
      ["What is an infection?", "microbe invasion of the body", "Infections provoke immune and inflammatory responses."],
      ["What is immunity?", "resistance to disease", "Immunity comes from antibodies and immune cells."]
    ]
  }),
  makeGen("pharmacology", "Pharmacology — Drugs", {
    "Drug Classes": [
      ["Which drug class relieves pain?", "Analgesics", "Analgesics include paracetamol and opioids."],
      ["Which drug class reduces fever?", "Antipyretics", "Antipyretics like paracetamol lower temperature."],
      ["Which drugs kill bacteria?", "Antibiotics", "Antibiotics target bacterial infections."],
      ["Which drug class reduces inflammation?", "Anti-inflammatory drugs", "NSAIDs like ibuprofen reduce inflammation."],
      ["Which drug lowers blood pressure?", "Antihypertensives", "ACE inhibitors and beta-blockers lower pressure."],
      ["Which drug class treats diabetes?", "Antidiabetics (including insulin)", "Oral agents and insulin control glucose."],
      ["What is an antidote?", "a substance counteracting poison", "Antidotes neutralise specific toxins."],
      ["What is a dose?", "the amount of drug given", "Doses balance effect against toxicity."],
      ["What is a side effect?", "an unintended drug effect", "Side effects range from mild to serious."],
      ["Which drug class thins blood?", "Anticoagulants", "Anticoagulants prevent clots in high-risk patients."],
      ["Which drugs treat allergies?", "Antihistamines", "Antihistamines block histamine reactions."],
      ["Which drug class relieves cough?", "Antitussives", "Antitussives suppress the cough reflex."]
    ]
  }),
  makeGen("microbiology", "Microbiology — Microbes", {
    "Microbes and Disease": [
      ["Which organism causes tuberculosis?", "Mycobacterium tuberculosis", "TB bacteria infect the lungs."],
      ["Which organism causes cholera?", "Vibrio cholerae", "Cholera causes severe watery diarrhoea."],
      ["Which virus causes COVID-19?", "SARS-CoV-2", "The coronavirus emerged in late 2019."],
      ["Which organism causes typhoid?", "Salmonella typhi", "Typhoid spreads through contaminated food and water."],
      ["Which organism causes malaria?", "Plasmodium", "Plasmodium parasites are carried by mosquitoes."],
      ["Which organism causes tetanus?", "Clostridium tetani", "The toxin causes muscle spasms."],
      ["Which virus causes influenza?", "Influenza virus", "Flu viruses mutate and cause seasonal epidemics."],
      ["What is a bacterium?", "a single-celled microorganism", "Bacteria have no nucleus and divide by fission."],
      ["What is a virus?", "a tiny infectious agent", "Viruses need host cells to replicate."],
      ["What is a fungus?", "a eukaryotic microbe", "Fungi include yeasts and moulds."],
      ["What is a parasite?", "an organism living at a host's expense", "Protozoa and worms are parasites."],
      ["What is a vaccine?", "a preparation giving immunity", "Vaccines prime the immune system against pathogens."]
    ]
  }),
  makeGen("histology", "Histology — Tissue Study", {
    "Tissues": [
      ["What is histology?", "the microscopic study of tissues", "Histology examines cells under the microscope."],
      ["Which tissue lines body surfaces?", "Epithelial tissue", "Epithelium covers organs and lines cavities."],
      ["Which tissue supports and connects?", "Connective tissue", "Bone, blood and cartilage are connective tissues."],
      ["Which tissue contracts to move?", "Muscle tissue", "Skeletal, cardiac and smooth muscles contract."],
      ["Which tissue transmits signals?", "Nervous tissue", "Neurons and glia form nervous tissue."],
      ["What is a microscope used for?", "viewing tiny structures", "Histology depends on microscopic examination."],
      ["What is a stain?", "a dye highlighting tissue parts", "H&E stains nuclei blue and cytoplasm pink."],
      ["What is a section?", "a thin slice of tissue", "Sections are cut for microscopy."],
      ["Which cells form bone?", "Osteocytes", "Bone cells maintain the mineral matrix."],
      ["Which cells form blood?", "Haematopoietic cells", "Blood cells originate in bone marrow."]
    ]
  }),
  makeGen("mbbs", "MBBS — Medical Essentials", {
    "MBBS Basics": [
      ["What does MBBS stand for?", "Bachelor of Medicine, Bachelor of Surgery", "The degree qualifies graduates to practise medicine."],
      ["Which body regulates medical education in Pakistan?", "PM&DC", "The Pakistan Medical and Dental Council accredits colleges."],
      ["What is a physician?", "a medical doctor", "Physicians diagnose and treat illness."],
      ["What is a ward?", "a hospital unit for patients", "Wards group patients by specialty."],
      ["What is a case history?", "a patient's medical record", "Histories cover symptoms, past illness and examination."],
      ["What is a diagnosis?", "identifying a disease", "Diagnosis follows history, examination and tests."],
      ["What is a prognosis?", "the likely course of disease", "Prognosis predicts recovery or progression."],
      ["What is treatment?", "measures to cure or manage disease", "Treatment includes drugs, surgery and therapy."],
      ["What is a consultant?", "a senior specialist doctor", "Consultants lead specialty teams."],
      ["What is an outpatient?", "a patient not admitted overnight", "Outpatients attend clinics without hospital stay."]
    ]
  }),
  makeGen("bds", "BDS — Dental Studies", {
    "Dental Basics": [
      ["What does BDS stand for?", "Bachelor of Dental Surgery", "BDS qualifies dentists to practise dentistry."],
      ["Which hard tissue covers the tooth crown?", "Enamel", "Enamel is the hardest substance in the body."],
      ["Which tissue lies under enamel?", "Dentin", "Dentin forms most of the tooth structure."],
      ["Which tissue anchors the tooth?", "Cementum and periodontal ligament", "These attach the root to the jawbone."],
      ["How many permanent teeth does an adult have?", "32", "Adults have 32 teeth including wisdom teeth."],
      ["How many milk teeth does a child have?", "20", "Primary dentition has 20 teeth."],
      ["Which tooth type grinds food?", "Molars", "Molars have broad crowns for grinding."],
      ["Which tooth type cuts food?", "Incisors", "Incisors are the front cutting teeth."],
      ["What is a cavity?", "decay in tooth tissue", "Cavities are caused by acid-producing bacteria."],
      ["What is a filling?", "restoring a decayed tooth", "Fillings seal cavities with materials like composite."],
      ["What is a root canal?", "treatment of the tooth pulp", "Root canals remove infected pulp."],
      ["What is a dental crown?", "a cap covering a tooth", "Crowns restore damaged or weak teeth."]
    ]
  }),
  makeGen("dpt", "DPT — Physiotherapy", {
    "Physiotherapy Basics": [
      ["What does DPT stand for?", "Doctor of Physical Therapy", "DPT graduates treat movement disorders."],
      ["What is physiotherapy?", "treatment through movement and exercise", "Physiotherapy restores function and relieves pain."],
      ["What is a range of motion?", "the extent joints can move", "ROM exercises preserve joint flexibility."],
      ["What is a muscle spasm?", "involuntary muscle contraction", "Spasms cause pain and limit movement."],
      ["What is a physiotherapist?", "a movement and rehabilitation specialist", "Physiotherapists design exercise programmes."],
      ["What is rehabilitation?", "restoring function after illness", "Rehab follows stroke, injury or surgery."],
      ["What is an exercise programme?", "a structured physical plan", "Programmes build strength, balance and endurance."],
      ["What is manual therapy?", "hands-on treatment techniques", "Manual therapy mobilises joints and soft tissue."],
      ["What is a brace?", "a supportive device", "Braces stabilise joints during recovery."],
      ["What is gait training?", "retraining walking ability", "Gait training follows leg injuries or stroke."]
    ]
  }),
  makeGen("nursing", "Nursing — Care", {
    "Nursing Basics": [
      ["What is nursing care?", "supporting patients' health needs", "Nurses monitor, medicate and educate patients."],
      ["What is vital signs monitoring?", "checking temperature, pulse, respiration, BP", "Vitals signal patient condition."],
      ["What is a pulse oximeter?", "a device measuring blood oxygen", "Oximeters clip onto a finger."],
      ["What is an IV line?", "intravenous access for fluids", "IVs deliver fluids and drugs directly."],
      ["What is hygiene care?", "keeping patients clean", "Hygiene prevents infection and aids comfort."],
      ["What is a bedpan?", "a bedside toilet device", "Bedpans serve patients unable to walk."],
      ["What is a wound dressing?", "a sterile covering for wounds", "Dressings protect and promote healing."],
      ["What is a patient chart?", "a record of patient data", "Charts track vitals, drugs and notes."],
      ["What is a nurse's shift?", "a scheduled work period", "Shifts cover 24-hour patient care."],
      ["What is first aid?", "immediate emergency care", "First aid stabilises until professional help arrives."]
    ]
  }),
  makeGen("pharmacy", "Pharmacy — Medicines", {
    "Pharmacy Basics": [
      ["What is pharmacy?", "the science of medicines", "Pharmacy covers drug preparation and dispensing."],
      ["What is a pharmacist?", "a medicines expert", "Pharmacists dispense drugs and advise patients."],
      ["What is a prescription?", "a doctor's drug order", "Prescriptions specify drug, dose and duration."],
      ["What is a tablet?", "a compressed dose form", "Tablets are taken orally with water."],
      ["What is a capsule?", "a shell containing drug powder", "Capsules dissolve in the stomach."],
      ["What is a syrup?", "a sweet liquid medicine", "Syrups suit children and liquid dosing."],
      ["What is an injection?", "drug delivery by needle", "Injections may be intramuscular or intravenous."],
      ["What is an ointment?", "a semisolid skin medicine", "Ointments treat skin conditions."],
      ["What is an expiry date?", "the last safe use date", "Expired drugs lose potency and safety."],
      ["What is storage temperature?", "the required drug storage condition", "Many drugs need cool, dry storage."]
    ]
  }),
  makeGen("community-medicine", "Community Medicine — Public Health", {
    "Public Health": [
      ["What is public health?", "health of populations", "Public health prevents disease at community level."],
      ["What is epidemiology?", "the study of disease patterns", "Epidemiology tracks outbreaks and risk factors."],
      ["What is immunisation?", "vaccinating populations", "Immunisation prevents epidemic disease."],
      ["What is sanitation?", "safe waste and water management", "Sanitation prevents faecal-oral disease."],
      ["What is maternal health?", "health of mothers and newborns", "Antenatal care reduces maternal mortality."],
      ["What is child health?", "health services for children", "Growth monitoring and immunisation protect children."],
      ["What is nutrition?", "food intake and health", "Good nutrition prevents deficiency diseases."],
      ["What is a health survey?", "collecting community health data", "Surveys measure disease burden."],
      ["What is a vaccination campaign?", "mass immunisation drives", "Campaigns like polio drives eliminate disease."],
      ["What is hygiene education?", "teaching health-promoting habits", "Education changes behaviour to prevent disease."]
    ]
  }),
  makeGen("dental-materials", "Dental Materials — Science", {
    "Materials": [
      ["Which material is used for tooth fillings?", "Composite resin", "Composites bond and match tooth colour."],
      ["Which material was traditionally used for fillings?", "Amalgam", "Amalgam is a durable silver-mercury alloy."],
      ["Which material makes dentures?", "Acrylic resin", "Acrylic forms denture bases."],
      ["Which metal is used for crowns?", "Gold alloy", "Gold alloys are durable crown materials."],
      ["What is a ceramic?", "a hard non-metal material", "Ceramics like porcelain mimic teeth."],
      ["What is a cement in dentistry?", "a material bonding restorations", "Cements lute crowns and fill gaps."],
      ["Which material is used for impressions?", "Silicone", "Impression materials copy the teeth."],
      ["What is a composite?", "a tooth-coloured filling material", "Composites contain resin and glass filler."],
      ["What is fluoride for?", "strengthening tooth enamel", "Fluoride prevents dental decay."],
      ["What is an orthodontic wire made of?", "Stainless steel or nickel-titanium", "Wires move teeth with gentle force."]
    ]
  }),
  makeGen("oral-anatomy", "Oral Anatomy — Mouth Structure", {
    "Oral Structures": [
      ["Which tissue covers the gums?", "Oral mucosa", "The mucosa lines the mouth."],
      ["Which bone forms the lower jaw?", "Mandible", "The mandible is the only movable skull bone."],
      ["Which bone forms the upper jaw?", "Maxilla", "The maxilla holds upper teeth."],
      ["What is the palate?", "the roof of the mouth", "The palate separates mouth from nasal cavity."],
      ["What is the tongue?", "a muscular organ in the mouth", "The tongue aids speech and swallowing."],
      ["What are salivary glands?", "glands producing saliva", "Saliva moistens food and starts digestion."],
      ["Which is the largest salivary gland?", "Parotid", "The parotid lies in front of the ear."],
      ["What is the uvula?", "the soft tissue hanging at the palate", "The uvula assists speech and swallowing."],
      ["What is the alveolus?", "the tooth-bearing bone", "Alveolar bone supports tooth sockets."],
      ["What is the vestibule?", "the space between lips and teeth", "The vestibule lies inside the lips."]
    ]
  }),
  makeGen("oral-histology", "Oral Histology — Mouth Tissues", {
    "Oral Tissues": [
      ["Which cell forms enamel?", "Ameloblast", "Ameloblasts secrete enamel matrix."],
      ["Which cell forms dentin?", "Odontoblast", "Odontoblasts line the pulp and make dentin."],
      ["Which cell forms cementum?", "Cementoblast", "Cementoblasts deposit cementum on roots."],
      ["What is the pulp?", "the living core of the tooth", "Pulp holds nerves and blood vessels."],
      ["What is the periodontal ligament?", "fibres anchoring the tooth", "The PDL cushions and attaches teeth."],
      ["What is the gingiva?", "the gum tissue", "Gingiva surrounds the teeth."],
      ["Which layer is hardest in the body?", "Enamel", "Enamel is highly mineralised."],
      ["What is dentin?", "the calcified layer under enamel", "Dentin forms the tooth body."],
      ["What is the enamel organ?", "the tissue forming enamel", "It develops from the dental epithelium."],
      ["What is a papilla?", "a connective-tissue projection", "Papillae shape the tongue surface."]
    ]
  }),
  makeGen("oral-pathology", "Oral Pathology — Mouth Disease", {
    "Oral Diseases": [
      ["What is dental caries?", "tooth decay", "Caries is caused by acid-producing bacteria."],
      ["What is periodontitis?", "gum and bone disease", "Periodontitis can loosen teeth."],
      ["What is gingivitis?", "inflammation of the gums", "Gingivitis causes bleeding gums."],
      ["What is oral thrush?", "a fungal mouth infection", "Candida causes white patches in the mouth."],
      ["What is a mouth ulcer?", "a sore on oral mucosa", "Ulcers heal within weeks usually."],
      ["What is halitosis?", "bad breath", "Halitosis often follows poor oral hygiene."],
      ["What is leukoplakia?", "a white oral plaque", "Leukoplakia may be pre-cancerous."],
      ["What is toothache?", "pain from tooth disease", "Toothache usually signals caries or pulpitis."],
      ["What is pulpitis?", "inflammation of the tooth pulp", "Pulpitis causes severe tooth pain."],
      ["What is a dental abscess?", "pus at the tooth root", "Abscesses need drainage and treatment."]
    ]
  })
];
