/**
 * One function an MCP server offers, as the server describes it. The name is the only handle: a grant holds it, and a
 * function that leaves the list leaves the grant lost. Asked of the server each time, never written to a file.
 */
export interface McpFunction {
  name: string;
  description: string;
  /** The JSON Schema of its arguments, passed to the model as the server gave it. */
  parameters: Record<string, unknown>;
}
