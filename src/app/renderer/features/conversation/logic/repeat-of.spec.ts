import { describe, expect, it } from "vitest";
import { repeatOf } from "./repeat-of";
import { RUN_DONE, RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import type { WholeRun, WholeStep } from "../../record";
import { aStep } from "../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "ТЕЗАР",
    agentColor: "#b18aff",
    model: "hy-mt2",
    providerId: "tencent",
    promptId: "prompt-1",
    prompt: "Ти ріжеш текст на тези.",
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    inputTokens: 491,
    outputTokens: 57,
    money: 0.0001,
    startedAt: new Date("2026-08-22T19:27:00"),
    endedAt: new Date("2026-08-22T19:27:04"),
    ...patch,
  });
}

/** One row of the record, with the questions its steps name. */
function run(walk: WholeStep[]): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state: RUN_DONE,
    startedAt: new Date("2026-08-22T19:26:56"),
    askedAt: new Date("2026-08-22T19:26:56"),
    endedAt: new Date("2026-08-22T19:27:12"),
    questions: [...new Set(walk.map((one) => one.questionId))].map((id, at) => ({
      id,
      place: at + 1,
      asked: "Розбий текст на тези",
      askedAt: new Date("2026-08-22T19:26:56"),
      // Whom this question stood before — the agent a repeat of it goes back to.
      askedAgentId: walk.find((one) => one.questionId === id)?.agentId ?? "agent-1",
    })),
    steps: walk.length,
    money: 0.0001,
    worked: 4_000,
    walk,
  };
}

describe("repeatOf", () => {
  it("picks the walk up by the question's own id, with the hour that question was asked", () => {
    const repeat = repeatOf(
      run([
        step({
          state: RUN_STEP_FAILED,
        }),
      ]),
      "question-1",
      null,
      "walk-new",
    );

    expect(repeat?.questionId).toBe("question-1");
    expect(repeat?.runId).toBe("run-1");
    expect(repeat?.runKey).toBe("walk-new");
    expect(repeat?.askedAt).toBe(new Date("2026-08-22T19:26:56").getTime());
    expect(repeat?.startAgentId).toBe("agent-1");
    // The turn that ended in anything but an answer is what runs again.
    expect(repeat?.left.again.map((one) => one.agentId)).toEqual(["agent-1"]);
  });

  it("goes back to the agent that very question stood before, and not to the one the flow began with", () => {
    // The bug this guards: a repeat started the walk from the flow's first agent, so a question handed on to
    // another agent was asked again of somebody it had never been put to.
    const repeat = repeatOf(
      run([
        step({
          id: "step-1",
          questionId: "question-1",
          agentId: "agent-1",
        }),
        step({
          id: "step-2",
          questionId: "question-2",
          agentId: "agent-2",
          state: RUN_STEP_FAILED,
        }),
      ]),
      "question-2",
      null,
      "walk-new",
    );

    expect(repeat?.startAgentId).toBe("agent-2");
  });

  it("stands still where the record holds no such question", () => {
    // A record deleted or rewritten by hand has nothing to pick up, and the repeat says so by doing nothing.
    expect(repeatOf(run([step()]), "question-gone", null, "walk-new")).toBeNull();
  });

  it("hands the steps over in the order they ran, whatever order the record gave them in", () => {
    const repeat = repeatOf(
      run([
        step({
          id: "step-2",
          place: 2,
        }),
        step({
          id: "step-1",
          place: 1,
        }),
      ]),
      "question-1",
      null,
      "walk-new",
    );

    expect(repeat?.walk.map((one) => one.id)).toEqual(["step-1", "step-2"]);
  });

  it("carries whom a question that never went was aimed at", () => {
    // No step was written for it, so the repeat has to be told the address.
    const repeat = repeatOf(run([step()]), "question-1", "agent-2", "walk-new");

    expect(repeat?.notSentTo).toBe("agent-2");
  });
});
