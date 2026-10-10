import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handoffCard } from "./handoff-card";
import type { HandoffSaid } from "../../../contracts";

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

    assert.equal(row.from, "handoff");
    assert.equal(row.agentId, "editor");
    assert.equal(row.otherAgentId, "reviewer");
    assert.equal(row.stopReason, null);
  });

  it("carries the word for a line the work could not go down", () => {
    // The walk ends at such a line, and the row says why.
    assert.equal(
      handoffCard(
        said({
          stopReason: "off",
        }),
      ).stopReason,
      "off",
    );
  });

  it("stands in the addressee's own name where nobody sent it: the question is the person's", () => {
    // «ПИТАННЯ НЕ ПІШЛО ⇢ EDITOR · ВИМКНЕНИЙ»: the person's question has no sender.
    const row = handoffCard(
      said({
        fromAgentId: null,
        stopReason: "off",
      }),
    );

    assert.equal(row.from, "notSent");
    assert.equal(row.agentId, "reviewer");
  });

  it("names the walk it belongs to, so a repeat finds its question by the walk and not by the clock", () => {
    assert.equal(handoffCard(said()).walkId, "walk-1");
  });

  it("says no words of its own: this is the app speaking, on a rule and not in a card", () => {
    const row = handoffCard(said());

    assert.equal(row.text, "");
    assert.equal(row.cost, null);
    assert.deepEqual(row.calls, []);
    assert.equal(row.asked, null);
  });
});
