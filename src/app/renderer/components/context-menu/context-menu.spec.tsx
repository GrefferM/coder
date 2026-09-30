import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu } from "./context-menu";

const AT = {
  x: 120,
  y: 64,
};

describe("ContextMenu", () => {
  it("opens on the point it was given", () => {
    render(<ContextMenu at={AT} items={[]} onDismiss={() => {}} />);

    expect(screen.getByRole("menu")).toHaveStyle({
      left: "120px",
      top: "64px",
    });
  });

  it("offers a line per item and runs the one pressed", async () => {
    const onSelect = vi.fn();

    render(
      <ContextMenu
        at={AT}
        items={[
          {
            label: "Додати агента",
            icon: <svg />,
            onSelect,
          },
        ]}
        onDismiss={() => {}}
      />,
    );

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: "Додати агента",
      }),
    );

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("asks to be dismissed on Escape", async () => {
    const onDismiss = vi.fn();

    render(<ContextMenu at={AT} items={[]} onDismiss={onDismiss} />);

    await userEvent.keyboard("{Escape}");

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("asks to be dismissed when anything else is clicked", async () => {
    const onDismiss = vi.fn();

    render(<ContextMenu at={AT} items={[]} onDismiss={onDismiss} />);

    await userEvent.click(document.body);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("survives the click that opened it, which is still in flight while it mounts", () => {
    const onDismiss = vi.fn();

    render(<ContextMenu at={AT} items={[]} onDismiss={onDismiss} />);

    // What the opening click does once the menu is on screen: reaches `window`.
    window.dispatchEvent(new MouseEvent("click"));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("keeps a click on itself from reaching the canvas behind it", async () => {
    const onCanvasClick = vi.fn();

    render(
      <div onClick={onCanvasClick} role="presentation">
        <ContextMenu at={AT} items={[]} onDismiss={() => {}} />
      </div>,
    );

    await userEvent.click(screen.getByRole("menu"));

    expect(onCanvasClick).not.toHaveBeenCalled();
  });

  it("walks the lines with the arrows and takes the one it stands on with Enter", async () => {
    const onAdd = vi.fn();
    const onPaste = vi.fn();

    render(
      <ContextMenu
        at={AT}
        items={[
          {
            label: "Додати агента",
            icon: <svg />,
            onSelect: onAdd,
          },
          {
            label: "Вставити агента",
            icon: <svg />,
            onSelect: onPaste,
          },
        ]}
        onDismiss={() => {}}
      />,
    );

    const lines = screen.getAllByRole("menuitem");

    expect(lines[0].style.boxShadow).not.toBe("");
    expect(lines[1].style.boxShadow).toBe("");

    await userEvent.keyboard("{ArrowDown}");

    expect(lines[1].style.boxShadow).not.toBe("");

    await userEvent.keyboard("{Enter}");

    expect(onPaste).toHaveBeenCalledOnce();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("takes nothing when the line it stands on has nothing to act on", async () => {
    const onPaste = vi.fn();

    render(
      <ContextMenu
        at={AT}
        items={[
          {
            label: "Додати агента",
            icon: <svg />,
            onSelect: () => {},
          },
          {
            label: "Вставити агента",
            icon: <svg />,
            isDisabled: true,
            onSelect: onPaste,
          },
        ]}
        onDismiss={() => {}}
      />,
    );

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(onPaste).not.toHaveBeenCalled();
  });

  it("keeps a line that has nothing to act on from acting", async () => {
    const onSelect = vi.fn();

    render(
      <ContextMenu
        at={AT}
        items={[
          {
            label: "Вставити агента",
            icon: <svg />,
            shortcut: "⌘V",
            isDisabled: true,
            onSelect,
          },
        ]}
        onDismiss={() => {}}
      />,
    );

    // A disabled line is found by its text, not its role.
    const item = screen.getByText("Вставити агента").closest("button");

    await userEvent.click(item as HTMLElement);

    expect(item).toBeDisabled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
