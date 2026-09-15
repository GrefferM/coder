import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useShowCall } from "./use-show-call";
import { callPlace } from "../../../../features/record";
import type { OpenCalls } from "../../../../features/conversation";
import type { RailStanding } from "../use-rail-standing";
import type { RunRow } from "../../../../features/record";
import type { ShownStream } from "../use-shown-stream";

vi.mock("../../../../features/record", async (whole) => ({
  ...(await whole<Record<string, unknown>>()),
  callPlace: vi.fn(),
}));

const RUN_ID = "11111111-1111-4111-8111-111111111111";
const CALL_ID = "22222222-2222-4222-8222-222222222222";

function aRun(): RunRow {
  return <RunRow>(<unknown>{
    id: RUN_ID,
    askedAgentId: "agent-1",
  });
}

function parts(patch: { runs?: RunRow[] } = {}) {
  const openRun = vi.fn();
  const openChat = vi.fn();
  const open = vi.fn();
  const stream = <ShownStream>(<unknown>{
    runs: patch.runs ?? [aRun()],
    openRun,
  });
  const rail = <RailStanding>(<unknown>{
    openChat,
  });
  const openCalls = <OpenCalls>(<unknown>{
    open,
  });

  return {
    stream,
    rail,
    openCalls,
    openRun,
    openChat,
    open,
  };
}

describe("useShowCall", () => {
  it("stands the run the call was made in, rides to its message and opens the row", async () => {
    // «переводить чат на того агента й той прогін і розкриває рядок виклику».
    vi.mocked(callPlace).mockResolvedValue({
      runId: RUN_ID,
      questionId: "question-1",
      stepId: "step-1",
    });

    const held = parts();
    const { result } = renderHook(() => useShowCall(held.stream, held.rail, held.openCalls));

    act(() => result.current(CALL_ID));

    await waitFor(() => expect(held.openRun).toHaveBeenCalledTimes(1));

    expect(held.openRun.mock.calls[0][0].id).toBe(RUN_ID);
    expect(held.openRun.mock.calls[0][1]).toMatchObject({
      questionId: "question-1",
      stepId: "step-1",
      isCall: true,
    });
    // The one place a row opens with no hand on it — the hand was there, just in another room.
    expect(held.open).toHaveBeenCalledWith(CALL_ID);
    expect(held.openChat).toHaveBeenCalledTimes(1);
  });

  it("leads nowhere for a call the record can no longer place", async () => {
    // A run forgotten takes its calls with it, and a call written before the record kept ids has another one.
    vi.mocked(callPlace).mockResolvedValue(null);

    const held = parts();
    const { result } = renderHook(() => useShowCall(held.stream, held.rail, held.openCalls));

    act(() => result.current(CALL_ID));

    await waitFor(() => expect(callPlace).toHaveBeenCalled());

    expect(held.openRun).not.toHaveBeenCalled();
    expect(held.openChat).not.toHaveBeenCalled();
  });

  it("leads nowhere where the run is not among the project's own, since there is nothing to open", async () => {
    vi.mocked(callPlace).mockResolvedValue({
      runId: "99999999-9999-4999-8999-999999999999",
      questionId: "question-1",
      stepId: "step-1",
    });

    const held = parts();
    const { result } = renderHook(() => useShowCall(held.stream, held.rail, held.openCalls));

    act(() => result.current(CALL_ID));

    await waitFor(() => expect(callPlace).toHaveBeenCalled());

    expect(held.openRun).not.toHaveBeenCalled();
  });
});
