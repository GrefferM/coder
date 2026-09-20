import type { ProjectModel, ProviderState } from "../../../interfaces";

/**
 * Whether the provider under this model carries no function calls at all — RunPod's queue does not, and a turn
 * on such a model is asked with none. Read off the project and the machine's own list, so the settings and the
 * canvas say the same thing about the same agent.
 *
 * A model nobody declared, or one whose provider nobody has, says nothing here: those are their own troubles,
 * and the fields they break are named by their own words.
 */
export function takesNoTools(modelId: string, models: ProjectModel[], providers: ProviderState[]): boolean {
  const model = models.find((standing) => standing.id === modelId) ?? null;
  const provider = model === null ? null : (providers.find((standing) => standing.id === model.provider) ?? null);

  return provider !== null && !provider.takesTools;
}
