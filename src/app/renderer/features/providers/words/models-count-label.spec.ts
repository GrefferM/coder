import { describe, expect, it } from "vitest";
import { modelsCountLabel } from "./models-count-label";

describe("modelsCountLabel", () => {
  it("counts in the Ukrainian forms", () => {
    expect(modelsCountLabel(1)).toBe("1 МОДЕЛЬ");
    expect(modelsCountLabel(3)).toBe("3 МОДЕЛІ");
    expect(modelsCountLabel(5)).toBe("5 МОДЕЛЕЙ");
  });

  it("says none in words rather than as a zero", () => {
    expect(modelsCountLabel(0)).toBe("БЕЗ МОДЕЛЕЙ");
  });
});
