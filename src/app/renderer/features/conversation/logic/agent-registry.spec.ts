import { describe, expect, it } from "vitest";
import { agentRegistry } from "./agent-registry";
import { NO_MODEL_NOTE } from "../constants";
import { aConfig, aModel, anAgent } from "../../../testing";
import type { Agent, GrantTargets, ProjectConfig } from "../../../interfaces";

/** An agent named by its id, granted the given agents as tools. */
function granting(id: string, agentIds: string[], patch: Partial<Agent> = {}): Agent {
  return anAgent({
    id,
    name: id,
    tools: agentIds.map((agentId) => ({
      id: `grant-${agentId}`,
      source: "agent" as const,
      agentId,
    })),
    ...patch,
  });
}

function targetsOf(config: ProjectConfig): GrantTargets {
  return {
    commands: config.commands,
    servers: config.servers,
    looks: {},
    agents: config.agents,
  };
}

const CONFIG = aConfig({
  models: [aModel()],
  agents: [
    granting("root", ["middle"]),
    granting("middle", ["leaf", "root"]),
    granting("leaf", []),
    granting("aside", []),
  ],
});

describe("agentRegistry", () => {
  it("reaches every agent through agent grants alone, the root among them, each once", () => {
    const [root] = CONFIG.agents;

    const reached = agentRegistry(root, CONFIG, [], targetsOf(CONFIG));

    expect(reached.map((one) => one.agentId)).toEqual(["root", "middle", "leaf"]);
  });

  it("hands an agent that can run the run its call opens", () => {
    const [root] = CONFIG.agents;

    const [, middle] = agentRegistry(root, CONFIG, [], targetsOf(CONFIG));

    expect(middle).toEqual({
      agentId: "middle",
      name: "middle",
      notReady: null,
      providerId: "openrouter",
      model: "deepseek-v4-flash",
      maxCalls: 8,
      temperature: 0,
      answerCeiling: 4_096,
      systemPrompt: null,
      tools: [
        {
          source: "agent",
          name: "leaf",
          description: "",
          agentId: "leaf",
        },
        {
          source: "agent",
          name: "root",
          description: "",
          agentId: "root",
        },
      ],
    });
  });

  it("says why an agent that cannot run cannot, and carries no run for it", () => {
    const config = aConfig({
      models: [aModel()],
      agents: [
        granting("root", ["lost"]),
        granting("lost", [], {
          modelId: "model-gone",
        }),
      ],
    });
    const [root] = config.agents;

    const [, lost] = agentRegistry(root, config, [], targetsOf(config));

    expect(lost).toEqual({
      agentId: "lost",
      name: "lost",
      notReady: NO_MODEL_NOTE,
    });
  });
});
