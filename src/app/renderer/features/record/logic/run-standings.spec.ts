import { describe, expect, it } from "vitest";
import { runStandings } from "./run-standings";
import { RUN_DONE } from "../constants";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun, WholeStep } from "../interfaces";
import { aStep } from "../../../testing";

const TODAY: NamedAgent[] = [
  {
    id: "agent-1",
    name: "WRITER",
    color: "#6fd3d8",
  },
];

function run(walk: WholeStep[]): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "EDITOR",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "EDITOR",
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
    memories: [],
  };
}

describe("runStandings", () => {
  it("carries the record's name beside today's where the agent was renamed", () => {
    const [standing] = runStandings(run([]), TODAY);

    expect(standing.name).toBe("WRITER");
    expect(standing.color).toBe("#6fd3d8");
    expect(standing.wasName).toBe("EDITOR");
    expect(standing.isGone).toBe(false);
  });

  it("says nothing of a name the record and the project agree on", () => {
    const same: NamedAgent[] = [
      {
        id: "agent-1",
        name: "EDITOR",
        color: "#b18aff",
      },
    ];
    const [standing] = runStandings(run([]), same);

    expect(standing.wasName).toBeNull();
  });

  it("stands an agent the project no longer has on the record alone", () => {
    const walked = aStep({
      agentId: "agent-gone",
      agentName: "REVIEWER",
      agentColor: "#ffb347",
    });
    const gone = runStandings(run([walked]), TODAY).find((standing) => standing.id === "agent-gone");

    expect(gone?.name).toBe("REVIEWER");
    expect(gone?.color).toBe("#ffb347");
    expect(gone?.isGone).toBe(true);
    // Nothing was renamed, so there is no «was».
    expect(gone?.wasName).toBeNull();
  });

  it("stands each agent once, however many turns it walked", () => {
    const walk = [
      aStep({
        id: "step-1",
        agentId: "agent-gone",
      }),
      aStep({
        id: "step-2",
        agentId: "agent-gone",
      }),
    ];

    expect(runStandings(run(walk), TODAY)).toHaveLength(2);
  });

  it("has nothing to say where no run is open", () => {
    expect(runStandings(null, TODAY)).toEqual([]);
  });
});
