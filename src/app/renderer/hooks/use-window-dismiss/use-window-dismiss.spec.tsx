import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { isSomethingOpen, useWindowDismiss } from "./use-window-dismiss";

function Probe({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  useWindowDismiss(isOpen, onDismiss);

  return <button type="button">probe</button>;
}

/** A caller that goes on the press, behind something that keeps its own press and click to itself. */
function PressProbe({ onDismiss }: { onDismiss: () => void }) {
  useWindowDismiss(true, onDismiss, "press");

  return (
    <button type="button" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
      deaf
    </button>
  );
}

/** A note: it ends on the next click, and takes nothing of that click for itself. */
function NoteProbe({ onDismiss }: { onDismiss: () => void }) {
  useWindowDismiss(true, onDismiss, "click", false);

  return <button type="button">note</button>;
}

describe("useWindowDismiss", () => {
  it("counts what stands open, so the click past it can be spent on closing it", () => {
    const { unmount } = render(<Probe isOpen onDismiss={() => {}} />);

    expect(isSomethingOpen()).toBe(true);

    unmount();

    expect(isSomethingOpen()).toBe(false);
  });

  it("counts a note as nothing at all — the click that ends it still means what it means", async () => {
    const onDismiss = vi.fn();

    render(<NoteProbe onDismiss={onDismiss} />);

    expect(isSomethingOpen()).toBe(false);

    await userEvent.click(document.body);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("dismisses on a window click while open", async () => {
    const onDismiss = vi.fn();

    render(<Probe isOpen onDismiss={onDismiss} />);
    await userEvent.click(document.body);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("survives the click that opened the thing, which is still in flight while it subscribes", () => {
    const onDismiss = vi.fn();

    render(<Probe isOpen onDismiss={onDismiss} />);
    // Exactly what the opening click does once the effect has flushed: reach `window` synchronously.
    window.dispatchEvent(new MouseEvent("click"));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("hears nothing while closed", async () => {
    const onDismiss = vi.fn();

    render(<Probe isOpen={false} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText("probe"));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses on a press, before anything on the way can stop it", async () => {
    const onDismiss = vi.fn();

    render(<PressProbe onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText("deaf"));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("dismisses on the first click even when the caller passes a new function each render", async () => {
    const onDismiss = vi.fn();

    // An inline arrow plus state the click changes: React flushes both before the click reaches `window`.
    function Caller() {
      const [clicks, setClicks] = useState(0);

      useWindowDismiss(true, () => onDismiss(clicks));

      return (
        <button type="button" onClick={() => setClicks(clicks + 1)}>
          elsewhere
        </button>
      );
    }

    render(<Caller />);
    await userEvent.click(screen.getByText("elsewhere"));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
