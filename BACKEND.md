# Backend

The backend — `src/modules`, `src/utils`, `src/app/backend` and their tests. Project-wide rules live
in `CLAUDE.md`, frontend ones in `FRONTEND.md`.

## Where data lives

A project is a folder on disk, and `project.yaml` inside it is the **source of truth** — not a
cache, not an export. It is committed with the code, so the automation travels with the repository,
and it can change under a running app (branch switch, `git pull`), which the app watches for and
re-reads.

- **In the folder:** everything in it is the project, nothing hidden, split down one line — **every
  tie stands in `project.yaml`, and everything a thing is about itself stands in a file of its own**,
  named by its own id: `agents/<id>.yaml`, `models/<id>.yaml`, `commands/<id>.yaml`,
  `servers/<id>.yaml`, and a prompt's body as plain text in `prompts/<id>.md`. The project file
  holds the links, the model the project hears speech with (`speech.listenModelId`, its id), and, for
  an agent, its model, its prompt and its granted functions; the agent's
  own file holds its name, short description, colour, place, whether it is switched on, its maximum
  of calls and its temperature. A model's provider is a tie, so it stands in the project file; the
  model's own file holds its name, its kind (`text`, or `listen` for one that recognises speech, which
  holds no numbers; a file that names none is `text`), its prices and its two ceilings — what may be sent to it, and
  what it may say back. An MCP server has no ties, so its whole self stands in its own file: its
  name, whether it is local, the line that starts it or the address it answers at, and how it is
  signed in to. What moves is in no file — the connection's state and the functions a server hands
  over are asked of it each time it is reached — and a token is never written down: it belongs to
  the machine's keychain, and the file names only the way in. The project file alone gives the whole
  graph; two people adding an agent touch two different files.
- **A part file that is gone is neither refused over nor invented.** A model or a command whose own
  file is gone is left out of its catalogue and the project opens; everything the lost file never
  held — the model an agent runs on, the provider a model is served by, the functions granted, the
  lines — is untouched, so what pointed at the lost thing still points at it and says so. An agent
  is the exception, since lines are drawn to its sphere: a skeleton stands in for it, and the one
  thing it invents is a grey. An entry with no `file` field of its own is read as it stands and
  split by the next write. The folder is not hidden behind a dot: macOS shows none of them, and a
  new project would look like an empty folder.
- **In the OS keychain:** the key that encrypts every secret. Electron's `safeStorage` holds it
  there — macOS Keychain, DPAPI, libsecret — and the encrypted values sit in `secrets.json` beside
  the app's database, so the keychain carries one entry rather than one per secret. A secret is
  never a literal in the project file, and its plain value never leaves the main process: what a
  screen gets is a hint of it.
- **In SQLite:** only what is genuinely large or genuinely local — the registry of known projects,
  the history of what this machine has deleted from them, the record of runs, the last look taken at
  each MCP server, the servers this machine deleted whose keys are owed a sweep, and the run line of
  each local server this machine agreed to start. The
  registry is a list of folders and, beside each, where this machine was last looking in it — the
  canvas's place and scale and the section that stood open, kept as one string the module never
  opens. Whether a folder still holds a project is asked of the disk when the list is read, never
  stored. A view belongs here and not in the folder: panning is nobody's diff, and a colleague
  opening the same folder has their own. Forgetting a project drops its row and its history of
  deletions together, and leaves the folder untouched.

Exactly one module owns the file: it reads, watches, parses and saves it. No other module touches
YAML. A domain module declares in its own `interfaces/` what it needs from a store, and the project
module satisfies that.

Every file the project owns — the config and each prompt — is written to a temp file and renamed.
A partial write during a `git pull` would corrupt the project. **A read writes nothing**: opening
somebody's project leaves their folder as it was, and a part file they have just taken away does not
come back under their hands.

What is watched is the folder, not the config file alone, and the watch is taken up again after every
change it notices and every write of ours it records. A watch on one file goes deaf the moment that
file is replaced rather than written over — which is what an atomic write and every editor's save
do — and would never hear a part file at all; on some systems a folder's watch follows its files the
same way, so a rename leaves it on a file nobody will write to again. What counts as a change is a
fingerprint of the files the project is made of; anything else a person keeps in that folder is not
the project changing.

A save writes a part's file only when its text differs from what the folder already holds, so moving
one sphere touches one agent's file and not every prompt, model and command beside it; `project.yaml`
is written last, every time. Saves of one folder stand in a queue, so the fingerprint taken after a
write is of a folder nobody is writing to.

**A save never writes over a change it has not seen.** The screen holds the whole project and every save
sends all of it, so a save made from an old reading would quietly put the old files back. Each reading
therefore comes with a print — the fingerprint, hashed — and each save names the print of the reading
it was made from. Before writing, the folder's print must be that one, or what the app's own saves made
of it since (two saves sent before the first came back name the same reading); anything else is a hand
or a branch switch, and the save is refused with `PROJECT_CHANGED_ON_DISK`, the watch is asked to look
and the screen reads the folder again. The watch also looks whenever the window comes to the front, so
a change the file system never delivered is read on return from the editor, not discovered by a save.

Serialisation rules, decided once so every save is a clean diff: fixed key order, a `version:` field
at the top for upgrade-on-read, long text as block scalars (`|`), no anchors or aliases, and no line
width, so a long value never wraps.

## Backend modules

The modules are flat, one responsibility each, and none of them nests inside another:

