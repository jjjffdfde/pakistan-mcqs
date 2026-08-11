/* ============================================================
   Deep Knowledge KB — Environmental Science
   Ecosystems, pollution, conservation + numeric environment.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["environmental-science"],
  chapter: "Environmental Science — Deep Knowledge Bank",
  tags: ["environmental-science", "deep-kb", "ecosystems", "pollution", "climate"],
  topics: {

    "Ecology and Ecosystems": [
      {
        kind: "fact", name: "ecology facts",
        note: "Ecosystems, food webs and ecological concepts.",
        facts: [
          ["What is an ecosystem?", "Living organisms and their environment together", "Ecosystems combine communities with the physical environment they inhabit."],
          ["What is a food chain?", "The flow of energy from one organism to another", "Energy passes from producers through consumers in a chain, losing some at each step."],
          ["What are producers?", "Organisms that make their own food", "Green plants produce food by photosynthesis, starting every food chain."],
          ["What are consumers?", "Organisms that eat other organisms", "Herbivores, carnivores and omnivores are all consumers that feed at different trophic levels."],
          ["What are decomposers?", "Organisms that break down dead matter", "Bacteria and fungi recycle nutrients from dead organisms back into the soil."],
          ["What is a habitat?", "The natural home of an organism", "A habitat provides food, water, shelter and space for a species."],
          ["What is a biome?", "A large regional community with its climate", "Biomes like rainforests and deserts match climate with vegetation."],
          ["What is biodiversity?", "The variety of life in an area", "Biodiversity covers species, genes and ecosystems, and supports stability."],
          ["What is carrying capacity?", "The maximum population an area can sustain", "Carrying capacity limits population size by the resources available in that area."],
          ["What is a niche?", "An organism's role within its ecosystem", "A niche includes what it eats, where it lives and its effects on others."]
        ],
        trick: "Producers=make food, consumers=eat, decomposers=recycle, biome=climate+community.",
        tip: "Producer/consumer/decomposer roles are the most asked ecology items."
      },
      {
        kind: "numeric", name: "food chain energy transfer", difficulty: "easy",
        note: "About 10% of energy transfers between trophic levels.",
        q: (v) => `A food chain's producers capture ${v.j} kJ of energy. How much energy reaches the primary consumers, assuming 10% transfer?`,
        a: (v) => `${(v.j * 0.1).toFixed(1)} kJ`,
        e: (v) => `Primary consumers receive 10% of the producers' energy: ${v.j} × 0.1 = ${(v.j * 0.1).toFixed(1)} kJ, because most energy is lost as heat at each transfer.`,
        distract: (v) => {
          const c = v.j * 0.1;
          return [`${(c * 10).toFixed(1)} kJ`, `${(c * 0.1).toFixed(1)} kJ`, `${(c * 2).toFixed(1)} kJ`, `${(c * 0.5).toFixed(1)} kJ`, `${(v.j * 0.9).toFixed(1)} kJ`];
        },
        vals: (rng) => ({ j: 500 + Math.floor(rng() * 90) * 100 }),
        whyWrong: (v) => [`Only 10% passes to the next level; using 90% (the lost share) or doubling the transfer are the traps.`],
        trick: "Multiply by 0.1 for each trophic level.",
        tip: "The 10% rule holds across every chain."
      },
      {
        kind: "numeric", name: "carbon footprint calculations", difficulty: "medium",
        note: "Emissions = activity × emission factor per unit.",
        q: (v) => `A household uses ${v.kwh.toLocaleString()} kWh of electricity with an emission factor of ${v.f} kg CO₂ per kWh. What are its annual electricity emissions in tonnes?`,
        a: (v) => `${(v.kwh * v.f / 1000).toFixed(1)} tonnes`,
        e: (v) => `Emissions = ${v.kwh.toLocaleString()} × ${v.f} = ${(v.kwh * v.f).toLocaleString()} kg = ${(v.kwh * v.f / 1000).toFixed(1)} tonnes, because 1000 kg equals one tonne.`,
        distract: (v) => {
          const c = v.kwh * v.f / 1000;
          return [`${(c * 10).toFixed(1)} tonnes`, `${(c * 0.1).toFixed(1)} tonnes`, `${(c * 2).toFixed(1)} tonnes`, `${(c * 0.5).toFixed(1)} tonnes`, `${(v.kwh * v.f).toFixed(0)} tonnes`];
        },
        vals: (rng) => ({ kwh: 1000 + Math.floor(rng() * 90) * 100, f: Math.round((0.4 + rng() * 0.4) * 10) / 10 }),
        whyWrong: (v) => [`Divide kg by 1000 for tonnes; quoting the kg figure as tonnes is the classic unit error.`],
        trick: "tonnes = kWh × factor ÷ 1000.",
        tip: "Emission factors are always per-unit — check the unit."
      },
      {
        kind: "numeric", name: "recycling rate calculations", difficulty: "easy",
        note: "Recycling rate = recycled waste ÷ total waste × 100.",
        q: (v) => `A city produces ${v.t} tonnes of waste and recycles ${v.r} tonnes. What is its recycling rate?`,
        a: (v) => `${(100 * v.r / v.t).toFixed(1)}%`,
        e: (v) => `Rate = ${v.r} ÷ ${v.t} × 100 = ${(100 * v.r / v.t).toFixed(1)}%, because the rate expresses recycled waste as a share of the total.`,
        distract: (v) => {
          const c = 100 * v.r / v.t;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`];
        },
        vals: (rng) => {
          const t = 1000 + Math.floor(rng() * 90) * 100;
          const r = 100 + Math.floor(rng() * (t - 100));
          return { t, r };
        },
        whyWrong: (v) => [`Rate = recycled ÷ total; the landfill complement is the standard distractor.`],
        trick: "Rate % = recycled ÷ total × 100.",
        tip: "Read whether the question asks for recycled or non-recycled share."
      }
    ],

    "Pollution and Climate": [
      {
        kind: "fact", name: "pollution facts",
        note: "Types of pollution and their causes.",
        facts: [
          ["What is air pollution?", "Harmful substances in the atmosphere", "Smoke, dust and gases like NO₂ and SO₂ pollute the air, harming health and climate."],
          ["What is water pollution?", "Contaminants entering water bodies", "Industrial waste, sewage and fertilisers pollute rivers and seas."],
          ["What is soil pollution?", "Toxic substances degrading the soil", "Pesticides, heavy metals and landfill leachate pollute soil."],
          ["What is noise pollution?", "Excessive harmful sound", "Traffic, industry and construction create harmful noise levels."],
          ["What is the main greenhouse gas from human activity?", "Carbon dioxide", "CO₂ from fossil fuel burning dominates human greenhouse emissions."],
          ["What is smog?", "A harmful mix of smoke and fog", "Urban smog combines particulates and gases, worsened by inversions."],
          ["What causes acid rain?", "Sulphur and nitrogen oxides in the air", "SO₂ and NOₓ dissolve in rain, forming acids that damage forests and buildings."],
          ["What is the ozone hole?", "Thinning of stratospheric ozone", "CFCs deplete the ozone layer, allowing more UV through to the surface."],
          ["What is eutrophication?", "Nutrient overload causing algal blooms", "Fertiliser runoff feeds algae that deplete oxygen when they decay."],
          ["What is the main source of marine plastic?", "Land-based waste", "Most ocean plastic comes from rivers carrying land waste out to sea."]
        ],
        trick: "CO₂=main greenhouse gas, acid rain=SO₂+NOₓ, ozone hole=CFCs, eutrophication=nutrients.",
        tip: "Pollutant-effect pairs are the highest-yield items."
      },
      {
        kind: "tf", name: "pollution statements",
        note: "True/false stems on pollution.",
        statements: [
          ["Acid rain comes from sulphur and nitrogen oxides.", "Acid rain comes from carbon monoxide only."],
          ["CFCs deplete the ozone layer.", "CFCs strengthen the ozone layer."],
          ["Eutrophication is caused by nutrient overload.", "Eutrophication is caused by sound pollution."],
          ["CO₂ is the main human greenhouse gas.", "Oxygen is the main human greenhouse gas."],
          ["Smog combines smoke and fog.", "Smog is pure water vapour."]
        ],
        trick: "Acid rain=SO₂/NOₓ, ozone=CFCs, eutrophication=nutrients, CO₂=greenhouse, smog=smoke+fog.",
        tip: "Cause-effect swaps are the classic traps."
      },
      {
        kind: "numeric", name: "AQI calculations", difficulty: "medium",
        note: "PM concentrations map to AQI bands; questions test band identification from values.",
        q: (v) => `A city records an AQI of ${v.aqi}. Which category does this air quality fall into?`,
        a: (v) => `${v.cat}`,
        e: (v) => `An AQI of ${v.aqi} falls in the "${v.cat}" band, because AQI categories step through 0-50 good, 51-100 moderate, 101-150 unhealthy for sensitive groups, 151-200 unhealthy, 201-300 very unhealthy and 300+ hazardous.`,
        distract: (v) => {
          const CATS = ["Good", "Moderate", "Unhealthy for sensitive groups", "Unhealthy", "Very unhealthy", "Hazardous"];
          const c = CATS[(v.aqi * 7) % CATS.length];
          return [`${c}`, `${v.cat} (slightly revised)`, "Excellent", "Safe"];
        },
        vals: (rng) => {
          const bands = [
            [15, "Good"], [75, "Moderate"], [125, "Unhealthy for sensitive groups"], [175, "Unhealthy"], [250, "Very unhealthy"], [400, "Hazardous"]
          ];
          const [base, cat] = bands[Math.floor(rng() * bands.length)];
          return { aqi: base + Math.floor(rng() * 25), cat };
        },
        whyWrong: (v) => [`Identify the band from the AQI range; neighbouring bands are the classic distractors.`],
        trick: "0-50 Good, 51-100 Moderate, 101-150 Sensitive, 151-200 Unhealthy, 201-300 Very, 300+ Hazardous.",
        tip: "Memorise the six band boundaries exactly."
      }
    ],

    "Conservation": [
      {
        kind: "fact", name: "conservation facts",
        note: "Protected areas, species and sustainable practice.",
        facts: [
          ["What is conservation?", "Protecting and managing natural resources", "Conservation sustains species, habitats and resources for the future."],
          ["What is a national park?", "A protected area for ecosystems and wildlife", "National parks ban development and hunting to preserve nature."],
          ["What is a wildlife sanctuary?", "A protected refuge for animal species", "Sanctuaries protect animals, often with habitat management to support breeding."],
          ["What is sustainable development?", "Meeting present needs without harming the future", "Sustainability balances economy, environment and society for future generations."],
          ["What is the Red List?", "The IUCN list of threatened species", "The IUCN Red List tracks species from least concern to extinct."],
          ["Which treaty protects wetlands?", "The Ramsar Convention", "Ramsar (1971) protects internationally important wetlands for waterbirds."],
          ["What is CITES?", "The treaty controlling wildlife trade", "CITES regulates international trade in endangered species to stop over-exploitation."],
          ["What is reforestation?", "Planting trees to restore forests", "Reforestation rebuilds forests on cleared land, absorbing CO₂."],
          ["What is renewable energy?", "Energy from sources that replenish", "Solar, wind and hydro renew naturally, unlike fossil fuels that are finite."],
          ["What is the 3R principle?", "Reduce, reuse, recycle", "The 3Rs cut waste before disposal, in that order of preference."]
        ],
        trick: "Ramsar=wetlands, CITES=trade, Red List=threatened species, 3R=reduce/reuse/recycle.",
        tip: "Treaty-purpose pairs are the highest-yield conservation items."
      },
      {
        kind: "tf", name: "conservation statements",
        note: "True/false stems on conservation.",
        statements: [
          ["The Ramsar Convention protects wetlands.", "Ramsar protects currency exchange rates."],
          ["CITES controls wildlife trade.", "CITES builds highways."],
          ["The Red List tracks threatened species.", "The Red List ranks stock markets."],
          ["Solar energy is renewable.", "Coal energy is renewable."],
          ["Reforestation replants trees on cleared land.", "Reforestation removes all existing forests."]
        ],
        trick: "Ramsar=wetlands, CITES=trade, Red List=species, solar=renewable, reforestation=replant.",
        tip: "Treaty and energy swaps are the traps."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
