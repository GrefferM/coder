import { describe, expect, it } from "vitest";
import { shortCount } from "./short-count";

describe("shortCount", () => {
  it("says a count in thousands, one decimal at most", () => {
    expect(shortCount(454)).toBe("0.5К");
    expect(shortCount(3014)).toBe("3К");
  });

  it("keeps no trailing zero", () => {
    expect(shortCount(3000)).toBe("3К");
    expect(shortCount(120400)).toBe("120.4К");
  });

  it("steps up to millions rather than writing a thousand of thousands", () => {
    expect(shortCount(999999)).toBe("1М");
    expect(shortCount(1234567)).toBe("1.2М");
  });

  it("says nothing spent as nothing", () => {
    expect(shortCount(0)).toBe("0К");
  });
});
