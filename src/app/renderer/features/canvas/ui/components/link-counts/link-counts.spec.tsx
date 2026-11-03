import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkCounts } from "./link-counts";

describe("LinkCounts", () => {
  it("counts both directions, each in the form its number takes", () => {
    render(<LinkCounts outgoing={1} incoming={3} color="#6fd3d8" />);

    expect(screen.getByText("1 вихідний")).toBeInTheDocument();
    expect(screen.getByText("3 вхідні")).toBeInTheDocument();
  });

  it("leaves an empty direction unsaid rather than saying nought", () => {
    render(<LinkCounts outgoing={2} incoming={0} color="#6fd3d8" />);

    expect(screen.getByText("2 вихідні")).toBeInTheDocument();
    expect(screen.queryByText(/вхідн/u)).not.toBeInTheDocument();
  });

  it("draws the outgoing sample in the agent's own colour", () => {
    const { container } = render(<LinkCounts outgoing={1} incoming={1} color="#6fd3d8" />);
    const [outgoing] = Array.from(container.querySelectorAll("line"));

    expect(outgoing).toHaveAttribute("stroke", "#6fd3d8");
  });
});
