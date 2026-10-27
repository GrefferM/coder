import { describe, expect, it } from "vitest";
import { standsWithRepeat } from "./stands-with-repeat";
import { CHAT_FAILED_NOTE } from "../constants";
import type { ChatMessage } from "../interfaces";

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "said-1",
    agentId: "editor",
    from: "agent",
    text: "Готово",
    at: "2026-09-02T15:41:00.000Z",
    questionId: "question-1",
    askedAt: 1,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: null,
    note: null,
    // Every answer carries what it was asked, so a repeat anywhere in the walk has the words.
    asked: "Прогони тести",
    fedBy: [],
    attached: [],
    compressed: null,
    ...patch,
  };
}

describe("standsWithRepeat", () => {
  it("stands under a turn the app had to say a word about", () => {
    // «ВІДПОВІДЬ НЕ ПРИЙШЛА», «ЗУПИНЕНО», «ВИЧЕРПАНО МАКСИМУМ ВИКЛИКІВ» share one recipe.
    expect(
      standsWithRepeat(
        said({
          isFailure: true,
          note: CHAT_FAILED_NOTE,
        }),
      ),
    ).toBe(true);
  });

  it("stands under a turn that never began, the ceiling's own among them", () => {
    // No exception remains: the card's own act raises the ceiling and the same words go through.
    expect(
      standsWithRepeat(
        said({
          notStarted: "noKey",
        }),
      ),
    ).toBe(true);
    expect(
      standsWithRepeat(
        said({
          notStarted: "tooLong",
        }),
      ),
    ).toBe(true);
  });

  it("stands under a link the work could not go down", () => {
    // The walk ended at that link and the same repeat picks it up.
    expect(
      standsWithRepeat(
        said({
          stopReason: "off",
        }),
      ),
    ).toBe(true);
  });

  it("stands under nothing where the turn answered", () => {
    // The asked words are kept for a repeat further down the walk, not here.
    expect(standsWithRepeat(said())).toBe(false);
  });

  it("does not stand under a line the agent chose not to take, which is no accident", () => {
    expect(
      standsWithRepeat(
        said({
          from: "handoff",
          stopReason: "notChosen",
        }),
      ),
    ).toBe(false);
    expect(
      standsWithRepeat(
        said({
          from: "handoff",
          stopReason: "finished",
        }),
      ),
    ).toBe(false);
  });

  it("stands under a line cut because the neighbour was off", () => {
    expect(
      standsWithRepeat(
        said({
          from: "handoff",
          stopReason: "off",
        }),
      ),
    ).toBe(true);
  });
});
