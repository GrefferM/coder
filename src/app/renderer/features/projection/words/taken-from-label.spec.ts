import { describe, expect, it } from "vitest";
import { takenFromLabel } from "./taken-from-label";
import { RUN_STEP_DONE } from "../../record";
import type { WholeStep } from "../../record";
import { aStep } from "../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "EDITOR",
    agentColor: "#b18aff",
    model: "claude-sonnet-4.5",
    providerId: "anthropic",
    contextCeiling: 200_000,
    temperature: 0.3,
    asked: "Додай кешування",
    said: "Готово",
    state: RUN_STEP_DONE,
    startedAt: new Date("2026-08-31T15:41:00"),
    endedAt: new Date("2026-08-31T15:41:12"),
    ...patch,
  });
}

describe("takenFromLabel", () => {
  it("names the question when nothing fed the step", () => {
    expect(takenFromLabel(step(), [step()])).toBe("ОТРИМАВ ПИТАННЯ");
  });

  it("names the supplier the work came from", () => {
    const walk = [
      step(),
      step({
        id: "step-2",
        place: 2,
        agentName: "TESTER",
        fromStepIds: ["step-1"],
      }),
    ];

    expect(takenFromLabel(walk[1], walk)).toBe("ОТРИМАВ ВІД EDITOR");
  });

  it("names every supplier in the order they stand in the pass", () => {
    const walk = [
      step(),
      step({
        id: "step-2",
        place: 2,
        agentName: "LINTER",
      }),
      step({
        id: "step-3",
        place: 3,
        agentName: "REVIEWER",
        fromStepIds: ["step-2", "step-1"],
      }),
    ];

    expect(takenFromLabel(walk[2], walk)).toBe("ОТРИМАВ ВІД EDITOR · LINTER");
  });

  it("names no one when the work came from outside this pass", () => {
    const only = step({
      fromStepIds: ["step-elsewhere"],
    });

    expect(takenFromLabel(only, [only])).toBe("ОТРИМАВ");
  });
});
