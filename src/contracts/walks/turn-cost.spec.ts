import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { turnCost } from "./turn-cost";

const PRICES = {
  inputPrice: 3,
  outputPrice: 15,
};

describe("turnCost", () => {
  it("counts each way at its own price, since they are quoted apart", () => {
    assert.equal(turnCost(1000000, 1000000, PRICES)?.money, 18);
  });

  it("keeps both counts beside the money, which is what the line says", () => {
    const cost = turnCost(250, 2500, PRICES);

    assert.equal(cost?.inputTokens, 250);
    assert.equal(cost?.outputTokens, 2500);
    assert.ok(Math.abs((cost?.money ?? Number.NaN) - 0.03825) < 10 ** -6 / 2);
  });

  it("says nothing at all when nobody counted, rather than saying the turn was free", () => {
    assert.equal(turnCost(0, 0, PRICES), null);
  });

  it("says nothing when a count is not a number, rather than writing «NaN»", () => {
    assert.equal(turnCost(Number.NaN, 2500, PRICES), null);
  });

  it("counts the turn where nobody wrote a price, and names no money for it", () => {
    const cost = turnCost(250, 2500, {
      inputPrice: null,
      outputPrice: null,
    });

    assert.equal(cost?.inputTokens, 250);
    assert.equal(cost?.outputTokens, 2500);
    assert.equal(cost?.money, null);
  });

  it("names no money when a price is not a number anybody can multiply", () => {
    assert.equal(
      turnCost(250, 2500, {
        inputPrice: Number.NaN,
        outputPrice: Number.NaN,
      })?.money,
      null,
    );
  });
});
