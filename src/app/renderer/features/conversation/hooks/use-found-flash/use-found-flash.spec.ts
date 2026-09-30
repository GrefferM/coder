import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFoundFlash } from "./use-found-flash";
import { AGENT_CHAT_FOUND_MS } from "../../ui/agent-chat/constants";

describe("useFoundFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lights the message the search drove to", () => {
    const { result } = renderHook(() => useFoundFlash("said-2"));

    expect(result.current).toBe("said-2");
  });

  it("lets it go again, a light that never goes out being a part of the card and not a light", () => {
    const { result } = renderHook(() => useFoundFlash("said-2"));

    act(() => {
      vi.advanceTimersByTime(AGENT_CHAT_FOUND_MS);
    });

    expect(result.current).toBeNull();
  });

  it("starts the moment over on a second arrival, so two cards are never lit at once", () => {
    const { result, rerender } = renderHook(({ found }: { found: string | null }) => useFoundFlash(found), {
      initialProps: {
        found: <string | null>"said-2",
      },
    });

    act(() => {
      vi.advanceTimersByTime(AGENT_CHAT_FOUND_MS - 100);
    });

    rerender({
      found: "said-5",
    });

    expect(result.current).toBe("said-5");

    act(() => {
      vi.advanceTimersByTime(AGENT_CHAT_FOUND_MS - 100);
    });

    // The older moment ending does not clear the newer one.
    expect(result.current).toBe("said-5");
  });

  it("lights nothing where the press drove nowhere", () => {
    const { result } = renderHook(() => useFoundFlash(null));

    expect(result.current).toBeNull();
  });

  it("lets a mark go however the place was reached — a walk with Enter no less than a pressed row", () => {
    // The mark never holds.
    const { result, rerender } = renderHook(({ found }) => useFoundFlash(found), {
      initialProps: {
        found: "said-2" as string | null,
      },
    });

    rerender({
      found: "said-5",
    });

    expect(result.current).toBe("said-5");

    act(() => {
      vi.advanceTimersByTime(AGENT_CHAT_FOUND_MS);
    });

    expect(result.current).toBeNull();
  });
});
