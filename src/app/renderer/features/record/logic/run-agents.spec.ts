import { describe, expect, it } from "vitest";
import { runAgents } from "./run-agents";
import { RUN_DONE } from "../constants";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun, WholeStep } from "../interfaces";
import { aStep } from "../../../testing";

const TODAY: NamedAgent[] = [
  {
    id: "agent-1",
    name: "Шукач",
    color: "#6fd3d8",
  },
];

function run(walk: WholeStep[], patch: Partial<WholeRun> = {}): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "Розвідник",
    startedByAgentColor: "#b18aff",
    startedByScheduleId: null,
    askedAgentId: "agent-1",
    askedAgentName: "Розвідник",
    asked: "Розбий текст на тези",
    state: RUN_DONE,
    startedAt: new Date("2026-08-22T19:26:56"),
    askedAt: new Date("2026-08-22T19:26:56"),
    endedAt: new Date("2026-08-22T19:27:12"),
    steps: walk.length,
    money: 0.02,
    worked: 5_000,
    questions: [],
    walk,
    memories: [],
    ...patch,
  };
}

describe("runAgents", () => {
  it("hands back today's agents where nothing is opened", () => {
    expect(runAgents(null, TODAY)).toEqual(TODAY);
  });

  it("keeps today's name and colour over the ones the record wrote down", () => {
    const walked = aStep({
      agentName: "Розвідник",
      agentColor: "#b18aff",
    });
    const shown = runAgents(run([walked]), TODAY);

    expect(shown).toEqual(TODAY);
  });

  it("names an agent the project no longer has out of the record", () => {
    const walked = aStep({
      agentId: "agent-gone",
      agentName: "ТЕЗАР",
      agentColor: "#ffb347",
    });
    const shown = runAgents(run([walked]), TODAY);

    expect(shown).toEqual([
      ...TODAY,
      {
        id: "agent-gone",
        name: "ТЕЗАР",
        color: "#ffb347",
      },
    ]);
  });

  it("names the agent that started a run the project no longer has", () => {
    const shown = runAgents(
      run([], {
        startedByAgentId: "agent-gone",
      }),
      TODAY,
    );

    expect(shown).toEqual([
      ...TODAY,
      {
        id: "agent-gone",
        name: "Розвідник",
        color: "#b18aff",
      },
    ]);
  });

  it("names a gone agent once however many turns it walked", () => {
    const shown = runAgents(
      run([
        aStep({
          id: "step-1",
          agentId: "agent-gone",
          agentName: "ТЕЗАР",
        }),
        aStep({
          id: "step-2",
          agentId: "agent-gone",
          agentName: "ТЕЗАР",
        }),
      ]),
      TODAY,
    );

    expect(shown).toHaveLength(2);
  });

  it("hands the chat a name and a colour and nothing else", () => {
    // The standing also knows the record's name and whether the agent is gone; that stays with the projection.
    const walked = aStep({
      agentId: "agent-gone",
      agentName: "ТЕЗАР",
    });
    const [, gone] = runAgents(run([walked]), TODAY);

    expect(Object.keys(gone).sort()).toEqual(["color", "id", "name"]);
  });
});
