import { describe, expect, it } from "vitest";
import { agentsCountLabel } from "./agents-count-label";

describe("agentsCountLabel", () => {
  it("says none as its own words rather than as a zero", () => {
    expect(agentsCountLabel(0)).toBe("БЕЗ АГЕНТІВ");
  });

  it("uses the three forms Ukrainian needs", () => {
    expect(agentsCountLabel(1)).toBe("1 АГЕНТ");
    expect(agentsCountLabel(3)).toBe("3 АГЕНТИ");
    expect(agentsCountLabel(5)).toBe("5 АГЕНТІВ");
  });

  it("keeps the teens on the many form, where the last digit lies", () => {
    expect(agentsCountLabel(11)).toBe("11 АГЕНТІВ");
    expect(agentsCountLabel(22)).toBe("22 АГЕНТИ");
    expect(agentsCountLabel(21)).toBe("21 АГЕНТ");
  });
});
