import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { grantedServerIds } from "./granted-server-ids";
import { aConfig, anAgent } from "../../../utils/testing";
import type { ToolGrant } from "../../../contracts";

const SERVER_GRANT: ToolGrant = {
  id: "grant-1",
  source: "mcp",
  serverId: "server-1",
  functionName: "search",
};

const OTHER_SERVER_GRANT: ToolGrant = {
  id: "grant-2",
  source: "mcp",
  serverId: "server-2",
  functionName: "fetch",
};

const AGENT_GRANT: ToolGrant = {
  id: "grant-3",
  source: "agent",
  agentId: "agent-2",
};

describe("grantedServerIds", () => {
  it("names the servers the agent itself is granted", () => {
    const root = anAgent({
      tools: [SERVER_GRANT],
    });

    assert.deepEqual(
      grantedServerIds(
        root,
        aConfig({
          agents: [root],
        }),
      ),
      ["server-1"],
    );
  });

  it("follows agent grants, so a sub-agent's servers are named too", () => {
    const root = anAgent({
      tools: [AGENT_GRANT],
    });
    const sub = anAgent({
      id: "agent-2",
      tools: [OTHER_SERVER_GRANT],
    });

    assert.deepEqual(
      grantedServerIds(
        root,
        aConfig({
          agents: [root, sub],
        }),
      ),
      ["server-2"],
    );
  });

  it("leaves out the servers of an agent nobody reaches", () => {
    const root = anAgent();
    const stranger = anAgent({
      id: "agent-3",
      tools: [SERVER_GRANT],
    });

    assert.deepEqual(
      grantedServerIds(
        root,
        aConfig({
          agents: [root, stranger],
        }),
      ),
      [],
    );
  });

  it("does not loop where two agents grant each other", () => {
    const root = anAgent({
      tools: [AGENT_GRANT, SERVER_GRANT],
    });
    const sub = anAgent({
      id: "agent-2",
      tools: [
        {
          id: "grant-4",
          source: "agent",
          agentId: "agent-1",
        },
      ],
    });

    assert.deepEqual(
      grantedServerIds(
        root,
        aConfig({
          agents: [root, sub],
        }),
      ),
      ["server-1"],
    );
  });
});
