import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteAgentConfirm } from "./delete-agent-confirm";
import { DELETE_AGENT_QUESTION } from "./constants";
import { deletedAgentNote } from "../../words";
import { CONFIRM_DIALOG_NO_LABEL, CONFIRM_DIALOG_YES_LABEL } from "../../../../components/confirm-dialog/constants";

describe("DeleteAgentConfirm", () => {
  it("asks before deleting, and names the neighbours the deletion leaves alone", () => {
    // An agent's lines go with it, so the question says whose lines those are.
    render(
      <DeleteAgentConfirm
        name="Тезар"
        neighbourNames={["Шукач", "Перелікар"]}
        onConfirm={() => {}}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(deletedAgentNote("Тезар", ["Шукач", "Перелікар"]))).toBeInTheDocument();
  });

  it("says so plainly where the agent stands alone", () => {
    render(<DeleteAgentConfirm name="EDITOR" neighbourNames={[]} onConfirm={() => {}} onDismiss={() => {}} />);

    expect(screen.getByText(deletedAgentNote("EDITOR", []))).toBeInTheDocument();
  });

  it("deletes on the yes and lets it be on the no", async () => {
    const onConfirm = vi.fn();
    const onDismiss = vi.fn();

    render(<DeleteAgentConfirm name="EDITOR" neighbourNames={[]} onConfirm={onConfirm} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText(CONFIRM_DIALOG_YES_LABEL));

    expect(onConfirm).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(CONFIRM_DIALOG_NO_LABEL));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
