import { describe, expect, it } from "vitest";
import { runChanges } from "./run-changes";
import { RUN_DONE } from "../../record";
import type { AgentStanding, WholeRun, WholeStep } from "../../record";
import type { Agent, ProjectModel } from "../../../interfaces";
import { aModel, anAgent, aStep } from "../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    id: "model-now",
    title: "claude-opus-4.1",
  }),
];

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    id: "agent-1",
    name: "WRITER",
    modelId: "model-now",
    temperature: 0.7,
    ...patch,
  });
}

function standing(patch: Partial<AgentStanding> = {}): AgentStanding {
  return {
    id: "agent-1",
    name: "WRITER",
    color: "#6fd3d8",
    wasName: null,
    isGone: false,
    ...patch,
  };
}

function run(walk: WholeStep[]): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "WRITER",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "WRITER",
    asked: "Перепиши обробку помилок",
    state: RUN_DONE,
    startedAt: new Date("2026-08-05T11:20:00"),
    askedAt: new Date("2026-08-05T11:20:00"),
    endedAt: new Date("2026-08-05T11:21:00"),
    steps: walk.length,
    money: 0.02,
    worked: 5_000,
    questions: [],
    walk,
  };
}

const WALKED = aStep({
  agentId: "agent-1",
  model: "claude-sonnet-4.5",
  temperature: 0.2,
});

describe("runChanges", () => {
  it("holds what the turn ran on against what the agent runs on now", () => {
    const [change] = runChanges(run([WALKED]), [standing()], [agent()], MODELS);

    expect(change.wasModel).toBe("claude-sonnet-4.5");
    expect(change.wasTemperature).toBe(0.2);
    expect(change.nowModel).toBe("claude-opus-4.1");
    expect(change.nowTemperature).toBe(0.7);
  });

  it("says nothing about an agent nothing has moved about", () => {
    // An unchanged agent yields no change.
    const same = aStep({
      agentId: "agent-1",
      model: "claude-opus-4.1",
      temperature: 0.7,
    });

    expect(runChanges(run([same]), [standing()], [agent()], MODELS)).toEqual([]);
  });

  it("stands an agent whose name moved, though it runs on the same model", () => {
    const same = aStep({
      agentId: "agent-1",
      model: "claude-opus-4.1",
      temperature: 0.7,
    });
    const changes = runChanges(
      run([same]),
      [
        standing({
          wasName: "EDITOR",
        }),
      ],
      [agent()],
      MODELS,
    );

    expect(changes).toHaveLength(1);
  });

  it("has no «now» for an agent the project no longer has", () => {
    const [change] = runChanges(
      run([WALKED]),
      [
        standing({
          isGone: true,
        }),
      ],
      [],
      MODELS,
    );

    expect(change.isGone).toBe(true);
    expect(change.nowModel).toBeNull();
    expect(change.nowTemperature).toBeNull();
    // What it ran on is still the record's, and still readable.
    expect(change.wasModel).toBe("claude-sonnet-4.5");
  });

  it("reads an agent that walked twice off its first turn of this pass", () => {
    const walk = [
      aStep({
        id: "step-1",
        agentId: "agent-1",
        model: "claude-sonnet-4.5",
      }),
      aStep({
        id: "step-2",
        agentId: "agent-1",
        model: "claude-haiku-4.5",
      }),
    ];
    const [change] = runChanges(run(walk), [standing()], [agent()], MODELS);

    expect(change.wasModel).toBe("claude-sonnet-4.5");
  });

  it("says nothing of an agent that started the run but walked no turn of this pass", () => {
    expect(runChanges(run([]), [standing()], [agent()], MODELS)).toEqual([]);
  });
});
