import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHint } from "./use-hint";
import { HINT_DELAY_MS, HINT_NEIGHBOUR_MS } from "../../constants";
import { useInteraction } from "../../../../hooks";

function Standing({ text = "Забути прогін" }: { text?: string }) {
  const { isLit, isFocused, handlers } = useInteraction();
  const said = useHint<HTMLButtonElement>(text, isLit, isFocused);

  return (
    <button ref={said.ref} type="button" {...handlers}>
      ✕{said.hint}
    </button>
  );
}

/** The waiting is the point of the thing, so the clock is ours. */
beforeEach(() => {
  vi.useFakeTimers();
  // The neighbour window is app-wide; clears it so one test does not inherit another's.
  vi.advanceTimersByTime(HINT_NEIGHBOUR_MS * 10);
});

afterEach(() => {
  vi.useRealTimers();
});

const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("useHint", () => {
  it("waits under the cursor before it says anything", () => {
    render(<Standing />);
    fireEvent.mouseEnter(screen.getByRole("button"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    wait(HINT_DELAY_MS);

    expect(screen.getByRole("tooltip")).toHaveTextContent("Забути прогін");
  });

  it("goes at once when the cursor leaves", () => {
    render(<Standing />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    wait(HINT_DELAY_MS);
    fireEvent.mouseLeave(screen.getByRole("button"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("says nothing at all where there is nothing to say", () => {
    render(<Standing text="" />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    wait(HINT_DELAY_MS);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("the first movement of the canvas puts it away, and it does not come back on its own", () => {
    render(<Standing />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    wait(HINT_DELAY_MS);

    act(() => {
      window.dispatchEvent(new Event("wheel"));
    });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // The cursor never left, so waiting alone does not bring it back.
    wait(HINT_DELAY_MS * 3);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("comes back once the cursor has left and returned", () => {
    render(<Standing />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    wait(HINT_DELAY_MS);

    act(() => {
      window.dispatchEvent(new Event("wheel"));
    });

    fireEvent.mouseLeave(screen.getByRole("button"));
    // Longer than the neighbour window, so an arrival, not a row being read.
    wait(HINT_NEIGHBOUR_MS * 2);
    fireEvent.mouseEnter(screen.getByRole("button"));
    wait(HINT_DELAY_MS);

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
