import { isAgentGrant, isCommandGrant } from "../interfaces";
import type { BrokenGrantCause, GrantTargets, ToolGrant } from "../interfaces";

/**
 * Why this grant points at nothing, or `null` where it still points at something. One rule shared by the panel, the
 * sphere, the arc and the turn. A server that has not answered breaks nothing: its functions are unknown, not gone.
 */
export function brokenCause(grant: ToolGrant, targets: GrantTargets): BrokenGrantCause | null {
  const { commands, servers, looks, agents } = targets;

  if (isCommandGrant(grant)) {
    return commands.some((command) => command.id === grant.commandId) ? null : "command";
  }

  if (isAgentGrant(grant)) {
    return agents.some((agent) => agent.id === grant.agentId) ? null : "goneAgent";
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

/** Whether any grant of this agent points at nothing. */
export function hasBrokenGrant(grants: ToolGrant[], targets: GrantTargets): boolean {
  return grants.some((grant) => brokenCause(grant, targets) !== null);
}
