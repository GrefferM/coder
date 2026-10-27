import type { Agent, ProjectConfig } from "../../../interfaces";

/** The agents this one's lines lead to, in project-file order; a line to an agent the project dropped is none. */
export function followersOf(config: ProjectConfig, agentId: string | null): Agent[] {
  return config.links
    .filter((link) => link.from === agentId)
    .map((link) => config.agents.find((agent) => agent.id === link.to))
    .filter((agent): agent is Agent => agent !== undefined);
}
