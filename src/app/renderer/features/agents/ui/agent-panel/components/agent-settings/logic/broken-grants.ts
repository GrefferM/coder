import { brokenCause } from "../../../../../../../logic";
import { isCommandGrant, isServerGrant, pointsAt } from "../../../../../../../interfaces";
import { TOOLS_SECTION_LOST_NAME } from "../components/tools-section/constants";
import { COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX } from "../../../../../../../constants";
import type {
  McpLook,
  McpToolGrant,
  ProjectCommand,
  ProjectMcpServer,
  ToolGrant,
} from "../../../../../../../interfaces";
import type { BrokenGrantGroup } from "../components/tools-section/interfaces";

/** A group whose server is gone has no name left to stand under — the project holds only its id. */
const GONE_SERVER_PREFIX = "gone:";

/**
 * Every grant the project can no longer honour, gathered by **reason** — the rows look the same
 * and the sentence under them does not. Why a grant is broken is `brokenCause`'s to say, and it says it for the
 * sphere's mark and for the turn's wall too; this is only the grouping the panel needs.
 */
export function brokenGrants(
  grants: ToolGrant[],
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
  looks: Record<string, McpLook>,
): BrokenGrantGroup[] {
  const cause = (grant: ToolGrant) => brokenCause(grant, commands, servers, looks);
  const held = grants.filter(isServerGrant);
  const groups: BrokenGrantGroup[] = [];

  // The server stands, it answered, and this name is not in what it answered with.
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

  // The server itself is gone from the project, and the grant points at nothing at all.
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

  // The command is gone, and the grant carries its id and no name — there is nothing to strike through.
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

  return groups;
}

/** A server's function is named by the server, so the row says the name the grant still points at. */
function functionRow(grant: McpToolGrant) {
  return {
    id: grant.id,
    name: grant.functionName,
    pinnedCount: 0,
  };
}
