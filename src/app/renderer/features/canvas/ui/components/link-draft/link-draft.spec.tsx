import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkDraft } from "./link-draft";
import { LINK_DIRECTION_ARROW, LINK_DRAFT_CANCELLED_LABEL, LINK_DRAFT_DASH, LINK_DRAFT_HINT } from "../../../constants";
import type { Agent } from "../../../../../interfaces";
import { anAgent } from "../../../../../testing";

function agent(id: string, name: string, color: string): Agent {
  return anAgent({
    id,
    name,
    color,
  });
}

const from = agent("agent-1", "Шукач", "#6fd3d8");
const target = agent("agent-2", "Перелікар", "#e8c46a");
const at = {
  x: 260,
  y: 180,
};

describe("LinkDraft", () => {
  it("over empty canvas says what to do with the line, and draws it dashed", () => {
    // With no target yet, the line is a question, not a statement.
    const { container } = render(<LinkDraft from={from} at={at} />);

    expect(screen.getByText(LINK_DRAFT_HINT)).toBeInTheDocument();
    // The first line is the glow; the line itself is the second.
    expect(container.querySelectorAll("line")[1]).toHaveAttribute("stroke-dasharray", LINK_DRAFT_DASH);
  });

  it("over a sphere names both ends in order and puts an arrow on the line", () => {
    // The line now says exactly what letting go would make.
    const { container } = render(<LinkDraft from={from} at={at} target={target} />);

    expect(screen.getByText(`Шукач${LINK_DIRECTION_ARROW}Перелікар`)).toBeInTheDocument();
    expect(container.querySelector("polygon")).not.toBeNull();
    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();
  });

  it("wears the drawing agent's own colour, the line being its outgoing one", () => {
    const { container } = render(<LinkDraft from={from} at={at} target={target} />);

    expect(container.querySelector("polygon")).toHaveAttribute("fill", "#6fd3d8");
  });

  it("let go over nothing, it is crossed out and says so while it fades", () => {
    // A cancelled line does not just vanish.
    const { container } = render(<LinkDraft from={from} at={at} isCancelled />);

    expect(screen.getByText(LINK_DRAFT_CANCELLED_LABEL)).toBeInTheDocument();
    expect(container.querySelector("path")).not.toBeNull();
    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();
  });
});
