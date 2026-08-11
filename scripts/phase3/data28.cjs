const { writeFile } = require("./gen-helper.cjs");

const PROG = [
  /* HTML */
  ["html", "Document Structure", "easy", "Which tag declares an HTML document's document type?", ["<!DOCTYPE html>", "<html lang>", "<meta>", "<head>"], "A", "The doctype declaration precedes the <html> element and must be first.", ["html"]],
  ["html", "Text & Links", "easy", "Which tag creates a hyperlink?", ["<a>", "<link>", "<href>", "<url>"], "A", "The anchor element <a href=\"...\"> creates links.", ["html"]],
  ["html", "Forms", "medium", "Which input type renders a dropdown list?", ["<select>", "<input>", "<button>", "<textarea>"], "A", "A <select> element with <option> children creates a dropdown.", ["html", "forms"]],
  ["html", "Semantic Tags", "medium", "Which element is semantic for page navigation?", ["<nav>", "<div>", "<span>", "<b>"], "A", "<nav> semantically marks navigation links; div and span are generic.", ["html", "semantic"]],
  ["html", "Media Elements", "medium", "To embed a video, the correct element is:", ["<video>", "<audio>", "<movie>", "<media>"], "A", "The <video> element embeds video with <source> children or a src attribute.", ["html", "media"]],
  /* CSS */
  ["css", "Selectors & Box Model", "easy", "Which property sets the space inside an element's border?", ["padding", "margin", "border", "outline"], "A", "Padding is inside the border; margin is outside it.", ["css"]],
  ["css", "Selectors & Box Model", "easy", "The selector 'p.intro' matches:", ["paragraphs with class intro", "paragraphs with id intro", "any element with class intro", "intro elements"], "A", "'p.intro' targets <p> elements whose class is 'intro'.", ["css", "selectors"]],
  ["css", "Flexbox", "medium", "Which property aligns flex items along the main axis?", ["justify-content", "align-items", "flex-wrap", "gap only"], "A", "justify-content distributes items on the main axis; align-items on the cross axis.", ["css", "flexbox"]],
  ["css", "Grid", "medium", "CSS Grid is best suited for:", ["two-dimensional layouts", "styling text only", "server-side code", "database queries"], "A", "Grid handles rows and columns together (two-dimensional), unlike flexbox.", ["css", "grid"]],
  ["css", "Media Queries", "medium", "A media query makes CSS apply:", ["conditionally based on device characteristics", "always", "never", "only on desktop"], "A", "@media rules apply styles when conditions like width match.", ["css", "responsive"]],
  /* javascript */
  ["javascript", "Variables & Types", "easy", "Which keyword declares a block-scoped variable that cannot be reassigned?", ["const", "var", "let", "static"], "A", "const is block-scoped and read-only after assignment; let allows reassignment.", ["js"]],
  ["javascript", "Variables & Types", "easy", "What does 'typeof null' return in JavaScript?", ["\"object\"", "\"null\"", "\"undefined\"", "\"boolean\""], "A", "A legacy quirk makes typeof null return \"object\".", ["js"]],
  ["javascript", "Functions & Scope", "medium", "What is a closure?", ["a function with access to its outer scope", "a class with private fields", "a loop that never ends", "a global variable"], "A", "A closure is a function that retains access to variables of its enclosing scope.", ["js", "closure"]],
  ["javascript", "DOM Manipulation", "medium", "Which method selects the first element matching a CSS selector?", ["querySelector", "getElementById only", "querySelectorAll", "selectAll"], "A", "document.querySelector() returns the first matching element.", ["js", "dom"]],
  ["javascript", "Async & Promises", "medium", "Which keyword awaits a promise in an async function?", ["await", "wait", "pause", "then only"], "A", "await suspends an async function until the promise settles.", ["js", "async"]],
  ["javascript", "ES6+ Features", "hard", "Which operator safely accesses nested properties without errors?", ["?. (optional chaining)", "!!", "?? only", "typeof"], "A", "Optional chaining (?.) short-circuits to undefined instead of throwing.", ["js", "es6"]],
  /* typescript */
  ["typescript", "Types & Interfaces", "easy", "TypeScript adds what to JavaScript?", ["static typing", "a new runtime", "a database", "CSS support"], "A", "TypeScript is a typed superset that compiles to plain JavaScript.", ["ts"]],
  ["typescript", "Types & Interfaces", "medium", "Which keyword declares an object shape contract?", ["interface", "class only", "typedef", "shape"], "A", "interface (or type) defines the shape of objects.", ["ts"]],
  ["typescript", "Generics", "medium", "Generics allow functions to:", ["work with multiple types safely", "run faster", "access the DOM", "call the server"], "A", "Generics parameterize types, keeping type safety across types.", ["ts", "generics"]],
  ["typescript", "Compilation & Config", "medium", "The TypeScript compiler is invoked with:", ["tsc", "tscompile", "typescript", "node ts"], "A", "The tsc CLI compiles .ts files to JavaScript.", ["ts"]],
  /* bootstrap */
  ["bootstrap", "Grid System", "easy", "Bootstrap's grid is based on a maximum of how many columns?", ["12", "8", "16", "10"], "A", "Bootstrap uses a 12-column responsive grid.", ["bootstrap"]],
  ["bootstrap", "Components", "medium", "Which class creates a button?", ["btn", "button", "bttn", "btn-sm only"], "A", "The .btn class styles button elements; .btn-sm is a size modifier.", ["bootstrap"]],
  ["bootstrap", "Utility Classes", "medium", "The class 'd-none' in Bootstrap:", ["hides the element", "displays it inline", "adds padding", "makes it bold"], "A", "d-none applies display: none to hide an element.", ["bootstrap"]],
  /* tailwind */
  ["tailwind-css", "Utility Classes", "easy", "Tailwind CSS is primarily:", ["a utility-first CSS framework", "a JavaScript library", "a database tool", "a server"], "A", "Tailwind provides small utility classes composed in markup.", ["tailwind"]],
  ["tailwind-css", "Layout Utilities", "medium", "The Tailwind classes 'flex' and 'items-center' control:", ["layout and alignment", "colors only", "fonts only", "spacing only"], "A", "flex sets display:flex; items-center centers children on the cross axis.", ["tailwind"]],
  ["tailwind-css", "Responsive Design", "medium", "In Tailwind, the 'md:' prefix applies styles:", ["at medium screens and up", "only on mobile", "only in print", "never"], "A", "Prefixes like sm:, md:, lg: are breakpoint variants for responsive design.", ["tailwind", "responsive"]],
  /* react */
  ["react", "Components & Props", "easy", "In React, 'props' are:", ["read-only inputs passed to components", "mutable internal state", "global variables", "CSS classes"], "A", "Props flow from parent to child and are immutable inside the child.", ["react"]],
  ["react", "State & Hooks", "easy", "Which hook manages local state in a functional component?", ["useState", "useEffect", "useRef", "useMemo"], "A", "useState returns a state value and its updater function.", ["react", "hooks"]],
  ["react", "State & Hooks", "medium", "The useEffect hook is used for:", ["side effects like fetching data", "rendering lists", "styling", "routing only"], "A", "useEffect runs side effects after render, e.g. API calls and subscriptions.", ["react", "hooks"]],
  ["react", "Lists & Keys", "medium", "Keys in React lists should be:", ["unique and stable", "random every render", "the index always", "omitted"], "A", "Stable unique keys help React reconcile list items efficiently.", ["react"]],
  ["react", "React Router", "medium", "Which component defines a route path in React Router?", ["<Route>", "<Link> only", "<Path>", "<Nav>"], "A", "Routes map paths to components; Link navigates.", ["react", "router"]],
  /* next.js */
  ["next-js", "Pages & Routing", "easy", "In Next.js App Router, a route segment's UI file is named:", ["page.js", "index.js only", "route.js only", "view.js"], "A", "page.js exports the UI for a route segment in the App Router.", ["nextjs"]],
  ["next-js", "SSR & SSG", "medium", "Static Site Generation (SSG) renders pages:", ["at build time", "per request", "on the client only", "never"], "A", "SSG pre-renders at build time, serving fast static HTML.", ["nextjs"]],
  ["next-js", "API Routes", "medium", "In the Pages Router, API endpoints are files inside the folder:", ["pages/api", "pages/server", "api/endpoints", "src/routes"], "A", "Files in pages/api become serverless API endpoints.", ["nextjs", "api"]],
  /* vue */
  ["vue-js", "Template Syntax", "easy", "In Vue, mustache syntax {{ }} is used for:", ["interpolating data", "defining routes", "importing files", "styling"], "A", "Mustaches bind data into the template as text.", ["vue"]],
  ["vue-js", "Components", "medium", "Vue components are often defined in files with the extension:", [".vue", ".jsx", ".tsx", ".html"], "A", "Single-File Components use .vue with template, script and style blocks.", ["vue"]],
  ["vue-js", "Composition API", "medium", "Which function creates reactive state in the Composition API?", ["ref", "data only", "props", "mounted"], "A", "ref (and reactive) create reactive state in the Composition API.", ["vue"]],
  /* angular */
  ["angular", "Components & Modules", "easy", "Angular components are decorated with:", ["@Component", "@Directive only", "@Module only", "@Service"], "A", "@Component marks a class as a component with template metadata.", ["angular"]],
  ["angular", "Templates & Directives", "medium", "The '*ngIf' (or @if) directive:", ["conditionally renders content", "loops over arrays", "binds styles", "creates routes"], "A", "ngIf conditionally includes template content.", ["angular"]],
  ["angular", "Dependency Injection", "medium", "Angular's dependency injection provides:", ["services to components", "CSS variables", "HTTP caching", "fonts"], "A", "DI supplies services and dependencies declared as providers.", ["angular", "di"]],
  /* node.js */
  ["node-js", "Event Loop", "easy", "Node.js is built on which JavaScript engine?", ["V8", "SpiderMonkey", "Chakra", "JavaScriptCore"], "A", "Node.js embeds Google's V8 engine.", ["nodejs"]],
  ["node-js", "Modules & NPM", "easy", "Which command installs project dependencies?", ["npm install", "npm run", "npm publish", "npm start"], "A", "npm install reads package.json and installs dependencies.", ["nodejs", "npm"]],
  ["node-js", "HTTP Servers", "medium", "The built-in module for creating HTTP servers is:", ["http", "server", "net only", "express"], "A", "require('http') provides createServer for HTTP servers.", ["nodejs", "http"]],
  ["node-js", "File System", "medium", "Which module reads files in Node.js?", ["fs", "path", "os", "url"], "A", "The fs module handles file system operations.", ["nodejs", "fs"]],
  /* express */
  ["express-js", "Routing", "easy", "Which method registers a GET route in Express?", ["app.get()", "app.post() only", "server.get()", "route.get only"], "A", "app.get(path, handler) handles GET requests on the app.", ["express"]],
  ["express-js", "Middleware", "medium", "Middleware functions in Express:", ["run between request and response", "replace the database", "compile code", "manage CSS"], "A", "Middleware processes requests in order before the final handler.", ["express", "middleware"]],
  ["express-js", "Error Handling", "medium", "Express error-handling middleware has how many parameters?", ["4", "2", "3", "1"], "A", "Error handlers take (err, req, res, next) - four parameters.", ["express"]],
  /* php */
  ["php", "Syntax & Variables", "easy", "In PHP, variables begin with:", ["$", "#", "@", "&"], "A", "PHP variables start with a dollar sign, e.g. $name.", ["php"]],
  ["php", "Syntax & Variables", "easy", "Which function outputs text in PHP?", ["echo", "print only", "write", "display"], "A", "echo (and print) output strings to the response.", ["php"]],
  ["php", "Arrays & Strings", "medium", "Which function counts the elements of an array?", ["count()", "len() only", "sizeof() only", "array_size()"], "A", "count() (alias sizeof()) returns the number of elements.", ["php"]],
  ["php", "Forms & Sessions", "medium", "Form data sent with method GET is available in the superglobal:", ["$_GET", "$_POST only", "$_COOKIE", "$_FILE"], "A", "$_GET holds query-string parameters; $_POST holds POST data.", ["php", "forms"]],
  /* laravel */
  ["laravel", "Routing & Controllers", "easy", "Laravel is built on which framework component?", ["Symfony", "Express", "Django", "Spring"], "A", "Laravel uses Symfony components under the hood.", ["laravel"]],
  ["laravel", "Routing & Controllers", "easy", "Laravel's template engine is called:", ["Blade", "Twig", "EJS", "Handlebars"], "A", "Blade templates (.blade.php) ship with Laravel.", ["laravel", "blade"]],
  ["laravel", "Eloquent ORM", "medium", "Eloquent is Laravel's:", ["ORM (Object-Relational Mapper)", "CSS framework", "test runner", "package manager"], "A", "Eloquent maps models to database tables with an expressive query builder.", ["laravel", "orm"]],
  ["laravel", "Authentication", "medium", "The command to scaffold authentication in older Laravel versions is:", ["php artisan make:auth", "npm run auth", "composer auth", "php serve auth"], "A", "make:auth generated login/registration scaffolding in Laravel 5/6/7.", ["laravel", "auth"]],
  /* python */
  ["python", "Syntax & Data Types", "easy", "Which data type is immutable in Python?", ["tuple", "list", "dict", "set"], "A", "Tuples cannot be changed after creation; lists, dicts and sets are mutable.", ["python"]],
  ["python", "Syntax & Data Types", "easy", "What does 'len(\"python\")' return?", ["6", "5", "7", "0"], "A", "The string 'python' has six characters.", ["python"]],
  ["python", "Control Flow", "medium", "Which statement ends the current loop iteration early?", ["continue", "break only", "pass", "exit"], "A", "continue skips to the next iteration; break exits the loop.", ["python"]],
  ["python", "Lists & Dictionaries", "medium", "The method to add one element to a list is:", ["append()", "push() only", "add() only", "insert() only"], "A", "list.append(x) adds x at the end; push is JS, add is for sets.", ["python", "lists"]],
  ["python", "Functions & Modules", "medium", "Which keyword defines a function?", ["def", "function", "fun", "lambda only"], "A", "def introduces a function definition; lambda creates anonymous functions.", ["python"]],
  ["python", "File Handling", "medium", "Which mode opens a file for reading?", ["'r'", "'w'", "'a'", "'x'"], "A", "'r' reads (default), 'w' writes (truncating), 'a' appends, 'x' creates exclusively.", ["python", "files"]],
  /* django */
  ["django", "Models & ORM", "easy", "Django models are defined in the file:", ["models.py", "views.py", "urls.py", "settings.py"], "A", "Each app's models.py declares its database models.", ["django"]],
  ["django", "Views & URLs", "medium", "URL patterns are wired to views in:", ["urls.py", "models.py", "admin.py", "apps.py"], "A", "urls.py maps URL patterns to view functions or classes.", ["django", "urls"]],
  ["django", "Templates & Forms", "medium", "Django template variables are written with:", ["{{ variable }}", "{% variable %}", "$variable", "#variable#"], "A", "{{ }} interpolates variables; {% %} runs tags.", ["django", "templates"]],
  ["django", "Admin & Auth", "medium", "The built-in Django admin is enabled via the app:", ["django.contrib.admin", "django.templates", "django.rest", "django.orm"], "A", "django.contrib.admin provides the automatic admin interface.", ["django", "admin"]],
  /* flask */
  ["flask", "App & Routes", "easy", "Flask is best described as:", ["a micro web framework", "a full-stack ORM", "a database", "a browser"], "A", "Flask is a lightweight (micro) Python web framework.", ["flask"]],
  ["flask", "App & Routes", "easy", "The decorator to register a route is:", ["@app.route()", "@route() only", "@path()", "@url()"], "A", "@app.route('/') binds a URL to a view function.", ["flask", "routes"]],
  ["flask", "Templates", "medium", "Flask uses which template engine by default?", ["Jinja2", "Blade", "EJS", "Pug"], "A", "Jinja2 is Flask's default templating engine.", ["flask", "templates"]],
  ["flask", "REST with Flask", "medium", "To build REST APIs in Flask, a common companion library is:", ["Flask-RESTful", "Flask-SQL only", "Flask-UI", "Flask-ORM"], "A", "Flask-RESTful (or flask-restx) simplifies API resource classes.", ["flask", "rest"]],
  /* java */
  ["java", "Syntax & Types", "easy", "Java programs are compiled to:", ["bytecode", "assembly", "machine code directly", "JavaScript"], "A", "javac compiles to bytecode run by the JVM.", ["java"]],
  ["java", "OOP Concepts", "easy", "Which keyword makes a class inherit from another?", ["extends", "implements only", "inherits", "super"], "A", "A class extends a superclass; implements is for interfaces.", ["java", "oop"]],
  ["java", "Collections", "medium", "Which interface allows duplicate elements and maintains order?", ["List", "Set", "Map", "Queue only"], "A", "Lists allow duplicates with insertion order; Sets forbid duplicates.", ["java", "collections"]],
  ["java", "Exceptions", "medium", "Which keyword throws an exception?", ["throw", "catch", "finally", "try only"], "A", "throw raises an exception; try/catch/finally handle it.", ["java", "exceptions"]],
  ["java", "Streams & Lambdas", "medium", "A lambda expression is:", ["an anonymous function", "a class", "a thread", "a package"], "A", "Lambdas are anonymous functions enabling functional style in Java 8+.", ["java", "lambda"]],
  /* spring boot */
  ["spring-boot", "Dependency Injection", "easy", "Spring's DI means objects receive their dependencies:", ["from the container", "by creating them manually", "from the browser", "from CSS"], "A", "The Spring IoC container injects beans into components.", ["spring"]],
  ["spring-boot", "Spring Boot Starters", "medium", "A Spring Boot application's entry point is annotated with:", ["@SpringBootApplication", "@RestController only", "@Configuration only", "@Bean"], "A", "@SpringBootApplication combines configuration, enablement and component scanning.", ["spring", "boot"]],
  ["spring-boot", "REST Controllers", "medium", "Which annotation maps a class to REST endpoints?", ["@RestController", "@Service", "@Repository", "@Entity"], "A", "@RestController combines @Controller and @ResponseBody for APIs.", ["spring", "rest"]],
  ["spring-boot", "JPA & Data", "medium", "Spring Data JPA repositories usually extend:", ["JpaRepository", "Controller", "Service", "Bean"], "A", "Extending JpaRepository provides CRUD methods automatically.", ["spring", "jpa"]],
  /* C */
  ["c", "Syntax & Data Types", "easy", "Which function prints output in C?", ["printf()", "print() only", "echo()", "cout only"], "A", "printf() formats output to stdout; cout is C++.", ["c"]],
  ["c", "Syntax & Data Types", "easy", "The size of a char in C is:", ["1 byte", "2 bytes", "4 bytes", "8 bytes"], "A", "char is defined as 1 byte by the C standard.", ["c"]],
  ["c", "Pointers & Arrays", "medium", "The operator to access the address of a variable is:", ["&", "*", "#", "%"], "A", "&x yields the address of x; * dereferences a pointer.", ["c", "pointers"]],
  ["c", "Functions", "medium", "In C, the main function returns:", ["an int by default", "nothing", "a string", "a float"], "A", "main() returns int; return 0 signals successful termination.", ["c", "functions"]],
  ["c", "Memory Management", "medium", "Which function allocates heap memory in C?", ["malloc()", "alloc() only", "new", "allocate()"], "A", "malloc() allocates bytes on the heap; free() releases them.", ["c", "memory"]],
  /* C++ */
  ["cpp", "Classes & Objects", "easy", "The default access specifier of a struct in C++ is:", ["public", "private", "protected", "internal"], "A", "In C++, struct members are public by default; class members are private.", ["cpp"]],
  ["cpp", "Classes & Objects", "medium", "A constructor is called when:", ["an object is created", "an object is destroyed", "a class is compiled", "a method runs"], "A", "Constructors initialize objects at creation; destructors run at destruction.", ["cpp", "oop"]],
  ["cpp", "Inheritance", "medium", "Which keyword expresses inheritance in C++?", [":", "extends", "inherits", "->"], "A", "class Derived : public Base declares inheritance.", ["cpp", "oop"]],
  ["cpp", "Templates & STL", "medium", "The STL container that stores key-value pairs is:", ["std::map", "std::vector", "std::string", "std::queue"], "A", "std::map stores sorted key-value pairs; vector is a dynamic array.", ["cpp", "stl"]],
  /* C# */
  ["csharp", "Syntax & Types", "easy", "C# runs on which runtime?", [".NET (CLR)", "V8", "Node", "JVM only"], "A", "C# compiles to IL executed by the .NET Common Language Runtime.", ["csharp"]],
  ["csharp", "Syntax & Types", "medium", "The keyword for declaring a nullable value type is:", ["?", "!", "~", "@"], "A", "int? declares a nullable int.", ["csharp"]],
  ["csharp", "LINQ", "medium", "LINQ provides:", ["query capabilities over collections", "graphics rendering", "memory management", "network routing"], "A", "Language Integrated Query operates on in-memory and data source collections.", ["csharp", "linq"]],
  ["csharp", "Async & Tasks", "medium", "Which keyword marks an asynchronous method?", ["async", "await only", "task only", "thread"], "A", "Methods are marked async and use await for asynchronous operations.", ["csharp", "async"]],
  /* .NET */
  ["dotnet", "NET Runtime", "easy", "ASP.NET Core is used to build:", ["web applications and APIs", "operating systems", "databases", "browsers"], "A", "ASP.NET Core is the web framework of .NET.", ["dotnet"]],
  ["dotnet", "NET Runtime", "easy", "The .NET package manager is:", ["NuGet", "npm", "pip", "composer"], "A", "NuGet is the package manager for .NET libraries.", ["dotnet"]],
  ["dotnet", "EF Core", "medium", "Entity Framework Core is a:", ["ORM", "web server", "test framework", "logger"], "A", "EF Core maps .NET objects to relational database tables.", ["dotnet", "ef"]],
  ["dotnet", "Middleware & Services", "medium", "In ASP.NET Core, the request pipeline is built with:", ["middleware components", "plugins only", "controllers only", "routes only"], "A", "Middleware components form the request pipeline in order.", ["dotnet"]],
  /* Go */
  ["go", "Syntax & Types", "easy", "Go was created primarily by engineers at:", ["Google", "Microsoft", "Apple", "IBM"], "A", "Go was designed at Google by Robert Griesemer, Rob Pike and Ken Thompson.", ["go"]],
  ["go", "Syntax & Types", "medium", "In Go, exported names begin with:", ["a capital letter", "an underscore", "a dollar sign", "a digit"], "A", "Exported identifiers start with uppercase, making them visible across packages.", ["go"]],
  ["go", "Goroutines & Channels", "medium", "A goroutine is:", ["a lightweight concurrent function", "a database", "a web server", "a package"], "A", "go func() launches a goroutine; channels communicate between them.", ["go", "concurrency"]],
  ["go", "Interfaces", "medium", "Go interfaces are satisfied:", ["implicitly by methods", "explicitly with implements", "at compile time only with keywords", "never"], "A", "Types satisfy interfaces implicitly by implementing the required methods.", ["go", "interfaces"]],
  /* Rust */
  ["rust", "Ownership & Borrowing", "easy", "Rust's ownership rules prevent:", ["data races and dangling references", "all compile errors", "slow code", "network calls"], "A", "Ownership and borrowing give memory safety without a garbage collector.", ["rust"]],
  ["rust", "Ownership & Borrowing", "medium", "The '&' symbol in Rust creates:", ["a reference (borrow)", "a pointer to delete", "an address print", "a new owner"], "A", "&x borrows a reference without transferring ownership.", ["rust", "borrowing"]],
  ["rust", "Structs & Traits", "medium", "Traits in Rust define:", ["shared behaviour across types", "memory layout", "network config", "build settings"], "A", "Traits declare methods that implementing types must provide.", ["rust", "traits"]],
  ["rust", "Error Handling", "medium", "Rust's Result type handles:", ["recoverable errors", "compile errors only", "runtime panics only", "syntax errors"], "A", "Result<T, E> returns success or a recoverable error; panic is unrecoverable.", ["rust"]],
  /* git */
  ["git-github", "Repositories & Commits", "easy", "Which command initializes a Git repository?", ["git init", "git start", "git new", "git create"], "A", "git init creates a new repository in the current directory.", ["git"]],
  ["git-github", "Repositories & Commits", "easy", "Which command records changes with a message?", ["git commit -m", "git save", "git push -m", "git store"], "A", "git commit -m \"msg\" snapshots staged changes.", ["git"]],
  ["git-github", "Branches & Merging", "medium", "To see the current branch name, use:", ["git branch", "git log", "git status only", "git show"], "A", "git branch lists branches with * marking the current one.", ["git", "branch"]],
  ["git-github", "Branches & Merging", "medium", "Which command merges another branch into the current one?", ["git merge", "git pull only", "git join", "git combine"], "A", "git merge <branch> integrates that branch into the current branch.", ["git", "merge"]],
  ["git-github", "Remotes & Pull Requests", "medium", "GitHub collaboration mostly uses:", ["pull requests and branches", "email patches", "FTP uploads", "local backups"], "A", "Pull requests propose branch merges for review.", ["git", "github"]],
  /* docker */
  ["docker", "Images & Containers", "easy", "A Docker image is:", ["a read-only template for containers", "a running process", "a database", "a volume"], "A", "Images are immutable templates; containers are their runnable instances.", ["docker"]],
  ["docker", "Images & Containers", "easy", "Which command lists running containers?", ["docker ps", "docker ls", "docker show", "docker list"], "A", "docker ps shows running containers; docker ps -a shows all.", ["docker"]],
  ["docker", "Dockerfile", "medium", "The Dockerfile instruction to set the base image is:", ["FROM", "RUN", "CMD", "COPY"], "A", "FROM names the base image every Dockerfile starts with.", ["docker", "dockerfile"]],
  ["docker", "Docker Compose", "medium", "Docker Compose services are defined in:", ["docker-compose.yml", "Dockerfile only", "package.json", "compose.conf"], "A", "docker-compose.yml declares multi-container applications.", ["docker", "compose"]],
  ["docker", "Volumes & Networks", "medium", "Volumes in Docker provide:", ["persistent data storage", "temporary RAM", "CPU limits", "login sessions"], "A", "Volumes persist data beyond a container's lifecycle.", ["docker", "volumes"]],
  /* kubernetes */
  ["kubernetes", "Pods & Deployments", "easy", "The smallest deployable unit in Kubernetes is a:", ["Pod", "Node", "Cluster", "Service"], "A", "A Pod wraps one or more containers as the atomic unit.", ["k8s"]],
  ["kubernetes", "Pods & Deployments", "medium", "A Deployment's role is to:", ["manage desired state of Pod replicas", "store secrets only", "expose DNS", "monitor logs"], "A", "Deployments reconcile the desired number of Pod replicas.", ["k8s", "deployment"]],
  ["kubernetes", "Services", "medium", "A Service in Kubernetes:", ["provides stable network access to Pods", "builds images", "stores data", "runs cron jobs"], "A", "Services expose Pod sets with stable IPs and load balancing.", ["k8s", "service"]],
  ["kubernetes", "ConfigMaps & Secrets", "medium", "Sensitive values in Kubernetes are stored in:", ["Secrets", "ConfigMaps", "Deployments", "Pods"], "A", "Secrets hold sensitive data; ConfigMaps hold non-sensitive config.", ["k8s", "secrets"]],
  /* REST */
  ["rest-api", "HTTP & Resources", "easy", "Which HTTP method retrieves a resource?", ["GET", "POST", "DELETE", "PUT"], "A", "GET reads resources without side effects.", ["rest", "http"]],
  ["rest-api", "HTTP & Resources", "easy", "The HTTP status code 404 means:", ["Not Found", "OK", "Created", "Server Error"], "A", "404 signals the requested resource does not exist.", ["rest", "http"]],
  ["rest-api", "Status Codes", "medium", "A successful POST that creates a resource typically returns:", ["201 Created", "200 only", "404", "500"], "A", "201 Created is the standard response for successful creation.", ["rest", "http"]],
  ["rest-api", "API Security", "medium", "Which header commonly carries bearer tokens?", ["Authorization", "Content-Type only", "Accept", "Origin"], "A", "The Authorization header carries credentials like bearer tokens.", ["rest", "security"]],
  ["rest-api", "Versioning", "medium", "A common API versioning approach uses:", ["a path segment like /v1/", "changing the port", "renaming the domain", "deleting old routes"], "A", "Version prefixes in the URL path are the most common strategy.", ["rest"]],
  /* graphql */
  ["graphql", "Schema & Types", "easy", "GraphQL is a:", ["query language for APIs", "database", "web server", "CSS preprocessor"], "A", "GraphQL is a query language and runtime for APIs.", ["graphql"]],
  ["graphql", "Schema & Types", "medium", "The root type for read operations in GraphQL is:", ["Query", "Mutation", "Subscription", "Schema"], "A", "Query is the entry type for fetching data; Mutation writes.", ["graphql", "schema"]],
  ["graphql", "Queries & Mutations", "medium", "Clients can request:", ["exactly the fields they need", "only all fields", "only the id field", "no fields"], "A", "Field selection is a core GraphQL advantage over REST over-fetching.", ["graphql"]],
  ["graphql", "Resolvers", "medium", "Resolvers are functions that:", ["return data for schema fields", "style components", "store images", "start servers"], "A", "Each schema field maps to a resolver that supplies its data.", ["graphql", "resolvers"]]
];

writeFile("28-programming.json", PROG);
