import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import {
  AGENT_CLIENTS,
  ANTHROPIC_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  LLM_ASK_FAILED,
  LMSTUDIO_PROVIDER_ID,
  OLLAMA_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  OPENCODE_PROVIDER_ID,
  OPENROUTER_PROVIDER_ID,
  RUNPOD_CLIENT_NAME,
  RUNPOD_PROVIDER_ID,
} from "../constants";
import {
  LLM_NO_ADDRESS,
  LLM_NO_KEY,
  LLM_PROVIDER_NOT_BUILT,
  LLM_PROVIDER_SILENT,
  COMPOSER_SAID_NOTHING_NOTE,
  RECORD_GONE_NOTE,
  REFUSAL_SAID_SEPARATOR,
  composedMemory,
  composedSharedMemory,
  systemTools,
  sharedMemoryWithTask,
} from "../../../contracts";
import { LlmService } from "./llm.service";
import { RunPodChat } from "./runpod-chat.service";
import { ToolArguments } from "./tool-arguments.service";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseMessage } from "@langchain/core/messages";
import { AGENT_CYCLE_NOTE, AGENT_NAME_SLOT, SERVER_NAME_SLOT, SERVER_NOT_THERE_NOTE } from "../constants";
import type {
  AgentAgentTool,
  AgentChunk,
  AgentClient,
  AgentOpening,
  AgentCommandTool,
  AgentKeyStore,
  AgentServerTool,
  AgentVoice,
  ProjectMcpServer,
  ReadyAgent,
  RunMemory,
  ServerRunner,
  ToolRunner,
} from "../interfaces";

function keyStore(key: string | null, address: string | null = null, isAnswering = true): AgentKeyStore {
  return {
    keyOf: async () => key,
    addressOf: async () => address,
    isAnswering: async () => isAnswering,
  };
}

const TURN = {
  turnId: "turn-1",
  agentId: "agent-1",
  model: "claude-sonnet-4-5",
  directory: "/tmp",
  maxCalls: 10,
  temperature: 0.3,
  answerCeiling: 4096,
  tools: [],
  servers: [],
  agents: [],
  systemPrompt: null,
  messages: [
    {
      from: "person" as const,
      text: "Привіт",
    },
  ],
  runId: "77777777-7777-4777-8777-777777777777",
  questionId: "44444444-4444-4444-8444-444444444444",
};

function voice(heard: AgentChunk[]): AgentVoice {
  return {
    say: (chunk) => {
      heard.push(chunk);
    },
  };
}

/** A record that holds no question; only an agent called with the shared memory reads it. */
function noMemory(): RunMemory {
  return {
    sharedMemory: async () => null,
  };
}

/** A record that tells this memory of every question, and keeps what it was asked. */
function remembering(memory: string | null, asked: unknown[] = []): RunMemory {
  return {
    sharedMemory: async (runId, questionId) => {
      asked.push([runId, questionId]);

      return memory === null
        ? null
        : {
            text: memory,
            coversPlace: 0,
          };
    },
  };
}

/** A record that cannot be read. */
function unreadable(failure: Error): RunMemory {
  return {
    sharedMemory: async () => {
      throw failure;
    },
  };
}

/** A stand-in for whoever reaches servers; tests that need one give their own. */
function noServers(): ServerRunner {
  return {
    call: async () => ({
      output: "",
      isFailed: false,
    }),
  };
}

function runner(): ToolRunner {
  return {
    call: async (payload) => ({
      line: payload.run,
      output: "",
      isFailed: false,
      exitCode: 0,
    }),
  };
}

const toolArguments = new ToolArguments();

/** Any ceiling will do for a spec about addresses. */
const ANSWER_TOKENS = 4096;

describe("LlmService", () => {
  it("says so plainly when the model names a provider nobody has built a client for", async () => {
    const llmService = new LlmService(
      keyStore("sk-whatever"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "a provider the app does not know",
      }),
      new RegExp(LLM_PROVIDER_NOT_BUILT),
    );
  });

  it("takes back a turn nobody is holding without making a fuss about it", () => {
    const llmService = new LlmService(
      keyStore(null),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    assert.doesNotThrow(() =>
      llmService.stop({
        turnId: "a turn that answered long ago",
      }),
    );
  });

  it("asks a local provider for an address rather than a key, and says which one is missing", async () => {
    const llmService = new LlmService(
      keyStore("a key nobody local wants"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "ollama",
      }),
      new RegExp(LLM_NO_ADDRESS),
    );
  });

  it("has a client for OpenRouter too, so what stops it there is the key and not the provider", async () => {
    const llmService = new LlmService(
      keyStore(null),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "openrouter",
      }),
      new RegExp(LLM_NO_KEY),
    );
  });

  it("does not call out at all when this machine holds no key for the provider", async () => {
    const llmService = new LlmService(
      keyStore(null),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "anthropic",
      }),
      new RegExp(LLM_NO_KEY),
    );
  });

  it("counts an emptied key as no key, rather than calling out with nothing", async () => {
    const llmService = new LlmService(
      keyStore(""),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "anthropic",
      }),
      new RegExp(LLM_NO_KEY),
    );
  });

  it("refuses a turn asked of a local provider that is not running, saying which of the two it is", async () => {
    const llmService = new LlmService(
      keyStore(null, "http://localhost:11434", false),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      AGENT_CLIENTS,
    );

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "ollama",
      }),
      new RegExp(LLM_PROVIDER_SILENT),
    );
  });
});

/** A stand-in RunPod queue: every address asked is recorded, and a job comes back done. */
function runpodQueue(): string[] {
  const asked: string[] = [];
  const answers = [
    {
      id: "job-1",
      status: "IN_QUEUE",
    },
    {
      status: "COMPLETED",
      output: [
        {
          choices: [
            {
              finish_reason: "stop",
              message: {
                role: "assistant",
                content: "Готово.",
              },
            },
          ],
        },
      ],
    },
  ];

  globalThis.fetch = (async (url: string) => {
    asked.push(String(url));

    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(answers[Math.min(asked.length - 1, answers.length - 1)]),
    };
  }) as unknown as typeof fetch;

  return asked;
}

