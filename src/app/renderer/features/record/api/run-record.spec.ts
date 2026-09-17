import { describe, expect, it, vi } from "vitest";
import { askAgain, closeRun, forgetRun, forgetRuns, listRuns, openRun, readRun, writeStep } from "./run-record";
import {
  ADD_RUN_STEP_CHANNEL,
  ASK_AGAIN_CHANNEL,
  CLOSE_RUN_CHANNEL,
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  LIST_RUNS_CHANNEL,
  OPEN_RUN_CHANNEL,
  READ_RUN_CHANNEL,
} from "../../../../../contracts";
import { anAgent, standInBridge } from "../../../testing";
import type { WrittenStep } from "../interfaces";

const AGENT = anAgent({
  id: "agent-1",
  name: "ТЕЗАР",
  color: "#b18aff",
});

/** The machine answering every channel with one and the same thing. */
function machine(answer: unknown) {
  const invoke = vi.fn(async () => answer);

  standInBridge({
    invoke,
  });

  return invoke;
}

/** The machine that cannot answer at all — the record is unreadable, the window is closing, the write threw. */
function brokenMachine() {
  const invoke = vi.fn(async () => {
    throw new Error("no record");
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

describe("run-record · what is sent to the machine", () => {
  it("opens a run with the agent's name and colour as they stand at that moment", async () => {
    // The row is named before its first step lands, so the name goes with the opening and not after it.
    const invoke = machine({
      runId: "run-1",
      questionId: "question-1",
    });

    await openRun("/tmp/coder", {
      questionId: "question-1",
      agent: AGENT,
      asked: "Розбий текст",
      askedAt: 1_000,
    });

    expect(invoke).toHaveBeenCalledWith(OPEN_RUN_CHANNEL, {
      directory: "/tmp/coder",
      questionId: "question-1",
      startedByAgentId: "agent-1",
      startedByAgentName: "ТЕЗАР",
      startedByAgentColor: "#b18aff",
      asked: "Розбий текст",
      startedAt: 1_000,
    });
  });

  it("asks again under the question's own id, into the row that already stands", async () => {
    const invoke = machine("question-2");

    await askAgain("run-1", {
      questionId: "question-2",
      agent: AGENT,
      asked: "Друге",
      askedAt: 2_000,
    });

    expect(invoke).toHaveBeenCalledWith(ASK_AGAIN_CHANNEL, {
      runId: "run-1",
      questionId: "question-2",
      asked: "Друге",
      askedAgentId: "agent-1",
      askedAgentName: "ТЕЗАР",
      askedAt: 2_000,
    });
  });

  it("sends a written step whole, without picking it apart on the way", async () => {
    const invoke = machine("step-1");
    const step = <WrittenStep>(<unknown>{
      runId: "run-1",
      questionId: "question-1",
      walkId: "walk-1",
    });

    await writeStep(step);

    expect(invoke).toHaveBeenCalledWith(ADD_RUN_STEP_CHANNEL, step);
  });

  it("closes a run by the hour its walk came back", async () => {
    const invoke = machine(undefined);

    await closeRun("run-1", 3_000);

    expect(invoke).toHaveBeenCalledWith(CLOSE_RUN_CHANNEL, {
      runId: "run-1",
      endedAt: 3_000,
    });
  });

  it("asks for the list, one run and both deletions by what each of them is about", async () => {
    const invoke = machine([]);

    await listRuns("/tmp/coder");
    await readRun("run-1");
    await forgetRun("run-1");
    await forgetRuns("/tmp/coder");

    expect(invoke).toHaveBeenNthCalledWith(1, LIST_RUNS_CHANNEL, {
      directory: "/tmp/coder",
    });
    expect(invoke).toHaveBeenNthCalledWith(2, READ_RUN_CHANNEL, {
      id: "run-1",
    });
    expect(invoke).toHaveBeenNthCalledWith(3, FORGET_RUN_CHANNEL, {
      id: "run-1",
    });
    expect(invoke).toHaveBeenNthCalledWith(4, FORGET_RUNS_CHANNEL, {
      directory: "/tmp/coder",
    });
  });
});

describe("run-record · what comes back when the machine cannot answer", () => {
  it("says «не прочиталось» about a list and about one run, which is not the same as «порожньо»", async () => {
    // An unread record and an empty one look alike on screen and are not the same thing.
    brokenMachine();

    expect(await listRuns("/tmp/coder")).toBeNull();
    expect(await readRun("run-1")).toBeNull();
  });

  it("says a run was not opened rather than throwing at the conversation", async () => {
    brokenMachine();

    expect(
      await openRun("/tmp/coder", {
        questionId: "question-1",
        agent: AGENT,
        asked: "Розбий текст",
        askedAt: 1_000,
      }),
    ).toBeNull();
  });

  it("says the row did not take the question", async () => {
    brokenMachine();

    expect(
      await askAgain("run-1", {
        questionId: "question-2",
        agent: AGENT,
        asked: "Друге",
        askedAt: 2_000,
      }),
    ).toBe(false);
  });

  it("says a step was not written, and closing a run stays quiet", async () => {
    brokenMachine();

    expect(await writeStep(<WrittenStep>(<unknown>{}))).toBeNull();
    expect(await closeRun("run-1", 3_000)).toBeUndefined();
  });

  it("says nothing was deleted, each deletion in its own words", async () => {
    // «false» is «this row is still there»; «null» is «the record refused», and the list is not emptied on it.
    brokenMachine();

    expect(await forgetRun("run-1")).toBe(false);
    expect(await forgetRuns("/tmp/coder")).toBeNull();
  });

  it("turns a machine that answers nothing into the same «нічого», not into undefined", async () => {
    // The bridge answers `undefined` when a channel is not registered at all.
    machine(undefined);

    expect(
      await openRun("/tmp/coder", {
        questionId: "question-1",
        agent: AGENT,
        asked: "Розбий текст",
        askedAt: 1_000,
      }),
    ).toBeNull();
    expect(await readRun("run-1")).toBeNull();
    expect(await writeStep(<WrittenStep>(<unknown>{}))).toBeNull();
    expect(
      await askAgain("run-1", {
        questionId: "question-2",
        agent: AGENT,
        asked: "Друге",
        askedAt: 2_000,
      }),
    ).toBe(false);
  });
});
