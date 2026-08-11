/* ============================================================
   Phase 11 — KB Engineering Subjects
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

function gen(subjects, chapter, tags, topics) {
  return makeKbGen({ subjects, chapter, tags: [tags, "deep-kb"], topics });
}
function ft(name, facts, trick, tip) {
  return { kind: "fact", name, facts, trick, tip };
}

/* ---------------- CIVIL ---------------- */
const civil = gen(["civil-eng"], "Civil Engineering — Structures (Phase 11)", "civil-eng", {
  "Materials and Construction": [
    ft("construction materials", [
      ["Which material is the main binder in concrete?", "Cement", "Ordinary Portland cement binds aggregates in concrete."],
      ["What is reinforcement steel used for?", "Resisting tensile forces", "Steel bars take tension that concrete cannot."],
      ["What is cement made by heating?", "Limestone and clay", "Clinker from limestone and clay is ground into cement."],
      ["Which material resists compression best?", "Concrete", "Concrete excels in compression but is weak in tension."],
      ["What is curing of concrete?", "Keeping it moist for hydration", "Curing allows cement to hydrate and gain strength."],
      ["What does RCC stand for?", "Reinforced cement concrete", "RCC embeds steel inside concrete."],
      ["What is a shear wall?", "A wall resisting lateral forces", "Shear walls brace against wind and earthquakes."],
      ["What is a column?", "A vertical compression member", "Columns carry loads down to the foundation."],
      ["Which test measures concrete strength?", "Compressive strength test", "Cubes or cylinders are crushed to measure it."],
      ["What is a beam?", "A horizontal member bending under load", "Beams carry vertical loads and bend."]
    ], "concrete=compression, steel=tension.", "Remember material vs force."),
    { kind: "numeric", name: "mix ratio parts", difficulty: "easy",
      note: "Sum of mix ratio figures.",
      q: (v) => `A concrete mix ratio is ${v.c}:${v.s}:${v.a} (cement:sand:aggregate). How many total parts are in the mix?`,
      a: (v) => `${v.c + v.s + v.a} parts`,
      e: (v) => `Total parts = ${v.c}+${v.s}+${v.a} = ${v.c + v.s + v.a}, adding each material portion.`,
      distract: (v) => { const c = v.c + v.s + v.a; return [`${c + 1} parts`, `${v.c * v.s * v.a} parts`, `${c * 2} parts`, `${v.c + v.s} parts`, `${c - 1} parts`]; },
      vals: (rng) => ({ c: 1, s: R(rng, 1, 3), a: R(rng, 2, 6) }),
      whyWrong: (v) => [`Sum the three numbers; multiplying confuses proportion with volume.`],
      trick: "parts = cement + sand + aggregate.",
      tip: "Mix ratios are cement:sand:aggregate." },
    { kind: "numeric", name: "beam stress", difficulty: "medium",
      note: "axial stress = force / area.",
      q: (v) => `A ${v.area} mm² column carries a load of ${v.f} N. What is the axial stress in N/mm² (MPa)?`,
      a: (v) => `${(v.f / v.area).toFixed(2)} MPa`,
      e: (v) => `Stress = F/A = ${v.f} ÷ ${v.area} = ${(v.f / v.area).toFixed(2)} MPa.`,
      distract: (v) => { const c = v.f / v.area; return [`${(c * 2.5).toFixed(2)}`, `${(c / 2).toFixed(2)}`, `${(v.area / v.f).toFixed(2)}`, `${(c * 4).toFixed(2)}`, `${(c * 10).toFixed(2)}`]; },
      vals: (rng) => ({ area: R(rng, 500, 5000), f: R(rng, 20000, 400000) }),
      whyWrong: (v) => [`Stress divides force by area; inverting or multiplying misreads the units.`],
      trick: "σ = F/A.",
      tip: "MPa is simply N/mm²." }
  ]
});