- **`projects`** — the project file: parsing, atomic writes, watching it, and the registry of folders
  this machine has opened. Everything the file holds — agents, links, models, prompts, tool sources
  — is data to it, and it is the only module that touches YAML. The folder itself is three
  services and one door: **`ProjectFolder`** knows where a project's files lie and is the only thing
  that touches them; **`ProjectFileReader`** merges each part's own file under its entry in the
  project file; **`ProjectFileWriter`** takes them apart again and writes what changed. Reading a
  folder and writing one are two subjects that meet only in the folder they stand over, and
  `ProjectFileService` is the one door `ProjectService` names — four queries, each one line.
- **`secrets`** — the encrypted secrets file and the key to it in the OS keychain, and nothing else.
  Two modules need it, so it belongs to neither.
- **`providers`** — the known providers, which are the same everywhere, and what this machine holds
  for each: a key for a remote one, an address for a local one, and which models it offers. Keys go
  through `secrets`; addresses are not secrets and sit in the clear in `providers.json`, and the ids
  of the providers turned off on this machine in `providers-off.json` beside it. Either file not of
  its shape (a hand edit, say) reads as empty rather than failing the list. An off provider keeps
  its key and address, `ProviderState.isOff` says so, and `agentReadiness` stops any agent on it
  with `providerOff`. It is the one module a screen asks about providers, so a key is written
  through the provider it belongs to and `secrets` has no channel of its own.
- **`speech`** — hearing a recording, and the one thing of speech that is this machine's: the OS
  voice an answer is read with, by name, in the clear in `speech.json` beside `providers.json` (a file
  missing or not of its shape reads as no voice). Which model hears is the project's (38c): the
  window sends each recording with that model's provider and name, and only OpenAI, OpenRouter and
  RunPod OpenAI hear (`SPEECH_LISTEN_PROVIDER_IDS` in `contracts/speech`), all at the OpenAI
  protocol's `/audio/transcriptions`. The key and RunPod's address are asked of `providers` through
  the `SpeechReach` port, inside the main process. A recording whose provider holds no key, or no
  address where it needs one, is refused `SPEECH_NOT_SET`; a provider's own refusal, or a network
  that did not carry, is `SPEECH_HEARING_FAILED` with the provider's sentence after it. The sound is
  kept nowhere. The voice reads in the window, through the OS's own synthesis, so nothing of reading
  crosses the bridge.
- **`llm`** — the one module that imports LangChain. It takes messages, tools and a model, and gives
  back an answer or a list of tool calls; it also holds the one mechanical check between a model and
  a command (see Validation). A tool it is handed is of one of three kinds. A declared command is
  checked, its pinned values put in over the model's, and its line run; a function of an MCP server
  is checked by nobody, pins nothing, and goes to the server whose reach travelled beside the tools,
  found by the id the tool names; another agent is called with one request in words and runs a whole
  turn of its own — its model, prompt and tools, found by its id among the reachable agents that
  travelled beside the tools — silent, under the caller's stop, its answer the call's output. An agent
  already running above the call is refused rather than run, so the calls close no ring, and one that
  cannot run is refused with the words saying why. Every kind of call is said twice under one id,
  going out and over; a server's and an agent's call carry no line and no exit code, because no
  program was run. The key it calls with it asks of `providers`, in plain and inside the main
  process: a key crosses no channel, in either direction. An answer is taken in pieces and each piece
  is said onward as it arrives, to a port the app fills in — the module knows nothing of windows.
- **`mcp`** — MCP servers: launching them, holding the connection, the functions they announce and
  the schemas that come with them. What a server needs to authenticate is a secret like any other:
  written in the app, kept by `secrets`, never a literal in the project file and never asked of a
  terminal or an environment variable. The registration travels with the repository and says which
  parameters it needs — a GitHub token, a Slack one — so somebody who downloads the project sees what
  to fill in; the values stay on the machine that filled them, and one that has not says so instead
  of starting the server. A token is a person's own: four people on one project hold four tokens to
  the same server, and one token for all of them would make all four the same person to it. The
  module is five services: **`McpClient`**, the connection itself; **`McpCalls`**, what the calls to
  each server have come to since it was connected, counted where a call ends because the catalogue
  only ever asks «what do you hand over»; **`McpMemory`**, the last look this machine took, which is
  what lets a row say «34 → 33»; **`McpSecrets`**, everything of a server that stays on this machine,
  with the servers deleted here kept in `mcp_dropped_servers` so their keys can be swept without
  touching other projects'; and **`McpConsents`**, the run line this machine agreed to start for each
  local server (36k), kept in `mcp_server_consents` by the server's id with the line word for word,
  so a line changed in the file, or an earlier line of the same server, is not agreed to. A remote
  server runs nothing here and needs no consent. The screen asks and gives consent over
  `mcp:consented` and `mcp:consent`, and a server saved from the form is agreed to as written, since
  the person wrote that line. `McpClient` asks `McpConsents` (through the `McpConsentGate` port)
  before it starts any local server, and a line not agreed to is refused with `MCP_CONSENT_MISSING`
  before anything runs or is read from the keychain: it is the one gate, so a look, a call, a turn
  and a restart all pass it.
