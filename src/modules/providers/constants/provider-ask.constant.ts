/** Where each local provider lists what it has installed, under its own address. */
export const PROVIDER_MODEL_PATHS: Record<string, string> = {
  ollama: "/api/tags",
  lmstudio: "/v1/models",
};
/** How long a provider has to answer before it is taken as not running. */
export const PROVIDER_ASK_TIMEOUT_MS = 2000;
/** Refusal for asking a provider that has no address (a remote one). */
export const PROVIDER_HAS_NO_ADDRESS = "PROVIDER_HAS_NO_ADDRESS";