/* ---------------- ELECTRICAL ---------------- */
const electrical = gen(["electrical-eng", "electronics"], "Electrical Engineering — Circuits (Phase 11)", "electrical-eng", {
  "Ohm's Law and Power": [
    ft("Circuit basics", [
      ["What does Ohm's law state?", "V = I × R", "Voltage equals current times resistance."],
      ["What is electrical power in a DC circuit?", "P = V × I", "Power equals voltage × current."],
      ["Which metal is the best electrical conductor?", "Silver", "Silver has the highest conductivity."],
      ["What is a resistor for?", "Limiting current", "Resistors drop voltage and c urrent."],
      ["What is the unit of current?", "Ampere", "Current is measured in amperes."],
      ["Which unit measures resistance?", "Ohm", "Resistance is measured in ohms."],
      ["Which component stores electrical charge?", "Capacitor", "Capacitors store charge on plates."],
      ["Which component stores magnetic energy?", "Inductor", "Inductors store energy in magnetic flux."],
      ["What does a transformer do?", "Changes AC voltage levels", "Transformers step voltage up or down."],
      ["Which current reverses direction cyclically?", "Alternating current", "AC oscillates direction each cycle."]
    ], "Ohm V=IR, P=VI, silver=conductor.", "Know the unit pairs."),
    { kind: "numeric", name: "ohm law voltage", difficulty: "easy",
      note: "V = I × R.",
      q: (v) => `A circuit carries ${v.i} A through resistance ${v.r} Ω. What is the voltage?`,
      a: (v) => `${v.i * v.r} V`,
      e: (v) => `V = I × R = ${v.i} × ${v.r} = ${v.i * v.r} V, applying Ohm's law.`,
      distract: (v) => { const c = v.i * v.r; return [`${c + 4} V`, `${v.i + v.r} V`, `${(c / 2).toFixed(1)} V`, `${(v.r / v.i).toFixed(1)} V`, `${c * 1.5} V`]; },
      vals: (rng) => ({ i: R(rng, 1, 12), r: R(rng, 4, 60) }),
      whyWrong: (v) => [`Multiply current × resistance; dividing gives the wrong big.`],
      trick: "V = IR.",
      tip: "ohms × amps = volts." },
    { kind: "numeric", name: "electrical power", difficulty: "medium",
      note: "P = V × I.",
      q: (v) => `A device draws ${v.i} A at ${v.v} V. What is the power in watts?`,
      a: (v) => `${v.i * v.v} W`,
      e: (v) => `P = V × I = ${v.v} × ${v.i} = ${v.i * v.v} W.`,
      distract: (v) => { const c = v.i * v.v; return [`${c * 2} W`, `${(v.v / v.i).toFixed(1)} W`, `${(c * 0.5).toFixed(0)} W`, `${v.v + v.i} W`, `${16 + c} W`]; },
      vals: (rng) => ({ i: R(rng, 1, 20), v: R(rng, 20, 230) }),
      whyWrong: (v) => [`Power = V × I; dividing them yields resistance.`],
      trick: "P = VI.",
      tip: "Volt × amp = watt." }
  ]
});

