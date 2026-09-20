/**
 * What the person has typed into a provider's card. A field nobody touched stands as `null` and is not written:
 * the key field holds the key's hint rather than the key, so an empty string means «take it off» and never
 * «unchanged».
 */
export interface ProviderDraft {
  key: string | null;
  address: string | null;
}
