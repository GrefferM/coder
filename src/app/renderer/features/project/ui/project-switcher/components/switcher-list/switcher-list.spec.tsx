import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SwitcherList } from "./switcher-list";
import {
  SWITCHER_CLOSE_LABEL,
  SWITCHER_LIST_LABEL,
  SWITCHER_NEW_PROJECT_LABEL,
  SWITCHER_OPEN_FOLDER_LABEL,
  SWITCHER_REVEAL_LABEL,
} from "../../constants";
import type { ListWalk } from "../../../../../../hooks";
import type { OpenProject, ProjectEntry } from "../../../../../../interfaces";
import { aConfig } from "../../../../../../testing";

const walk: ListWalk = {
  walked: -1,
  walkTo: () => {},
  onKeyDown: () => {},
  walkedRow: () => {},
};

const project: OpenProject = {
  directory: "/code/coder",
  config: aConfig({
    name: "Coder",
  }),
  view: null,
};

function entry(patch: Partial<ProjectEntry> = {}): ProjectEntry {
  return {
    id: "entry-1",
    name: "Інший",
    directory: "/work/other",
    openedAt: "2026-09-01T10:00:00.000Z",
    exists: true,
    agentCount: 2,
    ...patch,
  };
}

function acts() {
  return {
    onSwitch: vi.fn(),
    onForget: vi.fn(),
    onChooseFolder: vi.fn(),
    onStartProject: vi.fn(),
    onReveal: vi.fn(),
    onClose: vi.fn(),
  };
}

describe("SwitcherList", () => {
  it("stands the open project first and the remembered ones under it", () => {
    // This project, then the others, then what can be done besides.
    render(<SwitcherList project={project} others={[entry()]} walk={walk} {...acts()} />);

    expect(screen.getByText(SWITCHER_LIST_LABEL)).toBeInTheDocument();

    const rows = screen.getAllByRole("menuitem");

    expect(rows[0]).toHaveTextContent("Coder");
    expect(rows[1]).toHaveTextContent("Інший");
  });

  it("offers the four acts under the projects, in order", () => {
    render(<SwitcherList project={project} others={[]} walk={walk} {...acts()} />);

    expect(
      screen
        .getAllByRole("menuitem")
        .map((row) => row.textContent)
        .slice(1),
    ).toEqual([SWITCHER_OPEN_FOLDER_LABEL, SWITCHER_NEW_PROJECT_LABEL, SWITCHER_CLOSE_LABEL, SWITCHER_REVEAL_LABEL]);
  });

  it("goes to the project a row names, and does each act by its own row", async () => {
    const said = acts();

    render(<SwitcherList project={project} others={[entry()]} walk={walk} {...said} />);
    await userEvent.click(screen.getByText("Інший"));

    expect(said.onSwitch).toHaveBeenCalledWith("/work/other");

    await userEvent.click(screen.getByText(SWITCHER_NEW_PROJECT_LABEL));

    expect(said.onStartProject).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(SWITCHER_CLOSE_LABEL));

    expect(said.onClose).toHaveBeenCalledOnce();
  });

  it("keeps a click of its own to itself, so only its rows close it", async () => {
    const onOutside = vi.fn();
    const said = acts();

    render(
      <div role="presentation" onClick={onOutside}>
        <SwitcherList project={project} others={[]} walk={walk} {...said} />
      </div>,
    );
    await userEvent.click(screen.getByText(SWITCHER_LIST_LABEL));

    expect(onOutside).not.toHaveBeenCalled();
  });
});
