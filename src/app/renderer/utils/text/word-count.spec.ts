import { describe, expect, it } from "vitest";
import { wordCount } from "./word-count";

describe("wordCount", () => {
  it("counts words however they are spaced", () => {
    expect(wordCount("Ти працюєш у  наявному\nрепозиторії")).toBe(5);
  });

  it("counts nothing in a text that has nothing in it", () => {
    expect(wordCount("   \n  ")).toBe(0);
  });
});
