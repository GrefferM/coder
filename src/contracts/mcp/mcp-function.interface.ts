/**
 * One function an MCP server hands over, as the server describes it. The name is the only handle there is: a
 * grant holds that name, and a function that leaves the list leaves the grant standing and lost.
 *
 * Never written to a file — asked of the server each time.
 */
export interface McpFunction {
  name: string;
  description: string;
  /** The JSON Schema of what it takes, handed to the model as it came from the server. */
  parameters: Record<string, unknown>;
}
