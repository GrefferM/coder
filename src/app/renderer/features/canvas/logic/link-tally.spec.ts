import { describe, expect, it } from "vitest";
import { linkTally } from "./link-tally";
import type { Agent, Link } from "../../../interfaces";
import { aLink, anAgent } from "../../../testing";

function agent(id: string): Agent {
  return anAgent({
    id,
    name: id.toUpperCase(),
    color: "#b18aff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  });
}

const LINKS: Link[] = [
  aLink({
    from: "editor",
    to: "linter",
  }),
  aLink({
    id: "link-2",
    from: "editor",
    to: "reviewer",
  }),
  aLink({
    id: "link-3",
    from: "planner",
    to: "editor",
  }),
];

describe("linkTally", () => {
  it("counts the selected agent's lines each way, in its own colour", () => {
    expect(linkTally(agent("editor"), LINKS)).toEqual({
      outgoing: 2,
      incoming: 1,
      color: "#b18aff",
    });
  });

  it("counts nothing where nobody is selected", () => {
    expect(linkTally(null, LINKS)).toBeNull();
  });

  it("counts an agent with no lines all the same, and says so in zeroes", () => {
    // The canvas decides for itself whether a pair of zeroes is worth drawing; the count is honest either way.
    expect(linkTally(agent("stitcher"), LINKS)).toEqual({
      outgoing: 0,
      incoming: 0,
      color: "#b18aff",
    });
  });
});
