import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { turnWall } from "./turn-wall";
import { KNOWN_PROVIDERS } from "../../providers";
import { NO_MCP_CALLS, groupedNumber } from "../../../contracts";
import { aCommand, aModel, aPrompt, anAgent } from "../../../utils/testing";
import type { Agent, ProjectCommand, ProjectModel, ProjectPrompt, ToolGrant, TurnToAsk } from "../../../contracts";

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

/** One turn as it is asked, with the case's fields patched in. */
/** A project declaring this one command and no server. */
const ONLY_COMMANDS = {
  commands: [COMMAND],
  agents: [],
  servers: [],
  looks: {},
};

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
    memory: {
      thread: [],
      composed: "",
      shared: "",
      covers: 0,
    },
    catalogue: ONLY_COMMANDS,
    agents: [],
    followers: [],
    directory: "/tmp/coder",
    runId: "run-1",
    questionId: "question-1",
    ...patch,
  };
}

/** What the wall said, by its word: a turn that never began, or the way through. */
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

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

/** A project declaring one server, and what that server said when asked. */
const WITH_SERVER = {
  commands: [COMMAND],
  agents: [],
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

    assert.equal("notStarted" in way, false);
    assert.equal("systemPrompt" in way && way.systemPrompt, "Ти тезар.");
  });

  it("counts the thread against the ceiling and lets nothing go when it is over, cutting nothing", () => {
    // A ceiling of 20: the question «Прогони тести» takes 13 and the thread 16 more.
    const way = turnWall(
      turn({
        // With the memory off there is nothing to compress, so a memory over the ceiling is a wall.
        agent: {
          ...AGENT,
          memory: "none",
        },
        stands: {
          model: aModel({
            contextCeiling: 20,
          }),
          provider: null,
          prompt: null,
        },
        memory: {
          thread: [
            {
              from: "person",
              text: "старе питання",
            },
            {
              from: "agent",
              text: "так",
            },
          ],
          composed: "",
          shared: "",
          covers: 0,
        },
      }),
    );

    assert.equal("notStarted" in way && way.notStarted, "tooLong");
    assert.deepEqual("wouldGo" in way && way.wouldGo, {
      prompt: 0,
      asked: 13,
      memory: 16,
      total: 29,
      ceiling: 20,
    });
  });

  it("counts the shared memory against the ceiling the same way, and lets nothing go when it is over", () => {
    // A ceiling of 20: the question takes 13 and the shared memory 11 more.
    const way = turnWall(
      turn({
        // With the memory off there is nothing to compress, so a memory over the ceiling is a wall.
        agent: {
          ...AGENT,
          memory: "none",
        },
        stands: {
          model: aModel({
            contextCeiling: 20,
          }),
          provider: null,
          prompt: null,
        },
        memory: {
          thread: [],
          composed: "",
          shared: "ПАМ'ЯТЬ:\nА\n",
          covers: 0,
        },
      }),
    );

    assert.deepEqual("wouldGo" in way && way.wouldGo, {
      prompt: 0,
      asked: 13,
      memory: 11,
      total: 24,
      ceiling: 20,
    });
  });

  describe("a memory that is kept", () => {
    const CEILING = 10_000;

    function kept(memoryLength: number, patch: Partial<TurnToAsk> = {}) {
      return turnWall(
        turn({
          stands: {
            model: aModel({
              contextCeiling: CEILING,
            }),
            provider: null,
            prompt: null,
          },
          memory: {
            thread: [
              {
                from: "person",
                text: "а".repeat(memoryLength),
              },
            ],
            composed: "",
            shared: "",
            covers: 3,
          },
          ...patch,
        }),
      );
    }

    it("goes as it stands while the turn is under the agent's threshold", () => {
      const way = kept(8_000);

      assert.equal("notStarted" in way, false);
      assert.equal("compression" in way && way.compression, null);
    });

    it("is compressed first once the turn reaches the threshold, into the target's share of the ceiling", () => {
      const way = kept(9_100);

      assert.equal("notStarted" in way, false);
      // The agent compresses at 90 percent down to 10: a thousand of ten thousand.
      assert.deepEqual("compression" in way && way.compression, {
        budget: 1_000,
        at: 90,
        to: 10,
      });
    });

    it("compresses a memory however long it is, and is never a wall for the person to mend", () => {
      const way = kept(50_000);

      assert.equal("notStarted" in way, false);
      assert.deepEqual("compression" in way && way.compression, {
        budget: 1_000,
        at: 90,
        to: 10,
      });
    });

    it("does not go when the words and the share held back reach the threshold, and says so", () => {
      // The threshold is 9 000 of 10 000 and the share held back a thousand: the words may take under eight.
      const way = kept(0, {
        asked: "б".repeat(8_000),
      });

      assert.equal("notStarted" in way && way.notStarted, "tooLong");
      assert.ok(
        "text" in way &&
          way.text.includes(`Промпт і питання — ${groupedNumber(8_000)} символів`) &&
          way.text.includes(`${groupedNumber(1_000)} зарезервовано під пам'ять агента`) &&
          way.text.includes(`поріг стиснення — ${groupedNumber(9_000)}`),
      );
      // The card tells the reserve in place of the memory.
      assert.deepEqual("wouldGo" in way && way.wouldGo, {
        prompt: 0,
        asked: 8_000,
        memory: 1_000,
        total: 9_000,
        ceiling: CEILING,
      });
    });

    it("lets the words go up to the character before that", () => {
      const way = kept(0, {
        asked: "б".repeat(7_999),
      });

      assert.equal("notStarted" in way, false);
    });

    it("does not go for the words alone either, however little the memory is", () => {
      const way = kept(100, {
        asked: "б".repeat(CEILING + 1),
      });

      assert.equal("notStarted" in way && way.notStarted, "tooLong");
    });
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

    assert.equal("notStarted" in stood && stood.notStarted, "lostFunction");
  });

  it("stands the turn on a granted function the server no longer gives", () => {
    // «хід не йде без функції»: skipping it silently would make another walk under the same question.
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

    assert.equal("notStarted" in stood && stood.notStarted, "lostFunction");
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

    assert.equal("notStarted" in stood && stood.notStarted, "lostFunction");
  });

  it("lets the turn through while the server has not answered yet", () => {
    // A starting server's functions are unknown, not gone, so a grant on it is whole.
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

    assert.equal("notStarted" in way, false);
  });

  it("stops a turn granted a server whose run line this machine has not agreed to, naming that server by id", () => {
    // Nothing was started for it, and nothing is sent for the turn either.
    const stood = turnWall(
      turn({
        agent: {
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "mcp",
              serverId: SERVER_ID,
              functionName: "browser_click",
            },
          ],
        },
        catalogue: {
          ...WITH_SERVER,
          looks: {
            [SERVER_ID]: {
              ...WITH_SERVER.looks[SERVER_ID],
              isUp: false,
              functions: [],
              answeredAt: null,
              failure: "Error: MCP_CONSENT_MISSING",
            },
          },
        },
      }),
    );

    assert.ok("notStarted" in stood);
    assert.equal(stood.notStarted, "noConsent");
    assert.equal(stood.state, "noConsent");
    assert.equal(stood.waitsFor, SERVER_ID);
    assert.equal(stood.cost, null);
    assert.equal(stood.text, "playwright-mcp ще не запускали на цій машині — його рядок запуску чекає вашої згоди.");
  });

  it("lets a turn through where the server waiting for consent is not granted to the agent", () => {
    const way = turnWall(
      turn({
        catalogue: {
          ...WITH_SERVER,
          looks: {
            [SERVER_ID]: {
              ...WITH_SERVER.looks[SERVER_ID],
              isUp: false,
              functions: [],
              answeredAt: null,
              failure: "Error: MCP_CONSENT_MISSING",
            },
          },
        },
      }),
    );

    assert.equal("notStarted" in way, false);
  });

  it("names no server on a turn stopped by any other wall", () => {
    const stood = wall({}, null);

    assert.ok("notStarted" in stood);
    assert.equal(stood.waitsFor, null);
  });

  it("stops a turn whose provider carries no functions while the agent holds grants", () => {
    // Dropping them silently would pass off an answer as made with the granted tools.
    const stood = turnWall(
      turn({
        agent: {
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "command",
              commandId: COMMAND.id,
              pinned: [],
            },
          ],
        },
        stands: {
          model: MODEL,
          provider: {
            id: "runpod",
            name: "RunPod",
            kind: "remote",
            needs: ["key", "address"],
            takesTools: false,
            customaryAddress: null,
            keyHint: "rpa_lon•••",
            address: "https://api.runpod.ai/v2/z5x8c1v4b7n2m6",
            isOff: false,
          },
          prompt: null,
        },
      }),
    );

    assert.equal("notStarted" in stood && stood.notStarted, "noTools");
  });

  it("lets an agent with grants go on RunPod OpenAI and keeps it standing on RunPod Queue, as the known list says", () => {
    // The two doors of one kind of endpoint: only the OpenAI one carries functions.
    const onProvider = (providerId: string) =>
      turnWall(
        turn({
          agent: {
            ...AGENT,
            tools: [
              {
                id: "grant-1",
                source: "command",
                commandId: COMMAND.id,
                pinned: [],
              },
            ],
          },
          stands: {
            model: MODEL,
            provider: {
              ...(KNOWN_PROVIDERS.find((known) => known.id === providerId) ?? KNOWN_PROVIDERS[0]),
              keyHint: "rpa_lon•••",
              address: "https://api.runpod.ai/v2/z5x8c1v4b7n2m6",
              isOff: false,
            },
            prompt: null,
          },
        }),
      );

    const onQueue = onProvider("runpod");

    assert.equal("notStarted" in onProvider("runpod-openai"), false);
    assert.equal("notStarted" in onQueue && onQueue.notStarted, "noTools");
  });

  describe("a provider turned off on this machine", () => {
    /** The agent's turn on Anthropic, standing off or on. */
    function onAnthropic(isOff: boolean) {
      return turnWall(
        turn({
          stands: {
            model: MODEL,
            provider: {
              id: "anthropic",
              name: "Anthropic",
              kind: "remote",
              needs: ["key"],
              takesTools: true,
              customaryAddress: null,
              keyHint: "sk-ant-•••",
              address: null,
              isOff,
            },
            prompt: null,
          },
        }),
      );
    }

    it("stops the turn and names the provider in its sentence", () => {
      const stood = onAnthropic(true);

      assert.equal("notStarted" in stood && stood.notStarted, "providerOff");
      assert.equal("notStarted" in stood && stood.state, "providerOff");
      assert.equal(
        "notStarted" in stood && stood.text,
        "Провайдер Anthropic вимкнено на цій машині. Увімкніть його в розділі «Провайдери», і агент піде.",
      );
    });

    it("lets the same turn through once the provider is on again", () => {
      assert.equal("notStarted" in onAnthropic(false), false);
    });

    it("outranks a provider that carries no functions, where the agent holds grants", () => {
      const grant: ToolGrant = {
        id: "grant-1",
        source: "command",
        commandId: COMMAND.id,
        pinned: [],
      };
      const stood = turnWall(
        turn({
          agent: {
            ...AGENT,
            tools: [grant],
          },
          stands: {
            model: MODEL,
            provider: {
              id: "runpod",
              name: "RunPod Queue",
              kind: "remote",
              needs: ["key", "address"],
              takesTools: false,
              customaryAddress: null,
              keyHint: "rpa_lon•••",
              address: "https://api.runpod.ai/v2/z5x8c1v4b7n2m6",
              isOff: true,
            },
            prompt: null,
          },
        }),
      );

      assert.equal("notStarted" in stood && stood.notStarted, "providerOff");
    });
  });

  it("lets a turn through on such a provider where the agent holds no grants at all", () => {
    const stood = turnWall(
      turn({
        stands: {
          model: MODEL,
          provider: {
            id: "runpod",
            name: "RunPod",
            kind: "remote",
            needs: ["key", "address"],
            takesTools: false,
            customaryAddress: null,
            keyHint: "rpa_lon•••",
            address: "https://api.runpod.ai/v2/z5x8c1v4b7n2m6",
            isOff: false,
          },
          prompt: null,
        },
      }),
    );

    assert.equal("notStarted" in stood, false);
  });

  it("stops a turn whose prompt the project has lost", () => {
    const stood = wall({
      promptId: "prompt-gone",
    });

    assert.equal("notStarted" in stood && stood.notStarted, "lostPrompt");
  });

  it("stops a turn whose agent is missing a number of its own", () => {
    const stood = wall({
      maxCalls: null,
    });

    assert.equal("notStarted" in stood && stood.notStarted, "notFilledAgent");
  });

  it("stops a turn with no model at all", () => {
    const stood = wall({}, null);

    assert.equal("notStarted" in stood && stood.notStarted, "noModel");
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

    assert.equal("notStarted" in stood && stood.notStarted, "notFilled");
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

    assert.equal("notStarted" in stood && stood.notStarted, "tooLong");
    assert.notEqual("wouldGo" in stood && stood.wouldGo, null);
  });

  describe("an agent granted system commands", () => {
    const FOLLOWERS = [
      {
        agentId: "b",
        name: "КОДЕР",
        purpose: "Пише код",
      },
    ];
    const PASS: ToolGrant = {
      id: "grant-s1",
      source: "system",
      command: "pass_to",
    };
    const FINISH: ToolGrant = {
      id: "grant-s2",
      source: "system",
      command: "finish_here",
    };

    /** The names of the tools the turn goes with. */
    function toolsOf(stood: ReturnType<typeof turnWall>): string[] {
      return "tools" in stood ? stood.tools.map((tool) => tool.name) : [];
    }

    it("goes with the commands it was granted after its own tools", () => {
      const stood = turnWall(
        turn({
          agent: {
            ...AGENT,
            tools: [
              {
                id: "grant-1",
                source: "command",
                commandId: COMMAND.id,
                pinned: [],
              },
              PASS,
              FINISH,
            ],
          },
          followers: FOLLOWERS,
        }),
      );

      assert.deepEqual(toolsOf(stood), ["find_deep", "pass_to", "finish_here"]);
    });

    it("goes with only the command it was granted", () => {
      assert.deepEqual(
        toolsOf(
          turnWall(
            turn({
              agent: {
                ...AGENT,
                tools: [FINISH],
              },
              followers: FOLLOWERS,
            }),
          ),
        ),
        ["finish_here"],
      );
    });

    it("goes with none of them where it was granted none, though lines lead out of it", () => {
      assert.deepEqual(
        toolsOf(
          turnWall(
            turn({
              followers: FOLLOWERS,
            }),
          ),
        ),
        [],
      );
    });

    it("goes with none of them where no line leads to an agent that can take the work", () => {
      assert.deepEqual(
        toolsOf(
          turnWall(
            turn({
              agent: {
                ...AGENT,
                tools: [PASS, FINISH],
              },
            }),
          ),
        ),
        [],
      );
    });

    it("lets its own tool of the same name give way to the app's", () => {
      const stood = turnWall(
        turn({
          agent: {
            ...AGENT,
            tools: [
              {
                id: "grant-1",
                source: "command",
                commandId: COMMAND.id,
                pinned: [],
              },
              PASS,
            ],
          },
          catalogue: {
            ...ONLY_COMMANDS,
            commands: [
              {
                ...COMMAND,
                name: "pass_to",
              },
            ],
          },
          followers: FOLLOWERS,
        }),
      );

      assert.deepEqual(toolsOf(stood), ["pass_to"]);
      assert.equal("tools" in stood && stood.tools[0].source, "system");
    });

    it("does not start on a provider that carries no functions, as for any other grant", () => {
      const stood = turnWall(
        turn({
          agent: {
            ...AGENT,
            tools: [PASS],
          },
          stands: {
            model: MODEL,
            provider: {
              id: "runpod",
              name: "RunPod",
              kind: "remote",
              needs: ["key", "address"],
              takesTools: false,
              customaryAddress: null,
              keyHint: "rpa_lon•••",
              address: "https://api.runpod.ai/v2/z5x8c1v4b7n2m6",
              isOff: false,
            },
            prompt: null,
          },
          followers: FOLLOWERS,
        }),
      );

      assert.equal("notStarted" in stood && stood.notStarted, "noTools");
    });
  });
});
