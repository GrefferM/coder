import { describe, expect, it } from "vitest";
import { brokenCause, hasBrokenGrant } from "./broken-cause";
import { aCommand } from "../testing";
import type { McpLook, ProjectMcpServer, ToolGrant } from "../interfaces";
import { NO_MCP_CALLS } from "../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

const SERVER: ProjectMcpServer = {
  id: SERVER_ID,
  name: "github-mcp",
  isLocal: false,
  run: "",
  address: "https://mcp.example.com/mcp",
  signIn: "token",
  env: [],
};

const COMMAND = aCommand();

function look(patch: Partial<McpLook> = {}): Record<string, McpLook> {
  return {
    [SERVER_ID]: {
      serverId: SERVER_ID,
      isUp: true,
      functions: [
        {
          name: "pulls.create",
          description: "Відкрити пул-реквест",
          parameters: {},
        },
      ],
      answeredAt: 1_700_000_000_000,
      failure: null,
      changedAt: null,
      wasCount: null,
      calls: NO_MCP_CALLS,
      ...patch,
    },
  };
}

function onServer(functionName: string, serverId: string = SERVER_ID): ToolGrant {
  return {
    id: `grant-${functionName}`,
    source: "mcp",
    serverId,
    functionName,
  };
}

const ON_COMMAND: ToolGrant = {
  id: "grant-command",
  source: "command",
  commandId: COMMAND.id,
  pinned: [],
};

describe("brokenCause", () => {
  it("says nothing of a grant on a declared command", () => {
    expect(brokenCause(ON_COMMAND, [COMMAND], [], {})).toBeNull();
  });

  it("names the command that is no longer declared", () => {
    expect(brokenCause(ON_COMMAND, [], [], {})).toBe("command");
  });

  it("says nothing of a function the server still offers", () => {
    expect(brokenCause(onServer("pulls.create"), [], [SERVER], look())).toBeNull();
  });

  it("names the function the server took away when it updated", () => {
    // It answered, and this name is not in what it answered with.
    expect(brokenCause(onServer("pulls.merge"), [], [SERVER], look())).toBe("goneFunction");
  });

  it("names the server the project no longer holds", () => {
    expect(brokenCause(onServer("fs.read_file", "server-gone"), [], [SERVER], look())).toBe("goneServer");
  });

  it("breaks nothing while the server has not answered", () => {
    // A process still starting knows no functions this moment; «unknown» is not «gone», and a turn must not stop.
    const asked = look({
      isUp: false,
      functions: [],
      answeredAt: null,
    });

    expect(brokenCause(onServer("pulls.merge"), [], [SERVER], asked)).toBeNull();
  });

  it("breaks nothing when the server fell", () => {
    const fallen = look({
      isUp: false,
      functions: [],
      answeredAt: 1_700_000_000_000,
      failure: "ПРОЦЕС УПАВ",
    });

    expect(brokenCause(onServer("pulls.merge"), [], [SERVER], fallen)).toBeNull();
  });

  it("breaks nothing where nobody has asked the server at all", () => {
    expect(brokenCause(onServer("pulls.merge"), [], [SERVER], {})).toBeNull();
  });
});

describe("hasBrokenGrant", () => {
  it("is true where one of many grants points at nothing", () => {
    expect(hasBrokenGrant([onServer("pulls.create"), onServer("pulls.merge")], [], [SERVER], look())).toBe(true);
  });

  it("is false where every grant still points at something", () => {
    expect(hasBrokenGrant([ON_COMMAND, onServer("pulls.create")], [COMMAND], [SERVER], look())).toBe(false);
  });

  it("is false for an agent armed with nothing", () => {
    expect(hasBrokenGrant([], [], [SERVER], look())).toBe(false);
  });
});
