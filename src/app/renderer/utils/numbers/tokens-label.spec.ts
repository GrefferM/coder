import { describe, expect, it } from "vitest";
import { tokensLabel, wholeTokensLabel } from "./tokens-label";
import { TOKENS_SUFFIX } from "./constants";

describe("tokensLabel", () => {
  it("writes what went in and what came back, in that order", () => {
    expect(tokensLabel(250, 2500)).toBe("0.3К/2.5К");
  });

  it("shortens both counts, so a long turn stays as wide as a short one", () => {
    expect(tokensLabel(0, 1234567)).toBe("0К/1.2М");
  });
});

describe("wholeTokensLabel", () => {
  it("groups every thousand and names the unit", () => {
    expect(wholeTokensLabel(0, 1234567)).toBe(`0/1 234 567${TOKENS_SUFFIX}`);
  });
});
