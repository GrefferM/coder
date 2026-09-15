import { describe, expect, it } from "vitest";
import { openBrace } from "./open-brace";

describe("openBrace", () => {
  it("takes the brace the caret stands in, and what has been typed since it", () => {
    expect(openBrace("git checkout {bra", 17)).toEqual({
      at: 13,
      typed: "bra",
    });
  });

  it("takes a brace just opened, with nothing typed yet", () => {
    expect(openBrace("git checkout {", 14)).toEqual({
      at: 13,
      typed: "",
    });
  });

  it("takes nothing where no brace was opened before the caret", () => {
    expect(openBrace("git checkout", 12)).toBeNull();
  });

  it("takes nothing where the brace is already closed: the slot is written out", () => {
    expect(openBrace("git checkout {branch}", 21)).toBeNull();
  });

  it("takes nothing where a space has ended the brace: a name has no spaces in it", () => {
    // What a parameter may be named is letters, digits and «_» — a space is not one of them.
    expect(openBrace("say {hello there", 16)).toBeNull();
  });

  it("takes the last brace before the caret, not the first", () => {
    expect(openBrace("{one} and {tw", 13)).toEqual({
      at: 10,
      typed: "tw",
    });
  });
});
