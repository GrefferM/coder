import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LostGrants } from "./lost-grants";
import { LOST_GRANTS_NOTES, LOST_GRANTS_REMOVE_LABEL } from "./constants";
import { TOOLS_SECTION_LOST_NAME } from "../tools-section/constants";
import type { BrokenGrantGroup } from "../tools-section/interfaces";

function commands(rows: number): BrokenGrantGroup {
  return {
    key: "commands",
    cause: "command",
    serverName: null,
    rows: Array.from(
      {
        length: rows,
      },
      (unused, index) => ({
        id: `grant-${index}`,
        name: TOOLS_SECTION_LOST_NAME,
        pinnedCount: 0,
      }),
    ),
  };
}

describe("LostGrants", () => {
  it("says what is wrong: the command is gone and the grant calls what is not there", () => {
    // Lost grants form their own group after the working ones, not counted with them.
    render(<LostGrants groups={[commands(1)]} onRemove={() => {}} />);

    expect(screen.getByText(LOST_GRANTS_NOTES.command)).toBeInTheDocument();
    expect(screen.getByText(TOOLS_SECTION_LOST_NAME)).toBeInTheDocument();
  });

  it("keeps counting the fixed arguments of a lost grant, struck through with the rest of it", () => {
    render(
      <LostGrants
        groups={[
          {
            ...commands(1),
            rows: [
              {
                id: "grant-1",
                name: TOOLS_SECTION_LOST_NAME,
                pinnedCount: 3,
              },
            ],
          },
        ]}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("says the server beside a function it took away, and names no server where none is left", () => {
    // A standing server shows its name; a gone one leaves only its id.
    render(
      <LostGrants
        groups={[
          {
            key: "server:server-1",
            cause: "goneFunction",
            serverName: "github-mcp",
            rows: [
              {
                id: "grant-1",
                name: "pulls.merge",
                pinnedCount: 0,
              },
            ],
          },
          {
            key: "gone:server-2",
            cause: "goneServer",
            serverName: null,
            rows: [
              {
                id: "grant-2",
                name: "fs.write_file",
                pinnedCount: 0,
              },
            ],
          },
        ]}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByText("pulls.merge")).toBeInTheDocument();
    expect(screen.getByText("github-mcp")).toBeInTheDocument();
    expect(screen.getByText("fs.write_file")).toBeInTheDocument();
    expect(screen.getByText(LOST_GRANTS_NOTES.goneFunction)).toBeInTheDocument();
    expect(screen.getByText(LOST_GRANTS_NOTES.goneServer)).toBeInTheDocument();
  });

  it("says a server lacks a function by that name, true whether it dropped it or never had it", () => {
    render(
      <LostGrants
        groups={[
          {
            key: "server:server-1",
            cause: "goneFunction",
            serverName: "deepwiki",
            rows: [
              {
                id: "grant-1",
                name: "ask_question",
                pinnedCount: 0,
              },
            ],
          },
        ]}
        onRemove={() => {}}
      />,
    );

    expect(
      screen.getByText("На сервері немає функції з такою назвою. Видача лишилась — агент кличе те, чого немає."),
    ).toBeInTheDocument();
  });

  it("stands a row for every lost grant", () => {
    render(<LostGrants groups={[commands(2)]} onRemove={() => {}} />);

    expect(screen.getAllByText(TOOLS_SECTION_LOST_NAME)).toHaveLength(2);
  });

  it("clears the whole group at once, and says how much that is", async () => {
    // Two functions of one server are one removal act, which says what it takes away.
    const onRemove = vi.fn();

    render(<LostGrants groups={[commands(2)]} onRemove={onRemove} />);
    await userEvent.click(screen.getByText(`${LOST_GRANTS_REMOVE_LABEL} · 2`));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("says no count where the act takes away one", () => {
    render(<LostGrants groups={[commands(1)]} onRemove={() => {}} />);

    expect(screen.getByText(LOST_GRANTS_REMOVE_LABEL)).toBeInTheDocument();
  });
});
