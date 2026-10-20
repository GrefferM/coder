import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cutAtWord } from "./cut-at-word";

describe("cutAtWord keeping the start", () => {
  it("leaves a text within its room as it is, bar the spaces around it", () => {
    assert.equal(cutAtWord("  новий факт. старий факт.  ", 100, "start"), "новий факт. старий факт.");
    assert.equal(cutAtWord("рівно", 5, "start"), "рівно");
  });

  it("cuts the end off at the room where the cut falls between words", () => {
    assert.equal(cutAtWord("один два три", 8, "start"), "один два");
  });

  it("goes back to the last word that is whole, not leaving half of one", () => {
    assert.equal(cutAtWord("один два три", 10, "start"), "один два");
  });

  it("keeps what a cut word has, where the text is one word long", () => {
    assert.equal(cutAtWord("абвгдеєжз", 4, "start"), "абвг");
  });

  it("counts in characters, a pair that takes two units of a string as one", () => {
    assert.equal(cutAtWord("😀😀😀 😀", 4, "start"), "😀😀😀");
    assert.equal(cutAtWord("😀😀😀😀😀", 3, "start"), "😀😀😀");
  });

  it("gives nothing for a room of nothing", () => {
    assert.equal(cutAtWord("слова", 0, "start"), "");
  });
});

describe("cutAtWord keeping the end", () => {
  it("returns a text that fits as it is", () => {
    assert.equal(cutAtWord("один два", 8, "end"), "один два");
  });

  it("drops the start where the cut falls between words", () => {
    assert.equal(cutAtWord("один два три", 8, "end"), "два три");
  });

  it("goes forward to the first word that is whole, not leaving half of one", () => {
    assert.equal(cutAtWord("один два три", 10, "end"), "два три");
  });

  it("keeps what a cut word has where the text is one word long", () => {
    assert.equal(cutAtWord("абвгдеєжз", 4, "end"), "еєжз");
  });

  it("counts in characters, a pair that takes two units of a string as one", () => {
    assert.equal(cutAtWord("😀😀😀😀😀", 3, "end"), "😀😀😀");
  });

  it("gives nothing for a room of nothing", () => {
    assert.equal(cutAtWord("слова", 0, "end"), "");
  });
});
