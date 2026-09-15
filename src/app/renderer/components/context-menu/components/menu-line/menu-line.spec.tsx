import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MenuLine } from "./menu-line";
import type { ContextMenuItem } from "../../interfaces";

function item(patch: Partial<ContextMenuItem> = {}): ContextMenuItem {
  return {
    label: "Додати агента",
    icon: null,
    onSelect: () => {},
    ...patch,
  };
}

describe("MenuLine", () => {
  it("stands as one line of the menu, saying what it does", () => {
    render(<MenuLine item={item()} isWalked={false} onWalk={() => {}} />);

    expect(screen.getByRole("menuitem")).toHaveTextContent("Додати агента");
  });

  it("prints the keystroke that does the same thing, where there is one", () => {
    // The menu teaches its own shortcuts, so a person need not open it twice.
    render(
      <MenuLine
        item={item({
          shortcut: "⌫",
        })}
        isWalked={false}
        onWalk={() => {}}
      />,
    );

    expect(screen.getByText("⌫")).toBeInTheDocument();
  });

  it("does its act on a press", async () => {
    const onSelect = vi.fn();

    render(
      <MenuLine
        item={item({
          onSelect,
        })}
        isWalked={false}
        onWalk={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("menuitem"));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("does nothing at all while it stands disabled", async () => {
    const onSelect = vi.fn();

    render(
      <MenuLine
        item={item({
          onSelect,
          isDisabled: true,
        })}
        isWalked={false}
        onWalk={() => {}}
      />,
    );

    expect(screen.getByRole("menuitem")).toBeDisabled();

    await userEvent.click(screen.getByRole("menuitem"));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("takes the walk with the pointer, so the keyboard and the pointer never disagree", async () => {
    // The row under the pointer is the walked row.
    const onWalk = vi.fn();

    render(<MenuLine item={item()} isWalked={false} onWalk={onWalk} />);
    await userEvent.hover(screen.getByRole("menuitem"));

    expect(onWalk).toHaveBeenCalled();
  });
});
