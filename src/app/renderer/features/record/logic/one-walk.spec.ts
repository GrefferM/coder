import { describe, expect, it } from "vitest";
import { oneWalk } from "./one-walk";
import {
  RUN_DONE,
  RUN_FAILED,
  RUN_NOT_SENT,
  RUN_RUNNING,
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_SILENT,
} from "../constants";
import type { WholeRun, WholeStep } from "../interfaces";
import { aStep } from "../../../testing";

const FIRST_ASKED = new Date("2026-08-31T15:05:00");
const SECOND_ASKED = new Date("2026-08-31T15:08:11");

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "ТЕЗАР",
    agentColor: "#b18aff",
    model: "hy-mt2",
    providerId: "tencent",
    asked: "Розбий текст на тези",
    said: "- Починай з малого",
    state: RUN_STEP_DONE,
    startedAt: new Date("2026-08-31T15:05:00"),
    endedAt: new Date("2026-08-31T15:05:13"),
    ...patch,
  });
}

function run(walk: WholeStep[], state = RUN_DONE): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state,
    startedAt: FIRST_ASKED,
    askedAt: FIRST_ASKED,
    endedAt: new Date("2026-08-31T15:09:30"),
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Розбий текст на тези",
        askedAt: FIRST_ASKED,
        askedAgentId: "agent-1",
        attached: [],
      },
      {
        id: "question-2",
        place: 2,
        asked: "Тепер коротше",
        askedAt: SECOND_ASKED,
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

const SECOND = step({
  id: "step-2",
  questionId: "question-2",
  place: 2,
  startedAt: SECOND_ASKED,
  endedAt: new Date("2026-08-31T15:08:30"),
  money: 0.04,
});

describe("oneWalk", () => {
  it("takes the walk of the question it was opened from, and nothing of the questions around it", () => {
    const pass = oneWalk(run([step(), SECOND]), "question-2");

    expect(pass?.walk.map((one) => one.id)).toEqual(["step-2"]);
    expect(pass?.asked).toBe("Тепер коротше");
    expect(pass?.questions).toHaveLength(1);
  });

  it("counts the pass on its own — its turns, its money and the time its turns took", () => {
    const pass = oneWalk(run([step(), SECOND]), "question-2");

    expect(pass?.steps).toBe(1);
    expect(pass?.money).toBe(0.04);
    expect(pass?.worked).toBe(19_000);
  });

  it("adds the money of the turns that carried it, and skips the turn that carried none", () => {
    const free = step({
      id: "step-3",
      questionId: "question-2",
      place: 3,
      startedAt: SECOND_ASKED,
      endedAt: new Date("2026-08-31T15:08:30"),
      money: null,
    });

    expect(oneWalk(run([step(), SECOND, free]), "question-2")?.money).toBe(0.04);
  });

  it("names no money at all for a pass whose turns carried none, rather than a bill of nothing", () => {
    const free = step({
      id: "step-3",
      questionId: "question-2",
      place: 3,
      startedAt: SECOND_ASKED,
      endedAt: new Date("2026-08-31T15:08:30"),
      money: null,
    });

    expect(oneWalk(run([step(), free]), "question-2")?.money).toBeNull();
  });

  it("begins the pass when the question was asked, so its ruler counts from there", () => {
    expect(oneWalk(run([step(), SECOND]), "question-2")?.startedAt).toEqual(SECOND_ASKED);
  });

  it("stands the pass on the word of its own last turn, and not on the flow's", () => {
    const broke = step({
      id: "step-2",
      questionId: "question-2",
      place: 2,
      state: RUN_STEP_FAILED,
      startedAt: SECOND_ASKED,
      endedAt: new Date("2026-08-31T15:08:30"),
    });

    expect(oneWalk(run([step(), broke], RUN_FAILED), "question-1")?.state).toBe(RUN_DONE);
    expect(oneWalk(run([step(), broke], RUN_FAILED), "question-2")?.state).toBe(RUN_FAILED);
  });

  it("says nothing was sent of a pass whose model answered with nothing, and never says it finished", () => {
    // A turn that ran whole and came back empty has no answer, so the pass is not «ГОТОВО».
    const said = step({
      id: "step-2",
      questionId: "question-2",
      place: 2,
      state: RUN_STEP_SILENT,
      startedAt: SECOND_ASKED,
      endedAt: new Date("2026-08-31T15:08:30"),
    });

    expect(oneWalk(run([step(), said]), "question-2")?.state).toBe(RUN_NOT_SENT);
  });

  it("keeps the last pass of a flow that is still going as going", () => {
    expect(oneWalk(run([step(), SECOND], RUN_RUNNING), "question-2")?.state).toBe(RUN_RUNNING);
    expect(oneWalk(run([step(), SECOND], RUN_RUNNING), "question-1")?.state).toBe(RUN_DONE);
  });

  it("holds nothing where the question is not in this flow", () => {
    expect(oneWalk(run([step()]), "question-nobody-holds")).toBeNull();
  });
});
