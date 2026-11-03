# Coder

An AI platform for automated code development, built around agents. The user places agents on a
canvas, connects them with directed links, and runs work through the graph — assigning models of
different cost and capability to each one, and granting each the tools it may call.

A project is a folder on disk: it travels with the repository, so an automation can be committed and
shared like any other code. Opening one starts none of its local MCP servers: a server's run line is
started only once this machine has agreed to it, word for word, so opening somebody else's project
runs nothing it wrote.

## How it is laid out

- `src/app` — the Electron application: `main.ts` (the window), `agent-main.ts` (the same backend
  without a window, for `npm run agent`), `backend/` that builds the modules once for both, `ipc/`
  for the channels the two sides speak over, and `renderer/` for the window itself — a thin client
  that shows what the backend pushes.
- `src/modules` — what runs outside the window, one directory per responsibility: `projects` (the
  folder on disk and the registry of the ones opened), `providers` and `secrets` (the keys, in a file encrypted with a
  key the OS keychain holds), `mcp` (the servers and what they hand over), `commands` (a declared line and what
  it printed), `attachments` (the files sent with a question), `llm` (one turn of an agent, and the only
  place LangChain is imported), `walks` (a conversation's walk along the canvas lines, from the
  question to the last answer) and `runs` (the record of every run). The registry and the record live in SQLite through TypeORM;
  `migrations` holds that schema.
- `src/contracts` — what both halves share: every channel's name, the shape of what travels
  through it, and the pure rules both apply. Neither side reaches into the other for a type.
- `src/utils` — what belongs to neither.
- `tests` — the end-to-end suite, run by `test:back`; every other test stands beside the file it is
  about.
- `scripts` — what `package.json` calls: the dev run, the migration CLI, the feature graph.

## Documents

- `OPERATOR.md` — for whoever composes a pipeline: the project file, every field, the system
  commands, the providers, the limits and the usual troubles (in Ukrainian).
- `DESIGN.md` — how the interface looks and behaves, in words over the frames.
- `BACKEND.md` and `FRONTEND.md` — how the code is built: modules, contracts, the renderer.
- `CLAUDE.md` — how work is done in this repository: conventions, checks, commits.
- `TODO.md` — what the built product is still missing.

## Running it

`npm install`, then `npm run dev:app` — the Electron shell with the renderer served by Vite;
`npm run dev:app:watch` restarts it when the main process changes. `npm run typecheck` covers all
three tsconfigs, and `npm run test:back` and `npm run test:front` are the two suites.

`npm run agent -- <project> <agent> "question"` asks one agent of a project without the window: the
project by its name among the recent ones or by its folder, the agent by name or id. The walk goes
along the lines to its end and prints the conversation; the exit code is 0 when it stood whole, 1
when something fell, 2 when the question did not go.

`npm run lint` and `npm run prettier` are what CI would run — `lint` is ESLint followed by
`graph:features`, which draws which subject of the renderer imports which and fails on a ring;
`npm run format` writes what `prettier` checks. A schema change goes through
`npm run migration:generate -- src/modules/migrations/<Name>`, with `migration:run` and
`migration:revert` beside it.

## A local provider to check against

`docker compose up -d` starts Ollama at `http://localhost:11434` — the address the app's provider
card already carries. `docker-compose.yml` says which model to pull and why that one.

## Licence

Copyright © 2026 [Mykhailo Biloshkurskyi](https://www.linkedin.com/in/mykhailo-biloshkurskyi/).
Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) — see `LICENSE`
and `NOTICE`.
