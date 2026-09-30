import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GraphTurn } from "./graph-turn";
import { spanLabel } from "../../../../../../../../utils/dates";
import type { WalkTurn } from "../../../../../../interfaces";
import type { WholeStep } from "../../../../../../../../interfaces";
import { aStep } from "../../../../../../../../testing";
import { STANDING_RENAMED_LABEL } from "../../../../../../constants";

const STARTED_AT = new Date(2026, 8, 4, 14, 0, 0);

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    model: "deepseek",
    asked: "Знайди md-файли",
    said: "ЗНАЙДЕНО",
    state: "done",
    inputTokens: 10,
    outputTokens: 20,
    money: 0.001,
    startedAt: STARTED_AT,
    endedAt: new Date(STARTED_AT.getTime() + 5_500),
    ...patch,
  });
}

function turn(number: number, patch: Partial<WholeStep> = {}): WalkTurn {
  return {
    place: {
      step: step(patch),
      number,
      lane: 0,
    },
    at: {
      x: 200,
      y: 120,
    },
  };
}

describe("GraphTurn", () => {
  it("names the turn by its agent and by how long that turn took", () => {
    // A sphere is a step, not an agent; it speaks for this turn alone.
    render(<GraphTurn turn={turn(1)} standing={null} isOpen={false} onOpen={() => {}} />);

    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(screen.getByText(spanLabel(5_500))).toBeInTheDocument();
  });

  it("wears its number over the rim, so a pass can be read in order", () => {
    render(<GraphTurn turn={turn(3)} standing={null} isOpen={false} onOpen={() => {}} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("stands the same agent twice where it worked twice, each turn its own sphere", () => {
    render(
      <>
        <GraphTurn turn={turn(1)} standing={null} isOpen={false} onOpen={() => {}} />
        <GraphTurn
          turn={turn(2, {
            id: "step-2",
          })}
          standing={null}
          isOpen={false}
          onOpen={() => {}}
        />
      </>,
    );

    expect(screen.getAllByText("Шукач")).toHaveLength(2);
  });

  it("rings the open turn in its own colour, outside its rim", () => {
    // The number over the rim is round too, so the ring is found by its glow.
    function ring(container: HTMLElement) {
      return (
        Array.from(container.querySelectorAll<HTMLElement>("div.rounded-circle")).find(
          (round) => round.style.boxShadow !== "",
        ) ?? null
      );
    }

    // The sphere opens the step; the open one is marked without moving.
    const { container, rerender } = render(
      <GraphTurn turn={turn(1)} standing={null} isOpen={false} onOpen={() => {}} />,
    );

    expect(ring(container)).toBeNull();

    rerender(<GraphTurn turn={turn(1)} standing={null} isOpen onOpen={() => {}} />);

    expect(ring(container)).toHaveStyle({
      border: "1px solid #6fd3d8",
    });
  });

  it("opens the step on a press", async () => {
    const onOpen = vi.fn();

    render(<GraphTurn turn={turn(1)} standing={null} isOpen={false} onOpen={onOpen} />);
    await userEvent.click(screen.getByText("Шукач"));

    expect(onOpen).toHaveBeenCalled();
  });

  it("stands the pill under the sphere where the agent is called something else now", () => {
    render(
      <GraphTurn
        turn={turn(1)}
        standing={{
          id: "agent-1",
          name: "WRITER",
          color: "#6fd3d8",
          wasName: "EDITOR",
          isGone: false,
        }}
        isOpen={false}
        onOpen={() => {}}
      />,
    );

    // The sphere shows the pill; the step's card does not.
    expect(screen.getByText(new RegExp(STANDING_RENAMED_LABEL))).toBeInTheDocument();
  });
});
