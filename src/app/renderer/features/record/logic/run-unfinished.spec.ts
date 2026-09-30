import { describe, expect, it } from "vitest";
import { runUnfinished } from "./run-unfinished";
import { RUN_DONE, RUN_STEP_DONE, RUN_STEP_STOPPED } from "../constants";
import type { WholeRun, WholeStep } from "../interfaces";
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
    // One question, the one the walk grew from; every step names this row.
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Розбий текст на тези",
        askedAt: new Date("2026-08-22T19:26:56"),
        askedAgentId: "agent-1",
      },
    ],
    steps: walk.length,
    money: 0.0001,
    worked: 4_000,
    walk,
  };
}

describe("runUnfinished", () => {
  it("has nothing to say about a walk where every turn answered and every link was taken", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: null,
            },
          ],
        }),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
        }),
      ]),
      "question-1",
    );

    expect(said).toEqual({
      again: [],
      arrivals: [],
    });
  });

  it("names a turn that ended in anything but an answer, with the words it was asked", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: null,
            },
          ],
        }),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          asked: "- Починай з малого",
          said: "",
          state: RUN_STEP_STOPPED,
          fromStepIds: ["step-1"],
        }),
      ]),
      "question-1",
    );

    // The turn is run again as it stood: same agent, words and feeders.
    expect(said.again).toEqual([
      {
        agentId: "agent-2",
        asked: "- Починай з малого",
        fromStepIds: ["step-1"],
      },
    ]);
    // The link to agent-2 became a turn that stopped, so no arrival is left.
    expect(said.arrivals).toEqual([]);
  });

  it("keeps the work of a link that never became a turn, so the point it waits at can be given it back", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: null,
            },
            {
              toAgentId: "agent-3",
              stopReason: "busy",
            },
          ],
        }),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          said: "",
          state: RUN_STEP_STOPPED,
          fromStepIds: ["step-1"],
        }),
      ]),
      "question-1",
    );

    // A row from when «зайнятий» was a word: the work never reached agent-3, and ТЕЗАР's words are all that remains of
    // the link.
    expect(said.arrivals).toEqual([
      {
        toAgentId: "agent-3",
        fromStepId: "step-1",
        fromAgentId: "agent-1",
        text: "- Починай з малого",
      },
    ]);
  });

  it("leaves the walks before the last one alone: what they broke on was picked up and answered", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: null,
            },
          ],
        }),
        // The walk of the first repeat: agent-2 broke where it stood.
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          said: "",
          state: RUN_STEP_STOPPED,
          fromStepIds: ["step-1"],
        }),
        // The second walk: the same agent was picked up, answered and handed on.
        step({
          id: "step-3",
          walkId: "walk-2",
          place: 3,
          agentId: "agent-2",
          said: "- Тримайся суті",
          fromStepIds: ["step-1"],
          handoffs: [
            {
              toAgentId: "agent-3",
              stopReason: null,
            },
          ],
        }),
        step({
          id: "step-4",
          walkId: "walk-2",
          place: 4,
          agentId: "agent-3",
          said: "",
          state: RUN_STEP_STOPPED,
          fromStepIds: ["step-3"],
        }),
      ]),
      "question-1",
    );

    // Only agent-3 is left; agent-2's older break is not run again.
    expect(said.again).toEqual([
      {
        agentId: "agent-3",
        asked: "Розбий текст на тези",
        fromStepIds: ["step-3"],
      },
    ]);
    expect(said.arrivals).toEqual([]);
  });

  it("counts a link the closing window caught the same way, since it too never became a turn", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: null,
            },
          ],
        }),
      ]),
      "question-1",
    );

    // The work went out and nothing came back: a turn that never began leaves no step.
    expect(said.arrivals).toEqual([
      {
        toAgentId: "agent-2",
        fromStepId: "step-1",
        fromAgentId: "agent-1",
        text: "- Починай з малого",
      },
    ]);
    expect(said.again).toEqual([]);
  });
});