/* ---------------- MECHANICAL ---------------- */
const mechanical = gen(["mechanical-eng"], "Mechanical Engineering — Mechanics (Phase 11)", "mechanical-eng", {
  "Force and Motion": [
    ft("Mechanics basics", [
      ["What is Newton's first law?", "Objects persist in motion unless a force acts", "Inertia keeps bodies in their state of motion."],
      ["What is Newton's second law?", "F = m × a", "Force equals mass times acceleration."],
      ["What is the unit of force?", "Newton", "One newton equals one kg·m/s²."],
      ["What is torque?", "A rotating force about an axis", "Torque = force × perpendicular distance."],
      ["What is efficiency?", "Output ÷ input", "Efficiency shows the fraction of usable output."],
      ["What does strain measure?", "Deformation divided by original length", "Strain = elongation ÷ initial length."],
      ["What is fatigue failure?", "Breaking under repeated cyclic loads", "Cyclic stress cracks metals over time."],
      ["What is the modulus of elasticity?", "Stress ÷ strain", "Elastic modulus describes stiffness."]
    ], "F=ma, torque=F×d, modulus=stress/strain.", "Newton's laws anchor the mechanics."),
    { kind: "numeric", name: "force equals mass acceleration", difficulty: "easy",
      note: "F = m × a.",
      q: (v) => `An object of mass ${v.m} kg accelerates at ${v.a} m/s². What is the net force?`,
      a: (v) => `${v.m * v.a} N`,
      e: (v) => `F = m × a = ${v.m} × ${v.a} = ${v.m * v.a} N, from Newton's second law.`,
      distract: (v) => { const c = v.m * v.a; return [`${c / 2} N`, `${v.m + v.a} N`, `${c * 2} N`, `${(v.m / v.a).toFixed(1)} N`, `${c + 10} N`]; },
      vals: (rng) => ({ m: R(rng, 2, 40), a: R(rng, 1, 12) }),
      whyWrong: (v) => [`force = mass × acceleration; adding or dividing mismatches units.`],
      trick: "F = ma.",
      tip: "kg·m/s² = newton." },
    { kind: "numeric", name: "work done", difficulty: "medium",
      note: "W = F × d for parallel force.",
      q: (v) => `A machine applies ${v.f} N for ${v.d} m. How much work is done in J?`,
      a: (v) => `${v.f * v.d} J`,
      e: (v) => `Work = F × d = ${v.f} × ${v.d} = ${v.f * v.d} J since the force acts along motion.`,
      distract: (v) => { const c = v.f * v.d; return [`${c * 2} J`, `${v.f + v.d} J`, `${(c / 2).toFixed(0)} J`, `${c + 5} J`, `${(c * 3).toFixed(0)} J`]; },
      vals: (rng) => ({ f: R(rng, 50, 500), d: R(rng, 2, 30) }),
      whyWrong: (v) => [`Use only the component of force along displacement; the perpendicular part does no work.`],
      trick: "W = F·d.",
      tip: "Only parallel force does work." }
  ]
});

/* ---------------- CHEMICAL ---------------- */
const chemical = gen(["chemical-eng"], "Chemical Engineering — Basics (Phase 11)", "chemical-eng", {
  "Chemical Basics": [
    ft("Chemical facts", [
      ["What is a mole?", "Avogadro's number of particles", "One mole is roughly 6.02×10²³ particles."],
      ["What is molarity?", "Moles per litre of solution", "Molarity = moles ÷ litres."],
      ["What does a catalyst do?", "Speeds reaction without being consumed", "Catalysts lower the activation energy."],
      ["Which balance is the conservation of mass?", "Material balance", "Input equals output plus accumulation."],
      ["What does a stoichiometric coefficient tell?", "The ratio of molecules reacting", "Bonded rotary units the balanced ratio."],
      ["Which law governs gas pressure and volume?", "PV = nRT (ideal gas law)", "The ideal gas law links P, V, n and T."]
    ], "mole=6.02e23, M=mol/L.", "Make it small, watch units."),
    { kind: "numeric", name: "mass from moles", difficulty: "medium",
      note: "mass = moles × molar mass.",
      q: (v) => `What mass is ${v.n} mol of a substance with molar mass ${v.m} g/mol?`,
      a: (v) => `${v.n * v.m} g`,
      e: (v) => `Mass = mol × molar mass = ${v.n} × ${v.m} = ${v.n * v.m} g.`,
      distract: (v) => { const c = v.n * v.m; return [`${c / 2} g`, `${(v.n + v.m).toFixed(1)} g`, `${c * 2} g`, `${(v.m / v.n).toFixed(1)} g`, `${c + 4} g`]; },
      vals: (rng) => ({ n: R(rng, 1, 10) / 2, m: R(rng, 18, 96) }),
      whyWrong: (v) => [`Multiply moles by molar mass; dividing or adding mismatches the unit.`],
      trick: "g = mol × g/mol.",
      tip: "Molar mass is grams per mole." },
    { kind: "numeric", name: "ideal gas volume STP", difficulty: "medium",
      note: "1 mol of an ideal gas is 22.4 L at STP.",
      q: (v) => `How many litres is ${v.n} mol of an ideal gas at STP (22.4 L/mol)?`,
      a: (v) => `${(v.n * 22.4).toFixed(1)} L`,
      e: (v) => `Volume = ${v.n} × 22.4 = ${(v.n * 22.4).toFixed(1)} L, using the standard molar volume.`,
      distract: (v) => { const c = v.n * 22.4; return [`${(c / 2).toFixed(1)} L`, `${(c * 2).toFixed(1)} L`, `${(v.n * 100).toFixed(1)} L`, `${(c + 4).toFixed(1)} L`, `${(v.n * 11).toFixed(1)} L`]; },
      vals: (rng) => ({ n: R(rng, 1, 10) / 2 }),
      whyWrong: (v) => [`Multiply moles by 22.4 L/mol; using the wrong molar volume distorts the answer.`],
      trick: "22.4 L/mol at STP.",
      tip: "STP is 0 °C and 1 atm." }
  ]
});

