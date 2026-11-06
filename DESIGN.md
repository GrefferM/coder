# Design

The agreed design of the whole interface in words — how it looks and behaves, and the rules a change
has to hold to. **The frames in the two canvases under `design/` are what it is drawn from**; this
file explains them and never replaces them. For where code lives and how it's named, see
`CLAUDE.md`, `BACKEND.md` and `FRONTEND.md`.

## Foundations

Styling: minimum of the app's own, maximum of Bootstrap's ready-made. A component earns a `.scss`
only once Bootstrap genuinely can't do what's needed, never preemptively. `app.scss`, imported once
in `main.tsx`, is the one global stylesheet.

Two typefaces: IBM Plex Sans for the interface, IBM Plex Mono for code, statuses, labels and numbers.
Sans is Bootstrap's `$font-family-base`, so it needs no class; `.font-monospace` or
`<code>`/`<kbd>`/`<pre>`/`<samp>` switch a piece to Mono.

Dark: `#0d0f16` content background and the eight shades of 45a that repeat across the app —
`#262b3a` an edge at rest, `#dde1ee` what is read, `#6b7490` what qualifies it, `#4a5164` a caption
or a chevron, `#1c202c` the rule between blocks, `#aab3cc` what the app says in a sentence,
`#12151f` the ground of a panel over the content, `#838ba6` the text of a control at rest — with
`#38a3ff` accent and `#4ade80` live. The window is painted the content colour before the renderer's
first frame, so there's no white flash, and uses an inset title bar. That title bar has no strip to
grab, so the textured window frame and every `Template` header double as drag handles; the content
box between them opts back out and stays clickable. The window opens at `1366×960` and resizes down
to whatever the OS allows — nothing inside holds a floor under it, and it never scrolls.

A textured frame (`#262b3a`, faint dotted pattern) wraps the whole content, which sits inset from it
in a rounded `12px` box.

Nothing on screen can be selected with the cursor except the fields text is typed into and the words
a person may want to carry off — a chat message, a call's printout, the run history, an error's text.
Dragging across a sphere's label or a menu line is a browser habit with nothing behind it in a
desktop app.

## The start screen

Before a project is open, the window shows one centred `620px` column: two actions — create a project
in a chosen folder, open an existing one — and, under a Mono label, the folders this machine has
opened before, newest first, each with its name, full path and when it was last opened. Choosing a
folder is a native dialog; a new project takes its name from the folder's own name, which stays
editable.

Creating is a form for a folder with no project yet, and it says nothing about git — the app never
reports on a repository's state. It shows what **will appear** in the folder: `project.yaml` and a
folder for each kind of thing — `agents/`, `models/`, `servers/`, `commands/`, `prompts/` — plainly
in the folder rather than under a dot. A folder that already holds a project never reaches the form:
it opens at once, so creating over an existing project is not offered at all.

## The canvas

Agents live on a canvas as wireframe spheres. **One agent, one sphere, always.** A sphere is a
static wireframe of SVG paths — a tilted (35°) grid of 7 meridians and 7 parallels, depth-culled,
each line drawn twice: blurred for the glow and crisp on top. Diameter `160px`. Below it, in Mono,
uppercase and letter-spaced: the agent's name with a live-status dot, and its model on a dimmer line.

An agent that is switched off keeps its name and model, its grid drops to a neutral (`#4a5268`) and
its glow to grey — a coloured glow says an agent is live (frame 29b), and a switched-off one is not.

The functions an agent was granted stand around its sphere as **mini-spheres**: an arc above the
sphere, `22px` each — a seventh of the agent, not a small agent — with no label, no glow and no
status dot. The shape says the source: a declared command is a rounded square with a prompt in it, an
MCP server is a tilted globe, and another agent granted as a tool is an upright globe with a filled
core — a small agent sphere standing in another's arc. Their colour is the **source's**, not the
agent's, so tools from different places read as different places at a glance; a command and a server take the
pale source family, a system command a lavender, and an agent-tool a warm orange of its own, apart
from that family on purpose, because it is a whole sphere of the project. The arc holds **at most
eleven marks** — four kinds (commands, servers, agents-as-tools, system commands), two marks apiece
and a `+N` of that kind where there is more; there are only two system commands, so they never fold —
and the exact list lives in the panel. An arc rather than a
ring, because a ring would collide with the label below and with edges, which mostly leave sideways.
As the canvas shrinks they shrink with it and never go (frame 37c). During a run the one being called
is named by a pill beside the sphere in that source's colour — orange for an agent-tool call; the arc
itself does not move.

**One mark answers «чому цей агент не такий, як інші»** (frames 41a–41b), whatever the reason: a
`16px` «?» on the sphere's ring, top right — the free corner, with the tools arc above — grey for a
fact, `#f0a5ac` for a break. No prompt is a fact: an agent on the bare model is a working agent. No
key, or a granted function that vanished, is a break: it will not run until fixed. Under the label,
as its last row, a dashed pill names the reason — «БЕЗ ПРОМПТА», «НЕМА КЛЮЧА» — and the dashing is
itself the language: a solid frame is a state that is, a dashed one is something missing. The pill
takes its full tone with the label below 60% and shrinks with it, and the «?» never goes at all,
because 50% — the scale the whole graph is seen at — is exactly where «де діри» is asked. The
prompts panel shows the counter's other side: a dashed card counting the agents without a prompt,
each named on a chip that leads to its sphere.

The graph is **directed and without rings**. No root, no hierarchy, no parent and child, but work
only ever goes down a line, so a ring would be a run with no end: `A→B` together with `B→A` is
refused, as is a ring closed through anybody in between and a line from a sphere onto itself. While
a line is being drawn, every sphere it cannot land on stands dimmed and takes no click; a project
file whose lines close a ring is refused whole on read. What is left is a straight run, a fan-out, a
fan-in and the diamond made of the two. Lines keep a gap from the sphere's edge and attach at
whatever angle they arrive at. Disconnected islands are a normal state.

**Position is data**, set by dragging. Nothing is laid out automatically, and there is no snapping,
no alignment guides and no grid: the sphere stands exactly where it was released, and stays there
while the write to disk it caused is on its way. While it is dragged, a ghost circle holds the place
it left, and its links follow it as dashes.

Links always animate: a grey slow drift at rest, a coloured flow while work passes through.

**The view is moved three ways and no more: dragged, zoomed, and fitted by a double click.** The
scale runs from 30% to 100% in steps of ten and stands only on those steps — **both ends are steps
themselves**, so there is no bound to be walked off in a special way. **The typical scale is also
the ceiling**: the wireframe is drawn at 160px, and past that it is the same drawing blown out. So a
double click fits the graph up to 100% and no closer, and «+» is dead at 100% — which reads as home
(«повернутись») rather than as a wall. A project opens at the scale and pan it was left at on this
machine, and at 100% only while no view is recorded yet (frame 11). The toolbar in the bottom-left
corner holds it — less, the scale itself, more — and the wheel does the same, holding whatever is
under the pointer still. **Nothing on the canvas disappears at any scale:** a sphere keeps its name,
its model line and its marks the whole way down to 30%, shrinking with the graph — a scale that takes
things away answers «що там?» with less than it was asked. Two things follow (table 11 and frame
41b). Below 60% **the model line and the pill take their full tone** — `#dde1ee`, the one the
pointer gives it — since at that size a half-lit second line is a grey smudge; the size is unchanged,
and the name stands in the agent's own colour at every scale. And the «?» mark **holds its 16px down
to 50% and then shrinks with the graph, never below 12px** — it alone has a floor, because it is a
mark and not text, and a ceiling too: 16px on a 40px sphere is a patch rather than a mark. The grid
has one threshold of its own: below 70% its step doubles, or the dots run together into noise. Like
the drag, the scale is a view: no agent moves.

**A line whose far end is not there is drawn, not hidden** (frame 50a). The app never makes one —
every deletion takes the lines on it in the same write — but a hand-edited file, a merge or a pull
can. The missing end becomes a dead sphere: a dashed circle with no wireframe inside, since the
wireframe is the thing itself and the thing is gone; the id from the line stands where a name would
be, and «НЕМА КОГО КЛИКАТИ» under it. No «?» on the ring — that mark points at a missing part, and
here everything is missing. A line carries no coordinates, so the dead sphere stands a clear field
down and to the right of the live end — the rule that places a new agent — far enough not to crowd
that sphere's name, model line and pills. A line with both ends dead is not drawn at all: nobody can
call it, and only a hand in the file clears it away. A line with one dead end is chosen and taken
away like any other; its pill names the dead end by the head of the id, in the quiet tone, since a
colour is an agent's own.

The working area is a dot grid over grain — a `1px` dot at 4.5% white every `32px`, and desaturated
noise at 4.5% in a `140px` tile. Neither has a colour of its own.

**Dragging the canvas moves the view, never the data.** It is dragged one way only — the left button
over the space between spheres, since a press that starts on a sphere moves that sphere. The cursor
is a hand, the grid travels with the spheres — movement is read off the dots — and the grain stays
put, or it would shimmer. What is selected and what the panel shows do not change. Nothing explains
the drag, and nothing recentres the view, because a graph has no centre; in its place a double click
on empty canvas puts the whole graph into the window at the largest step it fits at, with half a
sphere and half as much again of room around the outermost ones. A sphere, a line, the pills and the
zoom buttons are not empty canvas and fit nothing; an empty project has nothing to fit and is left
where it stands.

**A click on the space between spheres clears the selection**, and the agent's own panel goes with
it, since that panel is the selection's — **and only while it is**. Under the chat the panel is the
project's, so a click on empty canvas there lets nothing go: it would take the one mark that says
where a question would go and give nothing back. A catalogue stays open too, with whatever was typed
into its search and wherever it was scrolled to.

The open project's name and folder sit in the canvas's top-left corner as a button with a chevron —
the project switcher. It opens a list of **projects and nothing else**: no git branch, no settings.
The open one is ticked, the rest follow newest first, and picking a row opens that project where the
user already is. Under a rule: open a folder, start a project, and — third in that group — «Закрити
проєкт», which leads back to the start screen, asking about unsaved work first (frame 30c); quieter
below them, show the open project's folder in the file manager.

Picking another project ends this one's life on screen: the chat held in memory, the opened run, the
selection and where the canvas was looked from all go with it, exactly as when the project is
closed — a stream that flowed on into the next folder would be an account of work that never
happened there. Rereading the same project's file changes nothing on screen: it is the same project,
only newer.

**A folder with no project in it never refuses: it becomes one**, named after itself, since choosing
a folder is a statement of intent. Only a project already in the list can be missing, and that row
says `НЕ ЗНАЙДЕНО` in place of its path, greys out and stops being clickable.

Every project in either list — the switcher's and the start screen's — carries a cross that drops it
from the list. It removes nothing from disk.

The switcher sits in the canvas's corner rather than in the rail, because the rail is the sections
of one project and the project stands a level above them; and rather than in the title bar, where it
would be lost among system controls and vanish in full screen.

## Acting on the canvas

Right-click is how things are done. On empty canvas: add an agent, and paste one — the agent appears
at the click point, and the paste is greyed with its `⌘V` while there is nothing copied. On a sphere:
add a link, copy, delete. Adding a link puts the line on the pointer at once: over empty canvas it is
dashed, in the source's own colour, ending in a ring; over a sphere it goes solid, grows its arrow,
and the target takes an accent ring with `FROM → TO` standing over the middle of the run — the same
place a chosen link says the same thing. The sphere the line is drawn from is the only thing lit
while it is drawn. Starting a line clears whatever was selected and closes the panel with it — two
lit spheres would read as two sources. A click on a sphere makes the link; a click on nothing, or
Escape, drops the line and makes nothing — frame 7d: the line is drawn once more in a neutral,
crossed out on its loose end, saying «Скасовано», and goes out slowly enough to be read as an
answer. Nothing is asked. There are no ports — a line attaches wherever it arrives.

The menu itself: every row carries an icon, and the ones with a keystroke say it against the far
edge; a rule separates an act of a different kind, and the row that destroys.

**Selecting a sphere reads the graph around it.** Frame 9a: every other sphere stands back to 35%
rather than going out, the links leaving the selected agent take its colour and thickness, and the
ones arriving stay neutral — what it sends is its own, what it receives is somebody else's. A small
card in the canvas's corner counts both, each line drawn in the card the way it is drawn on the
canvas. A direction with nothing in it is not counted, and an agent tied to nothing raises no card.

Every keystroke the canvas prints is a keystroke it listens for: `⌘C` and `⌘V` on the selected
sphere, `⌫` on whichever of a sphere or a line is chosen — a sphere's `⌫` asks the same question its
menu asks — and `⌘Z` for the step back the undo line offers. None of them is taken from a field
being typed in, which keeps its own. Every deletion — an agent's, a link's, a prompt's, a model's, a
command's — leaves that one step back, so `⌘Z` means the same thing after any of them. **`⌘Z` never
touches a field**: it brings the deleted thing back and nothing else. A draft is not in the file, so
undo cannot reach it, and a saved change is never rolled back. What a field undid could not be
restored by anything, so the step back is not offered there at all.

**A draft is asked about before a deletion is** (frame 46a). Taking a sphere while another one is
being edited moves the focus off that draft, so the draft's question stands first and the deletion's
waits behind the answer — two questions never stand at once. Taking the very agent being edited
raises nothing for the draft: it goes with the agent.

