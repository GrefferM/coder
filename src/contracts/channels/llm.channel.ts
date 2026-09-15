/** A piece of an answer, sent from the main process to the renderer while the rest is still coming. */
export const AGENT_CHUNK_CHANNEL = "llm:chunk";

/** One turn of an agent's chat, asked of the model the agent stands on. */
export const ASK_AGENT_CHANNEL = "llm:ask";

/** «ЗУПИНИТИ»: ending a turn that is still out. */
export const STOP_AGENT_CHANNEL = "llm:stop";
