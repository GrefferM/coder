import { MAC_HEARING_ID, SPEECH_LISTEN_PROVIDER_IDS } from "../../../../../contracts";
import { MAC_HEARING_NAME } from "../constants";
import type { SpeechSettings } from "../../../../../contracts";
import type { ProjectConfig, ProviderState } from "../../../interfaces";
import type { HearingChoice } from "../interfaces";

/**
 * Who hears a recording: macOS in its language where this machine chose it, otherwise the project's model — found by
 * its id, of the kind `listen`, and on a provider that hears; `null` where any of it does not stand.
 */
export function hearingChoice(
  config: ProjectConfig,
  providers: ProviderState[],
  settings: SpeechSettings,
): HearingChoice | null {
  if (settings.isMacHearing) {
    return settings.macLocale === null
      ? null
      : {
          providerId: MAC_HEARING_ID,
          providerName: MAC_HEARING_NAME,
          model: settings.macLocale,
        };
  }

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
