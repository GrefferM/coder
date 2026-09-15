import { describe, expect, it } from "vitest";
import { callsExhaustedNote } from "./calls-exhausted-note";

describe("callsExhaustedNote", () => {
  it("names the number the person set, since the wall is theirs and not the app's", () => {
    expect(callsExhaustedNote(8)).toBe("Вичерпано максимум викликів · 8");
  });

  it("says a ceiling of one the same way, without bending the words around it", () => {
    expect(callsExhaustedNote(1)).toBe("Вичерпано максимум викликів · 1");
  });
});
