import type { ProjectModel, ProviderState } from "../../../interfaces";

/** The provider a held model names that nobody declared; nothing where the model itself is gone. */
export function lostProvider(modelId: string, models: ProjectModel[], providers: ProviderState[]): string | null {
  const model = models.find((standing) => standing.id === modelId) ?? null;

  if (model === null || providers.some((provider) => provider.id === model.provider)) {
    return null;
  }

  return model.provider;
}
