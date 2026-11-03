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
    // A window opened by a resting pointer must not pull focus out of a field being typed in.
    list();

    expect(document.activeElement).toBe(document.body);
  });

  it("says when it holds the hand, so leaving the mark does not snatch it away mid-reach", async () => {
    // Opens on the pointer resting on the «+»; the way into it crosses the gap above the mark.
    const { onHold } = list();

    await userEvent.hover(screen.getByRole("listbox"));

    expect(onHold).toHaveBeenLastCalledWith(true);

    await userEvent.unhover(screen.getByRole("listbox"));

    expect(onHold).toHaveBeenLastCalledWith(false);
  });

  it("does not count itself among the things standing over the app, so Escape stays the panel's", () => {
    // Escape is left to the side panel; a pointer-raised window must not swallow it.
    list();

    expect(isSomethingOpen()).toBe(false);
  });
});
