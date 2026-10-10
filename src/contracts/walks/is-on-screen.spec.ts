import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOnScreen } from "./is-on-screen";
import type { WalkSnapshot } from "./walk-snapshot.interface";

/** One walk with its row and whether it was put away. */
function emptyWalk(): WalkSnapshot {
  return {
    out: {},
    walks: {},
    saidAgain: [],
    flowRunId: null,
  };
}

function walk(isPutAway: boolean, runId: string | null, flowRunId: string | null): WalkSnapshot {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        questionId: "question-1",
        askedAt: 50,
        runId,
        said: [],
        waiting: {},
        isStopped: false,
        isPutAway,
        heldAsk: null,
        unsavedAsk: null,
        heldTurns: {},
        unclosed: null,
      },
    },
    flowRunId,
  };
}

describe("isOnScreen", () => {
  it("keeps a walk whose row is the row the screen stands on", () => {
    assert.equal(isOnScreen(walk(false, "run-1", "run-1"), "walk-1"), true);
  });

  it("leaves out a walk of another conversation, whatever the screen is doing", () => {
    // Another row is another conversation: drawn nowhere here and unreachable from here.
    assert.equal(isOnScreen(walk(false, "run-1", "run-2"), "walk-1"), false);
    assert.equal(isOnScreen(walk(false, "run-1", null), "walk-1"), false);
  });

  it("brings a walk let go with its stream back when its own row is the one opened", () => {
    assert.equal(isOnScreen(walk(true, "run-1", "run-1"), "walk-1"), true);
  });

  it("leaves out a walk let go with its stream while another row stands on screen", () => {
    // Runs to its end and writes its record, draws nothing here.
    assert.equal(isOnScreen(walk(true, "run-1", "run-2"), "walk-1"), false);
  });

  it("stands a walk whose row is not opened yet here, since it can have been begun nowhere else", () => {
    assert.equal(isOnScreen(walk(false, null, null), "walk-1"), true);
    assert.equal(isOnScreen(walk(false, null, "run-1"), "walk-1"), true);
  });

  it("leaves out a walk let go before its row was opened at all", () => {
    assert.equal(isOnScreen(walk(true, null, null), "walk-1"), false);
  });

  it("stands a walk this state does not hold at all, since nothing was let go", () => {
    assert.equal(isOnScreen(emptyWalk(), "walk-1"), true);
  });
});
