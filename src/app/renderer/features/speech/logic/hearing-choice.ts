import { SPEECH_LISTEN_PROVIDER_IDS } from "../../../../../contracts";
import type { ProjectConfig, ProviderState } from "../../../interfaces";
import type { HearingChoice } from "../interfaces";

/**
 * The model the project hears with, as a recording needs it: found by its id, of the kind `listen`, and on a provider
 * that hears; `null` where any of it does not stand.
 */
export function hearingChoice(config: ProjectConfig, providers: ProviderState[]): HearingChoice | null {
  const model = config.models.find((one) => one.id === config.speech.listenModelId) ?? null;

  if (model === null || model.kind !== "listen" || !SPEECH_LISTEN_PROVIDER_IDS.includes(model.provider)) {
    return null;
  }

  const provider = providers.find((one) => one.id === model.provider) ?? null;

  return {
    providerId: model.provider,
    providerName: provider?.name ?? model.provider,
    model: model.title,
  };
}
