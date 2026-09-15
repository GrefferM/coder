import { CONTROL_AT_REST_COLOR } from "../../constants";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./chip";
import { CHIP_BORDER_RADIUS_PX, CHIP_FONT_SIZE_PX, CHIP_PADDING } from "./constants";

describe("Chip", () => {
  it("is a mono value in a soft box, at the measure every chip keeps", () => {
    render(
      <Chip color={CONTROL_AT_REST_COLOR} background="#1b1f2c">
        bool
      </Chip>,
    );

    const chip = screen.getByText("bool");

    expect(chip).toHaveClass("font-monospace", "flex-shrink-0");
    expect(chip).toHaveStyle({
      padding: CHIP_PADDING,
      borderRadius: `${CHIP_BORDER_RADIUS_PX}px`,
      fontSize: `${CHIP_FONT_SIZE_PX}px`,
      color: CONTROL_AT_REST_COLOR,
      background: "#1b1f2c",
    });
  });

  it("stands its two words apart where it holds a name and a value", () => {
    const { container } = render(
      <Chip color="#38a3ff" background="#1b1f2c" gap={4}>
        <span>pattern</span>
        <span>auth/*.spec.ts</span>
      </Chip>,
    );

    expect(container.firstChild).toHaveClass("d-flex", "align-items-center");
    expect(container.firstChild).toHaveStyle({
      gap: "4px",
    });
  });

  it("leaves the layout to the caller", () => {
    render(
      <Chip color="#a9808a" background="#241519" className="text-decoration-line-through">
        run_test
      </Chip>,
    );

    expect(screen.getByText("run_test")).toHaveClass("text-decoration-line-through");
  });
});
