import type { KnownProvider } from "../interfaces";

/** The known providers, in the order they are offered, local ones last. */
export const KNOWN_PROVIDERS: KnownProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    customaryAddress: null,
  },
  {
    id: "openai",
    name: "OpenAI",
    kind: "remote",
    customaryAddress: null,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    kind: "remote",
    customaryAddress: null,
  },
  {
    id: "google",
    name: "Google",
    kind: "remote",
    customaryAddress: null,
  },
  {
    id: "ollama",
    name: "Ollama",
    kind: "local",
    customaryAddress: "http://localhost:11434",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    kind: "local",
    customaryAddress: "http://localhost:1234",
  },
];
