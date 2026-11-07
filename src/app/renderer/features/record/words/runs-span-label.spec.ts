import { describe, expect, it } from "vitest";
import { runsSpanLabel } from "./runs-span-label";
import { RUN_DONE } from "../constants";
import type { RunRow } from "../interfaces";

const NOW = new Date("2026-05-05T12:00:00Z");

function row(startedAt: Date): RunRow {
  return {
    id: `id-${startedAt.getTime()}`,
    startedByAgentId: "88888888-8888-4888-8888-888888888888",
    startedByAgentName: "ПОШУКАЧ",
    startedByAgentColor: "#b18aff",
    startedByScheduleId: null,
    asked: "порахуй файли",
    state: RUN_DONE,
    startedAt,
    askedAt: startedAt,
    endedAt: startedAt,
    steps: 1,
    money: 0,
    worked: 0,
    askedAgentId: "88888888-8888-4888-8888-888888888888",
    askedAgentName: "ПОШУКАЧ",
  };
}

describe("runsSpanLabel · the days a list of runs spans", () => {
  it("says nothing where every run is of one day", () => {
    const day = new Date("2026-05-05T09:00:00Z");

    expect(runsSpanLabel([row(day), row(day)], NOW)).toBe("");
  });

  it("says from the newest day to the oldest, in that order", () => {
    const said = runsSpanLabel([row(new Date("2026-05-05T09:00:00Z")), row(new Date("2026-05-01T09:00:00Z"))], NOW);

    expect(said).toContain(" — від ");
    expect(said).toContain(" до ");
  });
});
