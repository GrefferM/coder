import { describe, expect, it } from "vitest";
import { agentStates } from "./agent-states";
import {
  STATE_FELL_LABEL,
  STATE_OFF_LABEL,
  STATE_READY_LABEL,
  STATE_WAITING_LABEL,
  STATE_WORKING_LABEL,
} from "../constants";
import { aConfig, aModel, aPrompt, anAgent } from "../../../testing";
import type { ProviderAnswer, ProviderState, WaitingAgent, WorkingAgent } from "../../../interfaces";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

const ASKED_AT = new Date(2026, 7, 19, 14, 26);

const ANSWERS: Record<string, ProviderAnswer> = {
  ollama: {
    isAnswering: true,
    models: [
      {
        name: "qwen2.5-coder:0.5b",
        sizeBytes: null,
      },
    ],
    askedAt: ASKED_AT,
  },
};

const CONFIG = aConfig({
  models: [
    aModel({
      id: "model-1",
      title: "qwen2.5-coder:0.5b",
      provider: "ollama",
    }),
  ],
  prompts: [
    aPrompt({
      id: "prompt-1",
    }),
  ],
  agents: [
    anAgent({
      id: "agent-1",
      promptId: "prompt-1",
    }),
    anAgent({
      id: "agent-2",
      promptId: "prompt-1",
    }),
    anAgent({
      id: "agent-3",
      promptId: "prompt-1",
    }),
    anAgent({
      id: "agent-4",
      promptId: "prompt-1",
      isActive: false,
    }),
  ],
});

function working(agentId: string): WorkingAgent {
  return {
    turnId: "turn-1",
    agentId,
    startedAt: 1_000,
    questionId: "question-1",
    askedAt: 900,
  };
}

function waiting(agentId: string): WaitingAgent {
  return {
    agentId,
    suppliers: [],
    isAwaitingRepeat: false,
  };
}

describe("agentStates", () => {
  it("gives one state per agent, under the agent's own id", () => {
    const states = agentStates(CONFIG, [OLLAMA], ANSWERS, [], [], {});

    expect(Object.keys(states).sort()).toEqual(["agent-1", "agent-2", "agent-3", "agent-4"]);
  });

  it("takes work, waiting and a fall to the agent each one names, and not to its neighbour", () => {
    // The canvas and the panel read this one answer, so a state landing on the wrong agent lands twice.
    const states = agentStates(CONFIG, [OLLAMA], ANSWERS, [working("agent-2")], [waiting("agent-3")], {
      "agent-1": ASKED_AT.toISOString(),
    });

    expect(states["agent-1"].label).toBe(STATE_FELL_LABEL);
    expect(states["agent-2"].label).toBe(STATE_WORKING_LABEL);
    expect(states["agent-3"].label).toBe(STATE_WAITING_LABEL);
    // The fourth is switched off, and nothing above was said about it.
    expect(states["agent-4"].label).toBe(STATE_OFF_LABEL);
  });

  it("says an agent with nothing in its way is ready", () => {
    const states = agentStates(CONFIG, [OLLAMA], ANSWERS, [], [], {});

    expect(states["agent-1"].label).toBe(STATE_READY_LABEL);
  });

  it("says nothing about an agent the project does not have, however the run names it", () => {
    const states = agentStates(CONFIG, [OLLAMA], ANSWERS, [working("agent-gone")], [waiting("agent-gone")], {
      "agent-gone": ASKED_AT.toISOString(),
    });

    expect(states["agent-gone"]).toBeUndefined();
    expect(states["agent-1"].label).toBe(STATE_READY_LABEL);
  });

  it("gives an empty answer for a project with no agents", () => {
    expect(agentStates(aConfig(), [OLLAMA], ANSWERS, [], [], {})).toEqual({});
  });
});
