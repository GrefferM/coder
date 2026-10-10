import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notStartedOf } from "./not-started-of";
import { NOT_STARTED_STATES, RUN_STEP_DONE, RUN_STEP_FAILED, RUN_STEP_SILENT } from "../../../contracts";

describe("notStartedOf", () => {
  it("finds the reason behind every word the family writes, so a card can be drawn again from the record", () => {
    for (const [reason, state] of Object.entries(NOT_STARTED_STATES)) {
      assert.equal(notStartedOf(state), reason);
    }
  });

  it("gives each reason a word of its own, since one word cannot point back at two of them", () => {
    const states = Object.values(NOT_STARTED_STATES);

    assert.equal(new Set(states).size, states.length);
  });

  it("says nothing of a turn that ran, however it ended", () => {
    assert.equal(notStartedOf(RUN_STEP_DONE), null);
    assert.equal(notStartedOf(RUN_STEP_FAILED), null);
    // A model that answered with nothing is not a provider that never answered.
    assert.equal(notStartedOf(RUN_STEP_SILENT), null);
  });
});
