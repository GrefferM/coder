/** The machine's secrets as this module needs them: write, remove, list which are written. */
export interface ProviderKeyStore {
  set(payload: { key: string; value: string }): Promise<{ key: string; hint: string }>;
  value(key: string): Promise<string | null>;
  remove(payload: { key: string }): Promise<void>;
  hints(): Promise<{ key: string; hint: string }[]>;
}
