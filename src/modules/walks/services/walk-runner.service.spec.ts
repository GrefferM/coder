import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WalkRunner } from "./walk-runner.service";
import { LLM_NO_KEY, RUN_STEP_DONE, RUN_STEP_FAILED } from "../../../contracts";
import { aConfig, aLink, aModel, anAgent } from "../../../utils/testing";
import { MemoryRecord, QuietListener, ScriptedLlm, StoodProject } from "../testing";
import type { Agent, ChatMessage, McpLook, ProjectConfig, ProviderState } from "../../../contracts";
import type { ProviderLister, ServerLooker } from "../interfaces";

const PROVIDER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "…abcd",
  address: null,
  isOff: false,
};

/** Providers that list what they were handed, the one by default. */
class KnownProviders implements ProviderLister {
  constructor(private readonly held: ProviderState[] = [PROVIDER]) {}

  async list(): Promise<ProviderState[]> {
    return this.held;
  }
}

/** Servers that are never asked. */
class NoServers implements ServerLooker {
  async look(): Promise<McpLook> {
    throw new Error("no server was to be looked at");
  }
}

/** A conversation on fakes: the runner, and what it wrote and asked. */
interface Stood {
  runner: WalkRunner;
  record: MemoryRecord;
  llm: ScriptedLlm;
  listener: QuietListener;
}

function agent(id: string, patch: Partial<Agent> = {}): Agent {
  return anAgent({
    id,
    name: `Агент ${id}`,
    memory: "none",
    ...patch,
  });
}

function standing(
  config: ProjectConfig,
  script: Record<string, string | Error>,
  providers: ProviderState[] = [PROVIDER],
): Stood {
  const record = new MemoryRecord();
  const llm = new ScriptedLlm(script);
  const listener = new QuietListener();
  const known = new KnownProviders(providers);
  const project = new StoodProject(config);
  const servers = new NoServers();
  const runner = new WalkRunner({
    project,
    record,
    llm,
    providers: known,
    servers,
    listener,
  });

  return {
    runner,
    record,
    llm,
    listener,
  };
}

function said(stood: Stood): ChatMessage[] {
  return Object.values(stood.runner.snapshot().walks).flatMap((walk) => walk.said);
}

