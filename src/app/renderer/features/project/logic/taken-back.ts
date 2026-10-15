import { sourceOf } from "../../../interfaces";
import { isCommandGrant } from "../../../interfaces";
import type { ProjectConfig } from "../../../interfaces";
import type { TakenThings } from "../interfaces";

/**
 * Puts a deletion back into the current project; a link with a missing end or a grant whose command or server is
 * missing stays gone.
 */
export function withTakenBack(config: ProjectConfig, taken: TakenThings): ProjectConfig {
  const models = [
    ...config.models,
    ...taken.models.filter((model) => !config.models.some((one) => one.id === model.id)),
  ];
  const prompts = [
    ...config.prompts,
    ...taken.prompts.filter((prompt) => !config.prompts.some((one) => one.id === prompt.id)),
  ];
  const commands = [
    ...config.commands,
    ...taken.commands.filter((command) => !config.commands.some((one) => one.id === command.id)),
  ];
  const servers = [
    ...config.servers,
    ...taken.servers.filter((server) => !config.servers.some((one) => one.id === server.id)),
  ];
  const standingAgents = [
    ...config.agents,
    ...taken.agents.filter((agent) => !config.agents.some((one) => one.id === agent.id)),
  ];
  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  const commandIds = new Set(commands.map((command) => command.id));
  const serverIds = new Set(servers.map((server) => server.id));
  const agents = standingAgents.map((agent) => {
    const carried = taken.promptTakenFrom.find((one) => one.agentId === agent.id);
    const givenBack = taken.grantsTakenFrom
      .filter(
        (one) =>
          one.agentId === agent.id &&
          // A grant needs its target: a command's command, a server's server.
          (isCommandGrant(one.grant) ? commandIds : serverIds).has(sourceOf(one.grant).id),
      )
      .map((one) => one.grant)
      .filter((grant) => !agent.tools.some((standing) => standing.id === grant.id));

    return {
      ...agent,
      promptId:
        carried !== undefined && agent.promptId === null && promptIds.has(carried.promptId)
          ? carried.promptId
          : agent.promptId,
      tools: [...agent.tools, ...givenBack],
    };
  });
  const agentIds = new Set(agents.map((agent) => agent.id));

  return {
    ...config,
    models,
    prompts,
    commands,
    servers,
    agents,
    // A line needs both ends; one that is gone keeps the line gone.
    links: [
      ...config.links,
      ...taken.links.filter(
        (link) => !config.links.some((one) => one.id === link.id) && agentIds.has(link.from) && agentIds.has(link.to),
      ),
    ],
  };
}
