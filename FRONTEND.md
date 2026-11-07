# Frontend

The Electron shell and its renderer — `src/app`. Project-wide rules live in
`CLAUDE.md`, backend ones in `BACKEND.md`, UI/UX decisions in `DESIGN.md`.

## Electron app

- `src/app` is the Electron shell: a main process (`main.ts`, launched through `bootstrap.js`) and a
  React + Vite renderer under `renderer/`, styled with Sass and Bootstrap. `backend/` holds
  `createBackend`, which wires every module; the window builds it, and so does `agent-main.ts`
  (through `agent-bootstrap.js`, `npm run agent`) — the same backend with no window, its command
  line read by `agent-cli/`.
- `npm run dev:app` starts the renderer's Vite dev server and launches Electron pointed at it — the
  only way to run the app, since there is no production build. `npm run dev:app:watch` wraps the
  same script in `nodemon`, restarting on any change the main process loads — `src/app` outside
  `renderer/`, `src/modules`, `src/contracts`, `src/utils`, specs excepted; a renderer change needs
  no restart, Vite hot-reloads it.
- The renderer never imports `src/modules`, or anything else Node-only, by value. Every call goes
  through `window.electronApi.invoke(channel, payload)` and `subscribe(channel, listener)`, the one
  generic bridge `src/app/preload.js` exposes via `contextBridge`, so adding a domain never touches
  `preload.js`. An ESLint rule enforces this and allows type-only imports.
- `src/contracts/` is what the two processes agree on: the channel names, one file per domain under
  `channels/`, the shapes that cross either way, and the rules both sides hold to. A rule stands
  there when the two sides must answer it **alike** — what a command may be called, what a grant
  points at, which step of a walk a turn stands on, how several bills add up, **the bounds of every
  number the person types** (a temperature, a call limit, a model's two ceilings, an agent's
  compression threshold and target) and how long a deletion can be taken back — written once, proved
  once by a spec of its own, importing nothing from either process. A bound the screen keeps its own
  copy of is a screen one edit away from offering what the file will refuse. Everything else about
  running belongs to the side that runs it: a rule only one side asks lives in that side's `logic/`.
  The renderer, `src/app/ipc` and the modules themselves all import from there — a module whose
  shape crosses the bridge re-exports the contract rather than declaring its own twin (`llm`, `mcp`,
  `projects`, `providers` and `runs` do) — so a renderer file reaches a channel name without pulling
  the backend into its bundle, and neither side reaches into the other's folders. **`ChannelMap`
  types every call and `PushMap` every push**: `invoke` takes what its channel takes and answers
  what it answers, and `subscribe` hands its listener what that channel carries, so no caller says
  which type it expects and none can say a wrong one.
- `src/app/ipc/<name>/` holds a domain's declarative channel map (`<NAME>_IPC_CHANNELS`, keyed by
  channel name, each value a handler bound to that domain's controller method); `main.ts` takes the
  maps themselves, through `./ipc`. `registerIpcChannels`
  (`src/app/ipc/register-ipc-channels/`) turns any map into live
  `ipcMain.handle` calls; `main.ts` calls it once per domain.
