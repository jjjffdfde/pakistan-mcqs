/* ============================================================
   Generator file 03 — Programming languages & SQL
   Code-output questions: values computed by the generator itself
   (never eval). Concept pools for definitions.
   ============================================================ */
"use strict";
const L = require("../lib.js");
const ri = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

const LANG_CONCEPTS = {
  python: [
    ["Which keyword defines a function in Python?", "def", "Functions in Python are declared with the `def` keyword followed by the name and parentheses."],
    ["Which data structure in Python stores key-value pairs?", "dict", "A dict maps unique keys to values using curly-brace literal syntax."],
    ["What does the `len()` function return for a string?", "the number of characters", "len() returns the length (character count) of a sequence or collection."],
    ["Which operator raises a number to a power in Python?", "**", "Python uses ** for exponentiation, e.g. 2**3 == 8."],
    ["Which built-in function converts a string to an integer?", "int()", "int('42') returns the integer 42."],
    ["Which keyword handles exceptions in Python?", "try", "Code that may raise an error is placed in a try block and handled in except."],
    ["What is the output of `print(7 // 2)` in Python?", "3", "// is floor division: 7//2 = 3 (fraction discarded)."],
    ["Which method adds an item to the end of a Python list?", "append()", "list.append(x) adds x as the last element of the list."],
    ["What type of value does `input()` return?", "string", "input() always returns a string, even for numeric entry."],
    ["Which loop runs while a condition is true in Python?", "while", "The while loop repeats its body as long as its condition evaluates truthy."],
    ["Which keyword is used to import modules?", "import", "import math brings the math module into scope."],
    ["What does `bool(0)` return?", "False", "0, empty strings and empty containers are falsy in Python."],
    ["Which function creates a list of numbers in Python?", "range()", "range(5) yields 0,1,2,3,4 when converted to a list."],
    ["Which statement exits a loop immediately?", "break", "break terminates the innermost enclosing loop at once."],
    ["What is the correct syntax for an if condition?", "if x > 5:", "Python uses a colon and indentation for block structure."],
    ["Which type is immutable in Python?", "tuple", "Tuples cannot be changed after creation, unlike lists."]
  ],
  javascript: [
    ["Which keyword declares a block-scoped variable in JavaScript?", "let", "let gives block scoping, unlike var which is function-scoped."],
    ["What does `typeof null` return in JavaScript?", "object", "A historical quirk: typeof null evaluates to 'object'."],
    ["Which method parses a string into a JSON object?", "JSON.parse()", "JSON.parse(text) converts a JSON string into a JavaScript value."],
    ["What is the output of `2 + '2'` in JavaScript?", "22", "The + operator concatenates when either operand is a string: '22'."],
    ["Which keyword declares a constant?", "const", "const bindings cannot be reassigned after declaration."],
    ["How do you write a single-line comment?", "// comment", "JavaScript uses // for single-line comments."],
    ["Which array method removes the last element?", "pop()", "arr.pop() removes and returns the final element of an array."],
    ["What does `Array.isArray([])` return?", "true", "Array.isArray reliably detects arrays, which typeof labels as 'object'."],
    ["Which operator checks strict equality?", "===", "=== compares both value and type without coercion."],
    ["What is `NaN`?", "Not a Number", "NaN is the result of invalid numeric operations such as 0/0."],
    ["Which function converts a value to a string?", "String()", "String(42) returns '42'."],
    ["What does `[]` evaluate to in a boolean context?", "truthy", "Empty arrays are truthy in JavaScript."],
    ["Which method joins array elements into a string?", "join()", "arr.join('-') links elements with the given separator."],
    ["What is the scope of a `var` declaration?", "function scope", "var is scoped to the enclosing function, not the block."]
  ],
  java: [
    ["Which keyword defines a class in Java?", "class", "Every Java program's building block is a class declared with the class keyword."],
    ["What is the entry point of a Java application?", "main method", "Execution starts at public static void main(String[] args)."],
    ["Which keyword prevents inheritance of a class?", "final", "A final class cannot be subclassed."],
    ["What does JVM stand for?", "Java Virtual Machine", "The JVM executes compiled Java bytecode on any platform."],
    ["Which primitive type stores true/false?", "boolean", "boolean holds the two truth values true and false."],
    ["Which collection stores unique elements?", "Set", "A Set cannot contain duplicate elements."],
    ["What is the size of an int in Java?", "32 bits", "int is a 32-bit signed two's-complement integer."],
    ["Which keyword allocates a new object?", "new", "new ClassName() creates an instance on the heap."],
    ["Which statement handles checked exceptions?", "try-catch", "Code that throws checked exceptions is guarded with try-catch."],
    ["What does `length` return for arrays?", "the number of elements", "array.length holds the element count; strings use length()."],
    ["Which keyword indicates a class can have no instances?", "abstract", "Abstract classes cannot be instantiated directly."],
    ["What is the default value of a reference type field?", "null", "Object references default to null unless initialized."]
  ],
  c: [
    ["Which header is needed for printf()?", "stdio.h", "printf and scanf are declared in <stdio.h>."],
    ["What does the `&` operator do on a variable?", "gets its address", "The address-of operator returns the memory address of a variable."],
    ["Which keyword defines a constant macro?", "#define", "#define MAX 100 substitutes MAX with 100 at compile time."],
    ["What does `int` typically hold?", "an integer value", "int stores whole numbers in C."],
    ["Which function frees allocated memory?", "free()", "free(p) releases memory previously obtained with malloc()."],
    ["What is the null terminator of a C string?", "'\\0'", "C strings end with a NUL character ('\\0')."],
    ["Which operator dereferences a pointer?", "*", "The indirection operator * yields the value pointed to."],
    ["Which loop is guaranteed to run at least once?", "do-while", "A do-while checks its condition after the first iteration."],
    ["What does sizeof() return?", "bytes", "sizeof returns the size of a type or variable in bytes."],
    ["Which keyword creates a new name for a type?", "typedef", "typedef unsigned int uint; introduces an alias."]
  ],
  cpp: [
    ["Which keyword declares a class in C++?", "class", "C++ classes are declared with the class keyword, like C# and Java."],
    ["What is the output of `cout`?", "standard output", "cout writes to the standard output stream with <<."],
    ["Which feature allows functions with the same name but different parameters?", "overloading", "Function overloading resolves calls by argument types and count."],
    ["Which operator is used for dynamic memory allocation?", "new", "new returns a pointer to freshly allocated memory; delete frees it."],
    ["What does the `::` operator do?", "scope resolution", ":: accesses names inside namespaces or classes."],
    ["Which keyword marks a member function that cannot change the object?", "const", "A const member function promises not to modify the object."],
    ["What is a constructor?", "a function that initializes an object", "Constructors run automatically when an object is created."],
    ["Which container stores elements in key-value pairs?", "map", "std::map provides ordered key→value storage."],
    ["What does `&` declare in a function parameter?", "a reference", "int& x binds x to the caller's variable directly."],
    ["Which keyword stops class inheritance?", "final", "A final class (or virtual function) cannot be further derived or overridden."]
  ],
  csharp: [
    ["Which keyword defines a class in C#?", "class", "C# classes are declared with the class keyword."],
    ["What is the base class of all .NET types?", "System.Object", "Every type ultimately derives from System.Object."],
    ["Which keyword handles memory-managed object creation?", "new", "new allocates an object on the managed heap."],
    ["What does `string.Length` return?", "the character count", "Length gives the number of characters in the string."],
    ["Which collection stores unique keys and values?", "Dictionary", "Dictionary<K,V> maps unique keys to values."],
    ["Which keyword declares a variable that cannot change?", "readonly", "readonly fields can be set only in the constructor."],
    ["What is an interface?", "a contract of members", "Interfaces declare members that implementing classes must provide."],
    ["Which statement is used for exception handling?", "try-catch", "try blocks contain risky code; catch blocks handle exceptions."],
    ["What does `Console.WriteLine` do?", "prints a line", "WriteLine outputs text followed by a newline to the console."],
    ["Which type stores true/false?", "bool", "bool holds true or false in C#."]
  ],
  php: [
    ["Which symbol starts a PHP variable?", "$", "PHP variables begin with $, e.g. $name."],
    ["Which function outputs text in PHP?", "echo", "echo is a language construct that prints strings."],
    ["How are PHP scripts embedded in HTML?", "<?php ... ?>", "PHP code runs inside <?php ?> tags on the server."],
    ["Which operator concatenates strings in PHP?", ".", "The dot operator joins strings: 'a' . 'b' is 'ab'."],
    ["Which array type maps keys to values?", "associative array", "Associative arrays use named keys instead of numeric indexes."],
    ["Which function counts array elements?", "count()", "count($arr) returns the number of elements."],
    ["What does $_GET contain?", "URL query parameters", "$_GET holds the query-string parameters of the request."],
    ["Which superglobal holds form data sent with POST?", "$_POST", "PHP populates $_POST from the request body."],
    ["Which keyword defines a function?", "function", "function name() { } declares a PHP function."],
    ["Which framework uses Blade templating?", "Laravel", "Laravel ships the Blade template engine."],
    ["What does the `->` operator do?", "accesses object members", "-> accesses properties or methods of an object instance."],
    ["Which function checks if a variable is set?", "isset()", "isset($x) returns true when $x exists and is not null."]
  ],
  typescript: [
    ["Which feature distinguishes TypeScript from JavaScript?", "static typing", "TypeScript adds compile-time type checking on top of JavaScript."],
    ["What does `: number` declare?", "a number-typed annotation", "The annotation const x: number = 5 declares x as a number."],
    ["Which keyword restricts a variable to specific values?", "union types", "type A = 'x' | 'y' declares a union of allowed values."],
    ["What is an interface in TypeScript?", "a shape contract for objects", "Interfaces describe the structure an object must satisfy."],
    ["Which command compiles TypeScript?", "tsc", "The TypeScript compiler tsc emits plain JavaScript."],
    ["What does `any` do?", "disables type checking", "any opts a value out of static type checking."],
    ["Which type represents a null or undefined value?", "null and undefined", "Both null and undefined are distinct primitive types."],
    ["What is a generic?", "a type-parameterized function/class", "Generics like Array<T> reuse logic across types."],
    ["What is the extension for a React component file in TS?", ".tsx", ".tsx files allow JSX with TypeScript."],
    ["Which option enforces strict null checks?", "strictNullChecks", "strictNullChecks prevents null/undefined assignment to typed values."]
  ],
  go: [
    ["Which keyword declares a function in Go?", "func", "Go functions start with the func keyword."],
    ["What is the zero value of an int in Go?", "0", "Uninitialized variables take their type's zero value; int is 0."],
    ["Which keyword declares a variable with type inference?", ":=", "x := 5 infers the type from the right-hand value."],
    ["How are errors represented in Go?", "as values", "Go returns errors as ordinary values instead of throwing."],
    ["Which keyword runs a goroutine?", "go", "go fn() launches fn in a new lightweight goroutine."],
    ["What is a slice?", "a dynamic array view", "Slices are flexible, resizable views over arrays."],
    ["Which keyword defines an interface?", "interface", "Interfaces declare method sets that types satisfy implicitly."],
    ["What does `defer` do?", "delays execution until return", "defer schedules a call to run when the function exits."],
    ["Which statement switches on types?", "type switch", "A type switch inspects the dynamic type of an interface value."],
    ["Which tool formats Go code?", "gofmt", "gofmt standardizes formatting of Go source files."]
  ],
  rust: [
    ["Which keyword declares a variable in Rust?", "let", "let x = 5 binds an immutable variable by default."],
    ["What does `mut` mean?", "mutable", "let mut x allows the binding to be reassigned."],
    ["Which concept guarantees memory safety?", "ownership", "Rust's ownership model manages memory without a garbage collector."],
    ["What is a Result?", "an enum for success or error", "Result<T,E> returns Ok(value) or Err(error)."],
    ["Which keyword creates a new thread?", "thread::spawn", "thread::spawn(|| ...) starts an OS thread."],
    ["What does `String::from` do?", "creates a growable string", "String::from(&str) builds an owned, mutable UTF-8 string."],
    ["Which trait must a type implement for printing?", "Display", "Display formats values for user-facing output."],
    ["What is a reference?", "a borrow without ownership", "References (&T) borrow data without taking ownership."],
    ["Which keyword matches patterns?", "match", "match is Rust's exhaustive pattern-matching construct."],
    ["What does the compiler tool cargo do?", "builds and manages projects", "cargo compiles crates, fetches dependencies and runs tests."]
  ],
  sql: [
    ["Which SQL clause filters rows?", "WHERE", "WHERE filters rows before grouping and selection."],
    ["Which clause sorts results?", "ORDER BY", "ORDER BY sorts the result set ascending by default."],
    ["Which function counts rows?", "COUNT()", "COUNT(*) returns the number of rows in the group."],
    ["Which clause groups rows by a column?", "GROUP BY", "GROUP BY forms groups with identical values for aggregation."],
    ["What does INNER JOIN return?", "matching rows only", "INNER JOIN keeps rows where the join condition matches on both sides."],
    ["Which command deletes a table entirely?", "DROP TABLE", "DROP TABLE removes the table and its definition permanently."],
    ["Which keyword removes duplicate rows?", "DISTINCT", "SELECT DISTINCT returns only unique values."],
    ["Which command adds a column?", "ALTER TABLE ... ADD", "ALTER TABLE t ADD COLUMN c updates the table structure."],
    ["What does LEFT JOIN preserve?", "all rows of the left table", "LEFT JOIN keeps every left row even without a match, filling NULLs."],
    ["Which command updates existing rows?", "UPDATE", "UPDATE t SET col=val WHERE cond modifies matching rows."],
    ["Which constraint enforces uniqueness?", "UNIQUE", "A UNIQUE constraint forbids duplicate values in a column."],
    ["What does AVG() return?", "the mean of values", "AVG(column) returns the arithmetic mean, ignoring NULLs."],
    ["Which clause limits returned rows?", "LIMIT", "LIMIT n caps the number of rows in the result."],
    ["What does a primary key do?", "uniquely identifies rows", "A PRIMARY KEY is unique and non-null for every row."]
  ]
};

