import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./color-picker";
import { AGENT_COLORS } from "../../../../constants";

describe("ColorPicker", () => {
  it("offers the five colours an agent may take, and no others", () => {
    // The palette is closed — a colour is how an agent is told apart, not a free choice.
    render(<ColorPicker color={AGENT_COLORS[0]} onColorChange={() => {}} />);

    expect(screen.getAllByRole("button")).toHaveLength(AGENT_COLORS.length);

    for (const swatch of AGENT_COLORS) {
      expect(
        screen.getByRole("button", {
          name: swatch,
        }),
      ).toBeInTheDocument();
    }
  });

  it("says which one is taken, and says it to a reader too", () => {
    const [first, second] = AGENT_COLORS;

    render(<ColorPicker color={second} onColorChange={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: second,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: first,
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("writes the colour out, so it can be read and not only seen", () => {
    render(<ColorPicker color={AGENT_COLORS[2]} onColorChange={() => {}} />);

    expect(screen.getByText(AGENT_COLORS[2])).toBeInTheDocument();
  });

  it("takes the colour that was pressed", async () => {
    const onColorChange = vi.fn();

    render(<ColorPicker color={AGENT_COLORS[0]} onColorChange={onColorChange} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: AGENT_COLORS[3],
      }),
    );

    expect(onColorChange).toHaveBeenCalledWith(AGENT_COLORS[3]);
  });
});
