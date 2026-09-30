import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dot } from "./dot";

describe("Dot", () => {
  it("is a round patch of the colour it stands for", () => {
    const { container } = render(<Dot color="#b18aff" size={6} />);

    expect(container.firstChild).toHaveStyle({
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#b18aff",
    });
  });

  it("glows in its own colour", () => {
    const { container } = render(<Dot color="#4ade80" size={6} glow={8} />);

    expect(container.firstChild).toHaveStyle({
      boxShadow: "0 0 8px #4ade80",
    });
  });

  it("stands as an outline where nothing fills it", () => {
    const { container } = render(<Dot color="transparent" size={8} border="1.4px solid #3a4258" />);

    expect(container.firstChild).toHaveStyle({
      background: "transparent",
      border: "1.4px solid #3a4258",
    });
  });

  it("leaves the layout to the caller", () => {
    const { container } = render(<Dot color="#dde1ee" size={6} className="flex-shrink-0" />);

    expect(container.firstChild).toHaveClass("flex-shrink-0");
  });

  it("says what it stands for where it stands alone, and says nothing beside a word", () => {
    // A dot that stands alone is named for readers who cannot see it.
    const { getByLabelText, container, rerender } = render(<Dot color="#f0a5ac" size={5} label="Щось чекає руки" />);

    expect(getByLabelText("Щось чекає руки")).toBeInTheDocument();

    rerender(<Dot color="#f0a5ac" size={5} />);

    expect(container.firstChild).not.toHaveAttribute("role");
  });
});
