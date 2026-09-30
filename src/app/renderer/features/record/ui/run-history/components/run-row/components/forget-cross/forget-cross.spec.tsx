import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForgetCross } from "./forget-cross";
import { RUN_HISTORY_FORGET_LABEL } from "../../../../constants";
import type { InteractionState } from "../../../../../../../../hooks";

function press(patch: Partial<InteractionState> = {}): InteractionState {
  return {
    isPointedAt: false,
    isPressed: false,
    isFocused: false,
    isLit: false,
    handlers: {
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onFocus: () => {},
      onBlur: () => {},
    },
    ...patch,
  };
}

describe("ForgetCross", () => {
  it("names what it does, so it is never mistaken for the row it stands over", () => {
    render(<ForgetCross press={press()} isRaised onForget={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).toBeInTheDocument();
  });

  it("asks about the deletion on a press", async () => {
    const onForget = vi.fn();

    render(<ForgetCross press={press()} isRaised onForget={onForget} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    );

    expect(onForget).toHaveBeenCalledOnce();
  });

  it("stands on nothing until the row is raised, so a resting list is a list of rows alone", () => {
    // The cross stays in place; only its ground comes and goes.
    const { rerender } = render(<ForgetCross press={press()} isRaised={false} onForget={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).toHaveStyle({
      background: "transparent",
    });

    rerender(<ForgetCross press={press()} isRaised onForget={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).not.toHaveStyle({
      background: "transparent",
    });
  });
});
