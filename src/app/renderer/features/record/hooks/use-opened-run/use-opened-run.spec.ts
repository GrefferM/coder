import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOpenedRun } from "./use-opened-run";
import { READ_RUN_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";

/** The record, as it stands after `steps` steps of one flow. */
function record(steps: number) {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state: "done",
    startedAt: new Date("2026-08-30T19:04:00"),
    askedAt: new Date("2026-08-30T19:04:00"),
    endedAt: new Date("2026-08-30T19:04:12"),
    steps,
    money: 0.0001,
    worked: 4_000,
    walk: Array.from(
      {
        length: steps,
      },
      (_, index) => ({
        questionId: "question-1",
        place: index + 1,
      }),
    ),
  };
}

describe("useOpenedRun", () => {
  it("reads the record again on every write, since the conversation goes on writing into it", async () => {
    let steps = 1;
    const invoke = vi.fn(async (channel: string) => (channel === READ_RUN_CHANNEL ? record(steps) : undefined));

    standInBridge({
      invoke: invoke,
    });

    const { result, rerender } = renderHook(({ written }) => useOpenedRun("run-1", written), {
      initialProps: {
        written: 0,
      },
    });

    await waitFor(() => expect(result.current.run?.walk).toHaveLength(1));

    steps = 4;
    rerender({
      written: 1,
    });

    // A run opened while its flow is still answering would otherwise stand at the steps it had.
    await waitFor(() => expect(result.current.run?.walk).toHaveLength(4));
  });

  it("says a record it could not read is not an empty one", async () => {
    standInBridge({
      invoke: async () => {
        throw new Error("no record");
      },
    });

    const { result } = renderHook(() => useOpenedRun("run-1", 0));

    await waitFor(() => expect(result.current.isFailed).toBe(true));
    expect(result.current.run).toBe(null);
  });
});
