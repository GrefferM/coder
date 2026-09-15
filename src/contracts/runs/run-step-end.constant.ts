/**
 * How one agent's turn ended; each end keeps its own word. The main process writes it into the record and the
 * renderer reads it back, so the word is one and stands here.
 */
export const RUN_STEP_DONE = "done";
export const RUN_STEP_FAILED = "failed";
export const RUN_STEP_STOPPED = "stopped";
/** The model came back with nothing at all. */
export const RUN_STEP_SILENT = "silent";
/** The answer ran into the ceiling on its length. */
export const RUN_STEP_CEILING = "ceiling";
/** The turn used up the calls the person allowed it. */
export const RUN_STEP_CALLS = "calls";
/** The words were longer than the model takes, so nothing went. */
export const RUN_STEP_TOO_LONG = "tooLong";

/**
 * The ends of a turn that actually ran. The list is closed, and a step whose end is not in it never began
 * — the words never left, so it has no duration, no tokens and nothing spent.
 */
export const RUN_STEP_RAN_ENDS: string[] = [
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_STOPPED,
  RUN_STEP_SILENT,
  RUN_STEP_CEILING,
  RUN_STEP_CALLS,
];
