/** IPC channel a renderer calls to ask a local provider whether it answers and what it has installed. */
export const ASK_PROVIDER_CHANNEL = "providers:ask";

/** IPC channel a renderer calls for the known providers and what this machine holds for each. */
export const LIST_PROVIDERS_CHANNEL = "providers:list";

/** IPC channel a renderer calls to write a local provider's address. */
export const SAVE_PROVIDER_ADDRESS_CHANNEL = "providers:save-address";

/** Writing a remote provider's key, or emptying it away. */
export const SAVE_PROVIDER_KEY_CHANNEL = "providers:save-key";
