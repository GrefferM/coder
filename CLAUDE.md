# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
It holds only instructions and conventions for working in this project. Project-wide conventions live here; backend-specific
architecture and conventions live in `BACKEND.md`, frontend-specific ones in `FRONTEND.md`, and UI/UX
design decisions in `DESIGN.md`.

## Project

An AI platform for automated code development, built around agents. The user places agents on a
canvas, connects them with directed links, and runs work through the graph — assigning models of
different cost and capability to each one, and granting each the tools it may call.

A **project is a folder on disk**, and the folder is the source of truth: `project.yaml` holds the
ties between things, and everything a thing is about itself stands in a file of its own. See `BACKEND.md` for what that means for storage and modules. The
product above is the whole of it, and `TODO.md` holds only the gaps inside what stands.

**An older project always opens; a newer one is refused whole.** A build never turns a project away
for being older than itself, and never for lacking a field: what is missing is asked of the person,
not invented — the thing says «НЕ ЗАПОВНЕНО» with that field's name and waits (4e) — and in the
record a fact a step never carried is skipped, never written as a zero. A file whose `version` is
newer than this build's is refused instead, and said to be: this build cannot know what that one
wrote, and opening it would mean saving it back without those fields.

**But nothing is carried for the sake of an old file.** No default, no conversion, no constant
standing in for a field an earlier build never wrote — an old file is owed an open door and an
honest question, not its old meanings. The database is different: it is this machine's, and every
change to its schema is a migration of its own that keeps the rows already there (`BACKEND.md`).

## Project structure

- `src/app` — the Electron shell: main process, IPC, `backend/` (`createBackend`, shared by the window and the `npm run agent` command line) and the React renderer under `renderer/`.
- `src/contracts` — what the renderer and the backend agree on: channel names, the shapes that cross, the rules both hold to (`FRONTEND.md`).
- `src/modules` — backend modules, one directory per responsibility. See `BACKEND.md` for which
  ones there are.
- `src/utils` — helpers shared across more than one part of the codebase.
- `scripts` — what `package.json` calls, and nothing else: the dev run, the migration CLI, the
  subject graph. A developer's own tooling lives in `.tools/`, which is gitignored.
- `design` — the frames, and nothing else is a source for anything visual.
- `tests` — e2e tests. `BACKEND.md` holds what belongs there and what is colocated.

## The first rule — a thing is found by its own id

Every thing of the domain carries its own unique identifier, and it is the identifier we look by. Not
the hour it was asked at, not its name, not its place in a list, not its text — those may group, sort
or be shown, but they never say which thing this is. Two things made in one breath, a thing renamed, a
list reordered: each of them breaks a match on anything else, and the bug that follows is silent and
lands far from where it was made.

- Where an id is not at hand at the place that looks, carry it there. That is the work — not picking
  something else that looks unique enough today.
- When the id finds nothing, stand still and say so. Never quietly take the neighbour, the last one, or
  the first: acting under the wrong thing is worse than not acting.
- The one search that is not this is the person's own: a field where somebody types a name, a filter, a
  query. There the words are the point, and a thing found that way is still carried on by its id.
- The same holds across the wire and across the record: what is written, read back and matched is the
  id; a shape that has none gets one.

## Architecture & Coding Conventions

### Code style

- Functions and methods stay small and single-purpose, with clear, properly indented multi-line bodies.
- No one-line `if`/`else` statements — always use braces and put the body on its own line.
- No one-line function or method bodies, including single-statement `return`s — the body goes inside a block, indented, even when it's just one statement.
- Follow KISS, DRY, GRASP, and GOF as the guiding design principles.
- Refactoring is judged by what a piece becomes, not by how short it got: a real module stands for one
  subject of the domain, holds that subject's rules and nothing else, is provable without the app
  around it, and says what it is by its own name and shape. A file that shrank and still cannot say
  what it is has not been refactored.
- Model the Node side — `src/modules` and `src/app` outside the renderer — with OOP: behavior lives in classes, not loose top-level functions. The renderer is React's and holds no classes at all: function components and hooks, per `FRONTEND.md`.
- This is a global rule for any code you write or edit: format it well, don't cram it together. Separate distinct logical steps with a blank line (e.g. after creating an instance, after building a fixture, before the "act" step, before assertions) instead of stacking statements back to back.
- **What a function takes is a named shape, not a row of arguments.** Two or three things in a row are
  read at a glance; past that a caller is counting commas, and the compiler cannot tell two strings
  apart. So they are handed over as one interface with a name of its own, in the subject's
  `interfaces/` — `TurnToAsk`, `TurnCatalogue`, `AgentStands` — and the callee destructures what it
  needs. The shape says which is which, a new field breaks no call site, and nothing can be given in
  the wrong order. No rule counts the arguments: the question is whether a reader can tell them apart,
  and the answer is usually no well before any number a rule could name.
