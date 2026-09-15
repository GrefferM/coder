/**
 * Where a server's secrets live — the machine's own keychain, never the project file, which
 * goes into a repository. A remote server's token and a local one's environment values lie there alike, and the
 * file names only what they are called.
 *
 * The same shape the providers' keys are held through: one store for the machine, and each module naming its own
 * keys inside it.
 */
export interface McpSecretStore {
  value(key: string): Promise<string | null>;
  set(payload: { key: string; value: string }): Promise<{ key: string; hint: string }>;
  remove(payload: { key: string }): Promise<void>;
  hints(): Promise<{ key: string; hint: string }[]>;
}
