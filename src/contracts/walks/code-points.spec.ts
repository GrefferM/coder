import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { codePoints } from "./code-points";

describe("codePoints", () => {
  it("counts a text of the basic plane by its letters", () => {
    assert.equal(codePoints(""), 0);
    assert.equal(codePoints("Привіт, світ"), 12);
  });

  it("counts a pair of surrogates once", () => {
    assert.equal(codePoints("😀"), 1);
    assert.equal(codePoints("а😀б😀"), 4);
  });

  it("counts a half left alone as one, as the spread of the text does", () => {
    const lone = "\ud83d";

    assert.equal(codePoints(lone), [...lone].length);
    assert.equal(codePoints(`а${lone}б`), [...`а${lone}б`].length);
  });
});
