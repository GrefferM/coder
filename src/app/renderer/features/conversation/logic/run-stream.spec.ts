import { describe, expect, it } from "vitest";
import { runStream } from "./run-stream";
import {
  RUN_DONE,
  RUN_STEP_CALLS,
  RUN_STEP_CEILING,
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_SILENT,
  RUN_STEP_STOPPED,
  RUN_STEP_TOO_LONG,
} from "../../record";
import { NOT_STARTED_ENDS } from "../constants";
import { callsExhaustedNote } from "../words";
import { CHAT_SAID_NOTHING_NOTE } from "../constants";
import { answerCeilingNote } from "../words";
import type { WholeRun, WholeStep } from "../../record";
import { aStep } from "../../../testing";
import { fellNote } from "../words";

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
    // The flow's questions taken from the steps naming them, one row per question.
    questions: [...new Set(walk.map((step) => step.questionId))].map((id, at) => {
      const grew = walk.filter((step) => step.questionId === id);
      const aimed = grew.find((step) => step.fromStepIds.length === 0) ?? grew[0];

      return {
        id,
        place: at + 1,
        asked: aimed.asked,
        askedAt: aimed.startedAt,
        askedAgentId: aimed.agentId,
      };
    }),
    steps: walk.length,
    money: 0.0001,
    worked: 4_000,
    walk,
  };
}

/** One call of a step, as the record hands it back. */
function made(id: string, place: number) {
  return {
    id,
    source: "command" as const,
    place,
    name: "tests",
    arguments: {},
    pinned: [],
    line: "npm test",
    output: "",
    refusal: "",
    exitCode: 0,
    serverId: null,
    serverName: "",
    isFailed: false,
    end: "ran",
    startedAt: new Date("2026-08-22T19:27:01"),
    endedAt: new Date("2026-08-22T19:27:03"),
  };
}

