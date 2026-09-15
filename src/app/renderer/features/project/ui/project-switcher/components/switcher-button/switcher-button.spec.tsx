import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SwitcherButton } from "./switcher-button";

describe("SwitcherButton", () => {
  it("says which project the app stands on and where it lies", () => {
    // The badge over the canvas's corner names the project and its folder.
    render(<SwitcherButton name="Coder" directory="/Users/olena/code/coder" isOpen={false} onPress={() => {}} />);

    expect(screen.getByText("Coder")).toBeInTheDocument();
    expect(screen.getByText("/Users/olena/code/coder")).toBeInTheDocument();
  });

  it("turns its sign over while the list stands open, and says so to a reader", () => {
    const { rerender } = render(
      <SwitcherButton name="Coder" directory="/code/coder" isOpen={false} onPress={() => {}} />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("⌄")).toBeInTheDocument();

    rerender(<SwitcherButton name="Coder" directory="/code/coder" isOpen onPress={() => {}} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("⌃")).toBeInTheDocument();
  });

  it("opens the list on a press", async () => {
    const onPress = vi.fn();

    render(<SwitcherButton name="Coder" directory="/code/coder" isOpen={false} onPress={onPress} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledOnce();
  });
});
