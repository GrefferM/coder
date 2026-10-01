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
import type { PackedAttachment } from "../../../interfaces";

const NOTES: PackedAttachment = {
  path: "/tmp/coder/notes.md",
  name: "notes.md",
  kind: "file",
  text: "=== notes.md ===\n# Нотатки",
  binaries: [],
};

const AGENT = anAgent({
  id: "agent-1",
  name: "ТЕЗАР",
  color: "#b18aff",
});

/** A machine that answers every channel with the same value. */
function machine(answer: unknown) {
  const invoke = vi.fn(async () => answer);

  standInBridge({
    invoke,
  });

  return invoke;
}

/** A machine that cannot answer at all: unreadable record, closing window, or a throwing write. */
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
    // The row is named with the opening, before its first step lands.
    const invoke = machine({
      runId: "run-1",
      questionId: "question-1",
    });

    await openRun("/tmp/coder", {
      questionId: "question-1",
      agent: AGENT,
      asked: "Розбий текст",
      // The files go with the question, packed as they went into the turn.
      attached: [NOTES],
      askedAt: 1_000,
    });

    expect(invoke).toHaveBeenCalledWith(OPEN_RUN_CHANNEL, {
      directory: "/tmp/coder",
      questionId: "question-1",
      startedByAgentId: "agent-1",
      startedByAgentName: "ТЕЗАР",
      startedByAgentColor: "#b18aff",
      asked: "Розбий текст",
      attached: [NOTES],
      startedAt: 1_000,
    });
  });

  it("asks again under the question's own id, into the row that already stands", async () => {
    const invoke = machine("question-2");

    await askAgain("run-1", {
      questionId: "question-2",
      agent: AGENT,
      asked: "Друге",
      attached: [NOTES],
      askedAt: 2_000,
    });

    expect(invoke).toHaveBeenCalledWith(ASK_AGAIN_CHANNEL, {
      runId: "run-1",
      questionId: "question-2",
      asked: "Друге",
      askedAgentId: "agent-1",
      askedAgentName: "ТЕЗАР",
      attached: [NOTES],
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
  it("rejects every read and every write with what the record said, so nothing is mistaken for an empty answer", async () => {
    brokenMachine();

    await expect(listRuns("/tmp/coder")).rejects.toThrow("no record");
    await expect(readRun("run-1")).rejects.toThrow("no record");
    await expect(
      openRun("/tmp/coder", {
        questionId: "question-1",
        agent: AGENT,
        asked: "Розбий текст",
        attached: [],
        askedAt: 1_000,
      }),
    ).rejects.toThrow("no record");
    await expect(
      askAgain("run-1", {
        questionId: "question-2",
        agent: AGENT,
        asked: "Друге",
        attached: [],
        askedAt: 2_000,
      }),
    ).rejects.toThrow("no record");
    await expect(writeStep(<WrittenStep>(<unknown>{}))).rejects.toThrow("no record");
    await expect(closeRun("run-1", 3_000)).rejects.toThrow("no record");
    await expect(forgetRun("run-1")).rejects.toThrow("no record");
    await expect(forgetRuns("/tmp/coder")).rejects.toThrow("no record");
  });

  it("says a row that is gone did not take the question, which is not a refusal", async () => {
    machine(null);

    expect(
      await askAgain("run-1", {
        questionId: "question-2",
        agent: AGENT,
        asked: "Друге",
        attached: [],
        askedAt: 2_000,
      }),
    ).toBe(false);
  });
});
