/**
 * What one call of a server's function leaves behind. The same two facts a command's run leaves —
 * what came back, and whether it went wrong — because the model is told the one and the record shows the other.
 * There is no line here and no exit code: a server was asked, not a program run.
 */
export interface McpResult {
  output: string;
  isFailed: boolean;
}
