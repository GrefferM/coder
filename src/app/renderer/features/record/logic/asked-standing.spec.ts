import { describe, expect, it } from "vitest";
import { askedStanding } from "./asked-standing";
import type { NamedAgent } from "../../../interfaces";
import type { RunRow } from "../interfaces";

const AGENTS: NamedAgent[] = [
  {
    id: "agent-1",
    name: "ШУКАЧ",
    color: "#6fd3d8",
  },
];

function row(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "Шукач",
    asked: "Знайди md-файли",
    state: "done",
    startedAt: new Date(2026, 8, 6, 14, 5),
    askedAt: new Date(2026, 8, 6, 14, 5),
    endedAt: new Date(2026, 8, 6, 14, 5),
    steps: 2,
    money: null,
    worked: 5_500,
    ...patch,
  };
}

describe("askedStanding", () => {
  it("names the agent as they stand today, whatever the record called them then", () => {
    // A rename is the project's word; the list does not keep the old name.
    expect(askedStanding(row(), AGENTS)).toEqual({
      name: "ШУКАЧ",
      color: "#6fd3d8",
      isGone: false,
    });
  });

  it("names an agent the project no longer holds from the record, and says they are gone", () => {
    // Only the record knows the gone agent's name, so it reads dimmer.
    expect(
      askedStanding(
        row({
          askedAgentId: "agent-gone",
          askedAgentName: "ЛІНТЕР",
        }),
        AGENTS,
      ),
    ).toEqual({
      name: "ЛІНТЕР",
      // A gone agent has no colour in the record and is drawn quiet.
      color: null,
      isGone: true,
    });
  });

  it("looks the name up by the agent's id and never by what the record called them", () => {
    // Agents are matched by id, not name; two agents may share a name at different times.
    expect(
      askedStanding(
        row({
          askedAgentId: "agent-1",
          askedAgentName: "ЛІНТЕР",
        }),
        AGENTS,
      ).name,
    ).toBe("ШУКАЧ");
  });

  it("stands on the record alone when the project holds no agents at all", () => {
    expect(askedStanding(row(), []).isGone).toBe(true);
  });
});
