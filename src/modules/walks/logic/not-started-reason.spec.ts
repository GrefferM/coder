import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notStartedReason } from "./not-started-reason";
import {
  LLM_NO_ADDRESS,
  LLM_NO_KEY,
  LLM_PROVIDER_NOT_BUILT,
  LLM_PROVIDER_SILENT,
  MACHINE_WALLS,
} from "../../../contracts";

describe("notStartedReason", () => {
  it("finds each of the four walls inside the sentence Electron wraps around it", () => {
    assert.equal(notStartedReason(`Error invoking remote method: ${LLM_NO_KEY}`), "noKey");
    assert.equal(notStartedReason(`Error invoking remote method: ${LLM_NO_ADDRESS}`), "noAddress");
    assert.equal(notStartedReason(`Error invoking remote method: ${LLM_PROVIDER_SILENT}`), "silent");
    assert.equal(notStartedReason(`Error invoking remote method: ${LLM_PROVIDER_NOT_BUILT}`), "noProvider");
  });

  it("says nothing for a turn that was tried and fell, which is not a wall at all", () => {
    // A provider's own fault is an answer, not a refusal.
    assert.equal(notStartedReason("LLM_ASK_FAILED"), null);
    assert.equal(notStartedReason(""), null);
  });

  it("finds every code the table names, and gives each its own wall", () => {
    // The table ties each refusal code to exactly one wall; none shares a wall or is unreachable.
    const walls = Object.entries(MACHINE_WALLS).map(([code, wall]) => {
      assert.equal(notStartedReason(`Error invoking remote method: ${code}`), wall);

      return wall;
    });

    assert.equal(new Set(walls).size, walls.length);
  });
});