describe("AGENT_CLIENTS", () => {
  afterEach(() => {
    globalThis.fetch = undefined as unknown as typeof fetch;
  });

  it("holds a client for every provider the app knows, each saying what it asks the person for", () => {
    const needs = Object.fromEntries(
      Object.entries(AGENT_CLIENTS).map(([providerId, client]) => [providerId, client.needs]),
    );

    assert.deepEqual(needs, {
      [ANTHROPIC_PROVIDER_ID]: ["key"],
      [OPENAI_PROVIDER_ID]: ["key"],
      [OPENROUTER_PROVIDER_ID]: ["key"],
      [GOOGLE_PROVIDER_ID]: ["key"],
      [OPENCODE_PROVIDER_ID]: ["key"],
      // A serverless endpoint carries its id in the address, so the key alone is not enough.
      [RUNPOD_PROVIDER_ID]: ["key", "address"],
      [OLLAMA_PROVIDER_ID]: ["address"],
      [LMSTUDIO_PROVIDER_ID]: ["address"],
    });
  });

  it("points LM Studio at the address it was given, with OpenAI's own path on the end of it", () => {
    const model = <ChatOpenAI>AGENT_CLIENTS[LMSTUDIO_PROVIDER_ID].open({
      session: "chat-1",
      model: "qwen3",
      key: null,
      address: "http://localhost:1234",
      temperature: 0.3,
      answerTokens: ANSWER_TOKENS,
    });

    assert.equal(model.clientConfig.baseURL, "http://localhost:1234/v1");
  });

  it("appends that path once, whatever trailing slashes the address was written with", () => {
    const model = <ChatOpenAI>AGENT_CLIENTS[LMSTUDIO_PROVIDER_ID].open({
      session: "chat-1",
      model: "qwen3",
      key: null,
      address: "http://localhost:1234/v1//",
      temperature: 0.3,
      answerTokens: ANSWER_TOKENS,
    });

    assert.equal(model.clientConfig.baseURL, "http://localhost:1234/v1");
  });

  it("leaves Ollama's address as it stands, since it is not OpenAI's protocol", () => {
    const model = <ChatOllama>AGENT_CLIENTS[OLLAMA_PROVIDER_ID].open({
      session: "chat-1",
      model: "llama3",
      key: null,
      address: "http://localhost:11434",
      temperature: 0.3,
      answerTokens: ANSWER_TOKENS,
    });

    assert.equal(model.baseUrl, "http://localhost:11434");
  });

  it("opens RunPod on the queue's own client, since such an endpoint has no OpenAI door to knock at", () => {
    const model = AGENT_CLIENTS[RUNPOD_PROVIDER_ID].open({
      session: "chat-1",
      model: "dphn/dolphin-2.9.3-mistral-nemo-12b",
      key: "rpa_test",
      address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3",
      temperature: 0.3,
      answerTokens: ANSWER_TOKENS,
    });

    assert.ok(model instanceof RunPodChat);
    assert.equal(model._llmType(), RUNPOD_CLIENT_NAME);
  });

  it("keeps the endpoint's address as the person wrote it, adding no path of OpenAI's to the end", async () => {
    // The endpoint id lives in the address; the model name is never sent.
    const asked = runpodQueue();
    const model = AGENT_CLIENTS[RUNPOD_PROVIDER_ID].open({
      session: "chat-1",
      model: "dphn/dolphin-2.9.3-mistral-nemo-12b",
      key: "rpa_test",
      address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3//",
      temperature: 0.3,
      answerTokens: ANSWER_TOKENS,
    });

    await model.invoke([new HumanMessage("Привіт")]);

    assert.equal(asked[0], "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/run");
  });
});

/** Provider id the fake client answers to; no real provider is opened. */
const TEST_PROVIDER_ID = "a provider that exists only here";

/** One local server as the project file holds it. */
const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "filesystem",
  isLocal: true,
  run: "node server.js",
  address: "",
  signIn: "none",
  env: [],
};

/** One command with one number parameter. */
const FIND_DEEP: AgentCommandTool = {
  source: "command",
  name: "find_deep",
  description: "Шукає файли",
  run: "find . -maxdepth {depth}",
  parameters: [
    {
      name: "depth",
      description: "Глибина",
      type: "number",
      isRequired: true,
      values: [],
    },
  ],
  pinned: {},
};

/** A provider that says the given rounds in order and records the conversation it got each time. */
function speaking(rounds: AIMessageChunk[]) {
  const heard: BaseMessage[][] = [];
  const bound: unknown[] = [];
  const openings: AgentOpening[] = [];
  let round = 0;
  const model = {
    bindTools: (tools: unknown[]) => {
      bound.push(...tools);

      return model;
    },
    stream: async (conversation: BaseMessage[]) => {
      heard.push([...conversation]);

      const piece =
        rounds[round] ??
        new AIMessageChunk({
          content: "",
        });

      round += 1;

      return (async function* () {
        yield piece;
      })();
    },
  };

  return {
    /** What the model was handed on each round, in order. */
    conversations: heard,
    /** The schemas the tools were bound with, as given to the model. */
    boundTools: bound,
    /** What the client was opened with, on each turn. */
    openings,
    clients: <Record<string, AgentClient>>{
      [TEST_PROVIDER_ID]: {
        needs: ["key"],
        open: (opening) => {
          openings.push(opening);

          return <BaseChatModel>(<unknown>model);
        },
      },
    },
  };
}

/** A provider that answers with a fault of its own, like a wrong key. */
function faulting(failure: unknown) {
  const model = {
    bindTools: () => model,
    stream: () => {
      throw failure;
    },
  };

  return <Record<string, AgentClient>>{
    [TEST_PROVIDER_ID]: {
      needs: ["key"],
      open: () => <BaseChatModel>(<unknown>model),
    },
  };
}

/** A stand-in for the servers that records what it was asked and answers as told. */
function watchfulServers(asked: unknown[], answer = "два корені", isFailed = false): ServerRunner {
  return {
    call: async (payload) => {
      asked.push(payload);

      return {
        output: answer,
        isFailed,
      };
    },
  };
}

/** One function of one server, with the schema the server published. */
const LIST_ROOTS: AgentServerTool = {
  source: "mcp",
  name: "list_roots",
  description: "Каже корені",
  serverId: SERVER.id,
  parameters: {
    type: "object",
    properties: {
      deep: {
        type: "boolean",
      },
    },
    required: [],
  },
};

/** Every command the turn ran, in order. */
function watchfulRunner(ran: unknown[]): ToolRunner {
  return {
    call: async (payload) => {
      ran.push(payload);

      return {
        line: "find . -maxdepth 2",
        output: "три файли",
        isFailed: false,
        exitCode: 0,
      };
    },
  };
}

