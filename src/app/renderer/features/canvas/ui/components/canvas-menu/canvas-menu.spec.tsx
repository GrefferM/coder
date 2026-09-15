import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CanvasMenu } from "./canvas-menu";
import {
  CANVAS_ADD_AGENT_LABEL,
  CANVAS_ADD_LINK_LABEL,
  CANVAS_COPY_AGENT_LABEL,
  CANVAS_DELETE_AGENT_LABEL,
  CANVAS_DELETE_AGENT_SHORTCUT,
  CANVAS_PASTE_AGENT_LABEL,
} from "../../../constants";
import type { CanvasMenuProps } from "./interfaces";

const contentAt = {
  x: 220,
  y: 140,
};

function props(patch: Partial<CanvasMenuProps> = {}): CanvasMenuProps {
  return {
    at: {
      x: 300,
      y: 200,
    },
    contentAt,
    agentId: null,
    isPasteOffered: true,
    onAddAgent: vi.fn(),
    onPasteAgent: vi.fn(),
    onDrawLink: vi.fn(),
    onCopyAgent: vi.fn(),
    onDeleteAgent: vi.fn(),
    onDismiss: vi.fn(),
    ...patch,
  };
}

describe("CanvasMenu", () => {
  it("is the canvas's own menu where the click fell on nothing", () => {
    // Nothing was clicked, so nothing about an agent can be done.
    render(<CanvasMenu {...props()} />);

    expect(screen.getByText(CANVAS_ADD_AGENT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CANVAS_PASTE_AGENT_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(CANVAS_DELETE_AGENT_LABEL)).not.toBeInTheDocument();
  });

  it("is the sphere's own menu where the click fell on one", () => {
    // The sphere is what was clicked, so adding another agent is not what is offered.
    render(
      <CanvasMenu
        {...props({
          agentId: "agent-1",
        })}
      />,
    );

    expect(screen.getByText(CANVAS_ADD_LINK_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CANVAS_COPY_AGENT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CANVAS_DELETE_AGENT_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(CANVAS_ADD_AGENT_LABEL)).not.toBeInTheDocument();
  });

  it("puts the new agent where the menu was opened, not where the menu itself stands", async () => {
    // The sphere lands exactly where the person clicked, and the two points differ.
    const said = props();

    render(<CanvasMenu {...said} />);
    await userEvent.click(screen.getByText(CANVAS_ADD_AGENT_LABEL));

    expect(said.onAddAgent).toHaveBeenCalledWith(contentAt);
    expect(said.onDismiss).toHaveBeenCalledOnce();
  });

  it("dims the paste where there is no copy to put down", async () => {
    const said = props({
      isPasteOffered: false,
    });

    render(<CanvasMenu {...said} />);

    const paste = screen.getByText(CANVAS_PASTE_AGENT_LABEL).closest("button");

    expect(paste).toBeDisabled();

    await userEvent.click(screen.getByText(CANVAS_PASTE_AGENT_LABEL));

    expect(said.onPasteAgent).not.toHaveBeenCalled();
  });

  it("prints the keystroke each act also answers to", () => {
    render(
      <CanvasMenu
        {...props({
          agentId: "agent-1",
        })}
      />,
    );

    expect(screen.getByText(CANVAS_DELETE_AGENT_SHORTCUT)).toBeInTheDocument();
  });

  it("hands the sphere's own acts its id, and closes after each", async () => {
    const said = props({
      agentId: "agent-1",
    });

    render(<CanvasMenu {...said} />);
    await userEvent.click(screen.getByText(CANVAS_COPY_AGENT_LABEL));

    expect(said.onCopyAgent).toHaveBeenCalledWith("agent-1");
    expect(said.onDismiss).toHaveBeenCalledOnce();
  });
});
