import { describe, expect, it } from "vitest";
import { modelSizeLabel } from "./model-size";

describe("modelSizeLabel", () => {
  it("writes a big model in whole gigabytes, the way the provider's own list writes it", () => {
    expect(modelSizeLabel(19_000_000_000)).toBe("19 GB");
  });

  it("keeps one place under ten gigabytes, where the place is the difference between two downloads", () => {
    expect(modelSizeLabel(4_700_000_000)).toBe("4.7 GB");
  });

  it("writes a small model in megabytes", () => {
    expect(modelSizeLabel(274_000_000)).toBe("274 MB");
  });

  it("writes nothing for a provider that says no size", () => {
    expect(modelSizeLabel(null)).toBe(null);
  });
});
