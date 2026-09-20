import { PROVIDER_NO_ADDRESS_LABEL, PROVIDER_NO_KEY_LABEL } from "../constants";
import type { ProviderState } from "../../../interfaces";

/**
 * What a provider still lacks before it can be called, in the words the catalogue says it in — and nothing
 * where it lacks nothing. Only what the provider itself asked for is looked at: a key is missing where there is
 * no hint of one, and an address where neither the person nor the provider's own customary one stands behind
 * the field, which is why a local provider is never short of an address.
 */
export function providerMissing(provider: ProviderState): string[] {
  const words = [];

  if (provider.needs.includes("key") && provider.keyHint === null) {
    words.push(PROVIDER_NO_KEY_LABEL);
  }

  if (provider.needs.includes("address") && provider.address === null && provider.customaryAddress === null) {
    words.push(PROVIDER_NO_ADDRESS_LABEL);
  }

  return words;
}
