import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TroubleMark } from "./trouble-mark";
import { SPHERE_TROUBLE_BREAK_COLOR, SPHERE_TROUBLE_FACT_COLOR, SPHERE_TROUBLE_MARK } from "../../constants";

describe("TroubleMark", () => {
  it("wears one colour for a break the walk would meet and another for a fact only wanting filling in", () => {
    // The ring shows whether this stops a walk or only wants a number.
    const { rerender } = render(<TroubleMark isBreak markScale={1} />);

    expect(screen.getByText(SPHERE_TROUBLE_MARK)).toHaveStyle({
      color: SPHERE_TROUBLE_BREAK_COLOR,
    });

    rerender(<TroubleMark isBreak={false} markScale={1} />);

    expect(screen.getByText(SPHERE_TROUBLE_MARK)).toHaveStyle({
      color: SPHERE_TROUBLE_FACT_COLOR,
    });
  });

  it("grows around its own middle as the canvas zooms out, so it stays where it sits on the ring", () => {
    render(<TroubleMark isBreak markScale={1.6} />);

    expect(screen.getByText(SPHERE_TROUBLE_MARK)).toHaveStyle({
      transform: "scale(1.6)",
    });
  });
});