function conceptGen(lang, topics, subjectIds) {
  return topics.map((tp, ti) => ({
    subjects: subjectIds,
    name: `${lang} — Core Concepts`,
    topics: [tp],
    tags: [lang.toLowerCase()],
    generate(rng) {
      const pool = LANG_CONCEPTS[lang].map(([q, a, e]) => ({ q, a, e }));
      const slice = pool.slice(ti * Math.ceil(pool.length / topics.length), (ti + 1) * Math.ceil(pool.length / topics.length));
      return L.factGenerator(slice, [])(rng);
    }
  }));
}

/* Parametric output questions — values computed in JS mirroring simple language semantics */
function outputGen(lang, subjectIds, name) {
  return {
    subjects: subjectIds,
    name,
    topics: ["Code Output and Evaluation"],
    tags: [lang.toLowerCase()],
    generate(rng, t, s) {
      const cap = (s && s._cap) || 5000;
      const out = [];
      for (const op of ["+", "*", "-", "/"]) {
        for (let a = 2; a <= 90 && out.length < cap; a++) {
          for (let b = 2; b <= 90 && out.length < cap; b++) {
            if (op === "/" && (a % b !== 0 || b === 0)) continue;
            let v;
            if (op === "+") v = a + b; else if (op === "*") v = a * b; else if (op === "-") v = a - b; else v = a / b;
            const m = L.buildParametric(rng, {
              q: () => `In ${lang}, what is the value of the expression ${a} ${op} ${b}?`,
              a: () => v,
              e: () => `Applying the arithmetic operator: ${a} ${op} ${b} = ${v}. (For integer operands, ${lang} evaluates this as an integer result.)`,
              distract: () => [v + 1, v - 1, a * b === v ? a + b : a * b]
            }, { difficulty: L.diffFor(out.length), tags: ["code-output"] });
            if (m) out.push(m);
          }
        }
      }
      for (let start = 1; start <= 5 && out.length < cap; start++) {
        for (let end = 5; end <= 10 && out.length < cap; end++) {
          for (let step = 1; step <= 3 && out.length < cap; step++) {
            const sum = (() => { let x = 0; for (let k = start; k <= end; k += step) x += k; return x; })();
            const seq = []; for (let k = start; k <= end; k += step) seq.push(k);
            const m = L.buildParametric(rng, {
              q: () => `In ${lang}, a loop runs from ${start} to ${end} (inclusive) with step ${step}, adding each value to a sum starting at 0. The final sum is:`,
              a: () => sum,
              e: () => `Values added: ${seq.join(", ")}. Sum = ${seq.join(" + ")} = ${sum}.`,
              distract: () => [sum + end, sum - start, sum + step]
            }, { difficulty: L.diffFor(out.length), tags: ["code-output"] });
            if (m) out.push(m);
          }
        }
      }
      return out;
    }
  };
}

