import { describe, expect, it } from "vitest";
import { foldHint, orbHint } from "./orb-hint";
import type { SourcesSaid } from "../interfaces";
import type { ToolGrant } from "../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "88888888-8888-4888-8888-888888888888";

function said(): SourcesSaid {
  return <SourcesSaid>(<unknown>{
    commands: [
      {
        id: "command-1",
        name: "run_test",
      },
      {
        id: "command-2",
        name: "run_lint",
      },
      {
        id: "command-3",
        name: "list_files",
      },
    ],
    servers: [
      {
        id: SERVER_ID,
        name: "playwright-mcp",
      },
      {
        id: OTHER_ID,
        name: "notion-mcp",
      },
    ],
    looks: {
      [SERVER_ID]: {
        functions: Array.from(
          {
            length: 24,
          },
          (_, at) => ({
            name: `f${at}`,
          }),
        ),
      },
      [OTHER_ID]: {
        functions: [
          {
            name: "search",
          },
        ],
      },
    },
  });
}

function ofCommand(commandId: string): ToolGrant {
  return <ToolGrant>(<unknown>{
    id: `grant-${commandId}`,
    source: "command",
    commandId,
    pinned: [],
  });
}

function ofServer(serverId: string, functionName: string): ToolGrant {
  return <ToolGrant>(<unknown>{
    id: `grant-${functionName}`,
    source: "mcp",
    serverId,
    functionName,
  });
}

describe("orbHint", () => {
  it("names a server and counts what is granted against what it hands over", () => {
    // «MCP-СЕРВЕР · playwright-mcp · 2 з 24 функцій» — and never the names of the functions themselves.
    const hint = orbHint(
      `server:${SERVER_ID}`,
      [ofServer(SERVER_ID, "browser_navigate"), ofServer(SERVER_ID, "browser_click")],
      said(),
    );

    expect(hint.kind).toBe("MCP-СЕРВЕР");
    expect(hint.name).toBe("playwright-mcp");
    expect(hint.count).toBe("2 з 24 функцій");
    // «24 імені в підказку не влазять і не для того вона».
    expect(hint.lines).toEqual([]);
  });

  it("says a server the project no longer names, since the grant stands until it is taken back", () => {
    const hint = orbHint("server:11111111-1111-4111-8111-111111111111", [], said());

    expect(hint.name).toBe("СЕРВЕРА НЕМАЄ");
    expect(hint.count).toBe("0 з 0 функцій");
  });

  it("names a command by its own name and says no number at all", () => {
    // One command is one mark, so «1 з 3 оголошених» would count the project's file and not this mark.
    const hint = orbHint("commands", [ofCommand("command-1")], said());

    expect(hint.kind).toBe("КОМАНДА ПРОЄКТУ");
    expect(hint.name).toBe("run_test");
    expect(hint.count).toBe("");
    expect(hint.lines).toEqual([]);
  });

  it("says a command the project has let go, since the grant stands until it is taken back", () => {
    const hint = orbHint("commands", [ofCommand("command-gone")], said());

    expect(hint.name).toBe("КОМАНДИ НЕМАЄ");
  });
});

describe("foldHint", () => {
  it("counts the commands behind a command's «+» and names each of them", () => {
    // A «+» folds one порода, so it has a noun of its own — and the lines say which ones are behind it.
    const hint = foldHint(
      [
        {
          group: "commands",
          granted: [ofCommand("command-2")],
        },
        {
          group: "commands",
          granted: [ofCommand("command-3")],
        },
      ],
      0,
      said(),
    );

    expect(hint.kind).toBe("ЩЕ 2 КОМАНДИ");
    expect(hint.lines).toEqual(["run_lint", "list_files"]);
  });

  it("counts the servers behind a server's «+», each with its own count of functions", () => {
    const hint = foldHint(
      [
        {
          group: `server:${OTHER_ID}`,
          granted: [ofServer(OTHER_ID, "search")],
        },
      ],
      0,
      said(),
    );

    expect(hint.kind).toBe("ЩЕ 1 СЕРВЕР");
    expect(hint.lines).toEqual(["notion-mcp · 1 з 1 функції"]);
  });
});
