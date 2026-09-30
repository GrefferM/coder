/**
 * One function of an MCP server an agent may call. The server owns its name, description and schema, passed to the
 * model as given. Nothing is pinned.
 */
export interface AgentServerTool {
  source: "mcp";
  name: string;
  description: string;
  /** The server that holds it; its reach travels beside the tools under this id. */
  serverId: string;
  /** The JSON Schema of its arguments, as the server published it. */
  parameters: Record<string, unknown>;
}
