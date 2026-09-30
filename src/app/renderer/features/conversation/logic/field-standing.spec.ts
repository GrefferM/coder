import { describe, expect, it } from "vitest";
import { fieldStanding } from "./field-standing";

describe("fieldStanding", () => {
  it("opens the field where there is somebody to ask and nothing under way", () => {
    expect(fieldStanding("editor", true, false)).toBe("open");
  });

  it("marks the field while this conversation walks: writing is allowed, sending is not", () => {
    // What is typed waits for the walk to end or for «ЗУПИНИТИ».
    expect(fieldStanding("editor", true, true)).toBe("walking");
  });

  it("stitches the field where the agent is switched off, walk or no walk", () => {
    // The turn would not go either way, so the person is stopped by a word before the press.
    expect(fieldStanding("editor", false, false)).toBe("stitched");
    expect(fieldStanding("editor", false, true)).toBe("stitched");
  });

  it("stitches the field where nobody is aimed at: a question would have nowhere to go", () => {
    // The stream stands until a sphere is picked.
    expect(fieldStanding(null, true, false)).toBe("stitched");
  });
});
