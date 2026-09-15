import { describe, expect, it } from "vitest";
import { withinField } from "./within-field";
import { FIELD_LEAST_HEIGHT_PX, FIELD_MOST_HEIGHT_PX } from "../constants";

describe("withinField", () => {
  it("keeps what the hand asked for, where the hand asked for something reasonable", () => {
    expect(withinField(180)).toBe(180);
  });

  it("never goes under the field's own least, however far down the hand pulls", () => {
    expect(withinField(4)).toBe(FIELD_LEAST_HEIGHT_PX);
    expect(withinField(-300)).toBe(FIELD_LEAST_HEIGHT_PX);
  });

  it("never eats the stream, however far up the hand pulls", () => {
    expect(withinField(4_000)).toBe(FIELD_MOST_HEIGHT_PX);
  });

  it("stands on whole pixels, because half of one is a line that trembles", () => {
    expect(withinField(180.6)).toBe(181);
  });
});