describe("LlmService and the answer's ceiling", () => {
  it("takes the provider at its word wherever the client keeps it, `additional_kwargs` included", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Успішне",
        additional_kwargs: {
          stop_reason: "max_tokens",
        },
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
    });

    assert.equal(answer.isCeilingHit, true);
    assert.equal(answer.text, "Успішне");
  });

  it("reads the provider's own count against the ceiling where its word never came", async () => {
    // Some clients drop the chunk with the end word; the provider's token count says the same.
    const provider = speaking([
      new AIMessageChunk({
        content: "Успішне",
        usage_metadata: {
          input_tokens: 400,
          output_tokens: 8,
          total_tokens: 408,
        },
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      answerCeiling: 8,
    });

    assert.equal(answer.isCeilingHit, true);
  });

  it("says nothing where the count ran past the ceiling, since that provider never held to it", async () => {
    // 1000 tokens under a ceiling of 8: the provider ignored the ceiling, so nothing was cut.
    const provider = speaking([
      new AIMessageChunk({
        content: "Успішне досягнення цілей вимагає чіткого планування дій.",
        usage_metadata: {
          input_tokens: 400,
          output_tokens: 1000,
          total_tokens: 1400,
        },
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      answerCeiling: 8,
    });

    assert.equal(answer.isCeilingHit, false);
  });

  it("says nothing of a ceiling the count did not reach, and nothing where the provider counted nothing", async () => {
    const counted = speaking([
      new AIMessageChunk({
        content: "Успішне досягнення цілей",
        usage_metadata: {
          input_tokens: 400,
          output_tokens: 7,
          total_tokens: 407,
        },
      }),
    ]);
    const silent = speaking([
      new AIMessageChunk({
        content: "Успішне досягнення цілей",
      }),
    ]);
    const ask = async (clients: Record<string, AgentClient>) =>
      new LlmService(keyStore("sk-1"), voice([]), runner(), noServers(), noMemory(), toolArguments, clients).ask({
        ...TURN,
        providerId: TEST_PROVIDER_ID,
        answerCeiling: 8,
      });

    assert.equal((await ask(counted.clients)).isCeilingHit, false);
    assert.equal((await ask(silent.clients)).isCeilingHit, false);
  });
});

describe("LlmService when the check refuses a call", () => {
  const asking = (args: Record<string, unknown>) =>
    new AIMessageChunk({
      content: "",
      tool_calls: [
        {
          name: "find_deep",
          args,
          id: "call-1",
        },
      ],
    });

  it("runs nothing, tells the person in a line and the model in a note, and lets it call again", async () => {
    const provider = speaking([
      asking({
        depth: "швидко",
      }),
      new AIMessageChunk({
        content: "Гаразд, беру число.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const ran: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      watchfulRunner(ran),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [FIND_DEEP],
    });

    // Nothing ran: the line the person wrote was never reached.
    assert.deepEqual(ran, []);
    // One row, said once: a refused call never went out, so it never comes back.
    const said = heard.map((chunk) => chunk.call).filter((one) => one !== null);

    assert.deepEqual(
      said.map((one) => [one.name, one.state, one.exitCode]),
      [["find_deep", "refused", null]],
    );
    assert.equal(said[0].refusal, "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]");

    // The model heard the same refusal, in its own words, in the same turn.
    assert.equal(
      provider.conversations[1]?.at(-1)?.content,
      "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
    );
    assert.equal(answer.text, "Гаразд, беру число.");

    // The turn hands the call back in the form the record and chat read.
    assert.deepEqual(
      answer.calls.map((one) => [one.name, one.line, one.output, one.exitCode, one.refusal]),
      [["find_deep", "", "", null, "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]"]],
    );
    assert.deepEqual(answer.calls[0].arguments, {
      depth: "швидко",
    });
    assert.equal(answer.calls[0].endedAt >= answer.calls[0].startedAt, true);
  });

  it("costs the turn one call, so a low ceiling ends on the refusal itself", async () => {
    const provider = speaking([
      asking({
        depth: "швидко",
      }),
      new AIMessageChunk({
        content: "Друге слово.",
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      maxCalls: 2,
      tools: [FIND_DEEP],
    });

    // One round and one refused call fill a ceiling of two.
    assert.equal(answer.isCallsExhausted, true);
    assert.equal(answer.text, "");
  });

  it("runs the whole turn under a ceiling of nought, spending calls without ever being cut", async () => {
    const provider = speaking([
      asking({
        depth: 2,
      }),
      new AIMessageChunk({
        content: "Знайшов три файли.",
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      maxCalls: 0,
      tools: [FIND_DEEP],
    });

    // Nought is no ceiling: the call is made and the model has the last word.
    assert.equal(answer.isCallsExhausted, false);
    assert.equal(answer.text, "Знайшов три файли.");
  });

  it("says nothing of a refusal when the arguments hold, and runs the line", async () => {
    const provider = speaking([
      asking({
        depth: 2,
      }),
      new AIMessageChunk({
        content: "Знайшов три файли.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const ran: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      watchfulRunner(ran),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [FIND_DEEP],
    });

    assert.equal(ran.length, 1);
    assert.deepEqual(<Record<string, unknown>>(<{ arguments: unknown }>ran[0]).arguments, {
      depth: "2",
    });
    // The same call twice under one id — going out, then over.
    const said = heard.map((chunk) => chunk.call).filter((one) => one !== null);

    assert.deepEqual(
      said.map((one) => [one.state, one.exitCode, one.line]),
      [
        ["running", null, ""],
        ["ran", 0, "find . -maxdepth 2"],
      ],
    );
    assert.equal(said[0].id, said[1].id);
    assert.deepEqual(said[1].pinned, []);
    assert.equal(answer.text, "Знайшов три файли.");
    assert.deepEqual(
      answer.calls.map((one) => [one.name, one.line, one.output, one.exitCode, one.refusal]),
      [["find_deep", "find . -maxdepth 2", "три файли", 0, ""]],
    );
  });

  it("names a provider's own fault instead of letting the library's error out", async () => {
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      faulting(
        Object.assign(new Error("User not found."), {
          headers: {
            "set-cookie": "секрет",
          },
        }),
      ),
    );

    /**
     * A refusal crosses as an answer; the library's error object carries headers and cookies, so only the provider's own
     * sentence rides after the code.
     */
    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: TEST_PROVIDER_ID,
      }),
      (thrown: unknown) =>
        thrown instanceof Error && thrown.message === `${LLM_ASK_FAILED}${REFUSAL_SAID_SEPARATOR}User not found.`,
    );
  });
});

describe("LlmService when the agent calls a system command", () => {
  const STORYTELLER = "aaaaaaaa-0000-4000-8000-0000000000a1";
  const TRANSLATOR = "aaaaaaaa-0000-4000-8000-0000000000a2";
  const ROUTE = systemTools(
    [
      {
        id: "grant-s1",
        source: "system",
        command: "pass_to",
      },
      {
        id: "grant-s2",
        source: "system",
        command: "finish_here",
      },
    ],
    [
      {
        agentId: STORYTELLER,
        name: "КОДЕР",
        purpose: "Пише код",
      },
      {
        agentId: TRANSLATOR,
        name: "ПЕРЕВІРНИК",
        purpose: null,
      },
    ],
  );

  const calling = (...calls: [string, Record<string, unknown>][]) =>
    new AIMessageChunk({
      content: "",
      tool_calls: calls.map(([name, args], index) => ({
        name,
        args,
        id: `call-${index + 1}`,
      })),
    });

  function service(provider: ReturnType<typeof speaking>, heard: AgentChunk[] = []): LlmService {
    return new LlmService(
      keyStore("sk-1"),
      voice(heard),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );
  }

  it("hands the model both functions, the choice of whom to pass to being a list of the names it was given", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Готово",
      }),
    ]);

    await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    const [pass, finish] = <{ function: { name: string; parameters: Record<string, unknown> } }[]>provider.boundTools;

    assert.equal(pass.function.name, "pass_to");
    assert.deepEqual(pass.function.parameters, {
      type: "object",
      properties: {
        to: {
          type: "array",
          description: "Кому передати — одне чи кілька слів зі списку.",
          items: {
            type: "string",
            enum: ["КОДЕР", "ПЕРЕВІРНИК"],
          },
          minItems: 1,
        },
      },
      required: ["to"],
    });
    assert.equal(finish.function.name, "finish_here");
    assert.deepEqual(finish.function.parameters, {
      type: "object",
      properties: {},
    });
  });

  it("carries the choice up with the answer, and ends the turn there with no round for words", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: ["ПЕРЕВІРНИК", "КОДЕР", "ПЕРЕВІРНИК"],
        },
      ]),
      new AIMessageChunk({
        content: "Не буде сказано",
      }),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.deepEqual(answer.route, {
      toAgentIds: [TRANSLATOR, STORYTELLER],
      isFinished: false,
    });
    assert.equal(answer.text, "");
    assert.equal(answer.isCallsExhausted, false);
    assert.equal(provider.conversations.length, 1);
  });

  it("keeps what the agent said before it called the command", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Ось результат",
        tool_calls: [
          {
            name: "pass_to",
            args: {
              to: ["КОДЕР"],
            },
            id: "call-1",
          },
        ],
      }),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.equal(answer.text, "Ось результат");
    assert.deepEqual(answer.route?.toAgentIds, [STORYTELLER]);
  });

  it("takes one name given bare where the model did not make a list of it", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: "КОДЕР",
        },
      ]),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.deepEqual(answer.route?.toAgentIds, [STORYTELLER]);
  });

  it("tells the model what it chose, and records the call as the app's own, with no line and no code", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: ["КОДЕР", "ПЕРЕВІРНИК"],
        },
      ]),
    ]);
    const heard: AgentChunk[] = [];
    const answer = await service(provider, heard).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.deepEqual(
      answer.calls.map((one) => [one.source, one.name, one.arguments, one.line, one.exitCode, one.isFailed]),
      [
        [
          "system",
          "pass_to",
          {
            to: "КОДЕР, ПЕРЕВІРНИК",
          },
          "",
          null,
          false,
        ],
      ],
    );
    // Said twice under one id, as any call: out, then over.
    assert.deepEqual(
      heard.map((chunk) => chunk.call?.state).filter((state) => state !== undefined && state !== null),
      ["running", "ran"],
    );
    // It costs nothing of its own.
    assert.equal(answer.called, null);
  });

  it("passes to those named where it also asked to finish: naming beats ending", async () => {
    const provider = speaking([
      calling(
        ["finish_here", {}],
        [
          "pass_to",
          {
            to: ["КОДЕР"],
          },
        ],
      ),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.deepEqual(answer.route, {
      toAgentIds: [STORYTELLER],
      isFinished: false,
    });
  });

  it("ends the branch when the agent calls finish_here alone, and ends the turn", async () => {
    const provider = speaking([calling(["finish_here", {}])]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.deepEqual(answer.route, {
      toAgentIds: [],
      isFinished: true,
    });
    assert.equal(answer.text, "");
    assert.equal(provider.conversations.length, 1);
  });

  it("refuses a name that is none of those given, tells the model which are, and goes on to another round", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: ["РЕЦЕНЗЕНТ"],
        },
      ]),
      new AIMessageChunk({
        content: "Гаразд",
      }),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });
    const note = "[pass_to не запустилась: to — має бути одним зі списку (КОДЕР, ПЕРЕВІРНИК), прийшло «РЕЦЕНЗЕНТ»]";

    assert.equal(provider.conversations[1]?.at(-1)?.content, note);
    assert.deepEqual(
      answer.calls.map((one) => [one.name, one.refusal]),
      [["pass_to", note]],
    );
    assert.equal(answer.route, null);
    assert.equal(answer.text, "Гаразд");
  });

  it("refuses a list that names nobody", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: [],
        },
      ]),
      new AIMessageChunk({
        content: "Гаразд",
      }),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.equal(answer.route, null);
    assert.notEqual(answer.calls[0]?.refusal, null);
  });

  it("has no route where the agent called none, so its answer goes down every line", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Просто відповідь",
      }),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    assert.equal(answer.route, null);
  });

  it("spends a call on the round and one on the command, as on any call", async () => {
    const provider = speaking([
      calling([
        "pass_to",
        {
          to: ["КОДЕР"],
        },
      ]),
    ]);
    const answer = await service(provider).ask({
      ...TURN,
      maxCalls: 1,
      providerId: TEST_PROVIDER_ID,
      tools: ROUTE,
    });

    // The round is the one call allowed, so the command is over the ceiling and is not made.
    assert.equal(answer.isCallsExhausted, true);
    assert.equal(answer.route, null);
  });
});

