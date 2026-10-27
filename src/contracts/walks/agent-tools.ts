import { isAgentGrant } from "../project/agent-grant.guard";
import { isCommandGrant } from "../project/command-grant.guard";
import { isSystemGrant } from "../project/system-grant.guard";
import type { AgentTool } from "../llm/agent-tool.type";
import type { McpLook } from "../mcp/mcp-look.interface";
import type {
  Agent,
  AgentToolGrant,
  CommandToolGrant,
  GrantTargets,
  McpToolGrant,
  ProjectCommand,
  ToolGrant,
} from "../project";

/**
 * Tools an agent may call. A grant is left out when its command is gone, its server did not answer, its function left
 * the server's list, or the agent it names is gone.
 */
export function agentTools(grants: ToolGrant[], targets: GrantTargets): AgentTool[] {
  const tools: AgentTool[] = [];

  for (const grant of grants) {
    const tool = toolOf(grant, targets);

    // One name is one tool: the person's own declaration keeps the name, and a same-named server function or agent is
    // left out.
    if (tool !== null && !tools.some((standing) => standing.name === tool.name)) {
      tools.push(tool);
    }
  }

  return tools;
}

/** The tool one grant hands the model, or null where it points at nothing. */
function toolOf(grant: ToolGrant, targets: GrantTargets): AgentTool | null {
  if (isCommandGrant(grant)) {
    return commandTool(grant, targets.commands);
  }

  if (isAgentGrant(grant)) {
    return agentTool(grant, targets.agents);
  }

  // A system command needs the lines going out of the agent, so it is built apart (see system-tools).
  if (isSystemGrant(grant)) {
    return null;
  }

  return serverTool(grant, targets.looks);
}

/** A declared command: open parameters handed over, fixed ones kept back. */
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

/** Another agent as a tool: its name, and its short description as what the model reads. */
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
 * A server function as the server described it this time, found by server id then by the name it gave; the schema
 * passes through as received.
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
