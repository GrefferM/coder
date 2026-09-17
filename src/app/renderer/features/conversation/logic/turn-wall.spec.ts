import { describe, expect, it } from "vitest";
import { turnWall } from "./turn-wall";
import type { Agent, ProjectCommand, ProjectModel, ProjectPrompt } from "../../../interfaces";
import { NO_MCP_CALLS } from "../../../interfaces";
import { aCommand, aModel, aPrompt, anAgent } from "../../../testing";
import type { TurnToAsk } from "../interfaces";

const AGENT: Agent = anAgent({
  name: "ТЕЗАР",
  color: "#b18aff",
  x: 0,
  y: 0,
  maxCalls: 5,
  temperature: 0.3,
});

const MODEL: ProjectModel = aModel({
  title: "claude-sonnet-4.5",
  provider: "anthropic",
  contextCeiling: 200_000,
});

const PROMPT: ProjectPrompt = aPrompt({
  name: "Тезар",
  file: "prompts/tezar.md",
  text: "Ти тезар.",
});

const COMMAND: ProjectCommand = aCommand({
  name: "find_deep",
  description: "Шукає у теці",
  run: "find .",
});

/** One turn as it is asked, with what the case is about patched into it. */
function turn(patch: Partial<TurnToAsk> = {}): TurnToAsk {
  return {
    turnId: "turn-1",
    agent: AGENT,
    stands: {
      model: MODEL,
      provider: null,
      prompt: null,
    },
    asked: "Прогони тести",
    thread: [],
    catalogue: ONLY_COMMANDS,
    directory: "/tmp/coder",
    ...patch,
  };
}

/** What the wall said, named by the word it wears — a turn that never began, or the way through. */
function wall(patch: Partial<Agent> = {}, model: ProjectModel | null = MODEL, prompt: ProjectPrompt | null = null) {
  return turnWall(
    turn({
      agent: {
        ...AGENT,
        ...patch,
      },
      stands: {
        model,
        provider: null,
        prompt,
      },
    }),
  );
}

/** A project that declares this one command and no server at all. */
const ONLY_COMMANDS = {
  commands: [COMMAND],
  servers: [],
  looks: {},
};

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

/** A project that declares one server, and what that server said when it was asked. */
const WITH_SERVER = {
  commands: [COMMAND],
  servers: [
    {
      id: SERVER_ID,
      name: "playwright-mcp",
      isLocal: true,
      run: "npx -y @playwright/mcp@latest",
      address: "",
      signIn: <const>"none",
      env: [],
    },
  ],
  looks: {
    [SERVER_ID]: {
      serverId: SERVER_ID,
      isUp: true,
      functions: [
        {
          name: "browser_click",
          description: "Натиснути",
          parameters: {},
        },
      ],
      answeredAt: 1_700_000_000_000,
      failure: null,
      changedAt: null,
      wasCount: null,
      calls: NO_MCP_CALLS,
    },
  },
};

describe("turnWall", () => {
  it("lets a filled agent through, with what its turn carries to the model", () => {
    const way = wall(
      {
        promptId: "prompt-1",
      },
      MODEL,
      PROMPT,
    );

    expect("notStarted" in way).toBe(false);
    expect("systemPrompt" in way && way.systemPrompt).toBe("Ти тезар.");
  });

  it("stops a turn whose granted function the project has lost", () => {
    // The model would be handed a tool that is not there.
    const stood = wall({
      tools: [
        {
          id: "grant-1",
          source: "command",
          commandId: "command-gone",
          pinned: [],
        },
      ],
    });

    expect("notStarted" in stood && stood.notStarted).toBe("lostFunction");
  });

  it("stands the turn on a granted function the server no longer gives", () => {
    // «хід не йде без функції» — passing it over silently would be another walk under the same question.
    const stood = turnWall(
      turn({
        agent: {
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "mcp",
              serverId: SERVER_ID,
              functionName: "browser_navigate",
            },
          ],
        },
        catalogue: WITH_SERVER,
      }),
    );

    expect("notStarted" in stood && stood.notStarted).toBe("lostFunction");
  });

  it("stands the turn on a grant whose server the project no longer names", () => {
    const stood = turnWall(
      turn({
        agent: {
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "mcp",
              serverId: "server-gone",
              functionName: "fs.write_file",
            },
          ],
        },
        catalogue: WITH_SERVER,
      }),
    );

    expect("notStarted" in stood && stood.notStarted).toBe("lostFunction");
  });

  it("lets the turn through while the server has not answered yet", () => {
    // A starting server's functions are unknown this moment, not gone, and a grant on it is whole.
    const way = turnWall(
      turn({
        agent: {
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "mcp",
              serverId: SERVER_ID,
              functionName: "browser_navigate",
            },
          ],
        },
        catalogue: {
          ...WITH_SERVER,
          looks: {},
        },
      }),
    );

    expect("notStarted" in way).toBe(false);
  });

  it("stops a turn whose prompt the project has lost", () => {
    const stood = wall({
      promptId: "prompt-gone",
    });

    expect("notStarted" in stood && stood.notStarted).toBe("lostPrompt");
  });

  it("stops a turn whose agent is missing a number of its own", () => {
    const stood = wall({
      maxCalls: null,
    });

    expect("notStarted" in stood && stood.notStarted).toBe("notFilledAgent");
  });

  it("stops a turn with no model at all", () => {
    const stood = wall({}, null);

    expect("notStarted" in stood && stood.notStarted).toBe("noModel");
  });

  it("stops a turn whose model is missing a number, the prices among them", () => {
    const stood = turnWall(
      turn({
        stands: {
          model: {
            ...MODEL,
            inputPrice: null,
          },
          provider: null,
          prompt: null,
        },
      }),
    );

    expect("notStarted" in stood && stood.notStarted).toBe("notFilled");
  });

  it("stops a turn longer than the model's own ceiling, and says how long it would have been", () => {
    // Over the ceiling nothing goes at all.
    const stood = turnWall(
      turn({
        stands: {
          model: {
            ...MODEL,
            contextCeiling: 10,
          },
          provider: null,
          prompt: null,
        },
        asked: "Прогони тести довго",
      }),
    );

    expect("notStarted" in stood && stood.notStarted).toBe("tooLong");
    expect("wouldGo" in stood && stood.wouldGo).not.toBeNull();
  });
});