describe("LlmService when a server's function is called", () => {
  const asking = (args: Record<string, unknown>) =>
    new AIMessageChunk({
      content: "",
      tool_calls: [
        {
          name: "list_roots",
          args,
          id: "call-1",
        },
      ],
    });

  it("calls a server's function through the servers, and never through the runner", async () => {
    const provider = speaking([
      asking({
        deep: true,
      }),
      new AIMessageChunk({
        content: "Два корені.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const ran: unknown[] = [];
    const asked: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      watchfulRunner(ran),
      watchfulServers(asked),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [LIST_ROOTS],
      servers: [SERVER],
    });

    assert.deepEqual(ran, []);
    assert.equal(asked.length, 1);
    // The server's reach is answered from the list that travelled with the tools, by tool id.
    const { callId, signal, ...went } = <{ callId: string; signal: AbortSignal }>asked[0];

    assert.deepEqual(went, {
      server: SERVER,
      directory: TURN.directory,
      functionName: "list_roots",
      arguments: {
        deep: true,
      },
    });
    // The turn's stop signal travels with the call, so «ЗУПИНИТИ» reaches the server mid-request.
    assert.ok(signal instanceof AbortSignal);
    // The call goes out under the id the record keeps it by.
    assert.equal(callId, heard.find((piece) => piece.call !== null)?.call?.id);
    assert.equal(answer.text, "Два корені.");
  });

  it("says a server call twice under one id, and leaves the line and the code empty", async () => {
    const provider = speaking([
      asking({}),
      new AIMessageChunk({
        content: "Готово.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      runner(),
      watchfulServers([]),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [LIST_ROOTS],
      servers: [SERVER],
    });
    const said = heard.map((chunk) => chunk.call).filter((one) => one !== null);

    assert.deepEqual(
      said.map((one) => [one.state, one.line, one.exitCode]),
      [
        ["running", "", null],
        ["ran", "", null],
      ],
    );
    assert.equal(said[0].id, said[1].id);
    // A server's function has nothing to pin.
    assert.deepEqual(said[1].pinned, []);
    assert.deepEqual(
      answer.calls.map((one) => [one.name, one.output, one.refusal]),
      [["list_roots", "два корені", ""]],
    );
  });

  it("says a server's «ні» as an end of its own, and the words go to the model whole", async () => {
    // «функція є, але сервер сказав "ні"»: neither a break nor our refusal.
    const provider = speaking([
      asking({}),
      new AIMessageChunk({
        content: "Зрозумів.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      runner(),
      watchfulServers([], "browser_click: ref=e17 not found on page", true),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [LIST_ROOTS],
      servers: [SERVER],
    });
    const said = heard.map((chunk) => chunk.call).filter((one) => one !== null);

    assert.deepEqual(
      said.map((one) => one.state),
      ["running", "saidNo"],
    );
    assert.equal(said[1].isFailed, true);
    // The server's words go to the model as they came, with nothing added.
    assert.deepEqual(
      answer.calls.map((one) => [one.output, one.refusal, one.exitCode]),
      [["browser_click: ref=e17 not found on page", "", null]],
    );
  });

  it("hands the model the schema the server published, and rewrites none of it", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Нічого не кличу.",
      }),
    ]);
    await new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    ).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [LIST_ROOTS],
      servers: [SERVER],
    });

    assert.deepEqual(provider.boundTools, [
      {
        type: "function",
        function: {
          name: "list_roots",
          description: "Каже корені",
          parameters: LIST_ROOTS.parameters,
        },
      },
    ]);
  });

  it("answers a call of a function whose server never travelled with the ask, rather than reaching nowhere", async () => {
    const provider = speaking([
      asking({}),
      new AIMessageChunk({
        content: "Зрозумів.",
      }),
    ]);
    const asked: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      watchfulServers(asked),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [LIST_ROOTS],
      servers: [],
    });

    assert.deepEqual(asked, []);
    // The model is told in the same turn; the record holds no call.
    assert.equal(
      provider.conversations[1]?.at(-1)?.content,
      SERVER_NOT_THERE_NOTE.replace(SERVER_NAME_SLOT, "list_roots"),
    );
    assert.deepEqual(answer.calls, []);
    assert.equal(answer.text, "Зрозумів.");
  });
});