- **How `McpClient` holds a server.** A local server named in the project file is started as a
  process of its own — the run line split into a program and its arguments, quotes honoured, no
  shell between — shaken hands with, and asked what functions it hands over; the list is asked every
  time and written nowhere. A server is held open by its id alone, so it is started once however
  often it is asked, and letting it go ends the process; a server that falls lets go of its own
  place, so the next ask starts it afresh rather than failing for a reason nobody can see, and the
  app lets every one go as it quits. Calling a function brings back what a command's run brings —
  what came back and whether it went wrong — and never throws: a call that did not happen is named
  in the answer, because a turn is not worth losing over one function. A failure the server names
  itself is the function's outcome, its words handed on as they came; a picture or a sound is named
  rather than dropped, since nothing but text reaches a model here. A screen reaches a server over
  two channels: one look, answering with what the server said this time — whether it answered, its
  functions, the hour, the words it failed with — and one letting-go, which is 36a's «ЗАПУСТИТИ»: a
  fallen server is let go and started afresh, not asked again. A look never fails: a server that
  will not start is drawn fallen, and that is an answer, not an error. A remote server is reached
  over streamable HTTP, with the token read from the keychain under `mcp-token:<server id>` at the
  moment of reaching — by the id, so a rename keeps it; no token says `MCP_TOKEN_MISSING`, an empty
  address `MCP_SERVER_UNREACHABLE`. The library is the official `@modelcontextprotocol/sdk`, and the
  tests spawn a stand-in server that speaks the wire itself, so they hold the protocol, not the
  library.
- **`commands`** — declared commands: running one and reading what it printed. The line is the
  person's own and the arguments are the model's: the runner reads the line once, puts a value where
  a name in braces matches a parameter the command declared, takes out a declared name nobody filled,
  and touches nothing else — no quoting, no escaping, not a space of the line trimmed. What a value
  then means in the line is the line's own business, and quoting it is the person's to write.
- **`runs`** — a run and what it leaves behind: the walk of the drawn line, its steps in the order
  they ran, and every call inside a step. A step is written when it ends, whole — nothing here
  watches a turn as it goes — and the agent's name, colour and model are kept as they stood then, so
  renaming an agent says nothing about a run already over. The record is this machine's: it lies in
  SQLite beside the recent list and the history of deletions, never in the project folder, and a run
  goes after thirty days or when the person deletes it. A flow asked again goes on in the row it
  already has: every question is a row of its own in `run_questions` with its own `askedAt`, the
  run's `startedAt` stays the day it began, and the thirty days and the list's order are counted
  from the flow's last word — the reply that came back, or the question still out. A run read back
  carries the `askedAt` of its last question, which for a run asked once is the hour it began. How
  the row stands is counted from its steps on every read, so the table keeps no state of its own. A
  run still going is not deleted by hand, alone or with the rest of the project's history: it is
  still being written, and half a record is nobody's. The whole project going is the one exception,
  since then the record has no project left to belong to. The record is four services over one
  store: **`RunWriter`** (open a run, ask again in it, append a step, close it), **`RunReader`** (the
  project's list, one run whole, and one question's shared memory — told in words from the record at
  the moment it is asked, so the renderer and an agent called as a tool are given the same thing),
  **`RunSearch`** (one word through a project's whole record — every question, what every step said,
  and the calls) and **`RunKeeper`** (forget one, forget a project's, settle on waking, sweep at
  thirty days). `createRunModule` builds `TypeormRunStore` once and hands it to all four, so what the
  writer wrote is what the reader reads and the keeper sweeps; the controller composes them and the
  IPC map does not know there are four. Every write that touches more than one table — a run opened
  with its first question, a question asked again, a step with everything beside it — goes through
  `RunStore.inOne`, one transaction, so the record never holds half a step.

- **`walks`** — the conversation of the open project: the walk down the drawn lines, and the turns it
  puts to `llm`. **`WalkHub`** holds one conversation at a time and is what the screen's channels
  reach through `WalkController`; **`WalkRunner`** carries out one conversation's walks. What happens
  next is decided by the machine in `logic/` (`walk-machine.ts`) — pure, proved without a model — and
  the runner only does what it asks: **`TurnAsker`** puts a turn to the model — first the composer,
  when `memoryPlan` (a pure rule in `contracts/walks/`, which the screen's own numbers answer alike)
  says the memory has reached the agent's threshold — **`RecordWriter`** writes the record (one chain
  per walk, so it lands in order), and the words go out through the `WalkVoice` port. **`WalkEars`**
  tells the window what the conversation does, for as long as it is the one open.
  A turn looks at the servers its agent was granted before it is asked (`looksFor`), and a look
  refused for want of consent is a wall of its own in `agentReadiness`: `waitingConsent`
  (`contracts/project`) names the first granted server whose line this machine has not agreed to,
  and the turn does not begin — `noConsent`, its note naming the server, its answer carrying the
  server's id as `waitsFor` (36k). An agent granted no function of such a server is not held by it.
  An agent granted system commands (a grant of `source: system`, `pass_to` or `finish_here`) is given
  them beside its tools (`systemTools` in `contracts/walks`, built from the grants and `walks/logic`'s
  `followersOf`); the
  turn's `PassWay` or `FinishWay` takes the call, the ledger gathers every `pass_to` into one
  `RouteChoice` — each agent named once, its texts joined in the order of the calls — and only
  `finish_here` ends the turn after its round. A turn that passed something or ended the branch needs
  no words (`isRouteDecided`): `cutEnd` does not call it silent. `routedOuts` gives each line its own
  text (`HandedLine`): with no command the agent's answer on every line; with a `pass_to` only the
  agents named, each with what was passed it, the rest `notChosen`; with `finish_here` alone every
  line `finished`, and those lines then go the way a line to a switched-off agent goes (`notTaken`,
  `released`, `settled` with nothing, `letDown`). A converging point released with some suppliers
  empty carries their count (`missing`) with the ask, and the turn's words end with it.
  **`AgentAsk`** is the same conversation begun from a command line: it opens the project's
  conversation, walks to its end and answers. The window and `npm run agent` build the backend the
  same way, through `createBackend` in `src/app/backend`; only who is spoken to differs.