**A deletion is asked about for everything declared — an agent, a prompt, a model, a command alike**
(frames 3f, 10a, 44d), and the box names the load: the agents on a model, the agents that wore a
prompt, a command's grants. An empty load changes the question's tone, not its existence — the box
falls to 44b's calm sign, «Видалити» an ordinary bordered action. The one exception is a link: a line
is a relation rather than a thing, and the undo line is enough for it. The box is not «ти
впевнений?» — with a step back in the line, being sure is not what it is for; it is «дивись, що піде
разом», which the line cannot say. Frame 10a: the menu only asks, and the question stands over the
working area — never in a panel — with a line naming everyone the deletion would leave standing
alone, while the canvas turns the links that would go with it to a dashed red and stops their drift.
The word «назавжди» is in none of it: thirty seconds stand behind the box.

**A link is chosen by clicking it, and acted on where it lies.** Frame 9b: the line leaves the grey
of the others for its source agent's colour, thickens, drifts brighter, and takes a small square
handle in the middle of its run; every sphere stands back, so what was chosen reads as the line.
Above the handle stands a pill saying which way it runs — each end in its own agent's colour — and
offering the one thing that can be done to a link: `⌫ Видалити`. The key it prints does the same. A
click anywhere else, or Escape, lets the link go. A link deleted takes no agent with it, and no panel
opens for a link — a link is a direction and nothing more.

A copy carries the agent's name with the next number after it, its colour, model, prompt and tools,
and not its links. It stands on the point clicked, selected at once, wearing a ring and a line saying
whose copy it is until the next click, wherever it lands. ⌘C and ⌘V do the same as the two menu
lines that print them: ⌘C takes whichever sphere is selected, and ⌘V — having no clicked point —
stands the copy on the first free place down and to the right of the
agent it was taken from.

**A ring around a sphere hugs that sphere** — the copy just pasted, the target a line is aimed at. It
clears the wireframe by just enough to be a circle of its own rather than a second outline of the
sphere's edge, and stops short of the name below, since a ring that reaches the words reads as
touching them. It can be centred because a sphere's box is the wireframe and nothing else: the point
an agent is saved with is the circle's centre, and its name and model hang below without moving it.

**The halo of the agent a question would go to breathes** (frame 9c) — 3.8s a cycle, soft-edged, and
nothing else about the sphere moves: the grid stands still, the neighbours stand lit, the lines stay
grey. It is the only moving thing in this language that neither travels a contour nor counts out a
number, which is why it does not read as work. Faster or sharper would be alarm rather than
attention.

**Fixing and aiming are told apart by their physics, not by their loudness.** Fixing is sharp and
still — a ring, a grid at full brightness, outgoing lines in the agent's colour, the neighbours held
back. Aiming is soft and alive. Together on one sphere, a ring inside a breathing halo says «the
panel is here and I am writing here too». The border is between **a moment and a duration**: a panel
is a minute, an aim is hours, and 35% cannot last hours.

The breath belongs to the chat, so it is there only while the chat is: put the chat away, open a
catalogue, start a new agent, and the canvas stands as if nobody had been chosen — in each of those
the panel is about something else.

**What the panel adds is about the panel.** While the agent's own settings stand open, the rest
stands back and the agent's outgoing lines take its colour. Neither happens for the aim: a coloured
line from a source is how **work flowing** reads (8b), and an aim that lit its lines for hours would
say the canvas is busy when nothing is running. Dimming elsewhere is always a moment that ends by
itself — «not here» while a line is being drawn (7b), «did not arrive» in a step of the projection
(24d) — never «less important».

**A sphere answers the pointer as everything else does** (frame 42b): the same ring, in the agent's
own colour held back to 40%, and the model line under the name brightening to `#dde1ee`. The
wireframe and its glow do not move, so the pointer never reads as selection, as the light a line's
source carries, or as the ring a running step wears.

There is no empty sphere: an agent appears already filled in. Until it is saved there is no sphere at
all, and nothing marks the point — the panel standing open on the create form says an agent is on its
way. A middle claimed from the rail steps aside from any sphere already standing in the middle. A
second right-click moves the claim; a click on the space between spheres or leaving the agents
section abandons it — the claim never outlives the form.

Deleting an agent takes that agent and its links, and nothing else — neighbours stay where they are
and become separate islands. The confirmation shows no counts. Afterwards a dashed circle holds the
place the sphere left, and a line along the canvas's bottom says what went —
`АГЕНТА ВИДАЛЕНО · 2 ЗВ'ЯЗКИ ПРИБРАНО` — with `СКАСУВАТИ ⌘Z` beside it, and behind a hairline the
seconds that offer has left, `30 С` counting down. **The line's second half always names what went
along**, because that is exactly what comes back: a model with its agents and their links, a prompt
with the agents left without one, a command with the grants that vanished. A link has no second
half — it goes alone. **It is an offer for the moment after, not a state**: a click anywhere goes to
what is under it, because a note has nothing to take a click for. The same is true of the mark on a
pasted copy.

The line stands **thirty seconds** (frame 10b) and the dashed circle goes out after **1.5s**: a trace
says «щойно тут щось було», which is the business of a second, while text is allowed to wait. Nothing
anybody clicks shortens the line — not a click on the canvas, not a write, not turning to another
agent — and **a second deletion does not shorten it either**: the lines stack, the newest at the
bottom, an older one dimming as it rises, each keeping its own thirty seconds; `⌘Z` takes the newest,
an older one is taken by its own «СКАСУВАТИ», and past three the oldest fold into «ще N».
Overwriting one line with the next would make the first deletion final on the person's behalf. The
countdown is on the row rather than in a bar because with several rows standing the question is
«скільки ще в цього», and a number answers it.

The deletion itself is done the moment it is asked for: the folder loses the thing and this machine's
history takes it in, both at once, so the way back is a second write — and taking it lets the history
row go, so one deletion can never be returned twice.

Deleting a model takes every agent on it. While the question stands, those agents go dark on the
canvas.

**A write answers with something that appears** (frame 47a). A disappearance is not an answer: «●
НЕ ЗБЕРЕЖЕНО», the dots beside the changed fields and the `БУЛО · …` lines going out all leave the
person having pressed and seen nothing arrive. So a written config puts one line along the canvas's
top, centred and over the project badge, with a green check and the name of what was written —
«Агента збережено», not «Збережено», because five sections stand behind one button each. It stands
about five seconds and takes itself off; it catches no click and stops nothing being typed. Deleting
and saving are one language — the same line, the same rhythm — and differ only in what they offer: a
deletion offers the way back, a save nothing. **A failed write is the same line and the opposite of
gone**: the reason in pink — without it «ЩЕ РАЗ» would be a guess — the act to run that very write
again, and no time on it at all, because a failure waits to be answered. The panel that asked keeps
its draft. That line is the only place a failed write is said: one failure said twice reads as two.
**A refusal is the third face of the same line**: a red cross, the reason, and nothing to try again,
since the same act would be refused the same way. It leaves by itself after twelve seconds, longer
than a done note, because a sentence takes longer to read than «збережено». The line stands over the
project badge on its layer, so its mark and first words are never under the badge; while it stands,
the badge's list opens under it.

**Where a deletion is asked about at all, it is the same box in the same place**: the middle of the
working area, over what the answer costs, with the mark, the question, whatever it has to name, and
its two answers. Only what stands between the question and the answers differs.

An empty canvas shows a mouse with its right button lit, `ПРАВИЙ КЛІК ПО ПОЛОТНУ` under it, and two
dimmer lines saying what that click gets and that the sphere lands where it was clicked. It goes as
soon as there is an agent, or as soon as one is being created.

## Panels

The rail along the window edge holds the app's sections: Агенти (the canvas), Моделі, MCP, Команди,
Промпти, and — below a rule, marked as belonging to this machine — Чат with its history inside it
and Провайдери. «Інструменти» is not a section's name — with the tools spread across two sections it
names nothing: MCP takes a plug and the commands a terminal with an arrow.

Each rail button names itself under the pointer, in the app's own box rather than the browser's.
Opening Агенти with nothing selected offers the one thing that section can do with nothing to show:
an agent, claimed in the middle of the canvas.

Left-clicking a sphere opens the `380px` panel on that agent's **settings** — the create form if the
sphere was just added — and aims the chat at it (frames 5a, 23c). The chat is one for the whole
project and a section of the rail, not a tab in this panel: the rail means sections of the app, not
modes of one agent.

**What a person typed never leaves its box.** A name, a prompt, a command's line — none of it has to
have a space in it, so nothing may be left to ordinary wrapping: on a line of its own it is cut with
«…» and the whole of it stands on the pointer; inside a sentence of the app's, in a question or in a
clamped preview, it breaks wherever the edge falls.

A field is compact: `8px 10px` padding, a `13px` value, an `11px` label, `5px` between the two. Every
field turns the browser's focus ring off and shows focus on its own box, in the accent blue. A price
steps by `0.1`. **A field of numbers stands at zero at the lowest**: the minus never goes in, by hand
or by the arrows, because neither a price nor a ceiling means anything below zero — and refusing the
key is not correcting a person after the fact, which the app never does (16b): the character simply
never lands.

Every action button is the same button — `10px 0` padding, a `9px` radius, a 13px/600 label, and a
0.15s crossfade — differing only in the colour sets it swaps between: at rest, lit, and pressed.
Save is the one filled variant; cancel and delete are bordered and unfilled, delete staying quiet
until it is reached for; and danger — the yes of a destructive confirmation — wears delete's lit set
from the start, since the question is already about what it destroys. Danger keeps a scale of its
own (frame 42a): it stands in the bright set already, so instead of brightening it gains weight —
the background `#2a1c20` → `#38222a`, the border `#4a2530` → the full `#f0a5ac`, the label `#f0a5ac`
→ `#ffc4c9`, and pressed `#241519` with a `#a9808a` border.

**Everything pressable answers the pointer, by one rule** (frame 42a): what is under the cursor — or
under the keyboard's focus, which is the same state — comes one step closer to the foreground: the
box takes the next level of background (`#171b26` → `#1b1f2c`, its border `#262b3a` → `#2c3550`),
the text and the icon the next level of text (`#838ba6` → `#dde1ee`, the accent `#38a3ff` →
`#7cc4ff`), and pressed it steps back: the background darkens to `#141824` and the thing moves `1px`
down. The filled variant lightens to `#4aabff` under the pointer, inside a `#57b4ff` border, its
label going to white — a fill that darkens under the reach reads as going out — and presses to
`#2f8ddb` with its resting `#e6ecf7` label back. Everything crosses in `0.15s`; a disabled thing
keeps `0.45` of itself and answers nothing.

**Focus is that same state plus one thing: a ring** (frame 42a), written in one place for the whole
app — a ring that differs by a pixel from one row to the next reads as two rings. Not a border — a
`box-shadow: 0 0 0 2px`, lying outside the box, so it moves neither size nor text and repeats the
box's own radius, including `50%` on a round one. The browser's native ring is off everywhere. The
ring is accent `#38a3ff44`, except on the two destroying variants, which ring in their own
`#f0a5ac3d` — an accent ring would make «видалити» under focus read as the main action. The ring
belongs to the keyboard alone: it appears when a key moves the focus and goes out when the mouse
**takes** something, not when it merely moves — a hand brushing the mouse must not lose the place a
key chose. A cursor arriving on a button that already holds focus adds nothing. A bordered action's
lit set is `#1b1f2c` behind an accent border with `#dde1ee` on it, and a bare act takes its `#1b1f2c`
backdrop so the ring has something to lie on. The ring crosses in the same `0.15s`.

**The canvas stays out of the keyboard's walk altogether**: reaching a sphere by key would mean
stepping through every sphere on the graph. The panel walks in an order of its own, top to bottom by
the eye rather than by the markup.

**A list that opens is walked** (frames 23d and 42a): the arrows move along its rows and the row
under them wears the ring — drawn inside the row and over its own ground, since a list's edge cuts
anything outside it and a chosen row's lighter ground would swallow it — the list scrolls so that row
stays wholly seen, Enter takes it where one thing is chosen and grants or takes back where several
may be, and Escape closes the list and nothing beneath it. The choice that stands above a list and is
none of its rows — «Без промпта» — is the walk's first row. In a list the pointer takes the walk with
it: the ring stands where the cursor is, so the keys and the mouse never disagree about which row
Enter would take — the one place the ring follows the mouse. The two right-click menus, the project
switcher and the names offered under a `{` walk by the same rule; a row that can do nothing wears the
ring and answers no Enter.

Two things earn a backdrop they do not otherwise have, because their click boundary is invisible
without one: **a bare act written in a row** — `Видалити`, `Редагувати`, `⌫ Видалити`,
`СКАСУВАТИ ⌘Z` — and **an icon with no label**. A row and an act inside it never argue: the row takes
the background, the act takes its own backdrop. A field answers before it is focused too, by its
border alone.

**Commands are their own section, and MCP is another** (frames 36a, 36b): a server and a command
have nothing in common but the word. A server holds a live process and a connection, its functions
arrive from it and can vanish when it updates, and its state — running, fallen, updated — is a list
that has to be seen whole. A command is a run line and a description for the model, declared by hand
(frame 16a), and the section says so under its list.

**A command is one function the user describes** (frame 16a): the name the model calls, the line
telling it what the command is for, and the line that actually runs — where braces stand for the
parameters. Parameters are added **a row at a time**, each with a name, a type — `text`, `number`,
`bool`, `enum` — a line telling the model what to put there, and whether the command runs without it.
**Nobody writes a schema**: it is assembled from those rows, and the block at the bottom of the form
is the only place it is seen — read-only, in the model's own terms, with `?` marking what the command
can do without. A parameter is taken back out by the cross on its row: a row of a form is undone, not
deleted, so it raises no question. In the run line a `{name}` a declared parameter answers to is drawn
as a slot — accent on its own tinted pill — because there what is typed stops being a string and
becomes a hole for something else; braces naming anything else are the text they are. A command's
row in the list says only facts that exist: what it takes, who it was given to, both through a dot —
and, where there is neither, nothing at all, since a count of nothing reads as a riddle.

