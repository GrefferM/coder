import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UndoLine } from "./undo-line";
import { UNDO_ACTION_LABEL, UNDO_LINE_ACTION_COLOR, UNDO_LINE_OLDER_ACTION_COLOR } from "./constants";

describe("UndoLine", () => {
  it("says what went, how long the way back stands, and offers it", () => {
    const onUndo = vi.fn();

    render(<UndoLine message="АГЕНТА ВИДАЛЕНО" secondsLeft={30} onUndo={onUndo} />);
    screen.getByText(UNDO_ACTION_LABEL).click();

    expect(screen.getByText("АГЕНТА ВИДАЛЕНО")).toBeInTheDocument();
    expect(screen.getByText("30 С")).toBeInTheDocument();
    expect(onUndo).toHaveBeenCalled();
  });

  it("dims when a newer offer has pushed it up, and still offers the way back", () => {
    const { rerender } = render(<UndoLine message="АГЕНТА ВИДАЛЕНО" secondsLeft={30} onUndo={vi.fn()} />);

    expect(screen.getByText(UNDO_ACTION_LABEL)).toHaveStyle({
      color: UNDO_LINE_ACTION_COLOR,
    });

    rerender(<UndoLine message="АГЕНТА ВИДАЛЕНО" secondsLeft={27} isOlder onUndo={vi.fn()} />);

    // An older row is quieter, but it is not a picture — its way back still works.
    expect(screen.getByText(UNDO_ACTION_LABEL)).toHaveStyle({
      color: UNDO_LINE_OLDER_ACTION_COLOR,
    });
    expect(screen.getByText("27 С")).toBeInTheDocument();
  });
});
