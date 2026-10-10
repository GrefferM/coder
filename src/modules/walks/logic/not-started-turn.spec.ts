import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notStartedTurn } from "./not-started-turn";
import { NOT_STARTED_STATES } from "../../../contracts";
import type { TurnLength } from "../../../contracts";

describe("notStartedTurn", () => {
  it("is neither a fall nor a cut, and cost nothing — there was no attempt to pay for", () => {
    const turn = notStartedTurn("Розбий текст на тези", "noKey");

    assert.equal(turn.isFailure, false);
    assert.equal(turn.isCut, false);
    assert.equal(turn.cost, null);
    assert.deepEqual(turn.calls, []);
  });

  it("carries no rule of its own: The card already says everything", () => {
    assert.equal(notStartedTurn("Розбий текст на тези", "noKey").note, null);
  });

  it("gives every wall its own end, so the record says afterwards which one the turn met", () => {
    assert.equal(notStartedTurn("", "noKey").state, NOT_STARTED_STATES.noKey);
    assert.equal(notStartedTurn("", "silent").state, NOT_STARTED_STATES.silent);
    // «unreachable» and «noProvider» are distinct walls and the record keeps them apart.
    assert.notEqual(notStartedTurn("", "silent").state, notStartedTurn("", "noProvider").state);
  });

  it("carries what the turn would have taken where that is known, and nothing where it is not", () => {
    // A turn refused over the ceiling knows its own length; other walls do not.
    const wouldGo: TurnLength = {
      prompt: 400,
      asked: 720_000,
      memory: 0,
      total: 720_400,
      ceiling: 700_000,
    };

    assert.equal(notStartedTurn("", "tooLong", wouldGo).wouldGo, wouldGo);
    assert.equal(notStartedTurn("", "noKey").wouldGo, null);
  });
});