**A scroll bar is a thing that answers a hand, not a part of a panel.** It keeps its width always —
so the text does not jump sideways when it appears — and paints its thumb only while something is
being scrolled, fading a moment after the movement stops. A bar standing there permanently is a
border nobody drew.

**Escape and the pointer answer by the same rank** (frames 46a and 43). Six floors, one press or one
click each: a question box or the editor, which print «ESC» on themselves; an open list, which closes
and leaves the choice as it stands; a step the panel opens instead of its own content — a grant on
its own — which steps back and keeps what was changed in it, since leaving a step is not undoing it;
the debug projection, which stands over the canvas and the panel alike and goes back to the stream;
the side panel, which collapses and asks about a draft first; and the empty canvas, which does
nothing. A list, a menu, a switcher — anything that goes away on the next click — takes that click
for itself and the canvas under it does nothing: the panel stays, the agent stays selected. The
second click means what a click on the canvas means; otherwise clicking past a dropdown would also
throw away the panel it was opened in.

**One shell opens every list in the app** (frames 3b, 17a): the closed field with its chevron, and
over it the list with a search counting matches against the total. A model, a prompt, the functions
an agent may call and the provider a model belongs to all open the same way, so the gesture is
learned once. The shell holds only being open and being searched, and closes on a click anywhere
else; what is chosen is the caller's business.

**A list opened over a field insets its rows** (frames 3b and 17a). The inset gives the backdrop of a
chosen row a shape: without it the backdrop runs from edge to edge and reads as a stripe across the
list. It costs the lists without ticks nothing, so all of them take it.

**A list called up by a character stands under its field, not under the character** (frame 16a). An
input cannot report where its caret sits — that takes a measured duplicate of the text, which breaks
on every change — and for a list of three rows the offset would buy nothing: the person has just
typed the brace and is looking at the caret.

**The panel acts in boxes on the full width; everything inside it acts in Mono rows against the
right edge** (frame 43). Three marks work together: the typeface — Sans for the panel, Mono for what
is nested; the width — a nested act never stands full width, only as wide as its word; and the
weight — a nested act is never the filled accent, since the one main act of a screen is the one in
the footer. It is not frame 42a's bare act either: a nested thing needs a «готово» that closes it, so
the affirming act carries a backdrop and the one that backs out carries nothing. Without this rule
two pairs of buttons stand one under another saying almost the same words, and the inner one reads
as a second «Зберегти».

**A card opened in a form shows its cost while it is being paid.** Every keystroke in the parameter
card goes up as a draft, and the schema block follows it — a rename, a type changed, a description
rewritten are seen as they are typed. Only «ГОТОВО» writes the row itself; the draft is for showing,
and it is dropped with the card. The card is taken off by the cross on its row and by nothing else —
a second way inside the card would be a second «Видалити» for one thing.

**A declared parameter and the line that runs are read against each other one way** (frame 16a). A
parameter the line never mentions wears a dashed edge and says «НЕ В РЯДКУ КОМАНДИ» in place of
whether it is required — the model will be offered something that goes nowhere. The other way round
says nothing: a `{name}` no parameter answers to is not a slot, so it is drawn as the text it is,
with no mark under the field — the braces go to the shell exactly as typed. Neither is refused: a
slot may be typed before its parameter is declared, and the other way round. Renaming a parameter
does not rewrite the line — the text a person typed is not edited for them — so the old slot becomes
one that stands for nothing, visibly, before the first run. An opening brace calls up the declared
names, marking the ones the line already carries; a name is picked there, not invented. **A name
already in the line wears the lit ground and its type chip steps up with it** (16a); the row can
still be taken — it puts the slot in a second time, which a person is allowed to write.

**Running a command is one action and no more: find braces, read the name between them against the
names this command declared, and where it matches, put the value in as it stands.** Braces naming
anything else — `find … -exec rm {} \;`, `awk '{print $5}'`, `{1..5}`, `jq '{"a": 1}'` — are text
like the rest of the line; a declared name nobody gave a value to is taken out; and what stands
around a slot is never looked at. The line is read once from end to end, so a `{name}` inside a value
that has just been put in is text like any other.

**The value goes in as it stands, and what it then means is the line's own business.** Nothing of
the app's stands between a value and the shell: a value carrying `-maxdepth 2` is a flag, one
carrying `*.md` is a glob the shell expands, one carrying `; …` is a second command. Where the person
wants a value to arrive as one word they write the quotes themselves — `-name '{mask}'` — so the same
line can hold `{depth}` bare and `{mask}` quoted. The line is the person's, whole: they may write
`sh -c {code}`, and handing a command to an agent is handing over what that command can do. What the
app owes them is honesty about where the border runs, not a guard rail — the mechanical check on the
way in (below) is the last thing that happens before their line runs. A name that could not stand in
braces is refused where it is typed: the field goes red, the card's «ГОТОВО» will not close, and
nothing is taken out of what was written — mending it would be the app deciding what they meant.

**«Зупинити» ends the turn and stops what the turn is running** (frame 24f). It is a button of the
conversation rather than a process manager: the person presses it to take their turn back. The
model's stream is dropped, a command already out is killed, a server's call is cancelled, no further
call of the turn starts, and the turn ends stopped rather than waiting the tool out — a press in the
middle of `npm install` leaves whatever state that command had reached, and the app does not undo it.

**One mechanical check stands between the model and the line** (frame 16a). The schema is what was
asked of the model; the check is what actually came. A `number` that is not a number, a `bool` that
is neither, an `enum` value outside the person's own list, a required parameter that never came —
the command does not run, and the model is handed one line naming every argument that failed. It
hears that inside the same turn and can call again, at the cost of one of its calls. Nothing is
mended or guessed: a wrong argument is the model's to fix. A `text` is never complained about,
because a text is any text — which is also why the border of what a value may do runs along the
person's own line. Fixed values are not checked either: they are the person's own words.

The person sees the same refusal, and it does not go when the turn does (frames 4b, 24f). A call is a
row that stays in the stream of the conversation where it happened, folded into one line — the
command's name, how it ended (the exit code; a server's or an agent's call shows the time it took to
answer instead) — and opens to the whole of it: the arguments the model sent, the ones the person
pinned, the line that ran, what it printed, the exit code. A refused call stands the same way, with
the words of the check and no output and no code, because there was no process. **One block, two
homes**: the same call is that folded row in the chat and the opened block in a step of the debug
projection (24c) — drawn once, put in two surroundings. Both read from the record of the run (23c),
because two stores would say different things about one turn — and both therefore live exactly
thirty days (26a), as long as the step they belong to. A long output folds the way a handover does
(24b): the first two hundred lines, the rest under «показати повністю», long lines wrapped rather
than cut, and «скопіювати все» taking the whole of it rather than what is on screen.

**Removing removes** — no tails. A parameter taken off a command takes every argument fixed on it
with it, in every agent, quietly and in the same write: the panel's own «не збережено» is the one
question. A command deleted takes every grant on it the same way — its box has already asked. This is
what makes deleting and re-declaring a parameter safe: nothing keeps pointing at what is gone.

**Every catalogue is the same four parts in the same order** (frame 40a): a header carrying the
section's name and a count, a search field, the list on the whole height — the list is the section —
and a footer holding the one creating action behind a rule. Creating opens as its own step, the way
«Новий промпт» does; it never stands as fields under the list, because fields under a list read as
the properties of the last row. An empty catalogue lifts that one action into the middle and makes it
accent, with one line saying what is missing, and the footer goes so the same action never stands
twice. Провайдери are the exception: the list is fixed, and nothing is ever created.

**A model's row opens the way a prompt's card does.** A click opens it, and the open row carries the
two acts in the same words and places: «Видалити», which raises frame 3e's question, and
«Редагувати», which gives the fields creating a model gives — name, provider, both prices and both
ceilings — standing where the list stood. The closed row says the two things that decide a choice:
the prices, and how many agents already run on it.

**The open row says the model in full** (frame 3b): the provider on its own line, the prices in
words — `$3.00 вхід · $15.00 вихід / 1M` — and every agent on the model as a chip carrying its
colour. The closed row's one packed line steps aside while the row is open, so nothing is said twice,
and the chevron turns over.

## Editing and saving

Editing anything shows up everywhere the app draws that agent straight away: renaming moves the
sphere's label as the keystrokes land, switching it off darkens the sphere on the spot. None of it is
written until save is pressed — the colour included: while a save button stands in the panel,
anything that slips past it reads as a fault. Nothing marks the canvas as a preview, because nothing
can walk away from it unsaved: the draft lives exactly as long as the editing does.

**A draft says itself three times, all of them in the panel** (frame 44a): a dot beside the
section's name in the header, next to the word «НЕ ЗБЕРЕЖЕНО» — the same mark and words stand in the
prompt editor's own header (frame 46a); a `#2c3550` border on each field that has moved away from
what is saved, with a dot on its label and a quiet «БУЛО · …» line under it; and the footer's first
slot turning into «Скасувати». They answer «що саме я змінив», not «чи це запис».

**Every way out of a panel with unsaved work asks** (frame 44b): another sphere, a click on the
space between them, `ESC`, collapsing the panel, another rail section, closing the project or the
app — one class of exit. The rule belongs to the app, not to the agent: a half-written model in the
catalogue's form is asked about in the same box, in the same words. A draft never survives a way
out, which is why the question is needed: otherwise three half-written spheres could stand in a
graph showing nothing of it. **«Скасувати» asks too**, with no exception: a press is easy to make,
and what it drops cannot be brought back.

That one box speaks in two voices, one construction: a way out asks «Зберегти зміни в EDITOR?» over
«Назву й колір змінено й не збережено. Якщо піти зараз — зміни зникнуть.», and «Скасувати» asks
«Точно не зберігати?» over «Назву й колір змінено й не збережено. Скидаємо їх до записаного —
повернути це буде нічим.» Both open on the same sentence and part on the second — what leaving costs,
or what the press is undoing. The opening sentence is impersonal, the fields standing as its
objects, because they are of every gender and number and an agreeing verb would have to pick one. A
prompt's text is counted in that diff rather than quoted — «ТЕКСТ · 34 СИМВ. → 46 СИМВ.» — since the
line is built for a name or a colour, not a page of prose (frame 46a). The box shows what changed,
field by field, `було → стало`. The three answers are the same either way. The box is calmer than a
deletion's: the sign accent rather than pink, the border neutral, and no destructive answer — «Не
зберігати» is an ordinary bordered action beside a filled «Зберегти», with «ЛИШИТИСЬ ТУТ · ESC» as a
third quiet line under them, which is what Escape means as well.

**The prompt is one line: its name** (frame 21a). A prompt is shared, so the count beside the name
says how many agents stand on it — «2 АГЕНТИ», in full words, this one included — the same number
its row in the list and its card in the library say. **The text belongs to the editor**, which shows
it whole, and **the library is the one place a prompt is opened from** — the field carries no way
in. An agent written without one says «Без промпта», in the quiet `#5c6478` of a state rather than a
value: it is an answer, not an empty slot — frame 41a's mark is raised from exactly it — so it stands
first in the list, cut from the prompts by a `#1c202c` rule, and the chosen answer wears the accent
checkmark against its row's far edge.

**An agent carries an optional short description** («КОРОТКИЙ ОПИС», under the name), blank by
default. It is written for one reader: a model that has been granted this agent as a tool. The
granted agent's name is the tool's name and this line is its description — the one place the calling
model is told what a named helper is for. It is said to no model of the agent's own; what an agent is
for its own turn is said in its prompt.

**An agent can be granted another agent as a tool** («АГЕНТИ», a third field of the tab below
commands and servers). It is a third kind of grant beside a declared command and a server's function,
and it reads the same everywhere the other two do — one `source` the whole app branches on, one
handle (`agent:<id>`), a lost group when the sphere it named is let go, its own line in the change
summary. A command is written and chosen by hand; a server arrives whole and is connected whole; an
agent is a whole sphere of the project, chosen whole, with nothing of the grantor's to pin on it — it
is called with a request in words and nothing more. An agent is never offered itself: a tool for
oneself is a ring.

**A call to an agent-tool runs a whole turn of that agent** — its own model, prompt and tools — on
the one request the calling model wrote, and hands back its answer as the call's output. To the
caller it is one call row in the chat and one in the history, drawn like a server's (asked, answered
in its own time, no exit code), never the caller's own words. The sub-turn is silent: its own rounds
and inner calls are not voiced into the caller's stream, only its final answer. A sub-agent with its
own tools may call further agents the same way, so the ring the lines can never close must not close
here either: an agent already running above a call cannot be called again, and says so instead of
running. One that cannot run — a lost model or prompt, a number it never filled — is still handed to
the model and says why the moment it is called, rather than being silently absent. Called with the
shared memory, it reads its caller's question from the record at that moment, as a walk agent does,
and the memory opens its request in one input; with its own memory or none it gets the request
alone. What it would carry is weighed against its own model's ceiling before it goes. Whatever stops
it — the record unread or gone, words over the ceiling (what would have gone, part by part, and
nothing cut), the provider's own fault — is the call's «ні» with those very words as its output,
never a phrase that hides them; the caller's model reads them and goes on, and the walk does not stop
for it. This is not the walk: a line pushes work down the graph, a tool-call asks for an answer
back — no line fires because an agent was called as a tool, and the caller's own downstream is
untouched.

