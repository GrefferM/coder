/** Where a call stands: out, refused before it ran, over, or answered «ні» by a server. */
export const RUN_CALL_RUNNING = "running";
export const RUN_CALL_RAN = "ran";
export const RUN_CALL_REFUSED = "refused";
/** A server answered «ні»: it ran, so not refused, and has no exit code, so not ran. */
export const RUN_CALL_SAID_NO = "saidNo";
/** A call stopped by hand. */
export const RUN_CALL_STOPPED = "stopped";

/** The ends of one call: refused, ran to an exit code, stopped by hand, or said no by a server. */
export const RUN_CALL_ENDS: string[] = [RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_STOPPED, RUN_CALL_SAID_NO];
