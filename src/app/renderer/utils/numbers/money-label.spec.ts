import { describe, expect, it } from "vitest";
import { moneyLabel, wholeMoneyLabel } from "./money-label";

describe("moneyLabel", () => {
  it("writes an ordinary price to two places", () => {
    expect(moneyLabel(0.02)).toBe("$0.02");
  });

  it("keeps to those two places whatever the sum, so every price is one width", () => {
    expect(moneyLabel(0.054)).toBe("$0.05");
    expect(moneyLabel(12.3456)).toBe("$12.35");
  });

  it("writes a sum under a cent as smaller than one, rather than rounding it away to nothing", () => {
    expect(moneyLabel(0.0007)).toBe("<$0.01");
    expect(moneyLabel(0.00003)).toBe("<$0.01");
  });

  it("writes nothing at all as nothing", () => {
    expect(moneyLabel(0)).toBe("$0.00");
  });

  it("writes a dash where the record carried no money, since a price of nothing is not the same thing", () => {
    expect(moneyLabel(null)).toBe("—");
    expect(wholeMoneyLabel(null)).toBe("—");
  });
});

describe("wholeMoneyLabel", () => {
  it("writes the pointer's sum to four places, one width for them all", () => {
    expect(wholeMoneyLabel(0.0079)).toBe("$0.0079");
    expect(wholeMoneyLabel(1.5)).toBe("$1.5000");
  });

  it("writes a sum under the smallest of those four places as smaller than it, never as nought", () => {
    expect(wholeMoneyLabel(0.0000079)).toBe("<$0.0001");
    expect(wholeMoneyLabel(0.00009)).toBe("<$0.0001");
  });

  it("keeps a nought for a sum that truly is nothing", () => {
    expect(wholeMoneyLabel(0)).toBe("$0.0000");
  });
});