/* ---------------- ELECTRONICS ---------------- */
const electronics = gen(["electronics"], "Electronics — Semiconductors (Phase 11)", "electronics", {
  "Semiconductors": [
    ft("Semiconductor facts", [
      ["What is a semiconductor?", "Conductivity between metal and insulator", "Silicon and germanium are semiconductors."],
      ["Which element underlies most chips?", "Silicon", "Silicon crystals make the bulk of microchips."],
      ["What does a diode do?", "Allows current one way", "Diodes rectify AC to DC."],
      ["What does a transistor do?", "Amplify or switch signals", "Transistors build logic gates and amps."],
      ["Which dopant makes an N-type? ", "Pentavalent (Phosphorus)", "N-type frees extra electrons."],
      ["Which dopant yields P-type?", "Trivalent (Boron)", "P-type leaves positive holes."],
      ["What is a logic gate?", "A Boolean function circuit", "Gates compute AND, OR, NOT."]
    ], "diode=one-way, N↔P doping.", "Silicon rules."),
    { kind: "numeric", name: "gain of amplifier", difficulty: "easy",
      note: "Gain = output ÷ input.",
      q: (v) => `An amplifier outputs ${v.o} V for an input of ${v.i} V. What is the voltage gain?`,
      a: (v) => `${(v.o / v.i).toFixed(1)}`,
      e: (v) => `Gain = Vout/Vin = ${v.o} ÷ ${v.i} = ${(v.o / v.i).toFixed(1)}.`,
      distract: (v) => { const c = v.o / v.i; return [`${(c * 2).toFixed(1)}`, `${(v.i / v.o).toFixed(1)}`, `${(c * 0.5).toFixed(1)}`, `${(v.o - v.i).toFixed(1)}`, `${(c + 5).toFixed(1)}`]; },
      vals: (rng) => ({ o: R(rng, 2, 50), i: R(rng, 1, 10) }),
      whyWrong: (v) => [`Gain divides output by input; inverting yields the loss factor.`],
      trick: "Gain = Vout/Vin.",
      tip: "The voltage gain is rather unitless." }
  ]
});

/* ---------------- MECHATRONICS ---------------- */
const mechatronics = gen(["mechatronics"], "Mechatronics — Integrated Systems (Phase 11)", "mechatronics", {
  "Systems": [
    ft("Mechatronic facts", [
      ["What is mechatronics?", "Integration of mechanics, electronics and control", "Mechatronic systems blend hardware and software."],
      ["Which unit senses a physical quantity?", "Sensor", "Sensors convert physical signals to electric."],
      ["Which unit turns signals into motion?", "Actuator", "Actuators convert control signals to movement."],
      ["What is an example actuator?", "An electric motor", "Motors produce torque from electric input."],
      ["What does a closed-loop system use?", "Feedback from the output", "Feedback compares the output to command and adjusts."],
      ["What is a PLC?", "A programmable logic controller", "PLCs drive industrial automation."]
    ], "sensor=in, actuator=out.", "Mechatronics = M+E+CS."),
    { kind: "numeric", name: "gear ratio", difficulty: "medium",
      note: "driven ÷ driving teeth.",
      q: (v) => `The driving gear has ${v.d} teeth and the driven gear ${v.r} teeth. What is the gear ratio?`,
      a: (v) => `${(v.r / v.d).toFixed(2)}:1`,
      e: (v) => `Gear ratio = driven/driving = ${v.r}/${v.d} = ${(v.r / v.d).toFixed(2)}:1.`,
      distract: (v) => { const c = v.r / v.d; return [`${(v.d / v.r).toFixed(2)}:1`, `${(c * 2).toFixed(2)}:1`, `${(c * 0.5).toFixed(2)}:1`, `${(v.r + v.d).toFixed(1)}:1`, `${(c + 1).toFixed(2)}:1`]; },
      vals: (rng) => ({ d: R(rng, 12, 40), r: R(rng, 3 * (12 + 1), 120) }),
      whyWrong: (v) => [`Divide the driven teeth by the driving teeth; inverting gives the reversing ratio.`],
      trick: "ratio = driven / driving.",
      tip: "More driven teeth hold the speed reduction." }
  ]
});

