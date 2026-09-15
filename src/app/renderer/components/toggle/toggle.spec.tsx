import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./toggle";
import { TOGGLE_OFF_COLOR, TOGGLE_ON_COLOR } from "./constants";

describe("Toggle", () => {
  it("tells assistive tech which way it stands", () => {
    render(<Toggle label="Увімкнено" isOn onChange={() => {}} />);

    expect(
      screen.getByRole("switch", {
        name: "Увімкнено",
      }),
    ).toBeChecked();
  });

  it("takes the live colour while on and the neutral while off", () => {
    const { rerender } = render(<Toggle label="Увімкнено" isOn onChange={() => {}} />);

    expect(screen.getByRole("switch")).toHaveStyle({
      background: TOGGLE_ON_COLOR,
    });

    rerender(<Toggle label="Увімкнено" isOn={false} onChange={() => {}} />);

    expect(screen.getByRole("switch")).toHaveStyle({
      background: TOGGLE_OFF_COLOR,
    });
  });

  it("reports the way it was flipped to, not the way it stood", async () => {
    const onChange = vi.fn();

    render(<Toggle label="Увімкнено" isOn={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
