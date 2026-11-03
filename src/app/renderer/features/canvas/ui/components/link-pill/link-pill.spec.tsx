import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LinkPill } from "./link-pill";
import { LINK_PILL_DELETE_LABEL } from "./constants";
import type { Agent } from "../../../../../interfaces";
import { anAgent } from "../../../../../testing";

function agent(id: string, name: string, color: string): Agent {
  return anAgent({
    id,
    name,
    color,
    x: 0,
    y: 0,
  });
}

const from = agent("agent-1", "Шукач", "#6fd3d8");
const to = agent("agent-2", "Перелікар", "#e8c46a");
const at = {
  x: 120,
  y: 80,
};

describe("LinkPill", () => {
  it("says which way the line runs, each end in its own agent's colour", () => {
    render(<LinkPill from={from} to={to} at={at} onDelete={() => {}} />);

    expect(screen.getByText("Шукач")).toHaveStyle({
      color: "#6fd3d8",
    });
    expect(screen.getByText("Перелікар")).toHaveStyle({
      color: "#e8c46a",
    });
  });

  it("prints the keystroke the canvas listens for, so both ways of deleting are one", () => {
    render(<LinkPill from={from} to={to} at={at} onDelete={() => {}} />);

    expect(
      screen.getByText(LINK_PILL_DELETE_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("deletes the line on a press", async () => {
    const onDelete = vi.fn();

    render(<LinkPill from={from} to={to} at={at} onDelete={onDelete} />);
    await userEvent.click(
      screen.getByText(LINK_PILL_DELETE_LABEL, {
        exact: false,
      }),
    );

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("keeps its own press to itself, the canvas behind it clearing the choice on a click", async () => {
    const onCanvas = vi.fn();

    render(
      <div role="presentation" onClick={onCanvas}>
        <LinkPill from={from} to={to} at={at} onDelete={() => {}} />
      </div>,
    );
    await userEvent.click(screen.getByText("Шукач"));

    expect(onCanvas).not.toHaveBeenCalled();
  });
});
