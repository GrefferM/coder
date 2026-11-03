import type { ProjectModel, ProviderState } from "../../../interfaces";

/** The name of the provider a held model stands on, where that provider is turned off; nothing otherwise. */
export function offProviderName(modelId: string, models: ProjectModel[], providers: ProviderState[]): string | null {
  const model = models.find((standing) => standing.id === modelId) ?? null;
  const provider = model === null ? null : (providers.find((standing) => standing.id === model.provider) ?? null);

  return provider !== null && provider.isOff ? provider.name : null;
}

/** The ids of the models standing on a provider turned off on this machine. */
export function offModelIds(models: ProjectModel[], providers: ProviderState[]): string[] {
  const off = new Set(providers.filter((provider) => provider.isOff).map((provider) => provider.id));

  return models.filter((model) => off.has(model.provider)).map((model) => model.id);
}
