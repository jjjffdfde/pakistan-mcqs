/* ============================================================
   Phase 11 — KB Computer Science Core:
   programming-fundamentals, algorithms, data-structures,
   digital-logic, compiler-design, computer-graphics,
   distributed-systems, system-design.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

/* ---------------- PROGRAMMING FUNDAMENTALS ---------------- */
const progFund = {
  subjects: ["programming-fundamentals"],
  chapter: "Programming Fundamentals (Phase 11)",
  tags: ["programming-fundamentals", "deep-kb"],
  topics: {
    "Core Concepts": [
      { kind: "fact", name: "programming basics", facts: [
        ["What is a variable?", "A named storage location in memory", "Variables hold data that can change during execution."],
        ["What is a constant?", "A value that cannot change after assignment", "Constants protect values from accidental modification."],
        ["What is a loop?", "A construct that repeats a block of code", "Loops iterate until a condition becomes false."],
        ["What is a function?", "A reusable block of code that takes input and returns output", "Functions encapsulate logic and promote reuse."],
        ["What is an array?", "An ordered collection of elements", "Arrays store elements at indexed positions."],
        ["What is recursion?", "A function that calls itself", "Recursion breaks problems into smaller identical subproblems."],
        ["What is a conditional statement?", "A block that executes based on a Boolean test", "If-else branches control execution paths."],
        ["What is a syntax error?", "Code that violates the language grammar", "Syntax errors prevent compilation or interpretation."]
      ],
        trick: "var=changeable, const=fixed, loop=repeats, func=reuses.",
        tip: "These 8 concepts are the skeleton of every language." },

      { kind: "pair", name: "concept and term", a: "concept", b: "keyword or symbol",
        pairs: [["Loop", "for/while"], ["Conditional", "if/else"], ["Function", "def/fn"], ["Return", "return"],
          ["Array index", "[] bracket"], ["Assignment", "="], ["Equality test", "=="], ["Comment", "// or #"]],
        outsiders: ["++ increment"],
        trick: "loop=for, cond=if, func=def.",
        tip: "Language keywords map directly to these structures." }
    ],
    "Data Types": [
      { kind: "list", name: "primitive types", group: "primitive data type",
        items: ["Integer", "Float", "String", "Boolean", "Character", "Void", "Null"],
        outsiders: ["Array type", "Object type"],
        tip: "Primitives are the building blocks of composite types." },

      { kind: "numeric", name: "byte count", difficulty: "easy",
        note: "Bytes = bits ÷ 8.",
        q: (v) => `A data type uses ${v.b} bits. How many bytes is that?`,
        a: (v) => `${v.b / 8}`,
        e: (v) => `Bytes = ${v.b} ÷ 8 = ${v.b / 8}, because one byte equals 8 bits.`,
        distract: (v) => { const c = v.b / 8; return [`${v.b * 8}`, `${v.b + 8}`, `${c * 2}`, `${c / 2}`, `${v.b - 8}`]; },
        vals: (rng) => ({ b: R(rng, 8, 128) }),
        whyWrong: (v) => [`Divide bits by 8 to get bytes; multiplying reverses the conversion.`],
        trick: "1 byte = 8 bits.",
        tip: "Memory sizes are always powers of 2." }
    ]
  }
};

