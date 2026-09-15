/**
 * One function of an MCP server granted to an agent, named by the name the server gave it and by no id of ours:
 * the server owns the list, and a function can leave it after an update while the grant stays.
 */
export interface McpToolGrant {
  id: string;
  source: "mcp";
  serverId: string;
  functionName: string;
}
