import { describe, expect, it } from "vitest";
import { attachWeightLabel } from "./attach-weight";

describe("attachWeightLabel", () => {
  it("says bytes on their own below a kilobyte", () => {
    expect(attachWeightLabel(0)).toBe("0 Б");
    expect(attachWeightLabel(812)).toBe("812 Б");
  });

  it("keeps one place after the point while there are few of a unit, and drops it past ten", () => {
    // A small file reads to a tenth; a big one has no need of the place and stands whole.
    expect(attachWeightLabel(Math.round(2.1 * 1024))).toBe("2.1 КБ");
    expect(attachWeightLabel(184 * 1024)).toBe("184 КБ");
  });

  it("climbs a unit at each step, up to ГБ", () => {
    expect(attachWeightLabel(38 * 1024 * 1024)).toBe("38 МБ");
    expect(attachWeightLabel(3 * 1024 * 1024 * 1024)).toBe("3 ГБ");
  });
});