module.exports = [
  ...conceptGen("python", ["Functions and Syntax", "Data Structures", "Operators and Control Flow"], ["python"]),
  ...conceptGen("javascript", ["Syntax and Types", "Functions and Methods", "Operators"], ["javascript"]),
  ...conceptGen("java", ["Classes and Syntax", "Collections and Types", "Execution Model"], ["java"]),
  ...conceptGen("c", ["Headers and Functions", "Pointers and Memory", "Control Flow"], ["c"]),
  ...conceptGen("cpp", ["Classes and Syntax", "Memory and Containers", "Overloading and Features"], ["cpp"]),
  ...conceptGen("csharp", ["Classes and Types", "Collections and BCL", "Language Features"], ["csharp"]),
  ...conceptGen("php", ["Syntax and Output", "Arrays and Superglobals", "Frameworks and Features"], ["php"]),
  ...conceptGen("typescript", ["Types and Annotations", "Interfaces and Generics", "Tooling"], ["typescript"]),
  ...conceptGen("go", ["Functions and Variables", "Concurrency and Errors", "Types and Tooling"], ["go"]),
  ...conceptGen("rust", ["Variables and Ownership", "Errors and Threads", "Traits and Tooling"], ["rust"]),
  ...conceptGen("sql", ["Filtering and Sorting", "Joins and Aggregation", "Schema and Constraints"], ["sql"]),
  outputGen("Python", ["python"], "Python — Code Output"),
  outputGen("JavaScript", ["javascript"], "JavaScript — Code Output"),
  outputGen("Java", ["java"], "Java — Code Output"),
  outputGen("C++", ["cpp"], "C++ — Code Output"),
  outputGen("C#", ["csharp"], "C# — Code Output"),
  outputGen("PHP", ["php"], "PHP — Code Output"),
  outputGen("Go", ["go"], "Go — Code Output"),
  outputGen("Rust", ["rust"], "Rust — Code Output"),
  outputGen("C", ["c"], "C — Code Output")
];
