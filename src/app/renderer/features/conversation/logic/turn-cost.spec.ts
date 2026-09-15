import { describe, expect, it } from "vitest";
import { turnCost } from "./turn-cost";

const PRICES = {
  inputPrice: 3,
  outputPrice: 15,
};

describe("turnCost", () => {
  it("counts each way at its own price, since they are quoted apart", () => {
    expect(turnCost(1000000, 1000000, PRICES)?.money).toBe(18);
  });

  it("keeps both counts beside the money, which is what the line says", () => {
    const cost = turnCost(250, 2500, PRICES);

    expect(cost?.inputTokens).toBe(250);
    expect(cost?.outputTokens).toBe(2500);
    expect(cost?.money).toBeCloseTo(0.03825, 6);
  });

  it("says nothing at all when nobody counted, rather than saying the turn was free", () => {
    expect(turnCost(0, 0, PRICES)).toBeNull();
  });

  it("says nothing when a count is not a number, rather than writing «NaN»", () => {
    expect(turnCost(Number.NaN, 2500, PRICES)).toBeNull();
  });

  it("counts the turn where nobody wrote a price, and names no money for it", () => {
    const cost = turnCost(250, 2500, {
      inputPrice: null,
      outputPrice: null,
    });

    expect(cost?.inputTokens).toBe(250);
    expect(cost?.outputTokens).toBe(2500);
    expect(cost?.money).toBeNull();
  });

  it("names no money when a price is not a number anybody can multiply", () => {
    expect(
      turnCost(250, 2500, {
        inputPrice: Number.NaN,
        outputPrice: Number.NaN,
      })?.money,
    ).toBeNull();
  });
});
