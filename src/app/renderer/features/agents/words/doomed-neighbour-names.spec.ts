import { describe, expect, it } from "vitest";
import { doomedNeighbourNames } from "./doomed-neighbour-names";
import type { Agent, Link } from "../../../interfaces";
import { aLink, anAgent } from "../../../testing";

function agent(id: string, name: string): Agent {
  return anAgent({
    id,
    name,
    color: "#38a3ff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  });
}

const AGENTS: Agent[] = [agent("a", "PLANNER"), agent("b", "EDITOR"), agent("c", "REVIEWER")];

function link(id: string, from: string, to: string): Link {
  return aLink({
    id,
    from,
    to,
  });
}

describe("doomedNeighbourNames", () => {
  it("names everyone at the other end of the doomed agent's links, whichever end it holds", () => {
    expect(doomedNeighbourNames(AGENTS, [link("1", "a", "b"), link("2", "b", "c")], "b")).toEqual([
      "PLANNER",
      "REVIEWER",
    ]);
  });

  it("names a neighbour once however many links run between them", () => {
    expect(doomedNeighbourNames(AGENTS, [link("1", "a", "b"), link("2", "b", "a")], "b")).toEqual(["PLANNER"]);
  });

  it("leaves out an end whose agent is gone rather than naming nobody as undefined", () => {
    expect(doomedNeighbourNames(AGENTS, [link("1", "b", "gone")], "b")).toEqual([]);
  });
});
