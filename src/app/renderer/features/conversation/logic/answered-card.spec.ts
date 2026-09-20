import { describe, expect, it } from "vitest";
import { answeredCard } from "./answered-card";
import { RUN_STEP_DONE, RUN_STEP_SILENT } from "../../record";
import type { AnsweredTurn, TurnAnswer } from "../interfaces";

function answer(patch: Partial<TurnAnswer> = {}): TurnAnswer {
  return {
    text: "Готово",
    note: null,
    cost: null,
    answerCeiling: null,
    isFailure: false,
    fell: null,
    isCut: false,
    notStarted: null,
    wouldGo: null,
    state: RUN_STEP_DONE,
    calls: [],
    ...patch,
  };
}

function turn(patch: Partial<AnsweredTurn> = {}): AnsweredTurn {
  return {
    id: "said-1",
    agentId: "editor",
    walkId: "walk-1",
    asked: "Додай кешування",
    fedBy: ["step-1"],
    said: "Готово",
    questionId: "question-1",
    askedAt: 1_700_000_000_000,
    startedAt: 1_700_000_000_500,
    endedAt: 1_700_000_012_500,
    answer: answer(),
    ...patch,
  };
}

describe("answeredCard", () => {
  it("says the agent's own words, and stands in the block of the question it grew from", () => {
    const card = answeredCard(turn());

    expect(card.from).toBe("agent");
    expect(card.text).toBe("Готово");
    expect(card.askedAt).toBe(1_700_000_000_000);
    expect(card.began).toBe(new Date(1_700_000_000_500).toISOString());
    expect(card.at).toBe(new Date(1_700_000_012_500).toISOString());
  });

  it("keeps its own question and what fed it, for a repeat to pick the walk up on", () => {
    const card = answeredCard(turn());

    expect(card.asked).toBe("Додай кешування");
    expect(card.fedBy).toEqual(["step-1"]);
  });

  it("knows no step of its own until the record has written one", () => {
    expect(answeredCard(turn()).stepId).toBeNull();
  });

  it("carries the app's word about the turn beside the words, and never inside them", () => {
    const card = answeredCard(
      turn({
        said: "",
        answer: answer({
          note: "МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО",
          state: RUN_STEP_SILENT,
        }),
      }),
    );

    expect(card.text).toBe("");
    expect(card.note).toBe("МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО");
  });

  it("belongs to no line: an answer is the agent's own, not something that arrived", () => {
    const card = answeredCard(turn());

    expect(card.otherAgentId).toBeNull();
    expect(card.stopReason).toBeNull();
  });
});
