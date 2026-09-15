import { describe, expect, it } from "vitest";
import { grantedToolsLabel } from "./granted-tools-label";
import type { CommandToolGrant, McpToolGrant, ProjectCommand, ProjectMcpServer } from "../../../interfaces";
import { aCommand } from "../../../testing";

const COMMANDS: ProjectCommand[] = [
  aCommand({
    name: "run_tests",
    description: "Прогнати тести",
    run: "npm test",
  }),
  aCommand({
    id: "command-2",
    name: "deploy",
    description: "Викотити збірку",
    run: "npm run deploy",
  }),
];

const SERVERS: ProjectMcpServer[] = [
  {
    id: "server-1",
    name: "GITHUB",
    isLocal: false,
    run: "",
    address: "https://example.test/mcp",
    signIn: "none",
    env: [],
  },
];

const serverGrant = (functionName: string, serverId = "server-1"): McpToolGrant => ({
  id: `grant-${serverId}-${functionName}`,
  source: "mcp",
  serverId,
  functionName,
});

const grant = (commandId: string, pinned: CommandToolGrant["pinned"] = []): CommandToolGrant => ({
  id: `grant-${commandId}`,
  source: "command",
  commandId,
  pinned,
});

describe("grantedToolsLabel", () => {
  it("says having none in words rather than as a zero", () => {
    expect(grantedToolsLabel([], COMMANDS, SERVERS)).toBe("без інструментів");
  });

  it("names the functions themselves, in the order they were granted", () => {
    expect(grantedToolsLabel([grant("command-2"), grant("command-1")], COMMANDS, SERVERS)).toBe("deploy, run_tests");
  });

  it("says what a grant fixes beside the name, so a moved value counts as a change", () => {
    const pinned = [
      {
        id: "pinned-1",
        parameterId: "parameter-1",
        value: "auth/*.spec.ts",
      },
    ];
    const commands = [
      {
        ...COMMANDS[0],
        parameters: [
          {
            id: "parameter-1",
            name: "pattern",
            type: "text" as const,
            description: "Маска файлів тестів",
            isRequired: false,
            values: [],
          },
        ],
      },
    ];

    expect(grantedToolsLabel([grant("command-1", pinned)], commands, SERVERS)).toBe(
      "run_tests(pattern=auth/*.spec.ts)",
    );
  });

  it("falls back to the id when the command behind a grant is gone", () => {
    expect(grantedToolsLabel([grant("command-9")], COMMANDS, SERVERS)).toBe("command-9");
  });

  it("names a server's function by the server it belongs to, so two of one name do not read alike", () => {
    expect(grantedToolsLabel([serverGrant("search")], COMMANDS, SERVERS)).toBe("GITHUB · search");
  });

  it("counts a server's function as granted at all — a grant left out of this line could never be seen to move", () => {
    const withServer = grantedToolsLabel([grant("command-1"), serverGrant("search")], COMMANDS, SERVERS);

    expect(withServer).not.toBe(grantedToolsLabel([grant("command-1")], COMMANDS, SERVERS));
  });

  it("falls back to the id when the server behind a grant is gone", () => {
    expect(grantedToolsLabel([serverGrant("search", "server-gone")], COMMANDS, SERVERS)).toBe("server-gone · search");
  });
});
