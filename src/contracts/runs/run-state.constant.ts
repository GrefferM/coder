/** How a flow stands, counted from its last turn on every read and never stored. */

/** A run that has not ended yet. */
export const RUN_RUNNING = "running";
export const RUN_DONE = "done";
export const RUN_FAILED = "failed";
export const RUN_STOPPED = "stopped";
/** Nothing was sent, or nothing came back; a turn that went and broke is a fall, not this. */
export const RUN_NOT_SENT = "notSent";
