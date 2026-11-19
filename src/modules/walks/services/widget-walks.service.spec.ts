import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WidgetWalks } from "./widget-walks.service";
import { aConfig, aModel, anAgent } from "../../../utils/testing";
import { MemoryRecord, RecordingVoice, ScriptedLlm } from "../testing";
import type { McpLook, ProviderState, WidgetAsk, WidgetWalk } from "../../../contracts";
import type { ProviderLister, ServerLooker, WidgetVoice } from "../interfaces";

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

/** The widget, keeping every sphere's conversation it is told of. */
class HeardWidget implements WidgetVoice {
  readonly walks: WidgetWalk[] = [];

  changed(walk: WidgetWalk): void {
    this.walks.push(walk);
  }
}

const AGENT_ID = "6f1c1c4e-2b0a-4c43-9a51-7e3d2f1a0b01";
const AGENT = anAgent({
  id: AGENT_ID,
  memory: "none",
});
const CONFIG = aConfig({
  models: [aModel()],
  agents: [AGENT],
});
const ASK: WidgetAsk = {
  directory: "/work/english",
  config: CONFIG,
  agentId: AGENT_ID,
  text: "How do I say «дякую» politely?",
  attached: [],
};

interface Stood {
  widgetWalks: WidgetWalks;
  record: MemoryRecord;
  widget: HeardWidget;
  llm: ScriptedLlm;
}

function standing(): Stood {
  const record = new MemoryRecord();
  const voice = new RecordingVoice();
  const widget = new HeardWidget();
  const llm = new ScriptedLlm({
    [AGENT_ID]: "Thank you very much.",
  });
  const providers = new KnownProviders();
  const servers = new NoServers();
  const widgetWalks = new WidgetWalks({
    record,
    llm,
    providers,
    servers,
    voice,
    widget,
  });

  return {
    widgetWalks,
    record,
    widget,
    llm,
  };
}

describe("WidgetWalks", () => {
  it("puts the question to the sphere's agent and tells the widget by that sphere", async () => {
    const { widgetWalks, llm, widget } = standing();

    assert.notEqual(widgetWalks.put(ASK), null);

    await widgetWalks.whenIdle();

    assert.equal(llm.asked.length, 1);
    assert.ok(widget.walks.length > 0);
    assert.ok(widget.walks.every((walk) => walk.agentId === AGENT_ID));
  });

  it("keeps the sphere's conversation between questions, in one row of the record", async () => {
    const { widgetWalks, record } = standing();

    widgetWalks.put(ASK);
    await widgetWalks.whenIdle();
    widgetWalks.put({
      ...ASK,
      text: "And less formally?",
    });
    await widgetWalks.whenIdle();

    assert.equal(record.opened, 1);
  });

  it("puts nothing for an agent the project does not hold, or for no words", () => {
    const { widgetWalks } = standing();

    assert.equal(
      widgetWalks.put({
        ...ASK,
        agentId: "0b7a3f52-5a1e-4f0e-8d3c-2f9b1e6a7c10",
      }),
      null,
    );
    assert.equal(
      widgetWalks.put({
        ...ASK,
        text: "  ",
      }),
      null,
    );
  });

  it("hands back the sphere's conversation, and none once another project is the widget's", async () => {
    const { widgetWalks } = standing();

    widgetWalks.put(ASK);
    await widgetWalks.whenIdle();

    assert.deepEqual(
      widgetWalks.walks(ASK.directory).map((walk) => walk.agentId),
      [AGENT_ID],
    );
    assert.deepEqual(widgetWalks.walks("/work/other"), []);
  });
});