describe("LlmService and an agent called as a tool", () => {
  const REVIEWER: AgentAgentTool = {
    source: "agent",
    name: "reviewer",
    description: "Переглядає зміни",
    agentId: "agent-2",
  };

  const REVIEWER_RUN: ReadyAgent = {
    agentId: "agent-2",
    name: "reviewer",
    notReady: null,
    providerId: TEST_PROVIDER_ID,
    model: "claude-sonnet-4-5",
    maxCalls: 5,
    temperature: 0.3,
    answerCeiling: 4096,
    systemPrompt: "Ти рецензент.",
    tools: [],
    memory: "own",
    compressAt: 70,
    compressTo: 10,
    contextCeiling: 200_000,
    inputPrice: 3,
    outputPrice: 15,
  };

  const asking = (agent: string) =>
    new AIMessageChunk({
      content: "",
      tool_calls: [
        {
          name: agent,
          args: {
            request: "Переглянь зміни",
          },
          id: "call-1",
        },
      ],
    });

  it("runs the agent's own turn with its prompt and the request, and hands its answer back as the call's output", async () => {
    const provider = speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Зауважень немає.",
      }),
      new AIMessageChunk({
        content: "Готово.",
      }),
    ]);
    const heard: AgentChunk[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice(heard),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [REVIEWER_RUN],
    });

    assert.deepEqual(
      provider.conversations[1].map((message) => message.content),
      ["Ти рецензент.", "Переглянь зміни"],
    );
    assert.deepEqual(
      answer.calls.map((call) => [call.source, call.name, call.output, call.isFailed]),
      [["agent", "reviewer", "Зауважень немає.", false]],
    );
    // The called agent says nothing onward: the person hears the caller's words and its call, not the sub-turn's.
    assert.equal(
      heard.some((chunk) => chunk.text === "Зауважень немає."),
      false,
    );
    assert.equal(answer.text, "Готово.");
  });

  /** The caller asks the reviewer, then answers on whatever came back. */
  const callerAndBack = () =>
    speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Готово.",
      }),
    ]);

  it("opens the request of an agent with the shared memory with the caller's question's memory, read at the call", async () => {
    const provider = speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Зауважень немає.",
      }),
      new AIMessageChunk({
        content: "Готово.",
      }),
    ]);
    const read: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      remembering("ЗАГАЛЬНА ПАМ'ЯТЬ", read),
      toolArguments,
      provider.clients,
    );

    await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          memory: "shared",
        },
      ],
    });

    assert.deepEqual(read, [[TURN.runId, TURN.questionId]]);
    // One input: the memory, then the request.
    assert.deepEqual(
      provider.conversations[1].map((message) => message.content),
      ["Ти рецензент.", "ЗАГАЛЬНА ПАМ'ЯТЬ\n\nТВОЄ ЗАВДАННЯ:\nПереглянь зміни"],
    );
  });

  it("reads nothing for an agent whose memory is its own or off: as a tool it has no steps, only the request", async () => {
    const provider = speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Зауважень немає.",
      }),
    ]);
    const read: unknown[] = [];
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      remembering("ЗАГАЛЬНА ПАМ'ЯТЬ", read),
      toolArguments,
      provider.clients,
    );

    await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          memory: "none",
        },
      ],
    });

    assert.deepEqual(read, []);
    assert.deepEqual(
      provider.conversations[1].map((message) => message.content),
      ["Ти рецензент.", "Переглянь зміни"],
    );
  });

  it("fails the call with the record's own words where the memory cannot be read, and the caller goes on", async () => {
    const provider = callerAndBack();
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      unreadable(new Error("SQLITE_IOERR: disk I/O error")),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          memory: "shared",
        },
      ],
    });

    // The reviewer was never asked; no empty memory stood in for the one that could not be read.
    assert.equal(provider.conversations.length, 2);
    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [["SQLITE_IOERR: disk I/O error", true]],
    );
    assert.equal(answer.text, "Готово.");
  });

  it("fails the call where the record no longer holds the question, rather than calling with no memory", async () => {
    const provider = callerAndBack();
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      remembering(null),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          memory: "shared",
        },
      ],
    });

    assert.equal(provider.conversations.length, 2);
    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [[RECORD_GONE_NOTE, true]],
    );
  });

  it("fails the call over its model's ceiling with what would have gone, part by part, and cuts nothing", async () => {
    // A ceiling of 20: the prompt takes 13, the memory 4 and the request 15.
    const provider = callerAndBack();
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      remembering("ЩОСЬ"),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          memory: "shared",
          // Nothing is held back for the memory, so the ceiling is the whole wall.
          compressAt: 100,
          compressTo: 0,
          contextCeiling: 20,
        },
      ],
    });

    assert.equal(provider.conversations.length, 2);
    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [
        [
          "[агент «reviewer» не почав: у модель claude-sonnet-4-5 пішло б символів: 32 (промпт 13, пам'ять 4, запит 15), а стеля — 20. Нічого не обрізали.]",
          true,
        ],
      ],
    );
    assert.equal(answer.text, "Готово.");
  });

  it("fails the call with the provider's own words where the agent's model falls, and the caller goes on", async () => {
    const provider = callerAndBack();
    const llmService = new LlmService(keyStore("sk-1"), voice([]), runner(), noServers(), noMemory(), toolArguments, {
      ...provider.clients,
      "a provider that falls": faulting(new Error("User not found."))[TEST_PROVIDER_ID],
    });

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          ...REVIEWER_RUN,
          providerId: "a provider that falls",
        },
      ],
    });

    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [[`${LLM_ASK_FAILED}${REFUSAL_SAID_SEPARATOR}User not found.`, true]],
    );
    assert.equal(answer.text, "Готово.");
  });

  it("refuses a call that would close a ring, and asks nobody", async () => {
    const provider = speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Зрозумів.",
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      agentId: "agent-2",
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [REVIEWER_RUN],
    });

    assert.equal(provider.conversations.length, 2);
    assert.equal(answer.calls[0].refusal, AGENT_CYCLE_NOTE.replace(AGENT_NAME_SLOT, "reviewer"));
  });

  it("refuses an agent that cannot run with the words saying why", async () => {
    const provider = speaking([
      asking("reviewer"),
      new AIMessageChunk({
        content: "Зрозумів.",
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [
        {
          agentId: "agent-2",
          name: "reviewer",
          notReady: "Агент «reviewer» не має моделі.",
        },
      ],
    });

    assert.equal(provider.conversations.length, 2);
    assert.equal(answer.calls[0].refusal, "Агент «reviewer» не має моделі.");
  });
});