**Who an agent's work can come from is named, and nothing is asked about it** (frame 29d): every
line coming in stands under «ПОСТАЧАЛЬНИКИ · 2», a switched-off supplier keeps its place and says
«ВИМКНЕНИЙ · НЕ РАХУЄТЬСЯ», and the counter keeps both numbers — «1 / 2» — so that not counting
never reads as a line somebody deleted. There is nothing to choose, unless the agent was granted the
system commands (below): a line pushes, so whoever is asked answers and hands the work down every
line it points at, and an agent several lines come into waits for every live supplier this run
reaches and works once. That waiting is the agent's own to turn off — «ОЧІКУВАТИ ВСІХ» under its
settings, above «Увімкнено», on by default and shown only where two lines or more come in; off, it
runs on each input on its own the moment that input arrives (two suppliers, two turns) and shows no
waiting pill, since it holds none.

**An agent may choose where its work goes by system commands.** «СИСТЕМНІ · N» is a section of the
agent's settings beside «КОМАНДИ», «MCP» and «АГЕНТИ», granted from a catalogue picker like any other
tool (its own «було», a lavender bolt glyph, a lavender mini-sphere on the arc). The catalogue holds
two commands for every agent: `pass_to`, naming one or more of the agents its lines lead to (by name
and purpose, and no more of the graph) and carrying the text they get, which the agent writes itself,
and `finish_here`. `pass_to` does not end the turn: the agent may pass different texts to different
agents by calling it again, and writes its answer after; `finish_here` ends the turn. Having called
`pass_to` at all is the switch: then only what was passed goes down the lines and the agent's answer
stays on its card; an agent that never called it hands its answer down every line, as one without
commands does. Granted with no line going out of the agent, a row stands dimmed under «Немає ліній,
що виходять, — команда не діє». The drawn lines stay as they are: the call only decides which of
them are taken. A line left alone reads «НЕ ПЕРЕДАЄ ⇢ КОДЕР · НЕ ОБРАНО» or «… · ГІЛКУ ЗАВЕРШЕНО»,
in the quiet tone of the others and, unlike a switched-off neighbour, with **no «СПИТАТИ ЩЕ РАЗ»**
under it: nothing broke, and the agent decided. What comes down a line not taken is nothing, and that
goes on down the graph — a converging point waits only for those who can still hand something over,
its pill adds «НЕ ПЕРЕДАВ 1» to «ВІДПОВІВ 1 З 3» where some did not, and an agent that nothing
reaches does not run. The point that does run is told, in the last line of its input, how many of its
suppliers gave nothing. The call itself is one row in the chat, «ПЕРЕДАНО → КОДЕР» or «ГІЛКУ
ЗАВЕРШЕНО», with no code, no time and no answer to copy — it is the agent's decision, not something
that ran; opened, it shows whom and the text handed on. A turn that only called commands and wrote
nothing draws no card of words: the rows and the handoff rows under them are all it says, and the
step is a finished one, not a silent one. The choice of a turn that fell is not heard.

**The maximum of calls stands in every agent** (frames 21a, 29a): a whole number with a step on
either side, bounding the agent's own moves inside one turn. Each round of the model is one call and
each tool it calls is one — as frame 29a's block counts: a bare agent spends one, and an agent that
called a command twice spends five (three rounds of the model and two calls). Its floor is nought,
and nought is no ceiling at all: the turn calls on until the model asks for nothing more. The stepper
stands on «∞» there, with «0 — БЕЗ ЛІМІТУ» under the row; every whole number above it is a ceiling
that many calls high.

**Temperature stands in every agent too** (frame 21a), under the maximum of calls and on the same
stepper: 0 to 1 in steps of a tenth, standing at 0.3 on a new agent, with a line under it —
«0 — СТРОГО ФОРМУЛЮЄ · 1 — ВІЛЬНІШЕ ФОРМУЛЮЄ · КРОК 0.1». It belongs to the agent rather than the
model because one model is wanted differently by different agents: a collector must be exact where a
titler may be loose. The bounds are 0–1 for every provider, the widest all of them take — Anthropic
allows no more — since bending them per provider would lay a second judgement over the person's own
number. **A temperature of 0 is not sent at all**: the field is left out of the request, because
some models refuse the setting outright. The provider then answers at its own default, so on such a
model 0 is not strict.

The enabled toggle is a third state, distinct from editing and deleting: switched off, the agent
keeps every setting and stays on screen, greyed, and the sphere goes with it.

**A selected agent's settings** (frames 5a, 21a and 44a) stand in the same 380px column every panel
uses: a header carrying the agent's avatar — a `32px` rounded square lit by a radial highlight in its
own colour — its name and one line saying how it stands, then the fields in one rhythm, then the two
acts under a rule along the bottom: «Зберегти», which writes the draft, and one slot that changes
with the state — «Видалити» while nothing is changed, «Скасувати» once something is, which puts the
fields back to what is saved. Sharing the slot is safe because deleting asks anyway: a mis-click
costs a box, not an agent. Every field is the same box the rest of the app writes in: `#171b26` at
radius `10`, its label `11px` Mono above it. The colour is five swatches and the chosen one written
out — the chosen swatch ringed in its own colour off a darker gap, so the mark reads at `20px`
(frame 44a). Frame 21a compresses the same column when the tools stand in it too, and moves the
colour into the name field.

## Two scopes

A project is a folder, and its config file travels with the repository. **Project scope** — agents,
links, positions, prompts, models with prices, declared commands, MCP registrations — is committed and
reaches whoever opens the folder. **Machine scope** — provider keys and addresses, secret values, run
history — stays here.

Every panel must make its own scope obvious: if the boundary isn't visible, someone puts a token
where it will be committed. **The rail draws that boundary as a rule** (frame 38a): above it stand
the sections the project file carries — the ones named above, in that order — and below it the ones
that stay here. **The rail says it with the rule alone**: 44px of width can hold «ЦЯ МАШ.» and
nothing longer, and a word cut to two syllables says less than the line does. The rule is also the
only place it is said: a pill repeating «ЦЯ МАШИНА» in the header of every section below the rule
would say it a second time, in the one place a section has for something of its own — the chat's
header names whom a question would go to.

## Agents, models, providers

**Every question the app asks is the same box in the same place** (frames 19a and 44d): a
sign, the question, what the answer would take, and two answers — three where staying put is an
answer of its own, as with unsaved work — standing over the middle of the working area, over what
the answer costs, never inside a panel. **It stands above everything that can raise it**, the
prompt editor included: a question hidden behind what raised it takes every click and answers none,
which leaves the app with no way forward. Behind it lies a layer that takes every click and gives it
to nobody, and **it darkens to `#07080c80`** (44b). A question with nothing behind it to weigh — an
empty catalogue about to lose its last model — drops the dimming. **A click beside the box means
nothing**: the box knocks — `scale` 1 → 1.02 → 1, two legs of `90ms` on `cubic-bezier(0.2, 0, 0,
1)`, no pause and no repeat — which says the business is unfinished and it is here. Only the box
moves, the scrim does not blink, and both tones knock the same way. Escape and «Скасувати» mean
«стояти на місці»; nowhere in the app does a click beside a box mean yes. **Escape goes by rank**:
whatever stands over the canvas answers it first — every question prints «ЛИШИТИСЬ ТУТ · ESC» on
itself, and the prompt editor prints «ЗГОРНУТИ · ESC» on its chip — and with nothing standing it puts
the side panel away, which is a way out like any other and so asks about a draft first. It answers
while a field holds the caret too — a field has no «скасувати» of its own to eat the key — and with
the panel already away it does nothing (frame 46a). **A question can be answered without the
mouse**: the safe answer takes focus as the box appears — never the destroyer, and in a calm question
the one that writes — `←` and `→` walk between the answers, and `Enter` gives the focused one. The
quiet third line is pressable and answers the pointer the same way. The question names what goes and
what is left standing; a thing carrying nobody is asked about too (frames 3f, 44d) and told that it
takes nothing with it — an empty load calms the question's tone rather than taking the question away.

**An agent's state is one dot and one word** (frame 44c), in the panel's header under its name, and
optionally one number after a separator dot: «● готовий», «●●● працює · 00:12», «● чекає
постачальника», «● вимкнено» — whose avatar goes dark with it — «● упав · 14:26», «● не відповідає ·
14:26» and «● моделі нема на машині · 14:26», which are what the machine answered rather than what
the file says, and «⚠ не запуститься», the one case where a sign stands in the dot's place, because
that is not a state of work but an obstacle: no key, a function gone. The dot is green for live work,
grey for rest or waiting, pink for a fault. The dot beside a name on the canvas carries the same
meanings without the word, so the panel's header is the only place the state is named.

**The agents section has two faces and no third**: the selected agent's settings under its header
(frame 5a), and the form that creates one, which is what stands there whenever nobody is selected.
A click on the space between spheres takes the selection off and the agent's own panel with it, and
nothing else: a catalogue is where the person stands, not a consequence of a choice, so it keeps its
search and its scroll.
**A row of the history is a heading, and pressing it opens the run where it happened** (frames 23a
and 23c). A question can be an essay, and a list of essays is not a list — so the row keeps two lines
of it and the whole run stands in the stream: the question, every step in the order it ran, the
handoffs between them, and the calls each step made. It is the same stream, drawn by the same parts,
reading from the record instead of from memory — a second way of drawing a run would soon say
different things about it.

A step read back wears **«КРОК 2 · 19:29»** at the far end of its head, after what it cost (23e),
and the run's whole cost stands again on its row in the history — the card counts one turn, the row
counts the walk. Where the panel is too narrow for the whole head, the step drops to a line of its
own at that same end rather than a count or a price breaking in half (23e draws only the one-line
head). Under the last step stands a line saying the run ended and that nothing follows until
somebody asks again — an empty end is then an end and not something that failed to load — and it
leaves the moment the conversation goes on underneath.

**The person is signed the way an agent is** (frame 23k). A reply of theirs is a card like any
other — a dot in the colour of the text itself, «ВИ», and the hour at the far end — because the
stream is a conversation of equals and the person is one side of it. The dot takes no colour from
the palette: five colours belong to spheres and their edges, a sixth would make the person another
agent, and blue is the app's own voice. The hour carries no step number — steps are what a walk
spends, and a person's reply spends none — and on a day the reply opens, the day stands in that same
head instead of a rule drawn over it.

**A card holds somebody's words, and the app is not somebody** (frame 4g). Everything the app itself
says about a turn — «ВІДПОВІДЬ НЕ ПРИЙШЛА», «ЗУПИНЕНО», «ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 4096 ТКН»,
«ВИЧЕРПАНО МАКСИМУМ ВИКЛИКІВ · 8», «МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО» (23l), «ПАМ'ЯТЬ СТИСНУТО · 90 % →
10 %» — stands on the rule between the cards: monospace, upper case, no agent's colour, no tokens,
no price, no hour. «ПЕРЕДАЄ» is the app's voice too. A model can answer «Відповідь не прийшла.» word
for word, and only the place a sentence stands in says whose it is. The rule is about the voice, not
the vessel: a rule where the app only reports, a card where it offers an act, since an act needs a
body — so 4e's not-started states, 49b and 44c stay cards. The note about a refused check (24f) goes
to the model as text, so it stays where the model can see it.

**A run opened out of the history is a conversation to go on with, not a page to read.** The chat is
aimed at the agent it began at, the field stands where it always stands, and the next question goes
on underneath. **What is written in that field belongs to the stream, not to the agent** (23e): an
opened run has a field of its own, empty until something is written in it, and a conversation gone
back to holds the question left unsent in it. The aim decides who the next question goes to and
carries no words with it. The run stays open until the person says otherwise: going to the history
tab and back leaves it where it was, because closing what somebody opened on the strength of a
glance elsewhere is the app deciding they were done.

**The live picture belongs to the conversation on screen** (29g). What the canvas draws as working —
the lit edge, the pill, the clock under a sphere — and what the stream draws as a live card are one
walk's, the walk of the conversation being read. Another conversation may be walking at the same
moment; its work is drawn where it belongs and not here, and «ЗУПИНИТИ» here ends this walk alone.
Every place asks one rule: a walk is on screen if the stream it wrote into is the one open. That is
what makes the walks independent in fact.

**While a walk of this conversation is out, a second question does not go** (4h). There is no queue:
what is typed waits in the field and goes when the person sends it, since a queue would promise it
goes without a hand. The way to ask in parallel is «+ НОВИЙ ЧАТ» — another conversation, walking on
its own. The wall stands between a person and their own conversation, visible and with a door — never
between agents inside one walk, where an agent takes as many turns as there are walks asking it
(29f). So a conversation has at most one live walk, and the clock under the sphere has an owner.

**The field says so itself, and the row under it says what to do instead.** The row swaps «+
ПРИКРІПИТИ» for «ЗУПИНИТИ», the arrow stands dimmed, and the field takes a quieter edge, a darker
ground and «Ходьба йде — зачекайте або зупиніть» in place of the agent's name. It is not stitched:
writing is allowed and what is typed waits — there is something to write, only nothing to send. It
is a state, and it says so without motion: an edge, not a blink — a mark that blinks for minutes is a
mark the eye stops reading.

**The field has three states, and they are told apart by ground and edge** (4h). Open, walking, and
stitched — stitched where there is nothing to write at all: nobody aimed at, or the agent switched
off (23n). The word in an empty field takes one of only two colours: it can be written in, or it
cannot. That word stands above the app's quiet marks — a chevron, a counter, a «last known» — on
purpose: those name something already visible, and a placeholder asks for the one thing to be done
here. The one place it goes quiet is the stitched field, where it asks for nothing.

