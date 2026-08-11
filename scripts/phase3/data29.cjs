const { writeFile } = require("./gen-helper.cjs");

const ENG = [
  /* computer engineering */
  ["computer-engineering", "Logic Gates", "easy", "Which gate outputs 1 only when ALL inputs are 1?", ["AND", "OR", "NOT", "XOR"], "A", "The AND gate outputs 1 only when every input is 1.", ["logic-gates"]],
  ["computer-engineering", "Logic Gates", "easy", "An OR gate outputs 1 when:", ["at least one input is 1", "all inputs are 0", "exactly one input is 0", "inputs alternate"], "A", "OR returns 1 if any input is 1.", ["logic-gates"]],
  ["computer-engineering", "Logic Gates", "medium", "The NAND gate is the negation of:", ["AND", "OR", "XOR", "NOR"], "A", "NAND = NOT (AND); it is functionally complete alone.", ["logic-gates"]],
  ["computer-engineering", "Boolean Algebra", "medium", "According to De Morgan's laws, NOT(A AND B) equals:", ["(NOT A) OR (NOT B)", "(NOT A) AND (NOT B)", "A OR B", "NOT (A OR B)"], "A", "De Morgan: NOT(A AND B) = NOT A OR NOT B.", ["boolean"]],
  ["computer-engineering", "Processor & Memory", "easy", "Which unit performs arithmetic operations in a CPU?", ["ALU", "RAM", "Cache", "BIOS"], "A", "The Arithmetic Logic Unit executes arithmetic and logic operations.", ["cpu"]],
  ["computer-engineering", "Processor & Memory", "medium", "Registers are located:", ["inside the CPU", "on the hard disk", "in RAM", "on the network"], "A", "Registers are the fastest storage, inside the processor.", ["cpu", "registers"]],
  ["computer-engineering", "I/O Systems", "medium", "DMA stands for:", ["Direct Memory Access", "Digital Memory Array", "Data Management Application", "Direct Modem Access"], "A", "DMA lets devices transfer data to memory without CPU involvement per byte.", ["io"]],
  ["computer-engineering", "Microcontrollers", "medium", "A microcontroller typically integrates:", ["CPU, memory and peripherals on one chip", "only a display", "only a power supply", "a hard disk"], "A", "Microcontrollers bundle processor, RAM/ROM and I/O peripherals.", ["embedded"]],
  ["computer-engineering", "Embedded Programming", "medium", "Which language dominates low-level embedded programming?", ["C", "HTML", "SQL", "CSS"], "A", "C (and C++) is standard for embedded and firmware development.", ["embedded"]],
  /* civil engineering top-ups */
  ["civil-eng", "Surveying Methods", "medium", "The instrument used to measure horizontal and vertical angles in surveying is:", ["theodolite", "compass only", "level only", "ruler"], "A", "A theodolite measures angles precisely; levels measure heights.", ["surveying"]],
  ["civil-eng", "Concrete & Steel", "medium", "The standard test for concrete workability is the:", ["slump test", "tensile test", "paint test", "noise test"], "A", "The slump test measures fresh concrete's workability.", ["concrete"]],
  ["civil-eng", "Concrete & Steel", "hard", "A beam that resists bending with its top flange in compression and bottom in tension is:", ["an I-section beam", "a rope", "a column only", "a pile"], "A", "I-sections efficiently resist bending with material far from the neutral axis.", ["structures"]],
  /* mechanical */
  ["mechanical-eng", "Heat Engines", "easy", "The first law of thermodynamics is a statement of:", ["energy conservation", "entropy increase", "heat death", "momentum"], "A", "The first law: energy cannot be created or destroyed.", ["thermodynamics"]],
  ["mechanical-eng", "Heat Engines", "medium", "Which cycle is the ideal cycle for spark-ignition engines?", ["Otto cycle", "Carnot only", "Rankine", "Diesel only"], "A", "The Otto cycle models petrol (spark-ignition) engines.", ["thermo"]],
  ["mechanical-eng", "Engineering Materials", "medium", "Strain is defined as:", ["deformation divided by original length", "force per unit area", "mass per unit volume", "work done per second"], "A", "Strain is the ratio of change in length to the original length and is dimensionless.", ["mechanics"]],
  ["mechanical-eng", "Engineering Materials", "medium", "Which process uses a rotating wheel to remove material?", ["grinding", "casting", "forging", "welding"], "A", "Grinding uses an abrasive rotating wheel; casting pours molten metal.", ["manufacturing"]],
  /* electrical */
  ["electrical-eng", "Circuit Laws", "easy", "Ohm's law states:", ["V = IR", "P = VI only", "V = I/R", "I = VR"], "A", "Voltage equals current times resistance.", ["circuits"]],
  ["electrical-eng", "Circuit Laws", "easy", "In a series circuit, the same ___ flows through every element.", ["current", "voltage", "power", "resistance"], "A", "Series elements share current; parallel elements share voltage.", ["circuits"]],
  ["electrical-eng", "Transformers & Motors", "medium", "In Pakistan's national grid, transmission voltage typically used is:", ["132 kV and 220 kV", "5 V", "12 V", "1 kV only"], "A", "Pakistan's grid uses 132 kV and 220 kV (and 500 kV) transmission lines.", ["power"]],
  ["electrical-eng", "Transformers & Motors", "medium", "A transformer changes:", ["voltage levels using electromagnetic induction", "frequency", "power", "phase"], "A", "Transformers step voltage up or down via induction, keeping frequency and power.", ["machines"]],
  /* software engineering */
  ["software-eng", "SDLC Models", "easy", "SDLC stands for:", ["Software Development Life Cycle", "System Data Link Control", "Software Design Logic Cycle", "System Development Life Code"], "A", "SDLC is the process of planning, building and maintaining software.", ["sdlc"]],
  ["software-eng", "SDLC Models", "medium", "Which model handles changing requirements through repeated cycles?", ["Agile/iterative", "Waterfall only", "V-model only", "Spiral only"], "A", "Agile and iterative models revisit requirements in short cycles.", ["agile"]],
  ["software-eng", "Testing & Management", "medium", "Testing that verifies the whole system works together is:", ["integration testing", "unit testing only", "code review", "compilation"], "A", "Integration testing checks combined modules; unit tests check single units.", ["testing"]],
  ["software-eng", "Testing & Management", "hard", "The Singleton pattern ensures:", ["a class has only one instance", "a class has many instances", "objects are immutable", "fast sorting"], "A", "Singleton restricts instantiation to one object.", ["patterns"]]
];

writeFile("29-engineering.json", ENG);
