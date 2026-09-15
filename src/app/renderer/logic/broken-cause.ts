import { isCommandGrant } from "../interfaces";
import type { BrokenGrantCause, McpLook, ProjectCommand, ProjectMcpServer, ToolGrant } from "../interfaces";

/**
 * Why this grant points at nothing, or `null` where it still points at something. One rule
 * in one place, because four screens ask it and they must not disagree: the panel says the reason under the field,
 * the sphere wears «ФУНКЦІЯ ЗНИКЛА», the arc takes the trouble tone on that source, and the turn stops
 * before it is asked. That is why it stands here and not in one feature's own logic — the canvas would have had to
 * reach into the agents' to ask, and a rule two features copy is a rule that will one day disagree with itself.
 *
 * A server that has not answered breaks nothing. Still starting, or fallen, its functions are unknown this
 * moment and not gone, and a grant called broken on it would stop a turn with nothing wrong with it.
 */
export function brokenCause(
  grant: ToolGrant,
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
  looks: Record<string, McpLook>,
): BrokenGrantCause | null {
  if (isCommandGrant(grant)) {
    return commands.some((command) => command.id === grant.commandId) ? null : "command";
  }

  if (!servers.some((server) => server.id === grant.serverId)) {
    return "goneServer";
  }

  const look = looks[grant.serverId];

  if (look === undefined || !look.isUp || look.answeredAt === null) {
    return null;
  }

  return look.functions.some((offered) => offered.name === grant.functionName) ? null : "goneFunction";
}

/** Whether anything this agent is armed with points at nothing — one broken grant is enough. */
export function hasBrokenGrant(
  grants: ToolGrant[],
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
  looks: Record<string, McpLook>,
): boolean {
  return grants.some((grant) => brokenCause(grant, commands, servers, looks) !== null);
}
