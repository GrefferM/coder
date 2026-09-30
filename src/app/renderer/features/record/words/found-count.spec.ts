import { describe, expect, it } from "vitest";
import { foundCount } from "./found-count";
import { RUN_HITS_LIMIT } from "../../../../../contracts";

describe("foundCount", () => {
  it("says the record itself while nothing is typed, one number and no words", () => {
    expect(foundCount("", 0, 0, 142)).toBe("142");
    expect(foundCount("   ", 0, 0, 142)).toBe("142");
  });

  it("says the places first and the runs they lie in second", () => {
    expect(foundCount("кеш", 40, 3, 142)).toBe("40 МІСЦЬ · 3 ЗАПУСКИ");
  });

  it("says both numbers in the Ukrainian forms of their own words", () => {
    expect(foundCount("кеш", 1, 1, 142)).toBe("1 МІСЦЕ · 1 ЗАПУСК");
    expect(foundCount("кеш", 3, 2, 142)).toBe("3 МІСЦЯ · 2 ЗАПУСКИ");
    expect(foundCount("кеш", 7, 5, 142)).toBe("7 МІСЦЬ · 5 ЗАПУСКІВ");
    expect(foundCount("кеш", 12, 11, 142)).toBe("12 МІСЦЬ · 11 ЗАПУСКІВ");
  });

  it("says the record rather than a nought where the word is in nothing", () => {
    // Nothing found: the second number is the record, not a nought.
    expect(foundCount("ялина", 0, 0, 142)).toBe("0 МІСЦЬ · 142 ЗАПУСКИ");
  });

  it("says the ceiling with a word, counting having stopped", () => {
    // At the limit there is no second number, since counting stopped.
    expect(foundCount("а", RUN_HITS_LIMIT, 3, 142)).toBe(`${RUN_HITS_LIMIT} МІСЦЬ · СТЕЛЯ`);
  });

  it("spells the ceiling in its note as the number the record actually cuts at", () => {
    // The note says «більше за триста» in words, so it must follow the limit.
    expect(RUN_HITS_LIMIT).toBe(300);
  });
});
