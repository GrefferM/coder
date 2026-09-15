import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CanvasPill } from "./canvas-pill";
import {
  CANVAS_PILL_DONE_BORDER_COLOR,
  CANVAS_PILL_FAILED_BACKGROUND_COLOR,
  CANVAS_PILL_FAILED_BORDER_COLOR,
  CANVAS_PILL_IN_ANIMATION,
  CANVAS_PILL_OUT_ANIMATION,
} from "./constants";

describe("CanvasPill", () => {
  it("carries whatever the subject puts in it", () => {
    render(<CanvasPill>КРОК 2 · ШУКАЧ</CanvasPill>);

    expect(screen.getByText("КРОК 2 · ШУКАЧ")).toBeInTheDocument();
  });

  it("is toned by what it says, a fall being marked and not merely written", () => {
    // Three different uses share one pill, so the tone is what tells them apart at a glance.
    const { container, rerender } = render(<CanvasPill tone="done">ГОТОВО</CanvasPill>);

    expect(container.firstElementChild).toHaveStyle({
      borderColor: CANVAS_PILL_DONE_BORDER_COLOR,
    });

    rerender(<CanvasPill tone="failed">УПАВ</CanvasPill>);

    expect(container.firstElementChild).toHaveStyle({
      borderColor: CANVAS_PILL_FAILED_BORDER_COLOR,
      background: CANVAS_PILL_FAILED_BACKGROUND_COLOR,
    });
  });

  it("fades out where it is leaving, and stays mounted while it does", () => {
    const { container, rerender } = render(<CanvasPill>ГОТОВО</CanvasPill>);

    expect(container.firstElementChild).toHaveStyle({
      animation: CANVAS_PILL_IN_ANIMATION,
    });

    rerender(<CanvasPill isLeaving>ГОТОВО</CanvasPill>);

    expect(screen.getByText("ГОТОВО")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({
      animation: CANVAS_PILL_OUT_ANIMATION,
    });
  });

  it("keeps its own press to itself, the canvas behind it not taking it as a click on empty space", async () => {
    const onCanvas = vi.fn();

    render(
      <div role="presentation" onClick={onCanvas}>
        <CanvasPill>ГОТОВО</CanvasPill>
      </div>,
    );
    await userEvent.click(screen.getByText("ГОТОВО"));

    expect(onCanvas).not.toHaveBeenCalled();
  });
});
