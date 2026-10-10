/** Where a call stands: out, refused before it ran, over, or answered «ні» by a server. */
export const RUN_CALL_RUNNING = "running";
export const RUN_CALL_RAN = "ran";
export const RUN_CALL_REFUSED = "refused";
/** A server answered «ні»: it ran, so not refused, and has no exit code, so not ran. */
export const RUN_CALL_SAID_NO = "saidNo";
