import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEndReading } from "./use-end-reading";
import { aReadAloud } from "../../../../testing";
import type { EndReadingHands, WidgetExchange, WidgetStep } from "../../interfaces";
import type { ChatMessage } from "../../../../../../contracts";

/** An end of a walk that came a minute from now, so it is never history by its hour. */
function anEnd(patch: Partial<WidgetStep> = {}): WidgetStep {
  return {
    id: "answer-1",
    agentId: "alex",
    text: "Hey, how's your day going?",
    at: new Date(Date.now() + 60_000).toISOString(),
    endedAt: new Date(Date.now() + 60_000).toISOString(),
    number: 1,
    isEnd: true,
    isFailure: false,
    isLive: true,
    ...patch,
  };
}

function anExchange(steps: WidgetStep[]): WidgetExchange {
  return {
    questionId: "question-1",
    question: <ChatMessage>{
      id: "asked-1",
      agentId: "alex",
      from: "person",
      text: "Hi Alex",
      at: new Date().toISOString(),
      questionId: "question-1",
      askedAt: Date.now(),
      walkId: "walk-1",
    },
    steps,
    working: [],
  };
}

describe("useEndReading", () => {
  it("reads a live end aloud as it comes", () => {
    const read = vi.fn();
    const hands: EndReadingHands = {
      exchanges: [anExchange([anEnd()])],
      aloud: aReadAloud({
        read,
      }),
      sphereId: "alex",
      isSilent: false,
    };

    renderHook(() => useEndReading(hands));

    expect(read).toHaveBeenCalledWith("answer-1", "Hey, how's your day going?");
  });

  it("leaves an end read back from the record unread, as a run opened from the history shows it", () => {
    const read = vi.fn();
    const hands: EndReadingHands = {
      exchanges: [
        anExchange([
          anEnd({
            id: "step-1",
            isLive: false,
          }),
        ]),
      ],
      aloud: aReadAloud({
        read,
      }),
      sphereId: "alex",
      isSilent: false,
    };

    renderHook(() => useEndReading(hands));

    expect(read).not.toHaveBeenCalled();
  });

  it("reads nothing that was waiting once the speaker is crossed and the reading under way stops", () => {
    const read = vi.fn();
    const ends = [
      anEnd(),
      anEnd({
        id: "answer-2",
        text: "Ever had a ride go wrong like that?",
      }),
    ];
    const { rerender } = renderHook((hands: EndReadingHands) => useEndReading(hands), {
      initialProps: {
        exchanges: [anExchange(ends)],
        aloud: aReadAloud({
          readingId: "answer-1",
          read,
        }),
        sphereId: "alex",
        isSilent: false,
      },
    });

    rerender({
      exchanges: [anExchange(ends)],
      aloud: aReadAloud({
        read,
      }),
      sphereId: "alex",
      isSilent: true,
    });

    expect(read).not.toHaveBeenCalled();
  });
});
