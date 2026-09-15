/**
 * What the main process refuses a turn with, in the words both sides read. The renderer never imports
 * `src/modules` by value, so a code written there and matched here would be two constants agreeing until the
 * day one of them is corrected — the same reason the MCP refusals stand beside this one.
 */

/** The provider is known and this machine holds no key for it. */
export const LLM_NO_KEY = "LLM_NO_KEY";
/** A local provider with nothing written in its address field, and no customary one to fall back on. */
export const LLM_NO_ADDRESS = "LLM_NO_ADDRESS";
/** A local provider that did not answer at its address; the words never left the machine. */
export const LLM_PROVIDER_SILENT = "LLM_PROVIDER_SILENT";
/** A provider the app knows by name and has no client for yet. */
export const LLM_PROVIDER_NOT_BUILT = "LLM_PROVIDER_NOT_BUILT";