- **`attachments`** — a file or a folder packed into text for a question. It is one service,
  **`AttachmentPacker`**, with two hands. `measure` names and weighs a pick without reading a byte:
  the whole tree walked, every file's size, and the fewest characters the pack could come to — the
  paths exactly and each file at a quarter of its bytes, since no character is longer than four; given
  the room left under the model's ceiling, it stops the moment that least is over it and answers
  nothing, so a folder of a hundred thousand files is refused on its first thousand paths. `packAll`
  writes the pack when the question goes: a tree of paths, then each file under its own rule, a file
  whose bytes are not text as base64, and one the system keeps shut marked in place — walking on,
  never failing the whole pack — reading no file further than what is left of the ceiling can take,
  so a pack that crossed the ceiling is answered by the ceiling's wall and nothing reads a gigabyte to
  learn it. Nothing is limited and nothing is left out: no size cap, no skipped folder, no ignore
  file; the only bound is the ceiling. The pick and the pack cross the bridge as two channels of the
  desktop's own, held by `SystemShell` beside the chooser, since the system dialog is Electron's.

- A module lives in its own directory with `constants/`, `controllers/`, `dto/`, `interfaces/`, and
  `services/`, plus an `index.ts` re-exporting its public surface — whether its core is a persisted
  shape or a job, like `llm`'s. Beside them stands one `create-<name>-module.ts`: the module's only
  way in, wiring its repositories, services and controllers and handing back what the app may hold.
  `attachments` is the one without: its single service is built by `SystemShell`.
- `entities/` is TypeORM-specific and exists **only in modules genuinely backed by SQLite**. In
  file-backed modules, `interfaces/<name>-record.interface.ts` is the primary description of shape.
- `logic/` holds what the module genuinely decides and nothing that runs: pure functions over its own
  subject, reaching for no repository, no process and no file, so each is proved on its own. `mcp`'s
  is a command line split into its parts, a server's answer read as one string, a terminal's colours
  taken off it; `walks`' is the machine that decides what a walk does next. A module whose services
  only carry things about needs none.
- `testing/` holds the stand-in the module's own specs need and nobody else: `mcp`'s
  `stub-server.cjs` speaks newline-delimited JSON-RPC over stdio and nothing more; `walks`' holds a
  scripted model, a recording voice and a stood project. What more than one module's specs would
  write out lives in `src/utils/testing/` instead.
- **A shape that crosses the bridge is written in `src/contracts` and re-exported, never declared
  twice.** A module whose own vocabulary reaches a screen — `llm`, `mcp`, `projects`, `providers`,
  `runs`, `speech` — opens its `interfaces/index.ts` with `export * from "../../../contracts/<domain>"` and
  declares only what stays behind: its ports, its records, its module shape. Two declarations of one
  shape read as two subjects and drift in silence: each side mends its own copy, both keep
  compiling, and the two meanings part without a single error anywhere.
- Where a module's services would otherwise hold TypeORM queries of their own, a `stores/` folder
  holds the one class that speaks to the ORM, and `interfaces/<name>-store.interface.ts` says what
  the services may ask of it, in the module's own words. The services take that interface and name
  no `Repository`, so a spec stands over any store that answers, and what is kept and how is one
  file's business. `runs` and `mcp` are the cases that need it — eleven tables under one record, and
  three tables three services would otherwise query. A module whose service touches a single
  repository does not: the wrapper would be the repository renamed. A `*Store` interface a module
  takes but no store of its own answers is a port to another module — `McpSecretStore` is `secrets`,
  named in `mcp`'s words.
- Every category folder has its own `index.ts` re-exporting everything in it. A module's root
  `index.ts` re-exports the category barrels it has and makes public — `./dto`, `./entities`,
  `./interfaces`, `./controllers`, and in every module but `projects` its `./constants` too;
  `./services` stands in the barrels of `attachments`, `commands`, `llm`, `mcp`, `runs` and `walks`,
  `./stores` in `mcp` and `runs`, `./logic` in `mcp` and `walks`, `./words` in `walks`, and a module
  without a category has no line for it. `testing/` is the one folder no barrel names: a spec
  reaches its stand-in by path, and nothing else may.
- Every interface and every constant lives in `interfaces/` or `constants/`, never inline in the
  file that happens to be its only user. An interface goes in `interfaces/` as
  `<name>.interface.ts`; constants in `constants/` as `<name>.constant.ts`, one file per subject
  matter with that subject's constants together, even a hardcoded object or array literal, typed
  against an interface rather than inferred inline.
- `dto/` holds the validated shape of anything arriving from outside — a controller's payload, and
  the project file's own structure. Decorated classes, validated with `class-validator`. A data
  field is never optional: a value's absence is `null`, written to the file as `null`, and a reader
  normalises a missing key with `?? null`, so a field the person has not written yet reads as empty
  rather than as a fill-in (4e), and `undefined` never leaks into a comparison.
- A controller method takes the whole payload as one argument and passes it straight into the
  service, which destructures it. Every controller method carries `@Validate()` (from
  `src/utils/dto-validation`), checking any object argument against its class-validator decorators
  before the body runs. A controller returns the entity or record as-is — no output transformation.
- The root `src/modules/index.ts` re-exports `./data-source` and every module barrel except
  `attachments`, `runs` and `walks`, whose callers take them by their own paths — modules never
  re-export one another. What is not a module is not re-exported either: `src/modules/constants` and
  `src/modules/migrations` are reached by their own paths.
