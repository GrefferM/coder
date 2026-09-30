import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { forgetLive, sayPiece, useLiveAnswer } from "./use-live-answer";
import type { LiveCall } from "../../../../interfaces";

/** One call as the machine says it, in any state. */
function call(id: string, state: LiveCall["state"]): LiveCall {
  return {
    id,
    source: "command",
    name: "find_deep",
    arguments: {},
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: null,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1,
    endedAt: 0,
    state,
  };
}

describe("useLiveAnswer", () => {
  it("says nothing of a turn nothing has arrived for", () => {
    const { result } = renderHook(() => useLiveAnswer("turn-none"));

    expect(result.current.text).toBe("");
    expect(result.current.calls).toEqual([]);
  });

  it("grows the answer piece by piece", () => {
    const { result } = renderHook(() => useLiveAnswer("turn-text"));

    act(() => sayPiece("turn-text", "Пишу", null));
    act(() => sayPiece("turn-text", "…", null));

    expect(result.current.text).toBe("Пишу…");
  });

  it("stands a call for the rest of the turn, in the state it last reached", () => {
    const { result } = renderHook(() => useLiveAnswer("turn-calls"));

    act(() => sayPiece("turn-calls", "", call("call-1", "running")));
    act(() => sayPiece("turn-calls", "", call("call-2", "refused")));
    act(() => sayPiece("turn-calls", "", call("call-1", "ran")));

    expect(result.current.calls.map((one) => [one.id, one.state])).toEqual([
      ["call-1", "ran"],
      ["call-2", "refused"],
    ]);
  });

  it("hears nothing of another turn: every turn says its own words", () => {
    const { result } = renderHook(() => useLiveAnswer("turn-mine"));

    act(() => sayPiece("turn-other", "Чуже", null));

    expect(result.current.text).toBe("");
  });

  it("forgets what the turn said when it comes back, so the card of the next one starts empty", () => {
    const { result } = renderHook(() => useLiveAnswer("turn-over"));

    act(() => sayPiece("turn-over", "Готово", null));
    act(() => forgetLive("turn-over"));

    expect(result.current.text).toBe("");
  });
});
