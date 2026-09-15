import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChosenLink } from "./use-chosen-link";

function press(key: string) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
    }),
  );
}

describe("useChosenLink", () => {
  it("tells the page which link stands chosen, so a destructive key knows whose it is", () => {
    // The chat keeps a sphere selected under a chosen link, so the rank must be said.
    const onChosenChange = vi.fn();
    const { result } = renderHook(() => useChosenLink(onChosenChange, vi.fn()));

    act(() => result.current.choose("link-1"));

    expect(result.current.chosenLinkId).toBe("link-1");
    expect(onChosenChange).toHaveBeenCalledWith("link-1");
  });

  it("lets the link go on Escape, and says so", () => {
    const onChosenChange = vi.fn();
    const { result } = renderHook(() => useChosenLink(onChosenChange, vi.fn()));

    act(() => result.current.choose("link-1"));
    act(() => press("Escape"));

    expect(result.current.chosenLinkId).toBeNull();
    expect(onChosenChange).toHaveBeenLastCalledWith(null);
  });

  it("deletes the chosen link on ⌫, and lets it go with it", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useChosenLink(vi.fn(), onDelete));

    act(() => result.current.choose("link-1"));
    act(() => press("Backspace"));

    expect(onDelete).toHaveBeenCalledWith("link-1");
    expect(result.current.chosenLinkId).toBeNull();
  });

  it("answers Delete the same way as Backspace, since both are the destructive key", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useChosenLink(vi.fn(), onDelete));

    act(() => result.current.choose("link-1"));
    act(() => press("Delete"));

    expect(onDelete).toHaveBeenCalledWith("link-1");
  });

  it("hears no key at all while no link is chosen", () => {
    const onDelete = vi.fn();

    renderHook(() => useChosenLink(vi.fn(), onDelete));
    act(() => press("Backspace"));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
