import { describe, expect, it } from "vitest";
import { FOUND_CEILING_NOTE, FOUND_CEILING_SPOKEN } from "./found-count.constant";
import { RUN_HITS_LIMIT } from "../../../../../contracts";

describe("the ceiling the search says out loud", () => {
  /** The note spells the ceiling as a word, so this compares it with the real ceiling. */
  it("spells the number the search actually stops at", () => {
    expect(FOUND_CEILING_SPOKEN).toBe(RUN_HITS_LIMIT);
  });

  it("says that number in words rather than in digits, which is why the guard above is needed at all", () => {
    expect(FOUND_CEILING_NOTE).not.toContain(`${FOUND_CEILING_SPOKEN}`);
    expect(FOUND_CEILING_NOTE).toContain("триста");
  });
});
