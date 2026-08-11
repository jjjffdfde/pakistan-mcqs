/* ============================================================
   Generator file 04 — Computer Science & IT facts
   One MCQ per fact; distractors drawn from same-subject pool.
   All content original, authored for this project.
   ============================================================ */
"use strict";
const L = require("../lib.js");

/* helper: build a generator object from a subject's fact map
   facts: { "Topic Name": [ [q, a, e], ... ] } */
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
  makeGen("computer-science", "Computer Science — Core", {
    "Computer Fundamentals": [
      ["What does CPU stand for?", "Central Processing Unit", "The CPU is the primary component that executes instructions of a program."],
      ["Which unit converts high-level language to machine code?", "Compiler", "A compiler translates the whole source program to machine code before execution."],
      ["What is the smallest unit of data in a computer?", "Bit", "A bit is a binary digit (0 or 1), the fundamental unit of information."],
      ["How many bits are in one byte?", "8", "A byte consists of 8 bits and usually encodes one character."],
      ["Which memory loses data when power is off?", "RAM", "RAM is volatile; its contents disappear without power."],
      ["Which storage is an example of secondary memory?", "Hard disk", "Secondary memory (hard disks, SSDs) retains data without power."],
      ["What does ROM stand for?", "Read Only Memory", "ROM is non-volatile memory that is typically written once at manufacture."],
      ["Which device converts digital signals to analog for transmission?", "Modem", "A modem modulates digital data to analog and demodulates it back."],
      ["What is the function of the ALU?", "arithmetic and logic operations", "The Arithmetic Logic Unit performs calculations and logical comparisons."],
      ["Which bus carries data between CPU and memory?", "Data bus", "The data bus transfers actual data; the address bus carries locations."],
      ["What is an operating system?", "software that manages hardware and software resources", "The OS provides the interface between users, applications and hardware."],
      ["Which type of software is an operating system?", "System software", "System software manages the computer; applications perform user tasks."],
      ["What does 'booting' mean?", "starting the computer", "Booting loads the OS into memory when the computer starts."],
      ["Which language does the CPU understand directly?", "Machine language", "Machine language consists of binary instructions the CPU executes directly."],
      ["What is a cache used for?", "speeding up repeated data access", "Caches store frequently used data closer to the processor."]
    ],
    "Number Systems": [
      ["What is the binary equivalent of decimal 10?", "1010", "10 = 8 + 2 = 1010 in binary."],
      ["What is the hexadecimal equivalent of decimal 15?", "F", "Hexadecimal uses digits 0-9 then A-F; 15 is F."],
      ["How many digits does the octal system use?", "8", "Octal uses digits 0 through 7."],
      ["What is the binary representation of decimal 2?", "10", "2 in binary is 10 (one 2, zero 1s)."],
      ["What does the MSB represent in a binary number?", "the most significant bit", "MSB is the leftmost, highest-value bit."],
      ["What is the decimal value of binary 1111?", "15", "1111 = 8+4+2+1 = 15."],
      ["Which base does the hexadecimal system use?", "16", "Hexadecimal is base 16 with symbols 0-9 and A-F."],
      ["What is 255 in hexadecimal?", "FF", "255 = 15×16 + 15 = FF in hex."]
    ]
  }),
  makeGen("ms-office", "MS Office — Applications", {
    "Word Processing": [
      ["Which shortcut pastes copied text in MS Word?", "Ctrl + V", "Ctrl+V is the standard paste shortcut in Windows applications."],
      ["Which shortcut copies selected text?", "Ctrl + C", "Ctrl+C copies the selection to the clipboard."],
      ["What does 'Ctrl + Z' do in Word?", "undoes the last action", "Ctrl+Z reverts the most recent change."],
      ["Which feature checks spelling as you type?", "Spelling and Grammar", "Word's proofing tools underline errors while typing."],
      ["What is a 'header' in a Word document?", "text printed at the top of every page", "Headers repeat at the top of each page; footers repeat at the bottom."],
      ["Which view shows the document as printed pages?", "Print Layout", "Print Layout displays page boundaries, margins and headers."],
      ["What does 'Ctrl + S' do?", "saves the document", "Ctrl+S saves the current file."],
      ["Which command inserts a page break?", "Ctrl + Enter", "Ctrl+Enter forces a new page at the cursor."]
    ],
    "Spreadsheets": [
      ["What is the intersection of a row and column called?", "Cell", "A cell is where a row and column meet; it holds one value."],
      ["Which function sums a range in Excel?", "SUM", "=SUM(A1:A10) adds the values in that range."],
      ["Which function finds the largest value?", "MAX", "MAX(range) returns the highest number in the range."],
      ["What does the formula =AVERAGE(B2:B9) do?", "returns the mean of the range", "AVERAGE computes the arithmetic mean of the specified cells."],
      ["Which function counts numeric cells?", "COUNT", "COUNT counts only numeric cells in a range."],
      ["What does '$A$1' mean in a formula?", "an absolute reference", "The dollar signs lock the reference when the formula is copied."],
      ["Which chart type shows parts of a whole?", "Pie chart", "Pie charts display proportions of a total as slices."],
      ["What is a 'worksheet'?", "a single sheet of cells", "A workbook contains worksheets, each a grid of cells."]
    ],
    "Presentations": [
      ["Which shortcut starts a slide show in PowerPoint?", "F5", "F5 runs the presentation from the first slide."],
      ["What is a 'slide layout'?", "the arrangement of placeholders on a slide", "Layouts define where titles, text and media sit on a slide."],
      ["Which feature adds motion to slide elements?", "Animations", "Animations apply movement to individual objects; transitions move between slides."],
      ["What is a transition?", "the effect when moving between slides", "Transitions animate the change from one slide to the next."],
      ["Which key advances to the next slide in a show?", "Enter", "Enter, Space, or a click advance to the next slide."],
      ["What does 'Slide Sorter' view show?", "thumbnail previews of all slides", "Slide Sorter displays all slides as small images for reordering."]
    ]
  }),
  makeGen("it", "Information Technology — General", {
    "IT Basics": [
      ["What does ICT stand for?", "Information and Communication Technology", "ICT covers technologies used to handle information and communicate."],
      ["Which device converts printed pages into digital images?", "Scanner", "A scanner digitizes paper documents and photos."],
      ["What is software?", "a set of instructions that runs on hardware", "Software is the programs and data that direct computer hardware."],
      ["Which component is called the 'brain' of the computer?", "CPU", "The CPU executes instructions and coordinates all operations."],
      ["What is hardware?", "the physical parts of a computer", "Hardware includes the physical components like the CPU, RAM and disks."],
      ["Which term describes storing data on remote servers?", "Cloud computing", "Cloud computing delivers storage and computing over the internet."],
      ["What is a LAN?", "a network covering a small area", "A LAN (Local Area Network) connects computers within a building or campus."],
      ["What does URL stand for?", "Uniform Resource Locator", "A URL is the address of a resource on the web."],
      ["Which device routes data between networks?", "Router", "A router forwards packets between different networks."],
      ["What is the internet?", "a global network of networks", "The internet interconnects millions of private and public networks worldwide."]
    ],
    "Emerging Tech": [
      ["What is the Internet of Things (IoT)?", "everyday devices connected to the internet", "IoT devices collect and exchange data over networks automatically."],
      ["What does 5G offer over 4G?", "higher speed and lower latency", "5G delivers faster data rates and more responsive connections."],
      ["What is blockchain?", "a distributed, tamper-resistant ledger", "Blockchain records transactions in linked blocks across many computers."],
      ["What is a smart city?", "a city using ICT to improve services", "Smart cities use sensors and data to manage traffic, energy and utilities."],
      ["What is edge computing?", "processing data near its source", "Edge computing reduces latency by computing close to the devices."]
    ]
  }),
  makeGen("networking", "Networking — Fundamentals", {
    "Network Models": [
      ["Which layer of the OSI model handles physical transmission?", "Physical layer", "Layer 1 transmits raw bits over the physical medium."],
      ["Which OSI layer handles routing of packets?", "Network layer", "Layer 3 (Network) determines paths and routes packets across networks."],
      ["Which layer provides end-to-end reliable delivery?", "Transport layer", "Layer 4 (Transport) manages segmentation, flow control and reliability."],
      ["Which protocol provides reliable data delivery?", "TCP", "TCP guarantees ordered, error-checked delivery with acknowledgements."],
      ["Which protocol is connectionless?", "UDP", "UDP sends datagrams without establishing a connection or guaranteeing delivery."],
      ["What does IP stand for?", "Internet Protocol", "IP addresses devices and routes packets across networks."],
      ["What is a MAC address?", "a unique hardware address of a network card", "MAC addresses are burned into the NIC and identify it on the local network."],
      ["Which device connects two different networks?", "Router", "Routers connect networks and route packets between them."],
      ["Which device forwards frames within a LAN?", "Switch", "Switches forward frames between devices on the same network."],
      ["What does DNS do?", "resolves domain names to IP addresses", "The Domain Name System translates names like example.com to IPs."]
    ],
    "Protocols and Services": [
      ["Which protocol transfers web pages?", "HTTP", "HTTP (HyperText Transfer Protocol) serves web content."],
      ["What does HTTPS add to HTTP?", "encryption", "HTTPS encrypts traffic using TLS for secure web communication."],
      ["Which protocol sends email?", "SMTP", "SMTP is used to transmit outgoing email between servers."],
      ["Which protocol retrieves email from a server?", "IMAP", "IMAP keeps mail on the server and syncs across devices."],
      ["What does FTP do?", "transfers files between computers", "FTP is the File Transfer Protocol for moving files over a network."],
      ["Which port is used by HTTPS by default?", "443", "HTTPS typically uses TCP port 443."],
      ["Which port is used by HTTP by default?", "80", "HTTP typically uses TCP port 80."],
      ["What is a firewall?", "a system that filters network traffic", "Firewalls block or allow traffic based on security rules."],
      ["Which protocol assigns IP addresses automatically?", "DHCP", "DHCP hands out IP configurations to devices on a network."],
      ["What is a VPN?", "a secure tunnel over a public network", "A VPN encrypts traffic between a device and a private network."]
    ]
  }),
  makeGen("operating-systems", "Operating Systems — Concepts", {
    "Processes and Memory": [
      ["What is a process?", "a program in execution", "A process is an executing instance of a program with its own memory space."],
      ["What is a thread?", "the smallest unit of CPU execution", "Threads share a process's memory and can run concurrently."],
      ["Which scheduler policy is FIFO?", "First In, First Out", "FIFO runs processes in the order they arrive."],
      ["What is context switching?", "saving and restoring a process's state", "The OS switches the CPU between processes by saving and loading contexts."],
      ["What is virtual memory?", "disk space used as extra RAM", "Virtual memory extends RAM by paging parts of memory to disk."],
      ["What is a page fault?", "accessing a page not in memory", "A page fault occurs when a referenced page must be loaded from disk."],
      ["Which algorithm replaces the least recently used page?", "LRU", "LRU evicts the page unused for the longest time."],
      ["What is a deadlock?", "processes waiting forever on each other", "Deadlock arises when each process holds a resource another needs."],
      ["Which condition must hold for deadlock? (one of four)", "mutual exclusion", "The four Coffman conditions include mutual exclusion, hold-and-wait, no preemption, circular wait."],
      ["What does a semaphore do?", "controls access to shared resources", "Semaphores coordinate processes using wait/signal operations."]
    ],
    "File Systems": [
      ["Which file system does Windows typically use?", "NTFS", "NTFS is Windows' default file system with permissions and journaling."],
      ["Which file system is common on Linux?", "ext4", "ext4 is the standard journaling file system for Linux."],
      ["What is a file system?", "the structure that stores and organizes files", "A file system manages how data is named, stored and retrieved on a disk."],
      ["What is fragmentation?", "files split into non-contiguous blocks", "Fragmentation slows access as data is scattered across the disk."],
      ["What does formatting a drive do?", "prepares it with a new file system", "Formatting erases the file system structure (and typically the data)."],
      ["Which permission allows reading a file in Linux?", "r", "The read permission r grants reading; w writes; x executes."],
      ["What is the root directory?", "the top-level directory", "The root (/) is the ancestor of all directories and files."],
      ["What is a mount point?", "a directory where a file system is attached", "Mounting attaches a storage device to the directory tree."]
    ]
  }),
  makeGen("database", "Database — Fundamentals", {
    "SQL and Design": [
      ["What does SQL stand for?", "Structured Query Language", "SQL is the standard language for relational database access."],
      ["What is a primary key?", "a column that uniquely identifies each row", "Primary key values are unique and never null."],
      ["What is a foreign key?", "a column referencing another table's primary key", "Foreign keys enforce referential integrity between tables."],
      ["What is normalization?", "organizing data to reduce redundancy", "Normalization removes duplicate data and dependency anomalies."],
      ["Which normal form removes partial dependencies?", "2NF", "Second normal form requires full dependence on the whole primary key."],
      ["What is a transaction?", "a unit of work that must complete atomically", "Transactions provide atomicity, consistency, isolation and durability (ACID)."],
      ["Which ACID property ensures all-or-nothing execution?", "Atomicity", "Atomicity guarantees that every part of a transaction succeeds or none does."],
      ["What is an index?", "a structure that speeds up queries", "Indexes accelerate lookups at the cost of extra storage and writes."],
      ["What does SELECT do?", "retrieves data from tables", "SELECT queries return rows matching the specified columns and conditions."],
      ["Which clause combines rows from two tables?", "JOIN", "JOIN merges rows based on a related column between tables."],
      ["What is a view?", "a saved query acting like a table", "Views present query results as if they were tables."],
      ["Which statement removes all rows but keeps the table?", "DELETE", "DELETE removes rows; TRUNCATE also keeps the table but resets it faster."]
    ],
    "NoSQL and Concepts": [
      ["Which database type stores documents?", "NoSQL document stores", "Document databases like MongoDB store JSON-like documents."],
      ["What is a key-value store?", "a database of key-value pairs", "Key-value stores offer simple, fast lookups by key."],
      ["Which database is a popular open-source SQL engine?", "MySQL", "MySQL is a widely used open-source relational database."],
      ["What is ORM?", "a layer mapping objects to database rows", "ORMs let developers work with tables as objects in code."],
      ["What is ACID?", "a set of transaction guarantees", "ACID stands for Atomicity, Consistency, Isolation, Durability."],
      ["What is a database schema?", "the structure of tables and relationships", "The schema defines tables, columns, keys and constraints."]
    ]
  }),
  makeGen("cloud-computing", "Cloud Computing — Services", {
    "Cloud Models": [
      ["What does IaaS stand for?", "Infrastructure as a Service", "IaaS provides virtual machines, storage and networking on demand."],
      ["Which model offers ready-to-run applications?", "SaaS", "Software as a Service delivers complete applications over the web."],
      ["What is PaaS?", "a platform for building and deploying apps", "PaaS supplies runtime, middleware and tools for developers."],
      ["Which deployment is a single-tenant private environment?", "Private cloud", "Private clouds serve one organization exclusively."],
      ["What is a public cloud?", "shared infrastructure offered over the internet", "Public clouds (AWS, Azure, GCP) pool resources for many customers."],
      ["What is a hybrid cloud?", "a mix of private and public clouds", "Hybrid clouds combine on-premise and public resources with orchestration."],
      ["What does serverless mean?", "no server management by the developer", "Serverless platforms run code on demand and scale automatically."],
      ["What is auto-scaling?", "adjusting resources automatically with demand", "Auto-scaling adds or removes capacity based on load."]
    ],
    "Providers and Terms": [
      ["Which company offers Amazon Web Services?", "Amazon", "AWS is Amazon's cloud platform, the largest public cloud provider."],
      ["Which Microsoft product is a cloud platform?", "Microsoft Azure", "Azure is Microsoft's cloud computing service."],
      ["Which Google product provides cloud services?", "Google Cloud Platform", "GCP offers Google's compute, storage and AI services."],
      ["What is object storage?", "storage of files with metadata in buckets", "Object storage (S3-style) stores data as objects with unique IDs."],
      ["What is a virtual machine in the cloud?", "a software emulation of a computer", "VMs run full operating systems on shared physical hardware."],
      ["What is a container?", "a packaged app with its runtime", "Containers isolate applications while sharing the host OS kernel."],
      ["What is cloud elasticity?", "the ability to scale resources up and down", "Elasticity lets you pay for exactly the capacity you use."]
    ]
  }),
  makeGen("cyber-security", "Cyber Security — Protection", {
    "Threats": [
      ["What is malware?", "software designed to harm systems", "Malware includes viruses, worms, ransomware and spyware."],
      ["What is phishing?", "fraudulent messages that steal credentials", "Phishing tricks users into revealing passwords or data."],
      ["What is ransomware?", "malware that encrypts files for payment", "Ransomware demands payment to restore encrypted data."],
      ["What is a DDoS attack?", "overwhelming a service with traffic", "Distributed denial-of-service floods a target to make it unavailable."],
      ["What is a Trojan horse?", "malware disguised as legitimate software", "Trojans hide inside trusted-looking programs."],
      ["What is a virus?", "self-replicating code that infects programs", "Viruses attach to files and spread when they are executed."],
      ["What is social engineering?", "manipulating people to reveal secrets", "Social engineering exploits human trust rather than technical flaws."],
      ["What is a brute-force attack?", "trying many passwords rapidly", "Brute-force attacks guess credentials by exhaustive trial."]
    ],
    "Defenses": [
      ["What is encryption?", "converting data into unreadable form", "Encryption protects data; only the key reverses it."],
      ["Which practice keeps accounts safer?", "using strong, unique passwords", "Unique, complex passwords limit damage if one leaks."],
      ["What is two-factor authentication?", "requiring a second proof of identity", "2FA adds a code or device check beyond the password."],
      ["What does a firewall filter?", "network traffic by rules", "Firewalls permit or block packets according to policy."],
      ["What is an antivirus?", "software that detects and removes malware", "Antivirus scans files against known malware signatures."],
      ["What is a security patch?", "an update fixing vulnerabilities", "Patches close holes attackers could exploit."],
      ["What is multi-factor authentication?", "authentication using two or more factors", "MFA combines knowledge, possession and biometric factors."],
      ["What is data backup for?", "recovering data after loss or attack", "Backups restore information after failures, disasters or ransomware."]
    ]
  }),
  makeGen("ai", "Artificial Intelligence — Basics", {
    "AI Concepts": [
      ["What is artificial intelligence?", "machines performing tasks that need human intelligence", "AI systems learn, reason and perceive to solve problems."],
      ["Which field studies systems that learn from data?", "Machine learning", "Machine learning builds models that improve from experience."],
      ["What is a neural network?", "computing layers inspired by the brain", "Neural networks learn patterns through connected layers of neurons."],
      ["What is natural language processing?", "computers understanding human language", "NLP powers translation, chatbots and text analysis."],
      ["What is computer vision?", "machines interpreting images and video", "Computer vision recognizes objects, faces and scenes."],
      ["What is an expert system?", "a system encoding human expertise", "Expert systems apply rule bases to answer questions in a domain."],
      ["What is the Turing test?", "a test of machine conversational intelligence", "A machine passes when a judge cannot tell it from a human."],
      ["What is a chatbot?", "a program that converses with users", "Chatbots simulate conversation for support and services."],
      ["What is robotics?", "building machines that act autonomously", "Robotics combines mechanics, sensing and AI."],
      ["What is an intelligent agent?", "software that acts to achieve goals", "Agents perceive their environment and choose actions."]
    ],
    "AI in Practice": [
      ["Which assistant uses AI for voice search?", "a virtual assistant", "Virtual assistants like Siri and Google Assistant use speech AI."],
      ["What is speech recognition?", "converting spoken words to text", "Speech recognition powers dictation and voice commands."],
      ["What is translation AI used for?", "converting text between languages", "Neural machine translation delivers fluent cross-language text."],
      ["What is an autonomous vehicle?", "a vehicle that drives itself", "Self-driving cars use sensors and AI for navigation."],
      ["Which AI field generates images from text?", "generative AI", "Generative models create images, audio and text from prompts."],
      ["What is a recommendation system?", "software suggesting items to users", "Recommenders model user preferences from history."]
    ]
  }),
  makeGen("machine-learning", "Machine Learning — Methods", {
    "Supervised Learning": [
      ["Which task predicts a continuous value?", "Regression", "Regression models estimate quantities like price or temperature."],
      ["Which task assigns discrete categories?", "Classification", "Classifiers label inputs into classes, e.g. spam or not."],
      ["Which algorithm splits data by features?", "Decision tree", "Decision trees partition data with rule-like nodes."],
      ["What is overfitting?", "the model memorizing training data", "Overfit models fail on new data because they learned noise."],
      ["What is training data?", "examples used to teach the model", "Models learn patterns from labeled training examples."],
      ["What is a label in supervised learning?", "the correct output for an example", "Labels pair each training example with its true answer."],
      ["Which metric measures classification accuracy?", "the fraction of correct predictions", "Accuracy = correct predictions ÷ total predictions."],
      ["What is a training-test split?", "separating data for learning and evaluation", "The model trains on one portion and is tested on a held-out portion."]
    ],
    "Unsupervised and Practice": [
      ["Which task groups similar items without labels?", "Clustering", "Clustering finds natural groupings in unlabeled data."],
      ["Which algorithm is a popular clustering method?", "K-means", "K-means partitions data into K clusters around centroids."],
      ["What is feature engineering?", "creating useful input variables", "Good features dramatically improve model performance."],
      ["What is a hyperparameter?", "a setting chosen before training", "Hyperparameters like learning rate control the training process."],
      ["What is cross-validation?", "repeated train-test evaluation", "Cross-validation estimates performance reliably by rotating folds."],
      ["What is a confusion matrix?", "a table of predicted vs actual classes", "It shows true/false positives and negatives."],
      ["What is gradient descent?", "iterative optimization of a model", "Gradient descent minimizes loss by stepping downhill."],
      ["What is bias in machine learning?", "systematic model error", "Bias underfits; variance overfits. Balance matters."]
    ]
  }),
  makeGen("deep-learning", "Deep Learning — Networks", {
    "Neural Networks": [
      ["Which layer type processes spatial images?", "Convolutional layer", "CNNs use convolutions to detect features in images."],
      ["Which network processes sequential data?", "Recurrent neural network", "RNNs carry state across time steps for sequences."],
      ["What is an activation function?", "a non-linearity applied to neuron outputs", "Activations like ReLU let networks learn complex functions."],
      ["Which architecture powers transformers?", "attention mechanisms", "Transformers use self-attention and power modern LLMs."],
      ["What is a loss function?", "a measure of prediction error", "Training minimizes the loss to improve predictions."],
      ["What is a gradient?", "the direction of steepest loss increase", "Backpropagation uses gradients to update weights."],
      ["What is backpropagation?", "computing gradients through the network", "Backpropagation propagates error backward to update weights."],
      ["What is a convolutional layer used for?", "detecting spatial features", "Convolutions learn local patterns like edges and shapes."],
      ["What is a pooling layer?", "downsampling to reduce size", "Pooling shrinks feature maps, adding translation robustness."],
      ["What is an epoch?", "one full pass over the training data", "Models train for many epochs, updating weights each pass."]
    ],
    "LLMs and Practice": [
      ["What does LLM stand for?", "Large Language Model", "LLMs generate text by predicting the next token."],
      ["What is a token in language models?", "a unit of text", "Tokens are words, subwords or characters the model processes."],
      ["What is a prompt?", "the input given to a language model", "Prompts steer the model's output."],
      ["What is fine-tuning?", "further training a pretrained model", "Fine-tuning adapts a base model to a specific task."],
      ["What is a GPU good for in deep learning?", "parallel matrix math", "GPUs accelerate the heavy tensor operations of training."],
      ["What is transfer learning?", "reusing a pretrained model", "Transfer learning adapts trained weights to new tasks with less data."],
      ["What is hallucination in LLMs?", "confidently wrong output", "Hallucinations are plausible but false generated content."]
    ]
  }),
  makeGen("data-science", "Data Science — Workflow", {
    "Data Handling": [
      ["What is a dataset?", "a collection of data rows and columns", "Datasets hold the observations and features for analysis."],
      ["What is data cleaning?", "fixing errors and missing values", "Cleaning removes duplicates, outliers and gaps before analysis."],
      ["What is a variable in data science?", "a measurable attribute", "Variables (columns) hold values observed across records."],
      ["Which type is a variable with categories?", "Categorical", "Categorical variables take values from a set of classes."],
      ["What is a numeric variable?", "a value measured on a number scale", "Numeric variables support arithmetic like means and totals."],
      ["What is missing data?", "absent values in a dataset", "Missing values are handled by imputation or removal."],
      ["What is an outlier?", "a value far from the rest", "Outliers can distort averages and models."],
      ["What is data visualization?", "presenting data graphically", "Charts reveal patterns and relationships at a glance."]
    ],
    "Analysis and Tools": [
      ["Which language is popular for data science?", "Python", "Python offers pandas, NumPy and scikit-learn for data work."],
      ["What is a DataFrame?", "a tabular data structure", "DataFrames (pandas) hold labeled rows and columns."],
      ["What is correlation?", "a measure of relationship between variables", "Correlation ranges from −1 to +1; zero means no linear relation."],
      ["What is a scatter plot?", "points showing two variables", "Scatter plots reveal association between two numeric variables."],
      ["What is a histogram?", "a bar chart of value frequencies", "Histograms show the distribution of one variable."],
      ["What is feature selection?", "choosing the most useful variables", "Feature selection reduces noise and improves models."]
    ]
  }),
  makeGen("software-eng", "Software Engineering — Process", {
    "SDLC": [
      ["What does SDLC stand for?", "Software Development Life Cycle", "SDLC is the process of planning, building and maintaining software."],
      ["Which phase gathers user requirements?", "Requirements analysis", "Requirements define what the system must do before design."],
      ["Which phase designs the architecture?", "Design", "Design specifies components, modules and data flows."],
      ["Which phase writes the code?", "Implementation", "Implementation converts design into working code."],
      ["What is testing?", "verifying software meets requirements", "Testing finds defects before release."],
      ["Which model delivers in small increments?", "Agile", "Agile iterates in short cycles with continuous feedback."],
      ["What is a sprint?", "a short fixed-length development cycle", "Sprints (Scrum) deliver a working increment each iteration."],
      ["What is the waterfall model?", "sequential phases without overlap", "Waterfall completes each phase fully before the next."],
      ["What is a use case?", "a description of user-system interaction", "Use cases capture functional requirements from a user's view."],
      ["What is a bug?", "a defect in software", "Bugs cause incorrect behavior and are fixed in maintenance."]
    ],
    "Practices": [
      ["What is version control?", "tracking changes to code", "Version control systems record history and enable collaboration."],
      ["What is a pull request?", "a proposed code change for review", "Pull requests let teams review and merge changes."],
      ["What is code review?", "examining code before merging", "Reviews catch defects and improve quality."],
      ["What is unit testing?", "testing individual functions", "Unit tests verify the smallest testable parts."],
      ["What is debugging?", "finding and fixing errors", "Debugging locates the cause of incorrect behavior."],
      ["What is documentation?", "written explanation of the system", "Docs help users and future developers."],
      ["What is refactoring?", "improving code without changing behavior", "Refactoring keeps code clean and maintainable."],
      ["What is a deployment?", "releasing software to users", "Deployment ships the build to production."]
    ]
  }),
  makeGen("git-github", "Git & GitHub — Version Control", {
    "Git Basics": [
      ["Which command initializes a repository?", "git init", "git init creates a new repository in the current folder."],
      ["Which command stages changes?", "git add", "git add moves changes into the staging area."],
      ["Which command records staged changes?", "git commit", "git commit saves a snapshot with a message."],
      ["Which command shows the working tree status?", "git status", "git status lists modified and staged files."],
      ["Which command downloads a repository?", "git clone", "git clone copies a remote repository locally."],
      ["Which command updates from a remote?", "git pull", "git pull fetches and merges remote changes."],
      ["Which command sends commits to a remote?", "git push", "git push uploads local commits to the remote branch."],
      ["Which command shows commit history?", "git log", "git log lists commits with messages and hashes."],
      ["What is a branch?", "an independent line of development", "Branches isolate features until merged."],
      ["Which command switches branches?", "git checkout", "git checkout (or git switch) moves between branches."],
      ["What is a merge?", "combining branches", "Merging integrates changes from one branch into another."],
      ["Which command creates a new branch?", "git branch", "git branch lists or creates branches."],
      ["What is a commit hash?", "a unique ID of a commit", "Hashes identify commits and enable history navigation."],
      ["What is the default branch name in modern Git?", "main", "New repositories commonly use main as the default branch."]
    ],
    "GitHub Workflows": [
      ["What is a repository?", "a project folder tracked by Git", "Repositories store code, history and collaboration tools."],
      ["What is an issue?", "a reported task or bug", "Issues track bugs, features and discussions."],
      ["What is a fork?", "a personal copy of a repository", "Forks let contributors experiment without affecting the original."],
      ["What is a README?", "a project's front-page documentation", "READMEs explain what the project is and how to use it."],
      ["What is CI/CD?", "automated build, test and deploy", "CI/CD pipelines validate and ship code automatically."],
      ["What is a workflow in GitHub Actions?", "an automated process in YAML", "Workflows run jobs on events like push or PR."],
      ["What is a release?", "a tagged, distributable version", "Releases package software for users."],
      ["What is a tag?", "a named pointer to a commit", "Tags mark version points like v1.0.0."]
    ]
  }),
  makeGen("docker", "Docker — Containers", {
    "Container Basics": [
      ["What is a Docker image?", "a read-only template for containers", "Images bundle an application with its environment."],
      ["What is a container?", "a running instance of an image", "Containers are isolated, lightweight processes."],
      ["Which file defines how to build an image?", "Dockerfile", "The Dockerfile lists instructions for building the image."],
      ["Which command builds an image?", "docker build", "docker build compiles a Dockerfile into an image."],
      ["Which command runs a container?", "docker run", "docker run starts a container from an image."],
      ["Which command lists running containers?", "docker ps", "docker ps shows active containers."],
      ["What is Docker Hub?", "a registry of public images", "Docker Hub hosts images for sharing and reuse."],
      ["What is a volume?", "persistent storage for containers", "Volumes survive container removal."],
      ["Which command removes unused resources?", "docker system prune", "Pruning deletes dangling images and stopped containers."],
      ["What does docker-compose do?", "runs multi-container apps", "Compose defines services, networks and volumes in YAML."]
    ],
    "Orchestration": [
      ["What is container orchestration?", "managing many containers automatically", "Orchestrators deploy, scale and heal container fleets."],
      ["Which tool is a leading orchestrator?", "Kubernetes", "Kubernetes automates deployment, scaling and operations."],
      ["What is a pod in Kubernetes?", "the smallest deployable unit", "A pod runs one or more containers sharing networking."],
      ["What is a deployment in Kubernetes?", "a controller for replica pods", "Deployments manage rolling updates and replicas."],
      ["What is a service in Kubernetes?", "a stable network endpoint", "Services expose pods under a fixed address."],
      ["What is a namespace?", "a partition of cluster resources", "Namespaces separate environments like dev and prod."]
    ]
  }),
  makeGen("linux", "Linux — System Administration", {
    "Commands": [
      ["Which command lists files?", "ls", "ls shows directory contents."],
      ["Which command changes directory?", "cd", "cd moves the shell into another directory."],
      ["Which command prints the current directory?", "pwd", "pwd outputs the working directory path."],
      ["Which command copies files?", "cp", "cp source destination duplicates files or directories."],
      ["Which command moves or renames files?", "mv", "mv relocates or renames files."],
      ["Which command removes files?", "rm", "rm deletes files (use -r for directories)."],
      ["Which command shows file contents?", "cat", "cat prints a file's contents to the terminal."],
      ["Which command creates a directory?", "mkdir", "mkdir makes a new directory."],
      ["Which command shows running processes?", "ps", "ps lists processes with their PIDs."],
      ["Which command kills a process?", "kill", "kill PID sends a termination signal to a process."],
      ["Which command shows disk usage?", "df", "df reports filesystem space usage."],
      ["Which command searches files by name?", "find", "find locates files matching name and type criteria."],
      ["Which command shows manual pages?", "man", "man command displays its manual page."],
      ["Which command prints text?", "echo", "echo outputs its arguments to the terminal."],
      ["Which command checks network connectivity?", "ping", "ping tests reachability of a host."]
    ],
    "Administration": [
      ["Who is the superuser in Linux?", "root", "root has unrestricted access to the system."],
      ["Which command runs with superuser privileges?", "sudo", "sudo executes a command as root after authentication."],
      ["Which file lists users?", "/etc/passwd", "/etc/passwd stores account records."],
      ["What is the shell?", "the command interpreter", "The shell (bash, zsh) reads and executes commands."],
      ["Which directory stores system logs?", "/var/log", "System and service logs live under /var/log."],
      ["What is a daemon?", "a background service process", "Daemons run continuously, serving requests."],
      ["Which command displays environment variables?", "env", "env prints the current environment."],
      ["What is the home directory?", "the user's personal folder", "Each user has a home directory (e.g. /home/ali)."],
      ["Which permission set is rwx?", "read, write, execute", "rwx grants reading, writing and execution."],
      ["Which command changes file permissions?", "chmod", "chmod modifies read/write/execute bits."],
      ["Which command changes file ownership?", "chown", "chown assigns a file to a user and group."],
      ["What is a process ID?", "the number identifying a process", "PIDs let you manage individual processes."]
    ]
  }),
  makeGen("windows", "Windows — Usage", {
    "Interface and Shortcuts": [
      ["Which key opens the Start menu in Windows?", "Windows key", "The Win key toggles the Start menu."],
      ["Which shortcut opens File Explorer?", "Windows + E", "Win+E opens a File Explorer window."],
      ["Which shortcut copies a file?", "Ctrl + C", "Ctrl+C copies; Ctrl+V pastes in Windows."],
      ["Which shortcut cuts an item?", "Ctrl + X", "Ctrl+X removes an item to the clipboard for moving."],
      ["Which shortcut selects all items?", "Ctrl + A", "Ctrl+A selects everything in the current view."],
      ["Which shortcut undoes an action?", "Ctrl + Z", "Ctrl+Z undoes the last operation."],
      ["Which shortcut switches between windows?", "Alt + Tab", "Alt+Tab cycles through open applications."],
      ["Which shortcut closes the active window?", "Alt + F4", "Alt+F4 closes the current window or app."],
      ["Which shortcut opens Task Manager?", "Ctrl + Shift + Esc", "Ctrl+Shift+Esc opens Task Manager directly."],
      ["Which shortcut locks the screen?", "Windows + L", "Win+L locks the workstation instantly."]
    ],
    "System Concepts": [
      ["What is the Recycle Bin?", "a holding area for deleted files", "Deleted files go to the Recycle Bin until emptied."],
      ["What is the Control Panel used for?", "changing system settings", "Control Panel (and Settings) manage system configuration."],
      ["What is a device driver?", "software that lets hardware work with the OS", "Drivers translate OS calls for specific hardware."],
      ["What does defragmenting do?", "reorganizes files on disk", "Defragmentation consolidates scattered data for faster access."],
      ["What is Safe Mode?", "Windows with minimal drivers and services", "Safe Mode helps diagnose startup problems."],
      ["What is an update?", "a patch improving security or features", "Windows Update delivers fixes and enhancements."],
      ["What is the Desktop?", "the main screen of Windows", "The Desktop hosts icons, the taskbar and wallpaper."],
      ["What does 'Ctrl + Alt + Delete' do?", "opens security options", "It opens lock, user switching and Task Manager options."]
    ]
  }),
  makeGen("html", "HTML — Markup", {
    "Elements": [
      ["Which tag defines a heading?", "h1-h6", "Heading tags h1 to h6 define document headings by level."],
      ["Which tag creates a hyperlink?", "a", "The <a> tag links to another page or location."],
      ["Which tag embeds an image?", "img", "The <img> tag displays an image using the src attribute."],
      ["Which tag creates an unordered list?", "ul", "<ul> makes a bulleted list; <ol> a numbered list."],
      ["Which tag creates a table row?", "tr", "Table rows use <tr>, cells <td> and headers <th>."],
      ["Which tag defines a paragraph?", "p", "The <p> tag wraps a paragraph of text."],
      ["Which attribute gives an element a unique identifier?", "id", "id must be unique per page; class can repeat."],
      ["Which tag creates an input field?", "input", "<input> creates form controls like text boxes."],
      ["Which tag makes text bold?", "strong", "<strong> marks important text, typically bold."],
      ["Which tag embeds a video?", "video", "The <video> tag plays media with controls attribute."],
      ["Which tag defines a form?", "form", "<form> wraps inputs that submit data."],
      ["Which tag adds a line break?", "br", "<br> inserts a line break without a new block."],
      ["Which tag defines a division or section?", "div", "<div> is a block-level container for layout."],
      ["What does HTML stand for?", "HyperText Markup Language", "HTML structures content on the web."],
      ["Which tag defines a list item?", "li", "List items inside <ul> or <ol> use <li>."],
      ["Which tag makes text italic?", "em", "<em> emphasizes text, typically rendered italic."]
    ],
    "Semantics and Attributes": [
      ["Which tag marks the main content area?", "main", "<main> holds the primary content of the page."],
      ["Which tag defines a navigation section?", "nav", "<nav> marks site navigation links."],
      ["Which tag defines a page header?", "header", "<header> contains introductory or navigational content."],
      ["Which tag defines a footer?", "footer", "<footer> holds closing information like copyright."],
      ["Which tag is used for an article?", "article", "<article> represents a self-contained composition."],
      ["Which attribute gives alternative text to images?", "alt", "alt text aids accessibility and SEO."],
      ["Which attribute makes an element clickable to open a link?", "href", "href holds the destination URL of links."],
      ["Which attribute defines the character encoding?", "charset", "charset (UTF-8) declares the document encoding."],
      ["Which tag is self-closing for an image?", "img", "The img element is void and has no closing tag."],
      ["Which tag defines an ordered list?", "ol", "<ol> creates a numbered list."]
    ]
  }),
  makeGen("css", "CSS — Styling", {
    "Selectors and Properties": [
      ["What does CSS stand for?", "Cascading Style Sheets", "CSS styles the presentation of HTML documents."],
      ["Which property changes text color?", "color", "color sets the foreground color of text."],
      ["Which property sets the background color?", "background-color", "background-color fills an element's backdrop."],
      ["Which property controls font size?", "font-size", "font-size sets text dimensions in px, rem or em."],
      ["Which property adds space inside an element?", "padding", "Padding is the space between content and border."],
      ["Which property adds space outside an element?", "margin", "Margin is the space between an element and its neighbors."],
      ["Which property hides an element but keeps its space?", "visibility: hidden", "visibility hidden keeps layout; display:none removes it."],
      ["Which selector targets an element by id?", "#id", "The hash selector #id matches one element."],
      ["Which selector targets elements by class?", ".class", "The dot selector .class matches all elements with that class."],
      ["Which property rounds corners?", "border-radius", "border-radius curves an element's corners."],
      ["Which property sets element width?", "width", "width defines the horizontal size of an element."],
      ["Which unit is relative to the root font size?", "rem", "1rem equals the root element's font size."],
      ["Which property aligns text to the center?", "text-align", "text-align: center centers text within its box."],
      ["Which property changes font family?", "font-family", "font-family lists preferred typefaces."]
    ],
    "Layout and Flexbox": [
      ["Which value of display creates a flex container?", "flex", "display:flex enables flexbox layout."],
      ["Which property aligns flex items on the main axis?", "justify-content", "justify-content distributes items along the main axis."],
      ["Which property aligns flex items on the cross axis?", "align-items", "align-items controls cross-axis alignment."],
      ["Which property sets the direction of flex items?", "flex-direction", "flex-direction chooses row or column layout."],
      ["What is responsive design?", "layouts that adapt to screen size", "Media queries and flexible units create responsive sites."],
      ["Which at-rule applies styles conditionally?", "@media", "@media queries adapt styles to viewport features."],
      ["Which property makes an element a grid container?", "display: grid", "Grid layout arranges items in rows and columns."],
      ["What is the cascade?", "the order of style resolution", "The cascade resolves conflicting rules by specificity and order."],
      ["Which property controls stacking order?", "z-index", "z-index places positioned elements in layers."],
      ["Which property makes text bold?", "font-weight", "font-weight: bold thickens the text."]
    ]
  }),
  makeGen("bootstrap", "Bootstrap — Framework", {
    "Grid and Components": [
      ["Which class system does Bootstrap use for layout?", "grid", "Bootstrap's 12-column grid powers responsive layouts."],
      ["Which class makes a responsive container?", "container", ".container centers content with responsive widths."],
      ["Which class creates a primary button?", "btn btn-primary", "Combining .btn with .btn-primary styles a blue button."],
      ["Which class adds a card?", "card", ".card wraps content in a styled box with header/footer."],
      ["Which class creates a navigation bar?", "navbar", ".navbar builds responsive navigation bars."],
      ["Which class shows an element only on small screens?", "d-sm-block", "Display utilities like d-sm-block control breakpoint visibility."],
      ["How many columns does the default Bootstrap grid have?", "12", "Row children span 1 to 12 grid columns (col-6 = half)."],
      ["Which class centers text?", "text-center", ".text-center aligns text centrally."],
      ["Which class creates a badge?", "badge", ".badge styles small labels like counts."],
      ["Which class builds an alert message?", "alert", ".alert with .alert-warning etc. styles notifications."]
    ],
    "Utilities": [
      ["Which class adds margin?", "m-*", "Utilities like m-3 add margin; p-3 adds padding."],
      ["Which class adds padding?", "p-*", "p-2 gives 0.5rem padding on all sides."],
      ["Which class makes an image responsive?", "img-fluid", ".img-fluid caps width at 100% of its container."],
      ["Which class hides an element?", "d-none", ".d-none sets display:none."],
      ["Which class makes an element flex?", "d-flex", ".d-flex applies display:flex."],
      ["Which class adds rounded corners?", "rounded", ".rounded gives border-radius; .rounded-circle makes circles."],
      ["Which class sets text color to muted gray?", "text-muted", ".text-muted tints text with a gray tone."],
      ["Which class makes a button full-width?", "btn-block", ".btn-block stretches buttons across the container."],
      ["Which class floats right?", "float-right", ".float-right aligns an element rightward."],
      ["Which class centers content horizontally?", "mx-auto", ".mx-auto centers block elements with auto margins."]
    ]
  }),
  makeGen("tailwind-css", "Tailwind CSS — Utility Framework", {
    "Utility Concepts": [
      ["What is Tailwind CSS?", "a utility-first CSS framework", "Tailwind composes styles from small utility classes."],
      ["Which class sets padding?", "p-4", "p-4 applies 1rem padding on all sides."],
      ["Which class sets margin?", "m-2", "m-2 applies 0.5rem margin."],
      ["Which class makes a flex container?", "flex", "Tailwind's flex utility sets display:flex."],
      ["Which class centers flex items?", "items-center", "items-center centers items on the cross axis."],
      ["Which class sets text size?", "text-lg", "text-lg sets large font size; text-sm small."],
      ["Which class sets text color?", "text-red-500", "Color utilities pair a color with a shade (text-red-500)."],
      ["Which class adds background color?", "bg-blue-600", "bg-blue-600 fills the background with blue shade 600."],
      ["Which class rounds corners?", "rounded-lg", "rounded-lg applies large corner radius."],
      ["Which class makes responsive layout?", "sm:md:lg: prefixes", "Breakpoint prefixes apply utilities at screen sizes."],
      ["Which class hides an element?", "hidden", "hidden applies display:none."],
      ["Which class adds a shadow?", "shadow-lg", "shadow-lg adds a large drop shadow."]
    ]
  }),
  makeGen("rest-api", "REST APIs — Design", {
    "HTTP and Methods": [
      ["What does REST stand for?", "Representational State Transfer", "REST is an architectural style for web services."],
      ["Which HTTP method retrieves data?", "GET", "GET fetches resources without side effects."],
      ["Which HTTP method creates a resource?", "POST", "POST submits data to create new resources."],
      ["Which HTTP method updates a resource?", "PUT", "PUT replaces a resource entirely; PATCH updates partially."],
      ["Which HTTP method deletes a resource?", "DELETE", "DELETE removes a specified resource."],
      ["Which status code means success?", "200", "200 OK signals a successful request."],
      ["Which status code means 'not found'?", "404", "404 indicates the resource does not exist."],
      ["Which status code means 'unauthorized'?", "401", "401 signals missing or invalid authentication."],
      ["Which status code means 'bad request'?", "400", "400 marks invalid client requests."],
      ["What is an endpoint?", "a URL that accepts requests", "Endpoints map URLs to API operations."],
      ["What is a payload?", "the data sent with a request", "Payloads carry JSON or other bodies for POST/PUT."],
      ["What is statelessness in REST?", "each request carrying its own context", "Stateless servers don't store client session data."]
    ]
  }),
  makeGen("graphql", "GraphQL — Query Language", {
    "Concepts": [
      ["What is GraphQL?", "a query language for APIs", "GraphQL lets clients request exactly the fields they need."],
      ["Which operation fetches data in GraphQL?", "query", "Queries read data; mutations write it."],
      ["Which operation changes data?", "mutation", "Mutations create, update or delete data."],
      ["What is a schema in GraphQL?", "the typed contract of the API", "Schemas define types, queries and mutations."],
      ["What is a resolver?", "a function that returns field data", "Resolvers connect schema fields to data sources."],
      ["What is a subscription?", "a live stream of updates", "Subscriptions push real-time events to clients."],
      ["What is an argument?", "a value passed to a field", "Arguments filter and shape query results."],
      ["Which tool explores GraphQL APIs?", "GraphiQL or Playground", "Interactive explorers test queries against the schema."],
      ["What is a fragment?", "a reusable field set", "Fragments reduce duplication across queries."],
      ["What is introspection?", "querying the schema itself", "Introspection describes available types and fields."]
    ]
  }),
  makeGen("node-js", "Node.js — Runtime", {
    "Runtime Concepts": [
      ["What is Node.js?", "a JavaScript runtime on the server", "Node runs JavaScript outside the browser via V8."],
      ["What is npm?", "the Node package manager", "npm installs and manages JavaScript packages."],
      ["Which file lists a Node project's dependencies?", "package.json", "package.json records metadata, scripts and dependencies."],
      ["What is the event loop?", "the mechanism handling async work", "The event loop processes callbacks and I/O without blocking."],
      ["Which module reads files?", "fs", "The fs module provides file system operations."],
      ["Which module handles HTTP servers?", "http", "The http module builds servers and clients."],
      ["What is CommonJS?", "a module system using require", "require() loads modules; module.exports shares them."],
      ["What is a callback?", "a function run after an operation", "Callbacks handle asynchronous results in Node."],
      ["What is a promise?", "an object representing future completion", "Promises chain .then() for async success and failure."],
      ["What is Express?", "a popular Node web framework", "Express simplifies routing and middleware for web apps."]
    ]
  }),
  makeGen("express-js", "Express.js — Framework", {
    "Routing and Middleware": [
      ["Which method defines a GET route in Express?", "app.get()", "app.get(path, handler) responds to GET requests."],
      ["What is middleware?", "functions running between request and response", "Middleware processes requests for logging, auth and parsing."],
      ["Which middleware parses JSON bodies?", "express.json()", "express.json() reads JSON request bodies."],
      ["Which method serves static files?", "express.static()", "express.static serves assets like CSS and images."],
      ["What is a route parameter?", "a dynamic segment of the path", "Routes like /user/:id capture :id as req.params.id."],
      ["Which object carries the response?", "res", "res.send(), res.json() return the response."],
      ["Which object carries the request?", "req", "req holds params, query, body and headers."],
      ["Which status method sends a 404?", "res.status(404).send()", "Chain res.status() with send() or json()."],
      ["What is a route handler?", "a function handling a request", "Handlers receive (req, res, next) and respond."],
      ["Which method chains error handlers?", "app.use()", "app.use() registers middleware including error handlers."]
    ]
  }),
  makeGen("react", "React — UI Library", {
    "Components and State": [
      ["What is a React component?", "a function or class returning UI", "Components render elements and manage state."],
      ["Which hook stores state in a component?", "useState", "useState returns the state value and its setter."],
      ["Which hook runs side effects?", "useEffect", "useEffect runs code after render, like data fetching."],
      ["What is JSX?", "JavaScript syntax for elements", "JSX mixes HTML-like markup into JavaScript."],
      ["What are props?", "data passed into components", "Props are read-only inputs from parent components."],
      ["What is a key prop used for?", "identifying list items", "Keys help React reconcile lists efficiently."],
      ["Which hook shares state across the app?", "useContext", "Context provides global values without prop drilling."],
      ["What is a virtual DOM?", "an in-memory representation of the UI", "React diffs the virtual DOM to update the real one efficiently."],
      ["Which command creates a React app?", "npx create-react-app", "CRA scaffolds a full React project."],
      ["What is a state update?", "a change that triggers re-render", "setState re-renders the component with new values."],
      ["Which hook references DOM nodes?", "useRef", "useRef holds mutable references without re-rendering."],
      ["What is conditional rendering?", "showing UI based on conditions", "Ternary expressions and && render conditionally."]
    ]
  }),
  makeGen("vue-js", "Vue.js — Framework", {
    "Vue Concepts": [
      ["What is Vue.js?", "a progressive JavaScript framework", "Vue builds UIs with components and reactive data."],
      ["Which attribute binds data in Vue templates?", "v-bind or :", "v-bind (:) binds element attributes to data."],
      ["Which directive loops over lists?", "v-for", "v-for renders lists: v-for=\"item in items\"."],
      ["Which directive handles click events?", "v-on or @", "v-on (@) attaches event handlers."],
      ["Which directive shows or hides elements?", "v-if", "v-if conditionally renders elements."],
      ["What is a computed property?", "a derived, cached value", "Computed properties update from reactive dependencies."],
      ["What is a watcher?", "code reacting to data changes", "Watchers run logic when a property changes."],
      ["What is a component?", "a reusable UI unit", "Components encapsulate template, script and style."],
      ["Which attribute passes props to a child?", "v-bind on the child tag", "Props flow downward through bindings."],
      ["Which CLI scaffolds a Vue app?", "Vue CLI or Vite", "Vite and Vue CLI generate starter projects."]
    ]
  }),
  makeGen("angular", "Angular — Platform", {
    "Angular Concepts": [
      ["What is Angular?", "a TypeScript-based web framework", "Angular provides a complete platform with CLI and DI."],
      ["What is a component in Angular?", "a class with template and styles", "Components are the building blocks of Angular apps."],
      ["Which decorator marks a component?", "@Component", "@Component configures selector, template and styles."],
      ["Which feature binds data to templates?", "interpolation and property binding", "{{ }} interpolates values; [prop] binds properties."],
      ["What is dependency injection?", "providing services to components", "DI supplies services declared in providers."],
      ["Which decorator marks a service?", "@Injectable", "@Injectable makes a class injectable."],
      ["Which tool builds an Angular project?", "Angular CLI (ng)", "ng new, ng serve and ng build manage projects."],
      ["Which module root do apps import?", "AppModule", "The root module bootstraps the application."],
      ["Which feature handles forms?", "Reactive and Template forms", "Angular offers two form systems with validation."],
      ["What is a directive?", "an attribute that changes DOM behavior", "Directives like *ngIf alter rendering."],
      ["Which routing object maps URLs to components?", "Routes", "The router navigates between component views."],
      ["What is TypeScript?", "a typed superset of JavaScript", "Angular uses TypeScript throughout."]
    ]
  }),
  makeGen("laravel", "Laravel — PHP Framework", {
    "Laravel Concepts": [
      ["What is Laravel?", "a PHP web framework", "Laravel provides routing, ORM, templating and auth."],
      ["Which ORM does Laravel use?", "Eloquent", "Eloquent maps models to database tables."],
      ["Which templating engine does Laravel use?", "Blade", "Blade templates compile to plain PHP."],
      ["Which command creates a model?", "php artisan make:model", "Artisan CLI scaffolds models, controllers and more."],
      ["Which file defines routes?", "routes/web.php", "Web routes are declared in routes/web.php."],
      ["What is migration in Laravel?", "a versioned schema change", "Migrations alter the database schema predictably."],
      ["Which command runs migrations?", "php artisan migrate", "migrate applies pending schema changes."],
      ["What is a controller?", "a class handling HTTP requests", "Controllers group route logic."],
      ["What is middleware in Laravel?", "filters running on requests", "Middleware handles auth, CORS and logging."],
      ["Which queue system processes jobs?", "Laravel Queues", "Queues defer heavy jobs to workers."]
    ]
  }),
  makeGen("django", "Django — Python Framework", {
    "Django Concepts": [
      ["What is Django?", "a high-level Python web framework", "Django provides ORM, admin, auth and routing."],
      ["Which command creates a project?", "django-admin startproject", "startproject scaffolds the project directory."],
      ["Which command creates an app?", "python manage.py startapp", "startapp generates an app module."],
      ["Which file defines URL routes?", "urls.py", "URLconfs map paths to views."],
      ["What is a view in Django?", "a function or class returning a response", "Views process requests and return HTTP responses."],
      ["What is the Django ORM?", "an object-relational mapper", "ORM queries the database with Python code."],
      ["Which admin interface ships with Django?", "the Django admin", "Django admin manages models via the browser."],
      ["Which template language does Django use?", "Django template language", "Templates use {{ }} and {% %} tags."],
      ["What is a model?", "a Python class mapped to a table", "Models define fields and database behavior."],
      ["Which command runs migrations?", "python manage.py migrate", "migrate applies model changes to the database."]
    ]
  }),
  makeGen("flask", "Flask — Python Microframework", {
    "Flask Concepts": [
      ["What is Flask?", "a lightweight Python web framework", "Flask provides routing with minimal boilerplate."],
      ["Which decorator registers a route?", "@app.route()", "@app.route('/') binds a URL to a view function."],
      ["Which object handles requests?", "request", "The request object carries method, args and JSON."],
      ["Which function renders templates?", "render_template()", "render_template fills Jinja templates."],
      ["Which template engine does Flask use?", "Jinja2", "Jinja2 renders Flask's HTML templates."],
      ["Which function returns JSON?", "jsonify()", "jsonify serializes dictionaries to JSON responses."],
      ["What is a blueprint?", "a module of routes", "Blueprints organize related routes into modules."],
      ["Which method returns a redirect?", "redirect()", "redirect(url) issues a 302 to another page."],
      ["Which variable holds URL parameters?", "request.args", "request.args exposes query-string parameters."],
      ["Which command runs the dev server?", "flask run", "flask run starts the development server."]
    ]
  }),
  makeGen("spring-boot", "Spring Boot — Java Framework", {
    "Spring Boot Concepts": [
      ["What is Spring Boot?", "a Java framework for rapid applications", "Spring Boot auto-configures production-ready apps."],
      ["Which annotation marks the main class?", "@SpringBootApplication", "This annotation enables auto-configuration and component scan."],
      ["Which annotation maps a REST endpoint?", "@RestController", "@RestController serves JSON responses from mappings."],
      ["Which module provides web features?", "spring-boot-starter-web", "Starters bundle dependencies for specific features."],
      ["What is dependency injection in Spring?", "the container providing beans", "Spring injects required beans via constructors or fields."],
      ["Which annotation marks a service bean?", "@Service", "@Service registers a class in the application context."],
      ["Which annotation marks a database repository?", "@Repository", "@Repository marks data-access components."],
      ["What is Spring Data JPA?", "an ORM layer over JPA", "Spring Data generates repository queries automatically."],
      ["Which file configures the application?", "application.properties", "Properties (or YAML) set ports, datasources and settings."],
      ["Which annotation injects a dependency?", "@Autowired", "@Autowired wires beans into fields or constructors."]
    ]
  }),
  makeGen("dotnet", ".NET — Platform", {
    ".NET Concepts": [
      ["What is .NET?", "a cross-platform development platform", ".NET provides languages, runtime and libraries."],
      ["Which language is primary for .NET?", "C#", "C# is the flagship .NET language."],
      ["What is ASP.NET Core?", "the web framework of .NET", "ASP.NET Core builds web apps and APIs."],
      ["What is the .NET runtime?", "the engine executing managed code", "The runtime handles memory, GC and JIT compilation."],
      ["What is NuGet?", "the .NET package manager", "NuGet supplies libraries and tools to projects."],
      ["What is .NET MAUI?", "a cross-platform UI framework", "MAUI builds mobile and desktop apps from one codebase."],
      ["Which command creates a project?", "dotnet new", "dotnet new console creates a console template."],
      ["Which command builds the project?", "dotnet build", "dotnet build compiles the solution."],
      ["Which command runs the project?", "dotnet run", "dotnet run builds and executes the application."],
      ["What is EF Core?", "the .NET object-relational mapper", "EF Core maps classes to database tables."]
    ]
  }),
  makeGen("kubernetes", "Kubernetes — Orchestration", {
    "Cluster Concepts": [
      ["What is Kubernetes?", "a container orchestration platform", "Kubernetes automates deployment, scaling and management."],
      ["What is a cluster?", "a set of worker and control nodes", "Clusters run containerized workloads across nodes."],
      ["What is a node?", "a machine in the cluster", "Nodes run pods via the kubelet agent."],
      ["What is a pod?", "the smallest deployable unit", "Pods wrap one or more containers."],
      ["What is a deployment?", "a controller managing pods", "Deployments handle scaling and rolling updates."],
      ["What is a service?", "a stable network endpoint", "Services load-balance traffic to pods."],
      ["What is an ingress?", "external HTTP access to services", "Ingress routes outside traffic into the cluster."],
      ["What is a ConfigMap?", "configuration stored separately from pods", "ConfigMaps inject settings without rebuilding images."],
      ["What is a Secret?", "sensitive data like passwords", "Secrets store credentials in base64 form."],
      ["What is a namespace?", "a logical partition of resources", "Namespaces isolate environments and teams."],
      ["What is kubectl?", "the Kubernetes command-line tool", "kubectl manages cluster resources."],
      ["What is Helm?", "a package manager for Kubernetes", "Helm charts deploy applications reproducibly."]
    ]
  }),
  makeGen("big-data", "Big Data — Concepts", {
    "Big Data Basics": [
      ["What are the three Vs of big data?", "Volume, Velocity, Variety", "Big data is defined by its volume, speed and variety."],
      ["What is Hadoop?", "a framework for distributed storage and processing", "Hadoop stores data across clusters and processes it in parallel."],
      ["What is HDFS?", "the Hadoop distributed file system", "HDFS splits files into blocks across nodes."],
      ["What is MapReduce?", "a parallel processing model", "MapReduce maps tasks then reduces results across nodes."],
      ["What is Spark?", "a fast in-memory processing engine", "Spark processes large data faster than disk-based MapReduce."],
      ["What is a data lake?", "a raw storage of all data", "Data lakes hold raw, unstructured and structured data."],
      ["What is a data warehouse?", "structured storage for analytics", "Warehouses organize data into schemas for reporting."],
      ["What is batch processing?", "processing data in bulk at intervals", "Batch jobs run on collected data periodically."],
      ["What is stream processing?", "processing data in real time", "Streams analyze events as they arrive."],
      ["What is ETL?", "extract, transform, load", "ETL moves data from sources into a warehouse."]
    ]
  }),
  makeGen("ethical-hacking", "Ethical Hacking — Security Testing", {
    "Hacking Concepts": [
      ["What is ethical hacking?", "authorized security testing", "Ethical hackers find and report vulnerabilities with permission."],
      ["What is penetration testing?", "simulated attacks on systems", "Pen tests validate defenses like a real attacker would."],
      ["What is reconnaissance?", "gathering information about a target", "Recon is the first phase of an attack or test."],
      ["What is a vulnerability?", "a weakness that can be exploited", "Vulnerabilities are flaws in software or configuration."],
      ["What is an exploit?", "code that takes advantage of a flaw", "Exploits deliver payloads through vulnerabilities."],
      ["What is a zero-day?", "an unknown, unpatched vulnerability", "Zero-days are exploited before vendors can patch."],
      ["What is a backdoor?", "a hidden access path", "Backdoors bypass normal authentication."],
      ["What is a port scan?", "probing open network ports", "Scans reveal services available on a host."],
      ["What is social engineering?", "manipulating people for access", "Human tricks bypass technical controls."],
      ["What is a security audit?", "a formal review of security", "Audits assess policies, controls and compliance."]
    ]
  }),
  makeGen("devops", "DevOps — Practices", {
    "DevOps Concepts": [
      ["What is DevOps?", "combining development and operations", "DevOps automates delivery with culture and tooling."],
      ["What is CI?", "continuously integrating code changes", "CI builds and tests every push automatically."],
      ["What is CD?", "continuous delivery or deployment", "CD ships validated builds to production automatically."],
      ["What is a pipeline?", "an automated sequence of stages", "Pipelines build, test and deploy software."],
      ["What is infrastructure as code?", "managing infrastructure via code", "IaC tools like Terraform define servers declaratively."],
      ["What is monitoring?", "observing system health", "Monitoring alerts on metrics, logs and uptime."],
      ["What is a log?", "a record of events", "Logs trace behavior and errors."],
      ["What is automation?", "replacing manual steps with scripts", "Automation makes releases fast and repeatable."],
      ["What is a deployment strategy?", "how releases reach production", "Strategies include rolling, blue-green and canary."],
      ["What is a runbook?", "documented operating procedures", "Runbooks guide incident response and operations."]
    ]
  }),
  makeGen("programming", "Programming — General Concepts", {
    "Fundamentals": [
      ["What is a variable?", "a named storage for a value", "Variables hold data that programs read and update."],
      ["What is a loop?", "repeated execution of a block", "Loops (for, while) repeat code until a condition ends."],
      ["What is a function?", "a reusable named block of code", "Functions take inputs and return outputs."],
      ["What is an array?", "an ordered collection of values", "Arrays index elements by position."],
      ["What is an algorithm?", "a step-by-step procedure", "Algorithms solve problems in finite, defined steps."],
      ["What is a data structure?", "a way of organizing data", "Structures like stacks and trees enable efficient access."],
      ["What is a stack?", "last-in-first-out storage", "Stacks push and pop from one end (LIFO)."],
      ["What is a queue?", "first-in-first-out storage", "Queues process items in arrival order (FIFO)."],
      ["What is recursion?", "a function calling itself", "Recursion breaks problems into smaller identical ones."],
      ["What is a bug?", "an error in a program", "Bugs cause incorrect program behavior."],
      ["What is debugging?", "finding and removing errors", "Debugging traces execution to locate faults."],
      ["What is a compiler?", "a translator to machine code", "Compilers convert entire source programs before execution."],
      ["What is an interpreter?", "a translator executing line by line", "Interpreters run code directly without a compile step."],
      ["What is a library?", "reusable code others publish", "Libraries expose functions for common tasks."],
      ["What is an IDE?", "an integrated development environment", "IDEs combine editor, debugger and build tools."],
      ["What is pseudocode?", "a plain-language algorithm description", "Pseudocode expresses logic before coding."]
    ]
  }),
  makeGen("reasoning", "Reasoning — Aptitude Concepts", {
    "Aptitude Basics": [
      ["What is aptitude testing?", "measuring learned ability", "Aptitude tests gauge reasoning, numeracy and language skills."],
      ["Which section tests figures and shapes?", "Non-verbal reasoning", "Non-verbal items avoid language and use patterns."],
      ["What is a syllogism?", "a deductive argument of statements", "Syllogisms draw conclusions from premises."],
      ["What is an analogy?", "a comparison of relationships", "Analogies test recognizing similar relationships."],
      ["What is a series?", "a sequence following a rule", "Series questions ask for the next element."],
      ["What is critical thinking?", "evaluating arguments logically", "Critical thinking tests assess reasoning quality."],
      ["What is data sufficiency?", "deciding if data is enough", "These items ask whether statements answer a question."],
      ["What is a statement assumption?", "an unstated premise", "Assumption questions identify hidden premises."]
    ]
  })
];
