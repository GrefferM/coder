/**
 * End words of a step when nothing came back to the person: never began and nothing sent, or sent and came back empty.
 * The history shows both as «НЕ ПІШОВ», against «УПАВ» for a turn that was sent and broke.
 */
export const RUN_STEP_NOT_SENT_ENDS: string[] = [
  "noKey",
  "noModel",
  "noProvider",
  "noAddress",
  "notFilled",
  "notFilledAgent",
  "lostFunction",
  // The provider's protocol carries no function calls, yet the agent holds grants.
  "noTools",
  "lostPrompt",
  "tooLong",
  // A provider that never answered at its address; nothing left the machine.
  "unreachable",
  // The turn ran whole and the model came back with nothing.
  "silent",
];
