import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KNOWN_PROVIDERS } from "./known-providers.constant";

describe("KNOWN_PROVIDERS", () => {
  it("knows nine providers", () => {
    assert.equal(KNOWN_PROVIDERS.length, 9);
  });

  it("keeps RunPod's queue under its old id, in its old place, named for the way it is asked and with no functions", () => {
    const at = KNOWN_PROVIDERS.findIndex((provider) => provider.id === "runpod");
    const queue = KNOWN_PROVIDERS[at];

    assert.equal(at, 5);
    assert.equal(queue.name, "RunPod Queue");
    assert.equal(queue.takesTools, false);
  });

  it("stands RunPod OpenAI right after the queue, asking for a key and an address and carrying functions", () => {
    const at = KNOWN_PROVIDERS.findIndex((provider) => provider.id === "runpod-openai");

    assert.equal(KNOWN_PROVIDERS[at - 1].id, "runpod");
    assert.deepEqual(KNOWN_PROVIDERS[at], {
      id: "runpod-openai",
      name: "RunPod OpenAI",
      kind: "remote",
      needs: ["key", "address"],
      takesTools: true,
      customaryAddress: null,
    });
  });
});