- **`MainPage` is composition, not content.** How the screen behaves — what opens the panel, what
  closes it, what a click on empty canvas lets go, what a catalogue keeps — is `DESIGN.md`'s; this
  is where each piece of state lives. Every write to the project's file goes through
  `useProjectWrite` — the one `save`, the `defer` every deletion takes (out of the folder, into the
  record, and a way back worked out against the config as it stands rather than replayed from a
  snapshot), the write's note and the standing offers — and each subject writes through its own hook
  over it (`useAgentWrites`, `useLinkWrites`, `useModelWrites`, `useCommandWrites`,
  `usePromptWrites`, `useServerWrites`, `useScheduleWrites`), which lives in that subject and knows its
  own form shapes.
  A subject's page-held marks live in that subject's own `features/<subject>/hooks/`. The page's own
  `hooks/` holds the seven that are the page's and nobody's:
  - `useProjectActions` — the writer and the subjects' writes composed into the one object the page
    hands down.
  - `usePageParts` — everything the screen stands on, composed once and returned as nine parts
    **whole and named after what owns them** — `items`, `machine`, `chat`, `stream`, `pass`, `rail`,
    `agentStates`, `looks`, `consent` — so a caller says which part it reads
    (`parts.rail.isCollapsed`) instead of depending on a flat facade of two dozen fields.
  - `useRailStanding` — which section stands open, whether the panel is put away, whether the open
    panel is the selection's own, and every way of moving between them.
  - `useShownStream` — which stream is being read, the live one or a run opened out of the history,
    with the two forgetting paths.
  - `usePageKeys` — the window's own floors of the keyboard.
  - `useNotedView` — this machine's note about this project: the pan, the scale, the open section,
    whom the chat is aimed at, how tall the field was pulled; nothing of it enters the project file.
  - `useShowCall` — «ПОКАЗАТИ ВИКЛИК»: the catalogue handing the chat a call's own place.
    What each subject holds, in its own `hooks/`: `useAgentSelection`, the agent under the hand — the
    selection, the claimed point of one being created and the deletion question, one state since each
    cancels the other; `useAgentDraft`, the settings tab's changes not yet written, handed to the
    canvas so a rename moves the sphere's label as the keystrokes land; `useAgentClipboard`, the app's
    copy and the mark on one just put down; `useModelSection`, `usePromptSection`, `useCommandSection`
    and `useServerSection`, each catalogue's open, edited and asked-about ids with the derived lists
    its overlays show; `useServers`, what each declared server said when it was last asked, held while
    the project stands open and written nowhere — a remote server asked as the project opens, a local
    one only once a person raises it, and a look refused for want of consent (`isConsentMissing`) held
    as no look at all; its `stop` («ЗУПИНИТИ», a standing local server's row) lets the process go and
    forgets that the server was raised, so a change of its line starts nothing; `useServerConsent`,
    the window of 36k: which server it stands over, by id, and «ЗАПУСТИТИ» asking `mcp:consented`
    before it raises, so the page hands it to the catalogue as `onRestart` and stands `ServerConsent`
    among its questions; `useSchedules`, the clock's side of the window: the open project handed over
    `schedules:follow` whenever its config changes, whatever section stands, so the schedules run while
    the project is open, and each schedule's standing read back after every write to the record and
    on a fifteen-second beat the countdowns are read against — its `switchOn` is this machine's switch,
    which writes nothing to the project; `useScheduleSection`, the section's open form and its draft,
    the switch of a schedule not yet written held until it is, and the deletion question; `useProviders`, every local provider that is not turned off asked on a
    fifteen-second beat, told by the chat what each turn heard at that address, and turning a provider
    off or on at once, an off one's last answer let go — while `ProvidersPanel` keeps what was typed
    per provider in its own state, so a card folded by its chevron, by opening another provider or by
    a switch shows it again at the next opening, and «СКАСУВАТИ» and «ЗБЕРЕГТИ» drop it;
    `useSpeech`, this machine's voice, read once and changed by laying each change over the settings as
    they stand — a change the machine refuses is said on the line and the settings are read again —
    and the OS's voices, told again whenever the OS hands them over; `useSpeechWrites`, the project's
    choice of its recognition model, written through the project's writer; `useVoiceAsk`, a question
    said into the field (4j) — the microphone, the recording metered every 100ms for the running wave
    (`soundLevel`, `levels`), the project's recognition model hearing it (`hearingChoice` finds the
    model by its id and stands on nothing where it does not stand), and its words written after the
    draft through `heardIntoDraft` with the recording handed over as a `HeardClip` (its own id, sound,
    length and `wavePeaks`), which `useAgentChat` keeps under the field and, once the question goes,
    by the question's id in `heardBy`; every refusal is handed to the page's line as a `SpeechNote`
    carrying its act; `useSoundPlayer`, the window's one recording (4l), playing a `SoundTrack` from
    the sound at hand or read from the record by its id, following how far it played frame by frame
    and seeking where its wave is pressed — `questionTracks` gives each question on screen its tracks,
    the opened run's from the record and this screen's from `heardBy`; `useReadAloud`, the window's one voice (4k), which
    reads an answer by the message's own id with `spokenParts` leaving the code out and following the word the voice reaches (`spokenWord`) for the card to light, and which the
    sample in «Мовлення» shares — the page composes them, stands `SpeechSection` on the rail after
    the prompts, hands `voice`, `aloud` and the player to the chat — a recording beginning silences
    the reading and a reading beginning stops the recording — and the chat section drops a recording
    and silences a reading and a playing one when the stream is left;
    `useAgentChat`, the chat as the screen shows it: the walks are run by the backend and come back as
    a snapshot, and what is typed, aimed at and attached, and the repeats, stay here — with the files
    picked for the next question waiting under its field, per stream, and the pick refused said back
    to the page's own line (`usePackedSend` beside it packs the files as a question goes, and gives
    the question back to its field where the pack failed); `useProjectFile`, what arrived from disk
    under the app and the question it raises; `useUndoOffers`, the standing offers to put a deletion
    back on one clock; `useRunHistory`, the history tab's list, read from the record when the tab
    opens and on every write to it; `useOpenedRun`, a run read whole from the record and turned into
    the stream's own messages by `runStream` — the same reader the projection opens a pass out of,
    through `oneWalk`; `useOpenedPass`, the pass the projection stands on, a run and a question inside
    it (24g); `useProjectView`, where this machine is looking, kept across windows. The asking before
    a draft is left is the shared `useWayOut`: a panel with work typed in and not written hands it up
    as an `UnsavedWork` — its name, its changes, and how to write or drop them — and the page wraps
    each exit in `wayOut.guard(...)`, naming the voice the question speaks in («leave» past the panel,
    «drop» under the fields); nothing else needs to know which panel the draft belongs to. Wiring
    between subjects is the page's: an act inside one subject that must bring another's section
    forward composes the two beside the call. `SidePanel` controls none of it — it reports back, and
    whether it stands open is the page's own state. A new agent from Агенти with nothing selected: the
    page says only that the middle was claimed, and `Canvas` works out where that is in a layout
    effect once the claim appears — by then the panel has opened and the canvas is its final width —
    and hands it back through its one imperative handle at save.
