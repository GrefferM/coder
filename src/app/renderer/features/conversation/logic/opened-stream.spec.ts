import { describe, expect, it } from "vitest";
import { openedStream } from "./opened-stream";
import { RUN_DONE, RUN_STEP_DONE } from "../../record";
import type { WholeRun, WholeStep } from "../../record";
import type { ChatMessage } from "../interfaces";
import { aStep } from "../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "ТЕЗАР",
    agentColor: "#b18aff",
    model: "hy-mt2",
    providerId: "tencent",
    promptId: "prompt-1",
    prompt: "Ти ріжеш текст на тези.",
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    inputTokens: 491,
    outputTokens: 57,
    money: 0.0001,
    startedAt: new Date("2026-08-22T19:27:00"),
    endedAt: new Date("2026-08-22T19:27:04"),
    ...patch,
  });
}

/** A run of one question, asked at 19:26:56, with the steps given. */
function run(walk: WholeStep[], questions: { id: string; askedAt: string }[] = []): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state: RUN_DONE,
    startedAt: new Date("2026-08-22T19:26:56"),
    askedAt: new Date("2026-08-22T19:26:56"),
    endedAt: null,
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Розбий текст на тези",
        askedAt: new Date("2026-08-22T19:26:56"),
        askedAgentId: "agent-1",
      },
      ...questions.map((one, at) => ({
        id: one.id,
        place: at + 2,
        asked: "Ще раз",
        askedAt: new Date(one.askedAt),
        askedAgentId: "agent-1",
      })),
    ],
    steps: walk.length,
    money: 0.0001,
    worked: 4_000,
    walk,
  };
}

function live(patch: Partial<ChatMessage> & Pick<ChatMessage, "id" | "from" | "questionId" | "walkId">): ChatMessage {
  return {
    agentId: "agent-1",
    text: "",
    at: "2026-08-22T19:28:00.000Z",
    askedAt: new Date("2026-08-22T19:26:56").getTime(),
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    began: null,
    stepId: null,
    note: null,
    asked: null,
    fedBy: [],
    calls: [],
    ...patch,
  };
}

describe("openedStream", () => {
  it("reads a walk begun before this session from the record alone", () => {
    const stream = openedStream(run([step()]), []);

    expect(stream.map((message) => message.from)).toEqual(["person", "agent"]);
  });

  it("reads a walk the live stream began from the live stream alone, never twice", () => {
    // The step is written already, so the record holds the walk too — and says nothing of it a second time.
    const stream = openedStream(run([step()]), [
      live({
        id: "asked-live",
        from: "person",
        questionId: "question-1",
        walkId: "walk-1",
        text: "Розбий текст на тези",
      }),
      live({
        id: "said-live",
        from: "agent",
        questionId: "question-1",
        walkId: "walk-1",
        text: "- Починай з малого",
        stepId: "step-1",
      }),
    ]);

    expect(stream.map((message) => message.id)).toEqual(["asked-live", "said-live"]);
  });

  it("keeps the record's question over a live repeat of it, since the repeat asks nothing of its own", () => {
    // The question was asked in an earlier session; «СПИТАТИ ЩЕ РАЗ» here begins a walk of its own.
    const stream = openedStream(run([step()]), [
      live({
        id: "handoff-live",
        from: "handoff",
        questionId: "question-1",
        walkId: "walk-2",
        at: "2026-08-22T19:30:00.000Z",
      }),
    ]);

    expect(stream.map((message) => message.id)).toEqual(["question-1:asked", "step-1", "handoff-live"]);
  });

  it("leaves out live words of another run: they stand under a question this run never held", () => {
    const stream = openedStream(run([step()]), [
      live({
        id: "elsewhere",
        from: "person",
        questionId: "question-of-another-run",
        walkId: "walk-9",
      }),
    ]);

    expect(stream.map((message) => message.id)).toEqual(["question-1:asked", "step-1"]);
  });

  it("shows a question asked here before its first step lands, once and not twice", () => {
    // The question is in the record already (it is written the moment it is asked); its walk has no step yet.
    const stream = openedStream(
      run(
        [],
        [
          {
            id: "question-2",
            askedAt: "2026-08-22T19:29:00",
          },
        ],
      ),
      [
        live({
          id: "asked-2",
          from: "person",
          questionId: "question-2",
          walkId: "walk-2",
          askedAt: new Date("2026-08-22T19:29:00").getTime(),
        }),
      ],
    );

    expect(stream.map((message) => message.id)).toEqual(["question-1:asked", "asked-2"]);
  });
});
