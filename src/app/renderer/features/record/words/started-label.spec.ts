import { describe, expect, it } from "vitest";
import { startedLabel } from "./started-label";
import { RUN_DONE } from "../constants";
import type { RunRow } from "../interfaces";

const NOW = new Date("2026-05-05T12:00:00Z");

function row(startedAt: Date, askedAt: Date): RunRow {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    startedByAgentId: "77777777-7777-4777-8777-777777777777",
    startedByAgentName: "ПОШУКАЧ",
    startedByAgentColor: "#b18aff",
    startedByScheduleId: null,
    asked: "порахуй файли",
    state: RUN_DONE,
    startedAt,
    askedAt,
    endedAt: askedAt,
    steps: 2,
    money: 0,
    worked: 1000,
    askedAgentId: "77777777-7777-4777-8777-777777777777",
    askedAgentName: "ПОШУКАЧ",
  };
}

describe("startedLabel · when a flow began, where that is not today", () => {
  it("says nothing for a flow that began on the day it last spoke", () => {
    const day = new Date("2026-05-05T09:00:00Z");

    expect(startedLabel(row(day, day), NOW)).toBe(null);
  });

  it("says the day a flow older than its group began, so the group's hour is not repeated", () => {
    const said = startedLabel(row(new Date("2026-05-03T09:00:00Z"), new Date("2026-05-05T09:00:00Z")), NOW);

    expect(said).not.toBe(null);
    expect(said).toContain("ПОЧАТО ");
  });
});
