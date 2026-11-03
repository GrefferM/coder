import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentStands } from "./agent-stands";
import { aConfig, aModel, aPrompt, anAgent } from "../testing";
import type { ProviderState } from "../providers";

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-…f31a",
  address: null,
  isOff: false,
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

    assert.equal(stands.model?.id, "model-1");
    assert.equal(stands.prompt?.id, "prompt-1");
    assert.equal(stands.provider?.id, "openrouter");
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

    assert.equal(stands.prompt, null);
    assert.equal(stands.model?.id, "model-1");
  });

  it("loses the provider with the model, since the provider is found through it", () => {
    const stands = agentStands(
      anAgent({
        modelId: "model-gone",
      }),
      CONFIG,
      [OPENROUTER],
    );

    assert.equal(stands.model, null);
    assert.equal(stands.provider, null);
  });

  it("keeps the model when the machine holds no such provider", () => {
    // A model that is gone and a provider that is not set up are different troubles.
    const stands = agentStands(AGENT, CONFIG, []);

    assert.equal(stands.model?.id, "model-1");
    assert.equal(stands.provider, null);
  });

  it("goes by id and never by name, however alike the names are", () => {
    const stands = agentStands(
      anAgent({
        modelId: "model-1",
        promptId: "prompt-1",
      }),
      aConfig({
        // Words match what the agent asks for but the ids do not; only ids count.
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

    assert.equal(stands.model, null);
    assert.equal(stands.prompt, null);
  });
});
