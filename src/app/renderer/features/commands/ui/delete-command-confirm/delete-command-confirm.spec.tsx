import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteCommandConfirm } from "./delete-command-confirm";
import { DELETE_COMMAND_NOTE_PREFIX, DELETE_COMMAND_NOTE_SUFFIX, DELETE_COMMAND_QUESTION } from "./constants";
import { CONFIRM_DIALOG_YES_LABEL } from "../../../../components/confirm-dialog/constants";
import type { ProjectCommand } from "../../../../interfaces";
import { aCommand } from "../../../../testing";

const command: ProjectCommand = aCommand({});

describe("DeleteCommandConfirm", () => {
  it("names the command and says what happens to the agents it was granted to", () => {
    // The grant stays behind and points at nothing; the question says so.
    render(<DeleteCommandConfirm command={command} onConfirm={() => {}} onDismiss={() => {}} />);

    expect(screen.getByText(DELETE_COMMAND_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(`${DELETE_COMMAND_NOTE_PREFIX}open_pr${DELETE_COMMAND_NOTE_SUFFIX}`)).toBeInTheDocument();
  });

  it("deletes on the yes", async () => {
    const onConfirm = vi.fn();

    render(<DeleteCommandConfirm command={command} onConfirm={onConfirm} onDismiss={() => {}} />);
    await userEvent.click(screen.getByText(CONFIRM_DIALOG_YES_LABEL));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
