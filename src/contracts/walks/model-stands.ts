import type { ModelStands } from "./model-stands.interface";
import type { ProjectModel } from "../project";
import type { ProviderState } from "../providers";

/** The model by its own id, and the provider by the id the model names; whatever is not there is absent. */
export function modelStands(modelId: string, models: ProjectModel[], providers: ProviderState[]): ModelStands {
  const model = models.find((standing) => standing.id === modelId) ?? null;

  return {
    model,
    provider: model === null ? null : (providers.find((standing) => standing.id === model.provider) ?? null),
  };
}
