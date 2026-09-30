import { describe, expect, it } from "vitest";
import { NOT_STARTED_ENDS } from "../constants";
import { RUN_STEP_NOT_SENT_ENDS } from "../../../../../contracts";

describe("the family of not-started ends against the record's own list", () => {
  it("names every end of the family in the list the record counts «НЕ ПІШОВ» by", () => {
    // The renderer writes these ends into the record and the reader counts «НЕ ПІШОВ» by them; a reason missing from
    // the contract would show as «УПАВ».
    for (const [reason, end] of Object.entries(NOT_STARTED_ENDS)) {
      expect(
        RUN_STEP_NOT_SENT_ENDS,
        `«${reason}» writes the end «${end.state}», which the record does not know as one that never went`,
      ).toContain(end.state);
    }
  });
});
