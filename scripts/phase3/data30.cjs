const { writeFile } = require("./gen-helper.cjs");

const MED = [
  /* mbbs */
  ["mbbs", "Anatomy Essentials", "easy", "Which bone is the longest in the human body?", ["femur", "humerus", "tibia", "fibula"], "A", "The femur (thigh bone) is the longest and strongest bone.", ["anatomy", "mbbs"]],
  ["mbbs", "Physiology Essentials", "easy", "The normal resting heart rate of an adult is approximately:", ["60-100 beats per minute", "120-150", "30-40", "150-200"], "A", "A normal adult resting pulse is 60-100 bpm.", ["physiology", "mbbs"]],
  ["mbbs", "Medicine Basics", "medium", "The most common cause of iron deficiency anaemia worldwide is:", ["blood loss", "excess iron intake", "cold weather", "exercise"], "A", "Chronic blood loss (dietary deficiency in children) is the leading cause.", ["medicine"]],
  ["mbbs", "Surgery Basics", "medium", "The appendectomy removes the:", ["appendix", "tonsils", "gallbladder", "spleen"], "A", "Appendectomy is surgical removal of the vermiform appendix.", ["surgery"]],
  ["mbbs", "Medicine Basics", "medium", "Which condition is caused by deficiency of vitamin D?", ["rickets", "scurvy", "beriberi", "pellagra"], "A", "Vitamin D deficiency causes rickets in children and osteomalacia in adults.", ["medicine", "vitamins"]],
  /* bds */
  ["bds", "Oral Anatomy Basics", "easy", "In adults, the total number of permanent teeth is:", ["32", "20", "28", "36"], "A", "Adults normally have 32 permanent teeth including third molars.", ["dental"]],
  ["bds", "Oral Anatomy Basics", "easy", "The hardest substance in the human body is:", ["enamel", "dentine", "bone", "cementum"], "A", "Enamel, covering the crown, is the hardest tissue.", ["dental"]],
  ["bds", "Dental Materials Basics", "medium", "Amalgam is used for:", ["dental fillings", "braces only", "impressions", "whitening"], "A", "Dental amalgam (mercury-silver alloy) is a classic filling material.", ["dental-materials"]],
  ["bds", "Conservative Dentistry", "medium", "A dental cavity caused by bacterial acids is called:", ["dental caries", "gingivitis", "bruxism", "malocclusion"], "A", "Caries is the demineralization of tooth structure by acid-producing bacteria.", ["dentistry"]],
  ["bds", "Oral Surgery Basics", "hard", "The procedure to remove an impacted wisdom tooth is:", ["surgical extraction", "scaling", "filling", "polishing"], "A", "Impacted third molars often require surgical (flap) extraction.", ["oral-surgery"]],
  /* dpt */
  ["dpt", "Anatomy for Physiotherapy", "easy", "Which muscle flexes the elbow?", ["biceps brachii", "triceps", "deltoid", "quadriceps"], "A", "Biceps brachii is the primary elbow flexor; triceps extends.", ["physiotherapy", "anatomy"]],
  ["dpt", "Kinesiology", "medium", "Kinesiology is the study of:", ["human movement", "kidney function", "skin diseases", "blood cells"], "A", "Kinesiology analyses body movement and mechanics.", ["physiotherapy", "kinesiology"]],
  ["dpt", "Exercise Therapy", "medium", "A passive range of motion exercise means:", ["the therapist moves the joint without patient effort", "the patient moves alone", "resistance is added", "the joint is immobilized"], "A", "Passive ROM is performed on the patient by the therapist.", ["exercise-therapy"]],
  ["dpt", "Electrotherapy", "medium", "TENS is commonly used for:", ["pain relief", "muscle biopsy", "fracture reduction", "hearing tests"], "A", "Transcutaneous Electrical Nerve Stimulation manages pain.", ["electrotherapy"]],
  /* pharmacology */
  ["pharmacology", "Absorption & Distribution", "easy", "The route of administration with the fastest onset is usually:", ["intravenous", "oral", "topical", "rectal"], "A", "IV injection delivers the drug directly into the bloodstream.", ["pharmacology", "pharmacokinetics"]],
  ["pharmacology", "Metabolism & Excretion", "easy", "Most drugs are metabolized in the:", ["liver", "kidney", "lungs", "spleen"], "A", "The liver is the main site of drug metabolism (phase I/II reactions).", ["pharmacology"]],
  ["pharmacology", "Metabolism & Excretion", "medium", "The half-life of a drug is the time taken for its plasma concentration to:", ["reduce by half", "double", "reach zero", "stay constant"], "A", "Half-life measures the time for concentration to fall by 50%.", ["pharmacology"]],
  ["pharmacology", "Antimicrobials", "medium", "Penicillin acts by:", ["inhibiting bacterial cell wall synthesis", "blocking protein pumps", "damaging DNA only", "raising body temperature"], "A", "Beta-lactams like penicillin weaken the bacterial cell wall.", ["antimicrobials"]],
  ["pharmacology", "Autonomic Drugs", "hard", "Adrenaline primarily acts on which receptors to raise heart rate?", ["beta-1 adrenergic", "muscarinic only", "H1 histamine", "GABA"], "A", "Beta-1 receptor stimulation increases cardiac rate and contractility.", ["autonomic"]],
  ["pharmacology", "Adverse Effects", "medium", "A common adverse effect of aspirin is:", ["gastric irritation", "hair loss", "constipation only", "blurred vision only"], "A", "Aspirin's main side effect is gastrointestinal irritation and bleeding risk.", ["adverse-effects"]],
  /* general anatomy */
  ["general-anatomy", "Skeletal System", "easy", "How many bones are in the adult human body?", ["206", "300", "150", "250"], "A", "Adults have 206 bones (babies have about 270).", ["anatomy"]],
  ["general-anatomy", "Skeletal System", "medium", "The vertebral column has how many vertebrae typically?", ["33", "24", "26", "40"], "A", "33 vertebrae (7 cervical, 12 thoracic, 5 lumbar, 5 sacral fused, 4 coccygeal).", ["anatomy"]],
  ["general-anatomy", "Cardiovascular System", "easy", "Which chamber of the heart pumps blood to the body?", ["left ventricle", "right atrium", "left atrium", "right ventricle"], "A", "The left ventricle pumps oxygenated blood into the aorta.", ["anatomy", "heart"]],
  ["general-anatomy", "Nervous System", "medium", "The brain's largest part is the:", ["cerebrum", "cerebellum", "brainstem", "medulla"], "A", "The cerebrum occupies about 85% of brain mass.", ["anatomy", "brain"]],
  ["general-anatomy", "Muscular System", "medium", "The diaphragm is primarily a:", ["respiratory muscle", "heart muscle", "eye muscle", "jaw muscle"], "A", "The diaphragm drives inspiration as the main breathing muscle.", ["anatomy", "muscles"]],
  /* oral anatomy */
  ["oral-anatomy", "Teeth Morphology", "easy", "The tooth with the largest crown is the:", ["first molar", "incisor", "canine", "premolar"], "A", "The first permanent molar has the largest crown in the adult dentition.", ["oral-anatomy"]],
  ["oral-anatomy", "Teeth Morphology", "medium", "A tooth with two roots is typically the:", ["mandibular molar", "maxillary incisor", "canine", "first premolar"], "A", "Mandibular (lower) molars usually have two roots.", ["oral-anatomy"]],
  ["oral-anatomy", "Salivary Glands", "medium", "Which is the largest salivary gland?", ["parotid", "sublingual", "submandibular", "minor glands"], "A", "The parotid gland, near the ear, is the largest.", ["oral-anatomy", "glands"]],
  ["oral-anatomy", "Muscles & Nerves", "hard", "Which nerve supplies sensation to the lower lip and chin?", ["mental nerve", "optic nerve", "facial only", "hypoglossal"], "A", "The mental nerve (from V3) innervates the lower lip and chin.", ["oral-anatomy", "nerves"]],
  /* oral histology */
  ["oral-histology", "Enamel & Dentin", "easy", "Enamel is formed by cells called:", ["ameloblasts", "osteoblasts", "odontoblasts", "fibroblasts"], "A", "Ameloblasts produce enamel; odontoblasts form dentin.", ["oral-histology"]],
  ["oral-histology", "Enamel & Dentin", "medium", "Dentin is produced by:", ["odontoblasts", "ameloblasts", "cementoblasts", "lymphocytes"], "B", "Odontoblasts line the pulp and secrete dentin.", ["oral-histology"]],
  ["oral-histology", "Pulp & Cementum", "medium", "The dental pulp contains:", ["nerves and blood vessels", "only enamel cells", "air", "keratin"], "A", "Pulp is vascular connective tissue with nerves, nourishing the tooth.", ["oral-histology"]],
  ["oral-histology", "Tooth Development", "hard", "Tooth development begins in the embryo at about:", ["6 weeks", "6 months", "at birth", "1 year"], "A", "The dental lamina forms around the 6th week of embryonic life.", ["oral-histology"]],
  /* oral pathology */
  ["oral-pathology", "Dental Caries", "easy", "The primary cause of dental caries is:", ["bacterial plaque and acids", "cold drinks only", "age", "teeth grinding"], "A", "Acid produced by plaque bacteria (mainly Streptococcus mutans) demineralizes enamel.", ["oral-pathology"]],
  ["oral-pathology", "Periodontal Disease", "medium", "Inflammation of the gums is called:", ["gingivitis", "caries", "stomatitis", "cheilitis"], "A", "Gingivitis is gum inflammation; periodontitis involves deeper tissues.", ["oral-pathology"]],
  ["oral-pathology", "Cysts & Tumors", "hard", "The most common odontogenic cyst is the:", ["radicular (periapical) cyst", "dermoid cyst", "branchial cyst", "thyroglossal cyst"], "A", "Radicular cysts arise from periapical inflammation at tooth roots.", ["oral-pathology"]],
  ["oral-pathology", "Oral Infections", "medium", "Oral candidiasis (thrush) is caused by:", ["a fungus", "a virus", "a bacterium", "a parasite"], "A", "Candida albicans, a yeast, causes oral candidiasis.", ["oral-pathology"]]
];

writeFile("30-medical.json", MED);