/* ---------------- INDUSTRIAL ---------------- */
const industrial = gen(["industrial-eng"], "Industrial Engineering — Operations (Phase 11)", "industrial-eng", {
  "Operations": [
    ft("Industrial facts", [
      ["What is queuing theory for?", "Modelling waiting lines", "Queues are studied to reduce wait."],
      ["What is takt time?", "The pace needed to meet demand", "Takt time synchronises the production line."],
      ["What does TQM stand for?", "Total Quality Management", "TQM seeks continuous quality improvement."],
      ["What is Kaizen?", "Continuous small improvements", "Kaizen is on-going incremental change."],
      ["What is a process flowchart?", "A map of process steps", "Flowcharts map the production steps."],
      ["What is cycle time?", "The completion time for one unit", "Cycle time sets the line pace."]
    ], "TQM=quality, Kaizen=ki ", "operations management = flow + time."),
    { kind: "numeric", name: "cycle time", difficulty: "easy",
      note: "Cycle time = total time ÷ units.",
      q: (v) => `A line produces ${v.u} units in ${v.min} minutes. What is the cycle time per unit?`,
      a: (v) => `${(v.min / v.u).toFixed(1)} min/unit`,
      e: (v) => `Cycle time = ${v.min} ÷ ${v.u} = ${(v.min / v.u).toFixed(1)} minutes per unit.`,
      distract: (v) => { const c = v.min / v.u; return [`${(c * 2).toFixed(1)}`, `${(v.u / v.min).toFixed(1)} /min`, `${(c * 0.5).toFixed(1)}`, `${(c + 1).toFixed(1)}`, `${(c * 10).toFixed(1)}`]; },
      vals: (rng) => ({ u: 100 + R(rng, 0, 60) * 5, min: R(rng, 120, 480) }),
      whyWrong: (v) => [`The line time divided by units yields cycle time; dividing reverse gives the rate per minute.`],
      trick: "cycle = minutes ÷ units.",
      tip: "Beware inverting cycle time to rate." }
  ]
});

