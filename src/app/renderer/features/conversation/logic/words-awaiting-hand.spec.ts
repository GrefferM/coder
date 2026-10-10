import { describe, expect, it } from "vitest";
import { wordsAwaitingHand } from "./words-awaiting-hand";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import type { ChatMessage, WalkSnapshot } from "../interfaces";

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

/** One walk of another row with its words; the screen stands on «run-1». */
function walk(words: ChatMessage[], runId: string | null = "run-2", patch: Partial<WalkSnapshot> = {}): WalkSnapshot {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        ...begunWalk("question-1", 50, runId),
        said: words,
      },
    },
    flowRunId: "run-1",
    ...patch,
  };
}

describe("wordsAwaitingHand", () => {
  it("names a turn of another conversation that fell", () => {
    expect(
      wordsAwaitingHand(
        walk([
          said({
            id: "fell",
            isFailure: true,
            note: "ВІДПОВІДЬ НЕ ПРИЙШЛА",
            asked: "Прогони тести",
          }),
        ]),
      ).elsewhere,
    ).toEqual(["fell"]);
  });

  it("names a question of another conversation that never went", () => {
    // The row about a question that stayed carries the repeat, so it awaits the hand too.
    expect(
      wordsAwaitingHand(
        walk([
          said({
            id: "stayed",
            from: "notSent",
            stopReason: "off",
          }),
        ]),
      ).elsewhere,
    ).toEqual(["stayed"]);
  });

  it("names a turn too long for the model: the ceiling is raised by a hand, and the same words then go", () => {
    // That card carries the repeat like every other accident.
    expect(
      wordsAwaitingHand(
        walk([
          said({
            id: "long",
            notStarted: "tooLong",
            asked: "Прогони тести",
          }),
        ]),
      ).elsewhere,
    ).toEqual(["long"]);
  });

  it("says nothing of a conversation that ended well, though its words carry what was asked", () => {
    // A calm end asks for no hand; every answer keeps its question for a repeat further down.
    expect(
      wordsAwaitingHand(
        walk([
          said({
            id: "answered",
            asked: "Прогони тести",
          }),
        ]),
      ).elsewhere,
    ).toEqual([]);
  });

  it("puts what waits in this conversation on the other side: it is under the person's eyes", () => {
    // A word shown by standing here must not become news after turning to another run.
    expect(
      wordsAwaitingHand(
        walk(
          [
            said({
              id: "fell",
              isFailure: true,
              note: "ВІДПОВІДЬ НЕ ПРИЙШЛА",
              asked: "Прогони тести",
            }),
          ],
          "run-1",
        ),
      ).onScreen,
    ).toEqual(["fell"]);
  });

  it("says nothing of this conversation: what waits here is under the person's eyes", () => {
    expect(
      wordsAwaitingHand(
        walk(
          [
            said({
              id: "fell",
              isFailure: true,
              note: "ВІДПОВІДЬ НЕ ПРИЙШЛА",
              asked: "Прогони тести",
            }),
          ],
          "run-1",
        ),
      ).elsewhere,
    ).toEqual([]);
  });

  it("says nothing of a turn already asked again", () => {
    expect(
      wordsAwaitingHand(
        walk(
          [
            said({
              id: "fell",
              isFailure: true,
              note: "ВІДПОВІДЬ НЕ ПРИЙШЛА",
              asked: "Прогони тести",
            }),
          ],
          "run-2",
          {
            saidAgain: ["fell"],
          },
        ),
      ).elsewhere,
    ).toEqual([]);
  });
});
