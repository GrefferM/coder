/** The run line this machine agreed to start for one server; machine-local, not in the project file. */
export interface McpConsent {
  /** The server's own id, never its name. */
  serverId: string;
  /** The line word for word, as it stood when agreed to. */
  run: string;
  givenAt: number;
}
