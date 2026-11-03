import {
  ASK_PROVIDER_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
  SWITCH_PROVIDER_CHANNEL,
} from "../../../../../contracts";
import type { ProviderReply, ProviderState } from "../../../interfaces";
import type { ProviderWrite } from "../interfaces";

/** The providers this machine knows; an unreachable machine has none. */
export async function listProviders(): Promise<ProviderState[]> {
  try {
    return await window.electronApi.invoke(LIST_PROVIDERS_CHANNEL);
  } catch {
    return [];
  }
}

/** Asks one local provider whether it is running; no answer is a silence, not a failure. */
export async function askProvider(providerId: string): Promise<ProviderReply> {
  try {
    return await window.electronApi.invoke(ASK_PROVIDER_CHANNEL, {
      providerId,
    });
  } catch {
    return {
      isAnswering: false,
      models: [],
    };
  }
}

/** Writes one requested value; the channel follows which value it is, not the provider's kind. */
export async function saveProviderValue(write: ProviderWrite): Promise<void> {
  const channel = write.need === "address" ? SAVE_PROVIDER_ADDRESS_CHANNEL : SAVE_PROVIDER_KEY_CHANNEL;

  await window.electronApi.invoke(channel, {
    providerId: write.provider.id,
    value: write.value,
  });
}

/** Turns one provider off on this machine, or back on. */
export async function switchProvider(providerId: string, isOff: boolean): Promise<void> {
  await window.electronApi.invoke(SWITCH_PROVIDER_CHANNEL, {
    providerId,
    isOff,
  });
}