- An import crossing a category boundary inside one module goes through that category's `index.ts`
  (e.g. `../entities`). An import crossing into another module goes through that module's root
  `index.ts` (`../../projects`, not `../../projects/entities`). A file outside `src/modules` reaches
  a module the same way — `../modules/projects` — and takes the root `src/modules` barrel for what
  is the root's own, like `createDataSource`. A category a module's root leaves out is the exception
  at every level: `projects` re-exports neither `constants` nor `services`, so its constants are
  reached as `projects/constants`. A sibling file in the same folder is imported directly.

## Calling models

One library reaches the models: **LangChain.js**, for the chat call, the streaming, and the
declaration of tools. Its provider packages make a model reachable, one per provider:
`@langchain/anthropic`, `@langchain/openai`, `@langchain/google-genai`, `@langchain/openrouter` and
`@langchain/ollama`. LM Studio speaks OpenAI's protocol, so it is that client pointed at the address
it answers on. OpenCode Go goes, by the model's name, through the Anthropic client or the OpenAI one
(chat completions or the Responses API) to its one address, with the conversation's id in a header.
A RunPod endpoint is two providers: RunPod Queue (`runpod`, `RUNPOD_QUEUE_PROVIDER_ID`) is called by
`RunPodChat` through its queue, and RunPod OpenAI (`runpod-openai`) is the OpenAI client pointed at
the endpoint's `/openai/v1`, which `atProtocol` adds to the address once. A client may carry a
`failureHint`, one sentence said after the provider's own words when it refuses a turn; only RunPod
OpenAI has one, naming the two variables a vLLM worker turns functions on with. A temperature of 0
is not sent to any provider — the field is left out, since some models refuse it. MCP servers are
reached through `@modelcontextprotocol/sdk` itself, not a LangChain adapter. Tools are declared with
**raw JSON Schema**, not Zod: the ones an MCP server hands over are runtime data, and converting
through another representation only loses fidelity.

Everything the library touches lives behind **one module — `llm`**; the rest of the codebase asks it
for "these messages, with these tools, on this model" and does not know what is underneath, so
changing the library costs one module rather than the whole of running.

`LlmService` is handed the map of provider clients the same way it is handed the key store, the
voice and the tool runner. A turn is otherwise unwatchable from outside: whether a call was refused,
what the model was told in its place, and what it cost are all decided inside one loop. With the map
injected, a whole turn runs in a test against a model that says exactly what the test needs.

What is **not** the library's: which agent runs next and what a run is. Those are the product, and no
framework models them the way the canvas does — the app walks the drawn line itself. A line and a
tool are two different things: work is pushed down the line it was drawn along, and an agent granted
as a tool is asked for an answer and gives it back to its caller — no line fires because an agent was
called, and the walk knows nothing of it. The one thing a sub-turn reads from outside the turn is
the record: `LlmService` holds a `RunMemory` (the run module's `RunReader`), and an agent called with
the shared memory is given the question the caller's turn names (`runId`, `questionId` ride with
every ask). `subTurn` keeps the memory of an agent called as a tool by the same rules as a walk's
turn: `ReadyAgent` carries `MemorySettings` and its model's prices; `memoryPlan` decides (go,
compress, wall); a wall is a failed call in words (`AGENT_TOO_LONG_NOTE`, or `AGENT_RESERVED_NOTE`
where a reserve is held back, both told by `toolWallNote`); the pure parts of a tool's memory — its
thread as a turn is given it, the thread after a call, the facts of a compression — are `llm/logic`
(`toolThreadMemory`, `threadAfterCall`, `toolMemoryFacts`); a compression is the composer's call
under the caller's own stop (`composerPayload`, `run`). «Своя» is `RunningTurn.threads` (an agent's
pairs within this turn), «Загальна» is read through `RunMemory.sharedMemory(…, unwritten)`, where
`RunningTurn.unwritten` — one map for the whole turn and the agents it calls — stands in the
record's place for a compression the caller's step has not written yet. What a call spent goes up
in its outcome: `cost` (the tool's turn at its model's prices, with what its tools cost), summed by
the ledger into `AgentAnswer.called`, and `memories` (each compression with its cost, and its
`MemoryFacts` only for the question's memory), which `TurnAsker` adds to the step's cost and hands
to the record as `toolMemories`. A caller whose provider falls loses what its tools spent in that
turn with the turn. A fallen sub-turn hands its caller the words it fell with, as `LLM_ASK_FAILED`
(below).

**The composer is `LlmService.compose`**: one call of the agent's model, silent (nothing streamed to
the window), with no tools, at most one call, the model's own answer ceiling and the agent's
temperature, and **no system prompt**: it is one message, `composerMessage(memory, budget)` — the
memory as text (`memoryText`: the composer's earlier message, each turn told by who said it, then
the shared memory) between `<пам'ять>` tags, and after it `composerInstruction(budget)`
(`contracts/walks/composer-words.ts`): a strict compressor, four rules — no answering, no preamble,
keep the main from the most important down, and a hard limit in **words** (the budget in characters
over seven), stated in the task and again in the last rule. The memory is fenced as data so the
model does not take it for a conversation to answer: read as one, a request at its end came back
in the summary as the stage of the talk. A memory too long is cut from its start (`cutAtWord`,
keeping the end) to the room the ceiling leaves after the fence and the instruction
(`composerLength`); what the composer writes goes through `cutAtWord` keeping the start, cut to the
budget at a word, the least important going first. `TurnAsker` holds the composed text as the
memory the main call is given (`composedMemory` for a thread, `composedSharedMemory` for the shared
one; the shared memory is put together in one place, `sharedMemoryText`, with no task in it, and
`turnMessages` closes it on «ТВОЄ ЗАВДАННЯ:» where a turn has one), sums the cost of both calls
into the one step, and keeps the composer's facts and cost even when the main call falls after it.
A composer that says nothing falls the turn; one that was stopped ends it stopped.

