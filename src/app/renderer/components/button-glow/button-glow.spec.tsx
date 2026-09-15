import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonGlow } from "./button-glow";
import { GLOW_PARTICLE_COUNT } from "./constants";

describe("ButtonGlow", () => {
  it("draws one traveling particle per GLOW_PARTICLE_COUNT", () => {
    const { container } = render(<ButtonGlow width={32} height={32} borderRadius={10} isVisible={false} />);

    expect(container.querySelectorAll("circle")).toHaveLength(GLOW_PARTICLE_COUNT);
  });

  it("stays transparent until its own button is pointed at", () => {
    const { container } = render(<ButtonGlow width={32} height={32} borderRadius={10} isVisible={false} />);

    expect(container.querySelector("svg")).toHaveStyle({
      opacity: 0,
    });
  });

  it("fades in once its own button is pointed at", () => {
    const { container } = render(<ButtonGlow width={32} height={32} borderRadius={10} isVisible />);

    expect(container.querySelector("svg")).toHaveStyle({
      opacity: 1,
    });
  });
});
