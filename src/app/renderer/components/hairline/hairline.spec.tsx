import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hairline } from "./hairline";
import { HAIRLINE_COLOR } from "../../constants";

describe("Hairline", () => {
  it("is one pixel of the rule's own shade", () => {
    const { container } = render(<Hairline />);

    expect(container.firstChild).toHaveStyle({
      height: "1px",
      background: HAIRLINE_COLOR,
    });
  });

  it("takes the shade of the block it parts, and the air around it", () => {
    const { container } = render(<Hairline color="#4a2530" margin="8px 0" />);

    expect(container.firstChild).toHaveStyle({
      background: "#4a2530",
      margin: "8px 0",
    });
  });

  it("leaves the layout to the caller", () => {
    const { container } = render(<Hairline className="flex-fill" />);

    expect(container.firstChild).toHaveClass("flex-fill");
  });
});
