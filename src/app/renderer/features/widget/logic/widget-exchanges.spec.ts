import { describe, expect, it } from "vitest";
import { widgetExchanges } from "./widget-exchanges";
import { aConfig, aLink } from "../../../testing";
import type { ChatMessage } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import type { ExchangesAsked } from "../interfaces";

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return <ChatMessage>{
    id: "said-1",
    agentId: "teacher",
    from: "agent",
    text: "Hi! What is your name?",
    at: "2026-11-19T16:44:00",
    questionId: "question-1",
    askedAt: 0,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    waitsFor: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: "walk-1",
    note: null,
    asked: null,
    fedBy: [],
    ...patch,
  };
}

function asked(
  messages: ChatMessage[],
  config: ProjectConfig,
  agentId: string,
  walking: string[] = [],
): ExchangesAsked {
  return {
    messages,
    out: [],
    walking,
    config,
    agentId,
  };
}

describe("widgetExchanges", () => {
  it("lays out each question asked of the sphere with its walk's answers, a run opened from the history the same", () => {
    const config = aConfig({
      links: [
        aLink({
          id: "l1",
          from: "corrector",
          to: "partner",
        }),
      ],
    });
    const messages = [
      said({
        id: "asked-1",
        from: "person",
        agentId: "teacher",
        text: "Hi",
      }),
      said({
        id: "answer-1",
      }),
      said({
        id: "asked-2",
        from: "person",
        agentId: "corrector",
        questionId: "question-2",
        walkId: "walk-2",
      }),
      said({
        id: "answer-2",
        agentId: "corrector",
        questionId: "question-2",
        walkId: "walk-2",
      }),
    ];

    const exchanges = widgetExchanges(asked(messages, config, "teacher"));

    expect(exchanges.map((exchange) => exchange.questionId)).toEqual(["question-1"]);
    expect(exchanges[0]?.question.text).toBe("Hi");
    expect(exchanges[0]?.steps.map((step) => [step.id, step.isEnd])).toEqual([["answer-1", true]]);
  });

  it("tells a step that hands on down a line from the walk's end", () => {
    const config = aConfig({
      links: [
        aLink({
          id: "l1",
          from: "corrector",
          to: "partner",
        }),
      ],
    });
    const messages = [
      said({
        id: "asked-1",
        from: "person",
        agentId: "corrector",
      }),
      said({
        id: "corrected",
        agentId: "corrector",
      }),
      said({
        id: "answered",
        agentId: "partner",
      }),
    ];

    const [exchange] = widgetExchanges(asked(messages, config, "corrector"));

    expect(exchange?.steps.map((step) => [step.id, step.number, step.isEnd])).toEqual([
      ["corrected", 1, false],
      ["answered", 2, true],
    ]);
  });

  it("shows the app's word for a turn stopped before it said anything", () => {
    const messages = [
      said({
        id: "asked-1",
        from: "person",
      }),
      said({
        id: "stopped",
        text: "",
        note: "Зупинено",
      }),
    ];

    const [exchange] = widgetExchanges(asked(messages, aConfig(), "teacher"));

    expect(exchange?.steps.map((step) => step.text)).toEqual(["Зупинено"]);
  });

  it("tells an answer read back from the record from one said live", () => {
    const messages = [
      said({
        id: "asked-1",
        from: "person",
      }),
      said({
        id: "step-1",
        stepId: "step-1",
      }),
      said({
        id: "answer-2",
      }),
    ];

    const [exchange] = widgetExchanges(asked(messages, aConfig(), "teacher"));

    expect(exchange?.steps.map((step) => [step.id, step.isLive])).toEqual([
      ["step-1", false],
      ["answer-2", true],
    ]);
  });

  it("says a question's walk is out while its key stands among the walks out", () => {
    const messages = [
      said({
        id: "asked-1",
        from: "person",
      }),
      said({
        id: "asked-2",
        from: "person",
        questionId: "question-2",
        walkId: "walk-2",
      }),
    ];

    const exchanges = widgetExchanges(asked(messages, aConfig(), "teacher", ["walk-2"]));

    expect(exchanges.map((exchange) => exchange.isOut)).toEqual([false, true]);
  });
});
