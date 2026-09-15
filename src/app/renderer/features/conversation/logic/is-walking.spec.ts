import { describe, expect, it } from "vitest";
import { isWalking } from "./is-walking";
import type { TurnOut, Walk, WalkState } from "../interfaces";

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
  };
}

function state(patch: Partial<WalkState> = {}): WalkState {
  return {
    out: {},
    walks: {},
    ledgers: {},
    saidAgain: [],
    drafts: {},
    aimedAgentId: null,
    flowRunId: null,
    ...patch,
  };
}

describe("isWalking", () => {
  it("says nothing walks where no turn is out at all", () => {
    expect(isWalking(state())).toBe(false);
  });

  it("counts a turn of the conversation on screen", () => {
    // This is the walk «ЗУПИНИТИ» ends, and the one a second question would collide with.
    expect(
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
    ).toBe(true);
  });

  it("counts no turn of another conversation: it walks beside this one, not in it", () => {
    // A walk let go with «+ НОВИЙ ЧАТ» goes on, and is neither drawn here nor stopped from here.
    expect(
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
    ).toBe(false);
  });

  it("counts a turn of an opened run only while that run is the row on screen", () => {
    // The walk of a run read back belongs to the screen exactly while the screen stands on its row.
    const out = {
      "turn-1": turnOut("walk-1"),
    };
    const walks = {
      "walk-1": walk(false, "run-1"),
    };

    expect(
      isWalking(
        state({
          out,
          walks,
          flowRunId: "run-1",
        }),
      ),
    ).toBe(true);
    expect(
      isWalking(
        state({
          out,
          walks,
          flowRunId: "run-2",
        }),
      ),
    ).toBe(false);
  });
});
