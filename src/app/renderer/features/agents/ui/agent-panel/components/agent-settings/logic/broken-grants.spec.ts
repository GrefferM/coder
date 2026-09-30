import { describe, expect, it } from "vitest";
import { brokenGrants } from "./broken-grants";
import { TOOLS_SECTION_LOST_NAME } from "../components/tools-section/constants";
import { aCommand } from "../../../../../../../testing";
import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../../../../../interfaces";
import { NO_MCP_CALLS } from "../../../../../../../interfaces";

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

function granted(functionName: string, serverId: string = SERVER_ID): ToolGrant {
  return {
    id: `grant-${functionName}`,
    source: "mcp",
    serverId,
    functionName,
  };
}

describe("brokenGrants · nothing is broken", () => {
  it("says nothing where every grant still has what it points at", () => {
    expect(
      brokenGrants([granted("pulls.create")], {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
    ).toEqual([]);
  });

  it("breaks nothing while the server has not answered yet", () => {
    // A server still starting knows no functions this moment; «unknown» is not «gone».
    const asked = look({
      isUp: false,
      functions: [],
      answeredAt: null,
    });

    expect(
      brokenGrants([granted("pulls.merge")], {
        commands: [],
        servers: [SERVER],
        looks: asked,
        agents: [],
      }),
    ).toEqual([]);
  });

  it("breaks nothing when the server fell", () => {
    const fallen = look({
      isUp: false,
      functions: [],
      answeredAt: 1_700_000_000_000,
      failure: "ПРОЦЕС УПАВ",
    });

    expect(
      brokenGrants([granted("pulls.merge")], {
        commands: [],
        servers: [SERVER],
        looks: fallen,
        agents: [],
      }),
    ).toEqual([]);
  });
});

describe("brokenGrants · the three reasons", () => {
  it("breaks a function the standing server no longer gives", () => {
    // It answered, and this name is not in what it answered with.
    const groups = brokenGrants([granted("pulls.merge")], {
      commands: [],
      servers: [SERVER],
      looks: look(),
      agents: [],
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].cause).toBe("goneFunction");
    expect(groups[0].serverName).toBe("github-mcp");
    expect(groups[0].rows.map((row) => row.name)).toEqual(["pulls.merge"]);
  });

  it("breaks every grant of a server the project no longer names, and says no name for it", () => {
    // The name lived in the server's own file and went with it; only the id is left.
    const groups = brokenGrants([granted("fs.read_file", "server-gone"), granted("fs.write_file", "server-gone")], {
      commands: [],
      servers: [],
      looks: {},
      agents: [],
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].cause).toBe("goneServer");
    expect(groups[0].serverName).toBeNull();
    expect(groups[0].rows.map((row) => row.name)).toEqual(["fs.read_file", "fs.write_file"]);
  });

  it("keeps a gone server's functions in one group, so one act takes them away", () => {
    const groups = brokenGrants([granted("fs.read_file", "server-gone"), granted("fs.write_file", "server-gone")], {
      commands: [],
      servers: [],
      looks: {},
      agents: [],
    });

    expect(groups).toHaveLength(1);
  });

  it("breaks a grant whose command is gone, and gives it no name to strike through", () => {
    // A command grant carries an id, not a name — there is nothing of the command left to show.
    const groups = brokenGrants(
      [
        {
          id: "grant-1",
          source: "command",
          commandId: "command-gone",
          pinned: [
            {
              id: "pinned-1",
              parameterId: "parameter-1",
              value: "--watch",
            },
          ],
        },
      ],
      {
        commands: [aCommand()],
        servers: [],
        looks: {},
        agents: [],
      },
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].cause).toBe("command");
    expect(groups[0].rows).toEqual([
      {
        id: "grant-1",
        name: TOOLS_SECTION_LOST_NAME,
        pinnedCount: 1,
      },
    ]);
  });
});

describe("brokenGrants · several reasons at once", () => {
  it("stands a group per reason, servers first and the commands last", () => {
    const groups = brokenGrants(
      [
        granted("pulls.merge"),
        granted("fs.read_file", "server-gone"),
        {
          id: "grant-command",
          source: "command",
          commandId: "command-gone",
          pinned: [],
        },
      ],
      {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      },
    );

    expect(groups.map((group) => group.cause)).toEqual(["goneFunction", "goneServer", "command"]);
  });
});
