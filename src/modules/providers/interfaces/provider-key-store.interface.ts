/** What this module needs of the machine's secrets: writing one, taking one away, and asking which are written. */
export interface ProviderKeyStore {
  set(payload: { key: string; value: string }): Promise<{ key: string; hint: string }>;
  value(key: string): Promise<string | null>;
  remove(payload: { key: string }): Promise<void>;
  hints(): Promise<{ key: string; hint: string }[]>;
}
