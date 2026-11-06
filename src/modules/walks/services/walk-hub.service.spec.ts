import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WalkHub } from "./walk-hub.service";
import { WALKS_NOT_OPEN } from "../constants";
import { aConfig, aModel, anAgent } from "../../../utils/testing";
import { MemoryRecord, RecordingVoice, ScriptedLlm } from "../testing";
import type { McpLook, ProviderState } from "../../../contracts";
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

/** Providers that list the one. */
class KnownProviders implements ProviderLister {
  async list(): Promise<ProviderState[]> {
    return [PROVIDER];
  }
}

/** Servers that are never asked. */
class NoServers implements ServerLooker {
  async look(): Promise<McpLook> {
    throw new Error("no server was to be looked at");
  }
}

const AGENT = anAgent({
  id: "agent-1",
  memory: "none",
});
const CONFIG = aConfig({
  models: [aModel()],
  agents: [AGENT],
});

function hubOn(script: Record<string, string>): { hub: WalkHub; record: MemoryRecord; voice: RecordingVoice } {
  const record = new MemoryRecord();
  const voice = new RecordingVoice();
  const llm = new ScriptedLlm(script);
  const providers = new KnownProviders();
  const servers = new NoServers();
  const hub = new WalkHub({
    record,
    llm,
    providers,
    servers,
    voice,
  });

  return {
    hub,
    record,
    voice,
  };
}

describe("WalkHub", () => {
  it("has no walks to show before a project's conversation is opened", () => {
    assert.equal(hubOn({}).hub.snapshot(), null);
  });

  it("refuses a question that reaches it before any conversation is open", () => {
    assert.throws(
      () =>
        hubOn({}).hub.put({
          agentId: "agent-1",
          text: "питання",
          attached: [],
          recordings: [],
        }),
      {
        message: WALKS_NOT_OPEN,
      },
    );
  });

  it("opens with nothing said, and keeps the walks of a project that is opened again", async () => {
    const { hub, voice } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put({
      agentId: "agent-1",
      text: "питання",
      attached: [],
      recordings: [],
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const again = hub.open("/work/coder", CONFIG);

    assert.ok(Object.keys(again.walks).length > 0);
    assert.ok(voice.snapshots.length > 0);
  });

  it("puts a question to the agent named and answers with the walk's id", async () => {
    const { hub, record } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);

    const put = hub.put({
      agentId: "agent-1",
      text: "питання",
      attached: [],
      recordings: [],
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.equal(typeof put?.walkId, "string");
    assert.equal(typeof put?.questionId, "string");
    assert.equal(record.steps.length, 1);
  });

  it("writes the recordings a question was said with beside that question, by the question's own id", async () => {
    const { hub, record } = hubOn({
      "agent-1": "відповідь",
    });
    const recording = {
      audio: new Uint8Array([1, 2, 3]),
      mimeType: "audio/webm",
      durationMs: 7_000,
      peaks: [0.4, 0.8],
    };

    hub.open("/work/coder", CONFIG);

    const put = hub.put({
      agentId: "agent-1",
      text: "питання",
      attached: [],
      recordings: [recording],
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const [asked] = record.questions;

    assert.equal(asked.questionId, put?.questionId);
    assert.deepEqual(asked.recordings, [recording]);
  });

  it("takes no question for an agent the project does not hold, or for words that say nothing", () => {
    const { hub } = hubOn({});

    hub.open("/work/coder", CONFIG);

    assert.equal(
      hub.put({
        agentId: "agent-9",
        text: "питання",
        attached: [],
        recordings: [],
      }),
      null,
    );
    assert.equal(
      hub.put({
        agentId: "agent-1",
        text: "   ",
        attached: [],
        recordings: [],
      }),
      null,
    );
  });

  it("takes no second question while a walk is out", () => {
    const { hub } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put({
      agentId: "agent-1",
      text: "перше",
      attached: [],
      recordings: [],
    });

    assert.equal(
      hub.put({
        agentId: "agent-1",
        text: "друге",
        attached: [],
        recordings: [],
      }),
      null,
    );
  });

  it("is idle at once where no conversation is open, and after the walk where one is", async () => {
    const { hub, record } = hubOn({
      "agent-1": "відповідь",
    });

    await hub.whenIdle();
    hub.open("/work/coder", CONFIG);
    hub.put({
      agentId: "agent-1",
      text: "питання",
      attached: [],
      recordings: [],
    });
    await hub.whenIdle();

    assert.equal(record.steps.length, 1);
  });

  it("reads the config it was last handed, so an agent added meanwhile can be asked", () => {
    const { hub } = hubOn({});
    const added = anAgent({
      id: "agent-2",
    });

    hub.open("/work/coder", CONFIG);
    hub.configure(
      aConfig({
        models: [aModel()],
        agents: [AGENT, added],
      }),
    );

    assert.equal(
      typeof hub.put({
        agentId: "agent-2",
        text: "питання",
        attached: [],
        recordings: [],
      })?.walkId,
      "string",
    );
  });

  it("falls silent about a conversation once another project's is open", async () => {
    const { hub, voice } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put({
      agentId: "agent-1",
      text: "питання",
      attached: [],
      recordings: [],
    });
    hub.open("/work/other", CONFIG);

    const told = voice.snapshots.length;

    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(voice.snapshots.length, told);
  });
});
