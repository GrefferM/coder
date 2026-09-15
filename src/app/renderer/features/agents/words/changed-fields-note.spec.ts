import { describe, expect, it } from "vitest";
import { changedFieldsNote } from "./changed-fields-note";

describe("changedFieldsNote", () => {
  it("says nothing when nothing moved", () => {
    expect(changedFieldsNote([])).toBe("");
  });

  it("opens with what was changed and ends with what leaving costs", () => {
    expect(changedFieldsNote(["назву", "колір"])).toBe(
      "Назву й колір змінено й не збережено. Якщо піти зараз — зміни зникнуть.",
    );
  });
});
