import { describe, expect, it } from "vitest";
import { walkLevels } from "./walk-levels";
import { RUN_STEP_DONE } from "../../record";
import type { WholeStep } from "../../record";
import { aStep } from "../../../testing";

function step(id: string, place: number, fromStepIds: string[] = []): WholeStep {
  return aStep({
    id,
    place,
    agentId: `agent-${place}`,
    agentName: "ТЕЗАР",
    agentColor: "#b18aff",
    model: "hy-mt2",
    providerId: "tencent",
    promptId: "prompt-1",
    prompt: "Ти ріжеш текст на тези.",
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    inputTokens: 1,
    outputTokens: 1,
    money: 0,
    fromStepIds,
    startedAt: new Date("2026-08-22T19:27:00"),
    endedAt: new Date("2026-08-22T19:27:04"),
  });
}

describe("walkLevels", () => {
  it("stands a turn nobody fed on the first step, and every other one below whoever fed it", () => {
    expect(walkLevels([step("one", 1), step("other", 2, ["one"])])).toEqual({
      one: 1,
      other: 2,
    });
  });

  it("puts turns that ran at once on one step, since a step is a level and not a turn", () => {
    // Three agents on one step.
    expect(walkLevels([step("one", 1), step("two", 2, ["one"]), step("three", 3, ["one"])])).toEqual({
      one: 1,
      two: 2,
      three: 2,
    });
  });

  it("puts a converging point below both of its suppliers, where it stood waiting for them", () => {
    const levels = walkLevels([
      step("one", 1),
      step("quick", 2, ["one"]),
      step("point", 3, ["quick", "slow"]),
      step("slow", 4, ["quick"]),
    ]);

    // The record is in finish order; levels follow dependencies.
    expect(levels).toEqual({
      one: 1,
      quick: 2,
      slow: 3,
      point: 4,
    });
  });

  it("counts a turn asked again onto the step it was asked on, since the same steps fed it", () => {
    const levels = walkLevels([step("one", 1), step("stopped", 2, ["one"]), step("again", 3, ["one"])]);

    expect(levels.again).toBe(levels.stopped);
  });

  it("leaves a turn whose feeder is not in the walk standing on the first step", () => {
    // A step naming a missing step does not fail.
    expect(walkLevels([step("orphan", 1, ["gone"])])).toEqual({
      orphan: 1,
    });
  });
});