describe("LlmService and the temperature", () => {
  async function openedWith(temperature: number): Promise<AgentOpening> {
    const provider = speaking([
      new AIMessageChunk({
        content: "Готово",
      }),
    ]);
    const llmService = new LlmService(
      keyStore("sk-1"),
      voice([]),
      runner(),
      noServers(),
      noMemory(),
      toolArguments,
      provider.clients,
    );

    await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      temperature,
    });

    return provider.openings[0];
  }

  it("opens the client with no temperature where the person set zero", async () => {
    assert.equal((await openedWith(0)).temperature, undefined);
  });

  it("opens the client with the temperature the person set", async () => {
    assert.equal((await openedWith(0.7)).temperature, 0.7);
  });
});

describe("LlmService and the composer's call", () => {
  const COMPOSING = {
    turnId: "turn-1",
    providerId: TEST_PROVIDER_ID,
    model: "claude-sonnet-4-5",
    temperature: 0.3,
    answerCeiling: 2048,
    messages: [
      {
        from: "person" as const,
        text: "Усе, що вище",
      },
    ],
    runId: "77777777-7777-4777-8777-777777777777",
    questionId: "44444444-4444-4444-8444-444444444444",
  };

  function serviceOf(heard: AgentChunk[], clients: Record<string, AgentClient>): LlmService {
    return new LlmService(keyStore("sk-1"), voice(heard), runner(), noServers(), noMemory(), toolArguments, clients);
  }

  it("asks the model once, with no tools, and says nothing onward since its words are a memory", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Стисла пам'ять",
      }),
    ]);
    const heard: AgentChunk[] = [];

    const answer = await serviceOf(heard, provider.clients).compose(COMPOSING);

    assert.equal(answer.text, "Стисла пам'ять");
    assert.equal(answer.isStopped, false);
    assert.equal(provider.conversations.length, 1);
    assert.deepEqual(provider.boundTools, []);
    assert.deepEqual(heard, []);
  });

  it("gives the model the one message and no system prompt before it", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Зміст",
      }),
    ]);

    await serviceOf([], provider.clients).compose(COMPOSING);

    assert.deepEqual(
      provider.conversations[0].map((message) => message.content),
      ["Усе, що вище"],
    );
  });

  it("hands the model's own ceiling and the agent's temperature to the client", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Зміст",
      }),
    ]);

    await serviceOf([], provider.clients).compose(COMPOSING);

    assert.equal(provider.openings[0].answerTokens, 2048);
    assert.equal(provider.openings[0].temperature, 0.3);
  });

  it("opens the client with no temperature where the person set zero", async () => {
    const provider = speaking([
      new AIMessageChunk({
        content: "Зміст",
      }),
    ]);

    await serviceOf([], provider.clients).compose({
      ...COMPOSING,
      temperature: 0,
    });

    assert.equal(provider.openings[0].temperature, undefined);
  });

  it("ends as stopped where a stop reaches it under the turn's own id", async () => {
    let service: LlmService | null = null;
    const model = {
      bindTools: () => model,
      stream: () => {
        service?.stop({
          turnId: COMPOSING.turnId,
        });

        throw new Error("aborted");
      },
    };

    service = serviceOf([], {
      [TEST_PROVIDER_ID]: {
        needs: ["key"],
        open: () => <BaseChatModel>(<unknown>model),
      },
    });

    const answer = await service.compose(COMPOSING);

    assert.equal(answer.isStopped, true);
  });

  it("throws the provider's fault as the app's refusal, as an answer's turn does", async () => {
    await assert.rejects(serviceOf([], faulting(new Error("401"))).compose(COMPOSING), (failure: Error) =>
      failure.message.startsWith(LLM_ASK_FAILED),
    );
  });
});