/* ---------------- ALGORITHMS ---------------- */
const algorithms = {
  subjects: ["algorithms"],
  chapter: "Algorithms (Phase 11)",
  tags: ["algorithms", "deep-kb"],
  topics: {
    "Complexity and Sorting": [
      { kind: "fact", name: "algorithm facts", facts: [
        ["What is Big-O notation?", "An upper bound on time complexity", "Big-O describes how runtime grows with input size."],
        ["What is the time complexity of binary search?", "O(log n)", "Binary search halves the search space each step."],
        ["What is the worst-case complexity of bubble sort?", "O(n²)", "Bubble sort compares each pair of adjacent elements."],
        ["What is a hash table?", "A structure mapping keys to values via a hash function", "Hash tables give average O(1) lookup."],
        ["What is a greedy algorithm?", "It makes the locally optimal choice at each step", "Greedy works when local optimum yields global optimum."],
        ["What is dynamic programming?", "Solving subproblems and combining results", "DP avoids redundant work by storing subproblem solutions."],
        ["What is a graph?", "A set of vertices connected by edges", "Graphs model relationships and networks."],
        ["What is BFS?", "Breadth-first search explores level by level", "BFS uses a queue to visit neighbours first."]
      ],
        trick: "binary=search O(log n), bubble=sort O(n²).",
        tip: "Big-O pairs and their complexities are exam staples." },

      { kind: "pair", name: "algorithm and complexity", a: "algorithm", b: "worst-case complexity",
        pairs: [["Binary search", "O(log n)"], ["Linear search", "O(n)"], ["Merge sort", "O(n log n)"],
          ["Bubble sort", "O(n²)"], ["Insertion sort", "O(n²)"], ["Quick sort", "O(n²) worst, O(n log n) average"]],
        outsiders: ["O(1)"],
        trick: "merge=n log n, bubble=insertion=quick worst=n².",
        tip: "Know the complexity families by heart." },

      { kind: "numeric", name: "binary search steps", difficulty: "easy",
        note: "Max steps = ceil(log2(N)).",
        q: (v) => `A sorted array has ${v.n} elements. What is the maximum number of comparisons in binary search?`,
        a: (v) => `${Math.ceil(Math.log2(v.n))}`,
        e: (v) => `Max steps = ceil(log₂(${v.n})) = ${Math.ceil(Math.log2(v.n))}, because binary search halves the array each step.`,
        distract: (v) => { const c = Math.ceil(Math.log2(v.n)); return [`${v.n}`, `${Math.floor(v.n / 2)}`, `${c * 2}`, `${c + 3}`, `${Math.max(1, c - 2)}`]; },
        vals: (rng) => ({ n: R(rng, 10, 100000) }),
        whyWrong: (v) => [`Binary search needs log2(N) steps; dividing by 2 or using N gives linear or constant steps.`],
        trick: "max steps = ceil(log2 N).",
        tip: "Each step cuts the remaining search space in half." }
    ]
  }
};

/* ---------------- DATA STRUCTURES ---------------- */
const dataStructures = {
  subjects: ["data-structures"],
  chapter: "Data Structures (Phase 11)",
  tags: ["data-structures", "deep-kb"],
  topics: {
    "Linear and Non-Linear": [
      { kind: "fact", name: "DS facts", facts: [
        ["What is a stack?", "A last-in-first-out structure", "Stacks push and pop from the top."],
        ["What is a queue?", "A first-in-first-out structure", "Queues enqueue at rear and dequeue from front."],
        ["What is a linked list?", "A chain of nodes with pointers", "Linked lists allow efficient insertion and deletion."],
        ["What is a binary tree?", "A tree where each node has at most two children", "Binary trees support search, insert and delete."],
        ["What is a heap?", "A complete binary tree with ordering property", "Heaps find min/max in O(1)."],
        ["What is a graph adjacency list?", "An array of lists of neighbours", "Adjacency lists use less space for sparse graphs."],
        ["What is a priority queue?", "A queue where elements dequeue by priority", "Priority queues are often implemented with heaps."],
        ["What is a hash map?", "An array indexed by a hash of the key", "Hash maps give O(1) average-case operations."]
      ],
        trick: "stack=LIFO, queue=FIFO, heap=min/max.",
        tip: "Stacks and queues appear in every programming exam." },

      { kind: "pair", name: "structure and operation time", a: "structure", b: "average lookup",
        pairs: [["Array", "O(1) index, O(n) search"], ["Linked list", "O(n)"], ["Binary search tree", "O(log n)"],
          ["Hash table", "O(1)"], ["Heap", "O(1) min/max"], ["Stack", "O(1) top"]],
        outsiders: ["O(n²)"],
        trick: "array=index O(1), hash=O(1), BST=log n.",
        tip: "Operation-time pairs define the right data structure." },

      { kind: "numeric", name: "array index offset", difficulty: "easy",
        note: "Address = base + index × element_size.",
        q: (v) => `Base address of an array is ${v.base} and element size is ${v.size} bytes. What is the address of element at index ${v.idx}?`,
        a: (v) => `${v.base + v.idx * v.size}`,
        e: (v) => `Address = ${v.base} + (${v.idx} × ${v.size}) = ${v.base + v.idx * v.size}, multiplying index by element size and adding base.`,
        distract: (v) => { const c = v.base + v.idx * v.size; return [`${v.base + v.idx}`, `${(v.base + v.idx) * v.size}`, `${c + v.size}`, `${c - v.size}`, `${v.base * v.size}`]; },
        vals: (rng) => ({ base: R(rng, 1000, 8000), idx: R(rng, 0, 500), size: R(rng, 1, 8) }),
        whyWrong: (v) => [`Multiply index by byte size before adding base; adding index directly ignores element size.`],
        trick: "addr = base + index × size.",
        tip: "0-based indexing means first element is at base + 0." }
    ]
  }
};

