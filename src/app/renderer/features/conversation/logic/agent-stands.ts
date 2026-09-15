import type { AgentStands } from "../interfaces";
import type { Agent, ProjectConfig, ProviderState } from "../../../interfaces";

/**
 * The second of a turn's four steps — the sphere looks up what the agent stands on. Everything is found by
 * the id the agent itself holds, and a thing the project no longer has is simply not there.
 */
export function agentStands(agent: Agent, config: ProjectConfig, providers: ProviderState[]): AgentStands {
  const model = config.models.find((standing) => standing.id === agent.modelId) ?? null;

  return {
    model,
    provider: providers.find((standing) => standing.id === model?.provider) ?? null,
    prompt: config.prompts.find((standing) => standing.id === agent.promptId) ?? null,
  };
}
