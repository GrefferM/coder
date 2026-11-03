import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandsPanel } from "./commands-panel";
import {
  COMMANDS_PANEL_DECLARE_LABEL,
  COMMANDS_PANEL_EMPTY_LABEL,
  COMMANDS_PANEL_NAME_FIELD_LABEL,
  COMMANDS_PANEL_NAME_FIELD_NOTE,
  COMMANDS_PANEL_NEW_LABEL,
  COMMANDS_PANEL_NOTE,
} from "./constants";
import { COMMAND_ROW_DELETE_LABEL, COMMAND_ROW_EDIT_LABEL } from "./components/command-row/constants";
import type { CommandFormValues } from "../../interfaces";
import type { CommandsPanelProps } from "./interfaces";
import type { ProjectCommand } from "../../../../interfaces";
import { aCommand } from "../../../../testing";

function command(id: string, name: string): ProjectCommand {
  return aCommand({
    id,
    name,
  });
}

const form: CommandFormValues = {
  name: "open_pr",
  description: "Відкриває pull request",
  run: "gh pr create",
  parameters: [],
};

function props(patch: Partial<CommandsPanelProps> = {}): CommandsPanelProps {
  return {
    commands: [command("command-1", "open_pr"), command("command-2", "run_tests")],
    openCommandId: null,
    form: null,
    onOpenForm: vi.fn(),
    onFormChange: vi.fn(),
    onSaveForm: vi.fn(async () => {}),
    onCancelForm: vi.fn(),
    onArmedCommandIdChange: vi.fn(),
    ...patch,
  };
}

describe("CommandsPanel", () => {
  it("lists the declared commands, with the way to declare another under them", () => {
    render(<CommandsPanel {...props()} />);

    expect(screen.getByText("open_pr")).toBeInTheDocument();
    expect(screen.getByText("run_tests")).toBeInTheDocument();
    expect(screen.getByText(COMMANDS_PANEL_NEW_LABEL)).toBeInTheDocument();
    expect(screen.getByText(COMMANDS_PANEL_NOTE)).toBeInTheDocument();
  });

  it("lifts the one act into the middle where there is nothing to list", () => {
    render(
      <CommandsPanel
        {...props({
          commands: [],
        })}
      />,
    );

    expect(screen.getByText(COMMANDS_PANEL_EMPTY_LABEL)).toBeInTheDocument();
    expect(screen.getAllByText(COMMANDS_PANEL_NEW_LABEL)).toHaveLength(1);
    expect(screen.queryByText(COMMANDS_PANEL_NOTE)).not.toBeInTheDocument();
  });

  it("keeps every character a provider would refuse, rather than eating it behind the person", async () => {
    const onFormChange = vi.fn();

    render(
      <CommandsPanel
        {...props({
          openCommandId: "new",
          form,
          onFormChange,
        })}
      />,
    );

    await userEvent.type(screen.getByLabelText(COMMANDS_PANEL_NAME_FIELD_LABEL), "и");

    expect(onFormChange).toHaveBeenCalledWith({
      name: "open_prи",
    });
  });

  it("refuses to write a name typed here that a provider would not take", async () => {
    const onSaveForm = vi.fn(async () => {});
    const opened = props({
      openCommandId: "new",
      form,
      onSaveForm,
    });

    const { rerender } = render(<CommandsPanel {...opened} />);

    // The form opened on a valid name; the person then types an invalid one.
    rerender(
      <CommandsPanel
        {...opened}
        form={{
          ...form,
          name: "run_тест",
        }}
      />,
    );

    await userEvent.click(screen.getByText(COMMANDS_PANEL_DECLARE_LABEL));

    expect(onSaveForm).not.toHaveBeenCalled();
    // The line that states the rule is the same line that says it was broken.
    expect(screen.getByText(COMMANDS_PANEL_NAME_FIELD_NOTE)).toBeInTheDocument();
  });

  it("is the form and nothing else while one stands open", () => {
    // The form takes the list's place; never edited beside a list.
    render(
      <CommandsPanel
        {...props({
          form,
          openCommandId: "command-1",
        })}
      />,
    );

    expect(screen.queryByText("run_tests")).not.toBeInTheDocument();
    expect(screen.queryByText(COMMANDS_PANEL_NEW_LABEL)).not.toBeInTheDocument();
  });

  it("keeps one row open at a time, a second press closing the one that stood", async () => {
    render(<CommandsPanel {...props()} />);
    await userEvent.click(screen.getByText("open_pr"));

    expect(screen.getByText(COMMAND_ROW_EDIT_LABEL)).toBeInTheDocument();

    await userEvent.click(screen.getByText("run_tests"));

    expect(screen.getAllByText(COMMAND_ROW_EDIT_LABEL)).toHaveLength(1);

    await userEvent.click(screen.getByText("run_tests"));

    expect(screen.queryByText(COMMAND_ROW_EDIT_LABEL)).not.toBeInTheDocument();
  });

  it("opens the form on the row it was asked for, and a fresh one for a new command", async () => {
    const said = props();

    render(<CommandsPanel {...said} />);
    await userEvent.click(screen.getByText(COMMANDS_PANEL_NEW_LABEL));

    expect(said.onOpenForm).toHaveBeenCalledWith("new");

    await userEvent.click(screen.getByText("open_pr"));
    await userEvent.click(screen.getByText(COMMAND_ROW_EDIT_LABEL));

    expect(said.onOpenForm).toHaveBeenCalledWith("command-1");
  });

  it("arms a command for deletion rather than deleting it where it stands", async () => {
    const said = props();

    render(<CommandsPanel {...said} />);
    await userEvent.click(screen.getByText("open_pr"));
    await userEvent.click(screen.getByText(COMMAND_ROW_DELETE_LABEL));

    expect(said.onArmedCommandIdChange).toHaveBeenCalledWith("command-1");
  });

  it("does not offer to edit the command being written, its own name not counting as taken", () => {
    render(
      <CommandsPanel
        {...props({
          form,
          openCommandId: "command-1",
        })}
      />,
    );

    expect(screen.queryByText(COMMAND_ROW_EDIT_LABEL)).not.toBeInTheDocument();
  });
});
