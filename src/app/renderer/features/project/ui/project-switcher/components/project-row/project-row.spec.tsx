import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectRow } from "./project-row";
import { SWITCHER_AGENTS_SHORT_LABEL, SWITCHER_FORGET_LABEL, SWITCHER_MISSING_LABEL } from "../../constants";

describe("ProjectRow", () => {
  it("names the project, its folder and how many agents stand in it", () => {
    render(<ProjectRow name="Coder" directory="/code/coder" agentCount={7} onSelect={() => {}} />);

    expect(screen.getByText("Coder")).toBeInTheDocument();
    expect(screen.getByText("/code/coder")).toBeInTheDocument();
    expect(screen.getByText(`7${SWITCHER_AGENTS_SHORT_LABEL}`)).toBeInTheDocument();
  });

  it("ticks the open project and is no way anywhere, being where the person already is", () => {
    // The project the app stands on is the first row and cannot be walked to.
    render(<ProjectRow name="Coder" directory="/code/coder" agentCount={7} isCurrent />);

    const row = screen.getByRole("menuitem");

    expect(row).toHaveAttribute("aria-current", "true");
    expect(row).toBeDisabled();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("says a folder is gone instead of its path, and does not let it be picked", () => {
    render(<ProjectRow name="Старий" directory="/work/gone" agentCount={3} exists={false} onSelect={() => {}} />);

    expect(screen.getByText(SWITCHER_MISSING_LABEL)).toBeInTheDocument();
    expect(screen.queryByText("/work/gone")).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem")).toBeDisabled();
    // Nothing is counted where there is nothing to count.
    expect(screen.queryByText(`3${SWITCHER_AGENTS_SHORT_LABEL}`)).not.toBeInTheDocument();
  });

  it("switches to the project on a press, and drops it from the list by its own cross", async () => {
    const onSelect = vi.fn();
    const onForget = vi.fn();

    render(<ProjectRow name="Інший" directory="/work/other" agentCount={1} onSelect={onSelect} onForget={onForget} />);
    await userEvent.click(screen.getByRole("menuitem"));

    expect(onSelect).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByLabelText(SWITCHER_FORGET_LABEL));

    expect(onForget).toHaveBeenCalledOnce();
    // The cross drops the row from this machine's list; it is not the project's deletion.
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("offers no cross where there is nothing to drop", () => {
    render(<ProjectRow name="Coder" directory="/code/coder" isCurrent />);

    expect(screen.queryByLabelText(SWITCHER_FORGET_LABEL)).not.toBeInTheDocument();
  });
});
