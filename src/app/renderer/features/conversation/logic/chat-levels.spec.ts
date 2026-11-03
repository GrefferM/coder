import { describe, expect, it } from "vitest";
import { chatLevels } from "./chat-levels";
import type { ChatMessage } from "../interfaces";

function said(patch: Partial<ChatMessage> & Pick<ChatMessage, "id">): ChatMessage {
  return {
    agentId: "agent-1",
    from: "agent",
    text: "Готово",
    at: "2026-08-22T19:27:04.000Z",
    questionId: "question-1",
    askedAt: 1,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    waitsFor: null,
    calls: [],
    began: "2026-08-22T19:27:00.000Z",
    stepId: patch.id,
    walkId: null,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    compressed: null,
    ...patch,
  };
}

describe("chatLevels", () => {
  it("stands a turn nobody fed on the first step", () => {
    expect(
      chatLevels([
        said({
          id: "one",
        }),
      ]),
    ).toEqual({
      one: 1,
    });
  });

  it("stands every other turn below the deepest that fed it", () => {
    const levels = chatLevels([
      said({
        id: "one",
      }),
      said({
        id: "two",
        fedBy: ["one"],
        attached: [],
        compressed: null,
      }),
      said({
        id: "three",
        fedBy: ["one", "two"],
        attached: [],
        compressed: null,
      }),
    ]);

    expect(levels).toEqual({
      one: 1,
      two: 2,
      three: 3,
    });
  });

  it("puts turns that ran at once on one step, since a step is a level and not a turn", () => {
    const levels = chatLevels([
      said({
        id: "one",
      }),
      said({
        id: "two",
        fedBy: ["one"],
        attached: [],
        compressed: null,
      }),
      said({
        id: "three",
        fedBy: ["one"],
        attached: [],
        compressed: null,
      }),
    ]);

    expect([levels.two, levels.three]).toEqual([2, 2]);
  });

  it("counts a live turn whose step is not written yet as one nobody fed", () => {
    // A card is patched with its step id when the write returns; until then it stands first.
    const levels = chatLevels([
      said({
        id: "one",
      }),
      said({
        id: "two",
        stepId: null,
        fedBy: ["one"],
        attached: [],
        compressed: null,
      }),
    ]);

    expect(levels.two).toBe(2);
  });

  it("counts nothing for a question or a handoff, since neither is a turn", () => {
    const levels = chatLevels([
      said({
        id: "asked",
        from: "person",
      }),
      said({
        id: "handed",
        from: "handoff",
      }),
      said({
        id: "one",
      }),
    ]);

    expect(levels).toEqual({
      one: 1,
    });
  });

  it("walks no ring twice, whatever the record holds", () => {
    const levels = chatLevels([
      said({
        id: "one",
        fedBy: ["two"],
        attached: [],
        compressed: null,
      }),
      said({
        id: "two",
        fedBy: ["one"],
        attached: [],
        compressed: null,
      }),
    ]);

    expect(Object.keys(levels)).toHaveLength(2);
  });
});
