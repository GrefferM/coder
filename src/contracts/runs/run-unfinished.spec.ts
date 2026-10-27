import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runUnfinished } from "./run-unfinished";
import { RUN_DONE } from "./run-state.constant";
import { RUN_STEP_DONE, RUN_STEP_STOPPED } from "./run-step-end.constant";
import { aStep } from "../testing";
import type { WholeRun } from "./whole-run.interface";
import type { WholeStep } from "./whole-step.interface";

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
        attached: [],
      },
    ],
    steps: walk.length,
    money: 0.0001,
    worked: 4_000,
    walk,
    memories: [],
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

    assert.deepEqual(said, {
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
    assert.deepEqual(said.again, [
      {
        agentId: "agent-2",
        asked: "- Починай з малого",
        fromStepIds: ["step-1"],
      },
    ]);
    // The link to agent-2 became a turn that stopped, so no arrival is left.
    assert.deepEqual(said.arrivals, []);
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
    assert.deepEqual(said.arrivals, [
      {
        toAgentId: "agent-3",
        fromStepId: "step-1",
        fromAgentId: "agent-1",
        text: "- Починай з малого",
        stopReason: "busy",
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
    assert.deepEqual(said.again, [
      {
        agentId: "agent-3",
        asked: "Розбий текст на тези",
        fromStepIds: ["step-3"],
      },
    ]);
    assert.deepEqual(said.arrivals, []);
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
    assert.deepEqual(said.arrivals, [
      {
        toAgentId: "agent-2",
        fromStepId: "step-1",
        fromAgentId: "agent-1",
        text: "- Починай з малого",
        stopReason: null,
      },
    ]);
    assert.deepEqual(said.again, []);
  });

  it("carries the reason a link was cut with its arrival, so a repeat knows a line the agent did not choose", () => {
    const said = runUnfinished(
      run([
        step({
          handoffs: [
            {
              toAgentId: "agent-2",
              stopReason: "notChosen",
            },
            {
              toAgentId: "agent-3",
              stopReason: "finished",
            },
          ],
        }),
      ]),
      "question-1",
    );

    assert.deepEqual(
      said.arrivals.map((one) => [one.toAgentId, one.stopReason]),
      [
        ["agent-2", "notChosen"],
        ["agent-3", "finished"],
      ],
    );
  });

  it("hands on what a step was given where it passed on without a word of its own", () => {
    const said = runUnfinished(
      run([
        step({
          said: "",
          asked: "Розбий текст на тези",
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

    assert.equal(said.arrivals[0]?.text, "Розбий текст на тези");
  });

  it("hands on the words of the steps that fed a step that passed on without words, not its ask with their count", () => {
    const said = runUnfinished(
      run([
        step({
          id: "step-1",
          place: 1,
          said: "- Починай з малого",
        }),
        step({
          id: "step-2",
          place: 2,
          said: "",
          asked: "- Починай з малого\n\nНе передали нічого: 1 з 2 постачальників роботи.",
          fromStepIds: ["step-1"],
          handoffs: [
            {
              toAgentId: "agent-3",
              stopReason: null,
            },
          ],
        }),
      ]),
      "question-1",
    );

    assert.equal(said.arrivals.at(-1)?.text, "- Починай з малого");
  });
});
