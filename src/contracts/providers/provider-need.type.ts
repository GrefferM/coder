/**
 * What a provider asks of the person before anything can be sent to it. Anthropic and OpenRouter ask for a key,
 * Ollama for an address, RunPod for both: the key is the person's, and the address is their own endpoint's.
 */
export type ProviderNeed = "key" | "address";
