import { describe, expect, it } from "vitest";
import { walkDrawing, walkSpot } from "./walk-drawing";
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

describe("walkDrawing", () => {
  it("stands every turn on its own spot, a column across and a lane down", () => {
    const drawing = walkDrawing([step("one", 1), step("two", 2, ["one"])]);

    expect(drawing.turns.map((turn) => turn.at)).toEqual([
      walkSpot(drawing.turns[0].place),
      walkSpot(drawing.turns[1].place),
    ]);
    // The second turn stands a column to the right of the first, in the same top row.
    expect(drawing.turns[1].at.x).toBeGreaterThan(drawing.turns[0].at.x);
    expect(drawing.turns[1].at.y).toBe(drawing.turns[0].at.y);
  });

  it("draws a line for every feed, and names it by the two turns it runs between", () => {
    const drawing = walkDrawing([step("one", 1), step("two", 2, ["one"])]);

    expect(drawing.lines.map((line) => line.id)).toEqual(["one-two"]);
    expect(drawing.lines[0].path).toContain("M ");
    expect(drawing.lines[0].arrow).not.toBe("");
  });

  it("leaves a feed from outside this pass undrawn, since the turn it came from is not here", () => {
    const drawing = walkDrawing([step("one", 1, ["elsewhere"])]);

    expect(drawing.lines).toEqual([]);
    expect(drawing.heads).toEqual([]);
  });

  it("gives a turn several lines arrive at one head, and takes their own away", () => {
    // Two identical points in one spot read as a single blot, so the receiver draws it.
    const drawing = walkDrawing([step("one", 1), step("two", 2, ["one"]), step("three", 3, ["one", "two"])]);

    expect(drawing.heads.map((head) => head.id)).toEqual(["three"]);
    expect(drawing.lines.filter((line) => line.arrow === "")).toHaveLength(2);
    expect(drawing.lines.filter((line) => line.arrow !== "")).toHaveLength(1);
  });

  it("has nothing to draw for a question that started no walk", () => {
    expect(walkDrawing([])).toEqual({
      turns: [],
      lines: [],
      heads: [],
    });
  });
});
