import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToolOption } from "./tool-option";
import { SETTINGS_TICK_TOGGLE_LABEL } from "../../constants";

describe("ToolOption", () => {
  it("stands as a tick that says whether the function is granted", () => {
    const { rerender } = render(<ToolOption name="open_pr" isGranted={false} onToggle={() => {}} />);

    const tick = screen.getByRole("checkbox", {
      name: `${SETTINGS_TICK_TOGGLE_LABEL} open_pr`,
    });

    expect(tick).toHaveAttribute("aria-checked", "false");

    rerender(<ToolOption name="open_pr" isGranted onToggle={() => {}} />);

    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("both grants and revokes with the one press", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(<ToolOption name="open_pr" isGranted={false} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<ToolOption name="open_pr" isGranted onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
