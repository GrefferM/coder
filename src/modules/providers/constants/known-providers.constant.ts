import type { KnownProvider } from "../interfaces";

/** The known providers, in the order they are offered, local ones last. */
export const KNOWN_PROVIDERS: KnownProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
  },
  {
    id: "openai",
    name: "OpenAI",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
  },
  {
    id: "google",
    name: "Google",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
  },
  {
    /**
     * Someone else's machine, but the address is the person's own: a serverless endpoint carries its id in the
     * path, so a key alone says nothing about where to knock. Asked for both, and pinged like no remote one is.
     */
    id: "runpod",
    name: "RunPod",
    kind: "remote",
    needs: ["key", "address"],
    // Its queue carries a conversation and nothing else: there is no way to hand a function to the model.
    takesTools: false,
    customaryAddress: null,
  },
  {
    id: "ollama",
    name: "Ollama",
    kind: "local",
    needs: ["address"],
    takesTools: true,
    customaryAddress: "http://localhost:11434",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    kind: "local",
    needs: ["address"],
    takesTools: true,
    customaryAddress: "http://localhost:1234",
  },
];
