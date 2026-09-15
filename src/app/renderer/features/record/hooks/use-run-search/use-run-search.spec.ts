import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRunSearch } from "./use-run-search";
import { SEARCH_RUNS_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { RunHit } from "../../interfaces";

const DIRECTORY = "/code/coder";

function hit(patch: Partial<RunHit> = {}): RunHit {
  return {
    runId: "run-1",
    questionId: "question-1",
    stepId: "step-2",
    agentId: "agent-2",
    agentName: "ТЕСТЕР",
    step: 2,
    at: new Date("2026-09-07T14:26:00"),
    found: "Поклав кешування у fetchUser",
    isCall: false,
    ...patch,
  };
}

describe("useRunSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("asks the record for the word typed, and hands back what it found", async () => {
    const invoke = vi.fn(async () => [hit()]);

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useRunSearch(DIRECTORY, "кеш", 0));

    await waitFor(() => expect(result.current.hits).toHaveLength(1));
    expect(invoke).toHaveBeenCalledWith(SEARCH_RUNS_CHANNEL, {
      directory: DIRECTORY,
      query: "кеш",
    });
    expect(result.current.found).toBe("кеш");
  });

  it("asks nothing at all while the field is empty, an empty field being no search", async () => {
    const invoke = vi.fn(async () => []);

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useRunSearch(DIRECTORY, "   ", 0));

    await waitFor(() => expect(result.current.hits).toEqual([]));
    expect(invoke).not.toHaveBeenCalled();
  });

  it("forgets what it found the moment the field empties, so the list is not painted by an old word", async () => {
    standInBridge({
      invoke: vi.fn(async () => [hit()]),
    });

    const { result, rerender } = renderHook(({ query }: { query: string }) => useRunSearch(DIRECTORY, query, 0), {
      initialProps: {
        query: "кеш",
      },
    });

    await waitFor(() => expect(result.current.hits).toHaveLength(1));

    rerender({
      query: "",
    });

    await waitFor(() => expect(result.current.found).toBe(""));
    expect(result.current.hits).toEqual([]);
  });

  it("asks again when the record is written to, so a run that has just answered joins the search", async () => {
    const invoke = vi.fn(async () => [hit()]);

    standInBridge({
      invoke,
    });

    const { rerender } = renderHook(({ written }: { written: number }) => useRunSearch(DIRECTORY, "кеш", written), {
      initialProps: {
        written: 0,
      },
    });

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));

    rerender({
      written: 1,
    });

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(2));
  });
});