/* ---------------- DIGITAL LOGIC ---------------- */
const digitalLogic = {
  subjects: ["digital-logic"],
  chapter: "Digital Logic Design (Phase 11)",
  tags: ["digital-logic", "deep-kb"],
  topics: {
    "Gates and Circuits": [
      { kind: "fact", name: "logic gate facts", facts: [
        ["What does an AND gate output?", "1 only when both inputs are 1", "AND produces 1 if and only if all inputs are 1."],
        ["What does an OR gate output?", "1 when at least one input is 1", "OR produces 1 if any input is 1."],
        ["What does a NOT gate do?", "Inverts the input", "NOT flips 0 to 1 and 1 to 0."],
        ["What does an XOR gate do?", "Outputs 1 when inputs differ", "XOR outputs 1 for exactly one 1-input."],
        ["What is a half adder?", "Adds two bits and produces sum and carry", "Half adder: sum = A XOR B, carry = A AND B."],
        ["What is a flip-flop?", "A 1-bit memory element", "Flip-flops store binary state in sequential circuits."],
        ["What is a multiplexer?", "A circuit selecting one of many inputs", "A mux routes one input to the output using select lines."],
        ["What is De Morgan's theorem?", "NOT(A AND B) = NOT A OR NOT B", "De Morgan's converts between AND/OR with NOT."]
      ],
        trick: "AND=both 1, OR=any 1, XOR=different.",
        tip: "Gate truth tables are the foundation of digital design." },

      { kind: "numeric", name: "half adder output", difficulty: "easy",
        note: "Sum = A XOR B, Carry = A AND B.",
        q: (v) => `Inputs A=${v.a}, B=${v.b}. What is the carry of a half adder?`,
        a: (v) => `${v.a & v.b}`,
        e: (v) => `Carry = ${v.a} AND ${v.b} = ${v.a & v.b}, because carry is 1 only when both inputs are 1.`,
        distract: (v) => { const s = v.a ^ v.b; return [`${s}`, `${v.a | v.b}`, `${v.a + v.b}`, `${1 - (v.a & v.b)}`, `${s + (v.a & v.b)}`]; },
        vals: (rng) => ({ a: R(rng, 0, 1), b: R(rng, 0, 1) }),
        whyWrong: (v) => [`Carry is the AND of the inputs; XOR gives the sum, not the carry.`],
        trick: "carry = A AND B.",
        tip: "Half adder: sum=XOR, carry=AND." }
    ]
  }
};

/* ---------------- COMPILER DESIGN ---------------- */
const compilerDesign = {
  subjects: ["compiler-design"],
  chapter: "Compiler Design (Phase 11)",
  tags: ["compiler-design", "deep-kb"],
  topics: {
    "Phases and Parsing": [
      { kind: "fact", name: "compiler facts", facts: [
        ["What is lexical analysis?", "Breaking source into tokens", "The lexer recognises keywords, identifiers and operators."],
        ["What is syntax analysis?", "Checking token order against grammar", "The parser builds an abstract syntax tree."],
        ["What is semantic analysis?", "Checking meaning and types", "Semantic analysis catches type errors and scope violations."],
        ["What is intermediate code?", "An intermediate representation of the program", "IR bridges front-end and back-end optimisations."],
        ["What is code optimisation?", "Transforming code for better performance", "Optimisations remove redundancy and improve speed."],
        ["What is code generation?", "Producing target machine code", "The back-end emits instructions for the hardware."],
        ["What is a regular expression?", "A pattern for describing token sets", "Regex defines lexical patterns in the grammar."],
        ["What is a context-free grammar?", "Grammar rules with nested structure", "CFG describes the syntax of programming languages."]
      ],
        trick: "lex->parse->semantics->IR->optimise->codegen.",
        tip: "Compiler phases follow a strict order." },

      { kind: "numeric", name: "token count", difficulty: "easy",
        note: "Count keywords, identifiers and operators.",
        q: (v) => `A program has ${v.k} keywords, ${v.id} identifiers and ${v.op} operators. How many tokens total?`,
        a: (v) => `${v.k + v.id + v.op}`,
        e: (v) => `Tokens = ${v.k} + ${v.id} + ${v.op} = ${v.k + v.id + v.op}, summing all lexical categories.`,
        distract: (v) => { const c = v.k + v.id + v.op; return [`${c * 2}`, `${v.k * v.id}`, `${v.k + v.op}`, `${c - 1}`, `${c + v.k}`]; },
        vals: (rng) => ({ k: R(rng, 3, 15), id: R(rng, 5, 30), op: R(rng, 2, 12) }),
        whyWrong: (v) => [`Add the three token counts; multiplying them is meaningless for total tokens.`],
        trick: "total = sum of all token types.",
        tip: "A lexer outputs one token per recognised lexeme." }
    ]
  }
};

