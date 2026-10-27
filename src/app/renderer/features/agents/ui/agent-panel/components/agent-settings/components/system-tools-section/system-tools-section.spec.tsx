import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SystemToolsSection } from "./system-tools-section";
import { SYSTEM_TOOLS_SECTION_LOCKED_NOTE, SYSTEM_TOOLS_SECTION_NO_LINES_NOTE } from "./constants";
import type { ToolGrant } from "../../../../../../../../interfaces";

const PASS: ToolGrant = {
  id: "grant-pass",
  source: "system",
  command: "pass_to",
};

/** A command's grant, which this section neither counts nor touches. */
const COMMAND_GRANT: ToolGrant = {
  id: "grant-command",
  source: "command",
  commandId: "command-1",
  pinned: [],
};

function renderSection(grants: ToolGrant[], followerCount = 2, isLocked = false) {
  const onGrantsChange = vi.fn();

  render(
    <SystemToolsSection
      grants={grants}
      followerCount={followerCount}
      wasValue={null}
      isLocked={isLocked}
      onGrantsChange={onGrantsChange}
    />,
  );

  return {
    onGrantsChange,
  };
}

function openList() {
  fireEvent.click(
    screen.getByRole("button", {
      expanded: false,
    }),
  );
}

describe("SystemToolsSection", () => {
  it("offers both system commands by their names", () => {
    renderSection([]);
    openList();

    expect(screen.getByLabelText("Видати pass_to")).toBeInTheDocument();
    expect(screen.getByLabelText("Видати finish_here")).toBeInTheDocument();
  });

  it("says how many are granted, counting no other kind of grant", () => {
    renderSection([COMMAND_GRANT, PASS]);

    expect(screen.getByText("СИСТЕМНІ · 1")).toBeInTheDocument();
    expect(screen.getByText("1 з 2 команд")).toBeInTheDocument();
  });

  it("grants a command with a click and keeps the other grants standing", () => {
    const { onGrantsChange } = renderSection([COMMAND_GRANT]);

    openList();
    fireEvent.click(screen.getByLabelText("Видати finish_here"));

    expect(onGrantsChange).toHaveBeenCalledWith([
      COMMAND_GRANT,
      expect.objectContaining({
        source: "system",
        command: "finish_here",
      }),
    ]);
  });

  it("takes a granted command back with a click, leaving the rest", () => {
    const { onGrantsChange } = renderSection([COMMAND_GRANT, PASS]);

    openList();
    fireEvent.click(screen.getByLabelText("Видати pass_to"));

    expect(onGrantsChange).toHaveBeenCalledWith([COMMAND_GRANT]);
  });

  it("stands a granted command under the field, quiet while a line leads out", () => {
    renderSection([PASS], 1);

    expect(screen.getByText("pass_to")).toBeInTheDocument();
    expect(screen.queryByText(SYSTEM_TOOLS_SECTION_NO_LINES_NOTE)).not.toBeInTheDocument();
  });

  it("dims a granted command and says why where no line goes out of the agent", () => {
    renderSection([PASS], 0);

    expect(screen.getByText(SYSTEM_TOOLS_SECTION_NO_LINES_NOTE)).toBeInTheDocument();
  });

  it("shuts the picker where the provider has no function calls, keeping the count", () => {
    renderSection([PASS], 1, true);

    expect(screen.getByText(SYSTEM_TOOLS_SECTION_LOCKED_NOTE)).toBeInTheDocument();
    expect(screen.getByText("СИСТЕМНІ · 1")).toBeInTheDocument();
  });
});
