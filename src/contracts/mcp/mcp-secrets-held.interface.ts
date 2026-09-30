/** Hints of what this machine holds for one server, never the secrets. */
export interface McpSecretsHeld {
  /** The token's hint (head, bullets, tail), or null when none is set. */
  token: string | null;
  /** A hint per variable with a value, by variable name. */
  env: Record<string, string>;
}
