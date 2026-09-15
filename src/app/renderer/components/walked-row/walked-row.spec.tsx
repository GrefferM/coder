import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalkedRow } from "./walked-row";
import type { ListWalk } from "../../hooks";

function walkStanding(walked: number, walkTo = vi.fn()): ListWalk {
  return {
    walked,
    walkTo,
    walkedRow: vi.fn(),
    onKeyDown: vi.fn(),
  };
}

/** The ring is the last thing the row draws, over everything under it. */
function ringOf(name: string): string {
  return (screen.getByText(name).parentElement?.lastElementChild as HTMLElement).style.boxShadow;
}

describe("WalkedRow", () => {
  it("wears the ring where the walk stands, and nothing where it does not", () => {
    render(
      <>
        <WalkedRow walk={walkStanding(1)} index={0} borderRadius={8}>
          <button type="button">EDITOR</button>
        </WalkedRow>
        <WalkedRow walk={walkStanding(1)} index={1} borderRadius={8}>
          <button type="button">TESTER</button>
        </WalkedRow>
      </>,
    );

    expect(ringOf("EDITOR")).toBe("");
    expect(ringOf("TESTER")).not.toBe("");
  });

  it("takes the walk to itself when the pointer comes over it", () => {
    const walkTo = vi.fn();

    render(
      <WalkedRow walk={walkStanding(0, walkTo)} index={3} borderRadius={8}>
        <button type="button">EDITOR</button>
      </WalkedRow>,
    );

    fireEvent.mouseEnter(screen.getByText("EDITOR").parentElement as HTMLElement);

    expect(walkTo).toHaveBeenCalledWith(3);
  });
});
