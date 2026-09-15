import { describe, expect, it } from "vitest";
import { lastWord } from "./last-word";
import { RUN_DONE, RUN_RUNNING } from "../constants";
import type { RunRow } from "../interfaces";

function run(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "EDITOR",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "EDITOR",
    asked: "Прогони тести",
    state: RUN_DONE,
    steps: 2,
    money: null,
    worked: 4000,
    askedAt: new Date("2026-09-02T21:41:00.000Z"),
    startedAt: new Date("2026-09-02T21:41:00.000Z"),
    endedAt: new Date("2026-09-03T00:12:00.000Z"),
    ...patch,
  };
}

describe("lastWord", () => {
  it("takes the hour the reply came back", () => {
    expect(lastWord(run()).toISOString()).toBe("2026-09-03T00:12:00.000Z");
  });

  it("takes the question's own hour while the flow is still out", () => {
    // Nothing has come back yet, so the question is the last word there is.
    expect(
      lastWord(
        run({
          state: RUN_RUNNING,
          endedAt: null,
        }),
      ).toISOString(),
    ).toBe("2026-09-02T21:41:00.000Z");
  });
});
