import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CopyAction } from "./copy-action";
import { COPY_ACTION_LABEL, COPY_ACTION_TAKEN_LABEL } from "./constants";

function clipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText,
    },
    configurable: true,
  });

  return writeText;
}

describe("CopyAction", () => {
  it("hands the clipboard the whole text, and nothing cut out of it", async () => {
    // Copies the whole text, nothing picked out of it.
    const writeText = clipboard();

    render(<CopyAction text={"### Error\nError: page.goto\nCall log:"} />);
    await userEvent.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("### Error\nError: page.goto\nCall log:");
  });

  it("says it is done, because an action that answers nothing is pressed twice", async () => {
    clipboard();

    render(<CopyAction text="один рядок" />);

    expect(screen.getByText(COPY_ACTION_LABEL)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByText(COPY_ACTION_TAKEN_LABEL)).toBeInTheDocument());
  });

  it("stands where the clipboard refused, and lets nothing of it out at the app", async () => {
    // A refused clipboard write is caught, not an unhandled rejection.
    const refused = vi.fn().mockRejectedValue(new Error("no clipboard"));

    clipboard(refused);
    render(<CopyAction text="один рядок" />);
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(refused).toHaveBeenCalled());

    expect(screen.getByText(COPY_ACTION_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(COPY_ACTION_TAKEN_LABEL)).not.toBeInTheDocument();
  });
});
