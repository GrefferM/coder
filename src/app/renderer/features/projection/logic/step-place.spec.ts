import { describe, expect, it } from "vitest";
import { stepPlace } from "./step-place";
import { RUN_STEP_DONE } from "../../record";
import type { WholeStep } from "../../record";
import { aStep } from "../../../testing";

function step(id: string, place: number, agentName: string): WholeStep {
  return aStep({
    id,
    place,
    agentId: `agent-${place}`,
    agentName,
    agentColor: "#b18aff",
    model: "qwen2.5-coder",
    providerId: "ollama",
    inputPrice: 0,
    outputPrice: 0,
    contextCeiling: 32_000,
    temperature: 0.3,
    asked: "Питання",
    said: "Готово",
    state: RUN_STEP_DONE,
    inputTokens: 10,
    outputTokens: 10,
    money: 0,
    startedAt: new Date("2026-09-02T15:41:00"),
    endedAt: new Date("2026-09-02T15:41:12"),
  });
}

// Given out of order: the pass is read by `place`.
const WALK = [step("step-3", 3, "REVIEWER"), step("step-1", 1, "EDITOR"), step("step-2", 2, "TESTER")];

describe("stepPlace", () => {
  it("counts the step in the order the pass ran, and names both neighbours", () => {
    expect(stepPlace(WALK, "step-2")).toEqual({
      number: 2,
      count: 3,
      before: {
        id: "step-1",
        number: 1,
        agentName: "EDITOR",
      },
      after: {
        id: "step-3",
        number: 3,
        agentName: "REVIEWER",
      },
    });
  });

  it("leaves the ends without a neighbour to walk to", () => {
    expect(stepPlace(WALK, "step-1")?.before).toBeNull();
    expect(stepPlace(WALK, "step-3")?.after).toBeNull();
  });

  it("says nothing about a step that is not in this pass", () => {
    expect(stepPlace(WALK, "step-elsewhere")).toBeNull();
  });
});