- How far the canvas has been dragged, and how large it is drawn, are `Canvas`'s own state: an
  agent's position is data, the pan and the scale are a view. The only thing that crosses out is a
  note — the canvas reports where it stands, the page writes that down beside the open section once
  it has stood still, and a project opens where this machine left it. The pan and the scale
  themselves belong to no subject: `components/zoom-field/` holds `useZoomField` with the
  box↔content arithmetic and the drag over empty space, and `components/zoom-toolbar/` the control
  over it — the canvas draws agents on that field and the debug projection draws a run, and the
  field is the same primitive under both. What is the canvas's own lives in its own `hooks/` beside
  its `ui/` — `useSphereDrag`, the one sphere being dragged — and is exercised through
  `canvas.spec.tsx`. Everything drawn in canvas coordinates sits in one translated and scaled layer,
  and a pointer is read either in the box's coordinates (a menu, drawn where it was opened) or in
  the layer's (a claimed point, a dragged sphere), never mixed. Both are kept to two decimal places,
  since a run of `0.1` steps is not exact.
- `renderer/` splits into `components/` (reusable primitives — `Sphere`, `ActionButton`, `Field`,
  `ContextMenu`...), `features/` (one folder per subject, everything about it together), `pages/`
  (screens — `StartPage` and `MainPage`), `utils/`, `interfaces/`, `constants/`, `testing/` (what
  the specs build from — see Testing below), `logic/` (what the whole renderer works out and no one
  subject owns — whether a name may stand in a file, what is broken about a grant, whether a name is
  taken — the same rule asked by two subjects, which is why it cannot live inside either), `words/`
  (what the app says about the shapes in `interfaces/` — a count of agents, the name of the field a
  model has left empty — over the forms in `constants/`. The test is the same one `logic/` answers:
  a line **two** subjects say. A line one subject says lives in that subject's own `words/`, however
  general it looks), `types/`, and `hooks/` — React hooks shared across components, each in its own
  kebab-case folder, with a colocated spec where it has one: `useWayOut` for the asking before a
  draft is left, `useInteraction` and `usePressable` for what a control does under a pointer,
  `useElapsed` and `useStandingStep` for what a clock shows while a turn is out, `useStayAtBottom`
  and `useScrollMark` for a stream that is being written into, `useAttentionPulse` for a thing that
  has just changed, and `useKeyboardMode` for what a window shows only to a keyboard, `useBoxWidth`
  for what a box measures at, `useListWalk` for the arrows over a list that opens — where they
  stand, what Enter takes, and the row the list scrolls to — `useChoiceArrows` for the arrows inside
  one slot of choices, `useFieldTab` for Tab walking the fields of the open tab and nothing else,
  and `useFresh` for how fresh a moment is on the one scale, kept true by its own beat. The two
  below are written out because they are the two with a trap in them. `useWindowDismiss` closes
  whatever is open on a click anywhere else, one task late so the opening click cannot close it —
  the menus, the pickers, and the mark on a copy just pasted. It holds the callback in a ref rather
  than depending on it, since React flushes the state a click sets before that click reaches
  `window`: a caller passing an inline arrow would otherwise have its listener removed and re-added
  mid-click, and the first click would do nothing. What it hears is the click, or — for something
  with nothing to click on, like the mark on a copy just pasted — the press that starts one, in the
  capture phase, since a sphere and the zoom toolbar both keep their own press from travelling any
  further. Anything that stops its own click from bubbling — a sphere does, so the canvas behind it
  keeps its selection — has to say so through its own handler as well. `useWindowKeydown` is the
  same ref-held pattern for the window's keydown: every window-level keystroke goes through it, and
  a caller keeps one subscription however often it re-renders. A destructive key checks `isTypedIn`
  first — a field keeps its own keystrokes. `layout/` is created when something belongs in it. There
  is no router: `App` shows `StartPage` until a project is open, then hands `MainPage` that project
  — its folder and its config — together with the setter every change to it is written back through.
