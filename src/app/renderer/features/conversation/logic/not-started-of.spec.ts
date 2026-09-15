import { describe, expect, it } from "vitest";
import { notStartedOf } from "./not-started-of";
import { NOT_STARTED_ENDS } from "../constants";
import { RUN_STEP_DONE, RUN_STEP_FAILED, RUN_STEP_SILENT } from "../../record";

describe("notStartedOf", () => {
  it("finds the reason behind every word the family writes, so a card can be drawn again from the record", () => {
    for (const [reason, end] of Object.entries(NOT_STARTED_ENDS)) {
      expect(notStartedOf(end.state)).toBe(reason);
    }
  });

  it("gives each reason a word of its own, since one word cannot point back at two of them", () => {
    const states = Object.values(NOT_STARTED_ENDS).map((end) => end.state);

    expect(new Set(states).size).toBe(states.length);
  });

  it("says nothing of a turn that ran, however it ended", () => {
    expect(notStartedOf(RUN_STEP_DONE)).toBeNull();
    expect(notStartedOf(RUN_STEP_FAILED)).toBeNull();
    // A model that answered with nothing is not a provider that never answered.
    expect(notStartedOf(RUN_STEP_SILENT)).toBeNull();
  });
});
