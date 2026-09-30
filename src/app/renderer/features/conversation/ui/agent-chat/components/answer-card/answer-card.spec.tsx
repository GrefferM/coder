import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnswerCard } from "./answer-card";

describe("AnswerCard", () => {
  it("writes what the turn cost beside the name, both counts and the money", () => {
    render(
      <AnswerCard
        agentName="EDITOR"
        agentColor="#38a3ff"
        text="Готово"
        cost={{
          inputTokens: 250,
          outputTokens: 2500,
          money: 0.02,
        }}
        isCounting={false}
      />,
    );

    // The head shows counts in thousands; the exact counts and unrounded money are on the pointer.
    expect(screen.getByText(/0\.3К\/2\.5К/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.02/)).toBeInTheDocument();
    expect(screen.getByTitle("250/2 500 ТКН · $0.0200")).toBeInTheDocument();
  });

  it("reads the counts against the ceiling the turn ran with, where one stood", () => {
    render(
      <AnswerCard
        agentName="EDITOR"
        agentColor="#38a3ff"
        text="Готово"
        cost={{
          inputTokens: 250,
          outputTokens: 8,
          money: 0.02,
        }}
        answerCeiling={8}
        isCounting={false}
      />,
    );

    // The head has no room for a third number, so the pointer carries it beside the counts.
    expect(screen.getByTitle("250/8 ТКН · СТЕЛЯ ВІДПОВІДІ 8 · $0.0200")).toBeInTheDocument();
  });

  it("says nothing about the cost of an answer nobody counted", () => {
    render(<AnswerCard agentName="EDITOR" agentColor="#38a3ff" text="Готово" cost={null} isCounting={false} />);

    expect(screen.queryByText(/К\//)).not.toBeInTheDocument();
  });

  it("stands the count's place while the answer is still coming, without putting a number in it", () => {
    const { container } = render(
      <AnswerCard agentName="EDITOR" agentColor="#38a3ff" text="Готов" cost={null} isCounting />,
    );

    expect(container.querySelectorAll(".work-dot")).toHaveLength(3);
    expect(screen.queryByText(/К\//)).not.toBeInTheDocument();
  });

  it("heads a turn with its step and hour beside what it cost, live or read back alike", () => {
    render(
      <AnswerCard
        agentName="EDITOR"
        agentColor="#38a3ff"
        text="Зібрав зміни за тиждень"
        isCounting={false}
        cost={{
          inputTokens: 250,
          outputTokens: 2500,
          money: 0.02,
        }}
        step={{
          level: 2,
          at: new Date("2026-08-22T19:29:00").toISOString(),
        }}
      />,
    );

    // One card serves both streams.
    expect(screen.getByText("КРОК 2 · 19:29")).toBeInTheDocument();
    expect(screen.getByText(/0\.3К\/2\.5К/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.02/)).toBeInTheDocument();
  });
});
