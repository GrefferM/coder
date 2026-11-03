import { modelStands } from "../../../logic";
import type { ProjectModel, ProviderState } from "../../../interfaces";

/**
 * Whether the model's provider carries no function calls at all (RunPod's queue). False for a missing model or an
 * unknown provider: those are separate troubles.
 */
export function takesNoTools(modelId: string, models: ProjectModel[], providers: ProviderState[]): boolean {
  const { provider } = modelStands(modelId, models, providers);

  return provider !== null && !provider.takesTools;
}
