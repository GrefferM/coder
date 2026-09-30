import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sphere } from "./sphere";
import {
  SPHERE_AMBIENT_GLOW_PERCENT,
  SPHERE_BREATHE_CYCLE_MS,
  SPHERE_HOVER_RING_PERCENT,
  SPHERE_HOVER_RING_SIZE_PX,
  SPHERE_INACTIVE_ACCENT_COLOR,
  SPHERE_GRID_LINE_COUNT,
  SPHERE_SELECTED_AMBIENT_GLOW_PERCENT,
  SPHERE_SELECTED_UNLIT_AMBIENT_GLOW_PERCENT,
  SPHERE_SIZE_PX,
  SPHERE_TILT_DEGREES,
  SPHERE_UNLIT_AMBIENT_GLOW_COLOR,
} from "./constants";
import { sphereGridLines } from "../../utils/math";
import { mixWithTransparent } from "../../utils/colors";

const AGENT_COLOR = "#38a3ff";
/** jsdom writes a colour back inside the `border` shorthand as `rgb()`. */
const AGENT_COLOR_AS_RGB = "rgb(56, 163, 255)";

/** The ambient glow is the box directly behind the sphere's own SVG. */
function ambientGlow(container: HTMLElement) {
  return container.querySelector("svg")?.previousElementSibling;
}

function renderSphere(overrides: Partial<Parameters<typeof Sphere>[0]> = {}) {
  return render(
    <Sphere
      name="EDITOR"
      modelTitle="Claude Sonnet 4.5"
      color={AGENT_COLOR}
      isActive
      isSelected={false}
      onSelect={() => {}}
      {...overrides}
    />,
  );
}

