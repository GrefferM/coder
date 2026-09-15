/**
 * One function of an MCP server an agent may call. The server owns the shape of it: the name it gave,
 * the words it wrote, and the schema it published — handed to the model as it came, and checked by nobody here.
 * Our own check is about types this app declared, and this app declared none of these.
 *
 * Nothing is pinned on a server's function: there is no place to pin one.
 */
export interface AgentServerTool {
  source: "mcp";
  name: string;
  description: string;
  /** Which server holds it; the reach of that server travels beside the tools, by this id. */
  serverId: string;
  /** The JSON Schema of what the function takes, exactly as the server published it. */
  parameters: Record<string, unknown>;
}
