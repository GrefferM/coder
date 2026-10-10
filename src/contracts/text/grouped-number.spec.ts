import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupedNumber } from "./grouped-number";

describe("groupedNumber", () => {
  it("leaves a number under a thousand as it is", () => {
    assert.equal(groupedNumber(0), "0");
    assert.equal(groupedNumber(999), "999");
  });

  it("puts a space between thousands, from the right", () => {
    assert.equal(groupedNumber(1_000), "1 000");
    assert.equal(groupedNumber(12_345), "12 345");
    assert.equal(groupedNumber(1_234_567), "1 234 567");
  });

  it("groups by three even when the first group is one digit", () => {
    // Grouping counts from the right: 1 234, not 123 4.
    assert.equal(groupedNumber(1_234), "1 234");
  });

  it("rounds a fraction rather than writing it out", () => {
    // Tokens are whole counts, so fractions round.
    assert.equal(groupedNumber(1_499.4), "1 499");
    assert.equal(groupedNumber(1_499.5), "1 500");
  });

  it("says nought for a number below it, since nothing here is ever negative", () => {
    assert.equal(groupedNumber(-12), "0");
  });
});
