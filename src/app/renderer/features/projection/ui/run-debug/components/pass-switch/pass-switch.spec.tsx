import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PassSwitch } from "./pass-switch";
import { PASS_SWITCH_BACK_LABEL, PASS_SWITCH_OF, PASS_SWITCH_ON_LABEL, PASS_SWITCH_WORD } from "./constants";

describe("PassSwitch", () => {
  it("says which pass of the flow stands open, and how many there are", () => {
    // Walks this flow's passes and no further.
    render(<PassSwitch place={2} count={3} onGo={() => {}} />);

    expect(screen.getByText(`${PASS_SWITCH_WORD} 2${PASS_SWITCH_OF}3`)).toBeInTheDocument();
  });

  it("goes a pass either way", async () => {
    const onGo = vi.fn();

    render(<PassSwitch place={2} count={3} onGo={onGo} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: PASS_SWITCH_BACK_LABEL,
      }),
    );

    expect(onGo).toHaveBeenCalledWith(1);

    await userEvent.click(
      screen.getByRole("button", {
        name: PASS_SWITCH_ON_LABEL,
      }),
    );

    expect(onGo).toHaveBeenCalledWith(3);
  });

  it("goes out at each end of the flow, each arrow on its own side", () => {
    const { rerender } = render(<PassSwitch place={1} count={3} onGo={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_BACK_LABEL,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_ON_LABEL,
      }),
    ).toBeEnabled();

    rerender(<PassSwitch place={3} count={3} onGo={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_BACK_LABEL,
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_ON_LABEL,
      }),
    ).toBeDisabled();
  });

  it("stands both arrows dead where the flow was asked but once", () => {
    render(<PassSwitch place={1} count={1} onGo={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_BACK_LABEL,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: PASS_SWITCH_ON_LABEL,
      }),
    ).toBeDisabled();
  });
});
