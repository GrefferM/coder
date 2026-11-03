import { modelStands } from "../../../logic";
import type { ProjectModel, ProviderState } from "../../../interfaces";

/** The provider a held model names that the app does not know; nothing where the model itself is gone. */
export function lostProvider(modelId: string, models: ProjectModel[], providers: ProviderState[]): string | null {
  const { model, provider } = modelStands(modelId, models, providers);

  if (model === null || provider !== null) {
    return null;
  }

  return model.provider;
}
