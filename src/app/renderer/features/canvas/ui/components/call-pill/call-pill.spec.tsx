import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CallPill } from "./call-pill";
import { CALL_PILL_GAP_PX } from "./constants";
import { SPHERE_ORB_RADIUS_PX, SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import { ARMED_COMMANDS_COLOR, ARMED_SERVERS_COLOR } from "../../../constants";

/** The style attribute reads colours back as `rgb(...)`; the constants are hexes. */
function rgb(hex: string): string {
  const [red, green, blue] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

  return `rgb(${red}, ${green}, ${blue})`;
}

describe("CallPill", () => {
  it("says what is being called, and says it once", () => {
    render(<CallPill name="run_test" source="command" />);

    expect(screen.getByText("run_test")).toBeInTheDocument();
  });

  it("says a server by the server's name, in the servers' own colour", () => {
    const { container } = render(<CallPill name="notion-mcp" source="mcp" />);
    const pill = container.firstElementChild as HTMLElement;

    expect(screen.getByText("notion-mcp")).toBeInTheDocument();
    expect(pill.style.color).toBe(rgb(ARMED_SERVERS_COLOR));
  });

  it("says a command in the commands' colour, and the two never wear one another's", () => {
    const { container } = render(<CallPill name="run_test" source="command" />);
    const pill = container.firstElementChild as HTMLElement;

    expect(pill.style.color).toBe(rgb(ARMED_COMMANDS_COLOR));
  });

  it("stands beside the sphere and level with the top of the arc, catching no pointer", () => {
    const { container } = render(<CallPill name="run_test" source="command" />);
    const pill = container.firstElementChild as HTMLElement;

    expect(pill.style.left).toBe(`${SPHERE_SIZE_PX + CALL_PILL_GAP_PX}px`);
    expect(pill.style.top).toBe(`${SPHERE_SIZE_PX / 2 - SPHERE_ORB_RADIUS_PX}px`);
    expect(pill.style.pointerEvents).toBe("none");
  });
});
