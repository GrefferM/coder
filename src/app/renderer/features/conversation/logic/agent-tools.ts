import { isAgentGrant, isCommandGrant } from "../../../interfaces";
import type { Agent, AgentTool, GrantTargets, McpLook, ProjectCommand, ToolGrant } from "../../../interfaces";
import type { AgentToolGrant, CommandToolGrant, McpToolGrant } from "../../../interfaces";

/**
 * Tools an agent may call. A grant is left out where its command is gone, where its server did not answer, where
 * its function left the server's list, or where the agent it named has been let go: the grant stands, but a turn
 * has nothing to hand the model.
 */
export function agentTools(grants: ToolGrant[], targets: GrantTargets): AgentTool[] {
  const tools: AgentTool[] = [];

  for (const grant of grants) {
    const tool = toolOf(grant, targets);

    // One name is one tool to a model. The person's own declaration keeps the name, and a server's function or
    // an agent of the same name is left out rather than quietly taking its place.
    if (tool !== null && !tools.some((standing) => standing.name === tool.name)) {
      tools.push(tool);
    }
  }

  return tools;
}

/** The tool one grant hands the model, whichever kind it is, or nothing where it points at nothing. */
function toolOf(grant: ToolGrant, targets: GrantTargets): AgentTool | null {
  if (isCommandGrant(grant)) {
    return commandTool(grant, targets.commands);
  }

  if (isAgentGrant(grant)) {
    return agentTool(grant, targets.agents);
  }

  return serverTool(grant, targets.looks);
}

/** A declared command, with the open parameters handed over and the fixed ones kept back. */
function commandTool(grant: CommandToolGrant, commands: ProjectCommand[]): AgentTool | null {
  const command = commands.find((held) => held.id === grant.commandId) ?? null;

  if (command === null) {
    return null;
  }

  const fixedIds = new Set(grant.pinned.map((pinned) => pinned.parameterId));
  const pinned: Record<string, string> = {};

  for (const argument of grant.pinned) {
    const parameter = command.parameters.find((held) => held.id === argument.parameterId) ?? null;

    if (parameter !== null) {
      pinned[parameter.name] = argument.value;
    }
  }

  return {
    source: "command",
    name: command.name,
    description: command.description,
    run: command.run,
    parameters: command.parameters.filter((parameter) => !fixedIds.has(parameter.id)),
    pinned,
  };
}

/** Another agent as one tool: its name, and its short description as what the model reads of it. */
function agentTool(grant: AgentToolGrant, agents: Agent[]): AgentTool | null {
  const agent = agents.find((held) => held.id === grant.agentId) ?? null;

  if (agent === null) {
    return null;
  }

  return {
    source: "agent",
    name: agent.name,
    description: agent.purpose ?? "",
    agentId: agent.id,
  };
}

/**
 * One function of a server, as the server described it this time: looked up by the server's id and then by the
 * name the server gave it, the only handle there is, with the schema passed on as it came.
 */
function serverTool(grant: McpToolGrant, looks: Record<string, McpLook>): AgentTool | null {
  const look = looks[grant.serverId] ?? null;
  const held = look?.functions.find((one) => one.name === grant.functionName) ?? null;

  if (held === null) {
    return null;
  }

  return {
    source: "mcp",
    name: held.name,
    description: held.description,
    serverId: grant.serverId,
    parameters: held.parameters,
  };
}
