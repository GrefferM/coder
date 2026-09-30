import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecentProjectRow } from "./recent-project-row";
import { ROW_FORGET_LABEL, ROW_MISSING_LABEL, ROW_NOTE_SEPARATOR } from "./constants";
import { freshLabel } from "../../../../utils/dates";
import { agentsCountLabel } from "../../../../words";
import type { ProjectEntry } from "../../../../interfaces";

const OPENED_AT = new Date(2026, 8, 4, 14, 0).toISOString();
const opened = () => freshLabel(new Date(OPENED_AT).getTime(), Date.now());

function entry(patch: Partial<ProjectEntry> = {}): ProjectEntry {
  return {
    id: "entry-1",
    name: "Coder",
    directory: "/code/coder",
    openedAt: OPENED_AT,
    exists: true,
    agentCount: 3,
    ...patch,
  };
}

describe("RecentProjectRow", () => {
  it("names the project, its folder, how many agents stand in it and when it was last opened", () => {
    render(<RecentProjectRow entry={entry()} onOpen={() => {}} onForget={() => {}} />);

    expect(screen.getByText("Coder")).toBeInTheDocument();
    expect(screen.getByText("/code/coder")).toBeInTheDocument();
    expect(screen.getByText(`${agentsCountLabel(3)}${ROW_NOTE_SEPARATOR}${opened()}`)).toBeInTheDocument();
  });

  it("says a folder is gone instead of its path, counts nothing, and cannot be opened", () => {
    render(
      <RecentProjectRow
        entry={entry({
          exists: false,
        })}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(ROW_MISSING_LABEL)).toBeInTheDocument();
    expect(screen.queryByText("/code/coder")).not.toBeInTheDocument();
    expect(
      screen.queryByText(agentsCountLabel(3), {
        exact: false,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")[0]).toBeDisabled();
  });

  it("opens the project by its own folder, and drops it from the list by its own cross", async () => {
    const onOpen = vi.fn();
    const onForget = vi.fn();

    render(<RecentProjectRow entry={entry()} onOpen={onOpen} onForget={onForget} />);
    await userEvent.click(screen.getByText("Coder"));

    expect(onOpen).toHaveBeenCalledWith("/code/coder");

    await userEvent.click(screen.getByLabelText(ROW_FORGET_LABEL));

    expect(onForget).toHaveBeenCalledWith("/code/coder");
    // The cross drops the row from the list without opening the project.
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("keeps the cross on a gone folder, that being the only thing left to do with it", async () => {
    const onForget = vi.fn();

    render(
      <RecentProjectRow
        entry={entry({
          exists: false,
        })}
        onOpen={() => {}}
        onForget={onForget}
      />,
    );
    await userEvent.click(screen.getByLabelText(ROW_FORGET_LABEL));

    expect(onForget).toHaveBeenCalledOnce();
  });
});
