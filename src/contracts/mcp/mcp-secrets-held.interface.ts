/** What this machine holds for one server, as hints — never the secrets themselves. */
export interface McpSecretsHeld {
  /** The token's hint — head, bullets and tail — or nothing where none was typed in. */
  token: string | null;
  /** A hint per variable this machine holds a value for, by the variable's name. */
  env: Record<string, string>;
}