/* ---------------- COMPUTER GRAPHICS ---------------- */
const computerGraphics = {
  subjects: ["computer-graphics"],
  chapter: "Computer Graphics (Phase 11)",
  tags: ["computer-graphics", "deep-kb"],
  topics: {
    "Rendering and Models": [
      { kind: "fact", name: "graphics facts", facts: [
        ["What is a pixel?", "The smallest addressable element of a display", "Pixels compose the raster image."],
        ["What is a polygon in 3D graphics?", "A flat shape defined by vertices", "Triangles are the fundamental 3D primitive."],
        ["What is the z-buffer?", "A depth buffer for hidden surface removal", "Z-buffer compares depths to draw the nearest surface."],
        ["What is texture mapping?", "Applying an image to a 3D surface", "Textures add detail without extra geometry."],
        ["What is rasterisation?", "Converting vector shapes to pixels", "Rasterisers scan-convert primitives into the framebuffer."],
        ["What is anti-aliasing?", "Smoothing jagged edges in images", "Anti-aliasing blends pixel colours along edges."],
        ["What is a framebuffer?", "Memory holding the displayed image", "The framebuffer stores pixel values for the display."]
      ],
        trick: "pixel=dot, triangle=primitive, z-buffer=depth.",
        tip: "Graphics questions test the rendering pipeline order." }
    ]
  }
};

/* ---------------- DISTRIBUTED SYSTEMS ---------------- */
const distributed = {
  subjects: ["distributed-systems"],
  chapter: "Distributed Systems (Phase 11)",
  tags: ["distributed-systems", "deep-kb"],
  topics: {
    "Consensus and Replication": [
      { kind: "fact", name: "distributed facts", facts: [
        ["What is a distributed system?", "Multiple computers coordinating over a network", "Distributed systems share resources across nodes."],
        ["What is the CAP theorem?", "A system cannot be consistent, available and partition-tolerant simultaneously", "CAP limits distributed design choices."],
        ["What is replication?", "Storing copies on multiple nodes", "Replication improves availability and fault tolerance."],
        ["What is consensus?", "Nodes agreeing on a single value", "Paxos and Raft solve consensus in distributed systems."],
        ["What is eventual consistency?", "All replicas converge to the same state eventually", "Eventual consistency trades immediate correctness for availability."],
        ["What is a quorum?", "The minimum number of nodes for a valid operation", "Quorum ensures write/read consistency."],
        ["What is a leader election?", "Choosing one node to coordinate writes", "Leaders prevent write conflicts in replicated logs."],
        ["What is a vector clock?", "A counter tracking causality per node", "Vector clocks detect causal ordering of events."]
      ],
        trick: "CAP=consistency+availability+partition, quorum=majority.",
        tip: "CAP theorem and replication models are high-yield topics." },

      { kind: "numeric", name: "quorum size", difficulty: "easy",
        note: "Quorum = floor(N/2) + 1.",
        q: (v) => `A cluster has ${v.n} nodes. What is the quorum for a write?`,
        a: (v) => `${Math.floor(v.n / 2) + 1}`,
        e: (v) => `Quorum = floor(${v.n}/2) + 1 = ${Math.floor(v.n / 2) + 1}, needing a majority.`,
        distract: (v) => { const c = Math.floor(v.n / 2) + 1; return [`${v.n}`, `${Math.ceil(v.n / 2)}`, `${c - 1}`, `${v.n - 1}`, `${c + 1}`]; },
        vals: (rng) => ({ n: R(rng, 3, 21) }),
        whyWrong: (v) => [`Quorum is the strict majority; using N or N/2 alone is not sufficient for consistency.`],
        trick: "quorum = floor(N/2) + 1.",
        tip: "Odd clusters avoid ties in leader election." }
    ]
  }
};

