import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AimButton } from "./aim-button";
import { AIM_PICKER_ARIA_LABEL, AIM_PICKER_NOBODY_LABEL } from "../../constants";
import type { Agent } from "../../../../../../interfaces";
import { anAgent } from "../../../../../../testing";

const seeker: Agent = anAgent({
  x: 0,
  y: 0,
});

describe("AimButton", () => {
  it("names whom the chat is aimed at", () => {
    // The header says it, so a person never has to guess where a question would go.
    render(<AimButton aimed={seeker} isOpen={false} onPress={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: AIM_PICKER_ARIA_LABEL,
      }),
    ).toHaveTextContent("Шукач");
  });

  it("says «нікого» where the chat is aimed at nobody", () => {
    render(<AimButton aimed={null} isOpen={false} onPress={() => {}} />);

    expect(screen.getByRole("button")).toHaveTextContent(AIM_PICKER_NOBODY_LABEL);
  });

  it("says to a reader that it opens a list, and whether that list stands open", () => {
    const { rerender } = render(<AimButton aimed={seeker} isOpen={false} onPress={() => {}} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "listbox");
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");

    rerender(<AimButton aimed={seeker} isOpen onPress={() => {}} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("opens the list on a press", async () => {
    const onPress = vi.fn();

    render(<AimButton aimed={seeker} isOpen={false} onPress={onPress} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledOnce();
  });
});
