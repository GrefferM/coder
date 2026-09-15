import { describe, expect, it } from "vitest";
import { agentStands } from "./agent-stands";
import { aConfig, aModel, aPrompt, anAgent } from "../../../testing";
import type { ProviderState } from "../../../interfaces";

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  customaryAddress: null,
  keyHint: "sk-…f31a",
  address: null,
};

const AGENT = anAgent({
  modelId: "model-1",
  promptId: "prompt-1",
});

const CONFIG = aConfig({
  models: [
    aModel({
      id: "model-1",
      provider: "openrouter",
    }),
  ],
  prompts: [
    aPrompt({
      id: "prompt-1",
    }),
  ],
  agents: [AGENT],
});

describe("agentStands", () => {
  it("finds the model, the prompt and the provider the model names", () => {
    const stands = agentStands(AGENT, CONFIG, [OPENROUTER]);

    expect(stands.model?.id).toBe("model-1");
    expect(stands.prompt?.id).toBe("prompt-1");
    expect(stands.provider?.id).toBe("openrouter");
  });

  it("leaves the prompt empty for an agent that names none", () => {
    // A bare model is a whole agent, not a broken one.
    const stands = agentStands(
      anAgent({
        promptId: null,
      }),
      CONFIG,
      [OPENROUTER],
    );

    expect(stands.prompt).toBeNull();
    expect(stands.model?.id).toBe("model-1");
  });

  it("loses the provider with the model, since the provider is found through it", () => {
    const stands = agentStands(
      anAgent({
        modelId: "model-gone",
      }),
      CONFIG,
      [OPENROUTER],
    );

    expect(stands.model).toBeNull();
    expect(stands.provider).toBeNull();
  });

  it("keeps the model when the machine holds no such provider", () => {
    // The two are different troubles: a model that went and a provider that is not set up.
    const stands = agentStands(AGENT, CONFIG, []);

    expect(stands.model?.id).toBe("model-1");
    expect(stands.provider).toBeNull();
  });

  it("goes by id and never by name, however alike the names are", () => {
    const stands = agentStands(
      anAgent({
        modelId: "model-1",
        promptId: "prompt-1",
      }),
      aConfig({
        // The words match what the agent asks for; the ids do not, and only the ids count.
        models: [
          aModel({
            id: "model-9",
            title: "model-1",
          }),
        ],
        prompts: [
          aPrompt({
            id: "prompt-9",
            name: "prompt-1",
          }),
        ],
      }),
      [OPENROUTER],
    );

    expect(stands.model).toBeNull();
    expect(stands.prompt).toBeNull();
  });
});
