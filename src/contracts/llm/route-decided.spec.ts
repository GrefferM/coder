import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isRouteDecided } from "./route-decided";

describe("isRouteDecided", () => {
  it("is no for a turn that called no command", () => {
    assert.equal(isRouteDecided(null), false);
  });

  it("is yes where something was passed on, and yes where the branch was ended", () => {
    assert.equal(
      isRouteDecided({
        passes: [
          {
            agentId: "a",
            text: "Напиши функцію",
          },
        ],
        isFinished: false,
      }),
      true,
    );
    assert.equal(
      isRouteDecided({
        passes: [],
        isFinished: true,
      }),
      true,
    );
  });

  it("is no for a choice that passes nothing and ends nothing", () => {
    assert.equal(
      isRouteDecided({
        passes: [],
        isFinished: false,
      }),
      false,
    );
  });
});
