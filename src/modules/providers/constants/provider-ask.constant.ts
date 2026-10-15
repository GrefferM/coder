/** Where each local provider lists its installed models, under its own address. */
export const PROVIDER_MODEL_PATHS: Record<string, string> = {
  ollama: "/api/tags",
  lmstudio: "/v1/models",
};
/** Time a provider has to answer before it counts as not running. */
export const PROVIDER_ASK_TIMEOUT_MS = 2000;
/** Refusal for asking a local provider that has no address. */
export const PROVIDER_HAS_NO_ADDRESS = "PROVIDER_HAS_NO_ADDRESS";
