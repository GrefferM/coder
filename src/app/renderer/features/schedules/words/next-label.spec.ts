import { describe, expect, it } from "vitest";
import { nextLabel } from "./next-label";

const MINUTE = 60_000;

describe("nextLabel", () => {
  it("rounds the time left down to whole minutes", () => {
    expect(nextLabel(12 * MINUTE + 59_000, 0)).toBe("НАСТУПНИЙ ЧЕРЕЗ 12 ХВ");
  });

  it("says under a minute rather than zero", () => {
    expect(nextLabel(59_000, 0)).toBe("НАСТУПНИЙ ЧЕРЕЗ < 1 ХВ");
  });

  it("says a moment already passed as under a minute too", () => {
    expect(nextLabel(0, 5_000)).toBe("НАСТУПНИЙ ЧЕРЕЗ < 1 ХВ");
  });

  it("says a long wait in hours", () => {
    expect(nextLabel(95 * MINUTE, 0)).toBe("НАСТУПНИЙ ЧЕРЕЗ 1 ГОД 35 ХВ");
  });
});