describe("Sphere", () => {
  it("sizes its own SVG to the sphere's diameter", () => {
    const { container } = renderSphere();
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", String(SPHERE_SIZE_PX));
    expect(svg).toHaveAttribute("height", String(SPHERE_SIZE_PX));
  });

  it("draws the agent's name and its model beneath the sphere", () => {
    renderSphere();

    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText("Claude Sonnet 4.5")).toBeInTheDocument();
  });

  it("breathes a halo for the agent a question would go to, and moves nothing else", () => {
    const { container } = renderSphere({
      isAimed: true,
    });
    const breathing = container.querySelector(".sphere-breathe");

    // Only the glow breathes; the sphere and its grid stand still.
    expect(breathing).toBeInTheDocument();
    expect(breathing).toHaveStyle({
      animationDuration: `${SPHERE_BREATHE_CYCLE_MS}ms`,
    });
  });

  it("breathes for nobody by default, and never for an agent that is switched off", () => {
    const { container } = renderSphere();

    expect(container.querySelector(".sphere-breathe")).not.toBeInTheDocument();

    const off = renderSphere({
      isAimed: true,
      isActive: false,
    });

    expect(off.container.querySelector(".sphere-breathe")).not.toBeInTheDocument();
  });

  it("draws the grid twice — blurred for the glow, crisp on top", () => {
    const { container } = renderSphere();
    const groups = container.querySelectorAll("g");

    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute("filter", "url(#sphere-glow)");
    expect(groups[1]).not.toHaveAttribute("filter");
  });

  it("draws a path for every meridian and parallel the geometry produces", () => {
    const { container } = renderSphere();
    const lines = sphereGridLines(SPHERE_GRID_LINE_COUNT, SPHERE_SIZE_PX / 2, SPHERE_TILT_DEGREES);

    expect(container.querySelectorAll("g")[1].querySelectorAll("path")).toHaveLength(lines.length);
  });

  it("draws the grid in the agent's own color", () => {
    const { container } = renderSphere();

    expect(container.querySelectorAll("g")[1]).toHaveAttribute("stroke", AGENT_COLOR);
  });

  it("drops a switched-off agent to a neutral and stops glowing it", () => {
    const { container } = renderSphere({
      isActive: false,
    });

    expect(container.querySelectorAll("g")[1]).toHaveAttribute("stroke", SPHERE_INACTIVE_ACCENT_COLOR);
    expect(ambientGlow(container)).toHaveStyle({
      backgroundImage: `radial-gradient(circle, ${SPHERE_UNLIT_AMBIENT_GLOW_COLOR} 0%, transparent 70%)`,
    });
  });

  it("lights the space around a running agent with its own color", () => {
    const { container } = renderSphere();

    expect(ambientGlow(container)).toHaveStyle({
      backgroundImage: `radial-gradient(circle, ${mixWithTransparent(AGENT_COLOR, SPHERE_AMBIENT_GLOW_PERCENT)} 0%, transparent 70%)`,
    });
  });

  it("turns the glow up while selected", () => {
    const { container } = renderSphere({
      isSelected: true,
    });

    expect(ambientGlow(container)).toHaveStyle({
      backgroundImage: `radial-gradient(circle, ${mixWithTransparent(AGENT_COLOR, SPHERE_SELECTED_AMBIENT_GLOW_PERCENT)} 0%, transparent 70%)`,
    });
  });

  it("glows a selected switched-off agent in the neutral, so being picked out never reads as running", () => {
    const { container } = renderSphere({
      isActive: false,
      isSelected: true,
    });

    expect(ambientGlow(container)).toHaveStyle({
      backgroundImage: `radial-gradient(circle, ${mixWithTransparent(SPHERE_INACTIVE_ACCENT_COLOR, SPHERE_SELECTED_UNLIT_AMBIENT_GLOW_PERCENT)} 0%, transparent 70%)`,
    });
  });

  it("reports being clicked, without letting the canvas behind it see the click", async () => {
    const onSelect = vi.fn();
    const onCanvasClick = vi.fn();

    render(
      <div onClick={onCanvasClick} role="presentation">
        <Sphere name="EDITOR" color={AGENT_COLOR} isActive isSelected={false} onSelect={onSelect} />
      </div>,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onCanvasClick).not.toHaveBeenCalled();
  });

  it("rings itself under the pointer, and drops the ring once the pointer leaves", async () => {
    const { container } = renderSphere();
    const sphere = screen.getByRole("button", {
      name: "EDITOR",
    });

    function hoverRing() {
      return [...container.querySelectorAll("div")].find(
        (box) => box.style.width === `${SPHERE_HOVER_RING_SIZE_PX}px` && box.style.border !== "",
      );
    }

    expect(hoverRing()).toBeUndefined();

    await userEvent.hover(sphere);

    expect(hoverRing()?.style.border).toBe(
      `1px solid ${mixWithTransparent(AGENT_COLOR_AS_RGB, SPHERE_HOVER_RING_PERCENT)}`,
    );

    await userEvent.unhover(sphere);

    expect(hoverRing()).toBeUndefined();
  });

  it("tells assistive tech whether it is the selected one", () => {
    renderSphere({
      isSelected: true,
    });

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps its label whatever the canvas is drawn at: nothing under a sphere disappears", () => {
    render(
      <Sphere
        name="EDITOR"
        modelTitle="Claude Sonnet 4.5"
        color="#b18aff"
        isActive
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText("Claude Sonnet 4.5")).toBeInTheDocument();
  });

  it("is exactly its own circle, so its saved point is the wireframe's centre", () => {
    render(
      <Sphere
        name="EDITOR"
        modelTitle="Claude Sonnet 4.5"
        color="#b18aff"
        isActive
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const sphere = screen.getByRole("button", {
      name: "EDITOR",
    });

    expect(sphere).toHaveStyle({
      width: `${SPHERE_SIZE_PX}px`,
      height: `${SPHERE_SIZE_PX}px`,
    });
    // The label hangs below the box, not inside it.
    expect(sphere.querySelector("div[style*='position: absolute'][style*='top: 100%']")).toBeInTheDocument();
  });
});
