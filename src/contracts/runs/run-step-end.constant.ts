/** How one agent's turn ended; each end has its own word. */
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
 * The ends of a turn that actually ran; a step with any other end never began, so it has no duration, tokens or cost.
 */
export const RUN_STEP_RAN_ENDS: string[] = [
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_STOPPED,
  RUN_STEP_SILENT,
  RUN_STEP_CEILING,
  RUN_STEP_CALLS,
];
