import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper } from "./stepper";
import { STEPPER_LESS_LABEL, STEPPER_MORE_LABEL } from "./constants";

const LABEL = "Максимум викликів";
// The floor is the caller's, so a case that is about the floor says which one it is standing on.
const LEAST = 1;

describe("Stepper", () => {
  it("steps the number either way", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Stepper label={LABEL} value={5} least={LEAST} onChange={onChange} />);
    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    expect(onChange).toHaveBeenCalledWith(6);

    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_LESS_LABEL}`,
      }),
    );

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("refuses to step below the floor its caller named", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Stepper label={LABEL} value={LEAST} least={LEAST} onChange={onChange} />);
    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_LESS_LABEL}`,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("steps by a tenth and writes the value to its own places", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Stepper label={LABEL} value={0.3} onChange={onChange} step={0.1} least={0} most={1} places={1} />);

    expect(screen.getByText("0.3")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    // A run of tenths is not exact: without rounding this is 0.4 written as 0.30000000000000004.
    expect(onChange).toHaveBeenCalledWith(0.4);
  });

  it("does not answer at either bound", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Stepper label={LABEL} value={1} onChange={onChange} step={0.1} least={0} most={1} places={1} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    rerender(<Stepper label={LABEL} value={0} onChange={onChange} step={0.1} least={0} most={1} places={1} />);
    await user.click(
      screen.getByRole("button", {
        name: `${LABEL}: ${STEPPER_LESS_LABEL}`,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });
  it("shows the floor label in place of the number at the floor, and the number above it", () => {
    const { rerender } = render(<Stepper label={LABEL} value={0} least={0} floorLabel="∞" onChange={vi.fn()} />);

    expect(screen.getByText("∞")).toBeInTheDocument();

    rerender(<Stepper label={LABEL} value={3} least={0} floorLabel="∞" onChange={vi.fn()} />);

    expect(screen.queryByText("∞")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
