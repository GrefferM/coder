/**
 * The end words a step carries when nothing came back to the person: the turn never began and nothing was sent,
 * or the words went and came back empty. The history puts both under «НЕ ПІШОВ», against «УПАВ» for a turn that
 * was sent and broke.
 *
 * Both sides hold this list — the renderer writes these words into the record, the reader counts the row's state
 * by them — so it lives here, where neither owns it, and a spec over `NOT_STARTED_ENDS` keeps the two together.
 */
export const RUN_STEP_NOT_SENT_ENDS: string[] = [
  "noKey",
  "noModel",
  "noProvider",
  "noAddress",
  "notFilled",
  "notFilledAgent",
  "lostFunction",
  // The provider's protocol carries no function calls, and the agent holds grants all the same.
  "noTools",
  "lostPrompt",
  "tooLong",
  // A provider that never answered at its address; the words never left the machine.
  "unreachable",
  // The turn ran whole and the model came back with nothing.
  "silent",
];
