import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useListWalk } from "./use-list-walk";
import type { WalkedKey } from "./interfaces";

function key(name: string): WalkedKey {
  return {
    key: name,
    preventDefault: vi.fn(),
  };
}

describe("useListWalk", () => {
  it("walks the rows with the arrows and stops at both ends", () => {
    const { result } = renderHook(() => useListWalk(3, true, () => undefined));

    expect(result.current.walked).toBe(0);

    act(() => result.current.onKeyDown(key("ArrowUp")));

    expect(result.current.walked).toBe(0);

    act(() => result.current.onKeyDown(key("ArrowDown")));
    act(() => result.current.onKeyDown(key("ArrowDown")));
    act(() => result.current.onKeyDown(key("ArrowDown")));

    expect(result.current.walked).toBe(2);
  });

  it("takes the row it stands on with Enter", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useListWalk(3, true, onEnter));

    act(() => result.current.onKeyDown(key("ArrowDown")));
    act(() => result.current.onKeyDown(key("Enter")));

    expect(onEnter).toHaveBeenCalledWith(1);
  });

  it("answers nothing where the list is empty", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useListWalk(0, true, onEnter));

    act(() => result.current.onKeyDown(key("Enter")));

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("opens standing on the row it was given, and goes back there every time it opens", () => {
    const { result, rerender } = renderHook(({ isOpen }) => useListWalk(3, isOpen, () => undefined, 2), {
      initialProps: {
        isOpen: true,
      },
    });

    act(() => result.current.onKeyDown(key("ArrowDown")));
    rerender({
      isOpen: false,
    });
    rerender({
      isOpen: true,
    });

    expect(result.current.walked).toBe(2);
  });

  it("keeps the walk inside a list that has grown shorter under it", () => {
    const { result, rerender } = renderHook(({ count }) => useListWalk(count, true, () => undefined), {
      initialProps: {
        count: 5,
      },
    });

    act(() => result.current.onKeyDown(key("ArrowDown")));
    act(() => result.current.onKeyDown(key("ArrowDown")));
    rerender({
      count: 2,
    });

    expect(result.current.walked).toBe(1);
  });
});
