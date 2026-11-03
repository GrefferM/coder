import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActionButton } from "./action-button";
import { ACTION_BUTTON_PALETTES } from "./constants";

describe("ActionButton", () => {
  it("wears its own variant's colors", () => {
    render(<ActionButton variant="save" label="Зберегти" />);

    expect(screen.getByText("Зберегти")).toHaveStyle({
      background: ACTION_BUTTON_PALETTES.save.background,
      color: ACTION_BUTTON_PALETTES.save.color,
    });
  });

  it("lights up its own lit colors while the pointer is over it", async () => {
    const user = userEvent.setup();

    render(<ActionButton variant="delete" label="Видалити" />);

    const button = screen.getByText("Видалити");

    await user.hover(button);

    expect(button).toHaveStyle({
      background: ACTION_BUTTON_PALETTES.delete.litBackground,
      color: ACTION_BUTTON_PALETTES.delete.litColor,
    });
  });

  it("takes the same lit colors from the keyboard's focus, and the ring on top", async () => {
    const user = userEvent.setup();

    render(<ActionButton variant="delete" label="Видалити" />);

    const button = screen.getByText("Видалити");

    await user.tab();

    expect(button).toHaveStyle({
      background: ACTION_BUTTON_PALETTES.delete.litBackground,
      color: ACTION_BUTTON_PALETTES.delete.litColor,
    });
    // Only that the ring stands: jsdom rewrites the colors inside the shorthand.
    expect(button.style.boxShadow).not.toBe("");
  });

  it("keeps the ring while the mouse only moves, and gives it up when the mouse takes something", async () => {
    const user = userEvent.setup();

    render(
      <>
        <ActionButton variant="cancel" label="Скасувати" />
        <ActionButton variant="save" label="Зберегти" />
      </>,
    );

    const walked = screen.getByText("Скасувати");
    const taken = screen.getByText("Зберегти");

    await user.tab();

    expect(walked.style.boxShadow).not.toBe("");

    await user.hover(taken);

    expect(walked.style.boxShadow).not.toBe("");

    await user.click(taken);

    expect(taken).toHaveFocus();
    expect(taken.style.boxShadow).toBe("");
  });

  it("stays in its own idle colors while disabled, pointer or not", async () => {
    const user = userEvent.setup();

    render(<ActionButton variant="save" label="Зберегти" isDisabled />);

    const button = screen.getByText("Зберегти");

    await user.hover(button);

    expect(button).toHaveStyle({
      background: ACTION_BUTTON_PALETTES.save.background,
    });
  });

  it("wears the ring while dimmed, and says it is dimmed rather than hiding from the keyboard", async () => {
    // A dimmed button still takes focus.
    const user = userEvent.setup();

    render(<ActionButton variant="save" label="Зберегти" isDisabled />);

    const button = screen.getByText("Зберегти");

    await user.tab();

    expect(button).toHaveFocus();
    expect(button.style.boxShadow).not.toBe("");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("does nothing when a dimmed act is pressed, by hand or by Enter", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ActionButton variant="save" label="Зберегти" isDisabled onClick={onClick} />);

    const button = screen.getByText("Зберегти");

    await user.click(button);

    button.focus();
    await user.keyboard("{Enter}");

    expect(button).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls back when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ActionButton variant="cancel" label="Скасувати" onClick={onClick} />);

    await user.click(screen.getByText("Скасувати"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a plain button unless it's told to submit the form around it", () => {
    const { rerender } = render(<ActionButton variant="cancel" label="Скасувати" />);

    expect(screen.getByText("Скасувати")).toHaveAttribute("type", "button");

    rerender(<ActionButton variant="save" type="submit" label="Зберегти" />);

    expect(screen.getByText("Зберегти")).toHaveAttribute("type", "submit");
  });

  it("takes the smaller pair of a window drawn by its own frame when asked, and the form's otherwise", () => {
    render(
      <>
        <ActionButton variant="save" label="Запустити" size="dialog" />
        <ActionButton variant="save" label="Зберегти" />
      </>,
    );

    expect(
      screen.getByRole("button", {
        name: "Запустити",
      }),
    ).toHaveStyle({
      padding: "9px 0px",
      fontSize: "12.5px",
    });
    expect(
      screen.getByRole("button", {
        name: "Зберегти",
      }),
    ).toHaveStyle({
      padding: "10px 0px",
      fontSize: "13px",
    });
  });
});
