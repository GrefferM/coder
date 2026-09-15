/**
 * Where a call stands — out, refused before it ran, over, or answered «ні» by a server. The main process sets
 * the word and the card reads it, so it is written once here.
 */
export const RUN_CALL_RUNNING = "running";
export const RUN_CALL_RAN = "ran";
export const RUN_CALL_REFUSED = "refused";
/** A server answered «ні» — it ran, so it is not «refused», and there is no code, so it is not «ran». */
export const RUN_CALL_SAID_NO = "saidNo";
/** A call stopped by hand. The record takes the word; nothing in the app reaches this end yet. */
export const RUN_CALL_STOPPED = "stopped";

/**
 * The ends of one call — refused before it ran, ran to an exit code, stopped by hand, or asked
 * of a server that said no.
 */
export const RUN_CALL_ENDS: string[] = [RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_STOPPED, RUN_CALL_SAID_NO];
