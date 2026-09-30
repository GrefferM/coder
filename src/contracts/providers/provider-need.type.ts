/**
 * What a provider asks of the person before anything can be sent: Anthropic and OpenRouter a key, Ollama an address,
 * RunPod both.
 */
export type ProviderNeed = "key" | "address";
