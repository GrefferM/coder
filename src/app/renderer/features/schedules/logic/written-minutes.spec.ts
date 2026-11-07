import { describe, expect, it } from "vitest";
import { writtenMinutes } from "./written-minutes";

describe("writtenMinutes", () => {
  it("takes a whole number of minutes as typed", () => {
    expect(writtenMinutes(" 15 ")).toBe(15);
  });

  it("takes nothing under a minute, nothing empty and nothing that is not whole", () => {
    expect(writtenMinutes("0")).toBeNull();
    expect(writtenMinutes("")).toBeNull();
    expect(writtenMinutes("1.5")).toBeNull();
    expect(writtenMinutes("п'ять")).toBeNull();
  });
});
