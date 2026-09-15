# Coder

An AI platform for automated code development, built around agents. The user places agents on a
canvas, connects them with directed links, and runs work through the graph — assigning models of
different cost and capability to each one, and granting each the tools it may call.

A project is a folder on disk: it travels with the repository, so an automation can be committed and
shared like any other code.

Early — both halves are being built right now.

## How it is laid out

- `src/app` — the Electron application: `main.ts` and the services behind it, `ipc/` for the
  channels the two sides speak over, and `renderer/` for the window itself.
- `src/modules` — what runs outside the window, one directory per responsibility: `projects` (the
  folder on disk and the registry of the ones opened), `providers` and `secrets` (the keys, in the
  OS keychain), `mcp` (the servers and what they hand over), `commands` (a declared line and what
  it printed), `llm` (one turn of an agent, and the only place LangChain is imported), and `runs`
  (the record of every run). The registry and the record live in SQLite through TypeORM;
  `migrations` holds that schema.
- `src/contracts` — the words both halves share: every channel's name and the shape of what
  travels through it. Neither side reaches into the other for a type.
- `src/utils` — what belongs to neither.
- `tests` — the end-to-end suite, run by `test:back`; every other test stands beside the file it is
  about.
- `scripts` — what `package.json` calls: the dev run, the migration CLI, the feature graph.

## Running it

`npm install`, then `npm run dev:app` — the Electron shell with the renderer served by Vite;
`npm run dev:app:watch` restarts it when the main process changes. `npm run typecheck` covers all
three tsconfigs, and `npm run test:back` and `npm run test:front` are the two suites.

`npm run lint` and `npm run prettier` are what CI would run — `lint` is ESLint followed by
`graph:features`, which draws which subject of the renderer imports which and fails on a ring;
`npm run format` is `prettier` with a pen. A schema change goes through
`npm run migration:generate -- src/modules/migrations/<Name>`, with `migration:run` and
`migration:revert` beside it.

## A local provider to check against

`docker compose up -d` starts Ollama at `http://localhost:11434` — the address the app's provider
card already carries. `docker-compose.yml` says which model to pull and why that one.

## Licence

Copyright © 2026 [Mykhailo Biloshkurskyi](https://www.linkedin.com/in/mykhailo-biloshkurskyi/).
All rights reserved — see `LICENSE`.
