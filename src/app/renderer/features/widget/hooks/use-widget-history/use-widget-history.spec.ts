import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWidgetHistory } from "./use-widget-history";
import {
  FORGET_RUN_CHANNEL,
  FRESH_WALKS_CHANNEL,
  GO_ON_IN_WALKS_CHANNEL,
  LIST_RUNS_CHANNEL,
  WALKS_WRITTEN_CHANNEL,
} from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { RunRow } from "../../../../../../contracts";
import type { WidgetHistoryHands } from "../../interfaces";

function aRun(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "run-1",
    startedByAgentId: "alex",
    startedByAgentName: "ALEX",
    startedByAgentColor: "#7cc4ff",
    startedByScheduleId: null,
    asked: "Hi Alex",
    state: "done",
    startedAt: new Date("2026-11-19T17:28:00"),
    askedAt: new Date("2026-11-19T17:28:00"),
    endedAt: new Date("2026-11-19T17:29:00"),
    steps: 1,
    money: null,
    worked: 4000,
    askedAgentId: "alex",
    askedAgentName: "ALEX",
    ...patch,
  };
}

/** A record holding the given runs, which forgets one when asked; the spec writes to it through `written`. */
function record(held: RunRow[]) {
  const rows = [...held];
  const written: (() => void)[] = [];
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    if (channel === LIST_RUNS_CHANNEL) {
      return [...rows];
    }

    if (channel === FORGET_RUN_CHANNEL) {
      const { id } = <{ id: string }>payload;

      rows.splice(
        rows.findIndex((run) => run.id === id),
        1,
      );

      return true;
    }

    return undefined;
  });

  standInBridge<void>({
    invoke,
    subscribe: (channel, listener) => {
      if (channel === WALKS_WRITTEN_CHANNEL) {
        written.push(() => listener());
      }

      return () => undefined;
    },
  });

  return {
    invoke,
    rows,
    written,
  };
}

function hands(patch: Partial<WidgetHistoryHands> = {}): WidgetHistoryHands {
  return {
    directory: "/work/english",
    sphereId: "alex",
    onNote: vi.fn(),
    ...patch,
  };
}

describe("useWidgetHistory", () => {
  it("opens on the chosen sphere's runs alone", async () => {
    record([
      aRun(),
      aRun({
        id: "run-2",
        startedByAgentId: "corrector",
      }),
    ]);
    const { result } = renderHook(() => useWidgetHistory(hands()));

    act(() => result.current.toggle());

    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.runs.map((run) => run.id)).toEqual(["run-1"]);
  });

  it("opens nothing where the sphere has no run", async () => {
    const { invoke } = record([
      aRun({
        startedByAgentId: "corrector",
      }),
    ]);
    const { result } = renderHook(() => useWidgetHistory(hands()));

    act(() => result.current.toggle());

    await waitFor(() => expect(invoke).toHaveBeenCalledWith(LIST_RUNS_CHANNEL, expect.anything()));
    expect(result.current.isOpen).toBe(false);
  });

  it("folds away once every run of the sphere is deleted", async () => {
    record([aRun()]);
    const { result } = renderHook(() => useWidgetHistory(hands()));

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => result.current.askToForgetAll());
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(result.current.runs).toEqual([]);
    expect(result.current.isForgettingAll).toBe(false);
  });

  it("leaves a fresh conversation where the run deleted was the one opened", async () => {
    const { invoke } = record([aRun()]);
    const { result } = renderHook(() => useWidgetHistory(hands()));

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    act(() => result.current.open("run-1"));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith(GO_ON_IN_WALKS_CHANNEL, expect.anything()));

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    act(() => result.current.askToForget(result.current.runs[0]));
    act(() => result.current.confirm());

    await waitFor(() => expect(invoke).toHaveBeenCalledWith(FRESH_WALKS_CHANNEL));
  });

  it("lists again at a write to the record while it stands open", async () => {
    const { rows, written } = record([aRun()]);
    const { result } = renderHook(() => useWidgetHistory(hands()));

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    rows.unshift(
      aRun({
        id: "run-2",
        asked: "Tell me about your weekend",
      }),
    );
    act(() => written.forEach((write) => write()));

    await waitFor(() => expect(result.current.runs.map((run) => run.id)).toEqual(["run-2", "run-1"]));
  });
});
