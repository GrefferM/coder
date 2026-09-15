import { describe, expect, it } from "vitest";
import { fieldBorderColor } from "./field-border-color";
import { FIELD_INVALID_BORDER_COLOR } from "../field/constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../field-slot/constants";
import { PICKER_BORDER_COLOR, PICKER_OPEN_BORDER_COLOR } from "./constants";

describe("fieldBorderColor · which of the three wins", () => {
  it("rests where nothing is true of the field", () => {
    expect(fieldBorderColor(false, false, false)).toBe(PICKER_BORDER_COLOR);
  });

  it("says a value is wrong over saying it is unsaved", () => {
    expect(fieldBorderColor(false, true, true)).toBe(FIELD_INVALID_BORDER_COLOR);
  });

  it("says a value is unsaved where nothing is wrong with it", () => {
    expect(fieldBorderColor(false, false, true)).toBe(FIELD_SLOT_CHANGED_BORDER_COLOR);
  });

  it("wears the open colour over both, since the list standing there is what is happening now", () => {
    expect(fieldBorderColor(true, true, true)).toBe(PICKER_OPEN_BORDER_COLOR);
  });
});