describe("runStream", () => {
  it("begins with the question the person asked, at the hour they asked it", () => {
    const [first] = runStream(run([step()]));

    expect(first.from).toBe("person");
    expect(first.text).toBe("Розбий текст на тези");
    expect(first.at).toBe(new Date("2026-08-22T19:27:00").toISOString());
  });

  it("stands every question of a flow in its place, and not only the one the row is named by", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          questionId: "question-2",
          asked: "Додай опис і постав рев'ювера",
          said: "Готово",
          startedAt: new Date("2026-08-23T10:21:00"),
          endedAt: new Date("2026-08-23T10:21:40"),
        }),
      ]),
    );

    // A step nothing was handed to began from a person, so its question is what they said.
    expect(said.filter((message) => message.from === "person").map((message) => message.text)).toEqual([
      "Розбий текст на тези",
      "Додай опис і постав рев'ювера",
    ]);
  });

  it("hands a step the ids of the steps that fed it, so a repeat can pick the walk up in its place", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
          asked: "- Починай з малого",
          said: "Перевірив",
        }),
      ]),
    );

    // The repeat must not stand in as a question the person asked.
    expect(said.find((message) => message.id === "step-2")?.fedBy).toEqual(["step-1"]);
    expect(said.find((message) => message.id === "step-1")?.fedBy).toEqual([]);
  });

  it("says nothing of the person before a step that work was handed to", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
          asked: "- Починай з малого",
          said: "Перевірив",
        }),
      ]),
    );

    expect(said.filter((message) => message.from === "person")).toHaveLength(1);
  });

  it("says every step in the order it ran, whatever order the record hands them back in", () => {
    const said = runStream(
      run([
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          said: "Стисло",
        }),
        step(),
      ]),
    );

    expect(said.filter((message) => message.from === "agent").map((message) => message.agentId)).toEqual([
      "agent-1",
      "agent-2",
    ]);
  });

  it("carries what each step cost, so a read run says the same numbers the live one said", () => {
    const said = runStream(run([step()]));
    const answer = said.find((message) => message.from === "agent");

    expect(answer?.cost).toEqual({
      inputTokens: 491,
      outputTokens: 57,
      money: 0.0001,
    });
  });

  it("draws a handoff from whoever fed a step to whoever it fed", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
        }),
      ]),
    );
    const handoff = said.find((message) => message.from === "handoff");

    expect(handoff?.agentId).toBe("agent-1");
    expect(handoff?.otherAgentId).toBe("agent-2");
    expect(said.indexOf(handoff!)).toBeLessThan(said.findIndex((message) => message.agentId === "agent-2"));
  });

  it("puts a row over each turn a supplier started, and not two in a row over the supplier", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          state: RUN_STEP_STOPPED,
          said: "",
          fromStepIds: ["step-1"],
        }),
        step({
          id: "step-3",
          place: 3,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
        }),
      ]),
    );

    // A walk stopped and asked again: the second row goes over the turn that came of it, under the stopped one's word,
    // not beside the first row over the supplier.
    expect(said.map((message) => `${message.from}:${message.id}`)).toEqual([
      "person:question-1:asked",
      "agent:step-1",
      "handoff:step-1:step-2",
      "agent:step-2",
      "handoff:step-1:step-3",
      "agent:step-3",
    ]);
  });

  it("keeps a link that led nowhere, and draws a link that led to a turn only over that turn", () => {
    const said = runStream(
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
          fromStepIds: ["step-1"],
        }),
      ]),
    );

    // The link to agent-3 was never taken and left no step, so it is drawn under its source step; the link to agent-2
    // is drawn over the turn it started, not twice.
    expect(said.map((message) => `${message.from}:${message.otherAgentId ?? ""}:${message.stopReason ?? ""}`)).toEqual([
      "person::",
      "agent::",
      "handoff:agent-3:busy",
      "handoff:agent-2:",
      "agent::",
    ]);
  });

  it("heads a turn with the step of the walk it stands on and when it began — «КРОК 2 · 19:29»", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
          startedAt: new Date("2026-08-22T19:29:00"),
        }),
      ]),
    );

    // A turn read back carries its written step and start hour; the level is counted in the stream, alike for live and
    // read turns.
    expect(
      said.filter((message) => message.from === "agent").map((message) => [message.stepId, message.began]),
    ).toEqual([
      ["step-1", new Date("2026-08-22T19:27:00").toISOString()],
      ["step-2", new Date("2026-08-22T19:29:00").toISOString()],
    ]);
  });

  it("leaves the question and the handoffs without a step, since neither is one", () => {
    const said = runStream(
      run([
        step(),
        step({
          id: "step-2",
          place: 2,
          agentId: "agent-2",
          fromStepIds: ["step-1"],
        }),
      ]),
    );

    expect(said.filter((message) => message.from !== "agent").every((message) => message.began === null)).toBe(true);
  });

  it("marks a step that fell, since the stream draws a fall differently from an answer", () => {
    const said = runStream(
      run([
        step({
          state: RUN_STEP_FAILED,
        }),
      ]),
    );

    expect(said.find((message) => message.from === "agent")?.isFailure).toBe(true);
  });

  it("says why a step fell, in the provider's own words, and keeps them off the card", () => {
    // The record holds what came back; a refusal is not the agent speaking, so it stands on the rule.
    const said = runStream(
      run([
        step({
          said: "404 page not found",
          state: RUN_STEP_FAILED,
        }),
      ]),
    );
    const fell = said.find((message) => message.from === "agent");

    expect(fell?.note).toBe(fellNote("404 page not found"));
    expect(fell?.text).toBe("");
  });

  it("says over a read-back step what the live stream said, whichever wall the turn hit", () => {
    const silent = runStream(
      run([
        step({
          said: "",
          state: RUN_STEP_SILENT,
        }),
      ]),
    );
    const ceiling = runStream(
      run([
        step({
          state: RUN_STEP_CEILING,
        }),
      ]),
    );

    // A silent step read from the record carries the said-nothing note.
    expect(silent.find((message) => message.from === "agent")?.note).toBe(CHAT_SAID_NOTHING_NOTE);
    expect(ceiling.find((message) => message.from === "agent")?.note).toBe(answerCeilingNote(4096));
  });

  it("names the number of calls a turn used up, since it used exactly as many as it was allowed", () => {
    const said = runStream(
      run([
        step({
          state: RUN_STEP_CALLS,
          calls: [made("call-1", 1), made("call-2", 2)],
        }),
      ]),
    );

    expect(said.find((message) => message.from === "agent")?.note).toBe(callsExhaustedNote(2));
  });

  it("carries the calls a step made, with what they printed and how they ended", () => {
    const said = runStream(
      run([
        step({
          calls: [
            {
              id: "call-1",
              source: "command",
              place: 1,
              name: "tests",
              arguments: {
                path: "src",
              },
              pinned: ["path"],
              line: "npm test src",
              output: "усе зелене",
              refusal: "",
              exitCode: 0,
              serverId: null,
              serverName: "",
              isFailed: false,
              end: "ran",
              startedAt: new Date("2026-08-22T19:27:01"),
              endedAt: new Date("2026-08-22T19:27:03"),
            },
          ],
        }),
      ]),
    );
    const [call] = said.find((message) => message.from === "agent")!.calls;

    expect(call.name).toBe("tests");
    expect(call.output).toBe("усе зелене");
    expect(call.exitCode).toBe(0);
    expect(call.endedAt - call.startedAt).toBe(2000);
    // Read back from the record, a call still names the values the person pinned.
    expect(call.pinned).toEqual(["path"]);
  });

  it("gives back the card of a turn that never began, with the provider's words and no cost", () => {
    const said = runStream(
      run([
        step({
          state: NOT_STARTED_ENDS.noKey.state,
          said: "Модель hy-mt2 належить провайдеру Tencent, а ключа до нього немає.",
          inputTokens: 0,
          outputTokens: 0,
          money: 0,
          endedAt: new Date("2026-08-22T19:27:00"),
        }),
      ]),
    );
    const turn = said.find((message) => message.from === "agent")!;

    // The card is read from the end the step came to; the words stand as they came.
    expect(turn.notStarted).toBe("noKey");
    expect(turn.text).toBe("Модель hy-mt2 належить провайдеру Tencent, а ключа до нього немає.");
    expect(turn.note).toBeNull();
    // Nothing was sent: no price under the card.
    expect(turn.cost).toBeNull();
    expect(turn.wouldGo).toBeNull();
    // The question is present, so a repeat asks the same words.
    expect(turn.asked).toBe("Розбий текст на тези");
  });

  it("counts the ceiling breakdown again from the words and the ceiling the model had then", () => {
    const said = runStream(
      run([
        step({
          state: RUN_STEP_TOO_LONG,
          prompt: "Ти ріжеш",
          asked: "Розбий",
          contextCeiling: 10,
          said: "У модель пішло б 14 символів, а стеля hy-mt2 — 10.",
        }),
      ]),
    );
    const turn = said.find((message) => message.from === "agent")!;

    // The numbers are not kept; the prompt, the question and the model's ceiling are.
    expect(turn.notStarted).toBe("tooLong");
    expect(turn.wouldGo).toEqual({
      prompt: 8,
      asked: 6,
      total: 14,
      ceiling: 10,
    });
  });
});
