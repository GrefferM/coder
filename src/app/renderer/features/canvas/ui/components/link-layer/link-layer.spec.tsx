import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LinkLayer } from "./link-layer";
import { CANVAS_LINK_DOOMED_OPACITY, CANVAS_LINK_HIT_WIDTH } from "../../../constants";
import type { Agent, Link } from "../../../../../interfaces";
import type { LinkLayerProps } from "./interfaces";
import { aLink, anAgent } from "../../../../../testing";

function agent(id: string, x: number, color: string): Agent {
  return anAgent({
    id,
    name: id,
    color,
    x,
  });
}

const seeker = agent("agent-1", 100, "#6fd3d8");
const teller = agent("agent-2", 400, "#e8c46a");

const link: Link = aLink({});

function props(patch: Partial<LinkLayerProps> = {}): LinkLayerProps {
  return {
    links: [link],
    linkLives: {},
    agents: [seeker, teller],
    selectedAgentId: null,
    selectedLinkId: null,
    doomedAgentId: null,
    onSelectLink: vi.fn(),
    ...patch,
  };
}

describe("LinkLayer", () => {
  it("draws a line for every link that has both its ends", () => {
    const { container } = render(<LinkLayer {...props()} />);

    expect(container.querySelectorAll("g")).toHaveLength(1);
  });

  it("draws nothing for a link whose end is not among the agents", () => {
    // A line to nowhere would be drawn from the origin, which reads as a real line to a reader.
    const { container } = render(
      <LinkLayer
        {...props({
          links: [
            link,
            aLink({
              id: "link-2",
              to: "gone",
            }),
          ],
        })}
      />,
    );

    expect(container.querySelectorAll("g")).toHaveLength(1);
  });

  it("takes the dragged sphere's place while it is dragged, so the line follows it", () => {
    const { container } = render(<LinkLayer {...props()} />);
    const atRest = container.querySelector("line")?.getAttribute("x2");

    const { container: moved } = render(
      <LinkLayer
        {...props({
          draggedAgentId: "agent-2",
          draggedAt: {
            x: 700,
            y: 300,
          },
        })}
      />,
    );

    expect(moved.querySelector("line")?.getAttribute("x2")).not.toBe(atRest);
  });

  it("dims a line whose end is being asked about, since it goes with the agent", () => {
    // The question is about the agent, and its lines are what the answer would also take.
    const { container } = render(
      <LinkLayer
        {...props({
          doomedAgentId: "agent-2",
        })}
      />,
    );

    expect(container.querySelector("g")).toHaveAttribute("opacity", String(CANVAS_LINK_DOOMED_OPACITY));
  });

  it("takes the selected link's own click and keeps it from the canvas behind", async () => {
    const said = props();

    render(<LinkLayer {...said} />);

    const hit = Array.from(document.querySelectorAll("line")).find(
      (line) => line.getAttribute("stroke-width") === String(CANVAS_LINK_HIT_WIDTH),
    );

    await userEvent.click(hit as Element);

    expect(said.onSelectLink).toHaveBeenCalledWith("link-1");
  });

  it("marks the chosen link with a handle at its middle", () => {
    // The pill stands over the handle, so the line says where it was taken hold of.
    const { container, rerender } = render(<LinkLayer {...props()} />);

    expect(container.querySelector("rect")).toBeNull();

    rerender(
      <LinkLayer
        {...props({
          selectedLinkId: "link-1",
        })}
      />,
    );

    expect(container.querySelector("rect")).not.toBeNull();
  });

  it("paints a line of the walk in its source's colour, and a silent one in neither's", () => {
    // A coloured line is work flowing from the agent that colour belongs to.
    const { container, rerender } = render(
      <LinkLayer
        {...props({
          linkLives: {
            "link-1": "running",
          },
        })}
      />,
    );
    const drift = () => Array.from(container.querySelectorAll("line"))[1];

    expect(drift().getAttribute("stroke")).toBe("#6fd3d8");

    rerender(
      <LinkLayer
        {...props({
          linkLives: {
            "link-1": "silent",
          },
        })}
      />,
    );

    expect(drift().getAttribute("stroke")).not.toBe("#6fd3d8");
  });
});
