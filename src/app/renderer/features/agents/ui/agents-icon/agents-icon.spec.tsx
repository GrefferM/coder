import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentsIcon } from "./agents-icon";

describe("AgentsIcon", () => {
  it("draws itself as a single svg glyph", () => {
    const { container } = render(<AgentsIcon />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(container.childElementCount).toBe(1);
  });
});
