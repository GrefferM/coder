/**
 * One function of an MCP server granted to an agent, by the server's name for it; the function may leave the server's
 * list while the grant stays.
 */
export interface McpToolGrant {
  id: string;
  source: "mcp";
  serverId: string;
  functionName: string;
}