A fault of the provider's own — a key it does not know, a model it does not serve, a network that did
not carry — is an answer, not a report: the turn fell, and the chat has words for that (44c). So
`LlmService.ask` catches what the client threw and refuses with `LLM_ASK_FAILED`, the provider's own
sentence after it; a `Refusal` crosses IPC as an answer and is written nowhere. The library's error
object is not ours to print — it carries the provider's headers and cookies — so only its message
goes on, and the IPC boundary holds to the same rule: a fault it cannot answer is logged as its
stack, never as the object.

## Validation

Two checks, each at the boundary where it fits:

- **`class-validator`** for anything whose shape we write ourselves: controller DTOs and the project
  file's own structure. This is the project's one decorator-based validator; do not add a second
  library for the same job.
- **The model's arguments against what a command declared.** Only a command is checked: this app
  wrote those parameter types, while a server's function carries a schema the app never wrote and
  has no standing to judge. A miss is a refusal before anything runs, naming the fields — the model
  is told in the tool's own answer, and the person sees the same refusal as a row of its own.
  "Invalid" alone does not get corrected.

A tool's **result** is not generated, it is produced by a server or a command, so nothing is asked
to try again: it is handed to the agent as it came. Calling the tool differently, reading what it
did return, or giving up is the agent's decision. A declared command has no schema on either side:
its arguments and its `stdout` are text, and nothing is assumed about the shape of either.

## TypeORM

Applies to the SQLite-backed modules only.

- **A flow is a sequence of questions, and each is a row.** `run_questions` holds them in order, the
  row of the history is named and dated by the last of them, and every step names the question it grew
  from — which a step nobody fed cannot answer once a repeat picks up work from an earlier question.
  The question opens the row, ahead of anything it starts: one that reached nobody is a question all
  the same, and every question of one conversation belongs to its one row (23j) — they follow one
  another, since a conversation walks one walk at a time (4b). Reading a
  run back hands the questions over with it, so a reader groups the walk by them and not by the clock.
- **A question's files are rows beside it, not part of its words.** `run_question_attachments` keeps
  each file or folder sent with a question — path, name, kind, the packed text and which paths went in
  as base64 — in the order they were glued in, written in the question's own transaction. `asked`
  stays the typed words, so the history, the search and the row's name read what the person wrote; a
  repeat glues the turn's input from both again with the walk's own function. A question sent
  without its list is refused, not read as one without files.
- **A question's recordings are rows beside it, their sound a blob.** `run_question_recordings` keeps
  each recording a question was said with — its own id, place, type, length in ms, the wave's peaks as
  JSON and the sound — written in the question's own transaction and going with the run by cascade, so
  no file outside the database can be left behind or found missing. A run read back carries them
  without the sound (`QuestionRecording`); the sound is read alone, by the recording's id, over
  `runs:recording-sound` (`RunReader.recordingSound`), and an id that finds none answers `null`. The
  sound never passes the walk machine: `walks:put` answers the walk and the question's id it minted
  (`PutWalkAnswer`), the runner holds the recordings under that id until the question's write takes
  them into `askQuestion`, and no snapshot carries them.
- **A column that names another row is a table; a column that holds a frozen value is not.** The two
  edges of a walk — whose work came into a step, and where a step's work went — are `run_step_feeds`
  and `run_handoffs`, each with its keys and its own order: a name of a row hidden in text is a name
  the base cannot follow, join, or clear away with the row it names. The opposite half matters as much:
  the three snapshots beside a step look like duplicates of the library and are not, and a call's
  `arguments` stay JSON because a document is not the name of a row.
- **A relation the query does not name comes back empty.** Reading `row.question.id` off a step found
  without `relations: { question: true }` throws at runtime and passes every spec, since the in-memory
  stand-in hands back whatever was saved into it. Name each relation a reader walks into, or read the
  row it names by its own query.
- **Every key is indexed, because SQLite indexes none of them itself.** Without it «steps of this run»,
  «calls of this step» and «runs of this project» are all scans. `@Index()` stands over each relation
  that is read by, and over `runs.directory`, which the history opens with.
- An id column is `@PrimaryGeneratedColumn("uuid")`; application code never calls `randomUUID()`.
- Don't add a foreign key as its own scalar column when a relation decorator already covers it — set
  and read it through the relation object (`agent: { id: agentId }`). `run_steps` carries its run
  and `run_calls` its step that way, as does every other table of the record.
- Prefer native repository methods (`create`, `save`, `update`, `find`, `findOneBy`, `softDelete`...)
  over `createQueryBuilder`.
- An entity's own columns come first, then `createdAt`/`updatedAt`/`deletedAt`, then the relations.
  Relations are bidirectional: the owning side (the one with `@JoinColumn`) is the child/many
  side, and the inverse side names the owning side's property as its decorator's second argument.

## Database connection & migrations

- `src/modules/data-source.ts` exports `createDataSource(databaseDirectory: string)`, building a
  `better-sqlite3` database at `<databaseDirectory>/coder.sqlite`. It takes the directory as a plain
  string rather than calling `app.getPath` itself — the Electron main process passes
  `app.getPath("userData")` at runtime, keeping this module free of an Electron dependency.
