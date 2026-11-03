/** Asks a local provider whether it answers and what it has installed. */
export const ASK_PROVIDER_CHANNEL = "providers:ask";

/** The known providers and what this machine holds for each. */
export const LIST_PROVIDERS_CHANNEL = "providers:list";

/** Writes the address of a provider that needs one (a local one, or RunPod); empty removes it. */
export const SAVE_PROVIDER_ADDRESS_CHANNEL = "providers:save-address";

/** Turns a provider off on this machine, or back on; its key and address stay as they are. */
export const SWITCH_PROVIDER_CHANNEL = "providers:switch";

/** Writes a remote provider's key; empty removes it. */
export const SAVE_PROVIDER_KEY_CHANNEL = "providers:save-key";
