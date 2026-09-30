import { describe, expect, it } from "vitest";
import { linkLives } from "./link-lives";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { Link } from "../../../interfaces";
import type { IncomingWork, TurnOut, WaitedWork } from "../interfaces";
import { aLink } from "../../../testing";

const links: Link[] = [
  aLink({
    from: "editor",
    to: "reviewer",
  }),
  aLink({
    id: "link-2",
    from: "linter",
    to: "reviewer",
  }),
  aLink({
    id: "link-3",
    from: "tester",
    to: "reviewer",
  }),
  aLink({
    id: "link-4",
    from: "reviewer",
    to: "writer",
  }),
];

function work(fromAgentId: string): IncomingWork {
  return {
    text: "Готово",
    cost: null,
    fromAgentId,
    fromStepIds: [],
    seconds: 4,
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
    isSilent: false,
    ...patch,
  };
}

/** One stream's walks, with only the parts this reader looks at written — the waits all of one walk. */
function walk(waiting: Record<string, WaitedWork> = {}, out: Record<string, TurnOut> = {}) {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        ...begunWalk("question-1", 100),
        waiting,
      },
    },
    out,
  };
}

/** A turn out, holding the lines its work arrived by. */
function turn(viaLinkIds: string[]): TurnOut {
  return {
    turnId: "turn-1",
    agentId: "editor",
    startedAt: 100,
    viaLinkIds,
    runKey: "walk-1",
  };
}

describe("linkLives · the lines of another conversation", () => {
  it("leaves a line of another row at rest, however its work is flowing", () => {
    // The canvas is one conversation's — a line another one's work goes down drifts here.
    const lives = linkLives(links, {
      ...emptyWalk(),
      walks: {
        "walk-1": {
          ...begunWalk("question-1", 100, "run-2"),
          waiting: {
            reviewer: wait({
              settledIds: ["editor"],
            }),
          },
        },
      },
      out: {
        "turn-1": turn(["link-1"]),
      },
      flowRunId: "run-1",
    });

    expect(lives).toEqual({});
  });
});

describe("linkLives", () => {
  it("says nothing about a canvas where nothing is going on", () => {
    expect(linkLives(links, walk())).toEqual({});
  });

  it("names the lines work is flowing down", () => {
    expect(
      linkLives(
        links,
        walk(
          {},
          {
            reviewer: turn(["link-1", "link-2"]),
          },
        ),
      ),
    ).toEqual({
      "link-1": "running",
      "link-2": "running",
    });
  });

  it("tells the three states of a converging point apart", () => {
    const lives = linkLives(
      links,
      walk({
        reviewer: wait({
          settledIds: ["editor", "linter"],
          arrived: [work("editor")],
        }),
      }),
    );

    // The one that answered, the one that had its turn and said nothing, and the one still out.
    expect(lives).toEqual({
      "link-1": "answered",
      "link-2": "silent",
      "link-3": "awaited",
    });
  });

  it("leaves out a line into a waiting agent whose end is no supplier of that wait", () => {
    const lives = linkLives(
      links,
      walk({
        reviewer: wait({
          awaitedIds: ["editor"],
        }),
      }),
    );

    expect(lives).toEqual({
      "link-1": "awaited",
    });
  });

  it("leaves the lines out of a waiting agent alone — a wait is about what comes in", () => {
    const lives = linkLives(
      links,
      walk({
        reviewer: wait({
          settledIds: ["editor"],
          arrived: [work("editor")],
        }),
      }),
    );

    expect(lives["link-4"]).toBeUndefined();
  });
});
