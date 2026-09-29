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
import { LLM_NO_ADDRESS, LLM_NO_KEY, LLM_PROVIDER_NOT_BUILT, LLM_PROVIDER_SILENT } from "../../../contracts";
import { LlmService } from "./llm.service";
import { RunPodChat } from "./runpod-chat.service";
import { ToolArguments } from "./tool-arguments.service";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseMessage } from "@langchain/core/messages";
import { SERVER_NAME_SLOT, SERVER_NOT_THERE_NOTE } from "../constants";
import type {
  AgentChunk,
  AgentClient,
  AgentCommandTool,
  AgentKeyStore,
  AgentServerTool,
  AgentVoice,
  ProjectMcpServer,
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
  model: "claude-sonnet-4-5",
  directory: "/tmp",
  maxCalls: 10,
  temperature: 0.3,
  answerCeiling: 4096,
  tools: [],
  servers: [],
  systemPrompt: null,
  messages: [
    {
      from: "person" as const,
      text: "Привіт",
    },
  ],
};

function voice(heard: AgentChunk[]): AgentVoice {
  return {
    say: (chunk) => {
      heard.push(chunk);
    },
  };
}

/** A stand-in for whoever reaches servers; the tests that need one give their own. */
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
    const llmService = new LlmService(keyStore(null), voice([]), runner(), noServers(), toolArguments, AGENT_CLIENTS);

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
    const llmService = new LlmService(keyStore(null), voice([]), runner(), noServers(), toolArguments, AGENT_CLIENTS);

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "openrouter",
      }),
      new RegExp(LLM_NO_KEY),
    );
  });

  it("does not call out at all when this machine holds no key for the provider", async () => {
    const llmService = new LlmService(keyStore(null), voice([]), runner(), noServers(), toolArguments, AGENT_CLIENTS);

    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: "anthropic",
      }),
      new RegExp(LLM_NO_KEY),
    );
  });

  it("counts an emptied key as no key, rather than calling out with nothing", async () => {
    const llmService = new LlmService(keyStore(""), voice([]), runner(), noServers(), toolArguments, AGENT_CLIENTS);

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

/** The RunPod queue, standing in for the real one: every address asked is written down, and a job comes back done. */
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
      // A serverless endpoint carries its id in the address, so the key alone says nothing about where to knock.
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
    // The endpoint's id lives in the address, and the model is the name that endpoint serves: it is never sent.
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

/** The provider id the fake client below answers to; no real provider is opened in these tests. */
const TEST_PROVIDER_ID = "a provider that exists only here";

/** One local server, as the project file holds it — the reach travels beside the tools that name it. */
const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "filesystem",
  isLocal: true,
  run: "node server.js",
  address: "",
  signIn: "none",
  env: [],
};

/** One command with one number parameter — enough for the check to have something to hold to. */
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

/** A provider that says the given rounds in order and remembers the conversation it was handed each time. */
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
    /** The schemas the tools were bound with, exactly as the model was given them. */
    boundTools: bound,
    clients: <Record<string, AgentClient>>{
      [TEST_PROVIDER_ID]: {
        needs: ["key"],
        open: () => <BaseChatModel>(<unknown>model),
      },
    },
  };
}

/** A provider that answers the call with a fault of its own, the way a wrong key answers. */
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

/** A stand-in for the servers, remembering what it was asked and answering as told. */
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

/** One function of one server, with the schema the server itself published. */
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
    // Some clients drop the chunk that carries the end word; the count the provider sent says the same thing.
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
    // A provider that answers 1000 tokens under a ceiling of 8 ignored the ceiling; nothing of that answer was cut.
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
      new LlmService(keyStore("sk-1"), voice([]), runner(), noServers(), toolArguments, clients).ask({
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
    // One row, said once — a refused call never went out, so it never comes back either.
    const said = heard.map((chunk) => chunk.call).filter((one) => one !== null);

    assert.deepEqual(
      said.map((one) => [one.name, one.state, one.exitCode]),
      [["find_deep", "refused", null]],
    );
    assert.equal(said[0].refusal, "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]");

    // The model heard the same refusal in its own words, inside the same turn.
    assert.equal(
      provider.conversations[1]?.at(-1)?.content,
      "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
    );
    assert.equal(answer.text, "Гаразд, беру число.");

    // The turn hands the call back the way the record and the chat both read it.
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
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      maxCalls: 2,
      tools: [FIND_DEEP],
    });

    // One round of the model and one refused call are the whole of a ceiling of two.
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
      toolArguments,
      provider.clients,
    );

    const answer = await llmService.ask({
      ...TURN,
      providerId: TEST_PROVIDER_ID,
      maxCalls: 0,
      tools: [FIND_DEEP],
    });

    // Nought is no ceiling: the call is made and the turn goes on to the model's own last word.
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
      toolArguments,
      faulting(
        Object.assign(new Error("User not found."), {
          headers: {
            "set-cookie": "секрет",
          },
        }),
      ),
    );

    /** A refusal crosses as an answer, written nowhere: the library's object carries provider headers and cookies. */
    await assert.rejects(
      llmService.ask({
        ...TURN,
        providerId: TEST_PROVIDER_ID,
      }),
      new RegExp(LLM_ASK_FAILED),
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
    // The reach of the server is answered from the list that travelled beside the tools, by the tool's id alone.
    const { callId, signal, ...went } = <{ callId: string; signal: AbortSignal }>asked[0];

    assert.deepEqual(went, {
      server: SERVER,
      directory: TURN.directory,
      functionName: "list_roots",
      arguments: {
        deep: true,
      },
    });
    // The turn's own stop signal travels with the call, so «ЗУПИНИТИ» reaches the server mid-request.
    assert.ok(signal instanceof AbortSignal);
    // The call goes out under the id the record keeps it by, so what fails can be led back to.
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
    // Nothing is pinned on a server's function: there is no place to pin one.
    assert.deepEqual(said[1].pinned, []);
    assert.deepEqual(
      answer.calls.map((one) => [one.name, one.output, one.refusal]),
      [["list_roots", "два корені", ""]],
    );
  });

  it("says a server's «ні» as an end of its own, and the words go to the model whole", async () => {
    // «функція є, але сервер сказав "ні"» — not a break and not a refusal of ours, so neither word fits.
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
    // The server's own words are the answer: they go to the model as they came, and nothing of ours is added.
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
    await new LlmService(keyStore("sk-1"), voice([]), runner(), noServers(), toolArguments, provider.clients).ask({
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
    // The model is told, in its own words, inside the same turn; the record holds no call at all.
    assert.equal(
      provider.conversations[1]?.at(-1)?.content,
      SERVER_NOT_THERE_NOTE.replace(SERVER_NAME_SLOT, "list_roots"),
    );
    assert.deepEqual(answer.calls, []);
    assert.equal(answer.text, "Зрозумів.");
  });
});
