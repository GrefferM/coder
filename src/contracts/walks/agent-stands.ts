import { modelStands } from "./model-stands";
import type { AgentStands } from "./agent-stands.interface";
import type { Agent, ProjectConfig } from "../project";
import type { ProviderState } from "../providers";

/** What the agent stands on, looked up by its own ids; whatever the project no longer has is absent. */
export function agentStands(agent: Agent, config: ProjectConfig, providers: ProviderState[]): AgentStands {
  return {
    ...modelStands(agent.modelId, config.models, providers),
    prompt: config.prompts.find((standing) => standing.id === agent.promptId) ?? null,
  };
}
