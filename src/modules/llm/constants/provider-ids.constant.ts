export const ANTHROPIC_PROVIDER_ID = "anthropic";
export const OPENAI_PROVIDER_ID = "openai";
export const OPENROUTER_PROVIDER_ID = "openrouter";
export const GOOGLE_PROVIDER_ID = "google";
export const OPENCODE_PROVIDER_ID = "opencode";
/** A RunPod serverless endpoint reached through its queue (`/run`, then `/status`). */
export const RUNPOD_QUEUE_PROVIDER_ID = "runpod";
/** The same kind of endpoint reached through the OpenAI protocol it serves. */
export const RUNPOD_OPENAI_PROVIDER_ID = "runpod-openai";
export const OLLAMA_PROVIDER_ID = "ollama";
export const LMSTUDIO_PROVIDER_ID = "lmstudio";

/** LM Studio's client requires a key it never checks. */
export const LMSTUDIO_ANY_KEY = "lmstudio";
/** The path OpenAI's protocol lives under, kept by local servers that serve it. */
export const OPENAI_PROTOCOL_PATH = "/v1";
/** The path a RunPod endpoint serves OpenAI's protocol under, below the endpoint's own root. */
export const RUNPOD_OPENAI_PROTOCOL_PATH = "/openai/v1";
