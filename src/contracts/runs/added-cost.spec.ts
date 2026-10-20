import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addedCost } from "./added-cost";

const bill = (inputTokens: number, outputTokens: number, money: number | null) => ({
  inputTokens,
  outputTokens,
  money,
});

describe("addedCost", () => {
  it("adds tokens each way and the money", () => {
    assert.deepEqual(addedCost(bill(10, 5, 0.001), bill(20, 1, 0.002)), bill(30, 6, 0.003));
  });

  it("is the other bill where one is missing, and nothing where both are", () => {
    assert.deepEqual(addedCost(null, bill(1, 1, null)), bill(1, 1, null));
    assert.deepEqual(addedCost(bill(1, 1, null), null), bill(1, 1, null));
    assert.equal(addedCost(null, null), null);
  });
});
