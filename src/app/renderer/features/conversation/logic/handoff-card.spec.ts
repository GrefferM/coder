import { describe, expect, it } from "vitest";
import { handoffCard } from "./handoff-card";
import type { HandoffSaid } from "../interfaces";

function said(patch: Partial<HandoffSaid> = {}): HandoffSaid {
  return {
    id: "row-1",
    runKey: "walk-1",
    fromAgentId: "editor",
    toAgentId: "reviewer",
    stopReason: null,
    questionId: "question-1",
    askedAt: 100,
    at: new Date("2026-09-02T15:41:00.000Z").getTime(),
    ...patch,
  };
}

describe("handoffCard", () => {
  it("stands in the sender's name, and names the neighbour the work went to", () => {
    const row = handoffCard(said());

    expect(row.from).toBe("handoff");
    expect(row.agentId).toBe("editor");
    expect(row.otherAgentId).toBe("reviewer");
    expect(row.stopReason).toBeNull();
  });

  it("carries the word for a line the work could not go down", () => {
    // The walk ends at such a line, and the row says why.
    expect(
      handoffCard(
        said({
          stopReason: "off",
        }),
      ).stopReason,
    ).toBe("off");
  });

  it("stands in the addressee's own name where nobody sent it: the question is the person's", () => {
    // «ПИТАННЯ НЕ ПІШЛО ⇢ EDITOR · ВИМКНЕНИЙ»: the person's question has no sender.
    const row = handoffCard(
      said({
        fromAgentId: null,
        stopReason: "off",
      }),
    );

    expect(row.from).toBe("notSent");
    expect(row.agentId).toBe("reviewer");
  });

  it("names the walk it belongs to, so a repeat finds its question by the walk and not by the clock", () => {
    expect(handoffCard(said()).walkId).toBe("walk-1");
  });

  it("says no words of its own: this is the app speaking, on a rule and not in a card", () => {
    const row = handoffCard(said());

    expect(row.text).toBe("");
    expect(row.cost).toBeNull();
    expect(row.calls).toEqual([]);
    expect(row.asked).toBeNull();
  });
});
