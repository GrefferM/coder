import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NestedActions } from "./nested-actions";

describe("NestedActions", () => {
  it("offers the two ways out of a nested block, and each calls its own", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(<NestedActions cancelLabel="СКАСУВАТИ" confirmLabel="ГОТОВО" onCancel={onCancel} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByText("ГОТОВО"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText("СКАСУВАТИ"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("holds the confirm shut while what it would confirm is not there yet", async () => {
    // An unlit act is not a refusal — there is simply nothing to confirm.
    const onConfirm = vi.fn();

    render(
      <NestedActions
        cancelLabel="СКАСУВАТИ"
        confirmLabel="ГОТОВО"
        isConfirmDisabled
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByText("ГОТОВО"));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
