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
import type {
  Agent,
  ProjectConfig,
  ProviderAnswer,
  ProviderState,
  WaitingAgent,
  WorkingAgent,
} from "../../../interfaces";
import type { StateFacts } from "../interfaces";
import { aConfig, aModel, aPrompt, anAgent } from "../../../testing";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
  isOff: false,
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

/** State facts with the case's own facts patched in. */
function facts(patch: Partial<StateFacts> = {}): StateFacts {
  return {
    config: CONFIG,
    providers: [OLLAMA],
    answers: machineHolds(["qwen2.5-coder:0.5b"]),
    looks: {},
    working: [],
    waiting: [],
    fellAt: {},
    ...patch,
  };
}

/** A working turn, as the conversation lists it, matched by agent id. */
function working(agentId: string): WorkingAgent {
  return {
    turnId: "turn-1",
    agentId,
    startedAt: 1_000,
    questionId: "question-1",
    askedAt: 900,
  };
}

/** An agent holding work where lines converge. */
function waiting(agentId: string): WaitingAgent {
  return {
    agentId,
    suppliers: [],
    isAwaitingRepeat: false,
  };
}

describe("agentState", () => {
  it("says an agent with nothing in its way is ready", () => {
    expect(agentState(AGENT, facts()).label).toBe(STATE_READY_LABEL);
  });

  it("puts a turn that is out before everything else, and counts it from its start", () => {
    const state = agentState(
      AGENT,
      facts({
        answers: machineHolds([], false),
        working: [working(AGENT.id)],
      }),
    );

    expect(state.label).toBe(STATE_WORKING_LABEL);
    expect(state.mark).toBe("clock");
  });

  it("says an agent holding work at a converging point is waiting, with a grey dot rather than green", () => {
    const state = agentState(
      AGENT,
      facts({
        waiting: [waiting(AGENT.id)],
      }),
    );

    // Waiting, not working: the dot is not live.
    expect(state.label).toBe(STATE_WAITING_LABEL);
    expect(state.color).toBe(STATE_WAITING_COLOR);
    expect(state.mark).toBe("dot");
  });

  it("takes work and a fall by the agent's own id, and not by its neighbour's", () => {
    // Canvas and panel share this answer.
    const state = agentState(
      AGENT,
      facts({
        working: [working("agent-2")],
        fellAt: {
          "agent-2": "2026-08-19T14:26:00.000Z",
        },
      }),
    );

    expect(state.label).toBe(STATE_READY_LABEL);
  });

  it("says a switch somebody threw before anything the machine has to say", () => {
    expect(
      agentState(
        {
          ...AGENT,
          isActive: false,
        },
        facts({
          answers: machineHolds([], false),
        }),
      ).label,
    ).toBe(STATE_OFF_LABEL);
  });

  it("wears the sign rather than a dot where the project itself is broken", () => {
    const state = agentState(
      {
        ...AGENT,
        modelId: "model-gone",
      },
      facts({
        answers: {},
      }),
    );

    expect(state.label).toBe(STATE_WONT_START_LABEL);
    expect(state.mark).toBe("sign");
  });

  it("says a silent provider, with the moment it was asked at", () => {
    const state = agentState(
      AGENT,
      facts({
        answers: machineHolds([], false),
      }),
    );

    expect(state.label).toBe(STATE_PROVIDER_SILENT_LABEL);
    expect(state.at).toBe(ASKED_AT);
  });

  it("says a model the machine no longer holds", () => {
    expect(
      agentState(
        AGENT,
        facts({
          answers: machineHolds(["qwen2.5-coder:1.5b"]),
        }),
      ).label,
    ).toBe(STATE_MODEL_MISSING_LABEL);
  });

  it("says an agent whose own last word was a fall has fallen, with the moment it fell at", () => {
    const state = agentState(
      AGENT,
      facts({
        fellAt: {
          [AGENT.id]: "2026-08-19T14:26:00.000Z",
        },
      }),
    );

    expect(state.label).toBe(STATE_FELL_LABEL);
    expect(state.at?.toISOString()).toBe("2026-08-19T14:26:00.000Z");
  });

  it("puts what the machine says now before a fall that already happened", () => {
    expect(
      agentState(
        AGENT,
        facts({
          answers: machineHolds([], false),
          fellAt: {
            [AGENT.id]: "2026-08-19T14:26:00.000Z",
          },
        }),
      ).label,
    ).toBe(STATE_PROVIDER_SILENT_LABEL);
  });

  it("says nothing about the machine where nothing was asked of it", () => {
    expect(
      agentState(
        AGENT,
        facts({
          answers: {},
        }),
      ).label,
    ).toBe(STATE_READY_LABEL);
  });
});
