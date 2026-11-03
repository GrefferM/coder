# TODO

What is left. A change that skips something adds a line here in the same commit; a change that does
it removes the line. Nothing beyond the built product is planned.

## Defects in what stands

Each is a thing the app does wrong today, not a plan; each leaves when it is fixed.

- Counting a large folder at «+ ПРИКРІПИТИ» and packing one at send take seconds, and nothing on the
  screen says so meanwhile; the frame has no state drawn for either.
- A long call output is shown whole: frame 24b's fold — the first two hundred lines, the rest under
  «показати повністю», and «скопіювати все» taking the whole of it — is not built.

## Left outside the consent to start a server (36k)

- A project's own commands (`commands/*.yaml`) run their lines with no consent asked: the line is the
  project author's as much as a server's is, and the same window should stand before its first run on
  this machine.
- A consent once given cannot be taken back from the app: nothing lists what this machine agreed to,
  and only a changed line or a deleted database forgets it.
- The command line cannot give consent: `npm run agent` ends a turn `noConsent` and the person has to
  open the window to agree; there is no flag for it.

## Parked

- An agent cannot ask the person a question while it runs: no built-in tool for it exists, so a turn
  can only answer. Left for later by decision.
