import { describe, expect, it } from "vitest";
import { whenLabel } from "./when-label";
import { RUN_DONE } from "../constants";
import type { RunRow } from "../interfaces";

function row(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    startedByAgentId: "55555555-5555-4555-8555-555555555555",
    startedByAgentName: "ПОШУКАЧ",
    startedByAgentColor: "#b18aff",
    asked: "порахуй файли",
    state: RUN_DONE,
    startedAt: new Date("2026-05-05T10:00:00Z"),
    askedAt: new Date("2026-05-05T10:00:00Z"),
    endedAt: new Date("2026-05-05T10:03:06Z"),
    steps: 6,
    money: 0.21,
    worked: 186000,
    askedAgentId: "55555555-5555-4555-8555-555555555555",
    askedAgentName: "ПОШУКАЧ",
    ...patch,
  };
}

describe("whenLabel · when a flow last spoke, and how long it worked", () => {
  it("says the hour, and the work beside it", () => {
    expect(whenLabel(row())).toContain(" · ");
  });

  it("says no span for a flow that sent nothing, since nobody spent that time", () => {
    expect(
      whenLabel(
        row({
          worked: 0,
        }),
      ),
    ).not.toContain(" · ");
  });
});
