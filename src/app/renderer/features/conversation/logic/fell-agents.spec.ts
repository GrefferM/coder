import { describe, expect, it } from "vitest";
import { fellAgents } from "./fell-agents";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { ChatMessage, WalkState } from "../interfaces";

function said(patch: Partial<ChatMessage>): ChatMessage {
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
    asked: null,
    fedBy: [],
    attached: [],
    ...patch,
  };
}

/**
 * One stream's walks with their words; each word is stamped with its walk's question so stream order is question order.
 */
function walk(said: Record<string, { askedAt: number; words: ChatMessage[] }>): WalkState {
  return {
    ...emptyWalk(),
    walks: Object.fromEntries(
      Object.entries(said).map(([runKey, held]) => [
        runKey,
        {
          ...begunWalk(`question-${held.askedAt}`, held.askedAt),
          said: held.words.map((word) => ({
            ...word,
            questionId: `question-${held.askedAt}`,
            askedAt: held.askedAt,
          })),
        },
      ]),
    ),
  };
}

describe("fellAgents", () => {
  it("names an agent whose last turn fell, and the hour it fell at", () => {
    const fell = fellAgents(
      walk({
        "walk-1": {
          askedAt: 1,
          words: [
            said({
              id: "one",
              isFailure: true,
              at: "2026-09-02T15:41:00.000Z",
            }),
          ],
        },
      }),
    );

    expect(fell).toEqual({
      editor: "2026-09-02T15:41:00.000Z",
    });
  });

  it("clears the mark with one good turn said after it", () => {
    // The dot follows the last word; a later-asked walk is the later word.
    const fell = fellAgents(
      walk({
        "walk-1": {
          askedAt: 1,
          words: [
            said({
              id: "one",
              isFailure: true,
            }),
          ],
        },
        "walk-2": {
          askedAt: 2,
          words: [
            said({
              id: "two",
              at: "2026-09-02T15:00:00.000Z",
            }),
          ],
        },
      }),
    );

    expect(fell).toEqual({});
  });

  it("says nothing of a fall in another conversation: the mark belongs to the walk that fell", () => {
    // A fall belongs to one conversation, while the machine's walls like «вимкнено» stand in every conversation.
    const state = walk({
      "walk-1": {
        askedAt: 1,
        words: [
          said({
            id: "one",
            isFailure: true,
          }),
        ],
      },
    });

    expect(
      fellAgents({
        ...state,
        walks: {
          "walk-1": {
            ...state.walks["walk-1"],
            isPutAway: true,
          },
        },
      }),
    ).toEqual({});
  });

  it("says nothing of a person's own words, however they read", () => {
    expect(
      fellAgents(
        walk({
          "walk-1": {
            askedAt: 1,
            words: [
              said({
                from: "person",
                isFailure: true,
              }),
            ],
          },
        }),
      ),
    ).toEqual({});
  });
});
