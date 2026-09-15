import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileConflictConfirm } from "./file-conflict-confirm";
import {
  FILE_CONFLICT_DISK_LABEL,
  FILE_CONFLICT_KEEP_LABEL,
  FILE_CONFLICT_MINE_LABEL,
  FILE_CONFLICT_NOTHING_LABEL,
  FILE_CONFLICT_QUESTION,
  FILE_CONFLICT_TAKE_LABEL,
} from "./constants";

describe("FileConflictConfirm", () => {
  it("puts what is on screen beside what is on disk, and decides neither", () => {
    render(
      <FileConflictConfirm
        mine={["~ ім'я"]}
        onDisk={["+ агент FIXER", "− зв'язок PLANNER → TESTER"]}
        onKeep={() => {}}
        onTake={() => {}}
      />,
    );

    expect(screen.getByText(FILE_CONFLICT_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(FILE_CONFLICT_MINE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(FILE_CONFLICT_DISK_LABEL)).toBeInTheDocument();
    expect(screen.getByText("+ агент FIXER")).toBeInTheDocument();
    expect(screen.getByText("− зв'язок PLANNER → TESTER")).toBeInTheDocument();
  });

  it("says «нічого» for a side with no lines rather than leaving it blank", () => {
    render(<FileConflictConfirm mine={[]} onDisk={["+ агент FIXER"]} onKeep={() => {}} onTake={() => {}} />);

    expect(screen.getByText(FILE_CONFLICT_NOTHING_LABEL)).toBeInTheDocument();
  });

  it("keeps the person's own work on «Лишити моє», and takes the file on «Взяти з диска»", async () => {
    const onKeep = vi.fn();
    const onTake = vi.fn();

    render(<FileConflictConfirm mine={["~ ім'я"]} onDisk={["+ агент FIXER"]} onKeep={onKeep} onTake={onTake} />);
    await userEvent.click(screen.getByText(FILE_CONFLICT_KEEP_LABEL));

    expect(onKeep).toHaveBeenCalled();

    await userEvent.click(screen.getByText(FILE_CONFLICT_TAKE_LABEL));

    expect(onTake).toHaveBeenCalled();
  });
});
