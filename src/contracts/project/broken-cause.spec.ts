import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brokenCause, hasBrokenGrant } from "./broken-cause";
import { NO_MCP_CALLS } from "../mcp";
import { aCommand, anAgent } from "../testing";
import type { McpLook } from "../mcp";
import type { ProjectMcpServer } from "./mcp-server.interface";
import type { ToolGrant } from "./tool-grant.type";

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
    assert.equal(
      brokenCause(ON_COMMAND, {
        commands: [COMMAND],
        servers: [],
        looks: {},
        agents: [],
      }),
      null,
    );
  });

  it("names the command that is no longer declared", () => {
    assert.equal(
      brokenCause(ON_COMMAND, {
        commands: [],
        servers: [],
        looks: {},
        agents: [],
      }),
      "command",
    );
  });

  it("says nothing of a function the server still offers", () => {
    assert.equal(
      brokenCause(onServer("pulls.create"), {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      null,
    );
  });

  it("names the function the server took away when it updated", () => {
    // It answered, and this name is not in what it answered with.
    assert.equal(
      brokenCause(onServer("pulls.merge"), {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      "goneFunction",
    );
  });

  it("names the server the project no longer holds", () => {
    assert.equal(
      brokenCause(onServer("fs.read_file", "server-gone"), {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      "goneServer",
    );
  });

  it("breaks nothing while the server has not answered", () => {
    // A process still starting knows no functions yet; «unknown» is not «gone», and a turn must not stop.
    const asked = look({
      isUp: false,
      functions: [],
      answeredAt: null,
    });

    assert.equal(
      brokenCause(onServer("pulls.merge"), {
        commands: [],
        servers: [SERVER],
        looks: asked,
        agents: [],
      }),
      null,
    );
  });

  it("breaks nothing when the server fell", () => {
    const fallen = look({
      isUp: false,
      functions: [],
      answeredAt: 1_700_000_000_000,
      failure: "ПРОЦЕС УПАВ",
    });

    assert.equal(
      brokenCause(onServer("pulls.merge"), {
        commands: [],
        servers: [SERVER],
        looks: fallen,
        agents: [],
      }),
      null,
    );
  });

  it("breaks nothing where nobody has asked the server at all", () => {
    assert.equal(
      brokenCause(onServer("pulls.merge"), {
        commands: [],
        servers: [SERVER],
        looks: {},
        agents: [],
      }),
      null,
    );
  });
});

describe("brokenCause · an agent granted as a tool", () => {
  const ON_AGENT: ToolGrant = {
    id: "grant-agent",
    source: "agent",
    agentId: "agent-2",
  };

  it("says nothing of an agent the project still holds", () => {
    assert.equal(
      brokenCause(ON_AGENT, {
        commands: [],
        servers: [],
        looks: {},
        agents: [
          anAgent({
            id: "agent-2",
          }),
        ],
      }),
      null,
    );
  });

  it("names the agent the project has let go", () => {
    assert.equal(
      brokenCause(ON_AGENT, {
        commands: [],
        servers: [],
        looks: {},
        agents: [],
      }),
      "goneAgent",
    );
  });
});

describe("hasBrokenGrant", () => {
  it("is true where one of many grants points at nothing", () => {
    assert.equal(
      hasBrokenGrant([onServer("pulls.create"), onServer("pulls.merge")], {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      true,
    );
  });

  it("is false where every grant still points at something", () => {
    assert.equal(
      hasBrokenGrant([ON_COMMAND, onServer("pulls.create")], {
        commands: [COMMAND],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      false,
    );
  });

  it("is false for an agent armed with nothing", () => {
    assert.equal(
      hasBrokenGrant([], {
        commands: [],
        servers: [SERVER],
        looks: look(),
        agents: [],
      }),
      false,
    );
  });
});

describe("brokenCause of a system command", () => {
  it("never calls a system grant broken, since it points at nothing the project could drop", () => {
    const grant: ToolGrant = {
      id: "grant-9",
      source: "system",
      command: "pass_to",
    };

    assert.equal(
      brokenCause(grant, {
        commands: [],
        servers: [],
        looks: {},
        agents: [],
      }),
      null,
    );
  });
});
