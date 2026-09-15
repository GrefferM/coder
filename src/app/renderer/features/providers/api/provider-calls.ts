import {
  ASK_PROVIDER_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
} from "../../../../../contracts";
import type { ProviderReply, ProviderState } from "../../../interfaces";

/** The providers this machine knows; an unreachable machine has none. */
export async function listProviders(): Promise<ProviderState[]> {
  try {
    return await window.electronApi.invoke(LIST_PROVIDERS_CHANNEL);
  } catch {
    return [];
  }
}

/** Asks one local provider whether it is running; a machine that did not answer is a silence, not a failure. */
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

/** Writes what a provider needs before it can be called: a local one its address, a remote one its key. */
export async function saveProviderValue(provider: ProviderState, value: string): Promise<void> {
  const channel = provider.kind === "local" ? SAVE_PROVIDER_ADDRESS_CHANNEL : SAVE_PROVIDER_KEY_CHANNEL;

  await window.electronApi.invoke(channel, {
    providerId: provider.id,
    value,
  });
}