**A press that could not go through is answered, and «ЗУПИНИТИ» is what answers it**: it says its own
word louder for a moment — 120ms up, 400ms down, each leg easing out — and quiets itself. The answer
stands where the hand already is and leads the eye to the one way out. It takes no colour of its own,
and red least of all: red is the colour of a fall, and nothing has fallen. It answers an event, not a
state, so it happens on every press and a new press starts it over rather than adding to it. No new
word appears under the field: what was typed stays, the caret where it was. An empty field is owed no
answer — nothing was asked for.

**The same question can go again and again** («x1»). A small button left of the arrow reads «x1»; a
press opens it to typing, digits only, from 1 to 999 — Enter or leaving the field keeps it (an empty
entry keeps what stood, zero becomes one, anything over 999 becomes 999), Escape drops what was
typed. Past one, the button stands in the accent. A send then puts the same words and the same packed
files as a question of its own each time the walk before ends whole, until the count is reached;
every repeat has its own block and its own question in the record. While they go the button reads
«2/5», the field and «+ ПРИКРІПИТИ» are shut, so nothing is slipped in between two walks, and
«ЗУПИНИТИ» stays under it. A fall, a turn that never began, a refused write to the record,
«ЗУПИНИТИ», a new chat or a deleted agent ends the repeats at once; the count itself stays for the
next send.

**A file or a folder can go with the question** (4i). The row under an open field holds one act,
«+ ПРИКРІПИТИ», second-level at rest and accent under the pointer; it opens the system's own chooser
for files or folders, and stands only where a send is open — not while a walk goes (4f), not on a
stitched field. What is picked becomes a chip between the field and the row — a folder's mark or a
file's, the name with a trailing slash for a folder, the weight, and a × under the pointer that takes
it off — and the chips wrap into rows; no chip, no row. Nothing about the pick is limited or left out:
every folder is walked, `node_modules` and binaries included, a symlink is not followed, and a folder
the system keeps shut stands in the tree marked «(немає доступу)». The one bound is the ceiling of the
model the agent is asked with. A pick is counted against what is left of it at once, without reading
a byte — a folder of a hundred thousand files is refused on its first thousand paths — and one that
could never fit even at its fewest characters, or cannot be read at all, never becomes a chip: the
line over the canvas says so in red, «big-repo/» — завелика, не прикріплено, and leaves by itself.
The files themselves are read when the question goes, no further than the ceiling allows, and what
was read past it meets the ceiling's own wall (49a). After the send, the question's card carries a
quiet row under it, «ПРИКРІПЛЕНО:» with the same marks and names and no × (23c); the content itself
is never shown in the stream. The record keeps the question as the walk holds it: the typed words
apart, each file apart with its path and its packed text, a snapshot of the moment it went — so a run
opened out of the history carries the same «ПРИКРІПЛЕНО:» row, and «Спитати ще раз» on a question
that never went glues the files in again with the same hand, in the same order.

**A question can be said instead of typed** (4j). A microphone stands left of the send arrow, the same
28px square, second-level at rest and accent under the pointer, with no word beside it; it stands
exactly where «+ ПРИКРІПИТИ» does — not under a walk, not on a stitched field. A press records, a
second press ends it. While it records, «ЗАПИС · 00:07» stands where «+» stood, its dot breathing at
1.6s like a running call, the microphone filled with the accent and «СКАСУВАТИ» beside it, which drops
the recording and leaves the field as it was; the arrow is dimmed and ⌘↵ sends nothing. No red: nothing
fell. Then «РОЗПІЗНАЄМО…» while the project's recognition model (38c) hears it, and **the heard words are written into
the field after whatever was typed, never sent**: the hand sends, as always, and can mend them first.
The sound is kept nowhere, and the person's card does not say the question was spoken. What stops it
is said on the line over the canvas, with an act where there is one: «Розпізнавання не налаштоване»
and «МОВЛЕННЯ», «Немає доступу до мікрофона» and «ПАРАМЕТРИ СИСТЕМИ», «‹provider› не розпізнав: ‹its
words›» and «ЩЕ РАЗ», which sends the same sound again, and «У записі не почуто слів» with none. The
field is never touched by a refusal. Leaving the stream drops a recording that is running.

**An answer can be heard** (4k). A speaker stands at the far end of an agent's answer head, after
«КРОК N · година», quiet as the head and accent under the pointer. A press reads the card's words in
this machine's voice (38c); while it reads, «ЧИТАЄ» stands where the step stood, the speaker turns
into the stop square in the accent, the word being spoken is lit on the accent's ground at 22 %, and
a 2px bar of what has been read runs between the head and the card. The OS's voice hands no sound
over, so there is no wave and no seeking; a voice that does not say which word it reached leaves the
bar empty and lights nothing. A second press, or a press on another card, stops it: the window has
one voice, and the sample in «Мовлення» is read by the same one. Fenced code is not read — a pause
stands in its place — and is never lit. The person's words, the app's words on the rule and a card
still being written carry no speaker. Nothing is read by itself, and leaving the stream silences
it. Where no voice is chosen, or the chosen one is gone from this machine, the press says «Голос не
налаштований» with «МОВЛЕННЯ» on the line.

**One act empties the stream, and it is called what it does** — «+ НОВИЙ ЧАТ», at the far end of the
tabs where the stream itself is. One place and no second: the tabs stand over an opened run as well
as over a live one, so that one act is the way out of a run too, and a second copy inside the run's
own bar would be the same word twice on one screen. Not «back to the stream»: there is nothing to go
back to that the history does not hold. Every question that walked a line is a run, every run is kept
thirty days, and so a stream cleared is a desk cleared, not a memory lost. What it does not touch:
the aim, an agent's own unsaved settings, and a turn still out — stopping a turn is a different act
with a word of its own (4b). What it does take is the ended stream's own field: a stream nobody can
open again keeps nothing. **Two directions, said once each**: the stream is read from its end —
newest at the bottom, following what arrives — and the history is read from its top, newest first,
following nothing. A run opened out of the history is a stream, so it opens at its last step, where
the next answer will appear.

**A quiet dot on «ІСТОРІЯ» is news of this session, and nothing more** (23s). While the person reads
one conversation, another's walk can end — and the tab says so with a dot, not with a word and not
with motion: a mark that moves would pull the eye away from what is being read, and there is nothing
to hurry to. It stands only for what ended with something to pick up — a walk broken or stopped,
which carries a repeat — and it goes out the moment the tab is opened. It is not kept: the dot takes
its truth from what this session has seen, so closing the app takes it with it — the record holds the
runs, and news is only news while somebody was there not to see it.

**A run is deleted by hand, and that is the one deletion with no way back** (frames 23f, 23h and
26a): everything else returns from somewhere — an undo offer, the project file, a re-declaration —
and a run does not, there being no history over the history. The row carries the deletion beside
the press that opens it — the cross always a glyph in the quiet mark, its box arriving under the
pointer or the focus — and the question names the run's time and says plainly that nothing brings it
back. «× ВИДАЛИТИ N» at the tabs row's far end takes the whole visible history, asking with the same
box carrying the number and its days.

**A run read back is the same stream, not a quieter one** (frames 23e and 23m). The card over an
answer says the same facts whether the turn is happening now or came out of the record: whose it is,
what it cost in tokens and money, which step of the walk it stands on and the hour that step began.
The level is counted in the stream itself, off the steps that fed each turn, so a live turn and a read
one are counted by one rule and never disagree; a turn still out keeps its «ПРАЦЮЄ» card in its own
question's block wherever that block is being read. Two streams that differ are two accounts of one
run, and the person then has to hold both.

**A number nobody wrote is a dash, and the dash is said for once** (24c). A fact the step never
carried — the money, a price, a ceiling — is unknown rather than zero, so it stands as «—» wherever
a number would: «… · — ТКН» on the rule, «—» where the money stands. The unit stays with the dash,
because it does not depend on knowing the number. Why is said once, in the step's own head —
«ЦІНИ НЕ ВПИСАНО», a line under the card standing once per step and speaking for every dash above
it, in the quiet grey of the dash it explains. The words are those of the pill of 41a and the card of
4e, which say the same cause: the person never wrote the prices in. **«ЛОКАЛЬНО» is the opposite case
and stays apart**: a price somebody did write as nothing. A known cost of nothing and an unknown cost
are not one word, so the dash never reads as free and «ЛОКАЛЬНО» never stands for a silence.

**The head keeps one width** (frame 23e). A price is written to two places — «$0.05» — and a sum
under a cent is «<$0.01», so a turn that cost something is never rounded down to nothing. The counts
are said in thousands, one decimal at most and no trailing zero — «0.5К/3К» — and the word «ТКН»
is not written there. A name longer than twelve letters is cut with «…». **Only the head shortens,
because only the head is pressed**: the meta line under a message (4g), a step's record and the
run's footer write the counts and the price in full — «2 140/38 ТКН · $0.0040». What the head rounded
away stands whole on the pointer: «454/3 014 ТКН · $0.0031». The head has about 340px — what the
380px column leaves after the chat list's padding on both sides and its scrollbar — and an everyday
turn sits inside it with room to spare («● ЗАГОЛОВКАР · 0.5К/3К · <$0.01 ⋯ КРОК 3 · 20:20» is
311px). The worst turn — a name of twelve letters, counts of six characters each, a price of three
digits and «КРОК 99 · 20:20» — is 369px and takes the fallback: each group stays whole and «КРОК N ·
19:29» drops to a line of its own at the same far end. The two other ways out are worse — an ellipsis
on the price loses a fact, and a smaller font breaks 45b.

**The chat is one stream and it is aimed** (frames 23c and 23d). Every agent's turns stand in one
place, and the header names whom a question would go to — chosen there, from a list of every agent
the project holds, the ones switched off included and the ones whose spheres are far off the screen.
**In that list the colour belongs to the dot** and the name stays ordinary words: a column of five
names each in its own colour is a list nobody can read, and colour is carried by a dot or a ring
everywhere else in the app. **The stream is a sequence of questions, not of moments** (23j): every
question stands where it was asked and holds the turns of its own walk under it, so a question asked
over a walk that is still out lands at the end and the older walk goes on writing above it. By the
clock alone the two would braid, and the person would read one answer as the reply to another
question. The ones switched off stand together at the end under a word said once, rather than each
carrying «вимкнено» of its own; there is no group at all while everyone is on. The search arrives
with the thirteenth agent and not before — a list of eight is read at a glance — and the order is the
project's own and never re-sorts itself, because «the ones asked lately» at the top would break the
hand's memory every time. Aiming from the header is the same choice as picking a sphere, said where
the question is typed. **The aim is the machine's, not the project's**: it is remembered beside the
canvas view, so a window closed and opened again finds the chat pointed where it was left, and
letting a sphere go does not take it away — a chat that forgot whom it was for the moment the
selection cleared would ask for one choice twice.

Moving the rail to a catalogue lets the agent go the same way — nobody is in focus while a catalogue
is open, and a sphere left ringed behind an open catalogue says the panel is still about it when it
is not. Both ask first if anything in the panel is unsaved, like every other way out. Creating an
agent with no point claimed for it puts the sphere in the middle of the canvas, the same place
opening the section from the rail claims. **Asking for the form moves the rail whatever stands open**
— the form lives in the agents section and nowhere else, so a claimed point with no form to fill
would be a promise the panel does not keep. The rule that keeps the rail in the chat is about a click
on a sphere, which is the person going to ask.

An agent has a name, colour, on/off state, position, model, prompt, tools, a purpose, a memory (with,
when it is not off, the threshold and the target it is written shorter by), a max-calls number and a
temperature, and at a convergence point a choice of waiting for every supplier. **An agent learns
nothing about its neighbours' insides**: what comes down a line is the answer and nothing else — not
its conversation, not its prompt, not its tools, not what the person asked further back. Its prompt
is the whole of what to do with what it was handed.

A model is shared: title, per-million prices and **two ceilings — of the context and of the answer**,
one model behind many agents. They are the two ends of one model, so both stand on the model and
neither on an agent, whose settings are about behaviour (49a, 49c). The context ceiling is the
person's own number, **counted in characters rather than tokens**, and it refuses rather than trims:
a turn that would go over it does not go at all and says so. Characters because a token is not one
thing: the same «привіт» is three tokens to one vendor's tokenizer, five to another's and eight to a
third, and a local model's tokenizer is often nowhere to be had — a token number of ours would be a
guess where the person's own number was promised, while a character is a character on every provider
and the person can count it themselves. The form the model is declared in is frame 49a, and the
ceiling stands in it under a line saying what the number is. **Both ceilings are written by hand and
by nobody else**: no provider is asked, no window is looked up, no table of known models stands in
the app, and neither field carries a number to begin with — a new model opens with both boxes empty
and cannot be saved until they are filled. Each has bounds the file holds, the context ceiling from
1 to 1 048 576 characters and the answer's from 1 024 to 524 288 tokens: under the least a ceiling
is a gate nobody set, over the most it is a stray zero, and the field says so as it is typed. A
number under the least in a file reads as unwritten; one over the most refuses the file. Empty is not
wrong — a field the person has not written stays empty in the file, and the model says «НЕ
ЗАПОВНЕНО» with that field's name until they write it (4e). The line under each field says what the
number is for; **no rate stands between the two of them, nor anywhere in the app** — how characters
fall into a vendor's tokens is that vendor's business and that language's. The refusal is frame 49b,
a card of 4e's family: no attempt, nothing spent, no step in the history, a breakdown of what would
have gone — prompt and question — against the ceiling, and one act: open the model, since what needs
mending is a number rather than a key or a network. Only what goes in at the start is measured; what
a command pours into the middle of a turn is the provider's own ceiling to refuse, and that refusal
is a fall like any other.