describe("WalkRunner", () => {
  it("walks a question down a line: both agents answer, both steps are written, and the run is closed", async () => {
    const first = agent("agent-1");
    const second = agent("agent-2");
    const config = aConfig({
      models: [aModel()],
      agents: [first, second],
      links: [
        aLink({
          from: "agent-1",
          to: "agent-2",
        }),
      ],
    });
    const stood = standing(config, {
      "agent-1": "перша відповідь",
      "agent-2": "друга відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.deepEqual(
      stood.llm.asked.map((asked) => asked.agentId),
      ["agent-1", "agent-2"],
    );
    assert.deepEqual(stood.record.states(), [RUN_STEP_DONE, RUN_STEP_DONE]);
    assert.equal(stood.record.opened, 1);
    assert.equal(stood.record.closed.length, 1);
    assert.equal(stood.runner.runId(), "run-1");
    assert.equal(stood.runner.isBusy(), false);
  });

  it("asks nothing of a local provider turned off on this machine, and writes the step as never begun", async () => {
    // The turn itself is where a local provider is pinged, so a turn that never goes pings nobody.
    const asker = agent("agent-1");
    const config = aConfig({
      models: [
        aModel({
          provider: "ollama",
        }),
      ],
      agents: [asker],
    });
    const stood = standing(
      config,
      {
        "agent-1": "відповідь",
      },
      [
        {
          id: "ollama",
          name: "Ollama",
          kind: "local",
          needs: ["address"],
          takesTools: true,
          customaryAddress: "http://localhost:11434",
          keyHint: null,
          address: null,
          isOff: true,
        },
      ],
    );

    stood.runner.put({
      agent: asker,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.deepEqual(stood.llm.asked, []);
    assert.deepEqual(stood.record.states(), ["providerOff"]);
  });

  it("gives the second agent what the first said", async () => {
    const first = agent("agent-1");
    const second = agent("agent-2");
    const config = aConfig({
      models: [aModel()],
      agents: [first, second],
      links: [
        aLink({
          from: "agent-1",
          to: "agent-2",
        }),
      ],
    });
    const stood = standing(config, {
      "agent-1": "перша відповідь",
      "agent-2": "друга відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    const [, handed] = stood.llm.asked;

    assert.ok(handed?.messages.at(-1)?.text.includes("перша відповідь"));
  });

  it("says the question, the answers and the line between them in the stream", async () => {
    const first = agent("agent-1");
    const second = agent("agent-2");
    const config = aConfig({
      models: [aModel()],
      agents: [first, second],
      links: [
        aLink({
          from: "agent-1",
          to: "agent-2",
        }),
      ],
    });
    const stood = standing(config, {
      "agent-1": "перша відповідь",
      "agent-2": "друга відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    const words = said(stood);

    assert.ok(words.some((card) => card.from === "person" && card.text === "питання"));
    assert.ok(words.some((card) => card.from === "agent" && card.text === "перша відповідь"));
    assert.ok(words.some((card) => card.from === "handoff"));
    assert.ok(words.some((card) => card.from === "agent" && card.text === "друга відповідь"));
  });

  it("stops the walk where an agent falls, and writes the fall as a failed step", async () => {
    const first = agent("agent-1");
    const second = agent("agent-2");
    const config = aConfig({
      models: [aModel()],
      agents: [first, second],
      links: [
        aLink({
          from: "agent-1",
          to: "agent-2",
        }),
      ],
    });
    const stood = standing(config, {
      "agent-1": new Error("LLM_ASK_FAILED :: Provider returned error"),
      "agent-2": "друга відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    const fall = said(stood).find((card) => card.isFailure);

    assert.deepEqual(stood.record.states(), [RUN_STEP_FAILED]);
    assert.deepEqual(
      stood.llm.asked.map((asked) => asked.agentId),
      ["agent-1"],
    );
    assert.ok(fall?.note?.includes("Provider returned error"));
    assert.equal(stood.record.closed.length, 1);
  });

  it("says a turn the machine refused never began, rather than that it fell", async () => {
    const first = agent("agent-1");
    const config = aConfig({
      models: [aModel()],
      agents: [first],
    });
    const stood = standing(config, {
      "agent-1": new Error(LLM_NO_KEY),
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    const card = said(stood).find((one) => one.from === "agent");

    assert.equal(card?.notStarted, "noKey");
    assert.equal(card?.isFailure, false);
  });

  it("does not ask the model for an agent whose model is gone", async () => {
    const first = agent("agent-1", {
      modelId: "nowhere",
    });
    const config = aConfig({
      models: [aModel()],
      agents: [first],
    });
    const stood = standing(config, {});

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.equal(stood.llm.asked.length, 0);
    assert.equal(said(stood).find((card) => card.from === "agent")?.notStarted, "noModel");
  });

  it("tells its listener of every change, every write and the provider that answered", async () => {
    const first = agent("agent-1");
    const config = aConfig({
      models: [aModel()],
      agents: [first],
    });
    const stood = standing(config, {
      "agent-1": "відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "питання",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.ok(stood.listener.changes > 0);
    assert.ok(stood.listener.writes > 0);
    assert.deepEqual(stood.listener.heards, [
      {
        providerId: "openrouter",
        isAnswering: true,
      },
    ]);
  });

  it("goes on in the same run when a second question is put in the same conversation", async () => {
    const first = agent("agent-1");
    const config = aConfig({
      models: [aModel()],
      agents: [first],
    });
    const stood = standing(config, {
      "agent-1": "відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "перше",
      attached: [],
    });
    await stood.runner.whenIdle();
    stood.runner.put({
      agent: first,
      text: "друге",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.equal(stood.record.opened, 1);
    assert.equal(stood.record.questions.length, 2);
    assert.equal(stood.record.steps.length, 2);
  });

  it("opens a run of its own after a fresh stream", async () => {
    const first = agent("agent-1");
    const config = aConfig({
      models: [aModel()],
      agents: [first],
    });
    const stood = standing(config, {
      "agent-1": "відповідь",
    });

    stood.runner.put({
      agent: first,
      text: "перше",
      attached: [],
    });
    await stood.runner.whenIdle();
    stood.runner.fresh();
    stood.runner.put({
      agent: first,
      text: "друге",
      attached: [],
    });
    await stood.runner.whenIdle();

    assert.equal(stood.record.opened, 2);
    assert.equal(stood.runner.runId(), "run-2");
  });
});
