import type { AgentStands } from "./agent-stands.interface";
import type { Agent, ProjectConfig } from "../project";
import type { ProviderState } from "../providers";

/** What the agent stands on, looked up by its own ids; whatever the project no longer has is absent. */
export function agentStands(agent: Agent, config: ProjectConfig, providers: ProviderState[]): AgentStands {
  const model = config.models.find((standing) => standing.id === agent.modelId) ?? null;

  return {
    model,
    provider: providers.find((standing) => standing.id === model?.provider) ?? null,
    prompt: config.prompts.find((standing) => standing.id === agent.promptId) ?? null,
  };
}
