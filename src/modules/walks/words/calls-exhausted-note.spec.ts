import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { callsExhaustedNote } from "./calls-exhausted-note";

describe("callsExhaustedNote", () => {
  it("names the number the person set, since the wall is theirs and not the app's", () => {
    assert.equal(callsExhaustedNote(8), "Вичерпано максимум викликів · 8");
  });

  it("says a ceiling of one the same way, without bending the words around it", () => {
    assert.equal(callsExhaustedNote(1), "Вичерпано максимум викликів · 1");
  });
});
