import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MarkWindow } from "./mark-window";
import { isSomethingOpen } from "../../../../../hooks";
import type { ArmedMarkRow } from "../../../interfaces";

const ROWS: ArmedMarkRow[] = [
  {
    group: "server:notion",
    grantId: null,
    name: "notion-mcp",
    color: "#ddd0a6",
    isBroken: false,
  },
  {
    group: "server:slack",
    grantId: null,
    name: "slack-mcp",
    color: "#ddd0a6",
    isBroken: false,
  },
  {
    group: "server:filesystem",
    grantId: null,
    name: "filesystem-mcp",
    color: "#ddd0a6",
    isBroken: false,
  },
];

function box(): DOMRect {
  return {
    left: 400,
    top: 300,
    right: 426,
    bottom: 326,
    width: 26,
    height: 26,
    x: 400,
    y: 300,
    toJSON: () => ({}),
  };
}

function list(rows: ArmedMarkRow[] = ROWS, head = "ЩЕ 3 СЕРВЕРИ") {
  const onOpen = vi.fn();
  const onDismiss = vi.fn();
  const onHold = vi.fn();

  render(<MarkWindow at={box()} head={head} rows={rows} onOpen={onOpen} onDismiss={onDismiss} onHold={onHold} />);

  return {
    onOpen,
    onDismiss,
    onHold,
  };
}

describe("MarkWindow", () => {
  it("says what the «+» hides, and every line by its own name alone", () => {
    // Only what is folded — the two standing on the arc are already at hand. And only the name: a name
    // cut short so a number could stand beside it says less than a name with no number at all.
    list();

    expect(screen.getByText("ЩЕ 3 СЕРВЕРИ")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByText("notion-mcp")).toBeInTheDocument();
  });

  it("leads where the mark would have led, and hands back the line by its own id", async () => {
    const { onOpen } = list();

    await userEvent.click(
      screen.getByRole("option", {
        name: /slack-mcp/,
      }),
    );

    expect(onOpen).toHaveBeenCalledWith(ROWS[1]);
  });

  it("never takes the focus off whatever the keyboard was in", () => {
    // The canvas answers the hand. A window that opened because the pointer rested somewhere must not pull the
    // focus out of the field somebody was typing in.
    list();

    expect(document.activeElement).toBe(document.body);
  });

  it("says when it holds the hand, so leaving the mark does not snatch it away mid-reach", async () => {
    // The window opens on the pointer resting on the «+», and the way into it is across the gap above that mark.
    const { onHold } = list();

    await userEvent.hover(screen.getByRole("listbox"));

    expect(onHold).toHaveBeenLastCalledWith(true);

    await userEvent.unhover(screen.getByRole("listbox"));

    expect(onHold).toHaveBeenLastCalledWith(false);
  });

  it("does not count itself among the things standing over the app, so Escape stays the panel's", () => {
    // Escape has one word on this page — it puts the side panel away. A hint raised by the pointer alone does not
    // get to swallow it: nobody asked for this window, and nobody should have to dismiss it to be heard.
    list();

    expect(isSomethingOpen()).toBe(false);
  });
});
