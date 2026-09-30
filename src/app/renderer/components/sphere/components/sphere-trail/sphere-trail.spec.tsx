import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SphereTrail } from "./sphere-trail";

describe("SphereTrail", () => {
  it("says the one number the key carries, and nothing beside it", () => {
    // One number, not two: two in a row at nine pixels read as a fraction.
    const { container } = render(<SphereTrail hasPrompt tools={4} />);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(container.textContent).toBe("4");
  });

  it("leaves the key off at nought, and keeps the prompt's page", () => {
    // Zero tools draws no key, as no grant draws no mark.
    const { container } = render(<SphereTrail hasPrompt tools={0} />);

    expect(container.textContent).toBe("");
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("draws no line at all where there is neither a prompt nor anything granted", () => {
    const { container } = render(<SphereTrail hasPrompt={false} tools={0} />);

    expect(container.firstChild).toBeNull();
  });

  it("draws the key alone for an agent that stands on no prompt", () => {
    const { container } = render(<SphereTrail hasPrompt={false} tools={2} />);

    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.textContent).toBe("2");
  });
});
