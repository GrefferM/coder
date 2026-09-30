import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOpenCalls } from "./use-open-calls";

describe("useOpenCalls", () => {
  it("stands every call folded until somebody opens it", () => {
    // A call is one line in the stream; a dozen calls are a dozen lines, not blocks.
    const { result } = renderHook(() => useOpenCalls());

    expect(result.current.isOpen("call-1")).toBe(false);
  });

  it("opens on the press and folds on the next one", () => {
    const { result } = renderHook(() => useOpenCalls());

    act(() => result.current.toggle("call-1"));

    expect(result.current.isOpen("call-1")).toBe(true);

    act(() => result.current.toggle("call-1"));

    expect(result.current.isOpen("call-1")).toBe(false);
  });

  it("remembers each call on its own", () => {
    const { result } = renderHook(() => useOpenCalls());

    act(() => result.current.toggle("call-1"));

    expect(result.current.isOpen("call-1")).toBe(true);
    expect(result.current.isOpen("call-2")).toBe(false);
  });
});
