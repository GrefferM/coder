import { describe, expect, it } from "vitest";
import { routeStanding } from "./route-standing";
import type { ChatMessage, TurnOut } from "../../../../../contracts";
import type { WidgetExchange, WidgetStep } from "../interfaces";

function aStepOf(agentId: string, isFailure = false): WidgetStep {
  return {
    id: `answer-${agentId}`,
    agentId,
    text: "Tests pass.",
    at: "2026-11-19T14:12:00",
    endedAt: "2026-11-19T14:12:04",
    number: 1,
    isEnd: false,
    isFailure,
    isLive: true,
  };
}

function anExchange(steps: WidgetStep[], workingAgentIds: string[]): WidgetExchange {
  return {
    questionId: "question-1",
    question: <ChatMessage>{
      id: "asked-1",
      agentId: "editor",
      from: "person",
      text: "Ship it?",
      questionId: "question-1",
      walkId: "walk-1",
    },
    steps,
    working: workingAgentIds.map((agentId): TurnOut => ({
      turnId: `turn-${agentId}`,
      agentId,
      startedAt: 0,
      viaLinkIds: [],
      runKey: "walk-1",
    })),
    isOut: true,
  };
}

describe("routeStanding", () => {
  it("tells who answered, who is at work, who fell and who is not reached", () => {
    const exchange = anExchange([aStepOf("editor"), aStepOf("linter", true)], ["tester"]);

    expect(routeStanding(exchange, "editor")).toBe("done");
    expect(routeStanding(exchange, "tester")).toBe("working");
    expect(routeStanding(exchange, "linter")).toBe("failed");
    expect(routeStanding(exchange, "reviewer")).toBe("waiting");
  });

  it("stands an agent at work again over the answer it gave before", () => {
    const exchange = anExchange([aStepOf("editor")], ["editor"]);

    expect(routeStanding(exchange, "editor")).toBe("working");
  });
});
