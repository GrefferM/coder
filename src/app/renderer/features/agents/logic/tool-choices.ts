import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX } from "../../../constants";
import { handleOf } from "../../../interfaces";
import type { Agent, McpLook, ProjectCommand, ProjectMcpServer } from "../../../interfaces";
import type { ToolChoice } from "../interfaces";

/**
 * Commands sorted by name, then each server in project order with its functions in the server's order; agents come
 * from `agentChoices`. A server that did not answer contributes nothing.
 */
export function toolChoices(
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
  looks: Record<string, McpLook>,
): ToolChoice[] {
  const options: ToolChoice[] = [...commands]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((command) => ({
      key: handleOf({
        kind: "command",
        id: command.id,
        functionName: null,
      }),
      group: COMMANDS_GROUP_KEY,
      name: command.name,
      description: command.description,
      source: "command" as const,
      commandId: command.id,
      serverId: null,
      agentId: null,
    }));

  for (const server of servers) {
    for (const held of looks[server.id]?.functions ?? []) {
      options.push({
        key: handleOf({
          kind: "mcp",
          id: server.id,
          functionName: held.name,
        }),
        group: `${SERVER_GROUP_PREFIX}${server.id}`,
        name: held.name,
        description: held.description,
        source: "mcp",
        commandId: null,
        serverId: server.id,
        agentId: null,
      });
    }
  }

  return options;
}

/** Every other agent as a tool choice, by name; never the agent itself. */
export function agentChoices(agents: Agent[], selfId: string | null): ToolChoice[] {
  return [...agents]
    .filter((agent) => agent.id !== selfId)
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((agent) => ({
      key: handleOf({
        kind: "agent",
        id: agent.id,
        functionName: null,
      }),
      group: AGENTS_GROUP_KEY,
      name: agent.name,
      description: agent.purpose ?? "",
      source: "agent" as const,
      commandId: null,
      serverId: null,
      agentId: agent.id,
    }));
}
