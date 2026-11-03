import type { KnownProvider } from "../interfaces";

/** The known providers in offering order, local ones last. */
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
    /** The OpenCode Go subscription: many vendors' models behind one key. */
    id: "opencode",
    name: "OpenCode Go",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
  },
  {
    /** Remote, yet asked for both key and address (a serverless endpoint carries its id in the path); never pinged. */
    id: "runpod",
    name: "RunPod Queue",
    kind: "remote",
    needs: ["key", "address"],
    // Its queue carries a conversation only; functions cannot be handed to the model.
    takesTools: false,
    customaryAddress: null,
  },
  {
    /** The same endpoint over the OpenAI protocol it serves; functions go as far as the endpoint turns them on. */
    id: "runpod-openai",
    name: "RunPod OpenAI",
    kind: "remote",
    needs: ["key", "address"],
    takesTools: true,
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
