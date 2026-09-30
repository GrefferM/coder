import { brokenCause } from "../../../../../../../logic";
import { isAgentGrant, isCommandGrant, isServerGrant, pointsAt } from "../../../../../../../interfaces";
import { TOOLS_SECTION_LOST_AGENT_NAME, TOOLS_SECTION_LOST_NAME } from "../components/tools-section/constants";
import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX } from "../../../../../../../constants";
import type { GrantTargets, McpToolGrant, ToolGrant } from "../../../../../../../interfaces";
import type { BrokenGrantGroup } from "../components/tools-section/interfaces";

/** A gone server has no name; the project holds only its id. */
const GONE_SERVER_PREFIX = "gone:";

/** Every unhonourable grant, grouped by reason; `brokenCause` decides why a grant is broken, this only groups. */
export function brokenGrants(grants: ToolGrant[], targets: GrantTargets): BrokenGrantGroup[] {
  const { servers } = targets;
  const cause = (grant: ToolGrant) => brokenCause(grant, targets);
  const held = grants.filter(isServerGrant);
  const groups: BrokenGrantGroup[] = [];

  // The server answered and this name is not among its functions.
  for (const server of servers) {
    const gone = held.filter((grant) => pointsAt(grant, server.id) && cause(grant) === "goneFunction");

    if (gone.length > 0) {
      groups.push({
        key: `${SERVER_GROUP_PREFIX}${server.id}`,
        cause: "goneFunction",
        serverName: server.name,
        rows: gone.map(functionRow),
      });
    }
  }

  // The server is gone from the project.
  for (const serverId of [...new Set(held.map((grant) => grant.serverId))]) {
    const gone = held.filter((grant) => pointsAt(grant, serverId) && cause(grant) === "goneServer");

    if (gone.length > 0) {
      groups.push({
        key: `${GONE_SERVER_PREFIX}${serverId}`,
        cause: "goneServer",
        serverName: null,
        rows: gone.map(functionRow),
      });
    }
  }

  // The command is gone; the grant carries its id and no name.
  const lost = grants.filter(isCommandGrant).filter((grant) => cause(grant) === "command");

  if (lost.length > 0) {
    groups.push({
      key: COMMANDS_GROUP_KEY,
      cause: "command",
      serverName: null,
      rows: lost.map((grant) => ({
        id: grant.id,
        name: TOOLS_SECTION_LOST_NAME,
        pinnedCount: grant.pinned.length,
      })),
    });
  }

  // The agent is gone; the grant carries its id and no name.
  const lostAgents = grants.filter(isAgentGrant).filter((grant) => cause(grant) === "goneAgent");

  if (lostAgents.length > 0) {
    groups.push({
      key: AGENTS_GROUP_KEY,
      cause: "goneAgent",
      serverName: null,
      rows: lostAgents.map((grant) => ({
        id: grant.id,
        name: TOOLS_SECTION_LOST_AGENT_NAME,
        pinnedCount: 0,
      })),
    });
  }

  return groups;
}

/** A server's function is named by the server; the row shows the name the grant points at. */
function functionRow(grant: McpToolGrant) {
  return {
    id: grant.id,
    name: grant.functionName,
    pinnedCount: 0,
  };
}
