import { describe, expect, it } from "vitest";
import { waitingAgents } from "./waiting-agents";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { IncomingWork, WaitedWork } from "../interfaces";

function work(fromAgentId: string, seconds: number): IncomingWork {
  return {
    text: "Готово",
    cost: null,
    fromAgentId,
    fromStepIds: [],
    seconds,
    attached: [],
  };
}

function wait(patch: Partial<WaitedWork> = {}): WaitedWork {
  return {
    startAgentId: "editor",
    awaitedIds: ["editor", "linter", "tester"],
    settledIds: [],
    arrived: [],
    viaLinkIds: [],
    isAwaitingRepeat: false,
    ...patch,
  };
}

/** One stream's walks, with only the parts this reader looks at written — the waits all of one walk. */
function walk(waiting: Record<string, WaitedWork>, isPutAway = false) {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        ...begunWalk("question-1", 100),
        waiting,
        isPutAway,
      },
    },
  };
}

describe("waitingAgents", () => {
  it("says where each supplier stands, in the order its line was drawn", () => {
    const [point] = waitingAgents(
      walk({
        reviewer: wait({
          settledIds: ["editor", "linter"],
          arrived: [work("editor", 12)],
        }),
      }),
    );

    expect(point.agentId).toBe("reviewer");
    expect(point.suppliers).toEqual([
      {
        agentId: "editor",
        state: "answered",
        seconds: 12,
      },
      {
        agentId: "linter",
        state: "silent",
        seconds: null,
      },
      {
        agentId: "tester",
        state: "working",
        seconds: null,
      },
    ]);
  });

  it("carries the wait for a repeat", () => {
    const [point] = waitingAgents(
      walk({
        reviewer: wait({
          isAwaitingRepeat: true,
        }),
      }),
    );

    expect(point.isAwaitingRepeat).toBe(true);
  });

  it("says nothing of a point of a walk let go with its stream", () => {
    // The wait is that conversation's, and this canvas is not it.
    expect(
      waitingAgents(
        walk(
          {
            reviewer: wait(),
          },
          true,
        ),
      ),
    ).toEqual([]);
  });

  it("says nothing where no lines converge", () => {
    expect(waitingAgents(walk({}))).toEqual([]);
  });

  it("shows the later of two walks waiting at one point: a sphere is no list of works", () => {
    // Two walks converge on the reviewer; the pill says the one the person asked last.
    const [point] = waitingAgents({
      ...emptyWalk(),
      walks: {
        "walk-1": {
          ...begunWalk("question-1", 100),
          waiting: {
            reviewer: wait({
              settledIds: ["editor"],
            }),
          },
        },
        "walk-2": {
          ...begunWalk("question-1", 200),
          waiting: {
            reviewer: wait({
              settledIds: ["editor", "linter"],
            }),
          },
        },
      },
    });

    expect(point.suppliers.map((one) => one.state)).toEqual(["silent", "silent", "working"]);
  });
});
