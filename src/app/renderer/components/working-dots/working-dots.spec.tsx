import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkingDots } from "./working-dots";
import { WORKING_DOTS_CYCLE_MS, WORKING_DOTS_STEP_MS } from "./constants";

describe("WorkingDots", () => {
  it("is three dots of one colour", () => {
    const { container } = render(<WorkingDots color="#b18aff" size={5} />);

    const dots = container.querySelectorAll(".work-dot");

    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveStyle({
      width: "5px",
      height: "5px",
      background: "#b18aff",
    });
  });

  it("runs each dot on its own delay, at one cycle", () => {
    const { container } = render(<WorkingDots color="#4ade80" size={4} />);

    const delays = Array.from(container.querySelectorAll(".work-dot")).map((dot) => window.getComputedStyle(dot));

    expect(delays.map((style) => style.animationDelay)).toEqual([
      "0ms",
      `${WORKING_DOTS_STEP_MS}ms`,
      `${WORKING_DOTS_STEP_MS * 2}ms`,
    ]);
    expect(delays[0].animationDuration).toBe(`${WORKING_DOTS_CYCLE_MS}ms`);
  });
});
