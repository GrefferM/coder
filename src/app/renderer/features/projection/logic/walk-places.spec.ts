import { describe, expect, it } from "vitest";
import { walkPlaces } from "./walk-places";
import { RUN_STEP_DONE } from "../../record";
import type { WholeStep } from "../../record";
import { aStep } from "../../../testing";

function step(id: string, place: number, fromStepIds: string[] = [], patch: Partial<WholeStep> = {}): WholeStep {
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
    ...patch,
  });
}

describe("walkPlaces", () => {
  it("stands a run of one turn in the first column of the top row", () => {
    expect(walkPlaces([step("one", 1)])).toEqual([
      {
        step: step("one", 1),
        lane: 0,
        number: 1,
      },
    ]);
  });

  it("keeps a chain without branches in the top row, a turn to a column", () => {
    const places = walkPlaces([step("one", 1), step("other", 2, ["one"])]);

    expect(places.map((place) => [place.step.id, place.number, place.lane])).toEqual([
      ["one", 1, 0],
      ["other", 2, 0],
    ]);
  });

  it("hangs below what a line goes past, and keeps in the row what it cannot go past", () => {
    // The line from the first to the third goes along the row, so the second —
    // which that line goes past — steps down into a lane of its own instead of being flown over.
    const places = walkPlaces([step("one", 1), step("two", 2, ["one"]), step("three", 3, ["one", "two"])]);

    expect(places.map((place) => [place.step.id, place.number, place.lane])).toEqual([
      ["one", 1, 0],
      ["two", 2, 1],
      ["three", 3, 0],
    ]);
  });

  it("gives two branches running at once a lane each, and neither of them the row", () => {
    const places = walkPlaces([
      step("one", 1),
      step("two", 2, ["one"]),
      step("three", 3, ["one"]),
      step("four", 4, ["one", "two", "three"]),
    ]);

    expect(places.map((place) => place.lane)).toEqual([0, 1, 2, 0]);
  });

  it("gives a lane back once its branch has come home, so two branchings in turn share one", () => {
    // Lanes are reused as a graph of commits reuses them — the height follows the branches
    // running at once, not every branch of the pass.
    const places = walkPlaces([
      step("one", 1),
      step("two", 2, ["one"]),
      step("three", 3, ["one", "two"]),
      step("four", 4, ["three"]),
      step("five", 5, ["three", "four"]),
    ]);

    expect(places.map((place) => place.lane)).toEqual([0, 1, 0, 1, 0]);
  });

  it("brings a turn where the roads have met back up into the row, when nothing would fly over it", () => {
    // The third turn was fed by both the first and the second, so it is a joining and not a
    // branch; the line it seemed to be in the way of travels below anyway, so the row is free for it.
    const places = walkPlaces([
      step("one", 1),
      step("two", 2, ["one"]),
      step("three", 3, ["one", "two"]),
      step("four", 4, ["two", "three"]),
    ]);

    expect(places.map((place) => place.lane)).toEqual([0, 1, 0, 0]);
  });

  it("counts the turns of the pass from one, whatever place they hold in the whole flow", () => {
    // The pass was the flow's second question, so its turns are the flow's fourth, fifth and sixth.
    const places = walkPlaces([step("one", 4), step("two", 5, ["one"]), step("three", 6, ["two"])]);

    expect(places.map((place) => place.number)).toEqual([1, 2, 3]);
  });

  it("holds the columns in the order the turns were taken, whatever order the walk came in", () => {
    const places = walkPlaces([step("three", 3, ["one"]), step("two", 2, ["one"]), step("one", 1)]);

    expect(places.map((place) => place.step.id)).toEqual(["one", "two", "three"]);
  });
});
