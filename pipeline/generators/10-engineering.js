/* ============================================================
   Generator file 10 — Engineering subjects
   ============================================================ */
"use strict";
const L = require("../lib.js");
const ri = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const r2 = (x) => Math.round(x * 100) / 100;

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
  makeGen("civil-eng", "Civil Engineering — Core", {
    "Materials": [
      ["Which material is the most used in construction?", "Concrete", "Concrete is the world's most used building material."],
      ["What is cement mainly made of?", "Limestone and clay", "Clinker from limestone and clay is ground into cement."],
      ["Which material resists tension best in reinforced concrete?", "Steel", "Steel bars carry tensile loads in RCC members."],
      ["What is a beam?", "a horizontal load-bearing member", "Beams carry loads across spans."],
      ["What is a column?", "a vertical compression member", "Columns transfer loads to foundations."],
      ["What is a foundation?", "the base transferring loads to soil", "Foundations spread building loads safely."],
      ["What is mortar?", "a mix of cement, sand and water", "Mortar binds bricks and blocks."],
      ["What is a slab?", "a flat horizontal structural element", "Slabs form floors and roofs."],
      ["What is a brick?", "a fired clay building unit", "Bricks form walls and partitions."],
      ["What is a pile?", "a deep foundation element", "Piles carry loads into deeper soils."]
    ],
    "Surveying": [
      ["Which instrument measures horizontal angles?", "Theodolite", "Theodolites measure angles precisely."],
      ["Which instrument measures height differences?", "Level", "Levels and staffs measure elevation differences."],
      ["What is a benchmark?", "a point of known elevation", "Benchmarks anchor survey levels."],
      ["What is contouring?", "mapping equal-elevation lines", "Contours show terrain shape."],
      ["Which unit measures angles in surveying?", "Degrees (or grades)", "Angles are measured in degrees, minutes, seconds."],
      ["What is a plan?", "a horizontal view of a site", "Plans show layout to scale."],
      ["What is a section?", "a vertical cut view", "Sections reveal heights and slopes."],
      ["What is a datum?", "a reference surface for levels", "Datums define zero elevation."]
    ]
  }),
  makeGen("mechanical-eng", "Mechanical Engineering — Core", {
    "Thermodynamics": [
      ["What is the first law of thermodynamics?", "energy conservation", "Energy can change form but cannot be created or destroyed."],
      ["What is the second law about?", "entropy and heat flow direction", "Heat flows from hot to cold spontaneously."],
      ["Which device converts heat to work?", "Heat engine", "Engines convert thermal energy into mechanical work."],
      ["What is entropy?", "a measure of disorder", "Entropy tends to increase in isolated systems."],
      ["What is a Carnot cycle?", "the ideal heat engine cycle", "Carnot efficiency is the maximum possible."],
      ["Which unit measures heat?", "Joule (or calorie)", "Heat energy is measured in joules."],
      ["What is specific heat?", "heat needed per unit mass per degree", "Specific heat characterises a substance's heat capacity."],
      ["What is a boiler?", "a device producing steam", "Boilers feed steam engines and turbines."],
      ["What is a turbine?", "a rotating energy converter", "Turbines extract work from steam, gas or water."],
      ["What is a piston?", "a sliding component in cylinders", "Pistons convert pressure into motion."]
    ],
    "Mechanics": [
      ["What is stress?", "force per unit area", "Stress = F/A and causes strain."],
      ["What is strain?", "deformation per unit length", "Strain measures relative change in size."],
      ["What is Young's modulus?", "the ratio of stress to strain", "E measures material stiffness."],
      ["What is a gear?", "a toothed wheel transmitting motion", "Gears change speed and torque."],
      ["What is a bearing?", "a support reducing friction", "Bearings support rotating shafts."],
      ["What is torque?", "a turning force", "Torque = force × lever arm."],
      ["What is a lever?", "a rigid bar on a fulcrum", "Levers multiply force or distance."],
      ["What is friction?", "resistance between contacting surfaces", "Friction opposes relative motion."],
      ["What is a spring?", "an elastic energy store", "Springs store energy and absorb shock."],
      ["What is a shaft?", "a rotating power-transmitting element", "Shafts carry torque between components."]
    ]
  }),
  makeGen("electrical-eng", "Electrical Engineering — Core", {
    "Circuit Laws": [
      ["What is Ohm's law?", "V = IR", "Voltage equals current times resistance."],
      ["Which law states that current splits at junctions?", "Kirchhoff's current law", "KCL: current entering a node equals current leaving."],
      ["Which law describes voltage around a loop?", "Kirchhoff's voltage law", "KVL: the sum of voltages around a loop is zero."],
      ["What is the unit of inductance?", "Henry", "Inductance is measured in henries (H)."],
      ["What is the unit of capacitance?", "Farad", "Capacitance is measured in farads (F)."],
      ["What is AC?", "alternating current", "AC reverses direction periodically."],
      ["What is DC?", "direct current", "DC flows in one constant direction."],
      ["Which device stores charge?", "Capacitor", "Capacitors store energy in an electric field."],
      ["Which device stores energy magnetically?", "Inductor", "Inductors store energy in a magnetic field."],
      ["What is frequency in Pakistan's grid?", "50 Hz", "Pakistan's AC supply runs at 50 Hz."],
      ["What is a transformer?", "a voltage-changing device", "Transformers step voltage up or down via induction."],
      ["What is a generator?", "a machine converting motion to electricity", "Generators produce electricity from rotation."],
      ["What is a motor?", "a machine converting electricity to motion", "Motors drive machines from electric power."],
      ["What is power factor?", "the ratio of real to apparent power", "Low power factor wastes capacity."],
      ["What is a short circuit?", "an unintended low-resistance path", "Short circuits cause excessive current."]
    ],
    "Power Systems": [
      ["Which voltage is used for home supply in Pakistan?", "220 V", "Standard household voltage is about 220 V AC."],
      ["What is a substation?", "a facility changing voltage levels", "Substations step voltage for distribution."],
      ["Which conductor carries transmission lines?", "Aluminium (ACSR)", "ACSR cables balance strength and weight."],
      ["What is a fuse?", "a protective current-breaking device", "Fuses melt to interrupt overcurrent."],
      ["What is a circuit breaker?", "a reusable protective switch", "Breakers trip on faults and reset."],
      ["What is earthing?", "connecting equipment to ground", "Earthing protects from electric shock."],
      ["What is a power plant?", "a facility generating electricity", "Thermal, hydro and nuclear plants generate power."],
      ["What is load shedding?", "planned power cuts", "Load shedding balances supply and demand."],
      ["What is a smart meter?", "an advanced consumption meter", "Smart meters report usage digitally."],
      ["What is grid frequency control?", "matching generation to load", "Frequency stays near 50 Hz when balanced."]
    ]
  }),
  makeGen("chemical-eng", "Chemical Engineering — Core", {
    "Processes": [
      ["What is a chemical reactor?", "a vessel for chemical reactions", "Reactors convert reactants to products."],
      ["What is distillation?", "separation by boiling point", "Distillation separates liquid mixtures."],
      ["What is a catalyst?", "a substance accelerating a reaction", "Catalysts speed reactions without being consumed."],
      ["What is a heat exchanger?", "a device transferring heat between fluids", "Exchangers heat or cool process streams."],
      ["What is mass transfer?", "movement of material between phases", "Absorption and extraction rely on mass transfer."],
      ["What is a pump?", "a device moving liquids", "Pumps add energy to transport fluids."],
      ["What is a valve?", "a flow-control device", "Valves regulate flow and pressure."],
      ["What is filtration?", "separating solids from liquids", "Filters trap solids on a medium."],
      ["What is a yield?", "the amount of product obtained", "Yield measures process efficiency."],
      ["What is a feed stream?", "the input to a process", "Feeds enter reactors or separators."]
    ]
  }),
  makeGen("software-eng", "Software Engineering — Process (Eng)", {
    "Development": [
      ["What is the waterfall model?", "sequential development phases", "Each phase completes before the next begins."],
      ["What is Agile development?", "iterative incremental delivery", "Agile adapts to change in short cycles."],
      ["What is a requirement?", "a needed capability", "Requirements drive design and testing."],
      ["What is software architecture?", "the high-level system structure", "Architecture defines components and interactions."],
      ["What is a module?", "a unit of code with a role", "Modules break systems into manageable parts."],
      ["What is testing?", "verifying software quality", "Testing detects defects before release."],
      ["What is deployment?", "releasing software to users", "Deployment installs and activates the product."],
      ["What is maintenance?", "updating software after release", "Maintenance fixes bugs and adds features."],
      ["What is a use case?", "a scenario of system use", "Use cases capture user goals."],
      ["What is an API?", "an interface between software", "APIs expose functions to other programs."],
      ["What is a database?", "an organised data store", "Databases persist and query application data."],
      ["What is version control?", "tracking code changes", "Git is the leading version control system."]
    ]
  }),
  makeGen("computer-engineering", "Computer Engineering — Hardware", {
    "Hardware": [
      ["Which unit executes instructions?", "CPU", "The CPU fetches, decodes and executes instructions."],
      ["What is a register?", "a small fast storage in the CPU", "Registers hold data during processing."],
      ["What is the clock speed?", "the CPU's cycle rate", "Clock speed is measured in GHz."],
      ["What is a motherboard?", "the main circuit board", "The motherboard connects all components."],
      ["What is RAM?", "fast volatile memory", "RAM holds running programs and data."],
      ["What is ROM?", "permanent read-only memory", "ROM stores firmware like the BIOS."],
      ["What is a GPU?", "a graphics processing unit", "GPUs accelerate graphics and parallel math."],
      ["What is a bus?", "a data pathway between parts", "Buses link CPU, memory and devices."],
      ["What is firmware?", "software stored in hardware", "Firmware boots and controls devices."],
      ["What is an embedded system?", "a computer inside a device", "Embedded systems run appliances and machines."],
      ["What is a microcontroller?", "a computer on one chip", "Microcontrollers drive small devices."],
      ["What is a peripheral?", "an external device", "Printers and keyboards are peripherals."]
    ]
  }),
  makeGen("electronics", "Electronics — Devices", {
    "Components": [
      ["Which device allows current one way?", "Diode", "Diodes conduct in the forward direction only."],
      ["Which device amplifies signals?", "Transistor", "Transistors amplify and switch electronic signals."],
      ["Which device stores charge?", "Capacitor", "Capacitors store energy electrostatically."],
      ["Which device resists current?", "Resistor", "Resistors limit and divide current."],
      ["What is a circuit?", "a closed path for current", "Circuits connect components for a function."],
      ["What is a PCB?", "a printed circuit board", "PCBs mount and connect components."],
      ["What is an IC?", "an integrated circuit", "ICs pack many transistors on one chip."],
      ["What is a sensor?", "a device converting physical signals", "Sensors detect temperature, light and motion."],
      ["What is an actuator?", "a device converting signals to motion", "Actuators move valves, motors and flaps."],
      ["What is an oscilloscope?", "an instrument displaying waveforms", "Scopes measure voltage over time."],
      ["What is a signal?", "information carried electrically", "Signals are analog or digital."],
      ["What is an amplifier?", "a circuit increasing signal strength", "Amplifiers boost weak signals."]
    ]
  }),
  makeGen("mechatronics", "Mechatronics — Integration", {
    "Concepts": [
      ["What is mechatronics?", "integration of mechanics and electronics", "Mechatronics combines mechanical, electronic and software systems."],
      ["What is a servo motor?", "a position-controlled motor", "Servos hold precise angles in machines."],
      ["What is a PLC?", "a programmable logic controller", "PLCs automate industrial processes."],
      ["What is a robot?", "a programmable machine", "Robots perform tasks with sensors and actuators."],
      ["What is automation?", "machines operating without human input", "Automation boosts speed and consistency."],
      ["What is a sensor in a control loop?", "a device measuring the process", "Sensors feed feedback to controllers."],
      ["What is feedback control?", "correcting output from measurements", "Closed loops adjust to match targets."],
      ["What is an actuator?", "the output element of a system", "Actuators move mechanisms per control signals."],
      ["What is CAD?", "computer-aided design", "CAD software models parts in 3D."],
      ["What is CAM?", "computer-aided manufacturing", "CAM drives machines from CAD models."],
      ["What is a microcontroller used for in mechatronics?", "controlling embedded devices", "Microcontrollers run control logic."],
      ["What is a conveyor?", "a moving transport system", "Conveyors move products in factories."]
    ]
  }),
  makeGen("industrial-eng", "Industrial Engineering — Systems", {
    "Production": [
      ["What is industrial engineering about?", "optimising processes and systems", "Industrial engineering improves efficiency."],
      ["What is a production line?", "a sequence of workstations", "Lines assemble products in steps."],
      ["What is quality control?", "ensuring products meet standards", "QC checks and corrects defects."],
      ["What is a process flow?", "the sequence of operations", "Flow charts map production steps."],
      ["What is a bottleneck?", "the slowest step in a process", "Bottlenecks limit overall output."],
      ["What is inventory?", "stored materials and goods", "Inventory balances supply and demand."],
      ["What is a supply chain?", "the network from supplier to customer", "Supply chains source, make and deliver."],
      ["What is productivity?", "output per input unit", "Productivity measures efficiency."],
      ["What is lean manufacturing?", "waste-free production", "Lean removes waste to add value."],
      ["What is a Kaizen?", "continuous improvement", "Kaizen makes small steady improvements."],
      ["What is ergonomics?", "designing work for people", "Ergonomics reduces strain and injury."],
      ["What is a work study?", "analysing work methods", "Work study improves method and time."]
    ]
  }),
  makeGen("environmental-eng", "Environmental Engineering — Systems", {
    "Environmental Systems": [
      ["What does environmental engineering cover?", "protecting the environment", "It designs water, waste and air systems."],
      ["What is wastewater treatment?", "cleaning used water", "Treatment removes contaminants before discharge."],
      ["What is a water treatment plant?", "a facility purifying water", "Plants make water safe to drink."],
      ["What is an effluent?", "liquid waste discharged", "Effluents must be treated before release."],
      ["What is air pollution control?", "reducing harmful emissions", "Scrubbers and filters clean stack gases."],
      ["What is solid waste management?", "handling and disposing of waste", "Waste is collected, recycled or landfilled."],
      ["What is recycling?", "reprocessing materials", "Recycling conserves resources."],
      ["What is a landfill?", "a waste disposal site", "Landfills bury waste with controls."],
      ["What is a pollutant?", "a harmful substance in the environment", "Pollutants damage air, water or soil."],
      ["What is sustainability?", "meeting needs without harming the future", "Sustainability balances economy, society and environment."],
      ["What is EIA?", "environmental impact assessment", "EIAs evaluate project effects before approval."],
      ["What is a carbon footprint?", "total greenhouse emissions", "Footprints measure climate impact."]
    ]
  })
];
