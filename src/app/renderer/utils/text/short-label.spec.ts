import { describe, expect, it } from "vitest";
import { shortLabel } from "./short-label";

describe("shortLabel", () => {
  it("leaves a label the head has room for", () => {
    expect(shortLabel("РЕВ'ЮЕР", 14)).toBe("РЕВ'ЮЕР");
  });

  it("leaves a label that fills the room exactly", () => {
    expect(shortLabel("ПЛАНУВАЛЬНИКИ", 13)).toBe("ПЛАНУВАЛЬНИКИ");
  });

  it("cuts a longer label to that room, ellipsis and all", () => {
    expect(shortLabel("ГОЛОВНИЙ ПЛАНУВАЛЬНИК", 14)).toBe("ГОЛОВНИЙ ПЛАН…");
  });

  it("keeps no space before the ellipsis", () => {
    expect(shortLabel("ГОЛОВНИЙ РЕВ'ЮЕР", 10)).toBe("ГОЛОВНИЙ…");
  });
});
