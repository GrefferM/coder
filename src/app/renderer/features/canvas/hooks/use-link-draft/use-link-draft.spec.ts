import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLinkDraft } from "./use-link-draft";
import { LINK_DRAFT_CANCELLED_MS } from "../../constants";

const AT = {
  x: 120,
  y: 240,
};

describe("useLinkDraft", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("draws nothing until a line is started", () => {
    const { result } = renderHook(() => useLinkDraft());

    expect(result.current.drawn).toBeNull();
    expect(result.current.cancelled).toBeNull();
  });

  it("follows the pointer while a line is being drawn", () => {
    const { result } = renderHook(() => useLinkDraft());

    act(() => result.current.drawFrom("agent-1", AT));
    act(() =>
      result.current.followTo({
        x: 300,
        y: 400,
      }),
    );

    expect(result.current.drawn).toEqual({
      agentId: "agent-1",
      at: {
        x: 300,
        y: 400,
      },
    });
  });

  it("follows nothing where no line is being drawn", () => {
    const { result } = renderHook(() => useLinkDraft());

    act(() => result.current.followTo(AT));

    expect(result.current.drawn).toBeNull();
  });

  it("crosses out a line let go over nothing, and lets it fade in its own time", () => {
    const { result } = renderHook(() => useLinkDraft());

    act(() => result.current.drawFrom("agent-1", AT));
    act(() => result.current.cancel());

    expect(result.current.drawn).toBeNull();
    expect(result.current.cancelled?.agentId).toBe("agent-1");

    act(() => vi.advanceTimersByTime(LINK_DRAFT_CANCELLED_MS));

    expect(result.current.cancelled).toBeNull();
  });

  it("leaves nothing crossed out where the line was drawn onto a sphere that took it", () => {
    const { result } = renderHook(() => useLinkDraft());

    act(() => result.current.drawFrom("agent-1", AT));
    act(() => result.current.finish());

    expect(result.current.drawn).toBeNull();
    expect(result.current.cancelled).toBeNull();
  });

  it("drops the line on Escape, the same as letting it go over nothing", () => {
    const { result } = renderHook(() => useLinkDraft());

    act(() => result.current.drawFrom("agent-1", AT));
    act(() =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
        }),
      ),
    );

    expect(result.current.drawn).toBeNull();
    expect(result.current.cancelled?.agentId).toBe("agent-1");
  });
});
