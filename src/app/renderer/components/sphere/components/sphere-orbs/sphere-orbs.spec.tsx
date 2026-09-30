import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SphereOrbs } from "./sphere-orbs";
import { SPHERE_ORB_RADIUS_PX, SPHERE_ORB_SIZE_PX, SPHERE_SIZE_PX } from "../../constants";
import type { SphereOrb } from "./interfaces";

const COLOR = "#e8c46a";

function orb(more: string | null = null, group: string | null = "commands"): SphereOrb {
  return {
    color: COLOR,
    group,
    // The id of the grant behind the mark; a server's mark and the grey rest stand for no single grant.
    grantId: null,
    more,
    // A globe unless a test says otherwise — the shape is the source's kind, and most of these are servers.
    source: "mcp",
  };
}

describe("SphereOrbs", () => {
  it("draws nothing at all where the agent is armed with nothing", () => {
    const { container } = render(<SphereOrbs orbs={[]} />);

    expect(container.querySelector("svg")).toBeNull();
  });

  it("draws a command as a square with a prompt in it, and a server as the globe", () => {
    // The shape says where a tool came from, and it says it without a word being written.
    const { container } = render(
      <SphereOrbs
        orbs={[
          {
            ...orb(),
            source: "command",
          },
          orb(),
        ]}
      />,
    );

    expect(container.querySelectorAll("rect")).toHaveLength(1);
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    // The prompt is drawn inside the square and nowhere else, so one path is one command.
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });

  it("stands one mini-sphere per place, each in its source's colour", () => {
    const { container } = render(<SphereOrbs orbs={[orb(), orb(), orb()]} />);

    // The colour is the source's and never the agent's, so four tools from two places are seen at once.
    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(container.querySelectorAll(`[stroke="${COLOR}"]`).length).toBeGreaterThan(0);
  });

  it("puts a single one at the top of the sphere", () => {
    const { container } = render(<SphereOrbs orbs={[orb()]} />);
    const only = container.firstElementChild as HTMLElement;

    // The arc opens around the top, so one alone stands where the arc's middle would be.
    expect(only.style.left).toBe(`${SPHERE_SIZE_PX / 2 - SPHERE_ORB_SIZE_PX / 2}px`);
    expect(only.style.top).toBe(`${SPHERE_SIZE_PX / 2 - SPHERE_ORB_RADIUS_PX - SPHERE_ORB_SIZE_PX / 2}px`);
  });

  it("opens the arc over the top and never below the sphere's middle", () => {
    const { container } = render(
      <SphereOrbs
        orbs={Array.from(
          {
            length: 7,
          },
          () => orb(),
        )}
      />,
    );
    const tops = [...container.children].map((one) => Number.parseFloat((one as HTMLElement).style.top));

    // The top arc leaves the bottom of the sphere to the label and its sides to the links.
    expect(Math.max(...tops)).toBeLessThan(SPHERE_SIZE_PX / 2);
  });

  it("says the count on the grey one, and on no other", () => {
    const { container } = render(<SphereOrbs orbs={[orb(), orb("+12")]} />);

    expect(container.textContent).toBe("+12");
  });

  it("wears no glow and no fill: it is a seventh of a sphere, not a small agent", () => {
    const { container } = render(<SphereOrbs orbs={[orb()]} />);
    const only = container.firstElementChild as HTMLElement;

    expect(only.style.boxShadow).toBe("");
    expect(only.style.width).toBe(`${SPHERE_ORB_SIZE_PX}px`);
  });

  it("draws a «+» as its порода's own shape, dashed and dimmed, with the number inside", () => {
    // The «+» wears the shape and colour of what it folds — the grey one is gone, because two identical
    // grey ones side by side read as a single heap. The wire inside a mark says «a source», and a heap is not one.
    const { container } = render(
      <SphereOrbs
        orbs={[
          {
            ...orb("+5"),
            source: "command",
          },
          orb("+3"),
        ]}
      />,
    );

    // A command's «+» is the bare square without the prompt inside it; a server's is the bare circle without rings.
    expect(container.querySelectorAll("path")).toHaveLength(0);
    expect(container.querySelectorAll("ellipse")).toHaveLength(0);
    expect(container.querySelectorAll("[stroke-dasharray]")).toHaveLength(2);
    expect(container.textContent).toBe("+5+3");
  });

  it("stands every mini-sphere at one size, whatever the agent is doing", () => {
    // A call moves nothing here — no swelling, no fill, no glow, and no name of its own. What
    // the canvas says about a call is one pill beside the sphere, and that pill is the canvas's own.
    const { container } = render(<SphereOrbs orbs={[orb(), orb()]} />);
    const [one, other] = [...container.children] as HTMLElement[];

    expect(one.style.width).toBe(`${SPHERE_ORB_SIZE_PX}px`);
    expect(other.style.width).toBe(`${SPHERE_ORB_SIZE_PX}px`);
    expect(one.style.boxShadow).toBe("");
    expect(other.style.boxShadow).toBe("");
    expect(container.textContent).toBe("");
  });

  it("hands back the very mark that was pressed, and the mark's own button with it", async () => {
    // A window opened from a mark is bound to that mark and stands over it, so the press hands the
    // button itself — the window takes its place on the screen from it — and the mark rather than a name of it.
    const pressed: (string | null)[] = [];
    const buttons: HTMLElement[] = [];

    render(
      <SphereOrbs
        orbs={[orb(null, "commands"), orb("+12", null)]}
        onPress={(orbPressed, at) => {
          pressed.push(orbPressed.group);
          buttons.push(at);
        }}
      />,
    );

    const targets = screen.getAllByRole("button");

    await userEvent.click(targets[0]);
    await userEvent.click(targets[1]);

    expect(pressed).toEqual(["commands", null]);
    expect(buttons.map((held) => held.tagName)).toEqual(["BUTTON", "BUTTON"]);
  });

  it("holds its target at 26 px on the screen while the drawing shrinks with the canvas", () => {
    const { container } = render(<SphereOrbs orbs={[orb()]} scale={0.5} onPress={() => {}} />);
    const target = container.querySelector("button") as HTMLElement;

    // The layer is scaled by half, so 52 canvas pixels are 26 on the screen — the same 26 as at full.
    expect(target.style.width).toBe("52px");
    expect(target.style.height).toBe("52px");
  });

  it("offers nothing to press where nobody is listening", () => {
    render(<SphereOrbs orbs={[orb()]} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
