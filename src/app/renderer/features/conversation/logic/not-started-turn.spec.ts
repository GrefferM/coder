import { describe, expect, it } from "vitest";
import { notStartedTurn } from "./not-started-turn";
import { NOT_STARTED_ENDS } from "../constants";
import type { TurnLength } from "../interfaces";

describe("notStartedTurn", () => {
  it("is neither a fall nor a cut, and cost nothing — there was no attempt to pay for", () => {
    const turn = notStartedTurn("Розбий текст на тези", "noKey");

    expect(turn.isFailure).toBe(false);
    expect(turn.isCut).toBe(false);
    expect(turn.cost).toBeNull();
    expect(turn.calls).toEqual([]);
  });

  it("carries no rule of its own: The card already says everything", () => {
    expect(notStartedTurn("Розбий текст на тези", "noKey").note).toBeNull();
  });

  it("gives every wall its own end, so the record says afterwards which one the turn met", () => {
    expect(notStartedTurn("", "noKey").state).toBe(NOT_STARTED_ENDS.noKey.state);
    expect(notStartedTurn("", "silent").state).toBe(NOT_STARTED_ENDS.silent.state);
    // «unreachable» and «noProvider» are distinct walls and the record keeps them apart.
    expect(notStartedTurn("", "silent").state).not.toBe(notStartedTurn("", "noProvider").state);
  });

  it("carries what the turn would have taken where that is known, and nothing where it is not", () => {
    // A turn refused over the ceiling knows its own length; other walls do not.
    const wouldGo: TurnLength = {
      prompt: 400,
      asked: 720_000,
      total: 720_400,
      ceiling: 700_000,
    };

    expect(notStartedTurn("", "tooLong", wouldGo).wouldGo).toBe(wouldGo);
    expect(notStartedTurn("", "noKey").wouldGo).toBeNull();
  });
});
