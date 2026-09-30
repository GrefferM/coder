import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ZoomButton } from "./zoom-button";
import { ZOOM_TOOLBAR_DISABLED_OPACITY } from "../../constants";

describe("ZoomButton", () => {
  it("is named by the step it takes, so a reader knows which way it goes", () => {
    render(<ZoomButton label="+" isDisabled={false} onSelect={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: "+",
      }),
    ).toBeInTheDocument();
  });

  it("steps the scale on a press", async () => {
    const onSelect = vi.fn();

    render(<ZoomButton label="+" isDisabled={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("goes dim and does nothing at the scale's own end", async () => {
    // At an end the button stays in place and dims.
    const onSelect = vi.fn();

    render(<ZoomButton label="+" isDisabled onSelect={onSelect} />);

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveStyle({
      opacity: ZOOM_TOOLBAR_DISABLED_OPACITY,
    });

    await userEvent.click(screen.getByRole("button"));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
