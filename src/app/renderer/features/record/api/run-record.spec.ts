import { describe, expect, it, vi } from "vitest";
import { forgetRun, forgetRuns, listRuns, readRun } from "./run-record";
import { FORGET_RUN_CHANNEL, FORGET_RUNS_CHANNEL, LIST_RUNS_CHANNEL, READ_RUN_CHANNEL } from "../../../../../contracts";
import { standInBridge } from "../../../testing";

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
  it("rejects every read and every deletion with what the record said, so nothing is mistaken for an empty answer", async () => {
    brokenMachine();

    await expect(listRuns("/tmp/coder")).rejects.toThrow("no record");
    await expect(readRun("run-1")).rejects.toThrow("no record");
    await expect(forgetRun("run-1")).rejects.toThrow("no record");
    await expect(forgetRuns("/tmp/coder")).rejects.toThrow("no record");
  });
});
