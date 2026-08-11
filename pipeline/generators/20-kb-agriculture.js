/* ============================================================
   Deep Knowledge KB — Agriculture
   Crops, soils, livestock + numeric agronomy.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["agriculture"],
  chapter: "Agriculture — Deep Knowledge Bank",
  tags: ["agriculture", "deep-kb", "crops", "soils", "livestock"],
  topics: {

    "Crops of Pakistan": [
      {
        kind: "fact", name: "crop facts",
        note: "Major Pakistani crops and their seasons.",
        facts: [
          ["What is Pakistan's most important food crop?", "Wheat", "Wheat is the staple food crop of Pakistan, grown mainly in Punjab."],
          ["What is Pakistan's main cash crop?", "Cotton", "Cotton drives Pakistan's textile exports and the economy, making it the main cash crop."],
          ["Which crops are grown in the Kharif season?", "Rice, cotton and sugar cane", "Kharif crops are sown in summer rains and harvested in autumn."],
          ["Which crops are grown in the Rabi season?", "Wheat, barley and gram", "Rabi crops are sown in winter and harvested in spring, unlike Kharif crops."],
          ["Which province grows most of Pakistan's rice?", "Punjab and Sindh", "Punjab (Basmati) and Sindh (IRRI) dominate rice production across the country."],
          ["Which crop is called white gold?", "Cotton", "Cotton's economic importance earned it the title white gold."],
          ["What is the leading sugar crop of Pakistan?", "Sugar cane", "Sugar cane feeds Pakistan's sugar mills, mainly in Punjab and Sindh."],
          ["Which fruit is Pakistan's largest fruit export?", "Kinnow (mandarin)", "Kinnow from Punjab is Pakistan's top fruit export by volume and value."],
          ["What is Pakistan's national crop?", "Wheat", "Wheat holds the status of national crop of Pakistan, feeding the whole population."],
          ["Which fibre crop is used for textiles?", "Cotton", "Cotton lint is spun into yarn and textiles, feeding the textile industry."]
        ],
        trick: "Wheat=staple/national, cotton=cash/white gold, Kharif=summer (rice/cotton), Rabi=winter (wheat).",
        tip: "Kharif vs Rabi mapping is the most asked crop question."
      },
      {
        kind: "tf", name: "crop statements",
        note: "True/false stems on crops.",
        statements: [
          ["Wheat is grown in the Rabi season.", "Wheat is grown in the Kharif season."],
          ["Cotton is Pakistan's main cash crop.", "Tea is Pakistan's main cash crop."],
          ["Rice and cotton are Kharif crops.", "Rice and cotton are Rabi crops."],
          ["Kinnow is a major fruit export.", "Kinnow is a wheat variety."],
          ["Sugar cane feeds the sugar mills.", "Sugar cane feeds the tea industry."]
        ],
        trick: "Wheat=Rabi, cotton=cash, rice/cotton=Kharif, kinnow=export fruit, cane=sugar.",
        tip: "Season and use swaps are the classic traps."
      }
    ],

    "Soils and Agronomy": [
      {
        kind: "fact", name: "soil facts",
        note: "Soil types, nutrients and farming practices.",
        facts: [
          ["What are the main soil types of Pakistan?", "Alluvial, loess, saline and desert soils", "Indus plains are alluvial; barani lands have loess and sandy soils."],
          ["Which nutrient do plants need most for growth?", "Nitrogen", "Nitrogen drives leaf growth and is the most needed nutrient."],
          ["Which nutrient is needed for flowering and fruiting?", "Phosphorus", "Phosphorus boosts roots, flowers and fruit formation in crop plants."],
          ["Which nutrient is essential for disease resistance?", "Potassium", "Potassium strengthens plants against disease and drought stress."],
          ["What is the NPK in fertiliser?", "Nitrogen, phosphorus, potassium", "NPK fertilisers supply the three primary nutrients plants need in bulk."],
          ["What is irrigation?", "Supplying water to crops artificially", "Canals, tube wells and drip systems irrigate crops when rain is scarce."],
          ["What is crop rotation?", "Growing different crops in sequence on the same land", "Rotation restores nutrients and breaks pest cycles between seasons."],
          ["What is the Green Revolution associated with?", "High-yield wheat and rice varieties", "New varieties and fertilisers raised yields from the 1960s onwards."],
          ["Who is called the father of the Pakistani Green Revolution?", "Norman Borlaug (with Pakistani scientists)", "Borlaug's high-yield wheat sparked the Green Revolution in Pakistan."],
          ["What is organic farming?", "Farming without synthetic chemicals", "Organic farming uses compost, manure and natural pest control."]
        ],
        trick: "N=growth, P=flowering, K=disease resistance, NPK=three nutrients, rotation=sequence.",
        tip: "Nutrient-role mapping (NPK) is the most asked soil item."
      },
      {
        kind: "numeric", name: "yield calculations", difficulty: "easy",
        note: "Yield = total produce ÷ land area.",
        q: (v) => `A farmer harvests ${v.kgs.toLocaleString()} kg of wheat from ${v.hectares} hectares. What is the yield per hectare?`,
        a: (v) => `${Math.round(v.kgs / v.hectares).toLocaleString()} kg/ha`,
        e: (v) => `Yield = produce ÷ area = ${v.kgs.toLocaleString()} ÷ ${v.hectares} = ${Math.round(v.kgs / v.hectares).toLocaleString()} kg/ha, because yield measures output per unit of land.`,
        distract: (v) => {
          const c = Math.round(v.kgs / v.hectares);
          return [`${Math.round(c * 2).toLocaleString()} kg/ha`, `${Math.round(c * 0.5).toLocaleString()} kg/ha`, `${(v.hectares / v.kgs * 1000).toFixed(2)} kg/ha`, `${(c + 500).toLocaleString()} kg/ha`, `${Math.round(c * 1.5).toLocaleString()} kg/ha`];
        },
        vals: (rng) => {
          const hectares = 5 + Math.floor(rng() * 45);
          const kgs = Math.round(hectares * (1500 + rng() * 2500));
          return { kgs, hectares };
        },
        whyWrong: (v) => [`Yield divides produce by hectares; inverting the ratio or doubling the result are the traps.`],
        trick: "Yield = kg ÷ hectares.",
        tip: "Pakistan wheat yields average about 3 tonnes per hectare."
      },
      {
        kind: "numeric", name: "fertiliser calculations", difficulty: "medium",
        note: "Fertiliser rate = nutrient needed ÷ nutrient fraction in the fertiliser.",
        q: (v) => `A crop needs ${v.n} kg of nitrogen per hectare. Urea contains ${v.f}% nitrogen. How much urea is needed per hectare?`,
        a: (v) => `${Math.round(v.n * 100 / v.f)} kg`,
        e: (v) => `Urea needed = nitrogen ÷ fraction = ${v.n} ÷ (${v.f}%) = ${Math.round(v.n * 100 / v.f)} kg, because only the fraction of the fertiliser is the nutrient.`,
        distract: (v) => {
          const c = Math.round(v.n * 100 / v.f);
          return [`${Math.round(c * 0.5)} kg`, `${Math.round(c * 1.5)} kg`, `${Math.round(v.n * v.f / 100)} kg`, `${c + 20} kg`, `${Math.round(c * 2)} kg`];
        },
        vals: (rng) => {
          const f = [46, 34, 26, 21][Math.floor(rng() * 4)];
          const n = 40 + Math.floor(rng() * 80);
          return { n, f };
        },
        whyWrong: (v) => [`Divide the nutrient need by the fertiliser's nutrient fraction (46% urea = 0.46); multiplying gives the tiny wrong dose.`],
        trick: "Fertiliser = nutrient ÷ fraction.",
        tip: "Urea is 46% nitrogen — the anchor figure."
      },
      {
        kind: "numeric", name: "seed rate calculations", difficulty: "easy",
        note: "Seed needed = area × seed rate per unit.",
        q: (v) => `Wheat is sown at a seed rate of ${v.r} kg per hectare. How much seed is needed for ${v.h} hectares?`,
        a: (v) => `${(v.r * v.h).toLocaleString()} kg`,
        e: (v) => `Seed = rate × area = ${v.r} × ${v.h} = ${(v.r * v.h).toLocaleString()} kg, because the seed rate scales directly with the sown area.`,
        distract: (v) => {
          const c = v.r * v.h;
          return [`${(c / 2).toLocaleString()} kg`, `${(c * 2).toLocaleString()} kg`, `${(c + 100).toLocaleString()} kg`, `${(c * 1.2).toLocaleString()} kg`, `${(v.r + v.h)} kg`];
        },
        vals: (rng) => ({ r: 80 + Math.floor(rng() * 60), h: 2 + Math.floor(rng() * 30) }),
        whyWrong: (v) => [`Multiply the rate by the area; halving or adding the numbers misapplies the seeding rate.`],
        trick: "Seed = rate × hectares.",
        tip: "Wheat seeding is roughly 100-125 kg/ha."
      }
    ],

    "Livestock": [
      {
        kind: "fact", name: "livestock facts",
        note: "Pakistan's livestock sector facts.",
        facts: [
          ["Which animal contributes most to Pakistan's milk production?", "Buffaloes", "Buffaloes produce most of Pakistan's milk, mainly Nili-Ravi and Kundi breeds."],
          ["What is Pakistan's national animal?", "The markhor", "The markhor, a wild goat, is the national animal of Pakistan."],
          ["Which breed of buffalo is famous in Punjab?", "Nili-Ravi", "Nili-Ravi buffaloes are prized dairy animals of Punjab, famous for milk yield."],
          ["What is the main source of meat in Pakistan?", "Cattle and buffalo", "Beef from cattle and buffalo dominates meat production in Pakistan."],
          ["Which birds are raised for eggs and meat?", "Poultry", "Pakistan's poultry industry supplies eggs and chicken meat at scale."],
          ["What is animal husbandry?", "The care and breeding of farm animals", "Animal husbandry manages breeding, feeding and health of livestock."],
          ["Which sector shares the largest part of agriculture's GDP?", "Livestock", "Livestock contributes the largest single share of agriculture's GDP."],
          ["What is fodder?", "Feed grown for livestock", "Fodder crops like berseem and maize feed dairy animals through the year."],
          ["Which sheep breed is famous in Balochistan?", "Balochi sheep", "Balochi sheep thrive in arid rangelands with little water and sparse grazing."],
          ["What is a dairy farm?", "A farm producing milk at scale", "Dairy farms manage cows and buffaloes for commercial milk production."]
        ],
        trick: "Buffalo=milk leader, markhor=national animal, Nili-Ravi=Punjab buffalo, livestock=top agri share.",
        tip: "Breed-region pairs and the national animal are the top items."
      },
      {
        kind: "numeric", name: "milk yield calculations", difficulty: "easy",
        note: "Herd yield = per-animal yield × number of animals.",
        q: (v) => `A dairy has ${v.n} buffaloes averaging ${v.l} litres of milk per day. What is the daily herd yield?`,
        a: (v) => `${(v.n * v.l).toLocaleString()} litres`,
        e: (v) => `Herd yield = animals × per-animal yield = ${v.n} × ${v.l} = ${(v.n * v.l).toLocaleString()} litres, because each animal contributes its daily yield.`,
        distract: (v) => {
          const c = v.n * v.l;
          return [`${(c / 2).toLocaleString()} litres`, `${(c * 1.2).toLocaleString()} litres`, `${(v.n + v.l)} litres`, `${(c * 2).toLocaleString()} litres`, `${Math.round(c * 0.9).toLocaleString()} litres`];
        },
        vals: (rng) => ({ n: 10 + Math.floor(rng() * 90), l: 5 + Math.floor(rng() * 12) }),
        whyWrong: (v) => [`Multiply herd size by per-animal yield; adding them or halving the total are the traps.`],
        trick: "Herd yield = animals × litres per animal.",
        tip: "Nili-Ravi buffaloes average 8-10 L/day."
      },
      {
        kind: "numeric", name: "feed conversion calculations", difficulty: "medium",
        note: "Feed conversion ratio = feed consumed ÷ weight gained.",
        q: (v) => `A poultry flock consumes ${v.f} kg of feed to gain ${v.g} kg of body weight. What is the feed conversion ratio?`,
        a: (v) => `${(v.f / v.g).toFixed(2)} : 1`,
        e: (v) => `FCR = feed ÷ gain = ${v.f} ÷ ${v.g} = ${(v.f / v.g).toFixed(2)} : 1, because the ratio shows how many kilograms of feed produce one kilogram of gain.`,
        distract: (v) => {
          const c = v.f / v.g;
          return [`${(v.g / v.f).toFixed(2)} : 1`, `${(c + 0.5).toFixed(2)} : 1`, `${(c * 2).toFixed(2)} : 1`, `${(c * 0.5).toFixed(2)} : 1`, `${(c * 1.5).toFixed(2)} : 1`];
        },
        vals: (rng) => {
          const g = 50 + Math.floor(rng() * 100);
          const f = Math.round(g * (1.5 + rng() * 1));
          return { f, g };
        },
        whyWrong: (v) => [`FCR divides feed by gain; inverting to gain ÷ feed gives the efficiency, not the ratio.`],
        trick: "FCR = feed ÷ weight gain.",
        tip: "Lower FCR means better feed efficiency."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
