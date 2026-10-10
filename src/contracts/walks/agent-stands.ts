import type { AgentStands } from "./agent-stands.interface";
import type { Agent, ProjectConfig } from "../project";
import type { ProviderState } from "../providers";

/**
 * Second of a turn's four steps: looks up, by the agent's own ids, what the agent stands on; whatever the project no
 * longer has is absent.
 */
export function agentStands(agent: Agent, config: ProjectConfig, providers: ProviderState[]): AgentStands {
  const model = config.models.find((standing) => standing.id === agent.modelId) ?? null;

  return {
    model,
    provider: providers.find((standing) => standing.id === model?.provider) ?? null,
    prompt: config.prompts.find((standing) => standing.id === agent.promptId) ?? null,
  };
}
