# TODO

What the built product lacks, each with why it matters. A change that leaves a gap adds its line in
the same commit; the change that closes it removes the line.

## Defects in what stands

- Counting a large folder at «+ ПРИКРІПИТИ» and packing one at send take seconds, and nothing on the
  screen says so meanwhile; the frame has no state drawn for either.
- A long call output is shown whole: frame 24b's fold — the first two hundred lines, the rest under
  «показати повністю», and «скопіювати все» taking the whole of it — is not built.
- Sound is drawn and not built: the running wave while a question is recorded and the recording
  as a chip under the field (4j), the word being read lit in the answer (4k), and the person's own
  recording kept with the question and played back on their card (4l).
- An agent whose model is a recognition model, written so by hand in `project.yaml`, is not stopped
  at its start: the picker never offers one, but nothing in `agentReadiness` refuses it, and its
  turn goes to the provider's chat as if the model could talk.

## Outside the consent to start a server (36k)

- A project's own commands (`commands/*.yaml`) run their lines with no consent asked, though a
  command's line is the project author's as much as a server's is.
- A consent once given cannot be taken back from the app: nothing lists what this machine agreed to,
  and only a changed line or a deleted database forgets it.
- The command line cannot give consent: `npm run agent` ends a turn `noConsent`, and the person opens
  the window to agree.

## Limits

- An agent cannot ask the person a question while it runs: there is no built-in tool for it, so a
  turn can only answer.
