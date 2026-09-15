import { describe, expect, it } from "vitest";
import { joinedLabels } from "./joined-labels";

describe("joinedLabels", () => {
  it("has nothing to name when nothing moved", () => {
    expect(joinedLabels([])).toBe("");
  });

  it("leaves one name standing alone", () => {
    expect(joinedLabels(["назва"])).toBe("назва");
  });

  it("joins two with й", () => {
    expect(joinedLabels(["назва", "колір"])).toBe("назва й колір");
  });

  it("commas everyone before the last one", () => {
    expect(joinedLabels(["назва", "модель", "колір"])).toBe("назва, модель й колір");
  });
});
