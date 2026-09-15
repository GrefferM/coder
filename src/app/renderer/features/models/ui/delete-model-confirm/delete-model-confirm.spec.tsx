import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteModelConfirm } from "./delete-model-confirm";
import { DELETE_MODEL_EMPTY_NOTE, DELETE_MODEL_EMPTY_YES_LABEL, DELETE_MODEL_QUESTION } from "./constants";
import type { Agent } from "../../../../interfaces";
import { anAgent } from "../../../../testing";

function agent(id: string, name: string, color: string): Agent {
  return anAgent({
    id,
    name,
    color,
    x: 0,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

describe("DeleteModelConfirm", () => {
  it("says what goes with the model and names every agent standing on it", () => {
    render(
      <DeleteModelConfirm
        title="claude-sonnet-4.5"
        agents={[agent("agent-1", "EDITOR", "#b18aff"), agent("agent-2", "MERGE-WATCH", "#f5a97f")]}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText(DELETE_MODEL_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(/Заберемо claude-sonnet-4.5 і 2 агенти на ній/)).toBeInTheDocument();
    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText("MERGE-WATCH")).toBeInTheDocument();
  });

  it("asks about a model nobody stands on in the same box, one tone quieter", () => {
    render(<DeleteModelConfirm title="claude-3-haiku" agents={[]} onConfirm={vi.fn()} onDismiss={vi.fn()} />);

    // The question names the model itself, since nothing goes with it.
    expect(screen.getByText("Видалити модель claude-3-haiku?")).toBeInTheDocument();
    expect(screen.getByText(DELETE_MODEL_EMPTY_NOTE)).toBeInTheDocument();
    // There is nothing to lose, so the answer is not the destructive one.
    expect(
      screen.getByRole("button", {
        name: DELETE_MODEL_EMPTY_YES_LABEL,
      }),
    ).toBeInTheDocument();
  });
});
