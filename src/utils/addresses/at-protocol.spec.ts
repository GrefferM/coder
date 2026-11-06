import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { atProtocol } from "./at-protocol";

describe("atProtocol", () => {
  it("puts the protocol's path on an address that lacks it", () => {
    assert.equal(atProtocol("https://api.runpod.ai/v2/abc", "/openai/v1"), "https://api.runpod.ai/v2/abc/openai/v1");
  });

  it("leaves an address that already ends on the path as it is, trailing slashes taken off", () => {
    assert.equal(
      atProtocol("https://api.runpod.ai/v2/abc/openai/v1//", "/openai/v1"),
      "https://api.runpod.ai/v2/abc/openai/v1",
    );
  });

  it("reads no address as an empty one", () => {
    assert.equal(atProtocol(null, "/v1"), "/v1");
  });
});
