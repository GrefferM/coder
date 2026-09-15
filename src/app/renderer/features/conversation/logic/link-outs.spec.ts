import { describe, expect, it } from "vitest";
import { cannotTake, linkOuts } from "./link-outs";
import type { Agent, ProjectConfig } from "../../../interfaces";
import { aConfig, aLink, anAgent } from "../../../testing";

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
    // An agent may hold a turn for every walk asking it, so working is no wall at all.
    expect(cannotTake(OTHER)).toBeNull();
  });

  it("names an agent switched off — the one wall left", () => {
    expect(
      cannotTake(
        agent({
          isActive: false,
        }),
      ),
    ).toBe("off");
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

    expect(out.map((one) => one.linkId)).toEqual(["link-1"]);
    expect(out[0].to).toEqual(OTHER);
    expect(out[0].stopReason).toBeNull();
  });

  it("takes no line that leads back where the work came from, so a ring cannot be walked for ever", () => {
    // The drawing and the file both refuse a ring; this is the wall behind them, and nothing else stops
    // the work going round.
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

    expect(out).toEqual([]);
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

    expect(out).toEqual([]);
  });

  it("keeps a link the work cannot go down, with the word for why", () => {
    // The walk ends at such a link — it is said, not silently skipped.
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

    expect(out).toHaveLength(1);
    expect(out[0].stopReason).toBe("off");
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

    expect(out).toEqual([]);
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

    expect(out.map((one) => one.linkId)).toEqual(["link-2", "link-1"]);
  });
});
