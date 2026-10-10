import type { ProjectModel, ProjectPrompt } from "../project";
import type { ProviderState } from "../providers";

/**
 * What an agent stands on when its turn goes: its model, the model's provider, and its prompt; a missing one is the
 * wall the turn meets.
 */
export interface AgentStands {
  model: ProjectModel | null;
  provider: ProviderState | null;
  prompt: ProjectPrompt | null;
}
