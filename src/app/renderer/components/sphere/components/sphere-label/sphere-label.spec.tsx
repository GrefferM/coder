import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SphereLabel } from "./sphere-label";
import { SPHERE_LABEL_LIT_SUBTEXT_COLOR, SPHERE_STATUS_DOT_COLOR, SPHERE_INACTIVE_STATUS_DOT_COLOR } from "./constants";

describe("SphereLabel", () => {
  it("shows the given name and subtext", () => {
    const { container } = render(<SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" />);

    expect(container).toHaveTextContent("EDITOR");
    expect(container).toHaveTextContent("Claude Sonnet 4.5");
  });

  it("shows the name in the given accent color", () => {
    const { getByText } = render(<SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" />);

    expect(getByText("EDITOR")).toHaveStyle({
      color: "#38a3ff",
    });
  });

  it("draws a status dot next to the name once one is given", () => {
    const { container } = render(<SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" />);
    const dot = container.querySelector(".rounded-circle");

    expect(dot).toBeInTheDocument();
  });

  it("lights the status dot while the agent is switched on", () => {
    const { container } = render(<SphereLabel name="EDITOR" accentColor="#38a3ff" isActive />);
    const dot = container.querySelector(".rounded-circle");

    expect(dot).toHaveStyle({
      backgroundColor: SPHERE_STATUS_DOT_COLOR,
      boxShadow: `0 0 6px ${SPHERE_STATUS_DOT_COLOR}`,
    });
  });

  it("puts the status dot out while the agent is switched off", () => {
    const { container } = render(<SphereLabel name="EDITOR" accentColor="#4a5268" isActive={false} />);
    const dot = container.querySelector(".rounded-circle");

    expect(dot).toHaveStyle({
      backgroundColor: SPHERE_INACTIVE_STATUS_DOT_COLOR,
      boxShadow: "none",
    });
  });

  it("centres and uppercases its own text", () => {
    const { container } = render(<SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" />);

    expect(container.firstElementChild).toHaveClass("text-center", "text-uppercase", "font-monospace");
  });

  it("brightens the model line while the sphere is under the pointer", () => {
    const { getByText } = render(<SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" isLit />);

    expect(getByText("Claude Sonnet 4.5")).toHaveStyle({
      color: SPHERE_LABEL_LIT_SUBTEXT_COLOR,
    });
  });

  it("brightens it on a small canvas too, where the dim line would read as a smudge", () => {
    const { getByText } = render(
      <SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" isDrawnSmall />,
    );

    expect(getByText("Claude Sonnet 4.5")).toHaveStyle({
      color: SPHERE_LABEL_LIT_SUBTEXT_COLOR,
    });
  });

  it("leaves the name alone, since it was never dimmed", () => {
    const { getByText } = render(
      <SphereLabel name="EDITOR" subtext="Claude Sonnet 4.5" accentColor="#38a3ff" isDrawnSmall />,
    );

    expect(getByText("EDITOR")).toHaveStyle({
      color: "#38a3ff",
    });
  });
});
