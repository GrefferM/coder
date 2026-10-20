import { describe, expect, it } from "vitest";
import { runPasses } from "./run-passes";
import { RUN_DONE, RUN_STEP_DONE } from "../../record";
import type { WholeRun, WholeStep } from "../../record";
import { aStep } from "../../../testing";

const FIRST_ASKED = new Date("2026-08-31T15:05:00");
const SECOND_ASKED = new Date("2026-08-31T15:08:11");
const THIRD_ASKED = new Date("2026-08-31T15:12:40");

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "ТЕЗАР",
    agentColor: "#b18aff",
    model: "hy-mt2",
    providerId: "tencent",
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    startedAt: FIRST_ASKED,
    endedAt: new Date("2026-08-31T15:05:13"),
    ...patch,
  });
}

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
    startedAt: FIRST_ASKED,
    askedAt: FIRST_ASKED,
    endedAt: new Date("2026-08-31T15:13:30"),
    questions: [
      {
        id: "question-2",
        place: 2,
        asked: "Тепер коротше",
        askedAt: SECOND_ASKED,
        askedAgentId: "agent-1",
        attached: [],
      },
      {
        id: "question-1",
        place: 1,
        asked: "Розбий текст на тези",
        askedAt: FIRST_ASKED,
        askedAgentId: "agent-1",
        attached: [],
      },
      {
        id: "question-3",
        place: 3,
        asked: "І для fetchInvoice теж",
        askedAt: THIRD_ASKED,
        askedAgentId: "agent-1",
        attached: [],
      },
    ],
    steps: walk.length,
    money: 0.05,
    worked: 200_000,
    walk,
    memories: [],
  };
}

describe("runPasses", () => {
  it("names the questions that walked, in the order they were asked", () => {
    const passes = runPasses(
      run([
        step(),
        step({
          id: "step-2",
          questionId: "question-2",
          place: 2,
        }),
      ]),
    );

    expect(passes).toEqual(["question-1", "question-2"]);
  });

  it("leaves out a question that started no walk, since there is no pass to step into", () => {
    // Three questions in the flow, only two ever went.
    const passes = runPasses(
      run([
        step(),
        step({
          id: "step-2",
          questionId: "question-2",
          place: 2,
        }),
      ]),
    );

    expect(passes).not.toContain("question-3");
    expect(passes).toHaveLength(2);
  });

  it("counts nothing where nothing walked", () => {
    expect(runPasses(run([]))).toEqual([]);
  });
});
