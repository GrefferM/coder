/** What recognition needs of the providers: a provider's key and its address, both kept by `providers`. */
export interface SpeechReach {
  keyOf(providerId: string): Promise<string | null>;
  addressOf(providerId: string): Promise<string | null>;
}
