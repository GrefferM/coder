import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { AgentAsk } from "./agent-ask.service";
import { WalkHub } from "./walk-hub.service";
import { aConfig, aModel, anAgent } from "../../../contracts/testing";
import { MemoryRecord, RecordingVoice, ScriptedLlm } from "../testing";
import { createProvidersModule } from "../../providers";
import type { McpLook, ProjectConfig, ProviderState } from "../../../contracts";
import type { ProjectCatalog, ProviderLister, ServerLooker } from "../interfaces";
import type { ProviderKeyStore } from "../../providers";

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

class KnownProviders implements ProviderLister {
  async list(): Promise<ProviderState[]> {
    return [PROVIDER];
  }
}

class NoServers implements ServerLooker {
  async look(): Promise<McpLook> {
    throw new Error("no server was to be looked at");
  }
}

const CONFIG = aConfig({
  name: "Coder",
  models: [aModel()],
  agents: [
    anAgent({
      id: "agent-1",
      name: "Редактор",
      memory: "none",
    }),
  ],
});

/** A catalogue that holds the one project, whatever it is asked for. */
function catalogue(config: ProjectConfig = CONFIG): ProjectCatalog {
  return {
    find: async () => ({
      directory: "/work/coder",
      config,
    }),
  };
}

/** The key store a command line holds, with one key in it. */
class OneKey implements ProviderKeyStore {
  async set(payload: { key: string; value: string }): Promise<{ key: string; hint: string }> {
    return {
      key: payload.key,
      hint: "sk-or-•••",
    };
  }

  async value(): Promise<string | null> {
    return "sk-or-longvalue";
  }

  async remove(): Promise<void> {}

  async hints(): Promise<{ key: string; hint: string }[]> {
    return [];
  }
}

function askOn(
  script: Record<string, string | Error>,
  projects: ProjectCatalog = catalogue(),
  providers: ProviderLister = new KnownProviders(),
  llm: ScriptedLlm = new ScriptedLlm(script),
) {
  const record = new MemoryRecord();
  const servers = new NoServers();
  const voice = new RecordingVoice();
  const hub = new WalkHub({
    record,
    llm,
    providers,
    servers,
    voice,
  });

  return new AgentAsk(hub, projects);
}

const ASKED = {
  project: "Coder",
  agent: "редактор",
  question: "Що з цим робити?",
};

describe("AgentAsk", () => {
  it("walks the question to its end and hands back the conversation as plain text", async () => {
    const answered = await askOn({
      "agent-1": "Нічого, все гаразд.",
    }).run(ASKED);

    assert.equal(answered.hasFallen, false);
    assert.match(answered.text, /Що з цим робити\?/);
    assert.match(answered.text, /Нічого, все гаразд\./);
  });

  it("says the walk fell where a turn fell", async () => {
    const answered = await askOn({
      "agent-1": new Error("LLM_ASK_FAILED :: Provider returned error"),
    }).run(ASKED);

    assert.equal(answered.hasFallen, true);
    assert.match(answered.text, /Provider returned error/);
  });

  it("rejects, naming the agents, where the project holds none of that name", async () => {
    await assert.rejects(
      askOn({}).run({
        ...ASKED,
        agent: "Хтось",
      }),
      /Хтось.*Редактор/,
    );
  });

  it("rejects where the project cannot be found", async () => {
    const lost: ProjectCatalog = {
      find: async () => {
        throw new Error("Немає проєкту");
      },
    };

    await assert.rejects(askOn({}, lost).run(ASKED), /Немає проєкту/);
  });

  it("rejects a question of nothing but spaces", async () => {
    await assert.rejects(
      askOn({}).run({
        ...ASKED,
        question: "   ",
      }),
      /не прийняла питання/,
    );
  });

  it("stops the turn on a provider this machine turned off, read from the same folder the window keeps", async () => {
    // The command line opens its providers over the window's userData, so it reads the same off file.
    const userData = await mkdtemp(path.join(os.tmpdir(), "coder-agent-off-"));
    const machine = createProvidersModule(new OneKey(), userData);
    const llm = new ScriptedLlm({
      "agent-1": "Нічого, все гаразд.",
    });

    await machine.service.switchOff({
      providerId: "openrouter",
      isOff: true,
    });

    const answered = await askOn({}, catalogue(), machine.service, llm).run(ASKED);

    assert.deepEqual(llm.asked, []);
    assert.equal(answered.hasFallen, true);
    assert.match(answered.text, /Провайдер OpenRouter вимкнено на цій машині/);
  });
});