- Data read over `window.electronApi` is fetched by the lowest component that more than one of its
  children needs it in, in a `useEffect`/`useState` of its own, and handed down as props together
  with the setter either child writes a change back through. A component that is the only reader of
  what it fetches still fetches inside itself.
- Each component/page is a kebab-case folder holding up to a `<name>.tsx`, an optional
  `<name>.scss`, a colocated `<name>.spec.tsx`, and an `index.ts` barrel. Every category folder's
  `index.ts` re-exports each entry inside it, so callers import from the category root (e.g.
  `Sphere` from `./components`). A sub-component used by only one parent isn't a top-level renderer
  entry — it lives in that parent's own `components/` folder, at whatever depth that lands.
- A file is named for the one thing it holds: `<name>.interface.ts`, `<name>.type.ts`,
  `<name>.constant.ts`, and a component or hook in a folder of its own kebab-case name.
- Every interface and every constant lives in `interfaces/` or `constants/`, never declared inline —
  an interface in a file of its own, constants in one file per subject matter, several together —
  created once a component actually has one, not preemptively. `interfaces/` holds a component's
  props interface and any type alias it depends on. The renderer's decoupled shapes for what comes
  over IPC live one level up, in `renderer/interfaces/`, since a page fetches them and more than one
  component reads them; geometry types live in `utils/math/interfaces/`, alongside the functions
  that use them. A data shape carries every field, always: a value's absence is `null`, never an
  optional key that comes and goes. `?:` belongs to what a component is **handed** — its props, and
  the item shapes a list draws from (`SidePanelItem`, `ContextMenuItem`, `IconTone`), where leaving
  a key out means «take the default» — and to what a spec hands a stand-in. Anything that carries
  data names every field: what crosses the bridge, what stands in the project file, what a hook
  holds. The one shape outside this is `deletedAt?` on a soft-deleted row, which is TypeORM's own
  and not ours to reshape.
