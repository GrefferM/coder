import { describe, expect, it } from "vitest";
import { askedCards } from "./asked-cards";
import type { AskedSaid, ChatCost, IncomingWork } from "../interfaces";

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

    expect(card.from).toBe("person");
    expect(card.otherAgentId).toBeNull();
    expect(card.text).toBe("Прогони тести");
    expect(card.walkId).toBe("walk-1");
  });

  it("stands work that arrived down a line as the supplier's, with what that turn cost", () => {
    const [card] = askedCards(
      said({
        incoming: [work("editor", "Готово")],
      }),
    );

    expect(card.from).toBe("supplier");
    expect(card.otherAgentId).toBe("editor");
    expect(card.cost).toEqual(paid);
  });

  it("gives one card to every line the work came by, each with its own id", () => {
    // A converging point is given what every supplier said, and the cards keep the order of the lines.
    const cards = askedCards(
      said({
        incoming: [work("editor", "Готово"), work("linter", "Чисто")],
      }),
    );

    expect(cards.map((card) => card.id)).toEqual(["said-1", "said-2"]);
    expect(cards.map((card) => card.text)).toEqual(["Готово", "Чисто"]);
  });

  it("says nothing again for a repeat: those words already stand in the stream", () => {
    // The repeat picks the walk up where it stopped, right under the words it was given.
    expect(
      askedCards(
        said({
          isAgain: true,
        }),
      ),
    ).toEqual([]);
  });
});
