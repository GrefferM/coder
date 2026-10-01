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
  OPENROUTER_PROVIDER_ID,
  RUNPOD_CLIENT_NAME,
  RUNPOD_PROVIDER_ID,
} from "../constants";
import {
  LLM_NO_ADDRESS,
  LLM_NO_KEY,
  LLM_PROVIDER_NOT_BUILT,
  LLM_PROVIDER_SILENT,
  RECORD_GONE_NOTE,
  REFUSAL_SAID_SEPARATOR,
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

      return memory;
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
      // A serverless endpoint carries its id in the address, so the key alone is not enough.
      [RUNPOD_PROVIDER_ID]: ["key", "address"],
      [OLLAMA_PROVIDER_ID]: ["address"],
      [LMSTUDIO_PROVIDER_ID]: ["address"],
    });
  });

  it("points LM Studio at the address it was given, with OpenAI's own path on the end of it", () => {
    const model = <ChatOpenAI>AGENT_CLIENTS[LMSTUDIO_PROVIDER_ID].open({
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
    clients: <Record<string, AgentClient>>{
      [TEST_PROVIDER_ID]: {
        needs: ["key"],
        open: () => <BaseChatModel>(<unknown>model),
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
    contextCeiling: 200_000,
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
      remembering("ЗАГАЛЬНА ПАМ'ЯТЬ\n\nТВОЄ ЗАВДАННЯ:\n", read),
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
