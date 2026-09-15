import { describe, expect, it } from "vitest";
import { awaitedSuppliers } from "./awaited-suppliers";
import type { Agent, Link, ProjectConfig } from "../../../interfaces";
import { aConfig, anAgent } from "../../../testing";

function agent(id: string, isActive = true): Agent {
  return anAgent({
    id,
    name: id.toUpperCase(),
    color: "#b18aff",
    isActive,
    x: 0,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

function config(agents: Agent[], links: [string, string][]): ProjectConfig {
  return aConfig({
    agents,
    links: links.map<Link>(([from, to]) => ({
      id: `${from}-${to}`,
      from,
      to,
    })),
  });
}

describe("awaitedSuppliers", () => {
  it("names both suppliers where two lines converge", () => {
    const drawn = config(
      [agent("start"), agent("tester"), agent("linter"), agent("reviewer")],
      [
        ["start", "tester"],
        ["start", "linter"],
        ["tester", "reviewer"],
        ["linter", "reviewer"],
      ],
    );

    expect(awaitedSuppliers(drawn, "start", "reviewer")).toEqual(["tester", "linter"]);
  });

  it("counts the suppliers from where the walk actually began, and not from some other agent", () => {
    // The bug this guards: a repeat began the walk at the flow's first agent instead of the one the question was
    // put to. Where that first agent stood apart from the drawing, the converging point lost its suppliers, the
    // wait never formed, and the point ran on one answer while the other was still out.
    const drawn = config(
      [agent("alone"), agent("thesaurus"), agent("shortener"), agent("headline")],
      [
        ["thesaurus", "shortener"],
        ["thesaurus", "headline"],
        ["shortener", "headline"],
      ],
    );

    expect(awaitedSuppliers(drawn, "thesaurus", "headline")).toEqual(["thesaurus", "shortener"]);
    // From an agent the drawing does not connect, nothing is reachable — and the point would run at once.
    expect(awaitedSuppliers(drawn, "alone", "headline")).toEqual([]);
  });

  it("does not wait for a switched-off supplier, nor for anyone standing behind it", () => {
    const drawn = config(
      [agent("start"), agent("tester"), agent("linter", false), agent("slow"), agent("reviewer")],
      [
        ["start", "tester"],
        ["start", "linter"],
        ["linter", "slow"],
        ["tester", "reviewer"],
        ["slow", "reviewer"],
      ],
    );

    // The off supplier is not counted, and neither is the agent the run cannot get to.
    expect(awaitedSuppliers(drawn, "start", "reviewer")).toEqual(["tester"]);
  });

  it("waits for nobody at the agent the person spoke to, however many lines come into it", () => {
    const drawn = config(
      [agent("editor"), agent("reviewer")],
      [
        ["editor", "reviewer"],
        ["editor", "reviewer"],
      ],
    );

    // A run starts here: what stands before this agent was never asked, so it is not waited for.
    expect(awaitedSuppliers(drawn, "editor", "editor")).toEqual([]);
  });
});
