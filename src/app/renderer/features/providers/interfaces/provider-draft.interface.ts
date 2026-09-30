/**
 * What was typed into a provider's card. An untouched field is `null` and not written; an empty string means «take it
 * off», never «unchanged».
 */
export interface ProviderDraft {
  key: string | null;
  address: string | null;
}
