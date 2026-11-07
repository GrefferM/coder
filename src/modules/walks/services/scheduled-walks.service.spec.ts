import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ScheduledWalks } from "./scheduled-walks.service";
import { aConfig, aModel, anAgent } from "../../../utils/testing";
import { MemoryRecord, RecordingVoice, ScriptedLlm } from "../testing";
import type { McpLook, ProviderState, ScheduledTask } from "../../../contracts";
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
const TASK: ScheduledTask = {
  scheduleId: "schedule-1",
  directory: "/work/coder",
  config: CONFIG,
  agent: AGENT,
  task: "Перевір, чи зелений main.",
};

interface Stood {
  scheduled: ScheduledWalks;
  record: MemoryRecord;
  voice: RecordingVoice;
  llm: ScriptedLlm;
}

function standing(): Stood {
  const record = new MemoryRecord();
  const voice = new RecordingVoice();
  const llm = new ScriptedLlm({
    "agent-1": "Зелений.",
  });
  const providers = new KnownProviders();
  const servers = new NoServers();
  const scheduled = new ScheduledWalks({
    record,
    llm,
    providers,
    servers,
    voice,
  });

  return {
    scheduled,
    record,
    voice,
    llm,
  };
}

describe("ScheduledWalks", () => {
  it("puts the task to the agent and writes a run that names the schedule", async () => {
    const { scheduled, record, llm } = standing();

    scheduled.ask(TASK);
    await scheduled.whenIdle();

    assert.equal(llm.asked.length, 1);
    assert.deepEqual(record.states(), ["done"]);
    assert.equal(record.questions[0].asked, "Перевір, чи зелений main.");
    assert.equal(record.questions[0].scheduleId, "schedule-1");
  });

  it("says the task is out until its walk ends", async () => {
    const { scheduled } = standing();

    scheduled.ask(TASK);

    assert.equal(scheduled.isOut("schedule-1"), true);

    await scheduled.whenIdle();

    assert.equal(scheduled.isOut("schedule-1"), false);
  });

  it("opens a row of its own for every task, so each tick is a run in the history", async () => {
    const { scheduled, record } = standing();

    scheduled.ask(TASK);
    await scheduled.whenIdle();
    scheduled.ask(TASK);
    await scheduled.whenIdle();

    assert.equal(record.opened, 2);
  });

  it("tells the screen the record was written, and nothing of a walk it does not show", async () => {
    const { scheduled, voice } = standing();

    scheduled.ask(TASK);
    await scheduled.whenIdle();

    assert.ok(voice.writes > 0);
    assert.deepEqual(voice.snapshots, []);
  });

  it("knows nothing out for a schedule that never put a task", () => {
    assert.equal(standing().scheduled.isOut("schedule-1"), false);
  });
});
