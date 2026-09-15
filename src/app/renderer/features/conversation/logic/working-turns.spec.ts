import { describe, expect, it } from "vitest";
import { workingTurns } from "./working-turns";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { TurnOut, WalkState } from "../interfaces";

const out: Record<string, TurnOut> = {
  "turn-2": {
    turnId: "turn-2",
    agentId: "tester",
    startedAt: 200,
    viaLinkIds: ["link-1"],
    runKey: "walk-1",
  },
  "turn-1": {
    turnId: "turn-1",
    agentId: "editor",
    startedAt: 100,
    viaLinkIds: [],
    runKey: "walk-1",
  },
};

/** One stream's walks, with only the parts this reader looks at written. */
function walk(patch: Partial<WalkState>): WalkState {
  return {
    ...emptyWalk(),
    ...patch,
  };
}

describe("workingTurns", () => {
  it("stands the turns still out oldest first, each in the block of its own question", () => {
    const working = workingTurns(
      walk({
        out,
        walks: {
          "walk-1": begunWalk("question-1", 50),
        },
      }),
    );

    expect(working.map((one) => one.agentId)).toEqual(["editor", "tester"]);
    expect(working[0]).toEqual({
      turnId: "turn-1",
      agentId: "editor",
      startedAt: 100,
      questionId: "question-1",
      askedAt: 50,
    });
    // The second one belongs to the same question; what either of them is saying arrives elsewhere.
    expect(working[1].askedAt).toBe(50);
  });

  it("counts a turn from its own start when the machine holds no walk of it", () => {
    const [only] = workingTurns(
      walk({
        out: {
          "turn-1": out["turn-1"],
        },
      }),
    );

    expect(only.askedAt).toBe(100);
  });

  it("leaves out a turn of a walk let go with its stream", () => {
    // The canvas draws the conversation on screen, and that walk is not of it any more.
    const working = workingTurns(
      walk({
        out: {
          "turn-1": out["turn-1"],
        },
        walks: {
          "walk-1": {
            ...begunWalk("question-1", 100),
            isPutAway: true,
          },
        },
      }),
    );

    expect(working).toEqual([]);
  });

  it("leaves out a turn of a walk writing into another row", () => {
    const working = workingTurns(
      walk({
        out: {
          "turn-1": out["turn-1"],
        },
        walks: {
          "walk-1": begunWalk("question-1", 100, "run-2"),
        },
        flowRunId: "run-1",
      }),
    );

    expect(working).toEqual([]);
  });
});

describe("workingTurns · an agent holding several turns", () => {
  it("stands in every walk asking it, so each question's block says it works", () => {
    // Two walks asked the editor at once; both are working, and neither block is empty.
    const working = workingTurns(
      walk({
        out: {
          "turn-1": {
            turnId: "turn-1",
            agentId: "editor",
            startedAt: 300,
            viaLinkIds: [],
            runKey: "walk-2",
          },
          "turn-2": {
            turnId: "turn-2",
            agentId: "editor",
            startedAt: 100,
            viaLinkIds: [],
            runKey: "walk-1",
          },
        },
        walks: {
          "walk-1": begunWalk("question-1", 50),
          "walk-2": begunWalk("question-2", 250),
        },
      }),
    );

    expect(working.map((one) => one.questionId)).toEqual(["question-1", "question-2"]);
    // The sphere wears the agent's first row here, and its clock only ever grows.
    expect(working[0].startedAt).toBe(100);
  });
});
