import { describe, expect, it } from "vitest";
import { ukrainianPlural } from "./ukrainian-plural";

describe("ukrainianPlural", () => {
  it("picks the three forms by the last digit", () => {
    expect(ukrainianPlural(1, "агент", "агенти", "агентів")).toBe("агент");
    expect(ukrainianPlural(3, "агент", "агенти", "агентів")).toBe("агенти");
    expect(ukrainianPlural(7, "агент", "агенти", "агентів")).toBe("агентів");
  });

  it("keeps the teens on the many form, where the last digit lies", () => {
    expect(ukrainianPlural(12, "агент", "агенти", "агентів")).toBe("агентів");
    expect(ukrainianPlural(21, "агент", "агенти", "агентів")).toBe("агент");
  });
});
