import { describe, expect, it } from "vitest";
import { foundOfLabel } from "./found-of-label";

describe("foundOfLabel", () => {
  it("counts the match the stream stands on from one, the way a person counts", () => {
    expect(foundOfLabel(2, 8)).toBe("3 З 8");
    // The list is counted from the freshest, so «1» is where a word just typed lands.
    expect(foundOfLabel(0, 8)).toBe("1 З 8");
  });

  it("says «0 З 0» where nothing was found, an open field having to say something", () => {
    expect(foundOfLabel(0, 0)).toBe("0 З 0");
  });
});
