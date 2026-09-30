import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWayOut } from "./use-way-out";
import type { UnsavedWork } from "../../interfaces";

function work(patch: Partial<UnsavedWork> = {}): UnsavedWork {
  return {
    name: "ТЕЗАР",
    changes: [],
    blocked: [],
    blockedNote: null,
    save: vi.fn(async () => undefined),
    discard: vi.fn(),
    ...patch,
  };
}

function gate(unsaved: UnsavedWork | null = null) {
  const wayOut = vi.fn();
  const rendered = renderHook(({ held }: { held: UnsavedWork | null }) => useWayOut(held), {
    initialProps: {
      held: unsaved,
    },
  });

  return {
    ...rendered,
    wayOut,
  };
}

describe("useWayOut", () => {
  it("lets a way out through when there is nothing unsaved to ask about", () => {
    const { result, wayOut } = gate();

    act(() => result.current.guard(wayOut));

    expect(wayOut).toHaveBeenCalled();
    expect(result.current.isHeld).toBe(false);
  });

  it("holds the way out and asks, when a draft is unsaved", () => {
    // Every way out of a panel passes this gate, «Скасувати» included.
    const { result, wayOut } = gate(work());

    act(() => result.current.guard(wayOut, "drop"));

    expect(wayOut).not.toHaveBeenCalled();
    expect(result.current.isHeld).toBe(true);
    expect(result.current.ask).toBe("drop");
  });

  it("writes the work and then takes the way out", async () => {
    const unsaved = work();
    const { result, wayOut } = gate(unsaved);

    act(() => result.current.guard(wayOut));
    await act(() => result.current.saveAndLeave());

    expect(unsaved.save).toHaveBeenCalled();
    expect(wayOut).toHaveBeenCalled();
    expect(result.current.isHeld).toBe(false);
  });

  it("neither writes nor leaves while something in the draft blocks the write", async () => {
    // A draft that cannot be written is not written by a way out either.
    const unsaved = work({
      blocked: ["maxCalls"],
    });
    const { result, wayOut } = gate(unsaved);

    act(() => result.current.guard(wayOut));
    await act(() => result.current.saveAndLeave());

    expect(unsaved.save).not.toHaveBeenCalled();
    expect(wayOut).not.toHaveBeenCalled();
    expect(result.current.isHeld).toBe(true);
  });

  it("lets the work go and takes the way out on «не зберігати»", () => {
    const unsaved = work();
    const { result, wayOut } = gate(unsaved);

    act(() => result.current.guard(wayOut));
    act(() => result.current.discardAndLeave());

    expect(unsaved.discard).toHaveBeenCalled();
    expect(wayOut).toHaveBeenCalled();
    expect(unsaved.save).not.toHaveBeenCalled();
  });

  it("drops the way out and moves nothing else on «лишитись тут»", () => {
    const unsaved = work();
    const { result, wayOut } = gate(unsaved);

    act(() => result.current.guard(wayOut));
    act(() => result.current.stay());

    expect(result.current.isHeld).toBe(false);
    expect(wayOut).not.toHaveBeenCalled();
    expect(unsaved.save).not.toHaveBeenCalled();
    expect(unsaved.discard).not.toHaveBeenCalled();
  });

  it("stands no question once there is nothing unsaved to ask about", () => {
    // The draft was written or dropped elsewhere while the question stood: nothing left to ask.
    const { result, rerender, wayOut } = gate(work());

    act(() => result.current.guard(wayOut));

    expect(result.current.isHeld).toBe(true);

    rerender({
      held: null,
    });

    expect(result.current.isHeld).toBe(false);
  });
});
