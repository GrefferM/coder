import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePressable } from "./use-pressable";

/** A keyboard event as the row sees it; fired on the row unless a target is given. */
function keyEvent(key: string, target?: unknown) {
  const row = {};

  return {
    key,
    target: target ?? row,
    currentTarget: row,
    preventDefault: vi.fn(),
  };
}

describe("usePressable", () => {
  it("gives the box a button's role and a place in the keyboard's walk", () => {
    const { result } = renderHook(() => usePressable(() => {}));

    expect(result.current.handlers.role).toBe("button");
    expect(result.current.handlers.tabIndex).toBe(0);
  });

  it("presses on Enter and on space, the two keys a button answers", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => usePressable(onPress));

    for (const key of ["Enter", " "]) {
      const event = keyEvent(key);

      act(() => result.current.handlers.onKeyDown(<never>event));

      expect(event.preventDefault).toHaveBeenCalled();
    }

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("stays out of the way of other keys", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => usePressable(onPress));

    act(() => result.current.handlers.onKeyDown(<never>keyEvent("a")));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("leaves a key pressed inside it to the button it was pressed on", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => usePressable(onPress));

    act(() => result.current.handlers.onKeyDown(<never>keyEvent("Enter", {})));

    expect(onPress).not.toHaveBeenCalled();
  });
});
