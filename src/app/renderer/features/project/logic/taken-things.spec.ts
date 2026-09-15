import { describe, expect, it } from "vitest";
import { nothingTaken, takenBetween } from "./taken-things";
import type { Agent, ProjectConfig, ToolGrant } from "../../../interfaces";
import { aConfig, aLink, anAgent } from "../../../testing";

function grant(id: string): ToolGrant {
  return {
    id,
    source: "command",
    commandId: `command-${id}`,
    pinned: [],
  };
}

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    name: "ТЕЗАР",
    color: "#b18aff",
    x: 0,
    y: 0,
    ...patch,
  });
}

function config(patch: Partial<ProjectConfig> = {}): ProjectConfig {
  return aConfig({
    ...patch,
  });
}

describe("nothingTaken", () => {
  it("takes nothing, in every list it knows", () => {
    expect(Object.values(nothingTaken()).every((taken) => taken.length === 0)).toBe(true);
  });
});

describe("takenBetween", () => {
  it("counts what the older config holds and the newer one does not", () => {
    const gone = agent({
      id: "agent-2",
      name: "СТИСЛЯР",
    });
    const taken = takenBetween(
      config({
        agents: [agent(), gone],
        links: [aLink()],
      }),
      config({
        agents: [agent()],
      }),
    );

    expect(taken.agents).toEqual([gone]);
    expect(taken.links.map((link) => link.id)).toEqual(["link-1"]);
  });

  it("counts nothing where the two configs hold the same things", () => {
    const taken = takenBetween(
      config({
        agents: [agent()],
      }),
      config({
        agents: [agent()],
      }),
    );

    expect(taken.agents).toEqual([]);
    expect(taken.promptTakenFrom).toEqual([]);
    expect(taken.grantsTakenFrom).toEqual([]);
  });

  it("says a staying agent lost its prompt, which is not the same as the prompt being gone", () => {
    const taken = takenBetween(
      config({
        agents: [
          agent({
            promptId: "prompt-1",
          }),
        ],
      }),
      config({
        agents: [agent()],
      }),
    );

    // The prompt itself never stood in the library here — what went is the agent's hold on it.
    expect(taken.prompts).toEqual([]);
    expect(taken.promptTakenFrom).toEqual([
      {
        agentId: "agent-1",
        promptId: "prompt-1",
      },
    ]);
  });

  it("says a staying agent lost a granted function, naming the grant itself", () => {
    const kept = grant("grant-1");
    const gone = grant("grant-2");
    const taken = takenBetween(
      config({
        agents: [
          agent({
            tools: [kept, gone],
          }),
        ],
      }),
      config({
        agents: [
          agent({
            tools: [kept],
          }),
        ],
      }),
    );

    expect(taken.grantsTakenFrom).toEqual([
      {
        agentId: "agent-1",
        grant: gone,
      },
    ]);
  });

  it("counts an agent that went whole once, and not its grants a second time", () => {
    // The agent is in `agents`; listing its grants again would offer to put back what has no owner.
    const taken = takenBetween(
      config({
        agents: [
          agent({
            tools: [grant("grant-1")],
            promptId: "prompt-1",
          }),
        ],
      }),
      config(),
    );

    expect(taken.agents).toHaveLength(1);
    expect(taken.grantsTakenFrom).toEqual([]);
    expect(taken.promptTakenFrom).toEqual([]);
  });
});

describe("takenBetween on a server", () => {
  it("takes the server and the grants on it, so the undo can hand both back (36i)", () => {
    const server = {
      id: "server-1",
      name: "playwright-mcp",
      isLocal: true,
      run: "npx -y @playwright/mcp@latest",
      address: "",
      signIn: <const>"none",
      env: [],
    };
    const held: ToolGrant = {
      id: "grant-1",
      source: "mcp",
      serverId: "server-1",
      functionName: "browser_click",
    };
    const previous = aConfig({
      servers: [server],
      agents: [
        anAgent({
          id: "agent-1",
          tools: [held],
        }),
      ],
    });
    const without = aConfig({
      servers: [],
      agents: [
        anAgent({
          id: "agent-1",
          tools: [],
        }),
      ],
    });

    const taken = takenBetween(previous, without);

    expect(taken.servers).toEqual([server]);
    expect(taken.grantsTakenFrom).toEqual([
      {
        agentId: "agent-1",
        grant: held,
      },
    ]);
  });

  it("holds no server where none went", () => {
    expect(nothingTaken().servers).toEqual([]);
  });
});
