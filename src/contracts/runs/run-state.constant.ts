/** How a flow stands, counted from every turn of its last walk on each read and never stored. */

export const RUN_RUNNING = "running";
export const RUN_DONE = "done";
export const RUN_FAILED = "failed";
export const RUN_STOPPED = "stopped";
/** Nothing was sent, or nothing came back; a turn that went and broke is a fall, not this. */
export const RUN_NOT_SENT = "notSent";
