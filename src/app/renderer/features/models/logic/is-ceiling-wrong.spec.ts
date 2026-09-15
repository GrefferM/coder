import { describe, expect, it } from "vitest";
import { isCeilingWrong } from "./is-ceiling-wrong";
import { MODEL_ANSWER_CEILING_LEAST } from "../../../../../contracts";

describe("isCeilingWrong", () => {
  it("takes any number the file would take", () => {
    expect(isCeilingWrong("1", MODEL_ANSWER_CEILING_LEAST)).toBe(false);
    expect(isCeilingWrong("128000", MODEL_ANSWER_CEILING_LEAST)).toBe(false);
  });

  it("refuses what the file refuses, and keeps what was typed for the field to show", () => {
    // The rule is the file's own: the form asks it before the write so the person hears it from the field.
    expect(isCeilingWrong("0", MODEL_ANSWER_CEILING_LEAST)).toBe(true);
    expect(isCeilingWrong("-5", MODEL_ANSWER_CEILING_LEAST)).toBe(true);
  });

  it("does not call an empty field wrong, since nothing is typed there yet", () => {
    // An empty required field is answered at the press, and not while somebody is still thinking.
    expect(isCeilingWrong("", MODEL_ANSWER_CEILING_LEAST)).toBe(false);
    expect(isCeilingWrong("   ", MODEL_ANSWER_CEILING_LEAST)).toBe(false);
  });
});
