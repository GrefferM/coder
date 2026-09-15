import type { Agent, ProjectConfig } from "../../../interfaces";

/** The agents whose lines come into this one, in the order the lines stand in the project file. */
export function suppliersOf(config: ProjectConfig, agentId: string | null): Agent[] {
  return config.links
    .filter((link) => link.to === agentId)
    .map((link) => config.agents.find((agent) => agent.id === link.from))
    .filter((agent): agent is Agent => agent !== undefined);
}
