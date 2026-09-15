import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";
import { CONFIRM_DIALOG_NO_LABEL, CONFIRM_DIALOG_YES_LABEL } from "./constants";

const QUESTION = "Видалити агента назавжди?";

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  return render(<ConfirmDialog question={QUESTION} onConfirm={() => {}} onDismiss={() => {}} {...overrides} />);
}

describe("ConfirmDialog", () => {
  it("asks the question and carries whatever the question has to name", () => {
    renderDialog({
      children: <span>TESTER</span>,
    });

    expect(screen.getByText(QUESTION)).toBeInTheDocument();
    expect(screen.getByText("TESTER")).toBeInTheDocument();
  });

  it("gives the two answers, and only the yes destroys", async () => {
    const onConfirm = vi.fn();
    const onDismiss = vi.fn();

    renderDialog({
      onConfirm,
      onDismiss,
    });
    await userEvent.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_NO_LABEL,
      }),
    );

    expect(onDismiss).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    expect(onConfirm).toHaveBeenCalled();
  });

  it("gives a click that misses the box to nobody, and only knocks the box", async () => {
    const onDismiss = vi.fn();

    renderDialog({
      onDismiss,
    });

    // The scrim is the outer layer, the box it holds is the second.
    const [layer, box] = screen.getAllByRole("presentation");

    await userEvent.click(layer);

    expect(onDismiss).not.toHaveBeenCalled();
    expect(box.style.transform).not.toBe("");

    await waitFor(() => expect(box.style.transform).toBe(""));
  });

  it("keeps standing while the box itself is clicked", async () => {
    const onDismiss = vi.fn();

    renderDialog({
      onDismiss,
    });
    await userEvent.click(screen.getByText(QUESTION));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("puts focus on the safe answer as it appears — never on the destroyer", () => {
    renderDialog();

    expect(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_NO_LABEL,
      }),
    ).toHaveFocus();
  });

  it("puts focus on «Зберегти» in a calm question, since writing loses nothing", () => {
    renderDialog({
      tone: "calm",
      yesLabel: "Зберегти",
    });

    expect(
      screen.getByRole("button", {
        name: "Зберегти",
      }),
    ).toHaveFocus();
  });

  it("walks between the answers with the arrows, and gives the one under focus on Enter", async () => {
    const onConfirm = vi.fn();

    renderDialog({
      onConfirm,
    });
    await userEvent.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    ).toHaveFocus();

    await userEvent.keyboard("{Enter}");

    expect(onConfirm).toHaveBeenCalled();

    await userEvent.keyboard("{ArrowLeft}");

    expect(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_NO_LABEL,
      }),
    ).toHaveFocus();
  });

  it("carries the quiet third answer as something pressable, not as a caption", async () => {
    const onDismiss = vi.fn();

    renderDialog({
      tone: "calm",
      stayLabel: "Лишитись тут · ESC",
      onDismiss,
    });
    await userEvent.click(
      screen.getByRole("button", {
        name: "Лишитись тут · ESC",
      }),
    );

    expect(onDismiss).toHaveBeenCalled();
  });

  it("means «Скасувати» on Escape", async () => {
    const onDismiss = vi.fn();

    renderDialog({
      onDismiss,
    });
    await userEvent.keyboard("{Escape}");

    expect(onDismiss).toHaveBeenCalled();
  });
});
