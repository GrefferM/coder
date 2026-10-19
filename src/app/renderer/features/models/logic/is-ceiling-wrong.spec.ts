import { describe, expect, it } from "vitest";
import { isCeilingWrong } from "./is-ceiling-wrong";
import { MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST } from "../../../../../contracts";

describe("isCeilingWrong", () => {
  it("takes any number the file would take, at either end", () => {
    expect(
      isCeilingWrong(String(MODEL_ANSWER_CEILING_LEAST), MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST),
    ).toBe(false);
    expect(isCeilingWrong("8192", MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST)).toBe(false);
    expect(
      isCeilingWrong(String(MODEL_ANSWER_CEILING_MOST), MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST),
    ).toBe(false);
  });

  it("refuses what the file refuses, and keeps what was typed for the field to show", () => {
    // The form checks the rule before the write, so the field reports it.
    expect(isCeilingWrong("0", MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST)).toBe(true);
    expect(isCeilingWrong("-5", MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST)).toBe(true);
    expect(
      isCeilingWrong(String(MODEL_ANSWER_CEILING_LEAST - 1), MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST),
    ).toBe(true);
    expect(
      isCeilingWrong(String(MODEL_ANSWER_CEILING_MOST + 1), MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST),
    ).toBe(true);
  });

  it("does not call an empty field wrong, since nothing is typed there yet", () => {
    // An empty required field is reported at the press, not while typing.
    expect(isCeilingWrong("", MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST)).toBe(false);
    expect(isCeilingWrong("   ", MODEL_ANSWER_CEILING_LEAST, MODEL_ANSWER_CEILING_MOST)).toBe(false);
  });
});