- Never construct nested/cascading instances like `new A(new B(...))`. Build each dependency in its own statement with its own named variable first, then pass that variable to the next constructor.
- Don't add extra validation or defensive checks beyond what the task requires — especially regex-based parsing/extraction/matching bolted on to guard against inputs that shouldn't occur. Trust callers and upstream guarantees (e.g. the LLM passing a clean identifier per the tool's parameter description) instead of adding heuristics to compensate for hypothetical bad input.
- Don't wrap a call in try/catch to turn a thrown error into a graceful fallback — that's a crutch, not a fix. If a caller can violate a contract, fix the contract at its source (a stricter schema, `strict` tool-calling mode, a corrected prompt). The one contract this can't reach is a remote model's: `strict` is honoured per provider and may be lost on a fallback, so a tool call is checked against its own schema before it is invoked, and a mismatch becomes a refusal naming the fields — a guard, not a catch.
- Keep tools and functions as simple as possible. This system is read and called by cheap models as much as by strong ones — complexity here is exactly what we're trying to keep off their plate.
- Favor guard clauses over nested `if`/`else`. A method reads top-to-bottom: inputs at the top, a short run of guard checks that each `return` immediately, then the one action the method actually performs at the bottom — not a pyramid of nested branches.
- Outside the renderer, never declare a function inside another function or method. If a step needs its own logic, extract it as a separate named method at the class level, not an inline nested function. In the renderer, React's idiom stands — a component declares its handlers and effect bodies inline — but a step that grows logic of its own is still extracted, into a hook or a component, rather than nested deeper.
- Avoid `as` type assertions. When a type assertion is genuinely unavoidable — the types don't line up any other way — use the `<Type>value` angle-bracket syntax instead, and only reach for it as a last resort, not a routine shortcut. A `.tsx` file has no such syntax: there the angle brackets are JSX, so a value that will not line up is built whole with the type it claims — a full fixture rather than a cast.
- Always import Node.js built-in modules with the `node:` prefix (`node:fs`, `node:path`, `node:os`, etc.), never the bare name. This pins resolution to the actual built-in, protecting against a same-named package shadowing it in `node_modules`.
- An import path is never longer or shorter than it needs to be: reach for the narrowest barrel (`index.ts`) that already re-exports what's needed — not a deeper path into the file behind it, and not a broader barrel one level up that happens to re-export the same thing too. See `BACKEND.md`'s "Backend modules" for how this plays out across `src/modules` and its consumers, and `FRONTEND.md`'s "Electron app" for `renderer/`.
- Follow SonarQube-style corrections proactively, not just when flagged. Example: prefer `array.at(-1)` over `array[array.length - 1]`.
- Prefer array destructuring over a direct index for a known position: `const [item] = array` instead of `array[0]`. Enforced by the `prefer-destructuring` ESLint rule (array positions only, not objects).
- Object literals are always multi-line, even with a single property — never `return { x: 1 };` on one line. Enforced by the `object-curly-newline` ESLint rule (object literals only, not imports or destructuring).
- A comment says what the thing is, in as few words as that takes — nothing else. No prose, no observations, no history, no reasoning, no alternatives considered, no restating what the code already shows (a decorator's name, a declared type, a framework's documented behavior), and no project rules (those belong in this file). A comment is as long as saying the thing takes and not one word longer — there is no count it must come under, because a number of lines says nothing about whether the sentence is worth reading. A comment whose text fits within the print width is written as `/** ... */` on a single line.
- Write that comment while writing the file, and re-read it whenever the code under it changes — a comment is part of the edit, never a cleanup pass afterwards. The test is the tense, not the word: a comment says what **is**, never what the code once was. "used to", "previously", "formerly", "carried over from", "same as the old", "legacy" are history and go. "rather than" and "instead of" are not, on their own — «by its own ref rather than by a look after the effect» states today's fact by contrast, and the app is full of such sentences; they are history only when what follows them is an older version of this very code.

### Formatting & linting

- Fix reported issues rather than disabling rules or ignoring files.
- The house's own rules are in `eslint.config.js`: **ten bans hold the shape, one rule holds the wall,
  and one holds the order** — nothing is read above the line that makes it, since a closure reading a
  `const` declared below it throws at the moment of drawing and TypeScript does not see it. `FRONTEND.md`
  names each one with its reason. Two things about the config itself are traps rather
  than architecture, so they stand here. **Two blocks setting one rule name do not add up** — the
  narrower replaces the wider whole, so a block handing in its own short list silently unbinds every
  other ban for the files it matches, without an error anywhere; a ban is therefore declared once, by
  name, and every block that has something of its own to add spreads that list. And **nothing counts**:
  not a file's lines, not a function's parameters. A rule that counted either would ask for a split
  where none is due and let a muddled short one through. What is written down is the shape — what may
  reach what — and a shape is a fact about the house, not a number about a file.
- **There are three checks and each one runs over the whole repository**: `npm run typecheck`,
  `npm run lint` and `npm run prettier` (`npm run format` is the same as `prettier` but writes).
  Nothing is scoped to what changed: a selection rule that has to be kept in step with the tree is a
  second source of truth about what covers what.
- Run them once — after every edit a task needs is made, right before committing or handing the
  result back, never after each individual edit. They do not depend on each other, so run all three
  in parallel, `npm run typecheck & npm run lint & npm run prettier & wait`. One at a time only when
  isolating which of the three is unhappy.
- `npx eslint …`/`npx prettier …` on a hand-assembled list of files is not a substitute: it is the
  same everything-runs check with a chance of missing a file, and it hides which rule set actually
  applied. Run the npm script.
- **The tests are two commands, and they are run whole or not at all.** `npm run test:front` — the
  renderer, both Vitest projects, `logic` in Node and `screens` in jsdom — and `npm run test:back` —
  every `*.spec.ts` outside the renderer plus `tests/**/*.e2e.ts`, through `node:test`, under
  Electron. They are the person's to run unless the person hands them to the task; either way no
  equivalent is assembled from a subset, since a green half is not a green suite.
- **Before changing anything a test can match on, look for it first.** A word a person reads, a
  constant behind it, the shape of what one layer hands another — every one of those is asserted
  somewhere, and the specs are the last thing to notice. Grep for the constant and for the field name
  before the edit, not after the run comes back red: it costs one search and saves the person a round
  trip. A shape that grew a field breaks an exact `toEqual` in a spec that never mentions the
  function that changed.
- **Every finished piece therefore ends with both suites' numbers** — run by the task where it was
  handed them, otherwise asked of the person in plain words. Nothing is called done before them, and
  «green» is never said of less: typecheck and lint passing is «typecheck and lint pass», which is a
  different claim.
- `npm run typecheck` is three `tsc` projects in one script: the root `tsconfig.json`, which targets
  `src` but leaves the renderer out; the renderer's own `tsconfig.json` beside its sources; and
  `tests/`'s, whose `rootDir` spans both `tests/` and `src/`.
- The rest of `package.json` stands outside those three: `dev:app`, `dev:app:watch` and `agent` in
  `FRONTEND.md`, the three `migration:*` scripts and `rebuild:electron` in `BACKEND.md`, and
  `test:front` and `test:back` above. One is run by hand:
  `graph:features` draws which subject of the renderer imports which and fails on a ring or on
  `project` importing a subject (`FRONTEND.md`); `npm run lint` runs it after ESLint, so the layers
  and the rings fail one command.

### Design

`design/` holds the agreed design, frame by frame, and it is the **only** source for
anything visual. Two canvases: `Полотно пайплайну - офлайн.html` (121 frames, everything but the
details) and `Полотно пайплайну 2 - офлайн.html` (19 frames, 23f–23n, 23r, 23t–23x, 24g–24i and 24k —
details of the chat, the history and the projection). Each has a plain twin under `plain/` for grep and `git diff`; the
bundles are what you open. Never build or correct a screen from memory of it, from a screenshot in
the conversation, or from what seems reasonable — open the frame and read the values off it.

- **Find the frame first.** Frames are numbered (`1a`, `3b`, `30c`) with a title and a sentence of
  intent, and a frame's `id` and its caption are always the same word — no primes, so the second
  canvas numbers plainly (`23f`). Locate one by its text, then read it. `design/Карта кадрів.md`
  indexes both canvases — the fastest way to find which frame decides a thing. The map is words and
  the frame is pixels, and they can fall out of step: the map is rewritten whenever a rule changes,
  the drawing only when the canvas is redrawn. When they are not level, say so and ask — the map
  wins meanwhile, but a drawing left behind is corrected in the canvas, not read around.
- **A frame writes about itself as well as drawing itself.** Beside every frame stand notes in prose,
  and they name the things the design has dropped: 23c's note says the pill «ЦЯ МАШИНА» is nowhere,
  38a's says the rule carries that boundary instead. So a plain search for a dropped word finds the
  sentence announcing its removal and reads exactly like the thing still being drawn. Read the match
  in its surroundings before believing it.
- **Read it by rendering it**, not by grepping: the file is one long line, so only a browser tells
  you geometry, colour and spacing. **Open the bundle, not the plain twin.** A bundle carries React
  and all four components inside it, so it needs neither the network nor a server: point a headless
  browser at the `file://` path — from a file name without `#`, where a `file://` URL is cut — and
  pull values with `--dump-dom` or an evaluated `getComputedStyle`. The plain twin loads React from
  unpkg, so without the network it draws no spheres, no rail, no toolbar and no project chip, and
  those components are usually the whole reason a frame is being opened. Copy icon SVGs out verbatim
  rather than redrawing them.
- **A bundle can lag its own canvas**, since it is rebuilt by hand: before trusting one, count the
  frames in it against the plain twin beside it — `id="<number>"` with the letter optional, since 11
  and 43 carry none: 121 in the first canvas and 19 in the second — and check a word the design has
  since dropped.
- **Take the numbers, not the impression** — size, padding, radius, colour, font size, letter
  spacing. A value that looks close is a value that is wrong.
- **Nothing in the tests checks any of this, and nothing will.** The suite runs in jsdom, which has
  no layout engine at all: `getBoundingClientRect` answers zeros, styles are not cascaded, nothing
  is painted. So the values a screen is built from are proved by exactly two things — the frame,
  read carefully, and the person's eye on a screenshot afterwards. That is why a piece is reported
  with where to click and what to expect: the report is the visual test.
- **Where the design says nothing, ask.** Do not invent it, and do not fill the gap with something
  plausible.
- **A deliberate difference from a frame is not work, so it does not go in `TODO.md`.** `DESIGN.md`
  says what the app does, naming the frame, until the frame is redrawn to match; a canvas is redrawn
  whole — the canvas, its bundle, its plain twin and the map together — never one of them alone.

### Documentation

`DESIGN.md` holds how the interface looks and behaves — in words, over the frames in
`design/`, which stays the authority on how it is drawn; `BACKEND.md` backend architecture, module
conventions, and testing patterns, and `FRONTEND.md` the Electron app and renderer. Each describes the
system as it stands — at the same bar as a
comment: short, factual, no prose or narrative around the fact.

`TODO.md` says what the product lacks: the gaps inside what is built, each with why. **None of these
documents may contradict another.** A doc may describe something that doesn't exist only while
`TODO.md` carries its line — otherwise the description is a claim nobody can check — and closing the
gap deletes that line and leaves the docs untouched. A gap found on the way is written there in the
commit that found it.

Syncing them is the last step of a change, before the three checks and in the same commit — not a
separate cleanup later. Re-read every section the change touched and correct whatever stopped being
true. A change that moves a responsibility between components, adds or removes a module, or alters
how the interface behaves always touches one of these files.

### Secrets in the repository

- `.mcp.json` is this machine's own — the servers the editor talks to while working here, with their
  tokens written in plainly. It stays in `.gitignore` and never enters a commit: a token in a commit
  is a token to rotate, since history keeps it after the file stops holding it.
- Nothing else in the repository ever holds a secret literal. The app's own keys — a provider's, an
  MCP server's — are written in the app, kept by `secrets`, and never appear in the project's folder.

### Handing work over

- Every finished piece is reported with the steps to check it: numbered, where to click, what to
  expect, in the order a person would actually do it, starting from a state they can reach — an open
  project, a named section. A piece nobody knows how to look at is a piece nobody reviews.
- The steps carry the case that must **not** change as well as the new one. A report showing only
  the new behaviour hides whatever broke beside it, and that is the half a person cannot guess.
- Name the states that are easy to miss on the way — what appears only after a delay, only under the
  keyboard, only when something is missing, only in a file written by hand.
- What cannot be seen on screen says so, and names what to run or read instead: the test file, the
  command, the line in the project file.
- Keep it to what changed. The person has been following along and does not need the walk repeated.

### Commits

- One commit per finished piece, written the moment the piece is checked and green — the same piece
  the report describes, no smaller and no larger.
- Messages are English, like the whole history. A subject line is one of two states, a colon, and in
  a few words what the change did — `feat: first commit`, `fix: name field jumping on click`. `feat`
  for what the app gained, `fix` for what it stopped doing wrong; there is no third state, and a
  refactoring is a `fix` — the code stopped doing something wrong, even where the app did not change.
  The subject is **one action**, short: a commit that needs «and» in its subject is two commits.
- **The subject names the piece; the body tells it whole.** Every commit has one. It says what was
  actually done — not a file list, but the piece as a person would describe it — why it was needed,
  what was decided along the way, what a frame asked for and what was done instead, what was left
  undone, and what the change makes possible. A reader of the log should not have to open
  the diff to learn what happened.
- **A commit holds what the piece touched, and nothing that wandered in beside it.** Read
  `git status` first and stage by name — `git add <path> <path>`. `git add -A` is allowed only when
  that same `git status` shows nothing but the piece, which on a long session it rarely does.
- Write the message through a heredoc — `git commit -q -F - <<'MSG' … MSG` — rather than `-m`. Every
  message here has a body of prose, and a shell eats its quotes and dashes.
- Where a file cannot be deleted from the working environment, it is moved into `_to_delete/`
  (gitignored) and the report says so; staging then records the removal, and the person deletes the
  folder.