- `renderer/utils/` mirrors the root `src/utils/` but scoped to the renderer — plain functions with
  no React dependency, grouped by concern, each with its own colocated `.spec.ts`, `interfaces/`,
  and `constants/` — `math/` (the sphere's geometry, rounding, and fitting a graph into the window),
  `colors/`, `dates/`, `errors/`, `numbers/` (money and token labels), `writes/`, `keyboard/`
  (`isTypedIn`), `records/` (`forgotten`, a record without a key), `focus/` (the focus ring and the
  walk's ring), `sight/` (`keepInSight`, the scroll that keeps a walked row whole) and `text/`
  (`ukrainianPlural`, `wordCount`, `selectedText` and the rest). Two of them read the page itself
  rather than their arguments — `isTypedIn` asks what a keystroke landed in, `selectedText` asks
  what is selected — so their specs stand in the browser project and not the node one. Nothing here
  knows a subject: the moment a helper answers a question about agents, models, links or the project
  file, it belongs in that subject's `features/<subject>/logic/`, and the lint rule below refuses
  the import that would keep it here.
- **`renderer/features/` holds one folder per subject, and everything about that subject in it.** A
  subject is a bounded context: `record` is what a run is once it is written — the api, the history,
  the reading back, the forgetting — and it names no other subject at all; `servers` is the MCP
  catalogue — what a server is, what it said when it was last asked, its page and the form that
  declares one — and it names only `project`, which is what it writes through. The same seven
  folders everywhere, each made only when there is something to put in it — an empty skeleton is a
  lie about what a subject has:
  - `logic/` — what the subject **decides** or works out about itself, as plain functions: what
    state an agent is in, what is broken about it, whether a model is on this machine, whether a
    name is taken. No React, no DOM, no IPC.
  - `words/` — what the subject **says** to the person: the functions that assemble a Ukrainian
    line. The literals themselves live in `constants/`, so `DELETED_AGENT_LABEL` is a constant and
    `deletedAgentNote(neighbours)` is a word.
  - `constants/` — its numbers, colours and strings, one file per subject matter as everywhere else.
  - `interfaces/` — the shapes that are the subject's own: a draft being edited, a chat message, the
    values of its form, the values a picker offers. What stays in the renderer's shared
    `interfaces/` is the vocabulary of the project file itself and what two subjects both read —
    `OpenProject`, `WorkingAgent`, `WaitingAgent`, `LinkLife`, `AgentTrouble` and the rest. Most of
    that vocabulary is not the renderer's alone: every shape that crosses the bridge is written once
    in `src/contracts` and re-exported by this barrel, so `Agent`, `Link`, `ProjectModel`,
    `ProjectConfig`, `ProviderState`, `TurnCall`, `WholeStep` are named through this barrel while
    living in one place both processes read. Those are nobody's
    subject and everybody's: `Agent` is named across the whole renderer, and a config carries all
    five kinds at once, so putting it inside any one subject would make that subject a hub for the
    other four.
  - `hooks/` — its React state: what is open, what is being edited, what was asked about.
  - `ui/` — its screens. Not to be confused with `components/` at the renderer's root, which knows
    no subject at all.
  - `api/` — its calls to the main process, and only where there are any: `project/` has one holding
    every call it makes, `record/` has one holding every call on a run's record, `providers/` one
    holding the four it makes about a provider, `conversation/` one holding the calls to the walk —
    open, configure, put a question, stop, say again, start afresh, go on in a run, let one go — and
    the pick of files for a question and the pack of them as it goes, `servers/` one holding the
    look at a server, the letting go, the putting out of its news and the asking and giving of
    consent to its run line, `speech/` one holding this machine's voice, its save, the hearing of a
    recording and the system's page of the microphone, and `models/`, `prompts/` and `commands/` never will, since they are
    written through the project's own write path. **No `invoke` stands outside an `api/` at all.**
    What does is the subscriptions, which are not calls and answer nothing — `useProjectFile` on the
    change channel and `useAgentChat` on the walks' channels and the one a turn arrives in piece by
    piece. `index.ts` is the only door: everything takes `features/agents`, nobody reaches into
    `features/agents/logic/agent-state`. A subject may take a neighbour through its door but never
    into its insides, and rings between subjects are forbidden; `project` is the leaf every subject
    stands on and takes none of them, so a subject that writes the file does so through its own
    writer hook over `useProjectWrite` (`useAgentWrites`, `useLinkWrites`, `useModelWrites`,
    `useCommandWrites`, `usePromptWrites`, `useServerWrites`, `useSpeechWrites`, `useScheduleWrites`),
    and the page composes those eight over
    the writer as `useProjectActions`, its own hook. `npm run graph:features` draws the subject
    graph and fails on a ring or on an edge out of `project`. An ESLint rule holds the door across
    the whole renderer, `pages/` included, over `logic/`, `words/`, `ui/`, `hooks/`, `api/` and
    `constants/`; `interfaces/` stands outside the rule. A spec stands outside it too, naming the
    word it asserts on where that word is declared. Specs stay beside what they test.
- **The layers are lint, not custom.** Ten bans in `eslint.config.js` hold the shape, one rule holds
  the wall and one holds the order; they hold what the house already did, so it cannot drift back.
  The renderer takes only types from `src/modules`, since a value would pull the backend into its
  bundle; a subject is reached through its `index.ts` and never into its insides, so a subject can
  change its insides alone; no subject reaches into a page, and nothing shared may know a subject or
  a page, since the page is what composes them; a subject never names `features/` from inside
  `features/`, because the road out of its own door and back in is that same door; what decides and
  what speaks (`logic/`, `words/`, `utils/`) imports no React and reaches into no `ui/` or `hooks/`
  — two bans, one naming a package and the other a folder — so it is called, never calling, and its
  spec needs no renderer to run; a drawing (`ui/`, `components/`) imports no `api/` — the call goes
  through a hook, so what is drawn renders in a spec with nothing behind it; the renderer never
  names `ipc/` at all; and `src/contracts` imports nothing from either process, since it holds what
  both must answer alike. The one on the wall: no bare number for a `fontSize` or a `letterSpacing`
  in a style literal, since type is the atom's to say or a constant's beside the file. The one on
  the order: nothing is read above the line that makes it — a helper reading a `const` declared
  under it throws the moment the component draws, and a throw in a layer takes the whole canvas with
  it. How a ban is declared so that it holds, and why nothing here counts lines or parameters, is
  `CLAUDE.md`'s. `npm run lint` runs `feature-graph.js` after ESLint, so a ring between subjects
  fails the same command.
- **What stays in `utils/` is what no subject owns** — geometry, colour, dates, text, numbers,
  errors. A subject's own `utils/` is never made: a function about the subject is `logic/`, a
  function about nobody is shared.
- **The walk is a machine, and it is the backend's.** `walk-machine.ts` in
  `src/modules/walks/logic/` is told the state it is in, what happened and what lines the project
  draws, and says what the walk became and what it asks of the world; it touches nothing, so every
  rule of frame 4f is proved without a model, a record or React (`BACKEND.md`, `walks`). The
  renderer is a thin client of it: `conversation/api/` calls the `walks:*` channels, and
  `useAgentChat` shows the snapshot the backend pushes back. A rule about when a turn goes, who it
  is handed to, which of the lines an agent's own choice cuts or what a repeat takes belongs in the
  machine, never in the hook; the screen only words what the record says (`stopReason` of a handoff,
  `silent` of a supplier, `source: "system"` of a call).
- **The projection's shape is worked out in `logic/`, not in the drawing.** `walkPlaces` puts every
  turn in a row or a lane, `walkLine` and `walkHead` lay a run of right angles between two spots,
  and `walkDrawing` holds them together: given a walk it hands back where every turn stands, how
  every line runs and which turn draws the shared head. `RunGraph` is then a field that can be moved
  with a finished drawing in it — the arithmetic is unit-tested without a browser, and the component
  is read for what it paints. Where a pass is drawn — the column, the lane, the rim and the air
  around it — lives in `projection/constants/` beside the rules, since it is the projection's own
  shape; what it is painted with — the colours, the ruler's type, the scale's ends — stays in the
  graph's own constants.

- **A memory written shorter is a thin line in the stream, drawn from the record.**
  `ChatMessage.compressed` is `{ at, to }` or `null`: live, `answeredCard` takes it from the facts
  the turn's answer carries; from the record, `runStream` finds the run's memory row of the step
  that is the agent's own (`compressedOf`; a tool's compression rides under the caller's step and
  draws no line). `SaidTurn` draws it as a `SaidRow` ahead of the card (`compressedMemoryWords` →
  «ПАМ'ЯТЬ СТИСНУТО · 90 % → 10 %»), and a turn that wore one is no mute turn. The numbers are the
  agent's threshold and target of that step, never recounted from the agent as it is now. The
  agent's two numbers are `MemoryNumbers` in the settings, two `Stepper`s in `SettingRow`s, bounds
  read from `contracts` (`AGENT_COMPRESS_AT_*`, `AGENT_COMPRESS_TO_*`) and shown only while the
  memory is not «Вимкнено».
- `agents/` is the catalogue and the shape to copy: `logic/` with the rules it works out about
  itself, `words/` with the lines it says, `constants/`, `interfaces/`, `hooks/` with the selection
  and the agent's own writes, `ui/` with the agent's panel, its rail icon and its two questions.
  What the chat, the record and the projection do with an agent lives in `conversation/`, `record/`
  and `projection/`. What is not the agent's is not there either: `freePlaceNear` is geometry over
  points and stands in `utils/math/`, `joinedLabels` joins any list and stands in `utils/text/`, and
  `SettingRow` — a label and a control on one line, knowing no subject — stands in `components/`
  with its own numbers beside it, and so does `StepHead`, the head of a step walked into: the way
  back, whose the step is, and what it is about. A grant's step and a server's page wear the one
  head, down to the chevron's path — two heads of the same shape would part the day one of them is
  touched.
- **A wide component takes named parts, not a row of flat fields.** Past about eight, a caller can
  no longer tell which field is which, and every reader has to group them again in their head and
  hope they group them the same way. So the props of the big ones are split into parts named after
  **what owns them** — the chat into `aimed`/`said`/`field`/`band`/`acts`, an agent's tab into
  `catalogue`/`writing`/`standing`/`presses`/`acts`, the canvas into its standing and its three
  kinds of act, the MCP catalogue into `catalogue`/`declaring`/`serverActs`/`declaringActs` — and
  the component takes the parts apart on its first lines. The caller then says which part it is
  handing over, and an effect inside stands on a hand it took out of a part rather than on the part
  itself, which is a fresh object every render. A spec keeps naming one thing at a time: it holds a
  flat shape of its own that extends the parts, and one helper puts each field back into the part
  that owns it.
- A component names one thing — a button, a field, a card — not a whole area of the screen. Split by
  concern, not by variation: one button covers every color and size through props (`variant`,
  `size`). The question is whether two pieces are ever used, laid out, or changed independently.
- The smallest of them are atoms of the design's own language, drawn once and used everywhere:
  `Mark` (frame 45a's quiet mono caption in upper case — the label over a block, a state, a count),
  `Dot`, `Hairline`, `RuleWithWord`, `Words`, `Chip`, `TextButton`, `IconButton`, `WorkingDots`, and
  `WalkedRow` around any row a keyboard can stand on. Each carries its own numbers in its own
  `constants/` and nothing else; where it stands in its row is the caller's, through `className`. A
  screen that writes `font-monospace` with a size and a letter-spacing by hand is writing an atom
  that already exists.
- The base division, which anything new follows: what renders is a component, what holds state is a
  hook, what merely assembles is a plain function. State groups by subject — the agent, the model,
  the prompt — never by where on the screen it shows, since one subject feeds the canvas, a panel
  and the keyboard at once; markup groups by place only where a place really renders. A file grown
  past one reading moves a subject out whole rather than shedding lines: the app stays many small
  parts, and a change or an optimisation stays local to the part it is about.
- Minimum of the app's own styles, maximum of Bootstrap's ready-made ones (see `DESIGN.md`) — before
  adding a `<name>.scss`, check whether the same result is a Bootstrap class away. Every
  `@keyframes` the app has lives in `app.scss`, since an inline style cannot carry one: `edge-flow`
  drives both a link's drift at rest and the flow of live work, which differ only in dash and speed;
  `draft-cancel` takes out a line let go over nothing; `work-dot` and `work-bar` are the marks of a
  turn that is out; `call-breath` is the light of a call that is out; `stop-blink` is the one blink
  «ЗУПИНИТИ» gives to a press that did not go through; `sphere-breathe` is the aimed sphere's light
  breathing — attention standing, not work running; `nested-open`, `write-note-in`,
  `write-note-drop-in` and `write-note-out` are how a panel and the line under the canvas arrive and
  go; `undo-line-in` is how a row of the undo stack arrives, since `write-note-in` carries a
  centring shift a stacked row must not have. `main.tsx` imports `app.scss` once as the whole app's
  global stylesheet.
- Fonts (IBM Plex Sans, IBM Plex Mono — see `DESIGN.md` for which goes where) are self-hosted
  through `@fontsource/*`, not a CDN: this is an offline-capable desktop app. `main.tsx` imports the
  specific weight files it needs; `app.scss` points Bootstrap's `$font-family-sans-serif` and
  `$font-family-monospace` at them, ahead of the Bootstrap import.
- `src/app/services/` holds the main process's own collaborators: `SafeStorageCipher`, which hands
  `secrets` the OS keychain; `WindowVoice`, `WindowProjectVoice` and `WindowWalkVoice`, through
  which a module says something to the window without knowing there is one, and `QuietVoice`, which
  says it to nobody, for the command line; and `SystemShell`, wrapping Electron's folder chooser,
  file-manager reveal and the system's page of who may use the microphone. They live here rather than in a module because each is Electron's to do, and
  `src/modules` stays free of Electron.
- `assets/icon.png` is the app icon — `main.ts` points both the window's `icon` option and the macOS
  Dock icon (`app.dock?.setIcon`) at it.

## Testing

- Renderer components are tested with Vitest and React Testing Library, not the backend's
  `node:test` — `npm run test:front` runs them, and `vitest.setup.ts` wires up jest-dom's matchers
  and stands in for what jsdom lacks, the OS's speech synthesis among it.
  A test renders into jsdom and checks what's in the DOM and how it responds to interaction, not
  what it looks like.
- **`renderer/testing/` holds what more than one spec would otherwise write out.** `standInBridge`
  puts a stand-in `window.electronApi` on the window — both halves of the real one are typed by the
  channel, so a spec answering them by hand cannot line up with either, and this is the one place
  that says so instead of every spec casting through `unknown`; a spec that hears a push names its
  shape as the type argument. Beside it stand the builders of the shapes a spec needs whole —
  `anAgent`, `aModel`, `aPrompt`, `aCommand`, `aLink`, `aConfig`, `aDraft`, `aStep`, `aVoiceAsk`
  and `aReadAloud` —
  each building its shape entire and taking a `Partial` of what the spec is actually about, so a
  field added to a shape lands here once rather than in every spec that names it. Nothing else
  belongs in the folder: a fixture only one spec builds stays in that spec.
- The suite is two projects: **`logic`** — every `*.spec.ts` in a Node environment, no browser and
  no setup file — and **`screens`** — every `*.spec.tsx`, plus the few `.ts` specs that drive a hook
  or read `document`, in jsdom. The split is by what a test does rather than where it lives, so
  moving a file between folders cannot quietly drop it from a run.
- Both projects run together and always whole; `CLAUDE.md` holds why, and whose command it is.
- **There is no visual testing, deliberately.** jsdom proves behaviour — what was clicked, what was
  written, what the person is asked — and cannot see geometry, colour or overlap; those are the
  person's to check on a screenshot against the frame (`CLAUDE.md`). A browser runner would be a
  second suite with its own reference images to keep; if one is ever added, it is a thin layer over
  a few frames, never a replacement for the tests that exist.
