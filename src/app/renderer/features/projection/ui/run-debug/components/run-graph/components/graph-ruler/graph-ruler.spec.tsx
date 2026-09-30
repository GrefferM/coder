import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GraphRuler } from "./graph-ruler";
import { offsetLabel } from "../../../../../../../../utils/dates";
import type { WalkTurn } from "../../../../../../interfaces";
import type { WholeStep } from "../../../../../../../../interfaces";
import { aStep } from "../../../../../../../../testing";

const ASKED_AT = new Date(2026, 8, 4, 14, 0, 0);

function step(id: string, startedAt: Date): WholeStep {
  return aStep({
    id,
    model: "deepseek/deepseek-v4-flash-0731",
    asked: "Знайди md-файли",
    said: "ЗНАЙДЕНО",
    state: "done",
    inputTokens: 10,
    outputTokens: 20,
    money: 0.001,
    startedAt,
    endedAt: new Date(startedAt.getTime() + 4_000),
  });
}

function turn(id: string, secondsIn: number, x: number): WalkTurn {
  return {
    place: {
      step: step(id, new Date(ASKED_AT.getTime() + secondsIn * 1_000)),
      number: 1,
      lane: 0,
    },
    at: {
      x,
      y: 0,
    },
  };
}

describe("GraphRuler", () => {
  it("says over every column when that turn began, counted from the question", () => {
    // Marks show elapsed time, not wall-clock time.
    render(
      <GraphRuler
        turns={[turn("step-1", 0, 100), turn("step-2", 95, 300)]}
        askedAt={ASKED_AT}
        pan={{
          x: 0,
          y: 0,
        }}
        scale={1}
      />,
    );

    expect(screen.getByText(offsetLabel(0))).toBeInTheDocument();
    expect(screen.getByText(offsetLabel(95_000))).toBeInTheDocument();
  });

  it("goes with the field across, and stays at the top when the field goes down", () => {
    const { container, rerender } = render(
      <GraphRuler
        turns={[turn("step-1", 0, 100)]}
        askedAt={ASKED_AT}
        pan={{
          x: 0,
          y: 0,
        }}
        scale={1}
      />,
    );
    const atHome = container.querySelector<HTMLElement>("div");
    const left = atHome?.style.left;
    const top = atHome?.style.top;

    rerender(
      <GraphRuler
        turns={[turn("step-1", 0, 100)]}
        askedAt={ASKED_AT}
        pan={{
          x: 40,
          y: 90,
        }}
        scale={1}
      />,
    );

    const moved = container.querySelector<HTMLElement>("div");

    expect(moved?.style.left).not.toBe(left);
    expect(moved?.style.top).toBe(top);
  });
});
