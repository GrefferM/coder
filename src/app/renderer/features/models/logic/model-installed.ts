import type { ProjectModel, ProviderAnswer, ProviderState } from "../../../interfaces";

/** Whether the machine holds the declared model; `null` for an unknown or remote provider, or a silent local one. */
export function modelInstalled(
  model: ProjectModel,
  providers: ProviderState[],
  answers: Record<string, ProviderAnswer>,
): boolean | null {
  const provider = providers.find((standing) => standing.id === model.provider) ?? null;

  if (provider === null || provider.kind !== "local") {
    return null;
  }

  const answer = answers[provider.id];

  if (answer === undefined || !answer.isAnswering) {
    return null;
  }

  return answer.models.some((installed) => installed.name === model.title);
}
