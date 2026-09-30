import { describe, expect, it } from "vitest";
import { canAsk } from "./can-ask";

describe("canAsk", () => {
  it("lets a written question go from an open field", () => {
    expect(canAsk("Прогони тести", "open")).toBe(true);
  });

  it("sends nothing from an empty field, however open it stands", () => {
    expect(canAsk("   ", "open")).toBe(false);
  });

  it("sends nothing while the conversation walks: what is typed waits", () => {
    // The button under the field is «ЗУПИНИТИ» and the typed words stay.
    expect(canAsk("Прогони тести", "walking")).toBe(false);
  });

  it("sends nothing from a stitched field: there is nobody to ask", () => {
    // A switched-off agent, or nobody aimed at.
    expect(canAsk("Прогони тести", "stitched")).toBe(false);
  });
});
