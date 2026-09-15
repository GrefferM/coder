/** What this module needs of providers: a key for a remote one, an address for a local one. */
export interface AgentKeyStore {
  keyOf(providerId: string): Promise<string | null>;
  addressOf(providerId: string): Promise<string | null>;
  isAnswering(providerId: string): Promise<boolean>;
}
