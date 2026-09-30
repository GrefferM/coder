import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX } from "../../../constants";
import { handleOf } from "../../../interfaces";
import type { Agent, McpLook, ProjectCommand, ProjectMcpServer } from "../../../interfaces";
import type { ToolChoice } from "../interfaces";

/**
 * Everything an agent may be given, in one list under heads. Commands come first, sorted by name and
 * independent of ticks; then each server in the order the project names them, with its functions in the order the
 * server itself gave them — that order is the server's own and we do not know better than it.
 *
 * A server that did not answer contributes nothing: it hands over no functions right now, and offering the list it
 * gave last time would be a tick on something nobody can call.
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

/** Every other agent of the project as a tool to choose, by name; an agent is never offered itself. */
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
