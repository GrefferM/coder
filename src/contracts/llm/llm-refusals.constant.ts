/** The codes the main process refuses a turn with; `MACHINE_WALLS` ties each to the card it draws. */

/** The provider is known and this machine holds no key for it. */
export const LLM_NO_KEY = "LLM_NO_KEY";
/** A local provider with no address written and no default to fall back on. */
export const LLM_NO_ADDRESS = "LLM_NO_ADDRESS";
/** A local provider that did not answer at its address; nothing left the machine. */
export const LLM_PROVIDER_SILENT = "LLM_PROVIDER_SILENT";
/** A provider the app knows by name and has no client for yet. */
export const LLM_PROVIDER_NOT_BUILT = "LLM_PROVIDER_NOT_BUILT";
