import { describe, expect, it } from "vitest";
import { unfilledField } from "./unfilled-field";
import { MODEL_FIELD_ANSWER_CEILING, MODEL_FIELD_CONTEXT_CEILING, MODEL_FIELD_OUTPUT_PRICE } from "../constants";
import type { WrittenNumber } from "../interfaces";

const CEILINGS: WrittenNumber[] = [
  [200_000, MODEL_FIELD_CONTEXT_CEILING],
  [4096, MODEL_FIELD_ANSWER_CEILING],
];

describe("unfilledField", () => {
  it("says nothing where every number of the list is written", () => {
    expect(unfilledField(CEILINGS)).toBeNull();
  });

  it("names the field, in the words its own form writes over that row", () => {
    expect(unfilledField([...CEILINGS, [null, MODEL_FIELD_OUTPUT_PRICE]])).toBe(MODEL_FIELD_OUTPUT_PRICE);
  });

  it("names the first empty field in the order given, so the person is sent to the row they meet first", () => {
    expect(
      unfilledField([
        [null, MODEL_FIELD_CONTEXT_CEILING],
        [null, MODEL_FIELD_ANSWER_CEILING],
      ]),
    ).toBe(MODEL_FIELD_CONTEXT_CEILING);
  });

  it("counts a number of nothing as written, since zero is a number the person wrote", () => {
    expect(unfilledField([[0, MODEL_FIELD_OUTPUT_PRICE]])).toBeNull();
  });
});
