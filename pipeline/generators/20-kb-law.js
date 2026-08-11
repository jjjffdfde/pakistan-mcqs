/* ============================================================
   Deep Knowledge KB — Law & Legal Studies
   Legal system, constitution, criminal law, rights +
   numeric sentencing/sections topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["law"],
  chapter: "Law — Deep Knowledge Bank",
  tags: ["law", "deep-kb", "constitution", "criminal", "rights", "pakistan"],
  topics: {

    "Legal System Basics": [
      {
        kind: "fact", name: "legal system facts",
        note: "Foundational definitions of the legal system.",
        facts: [
          ["What is the supreme law of Pakistan?", "The Constitution", "The Constitution of 1973 is the supreme law of Pakistan; all other laws must conform to it."],
          ["What is a statute?", "A law passed by the legislature", "Statutes are written laws enacted by parliaments or assemblies, also called acts."],
          ["What is the difference between civil and criminal law?", "Civil resolves disputes, criminal punishes offences", "Civil law settles private disputes over rights and damages; criminal law prosecutes offences against the state."],
          ["What is the burden of proof in criminal cases?", "Beyond reasonable doubt", "In criminal cases the prosecution must prove guilt beyond reasonable doubt."],
          ["What is the burden of proof in civil cases?", "On the balance of probabilities", "Civil cases are decided on the balance of probabilities, a lower standard than criminal cases."],
          ["What is a precedent?", "A previous judgement followed in later similar cases", "Judges follow precedents under the doctrine of stare decisis, binding lower courts."],
          ["What is the doctrine of stare decisis?", "To stand by decided matters", "Stare decisis obliges courts to follow established precedents for consistency."],
          ["Who is the head of the judiciary in Pakistan?", "The Chief Justice of Pakistan", "The Chief Justice heads the Supreme Court of Pakistan, the apex court of the country."],
          ["What is habeas corpus?", "A writ to produce a detained person before court", "Habeas corpus protects liberty by compelling the state to justify any detention."],
          ["Which writ is issued to stop an illegal action?", "Prohibition", "Prohibition forbids a lower tribunal from exceeding its jurisdiction or continuing an unlawful action."]
        ],
        trick: "Constitution=supreme law; criminal=beyond reasonable doubt, civil=balance of probabilities; habeas=produce detainee.",
        tip: "The two burden-of-proof phrases are the most tested distinction."
      },
      {
        kind: "tf", name: "legal system statements",
        note: "True/false stems on legal basics.",
        statements: [
          ["The Constitution of 1973 is the supreme law of Pakistan.", "Ordinances issued by any officer are the supreme law."],
          ["Criminal guilt must be proved beyond reasonable doubt.", "Civil claims must be proved beyond reasonable doubt."],
          ["Habeas corpus protects against unlawful detention.", "Habeas corpus allows the state to detain without trial."],
          ["Precedent binds lower courts under stare decisis.", "Precedent is ignored once the judge retires."],
          ["The Chief Justice heads the Supreme Court.", "The President heads the Supreme Court."]
        ],
        trick: "Supreme=constitution, criminal=doubt, habeas=protection, stare decisis=binding precedent.",
        tip: "Standard-swap (civil vs criminal burden) is the favourite trap."
      }
    ],

    "Constitution of Pakistan": [
      {
        kind: "fact", name: "constitutional facts",
        note: "Core facts about Pakistan's constitutions.",
        facts: [
          ["Which constitution is currently in force in Pakistan?", "The 1973 Constitution", "The 1973 Constitution replaced the 1962 one and remains in force today, with amendments."],
          ["Who abrogated the 1973 Constitution in 1977?", "General Zia-ul-Haq", "Zia's martial law in 1977 suspended the 1973 Constitution, which was later revived."],
          ["How many articles does the 1973 Constitution contain?", "280 articles", "The 1973 Constitution consists of 280 articles, plus schedules and annexures."],
          ["How many parts does the 1973 Constitution have?", "12 parts", "The constitution is organised into 12 parts covering everything from fundamental rights to emergency provisions."],
          ["How many schedules does the 1973 Constitution have?", "5 schedules", "Five schedules set out the allocation of subjects and details of the constitutional text."],
          ["Who was the head of the committee that drafted the 1973 Constitution?", "Mian Abdul Rashid (often attributed to Hamoodur Rehman)", "The drafting committee was chaired by Mian Abdul Rashid, with Hamoodur Rehman's role prominent in its history."],
          ["When was the 1973 Constitution adopted?", "12 April 1973", "The National Assembly adopted the 1973 Constitution on 12 April 1973."],
          ["When did the 1973 Constitution come into force?", "14 August 1973", "The Constitution took effect on 14 August 1973, Pakistan's independence day."],
          ["Which article deals with fundamental rights?", "Articles 8-28", "Fundamental rights are guaranteed in Articles 8-28 of the constitution."],
          ["Which amendment made Pakistan a parliamentary federal republic?", "The 18th Amendment (2010)", "The 18th Amendment of 2010 restored parliamentary federalism and devolved powers to provinces."]
        ],
        trick: "1973 adopted 12 April, in force 14 August; 280 articles, 12 parts, 5 schedules; 18th Amendment devolution.",
        tip: "Dates (12 April / 14 August) and the 18th Amendment are the top-yield items."
      },
      {
        kind: "numeric", name: "constitutional amendments", difficulty: "medium",
        note: "Each constitutional amendment has a fixed subject matter; parametric drills reinforce the mapping.",
        q: (v) => `The ${v.num}${v.suffix} Amendment to the Constitution of 1973 dealt with ${v.subject}. How many articles does the full constitution contain?`,
        a: (v) => `280`,
        e: (v) => `Whatever the amendment, the 1973 Constitution always comprises 280 articles, 12 parts and 5 schedules; amendments change text, not the article count.`,
        distract: (v) => ["195", "262", "300", "310", "1973"],
        vals: (rng) => {
          const subs = [
            "electoral reforms", "local government", "judicial appointments", "provincial autonomy", "minority representation", "reserved seats", "emergency powers", "fiscal devolution"
          ];
          const num = 20 + Math.floor(rng() * 20);
          const suf = [11, 12, 13].includes(num) ? "th" : (num % 10 === 1 ? "st" : (num % 10 === 2 ? "nd" : (num % 10 === 3 ? "rd" : "th")));
          return { num, suffix: suf, subject: subs[Math.floor(rng() * subs.length)] };
        },
        whyWrong: (v) => [`The article count of the 1973 Constitution is fixed at 280; other figures are the 1962 text or common myths.`],
        trick: "280 articles, 12 parts, 5 schedules — memorise the trio and ignore amendment noise.",
        tip: "If a question mixes amendment facts, check whether it asks about articles or amendments."
      }
    ],

    "Criminal Law": [
      {
        kind: "fact", name: "criminal law facts",
        note: "Offences, punishments and key sections.",
        facts: [
          ["What is the age of criminal responsibility in Pakistan?", "Generally 12 years", "Children below 12 are generally not held criminally liable, though specialised juvenile procedures apply."],
          ["What is the maximum imprisonment for murder under Pakistani law?", "Death penalty (qisas/hadd cases)", "Murder can attract the death penalty under the qisas provisions of the Pakistan Penal Code."],
          ["What is qisas?", "Retaliation or retribution in kind", "Qisas permits punishment equal to the offence, while diyat allows compensation paid to heirs."],
          ["What is diyat?", "Compensation paid to the victim's heirs", "Diyat is blood-money compensation that may substitute qisas punishment in certain cases."],
          ["Which section defines murder in the PPC?", "Section 300", "Section 300 of the Pakistan Penal Code defines murder, with qatl-i-amd provisions in its modern form."],
          ["What is qatl-i-amd?", "Intentional homicide", "Qatl-i-amd is intentional killing, carrying qisas punishment or diyat by the heirs' choice."],
          ["What is the maximum term for life imprisonment in Pakistan?", "25 years", "Life imprisonment under Pakistani law is computed as 25 years of custody."],
          ["What is bail?", "Temporary release pending trial", "Bail releases an accused person pending trial, usually with sureties and conditions."],
          ["What is an FIR?", "First Information Report", "An FIR is the first written record of a complaint to police, starting a criminal case."],
          ["Which crime is an offence against the state?", "Treason", "Treason, like waging war against the state, is an offence against the state under the PPC."]
        ],
        trick: "300=murder, qisas=retaliation, diyat=compensation, life=25 years, FIR=first report.",
        tip: "Qisas/diyat pairs and section numbers are the most repeated criminal-law items."
      },
      {
        kind: "tf", name: "criminal law statements",
        note: "True/false stems on offences.",
        statements: [
          ["An FIR is the first complaint recorded by police.", "An FIR is the final court judgement."],
          ["Qisas means retaliation in kind.", "Qisas means compensation only, never punishment."],
          ["Bail releases an accused pending trial.", "Bail is the conviction itself."],
          ["Life imprisonment in Pakistan equals 25 years.", "Life imprisonment in Pakistan equals 99 years."],
          ["Diyat is compensation paid to the victim's heirs.", "Diyat is a fine paid to the state treasury only."]
        ],
        trick: "FIR=first record, qisas=retaliation, diyat=heirs' compensation, life=25 years.",
        tip: "Definition-swap statements are common; anchor each term's exact meaning."
      }
    ],

    "Fundamental Rights": [
      {
        kind: "fact", name: "fundamental rights facts",
        note: "Rights guaranteed by the Constitution of 1973.",
        facts: [
          ["Which articles guarantee fundamental rights?", "Articles 8-28", "Articles 8-28 of the 1973 Constitution protect fundamental rights against state action."],
          ["What is the right to life under Article 9?", "No person shall be deprived of life or liberty except by law", "Article 9 guarantees life and liberty, the foundation of all other rights."],
          ["Which article protects equality of citizens?", "Article 25", "Article 25 guarantees equality before the law and prohibits discrimination."],
          ["Which article guarantees freedom of speech?", "Article 19", "Article 19 protects freedom of speech and expression, subject to reasonable restrictions."],
          ["Which article guarantees freedom of religion?", "Article 20", "Article 20 ensures freedom to profess, practise and propagate religion."],
          ["Which article protects the right to education?", "Article 25-A", "Article 25-A makes free and compulsory education a fundamental right for children aged 5-16."],
          ["Which article protects against forced labour?", "Article 11", "Article 11 prohibits slavery and forced labour in all forms."],
          ["What is the right against self-incrimination called?", "Protection against testimonial compulsion", "Article 13 protects a person from being compelled to testify against themselves."],
          ["Which article grants the right to information?", "Article 19-A", "Article 19-A gives every citizen the right to access public information."],
          ["Who can enforce fundamental rights?", "The High Courts and the Supreme Court", "Courts issue writs to enforce fundamental rights under Articles 184 and 199."]
        ],
        trick: "9=life, 11=forced labour, 19=speech, 19-A=information, 20=religion, 25=equality, 25-A=education.",
        tip: "The article-number mapping (19 speech, 25-A education) is the highest-yield constitutional item."
      },
      {
        kind: "pair", a: "article", b: "right it protects",
        note: "Article-right pairs across the fundamental rights chapter.",
        pairs: [
          ["Article 9", "right to life and liberty"], ["Article 11", "freedom from forced labour"], ["Article 19", "freedom of speech"], ["Article 19-A", "right to information"],
          ["Article 20", "freedom of religion"], ["Article 25", "equality before the law"], ["Article 25-A", "right to education"]
        ],
        trick: "9=life, 11=labour, 19=speech, 19-A=info, 20=religion, 25=equality, 25-A=education.",
        tip: "Every exam reuses this mapping — learn the seven anchors."
      },
      {
        kind: "numeric", name: "education age range", difficulty: "easy",
        note: "Article 25-A covers compulsory education between ages 5 and 16.",
        q: (v) => `Under Article 25-A of the Constitution of Pakistan, which age range is guaranteed free and compulsory education?`,
        a: (v) => `5 to 16 years`,
        e: (v) => `Article 25-A guarantees free and compulsory education for children between the ages of 5 and 16, a span of ${16 - 5} years covering primary through secondary school.`,
        distract: (v) => ["6 to 14 years", "5 to 18 years", "7 to 17 years", "4 to 15 years", "6 to 10 years"],
        vals: (rng) => ({}),
        whyWrong: (v) => [`The constitutional text fixes 5 to 16; 6-14 is the Indian benchmark and the classic distractor.`],
        trick: "5-16: five to sixteen, sixteen minus five = eleven years of schooling.",
        tip: "The Indian 6-14 figure is the deliberate trap in Pakistani exams."
      }
    ],

    "Legal Calculations": [
      {
        kind: "numeric", name: "fine calculations", difficulty: "easy",
        note: "Criminal fines are set per offence; repeat convictions often double the fine.",
        q: (v) => `A first conviction for ${v.off} carries a fine of Rs ${v.f.toLocaleString()}. A second conviction doubles the fine. What is the fine on the second conviction?`,
        a: (v) => `Rs ${(v.f * 2).toLocaleString()}`,
        e: (v) => `The second conviction doubles the base fine: 2 × Rs ${v.f.toLocaleString()} = Rs ${(v.f * 2).toLocaleString()}, because repeat offences escalate the penalty by a factor of two.`,
        distract: (v) => [`Rs ${(v.f * 3).toLocaleString()}`, `Rs ${(v.f * 1.5).toLocaleString()}`, `Rs ${(v.f + 5000).toLocaleString()}`, `Rs ${Math.round(v.f / 2).toLocaleString()}`, `Rs ${(v.f * 2 + 10000).toLocaleString()}`],
        vals: (rng) => ({ f: 5000 + Math.floor(rng() * 190) * 1000, off: ["a traffic violation", "an environmental offence", "a licensing breach", "a public nuisance"][Math.floor(rng() * 4)] }),
        whyWrong: (v) => [`The escalation rule doubles the base fine; tripling, halving or adding a flat sum misreads the repeat-offence clause.`],
        trick: "Second conviction = ×2 the base fine.",
        tip: "Repeat-offence clauses in statutes usually state the multiplier explicitly."
      },
      {
        kind: "numeric", name: "bail calculations", difficulty: "medium",
        note: "Bail is often set as a percentage of the claim amount, paid as surety.",
        q: (v) => `A court sets bail at ${v.p}% of the claim amount of Rs ${v.c.toLocaleString()}. What bail amount must the accused deposit?`,
        a: (v) => `Rs ${(v.c * v.p / 100).toLocaleString()}`,
        e: (v) => `Bail = ${v.p}% × Rs ${v.c.toLocaleString()} = Rs ${(v.c * v.p / 100).toLocaleString()}, because the court fixes bail as a fraction of the claim as surety for attendance.`,
        distract: (v) => {
          const c = v.c * v.p / 100;
          return [`Rs ${(c * 2).toLocaleString()}`, `Rs ${(c * 0.5).toLocaleString()}`, `Rs ${(c + 50000).toLocaleString()}`, `Rs ${(v.c - c).toLocaleString()}`, `Rs ${(c * 1.5).toLocaleString()}`];
        },
        vals: (rng) => ({ p: [5, 10, 15, 20, 25][Math.floor(rng() * 5)], c: 100000 + Math.floor(rng() * 90) * 100000 }),
        whyWrong: (v) => [`Bail equals the stated percentage of the claim; doubling or subtracting it from the claim misapplies the percentage.`],
        trick: "Bail = claim × percentage ÷ 100.",
        tip: "Check whether the percentage applies to the claim or to the fine."
      },
      {
        kind: "numeric", name: "court fee calculations", difficulty: "medium",
        note: "Court fees are ad valorem — a percentage of the value of the claim.",
        q: (v) => `The court fee on a civil claim is ${v.p}% of the claim value. What fee is payable on a claim of Rs ${v.c.toLocaleString()}?`,
        a: (v) => `Rs ${(v.c * v.p / 100).toLocaleString()}`,
        e: (v) => `Fee = ${v.p}% × Rs ${v.c.toLocaleString()} = Rs ${(v.c * v.p / 100).toLocaleString()}, because ad valorem fees scale directly with the claim value.`,
        distract: (v) => {
          const c = v.c * v.p / 100;
          return [`Rs ${(c * 1.5).toLocaleString()}`, `Rs ${(c * 0.5).toLocaleString()}`, `Rs ${(v.c * v.p / 1000).toLocaleString()}`, `Rs ${(c + 2000).toLocaleString()}`, `Rs ${Math.round(c / 10).toLocaleString()}`];
        },
        vals: (rng) => ({ p: [1, 2, 5][Math.floor(rng() * 3)], c: 50000 + Math.floor(rng() * 195) * 50000 }),
        whyWrong: (v) => [`The fee is the percentage of the claim; dropping a zero or scaling by 1.5 miscomputes the ad valorem amount.`],
        trick: "Ad valorem fee = claim × rate %.",
        tip: "Small percentages on large claims — verify your zeroes."
      },
      {
        kind: "numeric", name: "sentence calculations", difficulty: "easy",
        note: "Sentences are stated in years and months; conversion questions test unit handling.",
        q: (v) => `A court sentences a convict to ${v.y} years and ${v.m} months of imprisonment. What is the total length of the sentence in months?`,
        a: (v) => `${v.y * 12 + v.m} months`,
        e: (v) => `Convert the years to months: ${v.y} years = ${v.y * 12} months, and adding ${v.m} months gives ${v.y * 12 + v.m} months, because each year contains 12 months.`,
        distract: (v) => [`${v.y * 12 + v.m + 1} months`, `${(v.y + v.m) * 12} months`, `${v.y + v.m * 12} months`, `${v.y * 12} months`, `${(v.y * 12 + v.m) * 30} days`],
        vals: (rng) => ({ y: 1 + Math.floor(rng() * 24), m: Math.floor(rng() * 12) }),
        whyWrong: (v) => [`One year equals 12 months; multiply the years by 12 before adding the extra months.`],
        trick: "years × 12 + months — convert before adding.",
        tip: "Days-based answers are traps unless the question explicitly asks for days."
      },
      {
        kind: "numeric", name: "statutory time limits", difficulty: "medium",
        note: "Statutes fix appeal and filing periods in days; adding them tests date arithmetic.",
        q: (v) => `An appeal must be filed within ${v.d} days of a judgement delivered on ${v.mon} ${v.day}, ${v.yr}. By which date does the appeal period end?`,
        a: (v) => `${v.ans}`,
        e: (v) => `Adding ${v.d} days to ${v.mon} ${v.day}, ${v.yr} lands on ${v.ans}, because the statutory period runs day by day from the date of judgement.`,
        distract: (v) => [`${v.ansMinus}`, `${v.ansPlus}`, `${v.mon} ${v.day}, ${v.yr}`, `${v.ansHalf}`, `${v.ans2}`],
        vals: (rng) => {
          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const dom = [28, 30, 31];
          const mi = Math.floor(rng() * 12);
          const day = 1 + Math.floor(rng() * 20);
          const d = 15 + Math.floor(rng() * 60);
          const start = Date.UTC(2025, mi, day);
          const end = new Date(start + d * 86400000);
          const fmt = (dt) => `${months[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
          return {
            d, mon: months[mi], day, yr: 2025,
            ans: fmt(end),
            ansMinus: fmt(new Date(end.getTime() - 86400000)),
            ansPlus: fmt(new Date(end.getTime() + 86400000)),
            ansHalf: fmt(new Date(start + Math.round(d / 2) * 86400000)),
            ans2: fmt(new Date(end.getTime() + 7 * 86400000))
          };
        },
        whyWrong: (v) => [`Add the statutory days forward from the judgement date; subtracting a day, halving the period or adding a week are the traps.`],
        trick: "Period end = judgement date + statutory days.",
        tip: "Check whether the statute counts the judgement day itself."
      },
      {
        kind: "numeric", name: "compensation calculations", difficulty: "medium",
        note: "Diyat compensation scales the standard rate by the severity fraction.",
        q: (v) => `The standard diyat (blood money) for a death is Rs ${v.base.toLocaleString()}. An injury assessed at ${v.f}/10 of that rate is compensated. What compensation is payable?`,
        a: (v) => `Rs ${(v.base * v.f / 10).toLocaleString()}`,
        e: (v) => `Compensation = ${v.f}/10 × Rs ${v.base.toLocaleString()} = Rs ${(v.base * v.f / 10).toLocaleString()}, because the injury rate is a fraction of the full diyat.`,
        distract: (v) => {
          const c = v.base * v.f / 10;
          return [`Rs ${(c * 2).toLocaleString()}`, `Rs ${(c * 0.5).toLocaleString()}`, `Rs ${(v.base - c).toLocaleString()}`, `Rs ${(c + 100000).toLocaleString()}`, `Rs ${(c * 1.5).toLocaleString()}`];
        },
        vals: (rng) => ({ base: 1000000 + Math.floor(rng() * 90) * 100000, f: 2 + Math.floor(rng() * 8) }),
        whyWrong: (v) => [`Multiply the full diyat by the severity fraction; subtracting it from the base or doubling it misapplies the fraction.`],
        trick: "Compensation = diyat × fraction/10.",
        tip: "Diyat questions are pure fraction arithmetic once the rate is known."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
