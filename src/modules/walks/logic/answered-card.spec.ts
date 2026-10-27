import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answeredCard } from "./answered-card";
import { RUN_STEP_DONE, RUN_STEP_SILENT } from "../../../contracts";
import type { AnsweredTurn, TurnAnswer } from "../../../contracts";

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
    compressed: null,
    toolMemories: [],
    route: null,
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

    assert.equal(card.from, "agent");
    assert.equal(card.text, "Готово");
    assert.equal(card.askedAt, 1_700_000_000_000);
    assert.equal(card.began, new Date(1_700_000_000_500).toISOString());
    assert.equal(card.at, new Date(1_700_000_012_500).toISOString());
  });

  it("keeps its own question and what fed it, for a repeat to pick the walk up on", () => {
    const card = answeredCard(turn());

    assert.equal(card.asked, "Додай кешування");
    assert.deepEqual(card.fedBy, ["step-1"]);
  });

  it("knows no step of its own until the record has written one", () => {
    assert.equal(answeredCard(turn()).stepId, null);
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

    assert.equal(card.text, "");
    assert.equal(card.note, "МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО");
  });

  it("belongs to no line: an answer is the agent's own, not something that arrived", () => {
    const card = answeredCard(turn());

    assert.equal(card.otherAgentId, null);
    assert.equal(card.stopReason, null);
  });

  it("carries the settings a compression was made under, the composer's words left out", () => {
    const card = answeredCard(
      turn({
        answer: answer({
          compressed: {
            facts: {
              agentId: "editor",
              questionId: null,
              coversPlace: 3,
              text: "Зміст",
              lengthBefore: 91_000,
              lengthAfter: 9_400,
              compressAt: 70,
              compressTo: 30,
              inputTokens: 10,
              outputTokens: 5,
              money: null,
            },
            carried: 9_460,
          },
        }),
      }),
    );

    assert.deepEqual(card.compressed, {
      at: 70,
      to: 30,
    });
  });

  it("carries none for a turn whose memory was not compressed", () => {
    assert.equal(answeredCard(turn()).compressed, null);
  });
});
