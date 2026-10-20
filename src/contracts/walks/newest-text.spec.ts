import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { newestText } from "./newest-text";

describe("newestText", () => {
  it("returns a text that fits as it is", () => {
    assert.equal(newestText("один два", 8), "один два");
  });

  it("keeps the end and drops the start where the cut falls between words", () => {
    assert.equal(newestText("один два три", 8), "два три");
  });

  it("goes forward to the first word that is whole, not leaving half of one", () => {
    assert.equal(newestText("один два три", 10), "два три");
  });

  it("keeps what a cut word has where the text is one word long", () => {
    assert.equal(newestText("абвгдеєжз", 4), "еєжз");
  });

  it("counts in characters, a pair that takes two units of a string as one", () => {
    assert.equal(newestText("😀😀😀😀😀", 3), "😀😀😀");
  });

  it("gives nothing for a room of nothing", () => {
    assert.equal(newestText("слова", 0), "");
  });
});