- `synchronize` is always `false`. **Every schema change is a new migration** in
  `src/modules/migrations/`, generated — never written from nothing — with
  `npm run migration:generate -- <PathAndName>` after the entity is edited, checked in, and run
  explicitly: `npm run migration:run` applies, `npm run migration:revert` takes back the last. The first is
  `1793697764855-Initial`, which builds the base schema: `project_entries`, `deletions`, `runs`,
  `run_questions`, `run_question_attachments`, `run_steps`, `run_calls`, `run_handoffs`,
  `run_step_agents`, `run_step_models`, `run_step_settings`, `run_step_feeds`, `run_memories`,
  `mcp_server_looks`, `mcp_dropped_servers` and `mcp_server_consents`. `1793991075893-QuestionRecordings`
  adds `run_question_recordings`.
- **A committed migration is never edited or deleted.** Databases that have already run it will not
  run it again, so a change to it reaches none of them. A mistake is fixed by the next migration, a
  compensating one; where it has to repair, it is written to stand on a database in either state —
  `CREATE TABLE IF NOT EXISTS`-style.
- A generated migration is normalized to the house style before it is checked in: the generator
  writes template literals and the repository writes strings, so prettier and the quote rule are run
  over it like any other file. That is formatting, not authorship — the SQL is left as generated.
- **The record keeps how a step ended as a word of its own** — `done`, `failed`, `stopped`,
  `silent`, `ceiling`, `calls`, and frame 4e's ten for a turn that never began: `noKey`, `noModel`,
  `noProvider`, `noAddress`, `unreachable`, `notFilled`, `notFilledAgent`, `lostPrompt`,
  `lostFunction`, `tooLong` (26b), 36k's `noConsent` for a turn granted a local server whose run
  line this machine has not agreed to, and two drawn in no frame: `providerOff` for a turn whose
  model's provider is turned off on this machine, and `noTools` for an agent holding grants on a
  provider whose protocol carries no function calls. One word for several ends is a fact lost: the
  live stream tells the person which wall the turn hit, and the record has to be able to tell them
  again. The column is a `varchar`, so a new end costs no migration; how a _run_ stands is counted
  from the last step, and anything but `failed` or `stopped` reads as ended (24d).
- **A turn that never began is a step like any other.** Nothing was sent, so it carries no tokens,
  no money and no duration — `endedAt` is its `startedAt` — and where another step keeps the calls
  it made, this one keeps the provider's own words in `said`. A `noConsent` step keeps one fact
  more, `waitsFor`: the id of the server it waited on, so the card read back opens the window of 36k
  over that very server; it is not a key, since servers live in the project file, and every other
  step leaves it `null`. Writing it is what lets the card be drawn again after the app is closed
  (4e). Frame 23n's question that could not go is the opposite case and writes nothing: there was no
  attempt, so there is no step — only the question, which was written when it was asked.
- **A step keeps what happened; who, what and with-what stand beside it, one table per subject.**
  The step holds the question, the walk it ran in, the answer, the end, the tokens, the money and
  the times. `run_step_agents` holds who ran it (id, name, colour), `run_step_models` which model
  answered and whose provider it was with the prices a million tokens carried then and both ceilings
  it stood under, and `run_step_settings` what it was given to run with — the prompt word for word
  and the two numbers the person set. Each is one row per step, none shared: two turns of one agent
  are two moments, and a moment is not a thing two rows can hold in common. All three are frozen for
  the same reason: the library, the catalogue and the prompts are all edited, and a step that kept
  only their names could not say a week later what the agent answered with, on what, or why the
  money is that number.
