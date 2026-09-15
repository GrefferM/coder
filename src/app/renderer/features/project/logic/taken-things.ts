import type { ProjectConfig } from "../../../interfaces";
import type { TakenThings } from "../interfaces";

export function nothingTaken(): TakenThings {
  return {
    models: [],
    prompts: [],
    commands: [],
    servers: [],
    agents: [],
    links: [],
    promptTakenFrom: [],
    grantsTakenFrom: [],
  };
}

/** What `previous` has that `without` does not. */
export function takenBetween(previous: ProjectConfig, without: ProjectConfig): TakenThings {
  const standing = {
    models: new Set(without.models.map((model) => model.id)),
    prompts: new Set(without.prompts.map((prompt) => prompt.id)),
    commands: new Set(without.commands.map((command) => command.id)),
    servers: new Set(without.servers.map((server) => server.id)),
    agents: new Set(without.agents.map((agent) => agent.id)),
    links: new Set(without.links.map((link) => link.id)),
  };
  const now = new Map(without.agents.map((agent) => [agent.id, agent]));

  return {
    models: previous.models.filter((model) => !standing.models.has(model.id)),
    prompts: previous.prompts.filter((prompt) => !standing.prompts.has(prompt.id)),
    commands: previous.commands.filter((command) => !standing.commands.has(command.id)),
    servers: previous.servers.filter((server) => !standing.servers.has(server.id)),
    agents: previous.agents.filter((agent) => !standing.agents.has(agent.id)),
    links: previous.links.filter((link) => !standing.links.has(link.id)),
    promptTakenFrom: previous.agents
      .filter((agent) => agent.promptId !== null && now.get(agent.id)?.promptId === null)
      .map((agent) => ({
        agentId: agent.id,
        promptId: <string>agent.promptId,
      })),
    grantsTakenFrom: previous.agents.flatMap((agent) => {
      const kept = new Set((now.get(agent.id)?.tools ?? agent.tools).map((grant) => grant.id));

      // A command and a server are both deleted with their grants, so a grant of either kind can come back.
      return now.has(agent.id)
        ? agent.tools
            .filter((grant) => !kept.has(grant.id))
            .map((grant) => ({
              agentId: agent.id,
              grant,
            }))
        : [];
    }),
  };
}
