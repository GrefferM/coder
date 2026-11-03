import {
  GRANTED_TOOLS_PINNED_CLOSE,
  GRANTED_TOOLS_PINNED_OPEN,
  GRANTED_TOOLS_PINNED_SEPARATOR,
  GRANTED_TOOLS_PINNED_SIGN,
  GRANTED_TOOLS_AGENT_SIGN,
  GRANTED_TOOLS_SEPARATOR,
  GRANTED_TOOLS_SERVER_SIGN,
  GRANTED_TOOLS_SYSTEM_SIGN,
  NO_TOOLS_LABEL,
} from "../constants";
import { isAgentGrant, isCommandGrant, isSystemGrant } from "../../../interfaces";
import type {
  Agent,
  AgentToolGrant,
  CommandToolGrant,
  GrantTargets,
  McpToolGrant,
  ProjectCommand,
  ProjectMcpServer,
  ToolGrant,
} from "../../../interfaces";

/**
 * An agent's grants as one line, each name with what is fixed on it; none in words.
 *
 * This line is how a grant is compared with the saved one, so every grantable thing must reach it.
 */
export function grantedToolsLabel(
  grants: ToolGrant[],
  naming: Pick<GrantTargets, "commands" | "servers" | "agents">,
): string {
  if (grants.length === 0) {
    return NO_TOOLS_LABEL;
  }

  return grants.map((grant) => grantSaid(grant, naming)).join(GRANTED_TOOLS_SEPARATOR);
}

/** One grant as the line says it, whichever kind it is. */
function grantSaid(grant: ToolGrant, naming: Pick<GrantTargets, "commands" | "servers" | "agents">): string {
  if (isCommandGrant(grant)) {
    return commandSaid(grant, naming.commands);
  }

  if (isAgentGrant(grant)) {
    return agentSaid(grant, naming.agents);
  }

  if (isSystemGrant(grant)) {
    return `${GRANTED_TOOLS_SYSTEM_SIGN}${grant.command}`;
  }

  return serverSaid(grant, naming.servers);
}

/** A command by name, its fixed values in brackets. */
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

/** An agent given as a tool, by name; its id when the project lacks it. */
function agentSaid(grant: AgentToolGrant, agents: Agent[]): string {
  const agent = agents.find((item) => item.id === grant.agentId) ?? null;

  return `${GRANTED_TOOLS_AGENT_SIGN}${agent?.name ?? grant.agentId}`;
}

/** A server's function with its server's name, as two servers may share one; an undeclared server shows as its id. */
function serverSaid(grant: McpToolGrant, servers: ProjectMcpServer[]): string {
  const server = servers.find((item) => item.id === grant.serverId) ?? null;

  return `${server?.name ?? grant.serverId}${GRANTED_TOOLS_SERVER_SIGN}${grant.functionName}`;
}
