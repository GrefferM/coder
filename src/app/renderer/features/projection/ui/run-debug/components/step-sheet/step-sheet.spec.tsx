import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepSheet } from "./step-sheet";
import { STEP_SHEET_CLOSE_LABEL, STEP_SHEET_WIDTH_PX } from "./constants";
import { RUN_STEP_DONE } from "../../../../../record";
import type { WholeStep } from "../../../../../record";
import { aStep } from "../../../../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "EDITOR",
    agentColor: "#b18aff",
    model: "qwen2.5-coder",
    providerId: "ollama",
    inputPrice: 0,
    outputPrice: 0,
    contextCeiling: 32_000,
    temperature: 0.3,
    asked: "Додав in-memory кеш із TTL 60 секунд.",
    said: "Один тест червоний: TTL порівнюється не з тим полем.",
    state: RUN_STEP_DONE,
    inputTokens: 5_000,
    outputTokens: 1_120,
    money: 0,
    startedAt: new Date("2026-09-02T15:41:00"),
    endedAt: new Date("2026-09-02T15:41:48"),
    ...patch,
  });
}

const WALK = [
  step(),
  step({
    id: "step-2",
    place: 2,
    agentName: "TESTER",
    fromStepIds: ["step-1"],
  }),
  step({
    id: "step-3",
    place: 3,
    agentName: "REVIEWER",
    fromStepIds: ["step-2"],
  }),
];

function draw(open: WholeStep, patch: Partial<Parameters<typeof StepSheet>[0]> = {}) {
  return render(
    <StepSheet step={open} walk={WALK} isBelow={false} onGo={() => undefined} onClose={() => undefined} {...patch} />,
  );
}

describe("StepSheet", () => {
  it("stands the agent as it was then — its step, its name, and the card of what the turn ran on", () => {
    // What the card says is its own (StepCard); the sheet's business is that it stands under the head.
    draw(WALK[1]);

    expect(screen.getByText("КРОК 2")).toBeInTheDocument();
    expect(screen.getByText("TESTER")).toBeInTheDocument();
    expect(screen.getByText(/qwen2\.5-coder · 48 c · 6 120 ТКН/)).toBeInTheDocument();
  });

  it("says what came into the turn and what it answered, each under its own word", () => {
    draw(WALK[1]);

    expect(screen.getByText("ОТРИМАВ ВІД EDITOR")).toBeInTheDocument();
    expect(screen.getByText("ВІДПОВІВ")).toBeInTheDocument();
    expect(screen.getByText("Один тест червоний: TTL порівнюється не з тим полем.")).toBeInTheDocument();
  });

  it("walks to the step on either side, and says which of the pass this one is", () => {
    const gone: string[] = [];

    draw(WALK[1], {
      onGo: (stepId) => gone.push(stepId),
    });

    expect(screen.getByText("2 З 3")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /КРОК 1 · EDITOR/,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /КРОК 3 · REVIEWER/,
      }),
    );

    expect(gone).toEqual(["step-1", "step-3"]);
  });

  it("offers no way back from the first step and no way on from the last", () => {
    draw(WALK[0]);

    expect(
      screen.queryByRole("button", {
        name: /КРОК 0/,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /КРОК 2 · TESTER/,
      }),
    ).toBeInTheDocument();
  });

  it("closes by the cross in its head", () => {
    let isClosed = false;

    draw(WALK[1], {
      onClose: () => (isClosed = true),
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: STEP_SHEET_CLOSE_LABEL,
      }),
    );

    expect(isClosed).toBe(true);
  });

  it("keeps the same measure for its words whether it stands beside the graph or below it", () => {
    const { container } = draw(WALK[1]);
    const beside = container.querySelector(`[style*="width: ${STEP_SHEET_WIDTH_PX}px"]`);

    const below = draw(WALK[1], {
      isBelow: true,
    }).container.querySelector(`[style*="width: ${STEP_SHEET_WIDTH_PX}px"]`);

    expect(beside).toBeInTheDocument();
    expect(below).toBeInTheDocument();
  });
});
