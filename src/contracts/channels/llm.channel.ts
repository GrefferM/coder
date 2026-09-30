/** A piece of an answer, sent from main to renderer while the rest is still coming. */
export const AGENT_CHUNK_CHANNEL = "llm:chunk";

/** One chat turn of an agent, asked of the model the agent stands on. */
export const ASK_AGENT_CHANNEL = "llm:ask";

/** «ЗУПИНИТИ»: ending a turn that is still out. */
export const STOP_AGENT_CHANNEL = "llm:stop";
