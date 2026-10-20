import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keepsMemory, sharesMemory } from "./memory-kept";

describe("keepsMemory", () => {
  it("is true for the agent's own thread and for the question's run, false for none", () => {
    assert.equal(keepsMemory("own"), true);
    assert.equal(keepsMemory("shared"), true);
    assert.equal(keepsMemory("none"), false);
  });
});

describe("sharesMemory", () => {
  it("is true only for the question's run", () => {
    assert.equal(sharesMemory("shared"), true);
    assert.equal(sharesMemory("own"), false);
    assert.equal(sharesMemory("none"), false);
  });
});
