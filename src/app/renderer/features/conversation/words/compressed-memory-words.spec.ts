import { describe, expect, it } from "vitest";
import { compressedMemoryWords } from "./compressed-memory-words";

describe("compressedMemoryWords", () => {
  it("says the threshold the memory was compressed at and the target it was written down to, and none of what the composer wrote", () => {
    expect(
      compressedMemoryWords({
        at: 90,
        to: 10,
      }),
    ).toBe("ПАМ'ЯТЬ СТИСНУТО · 90 % → 10 %");
  });
});
