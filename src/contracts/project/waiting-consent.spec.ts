import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { waitingConsent } from "./waiting-consent";
import { NO_MCP_CALLS } from "../mcp";
import { aCommand } from "../testing";
import type { McpLook } from "../mcp";
import type { GrantTargets } from "./grant-targets.interface";
import type { ProjectMcpServer } from "./mcp-server.interface";
import type { ToolGrant } from "./tool-grant.type";

const EXA: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "exa-mcp",
  isLocal: true,
  run: "npx -y exa-mcp-server",
  address: "",
  signIn: "none",
  env: [],
};

const SHOP: ProjectMcpServer = {
  ...EXA,
  id: "88888888-8888-4888-8888-888888888888",
  name: "shop-db",
};

const COMMAND = aCommand();

function refused(serverId: string): McpLook {
  return {
    serverId,
    isUp: false,
    functions: [],
    answeredAt: null,
    failure: "Error: MCP_CONSENT_MISSING",
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
  };
}

function answered(serverId: string): McpLook {
  return {
    ...refused(serverId),
    isUp: true,
    answeredAt: 1_700_000_000_000,
    failure: null,
  };
}

function onServer(serverId: string): ToolGrant {
  return {
    id: `grant-${serverId}`,
    source: "mcp",
    serverId,
    functionName: "search",
  };
}

function targets(looks: Record<string, McpLook>): GrantTargets {
  return {
    commands: [COMMAND],
    servers: [EXA, SHOP],
    looks,
    agents: [],
  };
}

describe("waitingConsent", () => {
  it("names the granted server whose run line this machine has not agreed to", () => {
    const waiting = waitingConsent(
      [onServer(EXA.id)],
      targets({
        [EXA.id]: refused(EXA.id),
      }),
    );

    assert.equal(waiting?.id, EXA.id);
  });

  it("names the first such server in the order the grants stand", () => {
    const waiting = waitingConsent(
      [onServer(SHOP.id), onServer(EXA.id)],
      targets({
        [EXA.id]: refused(EXA.id),
        [SHOP.id]: refused(SHOP.id),
      }),
    );

    assert.equal(waiting?.id, SHOP.id);
  });

  it("names nobody where every granted server answered", () => {
    assert.equal(
      waitingConsent(
        [onServer(EXA.id)],
        targets({
          [EXA.id]: answered(EXA.id),
        }),
      ),
      null,
    );
  });

  it("names nobody for an agent granted no function of the server that waits", () => {
    const grants: ToolGrant[] = [
      {
        id: "grant-command",
        source: "command",
        commandId: COMMAND.id,
        pinned: [],
      },
    ];

    assert.equal(
      waitingConsent(
        grants,
        targets({
          [EXA.id]: refused(EXA.id),
        }),
      ),
      null,
    );
  });

  it("leaves a grant on a server the project no longer names to the broken grants", () => {
    assert.equal(waitingConsent([onServer("77777777-7777-4777-8777-777777777777")], targets({})), null);
  });
});
