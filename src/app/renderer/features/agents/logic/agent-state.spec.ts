import { describe, expect, it } from "vitest";
import { agentState } from "./agent-state";
import {
  STATE_FELL_LABEL,
  STATE_MODEL_MISSING_LABEL,
  STATE_OFF_LABEL,
  STATE_PROVIDER_SILENT_LABEL,
  STATE_READY_LABEL,
  STATE_WAITING_COLOR,
  STATE_WAITING_LABEL,
  STATE_WONT_START_LABEL,
  STATE_WORKING_LABEL,
} from "../constants";
import type { Agent, ProjectConfig, ProviderAnswer, ProviderState } from "../../../interfaces";
import { aConfig, aModel, aPrompt, anAgent } from "../../../testing";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

const AGENT: Agent = anAgent({
  name: "ЗВІТАР",
  promptId: "prompt-1",
  x: 0,
  y: 0,
  temperature: 0.3,
});

const CONFIG: ProjectConfig = aConfig({
  models: [
    aModel({
      title: "qwen2.5-coder:0.5b",
      provider: "ollama",
      inputPrice: 0,
      outputPrice: 0,
      contextCeiling: 200000,
    }),
  ],
  prompts: [
    aPrompt({
      name: "Правки коду",
      text: "Ти правиш код.",
    }),
  ],
  agents: [AGENT],
});

const ASKED_AT = new Date(2026, 7, 19, 14, 26);

function machineHolds(names: string[], isAnswering = true): Record<string, ProviderAnswer> {
  return {
    ollama: {
      isAnswering,
      models: names.map((name) => ({
        name,
        sizeBytes: null,
      })),
      askedAt: ASKED_AT,
    },
  };
}

describe("agentState", () => {
  it("says an agent with nothing in its way is ready", () => {
    expect(agentState(AGENT, CONFIG, [OLLAMA], machineHolds(["qwen2.5-coder:0.5b"]), false).label).toBe(
      STATE_READY_LABEL,
    );
  });

  it("puts a turn that is out before everything else, and counts it from its start", () => {
    const state = agentState(AGENT, CONFIG, [OLLAMA], machineHolds([], false), true);

    expect(state.label).toBe(STATE_WORKING_LABEL);
    expect(state.mark).toBe("clock");
  });

  it("says an agent holding work at a converging point is waiting, with a grey dot rather than green", () => {
    const state = agentState(AGENT, CONFIG, [OLLAMA], machineHolds(["qwen2.5-coder:0.5b"]), false, null, true);

    // Alive, but it is not the one working, so the dot does not read as live work.
    expect(state.label).toBe(STATE_WAITING_LABEL);
    expect(state.color).toBe(STATE_WAITING_COLOR);
    expect(state.mark).toBe("dot");
  });

  it("says a switch somebody threw before anything the machine has to say", () => {
    expect(
      agentState(
        {
          ...AGENT,
          isActive: false,
        },
        CONFIG,
        [OLLAMA],
        machineHolds([], false),
        false,
      ).label,
    ).toBe(STATE_OFF_LABEL);
  });

  it("wears the sign rather than a dot where the project itself is broken", () => {
    const state = agentState(
      {
        ...AGENT,
        modelId: "model-gone",
      },
      CONFIG,
      [OLLAMA],
      {},
      false,
    );

    expect(state.label).toBe(STATE_WONT_START_LABEL);
    expect(state.mark).toBe("sign");
  });

  it("says a silent provider, with the moment it was asked at", () => {
    const state = agentState(AGENT, CONFIG, [OLLAMA], machineHolds([], false), false);

    expect(state.label).toBe(STATE_PROVIDER_SILENT_LABEL);
    expect(state.at).toBe(ASKED_AT);
  });

  it("says a model the machine no longer holds", () => {
    expect(agentState(AGENT, CONFIG, [OLLAMA], machineHolds(["qwen2.5-coder:1.5b"]), false).label).toBe(
      STATE_MODEL_MISSING_LABEL,
    );
  });

  it("says an agent whose own last word was a fall has fallen, with the moment it fell at", () => {
    const state = agentState(
      AGENT,
      CONFIG,
      [OLLAMA],
      machineHolds(["qwen2.5-coder:0.5b"]),
      false,
      "2026-08-19T14:26:00.000Z",
    );

    expect(state.label).toBe(STATE_FELL_LABEL);
    expect(state.at?.toISOString()).toBe("2026-08-19T14:26:00.000Z");
  });

  it("puts what the machine says now before a fall that already happened", () => {
    expect(agentState(AGENT, CONFIG, [OLLAMA], machineHolds([], false), false, "2026-08-19T14:26:00.000Z").label).toBe(
      STATE_PROVIDER_SILENT_LABEL,
    );
  });

  it("says nothing about the machine where nothing was asked of it", () => {
    expect(agentState(AGENT, CONFIG, [OLLAMA], {}, false).label).toBe(STATE_READY_LABEL);
  });
});
