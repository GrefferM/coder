import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandRow } from "./command-row";
import { COMMAND_ROW_DELETE_LABEL, COMMAND_ROW_EDIT_LABEL } from "./constants";
import { parametersCountLabel } from "../../../../words";
import type { CommandParameter, ProjectCommand } from "../../../../../../interfaces";
import { aCommand } from "../../../../../../testing";

function parameter(id: string): CommandParameter {
  return {
    id,
    name: "branch",
    type: "text",
    description: "Гілка",
    isRequired: true,
    values: [],
  };
}

function command(patch: Partial<ProjectCommand> = {}): ProjectCommand {
  return aCommand({
    run: "gh pr create --base {branch}",
    parameters: [parameter("parameter-1")],
    ...patch,
  });
}

function acts() {
  return {
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe("CommandRow", () => {
  it("closed, names the command and counts its parameters and nothing more", () => {
    // The list is a list of names; what a command says and runs is behind its own row.
    render(<CommandRow command={command()} isOpen={false} {...acts()} />);

    expect(screen.getByText("open_pr")).toBeInTheDocument();
    expect(screen.getByText(parametersCountLabel(1))).toBeInTheDocument();
    expect(screen.queryByText("Відкриває pull request")).not.toBeInTheDocument();
    expect(screen.queryByText("gh pr create --base {branch}")).not.toBeInTheDocument();
  });

  it("counts nothing where a command takes no parameters", () => {
    render(
      <CommandRow
        command={command({
          parameters: [],
        })}
        isOpen={false}
        {...acts()}
      />,
    );

    expect(screen.queryByText(parametersCountLabel(0))).not.toBeInTheDocument();
  });

  it("open, shows what the model reads and what actually runs, with the two acts", () => {
    render(<CommandRow command={command()} isOpen {...acts()} />);

    expect(screen.getByText("Відкриває pull request")).toBeInTheDocument();
    expect(screen.getByText("gh pr create --base {branch}")).toBeInTheDocument();
    expect(screen.getByText(COMMAND_ROW_EDIT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(COMMAND_ROW_DELETE_LABEL)).toBeInTheDocument();
  });

  it("says to a reader whether it stands open", () => {
    const { rerender } = render(<CommandRow command={command()} isOpen={false} {...acts()} />);

    expect(screen.getByText("open_pr").closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "false");

    rerender(<CommandRow command={command()} isOpen {...acts()} />);

    expect(screen.getByText("open_pr").closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "true");
  });

  it("opens on a press, and each act inside does its own", async () => {
    const said = acts();

    render(<CommandRow command={command()} isOpen={false} {...said} />);
    await userEvent.click(screen.getByText("open_pr"));

    expect(said.onOpen).toHaveBeenCalledOnce();
  });

  it("edits and deletes from the open row", async () => {
    const said = acts();

    render(<CommandRow command={command()} isOpen {...said} />);
    await userEvent.click(screen.getByText(COMMAND_ROW_EDIT_LABEL));

    expect(said.onEdit).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(COMMAND_ROW_DELETE_LABEL));

    expect(said.onDelete).toHaveBeenCalledOnce();
  });
});
