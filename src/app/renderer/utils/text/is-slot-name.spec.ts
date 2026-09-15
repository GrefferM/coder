import { describe, expect, it } from "vitest";
import { isSlotName } from "./is-slot-name";

describe("isSlotName", () => {
  it("takes a plain name, in either alphabet", () => {
    expect(isSlotName("path")).toBe(true);
    expect(isSlotName("шлях")).toBe(true);
  });

  it("takes digits and «_» inside a name", () => {
    expect(isSlotName("file_2")).toBe(true);
    expect(isSlotName("_hidden")).toBe(true);
  });

  it("refuses a name that would make the line ambiguous", () => {
    expect(isSlotName("")).toBe(false);
    expect(isSlotName("print $5")).toBe(false);
    expect(isSlotName("2nd")).toBe(false);
    expect(isSlotName("a-b")).toBe(false);
    expect(isSlotName("{path}")).toBe(false);
    expect(isSlotName("path ")).toBe(false);
  });
});
