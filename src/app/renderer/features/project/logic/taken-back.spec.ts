import { describe, expect, it } from "vitest";
import { withTakenBack } from "./taken-back";
import { nothingTaken, takenBetween } from "./taken-things";
import type { Agent, ProjectConfig, ToolGrant } from "../../../interfaces";
import { aCommand, aConfig, aLink, aPrompt, anAgent } from "../../../testing";

function agent(id: string, name: string): Agent {
  return anAgent({
    id,
    name,
    color: "#b18aff",
    x: 0,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

const CONFIG: ProjectConfig = aConfig({
  prompts: [
    aPrompt({
      name: "Правки коду",
      text: "Ти працюєш у наявному репозиторії.",
    }),
  ],
  commands: [
    aCommand({
      name: "run_tests",
      description: "Прогнати тести",
      run: "npm test",
    }),
  ],
  agents: [
    {
      ...agent("agent-1", "EDITOR"),
      promptId: "prompt-1",
      tools: [
        {
          id: "grant-1",
          source: "command",
          commandId: "command-1",
          pinned: [],
        },
      ],
    },
    agent("agent-2", "REVIEWER"),
  ],
  links: [aLink()],
});

/** What one deletion took, worked out the way the screen works it out. */
function taking(without: ProjectConfig) {
  return takenBetween(CONFIG, without);
}

describe("withTakenBack", () => {
  it("puts an agent back where it stood, with the lines it stood on", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      agents: [CONFIG.agents[0]],
      links: [],
    };

    expect(withTakenBack(without, taking(without))).toEqual(CONFIG);
  });

  it("leaves behind a line whose other end has since gone, and brings back everything else", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      agents: [CONFIG.agents[0]],
      links: [],
    };
    // REVIEWER was deleted, and then EDITOR too: the line between them has nowhere to come back to.
    const alone: ProjectConfig = {
      ...without,
      agents: [],
    };
    const back = withTakenBack(alone, taking(without));

    expect(back.agents.map((one) => one.name)).toEqual(["REVIEWER"]);
    expect(back.links).toEqual([]);
  });

  it("gives a prompt back to the agents that lost it", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      prompts: [],
      agents: CONFIG.agents.map((one) => ({
        ...one,
        promptId: null,
      })),
    };

    expect(withTakenBack(without, taking(without))).toEqual(CONFIG);
  });

  it("gives the grants on a command back with the command", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      commands: [],
      agents: CONFIG.agents.map((one) => ({
        ...one,
        tools: [],
      })),
    };

    expect(withTakenBack(without, taking(without))).toEqual(CONFIG);
  });

  it("brings an agent back holding a grant whose command has gone, which reads as broken rather than vanishing", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      agents: [CONFIG.agents[1]],
      links: [],
    };
    const taken = taking(without);
    const alsoWithoutCommand: ProjectConfig = {
      ...without,
      commands: [],
    };
    const back = withTakenBack(alsoWithoutCommand, taken);

    // The agent comes back as it was — with a grant on nothing, which the sphere marks.
    expect(back.agents.map((one) => one.name)).toEqual(["REVIEWER", "EDITOR"]);
    expect(back.commands).toEqual([]);
    expect(back.agents[1].tools).toEqual(CONFIG.agents[0].tools);
  });

  it("puts nothing back twice, so the same deletion returned again changes nothing", () => {
    const without: ProjectConfig = {
      ...CONFIG,
      agents: [CONFIG.agents[0]],
      links: [],
    };
    const taken = taking(without);
    const once = withTakenBack(without, taken);

    expect(withTakenBack(once, taken)).toEqual(once);
  });

  it("changes nothing at all when a deletion took nothing", () => {
    expect(withTakenBack(CONFIG, nothingTaken())).toEqual(CONFIG);
  });
});

describe("withTakenBack on a server", () => {
  it("puts the server back with the grants that went with it (36i)", () => {
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
    const back = withTakenBack(
      aConfig({
        servers: [],
        agents: [
          anAgent({
            id: "agent-1",
            tools: [],
          }),
        ],
      }),
      {
        ...nothingTaken(),
        servers: [server],
        grantsTakenFrom: [
          {
            agentId: "agent-1",
            grant: held,
          },
        ],
      },
    );

    expect(back.servers).toEqual([server]);
    expect(back.agents[0].tools).toEqual([held]);
  });

  it("leaves a grant out where its server did not come back, as it does for a command", () => {
    const held: ToolGrant = {
      id: "grant-1",
      source: "mcp",
      serverId: "server-gone",
      functionName: "browser_click",
    };
    const back = withTakenBack(
      aConfig({
        servers: [],
        agents: [
          anAgent({
            id: "agent-1",
            tools: [],
          }),
        ],
      }),
      {
        ...nothingTaken(),
        grantsTakenFrom: [
          {
            agentId: "agent-1",
            grant: held,
          },
        ],
      },
    );

    expect(back.agents[0].tools).toEqual([]);
  });
});
