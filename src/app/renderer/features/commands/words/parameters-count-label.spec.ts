import { describe, expect, it } from "vitest";
import { parametersCountLabel } from "./parameters-count-label";

describe("parametersCountLabel", () => {
  it("says none in words rather than as a zero", () => {
    expect(parametersCountLabel(0)).toBe("БЕЗ ПАРАМЕТРІВ");
  });

  it("uses the three forms Ukrainian needs", () => {
    expect(parametersCountLabel(1)).toBe("1 ПАРАМЕТР");
    expect(parametersCountLabel(2)).toBe("2 ПАРАМЕТРИ");
    expect(parametersCountLabel(5)).toBe("5 ПАРАМЕТРІВ");
  });
});
