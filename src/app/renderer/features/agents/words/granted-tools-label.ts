import {
  GRANTED_TOOLS_PINNED_CLOSE,
  GRANTED_TOOLS_PINNED_OPEN,
  GRANTED_TOOLS_PINNED_SEPARATOR,
  GRANTED_TOOLS_PINNED_SIGN,
  GRANTED_TOOLS_SEPARATOR,
  GRANTED_TOOLS_SERVER_SIGN,
  NO_TOOLS_LABEL,
} from "../constants";
import { isCommandGrant } from "../../../interfaces";
import type { CommandToolGrant, McpToolGrant, ProjectCommand, ProjectMcpServer, ToolGrant } from "../../../interfaces";

/**
 * An agent's grants as one line, each name with what is fixed on it; none said in words.
 *
 * This line is how a grant is compared with the one saved, so everything that can be granted has to reach it:
 * a grant left out of it can be added or taken away and the tab would never call itself changed.
 */
export function grantedToolsLabel(
  grants: ToolGrant[],
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
): string {
  if (grants.length === 0) {
    return NO_TOOLS_LABEL;
  }

  return grants
    .map((grant) => (isCommandGrant(grant) ? commandSaid(grant, commands) : serverSaid(grant, servers)))
    .join(GRANTED_TOOLS_SEPARATOR);
}

/** A command by its name, with every value fixed on it in brackets after it. */
function commandSaid(grant: CommandToolGrant, commands: ProjectCommand[]): string {
  const command = commands.find((item) => item.id === grant.commandId) ?? null;
  const name = command?.name ?? grant.commandId;

  if (grant.pinned.length === 0) {
    return name;
  }

  const pinned = grant.pinned
    .map((argument) => {
      const parameter = command?.parameters.find((item) => item.id === argument.parameterId) ?? null;

      return `${parameter?.name ?? argument.parameterId}${GRANTED_TOOLS_PINNED_SIGN}${argument.value}`;
    })
    .join(GRANTED_TOOLS_PINNED_SEPARATOR);

  return `${name}${GRANTED_TOOLS_PINNED_OPEN}${pinned}${GRANTED_TOOLS_PINNED_CLOSE}`;
}

/**
 * A server's function, named after the server it belongs to: the name alone is not its handle — two servers
 * may both call a function `search`, and one swapped for the other has to read as the change it is. A server
 * the project no longer declares stands as its id, the way a command gone stands as its own.
 */
function serverSaid(grant: McpToolGrant, servers: ProjectMcpServer[]): string {
  const server = servers.find((item) => item.id === grant.serverId) ?? null;

  return `${server?.name ?? grant.serverId}${GRANTED_TOOLS_SERVER_SIGN}${grant.functionName}`;
}
