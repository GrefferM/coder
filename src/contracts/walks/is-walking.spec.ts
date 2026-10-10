import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWalking } from "./is-walking";
import type { TurnOut } from "./turn-out.interface";
import type { WalkSnapshot } from "./walk-snapshot.interface";
import type { Walk } from "./walk.interface";

function turnOut(runKey: string): TurnOut {
  return {
    turnId: "turn-1",
    agentId: "editor",
    startedAt: 100,
    viaLinkIds: [],
    runKey,
  };
}

function walk(isPutAway: boolean, runId: string | null = null): Walk {
  return {
    questionId: "question-1",
    askedAt: 100,
    runId,
    said: [],
    waiting: {},
    isStopped: false,
    isPutAway,
    heldAsk: null,
    unsavedAsk: null,
    heldTurns: {},
    unclosed: null,
  };
}

function state(patch: Partial<WalkSnapshot> = {}): WalkSnapshot {
  return {
    out: {},
    walks: {},
    saidAgain: [],
    flowRunId: null,
    ...patch,
  };
}

describe("isWalking", () => {
  it("says nothing walks where no turn is out at all", () => {
    assert.equal(isWalking(state()), false);
  });

  it("counts a turn of the conversation on screen", () => {
    // The walk «ЗУПИНИТИ» ends and a second question would collide with.
    assert.equal(
      isWalking(
        state({
          out: {
            "turn-1": turnOut("walk-1"),
          },
          walks: {
            "walk-1": walk(false),
          },
        }),
      ),
      true,
    );
  });

  it("counts no turn of another conversation: it walks beside this one, not in it", () => {
    // A walk let go with «+ НОВИЙ ЧАТ» continues, neither drawn nor stoppable from here.
    assert.equal(
      isWalking(
        state({
          out: {
            "turn-1": turnOut("walk-1"),
          },
          walks: {
            "walk-1": walk(true),
          },
        }),
      ),
      false,
    );
  });

  it("counts a turn of an opened run only while that run is the row on screen", () => {
    // A read-back run's walk belongs to the screen only while the screen stands on its row.
    const out = {
      "turn-1": turnOut("walk-1"),
    };
    const walks = {
      "walk-1": walk(false, "run-1"),
    };

    assert.equal(
      isWalking(
        state({
          out,
          walks,
          flowRunId: "run-1",
        }),
      ),
      true,
    );
    assert.equal(
      isWalking(
        state({
          out,
          walks,
          flowRunId: "run-2",
        }),
      ),
      false,
    );
  });
});
