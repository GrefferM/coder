import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { awaitedSuppliers } from "./awaited-suppliers";
import type { Agent, Link, ProjectConfig } from "../../../contracts";
import { aConfig, anAgent } from "../../../utils/testing";

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

    assert.deepEqual(awaitedSuppliers(drawn, "start", "reviewer"), ["tester", "linter"]);
  });

  it("counts the suppliers from where the walk actually began, and not from some other agent", () => {
    // Counting from the flow's first agent instead of the asked one drops the converging point's suppliers and its
    // wait.
    const drawn = config(
      [agent("alone"), agent("thesaurus"), agent("shortener"), agent("headline")],
      [
        ["thesaurus", "shortener"],
        ["thesaurus", "headline"],
        ["shortener", "headline"],
      ],
    );

    assert.deepEqual(awaitedSuppliers(drawn, "thesaurus", "headline"), ["thesaurus", "shortener"]);
    // From an agent the drawing does not connect, nothing is reachable.
    assert.deepEqual(awaitedSuppliers(drawn, "alone", "headline"), []);
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

    // A supplier that is off, or one the run cannot reach, is not counted.
    assert.deepEqual(awaitedSuppliers(drawn, "start", "reviewer"), ["tester"]);
  });

  it("waits for nobody at the agent the person spoke to, however many lines come into it", () => {
    const drawn = config(
      [agent("editor"), agent("reviewer")],
      [
        ["editor", "reviewer"],
        ["editor", "reviewer"],
      ],
    );

    // The run starts here, so what stands before this agent is not waited for.
    assert.deepEqual(awaitedSuppliers(drawn, "editor", "editor"), []);
  });
});