/* ---------------- SYSTEM DESIGN ---------------- */
const systemDesign = {
  subjects: ["system-design"],
  chapter: "System Design (Phase 11)",
  tags: ["system-design", "deep-kb"],
  topics: {
    "Architecture and Scaling": [
      { kind: "fact", name: "system design facts", facts: [
        ["What is horizontal scaling?", "Adding more machines to distribute load", "Horizontal scaling improves throughput by parallelism."],
        ["What is vertical scaling?", "Increasing resources on a single machine", "Vertical scaling is simpler but has hardware limits."],
        ["What is load balancing?", "Distributing requests across servers", "Load balancers prevent any single server from being overwhelmed."],
        ["What is caching?", "Storing frequently accessed data in fast memory", "Caches reduce database reads and latency."],
        ["What is a CDN?", "A content delivery network of edge servers", "CDNs serve static content from the nearest location."],
        ["What is database sharding?", "Splitting a database by a shard key", "Sharding distributes data across multiple database instances."],
        ["What is a message queue?", "An asynchronous communication buffer", "Queues decouple producers from consumers."],
        ["What is microservices?", "An architecture of small independent services", "Microservices allow teams to deploy independently."]
      ],
        trick: "horizontal=scale out, vertical=scale up, cache=fast read.",
        tip: "System design questions test trade-offs between options." },

      { kind: "numeric", name: "cache hit ratio", difficulty: "easy",
        note: "Hit ratio = hits ÷ (hits + misses) × 100.",
        q: (v) => `A cache had ${v.hits} hits and ${v.miss} misses. What is the hit ratio percentage?`,
        a: (v) => `${(v.hits / (v.hits + v.miss) * 100).toFixed(1)}%`,
        e: (v) => `Hit ratio = ${v.hits} ÷ (${v.hits} + ${v.miss}) × 100 = ${(v.hits / (v.hits + v.miss) * 100).toFixed(1)}%, dividing hits by total requests.`,
        distract: (v) => { const c = v.hits / (v.hits + v.miss) * 100; return [`${(v.miss / (v.hits + v.miss) * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c - 5).toFixed(1)}%`]; },
        vals: (rng) => ({ hits: R(rng, 100, 10000), miss: R(rng, 1, 1000) }),
        whyWrong: (v) => [`Divide hits by total (hits+misses); using misses alone gives the miss ratio.`],
        trick: "hit ratio = hits / (hits + misses) × 100.",
        tip: "High hit ratios reduce backend load significantly." },

      { kind: "numeric", name: "throughput with replicas", difficulty: "medium",
        note: "Throughput = single_node_rate × replica_count.",
        q: (v) => `A service handles ${v.rps} requests/sec per replica. With ${v.n} replicas behind a load balancer, what is the aggregate throughput?`,
        a: (v) => `${v.rps * v.n} req/s`,
        e: (v) => `Throughput = ${v.rps} × ${v.n} = ${v.rps * v.n} req/s, multiplying per-replica rate by replica count.`,
        distract: (v) => { const c = v.rps * v.n; return [`${c / 2} req/s`, `${c * 2} req/s`, `${v.rps + v.n} req/s`, `${v.rps / v.n} req/s`, `${c + 100} req/s`]; },
        vals: (rng) => ({ rps: R(rng, 100, 5000), n: R(rng, 2, 20) }),
        whyWrong: (v) => [`Multiply per-replica rate by replica count; adding gives a meaningless sum.`],
        trick: "total rate = single rate × replicas.",
        tip: "Linear scaling holds until coordination overhead dominates." }
    ]
  }
};

module.exports = [
  makeKbGen(progFund), makeKbGen(algorithms), makeKbGen(dataStructures),
  makeKbGen(digitalLogic), makeKbGen(compilerDesign), makeKbGen(computerGraphics),
  makeKbGen(distributed), makeKbGen(systemDesign)
];
