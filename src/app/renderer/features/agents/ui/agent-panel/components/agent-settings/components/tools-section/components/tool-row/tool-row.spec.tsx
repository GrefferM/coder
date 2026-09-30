import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToolRow } from "./tool-row";
import { TOOL_ROW_OPEN_LABEL } from "./constants";

describe("ToolRow", () => {
  it("names the function it stands for, and the whole row is the way into its grant", async () => {
    // Revoking is the list's tick, so the row itself only opens.
    const onOpen = vi.fn();

    render(<ToolRow name="open_pr" pinnedCount={0} onOpen={onOpen} />);

    const row = screen.getByRole("button", {
      name: `${TOOL_ROW_OPEN_LABEL} open_pr`,
    });

    expect(row).toHaveTextContent("open_pr");

    await userEvent.click(row);

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("counts the fixed arguments, and says nothing where none are fixed", () => {
    // The row shows how many pinned arguments left the model's schema.
    const { rerender } = render(<ToolRow name="open_pr" pinnedCount={0} onOpen={() => {}} />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();

    rerender(<ToolRow name="open_pr" pinnedCount={2} onOpen={() => {}} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
