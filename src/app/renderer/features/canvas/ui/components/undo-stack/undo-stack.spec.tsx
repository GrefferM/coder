import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UndoStack } from "./undo-stack";
import { UNDO_STACK_FOLD_PREFIX, UNDO_STACK_SHOWN_MAX } from "./constants";
import { UNDO_ACTION_LABEL } from "../undo-line/constants";
import type { UndoOffer } from "../../../../project";

function offer(index: number): UndoOffer {
  return {
    id: `offer-${index}`,
    deletionId: `deletion-${index}`,
    taken: {
      models: [],
      prompts: [],
      commands: [],
      servers: [],
      agents: [],
      links: [],
      schedules: [],
      promptTakenFrom: [],
      grantsTakenFrom: [],
    },
    message: `ВИДАЛЕНО АГЕНТА ${index}`,
    place: null,
    secondsLeft: 30,
  };
}

describe("UndoStack", () => {
  it("stands every offer, newest last", () => {
    render(<UndoStack offers={[offer(1), offer(2)]} onUndo={() => {}} />);

    expect(screen.getByText("ВИДАЛЕНО АГЕНТА 1")).toBeInTheDocument();
    expect(screen.getByText("ВИДАЛЕНО АГЕНТА 2")).toBeInTheDocument();
  });

  it("shows three at most and counts the rest above them", () => {
    render(<UndoStack offers={[1, 2, 3, 4, 5].map(offer)} onUndo={() => {}} />);

    expect(screen.getAllByText(UNDO_ACTION_LABEL)).toHaveLength(UNDO_STACK_SHOWN_MAX);
    expect(screen.getByText(`${UNDO_STACK_FOLD_PREFIX} 2`)).toBeInTheDocument();
    expect(screen.queryByText("ВИДАЛЕНО АГЕНТА 1")).not.toBeInTheDocument();
    expect(screen.getByText("ВИДАЛЕНО АГЕНТА 5")).toBeInTheDocument();
  });

  it("counts nothing where every offer stands", () => {
    render(<UndoStack offers={[offer(1)]} onUndo={() => {}} />);

    expect(screen.queryByText(new RegExp(UNDO_STACK_FOLD_PREFIX, "u"))).not.toBeInTheDocument();
  });

  it("puts back the offer whose own way back was pressed", async () => {
    const onUndo = vi.fn();

    render(<UndoStack offers={[offer(1), offer(2)]} onUndo={onUndo} />);
    await userEvent.click(screen.getAllByText(UNDO_ACTION_LABEL)[1]);

    expect(onUndo).toHaveBeenCalledWith("offer-2");
  });

  it("keeps its own press to itself, the canvas behind it not taking it as a click on empty space", async () => {
    const onCanvas = vi.fn();

    render(
      <div role="presentation" onClick={onCanvas}>
        <UndoStack offers={[offer(1)]} onUndo={() => {}} />
      </div>,
    );
    await userEvent.click(screen.getByText("ВИДАЛЕНО АГЕНТА 1"));

    expect(onCanvas).not.toHaveBeenCalled();
  });
});
