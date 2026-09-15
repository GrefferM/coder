/**
 * How a flow stands — counted from its last turn on every read and never kept in the record.
 *
 * The word travels: the reader counts the row's state by it and the screen names it. It is written here, where
 * neither side owns it, because two declarations of one word agree until the day one of them is corrected.
 */

/** A run that has not ended yet. */
export const RUN_RUNNING = "running";
export const RUN_DONE = "done";
export const RUN_FAILED = "failed";
export const RUN_STOPPED = "stopped";
/** Nothing was sent, or nothing came back — a fall is a turn that went and broke, not this. */
export const RUN_NOT_SENT = "notSent";
