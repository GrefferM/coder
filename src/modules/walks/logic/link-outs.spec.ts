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

  const reasons = (route: Parameters<typeof routedOuts>[1]) => routedOuts(OUTS, route).map((out) => out.stopReason);

  it("takes every line where the agent chose nothing", () => {
    assert.deepEqual(reasons(null), [null, null, "off"]);
  });

  it("takes only the lines to the agents it named, and leaves the others not chosen", () => {
    assert.deepEqual(
      reasons({
        toAgentIds: ["second"],
        isFinished: false,
      }),
      ["notChosen", null, "off"],
    );
  });

  it("takes no line where it ended the branch, whomever it named besides", () => {
    assert.deepEqual(
      reasons({
        toAgentIds: ["first"],
        isFinished: true,
      }),
      ["finished", "finished", "off"],
    );
  });

  it("leaves a line that could not be taken for its own reason with that reason, whatever the agent chose", () => {
    assert.deepEqual(
      reasons({
        toAgentIds: ["off"],
        isFinished: false,
      }),
      ["notChosen", "notChosen", "off"],
    );
  });

  it("reads a choice that names nobody and ends nothing as no choice", () => {
    assert.deepEqual(
      reasons({
        toAgentIds: [],
        isFinished: false,
      }),
      [null, null, "off"],
    );
  });

  it("keeps the lines themselves as they were, and changes only the reason", () => {
    const [first] = routedOuts(OUTS, {
      toAgentIds: [],
      isFinished: true,
    });

    assert.deepEqual([first.linkId, first.to], ["l1", FIRST]);
  });
});
