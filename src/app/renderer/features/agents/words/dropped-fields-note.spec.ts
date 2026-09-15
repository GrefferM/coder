import { describe, expect, it } from "vitest";
import { droppedFieldsNote } from "./dropped-fields-note";

describe("droppedFieldsNote", () => {
  it("says nothing when nothing moved", () => {
    expect(droppedFieldsNote([])).toBe("");
  });

  it("opens on the same sentence as the other voice, and parts on what it undoes", () => {
    expect(droppedFieldsNote(["назву", "колір"])).toBe(
      "Назву й колір змінено й не збережено. Скидаємо їх до записаного — повернути це буде нічим.",
    );
  });
});
