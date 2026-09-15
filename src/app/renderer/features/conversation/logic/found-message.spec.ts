import { describe, expect, it } from "vitest";
import { foundMessage } from "./found-message";
import type { RunHit } from "../../record";
import type { ChatMessage } from "../interfaces";

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return <ChatMessage>{
    id: "said-1",
    agentId: "agent-1",
    from: "agent",
    text: "- Починай з малого",
    at: "2026-09-08T09:14:00",
    questionId: "question-1",
    stepId: "step-1",
    walkId: "walk-1",
    notStarted: null,
    note: null,
    isFailure: false,
    calls: [],
    fedBy: [],
    ...patch,
  };
}

function hit(patch: Partial<RunHit> = {}): RunHit {
  return {
    runId: "run-1",
    questionId: "question-1",
    stepId: "step-2",
    agentId: "agent-2",
    agentName: "ТЕСТЕР",
    step: 2,
    at: new Date("2026-09-07T14:26:00"),
    found: "Поклав кешування",
    isCall: false,
    ...patch,
  };
}

describe("foundMessage", () => {
  it("names the message by the step the hit stands in, and never by the hour", () => {
    const messages = [
      said(),
      said({
        id: "said-2",
        stepId: "step-2",
      }),
    ];

    expect(foundMessage(messages, hit())).toBe("said-2");
  });

  it("names the person's own card where the hit stands in the question itself", () => {
    // A hit with no step is one in the words the person wrote, and that card is where the press lands.
    const messages = [
      said({
        id: "asked-1",
        from: "person",
        stepId: null,
        questionId: "question-2",
      }),
      said(),
    ];

    expect(
      foundMessage(
        messages,
        hit({
          questionId: "question-2",
          stepId: null,
        }),
      ),
    ).toBe("asked-1");
  });

  it("names nothing where nobody is looking for anything", () => {
    expect(foundMessage([said()], null)).toBeNull();
  });

  it("names nothing where the stream does not hold that message at all", () => {
    // A run read out of the record whose stream is another one's: there is nowhere to ride, and nothing is marked.
    expect(
      foundMessage(
        [said()],
        hit({
          stepId: "step-gone",
        }),
      ),
    ).toBeNull();
  });
});
