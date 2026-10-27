import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isRouteDecided } from "./route-decided";

describe("isRouteDecided", () => {
  it("is no for a turn that called no command", () => {
    assert.equal(isRouteDecided(null), false);
  });

  it("is yes where agents were named, and yes where the branch was ended", () => {
    assert.equal(
      isRouteDecided({
        toAgentIds: ["a"],
        isFinished: false,
      }),
      true,
    );
    assert.equal(
      isRouteDecided({
        toAgentIds: [],
        isFinished: true,
      }),
      true,
    );
  });

  it("is no for a choice that names nobody and ends nothing", () => {
    assert.equal(
      isRouteDecided({
        toAgentIds: [],
        isFinished: false,
      }),
      false,
    );
  });
});
