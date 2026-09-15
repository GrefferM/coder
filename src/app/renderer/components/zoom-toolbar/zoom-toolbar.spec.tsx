import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ZoomToolbar } from "./zoom-toolbar";
import { ZOOM_IN_LABEL, ZOOM_OUT_LABEL } from "./constants";
import { ZOOM_SCALE_STOPS } from "../zoom-field";

describe("ZoomToolbar", () => {
  it("says the scale it stands at, in whole percent", () => {
    render(<ZoomToolbar scale={0.85} onZoomOut={() => {}} onZoomIn={() => {}} />);

    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("steps the scale either way while it stands between the ends", async () => {
    // The ceiling is 100%, so a toolbar with both ways open stands below it.
    const onZoomOut = vi.fn();
    const onZoomIn = vi.fn();

    render(<ZoomToolbar scale={0.7} onZoomOut={onZoomOut} onZoomIn={onZoomIn} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: ZOOM_OUT_LABEL,
      }),
    );

    expect(onZoomOut).toHaveBeenCalledOnce();

    await userEvent.click(
      screen.getByRole("button", {
        name: ZOOM_IN_LABEL,
      }),
    );

    expect(onZoomIn).toHaveBeenCalledOnce();
  });

  it("goes dead at the surface's own ends, each end on its own side", () => {
    // At the smallest scale only the minus is dead, and at the largest only the plus.
    const { rerender } = render(<ZoomToolbar scale={ZOOM_SCALE_STOPS.min} onZoomOut={() => {}} onZoomIn={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: ZOOM_OUT_LABEL,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: ZOOM_IN_LABEL,
      }),
    ).toBeEnabled();

    rerender(<ZoomToolbar scale={ZOOM_SCALE_STOPS.max} onZoomOut={() => {}} onZoomIn={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: ZOOM_OUT_LABEL,
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: ZOOM_IN_LABEL,
      }),
    ).toBeDisabled();
  });
});
