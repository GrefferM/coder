import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyWalk } from "./empty-walk";
import { walkSnapshot } from "./walk-snapshot";
import type { RunLedger } from "../../../contracts";

describe("walkSnapshot", () => {
  it("carries the walks, the turns out, the repeats made and the row", () => {
    const state = {
      ...emptyWalk(),
      saidAgain: ["card-1"],
      flowRunId: "run-1",
    };

    assert.deepEqual(walkSnapshot(state), {
      out: {},
      walks: {},
      saidAgain: ["card-1"],
      flowRunId: "run-1",
    });
  });

  it("leaves the writer's ledgers behind, since a pending write cannot cross to the screen", () => {
    const ledger: RunLedger = {
      walkId: "walk-1",
      askedAt: 1,
      runId: null,
      questionId: "question-1",
      out: 0,
      stepIdOf: {},
      queue: Promise.resolve(),
    };
    const state = {
      ...emptyWalk(),
      ledgers: {
        "walk-1": ledger,
      },
    };

    assert.equal("ledgers" in walkSnapshot(state), false);
  });
});
