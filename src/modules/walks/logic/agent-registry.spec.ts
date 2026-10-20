import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentRegistry } from "./agent-registry";
import { NO_MODEL_NOTE } from "../../../contracts";
import { aConfig, aModel, anAgent } from "../../../utils/testing";
import type { Agent, GrantTargets, ProjectConfig } from "../../../contracts";

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

    assert.deepEqual(
      reached.map((one) => one.agentId),
      ["root", "middle", "leaf"],
    );
  });

  it("hands an agent that can run the run its call opens", () => {
    const [root] = CONFIG.agents;

    const [, middle] = agentRegistry(root, CONFIG, [], targetsOf(CONFIG));

    assert.deepEqual(middle, {
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
      memory: "own",
      // How far it is compressed, and what its model costs: the composer's call is paid at those.
      compressAt: 90,
      compressTo: 10,
      contextCeiling: 700_000,
      inputPrice: 3,
      outputPrice: 15,
    });
  });

  it("hands on how an agent remembers, since called as a tool it reads the shared memory only where that is its own", () => {
    const config = aConfig({
      models: [aModel()],
      agents: [
        granting("root", ["leaf"]),
        granting("leaf", [], {
          memory: "shared",
        }),
      ],
    });
    const [root] = config.agents;

    const [, leaf] = agentRegistry(root, config, [], targetsOf(config));

    assert.partialDeepStrictEqual(leaf, {
      memory: "shared",
    });
  });

  it("names no threshold or target for an agent without memory, since it has nothing to compress", () => {
    const config = aConfig({
      models: [aModel()],
      agents: [
        granting("root", ["leaf"]),
        granting("leaf", [], {
          memory: "none",
        }),
      ],
    });
    const [root] = config.agents;

    const [, leaf] = agentRegistry(root, config, [], targetsOf(config));

    assert.equal("compressAt" in leaf, false);
    assert.equal("compressTo" in leaf, false);
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

    assert.deepEqual(lost, {
      agentId: "lost",
      name: "lost",
      notReady: NO_MODEL_NOTE,
    });
  });
});
