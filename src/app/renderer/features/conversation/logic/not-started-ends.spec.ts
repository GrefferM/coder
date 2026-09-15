import { describe, expect, it } from "vitest";
import { NOT_STARTED_ENDS } from "../constants";
import { RUN_STEP_NOT_SENT_ENDS } from "../../../../../contracts";

describe("the family of 4e against the record's own list", () => {
  it("names every end of the family in the list the record counts «НЕ ПІШОВ» by", () => {
    // The two live on opposite sides of the bridge: the renderer writes these words into the record, and the reader
    // counts the row's state by them. Nothing but this holds them together, so a new reason added to the
    // family and forgotten in the contract would quietly become «УПАВ» — red for something the app never did.
    for (const [reason, end] of Object.entries(NOT_STARTED_ENDS)) {
      expect(
        RUN_STEP_NOT_SENT_ENDS,
        `«${reason}» writes the end «${end.state}», which the record does not know as one that never went`,
      ).toContain(end.state);
    }
  });
});