/* ---------------- ENVIRONMENTAL ---------------- */
const environ = gen(["environmental-eng"], "Environmental Engineering (Phase 11)", "environmental-eng", {
  "Environment": [
    ft("Environmental facts", [
      ["What is wastewater treatment?", "Removing pollutants before discharge", "Treatment protects water life."],
      ["Which gases intensify the greenhouse effect?", "Carbon dioxide and methane", "CO₂ and CH₄ trap heat."],
      ["What is a pollutant?", "A harmful substance in the environment", "Pollutants degrade air, soil and water."],
      ["Which energy sources are renewable?", "Solar, wind and hydro", "Renewables replenish over time."],
      ["What is a decibel used for?", "Measuring sound level", "Decibels scale the sound pressure."],
      ["What does BOD measure?", "The organic pollution load of water", "BOD shows the biological oxygen demand."]
    ], "waste=clean, CO2 = heat, BOD = organic pollution", "greenhouse = retention or energy."),
    { kind: "numeric", name: "BOD removal efficiency", difficulty: "medium",
      note: "Removal % = (in − out) ÷ in × 100.",
      q: (v) => `Influent BOD is ${v.inB} mg/L and effluent ${v.outB} mg/L. What is the removal percent?`,
      a: (v) => `${(100 * (v.inB - v.outB) / v.inB).toFixed(1)}%`,
      e: (v) => `Removal = (${v.inB} − ${v.outB}) ÷ ${v.inB} × 100 = ${(100 * (v.inB - v.outB) / v.inB).toFixed(1)}%.`,
      distract: (v) => { const c = 100 * (v.inB - v.outB) / v.inB; return [`${(c + 10).toFixed(1)}%`, `${(100 * v.outB / v.inB).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 4).toFixed(1)}%`]; },
      vals: (rng) => ({ inB: R(rng, 150, 400), outB: R(rng, 5, 40) }),
      whyWrong: (v) => [`Divide the BOD removed by the influent; the effluent fraction is a distractor and the removal is 100 − the treated fraction.`],
      trick: "Removal = (in−out)/in × 100.",
      tip: "Efficient % compares removed to input." }
  ]
});

/* ---------------- TELECOM ---------------- */
const telecom = gen(["telecommunication"], "Telecommunication Engineering (Phase 11)", "telecommunication", {
  "Telecom": [
    ft("Telecom facts", [
      ["What signals travel on optical fibre?", "Light pulses", "Fibre transmits data as light pulses."],
      ["What is modulation?", "Encoding data onto a carrier", "Modulation puts information on the carrier."],
      ["What is bandwidth?", "The frequency range of a channel", "Bandwidth determines the data rate."],
      ["Which is a short-range wireless standard?", "Bluetooth", "Bluetooth links devices at short distances."],
      ["What does the physical layer do?", "Transmits raw bits", "Physical layer moves raw bits."],
      ["What is full duplex?", "Both directions simultaneously", "Full duplex transmits both ways."]
    ], "fibre=light, mod=carrier, duplex = both ways.", "Telecom: physical layer."),
    { kind: "numeric", name: "wavelength frequency", difficulty: "medium",
      note: "v = f × λ; c = 3×10⁸ m/s.",
      q: (v) => `A signal has frequency ${v.f} GHz. Use c = 3×10⁸ m/s; what is the wavelength in cm?`,
      a: (v) => `${((300 / v.f) * 1).toFixed(2)} cm`,
      e: (v) => `λ = c/f = 3×10⁸ ÷ (${v.f}×10⁹) = ${((300 / v.f)).toFixed(2)} cm.`,
      distract: (v) => { const c = 300 / v.f; return [`${(c * 2).toFixed(1)} cm`, `${(c / 2).toFixed(2)} cm`, `${(c * 4).toFixed(1)} cm`, `${(c + 5).toFixed(1)} cm`, `${(v.f * 2).toFixed(1)} cm`]; },
      vals: (rng) => ({ f: R(rng, 1, 6) }),
      whyWrong: (v) => [`λ = c/f; higher frequency gives shorter wavelength, so a low multiple error reverses the trend.`],
      trick: "wavelength = 30/f freq in GHz.",
      tip: "In GHz, 30/f gives cm." },

    { kind: "numeric", name: "channel capacity shannon", difficulty: "medium",
      note: "C = B × log₂(1 + SNR).",
      q: (v) => `A channel has bandwidth ${v.bw} MHz and SNR ${v.snr}. What is the capacity in Mbps (C = B log₂(1+SNR))?`,
      a: (v) => `${(v.bw * Math.log2(1 + v.snr)).toFixed(1)} Mbps`,
      e: (v) => `Capacity = ${v.bw} × log₂(1 + ${v.snr}) = ${(v.bw * Math.log2(1 + v.snr)).toFixed(1)} Mbps, applying Shannon-Hartley theorem.`,
      distract: (v) => { const c = v.bw * Math.log2(1 + v.snr); return [`${(c * 2).toFixed(1)} Mbps`, `${(c / 2).toFixed(1)} Mbps`, `${(v.bw * v.snr).toFixed(1)} Mbps`, `${(c + 10).toFixed(1)} Mbps`, `${(v.bw + v.snr).toFixed(1)} Mbps`]; },
      vals: (rng) => ({ bw: R(rng, 1, 100), snr: R(rng, 1, 1000) }),
      whyWrong: (v) => [`Use Shannon formula C = B log₂(1+SNR); multiplying B×SNR ignores the logarithm.`],
      trick: "capacity = B × log₂(1+SNR).",
      tip: "Higher SNR increases capacity logarithmically." },

    { kind: "numeric", name: "bit error rate", difficulty: "easy",
      note: "BER = errors ÷ total bits transmitted.",
      q: (v) => `In a ${v.bits}-bit transmission, ${v.err} bit errors were detected. What is the bit error rate?`,
      a: (v) => `${(v.err / v.bits).toExponential(1)}`,
      e: (v) => `BER = ${v.err} ÷ ${v.bits} = ${(v.err / v.bits).toExponential(1)}, dividing error count by total bits.`,
      distract: (v) => { const c = v.err / v.bits; return [`${(c * 10).toExponential(1)}`, `${(c / 10).toExponential(1)}`, `${(v.bits / v.err).toExponential(1)}`, `${c.toExponential(1)}`, `${(c * 100).toExponential(1)}`]; },
      vals: (rng) => ({ bits: R(rng, 1000, 1000000), err: R(rng, 1, 100) }),
      whyWrong: (v) => [`Divide errors by total bits; inverting gives bits per error, not error rate.`],
      trick: "BER = errors / total bits.",
      tip: "Typical BER targets: 10⁻⁶ to 10⁻⁹." }
  ]
});

