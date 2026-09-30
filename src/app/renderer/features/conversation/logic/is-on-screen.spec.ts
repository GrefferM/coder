import { describe, expect, it } from "vitest";
import { isOnScreen } from "./is-on-screen";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { WalkState } from "../interfaces";

/** One walk with its row and whether it was put away. */
function walk(isPutAway: boolean, runId: string | null, flowRunId: string | null): WalkState {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        ...begunWalk("question-1", 50, runId),
        isPutAway,
      },
    },
    flowRunId,
  };
}

describe("isOnScreen", () => {
  it("keeps a walk whose row is the row the screen stands on", () => {
    expect(isOnScreen(walk(false, "run-1", "run-1"), "walk-1")).toBe(true);
  });

  it("leaves out a walk of another conversation, whatever the screen is doing", () => {
    // Another row is another conversation: drawn nowhere here and unreachable from here.
    expect(isOnScreen(walk(false, "run-1", "run-2"), "walk-1")).toBe(false);
    expect(isOnScreen(walk(false, "run-1", null), "walk-1")).toBe(false);
  });

  it("brings a walk let go with its stream back when its own row is the one opened", () => {
    expect(isOnScreen(walk(true, "run-1", "run-1"), "walk-1")).toBe(true);
  });

  it("leaves out a walk let go with its stream while another row stands on screen", () => {
    // Runs to its end and writes its record, draws nothing here.
    expect(isOnScreen(walk(true, "run-1", "run-2"), "walk-1")).toBe(false);
  });

  it("stands a walk whose row is not opened yet here, since it can have been begun nowhere else", () => {
    expect(isOnScreen(walk(false, null, null), "walk-1")).toBe(true);
    expect(isOnScreen(walk(false, null, "run-1"), "walk-1")).toBe(true);
  });

  it("leaves out a walk let go before its row was opened at all", () => {
    expect(isOnScreen(walk(true, null, null), "walk-1")).toBe(false);
  });

  it("stands a walk this state does not hold at all, since nothing was let go", () => {
    expect(isOnScreen(emptyWalk(), "walk-1")).toBe(true);
  });
});