describe("LlmService and the memory of an agent called as a tool", () => {
  const REVIEWER: AgentAgentTool = {
    source: "agent",
    name: "reviewer",
    description: "Переглядає зміни",
    agentId: "agent-2",
  };

  const REVIEWER_RUN: ReadyAgent = {
    agentId: "agent-2",
    name: "reviewer",
    notReady: null,
    providerId: TEST_PROVIDER_ID,
    model: "claude-sonnet-4-5",
    maxCalls: 5,
    temperature: 0.3,
    answerCeiling: 4096,
    systemPrompt: "Ти рецензент.",
    tools: [],
    memory: "own",
    compressAt: 70,
    compressTo: 10,
    contextCeiling: 10_000,
    inputPrice: 3,
    outputPrice: 15,
  };

  /** The caller asks the reviewer this. */
  const asking = (request: string, id: string) =>
    new AIMessageChunk({
      content: "",
      tool_calls: [
        {
          name: "reviewer",
          args: {
            request,
          },
          id,
        },
      ],
    });

  /** The composer's message, with what the provider counted for it. */
  const composing = (content: string) =>
    new AIMessageChunk({
      content,
      usage_metadata: {
        input_tokens: 100,
        output_tokens: 10,
        total_tokens: 110,
      },
    });

  const said = (content: string) =>
    new AIMessageChunk({
      content,
    });

  const serviceOf = (clients: Record<string, AgentClient>, record: RunMemory = noMemory()): LlmService =>
    new LlmService(keyStore("sk-1"), voice([]), runner(), noServers(), record, toolArguments, clients);

  const asked = (service: LlmService, agent: ReadyAgent = REVIEWER_RUN) =>
    service.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [REVIEWER],
      agents: [agent],
    });

  it("gives the agent, on its second call within the caller's turn, the first call and its answer ahead of the request", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("Відповідь 1"),
      asking("Друге", "call-2"),
      said("Відповідь 2"),
      said("Готово."),
    ]);

    await asked(serviceOf(provider.clients));

    assert.deepEqual(
      provider.conversations[1].map((message) => message.content),
      ["Ти рецензент.", "Перше"],
    );
    assert.deepEqual(
      provider.conversations[3].map((message) => message.content),
      ["Ти рецензент.", "Перше", "Відповідь 1", "Друге"],
    );
  });

  it("forgets it when the caller's turn is over: the next turn opens with the request alone", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("Відповідь 1"),
      said("Готово."),
      asking("Друге", "call-2"),
      said("Відповідь 2"),
      said("Готово."),
    ]);
    const service = serviceOf(provider.clients);

    await asked(service);
    await asked(service);

    assert.deepEqual(
      provider.conversations[4].map((message) => message.content),
      ["Ти рецензент.", "Друге"],
    );
  });

  it("keeps no thread for an agent without memory", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("Відповідь 1"),
      asking("Друге", "call-2"),
      said("Відповідь 2"),
      said("Готово."),
    ]);

    await asked(serviceOf(provider.clients), {
      ...REVIEWER_RUN,
      memory: "none",
    });

    assert.deepEqual(
      provider.conversations[3].map((message) => message.content),
      ["Ти рецензент.", "Друге"],
    );
  });

  it("compresses the thread by the agent's composer before a call it would make too long, and goes with the message", async () => {
    const long = "а".repeat(7_100);
    const provider = speaking([
      asking("Перше", "call-1"),
      said(long),
      asking("Друге", "call-2"),
      composing("Перше питання, довга відповідь"),
      said("Відповідь 2"),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients));

    // The composer is asked once, with the whole thread fenced in one message and no system prompt.
    const asked_ = provider.conversations[3].map((message) => String(message.content));

    assert.equal(asked_.length, 1);
    assert.ok(asked_[0].startsWith("<пам'ять>\n"));
    assert.ok(asked_[0].includes(long));
    // The agent then goes with the composed message ahead of the request.
    assert.deepEqual(
      provider.conversations[4].map((message) => message.content),
      ["Ти рецензент.", `${composedMemory("Перше питання, довга відповідь")}Друге`],
    );
    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [
        [long, false],
        ["Відповідь 2", false],
      ],
    );
  });

  it("tells the caller what the composer cost at the agent's model's prices, and keeps no record of a memory that lived for the turn", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("а".repeat(7_100)),
      asking("Друге", "call-2"),
      composing("Стисло"),
      said("Відповідь 2"),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients));

    assert.equal(answer.memories.length, 1);
    assert.equal(answer.memories[0].facts, null);
    assert.equal(answer.memories[0].cost?.inputTokens, 100);
    assert.equal(answer.memories[0].cost?.outputTokens, 10);
    assert.ok(Math.abs((answer.memories[0].cost?.money ?? 0) - 0.00045) < 1e-12);
  });

  it("goes on with the composed message and the calls after it, not compressing again while they fit", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("а".repeat(7_100)),
      asking("Друге", "call-2"),
      composing("Стисло"),
      said("Відповідь 2"),
      asking("Третє", "call-3"),
      said("Відповідь 3"),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients));

    assert.deepEqual(
      provider.conversations[6].map((message) => message.content),
      ["Ти рецензент.", `${composedMemory("Стисло")}Друге`, "Відповідь 2", "Третє"],
    );
    assert.equal(answer.memories.length, 1);
  });

  it("does not begin a call whose words leave the memory no room below the threshold, and says so to the caller", async () => {
    const provider = speaking([asking("Д".repeat(60), "call-1"), said("Готово.")]);

    const answer = await asked(serviceOf(provider.clients), {
      ...REVIEWER_RUN,
      contextCeiling: 100,
    });

    assert.equal(provider.conversations.length, 2);
    assert.deepEqual(
      answer.calls.map((call) => [call.output, call.isFailed]),
      [
        [
          "[агент «reviewer» не почав: його промпт і запит — 73 символи, і ще 10 зарезервовано під його пам'ять, а поріг стиснення — 70 (стеля моделі claude-sonnet-4-5 — 100). Разом вони мають лишатися нижче порогу. Нічого не обрізали.]",
          true,
        ],
      ],
    );
    assert.equal(answer.text, "Готово.");
  });

  it("fails the call, and still tells what the composer cost, where it wrote nothing", async () => {
    const provider = speaking([
      asking("Перше", "call-1"),
      said("а".repeat(7_100)),
      asking("Друге", "call-2"),
      composing(""),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients));

    assert.deepEqual(
      answer.calls.map((call) => call.isFailed),
      [false, true],
    );
    assert.equal(answer.calls[1].output, COMPOSER_SAID_NOTHING_NOTE);
    assert.equal(answer.memories.length, 1);
    assert.equal(answer.memories[0].cost?.inputTokens, 100);
  });

  /** A record whose shared memory of the question is this long, up to the fifth step, and which keeps what it was asked. */
  const recordOf = (memory: string, unwritten: unknown[] = []): RunMemory => ({
    sharedMemory: async (_runId, _questionId, _agentId, standing) => {
      unwritten.push(standing);

      return {
        text: standing === null ? memory : composedSharedMemory(standing.text),
        coversPlace: 5,
      };
    },
  });

  const SHARED = {
    ...REVIEWER_RUN,
    memory: "shared" as const,
  };

  it("compresses the question's shared memory by the agent's composer before the call, and goes with it told in the shared memory's words", async () => {
    const long = "б".repeat(7_100);
    const provider = speaking([
      asking("Перше", "call-1"),
      composing("Стисло про питання"),
      said("Відповідь 1"),
      said("Готово."),
    ]);

    await asked(serviceOf(provider.clients, recordOf(long)), SHARED);

    const composer = provider.conversations[1].map((message) => String(message.content));

    assert.equal(composer.length, 1);
    assert.ok(composer[0].includes(long));
    assert.deepEqual(
      provider.conversations[2].map((message) => message.content),
      ["Ти рецензент.", `${sharedMemoryWithTask(composedSharedMemory("Стисло про питання"))}Перше`],
    );
  });

  it("hands the record the compression of the question's memory, under the agent's name and the question, with the lengths and what it cost", async () => {
    const long = "б".repeat(7_100);
    const provider = speaking([
      asking("Перше", "call-1"),
      composing("Стисло про питання"),
      said("Відповідь 1"),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients, recordOf(long)), SHARED);

    assert.equal(answer.memories.length, 1);
    assert.deepEqual(answer.memories[0].facts, {
      agentId: "agent-2",
      questionId: TURN.questionId,
      coversPlace: 5,
      text: "Стисло про питання",
      lengthBefore: 7_100,
      lengthAfter: [..."Стисло про питання"].length,
      compressAt: 70,
      compressTo: 10,
      inputTokens: 100,
      outputTokens: 10,
      money: answer.memories[0].cost?.money,
    });
  });

  it("reads the record again for a second call of the turn with its compression put in the record's place, and does not compress it twice", async () => {
    const long = "б".repeat(7_100);
    const read: unknown[] = [];
    const provider = speaking([
      asking("Перше", "call-1"),
      composing("Стисло про питання"),
      said("Відповідь 1"),
      asking("Друге", "call-2"),
      said("Відповідь 2"),
      said("Готово."),
    ]);

    const answer = await asked(serviceOf(provider.clients, recordOf(long, read)), SHARED);

    assert.deepEqual(read, [
      null,
      {
        text: "Стисло про питання",
        coversPlace: 5,
      },
    ]);
    assert.equal(answer.memories.length, 1);
    assert.deepEqual(
      provider.conversations[4].map((message) => message.content),
      ["Ти рецензент.", `${sharedMemoryWithTask(composedSharedMemory("Стисло про питання"))}Друге`],
    );
  });

  it("goes with the shared memory as it stands while it is under the threshold, no composer asked", async () => {
    const provider = speaking([asking("Перше", "call-1"), said("Відповідь 1"), said("Готово.")]);

    const answer = await asked(serviceOf(provider.clients, recordOf("коротка")), SHARED);

    assert.equal(provider.conversations.length, 3);
    assert.deepEqual(answer.memories, []);
  });

  it("makes a compression of a shared memory under the call of another agent that one called, and tells it up to the first caller", async () => {
    const long = "б".repeat(7_100);
    const OUTER: ReadyAgent = {
      ...SHARED,
      agentId: "agent-3",
      name: "outer",
      tools: [
        {
          source: "agent",
          name: "reviewer",
          description: "Переглядає зміни",
          agentId: "agent-2",
        },
      ],
      memory: "none",
    };
    const OUTER_TOOL: AgentAgentTool = {
      source: "agent",
      name: "outer",
      description: "Зовнішній",
      agentId: "agent-3",
    };
    const provider = speaking([
      new AIMessageChunk({
        content: "",
        tool_calls: [
          {
            name: "outer",
            args: {
              request: "Попроси",
            },
            id: "call-0",
          },
        ],
      }),
      asking("Перше", "call-1"),
      composing("Стисло про питання"),
      said("Відповідь 1"),
      said("Зовнішній готовий"),
      said("Готово."),
    ]);

    const answer = await serviceOf(provider.clients, recordOf(long)).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [OUTER_TOOL],
      agents: [OUTER, SHARED],
    });

    assert.equal(answer.memories.length, 1);
    assert.equal(answer.memories[0].facts?.agentId, "agent-2");
  });

  /** A round of the model that the provider counted: so many tokens in, so many out. */
  const counted = (content: string, input: number, output: number) =>
    new AIMessageChunk({
      content,
      usage_metadata: {
        input_tokens: input,
        output_tokens: output,
        total_tokens: input + output,
      },
    });

  it("tells up what the called agent's own turn cost at its model's prices", async () => {
    const provider = speaking([asking("Перше", "call-1"), counted("Відповідь 1", 1_000, 100), said("Готово.")]);

    const answer = await asked(serviceOf(provider.clients));

    // A thousand tokens in at three per million, a hundred out at fifteen.
    assert.equal(answer.called?.inputTokens, 1_000);
    assert.equal(answer.called?.outputTokens, 100);
    assert.ok(Math.abs((answer.called?.money ?? 0) - 0.0045) < 1e-12);
    assert.deepEqual(answer.memories, []);
  });

  it("adds the turns of every call of the caller's turn, and the turns of the agents they called in turn", async () => {
    const OUTER: ReadyAgent = {
      ...REVIEWER_RUN,
      agentId: "agent-3",
      name: "outer",
      memory: "none",
      tools: [REVIEWER],
    };
    const OUTER_TOOL: AgentAgentTool = {
      source: "agent",
      name: "outer",
      description: "Зовнішній",
      agentId: "agent-3",
    };
    const provider = speaking([
      new AIMessageChunk({
        content: "",
        tool_calls: [
          {
            name: "outer",
            args: {
              request: "Попроси",
            },
            id: "call-0",
          },
        ],
      }),
      // The outer agent asks the reviewer; the reviewer answers; the outer agent answers.
      asking("Перше", "call-1"),
      counted("Відповідь рев'юера", 1_000, 100),
      counted("Відповідь зовнішнього", 2_000, 200),
      said("Готово."),
    ]);

    const answer = await serviceOf(provider.clients).ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      tools: [OUTER_TOOL],
      agents: [OUTER, REVIEWER_RUN],
    });

    // The reviewer's turn is counted once, with the outer agent's own turn, on the caller's step.
    assert.equal(answer.called?.inputTokens, 3_000);
    assert.equal(answer.called?.outputTokens, 300);
  });
});