/* ---------------- TEXTILE ---------------- */
const textile = makeKbGen({
  subjects: ["textile-engineering"],
  chapter: "Textile Engineering (Phase 11)",
  tags: ["textile-engineering", "deep-kb"],
  topics: {
    "Textiles": [
      ft("textile facts", [
        ["Which fibres are obtained from animals?", "Wool and silk", "Wool is sheared sheep fleece and silk is worm spun."],
        ["Which is a plant natural fibre?", "Cotton", "Cotton, flax and jute are plant fibres."],
        ["How is yarn made?", "By spinning fibres together", "Spinning twists the fibre mass into yarn."],
        ["Which operation creates fabric?", "Weaving or knitting", "Weaving interlaces warp and weft yarns."],
        ["What is a warp thread?", "The lengthwise yarn in a loom", "Warp runs the long direction of fabric."],
        ["What is a weft thread?", "The crosswise yarn in a loom", "Weft in the width direction is carried by the shuttle."]
      ],
        "Spinning→yarn, weaving→fabric.", "Fibre to fabric chain."),
      { kind: "numeric", name: "fabric ends per inch", difficulty: "medium",
        note: "ends per inch = number of warp yarns in one inch.",
        q: (v) => `A fabric has ${v.w} warp yarns across ${v.wi} inches of width. What is the ends-per-inch?`,
        a: (v) => `${(v.w / v.wi).toFixed(1)} EPI`,
        e: (v) => `EPI = ${v.w} ÷ ${v.wi} = ${(v.w / v.wi).toFixed(1)}, the warp count per inch of width.`,
        distract: (v) => { const c = v.w / v.wi; return [`${(c * 2).toFixed(1)} EPI`, `${(c / 2).toFixed(1)} EPI`, `${(v.w * 2).toFixed(1)} EPI`, `${(c * 1.5).toFixed(1)} EPI`, `${(c + 4).toFixed(1)} EPI`]; },
        vals: (rng) => ({ w: R(rng, 200, 1800), wi: 20 }),
        whyWrong: (v) => [`Divide warp ends by the inch; a direct total or doubling misreads the per-inch density.`],
        trick: "EPI = warp ends ÷ inches.",
        tip: "Fabric density determines its hand." }
    ]
  }
});

module.exports = [civil, electrical, mechanical, chemical, electronics, mechatronics, industrial, environ, telecom, textile];
