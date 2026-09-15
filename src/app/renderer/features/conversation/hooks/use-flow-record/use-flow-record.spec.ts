import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFlowRecord } from "./use-flow-record";

/** The hook as the chat holds it, with the walk's ear standing in for the machine. */
function record() {
  const rowOpened = vi.fn();
  const rendered = renderHook(() => useFlowRecord(rowOpened, () => false));

  return {
    rowOpened,
    ...rendered,
  };
}

describe("useFlowRecord · the row one conversation writes into", () => {
  it("stands on no row until one is learnt", () => {
    const { result } = record();

    expect(result.current.runId).toBe(null);
    expect(result.current.standing()).toBe(null);
  });

  it("takes the row a walk opened, and tells the walk of it", () => {
    const { result, rowOpened } = record();

    act(() => result.current.learnRow("walk-1", "run-1"));

    expect(rowOpened).toHaveBeenCalledWith("walk-1", "run-1");
    expect(result.current.runId).toBe("run-1");
  });

  it("keeps the row it stands on when another walk opens one, and still tells that walk", () => {
    const { result, rowOpened } = record();

    act(() => result.current.learnRow("walk-1", "run-1"));
    act(() => result.current.learnRow("walk-2", "run-2"));

    expect(rowOpened).toHaveBeenCalledWith("walk-2", "run-2");
    expect(result.current.runId).toBe("run-1");
  });

  it("turns to the row the person opened", () => {
    const { result } = record();

    act(() => result.current.turnTo("run-7"));

    expect(result.current.runId).toBe("run-7");
    expect(result.current.standing()).toBe("run-7");
  });

  it("stands on no row again once the conversation is ended", () => {
    const { result } = record();

    act(() => result.current.turnTo("run-7"));
    act(() => result.current.turnTo(null));

    expect(result.current.runId).toBe(null);
    expect(result.current.standing()).toBe(null);
  });

  it("takes a walk's row again after the conversation was ended, since the stream stands on none", () => {
    const { result } = record();

    act(() => result.current.learnRow("walk-1", "run-1"));
    act(() => result.current.turnTo(null));
    act(() => result.current.learnRow("walk-2", "run-2"));

    expect(result.current.runId).toBe("run-2");
  });
});
