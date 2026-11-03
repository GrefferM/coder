import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRunHistory } from "./use-run-history";
import { FORGET_RUN_CHANNEL, FORGET_RUNS_CHANNEL, LIST_RUNS_CHANNEL } from "../../../../../../contracts";
import { RECORD_UNFORGOTTEN_NOTE, RECORD_UNREAD_NOTE, RUN_DONE } from "../../constants";
import { standInBridge } from "../../../../testing";
import type { RunRow } from "../../interfaces";

const AT = new Date(2026, 8, 4, 14, 0);

function row(id: string): RunRow {
  return {
    id,
    startedByAgentId: "agent-1",
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "Шукач",
    asked: "Знайди md-файли",
    state: RUN_DONE,
    startedAt: AT,
    askedAt: AT,
    endedAt: AT,
    steps: 1,
    money: null,
    worked: 1_000,
  };
}

/** The machine's record, answering each channel with the spec's values. */
function machine(answers: Record<string, unknown>) {
  const asked: string[] = [];
  const invoke = vi.fn(async (channel: string) => {
    asked.push(channel);

    return answers[channel];
  });

  standInBridge({
    invoke,
  });

  return {
    asked,
    invoke,
    listCalls: () => asked.filter((channel) => channel === LIST_RUNS_CHANNEL).length,
  };
}

describe("useRunHistory", () => {
  it("does not touch the record while the list is not open", () => {
    const { listCalls } = machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
    });

    renderHook(() => useRunHistory("/tmp/coder", false, 0));

    expect(listCalls()).toBe(0);
  });

  it("reads the record the moment the list is opened", async () => {
    machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(result.current.refusal).toBeNull();
  });

  it("reads it again on every write, since a walk going writes into it", async () => {
    const { listCalls } = machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
    });

    const { rerender } = renderHook(({ written }) => useRunHistory("/tmp/coder", true, written), {
      initialProps: {
        written: 0,
      },
    });

    await waitFor(() => expect(listCalls()).toBe(1));

    rerender({
      written: 1,
    });

    await waitFor(() => expect(listCalls()).toBe(2));
  });

  it("reads the record of the project it was given, and again when that is another one", async () => {
    const { listCalls } = machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
    });

    const { rerender } = renderHook(({ directory }) => useRunHistory(directory, true, 0), {
      initialProps: {
        directory: "/tmp/coder",
      },
    });

    await waitFor(() => expect(listCalls()).toBe(1));

    rerender({
      directory: "/tmp/other",
    });

    await waitFor(() => expect(listCalls()).toBe(2));
  });

  it("says what the record answered when it could not be read, rather than calling it empty", async () => {
    standInBridge({
      invoke: vi.fn(async () => {
        throw new Error("SQLITE_CANTOPEN: unable to open database file");
      }),
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() =>
      expect(result.current.refusal).toBe(`${RECORD_UNREAD_NOTE} · SQLITE_CANTOPEN: unable to open database file`),
    );
    expect(result.current.runs).toEqual([]);
  });

  it("keeps a run the record refused to remove, and says what it answered", async () => {
    const invoke = vi.fn(async (channel: string) => {
      if (channel === FORGET_RUN_CHANNEL) {
        throw new Error("database is locked");
      }

      return channel === LIST_RUNS_CHANNEL ? [row("run-1")] : undefined;
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));

    let isGone = true;

    await act(async () => {
      isGone = await result.current.forget("run-1");
    });

    expect(isGone).toBe(false);
    expect(result.current.runs).toHaveLength(1);
    expect(result.current.refusal).toBe(`${RECORD_UNFORGOTTEN_NOTE} · database is locked`);
  });

  it("lets a read it has left behind come back to nothing", async () => {
    // Tab opened over one project then another: the older read must not land on the newer list.
    let releaseFirst = (rows: RunRow[]) => {
      void rows;
    };
    let call = 0;
    const invoke = vi.fn(async (channel: string) => {
      if (channel !== LIST_RUNS_CHANNEL) {
        return undefined;
      }

      call += 1;

      return call === 1
        ? new Promise<RunRow[]>((resolve) => {
            releaseFirst = resolve;
          })
        : [row("run-new")];
    });

    standInBridge({
      invoke,
    });

    const { result, rerender } = renderHook(({ directory }) => useRunHistory(directory, true, 0), {
      initialProps: {
        directory: "/tmp/coder",
      },
    });

    rerender({
      directory: "/tmp/other",
    });

    await waitFor(() => expect(result.current.runs.map((one) => one.id)).toEqual(["run-new"]));

    await act(async () => {
      releaseFirst([row("run-old")]);
    });

    expect(result.current.runs.map((one) => one.id)).toEqual(["run-new"]);
  });

  it("drops a deleted row where it stands, without reading the record again", async () => {
    // The list is redrawn from what it holds; a second window learns on its own.
    const { listCalls } = machine({
      [LIST_RUNS_CHANNEL]: [row("run-1"), row("run-2")],
      [FORGET_RUN_CHANNEL]: true,
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(result.current.runs).toHaveLength(2));

    await act(() => result.current.forget("run-1"));

    expect(result.current.runs.map((one) => one.id)).toEqual(["run-2"]);
    expect(listCalls()).toBe(1);
  });

  it("keeps the row when the record did not let it go", async () => {
    machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
      [FORGET_RUN_CHANNEL]: false,
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));

    await act(() => result.current.forget("run-1"));

    expect(result.current.runs).toHaveLength(1);
  });

  it("empties the list when every ended run went, and leaves it standing when the record refused", async () => {
    // «× ЗАБРАТИ N» answers with how many went; a refusal rejects with the record's own words.
    standInBridge({
      invoke: vi.fn(async (channel: string) => {
        if (channel === FORGET_RUNS_CHANNEL) {
          throw new Error("database is locked");
        }

        return channel === LIST_RUNS_CHANNEL ? [row("run-1")] : undefined;
      }),
    });

    const { result } = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));

    await act(() => result.current.forgetAll());

    expect(result.current.runs).toHaveLength(1);

    machine({
      [LIST_RUNS_CHANNEL]: [row("run-1")],
      [FORGET_RUNS_CHANNEL]: 1,
    });

    const second = renderHook(() => useRunHistory("/tmp/coder", true, 0));

    await waitFor(() => expect(second.result.current.runs).toHaveLength(1));

    await act(() => second.result.current.forgetAll());

    expect(second.result.current.runs).toEqual([]);
  });
});
