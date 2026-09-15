import type { ProjectModel, ProjectPrompt, ProviderState } from "../../../interfaces";

/**
 * What an agent stands on when its turn goes — the model it was given, the provider that model answers at,
 * and its prompt. Any of them can be missing, and which one is missing is the wall the turn meets.
 */
export interface AgentStands {
  model: ProjectModel | null;
  provider: ProviderState | null;
  prompt: ProjectPrompt | null;
}
