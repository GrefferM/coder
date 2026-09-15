import { describe, expect, it } from "vitest";
import { stepsLabel } from "./steps-label";

describe("stepsLabel", () => {
  it("counts steps the way the language does", () => {
    expect(stepsLabel(1)).toBe("1 КРОК");
    expect(stepsLabel(3)).toBe("3 КРОКИ");
    expect(stepsLabel(6)).toBe("6 КРОКІВ");
    // Eleven to fourteen are the many, whatever their last digit says.
    expect(stepsLabel(11)).toBe("11 КРОКІВ");
    expect(stepsLabel(12)).toBe("12 КРОКІВ");
    expect(stepsLabel(21)).toBe("21 КРОК");
    expect(stepsLabel(22)).toBe("22 КРОКИ");
  });
});