**The answer's ceiling is the model's second field** (49c), and it is **counted in tokens**, where
its neighbour counts characters. The two units are deliberate: characters are what we measure
ourselves, before a turn goes; tokens are what the provider counts, and this number is handed to it
as it stands — `max_tokens`, `maxOutputTokens`, `num_predict` — so nothing of ours is guessed on the
way. **A model with it empty is asked nothing at all** — the turn does not begin, and the card names
the field to write (4e); no number is filled in for it. The context ceiling is a gate the app closes
before a turn; this one is not measured by us at all: the provider cuts the answer in flight, and the
cut is said in the stream with its own number and unit — «ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 4096 ТКН»,
where the calls ceiling in 29a needs no unit because calls are one measure across the whole app —
while the record keeps `ceiling` as the step's end. A number larger than the provider's own maximum
is not caught in advance, since vendors do not give that maximum out the same way: the turn goes, the
provider refuses it, and that is a fall (44c), not a card of 4e's family. **A model belongs to a
provider, and that provider is chosen from the known list rather than typed** — a typed name could
point at a provider nobody has, with nothing anywhere saying so. The row a person chooses from says
what they need while choosing: the provider's name, its kind, and whether this machine can already
reach it. A model may still be made against a provider with no key — the model travels with the
project and the key does not — but that is said at once rather than found out later. **Choosing the
model chooses the provider** — there is no separate provider control on an agent. A local provider
lists its own installed models; their price is whatever the user types.

**A local provider is given an address, not a key** (frames 31b and 38a). It runs on this
machine, so there is nothing to authenticate and everything to find: the field holds where it
answers, and the address it usually answers at stands in the field before anything is typed. An
address left empty means that customary one — a local provider with nothing typed into it still
works — which is why emptying the field is the way back rather than a way to break it. An address is
not a secret: it is kept in the clear, and it stays on this machine only because it is true of this
machine only.

**A key is written into the machine and never read back out of it** (frame 38a). The value
goes into the section once and leaves this app's screens forever: what comes back is a hint —
`sk-ant-••••••••••••4Kd`, the head and tail with a fixed run of dots between — and the run is the
same width whatever the value's length, so the hint says nothing about the secret, not even how long
it is. **A written key shows as a lit dot and the words «КЛЮЧ ВПИСАНО»**; a provider nobody has
touched stands dim under the rule, with «КЛЮЧА НЕМАЄ» and its kind, since the kind is what a person
weighs while deciding what to fill in. **Emptying the field and saving is how a key is taken away** —
an empty field says the whole of it, and an act of its own would say it twice.

**A provider's row says what the project already stands on it** (frame 38a): its kind, how many of
the project's models name it, and how many agents run on those models — «ВІДДАЛЕНИЙ · 3 МОДЕЛІ ·
5 АГЕНТІВ». None of the three is a number the section holds: they are all read off the project, which
is what makes the row worth reading before a key is even typed. A count of none is said in words —
«БЕЗ МОДЕЛЕЙ», «БЕЗ АГЕНТІВ» — the way every other count in the app says it.

**A provider asks for what it needs, and the card draws a field for each thing it asks for.** For
most that is one field — a key for a remote one, an address for a local one — and for both RunPods it
is both. RunPod is somebody else's machine, so it is remote and is never pinged; but a serverless
endpoint carries its own id in the path it answers at, so a key says nothing about where to knock,
and the address is the person's own to write. The key goes into the machine's keychain like every
other key and the address is kept in the clear like every other address. One address means one
endpoint at a time — a second one is a second address in the same field, not a second provider.

**RunPod is two providers, named for the way a turn is sent** (frame 38a, two rows one under the
other). A serverless endpoint answers two ways, and each is a provider of its own with the same key
and the same address: **RunPod Queue** (`runpod`) throws the turn into the endpoint's queue, and
**RunPod OpenAI** (`runpod-openai`) speaks to the OpenAI protocol the same endpoint serves under
`/openai/v1`, which the app adds to the address itself. Neither name says «Chat» or «REST»: every
provider here is a chat model and both RunPods are REST. RunPod OpenAI stands right after the queue,
is never pinged either, and has no list of models to offer; the model's name is sent with every
request and must be the one the endpoint lists in `/openai/v1/models`, and the name field says so. It
carries functions — and so MCP and the system commands — as far as the endpoint turns them on
(`ENABLE_AUTO_TOOL_CHOICE` and a `TOOL_CALL_PARSER` for the model); the app neither checks nor guesses
that, and where the endpoint refuses, its own words come back as any provider's do, with one sentence
after them naming those two variables. Its tokens are counted from the stream like LM Studio's, so
its turns have a price. With both RunPods the list holds nine providers.

**A provider card says what its endpoint must carry, and a saved address comes off by its cross**
(frame 38a). RunPod OpenAI's card has one sentence under the address's quiet line, in plain prose and
not the quiet line's capitals, since its values are copied as written: «Щоб агент міг викликати
функції, на endpoint потрібні змінні ENABLE_AUTO_TOOL_CHOICE=true і TOOL_CALL_PARSER під модель — для
Qwen це hermes. Перша без другої не дає endpoint стартувати.» It is said where the address is
written, before the first turn, because the endpoint's own refusal comes only after one; the second
clause is there because a worker with the first variable and not the second never starts and the
turn simply hangs in the queue. No other provider has such a sentence. A saved address stands in its
field as the dim placeholder, as a saved key does, and like the key it carries the cross: pressing it
is the only way the address leaves the machine, after which the field shows the customary address or
the shape `https://api.runpod.ai/v2/…`. No cross where nothing is saved or something is already
typed.

**RunPod Queue is the one provider this app speaks to in a protocol of its own** (frames 38a, 44c).
Its road has no OpenAI door: it is a queue. A turn is thrown into it, asked about once a second, and
read back when it is over — and it is read back **whole**, not word by word. The queue does say the
words as they are written, but a job asked to stream never carries the token counts, neither in its
pieces nor afterwards, and a turn whose tokens nobody counted has no price. The counts outlive the
seconds, so they win: the sphere says «працює» and counts them while the job stands in the queue, and
the answer lands as one. «ЗУПИНИТИ» takes the job off the queue as well, which is more than aborting a
connection does — a job left running answers to nobody and is paid for all the same. Two things
follow for the person: the endpoint serves one model and the job never names it, so a RunPod Queue
model's title is their own word for it and the field says so; and the queue carries a conversation
and nothing else, so **an agent on a RunPod Queue model can hold no functions** — a turn that holds
grants all the same does not go, and the card says which provider and which agent it is about,
because dropping the tools quietly would read as an answer made with them. The settings say it before
a turn is ever asked: on such a model both tool fields are shut, each with the one line that says
why, and the arc of mini-spheres under the sphere goes quiet — the grants stay in the file and stay
listed, since they are the person's and nobody took them away, and the quiet says that none of them
can be called from here.

**OpenCode Go is reached with one key, and the model's name picks the road** (frame 38a). It has one
address and no field for it: the key from the OpenCode console is the whole of what it asks. The name
the person writes for a model decides the protocol a turn speaks — Claude, MiniMax and Qwen models
over Anthropic's, GPT, Grok and Muse over OpenAI's Responses, every other over chat completions — and
may carry an `opencode-go/` head or not. Every turn of one conversation carries the conversation's id
in a header, which OpenCode refuses to answer without. Gemini and Mistral models are Zen's, not Go's,
and are not served.

**The providers themselves are a known list, the same in every install.** Nobody adds one: a person
gives a provider what it asks for — a key, an address, or both — and that is the whole of what a
provider holds. So a model that travels with a project names a provider that already exists wherever
it lands — what may be missing there is the key or the address, never the provider. The panel shows
the full list from the first launch: filled providers stand first, the unfilled together below them,
dim — not an error, just nothing entered yet.

**An open provider card folds from a chevron in its head, and keeps what was typed** (frame 38a). The
head carries, right of the «ВІДДАЛЕНИЙ» / «ЛОКАЛЬНИЙ» pill, the row's chevron turned up; pressing it
folds the card back into its row without saving and without dropping anything: a half-typed key or
address is there again at the next opening, for this provider alone, while the panel stands.
«СКАСУВАТИ» drops it, «ЗБЕРЕГТИ» writes it and drops it, and opening another provider folds the first
the same keeping way.

**A provider can be turned off on this machine, and off is not removed** (frame 38b). Its key and
address stay; nothing goes to it, and a local one is not asked, neither on the beat nor by a turn, so
its dot is the empty ring of an unset one rather than the red of «НЕ ВІДПОВІДАЄ», which would be
untrue. The open card carries «ВИМКНУТИ» at the left of its actions row, beside «СКАСУВАТИ» /
«ЗБЕРЕГТИ», and an off provider «УВІМКНУТИ» in the same place; it acts at once, without «ЗБЕРЕГТИ»,
and the card folds: the provider changes its group, and a card travelling open down the list would
leave the person looking at an empty place. Any provider can be turned off, filled or not. Off
providers stand last in the list, dim and in the fixed order, under a rule and the word «ВИМКНЕНІ»
drawn the way «НЕ НАЛАШТОВАНІ» is, and an off one lacking something stands there too — off outranks
unset. The row's facts begin «ВИМКНЕНО», then the counts: «ВИМКНЕНО · 1 МОДЕЛЬ · 1 АГЕНТ». Off is
this machine's alone, like a key: it never reaches `project.yaml`. An agent whose model stands on an
off provider does not start: its mark is «ПРОВАЙДЕР ВИМКНЕНО», outranking every other mark of the
provider's and «НЕ ВМІЄ ФУНКЦІЙ» too, and its turn is a card of 4e with that word, the sentence naming
the provider and «ВІДКРИТИ ПРОВАЙДЕРА». Such a model can still be chosen: the agent's model picker
says «· провайдер вимкнено» after its prices, and under the field with the provider's name when it is
the chosen one; the model form's provider picker says it after the provider's row and in the field.

**Speech is a section of its own on the rail** (frame 38c), the last above the rule, its glyph a
sound wave: what the project recognises speech with travels with the folder. «Розпізнавання» is a
model of the catalogue whose kind is «Розпізнавання» (49d), chosen from a list that holds only those
— never typed — and written to `project.yaml` by its id the moment it is chosen; the field names the
model's provider at its far end. With no such model in the catalogue the field says «НЕ ЗАПОВНЕНО»
and «ДО МОДЕЛЕЙ» under it opens the models; a chosen model since deleted is an ordinary broken tie,
«моделі немає». The list carries no foot sentence, the same as the agent's model picker in the app.
«Голос» is one of the OS's own voices and the one thing of this machine's in the section: its card
says «Ця машина · у project.yaml не йде», it is written the moment it is chosen, and «ПОСЛУХАТИ»
stands at its label's edge once one is. A change of the voice the machine does not take is said on
the line over the canvas, «Мовлення не збережено: …», and the card stands again on what the machine
holds. The language of recognition is not chosen; the model hears it.

**A model has a kind** (frame 49d): right after its name the form carries «ВИД», «Текстова» or
«Розпізнавання». A text model is 49a's. A recognition model has a name and a provider and nothing
else — no ceilings, no prices per token — and only OpenAI, OpenRouter and RunPod OpenAI are offered
for it; turning the kind to recognition lets go of a provider that cannot hear. The kind is written
into the model's own file. A model whose file names no kind is a text model, the one exception
`CLAUDE.md` names. In the catalogue the kind follows the model's name after «·», in the mark of the facts
under it — 9px mono capitals in `#6b7490`, «ТЕКСТОВА» or «РОЗПІЗНАВАННЯ», on the name's baseline; under the
name a text model keeps its prices and agents, a recognition model says «Обрана в «Мовленні»» or
«Не обрана», and its open row carries no agents. The agent's model picker offers text models only. The kind of a model agents
stand on, or the one speech hears with, cannot change: the track is dim and the sentence under it
says why.

Choosing a model on an agent opens a list of the project's models with their prices and how many
agents already run on each — and nothing else. That list has no row for making a model: a model is
made in Моделі, in one place, so there is one answer to where models come from.

Prompts are a library: name and text, one prompt across many agents. Frame 19a lays the catalogue
out the way the model one is laid out — a card per prompt carrying its name, how many agents run on
it, and the first two lines of the text, since a prompt is known by how it starts. The open card also
says how long it is and carries the way in. A system prompt is not edited in a `380px` column — frame
20a opens it across the whole working area, over a canvas that is left standing rather than taken
down, so closing it puts the graph back exactly where it was. The name is a word until its line is
clicked and a field after — an unnamed prompt says where the name goes, so there is always something
to click. Escape, the chip that says so, and the way back all close it; saving closes it too, and
puts the prompt in the catalogue behind. The line along the bottom names the agents the change
reaches before it is saved. Taking a prompt away is asked about over the canvas (frame 19a), since
what the answer costs stands there: the agents written for it do not go with it — each is left on the
bare model — and the question names them on chips in their own colours before it is answered. Like
every deletion it leaves the one step back.

## Tools

Three levels, and they read as three different things. A **source** is what the user registers: an
MCP server, in the MCP section, or a declared command, in Команди — two sections, since a server has
a life a command does not. A server's row carries its connection state; opened, it shows the last
answer's time and what changed after an update. A **function** is what gets called — for MCP these
arrive from the server and can vanish when it updates. A **grant** is "this agent may call this
function", carrying its own pinned arguments for that agent.

