export interface AgentKeyStore {
  keyOf(providerId: string): Promise<string | null>;
  addressOf(providerId: string): Promise<string | null>;
  isAnswering(providerId: string): Promise<boolean>;
}
