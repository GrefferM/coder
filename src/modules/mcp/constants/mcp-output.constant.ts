/** What is handed back when a function answered with nothing at all. */
export const MCP_EMPTY_OUTPUT_NOTE = "[функція нічого не повернула]";
/** What is handed back when the call itself did not happen — the server fell, or never knew the function. */
export const MCP_FAILED_PREFIX = "[функція не виконалась]";
/**
 * A server may answer with a picture, a sound or a whole resource. Nothing that reaches a model here is anything
 * but text, so such a part is named rather than dropped: the model is told something came and what kind it was.
 */
export const MCP_NOT_TEXT_NOTE = "[частина відповіді не текст · {kind}]";
export const MCP_KIND_SLOT = "{kind}";