**Opening a project starts no local server** (frames 36d, 36k). A local server runs a line the
project's author wrote, so opening somebody's project must not run it here: every local server
stands «ФУНКЦІЇ НЕВІДОМІ» until a person raises it, while a remote one is asked as the project opens
— it is a connection, not a process on this machine. «ЗАПУСТИТИ» (and «ПЕРЕЗАПУСТИТИ») on a local
server whose line this machine has not agreed to opens the window of 36k first, centred over the
working area like every question: «Запустити ‹ім'я› на цій машині?», the sentence on where the line
came from, «РЯДОК ЗАПУСКУ» word for word in mono — never cut, wrapped whole — «ТЕКА», the project's
root the server starts in, shown as its whole path with no «~», and «ЗМІННІ СЕРЕДОВИЩА · N» with
their names only and «ЗНАЧЕНЬ НЕ ПОКАЗУЄМО»; the window is handed no value, so none can show, and a
server naming no variables has no such block at all. «Запустити» agrees and raises at once, with the
clock of 36d; «Не запускати» and Escape change nothing, and the next «ЗАПУСТИТИ» asks again. The
consent lives on this machine and is keyed by the line itself: a line changed in the file is asked
about again, and a server declared or changed in the form (36c) is agreed to as it is saved, since
the person wrote that line. A server raised in this session and then changed in the file is let go
and asked afresh — refused, so it falls back to «ФУНКЦІЇ НЕВІДОМІ»; one never raised is left alone.
A turn whose agent was granted a function of a local server this machine has not agreed to does not
begin: it is a card of the 4e family, «ХІД НЕ ПОЧАВСЯ», saying «‹сервер› ще не запускали на цій
машині — його рядок запуску чекає вашої згоди.», with «ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ», which opens that
same window over that server, and «СПИТАТИ ЩЕ РАЗ» beside it for after the consent; nothing was
started and nothing is charged, and the card carries no word of its own beside its heading (36k). An
agent granted nothing of such a server goes as always.

**A local server that stands up can be stopped from its row** (frames 36d, 36j). Where a server
nobody raised offers «ЗАПУСТИТИ», a local one standing up and working offers «ЗУПИНИТИ», in the same
place and the same look, so the head still holds one act. It lets the process go on this machine and
the row stands «ФУНКЦІЇ НЕВІДОМІ» with «ЗАПУСТИТИ» again; the consent to its line stays, so the next
«ЗАПУСТИТИ» raises it with no window, and a change of its line in the file afterwards starts nothing.
It is no ban: a turn whose agent was granted its functions raises it again, as any turn does. A call
out at the moment of the stop ends as a call to a fallen server does, and the turn goes on; the
button is never held back for it. A remote server has no «ЗУПИНИТИ» — nothing of it runs here. The
server's page (36j) has no «ЗУПИНИТИ» either: there a standing local server is raised afresh with
«ПЕРЕЗАПУСТИТИ».

**The catalogue says what the last call came to, and leads to it** (frames 36a, 36f). Under a
server's row stands the last call that did not work — the time, the server's own sentence, and
«ПОКАЗАТИ ВИКЛИК», which hands the chat over to that very call by the call's own id: it turns to the
agent, stands the run in the stream and rides to the message the call was made from. It is a handing
over and not a second home for the call, and it is the one place in the app where a row opens with
no hand on it, because the hand was there, in another section.

**A way that leads nowhere says so** (frame 36f). The record cannot always place a call: the run may
have been forgotten — a record keeps thirty days — or the call may carry no id of its own. Then the
offer is not kept: «ЗАПИС ДО ЦЬОГО ВИКЛИКУ НЕ ВЕДЕ» stands in its place, not beside it, and the offer
does not come back, since a second press would find the same nothing. The word is quiet, in the tone
of the row's own facts rather than of trouble: nothing has gone wrong just now — there is simply no
road. Nothing else in the stripe changes with it, neither the time, nor the sentence, nor the sign.

In the file a grant is always one function, never a whole server: the tick in the MCP section writes
one for every function the server hands over, and the server's own screen lets single ones go. A
grant to a function that has disappeared stays visible, struck through — never silently dropped.

**One gesture in every section** (frames 17a, 17i and 43). An agent's tab keeps what it was given in
one section per kind — «КОМАНДИ», «MCP» and «АГЕНТИ» — and in each a tick on a row is the whole of
granting and of taking back. A list opens where every other choice in this tab opens — in place, over
its own field, with a search across it — and what was ticked stands under the field, where it is read
without opening anything. **The field is for choosing, the rows are for reading**, and each carries
only what that means: in the list a row is a tick and a name, under the field it is a name, the lock
and the chevron into what the grant fixes. **Granting is one movement and taking back is a deliberate
one**: a tick on the row under the field would put two different gestures in one vertical — in the
list that place takes the grant away, under the field the same place leads into what the grant
fixes — and the hand would get a different result depending on which list it is in. The closed field
says a state and not a report of an act — «4 з 8 функцій», the way the model's field says
«claude-sonnet-4.5» — and while nothing is taken it says what to do rather than that nothing was done.
**The section names the source** (frames 17a and 17i). The head of a section — «КОМАНДИ · 2», «MCP ·
1», «АГЕНТИ · 1» — carries the kind's glyph, its word and its own count, so the list inside has no
head saying the same word again, and no head ever stands over rows of two kinds.

**Nothing in this section is collapsed** — not the open list, not the rows under the field. A long
list is answered by grouping and by scrolling, never by hiding: a function the person cannot see is
a function they will grant a second time, and what stands under the field is what they chose a
moment ago. The head over each section is the whole of the structure, and nothing is said in words
about what is below the fold: the scroll bar says it. A line counting what is past the bottom reads
as a riddle over a list that can simply be pulled.

**A grant whose function is gone is shown, not skipped** (frames 17a and 18a). The file is the truth,
and it changes under the app — a command taken away on another machine, a hand-edited file, a server
that dropped a function — and the grant on it stays. Such a grant is not a tool the agent has but one
it thinks it has, so it stands apart from what works: its own group «НЕ ІСНУЄ БІЛЬШЕ» after the
others, the name struck through and the lock struck through with it — what the grant fixed goes when
it goes — no tick and no chevron, since the list holds no row for a function the project does not
have and there is nothing left to pin. **The section's counter does not count it**: «КОМАНДИ · 1»
over two grants, one of which calls nothing. What happened is said in words above the one act that
ends it, and that act takes the whole group: letting go of calls that cannot be made is not a
decision to make one row at a time. For a server's function the words are «На сервері немає функції з
такою назвою. Видача лишилась — агент кличе те, чого немає.», true both where the server dropped it
and where it never had one by that name (a grant on `ask_question` against a server offering
`ask_wiki_question`). Where the app differs from the frame, and the app wins: 17a writes «Сервер
оновився й забрав цю функцію…», which says the second case wrong.

Nothing floats to the top when it is ticked — the order is the project's own — or a row would run
out from under the pointer at the moment of the click. A grant is one change to the tab's draft and
reaches the file only through «Зберегти», like every other field. **A grant names its own kind.** A
function is granted to one agent once; the same function granted to two agents is two grants, which
is what lets each carry its own pinned arguments (frame 17b). In the file every grant carries the
word for its kind — `source: command`, `source: mcp` or `source: agent` — so a record is read by
branching on that word, and no grant ever carries the empty keys of the kind it is not.

**A grant is opened on its own, and what it fixes is two lists, not one with ticks** (frame 17b).
The step carries one act, «Зберегти»: taking the grant back is the tick in the list, and one way is
enough. «ЗАКРІПЛЕНО ЗА <АГЕНТОМ>» carries a closed lock and the values themselves; «ВИРІШУЄ МОДЕЛЬ»
carries an open lock, a dashed edge and no values at all — a parameter fixed and a parameter left
open are two different states, and a single list with ticks would say that badly. Fixing is not
hiding: what is fixed leaves the schema the model is handed, and the box at the bottom shows that
schema as the model will get it, so the effect of pinning is visible in the same screen as the act.
The value is kept as the text it was typed as — what it means is said by the parameter's own
declared type, which lives with the command and is not repeated on the grant. Both lists change the
tab's draft and nothing else, and are written by «Зберегти» like everything else.

The user never writes a JSON schema. Parameters are added row by row: name, type, description,
required.

**The description matters more than the type.** The type says which values are allowed; the
description says which one is right. In every form that uses this widget, the description reads as
the main field, not a footnote.

## Running

A run walks the drawn line forward. It starts at the agent a person spoke to, and goes on to whoever
the outgoing line points at, until it reaches an agent with no outgoing line. **The run's answer is
the answers of every agent it ended on**, and the run is over when the last of them is; where a line
forked, that is more than one. A run's line in the history is headed by the agent it started from,
and counts the agents it walked through (frame 23a). An agent in the middle answers into the run,
never to the person, and it never chooses who comes next: the route is drawn, not decided.

**An agent knows nothing about the graph** — not who called it, not what follows, and it never calls
anybody itself. Work is pushed, never pulled: an answer goes down every line the agent points at.
Where lines converge, the agent at the point waits until every live supplier this run reaches has
had its turn, and then works once, on everything that arrived. A supplier that is switched off is not
waited for and not counted — the counter keeps both numbers, «1 / 2», so not counting never reads as
a deleted line — and neither is one standing behind a switched-off agent, nor one this run will never
get to: a run started halfway down the graph takes the shorter road on purpose.

A supplier that failed or was stopped never arrives, and neither does one that is switched off: the
point works on what did arrive. While an agent waits, its sphere stays lit rather than greyed — the
glow says it is live, not that it is working, since what is working is whatever edge the flow runs
down (frame 29b) — and a pill says whom it waits for and how many have answered; an edge from a
supplier that has answered is solid, one still working is dashed.

