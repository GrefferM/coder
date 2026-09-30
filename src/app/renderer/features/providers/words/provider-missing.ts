import { PROVIDER_NO_ADDRESS_LABEL, PROVIDER_NO_KEY_LABEL } from "../constants";
import type { ProviderState } from "../../../interfaces";

/**
 * What a provider still lacks before it can be called, in the catalogue's words; empty when nothing. A key is missing
 * with no hint of one; an address is missing where neither the person nor a customary one is behind it.
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
