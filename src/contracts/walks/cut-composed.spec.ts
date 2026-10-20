import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cutComposed } from "./cut-composed";

describe("cutComposed", () => {
  it("leaves a message within its budget as it is, bar the spaces around it", () => {
    assert.equal(cutComposed("  новий факт. старий факт.  ", 100), "новий факт. старий факт.");
    assert.equal(cutComposed("рівно", 5), "рівно");
  });

  it("cuts the end off at the budget where the cut falls between words", () => {
    assert.equal(cutComposed("один два три", 8), "один два");
  });

  it("goes back to the last word that is whole, not leaving half of one", () => {
    assert.equal(cutComposed("один два три", 10), "один два");
  });

  it("keeps what a cut word has, where the message is one word long", () => {
    assert.equal(cutComposed("абвгдеєжз", 4), "абвг");
  });

  it("counts in characters, a pair that takes two units of a string as one", () => {
    assert.equal(cutComposed("😀😀😀 😀", 4), "😀😀😀");
    assert.equal(cutComposed("😀😀😀😀😀", 3), "😀😀😀");
  });

  it("gives nothing for a budget of nothing", () => {
    assert.equal(cutComposed("слова", 0), "");
  });
});
