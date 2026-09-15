import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PinnedRow } from "./pinned-row";
import { PINNED_ROW_UNPIN_LABEL } from "./constants";

describe("PinnedRow", () => {
  it("names the parameter and lets only its value be written", async () => {
    const onValueChange = vi.fn();

    render(<PinnedRow name="branch" value="mai" onValueChange={onValueChange} onUnpin={() => {}} />);

    const field = screen.getByLabelText("branch");

    expect(field).toHaveValue("mai");

    await userEvent.type(field, "n");

    expect(onValueChange).toHaveBeenCalledWith("main");
  });

  it("takes the dashed edge while the pin stands empty", () => {
    // A pin with no value is not yet a value the model is spared deciding.
    const { rerender } = render(<PinnedRow name="branch" value="" onValueChange={() => {}} onUnpin={() => {}} />);

    expect(screen.getByLabelText("branch").style.border).toContain("dashed");

    rerender(<PinnedRow name="branch" value="main" onValueChange={() => {}} onUnpin={() => {}} />);

    expect(screen.getByLabelText("branch").style.border).toContain("solid");
  });

  it("gives the parameter back to the model by its own cross", async () => {
    const onUnpin = vi.fn();

    render(<PinnedRow name="branch" value="main" onValueChange={() => {}} onUnpin={onUnpin} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${PINNED_ROW_UNPIN_LABEL} branch`,
      }),
    );

    expect(onUnpin).toHaveBeenCalledOnce();
  });
});
