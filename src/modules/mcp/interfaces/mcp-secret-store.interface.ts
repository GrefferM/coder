/**
 * Where a server's secrets live: this machine's secrets, never the project file. A remote server's token and a local
 * one's environment values are held alike.
 */
export interface McpSecretStore {
  value(key: string): Promise<string | null>;
  set(payload: { key: string; value: string }): Promise<{ key: string; hint: string }>;
  remove(payload: { key: string }): Promise<void>;
  hints(): Promise<{ key: string; hint: string }[]>;
}
