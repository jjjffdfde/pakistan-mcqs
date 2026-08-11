/* ============================================================
   Deep Knowledge KB — Geography
   World geography, climate, landforms + numeric geography.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["geography"],
  chapter: "Geography — Deep Knowledge Bank",
  tags: ["geography", "deep-kb", "world", "climate", "landforms"],
  topics: {

    "World Geography": [
      {
        kind: "fact", name: "world geography facts",
        note: "The 'largest/highest/longest' facts of world geography.",
        facts: [
          ["What is the largest ocean?", "The Pacific Ocean", "The Pacific covers about a third of the Earth's surface, the largest of the five oceans."],
          ["What is the largest desert in the world?", "The Antarctic Desert", "Antarctica is technically the largest desert because it receives very little precipitation."],
          ["What is the largest hot desert?", "The Sahara", "The Sahara in North Africa is the largest hot desert, about the size of the USA."],
          ["What is the longest river in the world?", "The Nile", "The Nile in Africa runs about 6,650 km, usually ranked the longest river."],
          ["Which is the largest river by discharge?", "The Amazon", "The Amazon carries the greatest volume of water of any river."],
          ["What is the highest mountain on Earth?", "Mount Everest", "Mount Everest stands 8,849 m above sea level in the Himalayas, the highest peak on Earth."],
          ["What is the largest lake in the world?", "The Caspian Sea", "The Caspian Sea, between Europe and Asia, is the world's largest lake by area."],
          ["What is the largest country by area?", "Russia", "Russia covers about 17 million km², the largest country on Earth."],
          ["What is the most populous country?", "India", "India surpassed China to become the world's most populous country."],
          ["What is the largest continent?", "Asia", "Asia is the largest continent by area and the most populous."]
        ],
        trick: "Pacific=ocean, Sahara=hot desert, Nile=longest river, Everest=highest peak, Russia=largest country.",
        tip: "The superlative facts are guaranteed exam content."
      },
      {
        kind: "tf", name: "world geography statements",
        note: "True/false stems on world geography.",
        statements: [
          ["The Pacific is the largest ocean.", "The Arctic is the largest ocean."],
          ["The Nile is the longest river.", "The Thames is the longest river."],
          ["Everest is the highest mountain.", "K2 is the highest mountain."],
          ["Russia is the largest country by area.", "China is the largest country by area."],
          ["The Sahara is the largest hot desert.", "The Gobi is the largest hot desert."]
        ],
        trick: "Pacific, Nile, Everest, Russia, Sahara — the five anchors.",
        tip: "Superlative swaps are the standard trap."
      }
    ],

    "Physical Geography": [
      {
        kind: "fact", name: "physical geography facts",
        note: "Landforms, plates and climate facts.",
        facts: [
          ["What is the theory of plate tectonics?", "The Earth's crust moves in large plates", "Plates drift on the mantle, causing earthquakes, volcanoes and mountain building."],
          ["What is the layer beneath the crust called?", "The mantle", "The mantle lies beneath the crust, and its convection currents drive the movement of tectonic plates."],
          ["What is the outermost solid layer of the Earth called?", "The crust", "The crust is the thin rocky shell of the Earth, coming in oceanic and continental varieties."],
          ["What is the Earth's centre called?", "The core", "The core is metallic iron-nickel, with a solid inner and liquid outer part."],
          ["What causes earthquakes?", "Sudden release of stress along faults", "When plates slip along faults, stored energy releases as seismic waves."],
          ["What is a volcano?", "An opening that erupts magma", "Volcanoes form where magma reaches the surface through plate boundaries."],
          ["What is the Ring of Fire?", "The volcanic belt around the Pacific", "The Ring of Fire marks the Pacific plate boundaries with heavy volcanic activity."],
          ["What is the greenhouse effect?", "Gases trapping heat in the atmosphere", "CO₂ and methane trap outgoing radiation, warming the planet."],
          ["What is the main cause of recent global warming?", "Human emissions of greenhouse gases", "Burning fossil fuels raises CO₂, strengthening the greenhouse effect."],
          ["What is the ozone layer's role?", "Blocking harmful UV radiation", "The stratospheric ozone layer absorbs most of the Sun's harmful UV-B radiation."]
        ],
        trick: "Crust→mantle→core; Ring of Fire=Pacific; greenhouse=trapped heat; ozone=UV shield.",
        tip: "Earth layers and the greenhouse effect are the top items."
      },
      {
        kind: "numeric", name: "map scale calculations", difficulty: "easy",
        note: "Actual distance = map distance × scale factor.",
        q: (v) => `On a 1:${v.scale.toLocaleString()} map, two cities are ${v.cm} cm apart. What is the actual distance in kilometres?`,
        a: (v) => `${(v.cm * v.scale / 100000).toFixed(1)} km`,
        e: (v) => `Actual = map distance × scale = ${v.cm} cm × ${v.scale.toLocaleString()} = ${(v.cm * v.scale).toLocaleString()} cm = ${(v.cm * v.scale / 100000).toFixed(1)} km, because 100,000 cm equals 1 km.`,
        distract: (v) => {
          const c = v.cm * v.scale / 100000;
          return [`${(c * 10).toFixed(1)} km`, `${(c * 0.1).toFixed(1)} km`, `${(c * 2).toFixed(1)} km`, `${(v.cm * v.scale / 1000).toFixed(1)} km`, `${(c * 0.5).toFixed(1)} km`];
        },
        vals: (rng) => {
          const scales = [25000, 50000, 100000, 250000, 500000];
          const scale = scales[Math.floor(rng() * scales.length)];
          return { scale, cm: Math.round((2 + rng() * 20) * 10) / 10 };
        },
        whyWrong: (v) => [`Convert centimetres to kilometres by dividing by 100,000; dividing by 1000 (metres only) is the classic unit error.`],
        trick: "cm × scale ÷ 100,000 = km.",
        tip: "1:100,000 means 1 cm = 1 km on the ground."
      },
      {
        kind: "numeric", name: "population density calculations", difficulty: "easy",
        note: "Population density = population ÷ area.",
        q: (v) => `A region has a population of ${v.p.toLocaleString()} in an area of ${v.a.toLocaleString()} km². What is the population density per km²?`,
        a: (v) => `${Math.round(v.p / v.a)}`,
        e: (v) => `Density = population ÷ area = ${v.p.toLocaleString()} ÷ ${v.a.toLocaleString()} = ${Math.round(v.p / v.a)} per km², because density distributes the population over the land area.`,
        distract: (v) => {
          const c = Math.round(v.p / v.a);
          return [`${Math.round(c * 2)}`, `${Math.round(c * 0.5)}`, `${(v.a / v.p).toFixed(2)}`, `${c + 50}`, `${Math.round(c * 1.5)}`];
        },
        vals: (rng) => ({ p: 500000 + Math.floor(rng() * 90) * 500000, a: 5000 + Math.floor(rng() * 90) * 5000 }),
        whyWrong: (v) => [`Density divides population by area; inverting the ratio or doubling the result are the traps.`],
        trick: "Density = people ÷ km².",
        tip: "Bangladesh (~1300/km²) is among the densest countries."
      },
      {
        kind: "numeric", name: "temperature conversions", difficulty: "medium",
        note: "°F = °C × 9/5 + 32; °C = (°F − 32) × 5/9.",
        q: (v) => `Convert ${v.c}°C to Fahrenheit.`,
        a: (v) => `${Math.round(v.c * 9 / 5 + 32)}°F`,
        e: (v) => `°F = °C × 9/5 + 32 = ${v.c} × 9/5 + 32 = ${Math.round(v.c * 9 / 5 + 32)}°F, because each Celsius degree spans 9/5 of a Fahrenheit degree with a 32° offset.`,
        distract: (v) => {
          const c = Math.round(v.c * 9 / 5 + 32);
          return [`${Math.round((v.c + 32) * 9 / 5)}°F`, `${c + 1}°F`, `${Math.round(v.c * 5 / 9 + 32)}°F`, `${c - 10}°F`, `${v.c * 2 + 30}°F`];
        },
        vals: (rng) => ({ c: -10 + Math.floor(rng() * 50) }),
        whyWrong: (v) => [`The correct formula is °F = °C × 9/5 + 32; swapping the fractions or misplacing the +32 gives wrong results.`],
        trick: "°F = °C × 1.8 + 32 — multiply then shift by 32.",
        tip: "0°C = 32°F and 100°C = 212°F are the anchor checks."
      },
      {
        kind: "numeric", name: "ocean area percentages", difficulty: "medium",
        note: "The ocean covers about 71% of the Earth's surface.",
        q: (v) => `If the oceans cover ${v.p}% of the Earth's surface, what area of the ${v.area} million km² surface do they cover?`,
        a: (v) => `${(v.area * v.p / 100).toFixed(1)} million km²`,
        e: (v) => `Ocean area = ${v.p}% × ${v.area} = ${(v.area * v.p / 100).toFixed(1)} million km², because the percentage of the total surface converts directly to area.`,
        distract: (v) => {
          const c = v.area * v.p / 100;
          return [`${(c * 2).toFixed(1)} million km²`, `${(c * 0.5).toFixed(1)} million km²`, `${(v.area - c).toFixed(1)} million km²`, `${(c + 20).toFixed(1)} million km²`, `${(v.area * v.p / 1000).toFixed(1)} million km²`];
        },
        vals: (rng) => {
          const p = 60 + Math.floor(rng() * 20);
          const area = Math.round((350 + rng() * 160) * 10) / 10;
          return { p, area };
        },
        whyWrong: (v) => [`Multiply the surface by the percentage; dividing by 1000 or taking the complement miscomputes the covered area.`],
        trick: "Area = surface × % ÷ 100.",
        tip: "The real figure: 71% of ~510 million km² ≈ 362 million km²."
      }
    ],

    "Climate and Environment": [
      {
        kind: "fact", name: "climate facts",
        note: "Climate zones, seasons and weather facts.",
        facts: [
          ["What is climate?", "Long-term average weather of a region", "Climate averages weather patterns over decades, unlike day-to-day weather."],
          ["What is the difference between weather and climate?", "Weather is short-term, climate is long-term", "Weather is today's conditions; climate is the 30-year average pattern."],
          ["Which zone has the highest rainfall?", "The equatorial zone", "The equator's rising warm air produces year-round heavy rain."],
          ["What are the tropics?", "The band between the Tropic of Cancer and Tropic of Capricorn", "The tropics receive direct sunlight, giving warm temperatures year-round."],
          ["Which climate has four distinct seasons?", "Temperate climate", "Temperate regions experience spring, summer, autumn and winter."],
          ["What is the monsoon?", "A seasonal wind reversing direction, bringing rain", "South Asian monsoons reverse direction each year, bringing wet summers and dry winters."],
          ["What is a desert climate?", "Very little precipitation, hot or cold", "Deserts receive under 250 mm of rain per year, whether hot like the Sahara or cold like Antarctica."],
          ["What is the Coriolis effect?", "The deflection of moving air by Earth's rotation", "The Coriolis effect bends winds and currents clockwise in the north."],
          ["Which gas forms the largest share of the atmosphere?", "Nitrogen", "Nitrogen makes up about 78% of dry air, with oxygen at 21% and argon next."],
          ["What is the layer of the atmosphere where weather occurs?", "The troposphere", "The troposphere, the lowest layer, holds nearly all weather."]
        ],
        trick: "Weather=short, climate=long; monsoon=seasonal rain; nitrogen=78%; troposphere=weather.",
        tip: "Weather vs climate is the most asked distinction."
      },
      {
        kind: "tf", name: "climate statements",
        note: "True/false stems on climate.",
        statements: [
          ["Climate is the long-term weather average.", "Climate is tomorrow's forecast."],
          ["The troposphere holds most weather.", "The exosphere holds most weather."],
          ["Monsoons bring seasonal rain to South Asia.", "Monsoons are permanent winds from the poles."],
          ["Nitrogen forms about 78% of the atmosphere.", "Oxygen forms about 78% of the atmosphere."],
          ["The tropics receive direct sunlight year-round.", "The poles receive direct sunlight year-round."]
        ],
        trick: "Climate=long, troposphere=weather, monsoon=seasonal, nitrogen=78%, tropics=direct sun.",
        tip: "Layer and gas swaps are the traps here."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
