import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chatStream } from "./chat-stream";
import { aWalk, anEmptySnapshot } from "../testing";
import type { ChatMessage } from "./chat-message.interface";
import type { WalkSnapshot } from "./walk-snapshot.interface";

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

/** One stream's walks with the words each said, all standing on this screen. */
function walk(said: Record<string, ChatMessage[]>): WalkSnapshot {
  return {
    ...anEmptySnapshot(),
    walks: Object.fromEntries(
      Object.entries(said).map(([runKey, words]) => [
        runKey,
        {
          ...aWalk("question-1", 1),
          said: words,
        },
      ]),
    ),
  };
}

describe("chatStream", () => {
  it("puts the turns of every walk on screen in one stream, question by question", () => {
    const stream = chatStream(
      walk({
        "walk-1": [
          said({
            id: "one",
            questionId: "question-2",
            askedAt: 2,
            at: "2026-09-02T15:00:00.000Z",
          }),
        ],
        "walk-2": [
          said({
            id: "two",
            askedAt: 1,
            at: "2026-09-02T16:00:00.000Z",
          }),
          said({
            id: "three",
            questionId: "question-2",
            askedAt: 2,
            at: "2026-09-02T14:00:00.000Z",
          }),
        ],
      }),
    );

    // The older question stands first even when its words came later.
    assert.deepEqual(
      stream.map((message) => message.id),
      ["two", "three", "one"],
    );
  });

  it("keeps two questions of one millisecond in two blocks: the id holds them apart where the clock cannot", () => {
    const stream = chatStream(
      walk({
        "walk-1": [
          said({
            id: "a-1",
            questionId: "question-a",
            askedAt: 5,
            at: "2026-09-02T15:00:00.000Z",
          }),
          said({
            id: "b-1",
            questionId: "question-b",
            askedAt: 5,
            at: "2026-09-02T15:00:01.000Z",
          }),
          said({
            id: "a-2",
            questionId: "question-a",
            askedAt: 5,
            at: "2026-09-02T15:00:02.000Z",
          }),
        ],
      }),
    );

    assert.deepEqual(
      stream.map((message) => message.id),
      ["a-1", "a-2", "b-1"],
    );
  });

  it("leaves out the copy of an answer that arrived down a line", () => {
    const stream = chatStream(
      walk({
        "walk-1": [
          said({
            id: "own",
          }),
          said({
            id: "arrived",
            from: "supplier",
          }),
        ],
      }),
    );

    assert.deepEqual(
      stream.map((message) => message.id),
      ["own"],
    );
  });

  it("says nothing of a walk writing into another row: that is another conversation", () => {
    // A walk's words stand where its row stands, not on this screen.
    const stream = chatStream({
      ...anEmptySnapshot(),
      walks: {
        "walk-1": {
          ...aWalk("question-1", 1, "run-1"),
          said: [
            said({
              id: "here",
            }),
          ],
        },
        "walk-2": {
          ...aWalk("question-2", 2, "run-2"),
          said: [
            said({
              id: "elsewhere",
            }),
          ],
        },
      },
      flowRunId: "run-1",
    });

    assert.deepEqual(
      stream.map((message) => message.id),
      ["here"],
    );
  });

  it("says nothing about a project nobody has spoken to", () => {
    assert.deepEqual(chatStream(walk({})), []);
  });
});
