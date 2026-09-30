import type { ProjectModel, ProjectPrompt, ProviderState } from "../../../interfaces";

/**
 * What an agent stands on when its turn goes: its model, the model's provider, and its prompt; a missing one is the
 * wall the turn meets.
 */
export interface AgentStands {
  model: ProjectModel | null;
  provider: ProviderState | null;
  prompt: ProjectPrompt | null;
}
