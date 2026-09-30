/**
 * What one call of a server's function leaves: what came back and whether it went wrong. No line or exit code, since a
 * server was asked, not a program run.
 */
export interface McpResult {
  output: string;
  isFailed: boolean;
}