- **A memory written shorter is a row of its own, `run_memories`, and not a step.** The composer's
  call is no turn of any agent's: it carries no hand-off, no lines and no answer to the question.
  The row holds whose memory it was (`agentId`, the question it was made under), the place it covers
  (`coversPlace`), the composed text, the length before and after, the **threshold and target the
  agent had then** (`compressAt`, `compressTo` — a fact of that moment, like the prices of a step,
  so a later edit of the agent cannot change what the stream says), and the tokens and money of the
  call. The step that asked for it is named by `stepId`, and a step may name several: its own
  agent's and the question's memories of the tools it called (`run_memories` is many-to-one with
  `run_steps`); a tool's own thread, which lives for one turn, is never written. The memory a turn
  is given is the latest row for the agent and the thread (or the question) and everything the
  record holds after it. Only that is read: the store picks the one row by the latest paying step
  (`latestMemoryOf`, ordered by the step's place, one row) and only the steps after the place it
  covers (`stepsOfAgent` for the thread, `stepsOfQuestion` for the question; suppliers' names by the
  ids the feeds name) — never the whole run, which only the run's own page reads
  (`RunReader.ownThread`, `RunReader.sharedMemory`). Rows go with their run, and nothing is ever
  deleted to make room.
- **A run keeps the name and colour of the agent it began with, beside that agent's id.** Read off
  the run's first step instead, a row whose question was written but whose first turn had not landed
  would stand nameless, since the row is opened by the question before that step exists (23a).
- **A snapshot says what a thing was; it carries the id to say which thing.** `agentId`, `modelId` and
  `promptId` stand beside the copies, since 24e holds the participant of a run against the agent today,
  and a changed name or an edited prompt cannot find «today». The id is not a foreign key: agents,
  models and prompts live in the project file, and a run outlives any of them being deleted.
- **`money` on a step is kept although the tokens and prices beside it could give it again.** It is
  what the person was shown and what the row of the history adds up; a number counted again by a later
  formula could quietly disagree with what they saw. The prices are there to explain it, not replace it.
- **A step keeps the links it made, because a link not taken leaves no step.** Drawing them from the
  steps a step fed is enough only while every link is taken: «НЕ ПЕРЕДАЄ ⇢ ЗАГОЛОВКАР · ВИМКНЕНИЙ»,
  and a link taken to a turn the stop caught before it began, would be on the screen and nowhere in
  the history. So a step names whom the work went to, the word for why it did not go (nothing where it
  went through), and the text the line carried — the answer, or what `pass_to` handed that agent,
  empty where it was handed nothing — which a repeat hands on again. The word is `off` for an agent
  switched off, `notChosen` or `finished` for the agent's own choice; a repeat reads them back, puts
  again a line that was `off`, and never one cut by the agent's choice. `busy` is read the same way
  as `off` and written by nobody, since an agent is never busy (29f); rows from a build that ran one
  turn at a time carry it.
- **A generated migration is read before it is run, because the generator guesses.** A change that
  drops one column and adds another in the same breath is taken for a rename: the copy then carries
  the old column's values into the new column, whatever they mean — words into a column of dates,
  and the base is gone.
- A generated migration is corrected only where it would lose data. SQLite has no `ALTER COLUMN`,
  so TypeORM rebuilds a table by copying it — and it copies only the columns it knows the table had
  before. A column added by an earlier migration that TypeORM then rebuilds is left out of that copy
  and its values go, so those lines are added by hand. Apart from that and a compensating repair,
  nothing in a generated file is edited: `Initial` builds ten of its tables twice, since SQLite gets
  its foreign keys by rebuild, and that is left standing.
- **A new column lets the rows already there survive it.** Databases hold rows written by earlier
  builds, so a column is added nullable or with a default the design accepts — never one an old row
  cannot fill. A fact a step does not carry is `null` — unknown, which is not zero and not an empty
  string.
- The three `migration:*` scripts point at `data-source-cli.ts`, which calls `createDataSource` with a fixed,
  gitignored `.data/` directory under the repo root.
- They run `scripts/run-migration-cli.js` through the local Electron binary in
  `ELECTRON_RUN_AS_NODE=1` mode, not plain `node`, for two reasons. `better-sqlite3`'s native binary
  is built for Electron by `npm run rebuild:electron` (`scripts/rebuild-electron.js`), which every
  install needs, since the install builds it for the Node that ran it — so plain `node` fails with
  `ERR_DLOPEN_FAILED`. And `yargs`, which the TypeORM CLI is built on, drops the wrong
  number of leading `process.argv` entries whenever `process.versions.electron` is set and
  `process.defaultApp` is falsy, exactly the state `ELECTRON_RUN_AS_NODE` leaves the process in;
  `run-migration-cli.js` sets that flag by hand before requiring the CLI.
- The scripts only ever reach the CLI's `.data/` database. `createBackend`
  (`src/app/backend`) calls `dataSource.runMigrations()` right after `.initialize()`, the only path
  by which a migration reaches the app's own database.

## Shared utilities

`src/utils/` holds helpers shared across more than one part of the codebase rather than owned by a
single module, following the same rules as everywhere else — its own `interfaces/` for any interface
it needs, never inline.

- `src/utils/dto-validation/` — the `@Validate()` decorator every controller method carries.
- `src/utils/testing/` — `openTestDatabase` (see Testing). The renderer's own equivalent is
  `src/app/renderer/testing/` (`FRONTEND.md`), and it stands in for the bridge rather than for a
  database.
- `src/utils/refusals/` — `Refusal`, the error a module throws when the answer is «ні» rather than a
  fault: the app turns it into words on a screen instead of a line in the terminal.
- `src/utils/addresses/` — `atProtocol`, an address with a protocol's path on its end once, which
  `llm` and `speech` both put RunPod's endpoint through.

## Testing

- E2e tests live in `tests/`, named `*.e2e.ts` (`*.controller.e2e.ts` for a controller); unit tests
  are colocated, named `*.spec.ts`. Both run through `node:test` under `npm run test:back`, which
  takes every `*.spec.ts` outside `src/app/renderer` — the modules and the IPC channels alike — so a
  spec in a folder nobody thought of still runs. `CLAUDE.md` holds whose command it is.
- **Anything that touches the schema is tested against a real database, never against a stand-in for
  one.** `openTestDatabase` (`src/utils/testing/`) opens real SQLite in a temporary folder and runs
  the real migrations over it, so a column's `default`, a `@OneToOne`'s implied uniqueness, a cascade
  and a table that does not exist are all as true in the test as in the app; the folder is thrown
  away when the test lets it go, and nothing there goes near the database a person's app keeps. It is
  what the `record`, `run-search`, `deletion`, `project` and `mcp-consents` specs and two e2e tests
  stand on.
- What is stood in for is everything that is **not** the database — the collaborators a service is
  handed: a file store, a watch, a history, the process behind an MCP server. Those are written as
  stubs beside the spec that needs them, because what they answer is the point of the case.
- A service whose whole job is the filesystem — `ProjectFileService` — is tested against a temporary
  directory for the same reason: standing in for `node:fs` would leave nothing under test.
- **A unique index sees soft-deleted rows and `findOneBy` does not.** Any lookup guarding an insert
  against a unique column runs with `withDeleted: true`, or it misses a row the constraint still
  counts and turns the insert into a failure no test reproduces.
