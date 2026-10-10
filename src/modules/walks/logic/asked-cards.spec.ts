import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { askedCards } from "./asked-cards";
import type { AskedSaid, ChatCost, IncomingWork } from "../../../contracts";

const paid: ChatCost = {
  inputTokens: 120,
  outputTokens: 40,
  money: 0.0001,
};

function work(fromAgentId: string | null, text: string): IncomingWork {
  return {
    text,
    cost: fromAgentId === null ? null : paid,
    fromAgentId,
    fromStepIds: [],
    seconds: 4,
    attached: [],
  };
}

function said(patch: Partial<AskedSaid> = {}): AskedSaid {
  return {
    ids: ["said-1", "said-2"],
    runKey: "walk-1",
    agentId: "reviewer",
    incoming: [work(null, "Прогони тести")],
    questionId: "question-1",
    askedAt: 100,
    at: new Date("2026-09-02T15:41:00.000Z").getTime(),
    isAgain: false,
    ...patch,
  };
}

describe("askedCards", () => {
  it("stands the person's own question as theirs, with no sender behind it", () => {
    const [card] = askedCards(said());

    assert.equal(card.from, "person");
    assert.equal(card.otherAgentId, null);
    assert.equal(card.text, "Прогони тести");
    assert.equal(card.walkId, "walk-1");
  });

  it("stands work that arrived down a line as the supplier's, with what that turn cost", () => {
    const [card] = askedCards(
      said({
        incoming: [work("editor", "Готово")],
      }),
    );

    assert.equal(card.from, "supplier");
    assert.equal(card.otherAgentId, "editor");
    assert.deepEqual(card.cost, paid);
  });

  it("gives one card to every line the work came by, each with its own id", () => {
    // A converging point gets what every supplier said, cards in line order.
    const cards = askedCards(
      said({
        incoming: [work("editor", "Готово"), work("linter", "Чисто")],
      }),
    );

    assert.deepEqual(
      cards.map((card) => card.id),
      ["said-1", "said-2"],
    );
    assert.deepEqual(
      cards.map((card) => card.text),
      ["Готово", "Чисто"],
    );
  });

  it("says nothing again for a repeat: those words already stand in the stream", () => {
    // A repeat resumes right under the words it was given.
    assert.deepEqual(
      askedCards(
        said({
          isAgain: true,
        }),
      ),
      [],
    );
  });
});
