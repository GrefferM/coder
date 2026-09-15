import { isCommandGrant } from "../../../interfaces";
import type { AgentTool, McpLook, ProjectCommand, ToolGrant } from "../../../interfaces";
import type { CommandToolGrant, McpToolGrant } from "../../../interfaces";

/**
 * Tools an agent may call. A grant is left out where its command is gone, where its server did not answer, or
 * where its function left the server's list: the grant stands, but a turn has nothing to hand the model.
 */
export function agentTools(
  grants: ToolGrant[],
  commands: ProjectCommand[],
  looks: Record<string, McpLook>,
): AgentTool[] {
  const tools: AgentTool[] = [];

  for (const grant of grants) {
    const tool = isCommandGrant(grant) ? commandTool(grant, commands) : serverTool(grant, looks);

    // One name is one tool to a model. The person's own declaration keeps the name, and a server's function of
    // the same name is left out rather than quietly taking its place.
    if (tool !== null && !tools.some((standing) => standing.name === tool.name)) {
      tools.push(tool);
    }
  }

  return tools;
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