**One agent's turn is five steps and nothing between them.** The work arrives; the sphere checks what
the agent stands on; when its memory has grown to the agent's threshold, the composer is asked to
write that memory shorter (below); the model is asked; what came back is checked. No step guesses at
another's business, and no second judgement is laid over a first. The app takes the provider at its
word: a stream that ended without naming a reason has not named one, and counting tokens to decide
what the provider did not say would be inventing an answer nobody gave. The one thing measured
before a turn is sent is what the person themselves declared: the model's own context ceiling, in
characters, and the two shares of it an agent with a memory is given — a turn whose own words leave
no room under them does not go at all (49b); a model with either field left empty is not asked at
all (4e). No rule of ours invents a limit beside it — anything else too big for the provider is
refused by the provider, and that refusal is the fall. Every agent is judged alone; nothing about the
run as a whole enters its turn. What travels down a line is the answer itself, word for word, and
nothing else: the models this app is built for read a plain answer and stumble over a shape they have
to unpack first. A converging point puts the answers one under another in the order they arrived, a
blank line between them, and adds no word of its own — not even the name of who said what, and no
purpose, none of the sender's conversation, prompt, tools or history. A person's words go in as they
were typed. **A turn carries the agent's own thread of this conversation, and nobody else's**: the
model is told the system prompt, then the pairs this agent has been through — what arrived, what it
answered — and then the new input. Who asked is not in it: a person and a neighbour are the same
thing to an agent, an input and an answer, so ten agents carry ten short threads rather than ten
copies of one long one. Only a turn that answered makes a pair; one that was cut, fell, was stopped
or never began leaves nothing at all, neither its input nor its fragment, because «Спитати ще раз»
makes the turn that will. Tool calls are not in it either: the model is told what was asked and what
it said, and what it ran to get there stands in the record for the person. The thread ends where the
conversation does — «+ НОВИЙ ЧАТ» is an empty thread for every agent. **What an agent remembers is
its own setting**: the section «ПАМ'ЯТЬ» under the tools, headed the way they are, is three choices
on one track — «Своя» (the default: its own thread, as above), «Вимкнено» (every input reaches the
model alone after the system prompt, for tasks that are each their own) and «Загальна» (the
question's whole run as the record holds it the moment the agent is called: who handed what to whom,
the person's question with its attachments, answered steps only, no tool calls, nothing of the
conversation's other questions). The line under the choice says what it gives. An agent called as a
tool is the same agent: before it is asked it passes the same check of its memory and, where the
memory reaches the threshold, the same full composer, and only then is the question put. «Своя» is
its own calls — request and answer — within one turn of whoever called it; it ends with that turn and
does not mix with the thread it has when it walks. «Загальна» is the question's run as a walking
agent reads it, so a compression made under a call serves the agent later on its walk, and a second
call of the same tool in the same turn does not compress it again. «Вимкнено» gives it the request
and nothing else. Its wall is the same too, with the reserve held back: a tool whose words leave its
memory no room below its threshold is not asked, and the caller is told so as a failed call in the
tool's name and goes on. A tool's compression is not shown in the stream, the line «ПАМ'ЯТЬ
СТИСНУТО» being the agent's own; what it cost is part of the caller's step, with the turn of the tool
and of every agent it called in turn. The shared memory is told in words, not as a conversation the
agent never had: it opens the turn's own input — one input, not a message of its own — with what it
is, then «ПИТАННЯ ЛЮДИНИ → ‹ім'я›:» and the question with its files glued in by the same hand as when
it was sent, then every answer of the question in the order it landed, headed by whose it is and whom
its work came from, and closes on «ТВОЄ ЗАВДАННЯ:», after which the turn's own words follow. Nobody
is waited for: a branch still out has no step yet, so it is not there. While nothing of the question
has answered the memory is empty, the question being the turn's own words then. A memory that cannot
be read is no empty memory: the turn falls with the record's own words and «Спитати ще раз». **The
context ceiling counts the memory, and the memory makes the room it needs.** An agent with a memory
has two numbers of its own under «ПАМ'ЯТЬ», two steppers hidden at «Вимкнено»: the **threshold**,
from 70 to 90 % of the model's context ceiling (90 by default), at which its memory is written
shorter, and the **target**, from 10 to 30 % (10 by default), which it is written down to. The gate
before a turn weighs the prompt, the input and the memory together. **A memory never makes an error
the person cannot mend**, so the only wall is what the person controls — their own words, the prompt
and the question: the target's share of the ceiling is held back for the memory always, whether it is
full or empty, and the prompt, the question and that reserve must stay strictly under the threshold,
so that a memory just written shorter does not call for it again on the next turn. At the defaults
the person's words go in under 80 %; at 70 and 30 under 40 %. Over it the turn does not go: the card
(49b) says in a sentence of its own that the reserve is held back and what the threshold is, shows
the reserve in its line «пам'ять», and the way on is a shorter prompt or question — nothing is cut,
nothing is thrown out, and nothing began. An agent whose memory is off holds nothing back and meets
the wall only over the ceiling itself. What lies between the threshold and the ceiling the memory
never fills: it is left for the turn's own growth — a tool's result poured into the middle — which is
the provider's to refuse.

When prompt, question and memory together reach the threshold, **the composer** runs first: one
silent call of the same model with the agent's temperature, no tools, no system prompt and no second
try. It is given one message: the memory as text, each turn told by who said it, fenced in as data
and not as a conversation to answer, and after it four strict rules to compress it into **one
message** of no more words than the target's share of the ceiling comes to — the model counts words
better than characters — and nothing else: no answer to what the memory asks, no word of its own
around the summary, the key facts, decisions, names, numbers and terms kept, the most important
first. Whatever still runs over the budget is cut off the end, at a word, where the least important
stands, and it is not asked for again. A memory too large for the composer to read at all is read
from its newest end as far as it goes. If it says nothing, the turn falls with the app's own
sentence; if it is stopped, the turn ends as stopped. Then the turn goes as any other, with the
composed message standing where the memory was. The composed message is a record of its own kind:
the model is given it, the person sees only a thin rule in the stream and the history — «ПАМ'ЯТЬ
СТИСНУТО · 90 % → 10 %», which are the threshold and target the agent had **at that step**, kept in
the record as a fact like the price and never read from the agent as it stands today. No step is
deleted: the memory the model is given is the latest composed message and everything after it. Its
tokens and money are added to the turn's own. «Вимкнено» is never written shorter; «Своя» is bound
to the agent and the conversation, «Загальна» to the agent and the question. A turn that broke ends
the walk it was part of: a step is what breaks and not one turn of it, so every turn still out is
ended at that moment and nothing of the walk begins after. Nothing is deleted and nothing is retried
by itself — the app's sentence about the break carries the act that runs the broken step again
(23m), and that act belongs to its own question: a newer question asked while the walk was still out
is no answer to a break the person had not yet seen. The one link a walk cannot take is the one to an
agent switched **off** (29f) — it ends the walk the same way and carries the same act.
**A question of the person's that could not go says it in a rule of its own** (23n): it has no
sender, so «НЕ ПЕРЕДАЄ» would be somebody else's word — «ПИТАННЯ НЕ ПІШЛО ⇢ EDITOR · ВИМКНЕНИЙ»,
the repeat under it, and no card, because there is nothing in the walk to mend: switching the agent
back on is the person's own act, and the repeat then means switching on and going on in one press. A
converging point below the break is not asked with one supplier missing: it waits, and what did
arrive stands in the record until the repeat brings the rest (29c). It says so while it waits — the
sphere wears «ЧЕКАЄ ПОВТОРУ · ВІДПОВІВ 1 З 2» and the chat its «чекає постачальника», the same third
state of 44c, since a wait ended by a hand is still a wait. A turn that never began ends it the same
way: the app's own sentence about a missing key or a ceiling is not the agent's words, and nothing
that the agent did not say travels down a line.

**The record is written before the walk moves on, and its failures are said**: the question is in
the record before its first turn goes, and a turn's step is in the record — whole, in one write —
before its lines go out. A write the record refuses is a break like any other: the walk stops there,
the card that was not written keeps what came back and says «Не збережено в запис» with the record's
own sentence, and «Спитати ще раз» stands under it. The repeat reads the record, which lacks exactly
what was not written, so the line into that turn runs again; a question that was never written is
put again from its own card, the one thing taken from the stream rather than the record. A read the
record refuses — the memory before a turn, the walk before a repeat — is said the same way («Запис
не прочитався»), never answered with an empty memory; an end it refuses to stamp says «Прохід не
закрито в записі» under the walk's last word, and the repeat stamps it again. The history, its
search, a deletion and «ПОКАЗАТИ ВИКЛИК» say the record's sentence where they would otherwise have
shown an empty list, nothing found, or nothing at all.

**A turn that never began is a card** (frames 4e and 49b): no key, no model, no address, a provider
nobody declared, a local provider that does not answer, one turn longer than the ceiling, a model
with a field nobody has written and an **agent** with one of its own two numbers unwritten — one
reason with two origins, the same word and the same sentence, differing only in the thing it names
and where its act leads — an agent naming a prompt the project has lost, an agent holding a grant on
a function it has lost, an agent holding grants against a provider that cannot call functions («НЕ
ВМІЄ ФУНКЦІЙ»), and an agent whose model's provider is turned off on this machine («ПРОВАЙДЕР
ВИМКНЕНО», 38b). The prompt and the grant are one case: a broken reference rather than an empty field
— the thing's own file left the folder and the tie in `project.yaml` stayed. One form for all of
them — the same heading, the reason's own word from 41a or 44c beside it, one sentence naming the
model, the provider or the agent it is about — the unwritten field's own name among them, in plain
speech with one capital where the pill shouts it, and a lost file not named at all, since its human
name went inside it and the folder kept a uuid — «Нічого не надіслано», and one act leading where it
is mended: the provider, the model, the settings, the prompt's own field or the grants. That act is
about the cause; under the card, without a rule of its own, stands «СПИТАТИ ЩЕ РАЗ» about the turn
(23m), on every one — the one longer than the ceiling included, since the card's own act raises that
ceiling and the same words then go through (49b). The words the person typed stay in the field as
well, so nothing is retyped — and the card says so only while they are there. It is not a fall:
«упав» means a turn was tried, and here nothing was sent and nothing was spent. A step stands in the
record all the same: without tokens, without money and without a duration, with an end word of its
own and with the provider's words as they came, so that closing the app does not take the card with
it. A model the machine does not have is not one of them — that turn goes and the provider refuses
it, which is a fall like any other.

**A fall says why, in the provider's own sentence** (frame 24d). «Відповідь не прийшла» alone names
the event and hides the one thing the person came for, and the words are right there in what came
back. So the rule under a fallen turn carries them after our own word — «Відповідь не прийшла · 404
page not found» — whole: the words before any markup begins, on one line, with no cut past any
length, since the number the provider named (a limit, a size) is often the last thing it says. They
are not the agent speaking, so no card is made of them and nothing of them goes down a line or into
an agent's thread. The record keeps the sentence where a turn that answered keeps its words, so a run
opened tomorrow says why it fell and not merely that it did.

Max calls is per agent and counts everything in its own turn — each round of the model and each tool
run. The map of calls is judged whole, and three things are refused: a line that closes a ring, the
same line drawn twice, and two things standing under one id. The canvas refuses the first two before
they are drawn — every sphere a line must not land on stands dimmed and takes no click — and the file
refuses all three, both when it is read and when it is written. Nothing else is warned about: dead
ends, islands and missing exits are all normal, and there is no "finish" marker.

## History and debug

History is a list of runs, not of chats — a run starts at one agent and passes through many. It is
**this machine's**, like every other machine-scoped thing: it lives in the database beside the app
and not in the project's folder, so a colleague opening the same folder opens an empty one. It is
kept 30 days, said plainly in the interface. The record of deletions is a different thing under a
word that sounds alike: it is where a deletion's thirty-second way back is taken from, and it is this
machine's too.

Debug is a flat projection of **one pass** — the walk of a single question — laid out in execution
order rather than canvas positions (24g). A row of the history is a flow, and a flow holds several
questions (23j); the projection draws one of them, so its head names that question and its totals
count that walk alone. The flow's own sum stays in the history row, where the flow is the unit: one
number added up in two places comes apart at the first repeat. The way in stands on the person's own
question in the stream, under the words it was asked in, and not in the chat's head, where nothing
would say which pass opens; a question that started no walk carries none (23n). Inside, «‹ ПИТАННЯ 2
З 2 ›» steps between the passes of that flow and no further (24i) — passes are what it counts, so a
question that never went is not one of them.

A column is a turn, in the order the turns were taken, and a ruler over the columns says when each of
them began, counted from the moment the question was asked. Along the top row stand the turns **you
cannot go past** — the ones no line of the walk flies over; everything that can be gone round hangs
below in its own lane and comes back up where the roads meet again (24a). A lane is given back once
its branch has come home, the way a graph of commits gives one back, so the height follows the
branches running _at once_ and not every branch of the pass. A turn that joins two roads is brought
back into the row where nothing would then have to fly over it; two equal branches both stay below,
since neither of them is the main line. **A sphere there is a step, not an agent:** one that ran
three times appears three times, one that waited for two suppliers appears once with two incoming
arrows. The number it carries is its place in the pass — «крок» stays the word for the level of the
walk, and «місце» is the word for this, and the history search counts in it too («40 МІСЦЬ · 3
ЗАПУСКИ»). The projection shows the name, colour and model **as they were at the time of the run**,
even if the agent has since been renamed or deleted.

A transition here is a solid line of 1.4 pixels, wearing the same paint as a line on the canvas
(24h). It is **quiet at rest** — the record is looked at whole first, and a colour on every line makes
the graph a stained-glass window rather than a walk; the sender's colour and a trail come when a step
is opened and its own lines, incoming and outgoing, are lit. **The weight is one for both states:**
what grows is the trail, not the line. The head aims at the rim without touching it, and the air
around a sphere is measured in shares of its own rim — 0.28 out and 0.38 in, the shares the canvas
leaves at a rim of eighty pixels — so both surfaces breathe alike whatever the sphere is scaled to.
The routing is horizontals and verticals alone, with a corner rounded off where they meet: going down
it leaves by the sender's gutter, runs along the lane and turns towards the rim; going up it runs
along its own lane and rises in the receiver's gutter. **A gutter is not a number but a sum** — the
air, the head and two corners — so a corner is never cut back to fit, at any scale. Where several
lines arrive at one turn they rise on that one gutter and lie over each other on the last stretch, the
way a graph of commits shows a merge, and the receiver draws a single head for them all: two identical
points in one spot read as a single blot. **Each of them still turns its own corner into the row** —
a line stopped square on the gutter would leave a hard tee where every other join is round. Nothing
flies over a sphere, since what can be gone round is not in the row to begin with, and there is no
arc to draw. The canvas's drifting dashes stay on the canvas: there they say «work is running now»,
and in a record nothing runs — which leaves dashes one meaning here, absence.

The step being read keeps its sphere and takes a ring around it, in its own colour — the same mark a
selected sphere wears on the canvas — and a transition being read lights its edge and carries the
same small square the canvas puts on a selected link. What passed along it is shown to a few lines,
with the rest folded away: long text has no right to blow the screen apart. **The step opens as a
sheet over the projection, not as a column of the window** (24c): the field under it neither narrows
nor lays itself out again, so the ring stays where it was pressed. The sheet is 560 px wide and stays
that wide — every extra pixel of the window goes to the graph, since the pass is the subject of the
screen — and its words keep that measure whichever way it stands. Below a threshold of one sheet's
width left for the graph it lies along the bottom of the field instead, full width, the words still
in a 560 px column. It says «a record, not a conversation» in its own language: no boxes around the
words, rows under mono labels parted by a hairline, a head naming the step and whose turn it was, and
a foot that walks to the steps on either side («‹ крок 2 · 3 з 6 · крок 4 ›»). What it says is the
agent as it stood then, what came into the turn and what the turn answered; the turn's own words
stand bright and another's quieter, and where the work came from is named by the steps around it —
the question itself, when nobody fed it. It closes by the cross in its head, and Escape closes what
stands innermost: the open step first, and the projection after it.

Moving about is the canvas's own gesture and no other (24k): the left button on the empty field drags
it, exactly as it drags the canvas (12a), a double click on the empty fits the pass, the wheel zooms
to the cursor by the same step, and the same corner panel says what the scale is and steps it (13a),
because a number on screen is what tells the eye whether a small graph is small or far away. **The
ends here are the projection's own — 50 % out and 150 % in, where the canvas keeps 30 % and 100 %:**
a sphere is drawn small in a projection, so the field starts closer than the canvas ever goes and
never needs to go as far out as the canvas may. A pass opens fitted and **no closer than 120 %** — a
record is read whole before it is read close. Neither the zoom nor the shift is remembered: closing
it, or stepping to another pass, fits it again. The ruler goes with the field across but never leaves
the top and keeps its own size — slid down or shrunk away, it would name the hour of a column it no
longer stands over.

A step's duration includes every call it made — a slow agent is slow somewhere visible. Nothing in
settings mentions durations: someone who noticed an agent is slow finds the reason here.

## Content is text

What agents pass and return is a string. A tool's answer is read as one: words are handed on as they
came, and a picture, a sound or a resource is named («[частина відповіді не текст · image]») rather
than passed on, since nothing but text reaches a model.

## What the interface deliberately does not have

Groups. A minimap. Empty spheres. Ports on a sphere. Alignment guides or snapping. A finish marker.
Triggers, schemas, a store, Git, a notification centre, a history of deletions on screen — none of
them, by design. Quorum thresholds where lines converge. Any judgement of a graph beyond the three
rules that make it a map of calls — no ring, no line drawn twice, no two things under one id.
