import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cannotTake, linkOuts, routedOuts } from "./link-outs";
import type { Agent, ProjectConfig } from "../../../contracts";
import { aConfig, aLink, anAgent } from "../../../utils/testing";

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    name: "ТЕЗАР",
    color: "#b18aff",
    x: 0,
    y: 0,
    ...patch,
  });
}

function config(agents: Agent[], links: { id: string; from: string; to: string }[]): ProjectConfig {
  return aConfig({
    agents,
    links,
  });
}

const OTHER = agent({
  id: "agent-2",
  name: "СТИСЛЯР",
});

describe("cannotTake", () => {
  it("takes the work where the agent is on, whatever else it is doing", () => {
    // An agent may hold a turn for every walk asking it, so working is no wall.
    assert.equal(cannotTake(OTHER), null);
  });

  it("names an agent switched off — the one wall left", () => {
    assert.equal(
      cannotTake(
        agent({
          isActive: false,
        }),
      ),
      "off",
    );
  });
});

describe("linkOuts", () => {
  it("gives one way out per link drawn from this agent, and none of the links into it", () => {
    const out = linkOuts(
      config(
        [
          agent(),
          OTHER,
          agent({
            id: "agent-3",
          }),
        ],
        [
          aLink(),
          aLink({
            id: "link-2",
            from: "agent-3",
            to: "agent-1",
          }),
        ],
      ),
      agent(),
    );

    assert.deepEqual(
      out.map((one) => one.linkId),
      ["link-1"],
    );
    assert.deepEqual(out[0].to, OTHER);
    assert.equal(out[0].stopReason, null);
  });

  it("takes no line that leads back where the work came from, so a ring cannot be walked for ever", () => {
    // The wall behind the drawing and the file, which both refuse a ring.
    const out = linkOuts(
      config(
        [agent(), OTHER],
        [
          aLink(),
          aLink({
            id: "link-2",
            from: "agent-2",
            to: "agent-1",
          }),
        ],
      ),
      agent(),
    );

    assert.deepEqual(out, []);
  });

  it("takes no line drawn from an agent into itself, the shortest ring there is", () => {
    const out = linkOuts(
      config(
        [agent()],
        [
          aLink({
            to: "agent-1",
          }),
        ],
      ),
      agent(),
    );

    assert.deepEqual(out, []);
  });

  it("keeps a link the work cannot go down, with the word for why", () => {
    // The walk ends at such a link, and says so.
    const out = linkOuts(
      config(
        [
          agent(),
          agent({
            id: "agent-2",
            isActive: false,
          }),
        ],
        [aLink()],
      ),
      agent(),
    );

    assert.equal(out.length, 1);
    assert.equal(out[0].stopReason, "off");
  });

  it("leaves out a link to an agent the project no longer holds", () => {
    const out = linkOuts(
      config(
        [agent()],
        [
          aLink({
            to: "agent-gone",
          }),
        ],
      ),
      agent(),
    );

    assert.deepEqual(out, []);
  });

  it("keeps the links in the order they stand in the project file", () => {
    const third = agent({
      id: "agent-3",
    });
    const out = linkOuts(
      config(
        [agent(), OTHER, third],
        [
          aLink({
            id: "link-2",
            to: "agent-3",
          }),
          aLink(),
        ],
      ),
      agent(),
    );

    assert.deepEqual(
      out.map((one) => one.linkId),
      ["link-2", "link-1"],
    );
  });
});

describe("routedOuts", () => {
  const FIRST = agent({
    id: "first",
  });
  const SECOND = agent({
    id: "second",
  });
  const OFF = agent({
    id: "off",
    isActive: false,
  });
  const OUTS = [
    {
      linkId: "l1",
      to: FIRST,
      stopReason: null,
    },
    {
      linkId: "l2",
      to: SECOND,
      stopReason: null,
    },
    {
      linkId: "l3",
      to: OFF,
      stopReason: <const>"off",
    },
  ];

  const pass = (agentId: string, text: string) => ({
    agentId,
    text,
  });
  const routed = (route: Parameters<typeof routedOuts>[1]) =>
    routedOuts(OUTS, route, "Відповідь").map((out) => [out.stopReason, out.text]);

  it("hands the answer down every line where the agent called no command", () => {
    assert.deepEqual(routed(null), [
      [null, "Відповідь"],
      [null, "Відповідь"],
      ["off", "Відповідь"],
    ]);
  });

  it("hands each agent it passed to what it passed it, and leaves the others not chosen with nothing", () => {
    assert.deepEqual(
      routed({
        passes: [pass("second", "Напиши функцію")],
        isFinished: false,
      }),
      [
        ["notChosen", ""],
        [null, "Напиши функцію"],
        ["off", ""],
      ],
    );
  });

  it("hands different texts to different agents", () => {
    assert.deepEqual(
      routed({
        passes: [pass("first", "Напиши функцію"), pass("second", "Перевір")],
        isFinished: false,
      }),
      [
        [null, "Напиши функцію"],
        [null, "Перевір"],
        ["off", ""],
      ],
    );
  });

  it("takes no line where it only ended the branch", () => {
    assert.deepEqual(
      routed({
        passes: [],
        isFinished: true,
      }),
      [
        ["finished", ""],
        ["finished", ""],
        ["off", ""],
      ],
    );
  });

  it("still hands on what was passed where it also ended the branch, the rest not chosen", () => {
    assert.deepEqual(
      routed({
        passes: [pass("first", "Напиши функцію")],
        isFinished: true,
      }),
      [
        [null, "Напиши функцію"],
        ["notChosen", ""],
        ["off", ""],
      ],
    );
  });

  it("leaves a line that could not be taken for its own reason with that reason, and its text", () => {
    assert.deepEqual(
      routed({
        passes: [pass("off", "Перевір")],
        isFinished: false,
      }),
      [
        ["notChosen", ""],
        ["notChosen", ""],
        ["off", "Перевір"],
      ],
    );
  });

  it("keeps the lines themselves as they were", () => {
    const [first] = routedOuts(
      OUTS,
      {
        passes: [],
        isFinished: true,
      },
      "",
    );

    assert.deepEqual([first.linkId, first.to], ["l1", FIRST]);
  });
});
