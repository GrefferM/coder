import type { ProjectModel, ProviderState } from "../../../interfaces";

/**
 * The provider a held model names and nobody declared — the model itself is whole, but the thing it
 * stands on was never announced. Nothing at all where the model is gone too: that is a different trouble.
 */
export function lostProvider(modelId: string, models: ProjectModel[], providers: ProviderState[]): string | null {
  const model = models.find((standing) => standing.id === modelId) ?? null;

  if (model === null || providers.some((provider) => provider.id === model.provider)) {
    return null;
  }

  return model.provider;
}
