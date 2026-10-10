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
  const hub = new WalkHub({
    record,
    llm: new ScriptedLlm(script),
    providers: new KnownProviders(),
    servers: new NoServers(),
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
    assert.throws(() => hubOn({}).hub.put("agent-1", "питання", []), {
      message: WALKS_NOT_OPEN,
    });
  });

  it("opens with nothing said, and keeps the walks of a project that is opened again", async () => {
    const { hub, voice } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put("agent-1", "питання", []);

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

    const runKey = hub.put("agent-1", "питання", []);

    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.equal(typeof runKey, "string");
    assert.equal(record.steps.length, 1);
  });

  it("takes no question for an agent the project does not hold, or for words that say nothing", () => {
    const { hub } = hubOn({});

    hub.open("/work/coder", CONFIG);

    assert.equal(hub.put("agent-9", "питання", []), null);
    assert.equal(hub.put("agent-1", "   ", []), null);
  });

  it("takes no second question while a walk is out", () => {
    const { hub } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put("agent-1", "перше", []);

    assert.equal(hub.put("agent-1", "друге", []), null);
  });

  it("is idle at once where no conversation is open, and after the walk where one is", async () => {
    const { hub, record } = hubOn({
      "agent-1": "відповідь",
    });

    await hub.whenIdle();
    hub.open("/work/coder", CONFIG);
    hub.put("agent-1", "питання", []);
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

    assert.equal(typeof hub.put("agent-2", "питання", []), "string");
  });

  it("falls silent about a conversation once another project's is open", async () => {
    const { hub, voice } = hubOn({
      "agent-1": "відповідь",
    });

    hub.open("/work/coder", CONFIG);
    hub.put("agent-1", "питання", []);
    hub.open("/work/other", CONFIG);

    const told = voice.snapshots.length;

    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(voice.snapshots.length, told);
  });
});
