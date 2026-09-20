import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolsSection } from "./tools-section";
import { LOST_GRANTS_NOTES } from "../lost-grants/constants";
import { TOOLS_SECTION_CHOOSE_LABEL, TOOLS_SECTION_LOCKED_NOTE } from "./constants";
import { PICKER_SEARCH_PLACEHOLDER } from "../../../../../../../../components/picker-shell/constants";
import { aCommand } from "../../../../../../../../testing";
import type { ProjectCommand, ToolGrant } from "../../../../../../../../interfaces";
import type { ToolsPress } from "../../../../../../interfaces";

const COMMANDS: ProjectCommand[] = [
  aCommand({
    name: "run_tests",
    description: "Прогнати тести проєкту й повернути звіт",
    run: "npm test",
  }),
  aCommand({
    id: "command-2",
    name: "deploy",
    description: "Викотити збірку на стенд",
    run: "npm run deploy",
  }),
];

const GRANT: ToolGrant = {
  id: "grant-1",
  source: "command",
  commandId: "command-1",
  pinned: [],
};

/** A grant the project file kept after the command under it went. */
const LOST_GRANT: ToolGrant = {
  id: "grant-2",
  source: "command",
  commandId: "command-gone",
  pinned: [],
};

/** A server's grant, which this section neither counts nor touches — it belongs to the section below. */
const SERVER_GRANT: ToolGrant = {
  id: "grant-3",
  source: "mcp",
  serverId: "99999999-9999-4999-8999-999999999999",
  functionName: "pulls.create",
};

function renderSection(
  grants: ToolGrant[],
  commands: ProjectCommand[] = COMMANDS,
  onOpenGrant: () => void = vi.fn(),
  press: ToolsPress | null = null,
  isLocked = false,
) {
  const onGrantsChange = vi.fn();

  render(
    <ToolsSection
      commands={commands}
      press={press}
      grants={grants}
      wasValue={null}
      isLocked={isLocked}
      onGrantsChange={onGrantsChange}
      onOpenGrant={onOpenGrant}
    />,
  );

  return onGrantsChange;
}

/** Opens the list over its field. */
function openList() {
  fireEvent.click(
    screen.getByRole("button", {
      expanded: false,
    }),
  );
}

describe("ToolsSection", () => {
  it("says which порода it holds and how much of it, since «ІНСТРУМЕНТИ» said neither", () => {
    renderSection([GRANT, SERVER_GRANT]);

    // The head of the commands is raised out of the list and stands over the section itself.
    expect(screen.getByText("КОМАНДИ · 1")).toBeInTheDocument();
    expect(screen.getByText("1 з 2 функцій")).toBeInTheDocument();
  });

  it("holds the declared commands and nothing of the servers", () => {
    renderSection([]);
    openList();

    expect(screen.getByLabelText(/run_tests/)).toBeInTheDocument();
    expect(screen.getByLabelText(/deploy/)).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("says so plainly while nothing is taken", () => {
    renderSection([SERVER_GRANT]);

    expect(screen.getByText("Обрати функції")).toBeInTheDocument();
  });

  it("stands what is taken under the field, with no tick and a way into the grant", () => {
    renderSection([GRANT]);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Відкрити видачу run_tests/)).toBeInTheDocument();
  });

  it("grants with the tick, and takes back with the same tick", () => {
    const onGrantsChange = renderSection([]);

    openList();
    fireEvent.click(screen.getByLabelText(/run_tests/));

    expect(onGrantsChange).toHaveBeenCalledWith([
      expect.objectContaining({
        source: "command",
        commandId: "command-1",
      }),
    ]);
  });

  it("keeps the servers' grants when its own tick writes the draft", () => {
    // Both sections write into one draft: what is shown is narrowed, what is kept never is.
    const onGrantsChange = renderSection([SERVER_GRANT]);

    openList();
    fireEvent.click(screen.getByLabelText(/run_tests/));

    expect(onGrantsChange).toHaveBeenCalledWith([
      SERVER_GRANT,
      expect.objectContaining({
        commandId: "command-1",
      }),
    ]);
  });

  it("searches its own list and simply filters it", () => {
    renderSection([]);
    openList();
    fireEvent.change(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER), {
      target: {
        value: "стенд",
      },
    });

    expect(screen.getByLabelText(/deploy/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/run_tests/)).not.toBeInTheDocument();
  });

  it("shows a grant whose command the project lost, and does not count it as a tool", () => {
    renderSection([GRANT, LOST_GRANT]);

    expect(screen.getByText("КОМАНДИ · 1")).toBeInTheDocument();
    expect(screen.getByText(LOST_GRANTS_NOTES.command)).toBeInTheDocument();
  });

  it("leaves a server's broken grant to the section that holds servers", () => {
    renderSection([
      GRANT,
      {
        id: "grant-4",
        source: "mcp",
        serverId: "gone-server",
        functionName: "pulls.merge",
      },
    ]);

    expect(screen.queryByText(LOST_GRANTS_NOTES.goneServer)).not.toBeInTheDocument();
  });

  it("says what having nothing to lend means, without lifting an act into the middle", () => {
    renderSection([], []);

    expect(screen.getByText(/Інструментів у проєкті ще немає/)).toBeInTheDocument();
  });

  it("opens on the press of the grey rest, which stands for no one thing and so has a list to open", () => {
    renderSection([GRANT], COMMANDS, vi.fn(), {
      group: null,
      grantId: null,
    });

    expect(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("stays shut on the press of a command's own mark, which opens that grant's page instead", () => {
    // The mark names the grant behind it, so there is nothing to choose from — the tab goes straight to the page.
    renderSection([GRANT], COMMANDS, vi.fn(), {
      group: "commands",
      grantId: GRANT.id,
    });

    expect(screen.queryByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("stays shut on the press of a server's mark, which belongs to the section below", () => {
    renderSection([GRANT], COMMANDS, vi.fn(), {
      group: "server:99999999-9999-4999-8999-999999999999",
      grantId: null,
    });

    expect(screen.queryByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("leaves the list closed where no press was made", () => {
    renderSection([GRANT]);

    expect(screen.queryByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("shuts the field where the model's provider carries no functions, and keeps what was granted listed", () => {
    // The grants are the person's own and nobody took them away; what is gone is the way to give more.
    renderSection(
      [
        {
          id: "grant-1",
          source: "command",
          commandId: COMMANDS[0].id,
          pinned: [],
        },
      ],
      COMMANDS,
      vi.fn(),
      null,
      true,
    );

    expect(screen.getByText(TOOLS_SECTION_LOCKED_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(TOOLS_SECTION_CHOOSE_LABEL)).not.toBeInTheDocument();
    expect(screen.getByText(COMMANDS[0].name)).toBeInTheDocument();
  });
});
