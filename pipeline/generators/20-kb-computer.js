/* ============================================================
   Deep Knowledge KB — Computer Science
   Hardware, software, networking, security + numeric
   binary/hex/data-size topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["computer-science"],
  chapter: "Computer Science — Deep Knowledge Bank",
  tags: ["computer-science", "deep-kb", "hardware", "software", "networking", "security"],
  topics: {

    "Computer Hardware": [
      {
        kind: "pair", a: "hardware component", b: "its function",
        note: "Hardware-component function pairs are foundational.",
        pairs: [
          ["CPU", "executes instructions and performs calculations"], ["RAM", "holds data temporarily while the computer runs"],
          ["Hard disk", "stores data permanently"], ["GPU", "renders graphics and images"], ["Power supply", "converts mains power for the components"],
          ["Motherboard", "connects all components together"]
        ],
        trick: "CPU=processes, RAM=temporary, hard disk=permanent, GPU=graphics, motherboard=connects.",
        tip: "RAM (temporary) vs hard disk (permanent) is the most-asked pair."
      },
      {
        kind: "fact", name: "hardware facts",
        note: "Core hardware facts and component knowledge.",
        facts: [
          ["What does CPU stand for?", "Central Processing Unit", "The CPU is the brain of the computer, fetching, decoding and executing instructions."],
          ["What is the function of RAM?", "Temporary storage of running data", "RAM holds programs and data in use; its contents are lost when power is off."],
          ["What does RAM stand for?", "Random Access Memory", "RAM is Random Access Memory, the computer's short-term working memory."],
          ["What does ROM stand for?", "Read Only Memory", "ROM is Read Only Memory, permanent storage that keeps its contents without power."],
          ["Which storage is faster: SSD or HDD?", "SSD", "Solid-state drives use flash memory with no moving parts, far faster than spinning hard disks."],
          ["Which component performs arithmetic and logic?", "ALU (Arithmetic Logic Unit)", "The ALU inside the CPU performs all arithmetic and logical operations."],
          ["What is the main circuit board called?", "The motherboard", "The motherboard hosts the CPU, RAM slots, expansion cards and connectors."],
          ["Which unit converts instructions to actions?", "The control unit", "The control unit directs the CPU, coordinating fetch, decode and execute cycles."],
          ["What does 1 byte equal in bits?", "8 bits", "One byte is 8 bits, the standard unit for character storage."],
          ["Which device is both input and output?", "A touchscreen", "A touchscreen accepts touches as input and displays output at the same time."]
        ],
        trick: "CPU=ALU+control; RAM volatile, ROM non-volatile; SSD beats HDD; byte=8 bits.",
        tip: "RAM/ROM volatility and the 8-bit byte are the two guaranteed items."
      },
      {
        kind: "numeric", name: "binary to decimal conversion", difficulty: "easy",
        note: "Binary place values are powers of 2; each 1-bit contributes its place value.",
        q: (v) => `What is the binary number ${v.b} in decimal?`,
        a: (v) => `${v.d}`,
        e: (v) => `Binary place values are powers of 2 (1, 2, 4, 8, 16...). Adding the places with 1s gives ${v.b}₂ = ${v.d}₁₀, because each 1-bit counts its power of two.`,
        distract: (v) => [`${v.d + 1}`, `${v.d * 2}`, `${Math.round(v.d / 2)}`, `${v.d + 4}`, `${v.d * 2 + 1}`],
        vals: (rng) => {
          const d = 2 + Math.floor(rng() * 254);
          return { b: d.toString(2), d };
        },
        whyWrong: (v) => [`Sum only the place values where a 1 appears; miscounting or adding an extra bit is the classic slip.`],
        trick: "Read binary from the right: 1, 2, 4, 8, 16... add where the bit is 1.",
        tip: "Any binary drill is safe: every value yields a unique stem."
      },
      {
        kind: "numeric", name: "hexadecimal to decimal conversion", difficulty: "medium",
        note: "Hexadecimal uses base 16 with digits 0-9 and A-F for 10-15.",
        q: (v) => `What is the hexadecimal number ${v.h} in decimal?`,
        a: (v) => `${v.d}`,
        e: (v) => `Hex digits are base 16: the rightmost digit is 16⁰ and the next is 16¹. Converting ${v.h}₁₆ gives ${v.d}₁₀, because A-F represent 10-15.`,
        distract: (v) => [`${v.d + 16}`, `${v.d * 16}`, `${Math.round(v.d / 16)}`, `${v.d + 10}`, `${v.d * 10}`],
        vals: (rng) => {
          const d = 16 + Math.floor(rng() * 240);
          return { h: d.toString(16).toUpperCase(), d };
        },
        whyWrong: (v) => [`Each hex place multiplies by 16, not 10; treating hex digits as decimal is the classic error.`],
        trick: "Multiply left digit by 16, add the right digit.",
        tip: "A-F convert to 10-15 before any arithmetic."
      },
      {
        kind: "numeric", name: "data size conversions", difficulty: "medium",
        note: "Data units: 1 KB = 1024 bytes, 1 MB = 1024 KB, 1 GB = 1024 MB.",
        q: (v) => `How many ${v.unit} are in ${v.n} ${v.src}?`,
        a: (v) => `${v.ans}`,
        e: (v) => `${v.explain} because each step multiplies or divides by 1024, since storage units are powers of 2 (2¹⁰ = 1024).`,
        distract: (v) => {
          const c = v.ans;
          return [`${c / 1000}`, `${c * 1024}`, `${c * 1000}`, `${c + 24}`, `${Math.round(c / 1024)}`];
        },
        vals: (rng) => {
          const pairs = [
            ["KB", "bytes", 1024, (n) => `${n * 1024}`],
            ["MB", "KB", 1024, (n) => `${n * 1024}`],
            ["GB", "MB", 1024, (n) => `${n * 1024}`],
            ["bytes", "KB", 1024, (n) => `${n / 1024}`],
            ["KB", "MB", 1024, (n) => `${n / 1024}`],
            ["MB", "GB", 1024, (n) => `${n / 1024}`]
          ];
          const [src, unit, mult, fn] = pairs[Math.floor(rng() * pairs.length)];
          const n = (1 + Math.floor(rng() * 8)) * mult;
          const ans = fn(n);
          return { src, unit, n, ans, explain: `${n} ${src} = ${ans} ${unit}` };
        },
        whyWrong: (v) => [`The base is 1024, not 1000; using decimal 1000 instead of binary 1024 is the classic data-unit error.`],
        trick: "1024 everywhere: KB→MB→GB all divide or multiply by 1024.",
        tip: "The 1000-based answer is always a distractor."
      },
      {
        kind: "numeric", name: "boolean logic evaluation", difficulty: "hard",
        note: "Boolean rules: AND gives 1 only when both are 1; OR gives 1 when either is 1; NOT flips.",
        q: (v) => `Evaluate: NOT(${v.a} AND ${v.b}) OR (${v.c} OR NOT(${v.d})), where 1 = true and 0 = false.`,
        a: (v) => `${v.ans}`,
        e: (v) => `Step by step: ${v.a} AND ${v.b} = ${v.ab}, so NOT(${v.a} AND ${v.b}) = ${v.na}; ${v.c} OR NOT(${v.d}) = ${v.c} OR ${v.nd} = ${v.cd}. Finally ${v.na} OR ${v.cd} = ${v.ans}, because OR is true if either side is 1.`,
        distract: (v) => [`${v.ans === 1 ? 0 : 1}`, `${v.ab}`, `${v.na === 1 ? 0 : 1}`, `${v.cd}`, `${v.ans === 1 ? 1 : 0}`],
        vals: (rng) => {
          const a = rng() < 0.5 ? 0 : 1, b = rng() < 0.5 ? 0 : 1, c = rng() < 0.5 ? 0 : 1, d = rng() < 0.5 ? 0 : 1;
          const ab = a & b, na = ab === 1 ? 0 : 1, nd = d === 1 ? 0 : 1, cd = (c | nd), ans = na | cd;
          return { a, b, c, d, ab, na, nd, cd, ans };
        },
        whyWrong: (v) => [`Work inside out: NOT applies before AND/OR, and AND binds tighter than OR; the order of evaluation decides the answer.`],
        trick: "NOT first, then AND, then OR — parenthesis first, operators next.",
        tip: "Evaluate in brackets, then AND before OR."
      }
    ],

    "Software and Programming": [
      {
        kind: "fact", name: "software facts",
        note: "Operating systems, applications and programming basics.",
        facts: [
          ["What is system software?", "Software that manages the computer hardware", "System software like operating systems and drivers manages hardware resources for other programs."],
          ["What is the most common example of system software?", "The operating system", "Windows, Linux and Android are operating systems — the core system software."],
          ["What does an operating system do?", "Manages hardware and runs applications", "The OS schedules tasks, manages memory and provides the interface for applications."],
          ["Which software converts high-level code to machine code?", "A compiler", "A compiler translates whole programs from high-level languages into machine code before running."],
          ["What is the difference between a compiler and an interpreter?", "Compiler translates whole program; interpreter runs line by line", "Compilers produce a complete executable, while interpreters execute statements one at a time."],
          ["Which language is known for web page structure?", "HTML", "HTML (HyperText Markup Language) defines the structure and content of web pages."],
          ["Which language adds interactivity to web pages?", "JavaScript", "JavaScript runs in the browser to create dynamic, interactive web pages."],
          ["What is an algorithm?", "A step-by-step procedure to solve a problem", "An algorithm is a finite ordered sequence of steps that solves a problem."],
          ["What is debugging?", "Finding and fixing errors in code", "Debugging is the process of locating and correcting bugs in a program."],
          ["Which type of error stops a program running?", "A syntax error", "Syntax errors violate the language rules and prevent the program from compiling or running."]
        ],
        trick: "OS=system software; compiler=whole program, interpreter=line by line; HTML=structure, JS=interactivity.",
        tip: "Compiler vs interpreter is the most repeated software question."
      },
      {
        kind: "tf", name: "software statements",
        note: "True/false stems on software and programming.",
        statements: [
          ["A compiler translates a whole program before running it.", "A compiler runs code one line at a time."],
          ["HTML defines the structure of web pages.", "HTML performs all calculations on web pages."],
          ["The operating system manages hardware resources.", "The operating system is an application like a browser."],
          ["An algorithm is a step-by-step problem-solving procedure.", "An algorithm is a hardware component."],
          ["Debugging fixes errors in code.", "Debugging writes new features only."]
        ],
        trick: "Compiler=whole, interpreter=line; HTML=structure; OS=manager; algorithm=procedure.",
        tip: "Swap the definitions and the statement flips false."
      }
    ],

    "Networking and the Internet": [
      {
        kind: "fact", name: "networking facts",
        note: "Networks, protocols and internet facts.",
        facts: [
          ["What does LAN stand for?", "Local Area Network", "A LAN connects computers within a small area like an office or school."],
          ["What is the difference between LAN and WAN?", "LAN is local, WAN spans wide areas", "LANs cover small premises; WANs like the internet span cities, countries and continents."],
          ["What does IP address stand for?", "Internet Protocol address", "An IP address uniquely identifies a device on a network for routing data."],
          ["What is the protocol for secure web browsing?", "HTTPS", "HTTPS encrypts web traffic using TLS, protecting data between browser and server."],
          ["What does HTTP stand for?", "HyperText Transfer Protocol", "HTTP governs how web browsers and servers exchange web pages."],
          ["What is a firewall?", "A security barrier filtering network traffic", "Firewalls inspect traffic and block unauthorised connections to protect networks."],
          ["Which device connects different networks?", "A router", "Routers forward data between networks, choosing the best path for packets."],
          ["What is DNS?", "The service that translates domain names to IP addresses", "DNS converts human-readable names like example.com into IP addresses."],
          ["What is a browser?", "Software to view web pages", "Browsers like Chrome and Firefox fetch and render web pages."],
          ["What does URL stand for?", "Uniform Resource Locator", "A URL is the web address identifying a specific resource on the internet."]
        ],
        trick: "LAN=local, WAN=wide; HTTPS=secure, HTTP=plain; router=between networks, DNS=name→IP.",
        tip: "LAN/WAN scope and HTTPS security are the top two items."
      },
      {
        kind: "tf", name: "networking statements",
        note: "True/false stems on networks.",
        statements: [
          ["A LAN covers a small local area.", "A LAN spans multiple continents."],
          ["DNS converts domain names to IP addresses.", "DNS converts IP addresses to food recipes."],
          ["HTTPS encrypts web traffic.", "HTTP encrypts web traffic by default."],
          ["A router forwards data between networks.", "A router only stores files locally."],
          ["A firewall filters network traffic for security.", "A firewall accelerates internet speed."]
        ],
        trick: "LAN=small, DNS=translation, HTTPS=encrypted, router=forwarding, firewall=filtering.",
        tip: "HTTP vs HTTPS security is the subtle trap."
      }
    ],

    "Cyber Security": [
      {
        kind: "fact", name: "cyber security facts",
        note: "Threats, protections and safe practices.",
        facts: [
          ["What is phishing?", "Fraudulent messages tricking users into revealing data", "Phishing emails and sites impersonate trusted sources to steal passwords and card details."],
          ["What is malware?", "Malicious software harming computers", "Malware is any malicious software, including viruses, worms, ransomware and trojans, designed to harm or exploit devices."],
          ["What is ransomware?", "Malware that locks data until a ransom is paid", "Ransomware encrypts files and demands payment for the decryption key."],
          ["What is a virus in computing?", "Self-replicating malicious code", "Viruses attach to programs and spread when the infected file runs."],
          ["What is the best defence against phishing?", "Verifying senders and never clicking unknown links", "Caution and verification stop most phishing attacks before they start."],
          ["What does a strong password require?", "Length, mixed characters and uniqueness", "Strong passwords combine length, upper/lower case, digits and symbols and are never reused."],
          ["What is two-factor authentication?", "A second verification step beyond the password", "2FA adds a code from an app or SMS, protecting accounts even if the password leaks."],
          ["What is a VPN?", "An encrypted tunnel for private browsing", "A VPN encrypts all traffic between device and server, hiding it from the network."],
          ["What is encryption?", "Scrambling data so only the key holder can read it", "Encryption converts plaintext to ciphertext, protecting data in transit and at rest."],
          ["What should you do with an unexpected attachment?", "Do not open it; verify the sender first", "Unexpected attachments are the top malware vector; verify before opening."]
        ],
        trick: "Phishing=deception, ransomware=lock+demand, 2FA=second factor, VPN=encrypted tunnel.",
        tip: "Phishing vs ransomware definitions are the most asked pair."
      },
      {
        kind: "tf", name: "cyber security statements",
        note: "True/false stems on security practice.",
        statements: [
          ["Two-factor authentication adds a second verification step.", "Two-factor authentication replaces the password entirely."],
          ["Ransomware demands payment to unlock data.", "Ransomware only slows down the computer."],
          ["A VPN encrypts internet traffic.", "A VPN publicly exposes all traffic."],
          ["Phishing uses deception to steal credentials.", "Phishing repairs hacked accounts."],
          ["Encryption scrambles data for security.", "Encryption deletes data permanently."]
        ],
        trick: "2FA=extra step, ransomware=ransom, VPN=encrypt, phishing=deceive, encryption=scramble.",
        tip: "Each false statement exaggerates or reverses the real function."
      },
      {
        kind: "numeric", name: "password entropy", difficulty: "hard",
        note: "Entropy measures password strength: bits = log₂(possibilities).",
        q: (v) => `A password of length ${v.n} uses a character set of ${v.s} symbols. Approximately how many bits of entropy does it have?`,
        a: (v) => `About ${Math.round(v.n * Math.log2(v.s))} bits`,
        e: (v) => `Entropy = n × log₂(s) = ${v.n} × log₂(${v.s}) ≈ ${(v.n * Math.log2(v.s)).toFixed(0)} bits, because each character multiplies the possibilities by the set size.`,
        distract: (v) => {
          const c = Math.round(v.n * Math.log2(v.s));
          return [`About ${c / 2} bits`, `About ${c * 2} bits`, `About ${v.n * v.s} bits`, `About ${c + 10} bits`, `About ${Math.max(1, c - 10)} bits`];
        },
        vals: (rng) => {
          const s = [26, 52, 62, 95][Math.floor(rng() * 4)];
          const n = 8 + Math.floor(rng() * 8);
          return { n, s };
        },
        whyWrong: (v) => [`Bits are logarithmic (n × log₂ s), not the product n × s; 60+ bits is strong, 30 or below is weak.`],
        trick: "Double the length for the most reliable strength gain — length beats variety.",
        tip: "≥ 60 bits is the exam's 'strong' threshold."
      }
    ],

    "Computing Arithmetic": [
      {
        kind: "numeric", name: "transfer rate calculations", difficulty: "medium",
        note: "Transfer rate = data size ÷ time; sizes mix MB and GB with seconds.",
        q: (v) => `A download of ${v.mb} MB completes in ${v.s} seconds. What is the average transfer rate in MB/s?`,
        a: (v) => `${(v.mb / v.s).toFixed(1)} MB/s`,
        e: (v) => `Rate = size ÷ time = ${v.mb} MB ÷ ${v.s} s = ${(v.mb / v.s).toFixed(1)} MB/s, because throughput divides the transferred data by the elapsed time.`,
        distract: (v) => {
          const c = v.mb / v.s;
          return [`${(v.mb * v.s).toFixed(0)} MB/s`, `${(c * 2).toFixed(1)} MB/s`, `${(c * 0.5).toFixed(1)} MB/s`, `${(v.mb / (v.s * 8)).toFixed(1)} MB/s`, `${(c + 2).toFixed(1)} MB/s`];
        },
        vals: (rng) => ({ mb: 50 + Math.floor(rng() * 195) * 10, s: 10 + Math.floor(rng() * 120) }),
        whyWrong: (v) => [`Rate divides size by time; multiplying them or dividing by 8 (bytes vs bits) are the classic errors.`],
        trick: "Rate = MB ÷ seconds.",
        tip: "MB/s vs Mb/s differ by factor 8 — read the units."
      },
      {
        kind: "numeric", name: "disk capacity calculations", difficulty: "hard",
        note: "Hard disk capacity = cylinders × heads × sectors × 512 bytes.",
        q: (v) => `A hard disk has ${v.c} cylinders, ${v.h} heads and ${v.s} sectors per track. Using 512 bytes per sector, what is the capacity in GB?`,
        a: (v) => `${(v.c * v.h * v.s * 512 / 1073741824).toFixed(2)} GB`,
        e: (v) => `Capacity = ${v.c} × ${v.h} × ${v.s} × 512 = ${(v.c * v.h * v.s * 512).toLocaleString()} bytes = ${(v.c * v.h * v.s * 512 / 1073741824).toFixed(2)} GB, because 1 GB = 2³⁰ = 1,073,741,824 bytes.`,
        distract: (v) => {
          const c = v.c * v.h * v.s * 512 / 1073741824;
          return [`${(c * 2).toFixed(2)} GB`, `${(c * 0.5).toFixed(2)} GB`, `${(c / 1000).toFixed(2)} GB`, `${(c * 10).toFixed(2)} GB`, `${(c + 5).toFixed(2)} GB`];
        },
        vals: (rng) => ({ c: 100 + Math.floor(rng() * 90) * 10, h: 4 + Math.floor(rng() * 12), s: 20 + Math.floor(rng() * 40) * 5 }),
        whyWrong: (v) => [`Multiply all four factors then divide by 2³⁰; using 10⁹ instead of 2³⁰ bytes per GB is the common slip.`],
        trick: "GB = cylinders × heads × sectors × 512 ÷ 2³⁰.",
        tip: "Storage problems use 1024-based GB unless the question says otherwise."
      },
      {
        kind: "numeric", name: "16-bit binary conversions", difficulty: "medium",
        note: "16-bit binary covers values 0-65535; place values run from 1 to 32768.",
        q: (v) => `What is the 16-bit binary number ${v.b} in decimal?`,
        a: (v) => `${v.d}`,
        e: (v) => `Reading the 16-bit pattern from the right, each 1-bit adds its power of two (1, 2, 4, ... 32768). The bits ${v.b} sum to ${v.d}₁₀, because every position doubles the previous place value.`,
        distract: (v) => [`${v.d + 1}`, `${v.d * 2}`, `${Math.round(v.d / 2)}`, `${v.d + 8}`, `${v.d * 2 + 1}`],
        vals: (rng) => {
          const d = 256 + Math.floor(rng() * 65000);
          return { b: d.toString(2).padStart(16, "0"), d };
        },
        whyWrong: (v) => [`Sum the powers of two for each 1-bit; skipping high bits or miscounting place values changes the value.`],
        trick: "Rightmost bit is 1, each step left doubles.",
        tip: "16-bit answers fit 0-65535; larger values mean a miscount."
      },
      {
        kind: "numeric", name: "video data calculations", difficulty: "hard",
        note: "Frame size = width × height × bit depth; data per second = frame size × frames per second.",
        q: (v) => `A ${v.w}×${v.h} video at ${v.b}-bit colour and ${v.fps} fps. What is the uncompressed data rate in MB/s?`,
        a: (v) => `${(v.w * v.h * v.b * v.fps / 8388608).toFixed(1)} MB/s`,
        e: (v) => `Per frame: ${v.w}×${v.h}×${v.b} bits = ${(v.w * v.h * v.b / 8).toLocaleString()} bytes. At ${v.fps} fps that is ${(v.w * v.h * v.b * v.fps / 8388608).toFixed(1)} MB/s, because 1 MB = 2²⁰ bytes and 1 byte = 8 bits.`,
        distract: (v) => {
          const c = v.w * v.h * v.b * v.fps / 8388608;
          return [`${(c * 8).toFixed(1)} MB/s`, `${(c / 8).toFixed(1)} MB/s`, `${(c * 2).toFixed(1)} MB/s`, `${(c * 0.5).toFixed(1)} MB/s`, `${(c / 1000).toFixed(2)} MB/s`];
        },
        vals: (rng) => {
          const r = [[640, 480], [1280, 720], [1920, 1080], [720, 576], [1366, 768]][Math.floor(rng() * 5)];
          return { w: r[0], h: r[1], b: [8, 16, 24][Math.floor(rng() * 3)], fps: [24, 25, 30, 60][Math.floor(rng() * 4)] };
        },
        whyWrong: (v) => [`Bits must become bytes (÷8) and bytes must become MB (÷2²⁰); mixing factors of 8 and 1024 is the classic error.`],
        trick: "Rate = w × h × depth × fps ÷ 8 ÷ 2²⁰.",
        tip: "Compressed formats are far smaller — the question says uncompressed."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
